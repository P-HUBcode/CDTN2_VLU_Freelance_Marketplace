import { supabase, isSupabaseConfigured } from './supabase';
import { getMarketplaceJobs } from './jobService';

// ==============================================================================
// STUDENTHUB - ADMIN SERVICE (SPRINT 4: PHÂN HỆ QUẢN TRỊ HỆ THỐNG)
// ==============================================================================

// ------------------------------------------------------------------------------
// 1. LẤY THỐNG KÊ QUẢN TRỊ TOÀN HỆ THỐNG
// ------------------------------------------------------------------------------
export async function getAdminStats() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
      if (!error && data) {
        return {
          totalStudents: Number(data.total_students) || 0,
          totalEmployers: Number(data.total_employers) || 0,
          totalJobs: Number(data.total_jobs) || 0,
          totalApplications: Number(data.total_applications) || 0
        };
      }
      console.warn('Lỗi RPC get_admin_dashboard_stats:', error);
    } catch (err) {
      console.error('Exception get_admin_dashboard_stats:', err);
    }
  }

  // Fallback thống kê mẫu cho chế độ local
  return {
    totalStudents: 148,
    totalEmployers: 42,
    totalJobs: 86,
    totalApplications: 312
  };
}

// ------------------------------------------------------------------------------
// 2. LẤY DANH SÁCH TOÀN BỘ TIN TUYỂN DỤNG CHO ADMIN KIỂM DUYỆT
// ------------------------------------------------------------------------------
export async function getAllJobsForAdmin({ status = 'all', search = '', page = 1, pageSize = 20 } = {}) {
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          id,
          title,
          description,
          job_type,
          location,
          salary_min,
          salary_max,
          status,
          created_at,
          deadline,
          employer_id,
          employer:profiles!employer_id(id, full_name, email, phone),
          company:companies(id, company_name, logo_url)
        `, { count: 'exact' });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      if (search && search.trim()) {
        query = query.ilike('title', `%${search.trim()}%`);
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Lỗi Supabase getAllJobsForAdmin:', error);
      } else {
        return {
          jobs: (data || []).map(j => ({
            id: j.id,
            title: j.title,
            description: j.description,
            jobType: j.job_type,
            location: j.location,
            salaryMin: j.salary_min,
            salaryMax: j.salary_max,
            status: j.status,
            createdAt: j.created_at,
            deadline: j.deadline,
            employerId: j.employer_id,
            employerName: j.employer?.full_name || 'Nhà tuyển dụng',
            employerEmail: j.employer?.email || '',
            companyName: j.company?.company_name || 'Doanh nghiệp',
            companyLogo: j.company?.logo_url || ''
          })),
          totalCount: count || 0
        };
      }
    } catch (err) {
      console.error('Exception getAllJobsForAdmin:', err);
    }
  }

  // Fallback Local Storage
  const { jobs: all } = await getMarketplaceJobs({ pageSize: 100 });
  let filtered = [...(all || [])];
  if (status && status !== 'all') {
    filtered = filtered.filter(j => j.status === status);
  }
  if (search && search.trim()) {
    const s = search.toLowerCase();
    filtered = filtered.filter(j => j.title.toLowerCase().includes(s) || j.company.toLowerCase().includes(s));
  }

  return {
    jobs: filtered.slice((page - 1) * pageSize, page * pageSize),
    totalCount: filtered.length
  };
}

// ------------------------------------------------------------------------------
// 3. ADMIN DUYỆT HOẶC TỪ CHỐI / ĐÓNG TIN TUYỂN DỤNG
// ------------------------------------------------------------------------------
export async function updateJobStatusByAdmin(jobId, newStatus, reason = '') {
  if (!jobId || !newStatus) {
    throw new Error('Thiếu thông tin cập nhật trạng thái tin.');
  }

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('jobs')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      throw new Error(`Cập nhật trạng thái tin thất bại: ${error.message}`);
    }
    return data;
  }

  // Local fallback
  return { id: jobId, status: newStatus, reason };
}

// ------------------------------------------------------------------------------
// 4. QUẢN LÝ MẬT KHẨU NGƯỜI DÙNG DÀNH CHO ADMIN
// ------------------------------------------------------------------------------
const DEFAULT_PASSWORDS = {
  'student.a@test.vn': 'Password123!',
  'student.b@test.vn': 'Password123!',
  'employer.a@test.vn': 'Password123!',
  'employer.b@test.vn': 'Password123!',
  'admin@test.vn': 'Password123!',
  'phu47008@gmail.com': 'Password123!',
  'havykute0101@gmail.com': 'Password123!',
  'test_signup_1795109425500@gmail.com': 'Password123!',
  'sinhvien.demo@student.vlu.edu.vn': 'VluStudent@2026',
  'tuyendung.demo@gmail.com': 'Employer@2026'
};

export function getUserPasswordMap() {
  try {
    const raw = localStorage.getItem('studenthub_user_passwords');
    const custom = raw ? JSON.parse(raw) : {};
    return { ...DEFAULT_PASSWORDS, ...custom };
  } catch (e) {
    return { ...DEFAULT_PASSWORDS };
  }
}

export function getUserPassword(user) {
  const map = getUserPasswordMap();
  const emailKey = (user?.email || '').trim().toLowerCase();
  const idKey = user?.id || '';
  if (map[emailKey]) return map[emailKey];
  if (map[idKey]) return map[idKey];
  return 'Password123!';
}

// ------------------------------------------------------------------------------
// 5. LẤY DANH SÁCH NGƯỜI DÙNG CHO ADMIN QUẢN TRỊ (KÈM MẬT KHẨU QUẢN TRỊ)
// ------------------------------------------------------------------------------
export async function getAllUsersForAdmin({ role = 'all', search = '', page = 1, pageSize = 30 } = {}) {
  let allUsers = [];

  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          role,
          avatar_url,
          is_active,
          created_at
        `, { count: 'exact' });

      if (role && role !== 'all') {
        query = query.eq('role', role);
      }

      if (search && search.trim()) {
        query = query.or(`full_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data) {
        allUsers = data.map(u => ({
          id: u.id,
          fullName: u.full_name,
          email: u.email,
          phone: u.phone,
          role: u.role,
          avatarUrl: u.avatar_url,
          isActive: u.is_active !== false,
          createdAt: u.created_at,
          password: getUserPassword(u)
        }));
      }
    } catch (err) {
      console.error('Exception getAllUsersForAdmin Supabase:', err);
    }
  }

  // Kết hợp thêm người dùng đã đăng ký qua form (localStorage)
  try {
    const rawReg = localStorage.getItem('studenthub_registered_users');
    if (rawReg) {
      const registeredList = JSON.parse(rawReg);
      registeredList.forEach(reg => {
        if (!allUsers.some(u => u.email?.toLowerCase() === reg.email?.toLowerCase())) {
          allUsers.push({
            id: reg.id || `reg_${Date.now()}`,
            fullName: reg.full_name || reg.fullName || 'Người dùng mới',
            email: reg.email,
            phone: reg.phone || '0901234567',
            role: reg.role || 'student',
            avatarUrl: reg.avatar_url || reg.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
            university: reg.university,
            companyName: reg.company_name,
            isActive: true,
            createdAt: reg.createdAt || new Date().toISOString(),
            password: getUserPassword(reg)
          });
        }
      });
    }
  } catch (e) {}

  // Fallback các tài khoản demo nếu danh sách còn trống
  if (allUsers.length === 0) {
    const mockUsers = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        fullName: 'Nguyễn Minh Anh',
        email: 'student.a@test.vn',
        phone: '0901234567',
        role: 'student',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
        isActive: true,
        createdAt: '2026-10-01T08:00:00Z',
        password: getUserPassword({ email: 'student.a@test.vn' })
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        fullName: 'Trần Thị Bích',
        email: 'student.b@test.vn',
        phone: '0902345678',
        role: 'student',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120',
        isActive: true,
        createdAt: '2026-10-05T09:30:00Z',
        password: getUserPassword({ email: 'student.b@test.vn' })
      },
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        fullName: 'ABC Media Studio (HR Mai)',
        email: 'employer.a@test.vn',
        phone: '0987654321',
        role: 'employer',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120',
        isActive: true,
        createdAt: '2026-09-20T10:00:00Z',
        password: getUserPassword({ email: 'employer.a@test.vn' })
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        fullName: 'TechCorp Solutions',
        email: 'employer.b@test.vn',
        phone: '0911223344',
        role: 'employer',
        avatarUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120',
        isActive: false,
        createdAt: '2026-09-25T14:15:00Z',
        password: getUserPassword({ email: 'employer.b@test.vn' })
      }
    ];
    allUsers = mockUsers;
  }

  let filtered = [...allUsers];
  if (role && role !== 'all') {
    filtered = filtered.filter(u => u.role === role);
  }
  if (search && search.trim()) {
    const s = search.toLowerCase();
    filtered = filtered.filter(u => (u.fullName || '').toLowerCase().includes(s) || (u.email || '').toLowerCase().includes(s));
  }

  return {
    users: filtered,
    totalCount: filtered.length
  };
}

// ------------------------------------------------------------------------------
// 6. ADMIN ĐỔI MẬT KHẨU CHO NGƯỜI DÙNG (TỰ ĐỔI MẬT KHẨU BẤT KỲ USER NÀO)
// ------------------------------------------------------------------------------
export async function adminChangeUserPassword(userId, newPassword, userEmail) {
  if (!newPassword || newPassword.trim().length < 6) {
    throw new Error('Mật khẩu mới phải có tối thiểu 6 ký tự.');
  }

  const cleanPass = newPassword.trim();

  // 1. Lưu vào registry mật khẩu quản trị
  try {
    const raw = localStorage.getItem('studenthub_user_passwords');
    const pwdMap = raw ? JSON.parse(raw) : {};
    if (userEmail) pwdMap[userEmail.trim().toLowerCase()] = cleanPass;
    if (userId) pwdMap[userId] = cleanPass;
    localStorage.setItem('studenthub_user_passwords', JSON.stringify(pwdMap));
  } catch (e) {
    console.warn('Lỗi lưu mật khẩu:', e);
  }

  // 2. Cập nhật vào danh sách registered_users (nếu user đăng ký lưu tại client)
  try {
    const rawReg = localStorage.getItem('studenthub_registered_users');
    if (rawReg) {
      const usersList = JSON.parse(rawReg);
      const updated = usersList.map((u) => {
        if (
          (u.id && u.id === userId) ||
          (userEmail && u.email?.toLowerCase() === userEmail.toLowerCase())
        ) {
          return { ...u, password: cleanPass };
        }
        return u;
      });
      localStorage.setItem('studenthub_registered_users', JSON.stringify(updated));
    }
  } catch (e) {}

  // 3. Nếu là phiên đăng nhập hiện tại khớp với tài khoản bị đổi mật khẩu
  try {
    const savedMockAuth = localStorage.getItem('studenthub_mock_session');
    if (savedMockAuth) {
      const parsed = JSON.parse(savedMockAuth);
      if (
        (parsed?.user?.id && parsed.user.id === userId) ||
        (userEmail && parsed?.user?.email?.toLowerCase() === userEmail.toLowerCase())
      ) {
        parsed.password = cleanPass;
        localStorage.setItem('studenthub_mock_session', JSON.stringify(parsed));
      }
    }
  } catch (e) {}

  // 4. Đồng bộ mật khẩu mới lên Backend Server (cho đa thiết bị & trình duyệt khác)
  try {
    fetch('http://localhost:5000/api/auth/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, userId, newPassword: cleanPass })
    }).catch(err => console.warn('Lỗi sync password lên server:', err));
  } catch (e) {}

  // 5. Nếu có Supabase profiles
  if (isSupabaseConfigured && userId && !userId.startsWith('mock_') && !userId.startsWith('reg_') && !userId.startsWith('11111111')) {
    try {
      await supabase.from('profiles').update({
        updated_at: new Date().toISOString()
      }).eq('id', userId);
    } catch (e) {
      console.warn('Supabase profile timestamp update:', e.message);
    }
  }

  return {
    success: true,
    message: `Đã đổi mật khẩu thành công cho ${userEmail || userId}`,
    newPassword: cleanPass
  };
}

// ------------------------------------------------------------------------------
// 7. ADMIN KHÓA HOẶC MỞ KHÓA TÀI KHOẢN NGƯỜI DÙNG
// ------------------------------------------------------------------------------
export async function toggleUserActiveStatus(userId, isActive) {
  if (!userId) throw new Error('Thiếu ID người dùng cần thay đổi trạng thái.');

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Cập nhật trạng thái tài khoản thất bại: ${error.message}`);
    }
    return data;
  }

  return { id: userId, is_active: isActive };
}
