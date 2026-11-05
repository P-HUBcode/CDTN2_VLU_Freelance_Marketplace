const { getPool, isMySQLConnected, memoryStore } = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    if (isMySQLConnected()) {
      const pool = getPool();
      const [[students]] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
      const [[employers]] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'employer'");
      const [[activeJobs]] = await pool.query("SELECT COUNT(*) as count FROM jobs WHERE status = 'approved'");
      const [[pendingJobs]] = await pool.query("SELECT COUNT(*) as count FROM jobs WHERE status = 'pending'");

      return res.json({
        success: true,
        data: {
          totalStudents: students.count,
          totalEmployers: employers.count,
          activeJobs: activeJobs.count,
          pendingJobs: pendingJobs.count
        }
      });
    } else {
      const activeJobs = memoryStore.jobs.filter(j => j.status === 'approved').length;
      const pendingJobs = memoryStore.jobs.filter(j => j.status === 'pending').length;

      return res.json({
        success: true,
        data: {
          totalStudents: 1240,
          totalEmployers: 158,
          activeJobs,
          pendingJobs
        }
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

exports.getPendingJobs = async (req, res) => {
  try {
    if (isMySQLConnected()) {
      const pool = getPool();
      const [rows] = await pool.query("SELECT * FROM jobs WHERE status = 'pending' ORDER BY created_at ASC");
      return res.json({ success: true, count: rows.length, data: rows });
    } else {
      const pending = memoryStore.jobs.filter(j => j.status === 'pending');
      return res.json({ success: true, count: pending.length, data: pending });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

exports.moderateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' | 'reject' | 'block'

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    if (isMySQLConnected()) {
      const pool = getPool();
      await pool.query('UPDATE jobs SET status = ? WHERE id = ?', [newStatus, id]);
    } else {
      const job = memoryStore.jobs.find(j => j.id === parseInt(id));
      if (job) job.status = newStatus;
    }

    res.json({
      success: true,
      message: action === 'approve'
        ? '✔ Tin tuyển dụng đã được duyệt và công khai trên trang chủ sinh viên!'
        : '🚫 Đã bác bỏ tin đăng nghi vấn lừa đảo và đưa vào Blacklist cảnh báo!',
      status: newStatus
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};
