# HƯỚNG DẪN HOÀN THÀNH TRỌN VẸN BUỔI 5: THIẾT KẾ CHI TIẾT
## (MỐC ĐÁNH GIÁ GIỮA KỲ 1 - RUBRIC 2: 30% ĐIỂM TỔNG KẾT)

**Môn học:** Chuyên đề Tốt nghiệp 2  
**Đề tài:** Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên  
**Chuyên ngành:** Công nghệ Phần mềm (CNPM)  
**Nhóm sinh viên thực hiện:**  
1. **Nguyễn Minh Phú** (MSSV: 2374802013447) - Nhóm trưởng / Backend, CSDL & API Contract  
2. **Hà Đại Vĩ** (MSSV: 2374802010551) - Thành viên / Frontend, Wireframe UI/UX & Figma  
**Giảng viên hướng dẫn:** ThS. Nguyễn Văn Trung  

---

## 🎯 1. TỔNG QUAN YÊU CẦU ĐÁNH GIÁ BUỔI 5 (THEO SLIDE GIẢNG VIÊN)

Buổi 5 là **Mốc đánh giá giữa kỳ lần 1**, Giảng viên hướng dẫn chấm điểm dựa trên 2 căn cứ:
1. **Mức độ hoàn chỉnh của Bộ hồ sơ Thiết kế chi tiết** so với Kiến trúc tổng thể đã duyệt ở Buổi 4.
2. **Sổ Nhật ký thực hiện đề tài từ Buổi 1 đến Buổi 5** (đối chiếu sự phân công và tiến độ thực tế).
3. **Môi trường phát triển đã sẵn sàng** để bước vào giai đoạn Code ở Buổi 6.

---

## 💾 2. TRỤ CỘT 1: THIẾT KẾ CƠ SỞ DỮ LIỆU CHI TIẾT (ERD) *(Phú phụ trách)*

### 2.1. Cấu trúc 7 bảng chuẩn hóa 3NF:
* **`users`:** Bảng tài khoản tập trung (`id`, `email`, `password_hash`, `full_name`, `phone`, `role`, `is_verified`, `avatar_url`).
* **`student_profiles`:** Hồ sơ sinh viên (`id`, `user_id` FK, `student_code`, `university`, `major`, `skills`, `cv_url`, `bio`, `rating_avg`).
* **`employer_profiles`:** Hồ sơ NTD (`id`, `user_id` FK, `company_name`, `tax_code`, `address`, `website`, `description`, `rating_avg`).
* **`categories`:** Ngành nghề (`id`, `name`, `slug`, `description`).
* **`jobs`:** Tin việc làm (`id`, `employer_id` FK, `category_id` FK, `title`, `description`, `requirements`, `job_type`, `salary_amount`, `salary_unit`, `district`, `deadline`, `status`).
* **`applications`:** Đơn ứng tuyển (`id`, `job_id` FK, `student_id` FK, `cover_letter`, `cv_file_url`, `status`, `applied_at`).
* **`reviews`:** Đánh giá 2 chiều (`id`, `job_id` FK, `reviewer_id` FK, `reviewee_id` FK, `rating_score`, `comment`).

### 2.2. Sản phẩm bàn giao đính kèm:
* **File Sơ đồ ERD trực quan (draw.io):** [`D:\CDTN2\02_Bai_Tap_De_Nop\SoDo_ERD_Database.drawio`](file:///D:/CDTN2/02_Bai_Tap_De_Nop/SoDo_ERD_Database.drawio)
* **File SQL Script khởi tạo Database & Seed Data mẫu:** [`D:\CDTN2\02_Bai_Tap_De_Nop\database_schema.sql`](file:///D:/CDTN2/02_Bai_Tap_De_Nop/database_schema.sql)

---

## 🔌 3. TRỤ CỘT 2: ĐẶC TẢ API CONTRACT CHUẨN RESTFUL *(Phú phụ trách)*

| Mã API | Endpoint & Method | Quyền hạn (Role) | Request Body / Query Params | Response JSON & HTTP Status |
| :---: | :--- | :---: | :--- | :--- |
| **API-01** | `POST /api/auth/register` | Public | `{ email, password, full_name, role, student_code/tax_code }` | `201 Created -> { token, user }` |
| **API-02** | `POST /api/auth/login` | Public | `{ email, password }` | `200 OK -> { token, user }` |
| **API-03** | `GET /api/jobs` | Public | `?keyword=&category=&district=&min_salary=&job_type=&page=` | `200 OK -> { total, jobs: [...] }` |
| **API-04** | `POST /api/jobs` | Employer | Header `Bearer Token`<br>`{ title, category_id, description, salary_amount, district, deadline }` | `201 Created -> { message: "Tin đang chờ duyệt", jobId }` |
| **API-05** | `POST /api/applications` | Student | Header `Bearer Token`<br>`{ jobId, cover_letter, cv_file_url }` | `201 Created -> { message: "Nộp hồ sơ thành công", appId }` |
| **API-06** | `PUT /api/applications/:id/status` | Employer | Header `Bearer Token`<br>`{ status: "accepted" / "rejected" }` | `200 OK -> { message: "Đã cập nhật trạng thái" }` |
| **API-07** | `POST /api/reviews` | SV & NTD | Header `Bearer Token`<br>`{ jobId, revieweeId, rating_score, comment }` | `201 Created -> { message: "Đánh giá thành công" }` |
| **API-08** | `PUT /api/admin/jobs/:id/status` | Admin | Header `Bearer Token`<br>`{ status: "approved" / "rejected" }` | `200 OK -> { message: "Đã duyệt tin" }` |

---

## 🎨 4. TRỤ CỘT 3: THIẾT KẾ WIREFRAME UI/UX (FIGMA SPECS) *(Đại Vĩ phụ trách)*

5 màn hình giao diện cốt lõi tối ưu Responsive Mobile:
1. **Trang chủ & Bộ lọc việc làm (Home & Search UI):**
   * Header: Logo, Thanh tìm kiếm từ khóa, Nút Đăng tin / Đăng nhập.
   * Thanh lọc bên trái: Lọc theo Quận/Huyện TP.HCM, Khoảng lương, Ca rảnh, Loại việc (Part-time / Freelance).
   * Danh sách Job Card: Hiển thị tên việc, mức lương/giờ, địa điểm, hạn nộp và logo NTD.
2. **Trang Chi tiết công việc & Form Nộp đơn (Job Detail & Apply Modal):**
   * Thông tin chi tiết công ty, mức lương, quyền lợi, lịch làm việc.
   * Form nộp đơn: Nút nộp 1 chạm lấy CV PDF có sẵn trong Profile hoặc chọn file mới, ô nhập Lời nhắn (Cover Letter).
3. **Trang Quản lý Ứng viên của Nhà tuyển dụng (Applicant Management):**
   * Bảng danh sách ứng viên đã nộp: Tên sinh viên, Trường, Điểm đánh giá sao, Nút Xem online CV PDF.
   * Nút hành động: **[Duyệt phỏng vấn]** / **[Từ chối]**.
4. **Trang Hồ sơ Sinh viên (Student Profile):**
   * Avatar, Họ tên, Email trường `@student.vlu.edu.vn` (có huy hiệu xanh Đã xác thực), Danh sách kỹ năng (Tags), Tệp CV PDF đính kèm.
5. **Dashboard Quản trị viên (Admin Portal):**
   * Danh sách tin chờ duyệt, nút Duyệt / Từ chối (nhập lý do nghi ngờ lừa đảo).
   * Danh sách tài khoản bị người dùng báo cáo (Report).

---

## 📊 5. ĐỐI CHIẾU NHẬT KÝ THỰC HIỆN ĐỀ TÀI (BUỔI 1 $\rightarrow$ 5)

Mở file Excel: [`D:\CDTN2\02_Bai_Tap_De_Nop\NhatKy_Sprint_Theo_Mau_Excel_GV.xlsx`](file:///D:/CDTN2/02_Bai_Tap_De_Nop/NhatKy_Sprint_Theo_Mau_Excel_GV.xlsx)
* **Sprint 0 (Buổi 1–3):** Hoàn thành Đăng ký đề tài, SRS rút gọn 14 FRs/4 NFRs, Product Backlog MoSCoW. (100%)
* **Sprint 1 (Buổi 4–5):**
  * *Buổi 4:* Sơ đồ Kiến trúc 3-Tier (`SoDo_KienTruc_HeThong.drawio`) & Sơ đồ Use Case 4 Tabs (`SoDo_UseCase_TongThe.drawio`).
  * *Buổi 5:* Sơ đồ CSDL ERD 7 bảng (`SoDo_ERD_Database.drawio`) + Kịch bản SQL (`database_schema.sql`) + Báo cáo Word Buổi 5. (100%)

---

## 🎤 6. KỊCH BẢN BẢO VỆ MỐC GIỮA KỲ 1 TRƯỚC GVHD (3 PHÚT)

> *"Kính chào Thầy! Đại diện nhóm 2 thành viên (Nguyễn Minh Phú & Hà Đại Vĩ), em xin báo cáo tiến độ Mốc Đánh giá Giữa kỳ 1:
> 
> * **1. Về tiến độ làm việc:** Nhóm đã hoàn thành 100% Sprint 0 và Sprint 1 theo đúng kế hoạch đề ra trong sổ Nhật ký.
> * **2. Về Cơ sở dữ liệu:** Bạn Phú đã thiết kế hoàn chỉnh Sơ đồ ERD gồm 7 bảng chuẩn hóa 3NF, xử lý triệt để quan hệ 1-1 giữa Users với Profiles, và 1-N giữa Tin tuyển dụng với Đơn ứng tuyển và Đánh giá. Nhóm đã viết sẵn file SQL `database_schema.sql` có dữ liệu mẫu sẵn sàng import.
> * **3. Về API Contract:** Đã chuẩn hóa 8 RESTful API endpoints có mã trạng thái HTTP rõ ràng và phân quyền bảo mật qua Token JWT.
> * **4. Về Giao diện:** Bạn Vĩ đã hoàn thành Wireframe 5 màn hình cốt lõi trên Figma, tối ưu hiển thị trên di động.
> * **5. Về Môi trường code:** Cả 2 bạn đã cài đặt xong Node.js, React, MySQL, Postman và test kết nối thành công, sẵn sàng bước vào Sprint code đầu tiên ở Buổi 6.
> 
> *Nhóm em kính mong Thầy góp ý để nhóm bắt đầu lập trình tính năng Auth và Profile ở Buổi 6 ạ!"*

---

## 🎙️ 7. ĐÁP ÁN 2 CÂU HỎI THẢO LUẬN CỦA GVHD (SLIDE TRANG 11)

1. **Câu 1 (Tự tin nhất / Lo lắng nhất):**
   * *Tự tin nhất:* Cấu trúc CSDL ERD 7 bảng chuẩn hóa 3NF, phân tách rõ ràng vai trò giữa Sinh viên và NTD.
   * *Lo lắng nhất:* Tối ưu tốc độ bộ lọc tìm việc khi nhiều người truy cập đồng thời $\rightarrow$ Đã khắc phục bằng cách đánh chỉ mục `INDEX` trên các cột `district`, `salary_amount`, `status`.
2. **Câu 2 (Cắt giảm phạm vi nếu thiếu thời gian):**
   * Nhóm sẽ tạm hoãn tính năng *Chat Realtime* và *Thanh toán tự động*, giữ vững 100% luồng cốt lõi: *Đăng tin $\rightarrow$ Lọc việc $\rightarrow$ Ứng tuyển $\rightarrow$ Duyệt hồ sơ $\rightarrow$ Đánh giá 2 chiều*.
