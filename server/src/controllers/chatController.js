const { memoryStore } = require('../config/db');

// Khởi tạo danh sách tin nhắn rỗng trên server - KHÔNG dùng tin nhắn mẫu/mock data
if (!memoryStore.chatConversations) {
  memoryStore.chatConversations = [];
}

// 1. Lấy danh sách cuộc trò chuyện theo người dùng (Đảm bảo cách ly 100% giữa các User)
exports.getConversations = (req, res) => {
  try {
    const { userId, email, role } = req.query;

    // Bắt buộc phải có định danh người dùng (userId hoặc email). Nếu không có -> trả về mảng rỗng
    if (!userId && !email) {
      return res.json({
        success: true,
        data: []
      });
    }

    const qId = (userId || '').trim().toLowerCase();
    const qEmail = (email || '').trim().toLowerCase();

    // Lọc chỉ những cuộc hội thoại mà user hiện tại thực sự là người tham gia (participant)
    const userConversations = (memoryStore.chatConversations || []).filter((conv) => {
      // 1. Kiểm tra mảng participantIds
      if (Array.isArray(conv.participantIds)) {
        const hasParticipant = conv.participantIds.some(
          (pId) => pId && (pId.toLowerCase() === qId || (qEmail && pId.toLowerCase() === qEmail))
        );
        if (hasParticipant) return true;
      }

      // 2. Kiểm tra studentId hoặc employerId
      if (conv.studentId && (conv.studentId.toLowerCase() === qId || conv.studentId.toLowerCase() === qEmail)) {
        return true;
      }
      if (conv.employerId && (conv.employerId.toLowerCase() === qId || conv.employerId.toLowerCase() === qEmail)) {
        return true;
      }

      // 3. Kiểm tra messages trong hội thoại xem user có phải người gửi hoặc người nhận
      if (Array.isArray(conv.messages)) {
        const isMsgParticipant = conv.messages.some(
          (m) =>
            (m.senderId && m.senderId.toLowerCase() === qId) ||
            (m.receiverId && m.receiverId.toLowerCase() === qId) ||
            (m.senderEmail && m.senderEmail.toLowerCase() === qEmail) ||
            (m.receiverEmail && m.receiverEmail.toLowerCase() === qEmail)
        );
        if (isMsgParticipant) return true;
      }

      return false;
    });

    res.json({
      success: true,
      data: userConversations
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
      receiverId,
      targetName,
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
    const partnerId = receiverId || `user_${Date.now()}`;

    // Tìm cuộc hội thoại
    let conv = (memoryStore.chatConversations || []).find((c) => {
      if (c.id === conversationId) return true;
      const isParticipant = Array.isArray(c.participantIds) && c.participantIds.includes(senderId);
      const matchesTarget = (partnerName && c.name?.toLowerCase() === partnerName.toLowerCase()) ||
                            (receiverId && Array.isArray(c.participantIds) && c.participantIds.includes(receiverId));
      return isParticipant && matchesTarget;
    });

    const newMsg = {
      id: message.id || `msg_${Date.now()}`,
      senderId,
      senderName: senderName || (senderRole === 'employer' ? 'Nhà tuyển dụng' : 'Sinh viên'),
      senderAvatar: senderAvatar || (senderRole === 'employer' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
      senderRole: senderRole || 'student',
      receiverId: receiverId || '',
      sender: message.sender || 'me',
      text: message.text,
      time: message.time || 'Vừa xong',
      createdAt: new Date().toISOString()
    };

    if (conv) {
      if (!conv.messages.some((m) => m.id === newMsg.id)) {
        conv.messages.push(newMsg);
      }
      conv.updatedAt = new Date().toISOString();
      if (Array.isArray(conv.participantIds)) {
        if (!conv.participantIds.includes(senderId)) conv.participantIds.push(senderId);
        if (receiverId && !conv.participantIds.includes(receiverId)) conv.participantIds.push(receiverId);
      }
    } else {
      conv = {
        id: conversationId || `conv_${Date.now()}`,
        name: partnerName,
        jobTitle: senderRole === 'employer' ? 'Nhà tuyển dụng' : 'Ứng viên sinh viên',
        avatar: senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        online: true,
        unread: false,
        participantIds: [senderId, ...(receiverId ? [receiverId] : [])],
        studentId: senderRole === 'student' ? senderId : (receiverId || null),
        employerId: senderRole === 'employer' ? senderId : (receiverId || null),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [newMsg]
      };
      if (!memoryStore.chatConversations) memoryStore.chatConversations = [];
      memoryStore.chatConversations.unshift(conv);
    }

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
