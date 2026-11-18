// ==============================================================================
// STUDENTHUB - PRODUCTION-GRADE MOCK DATA
// Tagline: "Find work. Build skills. Grow your career."
// User: Nguyễn Minh Anh - Sinh viên Marketing, Đại học Kinh tế TP.HCM (UEH)
// ==============================================================================

export const currentUser = {
  id: 'usr_01',
  name: 'Nguyễn Minh Anh',
  role: 'student', // 'student' | 'employer'
  university: 'Đại học Kinh tế TP.HCM (UEH)',
  faculty: 'Khoa Kinh doanh Quốc tế - Marketing',
  major: 'Marketing Số & Truyền thông Đa phương tiện',
  year: 'Năm 3 (Khóa K48)',
  location: 'Quận 3, TP. Hồ Chí Minh',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  bio: 'Sinh viên Marketing năm 3 tại UEH đam mê sáng tạo nội dung số, thiết kế Canva, kịch bản video TikTok và chạy chiến dịch social media. Tinh thần trách nhiệm cao, luôn hoàn thành deadline trước hạn.',
  status: 'Đang tìm việc',
  profileCompletion: 80,
  rating: 4.8,
  reviewsCount: 18,
  projectsCompleted: 12,
  responseRate: '96%',
  earningsMonth: '4.800.000đ',
  totalEarnings: '18.500.000đ',
  availableBalance: 12500000,
  skills: [
    'Canva',
    'Content Marketing',
    'TikTok',
    'Social Media',
    'Excel',
    'Copywriting',
    'CapCut',
    'SEO Cơ bản'
  ],
  education: [
    { school: 'Đại học Kinh tế TP.HCM (UEH)', degree: 'Cử nhân Marketing Số', period: '2023 - 2027', gpa: '3.65/4.0' }
  ],
  experiences: [
    { title: 'Social Media Creator Part-time', company: 'ABC Media Studio', period: '05/2026 - 10/2026', desc: 'Thiết kế 40+ ấn phẩm Canva và kịch bản TikTok đạt 150k lượt xem.' },
    { title: 'Marketing Intern', company: 'Green Coffee Roastery', period: '01/2026 - 04/2026', desc: 'Lên kế hoạch content và quản trị Fanpage tăng 25% tương tác hữu cơ.' }
  ],
  certifications: [
    { name: 'HubSpot Inbound Marketing Certified', issuer: 'HubSpot Academy', year: '2025' },
    { name: 'Google Digital Marketing & E-commerce', issuer: 'Google Coursera', year: '2025' }
  ],
  portfolios: [
    {
      id: 'port_1',
      title: 'Bộ nhận diện Social Media - The Coffee Corner',
      category: 'Design & Canva',
      image: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&auto=format&fit=crop&q=80',
      client: 'The Coffee Corner',
      link: 'https://behance.net/gallery/social-coffee'
    },
    {
      id: 'port_2',
      title: 'Chiến dịch TikTok Lookbook Thời trang GenZ',
      category: 'Video & TikTok',
      image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
      client: 'Chic Local Brand',
      link: 'https://tiktok.com/@chic_local'
    },
    {
      id: 'port_3',
      title: 'Ebook Hướng dẫn Content Creator 2026',
      category: 'Copywriting',
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80',
      client: 'Nova Digital Agency',
      link: 'https://drive.google.com/content-guide'
    }
  ]
};

// ==============================================================================
// 10 VIỆC LÀM PART-TIME, FREELANCE, INTERNSHIP CHO SINH VIÊN
// ==============================================================================
export const initialJobs = [
  {
    id: 'job_01',
    title: 'Social Media Content Creator',
    company: 'ABC Media',
    companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80',
    type: 'Part-time',
    workMode: 'Remote',
    salary: '3.000.000 – 5.000.000đ/tháng',
    salaryMin: 3000000,
    salaryMax: 5000000,
    salaryRangeTag: '2_to_5m',
    timeShift: 'Buổi tối',
    workingHours: '18:00 – 21:00 (Linh hoạt theo lịch học)',
    location: 'TP. Hồ Chí Minh',
    locationGroup: 'TP.HCM',
    district: 'Quận 1',
    applicantsCount: 32,
    skills: ['Content', 'TikTok', 'Canva'],
    postedTime: 'Đăng 2 giờ trước',
    deadline: '20/11/2026',
    verified: true,
    employerRating: 4.8,
    employerJobsCount: 12,
    isBookmarked: true,
    description: 'ABC Media là creative agency trẻ trung, chuyên sản xuất nội dung viral trên TikTok và Facebook cho các thương hiệu F&B. Chúng mình cần tìm 2 bạn sinh viên năng động, thích lướt TikTok và có khả năng viết lách tốt.',
    responsibilities: [
      'Lên ý tưởng kịch bản video ngắn (15s – 45s) theo trending TikTok/Reels.',
      'Thiết kế ấn phẩm hình ảnh cơ bản bằng Canva hoặc Photoshop theo template có sẵn.',
      'Phối hợp với team quay dựng để hoàn thiện sản phẩm đăng tải hàng tuần.'
    ],
    requirements: [
      'Là sinh viên các trường đại học tại TP.HCM (ưu tiên khối ngành Marketing, Truyền thông, Kinh tế).',
      'Có laptop cá nhân và sử dụng thành thạo Canva, CapCut.',
      'Chủ động, đúng giờ, tôn trọng deadline công việc.'
    ],
    benefits: [
      'Thù lao cạnh tranh, nhận qua StudentHub đảm bảo ký quỹ an toàn 100%.',
      'Hỗ trợ con dấu mộc thực tập và thư giới thiệu công việc của công ty.',
      'Được đào tạo bài bản tư duy Content Creator từ Senior Marketer.'
    ],
    // Matching score section for Nguyen Minh Anh (Marketing - UEH)
    matchingScore: {
      percentage: 87,
      reasons: [
        { text: 'Bạn có kỹ năng Canva', status: 'match' },
        { text: 'Bạn có kỹ năng Content', status: 'match' },
        { text: 'Thời gian làm việc phù hợp', status: 'match' },
        { text: 'Chưa có kinh nghiệm 1 năm', status: 'warn' }
      ]
    }
  },
  {
    id: 'job_02',
    title: 'Video Editor TikTok & CapCut Part-time',
    company: 'XYZ Studio',
    companyLogo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&auto=format&fit=crop&q=80',
    type: 'Freelance',
    workMode: 'Remote',
    salary: '4.000.000 – 6.500.000đ/tháng',
    salaryMin: 4000000,
    salaryMax: 6500000,
    salaryRangeTag: '2_to_5m',
    timeShift: 'Linh hoạt',
    workingHours: '15 – 20 giờ/tuần (Nhận footage về nhà edit)',
    location: 'TP. Hồ Chí Minh',
    locationGroup: 'TP.HCM',
    district: 'Bình Thạnh',
    applicantsCount: 19,
    skills: ['Video Editing', 'TikTok', 'CapCut'],
    postedTime: 'Đăng 4 giờ trước',
    deadline: '25/11/2026',
    verified: true,
    employerRating: 4.9,
    employerJobsCount: 8,
    isBookmarked: false,
    description: 'Studio sản xuất podcast và vlog thời trang cần tuyển bạn sinh viên dựng clip ngắn TikTok và Reels. Yêu cầu bắt nhịp nhạc tốt, chèn text caption động mượt mà.',
    responsibilities: [
      'Cắt ghép video thô, chỉnh màu cơ bản, chèn nhạc bắt trend và sound effect.',
      'Tạo subtitle chữ chạy động (Auto Caption CapCut) thẩm mỹ cao.',
      'Bàn giao 4 - 5 video hoàn chỉnh mỗi tuần.'
    ],
    requirements: [
      'Thành thạo CapCut (PC hoặc Mobile) hoặc Premiere Pro cơ bản.',
      'Có mắt thẩm mỹ tốt về font chữ và nhịp điệu cắt cảnh.',
      'Gửi kèm link một số video ngắn bạn đã từng làm khi ứng tuyển.'
    ],
    benefits: [
      'Thu nhập ổn định tính theo số lượng video hoặc gói tháng.',
      'Cung cấp tài khoản CapCut Pro & kho nhạc bản quyền miễn phí.'
    ],
    matchingScore: {
      percentage: 82,
      reasons: [
        { text: 'Bạn có kỹ năng TikTok & CapCut', status: 'match' },
        { text: 'Thời gian làm việc hoàn toàn Remote', status: 'match' },
        { text: 'Chưa có kinh nghiệm dựng Podcast dài', status: 'warn' }
      ]
    }
  },
  {
    id: 'job_03',
    title: 'Thiết kế Menu & Banner Canva Part-time',
    company: 'Green Coffee',
    companyLogo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=120&auto=format&fit=crop&q=80',
    type: 'Part-time',
    workMode: 'Remote',
    salary: '2.500.000 – 4.000.000đ/tháng',
    salaryMin: 2500000,
    salaryMax: 4000000,
    salaryRangeTag: '2_to_5m',
    timeShift: 'Buổi chiều',
    workingHours: '13:00 – 17:00 (Làm online tại nhà)',
    location: 'TP. Hồ Chí Minh',
    locationGroup: 'TP.HCM',
    district: 'Quận 3',
    applicantsCount: 24,
    skills: ['Canva', 'Design', 'Marketing'],
    postedTime: 'Đăng 6 giờ trước',
    deadline: '22/11/2026',
    verified: true,
    employerRating: 4.7,
    employerJobsCount: 6,
    isBookmarked: true,
    description: 'Chuỗi cà phê specialty Green Coffee tại TP.HCM cần tuyển bạn sinh viên thiết kế các ấn phẩm online như menu thời vụ, poster standee khuyến mãi và ảnh đăng Fanpage.',
    responsibilities: [
      'Thiết kế ấn phẩm hình ảnh đồ uống mới cho các dịp lễ Tết.',
      'Resize banner phù hợp các kích thước story Instagram, Facebook feed.'
    ],
    requirements: [
      'Thành thạo Canva Pro hoặc Photoshop.',
      'Gu thẩm mỹ tối giản, ấm cúng phong cách cà phê hiện đại.'
    ],
    benefits: [
      'Thù lao đều đặn hàng tháng, voucher đồ uống miễn phí tại chuỗi cửa hàng.',
      'Thời gian làm việc cực kỳ linh hoạt cho sinh viên.'
    ],
    matchingScore: {
      percentage: 94,
      reasons: [
        { text: 'Bạn thành thạo Canva & Thiết kế', status: 'match' },
        { text: 'Đã từng làm dự án về F&B', status: 'match' },
        { text: 'Thời gian làm việc phù hợp', status: 'match' }
      ]
    }
  },
  {
    id: 'job_04',
    title: 'Data Entry Assistant & Xử lý Excel',
    company: 'Nova Digital',
    companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&auto=format&fit=crop&q=80',
    type: 'Part-time',
    workMode: 'Remote',
    salary: '2.000.000 – 3.200.000đ/tháng',
    salaryMin: 2000000,
    salaryMax: 3200000,
    salaryRangeTag: 'under_2m',
    timeShift: 'Buổi tối',
    workingHours: '19:00 – 22:00',
    location: 'Hà Nội',
    locationGroup: 'Hà Nội',
    district: 'Cầu Giấy',
    applicantsCount: 41,
    skills: ['Excel', 'Data Entry'],
    postedTime: 'Đăng 1 ngày trước',
    deadline: '28/11/2026',
    verified: true,
    employerRating: 4.8,
    employerJobsCount: 15,
    isBookmarked: false,
    description: 'Hỗ trợ nhập liệu dữ liệu khảo sát khách hàng, phân loại tệp sản phẩm và kiểm tra tính chính xác của file Google Sheets.',
    responsibilities: [
      'Nhập liệu số liệu kinh doanh hàng tuần vào hệ thống.',
      'Sử dụng các hàm cơ bản (VLOOKUP, IF, PivotTable) để làm sạch bảng tính.'
    ],
    requirements: [
      'Cẩn thận, tỉ mỉ, gõ phím nhanh và chính xác.',
      'Sử dụng thành thạo Microsoft Excel hoặc Google Sheets.'
    ],
    benefits: [
      'Công việc làm online 100%, chủ động sắp xếp khung giờ trong ngày.'
    ],
    matchingScore: {
      percentage: 80,
      reasons: [
        { text: 'Bạn có kỹ năng Excel', status: 'match' },
        { text: 'Địa điểm làm việc Online', status: 'match' }
      ]
    }
  },
  {
    id: 'job_05',
    title: 'Marketing & PR Intern (Hỗ trợ Thực tập)',
    company: 'Creative Hub',
    companyLogo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80',
    type: 'Internship',
    workMode: 'Hybrid',
    salary: '3.500.000 – 5.000.000đ/tháng',
    salaryMin: 3500000,
    salaryMax: 5000000,
    salaryRangeTag: '2_to_5m',
    timeShift: 'Buổi sáng',
    workingHours: '08:30 – 12:30 (3 buổi/tuần tại VP)',
    location: 'TP. Hồ Chí Minh',
    locationGroup: 'TP.HCM',
    district: 'Quận 1',
    applicantsCount: 28,
    skills: ['Marketing', 'Content', 'Social Media'],
    postedTime: 'Đăng 1 ngày trước',
    deadline: '30/11/2026',
    verified: true,
    employerRating: 5.0,
    employerJobsCount: 5,
    isBookmarked: false,
    description: 'Cơ hội thực tập dành riêng cho sinh viên năm 3, năm 4 ngành Marketing tại các trường đại học TP.HCM. Trực tiếp tham gia triển khai chiến dịch ra mắt sản phẩm mới.',
    responsibilities: [
      'Soạn thảo thông cáo báo chí và bài viết PR ngắn.',
      'Theo dõi tiến độ bài viết của các KOLs/KOCs.',
      'Tham gia brainstorming ý tưởng sáng tạo cùng ban Giám đốc.'
    ],
    requirements: [
      'Sinh viên chuyên ngành Marketing, QTKD hoặc Truyền thông.',
      'Khả năng viết lách tiếng Việt lưu loát, chỉn chu.',
      'Ham học hỏi và có thái độ cầu tiến.'
    ],
    benefits: [
      'Hỗ trợ đóng dấu báo cáo thực tập, mentor 1-1 tận tình.',
      'Cơ hội trở thành nhân viên chính thức sau khi tốt nghiệp.'
    ],
    matchingScore: {
      percentage: 92,
      reasons: [
        { text: 'Chuyên ngành Marketing UEH hoàn toàn trùng khớp', status: 'match' },
        { text: 'Bạn có kỹ năng Content & Social Media', status: 'match' },
        { text: 'Yêu cầu lên văn phòng 3 buổi/tuần', status: 'warn' }
      ]
    }
  },
  {
    id: 'job_06',
    title: 'Nhân viên Hỗ trợ Sự kiện Cuối tuần (Event Staff)',
    company: 'Local Brand Fashion',
    companyLogo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=120&auto=format&fit=crop&q=80',
    type: 'Part-time',
    workMode: 'Onsite',
    salary: '350.000 – 500.000đ/ngày',
    salaryMin: 1500000,
    salaryMax: 2500000,
    salaryRangeTag: 'under_2m',
    timeShift: 'Cuối tuần',
    workingHours: 'Thứ 7 & Chủ Nhật (Theo ca sự kiện)',
    location: 'TP. Hồ Chí Minh',
    locationGroup: 'TP.HCM',
    district: 'Quận 7',
    applicantsCount: 15,
    skills: ['Giao tiếp', 'Event'],
    postedTime: 'Đăng 2 ngày trước',
    deadline: '18/11/2026',
    verified: true,
    employerRating: 4.6,
    employerJobsCount: 4,
    isBookmarked: false,
    description: 'Tuyển 6 bạn sinh viên hỗ trợ check-in khách mời, hướng dẫn gian hàng và phát quà tặng tại hội chợ thời trang cuối tuần.',
    responsibilities: [
      'Đón tiếp khách hàng, phát voucher và hỗ trợ tư vấn size áo.',
      'Giữ gìn vệ sinh và sắp xếp quầy kệ gọn gàng.'
    ],
    requirements: [
      'Ngoại hình sáng, nhanh nhẹn, giao tiếp vui vẻ.',
      'Đúng giờ và có trách nhiệm.'
    ],
    benefits: [
      'Nhận thù lao liền ngay sau khi kết thúc ca làm.',
      'Cung cấp bữa ăn và đồng phục thương hiệu.'
    ],
    matchingScore: {
      percentage: 75,
      reasons: [
        { text: 'Thời gian làm cuối tuần không trùng lịch học', status: 'match' },
        { text: 'Địa điểm làm việc Onsite tại Quận 7', status: 'warn' }
      ]
    }
  },
  {
    id: 'job_07',
    title: 'Gia sư Tiếng Anh Giao tiếp & Ngữ pháp Online',
    company: 'EduEnglish Center',
    companyLogo: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=120&auto=format&fit=crop&q=80',
    type: 'Freelance',
    workMode: 'Remote',
    salary: '180.000 – 250.000đ/giờ',
    salaryMin: 4000000,
    salaryMax: 8000000,
    salaryRangeTag: '5_to_10m',
    timeShift: 'Buổi tối',
    workingHours: '19:30 – 21:00 (Thứ 3, 5, 7)',
    location: 'Remote',
    locationGroup: 'Remote',
    district: 'Toàn quốc',
    applicantsCount: 22,
    skills: ['Tiếng Anh', 'Tutoring'],
    postedTime: 'Đăng 2 ngày trước',
    deadline: '24/11/2026',
    verified: true,
    employerRating: 4.9,
    employerJobsCount: 9,
    isBookmarked: false,
    description: 'Kèm cặp tiếng Anh giao tiếp 1-1 cho học sinh cấp 2 và cấp 3 qua Zoom/Google Meet. Giáo trình được trung tâm cung cấp sẵn.',
    responsibilities: [
      'Giảng dạy các chủ đề giao tiếp cơ bản theo lộ trình.',
      'Chỉnh sửa phát âm và kiểm tra bài tập về nhà cho học viên.'
    ],
    requirements: [
      'IELTS từ 6.5 trở lên hoặc TOEIC 800+.',
      'Giọng nói dễ nghe, kiên nhẫn, truyền cảm hứng.'
    ],
    benefits: [
      'Thu nhập tính theo giờ minh bạch, học sinh ổn định lâu dài.'
    ],
    matchingScore: {
      percentage: 78,
      reasons: [
        { text: 'Thời gian linh hoạt theo buổi tối', status: 'match' },
        { text: 'Yêu cầu chứng chỉ IELTS 6.5+', status: 'warn' }
      ]
    }
  },
  {
    id: 'job_08',
    title: 'Website & App Tester Sinh viên',
    company: 'TechStart Vietnam',
    companyLogo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=120&auto=format&fit=crop&q=80',
    type: 'Project',
    workMode: 'Remote',
    salary: '1.500.000 – 3.000.000đ/dự án',
    salaryMin: 1500000,
    salaryMax: 3000000,
    salaryRangeTag: 'under_2m',
    timeShift: 'Linh hoạt',
    workingHours: 'Tùy chọn thời gian theo milestone',
    location: 'TP. Hồ Chí Minh',
    locationGroup: 'TP.HCM',
    district: 'Thủ Đức',
    applicantsCount: 18,
    skills: ['Programming', 'Testing'],
    postedTime: 'Đăng 3 ngày trước',
    deadline: '26/11/2026',
    verified: true,
    employerRating: 4.8,
    employerJobsCount: 11,
    isBookmarked: false,
    description: 'Thử nghiệm tính năng và tìm lỗi (bug) trên ứng dụng di động mới trước khi phát hành lên Google Play & App Store.',
    responsibilities: [
      'Thực hiện các kịch bản test case và ghi nhận lỗi vào file báo cáo.',
      'Chụp ảnh hoặc quay màn hình các bước gây ra lỗi.'
    ],
    requirements: [
      'Sử dụng điện thoại Android hoặc iPhone.',
      'Cẩn thận, chú ý chi tiết nhỏ.'
    ],
    benefits: [
      'Cơ hội tiếp xúc sớm với sản phẩm công nghệ fintech thú vị.'
    ],
    matchingScore: {
      percentage: 70,
      reasons: [
        { text: 'Công việc làm online tự do', status: 'match' },
        { text: 'Yêu cầu kiến thức kiểm thử phần mềm', status: 'warn' }
      ]
    }
  },
  {
    id: 'job_09',
    title: 'SEO Content Writer Chuyên ngành Kinh tế',
    company: 'Nova Digital',
    companyLogo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=120&auto=format&fit=crop&q=80',
    type: 'Freelance',
    workMode: 'Remote',
    salary: '80.000 – 120.000đ/bài (1000 từ)',
    salaryMin: 3000000,
    salaryMax: 6000000,
    salaryRangeTag: '2_to_5m',
    timeShift: 'Linh hoạt',
    workingHours: 'Nhận bài viết tại nhà theo tuần',
    location: 'Remote',
    locationGroup: 'Remote',
    district: 'Toàn quốc',
    applicantsCount: 30,
    skills: ['Content', 'Marketing', 'Copywriting'],
    postedTime: 'Đăng 3 ngày trước',
    deadline: '29/11/2026',
    verified: true,
    employerRating: 4.8,
    employerJobsCount: 15,
    isBookmarked: false,
    description: 'Viết các bài blog chuẩn SEO về chủ đề tài chính cá nhân cho người trẻ, xu hướng tiêu dùng và mẹo tiết kiệm.',
    responsibilities: [
      'Viết bài 1000 - 1500 từ theo outline từ khóa được cung cấp.',
      'Chèn ảnh minh họa đẹp mắt và tối ưu thẻ Heading.'
    ],
    requirements: [
      'Văn phong mạch lạc, đúng chính tả, không sao chép (Check plagiarism 100%).',
      'Ưu tiên sinh viên các trường Kinh tế (UEH, UEL, Ngoại thương).'
    ],
    benefits: [
      'Nhuận bút tính rõ ràng theo số lượng bài viết, thanh toán qua ví StudentHub.'
    ],
    matchingScore: {
      percentage: 95,
      reasons: [
        { text: 'Sinh viên Marketing UEH chuẩn background', status: 'match' },
        { text: 'Kỹ năng Content & Copywriting xuất sắc', status: 'match' }
      ]
    }
  },
  {
    id: 'job_10',
    title: 'Trợ lý Livestream & Bán hàng Part-time',
    company: 'Local Brand Fashion',
    companyLogo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=120&auto=format&fit=crop&q=80',
    type: 'Part-time',
    workMode: 'Onsite',
    salary: '40.000 – 55.000đ/giờ',
    salaryMin: 2500000,
    salaryMax: 4500000,
    salaryRangeTag: '2_to_5m',
    timeShift: 'Buổi tối',
    workingHours: '19:00 – 22:30 (3 buổi/tuần)',
    location: 'TP. Hồ Chí Minh',
    locationGroup: 'TP.HCM',
    district: 'Bình Thạnh',
    applicantsCount: 16,
    skills: ['TikTok', 'Giao tiếp'],
    postedTime: 'Đăng 4 ngày trước',
    deadline: '23/11/2026',
    verified: true,
    employerRating: 4.6,
    employerJobsCount: 4,
    isBookmarked: false,
    description: 'Hỗ trợ setup ánh sáng, ghim giỏ hàng TikTok Shop và đọc comment tương tác trong phiên livestream của shop.',
    responsibilities: [
      'Chuẩn bị mẫu áo quần trước giờ lên sóng.',
      'Bấm ghim sản phẩm và giải đáp giá cho khách hàng xem live.'
    ],
    requirements: [
      'Nhanh nhẹn, cẩn thận, biết sử dụng app TikTok Seller.',
      'Nhiệt tình và có khả năng ứng biến tốt.'
    ],
    benefits: [
      'Thưởng doanh số hoa hồng thêm sau mỗi phiên live thành công.'
    ],
    matchingScore: {
      percentage: 84,
      reasons: [
        { text: 'Hiểu rõ nền tảng TikTok & hành vi người mua', status: 'match' },
        { text: 'Địa điểm làm việc gần khu vực trung tâm', status: 'match' }
      ]
    }
  }
];

// ==============================================================================
// DỊCH VỤ FREELANCE CỦA SINH VIÊN (SELL YOUR SKILLS MARKETPLACE)
// ==============================================================================
export const initialServices = [
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
      'Nhập và làm sạch dữ liệu lên đến 1000 dòng',
      'Cài đặt công thức tính toán tự động',
      'Giao file Excel và hướng dẫn sử dụng'
    ]
  },
  {
    id: 'srv_05',
    title: 'Gia sư Tiếng Anh Giao tiếp 1-1 cho Người mới bắt đầu',
    studentName: 'Đặng Hoàng My',
    studentUniversity: 'ĐH Ngoại Thương CS2',
    studentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    category: 'Tutoring',
    rating: 4.9,
    reviewsCount: 22,
    startingPrice: 250000,
    deliveryDays: 1,
    skills: ['Tiếng Anh', 'Tutoring'],
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80',
    description: 'Kèm tiếng Anh 1 buổi 90 phút qua Google Meet: luyện phản xạ nói tự nhiên, chỉnh sửa từng lỗi phát âm và cung cấp tài liệu từ vựng theo chủ đề đời sống.',
    includes: [
      '1 buổi học 90 phút 1-1',
      'Kiểm tra trình độ đầu vào miễn phí',
      'File tổng hợp từ vựng và bài tập sau buổi học'
    ]
  },
  {
    id: 'srv_06',
    title: 'Thiết kế Landing Page Responsive bằng React & Tailwind',
    studentName: 'Vũ Tuấn Kiệt',
    studentUniversity: 'ĐH Công nghiệp TP.HCM (IUH)',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    category: 'IT',
    rating: 5.0,
    reviewsCount: 17,
    startingPrice: 800000,
    deliveryDays: 3,
    skills: ['React', 'Tailwind', 'Web Development'],
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
    description: 'Lập trình Landing page chuyên nghiệp chuẩn giao diện SaaS, tương thích 100% trên điện thoại và máy tính, tốc độ tải cực nhanh.',
    includes: [
      'Giao diện 1 trang Landing Page hoàn chỉnh',
      'Responsive Mobile & Tablet',
      'Bàn giao Source Code GitHub sạch sẽ'
    ]
  }
];

// ==============================================================================
// DỰ ÁN & TIẾN ĐỘ THỰC HIỆN (MANAGE YOUR PROJECT)
// ==============================================================================
export const initialProjects = [
  {
    id: 'proj_01',
    title: 'Thiết kế 20 bài Social Media cho Chuỗi F&B',
    client: 'ABC Coffee',
    clientAvatar: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=120&auto=format&fit=crop&q=80',
    budget: '2.500.000đ',
    deadline: '15/11/2026',
    remainingDays: 4,
    progress: 70,
    status: 'in_progress', // 'in_progress' | 'pending_review' | 'completed' | 'cancelled'
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
    ]
  },
  {
    id: 'proj_02',
    title: 'Kịch bản & Quay dựng 4 Video TikTok Lookbook',
    client: 'Local Brand Chic Studio',
    clientAvatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80',
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
    ]
  },
  {
    id: 'proj_03',
    title: 'Thiết kế Bộ Banner Quảng Cáo Khuyến Mãi 11.11',
    client: 'The Book Cafe',
    clientAvatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80',
    budget: '800.000đ',
    deadline: '10/11/2026',
    remainingDays: 0,
    progress: 100,
    status: 'completed',
    nextTask: 'Đã hoàn thành nghiệm thu & nhận tiền',
    tasks: [
      { id: 1, name: 'Nhận thông tin chương trình giảm giá', completed: true },
      { id: 2, name: 'Thiết kế 6 banner đa kích thước', completed: true },
      { id: 3, name: 'Bàn giao file và nhận đánh giá 5 sao', completed: true }
    ],
    files: [
      { name: 'Final_Banners_1111.zip', size: '12.4 MB', date: '01/11/2026' }
    ]
  }
];

// ==============================================================================
// LỊCH SỬ GIAO DỊCH & DÒNG TIỀN VÍ
// ==============================================================================
export const initialTransactions = [
  {
    id: 'tx_01',
    jobTitle: 'Thiết kế banner 11.11',
    client: 'The Book Cafe',
    date: '02/11/2026',
    amount: '+500.000đ',
    status: 'completed'
  },
  {
    id: 'tx_02',
    jobTitle: 'Content TikTok Lookbook Đợt 1',
    client: 'Chic Studio',
    date: '01/11/2026',
    amount: '+800.000đ',
    status: 'pending'
  },
  {
    id: 'tx_03',
    jobTitle: 'Viết 5 bài blog du lịch SEO',
    client: 'GoVietnam Travel',
    date: '28/10/2026',
    amount: '+750.000đ',
    status: 'completed'
  },
  {
    id: 'tx_04',
    jobTitle: 'Rút tiền về Vietcombank (***756)',
    client: 'Hệ thống StudentHub',
    date: '25/10/2026',
    amount: '-2.000.000đ',
    status: 'completed'
  }
];

export const monthlyEarningsChart = [
  { month: 'T6', amount: 1800000 },
  { month: 'T7', amount: 2400000 },
  { month: 'T8', amount: 3200000 },
  { month: 'T9', amount: 3900000 },
  { month: 'T10', amount: 4800000 },
  { month: 'T11', amount: 4800000 }
];

// ==============================================================================
// TIN NHẮN CHAT VỚI NHÀ TUYỂN DỤNG & CLIENT
// ==============================================================================
export const initialConversations = [
  {
    id: 'conv_ai_gemini',
    name: 'Trợ lý AI StudentHub (Google Gemini)',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    jobTitle: 'Trợ lý AI tự động • Hỏi đáp 24/7 ✨',
    online: true,
    unread: false,
    isAI: true,
    messages: [
      {
        id: 1,
        sender: 'them',
        text: 'Xin chào bạn! Mình là Trợ lý AI tự động của sàn StudentHub, được tiếp sức bởi công nghệ Google Gemini. Mình có thể hỗ trợ bạn tìm việc, viết CV, hướng dẫn ký quỹ Escrow và bắt đầu nhận job freelance. Bạn cần hỗ trợ điều gì hôm nay? ✨',
        time: 'Vừa xong'
      }
    ]
  },
  {
    id: 'conv_01',
    name: 'Chị Mai - HR ABC Media',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    jobTitle: 'Social Media Content Creator',
    online: true,
    unread: false,
    messages: [
      { id: 1, sender: 'them', text: 'Chào Minh Anh, chị đã xem portfolio Canva của em trên StudentHub, bên chị thấy gu thiết kế rất hợp với phong cách GenZ bên chị.', time: '09:15' },
      { id: 2, sender: 'me', text: 'Em chào chị Mai ạ! Em cảm ơn chị và team ABC Media đã quan tâm đến hồ sơ của em ạ.', time: '09:18' },
      { id: 3, sender: 'them', text: 'Thứ Năm này khoảng 14h em có rảnh họp online 15 phút để trao đổi thêm về lịch làm việc part-time không em?', time: '09:20' },
      { id: 4, sender: 'me', text: 'Dạ được ạ, thứ Năm em không có tiết học ở UEH nên có thể tham gia đúng 14h ạ. Em cảm ơn chị nhiều!', time: '09:22' }
    ]
  },
  {
    id: 'conv_02',
    name: 'Anh Tuấn - Quản lý ABC Coffee',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    jobTitle: 'Thiết kế 20 bài Social Media',
    online: false,
    unread: true,
    messages: [
      { id: 1, sender: 'them', text: 'Minh Anh ơi, đợt 1 em gửi 10 bài concept rất đẹp nhé. Quán đã đăng thử 2 bài và tương tác tăng gấp đôi luôn.', time: 'Hôm qua' },
      { id: 2, sender: 'me', text: 'Dạ em cảm ơn anh Tuấn ạ! Em đang triển khai tiếp 10 bài tiếp theo theo chủ đề khai trương chi nhánh mới ạ.', time: 'Hôm qua' },
      { id: 3, sender: 'them', text: 'Ok em cứ làm nhé, xong đợt này anh sẽ ký thêm hợp đồng dài hạn theo tháng với em.', time: '18:40' }
    ]
  }
];

// ==============================================================================
// VIỆC ĐÃ ỨNG TUYỂN (APPLICATION TRACKING & TIMELINE)
// ==============================================================================
export const initialAppliedJobs = [
  {
    id: 'app_01',
    jobId: 'job_01',
    jobTitle: 'Social Media Content Creator',
    company: 'ABC Media',
    companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80',
    appliedDate: '03/11/2026',
    salary: '3.000.000 – 5.000.000đ/tháng',
    status: 'interview', // 'submitted' | 'reviewing' | 'interview' | 'accepted' | 'rejected'
    statusText: 'Hẹn phỏng vấn online',
    interviewSchedule: '14:00 - Thứ Năm, 12/11/2026 (Google Meet)',
    expectedSalary: '4.500.000đ/tháng',
    coverLetter: 'Em là sinh viên Marketing UEH, đã có kinh nghiệm thiết kế Canva và quản trị Fanpage thực tế.'
  },
  {
    id: 'app_02',
    jobId: 'job_03',
    jobTitle: 'Thiết kế Menu & Banner Canva Part-time',
    company: 'Green Coffee',
    companyLogo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=120&auto=format&fit=crop&q=80',
    appliedDate: '01/11/2026',
    salary: '2.500.000 – 4.000.000đ/tháng',
    status: 'accepted',
    statusText: 'Đã nhận việc & Đang ký quỹ hợp đồng',
    expectedSalary: '3.500.000đ/tháng',
    coverLetter: 'Rất mong được đồng hành cùng chuỗi cà phê specialty Green Coffee để tạo ra những ấn phẩm hình ảnh đẹp mắt.'
  },
  {
    id: 'app_03',
    jobId: 'job_05',
    jobTitle: 'Marketing & PR Intern (Hỗ trợ Thực tập)',
    company: 'Creative Hub',
    companyLogo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80',
    appliedDate: '29/10/2026',
    salary: '3.500.000 – 5.000.000đ/tháng',
    status: 'reviewing',
    statusText: 'Nhà tuyển dụng đang xem xét CV',
    expectedSalary: '4.000.000đ/tháng',
    coverLetter: 'Em mong muốn có cơ hội cọ xát với môi trường Agency và nhận dấu mộc thực tập cho học kỳ tới.'
  }
];

// ==============================================================================
// DÀNH CHO NHÀ TUYỂN DỤNG (EMPLOYER DASHBOARD & KANBAN APPLICANTS)
// ==============================================================================
export const employerDashboardStats = {
  totalJobs: 12,
  totalApplicants: 86,
  activeJobs: 5,
  hiredCount: 7
};

export const initialApplicantsForEmployer = [
  {
    id: 'app_emp_1',
    name: 'Nguyễn Minh Anh',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    university: 'Đại học Kinh tế TP.HCM (UEH)',
    major: 'Marketing',
    appliedFor: 'Social Media Content Creator',
    skills: ['Canva', 'Content', 'TikTok'],
    rating: 4.8,
    status: 'interview', // 'new' | 'reviewing' | 'interview' | 'accepted' | 'rejected'
    appliedDate: 'Hôm nay',
    coverLetter: 'Em là sinh viên năm 3 Marketing UEH, đã có 12 dự án hoàn thành trên StudentHub. Em rất tự tin có thể đảm nhận tốt vị trí này.'
  },
  {
    id: 'app_emp_2',
    name: 'Trần Hoàng Nam',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    university: 'Đại học Văn Lang (VLU)',
    major: 'Thiết kế Đồ họa',
    appliedFor: 'Video Editor TikTok & CapCut',
    skills: ['CapCut', 'Premiere', 'TikTok'],
    rating: 4.9,
    status: 'new',
    appliedDate: '3 giờ trước',
    coverLetter: 'Em chuyên dựng video dọc ngắn cho các nhãn hàng thời trang, cam kết giao file đúng hạn.'
  },
  {
    id: 'app_emp_3',
    name: 'Lê Thảo Nhi',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    university: 'ĐH Kinh tế - Luật',
    major: 'Kinh doanh Quốc tế',
    appliedFor: 'SEO Content Writer',
    skills: ['Copywriting', 'SEO', 'Tiếng Anh'],
    rating: 4.8,
    status: 'reviewing',
    appliedDate: 'Hôm qua',
    coverLetter: 'Có kinh nghiệm viết bài chuyên ngành kinh tế và tài chính với văn phong tự nhiên, chuẩn SEO.'
  },
  {
    id: 'app_emp_4',
    name: 'Phạm Minh Khôi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    university: 'ĐH Tôn Đức Thắng',
    major: 'Hệ thống Thông tin',
    appliedFor: 'Data Entry Assistant',
    skills: ['Excel', 'Google Sheets'],
    rating: 5.0,
    status: 'accepted',
    appliedDate: '2 ngày trước',
    coverLetter: 'Thành thạo các hàm xử lý dữ liệu phức tạp, đã vượt qua bài test nhập liệu 95 từ/phút.'
  }
];
