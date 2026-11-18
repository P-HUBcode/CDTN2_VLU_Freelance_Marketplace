-- ==============================================================================
-- BỘ KIỂM THỬ BẢO MẬT CHUYÊN SÂU - SPRINT 3.2.3 (PROFILES, CV STORAGE & PRIVILEGE)
-- Date: 2026-11-13
-- Chạy an toàn trong Transaction (BEGIN ... ROLLBACK) không ảnh hưởng dữ liệu thật.
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- BƯỚC 0: THIẾT LẬP DỮ LIỆU KIỂM THỬ GIẢ LẬP
-- ==============================================================================
DO $$
DECLARE
    uid_student_a UUID := '11111111-1111-1111-1111-111111111111';
    uid_student_b UUID := '22222222-2222-2222-2222-222222222222';
    uid_employer_a UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    uid_employer_b UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    uid_admin UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc';

    job_a1 UUID := 'a1111111-0000-0000-0000-000000000001';
    app_1 UUID := 'c1111111-0000-0000-0000-000000000001';
BEGIN
    -- 1. Profiles cơ bản
    INSERT INTO public.profiles (id, full_name, email, role, phone)
    VALUES 
        (uid_student_a, 'Sinh viên A', 'student.a@test.vn', 'student', '0901111111'),
        (uid_student_b, 'Sinh viên B', 'student.b@test.vn', 'student', '0902222222'),
        (uid_employer_a, 'Công ty A', 'employer.a@test.vn', 'employer', '0903333333'),
        (uid_employer_b, 'Công ty B', 'employer.b@test.vn', 'employer', '0904444444'),
        (uid_admin, 'Quản trị viên', 'admin@test.vn', 'admin', '0905555555')
    ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, email = EXCLUDED.email;

    -- 2. student_profiles (Mặc định is_public = false)
    INSERT INTO public.student_profiles (user_id, university, major, cv_url, is_public)
    VALUES 
        (uid_student_a, 'UEH', 'Marketing', '11111111-1111-1111-1111-111111111111/cv_a.pdf', false),
        (uid_student_b, 'Bách Khoa', 'IT', '22222222-2222-2222-2222-222222222222/cv_b.pdf', false)
    ON CONFLICT (user_id) DO UPDATE SET is_public = EXCLUDED.is_public;

    -- 3. Jobs: Employer A đăng Job A1
    INSERT INTO public.jobs (id, employer_id, title, description, status)
    VALUES (job_a1, uid_employer_a, 'React 19 Developer', 'Part-time', 'published')
    ON CONFLICT (id) DO NOTHING;

    -- 4. Application: Student A nộp vào Job A1 (Employer A)
    INSERT INTO public.job_applications (id, job_id, student_id, cover_letter, cv_url, status)
    VALUES (app_1, job_a1, uid_student_a, 'Đơn của Student A', '11111111-1111-1111-1111-111111111111/cv_a.pdf', 'applied')
    ON CONFLICT (job_id, student_id) DO NOTHING;

    RAISE NOTICE '>>> [SETUP]: Dữ liệu kiểm thử đã sẵn sàng.';
END $$;


-- ==============================================================================
-- TEST CASE 1: Student A cố tình INSERT profile mới với role = 'admin' (Privilege Escalation)
-- Kỳ vọng: Trigger chặn đứng với ngoại lệ
-- ==============================================================================
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

DO $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES ('99999999-9999-9999-9999-999999999999', 'Hacker', 'hacker@test.vn', 'admin');

    RAISE EXCEPTION '>>> TC 1 [FAIL]: Lỗ hổng! Non-admin INSERT được role = admin!';
EXCEPTION
    WHEN others THEN
        IF SQLERRM LIKE '%Bạn không có quyền tạo tài khoản với vai trò Quản trị viên%' THEN
            RAISE NOTICE '>>> TC 1 [PASS]: Non-admin tự tạo role = admin bị chặn chuẩn xác: %', SQLERRM;
        ELSE
            RAISE EXCEPTION '>>> TC 1 [FAIL]: Lỗi không khớp: %', SQLERRM;
        END IF;
END $$;


-- ==============================================================================
-- TEST CASE 2: Student A cố tình UPDATE role = 'admin' trên profile chính mình
-- Kỳ vọng: Trigger chặn đứng
-- ==============================================================================
DO $$
BEGIN
    UPDATE public.profiles SET role = 'admin' WHERE id = '11111111-1111-1111-1111-111111111111';
    RAISE EXCEPTION '>>> TC 2 [FAIL]: Lỗ hổng! User UPDATE được role = admin!';
EXCEPTION
    WHEN others THEN
        IF SQLERRM LIKE '%Bạn không có quyền tự thay đổi vai trò%' THEN
            RAISE NOTICE '>>> TC 2 [PASS]: User tự sửa role = admin bị chặn chuẩn xác: %', SQLERRM;
        ELSE
            RAISE EXCEPTION '>>> TC 2 [FAIL]: Lỗi không khớp: %', SQLERRM;
        END IF;
END $$;


-- ==============================================================================
-- TEST CASE 3: Bảo vệ thông tin nhạy cảm (email, phone) trên profiles
-- Student B (người lạ) truy vấn profiles của Student A
-- Kỳ vọng: Policy RLS chỉ cho phép xem thông tin nếu có quan hệ tuyển dụng hoặc chính chủ.
-- Với Student B, truy vấn profiles của Student A phải trả về 0 rows!
-- ==============================================================================
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);

DO $$
DECLARE
    cnt INT;
BEGIN
    SELECT COUNT(*) INTO cnt 
    FROM public.profiles 
    WHERE id = '11111111-1111-1111-1111-111111111111';

    IF cnt = 0 THEN
        RAISE NOTICE '>>> TC 3 [PASS]: Student B hoàn toàn không đọc được profile/email/phone của Student A (0 rows).';
    ELSE
        RAISE EXCEPTION '>>> TC 3 [FAIL]: Lỗ hổng lộ thông tin cá nhân! Student B đọc được profile Student A (% rows)!', cnt;
    END IF;
END $$;


-- ==============================================================================
-- TEST CASE 4: Employer A xem profile của Student A (Đã nộp đơn vào Job A1)
-- Kỳ vọng: THÀNH CÔNG (1 row) vì Student A là ứng viên hợp lệ của Employer A
-- ==============================================================================
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', true);

DO $$
DECLARE
    cnt INT;
    st_email TEXT;
BEGIN
    SELECT COUNT(*), MAX(email) INTO cnt, st_email
    FROM public.profiles 
    WHERE id = '11111111-1111-1111-1111-111111111111';

    IF cnt = 1 AND st_email = 'student.a@test.vn' THEN
        RAISE NOTICE '>>> TC 4 [PASS]: Employer A đọc được hồ sơ ứng viên Student A hợp lệ (email: %).', st_email;
    ELSE
        RAISE EXCEPTION '>>> TC 4 [FAIL]: Employer A không đọc được hồ sơ ứng viên hợp lệ!';
    END IF;
END $$;


-- ==============================================================================
-- TEST CASE 5: Employer B xem profile của Student A (Student A KHÔNG nộp vào Job B)
-- Kỳ vọng: BỊ CHẶN (0 rows)
-- ==============================================================================
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}', true);

DO $$
DECLARE
    cnt INT;
BEGIN
    SELECT COUNT(*) INTO cnt 
    FROM public.profiles 
    WHERE id = '11111111-1111-1111-1111-111111111111';

    IF cnt = 0 THEN
        RAISE NOTICE '>>> TC 5 [PASS]: Employer B hoàn toàn bị chặn khi xem profile Student A (0 rows).';
    ELSE
        RAISE EXCEPTION '>>> TC 5 [FAIL]: Lỗ hổng! Employer B đọc được hồ sơ ứng viên của Employer A!';
    END IF;
END $$;


-- ==============================================================================
-- TEST CASE 6: Kiểm tra cờ is_public trên student_profiles
-- Khi is_public = false -> Employer B không thấy (0 rows)
-- Khi Student A bật is_public = true -> Người ngoài (Employer B) đọc được (1 row)
-- ==============================================================================
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}', true);

DO $$
DECLARE
    cnt_before INT;
    cnt_after INT;
BEGIN
    -- Trước khi bật is_public
    SELECT COUNT(*) INTO cnt_before
    FROM public.student_profiles
    WHERE user_id = '11111111-1111-1111-1111-111111111111';

    -- Student A bật is_public = true (mô phỏng)
    UPDATE public.student_profiles SET is_public = true WHERE user_id = '11111111-1111-1111-1111-111111111111';

    -- Sau khi bật is_public
    SELECT COUNT(*) INTO cnt_after
    FROM public.student_profiles
    WHERE user_id = '11111111-1111-1111-1111-111111111111';

    IF cnt_before = 0 AND cnt_after = 1 THEN
        RAISE NOTICE '>>> TC 6 [PASS]: Cờ is_public hoạt động chuẩn xác: trước = % rows, sau khi công khai = % rows.', cnt_before, cnt_after;
    ELSE
        RAISE EXCEPTION '>>> TC 6 [FAIL]: Lỗi cờ is_public! Trước = %, Sau = %', cnt_before, cnt_after;
    END IF;
END $$;


-- ==============================================================================
-- TEST CASE 7: Data Migration chuẩn hóa cv_url
-- ==============================================================================
DO $$
DECLARE
    test_url TEXT := 'https://your-project.supabase.co/storage/v1/object/public/cv/11111111-1111-1111-1111-111111111111/my_cv.pdf';
    clean_path TEXT;
BEGIN
    clean_path := regexp_replace(test_url, '^https?://[^/]+/storage/v1/object/(?:public|sign)/cv/', '');
    IF clean_path = '11111111-1111-1111-1111-111111111111/my_cv.pdf' THEN
        RAISE NOTICE '>>> TC 7 [PASS]: Data migration chuẩn hóa cv_url chuẩn xác: % -> %', test_url, clean_path;
    ELSE
        RAISE EXCEPTION '>>> TC 7 [FAIL]: Chuẩn hóa regex cv_url thất bại: %', clean_path;
    END IF;
END $$;

RAISE NOTICE '========================================================================';
RAISE NOTICE '>>> TẤT CẢ 7 TEST CASES BẢO MẬT SPRINT 3.2.3 ĐỀU ĐẠT CHUẨN [PASS]!';
RAISE NOTICE '========================================================================';

ROLLBACK;
