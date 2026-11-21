const { memoryStore } = require('../config/db');

// Khởi tạo danh sách dự án mặc định nếu chưa có trong memoryStore
if (!memoryStore.projects) {
  memoryStore.projects = [];
}

// Khởi tạo danh sách thông báo nếu chưa có
if (!memoryStore.notifications) {
  memoryStore.notifications = [];
}

// 1. LẤY DANH SÁCH DỰ ÁN (GET /api/projects)
// Lấy danh tính từ phiên xác thực (req.user) và chỉ trả dự án thuộc quyền sở hữu/phân công của user
exports.getProjects = async (req, res) => {
  try {
    const { status } = req.query;
    const currentId = (req.user?.id || req.query?.userId || '').toString().toLowerCase();
    const currentEmail = (req.user?.email || req.query?.email || '').toString().toLowerCase();
    const currentRole = req.user?.role || req.query?.role;

    // Nếu chưa xác thực danh tính người dùng: Trả về danh sách rỗng (không lộ dự án của người khác)
    if (!currentId && !currentEmail) {
      return res.json({
        success: true,
        count: 0,
        data: []
      });
    }

    let list = [...memoryStore.projects];

    // Admin có thể xem toàn bộ dự án để kiểm duyệt / quản trị
    if (currentRole !== 'admin') {
      list = list.filter((p) => {
        const studentIdMatch = p.studentId && p.studentId.toString().toLowerCase() === currentId;
        const studentEmailMatch = p.studentEmail && p.studentEmail.toLowerCase() === currentEmail;
        const assignedMatch = p.assignedTo && p.assignedTo.toString().toLowerCase() === currentId;
        const memberMatch = Array.isArray(p.members) && p.members.some(m => m && m.toString().toLowerCase() === currentId);

        const employerIdMatch = p.employerId && p.employerId.toString().toLowerCase() === currentId;
        const employerEmailMatch = p.employerEmail && p.employerEmail.toLowerCase() === currentEmail;
        const clientIdMatch = p.clientId && p.clientId.toString().toLowerCase() === currentId;

        const isStudentParty = studentIdMatch || studentEmailMatch || assignedMatch || memberMatch;
        const isEmployerParty = employerIdMatch || employerEmailMatch || clientIdMatch;

        // Trả về nếu người dùng là Sinh viên thực hiện HOẶC Nhà tuyển dụng thuê
        return isStudentParty || isEmployerParty;
      });
    }

    if (status && status !== 'all') {
      list = list.filter((p) => p.status === status);
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

// 3. CHI TIẾT DỰ ÁN THEO ID (GET /api/projects/:id)
// Kiểm tra quyền thành viên (Chỉ Admin, Sinh viên thực hiện, hoặc Nhà tuyển dụng sở hữu mới xem được)
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentId = (req.user?.id || req.query?.userId || '').toString().toLowerCase();
    const currentEmail = (req.user?.email || req.query?.email || '').toString().toLowerCase();
    const currentRole = req.user?.role || req.query?.role;

    const project = memoryStore.projects.find((p) => p.id === id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dự án' });
    }

    if (currentRole !== 'admin') {
      const isStudent = (project.studentId && project.studentId.toString().toLowerCase() === currentId) ||
                        (project.studentEmail && project.studentEmail.toLowerCase() === currentEmail) ||
                        (project.assignedTo && project.assignedTo.toString().toLowerCase() === currentId) ||
                        (Array.isArray(project.members) && project.members.some(m => m && m.toString().toLowerCase() === currentId));
      const isEmployer = (project.employerId && project.employerId.toString().toLowerCase() === currentId) ||
                         (project.employerEmail && project.employerEmail.toLowerCase() === currentEmail) ||
                         (project.clientId && project.clientId.toString().toLowerCase() === currentId);

      if (!isStudent && !isEmployer) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem thông tin chi tiết dự án này'
        });
      }
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Lỗi lấy chi tiết dự án:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// 4. CẬP NHẬT TIẾN ĐỘ DỰ ÁN & BÀN GIAO SẢN PHẨM (PUT /api/projects/:id)
// Kiểm tra quyền thành viên trước khi cho phép cập nhật
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const projectIndex = memoryStore.projects.findIndex((p) => p.id === id);
    if (projectIndex === -1) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dự án' });
    }

    const prevProject = memoryStore.projects[projectIndex];

    // Kiểm tra quyền thành viên: Admin, Sinh viên tham gia hoặc Nhà tuyển dụng sở hữu
    const currentId = (
      req.user?.id ||
      req.body?.userId ||
      req.body?.updaterId ||
      req.query?.userId ||
      req.body?.studentId ||
      req.body?.employerId ||
      ''
    ).toString().toLowerCase();

    const currentEmail = (
      req.user?.email ||
      req.body?.email ||
      req.body?.updaterEmail ||
      req.query?.email ||
      req.body?.studentEmail ||
      req.body?.employerEmail ||
      ''
    ).toString().toLowerCase();

    const currentRole = req.user?.role || req.body?.role || req.query?.role;

    if (currentRole !== 'admin' && (currentId || currentEmail)) {
      const isStudent = (prevProject.studentId && prevProject.studentId.toString().toLowerCase() === currentId) ||
                        (prevProject.studentEmail && prevProject.studentEmail.toLowerCase() === currentEmail) ||
                        (prevProject.assignedTo && prevProject.assignedTo.toString().toLowerCase() === currentId) ||
                        (Array.isArray(prevProject.members) && prevProject.members.some(m => m && m.toString().toLowerCase() === currentId));
      const isEmployer = (prevProject.employerId && prevProject.employerId.toString().toLowerCase() === currentId) ||
                         (prevProject.employerEmail && prevProject.employerEmail.toLowerCase() === currentEmail) ||
                         (prevProject.clientId && prevProject.clientId.toString().toLowerCase() === currentId);

      const hasMatchingCredential = isStudent || isEmployer ||
        (req.body?.studentId && prevProject.studentId && req.body.studentId === prevProject.studentId) ||
        (req.body?.employerId && prevProject.employerId && req.body.employerId === prevProject.employerId);

      if (!hasMatchingCredential) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền cập nhật tiến độ cho dự án này'
        });
      }
    }
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
