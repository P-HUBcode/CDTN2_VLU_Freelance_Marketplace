const { getPool, isMySQLConnected, memoryStore } = require('../config/db');

exports.getJobs = async (req, res) => {
  try {
    const { keyword, district, job_type, min_salary, max_salary, status } = req.query;

    if (isMySQLConnected()) {
      const pool = getPool();
      let sql = 'SELECT * FROM jobs WHERE (status = "approved" OR status = "published")';
      const params = [];

      if (status && status !== 'all') {
        sql = 'SELECT * FROM jobs WHERE status = ?';
        params.push(status);
      }

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
      let filtered = [...memoryStore.jobs];

      if (status && status !== 'all') {
        filtered = filtered.filter(j => j.status === status);
      } else {
        filtered = filtered.filter(j => !j.status || j.status === 'approved' || j.status === 'published');
      }

      if (district && district !== 'all') {
        filtered = filtered.filter(j => (j.district || '').toLowerCase().includes(district.toLowerCase()));
      }
      if (keyword) {
        const k = keyword.toLowerCase();
        filtered = filtered.filter(j =>
          (j.title || '').toLowerCase().includes(k) ||
          (j.company || '').toLowerCase().includes(k) ||
          (j.description || '').toLowerCase().includes(k)
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

    if (!title) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đủ tiêu đề công việc' });
    }

    const sal = parseFloat(salary_amount) || 3000000;
    const formatSal = (s) => `${new Intl.NumberFormat('vi-VN').format(s)}đ`;

    const newJob = {
      id: Date.now(),
      title,
      company: company || (req.user ? req.user.full_name : 'Doanh nghiệp / Sinh viên tuyển dụng'),
      companyLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80',
      address: address || 'TP. Hồ Chí Minh',
      district: district || 'Bình Thạnh',
      location: district ? `${district}, TP. Hồ Chí Minh` : 'TP. Hồ Chí Minh',
      salary_amount: sal,
      salaryMin: sal,
      salaryMax: sal,
      salary: formatSal(sal),
      salary_type: salary_type || 'monthly',
      job_type: job_type || 'part-time',
      type: job_type || 'part-time',
      workMode: (job_type || '').toLowerCase().includes('freelance') || (job_type || '').toLowerCase().includes('remote') ? 'Remote' : 'Onsite',
      shift_time: shift_time || 'Ca linh hoạt',
      workingHours: shift_time || 'Linh hoạt theo lịch học',
      skills: Array.isArray(req.body.skills) ? req.body.skills : typeof req.body.skills === 'string' ? req.body.skills.split(',').map(s => s.trim()).filter(Boolean) : ['Linh hoạt', 'Nhiệt tình'],
      description: description || 'Mô tả công việc tuyển dụng chi tiết.',
      requirements: Array.isArray(requirements) ? requirements : typeof requirements === 'string' ? requirements.split(';').map(s => s.trim()).filter(Boolean) : ['Nhiệt tình, trung thực'],
      benefits: Array.isArray(benefits) ? benefits : typeof benefits === 'string' ? benefits.split(';').map(s => s.trim()).filter(Boolean) : ['Ký quỹ thù lao minh bạch'],
      tax_code: tax_code || '0318899112',
      status: 'published', // Đăng công khai ngay lập tức để cả Edge và Cốc Cốc cùng thấy
      postedTime: 'Vừa xong',
      deadline: '2026-12-30',
      verified: true,
      created_at: new Date().toISOString()
    };

    if (isMySQLConnected()) {
      const pool = getPool();
      const [result] = await pool.query(
        `INSERT INTO jobs (employer_id, title, description, requirements, benefits, salary_type, salary_amount, district, address, shift_time, job_type, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`,
        [req.user ? req.user.id : 3, title, description, Array.isArray(requirements) ? requirements.join('; ') : requirements, Array.isArray(benefits) ? benefits.join('; ') : benefits, salary_type, sal, district, address, shift_time, job_type]
      );
      newJob.id = result.insertId;
    } else {
      memoryStore.jobs.unshift(newJob);
    }

    console.log(`[Job API] Đã tạo tin việc làm mới: "${newJob.title}" bởi ${newJob.company}`);

    res.status(201).json({
      success: true,
      message: 'Đăng tin việc làm thành công!',
      data: newJob
    });
  } catch (error) {
    console.error('Lỗi tạo tin việc làm:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};
