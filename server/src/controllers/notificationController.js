const { memoryStore } = require('../config/db');

// Khởi tạo danh sách thông báo mặc định nếu chưa có
if (!memoryStore.notifications) {
  memoryStore.notifications = [];
}

// 1. LẤY DANH SÁCH THÔNG BÁO (GET /api/notifications)
exports.getNotifications = async (req, res) => {
  try {
    const { userId, email, name } = req.query;

    if (!userId && !email && !name) {
      return res.json({
        success: true,
        unreadCount: 0,
        count: 0,
        data: []
      });
    }

    let list = [...memoryStore.notifications];
    const qId = (userId || '').trim().toLowerCase();
    const qEmail = (email || '').trim().toLowerCase();
    const qName = (name || '').trim().toLowerCase();

    list = list.filter((n) => {
      const matchId = qId && n.userId && n.userId.toLowerCase() === qId;
      const matchEmail = qEmail && n.userEmail && n.userEmail.toLowerCase() === qEmail;
      const matchName = qName && n.recipientName && n.recipientName.toLowerCase().includes(qName);
      return matchId || matchEmail || matchName;
    });

    const unreadCount = list.filter((n) => !n.isRead).length;

    res.json({
      success: true,
      unreadCount,
      count: list.length,
      data: list
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách thông báo:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// 2. TẠO THÔNG BÁO MỚI (POST /api/notifications)
exports.createNotification = async (req, res) => {
  try {
    const { userId, userEmail, recipientName, type, title, message, relatedProjectId } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Thiếu tiêu đề hoặc nội dung thông báo' });
    }

    const newNotif = {
      id: `notif_${Date.now()}`,
      userId: userId || '',
      userEmail: userEmail || '',
      recipientName: recipientName || '',
      type: type || 'system_message',
      title,
      message,
      relatedProjectId: relatedProjectId || null,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    memoryStore.notifications.unshift(newNotif);

    res.status(201).json({
      success: true,
      message: 'Tạo thông báo thành công',
      data: newNotif
    });
  } catch (error) {
    console.error('Lỗi tạo thông báo:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// 3. ĐÁNH DẤU 1 THÔNG BÁO ĐÃ ĐỌC (PUT /api/notifications/:id/read)
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = memoryStore.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
    }
    res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// 4. ĐÁNH DẤU TẤT CẢ THÔNG BÁO ĐÃ ĐỌC (PUT /api/notifications/read-all)
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId, email } = req.body;
    const qId = (userId || '').toLowerCase();
    const qEmail = (email || '').toLowerCase();

    memoryStore.notifications.forEach((n) => {
      if (!userId && !email) {
        n.isRead = true;
      } else {
        const matchId = qId && n.userId && n.userId.toLowerCase() === qId;
        const matchEmail = qEmail && n.userEmail && n.userEmail.toLowerCase() === qEmail;
        if (matchId || matchEmail) {
          n.isRead = true;
        }
      }
    });

    res.json({ success: true, message: 'Đã đánh dấu tất cả thông báo là đã đọc' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};
