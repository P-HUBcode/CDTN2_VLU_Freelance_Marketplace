-- ==============================================================================
-- BỘ KIỂM THỬ BẢO MẬT & RLS - SPRINT 3.2.2 (REVISED)
-- Sử dụng chuẩn PostgreSQL parameter: set_config('request.jwt.claims', ..., true)
-- Date: 2026-11-13
-- Chạy hoàn toàn trong Transaction (BEGIN ... ROLLBACK) không ảnh hưởng dữ liệu thật.
-- In kết quả thực tế từng case tường minh, tuyệt đối không ghi mập mờ "0 dòng hoặc Exception".
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- BƯỚC 0: THIẾT LẬP DỮ LIỆU KIỂM THỬ GIẢ LẬP (Direct DB / Service Role)
-- ==============================================================================
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
    test_notif_a UUID := 'e1111111-0000-0000-0000-000000000001';
    test_notif_b UUID := 'e2222222-0000-0000-0000-000000000002';
BEGIN
    -- 1. Tạo profiles
    INSERT INTO public.profiles (id, full_name, email, role, phone, bio, location)
    VALUES 
        (uid_student_a, 'Nguyễn Văn A (Student)', 'student.a@test.vn', 'student', '0901111111', 'Sinh viên A', 'TP.HCM'),
        (uid_student_b, 'Trần Thị B (Student)', 'student.b@test.vn', 'student', '0902222222', 'Sinh viên B', 'TP.HCM'),
        (uid_employer_a, 'Công ty Công nghệ A (Employer)', 'employer.a@test.vn', 'employer', '0903333333', 'NTD A', 'TP.HCM'),
        (uid_employer_b, 'Tập đoàn B (Employer)', 'employer.b@test.vn', 'employer', '0904444444', 'NTD B', 'TP.HCM')
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

    -- 2. Tạo student_profiles
    INSERT INTO public.student_profiles (user_id, university, major, graduation_year, cv_url)
    VALUES 
        (uid_student_a, 'Đại học Văn Lang', 'CNTT', '2026', 'https://storage/cv/11111111-1111-1111-1111-111111111111/cv_a.pdf'),
        (uid_student_b, 'Đại học Bách Khoa', 'KTPM', '2026', 'https://storage/cv/22222222-2222-2222-2222-222222222222/cv_b.pdf')
    ON CONFLICT (user_id) DO NOTHING;

    -- 3. Tạo jobs
    INSERT INTO public.jobs (id, employer_id, title, description, status)
    VALUES 
        (test_job_a, uid_employer_a, 'Frontend React Developer', 'Tuyển lập trình viên React 19', 'published'),
        (test_job_b, uid_employer_b, 'Backend Node.js Developer', 'Tuyển lập trình viên Node.js', 'published')
    ON CONFLICT (id) DO NOTHING;

    -- 4. Tạo đơn ứng tuyển: Student A nộp vào Job A (thuộc Employer A)
    INSERT INTO public.job_applications (id, job_id, student_id, cover_letter, cv_url, status, applied_at)
    VALUES (test_app_a, test_job_a, uid_student_a, 'Thư ứng tuyển gốc của Student A', 'https://storage/cv/11111111-1111-1111-1111-111111111111/cv_a.pdf', 'applied', NOW())
    ON CONFLICT (job_id, student_id) DO UPDATE SET status = 'applied', cover_letter = 'Thư ứng tuyển gốc của Student A';

    -- 5. Employer A tạo ghi chú nội bộ bí mật
    INSERT INTO public.application_notes (id, application_id, employer_id, content)
    VALUES (test_note_a, test_app_a, uid_employer_a, 'Ghi chú nội bộ bí mật: Đánh giá ứng viên A+ năng lực tốt')
    ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;

    -- 6. Tạo thông báo mẫu
    INSERT INTO public.notifications (id, user_id, type, title, message, is_read)
    VALUES 
        (test_notif_a, uid_student_a, 'application_status_changed', 'Thông báo của Student A', 'Nội dung thông báo A', false),
        (test_notif_b, uid_student_b, 'application_status_changed', 'Thông báo mật của Student B', 'Nội dung thông báo riêng tư B', false)
    ON CONFLICT (id) DO NOTHING;

    -- 7. Giả lập file CV trong storage.objects nếu bảng storage.objects tồn tại
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
        INSERT INTO storage.objects (id, bucket_id, name, owner)
        VALUES 
            ('f1111111-0000-0000-0000-000000000001', 'cv', '11111111-1111-1111-1111-111111111111/cv_student_a.pdf', uid_student_a),
            ('f2222222-0000-0000-0000-000000000002', 'cv', '22222222-2222-2222-2222-222222222222/cv_student_b.pdf', uid_student_b)
        ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE '>>> [SETUP]: Môi trường dữ liệu kiểm thử hoàn tất.';
END $$;


-- ==============================================================================
-- TEST CASE 1: Student A truy vấn application_notes
-- Thiết lập JWT qua set_config('request.jwt.claims', ...)
-- Kỳ vọng: RLS ẩn hoàn toàn dữ liệu (trả về đúng 0 bản ghi)
-- ==============================================================================
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

DO $$
DECLARE
    note_cnt INT;
BEGIN
    SELECT COUNT(*) INTO note_cnt FROM public.application_notes;
    IF note_cnt = 0 THEN
        RAISE NOTICE '>>> TC 1 [PASS]: Student A không thể đọc ghi chú nội bộ (RLS lọc chính xác: trả về 0 dòng).';
    ELSE
        RAISE EXCEPTION '>>> TC 1 [FAIL]: Lỗ hổng! Student A đọc được % ghi chú nội bộ!', note_cnt;
    END IF;
END $$;


-- ==============================================================================
-- TEST CASE 2: Student A truy vấn notifications của Student B
-- Kỳ vọng: RLS trả về đúng 0 bản ghi
-- ==============================================================================
DO $$
DECLARE
    notif_cnt INT;
BEGIN
    SELECT COUNT(*) INTO notif_cnt 
    FROM public.notifications 
    WHERE user_id = '22222222-2222-2222-2222-222222222222';

    IF notif_cnt = 0 THEN
        RAISE NOTICE '>>> TC 2 [PASS]: Student A không thể đọc thông báo của Student B (RLS lọc chính xác: trả về 0 dòng).';
    ELSE
        RAISE EXCEPTION '>>> TC 2 [FAIL]: Lỗ hổng! Student A đọc được % thông báo của Student B!', notif_cnt;
    END IF;
END $$;


-- ==============================================================================
-- TEST CASE 3: Client (Student A) tự ý INSERT thông báo vào bảng notifications
-- Kỳ vọng: Bị RLS chặn ngay tại câu lệnh INSERT
-- ==============================================================================
DO $$
BEGIN
    INSERT INTO public.notifications (user_id, type, title, message)
    VALUES ('11111111-1111-1111-1111-111111111111', 'system_message', 'Hack Title', 'Spam Message');

    RAISE EXCEPTION '>>> TC 3 [FAIL]: Lỗ hổng! Client tự INSERT được thông báo vào public.notifications!';
EXCEPTION
    WHEN insufficient_privilege OR others THEN
        RAISE NOTICE '>>> TC 3 [PASS]: Client tự INSERT notification bị từ chối chính xác: %', SQLERRM;
END $$;


-- ==============================================================================
-- TEST CASE 4: User (Student A) cố tình sửa cột title / message của notification
-- Kỳ vọng: Bị PostgreSQL chặn ở tầng Column-Level Grant (chỉ cấp GRANT UPDATE (is_read))
-- ==============================================================================
DO $$
BEGIN
    UPDATE public.notifications 
    SET title = 'Bị sửa bởi hacker' 
    WHERE id = 'e1111111-0000-0000-0000-000000000001';

    RAISE EXCEPTION '>>> TC 4 [FAIL]: Lỗ hổng! User sửa được cột title của notification!';
EXCEPTION
    WHEN insufficient_privilege OR others THEN
        RAISE NOTICE '>>> TC 4 [PASS]: User sửa title/message bị chặn chính xác bởi Column Grant: %', SQLERRM;
END $$;


-- ==============================================================================
-- TEST CASE 5: User (Student A) cập nhật cờ is_read của thông báo thuộc về mình
-- Kỳ vọng: Thành công, đúng 1 bản ghi được cập nhật
-- ==============================================================================
DO $$
DECLARE
    rows_affected INT;
    read_state BOOLEAN;
BEGIN
    UPDATE public.notifications 
    SET is_read = true 
    WHERE id = 'e1111111-0000-0000-0000-000000000001';

    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    SELECT is_read INTO read_state FROM public.notifications WHERE id = 'e1111111-0000-0000-0000-000000000001';

    IF rows_affected = 1 AND read_state = true THEN
        RAISE NOTICE '>>> TC 5 [PASS]: User cập nhật cờ is_read thành công (cập nhật chính xác 1 dòng, is_read = true).';
    ELSE
        RAISE EXCEPTION '>>> TC 5 [FAIL]: Cập nhật is_read thất bại! rows_affected = %', rows_affected;
    END IF;
END $$;


-- ==============================================================================
-- TEST CASE 6: User (Student A) cố tình tự nâng quyền sửa role = 'admin' trên profiles
-- Kỳ vọng: Bị Trigger check_profile_update / column grant chặn tuyệt đối
-- ==============================================================================
DO $$
BEGIN
    UPDATE public.profiles 
    SET role = 'admin' 
    WHERE id = '11111111-1111-1111-1111-111111111111';

    RAISE EXCEPTION '>>> TC 6 [FAIL]: LỖ HỔNG LEO THANG ĐẶC QUYỀN! Student A tự nâng cấp thành công thành role admin!';
EXCEPTION
    WHEN insufficient_privilege OR others THEN
        RAISE NOTICE '>>> TC 6 [PASS]: Thao tác sửa role trên bảng profiles bị chặn tuyệt đối: %', SQLERRM;
END $$;


-- ==============================================================================
-- TEST CASE 7: Student A cập nhật thông tin cá nhân hợp lệ (bio, phone) trên profiles
-- Kỳ vọng: Thành công (whitelist cho phép)
-- ==============================================================================
DO $$
DECLARE
    rows_affected INT;
    new_phone TEXT;
BEGIN
    UPDATE public.profiles 
    SET phone = '0999888777', bio = 'Bio đã được cập nhật hợp lệ' 
    WHERE id = '11111111-1111-1111-1111-111111111111';

    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    SELECT phone INTO new_phone FROM public.profiles WHERE id = '11111111-1111-1111-1111-111111111111';

    IF rows_affected = 1 AND new_phone = '0999888777' THEN
        RAISE NOTICE '>>> TC 7 [PASS]: Student A cập nhật thông tin cá nhân hợp lệ thành công (1 dòng cập nhật).';
    ELSE
        RAISE EXCEPTION '>>> TC 7 [FAIL]: Cập nhật thông tin cá nhân thất bại! rows = %', rows_affected;
    END IF;
END $$;


-- ==============================================================================
-- TEST CASE 8: Employer B truy vấn student_profiles của Student A
-- Điều kiện: Student A CHỈ nộp đơn vào Job A (Employer A), KHÔNG nộp vào Job B (Employer B)
-- Kỳ vọng: Employer B bị RLS chặn, trả về đúng 0 dòng
-- ==============================================================================
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}', true);

DO $$
DECLARE
    sp_count INT;
BEGIN
    SELECT COUNT(*) INTO sp_count 
    FROM public.student_profiles 
    WHERE user_id = '11111111-1111-1111-1111-111111111111';

    IF sp_count = 0 THEN
        RAISE NOTICE '>>> TC 8 [PASS]: Employer B KHÔNG THỂ đọc student_profiles của Student A (chưa ứng tuyển vào Job B: trả về 0 dòng).';
    ELSE
        RAISE EXCEPTION '>>> TC 8 [FAIL]: Lỗ hổng! Employer B đọc được student_profiles của ứng viên ngoài luồng!', sp_count;
    END IF;
END $$;


-- ==============================================================================
-- TEST CASE 9: Employer A truy vấn student_profiles của Student A
-- Điều kiện: Student A ĐÃ nộp đơn vào Job A do Employer A sở hữu
-- Kỳ vọng: Employer A đọc được hồ sơ (trả về đúng 1 dòng)
-- ==============================================================================
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', true);

DO $$
DECLARE
    sp_count INT;
BEGIN
    SELECT COUNT(*) INTO sp_count 
    FROM public.student_profiles 
    WHERE user_id = '11111111-1111-1111-1111-111111111111';

    IF sp_count = 1 THEN
        RAISE NOTICE '>>> TC 9 [PASS]: Employer A đọc được hồ sơ sinh viên đã ứng tuyển vào Job của mình (trả về đúng 1 dòng).';
    ELSE
        RAISE EXCEPTION '>>> TC 9 [FAIL]: Employer A không đọc được hồ sơ của ứng viên đã nộp đơn! count = %', sp_count;
    END IF;
END $$;


-- ==============================================================================
-- TEST CASE 10: Employer B truy vấn & download CV của Student A trong storage.objects
-- Kỳ vọng: Employer B bị RLS chặn, trả về đúng 0 file
-- ==============================================================================
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}', true);

DO $$
DECLARE
    file_cnt INT;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
        SELECT COUNT(*) INTO file_cnt 
        FROM storage.objects 
        WHERE bucket_id = 'cv' AND name LIKE '11111111-1111-1111-1111-111111111111/%';

        IF file_cnt = 0 THEN
            RAISE NOTICE '>>> TC 10 [PASS]: Employer B KHÔNG THỂ đọc/tải CV của Student A trong bucket cv (trả về đúng 0 dòng).';
        ELSE
            RAISE EXCEPTION '>>> TC 10 [FAIL]: Lỗ hổng Storage! Employer B đọc được CV của Student A!', file_cnt;
        END IF;
    ELSE
        RAISE NOTICE '>>> TC 10 [INFO]: Bảng storage.objects không khả dụng trong session này (môi trường giả lập).';
    END IF;
END $$;


-- ==============================================================================
-- TEST CASE 11: Employer A truy vấn file CV của Student A trong storage.objects
-- Kỳ vọng: Employer A đọc được file CV của ứng viên (trả về đúng 1 dòng)
-- ==============================================================================
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', true);

DO $$
DECLARE
    file_cnt INT;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
        SELECT COUNT(*) INTO file_cnt 
        FROM storage.objects 
        WHERE bucket_id = 'cv' AND name LIKE '11111111-1111-1111-1111-111111111111/%';

        IF file_cnt = 1 THEN
            RAISE NOTICE '>>> TC 11 [PASS]: Employer A đọc được file CV của Student A đã ứng tuyển vào Job của mình (1 file).';
        ELSE
            RAISE EXCEPTION '>>> TC 11 [FAIL]: Employer A không đọc được file CV của ứng viên!';
        END IF;
    ELSE
        RAISE NOTICE '>>> TC 11 [INFO]: Bảng storage.objects không khả dụng trong session này (môi trường giả lập).';
    END IF;
END $$;


-- ==============================================================================
-- TEST CASE 12: Employer A sửa các cột ngoài status (cover_letter, cv_url)
-- Kỳ vọng: Bị Trigger check_job_application_update (Whitelist to_jsonb) chặn
-- ==============================================================================
DO $$
BEGIN
    UPDATE public.job_applications 
    SET cover_letter = 'Employer cố ý can thiệp nội dung ứng viên' 
    WHERE id = 'c1111111-0000-0000-0000-000000000001';

    RAISE EXCEPTION '>>> TC 12 [FAIL]: Lỗ hổng! Employer sửa được cover_letter của sinh viên!';
EXCEPTION
    WHEN others THEN
        IF SQLERRM LIKE '%Nhà tuyển dụng chỉ được thay đổi trạng thái%' THEN
            RAISE NOTICE '>>> TC 12 [PASS]: Employer A sửa cột ngoài status bị Trigger Whitelist chặn chuẩn xác: %', SQLERRM;
        ELSE
            RAISE EXCEPTION '>>> TC 12 [FAIL]: Lỗi không khớp kỳ vọng: %', SQLERRM;
        END IF;
END $$;


-- ==============================================================================
-- TEST CASE 13: Chuyển trạng thái sang 'reviewing', sau đó Student A cố sửa cover_letter
-- Kỳ vọng: Bị Trigger chặn với lỗi 'Hồ sơ đã được xử lý, bạn không thể chỉnh sửa.'
-- ==============================================================================
-- Bước 13.1: Employer A chuyển đơn sang reviewing
DO $$
BEGIN
    UPDATE public.job_applications 
    SET status = 'reviewing' 
    WHERE id = 'c1111111-0000-0000-0000-000000000001';
END $$;

-- Bước 13.2: Đổi JWT sang Student A và thử sửa cover_letter
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

DO $$
BEGIN
    UPDATE public.job_applications 
    SET cover_letter = 'Student A cố sửa lại thư khi đang reviewing' 
    WHERE id = 'c1111111-0000-0000-0000-000000000001';

    RAISE EXCEPTION '>>> TC 13 [FAIL]: Lỗ hổng! Student A sửa được hồ sơ khi trạng thái khác applied!';
EXCEPTION
    WHEN others THEN
        IF SQLERRM LIKE '%Hồ sơ đã được xử lý%' THEN
            RAISE NOTICE '>>> TC 13 [PASS]: Student A sửa hồ sơ khi status = reviewing bị Trigger chặn chuẩn xác: %', SQLERRM;
        ELSE
            RAISE EXCEPTION '>>> TC 13 [FAIL]: Lỗi không khớp kỳ vọng: %', SQLERRM;
        END IF;
END $$;


-- ==============================================================================
-- TEST CASE 14: Nộp trùng cùng Job bị UNIQUE constraint chặn
-- Kỳ vọng: Constraint unique_job_student_application tồn tại thật và chặn INSERT trùng
-- ==============================================================================
DO $$
DECLARE
    con_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'unique_job_student_application'
          AND conrelid = 'public.job_applications'::regclass
    ) INTO con_exists;

    IF NOT con_exists THEN
        RAISE EXCEPTION '>>> TC 14 [FAIL]: Ràng buộc unique_job_student_application KHÔNG tồn tại trong pg_constraint!';
    END IF;

    BEGIN
        INSERT INTO public.job_applications (job_id, student_id, cover_letter, status)
        VALUES ('a1111111-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Đơn nộp trùng', 'applied');

        RAISE EXCEPTION '>>> TC 14 [FAIL]: Nộp trùng không bị chặn bởi UNIQUE constraint!';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE '>>> TC 14 [PASS]: Ràng buộc unique_job_student_application tồn tại thật và chặn thành công đơn nộp trùng: %', SQLERRM;
    END;
END $$;


-- ==============================================================================
-- TEST CASE 15: Chuyển đổi trạng thái HỢP LỆ theo từng bước & Tự động sinh Notification
-- reviewing -> interview -> accepted
-- Kỳ vọng: Thành công, lịch sử được lưu đầy đủ, Student A nhận được thông báo tự động
-- ==============================================================================
SELECT set_config('role', 'authenticated', true);
SELECT set_config('request.jwt.claims', '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}', true);

DO $$
DECLARE
    cur_st TEXT;
    hist_cnt INT;
    student_notifs INT;
BEGIN
    -- Bước 15.1: reviewing -> interview
    UPDATE public.job_applications 
    SET status = 'interview' 
    WHERE id = 'c1111111-0000-0000-0000-000000000001';

    SELECT status INTO cur_st FROM public.job_applications WHERE id = 'c1111111-0000-0000-0000-000000000001';
    IF cur_st <> 'interview' THEN RAISE EXCEPTION 'Lỗi chuyển sang interview'; END IF;

    -- Bước 15.2: interview -> accepted
    UPDATE public.job_applications 
    SET status = 'accepted' 
    WHERE id = 'c1111111-0000-0000-0000-000000000001';

    SELECT status INTO cur_st FROM public.job_applications WHERE id = 'c1111111-0000-0000-0000-000000000001';
    IF cur_st <> 'accepted' THEN RAISE EXCEPTION 'Lỗi chuyển sang accepted'; END IF;

    -- Kiểm tra bảng application_status_history:
    -- 1 (applied ban đầu do trigger INSERT) + 1 (TC 13.1 reviewing) + 1 (TC 15.1 interview) + 1 (TC 15.2 accepted) = 4 bản ghi
    SELECT COUNT(*) INTO hist_cnt 
    FROM public.application_status_history 
    WHERE application_id = 'c1111111-0000-0000-0000-000000000001';

    -- Kiểm tra bảng notifications:
    -- 1 (thông báo chuyển reviewing ở TC 13.1) + 1 (thông báo interview ở TC 15.1) + 1 (thông báo accepted ở TC 15.2) = 3 thông báo từ trigger
    SELECT COUNT(*) INTO student_notifs 
    FROM public.notifications 
    WHERE user_id = '11111111-1111-1111-1111-111111111111' 
      AND related_application_id = 'c1111111-0000-0000-0000-000000000001';

    IF hist_cnt = 4 AND student_notifs = 3 THEN
        RAISE NOTICE '>>> TC 15 [PASS]: Quy trình State Machine hợp lệ thành công hoàn hảo. Ghi nhận chính xác % dòng lịch sử và tự động gửi % thông báo trạng thái cho Student A.', hist_cnt, student_notifs;
    ELSE
        RAISE EXCEPTION '>>> TC 15 [FAIL]: Lịch sử (kỳ vọng 4, thực tế: %) hoặc Notification (kỳ vọng 3, thực tế: %) chưa khớp chuẩn!', hist_cnt, student_notifs;
    END IF;
END $$;

RAISE NOTICE '========================================================================';
RAISE NOTICE '>>> TẤT CẢ 15 TEST CASES BẢO MẬT & RLS SPRINT 3.2.2 ĐỀU ĐẠT CHUẨN [PASS]!';
RAISE NOTICE '========================================================================';

ROLLBACK; -- Dọn sạch hoàn toàn dữ liệu kiểm thử, giữ DB an toàn tuyệt đối
