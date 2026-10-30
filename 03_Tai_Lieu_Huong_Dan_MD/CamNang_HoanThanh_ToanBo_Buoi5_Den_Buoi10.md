# CẨM NANG TOÀN DIỆN HOÀN THÀNH TỪ BUỔI 5 ĐẾN BUỔI 10
**Môn học:** Chuyên đề Tốt nghiệp 2  
**Đề tài:** Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên  
**Chuyên ngành:** Công nghệ Phần mềm (CNPM)  
**Nhóm sinh viên thực hiện:**  
1. **Nguyễn Minh Phú** (MSSV: 2374802013447) - Nhóm trưởng / Backend, CSDL & Quản trị  
2. **Hà Đại Vĩ** (MSSV: 2374802010551) - Thành viên / Frontend, UI/UX & QA Tester  
**Giảng viên hướng dẫn:** ThS. Nguyễn Văn Trung  

---

## 🗺️ TỔNG QUAN LỘ TRÌNH TỪ BUỔI 5 ĐẾN BUỔI 10

```
BUỔI 5 (Mốc Giữa kỳ 1 - 30%)  ──> Thiết kế chi tiết CSDL (ERD) & API Contract
       │
BUỔI 6 (Core Build - Sprint 1)──> Base Source Code, Auth (JWT) & Profile SV
       │
BUỔI 7 (Mốc Giữa kỳ 2 - 30%)  ──> Tích hợp Đăng tin - Lọc việc - Nộp đơn & Demo
       │
BUỔI 8 (Testing & Optimize)   ──> Viết Unit/Integration Test Cases & Sửa lỗi
       │
BUỔI 9 (Deployment & Report)  ──> Deploy Cloud (Vercel + Render) & Nháp Báo cáo
       │
BUỔI 10 (Final Polish)        ──> Slide PowerPoint, Video Demo & Bảo vệ (60%)
```

---

## 📍 BUỔI 5: THIẾT KẾ CHI TIẾT (MỐC ĐÁNH GIÁ GIỮA KỲ 1 - RUBRIC 2)
* **Trọng tâm buổi học:** Chấm điểm Mốc giữa kỳ lần 1 (chiếm 30% tổng kết môn học).
* **Nội dung kỹ thuật cần làm:**
  1. **Thiết kế Cơ sở dữ liệu quan hệ (ERD Diagram):**
     * 7 bảng chuẩn hóa 3NF: `users`, `student_profiles`, `employer_profiles`, `categories`, `jobs`, `applications`, `reviews`.
     * File vẽ sẵn bằng draw.io: [`D:\CDTN2\02_Bai_Tap_De_Nop\SoDo_ERD_Database.drawio`](file:///D:/CDTN2/02_Bai_Tap_De_Nop/SoDo_ERD_Database.drawio).
  2. **Đặc tả API Contract chuẩn RESTful:**
     * `POST /api/auth/register`, `POST /api/auth/login` (Auth & JWT).
     * `GET /api/jobs`, `POST /api/jobs` (Tìm kiếm & Đăng tin).
     * `POST /api/applications`, `PUT /api/applications/:id/status` (Nộp đơn & Duyệt hồ sơ).
     * `POST /api/reviews` (Đánh giá 2 chiều).
* **File nộp / Báo cáo chính thức:**  
  👉 [`D:\CDTN2\02_Bai_Tap_De_Nop\Buoi05_ThietKeChiTiet_CSDL_API.docx`](file:///D:/CDTN2/02_Bai_Tap_De_Nop/Buoi05_ThietKeChiTiet_CSDL_API.docx)

---

## 📍 BUỔI 6: XÂY DỰNG SẢN PHẨM - SPRINT 1 (CORE BUILD 1)
* **Trọng tâm buổi học:** Bắt đầu giai đoạn Code, hoàn thành tính năng nền móng.
* **Nội dung kỹ thuật cần làm:**
  1. **Khởi tạo Monorepo:** Thư mục `client/` (ReactJS + TailwindCSS) và `server/` (Node.js Express).
  2. **Lập trình Module Auth:**
     * Mã hóa mật khẩu an toàn bằng thư viện `bcryptjs`.
     * Sinh mã định danh phiên làm việc `jsonwebtoken` (JWT) có hạn sử dụng 7 ngày.
     * Xây dựng middleware xác thực và phân quyền 3 roles (`student`, `employer`, `admin`).
  3. **Lập trình Module Profile:**
     * Sinh viên cập nhật kỹ năng, ngành học, tải ảnh thẻ SV để xác thực đuôi email trường `@student.vlu.edu.vn`.
     * Tích hợp Cloudinary API để lưu file CV PDF.
* **File nộp / Báo cáo tiến độ:**  
  👉 [`D:\CDTN2\02_Bai_Tap_De_Nop\Buoi06_XayDungSanPham_Sprint1.docx`](file:///D:/CDTN2/02_Bai_Tap_De_Nop/Buoi06_XayDungSanPham_Sprint1.docx)

---

## 📍 BUỔI 7: XÂY DỰNG SẢN PHẨM - SPRINT 2 (MỐC ĐÁNH GIÁ GIỮA KỲ 2 - RUBRIC 2)
* **Trọng tâm buổi học:** Chấm điểm Mốc giữa kỳ lần 2 (Demo hệ thống chạy được luồng đầy đủ).
* **Nội dung kỹ thuật cần làm:**
  1. **Tích hợp liên thông End-to-End giữa Frontend và Backend:**
     * Nhà tuyển dụng đăng tin tuyển dụng part-time/freelance.
     * Sinh viên dùng bộ lọc thông minh (theo Quận, Mức lương) để tìm thấy tin đăng.
     * Sinh viên nộp đơn ứng tuyển kèm CV PDF và Lời nhắn.
     * Nhà tuyển dụng mở danh sách ứng viên, xem CV và chuyển trạng thái (*Duyệt / Từ chối*).
  2. **Bảng Đánh giá Go / No-Go:** Điều chỉnh phạm vi nếu cần (giữ vững các chức năng Must-have cốt lõi, tạm hoãn các chức năng Could-have phức tạp như Chat Realtime sang giai đoạn sau).
* **File nộp / Báo cáo chính thức:**  
  👉 [`D:\CDTN2\02_Bai_Tap_De_Nop\Buoi07_XayDungSanPham_Sprint2_TichHop.docx`](file:///D:/CDTN2/02_Bai_Tap_De_Nop/Buoi07_XayDungSanPham_Sprint2_TichHop.docx)

---

## 📍 BUỔI 8: KIỂM THỬ VÀ TINH CHỈNH TỐI ƯU SẢN PHẨM (TESTING)
* **Trọng tâm buổi học:** Thực hiện kiểm thử Unit Test & Integration Test, sửa toàn bộ lỗi phát hiện.
* **Nội dung kỹ thuật cần làm:**
  1. **Thực thi 10 Test Cases mẫu:**
     * Đăng ký email hợp lệ, kiểm tra trùng email, nhập sai mật khẩu.
     * Đăng tin thiếu thông tin, tìm kiếm việc theo quận huyện.
     * Kiểm tra trường hợp biên: Ứng tuyển vào tin việc làm đã hết hạn hoặc đã đóng $\rightarrow$ Hệ thống phải chặn đúng.
  2. **Tối ưu hóa hiệu năng (Performance Optimization):**
     * Đánh chỉ mục (Index) trên các cột `district`, `salary_amount`, `job_type` trong CSDL MySQL, giảm thời gian phản hồi API tìm kiếm xuống dưới 300ms.
     * Sửa lỗi giao diện trên các dòng điện thoại di động (Mobile Responsive).
* **File nộp / Báo cáo chính thức:**  
  👉 [`D:\CDTN2\02_Bai_Tap_De_Nop\Buoi08_KiemThu_Va_ToiUuHeThong.docx`](file:///D:/CDTN2/02_Bai_Tap_De_Nop/Buoi08_KiemThu_Va_ToiUuHeThong.docx)

---

## 📍 BUỔI 9: TRIỂN KHAI CLOUD VÀ HOÀN THIỆN BẢN NHÁP BÁO CÁO
* **Trọng tâm buổi học:** Đưa sản phẩm lên môi trường Internet độc lập và hoàn thiện khung báo cáo khóa luận.
* **Nội dung kỹ thuật cần làm:**
  1. **Triển khai Cloud miễn phí:**
     * Frontend: Triển khai trên **Vercel** (`https://freelance-student-vlu.vercel.app`).
     * Backend: Triển khai trên **Render** (`https://freelance-api-vlu.onrender.com`).
     * Database: Kết nối **Supabase PostgreSQL / Cloud Database**.
  2. **Chuẩn bị 3 tài khoản Demo có sẵn dữ liệu mẫu:**
     * Tài khoản Sinh viên: `sinhvien.demo@student.vlu.edu.vn` (Mật khẩu: `123456`).
     * Tài khoản Nhà tuyển dụng: `tuyendung.demo@gmail.com` (Mật khẩu: `123456`).
     * Tài khoản Admin: `admin.demo@gmail.com` (Mật khẩu: `Admin@123`).
  3. **Khung Báo cáo tổng kết 8 chương:** Dựa trên mẫu chuẩn của Đại học Văn Lang.
* **File nộp / Báo cáo chính thức:**  
  👉 [`D:\CDTN2\02_Bai_Tap_De_Nop\Buoi09_TrienKhai_Va_BanNhapBaoCao.docx`](file:///D:/CDTN2/02_Bai_Tap_De_Nop/Buoi09_TrienKhai_Va_BanNhapBaoCao.docx)

---

## 📍 BUỔI 10: TỔNG KẾT ĐỒ ÁN, SLIDE BÁO CÁO & BẢO VỆ CHÍNH THỨC
* **Trọng tâm buổi học:** Tập dượt thuyết trình trước GVHD, chuẩn bị bảo vệ trước Hội đồng chấm thi (Rubric 3 - 60%).
* **Nội dung cần chuẩn bị:**
  1. **Slide thuyết trình PowerPoint 15 phút (15 slide):**
     * Slide 1-4: Giới thiệu, bối cảnh thực tế & bài toán 5W1H (Phú).
     * Slide 5-8: Yêu cầu chức năng, Kiến trúc hệ thống & Sơ đồ CSDL ERD (Vĩ & Phú).
     * Slide 9-11: **Demo trực tiếp sản phẩm trên Web** (Phú & Vĩ).
     * Slide 12-15: Kết quả kiểm thử, Triển khai Cloud & Hướng phát triển (Vĩ & Phú).
  2. **Video Demo dự phòng 3-5 phút:** Quay sẵn video màn hình chất lượng cao phòng trường hợp mạng tại hội trường thi bị lag.
  3. **Bộ câu hỏi phản biện của Hội đồng & Câu trả lời chuẩn bị sẵn:**
     * *"Tại sao chọn kiến trúc phân lớp thay vì microservices?"*
     * *"Giải pháp nào ngăn chặn tin tuyển dụng lừa đảo trên sàn?"*
     * *"Cơ chế bảo mật mật khẩu và phân quyền người dùng như thế nào?"*
* **File nộp / Báo cáo chính thức:**  
  👉 [`D:\CDTN2\02_Bai_Tap_De_Nop\Buoi10_TongKet_Slide_Va_BaoVeDoAn.docx`](file:///D:/CDTN2/02_Bai_Tap_De_Nop/Buoi10_TongKet_Slide_Va_BaoVeDoAn.docx)
