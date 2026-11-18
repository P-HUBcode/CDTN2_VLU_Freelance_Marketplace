-- ==============================================================================
-- STUDENTHUB MIGRATION - SPRINT 3.2.3: BẢO VỆ PROFILES, STORAGE CV VÀ SIGNED URL
-- Date: 2026-11-13
-- Description:
-- 1. Chống leo quyền (Privilege Escalation) qua handle_new_user() và INSERT/UPDATE profiles.
-- 2. Bảo vệ thông tin nhạy cảm (email, phone) trên public.profiles bằng RLS chặt chẽ.
-- 3. Hỗ trợ cờ is_public trên student_profiles cho phép cấu hình hồ sơ công khai.
-- 4. Chuyển đổi dữ liệu cv_url cũ từ public URL sang relative storage path.
-- 5. Siết chặt chính sách RLS cho Storage bucket 'cv' (private, UPDATE/DELETE chỉ chủ thư mục).
-- ==============================================================================

-- ==============================================================================
-- 1. SỬA HÀM handle_new_user(): CHỐNG TỰ GÁN ROLE = ADMIN QUA SIGNUP METADATA
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
    user_name TEXT;
    user_uni TEXT;
    user_major TEXT;
    company_title TEXT;
BEGIN
    -- Lấy metadata truyền từ form đăng ký (hoặc giá trị mặc định)
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));
    user_uni := COALESCE(NEW.raw_user_meta_data->>'university', 'Đại học Kinh tế TP.HCM (UEH)');
    user_major := COALESCE(NEW.raw_user_meta_data->>'major', 'Marketing Số');
    company_title := COALESCE(NEW.raw_user_meta_data->>'company_name', 'Studio Doanh nghiệp');

    -- BẢO MẬT: Người dùng đăng ký qua form thông thường CHỈ ĐƯỢC PHÉP nhận vai trò 'student' hoặc 'employer'.
    -- Nếu cố tình gửi role = 'admin' hoặc giá trị bất kỳ khác -> ÉP VỀ 'student'.
    IF user_role NOT IN ('student', 'employer') THEN
        user_role := 'student';
    END IF;

    -- Insert vào public.profiles
    INSERT INTO public.profiles (id, full_name, email, role, avatar_url)
    VALUES (
        NEW.id,
        user_name,
        NEW.email,
        user_role,
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;

    -- Nếu là Student, tạo record trong student_profiles
    IF user_role = 'student' THEN
        INSERT INTO public.student_profiles (user_id, university, major)
        VALUES (NEW.id, user_uni, user_major)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    -- Nếu là Employer, tạo record trong companies
    IF user_role = 'employer' THEN
        INSERT INTO public.companies (owner_id, company_name)
        VALUES (NEW.id, company_title)
        ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;


-- ==============================================================================
-- 2. TRIGGER & RLS CHO BẢNG PROFILES: CHỐNG LEO QUYỀN INSERT & UPDATE
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.check_profile_insert_or_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Kết nối trực tiếp DB (SQL Editor / migration / service_role) hoặc Admin: cho qua
    IF auth.uid() IS NULL OR public.is_admin() THEN
        RETURN NEW;
    END IF;

    -- Kiểm tra khi INSERT
    IF TG_OP = 'INSERT' THEN
        -- Non-admin TUYỆT ĐỐI không được phép chèn bản ghi có role = 'admin'
        IF NEW.role = 'admin' THEN
            RAISE EXCEPTION 'Bạn không có quyền tạo tài khoản với vai trò Quản trị viên (admin).';
        END IF;

        IF NEW.role NOT IN ('student', 'employer', 'admin') THEN
            NEW.role := 'student';
        END IF;

        RETURN NEW;
    END IF;

    -- Kiểm tra khi UPDATE
    IF TG_OP = 'UPDATE' THEN
        IF NEW.id <> OLD.id THEN
            RAISE EXCEPTION 'Không được phép thay đổi mã định danh tài khoản (id).';
        END IF;

        IF NEW.role <> OLD.role THEN
            RAISE EXCEPTION 'Bạn không có quyền tự thay đổi vai trò (role) của tài khoản.';
        END IF;

        IF NEW.email IS DISTINCT FROM OLD.email THEN
            RAISE EXCEPTION 'Email tài khoản phải được quản lý thông qua luồng xác thực bảo mật.';
        END IF;

        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$;

        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_profile_update ON public.profiles;
DROP TRIGGER IF EXISTS trg_check_profile_insert_or_update ON public.profiles;
CREATE TRIGGER trg_check_profile_insert_or_update
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.check_profile_insert_or_update();

-- Cập nhật policy INSERT của profiles: Non-admin không được tự chèn role = admin
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
    (auth.uid() = id AND role IN ('student', 'employer'))
    OR public.is_admin()
);


-- ==============================================================================
-- 3. BẢO VỆ DỮ LIỆU NHẠY CẢM TRÊN PROFILES (EMAIL, PHONE) QUA SELECT POLICY
-- ==============================================================================
-- Bổ sung cột is_public cho student_profiles nếu chưa có
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "Public profiles are viewable by all users" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;

CREATE POLICY "profiles_select_policy"
ON public.profiles FOR SELECT
TO authenticated
USING (
    -- 1. Bản thân người dùng hoặc Quản trị viên
    auth.uid() = id
    OR public.is_admin()
    -- 2. Nhà tuyển dụng xem hồ sơ của ứng viên đã nộp vào Job của mình
    OR EXISTS (
        SELECT 1 FROM public.job_applications ja
        JOIN public.jobs j ON j.id = ja.job_id
        WHERE ja.student_id = profiles.id
          AND j.employer_id = auth.uid()
    )
    -- 3. Xem thông tin cơ bản của Nhà tuyển dụng sở hữu Job
    OR (
        profiles.role = 'employer'
        AND EXISTS (
            SELECT 1 FROM public.jobs j
            WHERE j.employer_id = profiles.id
        )
    )
    -- 4. Sinh viên đã chủ động bật cờ công khai (is_public = true)
    OR (
        profiles.role = 'student'
        AND EXISTS (
            SELECT 1 FROM public.student_profiles sp
            WHERE sp.user_id = profiles.id AND sp.is_public = true
        )
    )
);

-- Cập nhật policy SELECT của student_profiles kết hợp cờ is_public
DROP POLICY IF EXISTS "student_profiles_select_policy" ON public.student_profiles;
CREATE POLICY "student_profiles_select_policy"
ON public.student_profiles FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id
    OR public.is_admin()
    OR (is_public = true)
    OR EXISTS (
        SELECT 1 FROM public.job_applications ja
        JOIN public.jobs j ON j.id = ja.job_id
        WHERE ja.student_id = student_profiles.user_id
          AND j.employer_id = auth.uid()
    )
);


-- ==============================================================================
-- 4. DATA MIGRATION: CHUẨN HÓA cv_url CŨ THÀNH RELATIVE STORAGE PATH
-- ==============================================================================
-- Chuyển đổi các URL tuyệt đối dạng https://.../storage/v1/object/public/cv/<path> thành <path>
UPDATE public.job_applications
SET cv_url = regexp_replace(cv_url, '^https?://[^/]+/storage/v1/object/(?:public|sign)/cv/', '')
WHERE cv_url LIKE '%/storage/v1/object/%/cv/%';

UPDATE public.student_profiles
SET cv_url = regexp_replace(cv_url, '^https?://[^/]+/storage/v1/object/(?:public|sign)/cv/', '')
WHERE cv_url LIKE '%/storage/v1/object/%/cv/%';


-- ==============================================================================
-- 5. SIẾT CHẶT BẢO MẬT STORAGE BUCKET 'cv' (PRIVATE, UPDATE/DELETE CHỈ CHỦ THƯ MỤC)
-- ==============================================================================
-- Đảm bảo bucket 'cv' luôn là private
UPDATE storage.buckets SET public = false WHERE id = 'cv';

-- 5.1. Quyền SELECT (Xem / Tải CV qua Signed URL):
-- Chỉ chính sinh viên sở hữu CV, Employer có Job mà sinh viên nộp đơn, hoặc Admin
DROP POLICY IF EXISTS "CV files in cv bucket are viewable" ON storage.objects;
DROP POLICY IF EXISTS "cv_select_policy" ON storage.objects;
CREATE POLICY "cv_select_policy"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'cv'
    AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR EXISTS (
            SELECT 1 FROM public.job_applications ja
            JOIN public.jobs j ON j.id = ja.job_id
            WHERE ja.student_id::text = (storage.foldername(name))[1]
              AND j.employer_id = auth.uid()
        )
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

-- 5.3. Quyền UPDATE: Chỉ chính sinh viên sở hữu thư mục
DROP POLICY IF EXISTS "Students can update own CV" ON storage.objects;
DROP POLICY IF EXISTS "cv_update_policy" ON storage.objects;
CREATE POLICY "cv_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'cv'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5.4. Quyền DELETE: Chỉ chính sinh viên sở hữu thư mục
DROP POLICY IF EXISTS "Students can delete own CV" ON storage.objects;
DROP POLICY IF EXISTS "cv_delete_policy" ON storage.objects;
CREATE POLICY "cv_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'cv'
    AND auth.uid()::text = (storage.foldername(name))[1]
);
