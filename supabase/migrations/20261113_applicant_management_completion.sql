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
-- Hỗ trợ đầy đủ: 'applied', 'pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'hired', 'rejected'
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

-- Đặt giá trị mặc định cho status là 'applied' (hoặc 'pending')
ALTER TABLE public.job_applications ALTER COLUMN status SET DEFAULT 'applied';

-- 3. TẠO INDEXES TỐI ƯU HIỆU NĂNG TRUY VẤN
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_student_id ON public.job_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON public.job_applications(applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_status ON public.job_applications(job_id, status);

-- 4. BẢO MẬT ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- 4.1 Quyền XEM (SELECT):
-- - Employer CHỈ ĐƯỢC XEM hồ sơ ứng tuyển của các Job do chính mình đăng tuyển.
-- - Student chỉ được xem hồ sơ của chính mình.
-- - Admin xem được toàn bộ.
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

-- 4.2 Quyền TẠO (INSERT):
-- - Chỉ Student (hoặc user đã xác thực) nộp đơn cho chính mình (auth.uid() = student_id)
DROP POLICY IF EXISTS "Students can submit own application" ON public.job_applications;
DROP POLICY IF EXISTS "job_applications_insert_policy" ON public.job_applications;

CREATE POLICY "job_applications_insert_policy"
ON public.job_applications FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = student_id
    AND (public.has_role(auth.uid(), 'student') OR public.is_admin())
);

-- 4.3 Quyền CẬP NHẬT (UPDATE) CHO EMPLOYER:
-- - Employer chỉ được phép cập nhật status và employer_notes cho các application thuộc Job mà mình sở hữu.
-- - Employer A TUYỆT ĐỐI KHÔNG THỂ cập nhật application của Employer B.
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

-- 4.4 Quyền CẬP NHẬT (UPDATE) CHO STUDENT:
-- - Student CHỈ ĐƯỢC cập nhật khi đơn còn ở trạng thái 'applied' hoặc 'pending'
-- - Student KHÔNG ĐƯỢC PHÉP tự ý chuyển đổi status sang 'reviewing', 'interview', 'accepted', 'rejected'
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

-- 4.5 Quyền XÓA / HỦY ĐƠN (DELETE):
-- - Student có quyền rút đơn ứng tuyển nếu đơn chưa được duyệt ('applied' hoặc 'pending')
-- - Admin có quyền quản trị xóa record
DROP POLICY IF EXISTS "Students can cancel own pending applications" ON public.job_applications;
DROP POLICY IF EXISTS "job_applications_delete_policy" ON public.job_applications;

CREATE POLICY "job_applications_delete_policy"
ON public.job_applications FOR DELETE
TO authenticated
USING (
    (auth.uid() = student_id AND status IN ('applied', 'pending'))
    OR public.is_admin()
);
