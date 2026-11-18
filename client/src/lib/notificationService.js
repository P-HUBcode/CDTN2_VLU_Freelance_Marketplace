import { supabase, isSupabaseConfigured } from './supabase';

// ==============================================================================
// STUDENTHUB - NOTIFICATION SERVICE (SPRINT 3.3 & FREELANCE PROJECT NOTIFICATIONS)
// Kết nối trực tiếp Backend API Server + Supabase Realtime & RLS
// Đồng bộ tức thì giữa các trình duyệt (Edge <-> Cốc Cốc <-> Chrome)
// ==============================================================================

const CHANNEL_NAME = 'studenthub_notification_sync';
let notifBroadcast = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    notifBroadcast = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {}

/**
 * 1. Lấy danh sách thông báo của người dùng (Từ Backend API Server + Supabase)
 */
export async function getNotifications(userIdentifier, limit = 30) {
  let serverNotifs = [];
  let cloudNotifs = [];

  const userId = typeof userIdentifier === 'object' ? userIdentifier?.id : userIdentifier;
  const userEmail = typeof userIdentifier === 'object' ? userIdentifier?.email : (userId?.includes('@') ? userId : '');
  const userName = typeof userIdentifier === 'object' ? (userIdentifier?.name || userIdentifier?.user_metadata?.full_name) : '';

  // 1.1 Lấy từ Backend API Server (http://localhost:5000/api/notifications)
  try {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (userEmail) params.append('email', userEmail);
    if (userName) params.append('name', userName);

    const res = await fetch(`http://localhost:5000/api/notifications?${params.toString()}`);
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && Array.isArray(json.data)) {
        serverNotifs = json.data.map(normalizeNotification);
      }
    }
  } catch (err) {
    // Backend offline fallback
  }

  // 1.2 Lấy từ Supabase Cloud (nếu có tài khoản Supabase thật)
  if (isSupabaseConfigured && userId && !userId.startsWith('demo_') && !userId.startsWith('mock_')) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!error && Array.isArray(data)) {
        cloudNotifs = data.map(normalizeNotification);
      }
    } catch (err) {
      console.warn('Lỗi khi fetch notifications từ Supabase:', err.message);
    }
  }

  // Hợp nhất dữ liệu và sắp xếp theo thời gian mới nhất
  const combined = [...serverNotifs, ...cloudNotifs];
  const map = new Map();
  combined.forEach((n) => {
    if (n && n.id && !map.has(String(n.id))) {
      map.set(String(n.id), n);
    }
  });

  const merged = Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  return merged.slice(0, limit);
}

/**
 * 2. Lấy số lượng thông báo chưa đọc
 */
export async function getUnreadNotificationCount(userIdentifier) {
  const notifs = await getNotifications(userIdentifier);
  return notifs.filter((n) => !n.isRead && n.unread).length;
}

/**
 * 3. Đánh dấu một thông báo đã đọc
 */
export async function markNotificationAsRead(notificationId) {
  if (!notificationId) return;

  // 3.1 Cập nhật lên Backend Server
  try {
    await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
    if (notifBroadcast) {
      notifBroadcast.postMessage({ type: 'NOTIFICATION_READ', id: notificationId });
    }
  } catch (e) {}

  // 3.2 Cập nhật lên Supabase nếu là UUID hợp lệ
  if (isSupabaseConfigured && !notificationId.toString().startsWith('notif_')) {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      return true;
    } catch (err) {
      console.warn('Lỗi đánh dấu đã đọc trên Supabase:', err.message);
    }
  }

  return true;
}

/**
 * 4. Đánh dấu tất cả thông báo của người dùng là đã đọc
 */
export async function markAllNotificationsAsRead(userIdentifier) {
  const userId = typeof userIdentifier === 'object' ? userIdentifier?.id : userIdentifier;
  const userEmail = typeof userIdentifier === 'object' ? userIdentifier?.email : (userId?.includes('@') ? userId : '');

  // 4.1 Cập nhật lên Backend Server
  try {
    await fetch(`http://localhost:5000/api/notifications/read-all`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email: userEmail })
    });
    if (notifBroadcast) {
      notifBroadcast.postMessage({ type: 'ALL_NOTIFICATIONS_READ' });
    }
  } catch (e) {}

  // 4.2 Cập nhật lên Supabase
  if (isSupabaseConfigured && userId && !userId.startsWith('demo_') && !userId.startsWith('mock_')) {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
    } catch (err) {
      console.warn('Lỗi đánh dấu tất cả đã đọc trên Supabase:', err.message);
    }
  }

  return true;
}

/**
 * 5. Đăng ký nhận thông báo thời gian thực (Supabase Realtime + BroadcastChannel)
 */
export function subscribeToUserNotifications(userId, onNotificationReceived) {
  const onBroadcast = (event) => {
    if (event.data?.type === 'NEW_NOTIFICATION' && onNotificationReceived) {
      onNotificationReceived(event.data.notification);
    }
  };

  if (notifBroadcast) {
    notifBroadcast.addEventListener('message', onBroadcast);
  }

  let supabaseSub = null;
  if (userId && isSupabaseConfigured && !userId.startsWith('demo_') && !userId.startsWith('mock_')) {
    try {
      const channelName = `user-notifications-${userId}`;
      supabaseSub = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            if (payload && payload.new) {
              const normalized = normalizeNotification(payload.new);
              if (onNotificationReceived) {
                onNotificationReceived(normalized);
              }
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Lỗi khởi tạo Supabase Realtime channel:', err);
    }
  }

  return {
    unsubscribe: () => {
      if (notifBroadcast) {
        notifBroadcast.removeEventListener('message', onBroadcast);
      }
      if (supabaseSub) {
        try {
          supabase.removeChannel(supabaseSub);
        } catch (e) {}
      }
    }
  };
}

/**
 * Helper: Chuẩn hóa dữ liệu thông báo
 */
export function normalizeNotification(item) {
  if (!item) return null;
  return {
    id: item.id,
    userId: item.user_id || item.userId,
    userEmail: item.user_email || item.userEmail,
    type: item.type, // 'new_project' | 'project_delivery' | 'project_completed' | 'new_application' | 'application_status_changed'
    title: item.title,
    message: item.message,
    desc: item.message,
    relatedProjectId: item.related_project_id || item.relatedProjectId,
    relatedApplicationId: item.related_application_id || item.relatedApplicationId,
    relatedJobId: item.related_job_id || item.relatedJobId,
    isRead: Boolean(item.is_read || item.isRead),
    unread: !(item.is_read || item.isRead),
    createdAt: item.created_at || item.createdAt || new Date().toISOString(),
    time: formatTimeAgo(item.created_at || item.createdAt)
  };
}

/**
 * Helper: Format thời gian hiển thị tương đối thân thiện
 */
export function formatTimeAgo(dateString) {
  if (!dateString) return 'Vừa xong';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    const now = new Date();
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 45) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 7) return `${diffDay} ngày trước`;

    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
}
