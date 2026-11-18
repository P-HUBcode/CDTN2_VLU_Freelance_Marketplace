-- ==============================================================================
-- STUDENTHUB - SCRIPT TẠO 5 TÀI KHOẢN TEST TRONG SUPABASE AUTH & DATABASE
-- Mật khẩu chung cho cả 5 tài khoản: Password123!
-- Danh sách tài khoản:
-- 1. Student A:  student.a@test.vn   (UUID: 11111111-1111-1111-1111-111111111111)
-- 2. Student B:  student.b@test.vn   (UUID: 22222222-2222-2222-2222-222222222222)
-- 3. Employer A: employer.a@test.vn  (UUID: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa)
-- 4. Employer B: employer.b@test.vn  (UUID: bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb)
-- 5. Admin:      admin@test.vn       (UUID: cccccccc-cccc-cccc-cccc-cccccccccccc)
-- Chạy script này trong Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- Bật extension pgcrypto nếu chưa có
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Tạo 5 tài khoản trong auth.users với email đã xác thực
DO $$
DECLARE
    pwd_hash TEXT := crypt('Password123!', gen_salt('bf'));
    uid_st_a UUID := '11111111-1111-1111-1111-111111111111';
    uid_st_b UUID := '22222222-2222-2222-2222-222222222222';
    uid_emp_a UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    uid_emp_b UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    uid_admin UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
BEGIN
    -- Student A
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000', uid_st_a, 'authenticated', 'authenticated',
        'student.a@test.vn', pwd_hash, NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"role":"student","full_name":"Nguyễn Văn A (Student A)","university":"Đại học UEH","major":"Marketing"}'::jsonb,
        NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET 
        encrypted_password = EXCLUDED.encrypted_password,
        email_confirmed_at = NOW();

    -- Student B
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000', uid_st_b, 'authenticated', 'authenticated',
        'student.b@test.vn', pwd_hash, NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"role":"student","full_name":"Trần Thị B (Student B)","university":"Đại học Bách Khoa","major":"Công nghệ thông tin"}'::jsonb,
        NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET 
        encrypted_password = EXCLUDED.encrypted_password,
        email_confirmed_at = NOW();

    -- Employer A
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000', uid_emp_a, 'authenticated', 'authenticated',
        'employer.a@test.vn', pwd_hash, NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"role":"employer","full_name":"HR Manager Công ty A","company_name":"Công ty Cổ phần Công nghệ A"}'::jsonb,
        NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET 
        encrypted_password = EXCLUDED.encrypted_password,
        email_confirmed_at = NOW();

    -- Employer B
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000', uid_emp_b, 'authenticated', 'authenticated',
        'employer.b@test.vn', pwd_hash, NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"role":"employer","full_name":"Tuyển dụng Công ty B","company_name":"Tập đoàn Giải pháp B"}'::jsonb,
        NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET 
        encrypted_password = EXCLUDED.encrypted_password,
        email_confirmed_at = NOW();

    -- Admin
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000', uid_admin, 'authenticated', 'authenticated',
        'admin@test.vn', pwd_hash, NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"role":"admin","full_name":"Quản trị viên Hệ thống (Admin)"}'::jsonb,
        NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET 
        encrypted_password = EXCLUDED.encrypted_password,
        email_confirmed_at = NOW();

    RAISE NOTICE '>>> [SEED AUTH]: Đã khởi tạo 5 tài khoản đăng nhập thành công!';
END $$;

-- 2. Đồng bộ public.profiles và public.companies
INSERT INTO public.profiles (id, full_name, email, role, phone)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Nguyễn Văn A (Student A)', 'student.a@test.vn', 'student', '0901111111'),
    ('22222222-2222-2222-2222-222222222222', 'Trần Thị B (Student B)', 'student.b@test.vn', 'student', '0902222222'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'HR Manager Công ty A', 'employer.a@test.vn', 'employer', '0903333333'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tuyển dụng Công ty B', 'employer.b@test.vn', 'employer', '0904444444'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Quản trị viên Hệ thống (Admin)', 'admin@test.vn', 'admin', '0905555555')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

INSERT INTO public.student_profiles (user_id, university, major, cv_url, is_public)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Đại học UEH', 'Marketing', '11111111-1111-1111-1111-111111111111/cv_student_a.pdf', false),
    ('22222222-2222-2222-2222-222222222222', 'Đại học Bách Khoa', 'Công nghệ thông tin', '22222222-2222-2222-2222-222222222222/cv_student_b.pdf', false)
ON CONFLICT (user_id) DO UPDATE SET university = EXCLUDED.university;

INSERT INTO public.companies (id, owner_id, company_name)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Công ty Cổ phần Công nghệ A'),
    ('b0000000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tập đoàn Giải pháp B')
ON CONFLICT DO NOTHING;

-- 3. Tạo 1 Job của Employer A và 1 đơn ứng tuyển của Student A
INSERT INTO public.jobs (id, employer_id, company_id, title, description, status)
VALUES (
    'a1111111-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'a0000000-0000-0000-0000-000000000001',
    'React 19 Frontend Developer',
    'Tuyển dụng sinh viên lập trình Frontend',
    'published'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.job_applications (id, job_id, student_id, cover_letter, cv_url, status)
VALUES (
    'c1111111-0000-0000-0000-000000000001',
    'a1111111-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Em xin ứng tuyển vị trí React Developer',
    '11111111-1111-1111-1111-111111111111/cv_student_a.pdf',
    'applied'
)
ON CONFLICT (job_id, student_id) DO NOTHING;

-- 4. Thông báo mẫu cho Student A
INSERT INTO public.notifications (user_id, type, title, message, is_read)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'system_message',
    'Chào mừng bạn đến với StudentHub',
    'Hồ sơ của bạn đã được khởi tạo thành công.',
    false
)
ON CONFLICT DO NOTHING;
