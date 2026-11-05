const { getPool, isMySQLConnected, memoryStore } = require('../config/db');

exports.getJobs = async (req, res) => {
  try {
    const { keyword, district, job_type, min_salary, max_salary, status = 'approved' } = req.query;

    if (isMySQLConnected()) {
      const pool = getPool();
      let sql = 'SELECT * FROM jobs WHERE status = ?';
      const params = [status];

      if (district && district !== 'all') {
        sql += ' AND district LIKE ?';
        params.push(`%${district}%`);
      }
      if (job_type) {
        sql += ' AND job_type = ?';
        params.push(job_type);
      }
      if (min_salary) {
        sql += ' AND salary_amount >= ?';
        params.push(parseFloat(min_salary));
      }
      if (max_salary) {
        sql += ' AND salary_amount <= ?';
        params.push(parseFloat(max_salary));
      }
      if (keyword) {
        sql += ' AND (title LIKE ? OR description LIKE ? OR requirements LIKE ?)';
        params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
      }

      sql += ' ORDER BY created_at DESC';
      const [jobs] = await pool.query(sql, params);
      return res.json({ success: true, count: jobs.length, data: jobs });
    } else {
      let filtered = memoryStore.jobs.filter(j => j.status === status);

      if (district && district !== 'all') {
        filtered = filtered.filter(j => j.district.toLowerCase().includes(district.toLowerCase()));
      }
      if (keyword) {
        const k = keyword.toLowerCase();
        filtered = filtered.filter(j =>
          j.title.toLowerCase().includes(k) ||
          j.company.toLowerCase().includes(k) ||
          j.description.toLowerCase().includes(k)
        );
      }

      return res.json({
        success: true,
        count: filtered.length,
        data: filtered
      });
    }
  } catch (error) {
    console.error('Lỗi lấy danh sách việc làm:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMySQLConnected()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy tin việc làm' });
      }
      return res.json({ success: true, data: rows[0] });
    } else {
      const job = memoryStore.jobs.find(j => j.id === parseInt(id));
      if (!job) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy tin việc làm' });
      }
      return res.json({ success: true, data: job });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    const { title, company, address, district, salary_amount, salary_type, job_type, shift_time, description, requirements, benefits, tax_code } = req.body;

    if (!title || !salary_amount) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đủ tiêu đề và mức lương' });
    }

    const newJob = {
      id: Date.now(),
      title,
      company: company || (req.user ? req.user.full_name : 'Doanh nghiệp VLU'),
      address: address || 'TP. Hồ Chí Minh',
      district: district || 'Bình Thạnh',
      salary_amount: parseFloat(salary_amount),
      salary_type: salary_type || 'hourly',
      job_type: job_type || 'part-time',
      shift_time: shift_time || 'Ca linh hoạt',
      description: description || '',
      requirements: requirements || '',
      benefits: benefits || '',
      tax_code: tax_code || '0318899112',
      status: 'pending', // Chờ Admin kiểm duyệt
      created_at: new Date().toISOString()
    };

    if (isMySQLConnected()) {
      const pool = getPool();
      const [result] = await pool.query(
        `INSERT INTO jobs (employer_id, title, description, requirements, benefits, salary_type, salary_amount, district, address, shift_time, job_type, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [req.user ? req.user.id : 3, title, description, requirements, benefits, salary_type, salary_amount, district, address, shift_time, job_type]
      );
      newJob.id = result.insertId;
    } else {
      memoryStore.jobs.unshift(newJob);
    }

    res.status(201).json({
      success: true,
      message: 'Đăng tin việc làm thành công! Tin của bạn đang chờ Admin kiểm duyệt để bảo vệ an toàn cho sinh viên.',
      data: newJob
    });
  } catch (error) {
    console.error('Lỗi tạo tin việc làm:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};
