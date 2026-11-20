import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import MobileNav from './components/layout/MobileNav';
import Footer from './components/layout/Footer';
import Toast from './components/common/Toast';

// Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import MarketplacePage from './pages/MarketplacePage';
import JobDetailPage from './pages/JobDetailPage';
import FreelanceMarketplacePage from './pages/FreelanceMarketplacePage';
import AppliedJobsPage from './pages/AppliedJobsPage';
import MyProjectsPage from './pages/MyProjectsPage';
import WalletPage from './pages/WalletPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import EmployerDashboardPage from './pages/EmployerDashboardPage';
import PostJobPage from './pages/PostJobPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import { ShieldAlert } from 'lucide-react';

// Modals
import ApplyModal from './pages/ApplyModal';
import ServiceDetailModal from './pages/ServiceDetailModal';
import CreateServiceModal from './pages/CreateServiceModal';
import AuthModal from './components/auth/AuthModal';
import AdminDashboardModal from './components/admin/AdminDashboardModal';
import PublicCompanyModal from './pages/PublicCompanyModal';
import EmailPreviewModal from './components/common/EmailPreviewModal';
import { getPublicCompany, getCompanyJobs } from './lib/companyService';
import { notifyApplicationSubmitted, notifyApplicationStatusChange } from './lib/emailService';
import ChatBox from './components/chat/ChatBox';
import GeminiAIChatWidget from './components/chat/GeminiAIChatWidget';
import { askGeminiAI } from './lib/geminiChatService';

// Auth Context
import { useAuth } from './contexts/AuthContext';

import { getMarketplaceJobs, getLocalSavedJobs } from './lib/jobService';
import {
  getFreelanceServices,
  createFreelanceService,
  subscribeToFreelanceSync
} from './lib/freelanceService';
import {
  getProjects,
  hireFreelanceService,
  updateProjectProgress,
  subscribeToProjectSync
} from './lib/projectService';
import {
  submitJobApplication,
  getStudentApplications,
  getEmployerApplicants,
  updateApplicationStatus
} from './lib/applicationService';
import { isSupabaseConfigured } from './lib/supabase';

// Shared Public Data & Catalogs (Việc làm và dịch vụ công khai)
import {
  currentUser as initialCurrentUser,
  initialJobs,
  initialServices,
  monthlyEarningsChart
} from './data/mockData';

export default function App() {
  const { user, profile, role, setRole, isAuthenticated, loading: authLoading, signOut } = useAuth();

  // Navigation State (Persist across F5 so user stays on active page)
  const [currentView, setCurrentView] = useState(() => {
    try {
      const saved = sessionStorage.getItem('studenthub_current_view');
      if (saved) return saved;
    } catch (e) {}
    return 'landing';
  });

  useEffect(() => {
    try {
      if (currentView) sessionStorage.setItem('studenthub_current_view', currentView);
    } catch (e) {}
  }, [currentView]);

  // Nhận diện đường dẫn riêng /admin (Tách biệt hoàn toàn cổng Admin)
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return typeof window !== 'undefined' && (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin'));
  });

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminRoute(window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigateToHome = () => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
    if (role === 'admin') {
      setRole('student');
    }
    setCurrentUser(initialCurrentUser);
    try {
      localStorage.removeItem('studenthub_current_user');
      localStorage.removeItem('studenthub_mock_session');
    } catch (e) {}
    setCurrentView('dashboard');
  };

  const [searchQuery, setSearchQuery] = useState('');

  // App Data State (Initialized with localStorage persistence or mock data)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('studenthub_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        // Tách biệt hoàn toàn cổng Admin: Nếu dữ liệu lưu dính nhãn Admin, bỏ qua và dùng profile Sinh viên mặc định
        if (parsed.role === 'admin' || parsed.name?.includes('Admin') || parsed.name?.includes('Quản trị viên')) {
          localStorage.removeItem('studenthub_current_user');
          return initialCurrentUser;
        }
        const savedBalance = localStorage.getItem('studenthub_wallet_balance');
        if (savedBalance !== null) {
          parsed.availableBalance = parseInt(savedBalance, 10);
        }
        return parsed;
      }
      const savedBalance = localStorage.getItem('studenthub_wallet_balance');
      if (savedBalance !== null) {
        return {
          ...initialCurrentUser,
          availableBalance: parseInt(savedBalance, 10) || initialCurrentUser.availableBalance
        };
      }
    } catch (e) {
      console.warn('Lỗi đọc current_user từ localStorage:', e);
    }
    return initialCurrentUser;
  });

  // Đồng bộ thông tin currentUser với AuthContext, đảm bảo Sinh viên hiển thị đúng tên và không dính nhãn Admin
  useEffect(() => {
    // 1. Khi ở trang người dùng (không phải /admin), nếu thông tin có dính Admin, chuyển ngay về Sinh viên
    if (!isAdminRoute && (role === 'admin' || profile?.role === 'admin' || user?.user_metadata?.role === 'admin')) {
      setCurrentUser((prev) => ({
        ...initialCurrentUser,
        availableBalance: prev.availableBalance || initialCurrentUser.availableBalance
      }));
      return;
    }

    // 2. Nếu profile hợp lệ và không phải Admin
    if (profile && profile.full_name && !profile.full_name.includes('Admin') && !profile.full_name.includes('Quản trị viên')) {
      const isDemo = profile.email?.includes('demo') || profile.id?.startsWith('demo_');
      setCurrentUser((prev) => ({
        ...prev,
        id: profile.id || user?.id,
        name: profile.full_name,
        email: profile.email || prev.email,
        role: profile.role || role || 'student',
        university: profile.university || prev.university || 'Trường Đại học',
        projectsCompleted: isDemo ? (prev.projectsCompleted || 12) : 0,
        reviewsCount: isDemo ? (prev.reviewsCount || 18) : 0,
        totalEarnings: isDemo ? (prev.totalEarnings || '18.500.000đ') : '0đ',
        earningsMonth: isDemo ? (prev.earningsMonth || '4.800.000đ') : '0đ',
        availableBalance: isDemo ? (prev.availableBalance ?? 12500000) : 0
      }));
    } else if (user?.user_metadata?.full_name && !user.user_metadata.full_name.includes('Admin') && !user.user_metadata.full_name.includes('Quản trị viên')) {
      const isDemo = user.email?.includes('demo') || user.id?.startsWith('demo_');
      setCurrentUser((prev) => ({
        ...prev,
        id: user.id,
        name: user.user_metadata.full_name,
        email: user.email || prev.email,
        role: role || 'student',
        projectsCompleted: isDemo ? (prev.projectsCompleted || 12) : 0,
        reviewsCount: isDemo ? (prev.reviewsCount || 18) : 0,
        totalEarnings: isDemo ? (prev.totalEarnings || '18.500.000đ') : '0đ',
        earningsMonth: isDemo ? (prev.earningsMonth || '4.800.000đ') : '0đ',
        availableBalance: isDemo ? (prev.availableBalance ?? 12500000) : 0
      }));
    } else {
      setCurrentUser((prev) => {
        if (prev.name?.includes('Admin') || prev.name?.includes('Quản trị viên') || prev.role === 'admin') {
          return {
            ...initialCurrentUser,
            availableBalance: prev.availableBalance || initialCurrentUser.availableBalance
          };
        }
        return prev;
      });
    }
  }, [profile, user, role, isAuthenticated, isAdminRoute]);

  const [jobs, setJobs] = useState(() => {
    try {
      const local = getLocalSavedJobs();
      if (local && local.length > 0) {
        const combined = [...local, ...initialJobs];
        return Array.from(new Map(combined.map((j) => [String(j.id), j])).values());
      }
    } catch (e) {}
    return initialJobs;
  });

  const [services, setServices] = useState(() => {
    try {
      const saved = localStorage.getItem('studenthub_services');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Lỗi đọc services từ localStorage:', e);
    }
    return initialServices;
  });

  // Lắng nghe tín hiệu đồng bộ dịch vụ giữa các tab / cửa sổ thời gian thực
  useEffect(() => {
    const unsubscribe = subscribeToFreelanceSync((updatedServices) => {
      if (Array.isArray(updatedServices) && updatedServices.length > 0) {
        setServices(updatedServices);
      }
    });
    return unsubscribe;
  }, []);

  // Khi người dùng chuyển sang trang "Thuê dịch vụ sinh viên" (freelance):
  // Luôn chủ động re-fetch danh sách mới nhất để đảm bảo có ngay bài viết mà sinh viên vừa đăng ở trình duyệt khác (Cốc Cốc <-> Edge)
  useEffect(() => {
    if (currentView === 'freelance') {
      getFreelanceServices().then((latest) => {
        if (Array.isArray(latest) && latest.length > 0) {
          setServices(latest);
        }
      });
      // Định kỳ kiểm tra bài viết mới mỗi 3 giây khi ở trang freelance
      const pollTimer = setInterval(() => {
        getFreelanceServices().then((latest) => {
          if (Array.isArray(latest) && latest.length > 0) {
            setServices(latest);
          }
        });
      }, 3000);
      return () => clearInterval(pollTimer);
    }
  }, [currentView]);

  // Helper lấy key lưu trữ tin nhắn phân tách theo từng tài khoản (chỉ lưu theo User ID hoặc Email riêng biệt)
  const getChatStorageKey = (currentUserObj, currentRole) => {
    if (currentUserObj?.id) return `studenthub_conversations_${currentUserObj.id}`;
    if (currentUserObj?.email) return `studenthub_conversations_${currentUserObj.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    return null; // Không dùng key dùng chung để tránh rò rỉ dữ liệu giữa các tài khoản
  };

  // Dọn dẹp triệt để các key localStorage dùng chung cũ gây rò rỉ dữ liệu giữa các tài khoản
  useEffect(() => {
    try {
      localStorage.removeItem('studenthub_conversations');
      localStorage.removeItem('studenthub_conversations_default');
      localStorage.removeItem('studenthub_conversations_role_student');
      localStorage.removeItem('studenthub_conversations_role_employer');
    } catch (e) {}
  }, []);

  // Lắng nghe tin nhắn real-time giữa các tab qua BroadcastChannel
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const chatChannel = new BroadcastChannel('studenthub_chat_sync');
      chatChannel.onmessage = (event) => {
        if (event.data?.type === 'NEW_CHAT_MSG') {
          const { senderId, senderName, senderAvatar, senderRole, targetName, message } = event.data;

          // Bỏ qua nếu tin nhắn do chính tab này phát ra
          const myCurrentId = user?.id || role;
          if (senderId && myCurrentId && senderId === myCurrentId) return;

          // Tự động bật mở chat (nếu đang đóng thì hiện bong bóng chat thông báo)
          setIsChatBoxOpen(true);

          setConversations((prev) => {
            // Đối với Tab nhận, người gửi tin chính là đối tác hội thoại (partnerName)
            const partnerName = senderName || 'Người liên hệ';
            const convIndex = prev.findIndex(
              (c) =>
                c.name.toLowerCase() === partnerName.toLowerCase() ||
                (targetName && c.name.toLowerCase() === targetName.toLowerCase())
            );
            const incomingMsg = {
              ...message,
              sender: 'them',
              senderId: senderId || message?.senderId,
              senderName: senderName || message?.senderName,
              senderAvatar: senderAvatar || message?.senderAvatar,
              senderRole: senderRole || message?.senderRole
            };

            let updated;
            if (convIndex >= 0) {
              updated = [...prev];
              const target = updated[convIndex];
              if (!target.messages.some((m) => m.id === incomingMsg.id)) {
                updated[convIndex] = {
                  ...target,
                  messages: [...target.messages, incomingMsg]
                };
              }
            } else {
              const newConv = {
                id: `conv_${senderId || Date.now()}`,
                name: partnerName,
                jobTitle: senderRole === 'employer' ? 'Nhà tuyển dụng' : 'Ứng viên sinh viên',
                avatar: senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                online: true,
                messages: [incomingMsg]
              };
              updated = [newConv, ...prev];
            }

            try {
              const key = getChatStorageKey(user, role);
              if (key) localStorage.setItem(key, JSON.stringify(updated));
            } catch (e) {}

            return updated;
          });
        }
      };
      return () => chatChannel.close();
    }
  }, [user?.id, role, profile?.full_name, currentUser?.name]);

  // Lắng nghe và đồng bộ tin nhắn xuyên trình duyệt (Edge <-> Cốc Cốc) qua Backend API
  useEffect(() => {
    const fetchServerMessages = async () => {
      const currentUserId = user?.id || profile?.id;
      const currentUserEmail = user?.email || profile?.email;
      if (!currentUserId && !currentUserEmail) return;

      try {
        const queryParam = currentUserId ? `userId=${encodeURIComponent(currentUserId)}` : `email=${encodeURIComponent(currentUserEmail)}`;
        const res = await fetch(`http://localhost:5000/api/chat/messages?${queryParam}`);
        if (!res.ok) return;
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data)) {
          setConversations((prev) => {
            let changed = false;
            const updated = [...prev];
            json.data.forEach((serverConv) => {
              const localConvIndex = updated.findIndex(
                (c) => c.id === serverConv.id || c.name.toLowerCase() === serverConv.name.toLowerCase()
              );
              if (localConvIndex >= 0) {
                const localConv = updated[localConvIndex];
                const localMsgIds = new Set(localConv.messages.map((m) => m.id));
                const newServerMsgs = (serverConv.messages || []).filter((m) => !localMsgIds.has(m.id));
                if (newServerMsgs.length > 0) {
                  changed = true;
                  updated[localConvIndex] = {
                    ...localConv,
                    messages: [...localConv.messages, ...newServerMsgs]
                  };
                }
              } else {
                changed = true;
                updated.unshift(serverConv);
              }
            });
            if (changed) {
              try {
                const key = getChatStorageKey(user, role);
                if (key) localStorage.setItem(key, JSON.stringify(updated));
              } catch (e) {}
              return updated;
            }
            return prev;
          });
        }
      } catch (err) {}
    };

    const chatPollTimer = setInterval(fetchServerMessages, 2500);
    return () => clearInterval(chatPollTimer);
  }, [user?.id, user?.email, profile?.id, role]);

  const [selectedJob, setSelectedJob] = useState(initialJobs[0]);
  const [selectedService, setSelectedService] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);

  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('studenthub_projects');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Lỗi đọc projects từ localStorage:', e);
    }
    return [];
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('studenthub_transactions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Lỗi đọc transactions từ localStorage:', e);
    }
    return [];
  });

  const [conversations, setConversations] = useState(() => {
    try {
      let currentSessionUser = null;
      const savedMockAuth = localStorage.getItem('studenthub_mock_session');
      if (savedMockAuth) {
        try {
          const parsed = JSON.parse(savedMockAuth);
          currentSessionUser = parsed.user;
        } catch (e) {}
      }
      const key = getChatStorageKey(currentSessionUser, null);
      if (key) {
        const saved = localStorage.getItem(key);
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Lỗi đọc conversations từ localStorage:', e);
    }
    return [];
  });

  const [applicants, setApplicants] = useState(() => {
    try {
      const saved = localStorage.getItem('studenthub_applicants');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Lỗi đọc applicants từ localStorage:', e);
    }
    return [];
  });

  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('studenthub_bookmarked_ids');
      if (saved) return new Set(JSON.parse(saved));
    } catch (e) {}
    return new Set();
  });

  // Persist State to LocalStorage on changes
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('studenthub_current_user', JSON.stringify(currentUser));
      }
    } catch (e) {
      console.warn('Lỗi lưu current_user:', e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('studenthub_applicants', JSON.stringify(applicants));
    } catch (e) {
      console.warn('Lỗi lưu applicants:', e);
    }
  }, [applicants]);

  useEffect(() => {
    try {
      localStorage.setItem('studenthub_bookmarked_ids', JSON.stringify([...bookmarkedIds]));
    } catch (e) {}
  }, [bookmarkedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('studenthub_projects', JSON.stringify(projects));
    } catch (e) {
      console.warn('Lỗi lưu projects:', e);
    }
  }, [projects]);

  // Đồng bộ dự án thời gian thực giữa các trình duyệt (Backend API + BroadcastChannel)
  useEffect(() => {
    // 1. Fetch danh sách dự án mới nhất từ server
    getProjects().then((latest) => {
      if (Array.isArray(latest) && latest.length > 0) {
        setProjects(latest);
      }
    });

    // 2. Lắng nghe BroadcastChannel
    const unsubscribe = subscribeToProjectSync((updatedProjects) => {
      if (Array.isArray(updatedProjects) && updatedProjects.length > 0) {
        setProjects(updatedProjects);
      }
    });

    // 3. Polling định kỳ mỗi 3 giây để đảm bảo tài khoản được thuê (ở trình duyệt khác) nhận ngay lập tức
    const timer = setInterval(() => {
      getProjects().then((latest) => {
        if (Array.isArray(latest) && latest.length > 0) {
          setProjects(latest);
        }
      });
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  // Tự động giải ngân thù lao vào Ví sinh viên khi dự án hoàn thành nghiệm thu (đồng bộ kể cả khi Client duyệt ở trình duyệt khác)
  useEffect(() => {
    if (role !== 'student') return;
    try {
      const creditedRaw = localStorage.getItem('studenthub_credited_projects') || '[]';
      const creditedIds = new Set(JSON.parse(creditedRaw));
      let newlyCreditedAmount = 0;
      const newTransactions = [];

      projects.forEach((proj) => {
        if (proj.status === 'completed' && !creditedIds.has(proj.id)) {
          creditedIds.add(proj.id);
          const rawBudget = proj.budget || '0';
          const numeric = parseInt(rawBudget.replace(/[^0-9]/g, ''), 10) || 0;
          if (numeric > 0) {
            newlyCreditedAmount += numeric;
            newTransactions.push({
              id: `tx_payout_${proj.id}`,
              jobTitle: `Thù lao: ${proj.title}`,
              client: proj.client || proj.employerName || 'Khách hàng Hợp đồng',
              date: 'Hôm nay',
              amount: `+${new Intl.NumberFormat('vi-VN').format(numeric)}đ`,
              status: 'completed'
            });
          }
        }
      });

      if (newlyCreditedAmount > 0) {
        localStorage.setItem('studenthub_credited_projects', JSON.stringify(Array.from(creditedIds)));
        setCurrentUser((prev) => ({
          ...prev,
          availableBalance: (prev.availableBalance || 0) + newlyCreditedAmount
        }));
        if (newTransactions.length > 0) {
          setTransactions((prev) => [...newTransactions, ...prev]);
        }
        showToastMsg(`🎉 Chúc mừng! Bạn nhận được +${new Intl.NumberFormat('vi-VN').format(newlyCreditedAmount)}đ vào Ví từ dự án đã nghiệm thu!`);
      }
    } catch (e) {
      console.warn('Lỗi auto credit escrow payout:', e);
    }
  }, [projects, role]);

  useEffect(() => {
    try {
      localStorage.setItem('studenthub_transactions', JSON.stringify(transactions));
    } catch (e) {
      console.warn('Lỗi lưu transactions:', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      if (currentUser?.availableBalance !== undefined) {
        localStorage.setItem('studenthub_wallet_balance', String(currentUser.availableBalance));
      }
    } catch (e) {
      console.warn('Lỗi lưu wallet_balance:', e);
    }
  }, [currentUser?.availableBalance]);

  // Đồng bộ hòm thư tin nhắn khi tài khoản (User / Role) thay đổi (đăng nhập / đăng xuất)
  useEffect(() => {
    const key = getChatStorageKey(user, role);
    if (!key) {
      setConversations([]);
      return;
    }
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setConversations(JSON.parse(saved));
      } else {
        setConversations([]);
      }
    } catch (e) {
      console.warn('Lỗi load conversations theo tài khoản:', e);
      setConversations([]);
    }
  }, [user?.id, user?.email, role]);

  // Tự động lưu tin nhắn vào phân vùng riêng của tài khoản hiện tại
  useEffect(() => {
    const key = getChatStorageKey(user, role);
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(conversations));
    } catch (e) {
      console.warn('Lỗi lưu conversations:', e);
    }
  }, [conversations, user?.id, user?.email, role]);

  // Modals State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showCreateServiceModal, setShowCreateServiceModal] = useState(false);
  const [authModalState, setAuthModalState] = useState({ isOpen: false, mode: 'login' });
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [activeChatEmployerName, setActiveChatEmployerName] = useState(null);
  const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);

  // Public Company Modal State (For Student & Public viewing)
  const [viewingCompany, setViewingCompany] = useState(null);
  const [viewingCompanyJobs, setViewingCompanyJobs] = useState([]);

  const handleViewCompany = async (jobOrCompany) => {
    try {
      const companyId = jobOrCompany?.company_id || jobOrCompany?.companyId || jobOrCompany?.id || jobOrCompany?.company;
      const ownerId = jobOrCompany?.employer_id || jobOrCompany?.employerId;
      const comp = await getPublicCompany(companyId || ownerId);
      const cJobs = await getCompanyJobs(comp?.id, comp?.owner_id);
      setViewingCompany(comp);
      setViewingCompanyJobs(cJobs);
    } catch (e) {
      console.warn('Lỗi xem công ty:', e);
    }
  };

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Sync profile when auth state updates
  useEffect(() => {
    if (profile) {
      setCurrentUser((prev) => ({
        ...prev,
        name: profile.full_name || prev.name,
        email: profile.email || prev.email,
        avatar: profile.avatar_url || prev.avatar,
        role: profile.role || role,
        university: profile.university || prev.university,
        bio: profile.bio || prev.bio,
        location: profile.location || prev.location
      }));
    }
  }, [profile, role]);

  // Sync Marketplace Jobs (Supabase Cloud hoặc Persistent Storage)
  useEffect(() => {
    async function loadMarketplaceJobsFromDB() {
      try {
        const res = await getMarketplaceJobs({ page: 1, pageSize: 20 });
        if (res && res.jobs && res.jobs.length > 0) {
          setJobs(res.jobs);
        }
      } catch (err) {
        console.warn('Không thể fetch jobs ban đầu:', err.message);
      }
    }
    loadMarketplaceJobsFromDB();
  }, [user, role, currentView]);

  // Sync Student Applications từ Supabase Database
  const [loadingApplications, setLoadingApplications] = useState(false);
  useEffect(() => {
    async function loadApplications() {
      const currentId = user?.id;
      if (!currentId) {
        setAppliedJobs([]);
        return;
      }
      setLoadingApplications(true);
      try {
        const apps = await getStudentApplications(currentId);
        if (Array.isArray(apps)) {
          setAppliedJobs(apps);

            // Tự động tạo Project trong "Công việc của tôi" cho các đơn đã trúng tuyển (accepted / hired)
            const hiredApps = apps.filter((a) => a.status === 'accepted' || a.status === 'hired');
            if (hiredApps.length > 0) {
              const hiredProjects = hiredApps.map((a) => ({
                id: `proj_hired_${a.id}`,
                title: a.jobTitle,
                client: a.company,
                clientAvatar: a.companyLogo,
                budget: a.salary,
                deadline: 'Theo thỏa thuận',
                remainingDays: 14,
                progress: 25,
                status: 'in_progress',
                nextTask: 'Nhận phân công công việc & triển khai đợt 1',
                tasks: [
                  { id: 1, name: 'Nhận việc & thỏa thuận chi tiết yêu cầu công việc', completed: true },
                  { id: 2, name: 'Triển khai công việc giai đoạn 1', completed: false },
                  { id: 3, name: 'Nhận phản hồi & chỉnh sửa sản phẩm', completed: false },
                  { id: 4, name: 'Nghiệm thu toàn bộ công việc và nhận thanh toán thù lao', completed: false }
                ],
                files: []
              }));

              setProjects((prev) => {
                const map = new Map(prev.map((p) => [p.id, p]));
                hiredProjects.forEach((hp) => {
                  if (!map.has(hp.id)) map.set(hp.id, hp);
                });
                return Array.from(map.values());
              });
            }
          }
        } catch (e) {
          console.warn('Lỗi load applications từ Supabase:', e.message);
        } finally {
          setLoadingApplications(false);
        }
      }
    loadApplications();
  }, [user?.id, role, currentView]);

  // Role Redirection Helper
  useEffect(() => {
    if (role === 'employer' && currentView === 'dashboard') {
      setCurrentView('employer-dashboard');
    } else if (role === 'student' && currentView === 'employer-dashboard') {
      setCurrentView('dashboard');
    } else if (role === 'admin' && !isAdminRoute) {
      // Nếu đang ở trang web sinh viên (/), chuyển role về student để không hiển thị nhầm giao diện Admin
      setRole('student');
      setCurrentView('dashboard');
    }
  }, [role, isAdminRoute]);

  // Auth Modal Helpers
  const handleOpenAuth = (mode = 'login') => {
    setAuthModalState({ isOpen: true, mode });
  };

  const handleCloseAuth = () => {
    setAuthModalState({ isOpen: false, mode: 'login' });
  };

  // Toggle bookmark on a job
  const handleToggleBookmark = (jobId) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
        showToastMsg('Đã xóa công việc khỏi danh sách lưu.', 'info');
      } else {
        next.add(jobId);
        showToastMsg('Đã lưu công việc vào danh sách yêu thích!');
      }
      return next;
    });
  };

  // Select Job for Detail View
  const handleSelectJob = (job) => {
    setSelectedJob(job);
    setCurrentView('job-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quick Apply (Checks Auth & Role)
  const handleApplyQuick = (job) => {
    setSelectedJob(job);
    if (!isAuthenticated) {
      showToastMsg('Vui lòng đăng nhập tài khoản Sinh viên để nộp hồ sơ.', 'info');
      handleOpenAuth('login');
      return;
    }
    if (role !== 'student') {
      showToastMsg('Chỉ tài khoản Sinh viên mới có quyền nộp đơn ứng tuyển việc làm.', 'warning');
      return;
    }
    setShowApplyModal(true);
  };

  // Submit Job Application (Lưu thật vào Supabase PostgreSQL + Storage & Gửi email tự động)
  const handleSubmitApplication = async (appData) => {
    const rawEmail = appData.studentEmail || user?.email || profile?.email || currentUser.email;
    const studentEmail = (rawEmail && !rawEmail.includes('@test.vn') && !rawEmail.includes('@example.com'))
      ? rawEmail
      : 'phu47008@gmail.com';
    const studentName = appData.studentName || profile?.full_name || currentUser.name || 'Nguyễn Minh Anh';

    const activeUser = user || {
      id: 'demo_student_01',
      role: 'student',
      full_name: studentName,
      email: studentEmail
    };

    const savedApp = await submitJobApplication(appData, activeUser);
    savedApp.studentEmail = studentEmail;
    savedApp.studentName = studentName;

    setAppliedJobs((prev) => [savedApp, ...prev.filter((a) => a.id !== savedApp.id)]);

    // 📧 Tự động gửi email xác nhận nộp hồ sơ thành công (chống spam & lưu trữ hệ thống)
    await notifyApplicationSubmitted({
      to: studentEmail,
      studentName,
      jobTitle: appData.jobTitle || savedApp.jobTitle || 'Vị trí ứng tuyển',
      companyName: appData.company || savedApp.company || 'Doanh nghiệp tuyển dụng',
      applicationId: savedApp.id,
      cvUrl: savedApp.cvUrl
    });

    showToastMsg(`🎉 Ứng tuyển thành công! Đã gửi email xác nhận lưu trữ hồ sơ đến ${studentEmail}.`);
  };

  // Cancel an Application
  const handleCancelApplication = (appId) => {
    if (confirm('Bạn có chắc chắn muốn rút hồ sơ ứng tuyển này?')) {
      setAppliedJobs(appliedJobs.filter((a) => a.id !== appId));
      showToastMsg('Đã rút hồ sơ ứng tuyển.', 'info');
    }
  };

  // Select Service for Service Detail Modal
  const handleSelectService = (service) => {
    setSelectedService(service);
  };

  // Hire a Service
  const handleHireService = async (service) => {
    if (!isAuthenticated) {
      showToastMsg('Vui lòng đăng nhập để tiến hành thuê dịch vụ.', 'info');
      handleOpenAuth('login');
      return;
    }

    // Kiểm tra không cho phép tự thuê dịch vụ do chính mình đăng
    const isOwner = Boolean(
      currentUser && (
        (service.studentId && (currentUser.id === service.studentId || user?.id === service.studentId)) ||
        (service.studentEmail && currentUser.email && service.studentEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
        (service.studentName && currentUser.name && service.studentName.trim().toLowerCase() === currentUser.name.trim().toLowerCase())
      )
    );

    if (isOwner) {
      showToastMsg('Bạn không thể tự nhận/thuê gói dịch vụ do chính mình đăng bán.', 'warning');
      return;
    }

    const employerName = profile?.full_name || currentUser?.name || user?.user_metadata?.full_name || 'Nhà tuyển dụng';
    const employerEmail = profile?.email || currentUser?.email || user?.email || (role === 'employer' ? 'employer.a@test.vn' : '');
    const employerId = user?.id || currentUser?.id || `emp_${Date.now()}`;
    const employerAvatar = profile?.avatar_url || currentUser?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80';

    try {
      // 1. Gọi API thuê dịch vụ lên Server trung tâm (đồng bộ ngay sang trình duyệt của Sinh viên được thuê)
      const createdProject = await hireFreelanceService({
        serviceId: service.id,
        serviceTitle: service.title,
        studentId: service.studentId || '',
        studentName: service.studentName || 'Sinh viên Freelancer',
        studentEmail: service.studentEmail || '',
        studentUniversity: service.studentUniversity || 'Đại học',
        studentAvatar: service.studentAvatar || '',
        employerId,
        employerName,
        employerEmail,
        employerAvatar,
        budget: service.startingPrice,
        deliveryDays: service.deliveryDays || 2
      });

      setProjects((prev) => [createdProject, ...prev.filter((p) => p.id !== createdProject.id)]);
      setSelectedService(null);
      setCurrentView('my-projects');
      showToastMsg(`🎉 Đã tạo hợp đồng dự án! Hệ thống đã chuyển bạn tới trang "Dự án & Tiến độ bàn giao" và gửi thông báo tới sinh viên.`);
      handleOpenChatWithEmployer(service.studentName);
    } catch (err) {
      console.error('Lỗi khi thuê dịch vụ:', err);
      showToastMsg('Lỗi khi gửi yêu cầu thuê dịch vụ.', 'error');
    }
  };

  // Create a new Service Gig (Tự động đồng bộ Supabase Cloud + LocalStorage + Multi-tab Broadcast)
  const handleCreateService = async (newServiceData) => {
    try {
      const created = await createFreelanceService(newServiceData, currentUser, user);
      setServices((prev) => [created, ...prev.filter((s) => s.id !== created.id)]);
      showToastMsg('✨ Gói dịch vụ freelance của bạn đã được đăng thành công lên sàn!');
    } catch (e) {
      console.error('Lỗi khi đăng dịch vụ:', e);
      setServices((prev) => [newServiceData, ...prev.filter((s) => s.id !== newServiceData.id)]);
      showToastMsg('✨ Gói dịch vụ freelance của bạn đã được đăng thành công lên sàn!');
    }
  };

  // Update Project Progress & Handle Escrow Release
  const handleUpdateProjectProgress = async (updatedProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));

    // Đồng bộ cập nhật lên Backend Server API
    try {
      await updateProjectProgress(updatedProject.id, updatedProject);
    } catch (e) {
      console.warn('Lỗi đồng bộ update project:', e);
    }

    if (updatedProject.status === 'completed') {
      showToastMsg(
        role === 'employer'
          ? '🎉 Đã xác nhận nghiệm thu và giải ngân thù lao thành công cho sinh viên!'
          : '🎉 Dự án đã hoàn tất nghiệm thu & đã giải ngân vào Ví!'
      );
    } else if (updatedProject.status === 'pending_review') {
      showToastMsg('🎉 Đã nộp sản phẩm nghiệm thu! Đang chờ Khách hàng kiểm tra & giải ngân.');
    }
  };

  // Withdraw money from Wallet
  const handleWithdrawFunds = (amount) => {
    setCurrentUser((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance - amount
    }));

    const newTx = {
      id: `tx_${Date.now()}`,
      jobTitle: 'Rút tiền về tài khoản ngân hàng',
      client: 'Hệ thống StudentHub',
      date: 'Hôm nay',
      amount: `-${new Intl.NumberFormat('vi-VN').format(amount)}đ`,
      status: 'completed'
    };
    setTransactions([newTx, ...transactions]);
  };

  // Send message in chat (Hỗ trợ đồng bộ Real-time đa Tab và lưu vĩnh viễn theo từng tài khoản)
  const handleSendMessage = (conversationId, text) => {
    const myName = currentUser?.name || profile?.full_name || (role === 'employer' ? 'Nhà tuyển dụng' : 'Nguyễn Minh Anh');
    const myAvatar = profile?.avatar_url || currentUser?.avatar || (role === 'employer' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
    const myId = user?.id || (role === 'employer' ? 'role_employer' : 'role_student');

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: 'me',
      senderId: myId,
      senderName: myName,
      senderAvatar: myAvatar,
      senderRole: role || 'student',
      text,
      time: 'Vừa xong'
    };

    setConversations((prev) => {
      const currentConv = prev.find((c) => c.id === conversationId);
      const updated = prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      });

      try {
        const key = getChatStorageKey(user, role);
        localStorage.setItem(key, JSON.stringify(updated));

        // Phát tín hiệu chat qua BroadcastChannel để Tab cùng trình duyệt nhận được tin nhắn tức thì
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const chatChannel = new BroadcastChannel('studenthub_chat_sync');
          chatChannel.postMessage({
            type: 'NEW_CHAT_MSG',
            senderId: myId,
            senderName: myName,
            senderAvatar: myAvatar,
            senderRole: role || 'student',
            targetName: currentConv?.name,
            conversationId,
            message: newMsg
          });
        }

        const otherMsg = currentConv?.messages?.find((m) => m.senderId && m.senderId !== myId);
        const recipientId = currentConv?.employerId || currentConv?.studentId || otherMsg?.senderId || '';

        // Đồng thời gửi lên Backend Express Server (http://localhost:5000/api/chat/messages)
        // để Edge <-> Cốc Cốc <-> Chrome nhắn tin xuyên trình duyệt không bị rào cản!
        fetch('http://localhost:5000/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: myId,
            senderName: myName,
            senderAvatar: myAvatar,
            senderRole: role || 'student',
            receiverId: recipientId,
            targetName: currentConv?.name,
            conversationId,
            message: newMsg
          })
        }).catch(() => {});
      } catch (e) {}

      return updated;
    });

    // 1. Nếu nhắn tin với Trợ lý AI Gemini tự động của nền tảng
    if (conversationId === 'conv_ai_gemini' || conversationId?.includes('gemini')) {
      (async () => {
        try {
          const aiRes = await askGeminiAI({
            message: text,
            userRole: role,
            userName: myName
          });
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === conversationId) {
                return {
                  ...c,
                  messages: [
                    ...c.messages,
                    {
                      id: `msg_ai_${Date.now()}`,
                      sender: 'them',
                      text: aiRes.reply,
                      time: 'Vừa xong'
                    }
                  ]
                };
              }
              return c;
            })
          );
        } catch (err) {
          console.warn('Lỗi khi chat AI:', err);
        }
      })();
      return;
    }

    // Chỉ giả lập bot phản hồi nếu là 2 cuộc trò chuyện demo ảo ban đầu
    if (conversationId === 'conv_01' || conversationId === 'conv_02') {
      setTimeout(() => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === conversationId) {
              const replies = [
                'Dạ vâng mình đã nhận được tin nhắn, mình sẽ phản hồi chi tiết ngay nhé!',
                'Cảm ơn bạn! Trao đổi rất rõ ràng, mình sẽ cập nhật tiến độ liên tục.',
                'Oke bạn nhé, mình đang tiến hành kiểm tra theo đúng thỏa thuận.'
              ];
              const randomReply = replies[Math.floor(Math.random() * replies.length)];
              return {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: `msg_reply_${Date.now()}`,
                    sender: 'them',
                    text: randomReply,
                    time: 'Vừa xong'
                  }
                ]
              };
            }
            return c;
          })
        );
      }, 1200);
    }
  };

  // Xóa một cuộc trò chuyện cụ thể
  const handleDeleteConversation = (convId) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== convId);
      try {
        const key = getChatStorageKey(user, role);
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    showToastMsg('Đã xóa cuộc trò chuyện.', 'info');
  };

  // Xóa toàn bộ tin nhắn ảo mẫu để làm sạch hộp thư
  const handleClearMockConversations = () => {
    setConversations([]);
    try {
      const key = getChatStorageKey(user, role);
      localStorage.setItem(key, JSON.stringify([]));
      // Xóa luôn trên Backend Server
      fetch('http://localhost:5000/api/chat/clear', { method: 'POST' }).catch(() => {});
    } catch (e) {}
    showToastMsg('Đã làm sạch hộp thư! Giờ bạn có thể nhắn tin với dữ liệu thật.');
  };

  // Jump to chat with a specific employer or student
  const handleOpenChatWithEmployer = (targetName) => {
    if (targetName) {
      setConversations((prev) => {
        const match = prev.find(
          (c) =>
            c.name.toLowerCase().includes(targetName.toLowerCase()) ||
            targetName.toLowerCase().includes(c.name.toLowerCase())
        );
        if (!match) {
          const partnerRole = role === 'employer' ? 'student' : 'employer';
          const partnerJobTitle = role === 'employer' ? 'Sinh viên Freelancer' : 'Nhà tuyển dụng / Doanh nghiệp';
          const partnerAvatar = role === 'employer'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
            : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150';

          const newConv = {
            id: `conv_${Date.now()}`,
            name: targetName,
            jobTitle: partnerJobTitle,
            avatar: partnerAvatar,
            online: true,
            participantIds: [user?.id, partnerRole === 'employer' ? 'role_employer' : 'role_student'].filter(Boolean),
            studentId: role === 'student' ? user?.id : null,
            employerId: role === 'employer' ? user?.id : null,
            messages: [
              {
                id: `msg_init_${Date.now()}`,
                senderId: partnerRole === 'employer' ? 'role_employer' : 'role_student',
                senderName: targetName,
                senderAvatar: partnerAvatar,
                senderRole: partnerRole,
                sender: 'them',
                text: `Chào bạn, mình liên hệ để trao đổi thêm về dịch vụ / công việc nhé!`,
                time: 'Vừa xong'
              }
            ]
          };
          setActiveChatEmployerName(targetName);
          const updated = [newConv, ...prev];
          try {
            const key = getChatStorageKey(user, role);
            localStorage.setItem(key, JSON.stringify(updated));
          } catch (e) {}
          return updated;
        } else {
          setActiveChatEmployerName(match.name);
          return prev;
        }
      });
    }
    // Mở ngay cửa sổ Chat Box nổi góc dưới bên phải (Facebook Messenger)
    setIsChatBoxOpen(true);
    setIsChatMinimized(false);
  };

  // Bật / tắt hoặc thu nhỏ thành bong bóng chat giống Facebook
  const handleToggleChatBox = () => {
    if (!isChatBoxOpen) {
      setIsChatBoxOpen(true);
      setIsChatMinimized(false);
    } else if (isChatMinimized) {
      setIsChatMinimized(false);
    } else {
      setIsChatMinimized(true);
    }
  };

  // Update Applicant status in Employer Kanban (Sync Supabase & Gửi Email tự động)
  const handleUpdateApplicantStatus = async (applicantId, newStatus) => {
    try {
      await updateApplicationStatus(applicantId, newStatus, user);
      setApplicants((prev) =>
        prev.map((a) => (a.id === applicantId ? { ...a, status: newStatus } : a))
      );

      const targetApp = applicants.find((a) => a.id === applicantId);
      const studentEmail = targetApp?.studentEmail || targetApp?.email || 'phu47008@gmail.com';
      const studentName = targetApp?.studentName || targetApp?.name || 'Ứng viên';
      const jobTitle = targetApp?.jobTitle || targetApp?.appliedFor || 'Vị trí công việc';
      const companyName = targetApp?.company || user?.user_metadata?.company_name || 'Doanh nghiệp tuyển dụng';

      // 📧 QUY ĐỊNH: "trừ trạng thái đang xem xét thì không thông báo"
      if (newStatus === 'reviewing' || newStatus === 'pending') {
        showToastMsg('✔ Đã chuyển trạng thái sang "Đang xem xét" (không gửi email theo quy định).', 'info');
      } else if (newStatus === 'interview') {
        await notifyApplicationStatusChange({
          to: studentEmail,
          studentName,
          jobTitle,
          companyName,
          status: 'interview',
          notes: 'Mời bạn tham dự buổi phỏng vấn trực tuyến qua Google Meet.',
          interviewDate: 'Trong 2-3 ngày làm việc tới (Chi tiết phòng họp qua link)',
          interviewType: 'Online qua Google Meet / Trực tiếp tại văn phòng',
          interviewLink: 'https://meet.google.com/shub-interview-room',
          salary: targetApp?.salary || 'Theo thỏa thuận tin tuyển dụng'
        });
        showToastMsg(`📅 Đã gửi email thư mời phỏng vấn tự động đến: ${studentEmail}`);
      } else if (newStatus === 'hired' || newStatus === 'accepted') {
        // Gửi email chúc mừng trúng tuyển
        await notifyApplicationStatusChange({
          to: studentEmail,
          studentName,
          jobTitle,
          companyName,
          status: 'accepted',
          salary: targetApp?.salary || 'Theo thỏa thuận tin tuyển dụng'
        });
        showToastMsg(`🎉 Đã gửi email chúc mừng trúng tuyển đến: ${studentEmail}`);

        // Nếu Nhà tuyển dụng chuyển sang 'hired' hoặc 'accepted' -> Tạo ngay Dự án đồng bộ lên Server
        if (targetApp) {
          try {
            const createdProject = await hireFreelanceService({
              serviceId: `job_${targetApp.jobId || applicantId}`,
              serviceTitle: targetApp.jobTitle || 'Dự án việc làm Part-time',
              studentId: targetApp.studentId || '',
              studentName: targetApp.studentName || 'Sinh viên',
              studentEmail: targetApp.studentEmail || '',
              employerId: user?.id || currentUser?.id || '',
              employerName: targetApp.company || user?.user_metadata?.company_name || 'Doanh nghiệp tuyển dụng',
              employerEmail: user?.email || '',
              budget: targetApp.salary || 'Theo thỏa thuận',
              deliveryDays: 30,
              note: 'Hợp đồng nhận việc chính thức từ đơn ứng tuyển'
            });
            setProjects((prev) => [createdProject, ...prev.filter((p) => p.id !== createdProject.id)]);
            showToastMsg(`🎉 Đã duyệt nhận ứng viên và khởi tạo dự án trong "Dự án & Tiến độ bàn giao"!`);
          } catch (err) {
            console.warn('Lỗi tạo project khi duyệt nhận ứng viên:', err);
          }
        }
      } else if (newStatus === 'rejected') {
        await notifyApplicationStatusChange({
          to: studentEmail,
          studentName,
          jobTitle,
          companyName,
          status: 'rejected',
          notes: 'Hồ sơ chưa phù hợp với đợt tuyển dụng này.'
        });
        showToastMsg(`📧 Đã gửi email thông báo kết quả đến: ${studentEmail}`);
      }
    } catch (e) {
      console.warn('Lỗi update applicant status:', e.message);
    }
  };

  // Post a new job by employer (Re-fetch from Supabase / Persistent Storage as single source of truth)
  const handlePostJob = async (newJob) => {
    try {
      const res = await getMarketplaceJobs({ page: 1, pageSize: 20 });
      if (res && res.jobs && res.jobs.length > 0) {
        setJobs(res.jobs);
      } else if (newJob) {
        setJobs((prev) => [newJob, ...prev]);
      }
    } catch (e) {
      if (newJob) setJobs((prev) => [newJob, ...prev]);
    }
    setCurrentView(role === 'employer' ? 'employer-dashboard' : 'marketplace');
  };

  // Admin delete job
  const handleDeleteJob = (jobId) => {
    setJobs(jobs.filter((j) => j.id !== jobId));
  };

  // Global search submit: Tự động điều hướng thông minh theo ngữ cảnh tìm kiếm
  const handleGlobalSearch = () => {
    const q = (searchQuery || '').trim().toLowerCase();
    const isFreelanceKeyword = [
      'freelance', 'dịch vụ', 'dich vu', 'kỹ năng', 'ky nang',
      'canva', 'thiết kế', 'thiet ke', 'design', 'tiktok',
      'video', 'edit', 'content', 'bài viết', 'seo', 'gia sư', 'tutor', 'excel', 'nhập liệu'
    ].some((k) => q.includes(k));

    if (currentView === 'freelance' || isFreelanceKeyword) {
      setCurrentView('freelance');
    } else {
      setCurrentView('marketplace');
    }
  };

  // Loading Screen while Auth initializes
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Đang khởi tạo phiên làm việc StudentHub...</p>
      </div>
    );
  }

  // Dynamic Real Counts for Navigation Badges (khớp chính xác số lượng bài/tin ở trong)
  const unreadMessagesCount = conversations.filter((c) => c.unread).length;
  const activeProjectsCount = projects.filter((p) => p.status === 'in_progress').length;
  const appliedCount = appliedJobs.length;
  const jobsCount = jobs.length;
  const freelanceCount = services.length;
  const employerApplicantsCount = applicants.length;
  const employerJobsCount = jobs.filter(
    (j) => j.employerId === user?.id || j.employer_id === user?.id || (role === 'employer' && !user)
  ).length;
  const adminPendingJobsCount = jobs.filter(
    (j) => j.status === 'pending' || j.status === 'draft'
  ).length;

  // --------------------------------------------------------------------------
  // CỔNG RIÊNG DÀNH CHO ADMIN (TRUY CẬP TẠI /admin)
  // --------------------------------------------------------------------------
  if (isAdminRoute) {
    if (isAuthenticated && role === 'admin') {
      return (
        <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
          <Toast toast={toast} onClose={() => setToast(null)} />
          <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-white text-base leading-none">StudentHub Admin Portal</span>
                <span className="text-[10px] text-purple-400 block font-medium mt-0.5">Bảng Điều Khiển Quản Trị Hệ Thống (Super Admin)</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleNavigateToHome}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
              >
                ← Về Trang chủ
              </button>
              <button
                onClick={() => {
                  signOut();
                }}
                className="px-3.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold rounded-xl border border-rose-500/30 transition"
              >
                Đăng xuất Admin
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <AdminDashboardPage onNavigate={handleNavigateToHome} />
          </main>
        </div>
      );
    }

    return (
      <AdminLoginPage
        onNavigateToHome={handleNavigateToHome}
        onAdminLoginSuccess={() => setRole('admin')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#0F172A] font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Notification Banner */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Topbar: Tích hợp toàn bộ Menu điều hướng chính từ Sidebar & Nhóm chức năng */}
      <Topbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        jobsCount={jobsCount}
        freelanceCount={freelanceCount}
        unreadMessagesCount={unreadMessagesCount}
        appliedCount={appliedCount}
        activeProjectsCount={activeProjectsCount}
        employerApplicantsCount={employerApplicantsCount}
        employerJobsCount={employerJobsCount}
        onOpenPostJob={() => {
          if (!isAuthenticated) {
            showToastMsg('Vui lòng đăng nhập tài khoản Nhà tuyển dụng để đăng việc.', 'info');
            handleOpenAuth('login');
            return;
          }
          if (role === 'student') {
            showToastMsg('Chỉ tài khoản Nhà tuyển dụng mới có quyền đăng tin tuyển dụng việc làm. Sinh viên hãy dùng tính năng "Tạo dịch vụ" để đăng kỹ năng nhé!', 'warning');
            return;
          }
          setCurrentView('post-job');
        }}
        onOpenCreateService={() => {
          if (!isAuthenticated) {
            showToastMsg('Vui lòng đăng nhập tài khoản Sinh viên để tạo dịch vụ.', 'info');
            handleOpenAuth('login');
            return;
          }
          setShowCreateServiceModal(true);
        }}
        onOpenAuth={handleOpenAuth}
        onOpenEmailPreview={() => setShowEmailModal(true)}
        onSearchQuery={(q) => {
          setSearchQuery(q);
          setCurrentView('marketplace');
        }}
        isChatBoxOpen={isChatBoxOpen}
        isChatMinimized={isChatMinimized}
        onToggleChatBox={handleToggleChatBox}
      />

      {/* Main Content Area (Toàn màn hình thoáng đãng, không bị chiếm diện tích bởi sidebar) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          {/* TRANG 01 – LANDING PAGE */}
          {currentView === 'landing' && (
            <LandingPage
              jobs={jobs}
              onSelectJob={handleSelectJob}
              onNavigate={(view) => setCurrentView(view)}
              onToggleBookmark={handleToggleBookmark}
              bookmarkedIds={bookmarkedIds}
            />
          )}

          {/* TRANG DASHBOARD SINH VIÊN */}
          {currentView === 'dashboard' && (
            <DashboardPage
              currentUser={currentUser}
              jobs={jobs}
              projects={projects}
              appliedJobs={appliedJobs}
              onSelectJob={handleSelectJob}
              onNavigate={setCurrentView}
              onToggleBookmark={handleToggleBookmark}
              bookmarkedIds={bookmarkedIds}
            />
          )}

          {/* TRANG 02 – JOB MARKETPLACE */}
          {currentView === 'marketplace' && (
            <MarketplacePage
              jobs={jobs}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectJob={handleSelectJob}
              onApplyQuick={handleApplyQuick}
              onToggleBookmark={handleToggleBookmark}
              bookmarkedIds={bookmarkedIds}
              onViewCompany={handleViewCompany}
              onNavigate={setCurrentView}
            />
          )}

          {/* TRANG 03 – JOB DETAIL */}
          {currentView === 'job-detail' && (
            <JobDetailPage
              job={selectedJob}
              onBack={() => setCurrentView('marketplace')}
              onApply={() => {
                if (!isAuthenticated) {
                  showToastMsg('Vui lòng đăng nhập tài khoản Sinh viên để nộp hồ sơ.', 'info');
                  handleOpenAuth('login');
                  return;
                }
                if (role === 'employer') {
                  showToastMsg('Tài khoản Nhà tuyển dụng không thể nộp đơn ứng tuyển. Vui lòng chuyển sang tài khoản Sinh viên.', 'warning');
                  return;
                }
                setShowApplyModal(true);
              }}
              onToggleBookmark={handleToggleBookmark}
              isBookmarked={bookmarkedIds.has(selectedJob?.id)}
              isAlreadyApplied={appliedJobs.some((a) => String(a.jobId) === String(selectedJob?.id))}
              onViewCompany={handleViewCompany}
              onOpenChatWithEmployer={handleOpenChatWithEmployer}
            />
          )}

          {/* TRANG 05 – FREELANCE MARKETPLACE */}
          {currentView === 'freelance' && (
            <FreelanceMarketplacePage
              services={services}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectService={handleSelectService}
              onOpenCreateService={() => {
                if (!isAuthenticated) {
                  showToastMsg('Vui lòng đăng nhập để tạo dịch vụ.', 'info');
                  handleOpenAuth('login');
                  return;
                }
                setShowCreateServiceModal(true);
              }}
              onNavigate={setCurrentView}
              currentUser={currentUser}
            />
          )}

          {/* TRANG VIỆC ĐÃ ỨNG TUYỂN */}
          {currentView === 'applied' && (
            <AppliedJobsPage
              appliedJobs={appliedJobs}
              loading={loadingApplications}
              onNavigate={setCurrentView}
              onOpenChatWithEmployer={handleOpenChatWithEmployer}
              onCancelApplication={handleCancelApplication}
            />
          )}

          {/* TRANG CÔNG VIỆC CỦA TÔI / PROJECT MANAGEMENT */}
          {currentView === 'my-projects' && (
            <MyProjectsPage
              projects={projects}
              onUpdateProjectProgress={handleUpdateProjectProgress}
              onOpenChatWithEmployer={handleOpenChatWithEmployer}
              onShowToast={showToastMsg}
              currentUser={currentUser}
              role={role}
            />
          )}

          {/* TRANG THU NHẬP / WALLET */}
          {currentView === 'wallet' && (
            <WalletPage
              currentUser={currentUser}
              transactions={transactions}
              monthlyEarningsChart={monthlyEarningsChart}
              onWithdrawFunds={handleWithdrawFunds}
              onShowToast={showToastMsg}
            />
          )}

          {/* TRANG CHAT (TIN NHẮN) */}
          {currentView === 'messages' && (
            <MessagesPage
              conversations={conversations}
              onSendMessage={handleSendMessage}
              onDeleteConversation={handleDeleteConversation}
              onClearMockConversations={handleClearMockConversations}
              activeChatEmployerName={activeChatEmployerName}
              currentUser={currentUser}
              currentRole={role}
            />
          )}

          {/* TRANG HỒ SƠ CÁ NHÂN */}
          {currentView === 'profile' && (
            <ProfilePage
              currentUser={currentUser}
              onUpdateProfile={setCurrentUser}
              onShowToast={showToastMsg}
            />
          )}

          {/* TRANG NHÀ TUYỂN DỤNG (KANBAN APPLICANTS & JOB MANAGEMENT) */}
          {currentView === 'employer-dashboard' && (
            <EmployerDashboardPage
              applicants={applicants}
              onUpdateApplicantStatus={handleUpdateApplicantStatus}
              onOpenPostJob={() => setCurrentView('post-job')}
              onShowToast={showToastMsg}
              onSelectJob={handleSelectJob}
              onOpenChatWithEmployer={handleOpenChatWithEmployer}
            />
          )}

          {/* TRANG ĐĂNG VIỆC */}
          {currentView === 'post-job' && (
            <PostJobPage
              onPostJob={handlePostJob}
              onCancel={() => setCurrentView(role === 'employer' ? 'employer-dashboard' : 'dashboard')}
              onShowToast={showToastMsg}
            />
          )}

          {/* TRANG HỒ SƠ DOANH NGHIỆP (CHO EMPLOYER) */}
          {currentView === 'company-profile' && (
            <CompanyProfilePage
              onNavigate={setCurrentView}
              onShowToast={showToastMsg}
              onSelectJob={handleSelectJob}
            />
          )}

          {/* TRANG QUẢN TRỊ ADMIN (TÁCH BIỆT HOÀN TOÀN: CHUYỂN HƯỚNG SANG CỔNG /admin) */}
          {currentView === 'admin' && (
            <div className="py-16 text-center space-y-3">
              <div className="inline-flex p-3 bg-slate-100 rounded-2xl text-slate-700">
                <ShieldAlert className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Cổng Quản Trị Hệ Thống Admin</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Khu vực Quản trị viên được phân tách ở cổng bảo mật riêng biệt tại /admin.
              </p>
              <button
                onClick={() => {
                  window.history.pushState({}, '', '/admin');
                  setIsAdminRoute(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-blue-700 transition"
              >
                Chuyển tới Cổng Quản trị /admin →
              </button>
            </div>
          )}
        </main>

        {/* Global Footer (Vieclam24h Inspired Design) */}
        {currentView !== 'messages' && (
          <Footer onNavigate={setCurrentView} />
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentView={currentView}
        setCurrentView={setCurrentView}
        unreadMessagesCount={unreadMessagesCount}
        onToggleChatBox={handleToggleChatBox}
      />

      {/* Email Notifications Modal (Nodemailer status & preview) */}
      {showEmailModal && (
        <EmailPreviewModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
        />
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          job={selectedJob}
          onSubmit={handleSubmitApplication}
          currentUser={currentUser}
        />
      )}

      {/* Service Detail Modal */}
      {selectedService && (
        <ServiceDetailModal
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
          service={selectedService}
          onHire={handleHireService}
          onOpenChat={handleOpenChatWithEmployer}
          currentUser={currentUser}
        />
      )}

      {/* Create Service Modal */}
      {showCreateServiceModal && (
        <CreateServiceModal
          isOpen={showCreateServiceModal}
          onClose={() => setShowCreateServiceModal(false)}
          currentUser={currentUser}
          onCreateService={handleCreateService}
        />
      )}

      {/* Auth Modal: Đăng nhập / Đăng ký */}
      {authModalState.isOpen && (
        <AuthModal
          isOpen={authModalState.isOpen}
          onClose={handleCloseAuth}
          initialMode={authModalState.mode}
          onShowToast={showToastMsg}
        />
      )}

      {/* Admin Dashboard Modal */}
      {showAdminModal && (
        <AdminDashboardModal
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
          jobs={jobs}
          appliedJobs={appliedJobs}
          onDeleteJob={handleDeleteJob}
          onShowToast={showToastMsg}
        />
      )}

      {/* Public Company Profile Modal (Xem doanh nghiệp công khai & việc đang tuyển) */}
      <PublicCompanyModal
        isOpen={Boolean(viewingCompany)}
        onClose={() => setViewingCompany(null)}
        company={viewingCompany}
        jobs={viewingCompanyJobs}
        onSelectJob={handleSelectJob}
      />

      {/* Bong bóng chat tròn & Cửa sổ Chat Box nổi phong cách Facebook */}
      <ChatBox
        isOpen={isChatBoxOpen}
        onClose={() => setIsChatBoxOpen(false)}
        isMinimized={isChatMinimized}
        setIsMinimized={setIsChatMinimized}
        conversations={conversations}
        activeTargetName={activeChatEmployerName}
        onSelectConversation={setActiveChatEmployerName}
        onSendMessage={handleSendMessage}
        onDeleteConversation={handleDeleteConversation}
        onClearMockConversations={handleClearMockConversations}
        currentUser={user}
        currentRole={role}
      />

      {/* Ô Chat Box AI tự động của nền tảng sử dụng Google Gemini (Luôn luôn hiện trên toàn sàn) */}
      <GeminiAIChatWidget
        currentUser={user}
        currentRole={role}
      />
    </div>
  );
}
