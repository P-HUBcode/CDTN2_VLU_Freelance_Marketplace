const { memoryStore } = require('../config/db');

// Khởi tạo danh sách dự án mặc định nếu chưa có trong memoryStore
if (!memoryStore.projects) {
  memoryStore.projects = [
    {
      id: 'proj_01',
      title: 'Thiết kế 20 bài Social Media cho Chuỗi F&B',
      client: 'ABC Coffee',
      clientAvatar: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=120&auto=format&fit=crop&q=80',
      employerName: 'ABC Coffee',
      employerEmail: 'tuyendung.demo@gmail.com',
      studentName: 'Nguyễn Minh Anh',
      studentEmail: 'student.a@test.vn',
      studentUniversity: 'UEH',
      budget: '2.500.000đ',
      deadline: '15/11/2026',
      remainingDays: 4,
      progress: 70,
      status: 'in_progress',
      nextTask: 'Thiết kế 10 bài còn lại theo theme Khai trương cơ sở mới',
      tasks: [
        { id: 1, name: 'Nhận brief & tone giọng thương hiệu từ Client', completed: true },
        { id: 2, name: 'Thiết kế Moodboard màu sắc & Font chữ', completed: true },
        { id: 3, name: 'Thiết kế đợt 1 (10 bài concept đầu tiên)', completed: true },
        { id: 4, name: 'Thiết kế đợt 2 (10 bài khuyến mãi & khai trương)', completed: false },
        { id: 5, name: 'Client phản hồi chỉnh sửa đợt cuối', completed: false },
        { id: 6, name: 'Nghiệm thu toàn bộ file và giải ngân qua StudentHub', completed: false }
      ],
      files: [
        { name: 'Brand_Guidelines_ABCCoffee.pdf', size: '4.2 MB', date: '02/11/2026' },
        { name: 'Batch1_Designs_10Posts.zip', size: '18.5 MB', date: '05/11/2026' }
      ],
      deliveryFile: '',
      deliveryNote: '',
      createdAt: '2026-11-01T10:00:00.000Z'
    },
    {
      id: 'proj_02',
      title: 'Kịch bản & Quay dựng 4 Video TikTok Lookbook',
      client: 'Local Brand Chic Studio',
      clientAvatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80',
      employerName: 'Local Brand Chic Studio',
      employerEmail: 'chic.fashion@gmail.com',
      studentName: 'Trần Hoàng Nam',
      studentEmail: 'nam.tran@student.vlu.edu.vn',
      studentUniversity: 'ĐH Văn Lang',
      budget: '1.800.000đ',
      deadline: '22/11/2026',
      remainingDays: 11,
      progress: 40,
      status: 'in_progress',
      nextTask: 'Dựng thô video số 3 và phối nhạc nền',
      tasks: [
        { id: 1, name: 'Lên 4 kịch bản video TikTok trendy', completed: true },
        { id: 2, name: 'Quay dựng hoàn chỉnh Video 1 & Video 2', completed: true },
        { id: 3, name: 'Quay dựng Video 3 & Video 4', completed: false },
        { id: 4, name: 'Chèn phụ đề động & Xuất file 4K', completed: false }
      ],
      files: [
        { name: 'KichBan_Lookbook_Chic_V1.docx', size: '1.1 MB', date: '04/11/2026' }
      ],
      deliveryFile: '',
      deliveryNote: '',
      createdAt: '2026-11-05T08:30:00.000Z'
    }
  ];
}

// Khởi tạo danh sách thông báo nếu chưa có
if (!memoryStore.notifications) {
  memoryStore.notifications = [
    {
      id: 'notif_init_01',
      userId: 'student.a@test.vn',
      userEmail: 'student.a@test.vn',
      recipientName: 'Nguyễn Minh Anh',
      type: 'new_application',
      title: 'Chào mừng bạn đến với StudentHub Freelance!',
      message: 'Bạn có thể đăng gói kỹ năng hoặc ứng tuyển các việc làm part-time hấp dẫn.',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];
}

// 1. LẤY DANH SÁCH DỰ ÁN (GET /api/projects)
// Cho phép lọc theo user hoặc trả về toàn bộ để đồng bộ thời gian thực giữa Cốc Cốc, Edge, Chrome
exports.getProjects = async (req, res) => {
  try {
    const { userId, email, role, status } = req.query;
    let list = [...memoryStore.projects];

    if (status && status !== 'all') {
      list = list.filter((p) => p.status === status);
    }

    // Nếu có chỉ định user/email cụ thể và không yêu cầu all=true
    if (req.query.filtered === 'true' && (userId || email)) {
      const qId = (userId || '').toLowerCase();
      const qEmail = (email || '').toLowerCase();
      list = list.filter((p) => {
        const matchStudent = (p.studentId && p.studentId.toLowerCase() === qId) ||
                             (p.studentEmail && p.studentEmail.toLowerCase() === qEmail);
        const matchEmployer = (p.employerId && p.employerId.toLowerCase() === qId) ||
                              (p.employerEmail && p.employerEmail.toLowerCase() === qEmail);
        return matchStudent || matchEmployer;
      });
    }

    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách dự án:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// 2. NHÀ TUYỂN DỤNG THUÊ DỊCH VỤ FREELANCE (POST /api/projects/hire)
// Tự động tạo Project trong "Dự án & Tiến độ bàn giao" VÀ gửi Notification cho Sinh viên được thuê
exports.hireService = async (req, res) => {
  try {
    const {
      serviceId,
      serviceTitle,
      studentId,
      studentName,
      studentEmail,
      studentUniversity,
      studentAvatar,
      employerId,
      employerName,
      employerEmail,
      employerAvatar,
      budget,
      deliveryDays,
      note
    } = req.body;

    if (!serviceTitle) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin gói dịch vụ' });
    }

    const projectId = `proj_${Date.now()}`;
    let cleanBudget = '250.000đ';
    if (budget) {
      if (typeof budget === 'number') {
        cleanBudget = `${new Intl.NumberFormat('vi-VN').format(budget)}đ`;
      } else if (typeof budget === 'string') {
        const digits = budget.replace(/[^0-9]/g, '');
        cleanBudget = digits ? `${new Intl.NumberFormat('vi-VN').format(Number(digits))}đ` : budget;
      }
    }

    const cleanDeliveryDays = Number(deliveryDays) || 2;

    const newProject = {
      id: projectId,
      serviceId: serviceId || `srv_${Date.now()}`,
      title: serviceTitle,
      // Cho Sinh viên: client chính là Nhà tuyển dụng thuê
      client: employerName || 'Nhà tuyển dụng',
      clientAvatar: employerAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      employerId: employerId || '',
      employerName: employerName || 'Nhà tuyển dụng',
      employerEmail: employerEmail || '',
      studentId: studentId || '',
      studentName: studentName || 'Sinh viên Freelancer',
      studentEmail: studentEmail || '',
      studentUniversity: studentUniversity || 'Đại học',
      studentAvatar: studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      budget: cleanBudget,
      deadline: `Trong ${cleanDeliveryDays} ngày tới`,
      remainingDays: cleanDeliveryDays,
      progress: 0,
      status: 'in_progress',
      nextTask: 'Trao đổi brief & bắt đầu triển khai dịch vụ',
      tasks: [
        { id: 1, name: 'Thỏa thuận chi tiết & brief dự án', completed: true },
        { id: 2, name: 'Triển khai gói dịch vụ theo yêu cầu', completed: false },
        { id: 3, name: 'Nộp sản phẩm bàn giao và nghiệm thu giải ngân', completed: false }
      ],
      files: [],
      deliveryFile: '',
      deliveryNote: note || '',
      createdAt: new Date().toISOString()
    };

    // 1. Lưu Project vào đầu danh sách dự án trung tâm
    memoryStore.projects.unshift(newProject);

    // 2. Tạo THÔNG BÁO gửi cho Sinh viên được thuê (Account được thuê)
    const studentNotification = {
      id: `notif_${Date.now()}_student`,
      userId: studentId || '',
      userEmail: studentEmail || '',
      recipientName: studentName || '',
      type: 'new_project',
      title: '🎉 Dịch vụ của bạn đã có khách hàng thuê!',
      message: `${employerName || 'Khách hàng'} vừa thuê gói "${serviceTitle}" (${cleanBudget}). Dự án mới đã được khởi tạo trong "Dự án & Tiến độ bàn giao"!`,
      relatedProjectId: projectId,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    memoryStore.notifications.unshift(studentNotification);

    // 3. Tạo THÔNG BÁO xác nhận cho Nhà tuyển dụng đã thuê
    const employerNotification = {
      id: `notif_${Date.now()}_employer`,
      userId: employerId || '',
      userEmail: employerEmail || '',
      recipientName: employerName || '',
      type: 'new_project',
      title: '✅ Bạn đã thuê dịch vụ freelance thành công!',
      message: `Bạn đã thuê gói "${serviceTitle}" của ${studentName || 'sinh viên'}. Bạn có thể theo dõi tiến độ công việc tại "Dự án & Tiến độ bàn giao".`,
      relatedProjectId: projectId,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    memoryStore.notifications.unshift(employerNotification);

    console.log(`[Project API] 🚀 Nhà tuyển dụng "${employerName}" đã thuê dịch vụ "${serviceTitle}" của "${studentName}" (${cleanBudget})`);

    res.status(201).json({
      success: true,
      message: 'Thuê dịch vụ freelance thành công!',
      data: newProject,
      notifications: [studentNotification, employerNotification]
    });
  } catch (error) {
    console.error('Lỗi khi thuê dịch vụ freelance:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// 3. CẬP NHẬT TIẾN ĐỘ DỰ ÁN & BÀN GIAO SẢN PHẨM (PUT /api/projects/:id)
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const projectIndex = memoryStore.projects.findIndex((p) => p.id === id);
    if (projectIndex === -1) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dự án' });
    }

    const prevProject = memoryStore.projects[projectIndex];
    const updatedProject = {
      ...prevProject,
      ...updates
    };

    memoryStore.projects[projectIndex] = updatedProject;

    // Nếu chuyển sang trạng thái pending_review (Sinh viên vừa nộp link sản phẩm)
    if (updates.status === 'pending_review' && prevProject.status !== 'pending_review') {
      const reviewNotif = {
        id: `notif_${Date.now()}_review`,
        userId: updatedProject.employerId,
        userEmail: updatedProject.employerEmail,
        recipientName: updatedProject.employerName,
        type: 'project_delivery',
        title: '📦 Sinh viên đã nộp sản phẩm bàn giao!',
        message: `${updatedProject.studentName} đã gửi link bàn giao cho dự án "${updatedProject.title}". Vui lòng kiểm tra và nghiệm thu giải ngân!`,
        relatedProjectId: updatedProject.id,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      memoryStore.notifications.unshift(reviewNotif);
    }

    // Nếu chuyển sang trạng thái completed (Client đã xác nhận nghiệm thu & giải ngân)
    if (updates.status === 'completed' && prevProject.status !== 'completed') {
      const payoutNotif = {
        id: `notif_${Date.now()}_payout`,
        userId: updatedProject.studentId,
        userEmail: updatedProject.studentEmail,
        recipientName: updatedProject.studentName,
        type: 'project_completed',
        title: '💰 Dự án đã được nghiệm thu & Giải ngân!',
        message: `Khách hàng đã duyệt sản phẩm của bạn trong dự án "${updatedProject.title}". Số tiền thù lao ${updatedProject.budget} đã được giải ngân vào Ví!`,
        relatedProjectId: updatedProject.id,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      memoryStore.notifications.unshift(payoutNotif);
    }

    res.json({
      success: true,
      message: 'Cập nhật tiến độ dự án thành công!',
      data: updatedProject
    });
  } catch (error) {
    console.error('Lỗi cập nhật dự án:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};
