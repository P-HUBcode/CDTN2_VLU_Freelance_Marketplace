-- ==============================================================================
-- STUDENTHUB - SUPABASE DATABASE MVP SCHEMA & ROW LEVEL SECURITY (RLS)
-- Giai đoạn 1: Database + Authentication + Roles + RLS
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. CREATE TABLES
-- ==============================================================================

-- Bảng 2.1: profiles (Mở rộng từ auth.users của Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    cover_url TEXT,
    phone TEXT,
    email TEXT,
    bio TEXT,
    location TEXT DEFAULT 'TP. Hồ Chí Minh',
    role TEXT NOT NULL CHECK (role IN ('student', 'employer', 'admin')) DEFAULT 'student',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Đảm bảo các cột bổ sung luôn tồn tại kể cả khi bảng đã tạo từ trước
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Bảng 2.2: student_profiles (Thông tin chi tiết dành riêng cho Sinh viên)
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    university TEXT DEFAULT 'Đại học Kinh tế TP.HCM (UEH)',
    major TEXT DEFAULT 'Marketing Số & Truyền thông',
    graduation_year TEXT DEFAULT '2027',
    experience TEXT,
    availability TEXT DEFAULT 'Linh hoạt theo lịch học',
    cv_url TEXT,
    portfolio_url TEXT,
    birth_date DATE,
    skills JSONB DEFAULT '[]'::jsonb,
    career_goals TEXT,
    foreign_languages JSONB DEFAULT '[]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    academic_achievements TEXT,
    address TEXT DEFAULT 'TP. Hồ Chí Minh',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS career_goals TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS foreign_languages JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS academic_achievements TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS address TEXT DEFAULT 'TP. Hồ Chí Minh';
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Bảng 2.3: companies (Thông tin doanh nghiệp / studio của Employer)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    logo_url TEXT,
    cover_url TEXT,
    description TEXT,
    website TEXT,
    location TEXT DEFAULT 'TP. Hồ Chí Minh',
    contact_email TEXT,
    contact_phone TEXT,
    industry TEXT DEFAULT 'Truyền thông & Công nghệ Sáng tạo',
    company_size TEXT DEFAULT '10 - 50 nhân viên',
    founded_year TEXT DEFAULT '2020',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS industry TEXT DEFAULT 'Truyền thông & Công nghệ Sáng tạo';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS company_size TEXT DEFAULT '10 - 50 nhân viên';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS founded_year TEXT DEFAULT '2020';
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Bảng 2.4: jobs (Tin tuyển dụng việc làm part-time, freelance, internship)
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    job_type TEXT NOT NULL DEFAULT 'Part-time', -- 'Part-time', 'Freelance', 'Internship', 'Remote', 'Project'
    location TEXT NOT NULL DEFAULT 'TP. Hồ Chí Minh',
    salary_min NUMERIC DEFAULT 0,
    salary_max NUMERIC DEFAULT 0,
    skills JSONB DEFAULT '[]'::jsonb,
    requirements JSONB DEFAULT '[]'::jsonb,
    benefits JSONB DEFAULT '[]'::jsonb,
    working_hours TEXT DEFAULT 'Linh hoạt theo ca',
    deadline DATE,
    status TEXT NOT NULL CHECK (status IN ('published', 'active', 'closed', 'draft', 'expired', 'pending_approval', 'rejected')) DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Bảng 2.5: job_applications (Hồ sơ ứng tuyển của sinh viên)
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    cv_url TEXT,
    cover_letter TEXT,
    employer_notes TEXT,
    status TEXT NOT NULL CHECK (status IN ('applied', 'pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'hired', 'rejected')) DEFAULT 'applied',
    applied_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(job_id, student_id)
);

ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS employer_notes TEXT;

-- Bảng 2.6: saved_jobs (Công việc sinh viên đã lưu yêu thích)
CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, job_id)
);

-- ==============================================================================
-- 3. HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Helper 3.1: Kiểm tra xem user hiện tại có phải là Admin không
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

-- Helper 3.2: Kiểm tra role cụ thể của user
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

-- Helper 3.2.1: Trigger kiểm soát cập nhật hồ sơ người dùng (chống Privilege Escalation)
CREATE OR REPLACE FUNCTION public.check_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    uid UUID := auth.uid();
BEGIN
    IF uid IS NULL OR public.is_admin() THEN
        RETURN NEW;
    END IF;

    IF uid <> OLD.id THEN
        RAISE EXCEPTION 'Bạn không có quyền chỉnh sửa hồ sơ của người khác.';
    END IF;

    IF NEW.role <> OLD.role THEN
        RAISE EXCEPTION 'Bạn không có quyền tự thay đổi vai trò (role) của tài khoản.';
    END IF;

    IF NEW.id <> OLD.id THEN
        RAISE EXCEPTION 'Không được phép thay đổi mã định danh người dùng (id).';
    END IF;

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

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, avatar_url, cover_url, phone, bio, location, updated_at) ON public.profiles TO authenticated;

-- Trigger 3.3: Tự động cập nhật cột updated_at khi UPDATE record
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_student_profiles_updated_at ON public.student_profiles;
CREATE TRIGGER set_student_profiles_updated_at
BEFORE UPDATE ON public.student_profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_jobs_updated_at ON public.jobs;
CREATE TRIGGER set_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_job_applications_updated_at ON public.job_applications;
CREATE TRIGGER set_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger 3.4: Tự động tạo record trong public.profiles & profile phụ khi có User đăng ký mới qua Supabase Auth
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

-- Gắn trigger vào bảng auth.users của Supabase
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger kiểm tra chống leo quyền khi INSERT hoặc UPDATE profiles
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

DROP TRIGGER IF EXISTS trg_check_profile_update ON public.profiles;
DROP TRIGGER IF EXISTS trg_check_profile_insert_or_update ON public.profiles;
CREATE TRIGGER trg_check_profile_insert_or_update
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.check_profile_insert_or_update();

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Bật RLS trên toàn bộ các bảng
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 4.1. POLICIES CHO public.profiles
-- ------------------------------------------------------------------------------
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

-- User chỉ có thể sửa profile của chính mình, hoặc Admin
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin());

-- User có thể tự insert profile cho chính mình (chỉ role student hoặc employer, non-admin không được tự chèn role = admin)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (
    (auth.uid() = id AND role IN ('student', 'employer'))
    OR public.is_admin()
);

-- ------------------------------------------------------------------------------
-- 4.2. POLICIES CHO public.student_profiles
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Student profiles are viewable by all users" ON public.student_profiles;
DROP POLICY IF EXISTS "student_profiles_select_policy" ON public.student_profiles;
CREATE POLICY "student_profiles_select_policy"
ON public.student_profiles FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id
    OR EXISTS (
        SELECT 1 FROM public.job_applications ja
        JOIN public.jobs j ON j.id = ja.job_id
        WHERE ja.student_id = student_profiles.user_id
          AND j.employer_id = auth.uid()
    )
    OR public.is_admin()
);

CREATE POLICY "Students can update own student profile"
ON public.student_profiles FOR UPDATE
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Students can insert own student profile"
ON public.student_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 4.3. POLICIES CHO public.companies
-- ------------------------------------------------------------------------------
CREATE POLICY "Companies are viewable by everyone"
ON public.companies FOR SELECT
USING (true);

CREATE POLICY "Employers can update own company"
ON public.companies FOR UPDATE
USING (auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Employers can insert own company"
ON public.companies FOR INSERT
WITH CHECK (auth.uid() = owner_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 4.4. POLICIES CHO public.jobs
-- ------------------------------------------------------------------------------
-- Mọi người đều có thể xem các tin việc làm đang published/active. Chủ tin hoặc Admin có thể xem cả draft/closed.
DROP POLICY IF EXISTS "Active jobs are viewable by everyone" ON public.jobs;
CREATE POLICY "Active jobs are viewable by everyone"
ON public.jobs FOR SELECT
USING (
    status IN ('published', 'active')
    OR auth.uid() = employer_id
    OR public.is_admin()
);

-- Chỉ Employer và Admin mới được đăng tin tuyển dụng
DROP POLICY IF EXISTS "Employers and admins can insert jobs" ON public.jobs;
CREATE POLICY "Employers and admins can insert jobs"
ON public.jobs FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = employer_id
    AND (
        public.has_role(auth.uid(), 'employer')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'employer'
        OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'employer'
        OR public.is_admin()
    )
);

-- Chỉ chủ tin tuyển dụng hoặc Admin mới được sửa tin
DROP POLICY IF EXISTS "Employers can update own jobs" ON public.jobs;
CREATE POLICY "Employers can update own jobs"
ON public.jobs FOR UPDATE
USING (auth.uid() = employer_id OR public.is_admin());

-- Chỉ chủ tin tuyển dụng hoặc Admin mới được xóa tin
DROP POLICY IF EXISTS "Employers can delete own jobs" ON public.jobs;
CREATE POLICY "Employers can delete own jobs"
ON public.jobs FOR DELETE
USING (auth.uid() = employer_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 4.5. POLICIES CHO public.job_applications
-- ------------------------------------------------------------------------------
-- Quyền XEM application:
-- 1) Sinh viên chỉ xem được hồ sơ do chính mình nộp
-- 2) Nhà tuyển dụng chỉ xem được hồ sơ nộp vào các Job do chính mình sở hữu
-- 3) Admin xem được toàn bộ
CREATE POLICY "Applications viewable by student owner and job employer"
ON public.job_applications FOR SELECT
USING (
    auth.uid() = student_id
    OR EXISTS (
        SELECT 1 FROM public.jobs
        WHERE jobs.id = job_applications.job_id
        AND jobs.employer_id = auth.uid()
    )
    OR public.is_admin()
);

-- Quyền TẠO application: Chỉ Sinh viên nộp cho chính mình (không nộp hộ người khác)
CREATE POLICY "Students can submit own application"
ON public.job_applications FOR INSERT
WITH CHECK (
    auth.uid() = student_id
    AND public.has_role(auth.uid(), 'student')
);

-- Quyền CẬP NHẬT application:
-- - Sinh viên được sửa cover_letter/cv_url trước khi được duyệt
-- - Nhà tuyển dụng được cập nhật cột status (pending -> reviewing -> interview -> hired -> rejected)
CREATE POLICY "Students and Employers can update applications"
ON public.job_applications FOR UPDATE
USING (
    auth.uid() = student_id
    OR EXISTS (
        SELECT 1 FROM public.jobs
        WHERE jobs.id = job_applications.job_id
        AND jobs.employer_id = auth.uid()
    )
    OR public.is_admin()
);

-- ------------------------------------------------------------------------------
-- 4.6. POLICIES CHO public.saved_jobs
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own saved jobs"
ON public.saved_jobs FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own saved jobs"
ON public.saved_jobs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved jobs"
ON public.saved_jobs FOR DELETE
USING (auth.uid() = user_id OR public.is_admin());

-- ==============================================================================
-- 5. STORAGE BUCKET CHO CV ỨNG VIÊN & POLICIES
-- ==============================================================================

-- Tạo bucket 'cv' nếu chưa có (Private - không public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'cv',
    'cv',
    false,
    10485760, -- 10MB
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

-- Quyền upload CV: Sinh viên chỉ được upload vào thư mục có tên là auth.uid() của chính mình
DROP POLICY IF EXISTS "Students can upload own CV to cv bucket" ON storage.objects;
DROP POLICY IF EXISTS "cv_insert_policy" ON storage.objects;
CREATE POLICY "cv_insert_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'cv'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Quyền xem CV: Chỉ chính sinh viên sở hữu file, Employer có Job mà sinh viên đã ứng tuyển, hoặc Admin
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

-- Quyền cập nhật/xóa: Sinh viên chỉ có thể quản lý file CV của chính mình
DROP POLICY IF EXISTS "Students can update own CV" ON storage.objects;
DROP POLICY IF EXISTS "cv_update_policy" ON storage.objects;
CREATE POLICY "cv_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'cv' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Students can delete own CV" ON storage.objects;
DROP POLICY IF EXISTS "cv_delete_policy" ON storage.objects;
CREATE POLICY "cv_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'cv' AND auth.uid()::text = (storage.foldername(name))[1]);


-- ==============================================================================
-- STUDENTHUB MIGRATION - SPRINT 3.1: STUDENT PROFILE & PORTFOLIO SYSTEM
-- Date: 2026-11-06
-- Description:
-- 1. Mở rộng thông tin bảng public.profiles & public.student_profiles
-- 2. Tạo bảng public.student_projects (Portfolio) với CRUD & RLS
-- 3. Tạo Storage bucket 'portfolios' & chính sách bảo mật upload ảnh
-- ==============================================================================

-- 1. MỞ RỘNG BẢNG PROFILES (Bổ sung Cover URL)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'cover_url'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN cover_url TEXT;
    END IF;
END $$;

-- 2. MỞ RỘNG BẢNG STUDENT_PROFILES (Chi tiết hồ sơ sinh viên)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'student_profiles' AND column_name = 'birth_date'
    ) THEN
        ALTER TABLE public.student_profiles ADD COLUMN birth_date DATE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'student_profiles' AND column_name = 'skills'
    ) THEN
        ALTER TABLE public.student_profiles ADD COLUMN skills JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'student_profiles' AND column_name = 'career_goals'
    ) THEN
        ALTER TABLE public.student_profiles ADD COLUMN career_goals TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'student_profiles' AND column_name = 'foreign_languages'
    ) THEN
        ALTER TABLE public.student_profiles ADD COLUMN foreign_languages JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'student_profiles' AND column_name = 'certifications'
    ) THEN
        ALTER TABLE public.student_profiles ADD COLUMN certifications JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'student_profiles' AND column_name = 'academic_achievements'
    ) THEN
        ALTER TABLE public.student_profiles ADD COLUMN academic_achievements TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'student_profiles' AND column_name = 'address'
    ) THEN
        ALTER TABLE public.student_profiles ADD COLUMN address TEXT DEFAULT 'TP. Hồ Chí Minh';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'student_profiles' AND column_name = 'is_public'
    ) THEN
        ALTER TABLE public.student_profiles ADD COLUMN is_public BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 3. TẠO BẢNG STUDENT_PROJECTS (PORTFOLIO DỰ ÁN CỦA SINH VIÊN)
CREATE TABLE IF NOT EXISTS public.student_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    technologies JSONB DEFAULT '[]'::jsonb,
    role TEXT,
    github_url TEXT,
    demo_url TEXT,
    start_date TEXT,
    end_date TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tạo Index tăng tốc truy vấn theo student_id
CREATE INDEX IF NOT EXISTS idx_student_projects_student_id ON public.student_projects(student_id);
CREATE INDEX IF NOT EXISTS idx_student_projects_created_at ON public.student_projects(created_at DESC);

-- Trigger cập nhật updated_at
DROP TRIGGER IF EXISTS set_student_projects_updated_at ON public.student_projects;
CREATE TRIGGER set_student_projects_updated_at
BEFORE UPDATE ON public.student_projects
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. THIẾT LẬP ROW LEVEL SECURITY (RLS) CHO STUDENT_PROJECTS
ALTER TABLE public.student_projects ENABLE ROW LEVEL SECURITY;

-- 4.1. Quyền SELECT: Công khai xem nếu hồ sơ sinh viên public, hoặc chính sinh viên, hoặc admin
DROP POLICY IF EXISTS "Public can view student projects if profile is public" ON public.student_projects;
CREATE POLICY "Public can view student projects if profile is public"
ON public.student_projects FOR SELECT
USING (
    auth.uid() = student_id
    OR EXISTS (
        SELECT 1 FROM public.student_profiles sp
        WHERE sp.user_id = student_projects.student_id 
        AND (sp.is_public = true OR sp.is_public IS NULL)
    )
    OR public.is_admin()
);

-- 4.2. Quyền INSERT: Chỉ chính sinh viên được thêm dự án vào portfolio của mình
DROP POLICY IF EXISTS "Students can insert own projects" ON public.student_projects;
CREATE POLICY "Students can insert own projects"
ON public.student_projects FOR INSERT
WITH CHECK (
    auth.uid() = student_id
    AND (
        public.has_role(auth.uid(), 'student')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'student'
        OR public.is_admin()
    )
);

-- 4.3. Quyền UPDATE: Chỉ chính sinh viên hoặc Admin mới được sửa dự án
DROP POLICY IF EXISTS "Students can update own projects" ON public.student_projects;
CREATE POLICY "Students can update own projects"
ON public.student_projects FOR UPDATE
USING (auth.uid() = student_id OR public.is_admin())
WITH CHECK (auth.uid() = student_id OR public.is_admin());

-- 4.4. Quyền DELETE: Chỉ chính sinh viên hoặc Admin mới được xóa dự án
DROP POLICY IF EXISTS "Students can delete own projects" ON public.student_projects;
CREATE POLICY "Students can delete own projects"
ON public.student_projects FOR DELETE
USING (auth.uid() = student_id OR public.is_admin());

-- 5. TẠO STORAGE BUCKET 'portfolios' & POLICIES UPLOAD ẢNH
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'portfolios',
    'portfolios',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Policy upload ảnh: User đã đăng nhập có thể upload vào folder auth.uid()
DROP POLICY IF EXISTS "Authenticated users can upload portfolio images" ON storage.objects;
CREATE POLICY "Authenticated users can upload portfolio images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'portfolios'
    AND auth.uid() IS NOT NULL
);

-- Policy xem ảnh: Public để NTD và cộng đồng xem Portfolio
DROP POLICY IF EXISTS "Portfolio images are publicly viewable" ON storage.objects;
CREATE POLICY "Portfolio images are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolios');

-- Policy cập nhật/xóa ảnh: Chỉ chính chủ sở hữu file
DROP POLICY IF EXISTS "Users can update own portfolio images" ON storage.objects;
CREATE POLICY "Users can update own portfolio images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own portfolio images" ON storage.objects;
CREATE POLICY "Users can delete own portfolio images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);


-- ==============================================================================
-- STUDENTHUB MIGRATION - SPRINT 3.2: EMPLOYER PROFILE & COMPANY PROFILE SYSTEM
-- Date: 2026-11-06
-- Description:
-- 1. Mở rộng thông tin bảng public.companies
-- 2. Cập nhật chính sách bảo mật Row Level Security (RLS) cho companies
-- 3. Bổ sung Trigger và Index tối ưu truy vấn
-- ==============================================================================

-- 1. MỞ RỘNG BẢNG COMPANIES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'cover_url') THEN
        ALTER TABLE public.companies ADD COLUMN cover_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'contact_email') THEN
        ALTER TABLE public.companies ADD COLUMN contact_email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'contact_phone') THEN
        ALTER TABLE public.companies ADD COLUMN contact_phone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'industry') THEN
        ALTER TABLE public.companies ADD COLUMN industry TEXT DEFAULT 'Truyền thông & Công nghệ Sáng tạo';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'company_size') THEN
        ALTER TABLE public.companies ADD COLUMN company_size TEXT DEFAULT '10 - 50 nhân viên';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'founded_year') THEN
        ALTER TABLE public.companies ADD COLUMN founded_year TEXT DEFAULT '2020';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'is_public') THEN
        ALTER TABLE public.companies ADD COLUMN is_public BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 2. INDEX TỐI ƯU TRUY VẤN
CREATE INDEX IF NOT EXISTS idx_companies_owner_id ON public.companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);

-- 3. TRIGGER CẬP NHẬT updated_at CHO COMPANIES
DROP TRIGGER IF EXISTS set_companies_updated_at ON public.companies;
CREATE TRIGGER set_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. THIẾT LẬP LẠI ROW LEVEL SECURITY (RLS) CHẶT CHẼ CHO public.companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 4.1. Quyền SELECT: Mọi người chỉ xem được công ty nếu is_public = true (hoặc null). Chủ sở hữu hoặc Admin xem được cả công ty riêng tư.
DROP POLICY IF EXISTS "Companies are viewable by everyone" ON public.companies;
DROP POLICY IF EXISTS "Public can view public companies or owners" ON public.companies;
CREATE POLICY "Public can view public companies or owners"
ON public.companies FOR SELECT
USING (
    is_public = true
    OR is_public IS NULL
    OR auth.uid() = owner_id
    OR public.is_admin()
);

-- 4.2. Quyền INSERT: Chỉ Employer hoặc Admin tạo công ty và phải gắn owner_id là chính mình
DROP POLICY IF EXISTS "Employers can insert own company" ON public.companies;
CREATE POLICY "Employers can insert own company"
ON public.companies FOR INSERT
WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = owner_id
    AND (
        public.has_role(auth.uid(), 'employer')
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'employer'
        OR public.is_admin()
    )
);

-- 4.3. Quyền UPDATE: Chỉ chủ sở hữu (owner_id = auth.uid()) hoặc Admin mới được sửa thông tin công ty. Không được phép đổi owner_id sang người khác.
DROP POLICY IF EXISTS "Employers can update own company" ON public.companies;
CREATE POLICY "Employers can update own company"
ON public.companies FOR UPDATE
USING (auth.uid() = owner_id OR public.is_admin())
WITH CHECK (
    (auth.uid() = owner_id OR public.is_admin())
    AND owner_id = (SELECT c.owner_id FROM public.companies c WHERE c.id = companies.id)
);

-- 4.4. Quyền DELETE: Chỉ chủ sở hữu hoặc Admin
DROP POLICY IF EXISTS "Employers can delete own company" ON public.companies;
CREATE POLICY "Employers can delete own company"
ON public.companies FOR DELETE
USING (auth.uid() = owner_id OR public.is_admin());


-- ==============================================================================
-- STUDENTHUB MIGRATION - SPRINT: HOÀN THIỆN APPLICANT MANAGEMENT CHO EMPLOYER
-- Date: 2026-11-13
-- Description:
-- 1. Bổ sung cột employer_notes vào bảng public.job_applications
-- 2. Cập nhật CHECK constraint status hỗ trợ chuẩn: 'applied', 'reviewing', 'interview', 'accepted', 'rejected'
-- 3. Tạo Index tối ưu hóa truy vấn danh sách ứng viên theo job_id, status, applied_at
-- 4. Hoàn thiện RLS Policies bảo vệ phân quyền chặt chẽ giữa Employer A, Employer B và Student
-- ==============================================================================

-- 1. BỔ SUNG CỘT GHI CHÚ NỘI BỘ (employer_notes)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = 'job_applications' 
          AND column_name = 'employer_notes'
    ) THEN
        ALTER TABLE public.job_applications ADD COLUMN employer_notes TEXT;
    END IF;
END $$;

-- 2. CẬP NHẬT CHECK CONSTRAINT CHO STATUS
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
    CHECK (status IN ('applied', 'pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'hired', 'rejected'));
END $$;

ALTER TABLE public.job_applications ALTER COLUMN status SET DEFAULT 'applied';

-- 3. TẠO INDEXES TỐI ƯU HIỆU NĂNG TRUY VẤN
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_student_id ON public.job_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON public.job_applications(applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_status ON public.job_applications(job_id, status);

-- 4. BẢO MẬT ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Applications viewable by student owner and job employer" ON public.job_applications;
DROP POLICY IF EXISTS "Applications viewable by owner or employer" ON public.job_applications;
DROP POLICY IF EXISTS "job_applications_select_policy" ON public.job_applications;

CREATE POLICY "job_applications_select_policy"
ON public.job_applications FOR SELECT
TO authenticated
USING (
    auth.uid() = student_id
    OR EXISTS (
        SELECT 1 FROM public.jobs
        WHERE jobs.id = job_applications.job_id
          AND jobs.employer_id = auth.uid()
    )
    OR public.is_admin()
);

DROP POLICY IF EXISTS "Students can submit own application" ON public.job_applications;
DROP POLICY IF EXISTS "job_applications_insert_policy" ON public.job_applications;

CREATE POLICY "job_applications_insert_policy"
ON public.job_applications FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = student_id
    AND (public.has_role(auth.uid(), 'student') OR public.is_admin())
);

DROP POLICY IF EXISTS "Employers can update application status for their jobs" ON public.job_applications;
DROP POLICY IF EXISTS "Employers can update applications for own jobs" ON public.job_applications;
DROP POLICY IF EXISTS "Students and Employers can update applications" ON public.job_applications;
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

DROP POLICY IF EXISTS "Students can update own pending applications" ON public.job_applications;
DROP POLICY IF EXISTS "job_applications_student_update_policy" ON public.job_applications;

CREATE POLICY "job_applications_student_update_policy"
ON public.job_applications FOR UPDATE
TO authenticated
USING (
    auth.uid() = student_id
)
WITH CHECK (
    auth.uid() = student_id
    AND status IN ('applied', 'pending')
);

DROP POLICY IF EXISTS "Students can cancel own pending applications" ON public.job_applications;
DROP POLICY IF EXISTS "job_applications_delete_policy" ON public.job_applications;

CREATE POLICY "job_applications_delete_policy"
ON public.job_applications FOR DELETE
TO authenticated
USING (
    (auth.uid() = student_id AND status IN ('applied', 'pending'))
    OR public.is_admin()
);


-- ==============================================================================
-- STUDENTHUB MIGRATION - SPRINT 3.2.1: HARDENING BẢO MẬT & KIỂM SOÁT DỮ LIỆU
-- Date: 2026-11-13
-- Description:
-- A. Tách ghi chú nội bộ sang bảng riêng public.application_notes + RLS bảo mật tuyệt đối
-- B. Trigger khóa cột (BEFORE UPDATE) kiểm soát quyền Student / Employer
-- C. Chuẩn hóa dữ liệu trạng thái, siết CHECK constraint, Trigger máy trạng thái & bảng application_status_history
-- D. Ràng buộc Unique (job_id, student_id) chống nộp trùng lặp
-- ==============================================================================

-- Bảng application_notes
CREATE TABLE IF NOT EXISTS public.application_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_application_notes_app_id ON public.application_notes(application_id);
CREATE INDEX IF NOT EXISTS idx_application_notes_employer_id ON public.application_notes(employer_id);

DROP TRIGGER IF EXISTS set_application_notes_updated_at ON public.application_notes;
CREATE TRIGGER set_application_notes_updated_at
BEFORE UPDATE ON public.application_notes
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

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

        ALTER TABLE public.job_applications DROP COLUMN employer_notes;
    END IF;
END $$;

ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;

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

-- 1. Chuẩn hóa dữ liệu legacy (chạy trước khi tạo trigger)
UPDATE public.job_applications SET status = 'applied' WHERE status IN ('pending', 'new', 'submitted');
UPDATE public.job_applications SET status = 'accepted' WHERE status IN ('hired');
UPDATE public.job_applications SET status = 'interview' WHERE status IN ('shortlisted');

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

-- 2. Trigger Function kiểm soát cập nhật theo Whitelist (to_jsonb)
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
    -- Kết nối trực tiếp DB (SQL Editor / migration / service_role) hoặc Admin: cho qua
    IF uid IS NULL OR public.is_admin() THEN
        RETURN NEW;
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.jobs j
        WHERE j.id = OLD.job_id AND j.employer_id = uid
    ) INTO is_owner;

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

DROP TRIGGER IF EXISTS trg_check_job_application_update ON public.job_applications;
CREATE TRIGGER trg_check_job_application_update
BEFORE UPDATE ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.check_job_application_update();

-- 3. Trigger kiểm soát luồng trạng thái State Machine
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

DROP TRIGGER IF EXISTS trg_validate_application_status_transition ON public.job_applications;
CREATE TRIGGER trg_validate_application_status_transition
BEFORE UPDATE OF status ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.validate_application_status_transition();

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

CREATE OR REPLACE FUNCTION public.record_application_status_history()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.application_status_history (application_id, old_status, new_status, changed_by, changed_at)
        VALUES (NEW.id, NULL, NEW.status, COALESCE(auth.uid(), NEW.student_id), NEW.applied_at);
        RETURN NEW;
    END IF;

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

-- Kiểm tra bản ghi trùng lặp và tạo ràng buộc UNIQUE không nuốt lỗi (KHÔNG TỰ Ý XÓA DỮ LIỆU)
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


-- ==============================================================================
-- STUDENTHUB MIGRATION - SPRINT 3.3: HỆ THỐNG THÔNG BÁO (NOTIFICATION SYSTEM)
-- Date: 2026-11-13
-- Description:
-- 1. Bảng public.notifications + Index tối ưu
-- 2. RLS Policies: User chỉ xem và sửa is_read thông báo của mình, chặn client tự INSERT
-- 3. Trigger tự động 1: Thông báo cho Employer khi có Student nộp đơn mới
-- 4. Trigger tự động 2: Thông báo cho Student khi Employer cập nhật trạng thái đơn
-- ==============================================================================

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

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON public.notifications(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON public.notifications(user_id, created_at DESC);

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_policy" ON public.notifications;
CREATE POLICY "notifications_select_policy"
ON public.notifications FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id 
    OR public.is_admin()
);

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

-- Phân quyền mức cột: Chỉ cấp quyền UPDATE cột is_read cho authenticated role
REVOKE UPDATE ON public.notifications FROM authenticated;
GRANT UPDATE (is_read) ON public.notifications TO authenticated;

CREATE OR REPLACE FUNCTION public.notify_employer_new_application()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    job_rec RECORD;
    student_name TEXT;
BEGIN
    SELECT title, employer_id INTO job_rec 
    FROM public.jobs 
    WHERE id = NEW.job_id;

    SELECT full_name INTO student_name 
    FROM public.profiles 
    WHERE id = NEW.student_id;

    student_name := COALESCE(student_name, 'Một sinh viên');

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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_new_application ON public.job_applications;
CREATE TRIGGER trg_notify_new_application
AFTER INSERT ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.notify_employer_new_application();

CREATE OR REPLACE FUNCTION public.notify_student_status_changed()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    job_title TEXT;
    notify_title TEXT := 'Cập nhật tiến trình ứng tuyển';
    notify_msg TEXT;
BEGIN
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_application_status_changed ON public.job_applications;
CREATE TRIGGER trg_notify_application_status_changed
AFTER UPDATE OF status ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.notify_student_status_changed();


-- ==============================================================================
-- STUDENTHUB MIGRATION - SPRINT 3.4: DASHBOARD THỐNG KÊ (DASHBOARD ANALYTICS)
-- Date: 2026-11-13
-- Description:
-- 1. Index tối ưu hóa truy vấn thống kê, phễu tuyển dụng & timeline
-- 2. RPC get_student_dashboard_stats(): Thống kê sinh viên (đơn nộp, phân bổ trạng thái, thông báo chưa đọc)
-- 3. RPC get_employer_dashboard_stats(p_days): Thống kê tuyển dụng (Job, ứng viên, phễu chuyển đổi, timeline 7/30/90 ngày)
-- 4. RPC get_admin_dashboard_stats(): Thống kê quản trị (chỉ Admin, kiểm tra bằng is_admin())
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at 
ON public.job_applications(applied_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_applications_job_applied 
ON public.job_applications(job_id, applied_at DESC);

CREATE INDEX IF NOT EXISTS idx_jobs_employer_status 
ON public.jobs(employer_id, status);

CREATE INDEX IF NOT EXISTS idx_status_history_app_new_status 
ON public.application_status_history(application_id, new_status);

CREATE OR REPLACE FUNCTION public.get_student_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    uid UUID := auth.uid();
    total_apps INT := 0;
    unread_notifs INT := 0;
    st_dist JSONB;
BEGIN
    IF uid IS NULL THEN
        RAISE EXCEPTION 'Yêu cầu đăng nhập để xem thống kê sinh viên.';
    END IF;

    SELECT COUNT(*) INTO total_apps
    FROM public.job_applications
    WHERE student_id = uid;

    SELECT jsonb_build_object(
        'applied', COUNT(*) FILTER (WHERE status = 'applied'),
        'reviewing', COUNT(*) FILTER (WHERE status = 'reviewing'),
        'interview', COUNT(*) FILTER (WHERE status = 'interview'),
        'accepted', COUNT(*) FILTER (WHERE status = 'accepted'),
        'rejected', COUNT(*) FILTER (WHERE status = 'rejected')
    ) INTO st_dist
    FROM public.job_applications
    WHERE student_id = uid;

    SELECT COUNT(*) INTO unread_notifs
    FROM public.notifications
    WHERE user_id = uid AND is_read = false;

    RETURN jsonb_build_object(
        'total_applications', total_apps,
        'status_distribution', COALESCE(st_dist, '{}'::jsonb),
        'unread_notifications', unread_notifs
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_employer_dashboard_stats(p_days INT DEFAULT 7)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    uid UUID := auth.uid();
    tot_jobs INT := 0;
    act_jobs INT := 0;
    tot_applicants INT := 0;
    new_applicants_7d INT := 0;
    st_dist JSONB;
    funnel_data JSONB;
    timeline_data JSONB;
    
    cnt_applied INT := 0;
    cnt_reviewing INT := 0;
    cnt_interview INT := 0;
    cnt_accepted INT := 0;
    cnt_rejected INT := 0;
    
    rate_app_rev NUMERIC := 0.0;
    rate_rev_int NUMERIC := 0.0;
    rate_int_acc NUMERIC := 0.0;
    rate_overall NUMERIC := 0.0;
    days_limit INT := 7;
BEGIN
    IF uid IS NULL THEN
        RAISE EXCEPTION 'Yêu cầu đăng nhập để xem thống kê nhà tuyển dụng.';
    END IF;

    days_limit := CASE WHEN p_days IN (7, 30, 90) THEN p_days ELSE 7 END;

    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'published')
    INTO tot_jobs, act_jobs
    FROM public.jobs
    WHERE employer_id = uid;

    SELECT 
        COUNT(ja.id),
        COUNT(ja.id) FILTER (WHERE ja.applied_at >= (NOW() - INTERVAL '7 days'))
    INTO tot_applicants, new_applicants_7d
    FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    WHERE j.employer_id = uid;

    SELECT jsonb_build_object(
        'applied', COUNT(*) FILTER (WHERE ja.status = 'applied'),
        'reviewing', COUNT(*) FILTER (WHERE ja.status = 'reviewing'),
        'interview', COUNT(*) FILTER (WHERE ja.status = 'interview'),
        'accepted', COUNT(*) FILTER (WHERE ja.status = 'accepted'),
        'rejected', COUNT(*) FILTER (WHERE ja.status = 'rejected')
    ) INTO st_dist
    FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    WHERE j.employer_id = uid;

    SELECT COUNT(DISTINCT ja.id) INTO cnt_applied
    FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    WHERE j.employer_id = uid;

    SELECT COUNT(DISTINCT ja.id) INTO cnt_reviewing
    FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    WHERE j.employer_id = uid
      AND (
          ja.status IN ('reviewing', 'interview', 'accepted')
          OR EXISTS (
              SELECT 1 FROM public.application_status_history ash
              WHERE ash.application_id = ja.id AND ash.new_status = 'reviewing'
          )
      );

    SELECT COUNT(DISTINCT ja.id) INTO cnt_interview
    FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    WHERE j.employer_id = uid
      AND (
          ja.status IN ('interview', 'accepted')
          OR EXISTS (
              SELECT 1 FROM public.application_status_history ash
              WHERE ash.application_id = ja.id AND ash.new_status = 'interview'
          )
      );

    SELECT COUNT(DISTINCT ja.id) INTO cnt_accepted
    FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    WHERE j.employer_id = uid
      AND (
          ja.status = 'accepted'
          OR EXISTS (
              SELECT 1 FROM public.application_status_history ash
              WHERE ash.application_id = ja.id AND ash.new_status = 'accepted'
          )
      );

    SELECT COUNT(DISTINCT ja.id) INTO cnt_rejected
    FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    WHERE j.employer_id = uid
      AND ja.status = 'rejected';

    IF cnt_applied > 0 THEN
        rate_app_rev := ROUND((cnt_reviewing::numeric / cnt_applied::numeric) * 100, 1);
        rate_overall := ROUND((cnt_accepted::numeric / cnt_applied::numeric) * 100, 1);
    END IF;

    IF cnt_reviewing > 0 THEN
        rate_rev_int := ROUND((cnt_interview::numeric / cnt_reviewing::numeric) * 100, 1);
    END IF;

    IF cnt_interview > 0 THEN
        rate_int_acc := ROUND((cnt_accepted::numeric / cnt_interview::numeric) * 100, 1);
    END IF;

    funnel_data := jsonb_build_object(
        'applied', cnt_applied,
        'reviewing', cnt_reviewing,
        'interview', cnt_interview,
        'accepted', cnt_accepted,
        'rejected', cnt_rejected,
        'rates', jsonb_build_object(
            'applied_to_reviewing', rate_app_rev,
            'reviewing_to_interview', rate_rev_int,
            'interview_to_accepted', rate_int_acc,
            'overall', rate_overall
        )
    );

    SELECT jsonb_agg(
        jsonb_build_object(
            'date', to_char(d.day, 'YYYY-MM-DD'),
            'label', to_char(d.day, 'DD/MM'),
            'count', COALESCE(cnt.c, 0)
        ) ORDER BY d.day ASC
    ) INTO timeline_data
    FROM (
        SELECT generate_series(
            CURRENT_DATE - (days_limit - 1) * INTERVAL '1 day',
            CURRENT_DATE,
            INTERVAL '1 day'
        )::date AS day
    ) d
    LEFT JOIN (
        SELECT 
            ja.applied_at::date AS app_date,
            COUNT(*) AS c
        FROM public.job_applications ja
        JOIN public.jobs j ON j.id = ja.job_id
        WHERE j.employer_id = uid
        GROUP BY ja.applied_at::date
    ) cnt ON cnt.app_date = d.day;

    RETURN jsonb_build_object(
        'total_jobs', tot_jobs,
        'active_jobs', act_jobs,
        'total_applicants', tot_applicants,
        'new_applicants_7d', new_applicants_7d,
        'status_distribution', COALESCE(st_dist, '{}'::jsonb),
        'funnel', funnel_data,
        'timeline', COALESCE(timeline_data, '[]'::jsonb)
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Chỉ Quản trị viên (Admin) mới có quyền truy cập thống kê hệ thống.';
    END IF;

    RETURN jsonb_build_object(
        'total_students', (SELECT COUNT(*) FROM public.profiles WHERE role = 'student'),
        'total_employers', (SELECT COUNT(*) FROM public.profiles WHERE role = 'employer'),
        'total_jobs', (SELECT COUNT(*) FROM public.jobs),
        'total_applications', (SELECT COUNT(*) FROM public.job_applications)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_student_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_employer_dashboard_stats(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated;


-- ==============================================================================
-- STUDENTHUB MIGRATION - SPRINT 4: ĐÁNH GIÁ 2 CHIỀU & PHÂN HỆ ADMIN
-- Date: 2026-11-13
-- Description:
-- 1. Bổ sung cột is_active cho bảng profiles (hỗ trợ Admin khóa/mở tài khoản)
-- 2. Cập nhật CHECK constraint cho cột status trên bảng jobs (hỗ trợ 'rejected')
-- 3. Tạo bảng reviews (Đánh giá uy tín 2 chiều giữa Sinh viên & Doanh nghiệp)
-- 4. RPC get_user_rating_summary(): Tính điểm sao trung bình và số lượng đánh giá
-- 5. Thiết lập RLS policies cho bảng reviews
-- ==============================================================================

-- ==============================================================================
-- 1. BỔ SUNG CỘT is_active CHO BẢNG profiles
-- ==============================================================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;


-- ==============================================================================
-- 2. CẬP NHẬT RÀNG BUỘC STATUS CHO BẢNG jobs (CHO PHÉP 'rejected')
-- ==============================================================================
DO $$
BEGIN
    -- Xóa constraint cũ nếu có
    ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
    
    -- Thêm constraint mới hỗ trợ đầy đủ các trạng thái của tin tuyển dụng
    ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check 
    CHECK (status IN ('published', 'active', 'closed', 'draft', 'expired', 'pending_approval', 'rejected'));
EXCEPTION
    WHEN others THEN NULL;
END $$;


-- ==============================================================================
-- 3. TẠO BẢNG reviews: ĐÁNH GIÁ UY TÍN 2 CHIỀU
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating_score INT NOT NULL CHECK (rating_score BETWEEN 1 AND 5),
    comment TEXT DEFAULT '',
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_job_reviewer_reviewee UNIQUE(job_id, reviewer_id, reviewee_id),
    CONSTRAINT chk_reviewer_not_reviewee CHECK (reviewer_id <> reviewee_id)
);

-- Index tối ưu hóa truy vấn đánh giá
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_id, rating_score);
CREATE INDEX IF NOT EXISTS idx_reviews_job ON public.reviews(job_id);


-- ==============================================================================
-- 4. RPC: TÍNH ĐIỂM SAO TRUNG BÌNH & SỐ LƯỢNG ĐÁNH GIÁ
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_user_rating_summary(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    tot_reviews INT := 0;
    avg_score NUMERIC := 0.0;
    star_dist JSONB;
BEGIN
    SELECT 
        COUNT(*),
        COALESCE(ROUND(AVG(rating_score)::numeric, 1), 0.0)
    INTO tot_reviews, avg_score
    FROM public.reviews
    WHERE reviewee_id = p_user_id;

    SELECT jsonb_build_object(
        'star_5', COUNT(*) FILTER (WHERE rating_score = 5),
        'star_4', COUNT(*) FILTER (WHERE rating_score = 4),
        'star_3', COUNT(*) FILTER (WHERE rating_score = 3),
        'star_2', COUNT(*) FILTER (WHERE rating_score = 2),
        'star_1', COUNT(*) FILTER (WHERE rating_score = 1)
    ) INTO star_dist
    FROM public.reviews
    WHERE reviewee_id = p_user_id;

    RETURN jsonb_build_object(
        'user_id', p_user_id,
        'total_reviews', tot_reviews,
        'rating_avg', avg_score,
        'stars_distribution', COALESCE(star_dist, '{}'::jsonb)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_rating_summary(UUID) TO authenticated, anon;


-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES CHO BẢNG reviews
-- ==============================================================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 5.1. Quyền SELECT: Mọi người đều có thể đọc đánh giá để tham khảo uy tín đối tác
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone"
ON public.reviews FOR SELECT
USING (true);

-- 5.2. Quyền INSERT: Chỉ người dùng đã đăng nhập, tự đánh giá cho chính mình
-- VÀ phải có quan hệ làm việc với đối tác (đơn ứng tuyển đạt trạng thái 'accepted')
DROP POLICY IF EXISTS "Users can insert reviews for completed jobs" ON public.reviews;
CREATE POLICY "Users can insert reviews for completed jobs"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = reviewer_id
    AND reviewer_id <> reviewee_id
    AND (
        -- Trường hợp 1: Sinh viên đánh giá Nhà tuyển dụng
        EXISTS (
            SELECT 1 FROM public.job_applications ja
            JOIN public.jobs j ON j.id = ja.job_id
            WHERE ja.job_id = reviews.job_id
              AND ja.student_id = auth.uid()
              AND j.employer_id = reviews.reviewee_id
              AND ja.status = 'accepted'
        )
        -- Trường hợp 2: Nhà tuyển dụng đánh giá Sinh viên
        OR EXISTS (
            SELECT 1 FROM public.job_applications ja
            JOIN public.jobs j ON j.id = ja.job_id
            WHERE ja.job_id = reviews.job_id
              AND j.employer_id = auth.uid()
              AND ja.student_id = reviews.reviewee_id
              AND ja.status = 'accepted'
        )
        -- Trường hợp 3: Admin
        OR public.is_admin()
    )
);

-- 5.3. Quyền UPDATE: Chỉ chính người viết đánh giá mới được cập nhật nhận xét của mình
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews"
ON public.reviews FOR UPDATE
TO authenticated
USING (auth.uid() = reviewer_id OR public.is_admin());

-- 5.4. Quyền DELETE: Chỉ người viết hoặc Admin mới được xóa đánh giá
DROP POLICY IF EXISTS "Users or admins can delete reviews" ON public.reviews;
CREATE POLICY "Users or admins can delete reviews"
ON public.reviews FOR DELETE
TO authenticated
USING (auth.uid() = reviewer_id OR public.is_admin());


-- ==============================================================================
-- 6. CẬP NHẬT TRIGGER TỰ ĐỘNG CẬP NHẬT updated_at TRÊN reviews
-- ==============================================================================
DROP TRIGGER IF EXISTS set_reviews_updated_at ON public.reviews;
CREATE TRIGGER set_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
