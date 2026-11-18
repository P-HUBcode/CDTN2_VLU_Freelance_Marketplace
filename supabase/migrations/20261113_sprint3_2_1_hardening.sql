-- ==============================================================================
-- STUDENTHUB MIGRATION - SPRINT 3.2.1: HARDENING BẢO MẬT & KIỂM SOÁT DỮ LIỆU (REVISED)
-- Date: 2026-11-13
-- Description:
-- A. Tách ghi chú nội bộ sang bảng riêng public.application_notes + RLS bảo mật tuyệt đối
-- B. Chuẩn hóa dữ liệu trạng thái legacy & siết CHECK constraint TRƯỚC KHI tạo Trigger
-- C. Trigger khóa cột theo mô hình Whitelist (to_jsonb), hỗ trợ direct DB / migration an toàn
-- D. Trigger máy trạng thái (State Machine) & bảng application_status_history
-- E. Ràng buộc Unique (job_id, student_id) chống nộp trùng lặp, không nuốt lỗi
-- ==============================================================================

-- ==============================================================================
-- PHẦN A: TÁCH GHI CHÚ NỘI BỘ (application_notes)
-- ==============================================================================

-- 1. Tạo bảng application_notes
CREATE TABLE IF NOT EXISTS public.application_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index cho application_notes
CREATE INDEX IF NOT EXISTS idx_application_notes_app_id ON public.application_notes(application_id);
CREATE INDEX IF NOT EXISTS idx_application_notes_employer_id ON public.application_notes(employer_id);

-- Trigger cập nhật updated_at
DROP TRIGGER IF EXISTS set_application_notes_updated_at ON public.application_notes;
CREATE TRIGGER set_application_notes_updated_at
BEFORE UPDATE ON public.application_notes
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Di chuyển dữ liệu cũ từ job_applications.employer_notes (nếu cột tồn tại)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'job_applications' 
          AND column_name = 'employer_notes'
    ) THEN
        INSERT INTO public.application_notes (application_id, employer_id, content, created_at, updated_at)
        SELECT 
            ja.id AS application_id,
            j.employer_id,
            ja.employer_notes AS content,
            ja.updated_at AS created_at,
            ja.updated_at AS updated_at
        FROM public.job_applications ja
        JOIN public.jobs j ON j.id = ja.job_id
        WHERE ja.employer_notes IS NOT NULL 
          AND trim(ja.employer_notes) <> ''
        ON CONFLICT DO NOTHING;

        -- Xóa cột employer_notes khỏi job_applications để Student không thể đọc qua API
        ALTER TABLE public.job_applications DROP COLUMN employer_notes;
    END IF;
END $$;

-- 3. Thiết lập RLS Policies cho application_notes
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;

-- 3.1 SELECT Policy: Chỉ Employer sở hữu Job của đơn ứng tuyển đó hoặc Admin
DROP POLICY IF EXISTS "application_notes_select_policy" ON public.application_notes;
CREATE POLICY "application_notes_select_policy"
ON public.application_notes FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.job_applications ja
        JOIN public.jobs j ON j.id = ja.job_id
        WHERE ja.id = application_notes.application_id
          AND j.employer_id = auth.uid()
    )
    OR public.is_admin()
);

-- 3.2 INSERT Policy: Chỉ Employer sở hữu Job của đơn ứng tuyển đó được thêm ghi chú
DROP POLICY IF EXISTS "application_notes_insert_policy" ON public.application_notes;
CREATE POLICY "application_notes_insert_policy"
ON public.application_notes FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = employer_id
    AND (
        EXISTS (
            SELECT 1 FROM public.job_applications ja
            JOIN public.jobs j ON j.id = ja.job_id
            WHERE ja.id = application_notes.application_id
              AND j.employer_id = auth.uid()
        )
        OR public.is_admin()
    )
);

-- 3.3 UPDATE Policy: Chỉ Employer tạo ghi chú và sở hữu Job được sửa
DROP POLICY IF EXISTS "application_notes_update_policy" ON public.application_notes;
CREATE POLICY "application_notes_update_policy"
ON public.application_notes FOR UPDATE
TO authenticated
USING (
    (auth.uid() = employer_id AND EXISTS (
        SELECT 1 FROM public.job_applications ja
        JOIN public.jobs j ON j.id = ja.job_id
        WHERE ja.id = application_notes.application_id
          AND j.employer_id = auth.uid()
    ))
    OR public.is_admin()
)
WITH CHECK (
    (auth.uid() = employer_id AND EXISTS (
        SELECT 1 FROM public.job_applications ja
        JOIN public.jobs j ON j.id = ja.job_id
        WHERE ja.id = application_notes.application_id
          AND j.employer_id = auth.uid()
    ))
    OR public.is_admin()
);

-- 3.4 DELETE Policy: Chỉ Employer tạo ghi chú và sở hữu Job được xóa
DROP POLICY IF EXISTS "application_notes_delete_policy" ON public.application_notes;
CREATE POLICY "application_notes_delete_policy"
ON public.application_notes FOR DELETE
TO authenticated
USING (
    (auth.uid() = employer_id AND EXISTS (
        SELECT 1 FROM public.job_applications ja
        JOIN public.jobs j ON j.id = ja.job_id
        WHERE ja.id = application_notes.application_id
          AND j.employer_id = auth.uid()
    ))
    OR public.is_admin()
);


-- ==============================================================================
-- PHẦN B: CHUẨN HÓA DỮ LIỆU CŨ & SIẾT CHECK CONSTRAINT (TRƯỚC KHI TẠO TRIGGER)
-- ==============================================================================

-- 1. Chuẩn hóa dữ liệu legacy trên DB cũ (chạy trước khi tạo trigger để không bị trigger chặn)
UPDATE public.job_applications SET status = 'applied' WHERE status IN ('pending', 'new', 'submitted');
UPDATE public.job_applications SET status = 'accepted' WHERE status IN ('hired');
UPDATE public.job_applications SET status = 'interview' WHERE status IN ('shortlisted');

-- 2. Siết chặt CHECK constraint chỉ còn đúng 5 trạng thái chuẩn
DO $$
DECLARE
    con_record RECORD;
BEGIN
    FOR con_record IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.job_applications'::regclass 
          AND contype = 'c' 
          AND pg_get_constraintdef(oid) LIKE '%status%'
    LOOP
        EXECUTE format('ALTER TABLE public.job_applications DROP CONSTRAINT IF EXISTS %I', con_record.conname);
    END LOOP;

    ALTER TABLE public.job_applications 
    ADD CONSTRAINT job_applications_status_check 
    CHECK (status IN ('applied', 'reviewing', 'interview', 'accepted', 'rejected'));
END $$;

ALTER TABLE public.job_applications ALTER COLUMN status SET DEFAULT 'applied';


-- ==============================================================================
-- PHẦN C: KHÓA CỘT THEO MÔ HÌNH WHITELIST (to_jsonb) VÀ KIỂM SOÁT CẬP NHẬT
-- ==============================================================================

-- Trigger Function kiểm soát cập nhật theo Whitelist:
-- - SQL Editor / Migration / Admin (auth.uid() IS NULL hoặc is_admin()): Bypass
-- - Employer: chỉ được đổi status (và updated_at)
-- - Student: chỉ được sửa cover_letter, cv_url khi status còn là 'applied'
-- - Cột job_id, student_id, applied_at: Bất biến
CREATE OR REPLACE FUNCTION public.check_job_application_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    uid UUID := auth.uid();
    is_owner BOOLEAN := FALSE;
BEGIN
    -- Kết nối trực tiếp DB (SQL Editor / Migration / service_role) hoặc Admin: cho qua
    IF uid IS NULL OR public.is_admin() THEN
        RETURN NEW;
    END IF;

    -- Kiểm tra quyền sở hữu Job của Employer
    SELECT EXISTS (
        SELECT 1 FROM public.jobs j
        WHERE j.id = OLD.job_id AND j.employer_id = uid
    ) INTO is_owner;

    -- Các cột bất biến: KHÔNG AI ĐƯỢC PHÉP SỬA
    IF NEW.job_id <> OLD.job_id
       OR NEW.student_id <> OLD.student_id
       OR NEW.applied_at <> OLD.applied_at THEN
        RAISE EXCEPTION 'Không được thay đổi job_id, student_id hoặc applied_at.';
    END IF;

    IF is_owner THEN
        -- Employer: chỉ được đổi status (khóa toàn bộ cột khác qua whitelist to_jsonb)
        IF (to_jsonb(NEW) - 'status' - 'updated_at')
           IS DISTINCT FROM (to_jsonb(OLD) - 'status' - 'updated_at') THEN
            RAISE EXCEPTION 'Nhà tuyển dụng chỉ được thay đổi trạng thái đơn ứng tuyển.';
        END IF;
    ELSIF uid = OLD.student_id THEN
        -- Student: chỉ sửa nội dung hồ sơ khi còn "applied"
        IF OLD.status <> 'applied' THEN
            RAISE EXCEPTION 'Hồ sơ đã được xử lý, bạn không thể chỉnh sửa.';
        END IF;
        IF NEW.status <> OLD.status THEN
            RAISE EXCEPTION 'Sinh viên không được tự thay đổi trạng thái.';
        END IF;
        IF (to_jsonb(NEW) - 'cover_letter' - 'cv_url' - 'updated_at')
           IS DISTINCT FROM (to_jsonb(OLD) - 'cover_letter' - 'cv_url' - 'updated_at') THEN
            RAISE EXCEPTION 'Sinh viên chỉ được sửa thư giới thiệu và CV.';
        END IF;
    ELSE
        RAISE EXCEPTION 'Bạn không có quyền chỉnh sửa đơn ứng tuyển này.';
    END IF;

    NEW.updated_at := TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_job_application_update ON public.job_applications;
CREATE TRIGGER trg_check_job_application_update
BEFORE UPDATE ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.check_job_application_update();

-- Cập nhật lại UPDATE policies cho khớp
DROP POLICY IF EXISTS "job_applications_employer_update_policy" ON public.job_applications;
CREATE POLICY "job_applications_employer_update_policy"
ON public.job_applications FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.jobs
        WHERE jobs.id = job_applications.job_id
          AND jobs.employer_id = auth.uid()
    )
    OR public.is_admin()
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.jobs
        WHERE jobs.id = job_applications.job_id
          AND jobs.employer_id = auth.uid()
    )
    OR public.is_admin()
);

DROP POLICY IF EXISTS "job_applications_student_update_policy" ON public.job_applications;
CREATE POLICY "job_applications_student_update_policy"
ON public.job_applications FOR UPDATE
TO authenticated
USING (
    auth.uid() = student_id
    AND status = 'applied'
)
WITH CHECK (
    auth.uid() = student_id
    AND status = 'applied'
);


-- ==============================================================================
-- PHẦN D: TRIGGER MÁY TRẠNG THÁI (STATE MACHINE) & BẢNG LỊCH SỬ TRẠNG THÁI
-- ==============================================================================

-- Trigger kiểm soát luồng trạng thái hợp lệ (State Machine Validation)
CREATE OR REPLACE FUNCTION public.validate_application_status_transition()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    uid UUID := auth.uid();
BEGIN
    -- Nếu trạng thái không thay đổi, cho qua
    IF NEW.status = OLD.status THEN
        RETURN NEW;
    END IF;

    -- Kết nối trực tiếp DB (SQL Editor / Migration / service_role) hoặc Admin: cho qua
    IF uid IS NULL OR public.is_admin() THEN
        RETURN NEW;
    END IF;

    -- Quy tắc luồng trạng thái
    CASE OLD.status
        WHEN 'applied' THEN
            IF NEW.status NOT IN ('reviewing', 'rejected') THEN
                RAISE EXCEPTION 'Từ trạng thái "Đã nộp (applied)", chỉ có thể chuyển sang "Đang xem xét (reviewing)" hoặc "Từ chối (rejected)".';
            END IF;
        WHEN 'reviewing' THEN
            IF NEW.status NOT IN ('interview', 'rejected') THEN
                RAISE EXCEPTION 'Từ trạng thái "Đang xem xét (reviewing)", chỉ có thể chuyển sang "Hẹn phỏng vấn (interview)" hoặc "Từ chối (rejected)".';
            END IF;
        WHEN 'interview' THEN
            IF NEW.status NOT IN ('accepted', 'rejected') THEN
                RAISE EXCEPTION 'Từ trạng thái "Hẹn phỏng vấn (interview)", chỉ có thể chuyển sang "Đã nhận việc (accepted)" hoặc "Từ chối (rejected)".';
            END IF;
        WHEN 'accepted' THEN
            RAISE EXCEPTION 'Đơn ứng tuyển đã ở trạng thái cuối "Đã nhận việc (accepted)", không thể chuyển tiếp trạng thái.';
        WHEN 'rejected' THEN
            RAISE EXCEPTION 'Đơn ứng tuyển đã ở trạng thái cuối "Từ chối (rejected)", không thể chuyển tiếp trạng thái.';
        ELSE
            RAISE EXCEPTION 'Trạng thái hiện tại không hợp lệ: %', OLD.status;
    END CASE;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_application_status_transition ON public.job_applications;
CREATE TRIGGER trg_validate_application_status_transition
BEFORE UPDATE OF status ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.validate_application_status_transition();

-- Bảng application_status_history (Lịch sử trạng thái)
CREATE TABLE IF NOT EXISTS public.application_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_status_history_app_id ON public.application_status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_status_history_changed_at ON public.application_status_history(changed_at DESC);

-- Trigger tự động ghi lịch sử trạng thái
CREATE OR REPLACE FUNCTION public.record_application_status_history()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Ghi lịch sử khi mới nộp đơn
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.application_status_history (application_id, old_status, new_status, changed_by, changed_at)
        VALUES (NEW.id, NULL, NEW.status, COALESCE(auth.uid(), NEW.student_id), NEW.applied_at);
        RETURN NEW;
    END IF;

    -- Ghi lịch sử khi có sự thay đổi status
    IF TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.application_status_history (application_id, old_status, new_status, changed_by, changed_at)
        VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), TIMEZONE('utc'::text, NOW()));
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_record_application_status_history ON public.job_applications;
CREATE TRIGGER trg_record_application_status_history
AFTER INSERT OR UPDATE OF status ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.record_application_status_history();

-- RLS cho application_status_history:
-- Employer sở hữu Job và Student của đơn đó có quyền XEM. Không cho phép sửa/xóa trực tiếp từ client.
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "status_history_select_policy" ON public.application_status_history;
CREATE POLICY "status_history_select_policy"
ON public.application_status_history FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.job_applications ja
        LEFT JOIN public.jobs j ON j.id = ja.job_id
        WHERE ja.id = application_status_history.application_id
          AND (ja.student_id = auth.uid() OR j.employer_id = auth.uid())
    )
    OR public.is_admin()
);


-- ==============================================================================
-- PHẦN E: RÀNG BUỘC UNIQUE CHỐNG NỘP TRÙNG LẶP (KHÔNG NUỐT LỖI)
-- ==============================================================================

-- 1. Kiểm tra đơn trùng lặp (TUYỆT ĐỐI KHÔNG TỰ Ý XÓA DỮ LIỆU)
DO $$
DECLARE
    dup_records TEXT;
BEGIN
    SELECT string_agg(format('(job_id: %s, student_id: %s, số lượng: %s)', job_id, student_id, cnt), E'\n - ')
    INTO dup_records
    FROM (
        SELECT job_id, student_id, count(*) AS cnt
        FROM public.job_applications
        GROUP BY job_id, student_id
        HAVING count(*) > 1
    ) dups;

    IF dup_records IS NOT NULL THEN
        RAISE EXCEPTION E'PHÁT HIỆN ĐƠN ỨNG TUYỂN TRÙNG LẶP TRONG DATABASE!\nKhông thể tạo UNIQUE constraint. Vui lòng rà soát và xử lý thủ công các đơn sau:\n - %', dup_records;
    END IF;

    -- 2. Thêm ràng buộc UNIQUE (chỉ bỏ qua nếu constraint đã tồn tại)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'unique_job_student_application'
          AND conrelid = 'public.job_applications'::regclass
    ) THEN
        ALTER TABLE public.job_applications 
        ADD CONSTRAINT unique_job_student_application UNIQUE (job_id, student_id);
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
