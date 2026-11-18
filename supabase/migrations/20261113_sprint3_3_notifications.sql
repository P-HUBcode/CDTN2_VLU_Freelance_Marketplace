-- ==============================================================================
-- STUDENTHUB MIGRATION - SPRINT 3.3: HỆ THỐNG THÔNG BÁO (NOTIFICATION SYSTEM - REVISED)
-- Date: 2026-11-13
-- Description:
-- 1. Bảng public.notifications + Index tối ưu
-- 2. RLS Policies: User chỉ xem và sửa is_read thông báo của mình, chặn client tự INSERT
-- 3. Phân quyền mức cột: Chỉ cho phép authenticated UPDATE (is_read), cấm sửa title/message
-- 4. Trigger tự động 1: Thông báo cho Employer khi có Student nộp đơn mới
-- 5. Trigger tự động 2: Thông báo cho Student khi Employer cập nhật trạng thái đơn
-- ==============================================================================

-- 1. TẠO BẢNG NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('application_status_changed', 'new_application', 'system_message')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE,
    related_job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index tối ưu hóa truy vấn thông báo chưa đọc và sắp xếp thời gian
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON public.notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON public.notifications(user_id, created_at DESC);

-- Bật Realtime cho bảng notifications trên Supabase (Không nuốt lỗi)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;

-- 2. RLS POLICIES & PHÂN QUYỀN MỨC CỘT CHO NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 2.1 SELECT Policy: User chỉ xem thông báo của chính mình
DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
CREATE POLICY "notifications_select_policy"
ON public.notifications FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id 
    OR public.is_admin()
);

-- 2.2 UPDATE Policy: User chỉ được cập nhật cờ is_read của thông báo của mình
DROP POLICY IF EXISTS "notifications_update_policy" ON public.notifications;
CREATE POLICY "notifications_update_policy"
ON public.notifications FOR UPDATE
TO authenticated
USING (
    auth.uid() = user_id 
    OR public.is_admin()
)
WITH CHECK (
    auth.uid() = user_id 
    OR public.is_admin()
);

-- 2.3 Phân quyền mức cột: Chỉ cấp quyền UPDATE cột is_read cho authenticated role
REVOKE UPDATE ON public.notifications FROM authenticated;
GRANT UPDATE (is_read) ON public.notifications TO authenticated;

-- 2.4 Chặn client INSERT trực tiếp: Không tạo policy INSERT cho client. 
-- Mọi thông báo đều được sinh tự động thông qua Database Triggers với SECURITY DEFINER.


-- ==============================================================================
-- 3. TRIGGERS TỰ ĐỘNG SINH THÔNG BÁO (SECURITY DEFINER)
-- ==============================================================================

-- Trigger 3.1: Thông báo cho Employer khi có Application mới
CREATE OR REPLACE FUNCTION public.notify_employer_new_application()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    job_rec RECORD;
    student_name TEXT;
BEGIN
    -- Lấy thông tin job và employer_id
    SELECT title, employer_id INTO job_rec 
    FROM public.jobs 
    WHERE id = NEW.job_id;

    -- Lấy tên sinh viên ứng tuyển
    SELECT full_name INTO student_name 
    FROM public.profiles 
    WHERE id = NEW.student_id;

    student_name := COALESCE(student_name, 'Một sinh viên');

    -- Chỉ gửi khi tìm thấy employer
    IF job_rec.employer_id IS NOT NULL THEN
        INSERT INTO public.notifications (
            user_id,
            type,
            title,
            message,
            related_application_id,
            related_job_id,
            is_read
        ) VALUES (
            job_rec.employer_id,
            'new_application',
            'Có hồ sơ ứng tuyển mới',
            student_name || ' vừa nộp hồ sơ ứng tuyển vào vị trí "' || job_rec.title || '".',
            NEW.id,
            NEW.job_id,
            false
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_application ON public.job_applications;
CREATE TRIGGER trg_notify_new_application
AFTER INSERT ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.notify_employer_new_application();


-- Trigger 3.2: Thông báo cho Student khi Employer cập nhật trạng thái đơn
CREATE OR REPLACE FUNCTION public.notify_student_status_changed()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    job_title TEXT;
    notify_title TEXT := 'Cập nhật tiến trình ứng tuyển';
    notify_msg TEXT;
BEGIN
    -- Nếu trạng thái không thay đổi thì bỏ qua
    IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
        RETURN NEW;
    END IF;

    SELECT title INTO job_title FROM public.jobs WHERE id = NEW.job_id;
    job_title := COALESCE(job_title, 'công việc');

    CASE NEW.status
        WHEN 'reviewing' THEN
            notify_msg := 'Hồ sơ ứng tuyển của bạn cho vị trí "' || job_title || '" đã được chuyển sang trạng thái "Đang xem xét".';
        WHEN 'interview' THEN
            notify_title := 'Lời mời phỏng vấn việc làm!';
            notify_msg := 'Chúc mừng! Bạn đã được chọn vào vòng "Hẹn phỏng vấn" cho vị trí "' || job_title || '". Nhà tuyển dụng sẽ sớm liên hệ.';
        WHEN 'accepted' THEN
            notify_title := 'Chúc mừng trúng tuyển!';
            notify_msg := 'Tuyệt vời! Bạn đã được nhận vào làm việc cho vị trí "' || job_title || '".';
        WHEN 'rejected' THEN
            notify_title := 'Thông báo kết quả ứng tuyển';
            notify_msg := 'Hồ sơ ứng tuyển của bạn cho vị trí "' || job_title || '" chưa phù hợp trong đợt tuyển này.';
        ELSE
            notify_msg := 'Trạng thái hồ sơ của bạn cho vị trí "' || job_title || '" đã cập nhật sang "' || NEW.status || '".';
    END CASE;

    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        related_application_id,
        related_job_id,
        is_read
    ) VALUES (
        NEW.student_id,
        'application_status_changed',
        notify_title,
        notify_msg,
        NEW.id,
        NEW.job_id,
        false
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_application_status_changed ON public.job_applications;
CREATE TRIGGER trg_notify_application_status_changed
AFTER UPDATE OF status ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.notify_student_status_changed();
