const { memoryStore } = require('../config/db');

// Khởi tạo danh sách dịch vụ freelance mặc định nếu chưa có
if (!memoryStore.freelanceServices) {
  memoryStore.freelanceServices = [
    {
      id: 'srv_01',
      title: 'Thiết kế 5 bài Social Media bằng Canva',
      studentName: 'Nguyễn Minh Anh',
      studentUniversity: 'UEH',
      studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      category: 'Design',
      rating: 4.9,
      reviewsCount: 24,
      startingPrice: 200000,
      deliveryDays: 2,
      skills: ['Canva', 'Social Media', 'Design'],
      image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&auto=format&fit=crop&q=80',
      description: 'Mình nhận thiết kế bộ ấn phẩm gồm 5 bài đăng Facebook/Instagram theo chuẩn bộ nhận diện thương hiệu, đúng kích thước, hình ảnh bắt mắt và giao file gốc Canva có thể chỉnh sửa.',
      includes: [
        '5 thiết kế ấn phẩm hoàn chỉnh (Feed + Story)',
        '2 lần chỉnh sửa miễn phí theo yêu cầu',
        'File xuất định dạng JPG + PNG chất lượng cao',
        'Bàn giao link template Canva gốc'
      ]
    },
    {
      id: 'srv_02',
      title: 'Edit Video TikTok / Reels bắt trend & Chèn sub',
      studentName: 'Trần Hoàng Nam',
      studentUniversity: 'ĐH Văn Lang',
      studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
      category: 'Video Editing',
      rating: 4.9,
      reviewsCount: 31,
      startingPrice: 350000,
      deliveryDays: 1,
      skills: ['CapCut', 'TikTok', 'Video Editing'],
      image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
      description: 'Nhận dựng video ngắn dưới 60s từ footage của khách hàng: cắt ghép mượt, chèn nhạc viral, âm thanh SFX, hiệu ứng chuyển cảnh và auto caption sinh động.',
      includes: [
        'Gói 3 video ngắn 30s - 60s',
        'Chỉnh màu & khử tạp âm giọng nói',
        'Subtitle động phong cách Alex Hormozi',
        'Hỗ trợ chỉnh sửa đến khi ưng ý'
      ]
    },
    {
      id: 'srv_03',
      title: 'Viết bài chuẩn SEO 1000 từ & Copywriting Fanpage',
      studentName: 'Lê Thảo Nhi',
      studentUniversity: 'ĐH Kinh tế - Luật',
      studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      category: 'Content',
      rating: 4.8,
      reviewsCount: 19,
      startingPrice: 150000,
      deliveryDays: 2,
      skills: ['Content', 'SEO', 'Copywriting'],
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80',
      description: 'Bài viết chuẩn SEO, lối hành văn tự nhiên thu hút người đọc, nghiên cứu từ khóa kỹ càng và cam kết không sao chép (Unique 100%).',
      includes: [
        '1 bài viết 1000 từ chuẩn SEO',
        'Tối ưu thẻ H1, H2, H3, Meta Description',
        'Gợi ý 2 ảnh minh họa phù hợp nội dung'
      ]
    },
    {
      id: 'srv_04',
      title: 'Nhập liệu & Xử lý tự động bảng tính Excel',
      studentName: 'Phạm Minh Khôi',
      studentUniversity: 'ĐH Tôn Đức Thắng',
      studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      category: 'Data Entry',
      rating: 5.0,
      reviewsCount: 14,
      startingPrice: 180000,
      deliveryDays: 1,
      skills: ['Excel', 'Data Entry', 'Google Sheets'],
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
      description: 'Xử lý file dữ liệu cồng kềnh, phân tách cột, định dạng tự động, thiết kế Dashboard tổng quan bằng PivotTable.',
      includes: [
        'Xử lý làm sạch tối đa 2.000 dòng dữ liệu',
        'Tự động hóa công thức tính toán VLOOKUP/INDEX MATCH',
        'Dashboard biểu đồ trực quan'
      ]
    },
    {
      id: 'srv_05',
      title: 'Thiết kế Landing Page bán hàng bằng Figma / Webflow',
      studentName: 'Vũ Đức Thịnh',
      studentUniversity: 'ĐH Bách Khoa TP.HCM',
      studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      category: 'IT',
      rating: 5.0,
      reviewsCount: 8,
      startingPrice: 600000,
      deliveryDays: 3,
      skills: ['UI/UX', 'Figma', 'Webflow', 'Tailwind'],
      image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80',
      description: 'Thiết kế giao diện Landing Page chuyên nghiệp, chuẩn UI/UX, tối ưu tỷ lệ chuyển đổi (CRO) và responsive chuẩn mobile.',
      includes: [
        'File Figma UI Kit chuẩn Auto-Layout',
        'Thiết kế responsive 3 kích thước: Desktop, Tablet, Mobile',
        'Bàn giao source code HTML/CSS nếu yêu cầu'
      ]
    },
    {
      id: 'srv_06',
      title: 'Quản trị Fanpage & Lên kế hoạch nội dung tuần',
      studentName: 'Hoàng Yến Linh',
      studentUniversity: 'ĐH Ngoại Thương CS2',
      studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
      category: 'Marketing',
      rating: 4.9,
      reviewsCount: 27,
      startingPrice: 500000,
      deliveryDays: 7,
      skills: ['Social Media', 'Marketing', 'Fanpage'],
      image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&auto=format&fit=crop&q=80',
      description: 'Lập kế hoạch nội dung (Content Calendar) chi tiết theo tuần, hỗ trợ soạn thảo caption, lên ý tưởng hình ảnh và phản hồi tin nhắn cơ bản.',
      includes: [
        'Kế hoạch nội dung 7 ngày (7 bài đăng)',
        'Đề xuất khung giờ vàng tương tác cao',
        'Báo cáo hiệu quả tương tác cuối tuần'
      ]
    }
  ];
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
