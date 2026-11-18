import { supabase, isSupabaseConfigured } from './supabase';
import { uploadPortfolioImage } from './profileService';
import { formatSalary } from './jobService';

// ==============================================================================
// STUDENTHUB - COMPANY PROFILE SERVICE (SUPABASE POSTGRESQL + STORAGE)
// ==============================================================================

const LOCAL_STORAGE_COMPANY_KEY = 'studenthub_local_company_';
const isUuid = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str));

export const defaultCompanyProfile = {
  id: 'comp_demo_01',
  company_name: 'ABC Media & Entertainment',
  logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop&q=80',
  cover_url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&auto=format&fit=crop&q=80',
  description: 'ABC Media là creative agency trẻ trung, chuyên sản xuất nội dung viral trên TikTok, thiết kế nhận diện thương hiệu truyền thông và marketing số cho các nhãn hàng F&B, thời trang và công nghệ.',
  website: 'https://abcmedia.vn',
  contact_email: 'tuyendung@abcmedia.vn',
  contact_phone: '028 3822 9999',
  location: 'Số 45 Đường D2, Phường 25, Quận Bình Thạnh, TP. Hồ Chí Minh',
  industry: 'Truyền thông & Sáng tạo Nội dung Số',
  company_size: '20 - 50 nhân viên',
  founded_year: '2021',
  is_public: true
};

function getLocalCompany(employerId) {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_COMPANY_KEY}${employerId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveLocalCompany(employerId, data) {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_COMPANY_KEY}${employerId}`, JSON.stringify(data));
  } catch (e) {
    console.warn('Lỗi lưu local company:', e);
  }
}

// ------------------------------------------------------------------------------
// 1. LẤY HỒ SƠ DOANH NGHIỆP CỦA EMPLOYER HIỆN TẠI
// ------------------------------------------------------------------------------
export async function getEmployerCompany(employerId) {
  if (!employerId) return defaultCompanyProfile;

  const cached = getLocalCompany(employerId);

  if (isSupabaseConfigured && isUuid(employerId)) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', employerId)
        .maybeSingle();

      if (!error && data) {
        const merged = {
          ...defaultCompanyProfile,
          ...(cached || {}),
          ...data,
          owner_id: employerId
        };
        saveLocalCompany(employerId, merged);
        return merged;
      }
    } catch (err) {
      console.warn('Lỗi fetch companies từ Supabase, chuyển sang cache cục bộ:', err);
    }
  }

  return cached || { ...defaultCompanyProfile, owner_id: employerId };
}

// ------------------------------------------------------------------------------
// 2. CẬP NHẬT HỒ SƠ DOANH NGHIỆP (UPDATE / UPSERT COMPANIES)
// ------------------------------------------------------------------------------
export async function updateEmployerCompany(employerId, updates) {
  if (!employerId) throw new Error('Không tìm thấy mã nhà tuyển dụng để cập nhật.');

  const cached = getLocalCompany(employerId) || {};
  const payload = {
    ...defaultCompanyProfile,
    ...cached,
    ...updates,
    owner_id: employerId,
    updated_at: new Date().toISOString()
  };

  saveLocalCompany(employerId, payload);

  if (isSupabaseConfigured && isUuid(employerId)) {
    try {
      const { data: existing } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', employerId)
        .maybeSingle();

      let resultError = null;

      if (existing) {
        const { error } = await supabase
          .from('companies')
          .update({
            company_name: updates.company_name,
            logo_url: updates.logo_url,
            cover_url: updates.cover_url,
            description: updates.description,
            website: updates.website,
            contact_email: updates.contact_email,
            contact_phone: updates.contact_phone,
            location: updates.location,
            industry: updates.industry,
            company_size: updates.company_size,
            founded_year: updates.founded_year,
            is_public: updates.is_public !== undefined ? updates.is_public : true,
            updated_at: new Date().toISOString()
          })
          .eq('owner_id', employerId);
        resultError = error;
      } else {
        const { error } = await supabase
          .from('companies')
          .insert([{
            owner_id: employerId,
            company_name: updates.company_name || 'Doanh nghiệp mới',
            logo_url: updates.logo_url,
            cover_url: updates.cover_url,
            description: updates.description,
            website: updates.website,
            contact_email: updates.contact_email,
            contact_phone: updates.contact_phone,
            location: updates.location,
            industry: updates.industry,
            company_size: updates.company_size,
            founded_year: updates.founded_year,
            is_public: updates.is_public !== undefined ? updates.is_public : true
          }]);
        resultError = error;
      }

      if (resultError) {
        console.warn('Lỗi khi lưu company lên Supabase:', resultError.message);
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật company:', err);
    }
  }

  return { success: true, data: payload };
}

// ------------------------------------------------------------------------------
// 3. LẤY HỒ SƠ DOANH NGHIỆP CÔNG KHAI (PUBLIC COMPANY VIEW)
// ------------------------------------------------------------------------------
export async function getPublicCompany(identifier) {
  if (!identifier) return defaultCompanyProfile;

  if (isSupabaseConfigured) {
    try {
      // Tìm theo id hoặc owner_id
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .or(`id.eq.${identifier},owner_id.eq.${identifier}`)
        .maybeSingle();

      if (!error && data) {
        return { ...defaultCompanyProfile, ...data };
      }
    } catch (err) {
      console.warn('Lỗi fetch public company:', err);
    }
  }

  // Fallback: Kiểm tra cache theo identifier hoặc trả về default
  const cached = getLocalCompany(identifier);
  return cached || { ...defaultCompanyProfile, id: identifier };
}

// ------------------------------------------------------------------------------
// 4. LẤY DANH SÁCH VIỆC LÀM CỦA DOANH NGHIỆP (STATUS = PUBLISHED)
// ------------------------------------------------------------------------------
export async function getCompanyJobs(companyId, ownerId) {
  const todayStr = new Date().toISOString().split('T')[0];

  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('jobs')
        .select('*')
        .in('status', ['published', 'active'])
        .or(`deadline.is.null,deadline.gte.${todayStr}`);

      if (companyId) {
        query = query.or(`company_id.eq.${companyId},employer_id.eq.${ownerId || companyId}`);
      } else if (ownerId) {
        query = query.eq('employer_id', ownerId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((j) => ({
          id: j.id,
          title: j.title,
          type: j.job_type,
          location: j.location,
          salary: formatSalary(j.salary_min, j.salary_max),
          skills: Array.isArray(j.skills) ? j.skills : [],
          deadline: j.deadline || 'Đang mở tuyển dụng',
          status: j.status
        }));
      }
    } catch (err) {
      console.warn('Lỗi lấy việc làm của công ty từ Supabase:', err);
    }
  }

  // Fallback: Lấy các việc làm mẫu của ABC Media
  return [
    {
      id: 'job_demo_01',
      title: 'Social Media Content Creator Part-time',
      type: 'Part-time',
      location: 'Quận Bình Thạnh, TP.HCM',
      salary: '3.000.000 – 5.000.000đ/tháng',
      skills: ['TikTok', 'CapCut', 'Canva', 'Content'],
      deadline: '20/11/2026',
      status: 'published'
    },
    {
      id: 'job_demo_02',
      title: 'Video Editor TikTok & CapCut Part-time',
      type: 'Part-time',
      location: 'Quận 1, TP.HCM (hoặc Remote)',
      salary: '4.000.000 – 6.000.000đ/tháng',
      skills: ['Premiere', 'CapCut', 'Sáng tạo'],
      deadline: '25/11/2026',
      status: 'published'
    }
  ];
}

// ------------------------------------------------------------------------------
// 5. TẢI LOGO VÀ COVER DOANH NGHIỆP LÊN SUPABASE STORAGE
// ------------------------------------------------------------------------------
export async function uploadCompanyMedia(file, employerId, type = 'logo') {
  return uploadPortfolioImage(file, employerId || 'employer_demo', `company_${type}`);
}
