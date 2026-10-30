-- =============================================================================
-- HỆ THỐNG CƠ SỞ DỮ LIỆU: NỀN TẢNG FREELANCE / MARKETPLACE VIỆC LÀM SINH VIÊN
-- Môn học: Chuyên đề Tốt nghiệp 2 - Đại học Văn Lang
-- Sinh viên thực hiện: Nguyễn Minh Phú (2374802013447) & Hà Đại Vĩ (2374802010551)
-- Giảng viên hướng dẫn: ThS. Nguyễn Văn Trung
-- Phiên bản: 1.0 (Hoàn thành Buổi 5 - Mốc Giữa kỳ 1)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `vlu_freelance_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `vlu_freelance_db`;

-- -----------------------------------------------------------------------------
-- 1. BẢNG USERS: Tài khoản đăng nhập tập trung (Sinh viên, NTD, Admin)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `applications`;
DROP TABLE IF EXISTS `jobs`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `student_profiles`;
DROP TABLE IF EXISTS `employer_profiles`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `role` ENUM('student', 'employer', 'admin') NOT NULL DEFAULT 'student',
    `is_verified` BOOLEAN NOT NULL DEFAULT FALSE,
    `avatar_url` VARCHAR(255) DEFAULT 'https://res.cloudinary.com/demo/image/upload/avatar-default.png',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. BẢNG STUDENT_PROFILES: Hồ sơ năng lực & CV của sinh viên
-- -----------------------------------------------------------------------------
CREATE TABLE `student_profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `student_code` VARCHAR(20) NOT NULL,
    `university` VARCHAR(100) NOT NULL DEFAULT 'Đại học Văn Lang',
    `major` VARCHAR(100) DEFAULT NULL,
    `skills` TEXT DEFAULT NULL,
    `cv_url` VARCHAR(255) DEFAULT NULL,
    `bio` TEXT DEFAULT NULL,
    `rating_avg` DECIMAL(2,1) NOT NULL DEFAULT 5.0,
    `total_reviews` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_student_code` (`student_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. BẢNG EMPLOYER_PROFILES: Hồ sơ nhà tuyển dụng / doanh nghiệp
-- -----------------------------------------------------------------------------
CREATE TABLE `employer_profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `company_name` VARCHAR(150) NOT NULL,
    `tax_code` VARCHAR(50) DEFAULT NULL,
    `address` VARCHAR(255) NOT NULL,
    `website` VARCHAR(150) DEFAULT NULL,
    `description` TEXT DEFAULT NULL,
    `rating_avg` DECIMAL(2,1) NOT NULL DEFAULT 5.0,
    `total_reviews` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX `idx_emp_company` (`company_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. BẢNG CATEGORIES: Danh mục ngành nghề công việc
-- -----------------------------------------------------------------------------
CREATE TABLE `categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL UNIQUE,
    `description` VARCHAR(255) DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. BẢNG JOBS: Tin đăng tuyển dụng việc làm
-- -----------------------------------------------------------------------------
CREATE TABLE `jobs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `employer_id` INT NOT NULL,
    `category_id` INT NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `requirements` TEXT DEFAULT NULL,
    `job_type` ENUM('part_time', 'freelance') NOT NULL DEFAULT 'part_time',
    `salary_amount` DECIMAL(12,2) NOT NULL,
    `salary_unit` ENUM('hourly', 'daily', 'monthly', 'project') NOT NULL DEFAULT 'hourly',
    `district` VARCHAR(50) NOT NULL,
    `work_shifts` VARCHAR(100) DEFAULT NULL,
    `deadline` DATE NOT NULL,
    `status` ENUM('pending', 'approved', 'closed', 'rejected') NOT NULL DEFAULT 'pending',
    `views_count` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`employer_id`) REFERENCES `employer_profiles`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT,
    INDEX `idx_jobs_filter` (`district`, `salary_amount`, `job_type`, `status`),
    INDEX `idx_jobs_deadline` (`deadline`),
    INDEX `idx_jobs_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. BẢNG APPLICATIONS: Đơn nộp hồ sơ ứng tuyển của sinh viên
-- -----------------------------------------------------------------------------
CREATE TABLE `applications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `job_id` INT NOT NULL,
    `student_id` INT NOT NULL,
    `cover_letter` TEXT DEFAULT NULL,
    `cv_file_url` VARCHAR(255) DEFAULT NULL,
    `status` ENUM('submitted', 'reviewed', 'accepted', 'rejected') NOT NULL DEFAULT 'submitted',
    `applied_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `student_profiles`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_job_student` (`job_id`, `student_id`),
    INDEX `idx_apps_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. BẢNG REVIEWS: Đánh giá uy tín 2 chiều sau khi hoàn thành việc
-- -----------------------------------------------------------------------------
CREATE TABLE `reviews` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `job_id` INT NOT NULL,
    `reviewer_id` INT NOT NULL,
    `reviewee_id` INT NOT NULL,
    `rating_score` INT NOT NULL CHECK (`rating_score` BETWEEN 1 AND 5),
    `comment` TEXT DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`reviewee_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_review_pair` (`job_id`, `reviewer_id`, `reviewee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- DỮ LIỆU KHỞI TẠO MẪU (SEED DATA SẴN SÀNG CHO BUỔI 6 CODE)
-- -----------------------------------------------------------------------------
INSERT INTO `categories` (`name`, `slug`, `description`) VALUES
('Lập trình & CNTT', 'lap-trinh-cntt', 'Web, Mobile, Tester, Data entry cho sinh viên'),
('Thiết kế đồ họa & Video', 'thiet-ke-do-hoa', 'Banner, Logo, Photoshop, Edit video TikTok/Reels'),
('Gia sư & Dạy kèm', 'gia-su-day-kem', 'Dạy kèm Toán, Lý, Hóa, Tiếng Anh cho học sinh'),
('Phục vụ & Bán hàng', 'phuc-vu-ban-hang', 'Thu ngân, Barista, Nhân viên phục vụ quán cafe'),
('Marketing & Content', 'marketing-content', 'Viết bài fanpage, Seeding, Tổ chức sự kiện');

-- Admin mặc định (Pass: Admin@123 - bcrypt)
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `phone`, `role`, `is_verified`, `is_active`) VALUES
('admin@freelance.vlu.edu.vn', '$2a$10$wT8K8U4MhW9b/s41qK9fXe4vFv1pZkJY0eBqm1FmF5wU2.v4M5n7e', 'Quản trị viên Hệ thống', '0901234567', 'admin', TRUE, TRUE);

-- Tài khoản NTD mẫu
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `phone`, `role`, `is_verified`, `is_active`) VALUES
('tuyendung.demo@gmail.com', '$2a$10$wT8K8U4MhW9b/s41qK9fXe4vFv1pZkJY0eBqm1FmF5wU2.v4M5n7e', 'Công ty TNHH Truyền thông Sáng tạo VLU', '0988776655', 'employer', TRUE, TRUE);

INSERT INTO `employer_profiles` (`user_id`, `company_name`, `tax_code`, `address`, `website`, `description`) VALUES
(2, 'Công ty TNHH Truyền thông Sáng tạo VLU', '0312345678', '69/68 Đặng Thùy Trâm, P. 13, Bình Thạnh, TP.HCM', 'https://vlumedia.vn', 'Doanh nghiệp truyền thông đối tác trường ĐH Văn Lang');

-- Tài khoản Sinh viên mẫu
INSERT INTO `users` (`email`, `password_hash`, `full_name`, `phone`, `role`, `is_verified`, `is_active`) VALUES
('sinhvien.demo@student.vlu.edu.vn', '$2a$10$wT8K8U4MhW9b/s41qK9fXe4vFv1pZkJY0eBqm1FmF5wU2.v4M5n7e', 'Nguyễn Minh Phú', '0911223344', 'student', TRUE, TRUE);

INSERT INTO `student_profiles` (`user_id`, `student_code`, `university`, `major`, `skills`, `bio`) VALUES
(3, '2374802013447', 'Đại học Văn Lang', 'Công nghệ Thông tin', 'ReactJS, Node.js, MySQL, Figma, Git', 'Sinh viên năm cuối ngành CNTT, tìm kiếm việc làm part-time lập trình Web.');

-- Tin tuyển dụng mẫu
INSERT INTO `jobs` (`employer_id`, `category_id`, `title`, `description`, `requirements`, `job_type`, `salary_amount`, `salary_unit`, `district`, `work_shifts`, `deadline`, `status`) VALUES
(1, 1, 'Tuyển Sinh viên Thực tập Lập trình Frontend ReactJS', 'Hỗ trợ cắt giao diện Website từ Figma sang ReactJS, tối ưu responsive trên mobile.', 'Biết HTML/CSS/JavaScript, React cơ bản. Ưu tiên sinh viên Văn Lang.', 'part_time', 45000.00, 'hourly', 'Bình Thạnh', 'Sáng T2-T4-T6 (8h00 - 12h00)', DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY), 'approved'),
(1, 4, 'Nhân viên Phục vụ Quán Cafe Sách (Linh hoạt ca học)', 'Order nước, bưng bê và dọn dẹp bàn theo ca 4 tiếng phù hợp lịch học.', 'Nhanh nhẹn, trung thực, thái độ vui vẻ.', 'part_time', 30000.00, 'hourly', 'Gò Vấp', 'Ca tối 17h00 - 21h00', DATE_ADD(CURRENT_DATE, INTERVAL 20 DAY), 'approved');
