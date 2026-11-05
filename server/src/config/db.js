const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;
let isConnected = false;

// Fallback in-memory seed data matching database_schema.sql
const memoryStore = {
  users: [
    { id: 1, email: 'admin.demo@gmail.com', role: 'admin', full_name: 'Quản trị viên Hệ thống', is_verified: 1 },
    { id: 2, email: 'sinhvien.demo@student.vlu.edu.vn', role: 'student', full_name: 'Nguyễn Minh Phú', is_verified: 1 },
    { id: 3, email: 'tuyendung.demo@gmail.com', role: 'employer', full_name: 'The Book Cafe VLU', is_verified: 1 }
  ],
  jobs: [
    {
      id: 1,
      title: 'Tuyển Thực Tập Sinh Lập Trình Frontend ReactJS (Part-time)',
      company: 'Công ty TNHH Truyền thông Sáng tạo VLU',
      address: '69/68 Đặng Thùy Trâm, P. 13, Bình Thạnh, TP.HCM',
      district: 'Bình Thạnh',
      salary_amount: 45000,
      salary_type: 'hourly',
      job_type: 'part-time',
      shift_time: 'Sáng T2-T4-T6 (8h - 12h)',
      description: 'Phối hợp cùng team xây dựng giao diện người dùng bằng ReactJS và TailwindCSS. Tối ưu hóa hiển thị Mobile Responsive và kết nối RESTful API.',
      requirements: 'Sinh viên năm 3 hoặc năm cuối CNTT Văn Lang, nắm chắc HTML/CSS/JS ES6 và React cơ bản.',
      benefits: 'Thù lao minh bạch, hỗ trợ mộc dấu thực tập tốt nghiệp, lịch ca linh hoạt theo thời khóa biểu.',
      status: 'approved',
      tax_code: '0318899112'
    },
    {
      id: 2,
      title: 'Nhân Viên Phục Vụ Quán Cafe Sách (Linh hoạt theo ca học)',
      company: 'The Book Cafe VLU',
      address: '128 Nguyễn Thái Sơn, P. 3, Gò Vấp, TP.HCM (gần Cơ sở 2)',
      district: 'Gò Vấp',
      salary_amount: 30000,
      salary_type: 'hourly',
      job_type: 'part-time',
      shift_time: 'Ca tối (18h - 22h)',
      description: 'Order đồ uống, phục vụ và bảo quản sách tại quầy. Môi trường yên tĩnh, thân thiện cho sinh viên.',
      requirements: 'Nhanh nhẹn, trung thực, có thái độ phục vụ tốt.',
      benefits: 'Thưởng doanh số, được đọc sách miễn phí, hỗ trợ đổi ca khi trùng lịch thi cử.',
      status: 'approved',
      tax_code: '0319887766'
    },
    {
      id: 3,
      title: 'Thiết Kế Banner & Edit Video TikTok Cho Shop Thời Trang (Freelance)',
      company: 'Chic Fashion Studio',
      address: 'Làm việc từ xa (Online / Remote)',
      district: 'Online',
      salary_amount: 1500000,
      salary_type: 'project',
      job_type: 'freelance',
      shift_time: 'Linh hoạt',
      description: 'Thiết kế 4 banner/tuần và cắt ghép 2 video TikTok ngắn giới thiệu mẫu thời trang mới.',
      requirements: 'Có laptop riêng, sử dụng thành thạo Canva, Photoshop hoặc CapCut.',
      benefits: 'Nhận thanh toán theo tuần, làm việc tự do tại nhà.',
      status: 'approved',
      tax_code: '0317788990'
    },
    {
      id: 4,
      title: 'Gia Sư Dạy Kèm Tiếng Anh Lớp 8 (Giao tiếp & Ngữ pháp)',
      company: 'Phụ huynh học sinh',
      address: '45 Nguyễn Thị Minh Khai, P. Bến Nghé, Quận 1 (gần Cơ sở 1)',
      district: 'Quận 1',
      salary_amount: 150000,
      salary_type: 'hourly',
      job_type: 'part-time',
      shift_time: 'Tối T3 - T5 (19h - 20h30)',
      description: 'Dạy kèm kèm cặp ngữ pháp và phát âm tiếng Anh cho học sinh lớp 8 chuẩn bị thi học kỳ.',
      requirements: 'Sinh viên Văn Lang có chứng chỉ IELTS >= 6.0 hoặc TOEIC >= 650, kiên nhẫn.',
      benefits: 'Thù lao trả sau mỗi buổi dạy 150.000đ/90 phút.',
      status: 'approved',
      tax_code: 'CN-GIA-SU'
    },
    {
      id: 5,
      title: 'Việc nhẹ lương cao 500k/ngày gõ mã captcha online',
      company: 'Cá nhân tự do (SĐT rác không rõ nguồn gốc)',
      address: 'Online không có địa chỉ rõ ràng',
      district: 'Online',
      salary_amount: 500000,
      salary_type: 'project',
      job_type: 'freelance',
      shift_time: 'Tự do',
      description: 'Yêu cầu tải app và chuyển khoản cọc 200k để nhận tài khoản làm việc.',
      requirements: 'Không yêu cầu.',
      benefits: '500.000đ/ngày.',
      status: 'pending',
      tax_code: ''
    }
  ],
  applications: [
    {
      id: 1,
      job_id: 1,
      student_id: 2,
      student_name: 'Nguyễn Minh Phú',
      student_mssv: '2374802013447',
      student_email: 'sinhvien.demo@student.vlu.edu.vn',
      student_rating: 5.0,
      cv_url: '/uploads/CV_NguyenMinhPhu_WebDev.pdf',
      cover_letter: 'Em là sinh viên năm cuối CNTT Văn Lang, đã làm việc với ReactJS và Git.',
      status: 'approved',
      applied_at: '2026-10-20 09:30:00'
    },
    {
      id: 2,
      job_id: 1,
      student_id: 4,
      student_name: 'Trần Văn B',
      student_mssv: '2374802010111',
      student_email: 'b.tran@student.vlu.edu.vn',
      student_rating: 4.8,
      cv_url: '/uploads/CV_TranVanB.pdf',
      cover_letter: 'Em đã học xong môn Web và muốn tìm cơ hội thực tập.',
      status: 'pending',
      applied_at: '2026-10-21 14:15:00'
    }
  ]
};

async function initDB() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'vlu_freelance_db',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ [Database] Đã kết nối thành công tới MySQL CSDL: ' + (process.env.DB_NAME || 'vlu_freelance_db'));
    connection.release();
    isConnected = true;
  } catch (err) {
    console.warn('⚠️ [Database Warning] Không thể kết nối tới MySQL trực tiếp (' + err.message + ').');
    console.log('💡 [Database Fallback] Chuyển sang chế độ Smart In-Memory Store để hệ thống chạy mượt mà ngay lập tức!');
    isConnected = false;
  }
}

initDB();

module.exports = {
  getPool: () => pool,
  isMySQLConnected: () => isConnected,
  memoryStore
};
