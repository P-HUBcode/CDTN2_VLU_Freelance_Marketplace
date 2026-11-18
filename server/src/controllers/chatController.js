const { memoryStore } = require('../config/db');

// Khởi tạo danh sách tin nhắn mặc định trên server
if (!memoryStore.chatConversations) {
  memoryStore.chatConversations = [
    {
      id: 'conv_01',
      name: 'Chị Mai - HR ABC Media',
      jobTitle: 'Social Media Content Creator',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      online: true,
      unread: true,
      messages: [
        {
          id: 'msg_01',
          senderId: 'role_employer',
          senderName: 'Chị Mai - HR ABC Media',
          senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          senderRole: 'employer',
          sender: 'them',
          text: 'Chào em, bên chị đã xem CV và bài viết mẫu của em. Em có thể gửi thêm link portfolio được không?',
          time: '09:15'
        },
        {
          id: 'msg_02',
          senderId: 'role_student',
          senderName: 'Nguyễn Minh Anh',
          senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          senderRole: 'student',
          sender: 'me',
          text: 'Dạ em chào chị Mai ạ! Em cảm ơn chị và team ABC Media đã quan tâm đến hồ sơ của em ạ.',
          time: '09:18'
        },
        {
          id: 'msg_03',
          senderId: 'role_employer',
          senderName: 'Chị Mai - HR ABC Media',
          senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          senderRole: 'employer',
          sender: 'them',
          text: 'Thứ Năm này khoảng 14h em có rảnh họp online 15 phút để trao đổi thêm về lịch làm việc part-time không em?',
          time: '09:20'
        },
        {
          id: 'msg_04',
          senderId: 'role_student',
          senderName: 'Nguyễn Minh Anh',
          senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          senderRole: 'student',
          sender: 'me',
          text: 'Dạ được ạ, thứ Năm em không có tiết học ở UEH nên có thể tham gia đúng 14h ạ. Em cảm ơn chị nhiều!',
          time: '09:22'
        }
      ]
    },
    {
      id: 'conv_02',
      name: 'Anh Tuấn - Quản lý ABC Coffee',
      jobTitle: 'Tuyển Nhân viên phục vụ part-time',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      online: false,
      unread: false,
      messages: [
        {
          id: 'msg_05',
          senderId: 'role_employer',
          senderName: 'Anh Tuấn - Quản lý ABC Coffee',
          senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          senderRole: 'employer',
          sender: 'them',
          text: 'Chào bạn, quán cafe sách bên anh có ca tối 18h - 22h rất hợp lịch học sinh viên, em qua phỏng vấn thử việc nhé.',
          time: 'Hôm qua'
        },
        {
          id: 'msg_06',
          senderId: 'role_student',
          senderName: 'Nguyễn Minh Anh',
          senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          senderRole: 'student',
          sender: 'me',
          text: 'Dạ vâng anh, chiều mai 15h em ghé quán gặp anh nhé ạ.',
          time: 'Hôm qua'
        }
      ]
    }
  ];
}

// 1. Lấy tất cả cuộc trò chuyện
exports.getConversations = (req, res) => {
  res.json({
    success: true,
    data: memoryStore.chatConversations
  });
};

// 2. Gửi tin nhắn mới (Đồng bộ tức thời giữa các trình duyệt khác nhau)
exports.sendMessage = (req, res) => {
  const { senderId, senderName, senderAvatar, senderRole, targetName, conversationId, message } = req.body;

  if (!message || !message.text) {
    return res.status(400).json({ success: false, message: 'Nội dung tin nhắn không được để trống' });
  }

  const partnerName = targetName || 'Người dùng';

  // Tìm cuộc hội thoại
  let conv = memoryStore.chatConversations.find(
    (c) =>
      c.id === conversationId ||
      (partnerName && c.name.toLowerCase().includes(partnerName.toLowerCase())) ||
      (senderName && c.name.toLowerCase().includes(senderName.toLowerCase()))
  );

  const newMsg = {
    id: message.id || `msg_${Date.now()}`,
    senderId: senderId || message.senderId || (senderRole === 'employer' ? 'role_employer' : 'role_student'),
    senderName: senderName || message.senderName || (senderRole === 'employer' ? 'Nhà tuyển dụng' : 'Sinh viên'),
    senderAvatar: senderAvatar || message.senderAvatar || (senderRole === 'employer' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
    senderRole: senderRole || message.senderRole || 'student',
    sender: message.sender || 'them',
    text: message.text,
    time: message.time || 'Vừa xong'
  };

  if (conv) {
    if (!conv.messages.some((m) => m.id === newMsg.id)) {
      conv.messages.push(newMsg);
    }
  } else {
    conv = {
      id: conversationId || `conv_${Date.now()}`,
      name: partnerName,
      jobTitle: senderRole === 'employer' ? 'Nhà tuyển dụng' : 'Ứng viên sinh viên',
      avatar: senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      online: true,
      unread: true,
      messages: [newMsg]
    };
    memoryStore.chatConversations.unshift(conv);
  }

  res.status(201).json({
    success: true,
    data: conv
  });
};

// 3. Xóa tin nhắn ảo
exports.clearMock = (req, res) => {
  memoryStore.chatConversations = [];
  res.json({ success: true, message: 'Đã xóa sạch hòm thư' });
};
