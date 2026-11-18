-- ==============================================================================
-- BỘ KIỂM THỬ THỐNG KÊ & PHỄU CHUYỂN ĐỔI - SPRINT 3.4 (DASHBOARD STATS)
-- Date: 2026-11-13
-- Chạy an toàn trong Transaction (BEGIN ... ROLLBACK) không ảnh hưởng dữ liệu thật.
-- Kiểm chứng 4 mục tiêu cốt lõi:
-- 1. Số liệu Student Stats khớp 100% với đếm tay trong DB.
-- 2. Employer B KHÔNG THẤY số liệu của Employer A (cô lập dữ liệu hoàn toàn).
-- 3. Phễu chuyển đổi (Recruitment Funnel) tính chuẩn xác các bước và tỷ lệ %.
-- 4. Admin RPC get_admin_dashboard_stats() từ chối non-admin và chỉ mở cho Admin thật.
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
    job_a2 UUID := 'a1111111-0000-0000-0000-000000000002';
    job_b1 UUID := 'b1111111-0000-0000-0000-000000000001';

    app_1 UUID := 'c1111111-0000-0000-0000-000000000001';
    app_2 UUID := 'c1111111-0000-0000-0000-000000000002';
BEGIN
    -- 1. Profiles
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES 
        (uid_student_a, 'Sinh viên A', 'student.a@test.vn', 'student'),
        (uid_student_b, 'Sinh viên B', 'student.b@test.vn', 'student'),
        (uid_employer_a, 'Công ty A', 'employer.a@test.vn', 'employer'),
        (uid_employer_b, 'Công ty B', 'employer.b@test.vn', 'employer'),
        (uid_admin, 'Quản trị viên', 'admin@test.vn', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

    -- 2. Jobs: Employer A có 2 jobs, Employer B có 1 job
    INSERT INTO public.jobs (id, employer_id, title, description, status)
    VALUES 
        (job_a1, uid_employer_a, 'React Developer', 'Tuyển React 19', 'published'),
        (job_a2, uid_employer_a, 'UI Designer', 'Tuyển Figma Designer', 'published'),
        (job_b1, uid_employer_b, 'Node.js Developer', 'Tuyển Backend', 'published')
    ON CONFLICT (id) DO NOTHING;

    -- 3. Applications: Student A nộp vào Job A1, Student B nộp vào Job A1 (Đều thuộc Employer A!)
    -- Employer B KHÔNG CÓ ứng viên nào!
    INSERT INTO public.job_applications (id, job_id, student_id, cover_letter, status, applied_at)
    VALUES 
        (app_1, job_a1, uid_student_a, 'Đơn của Student A', 'applied', NOW()),
        (app_2, job_a1, uid_student_b, 'Đơn của Student B', 'applied', NOW() - INTERVAL '2 days')
    ON CONFLICT (job_id, student_id) DO UPDATE SET status = 'applied';

    -- 4. Thông báo: Student A có 2 thông báo chưa đọc
    INSERT INTO public.notifications (user_id, type, title, message, is_read)
    VALUES 
        (uid_student_a, 'system_message', 'Thông báo 1', 'Nội dung 1', false),
        (uid_student_a, 'system_message', 'Thông báo 2', 'Nội dung 2', false),
        (uid_student_a, 'system_message', 'Thông báo 3', 'Nội dung 3 (đã đọc)', true)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '>>> [SETUP STATS]: Dữ liệu mẫu kiểm thử thống kê đã chuẩn bị xong.';
END $$;


-- ==============================================================================
-- TEST CASE 1: Sinh viên A gọi get_student_dashboard_stats()
-- Kỳ vọng: Tổng đơn = 1, Đã nộp = 1, Chưa đọc = 2
-- ==============================================================================
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

DO $$
DECLARE
    stats JSONB;
    tot_apps INT;
    unread_cnt INT;
    applied_st INT;
    manual_apps INT;
    manual_unread INT;
BEGIN
    stats := public.get_student_dashboard_stats();

    tot_apps := (stats->>'total_applications')::int;
    unread_cnt := (stats->>'unread_notifications')::int;
    applied_st := (stats->'status_distribution'->>'applied')::int;

    -- Đếm tay đối chiếu trực tiếp trong DB
    SELECT COUNT(*) INTO manual_apps FROM public.job_applications WHERE student_id = '11111111-1111-1111-1111-111111111111';
    SELECT COUNT(*) INTO manual_unread FROM public.notifications WHERE user_id = '11111111-1111-1111-1111-111111111111' AND is_read = false;

    IF tot_apps = manual_apps AND unread_cnt = manual_unread AND applied_st = 1 THEN
        RAISE NOTICE '>>> TC 1 [PASS]: Số liệu Student Stats khớp 100%% với đếm tay (total_apps: %, unread: %, applied: %).', tot_apps, unread_cnt, applied_st;
    ELSE
        RAISE EXCEPTION '>>> TC 1 [FAIL]: Số liệu sinh viên không khớp! RPC: % / %, Đếm tay: % / %', tot_apps, unread_cnt, manual_apps, manual_unread;
    END IF;
END $$;


-- ==============================================================================
-- TEST CASE 2: Employer B gọi get_employer_dashboard_stats(7)
-- Kỳ vọng: Cô lập dữ liệu hoàn toàn, KHÔNG THẤY dữ liệu của Employer A
-- (total_jobs = 1, total_applicants = 0, new_applicants_7d = 0)
-- ==============================================================================
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}', true);

DO $$
DECLARE
    stats JSONB;
    tot_jobs INT;
    tot_applicants INT;
BEGIN
    stats := public.get_employer_dashboard_stats(7);

    tot_jobs := (stats->>'total_jobs')::int;
    tot_applicants := (stats->>'total_applicants')::int;

    IF tot_jobs = 1 AND tot_applicants = 0 THEN
        RAISE NOTICE '>>> TC 2 [PASS]: Employer B hoàn toàn không nhìn thấy số liệu của Employer A (jobs: 1, applicants: 0).';
    ELSE
        RAISE EXCEPTION '>>> TC 2 [FAIL]: Lỗ hổng rò rỉ số liệu! Employer B thấy % jobs, % applicants!', tot_jobs, tot_applicants;
    END IF;
END $$;


-- ==============================================================================
-- TEST CASE 3: Employer A gọi get_employer_dashboard_stats(7) & Kiểm tra Phễu
-- Mô phỏng chuyển trạng thái app_1 sang 'reviewing' -> 'interview' -> 'accepted'
-- ==============================================================================
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', true);

DO $$
DECLARE
    stats JSONB;
    tot_jobs INT;
    tot_applicants INT;
    funnel JSONB;
    cnt_applied INT;
    cnt_reviewing INT;
    cnt_interview INT;
    cnt_accepted INT;
    rate_overall NUMERIC;
    timeline JSONB;
    timeline_len INT;
BEGIN
    -- Bước 3.1: Chuyển app_1 qua các bước
    UPDATE public.job_applications SET status = 'reviewing' WHERE id = 'c1111111-0000-0000-0000-000000000001';
    UPDATE public.job_applications SET status = 'interview' WHERE id = 'c1111111-0000-0000-0000-000000000001';
    UPDATE public.job_applications SET status = 'accepted' WHERE id = 'c1111111-0000-0000-0000-000000000001';

    -- Gọi RPC thống kê
    stats := public.get_employer_dashboard_stats(7);

    tot_jobs := (stats->>'total_jobs')::int;
    tot_applicants := (stats->>'total_applicants')::int;
    funnel := stats->'funnel';
    timeline := stats->'timeline';
    timeline_len := jsonb_array_length(timeline);

    cnt_applied := (funnel->>'applied')::int;
    cnt_reviewing := (funnel->>'reviewing')::int;
    cnt_interview := (funnel->>'interview')::int;
    cnt_accepted := (funnel->>'accepted')::int;
    rate_overall := (funnel->'rates'->>'overall')::numeric;

    -- Kiểm chứng:
    -- Employer A có 2 jobs, 2 ứng viên (app_1, app_2)
    -- Phễu: 2 applied, 1 reviewing, 1 interview, 1 accepted -> overall rate: 50.0%
    -- Timeline: 7 ngày
    IF tot_jobs = 2 AND tot_applicants = 2 
       AND cnt_applied = 2 AND cnt_reviewing = 1 AND cnt_interview = 1 AND cnt_accepted = 1
       AND rate_overall = 50.0 AND timeline_len = 7 THEN
        RAISE NOTICE '>>> TC 3 [PASS]: Employer A thống kê & phễu chuyển đổi chuẩn xác tuyệt đối: applied=%, rev=%, int=%, acc=%, rate=%s%%, timeline_days=%.',
            cnt_applied, cnt_reviewing, cnt_interview, cnt_accepted, rate_overall, timeline_len;
    ELSE
        RAISE EXCEPTION '>>> TC 3 [FAIL]: Phễu chuyển đổi tính toán sai lệch! stats = %', stats;
    END IF;
END $$;


-- ==============================================================================
-- TEST CASE 4: Non-admin gọi get_admin_dashboard_stats() (Kỳ vọng: Bị từ chối)
-- ==============================================================================
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

DO $$
BEGIN
    PERFORM public.get_admin_dashboard_stats();
    RAISE EXCEPTION '>>> TC 4 [FAIL]: Lỗ hổng! Non-admin gọi được RPC get_admin_dashboard_stats()!';
EXCEPTION
    WHEN others THEN
        IF SQLERRM LIKE '%Chỉ Quản trị viên (Admin)%' THEN
            RAISE NOTICE '>>> TC 4 [PASS]: Non-admin gọi get_admin_dashboard_stats() bị từ chối chuẩn xác: %', SQLERRM;
        ELSE
            RAISE EXCEPTION '>>> TC 4 [FAIL]: Lỗi không khớp: %', SQLERRM;
        END IF;
END $$;


-- ==============================================================================
-- TEST CASE 5: Admin thật gọi get_admin_dashboard_stats() (Kỳ vọng: THÀNH CÔNG)
-- ==============================================================================
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"cccccccc-cccc-cccc-cccc-cccccccccccc","role":"authenticated"}', true);

DO $$
DECLARE
    admin_stats JSONB;
    tot_st INT;
    tot_emp INT;
    tot_j INT;
    tot_app INT;
BEGIN
    admin_stats := public.get_admin_dashboard_stats();

    tot_st := (admin_stats->>'total_students')::int;
    tot_emp := (admin_stats->>'total_employers')::int;
    tot_j := (admin_stats->>'total_jobs')::int;
    tot_app := (admin_stats->>'total_applications')::int;

    IF tot_st >= 2 AND tot_emp >= 2 AND tot_j >= 3 AND tot_app >= 2 THEN
        RAISE NOTICE '>>> TC 5 [PASS]: Admin lấy toàn bộ số liệu hệ thống thành công: students=%, employers=%, jobs=%, applications=%.',
            tot_st, tot_emp, tot_j, tot_app;
    ELSE
        RAISE EXCEPTION '>>> TC 5 [FAIL]: Dữ liệu Admin không đầy đủ: %', admin_stats;
    END IF;
END $$;

RAISE NOTICE '========================================================================';
RAISE NOTICE '>>> TẤT CẢ 5 TEST CASES THỐNG KÊ SPRINT 3.4 ĐỀU ĐẠT CHUẨN [PASS]!';
RAISE NOTICE '========================================================================';

ROLLBACK; -- Dọn sạch hoàn toàn dữ liệu kiểm thử
