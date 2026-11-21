import { supabase, isSupabaseConfigured } from './supabase';
import { initialServices } from '../data/mockData';

// ==============================================================================
// STUDENTHUB - FREELANCE SERVICES SERVICE
// Hỗ trợ đồng bộ đa tab, đa cửa sổ (BroadcastChannel + LocalStorage + Supabase Cloud)
// ==============================================================================

const LOCAL_STORAGE_KEY = 'studenthub_services';
const CHANNEL_NAME = 'studenthub_freelance_sync';

// Khởi tạo BroadcastChannel dùng chung
let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel không khả dụng, sử dụng storage event fallback:', e);
}

// Helper: Đọc services từ localStorage
export function getLocalServices() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Lỗi đọc local services:', e);
  }
  return isSupabaseConfigured ? [] : initialServices;
}

// Helper: Lưu services vào localStorage
export function saveLocalServices(servicesList) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(servicesList));
    // Phát tín hiệu đồng bộ tới các tab khác
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'SYNC_SERVICES', services: servicesList });
    }
  } catch (e) {
    console.warn('Lỗi lưu local services:', e);
  }
}

// ------------------------------------------------------------------------------
// 1. LẤY TẤT CẢ CÁC GÓI DỊCH VỤ FREELANCE
// Kết hợp: Backend API Server (http://localhost:5000) + LocalStorage + Supabase Cloud + Mẫu ban đầu
// Cho phép đồng bộ xuyên suốt giữa các trình duyệt khác nhau (Edge <-> Cốc Cốc <-> Chrome)
// ------------------------------------------------------------------------------
export async function getFreelanceServices() {
  const localList = getLocalServices();
  let serverServices = [];
  let cloudServices = [];

  // 1. Fetch từ Backend Express Server (Trung gian đồng bộ xuyên trình duyệt)
  try {
    const res = await fetch('http://localhost:5000/api/freelance');
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        serverServices = json.data;
      }
    }
  } catch (err) {
    // Backend chưa chạy hoặc lỗi mạng, tiếp tục dùng local và cloud
  }

  // 2. Fetch từ Supabase Cloud (nếu có cấu hình)
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('student_projects')
        .select('*, student:profiles(full_name, avatar_url, university)')
        .eq('role', 'freelance_service')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        cloudServices = data.map((item) => {
          const tech = item.technologies || {};
          return {
            id: item.id,
            title: item.title,
            studentName: tech.studentName || item.student?.full_name || 'Sinh viên Freelancer',
            studentUniversity: tech.studentUniversity || item.student?.university || 'Đại học TP.HCM',
            studentAvatar: tech.studentAvatar || item.student?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
            category: tech.category || 'Design',
            rating: tech.rating || 5.0,
            reviewsCount: tech.reviewsCount || 1,
            startingPrice: Number(tech.startingPrice) || 200000,
            deliveryDays: Number(tech.deliveryDays) || 2,
            skills: Array.isArray(tech.skills) ? tech.skills : ['Freelance', 'Canva'],
            image: item.image_url || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&auto=format&fit=crop&q=80',
            description: item.description || '',
            includes: Array.isArray(tech.includes) ? tech.includes : []
          };
        });
      }
    } catch (err) {
      console.warn('Lỗi fetch freelance services từ Supabase:', err.message);
    }
  }

  // Hợp nhất: Server trung tâm -> Cục bộ -> Cloud DB (Không tự chèn mẫu ban đầu khi dùng Supabase thật)
  const combined = isSupabaseConfigured
    ? [...serverServices, ...localList, ...cloudServices]
    : [...serverServices, ...localList, ...cloudServices, ...initialServices];
  // Khử trùng lặp theo ID
  const map = new Map();
  combined.forEach((s) => {
    if (s && s.id && !map.has(String(s.id))) {
      map.set(String(s.id), s);
    }
  });

  const merged = Array.from(map.values());
  // Đảm bảo localStorage luôn lưu danh sách đầy đủ nhất
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {}

  return merged;
}

// ------------------------------------------------------------------------------
// 2. TẠO GÓI DỊCH VỤ FREELANCE MỚI
// Đồng bộ tức thời lên Backend Server (cho Cốc Cốc, Edge, Chrome cùng thấy ngay)
// ------------------------------------------------------------------------------
export async function createFreelanceService(serviceForm, currentUser = {}, user = null) {
  const serviceId = `srv_${Date.now()}`;
  const newService = {
    id: serviceId,
    title: serviceForm.title.trim(),
    studentId: user?.id || currentUser?.id || `std_${(currentUser?.name || 'student').toLowerCase().replace(/\s+/g, '_')}`,
    studentEmail: currentUser?.email || user?.email || '',
    studentName: currentUser?.name || user?.user_metadata?.full_name || 'Nguyễn Minh Anh',
    studentUniversity: currentUser?.university ? (currentUser.university.includes('UEH') ? 'UEH' : currentUser.university) : 'UEH',
    studentAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    category: serviceForm.category || 'Design',
    rating: 5.0,
    reviewsCount: 1,
    startingPrice: parseInt(serviceForm.startingPrice, 10) || 250000,
    deliveryDays: parseInt(serviceForm.deliveryDays, 10) || 2,
    skills: Array.isArray(serviceForm.skills) ? serviceForm.skills : (serviceForm.skillsString || '').split(',').map(s => s.trim()).filter(Boolean),
    image: serviceForm.image || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600&auto=format&fit=crop&q=80',
    description: serviceForm.description || 'Dịch vụ freelance chuyên nghiệp, hoàn thành nhanh chóng và cam kết chất lượng.',
    includes: Array.isArray(serviceForm.includes) ? serviceForm.includes : (serviceForm.includesText || '').split('\n').filter(Boolean)
  };

  // 1. Lưu ngay vào LocalStorage và phát thông điệp Broadcast trong cùng trình duyệt
  const currentLocal = getLocalServices();
  const updatedList = [newService, ...currentLocal.filter(s => s.id !== serviceId)];
  saveLocalServices(updatedList);

  // 2. Đồng bộ lên Backend Express Server (http://localhost:5000/api/freelance)
  // Đây là cầu nối giúp trình duyệt khác (Cốc Cốc, Chrome) nhận ngay bài viết từ Edge!
  try {
    fetch('http://localhost:5000/api/freelance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newService)
    }).catch((err) => console.warn('Lỗi gọi API backend freelance:', err));
  } catch (e) {
    console.warn('Lỗi gửi service lên backend:', e);
  }

  // 3. Nếu đăng nhập Supabase, lưu thêm vào bảng student_projects trên Cloud
  const isRealUser = isSupabaseConfigured && user?.id && !user.id.startsWith('demo_');
  if (isRealUser) {
    try {
      const payload = {
        student_id: user.id,
        title: newService.title,
        description: newService.description,
        image_url: newService.image,
        role: 'freelance_service',
        technologies: {
          category: newService.category,
          startingPrice: newService.startingPrice,
          deliveryDays: newService.deliveryDays,
          skills: newService.skills,
          includes: newService.includes,
          studentName: newService.studentName,
          studentUniversity: newService.studentUniversity,
          studentAvatar: newService.studentAvatar,
          rating: newService.rating,
          reviewsCount: newService.reviewsCount
        }
      };

      const { data: dbItem, error } = await supabase
        .from('student_projects')
        .insert(payload)
        .select()
        .single();

      if (!error && dbItem) {
        newService.id = dbItem.id;
        // Cập nhật lại ID thực tế từ database
        const refreshedList = [newService, ...currentLocal.filter(s => s.id !== serviceId)];
        saveLocalServices(refreshedList);
      }
    } catch (e) {
      console.warn('Lỗi lưu service lên Supabase Cloud:', e.message);
    }
  }

  return newService;
}

// ------------------------------------------------------------------------------
// 3. ĐĂNG KÝ LẮNG NGHE ĐỒNG BỘ REAL-TIME GIỮA CÁC TAB
// ------------------------------------------------------------------------------
export function subscribeToFreelanceSync(onSync) {
  if (typeof window === 'undefined') return () => {};

  // Lắng nghe qua BroadcastChannel (nếu hỗ trợ)
  const handleBroadcast = (event) => {
    if (event.data?.type === 'SYNC_SERVICES' && Array.isArray(event.data.services)) {
      onSync(event.data.services);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  // Lắng nghe qua storage event (fallback cho mọi tab cùng origin)
  const handleStorage = (event) => {
    if (event.key === LOCAL_STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (Array.isArray(parsed)) {
          onSync(parsed);
        }
      } catch (e) {}
    }
  };

  window.addEventListener('storage', handleStorage);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
  };
}
