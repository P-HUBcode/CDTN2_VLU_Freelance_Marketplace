// ==============================================================================
// STUDENTHUB - PROJECT SERVICE
// Quản lý hợp đồng & dự án freelance, đồng bộ thời gian thực đa trình duyệt
// (Express Backend API + BroadcastChannel + LocalStorage cách ly theo User ID)
// ==============================================================================

const CHANNEL_NAME = 'studenthub_project_sync';

let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel không khả dụng:', e);
}

export function getProjectStorageKey(userId) {
  if (!userId) return null;
  return `studenthub_projects_${String(userId).trim().toLowerCase()}`;
}

// 1. Đọc danh sách projects từ LocalStorage theo User ID (Không dùng chung)
export function getLocalProjects(userId) {
  try {
    // Dọn dẹp key dùng chung cũ nếu còn sót
    localStorage.removeItem('studenthub_projects');
    if (!userId) return [];
    const storageKey = getProjectStorageKey(userId);
    if (!storageKey) return [];
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Lỗi đọc local projects:', e);
  }
  return [];
}

// 2. Lưu projects vào LocalStorage & phát tín hiệu Broadcast theo User ID
export function saveLocalProjects(userId, projectsList) {
  try {
    localStorage.removeItem('studenthub_projects');
    if (!userId) return;
    const storageKey = getProjectStorageKey(userId);
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify(projectsList));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'SYNC_PROJECTS', userId: String(userId), projects: projectsList });
    }
  } catch (e) {
    console.warn('Lỗi lưu local projects:', e);
  }
}

// 3. Lấy projects từ Server API + Local của đúng user đang đăng nhập
export async function getProjects(user, token, role) {
  try {
    localStorage.removeItem('studenthub_projects');
  } catch (e) {}

  if (!user || !user.id) {
    return [];
  }

  const userId = user.id;
  const localList = getLocalProjects(userId);
  let serverProjects = [];

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const activeRole = role || user.role || user.user_metadata?.role || 'student';
    const queryParams = new URLSearchParams({
      userId: String(userId),
      email: (user.email || '').trim().toLowerCase(),
      role: String(activeRole)
    });

    const res = await fetch(`http://localhost:5000/api/projects?${queryParams.toString()}`, { headers });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        serverProjects = json.data;
      }
    }
  } catch (err) {
    // Backend offline fallback
  }

  // Nếu cả backend lẫn local đều không có dự án nào thuộc về user -> trả về mảng rỗng
  if (serverProjects.length === 0 && localList.length === 0) {
    saveLocalProjects(userId, []);
    return [];
  }

  // Kết hợp và khử trùng lặp theo ID dự án
  const combined = [...serverProjects, ...localList];
  const map = new Map();
  combined.forEach((p) => {
    if (p && p.id && !map.has(String(p.id))) {
      map.set(String(p.id), p);
    }
  });

  const merged = Array.from(map.values());
  saveLocalProjects(userId, merged);
  return merged;
}

// 4. Thuê dịch vụ Freelance (Gửi lên Server API để Cả 2 bên đều nhận được dự án và thông báo)
export async function hireFreelanceService(hireData, user, token) {
  const currentUserId = user?.id || hireData?.employerId || hireData?.studentId;

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('http://localhost:5000/api/projects/hire', {
      method: 'POST',
      headers,
      body: JSON.stringify(hireData)
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        const createdProject = json.data;
        if (currentUserId) {
          const current = getLocalProjects(currentUserId);
          const updated = [createdProject, ...current.filter((p) => p.id !== createdProject.id)];
          saveLocalProjects(currentUserId, updated);
        }
        const partnerId = hireData?.studentId || hireData?.employerId;
        if (partnerId && partnerId !== currentUserId) {
          const pCurrent = getLocalProjects(partnerId);
          const pUpdated = [createdProject, ...pCurrent.filter((p) => p.id !== createdProject.id)];
          saveLocalProjects(partnerId, pUpdated);
        }
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

  if (currentUserId) {
    const current = getLocalProjects(currentUserId);
    const updated = [fallbackProject, ...current.filter((p) => p.id !== fallbackProject.id)];
    saveLocalProjects(currentUserId, updated);
  }
  const partnerId = hireData?.studentId || hireData?.employerId;
  if (partnerId && partnerId !== currentUserId) {
    const pCurrent = getLocalProjects(partnerId);
    const pUpdated = [fallbackProject, ...pCurrent.filter((p) => p.id !== fallbackProject.id)];
    saveLocalProjects(partnerId, pUpdated);
  }
  return fallbackProject;
}

// 5. Cập nhật tiến độ dự án (Task checklist, nộp link sản phẩm, duyệt nghiệm thu)
export async function updateProjectProgress(projectId, updates, user, token) {
  const currentUserId = user?.id || updates?.userId || updates?.studentId || updates?.employerId;

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = {
      ...updates,
      userId: currentUserId,
      email: user?.email || updates?.email || updates?.studentEmail || updates?.employerEmail,
    };

    const res = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        const updated = json.data;
        const parties = [currentUserId, updated.studentId, updated.employerId].filter(Boolean);
        parties.forEach((pid) => {
          const current = getLocalProjects(pid);
          const nextList = current.map((p) => (p.id === projectId ? updated : p));
          if (!nextList.some((p) => p.id === projectId)) nextList.unshift(updated);
          saveLocalProjects(pid, nextList);
        });
        return updated;
      }
    }
  } catch (err) {
    console.warn('Lỗi gọi API update project:', err);
  }

  // Fallback local
  if (currentUserId) {
    const current = getLocalProjects(currentUserId);
    const nextList = current.map((p) => (p.id === projectId ? { ...p, ...updates } : p));
    saveLocalProjects(currentUserId, nextList);
    return { ...nextList.find((p) => p.id === projectId) };
  }
  return null;
}

// 6. Đăng ký nhận sự kiện đồng bộ dự án thời gian thực
export function subscribeToProjectSync(userId, callback) {
  if (!userId) return () => {};

  const userKey = getProjectStorageKey(userId);

  const onBroadcast = (event) => {
    if (event.data?.type === 'SYNC_PROJECTS') {
      if (String(event.data.userId) === String(userId)) {
        callback(event.data.projects || []);
      }
    }
  };

  const onStorage = (event) => {
    if (event.key === userKey && event.newValue) {
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
