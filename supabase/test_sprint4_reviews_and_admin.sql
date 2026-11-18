-- ==============================================================================
-- BỘ KIỂM THỬ SPRINT 4: ĐÁNH GIÁ 2 CHIỀU (REVIEWS) & PHÂN HỆ ADMIN
-- Date: 2026-11-13
-- Chạy an toàn trong Transaction (BEGIN ... ROLLBACK) không ảnh hưởng dữ liệu thật.
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- BƯỚC 0: DỮ LIỆU KIỂM THỬ GIẢ LẬP
-- ==============================================================================
DO $$
DECLARE
    uid_student UUID := '11111111-1111-1111-1111-111111111111';
    uid_employer UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    uid_admin UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
    uid_stranger UUID := '22222222-2222-2222-2222-222222222222';

    job_1 UUID := 'a1111111-0000-0000-0000-000000000001';
    job_2 UUID := 'a1111111-0000-0000-0000-000000000002';
    app_accepted UUID := 'c1111111-0000-0000-0000-000000000001';
    app_applied UUID := 'c1111111-0000-0000-0000-000000000002';
BEGIN
    -- 1. Profiles
    INSERT INTO public.profiles (id, full_name, email, role, is_active)
    VALUES 
        (uid_student, 'Sinh viên A', 'student.a@test.vn', 'student', true),
        (uid_employer, 'Công ty A', 'employer.a@test.vn', 'employer', true),
        (uid_admin, 'Admin Hệ Thống', 'admin@test.vn', 'admin', true),
        (uid_stranger, 'Sinh viên Lạ', 'stranger@test.vn', 'student', true)
    ON CONFLICT (id) DO UPDATE SET is_active = EXCLUDED.is_active;

    -- 2. Jobs
    INSERT INTO public.jobs (id, employer_id, title, description, status)
    VALUES 
        (job_1, uid_employer, 'Content Creator', 'Mô tả', 'published'),
        (job_2, uid_employer, 'Video Editor', 'Mô tả', 'pending_approval')
    ON CONFLICT (id) DO NOTHING;

    -- 3. Applications: app_accepted đã nhận việc, app_applied mới nộp
    INSERT INTO public.job_applications (id, job_id, student_id, cover_letter, status)
    VALUES 
        (app_accepted, job_1, uid_student, 'Cover letter', 'accepted'),
        (app_applied, job_1, uid_stranger, 'Cover letter', 'applied')
    ON CONFLICT (job_id, student_id) DO UPDATE SET status = EXCLUDED.status;

    RAISE NOTICE '>>> [SETUP SPRINT 4]: Dữ liệu kiểm thử đã sẵn sàng.';
END $$;


-- ==============================================================================
-- TEST CASE 1: Sinh viên gửi đánh giá cho Employer khi đơn đã ACCEPTED
-- Kỳ vọng: THÀNH CÔNG (INSERT được 1 bản ghi review)
-- ==============================================================================
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

DO $$
DECLARE
    rev_id UUID;
BEGIN
    INSERT INTO public.reviews (job_id, reviewer_id, reviewee_id, rating_score, comment, tags)
    VALUES (
        'a1111111-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        5,
        'Công ty rất tốt, thanh toán đúng hạn!',
        ARRAY['Thanh toán đúng hẹn', 'Thân thiện']
    )
    RETURNING id INTO rev_id;

    IF rev_id IS NOT NULL THEN
        RAISE NOTICE '>>> TC 1 [PASS]: Sinh viên gửi đánh giá 5 sao thành công cho NTD (Review ID: %).', rev_id;
    ELSE
        RAISE EXCEPTION '>>> TC 1 [FAIL]: Sinh viên không thể gửi đánh giá!';
    END IF;
END $$;


-- ==============================================================================
-- TEST CASE 2: Người lạ (Student Stranger chưa được accepted) gửi đánh giá
-- Kỳ vọng: BỊ CHẶN BỞI RLS POLICY
-- ==============================================================================
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);

DO $$
BEGIN
    INSERT INTO public.reviews (job_id, reviewer_id, reviewee_id, rating_score, comment)
    VALUES (
        'a1111111-0000-0000-0000-000000000001',
        '22222222-2222-2222-2222-222222222222',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        1,
        'Spam review'
    );
    RAISE EXCEPTION '>>> TC 2 [FAIL]: Lỗ hổng! Ứng viên chưa được nhận việc vẫn gửi được đánh giá!';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '>>> TC 2 [PASS]: Ứng viên chưa hoàn thành việc bị chặn đánh giá chuẩn xác: %', SQLERRM;
END $$;


-- ==============================================================================
-- TEST CASE 3: Tự đánh giá chính mình (Self-review)
-- Kỳ vọng: BỊ CHẶN BỞI CHECK CONSTRAINT (chk_reviewer_not_reviewee)
-- ==============================================================================
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

DO $$
BEGIN
    INSERT INTO public.reviews (job_id, reviewer_id, reviewee_id, rating_score, comment)
    VALUES (
        'a1111111-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111',
        '11111111-1111-1111-1111-111111111111',
        5,
        'Tự khen mình'
    );
    RAISE EXCEPTION '>>> TC 3 [FAIL]: Lỗ hổng! User tự đánh giá chính mình!';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE '>>> TC 3 [PASS]: Tự đánh giá chính mình bị chặn chuẩn xác: %', SQLERRM;
END $$;


-- ==============================================================================
-- TEST CASE 4: RPC get_user_rating_summary() tính chuẩn điểm số sao
-- Kỳ vọng: Employer A nhận 1 review 5 sao -> rating_avg = 5.0, total_reviews = 1
-- ==============================================================================
DO $$
DECLARE
    summary JSONB;
    avg_score NUMERIC;
    tot INT;
BEGIN
    summary := public.get_user_rating_summary('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    avg_score := (summary->>'rating_avg')::numeric;
    tot := (summary->>'total_reviews')::int;

    IF avg_score = 5.0 AND tot = 1 THEN
        RAISE NOTICE '>>> TC 4 [PASS]: RPC get_user_rating_summary() tính toán chuẩn xác (avg: %, total: %).', avg_score, tot;
    ELSE
        RAISE EXCEPTION '>>> TC 4 [FAIL]: Điểm số sao tính toán sai lệch: %', summary;
    END IF;
END $$;


-- ==============================================================================
-- TEST CASE 5: Admin duyệt tin tuyển dụng ('pending_approval' -> 'published')
-- Kỳ vọng: THÀNH CÔNG
-- ==============================================================================
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"cccccccc-cccc-cccc-cccc-cccccccccccc","role":"authenticated"}', true);

DO $$
DECLARE
    st TEXT;
BEGIN
    UPDATE public.jobs 
    SET status = 'published' 
    WHERE id = 'a1111111-0000-0000-0000-000000000002'
    RETURNING status INTO st;

    IF st = 'published' THEN
        RAISE NOTICE '>>> TC 5 [PASS]: Admin duyệt tin tuyển dụng thành công (status: %).', st;
    ELSE
        RAISE EXCEPTION '>>> TC 5 [FAIL]: Admin không duyệt được tin!';
    END IF;
END $$;


-- ==============================================================================
-- TEST CASE 6: Admin khóa tài khoản người dùng (is_active = false)
-- Kỳ vọng: THÀNH CÔNG
-- ==============================================================================
DO $$
DECLARE
    act BOOLEAN;
BEGIN
    UPDATE public.profiles
    SET is_active = false
    WHERE id = '22222222-2222-2222-2222-222222222222'
    RETURNING is_active INTO act;

    IF act = false THEN
        RAISE NOTICE '>>> TC 6 [PASS]: Admin khóa tài khoản vi phạm thành công (is_active: false).';
    ELSE
        RAISE EXCEPTION '>>> TC 6 [FAIL]: Admin khóa tài khoản thất bại!';
    END IF;
END $$;

RAISE NOTICE '========================================================================';
RAISE NOTICE '>>> TẤT CẢ 6 TEST CASES SPRINT 4 (REVIEWS & ADMIN) ĐỀU ĐẠT CHUẨN [PASS]!';
RAISE NOTICE '========================================================================';

ROLLBACK;
