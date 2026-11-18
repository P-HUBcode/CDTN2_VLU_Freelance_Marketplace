const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

// Gửi email xác nhận nộp hồ sơ
router.post('/application-submitted', async (req, res) => {
  try {
    const { to, studentName, jobTitle, companyName, applicationId, cvUrl } = req.body;

    if (!to) {
      return res.status(400).json({ success: false, message: 'Thiếu địa chỉ email người nhận (to)' });
    }

    const result = await emailService.sendApplicationSubmittedEmail({
      to,
      studentName: studentName || 'Ứng viên',
      jobTitle: jobTitle || 'Vị trí ứng tuyển',
      companyName: companyName || 'Doanh nghiệp tuyển dụng',
      applicationId,
      cvUrl
    });

    res.json({
      success: true,
      message: 'Email xác nhận nộp hồ sơ đã được xử lý gửi đi thành công',
      result
    });
  } catch (err) {
    console.error('Lỗi API email application-submitted:', err);
    res.status(500).json({ success: false, message: 'Lỗi gửi email', error: err.message });
  }
});

// Gửi email khi thay đổi trạng thái hồ sơ ứng tuyển
router.post('/status-changed', async (req, res) => {
  try {
    const {
      to,
      studentName,
      jobTitle,
      companyName,
      status,
      notes,
      interviewDate,
      interviewType,
      interviewLocation,
      interviewLink,
      salary
    } = req.body;

    if (!to) {
      return res.status(400).json({ success: false, message: 'Thiếu địa chỉ email người nhận (to)' });
    }

    // QUY ĐỊNH CỦA NGƯỜI DÙNG: "trừ trạng thái đang xem xét thì không thông báo"
    if (status === 'reviewing' || status === 'pending') {
      return res.json({
        success: true,
        ignored: true,
        message: 'Trạng thái đang xem xét (reviewing) không gửi email thông báo theo quy định'
      });
    }

    let result = null;

    if (status === 'interview') {
      result = await emailService.sendInterviewInvitationEmail({
        to,
        studentName: studentName || 'Ứng viên',
        jobTitle: jobTitle || 'Vị trí công việc',
        companyName: companyName || 'Doanh nghiệp tuyển dụng',
        interviewDate: interviewDate || 'Trong 2-3 ngày làm việc tới (Chi tiết phòng họp qua link)',
        interviewType: interviewType || 'Online (Google Meet)',
        interviewLink: interviewLink || 'https://meet.google.com/shub-interview-room',
        notes: notes || 'Vui lòng chuẩn bị sẵn sàng thông tin và vào phòng họp trước 5 phút.'
      });
    } else if (status === 'accepted') {
      result = await emailService.sendJobOfferAcceptedEmail({
        to,
        studentName: studentName || 'Ứng viên',
        jobTitle: jobTitle || 'Vị trí công việc',
        companyName: companyName || 'Doanh nghiệp tuyển dụng',
        salary: salary || 'Theo thỏa thuận tin tuyển dụng',
        startDate: 'Theo thỏa thuận với Nhà tuyển dụng'
      });
    } else if (status === 'rejected') {
      result = await emailService.sendRejectionEmail({
        to,
        studentName: studentName || 'Ứng viên',
        jobTitle: jobTitle || 'Vị trí công việc',
        companyName: companyName || 'Doanh nghiệp tuyển dụng',
        notes: notes || 'Số lượng ứng viên lớn và tiêu chí tuyển dụng chưa hoàn toàn tương thích ở giai đoạn này.'
      });
    } else {
      return res.status(400).json({ success: false, message: `Trạng thái '${status}' không yêu cầu gửi email` });
    }

    res.json({
      success: true,
      status,
      message: `Đã gửi email thông báo trạng thái '${status}' thành công đến ${to}`,
      result
    });
  } catch (err) {
    console.error('Lỗi API email status-changed:', err);
    res.status(500).json({ success: false, message: 'Lỗi gửi email trạng thái', error: err.message });
  }
});

// Tra cứu danh sách email đã gửi gần đây (Audit log & kiểm thử)
router.get('/recent', (req, res) => {
  const emails = emailService.getRecentEmails();
  res.json({
    success: true,
    count: emails.length,
    data: emails
  });
});

// --------------------------------------------------------------------------
// 🔐 XÁC THỰC GMAIL KHI ĐĂNG KÝ TÀI KHOẢN (MÃ OTP 6 SỐ)
// --------------------------------------------------------------------------

// 1. Gửi mã OTP xác thực đăng ký đến Gmail
router.post('/send-otp', async (req, res) => {
  try {
    const { email, fullName } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp địa chỉ email (Gmail).' });
    }

    const result = await emailService.generateAndSendRegistrationOtp({
      email,
      fullName: fullName || 'Ứng viên'
    });

    res.json({
      success: true,
      message: `Mã xác thực 6 số đã được gửi tới Gmail ${email}. Vui lòng kiểm tra hộp thư!`,
      expiresInSeconds: result.expiresInSeconds
    });
  } catch (err) {
    console.error('Lỗi gửi OTP qua email:', err);
    res.status(400).json({ success: false, message: err.message || 'Không thể gửi mã xác thực.' });
  }
});

// 2. Xác thực mã OTP 6 số do người dùng nhập vào
router.post('/verify-otp', (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền email và mã xác thực 6 số.' });
    }

    const result = emailService.verifyRegistrationOtp({ email, code });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error('Lỗi xác thực OTP:', err);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi xác thực mã OTP.' });
  }
});

module.exports = router;
