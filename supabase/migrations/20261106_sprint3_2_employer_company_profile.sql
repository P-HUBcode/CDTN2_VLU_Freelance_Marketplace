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
