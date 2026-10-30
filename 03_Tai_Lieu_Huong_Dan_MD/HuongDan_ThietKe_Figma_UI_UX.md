# CẨM NANG THIẾT KẾ FIGMA UI/UX — DỰ ÁN VLU FREELANCE MARKETPLACE
> **Môn học:** Chuyên đề tốt nghiệp 2 — Ngành Công nghệ Thông tin — Trường Đại học Văn Lang  
> **Đề tài:** Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên  
> **Thành viên phụ trách UI/UX:** **Hà Đại Vĩ (MSSV: 2374802010551)**  
> **Thành viên phụ trách Backend/DB:** **Nguyễn Minh Phú (MSSV: 2374802013447)**  
> **Giảng viên hướng dẫn:** ThS. Nguyễn Văn Trung  
> **Tài liệu tham chiếu:** [Wireframe_GiaoDien_Web.drawio](file:///d:/CDTN2/02_Bai_Tap_De_Nop/Wireframe_GiaoDien_Web.drawio), [Buoi05_ThietKeChiTiet_CSDL_API.docx](file:///d:/CDTN2/02_Bai_Tap_De_Nop/Buoi05_ThietKeChiTiet_CSDL_API.docx)

---

## 1. MỤC TIÊU & TỔNG QUAN DỰ ÁN

Tài liệu này được biên soạn chi tiết dành riêng cho **Hà Đại Vĩ** để tiến hành hiện thực hóa giao diện đồ họa chất lượng cao (High-Fidelity UI Prototype) trên phần mềm **Figma**.

Toàn bộ thông số màu sắc, khoảng cách, font chữ, bố cục và cấu trúc dữ liệu đã được tính toán đồng bộ 100% với:
1. **Khung Wireframe 5 trang đa tab** tại tệp `02_Bai_Tap_De_Nop/Wireframe_GiaoDien_Web.drawio`.
2. **Cơ sở dữ liệu 7 bảng** tại tệp `02_Bai_Tap_De_Nop/database_schema.sql`.
3. **8 Hợp đồng RESTful API** tại tệp `02_Bai_Tap_De_Nop/Buoi05_ThietKeChiTiet_CSDL_API.docx`.
4. **Nhật ký phân công công việc Sprint 1 - 2** tại tệp `NhatKy_Sprint_Theo_Mau_Excel_GV.xlsx`.

---

## 2. HỆ THỐNG THIẾT KẾ (DESIGN SYSTEM & TOKENS)

### 2.1. Bảng màu thương hiệu (Color Palette)

Hệ thống màu sắc được phối theo bộ nhận diện của Trường Đại học Văn Lang (Màu xanh VLU Navy) kết hợp với màu công nghệ hiện đại, thân thiện với sinh viên.

| Tên Token Figma | Mã Hex | Ý nghĩa & Vị trí ứng dụng trên Giao diện |
| :--- | :--- | :--- |
| **Primary Navy (VLU)** | `#003366` | Màu chủ đạo: Header Navbar, Nút hành động chính (Primary CTA), Tab đang chọn, Viền focus |
| **Primary Dark** | `#002244` | Trạng thái Hover của nút chính, chân trang (Footer), Header bảng quản trị Admin |
| **Sky Accent** | `#0284C7` | Màu phụ trợ: Icon, Liên kết (Hyperlink), Thanh tiến trình, Thông báo hệ thống |
| **Sky Light BG** | `#E0F2FE` | Nền các Tag phân loại kỹ năng (ReactJS, Python...), Badge phụ |
| **Success Emerald** | `#059669` | Trạng thái Thành công: Nút [Gửi hồ sơ], Mức lương nổi bật, Nút [Duyệt nhận] ứng viên, [Duyệt tin] |
| **Success Light BG** | `#DCFCE7` | Nền huy hiệu **"ĐÃ XÁC THỰC VLU"**, Nền trạng thái Đã nhận |
| **Warning Amber** | `#D97706` | Trạng thái Chờ duyệt: Tag "Chờ kiểm duyệt", Cảnh báo sắp hết hạn nộp |
| **Warning Light BG** | `#FEF3C7` | Nền thông báo nhắc nhở nộp hồ sơ, lưu ý bảo mật |
| **Danger Crimson** | `#DC2626` | Trạng thái Nguy hiểm: Nút [Từ chối], Nút [🚫 Bác bỏ tin lừa đảo], Thẻ cảnh báo rủi ro |
| **Danger Light BG** | `#FEE2E2` | Nền hàng tin tuyển dụng bị nghi vấn lừa đảo trong trang Admin |
| **Neutral 900** | `#111827` | Màu chữ chính (Tiêu đề tin, Tên ứng viên, Heading) |
| **Neutral 600** | `#4B5563` | Màu chữ phụ (Mô tả công việc, Tên công ty, Địa chỉ) |
| **Neutral 400** | `#9CA3AF` | Màu chữ mờ (Placeholder ô input, Thời gian đăng) |
| **Neutral 200** | `#E5E7EB` | Đường viền (Border), Đường phân cách (Divider), Khung thẻ Card |
| **Neutral 100** | `#F3F4F6` | Nền toàn bộ trang web (Page Background) |
| **White Pure** | `#FFFFFF` | Nền thẻ Card việc làm, Nền Modal popup, Nền thanh tìm kiếm |

---

### 2.2. Quy chuẩn Typography (Font chữ)

Để đảm bảo không bị lỗi font Tiếng Việt và tối ưu hóa trải nghiệm đọc, khuyến nghị sử dụng font **`Inter`** hoặc **`Be Vietnam Pro`** (cả hai đều có sẵn miễn phí trên Google Fonts và Figma).

* **Heading 1 (Tiêu đề trang, Hero banner):** Size `24px` – `28px`, Weight: `Bold (700)`, Line height: `36px`
* **Heading 2 (Tiêu đề Card việc làm, Tên ứng viên):** Size `18px` – `20px`, Weight: `SemiBold (600)`, Line height: `28px`
* **Heading 3 (Tiêu đề Modal, Header bảng Data Table):** Size `15px` – `16px`, Weight: `SemiBold (600)`, Line height: `24px`
* **Body Normal (Nội dung mô tả, yêu cầu, quyền lợi):** Size `14px`, Weight: `Regular (400)`, Line height: `22px`
* **Body Small (Mức lương, địa chỉ, hạn nộp hồ sơ):** Size `12px` – `13px`, Weight: `Medium (500)`, Line height: `18px`
* **Caption / Tags / Badge:** Size `10px` – `11px`, Weight: `SemiBold (600)`, Line height: `14px`, Letter spacing: `0.5px`

---

### 2.3. Quy chuẩn Khung & Lưới (Grid & Spacing System)

Hệ thống lưới dựa trên **8-point Grid System**:
* **Desktop Frame:** Tạo Frame kích thước chuẩn **`1440 x 900 px`** (hoặc chiều cao tự do kéo dài theo nội dung).
* **Layout Grid (12 Columns):**
  * Type: `Columns`
  * Count: `12`
  * Margin: `48px` (khoảng cách 2 mép ngoài)
  * Gutter: `24px` (khoảng cách giữa các cột)
  * Chiều rộng nội dung hữu dụng: `1344px` (căn giữa).
* **Độ bo góc (Corner Radius):**
  * Nút bấm (Buttons) & Ô nhập liệu (Input field): `8px`
  * Thẻ tin tuyển dụng (Job Cards) & Bảng (Data Table): `12px`
  * Modal Popup: `16px`
  * Thẻ Badge & Tag kỹ năng (Pill Shape): `9999px`
* **Hiệu ứng đổ bóng (Elevation & Effects):**
  * Card Drop Shadow: `X: 0, Y: 2, Blur: 8, Spread: 0, Color: rgba(0, 0, 0, 0.06)`
  * Modal Drop Shadow: `X: 0, Y: 12, Blur: 24, Spread: -4, Color: rgba(0, 0, 0, 0.15)`

---

## 3. ĐẶC TẢ CHI TIẾT 5 MÀN HÌNH FIGMA CẦN THIẾT KẾ

### Màn hình 1: Trang Chủ & Bộ Lọc Tìm Kiếm Việc Làm Sinh Viên (Desktop)
* **Tên Frame trên Figma:** `01_Home_Job_Discovery`
* **Mục tiêu:** Màn hình chào đón sinh viên Văn Lang tìm kiếm việc làm part-time / freelance an toàn, uy tín.
* **Các thành phần (Components) cần vẽ:**
  1. **Thanh điều hướng trên cùng (Header Navbar):**
     * Logo: Icon nón tốt nghiệp 🎓 + Chữ **"VLU FREELANCE"** (Màu trắng trên nền `#003366`, height `64px`).
     * Menu links: *Việc làm mới*, *Dành cho NTD*, *Cẩm nang sinh viên*.
     * Cụm tài khoản bên phải: Ô tìm kiếm nhanh, Nút [Đăng tin NTD], Avatar tròn có tên **"Nguyễn Minh Phú"** kèm trạng thái đã đăng nhập.
  2. **Banner quảng bá (Hero Banner):**
     * Chiều cao `120px`, nền dải màu xanh nhạt `#E8F1F5`.
     * Tiêu đề to: *"TÌM VIỆC LÀM PART-TIME & FREELANCE CHO SINH VIÊN VĂN LANG"*.
     * Ô tìm kiếm từ khóa lớn (Search Bar) có icon kính lúp 🔍 và nút bấm [Tìm kiếm] màu VLU Navy.
  3. **Sidebar Bộ lọc thông minh (Cột trái - 3 cột Grid ~ 280px):**
     * Card trắng nền bo góc `12px`, viền `#E5E7EB`.
     * Nhóm 1 - Cơ sở trường: Checkbox `Tất cả TP.HCM`, `Bình Thạnh (Cơ sở 3)`, `Gò Vấp (Cơ sở 2)`, `Quận 1 (Cơ sở 1)`, `Làm Online / Remote`.
     * Nhóm 2 - Mức lương: Radio/Checkbox `25.000đ - 35.000đ/h`, `35.000đ - 50.000đ/h`, `> 50.000đ/h`.
     * Nhóm 3 - Ca làm việc rảnh: `Ca sáng (8h-12h)`, `Ca chiều (13h-17h)`, `Ca tối (18h-22h)`, `Cuối tuần`.
     * Nút bấm: [Áp dụng bộ lọc] full-width nền `#003366`.
  4. **Danh sách tin việc làm (Cột phải - 9 cột Grid):**
     * Thanh phụ: Text *"Tìm thấy 28 công việc phù hợp"* + Dropdown Sắp xếp *[Mới nhất ▼]*.
     * **Thẻ Job Card 1:** Tiêu đề *"Tuyển Thực Tập Sinh Lập Trình Frontend ReactJS (Part-time)"*, Công ty Truyền thông Sáng tạo VLU, Địa chỉ Bình Thạnh, Lương xanh `#059669` *"45.000đ / giờ"*, Tags: `[ReactJS]`, `[Part-time]`, `[Bình Thạnh]`, Nút [Ứng tuyển ngay].
     * **Thẻ Job Card 2:** *"Nhân Viên Phục Vụ Quán Cafe Sách (Linh hoạt theo ca học)"*, The Book Cafe VLU, Gò Vấp, Lương *"30.000đ / giờ"*, Tags: `[Phục vụ]`, `[Linh hoạt ca]`.
     * **Thẻ Job Card 3:** *"Thiết Kế Banner & Edit Video TikTok Cho Shop Thời Trang"*, Chic Studio, Làm việc Online, Lương *"1.500.000đ / Dự án"*, Tags: `[Freelance]`, `[Remote]`.
     * **Thẻ Job Card 4:** *"Gia Sư Dạy Kèm Tiếng Anh Lớp 8"*, Quận 1, Lương *"150.000đ / buổi"*.

---

### Màn hình 2: Chi Tiết Việc Làm & Modal Nộp Đơn 1-Chạm (Apply Modal)
* **Tên Frame trên Figma:** `02_Job_Detail_Modal_Apply`
* **Mục tiêu:** Thể hiện đầy đủ quyền lợi công việc và trải nghiệm nộp đơn siêu tốc (1-chạm) không gây phiền hà cho sinh viên.
* **Các thành phần (Components) cần vẽ:**
  1. **Breadcrumb & Header công việc:**
     * Đường dẫn: *Trang chủ > Lập trình & CNTT > Tuyển Thực Tập Sinh ReactJS*.
  2. **Khung chi tiết bên trái (Width: 600px):**
     * Tên công việc (H1) + Tên công ty + Huy hiệu ⭐ `4.9/5 (18 đánh giá)`.
     * Thông số nhanh: Lương `45.000đ/h`, Địa chỉ *69/68 Đặng Thùy Trâm, P.13, Bình Thạnh*.
     * 3 Mục nội dung rõ ràng:
       * *1. Mô tả công việc:* Viết code ReactJS, tối ưu responsive, phối hợp backend.
       * *2. Yêu cầu ứng viên:* Sinh viên CNTT Văn Lang năm 3-4, biết HTML/CSS/JS, có laptop.
       * *3. Quyền lợi:* Thù lao minh bạch, hỗ trợ mộc dấu thực tập tốt nghiệp, lịch ca linh động.
  3. **Khung Popup Nộp Đơn 1-Chạm (Apply Modal - Width: 460px):**
     * Tiêu đề modal: **"FORM NỘP HỒ SƠ ỨNG TUYỂN"**.
     * Hộp thông tin tự động điền (Prefilled Card): Họ tên: **Nguyễn Minh Phú**, MSSV: **2374802013447**, Email VLU: `sinhvien.demo@student.vlu.edu.vn` (Kèm icon tích xanh verified), Điểm uy tín: ⭐ **5.0/5.0**.
     * Chọn CV:
       * Radio 1 (Active): `Sử dụng CV PDF có sẵn: CV_NguyenMinhPhu_WebDev.pdf (1.8 MB)`.
       * Radio 2: `Tải lên CV mới từ máy tính (.pdf, max 5MB)`.
     * Ô nhập Textarea: *"Lời nhắn gửi Nhà tuyển dụng (Cover Letter)"* có sẵn đoạn chào hỏi mẫu.
     * 2 Nút chân modal: Nút [Hủy bỏ] (Xám) & Nút [🚀 Gửi hồ sơ ứng tuyển] (Nền xanh lục `#059669` to rõ).
     * Banner lưu ý màu vàng: *"💡 Hệ thống tự động thông báo đến NTD và cập nhật tiến độ trong mục Hồ sơ"*.

---

### Màn hình 3: Portal Nhà Tuyển Dụng — Quản Lý Ứng Viên (Candidate Review)
* **Tên Frame trên Figma:** `03_Employer_Candidate_Review`
* **Mục tiêu:** Doanh nghiệp dễ dàng xem hồ sơ, duyệt nhận hoặc từ chối sinh viên Văn Lang.
* **Các thành phần (Components) cần vẽ:**
  1. **Header Portal NTD:** Menu: *[Quản lý tin đăng]*, *[Danh sách ứng viên] (Active)*, *[Hồ sơ công ty]*.
  2. **Thanh thông tin tin tuyển dụng:** Card trắng hiển thị: *"Tin: Tuyển TTS ReactJS • Trạng thái: Đang mở • 4 ứng viên đã nộp"*.
  3. **Bảng Data Table ứng viên:**
     * Header bảng: `Ứng viên` | `Thời gian nộp` | `Xem CV` | `Điểm uy tín` | `Trạng thái hiện tại` | `Hành động duyệt`.
     * **Dòng 1:** 
       * Ứng viên: Nguyễn Minh Phú (MSSV: 2374802013447 - Ngành CNTT).
       * Thời gian: *20/10/2026 09:30*.
       * Xem CV: Nút link `📄 Xem CV PDF`.
       * Uy tín: ⭐ `5.0 (4 việc hoàn thành)`.
       * Trạng thái: Badge xanh đậm **"ĐÃ DUYỆT NHẬN"**.
       * Hành động: Nút `[Liên hệ SĐT/Zalo]` & `[Đánh giá sao sau việc]`.
     * **Dòng 2:** 
       * Ứng viên: Trần Văn B (MSSV: 2374802010111 - Ngành KTPM).
       * Thời gian: *21/10/2026 14:15*.
       * Trạng thái: Badge vàng cam **"Chờ duyệt"**.
       * Hành động: Cặp nút rõ nét: Nút [Duyệt nhận] (Màu `#059669`) và Nút [Từ chối] (Màu `#DC2626`).

---

### Màn hình 4: Hồ Sơ Sinh Viên & CV Năng Lực (Student Profile)
* **Tên Frame trên Figma:** `04_Student_Profile_CV`
* **Mục tiêu:** Minh chứng sinh viên thật, kỹ năng thật, chống mạo danh nhờ xác thực email trường.
* **Các thành phần (Components) cần vẽ:**
  1. **Thẻ Profile tóm tắt (Bên trái):**
     * Ảnh thẻ tròn sinh viên (Avatar) + Nút đổi ảnh.
     * Tên đầy đủ: **Nguyễn Minh Phú**.
     * Huy hiệu uy tín: Tag xanh lá sáng `[✔️ ĐÃ XÁC THỰC VLU]`.
     * Chi tiết học vụ: MSSV: `2374802013447`, Trường Đại học Văn Lang, Khoa CNTT, Email: `sinhvien.demo@student.vlu.edu.vn`.
     * Đánh giá trung bình: ⭐⭐⭐⭐⭐ `5.0 / 5.0` (Dựa trên 4 đánh giá từ NTD).
     * Tiểu sử ngắn (Bio).
     * Danh sách Tag kỹ năng: `[ReactJS]`, `[Node.js]`, `[MySQL]`, `[TailwindCSS]`, `[Git]`, `[Figma]`.
     * Hộp quản lý file CV: Icon PDF đỏ, tên tệp `CV_NguyenMinhPhu_WebDev.pdf`, 3 nút bấm nhỏ: *[👁️ Xem trực tiếp]*, *[📥 Tải về]*, *[🔄 Thay CV mới]*.
  2. **Cột Lịch sử làm việc & Đánh giá (Bên phải):**
     * 3 Khung review chi tiết từ các nhà tuyển dụng thực tế kèm số sao 5.0 và lời nhận xét tích cực về thái độ và chuyên môn.

---

### Màn hình 5: Cổng Quản Trị Admin — Kiểm Duyệt Tin Đăng (Anti-Scam Portal)
* **Tên Frame trên Figma:** `05_Admin_Job_Moderation`
* **Mục tiêu:** Thể hiện giải pháp cốt lõi của đề tài: Nhà trường / Ban quản trị kiểm soát chất lượng việc làm, ngăn chặn lừa đảo đa cấp nhắm vào tân sinh viên.
* **Các thành phần (Components) cần vẽ:**
  1. **Thanh chỉ số KPI (4 Thẻ thống kê đầu trang):**
     * Card 1 (Xanh dương): *Tổng số Sinh viên:* **1,240**.
     * Card 2 (Xanh lục): *Nhà tuyển dụng hợp lệ:* **158**.
     * Card 3 (Vàng): *Tin việc làm đang chạy:* **84**.
     * Card 4 (Đỏ cảnh báo): *Tin tuyển dụng chờ duyệt:* **3 CẦN DUYỆT**.
  2. **Bảng Danh sách tin tuyển dụng chờ kiểm duyệt:**
     * Header: `Tiêu đề tin` | `Doanh nghiệp` | `Mức lương & Ca` | `MST / Uy tín pháp nhân` | `Thao tác duyệt`.
     * **Hàng 1 (Tin hợp lệ):**
       * Tiêu đề: *Tuyển Nhân viên Phục vụ Cafe Sách*.
       * NTD: *The Book Cafe VLU*.
       * Lương: *30.000đ/h • Tối T3-T5-T7*.
       * Pháp nhân: Tag xanh *MST: 0319887766 (Đã đối soát Tổng cục thuế)*.
       * Nút: Nút xanh [Duyệt tin] & Nút đỏ [Từ chối].
     * **Hàng 2 (Tin cảnh báo lừa đảo - Highlight nền hồng đỏ `#FEF2F2`):**
       * Tiêu đề: Text đỏ *"Việc nhẹ lương cao 500k/ngày gõ mã captcha online"*.
       * NTD: Cá nhân tự do (SĐT rác không rõ nguồn gốc).
       * Lương: 500.000đ/ngày (Dấu hiệu bất thường).
       * Pháp nhân: Text đỏ đậm **"Không có mã số thuế / Trùng blacklist"**.
       * Nút: Nút đỏ đậm **[🚫 Bác bỏ & Khóa tài khoản]**.

---

## 4. HƯỚNG DẪN THỰC HÀNH FIGMA DÀNH CHO BẠN HÀ ĐẠI VĨ

> [!TIP]
> **🚀 LỐI TẮT SIÊU TỐC (10 GIÂY CÓ NGAY 5 MÀN HÌNH CHỈNH SỬA TRỰC TIẾP TRÊN FIGMA):**  
> Dự án đã tạo sẵn 5 tệp Vector SVG độ phân giải cao tỉ lệ chuẩn `1440 x 900 px` tại thư mục:  
> 📁 [02_Bai_Tap_De_Nop/Figma_Assets_SVG/](file:///d:/CDTN2/02_Bai_Tap_De_Nop/Figma_Assets_SVG)  
> 1. `01_TrangChu_TimKiem_ViecLam.svg`
> 2. `02_ChiTietViec_Modal_NopDon.svg`
> 3. `03_NTD_QuanLy_UngVien.svg`
> 4. `04_HoSo_SinhVien_VLU_Verified.svg`
> 5. `05_Admin_KiemDuyet_TinDang.svg`  
> 👉 **Cách làm:** Bạn chỉ cần mở Figma, tạo một File mới, sau đó **kéo thả (Drag & Drop) cả 5 file `.svg` này vào trực tiếp màn hình Canvas của Figma**. Figma sẽ tự động chuyển hóa thành các Frame chứa từng khối vector, chữ viết, nút bấm, màu sắc có thể click đúp chuột sửa chữ, đổi màu và kéo dãn ngay lập tức!

Sau khi kéo thả hoặc khi muốn tự dựng từ đầu theo chuẩn UI/UX, Vĩ hãy làm theo các bước chuẩn hóa sau:

### Bước 1: Mở Wireframe tham khảo song song
* Mở tệp `02_Bai_Tap_De_Nop/Wireframe_GiaoDien_Web.drawio` bằng trình duyệt tại địa chỉ [app.diagrams.net](https://app.diagrams.net/) (hoặc extension Draw.io Integration trên VS Code).
* Mở từng tab (từ Tab 1 đến Tab 5) để nắm chính xác kích thước tương đối và phân bổ nội dung text.

### Bước 2: Khởi tạo File Figma & Design Tokens
* Đăng nhập Figma, tạo một Design File mới đặt tên: `VLU_Freelance_Marketplace_UI_K27`.
* Mở panel bên phải, tạo sẵn các **Color Styles**:
  * `Primary/Navy`: `#003366`
  * `Primary/Dark`: `#002244`
  * `Accent/Sky`: `#0284C7`
  * `Success/Green`: `#059669`
  * `Danger/Red`: `#DC2626`
  * `Neutral/BG`: `#F3F4F6`
* Tạo các **Text Styles** dùng font `Inter` hoặc `Be Vietnam Pro`:
  * `Heading 1`: 24px Bold
  * `Heading 2`: 18px SemiBold
  * `Body Regular`: 14px Regular
  * `Badge/Tag`: 11px SemiBold

### Bước 3: Tạo Thư viện Components tái sử dụng (Master Components)
Tạo 1 trang riêng tên `00_Components` trong Figma để vẽ các nút bấm và thẻ:
* **Primary Button:** Khung Auto Layout ngang, Padding: `10px 20px`, bo góc `8px`, nền `#003366`, chữ trắng 14px SemiBold.
* **Success Button:** Giống nút trên nhưng nền `#059669`.
* **Danger Button:** Giống nút trên nhưng nền `#DC2626`.
* **Pill Tag:** Khung Auto Layout, Padding: `4px 12px`, bo góc `9999px`, nền `#E0F2FE`, chữ `#0369A1` 11px.
* **Verified Badge:** Khung bo góc `4px`, nền `#DCFCE7`, chữ xanh đậm `#166534` có icon `✔️ ĐÃ XÁC THỰC VLU`.

### Bước 4: Lắp ráp 5 Frame chính (Dùng Auto Layout)
* Nhấn phím `F` trên Figma, chọn thiết bị `Desktop` (1440 x 900).
* Đặt tên Frame lần lượt từ `01` đến `05` theo đúng mục 3 của cẩm nang này.
* Bật Lưới `Layout Grid` 12 Cột, Margin `48px`, Gutter `24px`.
* Kéo các Master Components vào các cột để tạo Job Card, Table Row, Navbar. Sử dụng tính năng **Auto Layout (`Shift + A`)** để giao diện tự co giãn chuyên nghiệp.

### Bước 5: Nối Prototype toàn diện cho tất cả các nút (Figma Interaction Matrix)

Để toàn bộ các nút trên 5 màn hình Figma có thể bấm được và chuyển cảnh mượt mà khi bấm nút **`Present` (Tam giác Play ▶)**, bạn chuyển sang tab **Prototype** (cột phải trên Figma) và nối dây theo bảng ma trận sau:

| Vị trí nút bấm | Nút / Thẻ được click | Sự kiện (Trigger) | Hành động (Action) | Màn hình đích (Destination) | Hiệu ứng (Animation) |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **Màn 01 (Trang chủ)** | Nút `[Ứng tuyển ngay]` (Card 1) | `On click` | `Navigate to` | `02_Job_Detail_Modal_Apply` | `Smart Animate` (300ms) |
| **Màn 01 (Trang chủ)** | Nút `[Chi tiết]` / Tiêu đề Card 1 | `On click` | `Navigate to` | `02_Job_Detail_Modal_Apply` | `Instant` |
| **Màn 01 (Trang chủ)** | Nút `[+ Đăng tin NTD]` trên Navbar | `On click` | `Navigate to` | `03_Employer_Candidate_Review` | `Dissolve` (200ms) |
| **Màn 01 (Trang chủ)** | Chip `[👤 Nguyễn Minh Phú]` trên Navbar | `On click` | `Navigate to` | `04_Student_Profile_CV` | `Smart Animate` |
| **Màn 01 (Trang chủ)** | Tab `[Duyệt Tin Việc Làm]` trên Navbar | `On click` | `Navigate to` | `05_Admin_Job_Moderation` | `Dissolve` (200ms) |
| **Màn 02 (Chi tiết & Modal)** | Nút `[🚀 Gửi hồ sơ ứng tuyển]` | `On click` | `Open overlay` | Khung `Toast_Success_Popup` (Căn trên giữa, tự đóng sau 2s) | `Move in` (From top) |
| **Màn 02 (Chi tiết & Modal)** | Nút `[Hủy bỏ]` / `[← Quay lại]` | `On click` | `Navigate to` | `01_Home_Job_Discovery` | `Instant` |
| **Màn 02 (Chi tiết & Modal)** | Link `[📄 Xem CV PDF]` | `On click` | `Open overlay` | Khung `Modal_CV_Preview` (Center) | `Fade in` |
| **Màn 03 (Portal NTD)** | Nút `[Duyệt nhận]` (Hàng 2) | `On click` | `Swap overlay` / `Change to` | Trạng thái nút thành xanh `ĐÃ DUYỆT NHẬN` | `Smart Animate` |
| **Màn 03 (Portal NTD)** | Nút `[Từ chối]` (Hàng 2) | `On click` | `Swap overlay` / `Change to` | Trạng thái nút thành đỏ `Đã từ chối` | `Smart Animate` |
| **Màn 04 (Profile SV)** | Tab `[Việc làm mới]` trên Navbar | `On click` | `Navigate to` | `01_Home_Job_Discovery` | `Instant` |
| **Màn 05 (Cổng Admin)** | Nút `[🚫 Bác bỏ & Khóa TK]` (Hàng 2) | `On click` | `Swap overlay` | Gạch ngang tin lừa đảo & chuyển màu xám | `Dissolve` |

---

### Bước 6: Trải nghiệm & Trình chiếu thử nghiệm Prototype
1. **Trên Figma:** Bấm biểu tượng **Play (▶ Present)** ở góc trên bên phải Figma hoặc cài ứng dụng **Figma Mirror** trên điện thoại để vuốt chạm trực tiếp.
2. **Bản chạy thử Web tương tác tức thì:** Dự án đã biên soạn sẵn tệp mô phỏng độc lập [Interactive_Prototype_Demo.html](file:///d:/CDTN2/02_Bai_Tap_De_Nop/Interactive_Prototype_Demo.html). Bạn chỉ cần nhấp đúp chuột để mở bằng Google Chrome hoặc Edge là có thể bấm thử toàn bộ các nút, lọc việc làm, nộp hồ sơ, duyệt ứng viên và kiểm duyệt tin có hiệu ứng thông báo Toast chân thực!

### Bước 7: Xuất kết quả nộp bài
1. **Lấy link Figma:** Nhấn nút **Share** góc trên bên phải > Chọn quyền *"Anyone with the link can view"* > Nhấn **Copy link** để dán vào file Word Báo cáo Buổi 5 và Slide thuyết trình.
2. **Xuất ảnh High-res:** Chọn cả 5 Frame > Ở mục `Export` bên phải chọn định dạng `PNG` (hoặc `PDF`) ở mức `2x` để ảnh sắc nét, dán vào tài liệu Word nộp cho giảng viên.

---

## 5. BẢNG CHECKLIST ĐÁNH GIÁ NGHIỆM THU (THEO RUBRIC GIẢNG VIÊN)

| Tiêu chí đánh giá | Trạng thái | Ghi chú kiểm tra |
| :--- | :---: | :--- |
| **Độ phủ màn hình:** Đủ 5 màn hình cốt lõi (Khách, Sinh viên, NTD, Admin) |  | Khớp 100% với 5 tab Wireframe draw.io |
| **Tính đồng nhất Design System:** Dùng đúng mã màu VLU Navy `#003366` |  | Đảm bảo nhận diện thương hiệu Đại học Văn Lang |
| **Font chữ chuẩn:** Không bị lỗi dấu Tiếng Việt |  | Sử dụng Inter / Be Vietnam Pro |
| **Khớp cơ sở dữ liệu:** Thể hiện đủ trường thông tin (MSSV, Email VLU, Đánh giá sao, Trạng thái đơn) |  | Khớp 7 bảng CSDL trong `database_schema.sql` |
| **Khớp API hợp đồng:** Các nút hành động ứng với các phương thức POST / PUT API |  | Khớp 8 API trong `Buoi05_ThietKeChiTiet_CSDL_API.docx` |
| **Chất lượng ảnh xuất:** Ảnh sắc nét, có bảng chú thích rõ ràng |  | Phục vụ in ấn và báo cáo slide |

*(Tài liệu này được lưu trữ chính thức tại thư mục dự án `03_Tai_Lieu_Huong_Dan_MD/HuongDan_ThietKe_Figma_UI_UX.md`).*
