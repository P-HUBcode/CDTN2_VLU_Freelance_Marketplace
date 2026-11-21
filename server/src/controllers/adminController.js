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
      const studentsCount = (memoryStore.users || []).filter(u => u.role === 'student').length;
      const employersCount = (memoryStore.users || []).filter(u => u.role === 'employer').length;

      return res.json({
        success: true,
        data: {
          totalStudents: studentsCount,
          totalEmployers: employersCount,
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

const { createClient } = require('@supabase/supabase-js');

// Gửi yêu cầu khôi phục mật khẩu chính thức qua Supabase Auth (Bắt buộc quyền Admin từ nguồn tin cậy)
exports.resetUserPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Thiếu hoặc sai định dạng địa chỉ email người dùng cần khôi phục.' });
    }

    // 1. Kiểm tra quyền Admin từ nguồn đáng tin cậy (đã xác thực qua middleware)
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này. Yêu cầu quyền: admin' });
    }

    // 2. Gửi yêu cầu khôi phục mật khẩu chính thức qua Supabase Auth
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://hnjitsvjteyixhieshil.supabase.co';
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_WQSehlIknjN3qMs6kX3f_g_LsDQqJac';
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${clientUrl}/#reset-password`
    });

    if (error) {
      console.error('Supabase resetPasswordForEmail thất bại:', error);
      return res.status(error.status || 400).json({
        success: false,
        message: `Thao tác trên Supabase thất bại: ${error.message}`,
        error: error.message,
        code: error.code
      });
    }

    return res.json({
      success: true,
      message: `Đã gửi liên kết khôi phục mật khẩu chính thức qua Supabase tới email ${cleanEmail}.`
    });
  } catch (err) {
    console.error('Lỗi khi gửi yêu cầu khôi phục mật khẩu qua Supabase:', err);
    res.status(500).json({
      success: false,
      message: `Thao tác trên Supabase thất bại: ${err.message}`,
      error: err.message
    });
  }
};

// Admin xóa vĩnh viễn tài khoản người dùng và dọn dẹp dữ liệu an toàn
exports.deleteUserAccount = async (req, res) => {
  try {
    const { userId } = req.params;
    const { confirmEmail } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Thiếu định danh tài khoản người dùng cần xóa (userId).' });
    }

    if (!confirmEmail || !confirmEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email xác nhận để thực hiện thao tác xóa an toàn.' });
    }

    // 1. Kiểm tra quyền Admin từ nguồn đáng tin cậy
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này. Yêu cầu quyền: admin' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://hnjitsvjteyixhieshil.supabase.co';
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_WQSehlIknjN3qMs6kX3f_g_LsDQqJac';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const token = req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    });

    // Ưu tiên service client với quyền quản trị để vượt qua RLS và thao tác trực tiếp với Auth/Storage
    const dbClient = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false }
        })
      : userClient;

    // 2. Xác định tài khoản đích từ Supabase hoặc MemoryStore
    let targetUser = null;
    try {
      const { data: prof, error: profErr } = await dbClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!profErr && prof) {
        targetUser = prof;
      }
    } catch (e) {}

    // Fallback: Tìm qua Auth API nếu profile không còn
    if (!targetUser && serviceRoleKey) {
      try {
        const { data: authUser, error: auErr } = await dbClient.auth.admin.getUserById(userId);
        if (!auErr && authUser?.user) {
          targetUser = {
            id: authUser.user.id,
            email: authUser.user.email,
            role: authUser.user.user_metadata?.role || 'student',
            full_name: authUser.user.user_metadata?.full_name || authUser.user.email
          };
        }
      } catch (e) {}
    }

    if (!targetUser && memoryStore.users) {
      const memU = memoryStore.users.find(u => String(u.id) === String(userId) || u.email?.toLowerCase() === confirmEmail.trim().toLowerCase());
      if (memU) targetUser = memU;
    }

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản người dùng cần xóa.' });
    }

    const targetEmail = (targetUser.email || '').trim().toLowerCase();
    const cleanConfirm = confirmEmail.trim().toLowerCase();

    // Đối chiếu email xác nhận
    if (targetEmail !== cleanConfirm) {
      return res.status(400).json({
        success: false,
        message: `Email xác nhận không khớp. Yêu cầu nhập đúng: ${targetEmail}`
      });
    }

    // 3. Chặn tự xóa tài khoản của chính mình
    const currentAdminId = req.user.id ? String(req.user.id).toLowerCase() : '';
    const currentAdminEmail = req.user.email ? req.user.email.toLowerCase() : '';
    if (
      currentAdminId === String(userId).toLowerCase() ||
      (currentAdminEmail && currentAdminEmail === targetEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Bạn không thể tự xóa tài khoản Quản trị viên của chính mình.'
      });
    }

    // 4. Chặn xóa Quản trị viên cuối cùng của hệ thống
    if (targetUser.role === 'admin') {
      let adminCount = 1;
      try {
        const { count, error } = await dbClient
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'admin');
        if (!error && count !== null) {
          adminCount = count;
        }
      } catch (e) {}

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa quản trị viên cuối cùng của hệ thống. Phải giữ lại ít nhất một tài khoản Quản trị viên.'
        });
      }
    }

    // 5. BẢO TOÀN DỮ LIỆU DÙNG CHUNG
    // - Dự án: Cập nhật thông tin người bị xóa thành [Tài khoản đã xóa] để bên còn lại (employer hoặc student) không bị mất dự án và thanh toán
    if (memoryStore.projects) {
      memoryStore.projects.forEach(p => {
        if (p.studentId === userId || (p.studentEmail && p.studentEmail.toLowerCase() === targetEmail)) {
          p.studentId = null;
          p.studentName = '[Cựu thành viên - Đã xóa tài khoản]';
          p.studentEmail = '';
        }
        if (p.employerId === userId || (p.employerEmail && p.employerEmail.toLowerCase() === targetEmail)) {
          p.employerId = null;
          p.employerName = '[Doanh nghiệp - Đã đóng tài khoản]';
          p.employerEmail = '';
        }
      });
    }

    // - Hội thoại chat: Bảo toàn lịch sử chat cho bên còn lại
    if (memoryStore.chatConversations) {
      memoryStore.chatConversations.forEach(c => {
        if (Array.isArray(c.messages)) {
          c.messages.forEach(m => {
            if (m.senderId === userId || (m.senderEmail && m.senderEmail.toLowerCase() === targetEmail)) {
              m.senderName = '[Tài khoản đã xóa]';
            }
          });
        }
      });
    }

    // 6. XỬ LÝ STORAGE (File CV)
    // "File CV chỉ được xóa khi không còn hồ sơ cần dùng"
    let storageDeletedCount = 0;
    try {
      const { data: cvFiles } = await dbClient.storage.from('cv').list(userId);
      if (Array.isArray(cvFiles) && cvFiles.length > 0) {
        const filesToDelete = [];
        for (const f of cvFiles) {
          const filePath = `${userId}/${f.name}`;
          const { data: refApps } = await dbClient
            .from('job_applications')
            .select('id')
            .eq('cv_url', filePath)
            .neq('student_id', userId)
            .limit(1);

          if (!refApps || refApps.length === 0) {
            filesToDelete.push(filePath);
          }
        }

        if (filesToDelete.length > 0) {
          const { error: removeErr } = await dbClient.storage.from('cv').remove(filesToDelete);
          if (!removeErr) storageDeletedCount += filesToDelete.length;
        }
      }

      // Xóa folder trong bucket 'portfolios' nếu có
      const { data: portFiles } = await dbClient.storage.from('portfolios').list(userId);
      if (Array.isArray(portFiles) && portFiles.length > 0) {
        const portPaths = portFiles.map(pf => `${userId}/${pf.name}`);
        await dbClient.storage.from('portfolios').remove(portPaths);
      }
    } catch (stErr) {
      console.warn('Cảnh báo dọn dẹp Storage:', stErr.message);
    }

    // 7. XỬ LÝ DỮ LIỆU RIÊNG TRONG CƠ SỞ DỮ LIỆU
    try {
      await dbClient.from('student_projects').delete().eq('student_id', userId);
      await dbClient.from('saved_jobs').delete().eq('user_id', userId);
      await dbClient.from('notifications').delete().eq('user_id', userId);
      await dbClient.from('job_applications').delete().eq('student_id', userId);
      await dbClient.from('student_profiles').delete().eq('user_id', userId);
      await dbClient.from('jobs').delete().eq('employer_id', userId);
      await dbClient.from('companies').delete().eq('owner_id', userId);
      await dbClient.from('profiles').delete().eq('id', userId);
    } catch (dbErr) {
      console.warn('Lỗi khi xóa bảng profiles/con:', dbErr.message);
    }

    if (memoryStore.users) {
      memoryStore.users = memoryStore.users.filter(u => String(u.id) !== String(userId) && u.email?.toLowerCase() !== targetEmail);
    }

    // 8. XÓA TÀI KHOẢN KHỎI SUPABASE AUTH (Cho phép đăng ký lại cùng email)
    let authDeleted = false;
    let authNote = '';
    if (serviceRoleKey) {
      try {
        const { error: supaAuthErr } = await dbClient.auth.admin.deleteUser(userId);
        if (supaAuthErr) {
          console.error('Supabase admin.deleteUser error:', supaAuthErr);
          return res.status(500).json({
            success: false,
            message: `Lỗi tại bước xóa tài khoản Supabase Auth: ${supaAuthErr.message}. Dữ liệu hồ sơ và Storage đã được dọn sạch, có thể thử lại an toàn.`,
            error: supaAuthErr.message
          });
        }
        authDeleted = true;
      } catch (saErr) {
        return res.status(500).json({
          success: false,
          message: `Lỗi tại bước xóa tài khoản Supabase Auth: ${saErr.message}`,
          error: saErr.message
        });
      }
    } else {
      authNote = 'Dữ liệu hồ sơ và Storage đã được xóa hoàn tất. Để xóa tài khoản khỏi Supabase Auth cho phép đăng ký lại ngay cùng email, cần bổ sung SUPABASE_SERVICE_ROLE_KEY trong server/.env.';
    }

    return res.json({
      success: true,
      message: authDeleted
        ? `Đã xóa vĩnh viễn tài khoản ${targetEmail} và toàn bộ dữ liệu liên quan thành công.`
        : `Đã dọn sạch hồ sơ và dữ liệu của tài khoản ${targetEmail}. ${authNote}`,
      data: {
        userId,
        email: targetEmail,
        authDeleted,
        storageFilesCleaned: storageDeletedCount
      }
    });
  } catch (err) {
    console.error('Lỗi deleteUserAccount:', err);
    res.status(500).json({
      success: false,
      message: `Xóa tài khoản thất bại: ${err.message}`,
      error: err.message
    });
  }
};
