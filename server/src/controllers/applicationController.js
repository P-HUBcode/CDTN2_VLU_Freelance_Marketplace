const { getPool, isMySQLConnected, memoryStore } = require('../config/db');

exports.applyJob = async (req, res) => {
  try {
    const { job_id, cover_letter, cv_url } = req.body;

    if (!job_id) {
      return res.status(400).json({ success: false, message: 'Thiếu mã công việc (job_id)' });
    }

    const studentUser = req.user || {
      id: 2,
      full_name: 'Nguyễn Minh Phú',
      email: 'sinhvien.demo@student.vlu.edu.vn'
    };

    const newApp = {
      id: Date.now(),
      job_id: parseInt(job_id),
      student_id: studentUser.id,
      student_name: studentUser.full_name || 'Nguyễn Minh Phú',
      student_mssv: '2374802013447',
      student_email: studentUser.email,
      student_rating: 5.0,
      cv_url: cv_url || '/uploads/CV_NguyenMinhPhu_WebDev.pdf',
      cover_letter: cover_letter || 'Em là sinh viên Văn Lang xin nộp đơn ứng tuyển.',
      status: 'pending',
      applied_at: new Date().toISOString()
    };

    if (isMySQLConnected()) {
      const pool = getPool();
      const [result] = await pool.query(
        `INSERT INTO applications (job_id, student_id, cover_letter, cv_file_url, status)
         VALUES (?, ?, ?, ?, 'pending')`,
        [job_id, studentUser.id, newApp.cover_letter, newApp.cv_url]
      );
      newApp.id = result.insertId;
    } else {
      memoryStore.applications.unshift(newApp);
    }

    res.status(201).json({
      success: true,
      message: '🚀 Nộp hồ sơ ứng tuyển thành công! Nhà tuyển dụng sẽ xem xét và phản hồi trong 24 giờ.',
      data: newApp
    });
  } catch (error) {
    console.error('Lỗi nộp hồ sơ:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

exports.getApplicantsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (isMySQLConnected()) {
      const pool = getPool();
      const [apps] = await pool.query(
        `SELECT a.*, sp.full_name as student_name, sp.student_code as student_mssv, u.email as student_email
         FROM applications a
         JOIN users u ON a.student_id = u.id
         LEFT JOIN student_profiles sp ON u.id = sp.user_id
         WHERE a.job_id = ?
         ORDER BY a.applied_at DESC`,
        [jobId]
      );
      return res.json({ success: true, count: apps.length, data: apps });
    } else {
      const apps = memoryStore.applications.filter(a => a.job_id === parseInt(jobId));
      return res.json({ success: true, count: apps.length, data: apps });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    if (isMySQLConnected()) {
      const pool = getPool();
      await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, id]);
    } else {
      const app = memoryStore.applications.find(a => a.id === parseInt(id));
      if (app) app.status = status;
    }

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái đơn ứng tuyển thành: ${status === 'approved' ? 'ĐÃ DUYỆT NHẬN' : 'TỪ CHỐI'}`,
      status
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 2;

    if (isMySQLConnected()) {
      const pool = getPool();
      const [rows] = await pool.query(
        `SELECT a.*, j.title as job_title, j.salary_amount, j.salary_type, ep.company_name
         FROM applications a
         JOIN jobs j ON a.job_id = j.id
         LEFT JOIN employer_profiles ep ON j.employer_id = ep.user_id
         WHERE a.student_id = ?
         ORDER BY a.applied_at DESC`,
        [userId]
      );
      return res.json({ success: true, data: rows });
    } else {
      const myApps = memoryStore.applications.filter(a => a.student_id === userId);
      return res.json({ success: true, data: myApps });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};
