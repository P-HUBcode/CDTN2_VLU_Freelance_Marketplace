const { memoryStore } = require('../config/db');

// Khởi tạo danh sách tin nhắn rỗng trên server - KHÔNG dùng tin nhắn mẫu/mock data
if (!memoryStore.chatConversations) {
  memoryStore.chatConversations = [];
}

// 1. Lấy danh sách cuộc trò chuyện theo người dùng (Đồng bộ tức thời đa trình duyệt, hỗ trợ định danh UUID và Profile)
exports.getConversations = (req, res) => {
  try {
    const { userId, email, role, name, companyName } = req.query;

    // Bắt buộc phải có định danh người dùng (userId hoặc email hoặc role). Nếu không có -> trả về mảng rỗng
    if (!userId && !email && !name && !companyName) {
      return res.json({
        success: true,
        data: []
      });
    }

    const qId = (userId || '').trim().toLowerCase();
    const qEmail = (email || '').trim().toLowerCase();
    const qRole = (role || '').trim().toLowerCase();
    const qName = (name || companyName || '').trim().toLowerCase();

    // Lọc và liên kết cuộc hội thoại phù hợp
    const userConversations = (memoryStore.chatConversations || []).filter((conv) => {
      // 1. Khớp theo participantIds
      if (Array.isArray(conv.participantIds)) {
        const hasParticipant = conv.participantIds.some(
          (pId) => pId && (pId.toLowerCase() === qId || (qEmail && pId.toLowerCase() === qEmail))
        );
        if (hasParticipant) return true;
      }

      // 2. Khớp trực tiếp studentId hoặc employerId
      if (qId && conv.studentId && conv.studentId.toLowerCase() === qId) return true;
      if (qId && conv.employerId && conv.employerId.toLowerCase() === qId) return true;

      // 3. Khớp theo email
      if (qEmail && conv.studentEmail && conv.studentEmail.toLowerCase() === qEmail) return true;
      if (qEmail && conv.employerEmail && conv.employerEmail.toLowerCase() === qEmail) return true;

      // 4. Khớp theo tin nhắn trong hội thoại
      if (Array.isArray(conv.messages)) {
        const isMsgParticipant = conv.messages.some(
          (m) =>
            (qId && m.senderId && m.senderId.toLowerCase() === qId) ||
            (qId && m.receiverId && m.receiverId.toLowerCase() === qId) ||
            (qEmail && m.senderEmail && m.senderEmail.toLowerCase() === qEmail) ||
            (qEmail && m.receiverEmail && m.receiverEmail.toLowerCase() === qEmail)
        );
        if (isMsgParticipant) return true;
      }

      // 5. Tự động liên kết (Smart Claim) khi cuộc hội thoại được khởi tạo trước đó bằng tên công ty / tên sinh viên
      if (qRole === 'employer') {
        const matchesName = (qName && conv.employerName && conv.employerName.toLowerCase() === qName) ||
                            (qName && conv.name && conv.name.toLowerCase() === qName);
        const matchesRole = conv.employerId === 'role_employer' || !conv.employerId;
        if (matchesName || (matchesRole && qEmail && conv.employerEmail && conv.employerEmail.toLowerCase() === qEmail)) {
          if (userId) {
            conv.employerId = userId;
            if (!conv.participantIds) conv.participantIds = [];
            if (!conv.participantIds.includes(userId)) conv.participantIds.push(userId);
          }
          if (email && !conv.employerEmail) conv.employerEmail = email;
          if (name && !conv.employerName) conv.employerName = name;
          return true;
        }
      }

      if (qRole === 'student') {
        const matchesName = (qName && conv.studentName && conv.studentName.toLowerCase() === qName) ||
                            (qName && conv.name && conv.name.toLowerCase() === qName);
        const matchesRole = conv.studentId === 'role_student' || !conv.studentId;
        if (matchesName || (matchesRole && qEmail && conv.studentEmail && conv.studentEmail.toLowerCase() === qEmail)) {
          if (userId) {
            conv.studentId = userId;
            if (!conv.participantIds) conv.participantIds = [];
            if (!conv.participantIds.includes(userId)) conv.participantIds.push(userId);
          }
          if (email && !conv.studentEmail) conv.studentEmail = email;
          if (name && !conv.studentName) conv.studentName = name;
          return true;
        }
      }

      return false;
    });

    // Định hình lại cuộc hội thoại theo góc nhìn của người gọi API
    const formattedConversations = userConversations.map((conv) => {
      // Xác định người gọi là Sinh viên hay Nhà tuyển dụng trong hội thoại này
      const isViewerEmployer = (qRole === 'employer') ||
                               (conv.employerId && qId && conv.employerId.toLowerCase() === qId) ||
                               (conv.employerEmail && qEmail && conv.employerEmail.toLowerCase() === qEmail);

      const isViewerStudent = !isViewerEmployer;

      let partnerName = conv.name;
      let partnerAvatar = conv.avatar;
      let partnerJobTitle = conv.jobTitle || 'Trực tuyến';
      let partnerRole = 'student';
      let partnerId = null;
      let partnerEmail = null;

      if (isViewerStudent) {
        // Người xem là Sinh viên -> Đối tác là Nhà tuyển dụng
        partnerName = conv.employerName || conv.name || 'Nhà tuyển dụng';
        partnerAvatar = conv.employerAvatar || conv.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150';
        partnerJobTitle = 'Nhà tuyển dụng / Doanh nghiệp';
        partnerRole = 'employer';
        partnerId = conv.employerId;
        partnerEmail = conv.employerEmail;
      } else {
        // Người xem là Nhà tuyển dụng -> Đối tác là Sinh viên
        partnerName = conv.studentName || conv.name || 'Ứng viên sinh viên';
        partnerAvatar = conv.studentAvatar || conv.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
        partnerJobTitle = 'Ứng viên sinh viên';
        partnerRole = 'student';
        partnerId = conv.studentId;
        partnerEmail = conv.studentEmail;
      }

      // Format lại sender của từng tin nhắn theo đúng người gọi API ('me' vs 'them')
      const formattedMessages = (conv.messages || []).map((m) => {
        let isMe = false;
        if (qId && m.senderId && m.senderId.toLowerCase() === qId) {
          isMe = true;
        } else if (qEmail && m.senderEmail && m.senderEmail.toLowerCase() === qEmail) {
          isMe = true;
        } else if (qRole && m.senderRole && m.senderRole.toLowerCase() === qRole) {
          isMe = true;
        } else if (m.senderId === (qRole === 'employer' ? 'role_employer' : 'role_student')) {
          isMe = true;
        }

        return {
          ...m,
          sender: isMe ? 'me' : 'them'
        };
      });

      return {
        ...conv,
        name: partnerName,
        avatar: partnerAvatar,
        jobTitle: partnerJobTitle,
        partnerRole,
        partnerId,
        partnerEmail,
        messages: formattedMessages
      };
    });

    res.json({
      success: true,
      data: formattedConversations
    });
  } catch (error) {
    console.error('Lỗi getConversations:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// 2. Gửi tin nhắn mới (Đồng bộ tức thời giữa các trình duyệt khác nhau và gán đúng quyền sở hữu)
exports.sendMessage = (req, res) => {
  try {
    const {
      senderId,
      senderName,
      senderAvatar,
      senderRole,
      senderEmail,
      receiverId,
      receiverEmail,
      targetName,
      targetAvatar,
      targetRole,
      conversationId,
      message
    } = req.body;

    if (!message || !message.text) {
      return res.status(400).json({ success: false, message: 'Nội dung tin nhắn không được để trống' });
    }

    if (!senderId) {
      return res.status(400).json({ success: false, message: 'Thiếu định danh người gửi (senderId)' });
    }

    const partnerName = targetName || 'Người liên hệ';
    const isSenderStudent = senderRole === 'student';

    // Tìm cuộc hội thoại phù hợp
    let conv = (memoryStore.chatConversations || []).find((c) => {
      if (conversationId && c.id === conversationId) return true;
      if (senderId && receiverId && Array.isArray(c.participantIds)) {
        if (c.participantIds.includes(senderId) && c.participantIds.includes(receiverId)) return true;
      }
      const matchesPartner = (partnerName && c.name?.toLowerCase() === partnerName.toLowerCase()) ||
                             (partnerName && c.employerName?.toLowerCase() === partnerName.toLowerCase()) ||
                             (partnerName && c.studentName?.toLowerCase() === partnerName.toLowerCase());
      const hasSender = Array.isArray(c.participantIds) && c.participantIds.includes(senderId);
      return hasSender && matchesPartner;
    });

    const newMsg = {
      id: message.id || `msg_${Date.now()}`,
      senderId,
      senderName: senderName || (senderRole === 'employer' ? 'Nhà tuyển dụng' : 'Sinh viên'),
      senderAvatar: senderAvatar || (senderRole === 'employer' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
      senderRole: senderRole || 'student',
      senderEmail: senderEmail || '',
      receiverId: receiverId || '',
      receiverEmail: receiverEmail || '',
      sender: 'me',
      text: message.text,
      time: message.time || 'Vừa xong',
      createdAt: new Date().toISOString()
    };

    if (conv) {
      if (!conv.messages.some((m) => m.id === newMsg.id)) {
        conv.messages.push(newMsg);
      }
      conv.updatedAt = new Date().toISOString();
      if (!Array.isArray(conv.participantIds)) conv.participantIds = [];
      if (!conv.participantIds.includes(senderId)) conv.participantIds.push(senderId);
      if (receiverId && !conv.participantIds.includes(receiverId)) conv.participantIds.push(receiverId);

      // Cập nhật thông tin chi tiết của 2 bên
      if (isSenderStudent) {
        conv.studentId = senderId;
        conv.studentName = senderName || conv.studentName;
        if (senderAvatar) conv.studentAvatar = senderAvatar;
        if (senderEmail) conv.studentEmail = senderEmail;
        if (receiverId && receiverId !== 'role_employer') conv.employerId = receiverId;
        if (receiverEmail && !conv.employerEmail) conv.employerEmail = receiverEmail;
        if (targetName && !conv.employerName) conv.employerName = targetName;
        if (targetAvatar && !conv.employerAvatar) conv.employerAvatar = targetAvatar;
      } else {
        conv.employerId = senderId;
        conv.employerName = senderName || conv.employerName;
        if (senderAvatar) conv.employerAvatar = senderAvatar;
        if (senderEmail) conv.employerEmail = senderEmail;
        if (receiverId && receiverId !== 'role_student') conv.studentId = receiverId;
        if (receiverEmail && !conv.studentEmail) conv.studentEmail = receiverEmail;
        if (targetName && !conv.studentName) conv.studentName = targetName;
        if (targetAvatar && !conv.studentAvatar) conv.studentAvatar = targetAvatar;
      }
    } else {
      const participantIds = [senderId];
      if (receiverId) participantIds.push(receiverId);

      conv = {
        id: conversationId || `conv_${Date.now()}`,
        name: partnerName,
        jobTitle: senderRole === 'employer' ? 'Ứng viên sinh viên' : 'Nhà tuyển dụng / Doanh nghiệp',
        avatar: targetAvatar || (senderRole === 'employer' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
        online: true,
        unread: false,
        participantIds,
        studentId: isSenderStudent ? senderId : (receiverId || null),
        studentName: isSenderStudent ? senderName : (targetName || null),
        studentAvatar: isSenderStudent ? senderAvatar : (targetAvatar || null),
        studentEmail: isSenderStudent ? (senderEmail || null) : (receiverEmail || null),
        employerId: !isSenderStudent ? senderId : (receiverId || null),
        employerName: !isSenderStudent ? senderName : (targetName || null),
        employerAvatar: !isSenderStudent ? senderAvatar : (targetAvatar || null),
        employerEmail: !isSenderStudent ? (senderEmail || null) : (receiverEmail || null),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [newMsg]
      };
      if (!memoryStore.chatConversations) memoryStore.chatConversations = [];
      memoryStore.chatConversations.unshift(conv);
    }

    // Tự động đẩy thông báo chuông (Bell Notification) cho người nhận
    try {
      if (!memoryStore.notifications) memoryStore.notifications = [];
      const notifSender = senderName || (senderRole === 'employer' ? 'Nhà tuyển dụng' : 'Sinh viên');
      const notifText = message.text.length > 70 ? message.text.substring(0, 70) + '...' : message.text;
      const targetUser = isSenderStudent ? (conv.employerId || receiverId) : (conv.studentId || receiverId);
      const targetEmail = isSenderStudent ? (conv.employerEmail || receiverEmail) : (conv.studentEmail || receiverEmail);
      const targetDisplayName = isSenderStudent ? (conv.employerName || targetName) : (conv.studentName || targetName);

      const newNotif = {
        id: `notif_msg_${Date.now()}`,
        userId: targetUser || '',
        userEmail: targetEmail || '',
        recipientName: targetDisplayName || '',
        userName: targetDisplayName || '',
        type: 'new_message',
        title: `Tin nhắn mới từ ${notifSender}`,
        message: notifText,
        desc: notifText,
        isRead: false,
        unread: true,
        createdAt: new Date().toISOString()
      };
      memoryStore.notifications.unshift(newNotif);
    } catch (e) {}

    res.status(201).json({
      success: true,
      data: conv
    });
  } catch (err) {
    console.error('Lỗi sendMessage:', err);
    res.status(500).json({ success: false, message: 'Lỗi server khi gửi tin nhắn' });
  }
};

// 3. Xóa tin nhắn ảo / Làm sạch hòm thư
exports.clearMock = (req, res) => {
  memoryStore.chatConversations = [];
  res.json({ success: true, message: 'Đã xóa sạch hòm thư' });
};
