# HƯỚNG DẪN CẤU HÌNH SUPABASE CLOUD PRODUCTION CHO STUDENTHUB

Tài liệu này cung cấp quy trình chuẩn từng bước để thiết lập và kết nối dự án **StudentHub** với cơ sở dữ liệu **Supabase Cloud (PostgreSQL)** thực tế, đảm bảo an toàn bảo mật, phân quyền Row Level Security (RLS), phân loại Storage Buckets và kiểm thử toàn diện.

---

## 1. TẠO SUPABASE PROJECT

1. Truy cập [https://supabase.com](https://supabase.com) và đăng nhập bằng tài khoản GitHub hoặc Google.
2. Tại trang tổng quan (Dashboard), nhấn nút **New Project**.
3. Điền các thông tin khởi tạo:
   - **Organization**: Chọn tổ chức của bạn.
   - **Name**: `studenthub-production` (hoặc tên tùy chọn).
   - **Database Password**: Nhập mật khẩu cơ sở dữ liệu mạnh và lưu trữ an toàn (dùng cho kết nối trực tiếp PostgreSQL nếu cần).
   - **Region**: Chọn khu vực gần Việt Nam nhất để tối ưu độ trễ mạng, khuyến nghị: `Southeast Asia (Singapore) - ap-southeast-1`.
   - **Pricing Plan**: Free Plan (hoặc Pro Plan tùy nhu cầu).
4. Nhấn **Create new project** và đợi 1 - 2 phút để hệ thống cấp phát hạ tầng.

---

## 2. LẤY PROJECT URL & PUBLISHABLE/ANON KEY

1. Trong giao diện dự án Supabase, chọn biểu tượng **Project Settings** (bánh răng ở góc dưới thanh điều hướng bên trái).
2. Chọn mục **API** (hoặc **Configuration -> API**).
3. Tại phần **Project API keys**:
   - Sao chép **Project URL** (dạng `https://[project-ref].supabase.co`).
   - Sao chép **anon / public** key (chuỗi JWT bắt đầu bằng `eyJhbGci...`).
   > ⚠️ **CẢNH BÁO AN TOÀN**:
   > - Tuyệt đối **KHÔNG** sao chép hoặc để lộ `service_role / secret` key vào mã nguồn frontend. Khóa `service_role` có quyền bypass RLS.
   > - Chỉ sử dụng `anon / public` key cho ứng dụng Client React + Vite.

---

## 3. CẤU HÌNH BIẾN MÔI TRƯỜNG TẠI CLIENT

1. Mở file [client/.env](file:///d:/CDTN2/client/.env) trong dự án.
2. Thay thế giá trị giữ chỗ (placeholder) bằng thông tin vừa lấy từ Supabase:

```env
# Supabase Cloud Production Configuration
VITE_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Lưu file. 
4. **Kiểm tra cơ chế tự động chuyển đổi**:
   - Khi `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` được điền đúng (không còn chứa chuỗi `your-project` hay `placeholder`), biến cờ `isSupabaseConfigured` trong [client/src/lib/supabase.js](file:///d:/CDTN2/client/src/lib/supabase.js) sẽ tự động chuyển sang `true`.
   - Ứng dụng sẽ tự động kích hoạt chế độ **Real Supabase Cloud** cho toàn bộ Auth, Query, Mutation, Storage và Realtime.

---

## 4. CHẠY MIGRATION SQL THEO THỨ TỰ CHUẨN

Vào **Supabase Dashboard -> SQL Editor** để thực thi các file SQL theo thứ tự dưới đây:

### Cách 1: Khởi tạo toàn diện nhanh nhất (Khuyến nghị cho DB mới)
Chạy trực tiếp file hợp nhất:
1. [supabase/schema.sql](file:///d:/CDTN2/supabase/schema.sql)
   - Chứa toàn bộ cấu trúc bảng, RLS Policies, Triggers bảo mật, Views và các hàm thống kê RPC (Student, Employer, Admin) và hệ thống Reviews 2 chiều.

---

### Cách 2: Chạy tuần tự theo từng Sprint Migration
Nếu muốn theo dõi và kiểm soát từng giai đoạn phát triển, hãy chạy lần lượt 9 file sau:

1. `supabase/migrations/20261106_sprint3_1_student_profile_portfolio.sql`
   - Bảng `profiles`, `student_profiles`, `student_projects`, trigger hồ sơ sinh viên & portfolio.
2. `supabase/migrations/20261106_sprint3_2_employer_company_profile.sql`
   - Bảng `companies`, liên kết Employer - Công ty và chính sách RLS liên quan.
3. `supabase/migrations/20261113_applicant_management_completion.sql`
   - Bảng `jobs`, `job_applications`, `application_status_history`, luồng tuyển dụng Kanban.
4. `supabase/migrations/20261113_sprint3_2_1_hardening.sql`
   - Tách bảng bảo mật `application_notes`, chuẩn hóa State Machine trạng thái tuyển dụng.
5. `supabase/migrations/20261113_sprint3_2_2_security_fixes.sql`
   - Siết `search_path = public` cho SECURITY DEFINER, bảo vệ cột theo whitelist, chặn nộp trùng.
6. `supabase/migrations/20261113_sprint3_2_3_profiles_and_cv_hardening.sql`
   - Chống leo quyền Admin qua signup/insert profiles, ẩn `email`/`phone`, siết quyền đọc `student_profiles`.
7. `supabase/migrations/20261113_sprint3_3_notifications.sql`
   - Bảng `notifications`, triggers tự động gửi thông báo khi ứng tuyển / đổi trạng thái, Realtime publication.
8. `supabase/migrations/20261113_sprint3_4_dashboard_analytics.sql`
   - Các hàm RPC thống kê phía Database (`get_student_dashboard_stats`, `get_employer_dashboard_stats`, `get_admin_dashboard_stats`).
9. `supabase/migrations/20261113_sprint4_reviews_and_admin.sql`
   - Bảng `reviews`, RLS đánh giá 2 chiều (Student <-> Employer), cột `is_active` kiểm duyệt người dùng.

---

## 5. TẠO CÁC STORAGE BUCKETS

Vào **Supabase Dashboard -> Storage -> Create bucket**:

| Tên Bucket | Visibility | Mục đích sử dụng | Dung lượng tối đa | Loại file cho phép (MIME) |
| :--- | :--- | :--- | :--- | :--- |
| **`cv`** | **Private (TẮT Public)** | Chứa file CV ứng tuyển của sinh viên. Truy cập bảo mật qua Signed URL. | 10 MB | `application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| **`portfolios`** | **Public (BẬT Public)** | Chứa ảnh minh họa dự án, portfolio của sinh viên. | 5 MB | `image/png,image/jpeg,image/webp` |
| **`companies`** | **Public (BẬT Public)** | Chứa ảnh logo công ty, banner của nhà tuyển dụng. | 5 MB | `image/png,image/jpeg,image/webp` |

> 🔒 **Lưu ý bảo mật về Bucket `cv`**:
> - Bắt buộc chọn `Private bucket`. Các chính sách RLS đã được cấu hình trong `schema.sql` (chỉ sinh viên sở hữu CV và Employer có Job mà sinh viên nộp đơn mới có quyền sinh Signed URL).

---

## 6. KIỂM TRA ROW LEVEL SECURITY (RLS)

Vào **Supabase Dashboard -> Database -> Tables**:
Xác nhận biểu tượng **RLS Enabled** (màu xanh lá cây) đã được bật trên tất cả các bảng:
- `profiles`
- `student_profiles`
- `companies`
- `jobs`
- `job_applications`
- `application_notes`
- `application_status_history`
- `notifications`
- `reviews`
- `saved_jobs`
- `student_projects`

Nếu có bảng nào chưa bật RLS, chạy lệnh:
```sql
ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;
```

---

## 7. KHỞI TẠO TÀI KHOẢN KIỂM THỬ (TEST ACCOUNTS)

Mở **Supabase Dashboard -> SQL Editor**, copy toàn bộ nội dung file [supabase/seed_test_accounts.sql](file:///d:/CDTN2/supabase/seed_test_accounts.sql) và nhấn **Run**.

Sau khi chạy xong, cơ sở dữ liệu sẽ có sẵn 5 tài khoản thử nghiệm với mật khẩu chung: `Password123!`

| Vai trò | Email đăng nhập | Mật khẩu | UUID Định danh | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **Student A** | `student.a@test.vn` | `Password123!` | `11111111-1111-1111-1111-111111111111` | Sinh viên UEH, đã ứng tuyển 1 Job |
| **Student B** | `student.b@test.vn` | `Password123!` | `22222222-2222-2222-2222-222222222222` | Sinh viên Bách Khoa |
| **Employer A** | `employer.a@test.vn` | `Password123!` | `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` | Nhà tuyển dụng Công ty Cổ phần Công nghệ A |
| **Employer B** | `employer.b@test.vn` | `Password123!` | `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb` | Nhà tuyển dụng Tập đoàn Giải pháp B |
| **Admin** | `admin@test.vn` | `Password123!` | `cccccccc-cccc-cccc-cccc-cccccccccccc` | Quản trị viên hệ thống kiểm duyệt tin đăng & user |

---

## 8. KIỂM TRA KẾT NỐI TỪ FRONTEND

1. Khởi động ứng dụng frontend:
   ```bash
   cd client
   npm run dev
   ```
2. Mở trình duyệt tại `http://localhost:5173`.
3. Mở Developer Tools (`F12`) -> Tab **Console**:
   - Nếu kết nối thành công: Không còn thông báo `Supabase chưa được cấu hình khóa API thực tế`.
4. Thực hiện đăng nhập thử:
   - Đăng nhập với tài khoản `employer.a@test.vn` / `Password123!`.
   - Vào mục **Quản lý ứng viên** -> Thấy đơn ứng tuyển của `student.a@test.vn`.
   - Chuyển trạng thái đơn ứng tuyển sang `Đang xem xét (reviewing)` -> Kiểm tra cập nhật trực tiếp trên bảng `job_applications`.
   - Đăng nhập với tài khoản `student.a@test.vn` -> Biểu tượng chuông nhận được thông báo cập nhật trạng thái đơn.
   - Đăng nhập với tài khoản `admin@test.vn` -> Truy cập trang `/admin` kiểm tra dashboard thống kê và danh sách duyệt tin.

---

## 9. GIẢI QUYẾT SỰ CỐ THƯỜNG GẶP (TROUBLESHOOTING)

1. **Lỗi `Invalid API key` hoặc `Failed to fetch`**:
   - Kiểm tra xem file `client/.env` đã có đúng giá trị chưa và khởi động lại Vite server (`Ctrl + C` và chạy lại `npm run dev`).
2. **Lỗi `new row violates row-level security policy` khi đăng ký tài khoản mới**:
   - Đảm bảo trigger `handle_new_user` và policy `profiles_insert_policy` đã được tạo từ `schema.sql`.
3. **Lỗi không mở được file CV của ứng viên**:
   - Kiểm tra xem bucket `cv` đã được tạo trong Storage chưa và tên bucket đúng định dạng chữ thường `cv`.
4. **Không nhận được Realtime thông báo**:
   - Kiểm tra trong **Database -> Replication**, bảng `public.notifications` đã được gán vào publication `supabase_realtime` hay chưa:
     ```sql
     ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
     ```
