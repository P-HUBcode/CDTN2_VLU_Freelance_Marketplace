# Quy tắc phát triển và kiểm thử StudentHub (CDTN2)

## Trước khi sửa

- Kiểm tra nhánh, commit hiện tại và các thay đổi bằng `git status` và `git diff`.
- Giữ các thay đổi đang làm dở. Lần theo luồng từ giao diện đến API và nơi lưu
  dữ liệu để tìm nguyên nhân trước khi sửa.
- Gom các lỗi có cùng nguyên nhân. Xác định kết quả mong đợi cho cả luồng.

## Dữ liệu và phân quyền

- Backend lấy danh tính từ phiên đã xác thực và kiểm tra quyền xem, tạo,
  cập nhật hoặc xóa theo vai trò và quan hệ của người dùng với dữ liệu.
- Dự án, ứng tuyển, tin nhắn và thông báo chỉ hiển thị cho tài khoản có quyền.
  Cache cá nhân phải tách theo ID tài khoản. Khi đổi tài khoản, xóa trạng thái
  giao diện cũ và bỏ qua phản hồi đến muộn từ phiên trước.
- Phân biệt đang tải, dữ liệu rỗng và lỗi. Danh sách rỗng phải thay thế danh sách
  cũ và cập nhật badge. API thất bại phải hiện lỗi, không báo thành công giả.
- Chỉ dùng dữ liệu mẫu trong luồng demo chủ động. Giữ các tin Marketplace
  được phép công khai.
- Giữ OTP và đặt lại mật khẩu qua luồng xác thực được hỗ trợ. Admin được
  quản lý hồ sơ và đặt lại mật khẩu theo quyền. API, giao diện và log không
  trả về mật khẩu hiện tại, mã xác thực hoặc khóa bí mật.

## Điều kiện hoàn thành

- Kiểm tra luồng vừa sửa từ đầu đến cuối bằng các vai trò liên quan.
- Với dữ liệu cá nhân, thử đăng nhập tài khoản A có dữ liệu, chuyển sang
  tài khoản B mới trên cùng trình duyệt, tải lại trang, rồi quay lại A.
  Kiểm tra cả danh sách, trang chi tiết và badge.
- Chạy build frontend, các bài kiểm thử liên quan và `git diff --check`.
  Ghi rõ ca nào đã đạt, ca nào lỗi và ca nào bị chặn do thiếu môi trường.
- Báo cáo bằng tiếng Việt gồm nguyên nhân, file đã sửa và kết quả kiểm thử.
  Giữ thay đổi trong workspace để người dùng xem diff trước khi commit/push.