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
// 4. LẤY DANH SÁCH NGƯỜI DÙNG CHO ADMIN QUẢN TRỊ
// ------------------------------------------------------------------------------
export async function getAllUsersForAdmin({ role = 'all', search = '', page = 1, pageSize = 20 } = {}) {
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

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Lỗi Supabase getAllUsersForAdmin:', error);
      } else {
        return {
          users: (data || []).map(u => ({
            id: u.id,
            fullName: u.full_name,
            email: u.email,
            phone: u.phone,
            role: u.role,
            avatarUrl: u.avatar_url,
            isActive: u.is_active !== false,
            createdAt: u.created_at
          })),
          totalCount: count || 0
        };
      }
    } catch (err) {
      console.error('Exception getAllUsersForAdmin:', err);
    }
  }

  // Fallback Local Storage
  const mockUsers = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      fullName: 'Nguyễn Minh Anh',
      email: 'student.a@test.vn',
      phone: '0901234567',
      role: 'student',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      isActive: true,
      createdAt: '2026-10-01T08:00:00Z'
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      fullName: 'Trần Thị Bích',
      email: 'student.b@test.vn',
      phone: '0902345678',
      role: 'student',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120',
      isActive: true,
      createdAt: '2026-10-05T09:30:00Z'
    },
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      fullName: 'ABC Media Studio (HR Mai)',
      email: 'employer.a@test.vn',
      phone: '0987654321',
      role: 'employer',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120',
      isActive: true,
      createdAt: '2026-09-20T10:00:00Z'
    },
    {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      fullName: 'TechCorp Solutions',
      email: 'employer.b@test.vn',
      phone: '0911223344',
      role: 'employer',
      avatarUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120',
      isActive: false,
      createdAt: '2026-09-25T14:15:00Z'
    }
  ];

  let filtered = [...mockUsers];
  if (role && role !== 'all') {
    filtered = filtered.filter(u => u.role === role);
  }
  if (search && search.trim()) {
    const s = search.toLowerCase();
    filtered = filtered.filter(u => u.fullName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
  }

  return {
    users: filtered,
    totalCount: filtered.length
  };
}

// ------------------------------------------------------------------------------
// 5. ADMIN KHÓA HOẶC MỞ KHÓA TÀI KHOẢN NGƯỜI DÙNG
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
