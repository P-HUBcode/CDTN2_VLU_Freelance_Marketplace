// ==============================================================================
// STUDENTHUB - PROJECT SERVICE
// Quản lý hợp đồng & dự án freelance, đồng bộ thời gian thực đa trình duyệt
// (Express Backend API + BroadcastChannel + LocalStorage)
// ==============================================================================

const LOCAL_STORAGE_KEY = 'studenthub_projects';
const CHANNEL_NAME = 'studenthub_project_sync';

let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel không khả dụng:', e);
}

// 1. Đọc danh sách projects từ LocalStorage
export function getLocalProjects() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Lỗi đọc local projects:', e);
  }
  return [];
}

// 2. Lưu projects vào LocalStorage & phát tín hiệu Broadcast
export function saveLocalProjects(projectsList) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projectsList));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'SYNC_PROJECTS', projects: projectsList });
    }
  } catch (e) {
    console.warn('Lỗi lưu local projects:', e);
  }
}

// 3. Lấy tất cả projects từ Server API + Local
export async function getProjects() {
  const localList = getLocalProjects();
  let serverProjects = [];

  try {
    const res = await fetch('http://localhost:5000/api/projects');
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        serverProjects = json.data;
      }
    }
  } catch (err) {
    // Backend offline fallback
  }

  // Kết hợp và khử trùng lặp (không nhồi mock projects dùng chung)
  const combined = [...serverProjects, ...localList];
  const map = new Map();
  combined.forEach((p) => {
    if (p && p.id && !map.has(String(p.id))) {
      map.set(String(p.id), p);
    }
  });

  const merged = Array.from(map.values());
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {}

  return merged;
}

// 4. Thuê dịch vụ Freelance (Gửi lên Server API để Cả 2 bên đều nhận được dự án và thông báo)
export async function hireFreelanceService(hireData) {
  try {
    const res = await fetch('http://localhost:5000/api/projects/hire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hireData)
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        const createdProject = json.data;
        // Cập nhật local
        const current = getLocalProjects();
        const updated = [createdProject, ...current.filter((p) => p.id !== createdProject.id)];
        saveLocalProjects(updated);
        return createdProject;
      }
    }
  } catch (err) {
    console.warn('Lỗi gọi API hire service:', err);
  }

  // Fallback local nếu server không phản hồi
  const cleanDeliveryDays = Number(hireData.deliveryDays) || 2;
  let cleanBudget = '250.000đ';
  if (hireData.budget) {
    if (typeof hireData.budget === 'number') {
      cleanBudget = `${new Intl.NumberFormat('vi-VN').format(hireData.budget)}đ`;
    } else if (typeof hireData.budget === 'string') {
      const digits = hireData.budget.replace(/[^0-9]/g, '');
      cleanBudget = digits ? `${new Intl.NumberFormat('vi-VN').format(Number(digits))}đ` : hireData.budget;
    }
  }

  const fallbackProject = {
    id: `proj_${Date.now()}`,
    serviceId: hireData.serviceId,
    title: hireData.serviceTitle,
    client: hireData.employerName || 'Nhà tuyển dụng',
    employerId: hireData.employerId || '',
    employerName: hireData.employerName || 'Nhà tuyển dụng',
    employerEmail: hireData.employerEmail || '',
    studentId: hireData.studentId || '',
    studentName: hireData.studentName || 'Sinh viên Freelancer',
    studentEmail: hireData.studentEmail || '',
    studentAvatar: hireData.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    budget: cleanBudget,
    deadline: `Trong ${cleanDeliveryDays} ngày tới`,
    remainingDays: cleanDeliveryDays,
    progress: 0,
    status: 'in_progress',
    nextTask: 'Bàn giao brief yêu cầu chi tiết',
    tasks: [
      { id: 1, name: 'Thỏa thuận chi tiết & brief dự án', completed: true },
      { id: 2, name: 'Triển khai gói dịch vụ', completed: false },
      { id: 3, name: 'Giao sản phẩm và nghiệm thu giải ngân', completed: false }
    ],
    deliveryFile: '',
    deliveryNote: hireData.note || '',
    createdAt: new Date().toISOString()
  };

  const current = getLocalProjects();
  const updated = [fallbackProject, ...current.filter((p) => p.id !== fallbackProject.id)];
  saveLocalProjects(updated);
  return fallbackProject;
}

// 5. Cập nhật tiến độ dự án (Task checklist, nộp link sản phẩm, duyệt nghiệm thu)
export async function updateProjectProgress(projectId, updates) {
  try {
    const res = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        const current = getLocalProjects();
        const nextList = current.map((p) => (p.id === projectId ? json.data : p));
        saveLocalProjects(nextList);
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Lỗi gọi API update project:', err);
  }

  // Fallback local
  const current = getLocalProjects();
  const nextList = current.map((p) => (p.id === projectId ? { ...p, ...updates } : p));
  saveLocalProjects(nextList);
  return { ...nextList.find((p) => p.id === projectId) };
}

// 6. Đăng ký nhận sự kiện đồng bộ dự án thời gian thực
export function subscribeToProjectSync(callback) {
  const onBroadcast = (event) => {
    if (event.data?.type === 'SYNC_PROJECTS') {
      callback(event.data.projects);
    }
  };

  const onStorage = (event) => {
    if (event.key === LOCAL_STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (Array.isArray(parsed)) callback(parsed);
      } catch (e) {}
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', onBroadcast);
  }
  window.addEventListener('storage', onStorage);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', onBroadcast);
    }
    window.removeEventListener('storage', onStorage);
  };
}
