# BẢNG LẬP KẾ HOẠCH SPRINT & PHÂN CHIA VAI TRÒ KỸ THUẬT (NHÓM 2 NGƯỜI)
**Môn học:** Chuyên đề Tốt nghiệp 2  
**Đề tài:** Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên  
**Tài liệu tham chiếu:** Slide bài giảng Buổi 3 (`Buoi03_ChuyenDeTotNghiep2.pdf`)  

---

## 1. BẢNG PHÂN VAI TRÒ KỸ THUẬT NÓI KHÔNG CHỒNG CHÉO (2 NGƯỜI)

Theo hướng dẫn tại **Slide Buổi 3 (Trang 3 & 6)**: Với nhóm ít người (2 sinh viên), mỗi người sẽ đảm nhiệm một nhóm vai trò kỹ thuật liên hoàn từ Thiết kế $\rightarrow$ Lập trình $\rightarrow$ Tích hợp:

| Vai trò Kỹ thuật | Thành viên đảm nhiệm | Trách nhiệm chính | Nhiệm vụ cụ thể qua 10 buổi |
| :--- | :--- | :--- | :--- |
| **Backend, Database & Systems Lead** | **Nguyễn Minh Phú**<br>*(Nhóm trưởng - MSSV: 2374802013447)* | Phụ trách toàn bộ CSDL, REST API Backend, Bảo mật & Triển khai Server. | • Thiết kế Sơ đồ Kiến trúc & CSDL Relational Schema (ERD).<br>• Lập trình REST API (Auth, Đăng tin, Admin, Đánh giá).<br>• Cấu hình bảo mật Bcrypt, JWT Token, CORS.<br>• Kết nối CSDL Cloud & Deploy Server (Render/Railway). |
| **Frontend, UI/UX & QA/Testing Lead** | **Hà Đại Vĩ**<br>*(Thành viên - MSSV: 2374802010551)* | Phụ trách Thiết kế Giao diện UI/UX, Lập trình Web Client & Kiểm thử. | • Vẽ Sơ đồ Use Case & Thiết kế Wireframes UI trên Figma.<br>• Lập trình Giao diện Web Client (React/Next.js).<br>• Ghép nối API Tìm kiếm/Lọc việc & Form nộp đơn CV.<br>• Kiểm thử E2E, sửa lỗi Responsive & Quay Video Demo. |

---

## 2. BẢNG KẾ HOẠCH SPRINT ÁNH XẠ CHÍNH XÁC THEO 10 BUỔI

Dựa trên cấu trúc 5 Sprint của môn học (Slide Buổi 3 Trang 3 & 6):

| Sprint | Buổi | Mục tiêu Sprint | Công việc Nguyễn Minh Phú (Backend/DB) | Công việc Hà Đại Vĩ (Frontend/QA) | Demo / Output đạt được |
| :---: | :---: | :--- | :--- | :--- | :--- |
| **Sprint 0** | **Buổi 1–3** | Discovery & Planning | • Viết bài toán 5W1H trong SRS.<br>• Lập Product Backlog (MoSCoW). | • Khảo sát nhu cầu SV & NTD.<br>• Viết Yêu cầu FR/NFR & làm Slide. | Bản SRS Rút gọn & Product Backlog trên Excel. |
| **Sprint 1** | **Buổi 4–5** | Design Sprint | • Vẽ Sơ đồ Kiến trúc Hệ thống.<br>• Thiết kế CSDL (ERD/Schema). | • Vẽ Sơ đồ Use Case tổng thể/phân rã.<br>• Thiết kế UI Figma Wireframes. | Sơ đồ Kiến trúc + CSDL ERD + Figma UI Mockup. |
| **Sprint 2** | **Buổi 6–7** | Core Build Sprint | • Dựng Base Source Code Backend.<br>• Viết API Auth, Đăng tin & Tìm kiếm. | • Dựng Base Source Code Frontend.<br>• Dựng UI Auth, Lọc việc & Nộp đơn. | **Demo Mốc 1 (Buổi 7):** Chạy được Auth, Đăng tin & Nộp đơn. |
| **Sprint 3** | **Buổi 8–9** | Advanced & Deploy | • Viết API Rating, Review & Admin.<br>• Deploy Backend lên Server Cloud. | • Dựng UI Đánh giá 2 chiều & Admin.<br>• Test E2E & Deploy Frontend Vercel. | **Demo Mốc 2 (Buổi 9):** Web App chạy mượt online + Test Report. |
| **Sprint 4** | **Buổi 10** | Report & Defense | • Tổng hợp Báo cáo Word/PDF.<br>• Trả lời phản biện Backend/CSDL. | • Làm Slide PowerPoint báo cáo.<br>• Quay Video Demo 3-5 phút & Thuyết trình. | Cuốn Báo cáo + Slide + Video Demo + Bảo vệ thành công. |

---

## 3. BẢNG CHUYỂN ĐỔI PRODUCT BACKLOG SANG KẾ HOẠCH SPRINT (MOSCOW)

| Mã YC | Tên Tính năng | Nhãn MoSCoW | Phân công | Buổi hoàn thành dự kiến | Cách thức Demo tiến độ |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **FR-01** | Tài khoản & Đăng nhập | **Must-have** | Phú & Vĩ | **Buổi 6** | Demo Đăng ký / Đăng nhập tạo Token JWT. |
| **FR-02** | Xác thực Email Sinh viên | **Must-have** | Phú | **Buổi 6** | Demo gửi mail xác thực `@student.vlu.edu.vn`. |
| **FR-03** | Profile & CV Sinh viên | **Must-have** | Vĩ | **Buổi 6** | Demo cập nhật Kỹ năng, Portfolio, đính kèm CV PDF. |
| **FR-04** | Profile Nhà tuyển dụng | **Must-have** | Phú | **Buổi 6** | Demo nhập MST/Giấy phép kinh doanh. |
| **FR-05** | Đăng tin tuyển dụng | **Must-have** | Phú & Vĩ | **Buổi 7** | Demo NTD tạo tin tuyển dụng có ca làm/mức lương. |
| **FR-06** | Quản lý tin đăng | **Must-have** | Phú | **Buổi 7** | Demo Ẩn/Hiện/Sửa/Xóa tin tuyển dụng. |
| **FR-07** | Tìm kiếm & Lọc công việc | **Must-have** | Vĩ | **Buổi 7** | Demo lọc theo quận/huyện, ca rảnh & mức lương. |
| **FR-08** | Ứng tuyển công việc | **Must-have** | Vĩ | **Buổi 7** | Demo Sinh viên chọn việc, nhập Cover Letter & Nộp đơn. |
| **FR-09** | Duyệt hồ sơ ứng viên | **Must-have** | Phú & Vĩ | **Buổi 7** | Demo NTD đổi trạng thái đơn (*Duyệt / Từ chối*). |
| **FR-10** | Thông báo trạng thái | **Should-have** | Vĩ | **Buổi 8** | Demo nhận Notification khi được duyệt việc. |
| **FR-11** | Đánh giá 2 chiều | **Should-have** | Phú & Vĩ | **Buổi 8** | Demo Chấm sao & viết Review sau khi xong việc. |
| **FR-12** | Hiển thị điểm uy tín | **Should-have** | Vĩ | **Buổi 8** | Demo hiển thị điểm Rating công khai trên Profile. |
| **FR-13** | Admin kiểm duyệt tin | **Must-have** | Phú | **Buổi 8** | Demo Admin xem danh sách tin & nhấn Duyệt/Từ chối. |
| **FR-14** | Admin quản lý người dùng | **Must-have** | Phú | **Buổi 8** | Demo Admin Khóa/Mở khóa tài khoản vi phạm. |
