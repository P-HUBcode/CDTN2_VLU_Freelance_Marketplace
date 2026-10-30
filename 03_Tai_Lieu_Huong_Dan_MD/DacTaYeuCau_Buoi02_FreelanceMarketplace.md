# BẢN ĐẶC TẢ YÊU CẦU SẢN PHẨM (SRS RÚT GỌN) & HƯỚNG DẪN THỰC HIỆN BUỔI 2
**Môn học:** Chuyên đề Tốt nghiệp 2  
**Đề tài:** Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên  
**Chuyên ngành:** Công nghệ Phần mềm (CNPM)  

---

## 1. TỔNG QUAN PHÂN TÍCH BUỔI 1 VÀ BUỔI 2

### Buổi 1: Khởi động & Định hình Đề tài
- **Mục tiêu:** Phân nhóm, xác định vai trò, lựa chọn đề tài và phác thảo bài toán ban đầu.
- **Kết quả đạt được từ Buổi 1:**
  - Nhóm chọn đề tài thuộc hướng **Công nghệ Phần mềm**: *Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên*.
  - Nhận diện bài toán cốt lõi: Sinh viên khó tìm việc làm part-time/freelance phù hợp với lịch học, dễ gặp các tin tuyển dụng lừa đảo. Ngược lại, nhà tuyển dụng/doanh nghiệp khó tìm kiếm nhân sự ngắn hạn đáng tin cậy.
  - Phác thảo 3-4 tính năng cơ bản: Đăng tin, tìm kiếm/ứng tuyển, kiểm duyệt tài khoản, đánh giá 2 chiều.

### Buổi 2: Phân tích Yêu cầu Chi tiết (Yêu cầu trọng tâm)
- **Mục tiêu:** Chuyển từ bài toán sơ bộ (Buổi 1) sang bản **Đặc tả Yêu cầu SRS Rút gọn** (Buổi 2).
- **Quy trình 4 bước:**
  1. Phân tích 5W1H làm rõ bài toán.
  2. Xác định các Actor (Sinh viên, Nhà tuyển dụng, Admin).
  3. Chi tiết hóa Yêu cầu Chức năng (FR - Functional Requirements) và Phi chức năng (NFR - Non-Functional Requirements).
  4. Chuẩn bị nội dung thuyết trình 2-3 phút trước lớp và cập nhật Nhật ký thực hiện đề tài.

---

## 2. KHAI THÁC BÀI TOÁN BẰNG MÔ HÌNH 5W1H

| Câu hỏi | Câu trả lời phân tích cho Đề tài |
| :--- | :--- |
| **WHO (Ai là người dùng?)** | **Sinh viên:** Cần tìm việc freelance/part-time linh hoạt.<br>**Nhà tuyển dụng (NTD):** Doanh nghiệp, cửa hàng, cá nhân cần nhân sự ngắn hạn.<br>**Quản trị viên (Admin):** Quản lý hệ thống, kiểm duyệt tin đăng và người dùng. |
| **WHAT (Sản phẩm làm gì?)** | Một nền tảng Web App 2 chiều kết nối việc làm, cho phép đăng tin tuyển dụng, tạo hồ sơ năng lực, ứng tuyển, quản lý trạng thái công việc và đánh giá uy tín 2 chiều. |
| **WHERE (Sản phẩm chạy ở đâu?)** | Giao diện Web (Web Application) tối ưu Responsive cho cả máy tính (Desktop) và thiết bị di động (Mobile). |
| **WHEN (Khi nào sử dụng?)** | Sinh viên dùng khi có thời gian rảnh ngoài giờ học. Nhà tuyển dụng dùng khi có nhu cầu tuyển gấp nhân sự ngắn hạn hoặc theo dự án. |
| **WHY (Tại sao cần giải pháp?)** | - Giảm rủi ro lừa đảo việc làm cho sinh viên (xác thực sinh viên & nhà tuyển dụng).<br>- Tối ưu hóa việc khớp nối lịch rảnh của sinh viên với yêu cầu ca làm của nhà tuyển dụng.<br>- Xây dựng hệ thống đánh giá uy tín minh bạch cho cả 2 bên. |
| **HOW (Hệ thống vận hành ra sao?)** | Quy trình khép kín: NTD đăng tin $\rightarrow$ Admin/Hệ thống duyệt tin $\rightarrow$ Sinh viên tìm kiếm & ứng tuyển $\rightarrow$ NTD duyệt hồ sơ $\rightarrow$ Hoàn thành công việc $\rightarrow$ Đánh giá 2 chiều. |

---

## 3. BẢN ĐẶC TẢ YÊU CẦU RÚT GỌN (SRS RÚT GỌN)

### Mục 1: Mô tả bài toán và mục tiêu sản phẩm
- **Bài toán:** Thị trường việc làm part-time cho sinh viên hiện nay phân mảnh trên các hội nhóm mạng xã hội, thiếu thông tin kiểm duyệt, tiềm ẩn rủi ro bùng lương hoặc lừa đảo. Trong khi đó, doanh nghiệp nhỏ và vừa tốn nhiều thời gian tìm kiếm nhân sự có kỹ năng phù hợp cho các dự án ngắn hạn.
- **Mục tiêu sản phẩm:** Xây dựng nền tảng Web marketplace chuyên biệt cho sinh viên, giúp sinh viên tìm việc an toàn, linh hoạt theo lịch học và giúp nhà tuyển dụng nhanh chóng tuyển được ứng viên phù hợp với chi phí hợp lý.

### Mục 2: Danh sách Actor chính
1. **Actor 1: Sinh viên (Student)** - Người tìm việc part-time / freelance.
2. **Actor 2: Nhà tuyển dụng (Recruiter / Employer)** - Doanh nghiệp, chủ cửa hàng hoặc cá nhân tuyển dụng.
3. **Actor 3: Quản trị viên (Admin)** - Người quản lý vận hành toàn bộ hệ thống.

---

### Mục 3: Danh sách Yêu cầu Chức năng (Functional Requirements - FR)

#### Phân hệ 1: Xác thực & Quản lý Tài khoản (Auth & User Profile)
* **FR-01 [Tài khoản]:** Hệ thống cho phép Đăng ký, Đăng nhập, Đăng xuất cho Sinh viên và Nhà tuyển dụng.
* **FR-02 [Xác thực Sinh viên]:** Cho phép sinh viên xác thực tài khoản qua Email sinh viên (ví dụ `@student.vlu.edu.vn`) hoặc tải ảnh Thẻ sinh viên.
* **FR-03 [Quản lý Hồ sơ Sinh viên]:** Sinh viên có thể tạo/chỉnh sửa Profile (kỹ năng, thời gian rảnh trong tuần, kinh nghiệm, link portfolio, tải CV PDF).
* **FR-04 [Hồ sơ Nhà tuyển dụng]:** Nhà tuyển dụng cập nhật thông tin công ty, địa chỉ, giấy phép kinh doanh/mã số thuế (để duyệt uy tín).

#### Phân hệ 2: Quản lý Tin tuyển dụng & Tìm kiếm (Jobs & Search)
* **FR-05 [Đăng tin tuyển dụng]:** Nhà tuyển dụng tạo tin tuyển dụng (Tiêu đề, loại việc: Part-time/Freelance, mô tả, kỹ năng yêu cầu, mức lương/thù lao, ca làm việc/thời hạn, địa điểm).
* **FR-06 [Quản lý tin đăng]:** Nhà tuyển dụng có thể chỉnh sửa, tạm dừng hoặc đóng tin tuyển dụng.
* **FR-07 [Tìm kiếm & Lọc công việc]:** Sinh viên có thể tìm kiếm công việc theo từ khóa, lọc theo loại việc, khoảng mức lương, địa điểm (quận/huyện) và hình thức (Online/Onsite).

#### Phân hệ 3: Ứng tuyển & Quy trình Làm việc (Application Workflow)
* **FR-08 [Ứng tuyển công việc]:** Sinh viên nộp hồ sơ ứng tuyển kèm Lời nhắn (Cover letter) và lựa chọn CV đính kèm.
* **FR-09 [Quản lý danh sách ứng viên]:** Nhà tuyển dụng xem danh sách ứng viên, xem Profile/CV sinh viên và chuyển trạng thái (*Duyệt / Từ chối / Phỏng vấn*).
* **FR-10 [Thông báo trạng thái]:** Hệ thống gửi thông báo (Notification) cho sinh viên khi trạng thái ứng tuyển thay đổi.

#### Phân hệ 4: Đánh giá & Uy tín (Review & Rating)
* **FR-11 [Đánh giá 2 chiều]:** Sau khi hoàn thành công việc, Nhà tuyển dụng đánh giá Sinh viên (sao + nhận xét về thái độ/kỹ năng) và Sinh viên đánh giá Nhà tuyển dụng (sao + nhận xét về độ uy tín/môi trường).
* **FR-12 [Hiển thị điểm uy tín]:** Điểm đánh giá trung bình được hiển thị công khai trên Profile sinh viên và trang tin của NTD.

#### Phân hệ 5: Quản trị Hệ thống (Admin Management)
* **FR-13 [Kiểm duyệt tin đăng]:** Admin xem danh sách tin tuyển dụng chờ duyệt, thực hiện *Duyệt* hoặc *Từ chối* (nếu thông tin không hợp lệ/nghi ngờ lừa đảo).
* **FR-14 [Quản lý người dùng & Báo cáo]:** Admin khóa/khôi phục tài khoản vi phạm, tiếp nhận và xử lý báo cáo vi phạm (Report) từ người dùng.

---

### Mục 4: Danh sách Yêu cầu Phi chức năng (Non-Functional Requirements - NFR)

* **NFR-01 [Hiệu năng - Performance]:** Thời gian tải trang đầu tiên $\le 2$ giây. Thời gian phản hồi cho các thao tác tìm kiếm/lọc tin $\le 1$ giây.
* **NFR-02 [Bảo mật - Security]:** Mật khẩu người dùng được mã hóa bằng thuật toán Bcrypt. Giao tiếp dữ liệu sử dụng giao thức HTTPS. Xác thực phiên đăng nhập qua JWT Token.
* **NFR-03 [Giao diện & Trải nghiệm - Usability/Responsive]:** Giao diện thân thiện, tương thích chuẩn trên cả màn hình Desktop và thiết bị di động (Mobile Responsive).
* **NFR-04 [Khả năng mở rộng & Tin cậy - Reliability & Scalability]:** Hệ thống đáp ứng tối thiểu 200 người dùng truy cập đồng thời không gây treo/lag. Độ khả dụng (Uptime) $\ge 98\%$.

---

## 4. NHẬT KÝ THỰC HIỆN ĐỀ TÀI (MẪU NỘP GIỮA KỲ / RUBRIC 2)

| Buổi | Ngày thực hiện | Nội dung công việc đã làm | Người thực hiện | Sản phẩm / Kết quả đạt được | Ghi chú của GVHD |
| :---: | :---: | :--- | :--- | :--- | :--- |
| **Buổi 1** | [Điền ngày] | - Phân công vai trò nhóm.<br>- Chọn đề tài: *Nền tảng freelance/part-time sinh viên*.<br>- Phác thảo bài toán & 4 tính năng chính. | Cả nhóm | - Biên bản họp nhóm buổi 1.<br>- Danh sách nhóm & tên đề tài chính thức. | [Ghi nhận xét GV nếu có] |
| **Buổi 2** | [Điền ngày] | - Khai thác bài toán theo mô hình 5W1H.<br>- Xác định 3 Actor chính.<br>- Lập bảng đặc tả FR (14 yêu cầu) & NFR (4 yêu cầu).<br>- Thuyết trình 3 phút trước lớp. | Cả nhóm | - Bản SRS rút gọn hoàn chỉnh.<br>- Slide/Nội dung trình bày trước lớp. | [Ghi nhận xét GV nếu có] |

---

## 5. KỊCH BẢN THUYẾT TRÌNH 2-3 PHÚT TẠI LỚP (BUỔI 2)

> **Kịch bản nói nhanh cho Đại diện Nhóm:**
> 
> *"Kính chào Thầy và các bạn, đại diện cho Nhóm [Tên nhóm], em xin trình bày Bản đặc tả yêu cầu cho đề tài: **Nền tảng quản lý freelance và marketplace việc làm part-time cho sinh viên**.*
> 
> * **Về bài toán (5W1H):** Sinh viên rất cần tìm việc part-time uy tín, linh hoạt ca làm theo lịch học. Tuy nhiên, tin lừa đảo trên mạng xã hội rất nhiều. Nhóm xây dựng nền tảng Web kết nối 2 chiều để giải quyết vấn đề này.
> * **Về Đối tượng người dùng (Actors):** Hệ thống có 3 đối tượng chính: **Sinh viên** (tìm việc, nộp CV), **Nhà tuyển dụng** (đăng tin, duyệt ứng viên) và **Admin** (kiểm duyệt tin đăng, quản lý uy tín).
> * **Về Yêu cầu Chức năng trọng tâm:**
>   1. Sinh viên có thể xác thực tài khoản qua Email sinh viên để tăng độ tin cậy.
>   2. Nhà tuyển dụng đăng tin theo ca làm/mức lương; Sinh viên tìm kiếm theo khu vực và thời gian rảnh.
>   3. Quy trình nộp đơn, duyệt hồ sơ và thông báo thời gian thực.
>   4. Đánh giá uy tín 2 chiều sau khi hoàn thành công việc.
> * **Về Yêu cầu Phi chức năng:** Nhóm cam kết giao diện Responsive tối ưu trên di động, bảo mật tài khoản qua JWT/mã hóa Bcrypt và thời gian phản hồi trang dưới 2 giây.
> 
> *Em xin cảm ơn Thầy và các bạn đã chú ý lắng nghe, rất mong nhận được góp ý từ Thầy để hoàn thiện cho Buổi 3!"*
