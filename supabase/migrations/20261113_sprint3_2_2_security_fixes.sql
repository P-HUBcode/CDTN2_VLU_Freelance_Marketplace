-- ==============================================================================
-- STUDENTHUB MIGRATION - SPRINT 3.2.2: SECURITY FIXES & HARDENING REFINEMENTS (REVISED)
-- Date: 2026-11-13
-- Description:
-- 1. search_path = public cho tất cả các hàm SECURITY DEFINER (is_admin, has_role, check_job_application_update...)
-- 2. Khóa cột nghiêm ngặt theo mô hình Whitelist (to_jsonb) cho job_applications
-- 3. Bảo vệ bảng profiles: Khóa role/id, chống Privilege Escalation sang Admin qua trigger whitelist & column grant
-- 4. Bảo vệ student_profiles & Storage bucket 'cv': Employer CHỈ đọc được hồ sơ/CV của sinh viên đã ứng tuyển vào Job của mình
-- 5. Phân quyền mức cột cho notifications: Chỉ cho phép authenticated UPDATE (is_read)
-- 6. Ràng buộc UNIQUE chống nộp trùng lặp: Kiểm tra dữ liệu trùng và RAISE EXCEPTION (KHÔNG TỰ Ý XÓA DỮ LIỆU)
-- ==============================================================================

-- ==============================================================================
-- 1. CẤU HÌNH search_path = public CHO CÁC HÀM SECURITY DEFINER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(target_user_id UUID, check_role TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = target_user_id AND role = check_role
    );
END;
$$;

ALTER FUNCTION public.record_application_status_history() SET search_path = public;


-- ==============================================================================
-- 2. BẢO VỆ BẢNG profiles: CHỐNG LEO THANG ĐẶC QUYỀN (PRIVILEGE ESCALATION)
-- ==============================================================================

-- Trigger Whitelist kiểm soát cập nhật bảng profiles:
-- - SQL Editor / migration / Admin (auth.uid() IS NULL hoặc is_admin()): Bypass
-- - Khóa cứng cột role và id: User thông thường TUYỆT ĐỐI KHÔNG ĐƯỢC ĐỔI role hoặc id
-- - Whitelist: Chỉ cho phép sửa full_name, avatar_url, cover_url, phone, bio, location, updated_at
CREATE OR REPLACE FUNCTION public.check_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    uid UUID := auth.uid();
BEGIN
    -- Kết nối trực tiếp DB (SQL Editor / migration / service_role) hoặc Admin: cho qua
    IF uid IS NULL OR public.is_admin() THEN
        RETURN NEW;
    END IF;

    -- Người dùng chỉ được sửa profile của chính mình
    IF uid <> OLD.id THEN
        RAISE EXCEPTION 'Bạn không có quyền chỉnh sửa hồ sơ của người khác.';
    END IF;

    -- Khóa cột role và id: Ngăn chặn triệt để hành vi tự thăng cấp lên Admin
    IF NEW.role <> OLD.role THEN
        RAISE EXCEPTION 'Bạn không có quyền tự thay đổi vai trò (role) của tài khoản.';
    END IF;

    IF NEW.id <> OLD.id THEN
        RAISE EXCEPTION 'Không được phép thay đổi mã định danh người dùng (id).';
    END IF;

    -- Whitelist: Chỉ cho phép cập nhật các trường thông tin cá nhân cơ bản
    IF (to_jsonb(NEW) - 'full_name' - 'avatar_url' - 'cover_url' - 'phone' - 'bio' - 'location' - 'updated_at')
       IS DISTINCT FROM (to_jsonb(OLD) - 'full_name' - 'avatar_url' - 'cover_url' - 'phone' - 'bio' - 'location' - 'updated_at') THEN
        RAISE EXCEPTION 'Bạn chỉ được phép chỉnh sửa các thông tin cá nhân cơ bản.';
    END IF;

    NEW.updated_at := TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_profile_update ON public.profiles;
CREATE TRIGGER trg_check_profile_update
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.check_profile_update();

-- Phân quyền mức cột cho profiles: Thu hồi quyền UPDATE role từ authenticated
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, avatar_url, cover_url, phone, bio, location, updated_at) ON public.profiles TO authenticated;


-- ==============================================================================
-- 3. KHÓA CỘT WHITELIST (to_jsonb) CHO job_applications
-- ==============================================================================
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
    -- Kết nối trực tiếp DB (SQL Editor / service_role / migration) hoặc Admin: cho qua
    IF uid IS NULL OR public.is_admin() THEN
        RETURN NEW;
    END IF;

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
        -- Employer: chỉ được đổi status (whitelist chặt chẽ)
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

-- Trigger kiểm soát chuyển trạng thái State Machine
CREATE OR REPLACE FUNCTION public.validate_application_status_transition()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    uid UUID := auth.uid();
BEGIN
    IF NEW.status = OLD.status THEN
        RETURN NEW;
    END IF;

    -- Kết nối trực tiếp DB (SQL Editor / migration / service_role) hoặc Admin: cho qua
    IF uid IS NULL OR public.is_admin() THEN
        RETURN NEW;
    END IF;

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


-- ==============================================================================
-- 4. BẢO VỆ student_profiles: EMPLOYER CHỈ XEM HỒ SƠ ỨNG VIÊN ĐÃ ỨNG TUYỂN VÀO JOB CỦA MÌNH
-- ==============================================================================
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Student profiles are viewable by all users" ON public.student_profiles;
DROP POLICY IF EXISTS "student_profiles_select_policy" ON public.student_profiles;
CREATE POLICY "student_profiles_select_policy"
ON public.student_profiles FOR SELECT
TO authenticated
USING (
    -- 1. Chính sinh viên xem hồ sơ của mình
    auth.uid() = user_id
    -- 2. Hoặc Employer có Job mà sinh viên này đã ứng tuyển
    OR EXISTS (
        SELECT 1 FROM public.job_applications ja
        JOIN public.jobs j ON j.id = ja.job_id
        WHERE ja.student_id = student_profiles.user_id
          AND j.employer_id = auth.uid()
    )
    -- 3. Hoặc Admin
    OR public.is_admin()
);


-- ==============================================================================
-- 5. BẢO VỆ STORAGE BUCKET 'cv': EMPLOYER CHỈ XEM CV ỨNG VIÊN ĐÃ NỘP VÀO JOB CỦA MÌNH
-- ==============================================================================
-- Đảm bảo bucket 'cv' là private
UPDATE storage.buckets SET public = false WHERE id = 'cv';

-- 5.1. Quyền SELECT (Xem / Tải CV):
-- Chỉ chính sinh viên sở hữu CV, Employer có Job mà sinh viên nộp đơn, hoặc Admin
DROP POLICY IF EXISTS "CV files in cv bucket are viewable" ON storage.objects;
DROP POLICY IF EXISTS "cv_select_policy" ON storage.objects;
CREATE POLICY "cv_select_policy"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'cv'
    AND (
        -- Chính sinh viên sở hữu file
        auth.uid()::text = (storage.foldername(name))[1]
        -- Hoặc Employer sở hữu Job mà sinh viên này nộp đơn
        OR EXISTS (
            SELECT 1 FROM public.job_applications ja
            JOIN public.jobs j ON j.id = ja.job_id
            WHERE ja.student_id::text = (storage.foldername(name))[1]
              AND j.employer_id = auth.uid()
        )
        -- Hoặc Admin
        OR public.is_admin()
    )
);

-- 5.2. Quyền INSERT: Sinh viên chỉ được upload vào thư mục UID của chính mình
DROP POLICY IF EXISTS "Students can upload own CV to cv bucket" ON storage.objects;
DROP POLICY IF EXISTS "cv_insert_policy" ON storage.objects;
CREATE POLICY "cv_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'cv'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5.3. Quyền UPDATE / DELETE: Chỉ chính sinh viên sở hữu file CV
DROP POLICY IF EXISTS "Students can update own CV" ON storage.objects;
DROP POLICY IF EXISTS "cv_update_policy" ON storage.objects;
CREATE POLICY "cv_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'cv'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Students can delete own CV" ON storage.objects;
DROP POLICY IF EXISTS "cv_delete_policy" ON storage.objects;
CREATE POLICY "cv_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'cv'
    AND auth.uid()::text = (storage.foldername(name))[1]
);


-- ==============================================================================
-- 6. PHÂN QUYỀN MỨC CỘT CHO BẢNG NOTIFICATIONS
-- ==============================================================================
REVOKE UPDATE ON public.notifications FROM authenticated;
GRANT UPDATE (is_read) ON public.notifications TO authenticated;


-- ==============================================================================
-- 7. RÀNG BUỘC UNIQUE (job_id, student_id): KIỂM TRA ĐƠN TRÙNG, TUYỆT ĐỐI KHÔNG XÓA DỮ LIỆU
-- ==============================================================================
DO $$
DECLARE
    dup_records TEXT;
BEGIN
    -- Kiểm tra có đơn trùng lặp không
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

    -- Nếu không có đơn trùng, tiến hành tạo ràng buộc UNIQUE an toàn
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
