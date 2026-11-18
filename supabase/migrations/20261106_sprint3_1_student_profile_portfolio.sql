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
        ALTER TABLE public.student_profiles ADD COLUMN skills TEXT[] DEFAULT '{}';
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
    technologies TEXT[] DEFAULT '{}',
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
