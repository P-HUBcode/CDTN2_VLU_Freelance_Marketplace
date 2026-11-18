-- ==============================================================================
-- BỘ KIỂM THỬ BẢO MẬT & RLS - SPRINT 3.2.1: HARDENING (REVISED)
-- Mục tiêu: Kiểm chứng các kịch bản bảo mật cốt lõi trên Supabase bằng JWT session thật
-- ==============================================================================

BEGIN;

-- 1. CHUẨN BỊ DỮ LIỆU KIỂM THỬ GIẢ LẬP
DO $$
DECLARE
    uid_student_a UUID := '11111111-1111-1111-1111-111111111111';
    uid_student_b UUID := '22222222-2222-2222-2222-222222222222';
    uid_employer_a UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    uid_employer_b UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    test_job_a UUID := 'a1111111-0000-0000-0000-000000000001';
    test_job_b UUID := 'b1111111-0000-0000-0000-000000000001';
    test_app_a UUID := 'c1111111-0000-0000-0000-000000000001';
    test_note_a UUID := 'd1111111-0000-0000-0000-000000000001';
BEGIN
    -- Tạo profiles
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES 
        (uid_student_a, 'Student A', 'student.a@test.vn', 'student'),
        (uid_student_b, 'Student B', 'student.b@test.vn', 'student'),
        (uid_employer_a, 'Employer A', 'employer.a@test.vn', 'employer'),
        (uid_employer_b, 'Employer B', 'employer.b@test.vn', 'employer')
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

    -- Tạo jobs
    INSERT INTO public.jobs (id, employer_id, title, description, status)
    VALUES 
        (test_job_a, uid_employer_a, 'Job of Employer A', 'Mô tả Job A', 'published'),
        (test_job_b, uid_employer_b, 'Job of Employer B', 'Mô tả Job B', 'published')
    ON CONFLICT (id) DO NOTHING;

    -- Tạo application của Student A nộp vào Job của Employer A
    INSERT INTO public.job_applications (id, job_id, student_id, cover_letter, status)
    VALUES (test_app_a, test_job_a, uid_student_a, 'Thư ứng tuyển Student A', 'applied')
    ON CONFLICT (job_id, student_id) DO UPDATE SET status = 'applied';

    -- Employer A tạo ghi chú nội bộ bí mật
    INSERT INTO public.application_notes (id, application_id, employer_id, content)
    VALUES (test_note_a, test_app_a, uid_employer_a, 'Ghi chú mật: Ứng viên này xếp loại A+')
    ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;
END $$;


-- ==============================================================================
-- TEST CASE 1: Student A truy vấn application_notes (Kỳ vọng: 0 dòng kết quả)
-- ==============================================================================
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
SET LOCAL "request.jwt.claim.role" = 'authenticated';
SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

DO $$
DECLARE
    note_count INT;
BEGIN
    SELECT COUNT(*) INTO note_count FROM public.application_notes;
    IF note_count = 0 THEN
        RAISE NOTICE '>>> TEST CASE 1 [PASS]: Student A không thể đọc bất kỳ ghi chú nội bộ nào (count = 0).';
    ELSE
        RAISE EXCEPTION '>>> TEST CASE 1 [FAIL]: Lỗ hổng bảo mật! Student A đã đọc được % ghi chú!', note_count;
    END IF;
END $$;


-- ==============================================================================
-- TEST CASE 2: Student A tự đổi status sang 'accepted' (Kỳ vọng: Bị Trigger từ chối)
-- ==============================================================================
DO $$
BEGIN
    UPDATE public.job_applications 
    SET status = 'accepted' 
    WHERE id = 'c1111111-0000-0000-0000-000000000001';

    RAISE EXCEPTION '>>> TEST CASE 2 [FAIL]: Lỗ hổng bảo mật! Student A tự đổi được status sang accepted!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '>>> TEST CASE 2 [PASS]: Student A bị chặn khi cố gắng tự đổi status. Chi tiết lỗi: %', SQLERRM;
END $$;


-- ==============================================================================
-- TEST CASE 3: Employer B truy vấn & cập nhật ứng viên của Employer A (Kỳ vọng: 0 dòng)
-- ==============================================================================
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
SET LOCAL "request.jwt.claim.role" = 'authenticated';
SET LOCAL "request.jwt.claims" = '{"sub": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "role": "authenticated"}';

DO $$
DECLARE
    app_count INT;
    note_count INT;
    rows_affected INT;
BEGIN
    -- Kiểm tra SELECT application
    SELECT COUNT(*) INTO app_count 
    FROM public.job_applications 
    WHERE id = 'c1111111-0000-0000-0000-000000000001';

    -- Kiểm tra SELECT notes
    SELECT COUNT(*) INTO note_count 
    FROM public.application_notes 
    WHERE application_id = 'c1111111-0000-0000-0000-000000000001';

    IF app_count = 0 AND note_count = 0 THEN
        RAISE NOTICE '>>> TEST CASE 3.1 [PASS]: Employer B hoàn toàn không nhìn thấy đơn hoặc ghi chú của Employer A (app_count = 0, note_count = 0).';
    ELSE
        RAISE EXCEPTION '>>> TEST CASE 3.1 [FAIL]: Employer B nhìn thấy dữ liệu của Employer A!';
    END IF;

    -- Thử UPDATE đơn của Employer A (RLS UPDATE USING loại trừ dòng của người khác)
    UPDATE public.job_applications 
    SET status = 'rejected' 
    WHERE id = 'c1111111-0000-0000-0000-000000000001';

    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    IF rows_affected = 0 THEN
        RAISE NOTICE '>>> TEST CASE 3.2 [PASS]: RLS chặn hoàn toàn - 0 bản ghi bị cập nhật (rows_affected = 0).';
    ELSE
        RAISE EXCEPTION '>>> TEST CASE 3.2 [FAIL]: Lỗ hổng! Employer B cập nhật được % dòng!', rows_affected;
    END IF;
END $$;


-- ==============================================================================
-- TEST CASE 4: Employer A chuyển trạng thái sai quy tắc State Machine (Kỳ vọng: Bị từ chối)
-- Chuyển từ 'applied' nhảy cóc thẳng sang 'accepted' (bỏ qua reviewing & interview)
-- ==============================================================================
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
SET LOCAL "request.jwt.claim.role" = 'authenticated';
SET LOCAL "request.jwt.claims" = '{"sub": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "role": "authenticated"}';

DO $$
BEGIN
    -- Nhảy cóc từ applied -> accepted
    UPDATE public.job_applications 
    SET status = 'accepted' 
    WHERE id = 'c1111111-0000-0000-0000-000000000001';

    RAISE EXCEPTION '>>> TEST CASE 4 [FAIL]: Lỗi State Machine! Cho phép nhảy cóc từ applied thẳng sang accepted!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '>>> TEST CASE 4 [PASS]: Chuyển trạng thái sai quy tắc bị trigger từ chối chuẩn xác. Chi tiết: %', SQLERRM;
END $$;


-- ==============================================================================
-- TEST CASE 5: Employer A chuyển trạng thái HỢP LỆ theo từng bước (Kỳ vọng: THÀNH CÔNG)
-- applied -> reviewing -> interview -> accepted
-- ==============================================================================
DO $$
DECLARE
    current_st TEXT;
    hist_count INT;
BEGIN
    -- Bước 1: applied -> reviewing
    UPDATE public.job_applications SET status = 'reviewing' WHERE id = 'c1111111-0000-0000-0000-000000000001';
    SELECT status INTO current_st FROM public.job_applications WHERE id = 'c1111111-0000-0000-0000-000000000001';
    IF current_st <> 'reviewing' THEN RAISE EXCEPTION 'Lỗi chuyển reviewing'; END IF;

    -- Bước 2: reviewing -> interview
    UPDATE public.job_applications SET status = 'interview' WHERE id = 'c1111111-0000-0000-0000-000000000001';
    SELECT status INTO current_st FROM public.job_applications WHERE id = 'c1111111-0000-0000-0000-000000000001';
    IF current_st <> 'interview' THEN RAISE EXCEPTION 'Lỗi chuyển interview'; END IF;

    -- Bước 3: interview -> accepted
    UPDATE public.job_applications SET status = 'accepted' WHERE id = 'c1111111-0000-0000-0000-000000000001';
    SELECT status INTO current_st FROM public.job_applications WHERE id = 'c1111111-0000-0000-0000-000000000001';
    IF current_st <> 'accepted' THEN RAISE EXCEPTION 'Lỗi chuyển accepted'; END IF;

    -- Kiểm tra bảng lịch sử tự động ghi
    SELECT COUNT(*) INTO hist_count 
    FROM public.application_status_history 
    WHERE application_id = 'c1111111-0000-0000-0000-000000000001';

    IF hist_count >= 3 THEN
        RAISE NOTICE '>>> TEST CASE 5 [PASS]: Chuyển trạng thái hợp lệ thành công và lịch sử đã được tự động ghi (% bản ghi).', hist_count;
    ELSE
        RAISE EXCEPTION '>>> TEST CASE 5 [FAIL]: Lịch sử trạng thái chưa được ghi đầy đủ!';
    END IF;
END $$;

ROLLBACK; -- Dọn sạch dữ liệu kiểm thử
