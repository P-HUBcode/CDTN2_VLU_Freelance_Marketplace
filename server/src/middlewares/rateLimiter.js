const rateLimit = require('express-rate-limit');

// 1. Rate limiter chung cho toàn bộ hệ thống API (ngăn chặn DoS/Spam crawler)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10000, // Tăng lên 10.000 để hỗ trợ polling real-time mượt mà giữa các trình duyệt
  skip: (req) => {
    // Bỏ qua giới hạn cho localhost / môi trường kiểm thử đa trình duyệt
    const ip = req.ip || req.connection?.remoteAddress || '';
    return ip.includes('127.0.0.1') || ip.includes('::1') || ip.includes('localhost');
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Tài nguyên bị giới hạn: Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau 15 phút.'
  }
});

// 2. Rate limiter nghiêm ngặt cho các route nhạy cảm (Đăng nhập, Đăng ký, Quên mật khẩu)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 15, // Tối đa 15 lần thử xác thực / 15 phút chống Brute-Force Password
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Bạn đã thử đăng nhập/đăng ký quá nhiều lần. Để bảo vệ tài khoản, vui lòng đợi 15 phút trước khi thử lại.'
  }
});

// 3. Rate limiter cho đăng tin việc làm & nộp CV (chống spam tin rác)
const postLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 30, // Tối đa 30 thao tác gửi form / 10 phút
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Hệ thống phát hiện thao tác gửi dữ liệu liên tục. Vui lòng thử lại sau ít phút.'
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  postLimiter
};
