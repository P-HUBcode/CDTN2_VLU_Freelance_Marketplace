const { memoryStore } = require('../config/db');

// Khởi tạo danh sách dịch vụ freelance (mặc định rỗng để kiểm thử dữ liệu thật)
if (!memoryStore.freelanceServices) {
  memoryStore.freelanceServices = [];
}

// 1. Lấy tất cả dịch vụ freelance (chia sẻ giữa mọi trình duyệt: Edge, Cốc Cốc, Chrome)
exports.getServices = async (req, res) => {
  try {
    const { category, keyword } = req.query;
    let list = [...memoryStore.freelanceServices];

    if (category && category !== 'all') {
      list = list.filter((s) => s.category.toLowerCase() === category.toLowerCase());
    }

    if (keyword) {
      const q = keyword.toLowerCase();
      list = list.filter(
        (s) =>
          (s.title && s.title.toLowerCase().includes(q)) ||
          (s.studentName && s.studentName.toLowerCase().includes(q)) ||
          (Array.isArray(s.skills) && s.skills.some((sk) => sk.toLowerCase().includes(q)))
      );
    }

    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách freelance:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// 2. Tạo dịch vụ freelance mới (Lưu trực tiếp vào máy chủ trung tâm)
exports.createService = async (req, res) => {
  try {
    const serviceData = req.body;
    if (!serviceData || !serviceData.title) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin tiêu đề gói dịch vụ' });
    }

    const newService = {
      id: serviceData.id || `srv_${Date.now()}`,
      title: serviceData.title,
      studentId: serviceData.studentId || `std_${(serviceData.studentName || 'student').toLowerCase().replace(/\s+/g, '_')}`,
      studentEmail: serviceData.studentEmail || '',
      studentName: serviceData.studentName || 'Sinh viên Freelancer',
      studentUniversity: serviceData.studentUniversity || 'Đại học TP.HCM',
      studentAvatar: serviceData.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      category: serviceData.category || 'Design',
      rating: 5.0,
      reviewsCount: 1,
      startingPrice: Number(serviceData.startingPrice) || 200000,
      deliveryDays: Number(serviceData.deliveryDays) || 2,
      skills: Array.isArray(serviceData.skills)
        ? serviceData.skills
        : typeof serviceData.skills === 'string'
        ? serviceData.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : ['Freelance'],
      image: serviceData.image || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&auto=format&fit=crop&q=80',
      description: serviceData.description || 'Dịch vụ uy tín, cam kết hoàn thành đúng tiến độ.',
      includes: Array.isArray(serviceData.includes) ? serviceData.includes : ['Cam kết chất lượng']
    };

    // Đẩy lên đầu danh sách trung tâm trên server
    memoryStore.freelanceServices.unshift(newService);

    console.log(`[Freelance API] Đã tạo gói dịch vụ mới: "${newService.title}" bởi ${newService.studentName}`);

    res.status(201).json({
      success: true,
      message: 'Tạo gói dịch vụ thành công!',
      data: newService
    });
  } catch (error) {
    console.error('Lỗi tạo dịch vụ freelance:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// 3. Xóa dịch vụ freelance
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    memoryStore.freelanceServices = memoryStore.freelanceServices.filter((s) => s.id !== id);
    res.json({ success: true, message: 'Đã xóa dịch vụ' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};
