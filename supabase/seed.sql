-- ==============================================================================
-- STUDENTHUB - SAMPLE SEED DATA FOR SUPABASE
-- Dữ liệu mẫu ban đầu để test hệ thống sau khi chạy schema.sql
-- ==============================================================================

-- 1. Insert Sample Profiles (Dùng ID mẫu cố định hoặc mapping sau khi đăng ký)
INSERT INTO public.profiles (id, full_name, email, role, avatar_url, phone, bio, location)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Nguyễn Minh Anh', 'student@studenthub.vn', 'student', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80', '0901234567', 'Sinh viên Marketing năm 3 tại UEH đam mê sáng tạo nội dung số, thiết kế Canva và kịch bản video TikTok.', 'Quận 3, TP. Hồ Chí Minh'),
    ('b0000000-0000-0000-0000-000000000002', 'Chị Mai - HR ABC Media', 'employer@abcmedia.vn', 'employer', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80', '0987654321', 'HR Manager tại ABC Media Studio - Chuyên sản xuất nội dung viral F&B.', 'Quận 1, TP. Hồ Chí Minh'),
    ('c0000000-0000-0000-0000-000000000003', 'Admin Hệ Thống', 'admin@studenthub.vn', 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80', '0911223344', 'Quản trị viên hệ thống StudentHub', 'TP. Hồ Chí Minh')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Student Profile cho Minh Anh
INSERT INTO public.student_profiles (user_id, university, major, graduation_year, experience, availability, cv_url, portfolio_url)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Đại học Kinh tế TP.HCM (UEH)',
    'Marketing Số & Truyền thông Đa phương tiện',
    '2027',
    'Đã hoàn thành 12 dự án thiết kế Canva và sáng tạo nội dung TikTok cho các chuỗi F&B.',
    'Linh hoạt theo lịch học (ưu tiên buổi tối & cuối tuần)',
    'https://studenthub.vn/uploads/CV_NguyenMinhAnh_Marketing.pdf',
    'https://behance.net/minhanh-ueh'
)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Insert Company cho Employer ABC Media
INSERT INTO public.companies (id, owner_id, company_name, logo_url, description, website, location)
VALUES (
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'ABC Media Studio',
    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80',
    'Creative agency trẻ trung chuyên sáng tạo nội dung viral trên TikTok và Facebook cho các thương hiệu F&B.',
    'https://abcmedia.vn',
    'Quận 1, TP. Hồ Chí Minh'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Sample Jobs
INSERT INTO public.jobs (
    id, employer_id, company_id, title, description, job_type, location,
    salary_min, salary_max, skills, requirements, benefits, working_hours, deadline, status
)
VALUES
    (
        'e0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000002',
        'd0000000-0000-0000-0000-000000000001',
        'Social Media Content Creator',
        'ABC Media cần tìm 2 bạn sinh viên năng động, thích lướt TikTok và có khả năng viết lách tốt để lên ý tưởng kịch bản và thiết kế ấn phẩm Canva.',
        'Part-time',
        'Quận 1, TP. Hồ Chí Minh (hoặc Remote)',
        3000000,
        5000000,
        ARRAY['Content', 'TikTok', 'Canva'],
        ARRAY['Sinh viên khối ngành Marketing/Kinh tế', 'Sử dụng thành thạo Canva, CapCut', 'Có laptop cá nhân'],
        ARRAY['Thù lao ký quỹ an toàn', 'Hỗ trợ mộc thực tập', 'Đào tạo 1-1 từ Senior Marketer'],
        '18:00 – 21:00 (Linh hoạt theo lịch học)',
        '2026-11-20',
        'published'
    ),
    (
        'e0000000-0000-0000-0000-000000000002',
        'b0000000-0000-0000-0000-000000000002',
        'd0000000-0000-0000-0000-000000000001',
        'Video Editor TikTok & CapCut Part-time',
        'Cắt ghép video thô, chỉnh màu cơ bản, chèn nhạc bắt trend và subtitle chữ chạy cho kênh thời trang GenZ.',
        'Freelance',
        'Remote (Tại nhà)',
        4000000,
        6500000,
        ARRAY['Video Editing', 'TikTok', 'CapCut'],
        ARRAY['Thành thạo CapCut PC/Mobile', 'Có mắt thẩm mỹ tốt về font chữ và nhịp cắt'],
        ARRAY['Cung cấp tài khoản CapCut Pro', 'Thù lao tính theo số lượng video bàn giao'],
        '15 – 20 giờ/tuần',
        '2026-11-25',
        'published'
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Sample Application
INSERT INTO public.job_applications (
    job_id, student_id, cv_url, cover_letter, status
)
VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'https://studenthub.vn/uploads/CV_NguyenMinhAnh_Marketing.pdf',
    'Em là sinh viên Marketing UEH, đã có kinh nghiệm thiết kế Canva và quản trị Fanpage thực tế. Rất mong có cơ hội đồng hành cùng ABC Media!',
    'interview'
)
ON CONFLICT (job_id, student_id) DO NOTHING;

-- 6. Insert Sample Saved Job
INSERT INTO public.saved_jobs (user_id, job_id)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001'
)
ON CONFLICT (user_id, job_id) DO NOTHING;
