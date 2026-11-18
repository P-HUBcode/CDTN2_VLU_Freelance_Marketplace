// ==============================================================================
// STUDENTHUB - EMAIL CLIENT SERVICE
// Tự động kết nối Backend Email API (Nodemailer) & Quản lý thông báo email
// ==============================================================================

const BACKEND_URL = 'http://localhost:5000';

/**
 * 1. Gửi email xác nhận nộp hồ sơ ứng tuyển (chống spam & lưu trữ hệ thống)
 */
export async function notifyApplicationSubmitted({
  to,
  studentName,
  jobTitle,
  companyName,
  applicationId,
  cvUrl
}) {
  if (!to) {
    console.warn('Không có email người nhận để gửi thông báo nộp đơn.');
    return { success: false, reason: 'missing_email' };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/emails/application-submitted`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        studentName,
        jobTitle,
        companyName,
        applicationId,
        cvUrl
      })
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Lỗi gọi API gửi email xác nhận ứng tuyển:', err);
  }

  return { success: false };
}

/**
 * 2. Gửi email cập nhật trạng thái ứng tuyển từ Nhà tuyển dụng:
 * - 'interview': Hẹn phỏng vấn (tự động gửi lịch, link và ghi chú)
 * - 'accepted': Chúc mừng trúng tuyển / Đã nhận việc
 * - 'rejected': Thông báo kết quả ứng tuyển lịch sự
 * - 'reviewing': Đang xem xét -> BỎ QUA không gửi theo yêu cầu người dùng
 */
export async function notifyApplicationStatusChange({
  to,
  studentName,
  jobTitle,
  companyName,
  status,
  notes,
  interviewDate,
  interviewType,
  interviewLink,
  salary
}) {
  if (!to) {
    console.warn('Không có email ứng viên để gửi thông báo trạng thái.');
    return { success: false, reason: 'missing_email' };
  }

  // Yêu cầu bắt buộc: trừ trạng thái đang xem xét thì không thông báo
  if (status === 'reviewing' || status === 'pending') {
    return {
      success: true,
      ignored: true,
      message: 'Trạng thái đang xem xét không gửi thông báo email'
    };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/emails/status-changed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        studentName,
        jobTitle,
        companyName,
        status,
        notes,
        interviewDate,
        interviewType,
        interviewLink,
        salary
      })
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Lỗi gọi API gửi email trạng thái ứng tuyển:', err);
  }

  return { success: false };
}

/**
 * 3. Lấy danh sách email đã gửi gần đây (Audit log)
 */
export async function fetchRecentEmails() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/emails/recent`);
    if (res.ok) {
      const data = await res.json();
      return data.data || [];
    }
  } catch (err) {
    console.warn('Lỗi fetch recent emails:', err);
  }
  return [];
}

/**
 * 4. Gửi mã OTP xác thực 6 số đến Gmail để tạo tài khoản mới
 */
export async function sendRegistrationOtp({ email, fullName }) {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Địa chỉ email (Gmail) không hợp lệ.' };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/emails/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fullName })
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Lỗi gọi API send-otp:', err);
    return { success: false, message: 'Không thể kết nối đến máy chủ gửi mã OTP. Vui lòng thử lại.' };
  }
}

/**
 * 5. Xác thực mã OTP 6 số người dùng nhập
 */
export async function verifyRegistrationOtp({ email, code }) {
  if (!email || !code) {
    return { success: false, message: 'Vui lòng nhập đầy đủ email và mã xác thực 6 số.' };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/emails/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Lỗi gọi API verify-otp:', err);
    return { success: false, message: 'Không thể kết nối máy chủ xác thực OTP.' };
  }
}
