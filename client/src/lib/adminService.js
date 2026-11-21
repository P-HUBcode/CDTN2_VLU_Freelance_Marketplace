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

  // Fallback thống kê khi không có dữ liệu
  return {
    totalStudents: 0,
    totalEmployers: 0,
    totalJobs: 0,
    totalApplications: 0
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

  // Khi đang kết nối Supabase Cloud mà truy vấn trả về rỗng: Không tự chèn tin mẫu
  if (isSupabaseConfigured) {
    return { jobs: [], totalCount: 0 };
  }

  // Fallback Local Storage (chỉ khi offline)
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
// 5. LẤY DANH SÁCH NGƯỜI DÙNG CHO ADMIN QUẢN TRỊ
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
          isEmailConfirmed: true
        }));
      }
    } catch (err) {
      console.error('Exception getAllUsersForAdmin Supabase:', err);
    }
  }

  // Chỉ sử dụng bộ nhớ cục bộ làm fallback khi KHÔNG kết nối Supabase Cloud
  if (!isSupabaseConfigured) {
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
              isEmailConfirmed: true
            });
          }
        });
      }
    } catch (e) {}
  }

  // Bỏ cơ chế tự chèn dữ liệu demo vào luồng dùng tài khoản thật khi danh sách trống
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
// ------------------------------------------------------------------------------
// 6. ADMIN GỬI YÊU CẦU ĐẶT LẠI MẬT KHẨU CHO NGƯỜI DÙNG QUA SUPABASE AUTH
// ------------------------------------------------------------------------------
export async function adminResetUserPassword({ email }) {
  if (!email || !email.includes('@')) {
    throw new Error('Vui lòng cung cấp địa chỉ email người dùng hợp lệ.');
  }

  // 1. Lấy token xác thực của Admin từ Supabase hoặc Mock Session
  let token = null;
  if (isSupabaseConfigured) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        token = session.access_token;
      }
    } catch (e) {}
  }

  // 2. Gửi lệnh đặt lại mật khẩu đến Backend API (kiểm tra quyền Admin tin cậy và gọi Supabase recovery)
  const res = await fetch('http://localhost:5000/api/admin/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ email: email.trim().toLowerCase() })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Thao tác trên Supabase thất bại.');
  }

  return data;
}

// Giữ alias tương thích nếu có code cũ gọi
export const adminChangeUserPassword = (userId, newPassword, email) =>
  adminResetUserPassword({ email });

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

// ------------------------------------------------------------------------------
// 8. ADMIN XÓA VĨNH VIỄN TÀI KHOẢN NGƯỜI DÙNG QUA BACKEND API
// ------------------------------------------------------------------------------
export async function deleteUserByAdmin(userId, confirmEmail) {
  if (!userId) throw new Error('Thiếu ID tài khoản cần xóa.');
  if (!confirmEmail) throw new Error('Vui lòng nhập email xác nhận.');

  let token = null;
  if (isSupabaseConfigured) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        token = session.access_token;
      }
    } catch (e) {}
  }

  const res = await fetch(`http://localhost:5000/api/admin/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ confirmEmail: confirmEmail.trim().toLowerCase() })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Xóa tài khoản thất bại.');
  }

  // Dọn dẹp cache cục bộ nếu có
  try {
    const rawReg = localStorage.getItem('studenthub_registered_users');
    if (rawReg) {
      const list = JSON.parse(rawReg).filter(u => u.id !== userId && u.email?.toLowerCase() !== confirmEmail.trim().toLowerCase());
      localStorage.setItem('studenthub_registered_users', JSON.stringify(list));
    }
  } catch (e) {}

  return data;
}
