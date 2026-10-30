# CẤU TRÚC THƯ MỤC DỰ ÁN - CHUYÊN ĐỀ TỐT NGHIỆP 2

**Đề tài:** Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên  
**Chuyên ngành:** Công nghệ Phần mềm (CNPM)  
**Sinh viên thực hiện:**  
1. **Nguyễn Minh Phú** - MSSV: 2374802013447 (Nhóm trưởng - Backend / Database / Admin)  
2. **Hà Đại Vĩ** - MSSV: 2374802010551 (Thành viên - Frontend / UI-UX / QA Tester)  
**Giảng viên hướng dẫn:** ThS. Nguyễn Văn Trung  

---

## 📂 SƠ ĐỒ PHÂN CHIA THƯ MỤC

```
D:\CDTN2\
├── 📁 01_Tai_Lieu_Mon_Hoc/           <- Toàn bộ slide bài giảng 10 buổi & biểu mẫu gốc từ trường
├── 📁 02_Bai_Tap_De_Nop/             <- Toàn bộ file Word/Excel/draw.io/SQL bài tập từ Buổi 2 đến Buổi 10
├── 📁 03_Tai_Lieu_Huong_Dan_MD/      <- Các cẩm nang hướng dẫn chi tiết, kịch bản, bảng phân chia (.md)
└── 📄 README.md                      <- Mục lục và hướng dẫn tổng quan toàn khóa học
```

---

## 1. 📁 [01_Tai_Lieu_Mon_Hoc](./01_Tai_Lieu_Mon_Hoc)
Chứa toàn bộ tài nguyên học tập, giáo trình và tài liệu quy chuẩn môn học do Giảng viên cung cấp:
* **Slide bài giảng 10 buổi (PDF):** `Buoi01_ChuyenDeTotNghiep2.pdf` $\rightarrow$ `Buoi10_ChuyenDeTotNghiep2.pdf`.
* **Bản trích xuất nội dung văn bản (TXT):** `buoi1.txt` $\rightarrow$ `buoi10.txt` (dùng để tra cứu nhanh).
* **Biểu mẫu gốc từ Trường/Khoa:**
  * `Chuyên đề tốt nghiệp 2-Mẫu báo cáo.docx`: Mẫu báo cáo đề tài tổng kết cuối kỳ của ĐH Văn Lang.
  * `Nhật ký thực hiện.docx`: Biểu mẫu nhật ký thực hiện đề tài dạng Word ban đầu.

---

## 2. 📁 [02_Bai_Tap_De_Nop](./02_Bai_Tap_De_Nop) (Trọn Bộ Báo Cáo 10 Buổi)
Toàn bộ các file bài làm hoàn chỉnh, có trang bìa chuẩn tên 2 sinh viên và GVHD, sẵn sàng để in ấn hoặc nộp cho Giảng viên:
* 📄 **Buổi 2:** `Buoi02_DacTaYeuCau_SRS_RutGon.docx` / `trang bìa.docx` (Bản Đặc tả SRS rút gọn: 5W1H, 3 Actors, 14 FRs, 4 NFRs).
* 📊 **Buổi 3:** `Product_Backlog_FreelanceMarketplace.xlsx` & `NhatKy_Sprint_Theo_Mau_Excel_GV.xlsx` (Product Backlog MoSCoW & Kế hoạch 5 Sprint).
* 📄 **Buổi 4:**
  * `Buoi04_ThietKeKienTrucHeThong.docx`: Báo cáo Thiết kế kiến trúc 3-Tier Layered, Bảng Use Case, Tech Stack & Kịch bản bảo vệ.
  * `SoDo_KienTruc_HeThong.drawio`: File sơ đồ kiến trúc mở bằng draw.io.
  * `SoDo_UseCase_TongThe.drawio`: File sơ đồ Use Case 4 Tabs (Tổng thể & Phân rã 3 Actor: Sinh viên, NTD, Admin) mở bằng draw.io.
* 📄 **Buổi 5 (Mốc Giữa kỳ 1 - 30%):**
  * `Buoi05_ThietKeChiTiet_CSDL_API.docx`: Báo cáo Thiết kế chi tiết CSDL 7 bảng, API Contract, Figma UI Specs & Kịch bản bảo vệ giữa kỳ 1.
  * `SoDo_ERD_Database.drawio`: Sơ đồ ERD quan hệ 7 bảng CSDL chuẩn 3NF mở bằng draw.io (kèm bảng chú thích góc dưới).
  * `Wireframe_GiaoDien_Web.drawio`: **Bộ khung Wireframe 5 màn hình UI cốt lõi đa tab** (Trang chủ & Lọc việc, Chi tiết & Modal nộp đơn 1-chạm, NTD duyệt ứng viên, Profile SV có badge VLU, Admin kiểm duyệt) mở bằng draw.io.
  * 📁 `Figma_Assets_SVG/`: **Thư mục chứa 5 tệp Vector SVG sẵn sàng kéo thả thẳng vào Figma** để chỉnh sửa và dựng Prototype tức thì:
    1. `01_TrangChu_TimKiem_ViecLam.svg`
    2. `02_ChiTietViec_Modal_NopDon.svg`
    3. `03_NTD_QuanLy_UngVien.svg`
    4. `04_HoSo_SinhVien_VLU_Verified.svg`
    5. `05_Admin_KiemDuyet_TinDang.svg`
  * 🌐 `Figma_Prototype_Player.html`: **Trình mô phỏng giao diện Figma Prototype Player giống 100% khi bấm nút Play trên Figma (`figma.com/proto/...`)**: Đầy đủ thanh công cụ Figma đen xám, hiển thị `Flow 1`, phím tắt `R` để Restart, hiệu ứng chớp xanh khi click, và TẤT CẢ các nút đều bấm chuyển màn hình và xử lý luồng nộp đơn / duyệt tin mượt mà.
  * 🌐 `Interactive_Prototype_Demo.html`: **Bản Web Prototype tương tác 100%** (HTML5 + Tailwind CSS + Vanilla JS) có thể mở trực tiếp bằng trình duyệt để bấm thử toàn bộ các nút, lọc việc làm, nộp hồ sơ, NTD duyệt ứng viên, Admin khóa tin lừa đảo có hiệu ứng Toast.
  * `database_schema.sql`: Kịch bản SQL tạo Database MySQL, Index và nạp sẵn dữ liệu mẫu (Seed Data) sẵn sàng cho Buổi 6 Code.
* 📄 **Buổi 6:** `Buoi06_XayDungSanPham_Sprint1.docx` (Báo cáo xây dựng Sprint 1: Module Auth JWT & Profile Sinh viên).
* 📄 **Buổi 7:** `Buoi07_XayDungSanPham_Sprint2_TichHop.docx` (Mốc giữa kỳ 2: Tích hợp Đăng tin - Tìm kiếm - Nộp đơn, Bảng Go/No-go).
* 📄 **Buổi 8:** `Buoi08_KiemThu_Va_ToiUuHeThong.docx` (Kiểm thử: 10 Test Cases chi tiết, Báo cáo sửa lỗi & Tối ưu Index CSDL).
* 📄 **Buổi 9:** `Buoi09_TrienKhai_Va_BanNhapBaoCao.docx` (Triển khai Cloud Vercel/Render, 3 Tài khoản Demo mẫu & Bản nháp Báo cáo 8 chương).
* 📄 **Buổi 10:** `Buoi10_TongKet_Slide_Va_BaoVeDoAn.docx` (Kịch bản 15 Slide PowerPoint bảo vệ, Video Demo & Bộ câu hỏi phản biện Hội đồng).

---

## 3. 📁 [03_Tai_Lieu_Huong_Dan_MD](./03_Tai_Lieu_Huong_Dan_MD)
Chứa các cẩm nang Markdown tra cứu nhanh, kịch bản thuyết trình và bảng phân công công việc:
* 🎨 **`HuongDan_ThietKe_Figma_UI_UX.md`:** **Cẩm nang thiết kế Figma UI/UX chi tiết dành riêng cho Hà Đại Vĩ** (Design Tokens màu sắc VLU `#003366`, Typography, Grid 12 cột, chi tiết 5 màn hình và 6 bước thực hành Figma).
* 📘 **`HuongDan_HoanThanh_Buoi5_ThietKeChiTiet.md`:** **Hướng dẫn chi tiết hoàn thành Buổi 5 (Mốc giữa kỳ 1 - 30%).**
* 📘 **`HuongDan_HoanThanh_Buoi4_ThietKeKienTruc.md`:** Hướng dẫn hoàn thành Buổi 4 & Sơ đồ kiến trúc Mermaid.
* 📘 **`HuongDan_HoanThanh_Buoi3_FreelanceMarketplace.md`:** Hướng dẫn hoàn thành Buổi 3 & Product Backlog MoSCoW.
* 📘 **`DacTaYeuCau_Buoi02_FreelanceMarketplace.md`:** Chi tiết bản đặc tả SRS rút gọn (Buổi 2).
* 📘 **`CamNang_HoanThanh_ToanBo_Buoi5_Den_Buoi10.md`:** Cẩm nang tổng hợp chi tiết từ Buổi 5 đến Buổi 10.
* 📘 **`BangCongViec_10Buoi_Chitiet_FreelanceMarketplace.md`:** Bảng kế hoạch chi tiết từng buổi cho 2 người.
* 📘 **`NhatKy_Sprint0_Buoi1-3_FreelanceMarketplace.md`:** Bản ghi chú nội dung Sprint 0.
