const nodemailer = require('nodemailer');

// In-memory store cho danh sách email đã gửi gần đây (dành cho kiểm thử & audit log)
const recentEmails = [];

let transporter = null;

function getTransporter() {
  const emailUser = process.env.EMAIL_USER || 'phu47008@gmail.com';
  const emailPass = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || '';

  // 1. Nếu có cấu hình Gmail App Password (16 ký tự)
  if (emailPass && emailPass.trim() !== '') {
    const cleanPass = emailPass.trim().replace(/\s+/g, '');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: cleanPass
      }
    });
  }

  // 2. Nếu có cấu hình SMTP tùy chỉnh (Brevo, SendGrid, Mailtrap...)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Fallback dev transporter (tạo JSON transporter hoặc logging)
  return {
    sendMail: async (mailOptions) => {
      console.log('----------------------------------------------------');
      console.log(`[EMAIL DISPATCH] 📧 Gửi đến: ${mailOptions.to}`);
      console.log(`[EMAIL DISPATCH] 📌 Tiêu đề: ${mailOptions.subject}`);
      console.log(`[EMAIL DISPATCH] ⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`);
      console.log('----------------------------------------------------');
      return {
        messageId: `sim_${Date.now()}`,
        simulated: true
      };
    }
  };
}

/**
 * Gửi email chung và ghi log
 */
async function dispatchEmail({ to, subject, html, text, type = 'general' }) {
  const emailFrom = process.env.EMAIL_FROM || `"StudentHub Tuyển Dụng" <${process.env.EMAIL_USER || 'phu47008@gmail.com'}>`;
  
  // Tự động kiểm tra: Nếu địa chỉ nhận là email ảo thử nghiệm (@test.vn, @example.com),
  // tự động định tuyến gửi về Gmail thật để tránh máy chủ Google gửi thư báo lỗi Mailer-Daemon Bounce-back
  let targetEmail = to;
  const isVirtualEmail = !targetEmail || 
    targetEmail.endsWith('@test.vn') || 
    targetEmail.endsWith('@example.com') ||
    targetEmail.includes('admin@test') ||
    targetEmail.includes('student.a@test') ||
    targetEmail.includes('employer.a@test');

  if (isVirtualEmail) {
    const fallbackRealEmail = process.env.EMAIL_USER || 'phu47008@gmail.com';
    console.log(`[EMAIL ROUTING] Địa chỉ '${to}' là email ảo/demo. Tự động chuyển hướng gửi tới Gmail thật: ${fallbackRealEmail}`);
    targetEmail = fallbackRealEmail;
  }

  const mailOptions = {
    from: emailFrom,
    to: targetEmail,
    subject: isVirtualEmail ? `[DEMO -> Gửi thử nghiệm] ${subject}` : subject,
    text: text || subject,
    html
  };

  const emailRecord = {
    id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    to: targetEmail,
    originalTo: to,
    from: emailFrom,
    subject: mailOptions.subject,
    html,
    text,
    type,
    sentAt: new Date().toISOString(),
    status: 'success',
    isLiveSent: false
  };

  try {
    const currentTransporter = getTransporter();
    const info = await currentTransporter.sendMail(mailOptions);
    
    emailRecord.isLiveSent = !info.simulated;
    emailRecord.messageId = info.messageId;
    recentEmails.unshift(emailRecord);
    if (recentEmails.length > 50) recentEmails.pop();

    return {
      success: true,
      messageId: info.messageId,
      isLiveSent: emailRecord.isLiveSent,
      record: emailRecord
    };
  } catch (error) {
    console.error(`[EMAIL ERROR] Gửi email đến ${to} thất bại:`, error.message);
    emailRecord.status = 'failed';
    emailRecord.error = error.message;
    recentEmails.unshift(emailRecord);

    return {
      success: false,
      error: error.message,
      record: emailRecord
    };
  }
}

/**
 * 1. Email: Xác nhận nộp hồ sơ thành công (Chống spam, lưu trữ hệ thống)
 */
async function sendApplicationSubmittedEmail({
  to,
  studentName = 'Ứng viên',
  jobTitle = 'Vị trí ứng tuyển',
  companyName = 'Doanh nghiệp tuyển dụng',
  applicationId = '',
  appliedAt = new Date().toLocaleString('vi-VN'),
  cvUrl = ''
}) {
  const subject = `[StudentHub] Xác nhận nộp hồ sơ thành công: ${jobTitle} - ${companyName}`;
  const verifyCode = `SHUB-${Date.now().toString().slice(-6)}`;

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 6px; }
        .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .card { background: #f1f5f9; border-radius: 12px; padding: 20px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .card-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .card-label { color: #64748b; font-weight: 500; }
        .card-value { color: #0f172a; font-weight: 600; }
        .security-box { background: #eff6ff; border: 1px dashed #3b82f6; border-radius: 10px; padding: 14px; margin: 20px 0; font-size: 13px; color: #1e40af; }
        .timeline { margin: 24px 0; padding: 0; list-style: none; }
        .timeline-step { display: flex; align-items: flex-start; margin-bottom: 12px; font-size: 13px; color: #475569; }
        .timeline-dot { width: 8px; height: 8px; border-radius: 50%; background: #2563eb; margin-top: 6px; margin-right: 12px; flex-shrink: 0; }
        .footer { background: #0f172a; color: #94a3b8; padding: 24px; text-align: center; font-size: 12px; }
        .footer a { color: #38bdf8; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Student<span style="color: #93c5fd;">Hub</span></div>
          <div class="badge">Xác thực hồ sơ ứng tuyển hợp lệ</div>
          <h2 style="margin: 12px 0 0; font-size: 20px; font-weight: 700;">Hồ sơ của bạn đã được tiếp nhận!</h2>
        </div>
        <div class="content">
          <div class="greeting">Xin chào ${studentName},</div>
          <p>Hệ thống StudentHub xác nhận bạn đã nộp hồ sơ ứng tuyển thành công vào vị trí công việc dưới đây:</p>
          
          <div class="card">
            <div style="font-size: 16px; font-weight: 700; color: #1e3a8a; margin-bottom: 12px;">${jobTitle}</div>
            <div style="font-size: 14px; color: #334155; margin-bottom: 8px;"><strong>Đơn vị tuyển dụng:</strong> ${companyName}</div>
            <div style="font-size: 13px; color: #64748b; margin-bottom: 4px;"><strong>Thời gian nộp:</strong> ${appliedAt}</div>
            <div style="font-size: 13px; color: #64748b;"><strong>Mã xác thực hồ sơ:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #2563eb;">${verifyCode}</code></div>
          </div>

          <div class="security-box">
            🛡️ <strong>Chứng thực an toàn & Chống spam:</strong><br>
            Hồ sơ cùng tệp CV của bạn đã được mã hóa và lưu trữ an toàn trong cơ sở dữ liệu xác thực của StudentHub. Nhà tuyển dụng đã nhận được thông báo để bắt đầu đánh giá hồ sơ.
          </div>

          <p style="font-size: 14px; font-weight: 600; color: #0f172a; margin-top: 20px;">Quy trình xử lý hồ sơ tiếp theo:</p>
          <div class="timeline">
            <div class="timeline-step">
              <div class="timeline-dot" style="background: #10b981;"></div>
              <div><strong>Bước 1: Tiếp nhận hồ sơ</strong> (Đã hoàn tất - Bạn đang ở đây)</div>
            </div>
            <div class="timeline-step">
              <div class="timeline-dot" style="background: #cbd5e1;"></div>
              <div><strong>Bước 2: Nhà tuyển dụng xem xét & Đánh giá năng lực</strong></div>
            </div>
            <div class="timeline-step">
              <div class="timeline-dot" style="background: #cbd5e1;"></div>
              <div><strong>Bước 3: Hẹn phỏng vấn</strong> (Email thông báo lịch và phòng họp sẽ được gửi khi đạt)</div>
            </div>
            <div class="timeline-step">
              <div class="timeline-dot" style="background: #cbd5e1;"></div>
              <div><strong>Bước 4: Nhận việc & Triển khai</strong> (Thông báo chính thức và hợp đồng bảo vệ)</div>
            </div>
          </div>

          <p style="font-size: 13px; color: #64748b;">Bạn có thể tra cứu và theo dõi trạng thái hồ sơ bất kỳ lúc nào tại mục <strong>"Công việc của tôi > Việc đã ứng tuyển"</strong> trên hệ thống StudentHub.</p>
        </div>
        <div class="footer">
          <p>© 2026 StudentHub Việt Nam. Nền tảng kết nối việc làm và dự án sinh viên uy tín hàng đầu.</p>
          <p>Email hỗ trợ: <a href="mailto:phu47008@gmail.com">phu47008@gmail.com</a> | Hotline: (028) 7308 6868</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return dispatchEmail({
    to,
    subject,
    html,
    type: 'application_submitted'
  });
}

/**
 * 2. Email: Lịch hẹn phỏng vấn (Khi NTD chuyển sang 'interview')
 */
async function sendInterviewInvitationEmail({
  to,
  studentName = 'Ứng viên',
  jobTitle = 'Vị trí ứng tuyển',
  companyName = 'Doanh nghiệp tuyển dụng',
  interviewDate = 'Trong 2-3 ngày tới (Chi tiết qua link họp)',
  interviewType = 'Online qua Google Meet',
  interviewLink = 'https://meet.google.com/shub-interview-room',
  notes = 'Vui lòng chuẩn bị CV bản in hoặc chia sẻ màn hình portfolio sản phẩm thực tế.'
}) {
  const subject = `📅 [StudentHub] Thư mời phỏng vấn: ${jobTitle} - ${companyName}`;

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 6px; }
        .badge { display: inline-block; background: rgba(255,255,255,0.25); padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .interview-box { background: #faf5ff; border: 1.5px solid #d8b4fe; border-radius: 14px; padding: 22px; margin: 20px 0; }
        .item-row { margin-bottom: 10px; font-size: 14px; }
        .item-label { color: #6b21a8; font-weight: 600; display: inline-block; width: 140px; }
        .item-val { color: #0f172a; font-weight: 600; }
        .btn-join { display: inline-block; background: #7c3aed; color: #ffffff !important; padding: 12px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 10px; margin-top: 12px; }
        .notice { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #b45309; margin: 18px 0; }
        .footer { background: #0f172a; color: #94a3b8; padding: 24px; text-align: center; font-size: 12px; }
        .footer a { color: #38bdf8; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Student<span style="color: #c4b5fd;">Hub</span></div>
          <div class="badge">Thư Mời Phỏng Vấn Chính Thức</div>
          <h2 style="margin: 12px 0 0; font-size: 22px; font-weight: 700;">Nhà Tuyển Dụng Hẹn Lịch Phỏng Vấn!</h2>
        </div>
        <div class="content">
          <div class="greeting">Kính gửi ${studentName},</div>
          <p>Nhà tuyển dụng <strong>${companyName}</strong> rất ấn tượng với hồ sơ của bạn và trân trọng mời bạn tham dự buổi phỏng vấn trao đổi công việc cho vị trí <strong>${jobTitle}</strong>.</p>
          
          <div class="interview-box">
            <div class="item-row">
              <span class="item-label">Vị trí:</span>
              <span class="item-val">${jobTitle}</span>
            </div>
            <div class="item-row">
              <span class="item-label">Đơn vị phỏng vấn:</span>
              <span class="item-val">${companyName}</span>
            </div>
            <div class="item-row">
              <span class="item-label">Thời gian dự kiến:</span>
              <span class="item-val">${interviewDate}</span>
            </div>
            <div class="item-row">
              <span class="item-label">Hình thức:</span>
              <span class="item-val">${interviewType}</span>
            </div>
            <div class="item-row" style="margin-top: 8px;">
              <span class="item-label">Ghi chú từ NTD:</span>
              <div style="color: #334155; margin-top: 4px; font-style: italic;">"${notes}"</div>
            </div>

            <div style="text-align: center; margin-top: 16px;">
              <a href="${interviewLink}" target="_blank" class="btn-join">Tham gia phòng họp / Xem chi tiết</a>
            </div>
          </div>

          <div class="notice">
            💡 <strong>Lời khuyên dành cho bạn:</strong> Vui lòng có mặt/đăng nhập trước giờ hẹn 5-10 phút, kiểm tra camera/micro và chuẩn bị một vài câu hỏi về dự án để tạo ấn tượng tốt nhất với Nhà tuyển dụng!
          </div>

          <p style="font-size: 13px; color: #64748b;">Nếu cần điều chỉnh thời gian, bạn có thể gửi tin nhắn trực tiếp cho Nhà tuyển dụng qua mục <strong>Tin nhắn</strong> trên hệ thống StudentHub.</p>
        </div>
        <div class="footer">
          <p>© 2026 StudentHub Việt Nam. Chúc bạn có một buổi phỏng vấn thật thành công!</p>
          <p>Email hỗ trợ: <a href="mailto:phu47008@gmail.com">phu47008@gmail.com</a> | Hotline: (028) 7308 6868</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return dispatchEmail({
    to,
    subject,
    html,
    type: 'interview_invitation'
  });
}

/**
 * 3. Email: Chúc mừng đã được nhận việc (Khi NTD chuyển sang 'accepted')
 */
async function sendJobOfferAcceptedEmail({
  to,
  studentName = 'Ứng viên',
  jobTitle = 'Vị trí ứng tuyển',
  companyName = 'Doanh nghiệp tuyển dụng',
  salary = 'Theo thỏa thuận',
  startDate = 'Theo lịch làm việc thống nhất'
}) {
  const subject = `🎉 [StudentHub] CHÚC MỪNG BẠN ĐÃ TRÚNG TUYỂN - Vị trí: ${jobTitle}`;

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 36px 24px; text-align: center; color: #ffffff; }
        .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 6px; }
        .badge { display: inline-block; background: rgba(255,255,255,0.25); padding: 5px 14px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .content { padding: 32px 24px; }
        .congrats-title { font-size: 22px; font-weight: 800; color: #065f46; text-align: center; margin-bottom: 16px; }
        .offer-card { background: #ecfdf5; border: 2px solid #a7f3d0; border-radius: 14px; padding: 20px; margin: 20px 0; }
        .offer-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #d1fae5; font-size: 14px; }
        .offer-item:last-child { border-bottom: none; }
        .escrow-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; color: #1e40af; }
        .btn-action { display: block; text-align: center; background: #059669; color: #ffffff !important; padding: 14px 24px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 12px; margin-top: 20px; }
        .footer { background: #0f172a; color: #94a3b8; padding: 24px; text-align: center; font-size: 12px; }
        .footer a { color: #38bdf8; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Student<span style="color: #a7f3d0;">Hub</span></div>
          <div class="badge">THÔNG BÁO TRÚNG TUYỂN CHÍNH THỨC</div>
          <h2 style="margin: 12px 0 0; font-size: 24px; font-weight: 800;">CHÚC MỪNG BẠN ĐÃ ĐƯỢC NHẬN VIỆC!</h2>
        </div>
        <div class="content">
          <div class="congrats-title">🎉 Chúc mừng ${studentName}!</div>
          <p>Nhà tuyển dụng <strong>${companyName}</strong> đã chính thức phê duyệt đơn ứng tuyển và tiếp nhận bạn vào vị trí <strong>${jobTitle}</strong>.</p>
          
          <div class="offer-card">
            <div class="offer-item">
              <span style="color: #047857; font-weight: 600;">Vị trí công việc:</span>
              <strong style="color: #065f46;">${jobTitle}</strong>
            </div>
            <div class="offer-item">
              <span style="color: #047857; font-weight: 600;">Doanh nghiệp tiếp nhận:</span>
              <strong style="color: #065f46;">${companyName}</strong>
            </div>
            <div class="offer-item">
              <span style="color: #047857; font-weight: 600;">Mức thù lao / Lương:</span>
              <strong style="color: #059669;">${salary}</strong>
            </div>
            <div class="offer-item">
              <span style="color: #047857; font-weight: 600;">Bắt đầu công việc:</span>
              <strong style="color: #0f172a;">${startDate}</strong>
            </div>
          </div>

          <div class="escrow-box">
            🛡️ <strong>Chính sách bảo vệ thanh toán Escrow:</strong><br>
            Mọi thù lao và quyền lợi của bạn được bảo vệ qua quy trình kiểm soát tiến độ và giải ngân an toàn trên StudentHub. Bạn có thể theo dõi task, bàn giao sản phẩm và nhận thanh toán minh bạch.
          </div>

          <a href="http://localhost:5173" class="btn-action">Truy cập Dự Án & Bắt Đầu Công Việc</a>
        </div>
        <div class="footer">
          <p>© 2026 StudentHub Việt Nam. Chúc bạn có một hành trình công việc thật tuyệt vời!</p>
          <p>Email hỗ trợ: <a href="mailto:phu47008@gmail.com">phu47008@gmail.com</a> | Hotline: (028) 7308 6868</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return dispatchEmail({
    to,
    subject,
    html,
    type: 'job_offer_accepted'
  });
}

/**
 * 4. Email: Thông báo từ chối ứng tuyển (Khi NTD chuyển sang 'rejected')
 */
async function sendRejectionEmail({
  to,
  studentName = 'Ứng viên',
  jobTitle = 'Vị trí ứng tuyển',
  companyName = 'Doanh nghiệp tuyển dụng',
  notes = 'Hiện tại số lượng ứng viên lớn và tiêu chí tuyển dụng chưa hoàn toàn tương thích với giai đoạn này.'
}) {
  const subject = `[StudentHub] Thông báo kết quả ứng tuyển: ${jobTitle} - ${companyName}`;

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: #334155; padding: 30px 24px; text-align: center; color: #ffffff; }
        .logo { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 6px; }
        .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .content { padding: 32px 24px; }
        .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 18px 0; font-size: 14px; }
        .btn-more { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 12px 24px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px; margin-top: 14px; }
        .footer { background: #0f172a; color: #94a3b8; padding: 24px; text-align: center; font-size: 12px; }
        .footer a { color: #38bdf8; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Student<span style="color: #94a3b8;">Hub</span></div>
          <div class="badge">Thông Báo Kết Quả Tuyển Dụng</div>
          <h2 style="margin: 12px 0 0; font-size: 20px; font-weight: 700;">Kết Quả Ứng Tuyển Hồ Sơ</h2>
        </div>
        <div class="content">
          <div class="greeting">Xin chào ${studentName},</div>
          <p>Nhà tuyển dụng <strong>${companyName}</strong> chân thành cảm ơn bạn đã quan tâm và dành thời gian ứng tuyển vào vị trí <strong>${jobTitle}</strong>.</p>
          
          <div class="info-card">
            <p style="margin-top: 0; color: #475569;">
              Sau khi xem xét kỹ lưỡng hồ sơ, Nhà tuyển dụng rất tiếc phải thông báo hiện tại hồ sơ của bạn chưa phù hợp nhất với các tiêu chí cụ thể của đợt tuyển dụng này.
            </p>
            ${notes ? `<p style="margin-bottom: 0; font-style: italic; color: #64748b;">Phản hồi từ NTD: "${notes}"</p>` : ''}
          </div>

          <p>Hồ sơ và kỹ năng của bạn vẫn được lưu trữ trong mạng lưới kết nối của StudentHub để ưu tiên gợi ý cho các cơ hội việc làm & dự án phù hợp hơn trong tương lai.</p>

          <p style="text-align: center;">
            <a href="http://localhost:5173" class="btn-more">Khám phá các cơ hội việc làm khác trên StudentHub</a>
          </p>
        </div>
        <div class="footer">
          <p>© 2026 StudentHub Việt Nam. Chúc bạn luôn tự tin và sớm tìm được công việc ưng ý!</p>
          <p>Email hỗ trợ: <a href="mailto:phu47008@gmail.com">phu47008@gmail.com</a> | Hotline: (028) 7308 6868</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return dispatchEmail({
    to,
    subject,
    html,
    type: 'rejection'
  });
}

// In-memory store cho mã OTP xác thực đăng ký tài khoản
// Key: email.toLowerCase() -> { code, expiresAt, fullName, createdAt }
const otpStore = new Map();

/**
 * 5. Email: Gửi mã OTP xác thực đăng ký tài khoản (6 chữ số)
 */
async function sendRegistrationOtpEmail({ to, fullName, code }) {
  const subject = `[StudentHub] Mã xác thực đăng ký tài khoản: ${code}`;

  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 24px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #4f46e5 100%); padding: 36px 24px; text-align: center; color: #ffffff; }
        .logo { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 8px; }
        .badge { display: inline-block; background: rgba(255,255,255,0.22); padding: 4px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
        .otp-card { background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 16px; padding: 24px 16px; margin: 24px 0; text-align: center; }
        .otp-label { font-size: 12px; font-weight: 700; color: #15803d; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
        .otp-code { font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #166534; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; display: inline-block; padding-left: 12px; }
        .otp-sub { font-size: 12px; color: #64748b; margin-top: 10px; font-weight: 500; }
        .security-notice { background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #92400e; line-height: 1.5; }
        .footer { background: #0f172a; color: #94a3b8; padding: 24px; text-align: center; font-size: 12px; }
        .footer a { color: #38bdf8; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Student<span style="color: #93c5fd;">Hub</span></div>
          <div class="badge">Xác thực tài khoản mới</div>
          <h2 style="margin: 12px 0 0; font-size: 22px; font-weight: 700;">Mã Xác Thực Đăng Ký</h2>
        </div>
        <div class="content">
          <div class="greeting">Xin chào ${fullName || 'bạn'},</div>
          <p style="color: #475569; font-size: 14px; margin-top: 0;">
            Cảm ơn bạn đã lựa chọn đăng ký tài khoản tại nền tảng <strong>StudentHub</strong>. Để hoàn tất việc khởi tạo tài khoản và bảo vệ hòm thư cá nhân của bạn, vui lòng nhập mã xác thực gồm 6 chữ số dưới đây:
          </p>

          <div class="otp-card">
            <div class="otp-label">MÃ XÁC THỰC GMAIL CỦA BẠN</div>
            <div class="otp-code">${code}</div>
            <div class="otp-sub">⏱️ Mã có hiệu lực trong vòng <strong>5 phút</strong></div>
          </div>

          <div class="security-notice">
            🔒 <strong>Lưu ý bảo mật:</strong> Tuyệt đối không chia sẻ mã xác thực này cho bất kỳ ai. Ban quản trị StudentHub sẽ không bao giờ yêu cầu bạn cung cấp mã OTP.
          </div>

          <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
            Nếu bạn không yêu cầu tạo tài khoản này, vui lòng bỏ qua email. Tài khoản sẽ không được kích hoạt nếu không có mã xác nhận.
          </p>
        </div>
        <div class="footer">
          <p style="margin: 0 0 6px;">© 2026 StudentHub Việt Nam. Nền tảng kết nối việc làm và dự án sinh viên uy tín hàng đầu.</p>
          <p style="margin: 0;">Email hỗ trợ: <a href="mailto:phu47008@gmail.com">phu47008@gmail.com</a> | Hotline: (028) 7308 6868</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return dispatchEmail({
    to,
    subject,
    html,
    type: 'registration_otp'
  });
}

/**
 * Sinh mã OTP ngẫu nhiên 6 chữ số và gửi qua Gmail
 */
async function generateAndSendRegistrationOtp({ email, fullName }) {
  if (!email || !email.includes('@')) {
    throw new Error('Địa chỉ email không hợp lệ');
  }

  const cleanEmail = email.toLowerCase().trim();

  // Kiểm tra thời gian gửi lại (tối thiểu cách nhau 20s để chống spam)
  const existing = otpStore.get(cleanEmail);
  if (existing && Date.now() - existing.createdAt < 20000) {
    const waitSeconds = Math.ceil((20000 - (Date.now() - existing.createdAt)) / 1000);
    throw new Error(`Vui lòng chờ ${waitSeconds} giây trước khi yêu cầu gửi lại mã mới.`);
  }

  // Tạo mã 6 chữ số ngẫu nhiên
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 phút

  otpStore.set(cleanEmail, {
    code,
    expiresAt,
    fullName: fullName || 'Ứng viên',
    createdAt: Date.now()
  });

  console.log(`[OTP GENERATED] 🔑 Mã OTP cho ${cleanEmail}: ${code} (Hết hạn sau 5 phút)`);

  const dispatchResult = await sendRegistrationOtpEmail({
    to: cleanEmail,
    fullName: fullName || 'Ứng viên',
    code
  });

  return {
    success: true,
    email: cleanEmail,
    expiresInSeconds: 300,
    dispatchResult
  };
}

/**
 * Xác thực mã OTP 6 số người dùng nhập vào
 */
function verifyRegistrationOtp({ email, code }) {
  if (!email || !code) {
    return {
      success: false,
      message: 'Vui lòng cung cấp đầy đủ email và mã xác thực 6 số.'
    };
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanCode = String(code).trim().replace(/\s+/g, '');

  const record = otpStore.get(cleanEmail);
  if (!record) {
    return {
      success: false,
      message: 'Chưa có mã xác thực nào được gửi tới email này hoặc mã đã bị hủy. Vui lòng bấm "Gửi mã xác thực".'
    };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    return {
      success: false,
      message: 'Mã xác thực 6 số đã hết hạn sau 5 phút. Vui lòng yêu cầu gửi mã mới.'
    };
  }

  if (record.code !== cleanCode) {
    return {
      success: false,
      message: 'Mã xác thực không chính xác. Vui lòng kiểm tra kỹ email trong hộp thư đến (hoặc thư rác).'
    };
  }

  // Khớp mã thành công! Xóa mã khỏi store để chống dùng lại (Replay attack)
  otpStore.delete(cleanEmail);

  return {
    success: true,
    verified: true,
    email: cleanEmail,
    message: 'Xác thực địa chỉ Gmail thành công!'
  };
}

function getRecentEmails() {
  return recentEmails;
}

module.exports = {
  sendApplicationSubmittedEmail,
  sendInterviewInvitationEmail,
  sendJobOfferAcceptedEmail,
  sendRejectionEmail,
  sendRegistrationOtpEmail,
  generateAndSendRegistrationOtp,
  verifyRegistrationOtp,
  getRecentEmails,
  dispatchEmail
};
