import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Badge from '../components/common/Badge';
import StatCard from '../components/common/StatCard';
import Modal from '../components/common/Modal';
import { formatNumberWithDots, parseRawNumber } from '../lib/currencyFormatter';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  getEmployerJobs,
  setJobStatus,
  deleteEmployerJob,
  updateEmployerJob
} from '../lib/jobService';
import {
  getEmployerApplicants,
  updateApplicationStatus,
  getApplicationNotes,
  saveApplicationNote,
  deleteApplicationNote,
  getApplicationStatusHistory,
  mapStatusToVietnamese,
  mapStatusToBadgeStyle,
  formatAppliedDate,
  formatDateTime,
  getCvSignedUrl
} from '../lib/applicationService';
import PublicStudentProfileModal from './PublicStudentProfileModal';
import ReviewModal from '../components/common/ReviewModal';
import { getStudentProfile, getStudentProjects } from '../lib/profileService';
import { getEmployerStats } from '../lib/statsService';
import {
  ApplicationsTimelineChart,
  RecruitmentFunnelChart,
  StatusDistributionWidget
} from '../components/common/AnalyticsCharts';
import {
  Users,
  Briefcase,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  DollarSign,
  PlusCircle,
  FileText,
  Star,
  ExternalLink,
  ChevronRight,
  XCircle,
  GraduationCap,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  AlertCircle,
  Search,
  Filter,
  Loader2,
  Eye,
  LayoutGrid,
  Table as TableIcon,
  StickyNote,
  Check,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  History,
  ArrowRight,
  MessageSquare,
  Layers,
  Upload
} from 'lucide-react';

export default function EmployerDashboardPage({
  applicants = [],
  onUpdateApplicantStatus,
  onOpenPostJob,
  onShowToast,
  onSelectJob,
  onOpenChatWithEmployer,
  projects = [],
  onUpdateProjectProgress,
  onNavigate
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'applicants' | 'hired_services' | 'analytics'
  const [hiredStatusFilter, setHiredStatusFilter] = useState('all');

  // Danh sách dịch vụ Freelance mà Nhà tuyển dụng này đã thuê
  const hiredProjects = useMemo(() => {
    return Array.isArray(projects) ? projects : [];
  }, [projects]);

  const pendingReviewCount = useMemo(() => {
    return hiredProjects.filter((p) => p.status === 'pending_review').length;
  }, [hiredProjects]);

  // Jobs state
  const [employerJobs, setEmployerJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobFilterStatus, setJobFilterStatus] = useState('all');

  // Applicants state (Supabase real data)
  const [applicantsList, setApplicantsList] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Filter & Search state for Applicants
  const [selectedJobFilter, setSelectedJobFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Pagination for large applicant lists
  const [visibleCount, setVisibleCount] = useState(10);

  // Edit Job Modal State
  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    job_type: 'Part-time',
    salary_min: '',
    salary_max: '',
    location: '',
    deadline: '',
    description: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Applicant modal state
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [employerNotesInput, setEmployerNotesInput] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [applicantNotesList, setApplicantNotesList] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Status History state
  const [statusHistory, setStatusHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Portfolio modal state (Sprint 3.1)
  const [viewingStudentProfile, setViewingStudentProfile] = useState(null);
  const [viewingStudentProjects, setViewingStudentProjects] = useState([]);
  const [loadingStudentPortfolio, setLoadingStudentPortfolio] = useState(false);

  // Confirmation Modal State (Accept / Reject)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'accept', // 'accept' | 'reject'
    applicant: null
  });

  // Review Modal State (Sprint 4)
  const [reviewModalState, setReviewModalState] = useState({
    isOpen: false,
    applicant: null
  });

  const handleOpenReviewModal = (applicant) => {
    setReviewModalState({ isOpen: true, applicant });
  };

  // Analytics State (Sprint 3.4)
  const [statsDays, setStatsDays] = useState(7);
  const [statsData, setStatsData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      setStatsError(null);
      const data = await getEmployerStats(statsDays, user);
      setStatsData(data);
    } catch (err) {
      console.error('Lỗi tải thống kê:', err);
      setStatsError('Không thể tải dữ liệu thống kê từ cơ sở dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoadingStats(false);
    }
  }, [statsDays, user]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadStats();
    }
  }, [activeTab, statsDays, loadStats]);

  const handleOpenCv = async (cvPath) => {
    if (!cvPath) return;
    try {
      const signedUrl = await getCvSignedUrl(cvPath);
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      } else {
        alert('Không thể tạo liên kết bảo mật để mở file CV. Vui lòng kiểm tra quyền truy cập hoặc cấu hình.');
      }
    } catch (err) {
      console.error('Lỗi khi mở CV:', err);
    }
  };
  const columns = [
    { id: 'applied', label: 'Đã nộp hồ sơ', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'reviewing', label: 'Đang xem xét', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'interview', label: 'Hẹn phỏng vấn', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { id: 'accepted', label: 'Đã nhận việc', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'rejected', label: 'Từ chối', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  ];

  // 1. Tải danh sách công việc của Employer từ Supabase
  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const currentId = authUser?.id || user?.id;
      if (currentId) {
        const data = await getEmployerJobs(currentId);
        setEmployerJobs(data || []);
      } else {
        setEmployerJobs([]);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách công việc:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  // 2. Tải danh sách ứng viên thật từ Supabase
  const loadApplicants = async () => {
    setLoadingApplicants(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const currentId = authUser?.id || user?.id;
      if (currentId) {
        const data = await getEmployerApplicants(currentId);
        setApplicantsList(data || []);
      } else if (applicants && applicants.length > 0) {
        setApplicantsList(applicants);
      }
    } catch (err) {
      console.warn('Lỗi khi fetch hồ sơ ứng viên từ Supabase:', err.message);
    } finally {
      setLoadingApplicants(false);
    }
  };

  useEffect(() => {
    loadJobs();
    loadApplicants();
  }, [user?.id, activeTab]);

  // Load Notes & Status History khi mở modal chi tiết ứng viên
  useEffect(() => {
    if (selectedApplicant) {
      setEmployerNotesInput('');
      loadNotes(selectedApplicant.id);
      loadHistory(selectedApplicant.id);
    } else {
      setApplicantNotesList([]);
      setStatusHistory([]);
    }
  }, [selectedApplicant?.id]);

  const loadNotes = async (appId) => {
    try {
      setLoadingNotes(true);
      const notes = await getApplicationNotes(appId);
      setApplicantNotesList(notes || []);
    } catch (e) {
      console.warn('Lỗi load ghi chú:', e);
    } finally {
      setLoadingNotes(false);
    }
  };

  const loadHistory = async (appId) => {
    try {
      setLoadingHistory(true);
      const hist = await getApplicationStatusHistory(appId);
      setStatusHistory(hist || []);
    } catch (e) {
      console.warn('Lỗi load lịch sử trạng thái:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle open Student Portfolio (Sprint 3.1)
  const handleOpenStudentPortfolio = async (app) => {
    try {
      setLoadingStudentPortfolio(true);
      const studentId = app.studentId || app.student_id || app.id;
      const [prof, projs] = await Promise.all([
        getStudentProfile(studentId),
        getStudentProjects(studentId)
      ]);
      setViewingStudentProfile(prof);
      setViewingStudentProjects(projs);
    } catch (e) {
      console.warn('Lỗi load portfolio ứng viên:', e);
    } finally {
      setLoadingStudentPortfolio(false);
    }
  };

  // Toggle Job Status (published <-> closed)
  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'published' ? 'closed' : 'published';
    try {
      await setJobStatus(job.id, newStatus, user?.id);
      setEmployerJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j))
      );
      if (onShowToast) {
        onShowToast(
          `✔ Đã chuyển trạng thái tin sang: ${
            newStatus === 'published' ? 'Đang tuyển (Published)' : 'Đã đóng tuyển (Closed)'
          }`
        );
      }
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  // Delete Job
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn tin tuyển dụng này?')) return;
    try {
      await deleteEmployerJob(jobId, user?.id);
      setEmployerJobs((prev) => prev.filter((j) => j.id !== jobId));
      if (onShowToast) {
        onShowToast('✔ Đã xóa tin tuyển dụng thành công khỏi CSDL.');
      }
    } catch (err) {
      alert(`Lỗi khi xóa tin: ${err.message}`);
    }
  };

  // Open Edit Job Modal
  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title || '',
      job_type: job.type || job.job_type || 'Part-time',
      salary_min: job.salaryMin || job.salary_min || '',
      salary_max: job.salaryMax || job.salary_max || '',
      location: job.location || '',
      deadline: job.deadline ? job.deadline.split('T')[0] : '',
      description: job.description || ''
    });
  };

  // Save Edit Job
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingJob) return;

    try {
      setIsUpdating(true);
      await updateEmployerJob(editingJob.id, editForm, user?.id);
      setEmployerJobs((prev) =>
        prev.map((j) =>
          j.id === editingJob.id
            ? {
                ...j,
                title: editForm.title,
                type: editForm.job_type,
                location: editForm.location,
                salary_min: parseRawNumber(editForm.salary_min),
                salary_max: parseRawNumber(editForm.salary_max),
                deadline: editForm.deadline,
                description: editForm.description
              }
            : j
        )
      );
      setEditingJob(null);
      if (onShowToast) {
        onShowToast('🎉 Đã cập nhật tin tuyển dụng thành công vào CSDL!');
      }
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Cập nhật trạng thái ứng viên (Lưu thẳng vào Supabase & Kiểm soát State Machine)
  const handleUpdateStatus = async (applicantId, targetStatus) => {
    try {
      setUpdatingStatusId(applicantId);
      await updateApplicationStatus(applicantId, targetStatus, user);
      
      setApplicantsList((prev) =>
        prev.map((a) => (a.id === applicantId ? { ...a, status: targetStatus, statusText: mapStatusToVietnamese(targetStatus) } : a))
      );

      if (selectedApplicant && selectedApplicant.id === applicantId) {
        setSelectedApplicant((prev) => ({
          ...prev,
          status: targetStatus,
          statusText: mapStatusToVietnamese(targetStatus)
        }));
        // Reload lịch sử trạng thái
        loadHistory(applicantId);
      }

      if (onUpdateApplicantStatus) {
        onUpdateApplicantStatus(applicantId, targetStatus);
      }

      if (onShowToast) {
        onShowToast(`✔ Đã chuyển trạng thái hồ sơ sang "${mapStatusToVietnamese(targetStatus)}"`);
      }
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái ứng viên:', err);
      alert(`Thao tác không thành công: ${err.message}`);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Lưu ghi chú nội bộ của nhà tuyển dụng vào bảng riêng application_notes
  const handleSaveNotes = async () => {
    if (!selectedApplicant) return;
    if (!employerNotesInput.trim()) {
      alert('Vui lòng nhập nội dung ghi chú.');
      return;
    }
    try {
      setSavingNotes(true);
      const newNote = await saveApplicationNote(selectedApplicant.id, employerNotesInput, user);
      setApplicantNotesList((prev) => [newNote, ...prev]);
      setEmployerNotesInput('');

      // Cập nhật tóm tắt ở danh sách ngoài
      setApplicantsList((prev) =>
        prev.map((a) => (a.id === selectedApplicant.id ? { ...a, employerNotes: newNote.content } : a))
      );

      if (onShowToast) {
        onShowToast('✔ Đã lưu ghi chú nội bộ an toàn vào hệ thống!');
      }
    } catch (err) {
      alert(`Lỗi lưu ghi chú: ${err.message}`);
    } finally {
      setSavingNotes(false);
    }
  };

  // Xóa ghi chú nội bộ
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) return;
    try {
      await deleteApplicationNote(noteId);
      setApplicantNotesList((prev) => prev.filter((n) => n.id !== noteId));
      if (onShowToast) {
        onShowToast('✔ Đã xóa ghi chú.');
      }
    } catch (err) {
      alert(`Lỗi xóa ghi chú: ${err.message}`);
    }
  };

  // Mở modal xác nhận Nhận / Từ chối
  const handleOpenConfirm = (type, applicant) => {
    setConfirmModal({
      isOpen: true,
      type,
      applicant
    });
  };

  // Thực thi xác nhận
  const handleExecuteConfirm = async () => {
    if (!confirmModal.applicant) return;
    const targetStatus = confirmModal.type === 'accept' ? 'accepted' : 'rejected';
    await handleUpdateStatus(confirmModal.applicant.id, targetStatus);
    setConfirmModal({ isOpen: false, type: 'accept', applicant: null });
  };

  // Kiểm tra bước tiếp theo hợp lệ theo State Machine
  const getNextValidStatus = (current) => {
    switch (current) {
      case 'applied': return 'reviewing';
      case 'reviewing': return 'interview';
      case 'interview': return 'accepted';
      default: return null; // 'accepted' và 'rejected' là trạng thái cuối
    }
  };

  // Lọc danh sách việc làm
  const filteredJobs = employerJobs.filter((j) => {
    if (jobFilterStatus === 'all') return true;
    return (j.status || 'published') === jobFilterStatus;
  });

  // Lọc và Tìm kiếm danh sách Ứng viên (Real Data Filtering)
  const filteredApplicants = useMemo(() => {
    return applicantsList.filter((app) => {
      // 1. Lọc theo Job
      if (selectedJobFilter !== 'all' && String(app.jobId) !== String(selectedJobFilter)) {
        return false;
      }
      // 2. Lọc theo Status
      if (selectedStatusFilter !== 'all' && app.status !== selectedStatusFilter) {
        return false;
      }
      // 3. Tìm kiếm theo Tên, Email, Job Title, Trường, Kỹ năng
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = app.name?.toLowerCase().includes(q);
        const matchEmail = app.email?.toLowerCase().includes(q);
        const matchJob = (app.jobTitle || app.appliedFor)?.toLowerCase().includes(q);
        const matchUni = app.university?.toLowerCase().includes(q);
        const matchSkills = Array.isArray(app.skills) && app.skills.some((s) => s.toLowerCase().includes(q));

        if (!matchName && !matchEmail && !matchJob && !matchUni && !matchSkills) {
          return false;
        }
      }
      return true;
    });
  }, [applicantsList, selectedJobFilter, selectedStatusFilter, searchQuery]);

  // Đếm số lượng ứng viên theo từng trạng thái
  const statusCounts = useMemo(() => {
    const counts = {
      all: applicantsList.length,
      applied: 0,
      reviewing: 0,
      interview: 0,
      accepted: 0,
      rejected: 0
    };
    applicantsList.forEach((a) => {
      if (counts[a.status] !== undefined) {
        counts[a.status]++;
      }
    });
    return counts;
  }, [applicantsList]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản trị tuyển dụng & Hồ sơ ứng viên
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý các tin đăng tuyển dụng, theo dõi pipeline ứng viên và cập nhật trạng thái làm việc.
          </p>
        </div>

        <button
          onClick={onOpenPostJob}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Đăng tin tuyển dụng mới</span>
        </button>
      </div>

      {/* 6 Stats Cards for Employer */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Tổng số tin đăng"
          value={employerJobs.length.toString()}
          subtitle="tin trong CSDL"
          icon={Briefcase}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Đang tuyển (Active)"
          value={employerJobs.filter((j) => (j.status || 'published') === 'published').length.toString()}
          subtitle="tin công khai"
          icon={Clock}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Đã đóng / Nháp"
          value={employerJobs.filter((j) => ['closed', 'draft'].includes(j.status)).length.toString()}
          subtitle="tạm dừng nhận CV"
          icon={Lock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Ứng viên mới"
          value={statusCounts.applied.toString()}
          subtitle="cần xem xét"
          icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Đã nhận việc"
          value={statusCounts.accepted.toString()}
          subtitle="sinh viên trúng tuyển"
          icon={CheckCircle2}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Dịch vụ đã thuê"
          value={hiredProjects.length.toString()}
          subtitle={pendingReviewCount > 0 ? `${pendingReviewCount} chờ nghiệm thu` : 'Hợp đồng Freelance'}
          icon={Layers}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          onClick={() => setActiveTab('hired_services')}
        />
      </div>

      {/* Tab Switcher: Quản lý tin đăng vs Quản lý ứng viên vs Dịch vụ đã thuê vs Báo cáo */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'jobs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Danh sách Tin Tuyển Dụng ({employerJobs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('applicants')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'applicants'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Quản lý Ứng Viên ({applicantsList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('hired_services')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'hired_services'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Dịch vụ Freelance đã thuê ({hiredProjects.length})</span>
          {pendingReviewCount > 0 && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-full animate-pulse border border-amber-300">
              {pendingReviewCount} chờ nghiệm thu
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-3 text-xs font-bold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Báo cáo & Thống kê</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: DANH SÁCH VIỆC LÀM (JOB MANAGEMENT) */}
      {/* ===================================================================== */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {/* Filter Sub-bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Trạng thái:
              </span>
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'published', label: 'Đang tuyển (Published)' },
                { id: 'draft', label: 'Bản nháp (Draft)' },
                { id: 'closed', label: 'Đã đóng (Closed)' },
                { id: 'expired', label: 'Hết hạn (Expired)' }
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setJobFilterStatus(st.id)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition ${
                    jobFilterStatus === st.id
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400">
              Hiển thị {filteredJobs.length} tin việc làm
            </span>
          </div>

          {/* Table / List */}
          {loadingJobs ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Đang tải danh sách tin tuyển dụng từ CSDL...</span>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">Chưa có tin tuyển dụng nào phù hợp</p>
              <button
                onClick={onOpenPostJob}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition"
              >
                Đăng tin đầu tiên ngay
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Tiêu đề công việc</th>
                      <th className="py-3 px-4">Loại hình & Khu vực</th>
                      <th className="py-3 px-4">Mức lương</th>
                      <th className="py-3 px-4">Hạn chót</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredJobs.map((job) => {
                      const st = job.status || 'published';
                      const isClosed = st === 'closed';

                      return (
                        <tr key={job.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 line-clamp-1">
                              {job.title}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Mã tin: {job.id.toString().slice(0, 10)}...
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-700">{job.type || job.job_type}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{job.location}</div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-blue-600">
                            {job.salary || `${Number(job.salary_min || 0).toLocaleString()}đ`}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : 'Không hạn'}
                          </td>
                          <td className="py-3.5 px-4">
                            {st === 'published' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Đang tuyển
                              </span>
                            )}
                            {st === 'closed' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
                                <Lock className="w-3 h-3" />
                                Đã đóng
                              </span>
                            )}
                            {st === 'draft' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 rounded-lg">
                                Bản nháp
                              </span>
                            )}
                            {st === 'expired' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
                                Hết hạn
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {onSelectJob && (
                                <button
                                  onClick={() => onSelectJob(job)}
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  title="Xem chi tiết"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenEdit(job)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                title="Chỉnh sửa tin"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(job)}
                                className={`p-1.5 rounded-lg transition ${
                                  isClosed
                                    ? 'text-emerald-600 hover:bg-emerald-50'
                                    : 'text-amber-600 hover:bg-amber-50'
                                }`}
                                title={isClosed ? 'Mở lại tin tuyển dụng' : 'Đóng tin tuyển dụng'}
                              >
                                {isClosed ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Xóa tin đăng"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: QUẢN LÝ ỨNG VIÊN (APPLICANT MANAGEMENT) */}
      {/* ===================================================================== */}
      {activeTab === 'applicants' && (
        <div className="space-y-4">
          {/* TOOLBAR: LỌC THEO JOB, SEARCH, VIEW MODE */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Lọc theo Job */}
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedJobFilter}
                  onChange={(e) => setSelectedJobFilter(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition"
                >
                  <option value="all">Tất cả công việc ({employerJobs.length})</option>
                  {employerJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({applicantsList.filter((a) => String(a.jobId) === String(j.id)).length} ứng viên)
                    </option>
                  ))}
                </select>
              </div>

              {/* Ô Tìm kiếm ứng viên thời gian thực */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên ứng viên, email, trường hoặc kỹ năng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Chuyển đổi View Mode: Kanban vs Table */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start lg:self-auto shrink-0">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    viewMode === 'kanban'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Giao diện thẻ Pipeline (Kanban)"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Kanban</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    viewMode === 'table'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Giao diện Bảng chi tiết (Table)"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Danh sách</span>
                </button>
              </div>
            </div>

            {/* BỘ LỌC THEO TRẠNG THÁI (STATUS FILTER PILLS) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-semibold mr-1 shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Lọc trạng thái:
              </span>
              {[
                { id: 'all', label: 'Tất cả', count: statusCounts.all },
                { id: 'applied', label: 'Đã nộp', count: statusCounts.applied },
                { id: 'reviewing', label: 'Đang xem xét', count: statusCounts.reviewing },
                { id: 'interview', label: 'Hẹn phỏng vấn', count: statusCounts.interview },
                { id: 'accepted', label: 'Đã nhận việc', count: statusCounts.accepted },
                { id: 'rejected', label: 'Từ chối', count: statusCounts.rejected }
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatusFilter(st.id)}
                  className={`px-3 py-1 rounded-xl font-medium shrink-0 transition flex items-center gap-1.5 ${
                    selectedStatusFilter === st.id
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{st.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      selectedStatusFilter === st.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {st.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Loading indicator */}
          {loadingApplicants ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Đang đồng bộ danh sách ứng viên từ cơ sở dữ liệu Supabase...</span>
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">Không tìm thấy ứng viên nào phù hợp với bộ lọc</p>
              <p className="text-[11px] text-slate-400">
                Hãy thử đổi từ khóa tìm kiếm hoặc chọn "Tất cả công việc".
              </p>
            </div>
          ) : viewMode === 'kanban' ? (
            /* ===================================================================== */
            /* VIEW 1: KANBAN BOARD PIPELINE */
            /* ===================================================================== */
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
              {columns.map((col) => {
                const colApplicants = filteredApplicants.filter((a) => a.status === col.id);

                return (
                  <div
                    key={col.id}
                    className="bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80 min-h-[460px] flex flex-col"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{col.label}</span>
                        <span className="w-5 h-5 rounded-full bg-white text-slate-700 text-[11px] font-bold flex items-center justify-center shadow-xs">
                          {colApplicants.length}
                        </span>
                      </div>
                    </div>

                    {/* Candidate Cards List */}
                    <div className="space-y-3 flex-1">
                      {colApplicants.map((app) => {
                        const nextValid = getNextValidStatus(app.status);
                        const isTerminal = app.status === 'accepted' || app.status === 'rejected';

                        return (
                          <div
                            key={app.id}
                            onClick={() => setSelectedApplicant(app)}
                            className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer space-y-2.5 group relative"
                          >
                            {updatingStatusId === app.id && (
                              <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-10">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                              </div>
                            )}

                            <div className="flex items-start gap-2.5">
                              <img
                                src={app.avatar}
                                alt={app.name}
                                className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-100"
                              />
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition">
                                  {app.name}
                                </h4>
                                <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                                  <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
                                  {app.university}
                                </p>
                              </div>
                            </div>

                            <div className="text-[11px] text-blue-600 font-semibold truncate">
                              Vị trí: {app.appliedFor || app.jobTitle}
                            </div>

                            {/* Kỹ năng */}
                            <div className="flex flex-wrap gap-1">
                              {app.skills?.slice(0, 2).map((s, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-50 text-slate-600 rounded border border-slate-100"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>

                            {/* Ghi chú tóm tắt (nếu có) */}
                            {app.employerNotes && (
                              <div className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60 truncate">
                                <StickyNote className="w-3 h-3 shrink-0" />
                                <span className="truncate">{app.employerNotes}</span>
                              </div>
                            )}

                            {/* Card Footer: Ngày nộp & Quick Actions chuẩn State Machine */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                              <span className="text-[10px] text-slate-400">
                                {app.appliedDate}
                              </span>

                              {/* Move Actions chuẩn luồng */}
                              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                {!isTerminal && nextValid && (
                                  <button
                                    onClick={() => {
                                      if (nextValid === 'accepted') {
                                        handleOpenConfirm('accept', app);
                                      } else {
                                        handleUpdateStatus(app.id, nextValid);
                                      }
                                    }}
                                    disabled={updatingStatusId === app.id}
                                    className="p-1 bg-blue-50 hover:bg-blue-100 rounded text-blue-600 transition"
                                    title={`Chuyển tiếp: ${mapStatusToVietnamese(nextValid)}`}
                                  >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {!isTerminal && (
                                  <button
                                    onClick={() => handleOpenConfirm('reject', app)}
                                    disabled={updatingStatusId === app.id}
                                    className="p-1 hover:bg-rose-50 rounded text-slate-300 hover:text-rose-500 transition"
                                    title="Từ chối hồ sơ"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {isTerminal && (
                                  <span className="text-[10px] text-slate-400 italic">Đã chốt</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {colApplicants.length === 0 && (
                        <div className="h-28 border border-dashed border-slate-300/80 rounded-xl flex items-center justify-center text-slate-400 text-xs text-center p-2">
                          Chưa có ứng viên ở giai đoạn này
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ===================================================================== */
            /* VIEW 2: BẢNG DANH SÁCH ỨNG VIÊN (TABLE LIST VIEW) */
            /* ===================================================================== */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Ứng viên</th>
                      <th className="py-3 px-4">Công việc ứng tuyển</th>
                      <th className="py-3 px-4">Ngày nộp</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4">CV / Hồ sơ</th>
                      <th className="py-3 px-4">Ghi chú</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredApplicants.slice(0, visibleCount).map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={app.avatar}
                              alt={app.name}
                              className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-100"
                            />
                            <div>
                              <div
                                onClick={() => setSelectedApplicant(app)}
                                className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition line-clamp-1"
                              >
                                {app.name}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate max-w-[200px]">
                                <GraduationCap className="w-3 h-3 shrink-0" />
                                {app.university}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 line-clamp-1">
                            {app.appliedFor || app.jobTitle}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Mã Job: {app.jobId ? app.jobId.toString().slice(0, 8) : 'N/A'}...
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          {app.appliedDate}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold border rounded-lg ${mapStatusToBadgeStyle(
                              app.status
                            )}`}
                          >
                            {mapStatusToVietnamese(app.status)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {app.cvUrl ? (
                              <button
                                onClick={() => handleOpenCv(app.cvUrl)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Xem CV</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400">Không có CV</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-[11px] text-slate-500 max-w-[150px] truncate">
                            {app.employerNotes || <span className="text-slate-300 italic">Chưa có ghi chú</span>}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {app.status === 'accepted' && (
                              <button
                                onClick={() => handleOpenReviewModal(app)}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg border border-amber-200 text-xs transition flex items-center gap-1 shadow-sm"
                                title="Đánh giá năng lực và thái độ sinh viên"
                              >
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>Đánh giá</span>
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedApplicant(app)}
                              className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                              title="Xem chi tiết hồ sơ"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Chi tiết</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Phân trang / Nút tải thêm */}
              {filteredApplicants.length > visibleCount && (
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Hiển thị {Math.min(visibleCount, filteredApplicants.length)} / {filteredApplicants.length} ứng viên</span>
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 10)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 font-semibold text-slate-700 rounded-lg transition"
                  >
                    Tải thêm 10 ứng viên
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: BÁO CÁO & THỐNG KÊ TUYỂN DỤNG (SPRINT 3.4) */}
      {/* ===================================================================== */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Loading State */}
          {loadingStats && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Đang tính toán số liệu thống kê từ cơ sở dữ liệu Supabase...</span>
            </div>
          )}

          {/* Error State */}
          {statsError && !loadingStats && (
            <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center text-xs space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="font-semibold text-rose-700">{statsError}</p>
              <button
                onClick={loadStats}
                className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-xl transition inline-flex items-center gap-1.5"
              >
                <span>Tải lại dữ liệu</span>
              </button>
            </div>
          )}

          {/* Data State */}
          {!loadingStats && !statsError && statsData && (
            <>
              {/* 4 Cards Thống kê quan trọng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Tổng tin tuyển dụng"
                  value={statsData.totalJobs}
                  subtitle="vị trí đã khởi tạo"
                  icon={Briefcase}
                  iconColor="text-blue-600"
                  iconBg="bg-blue-50"
                  trend="Toàn thời gian"
                  trendType="neutral"
                />
                <StatCard
                  title="Tin đang mở tuyển"
                  value={statsData.activeJobs}
                  subtitle="công việc đang nhận đơn"
                  icon={Clock}
                  iconColor="text-indigo-600"
                  iconBg="bg-indigo-50"
                  trend="Đang hiển thị"
                  trendType="up"
                />
                <StatCard
                  title="Tổng ứng viên"
                  value={statsData.totalApplicants}
                  subtitle="hồ sơ đã ứng tuyển"
                  icon={Users}
                  iconColor="text-emerald-600"
                  iconBg="bg-emerald-50"
                  trend="Tất cả vị trí"
                  trendType="neutral"
                />
                <StatCard
                  title="Ứng viên mới (7 ngày)"
                  value={statsData.newApplicants7d}
                  subtitle="hồ sơ nộp gần đây"
                  icon={TrendingUp}
                  iconColor="text-amber-600"
                  iconBg="bg-amber-50"
                  trend={`+${statsData.newApplicants7d} tuần này`}
                  trendType="up"
                />
              </div>

              {/* Biểu đồ Timeline theo ngày với selector 7/30/90 ngày */}
              <ApplicationsTimelineChart
                timeline={statsData.timeline}
                days={statsDays}
                onDaysChange={setStatsDays}
              />

              {/* Grid 2 cột: Phễu chuyển đổi & Phân bổ trạng thái */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <RecruitmentFunnelChart funnel={statsData.funnel} />
                <StatusDistributionWidget distribution={statsData.statusDistribution} />
              </div>
            </>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: DỊCH VỤ FREELANCE ĐÃ THUÊ (HIRED SERVICES & ESCROW) */}
      {/* ===================================================================== */}
      {activeTab === 'hired_services' && (
        <div className="space-y-4">
          {/* Subbar filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Trạng thái:
              </span>
              {[
                { id: 'all', label: `Tất cả (${hiredProjects.length})` },
                { id: 'in_progress', label: `Đang thực hiện (${hiredProjects.filter((p) => p.status === 'in_progress').length})` },
                { id: 'pending_review', label: `Chờ nghiệm thu (${hiredProjects.filter((p) => p.status === 'pending_review').length})` },
                { id: 'completed', label: `Đã hoàn thành (${hiredProjects.filter((p) => p.status === 'completed').length})` },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setHiredStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition ${
                    hiredStatusFilter === st.id
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => onNavigate && onNavigate('freelance')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition border border-blue-200"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Thuê thêm dịch vụ Freelance</span>
            </button>
          </div>

          {/* List of hired services */}
          {hiredProjects.filter((p) => hiredStatusFilter === 'all' || p.status === hiredStatusFilter).length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
              <Layers className="w-10 h-10 text-slate-300 mx-auto stroke-1" />
              <div>
                <p className="font-bold text-slate-700 text-sm">
                  {hiredProjects.length === 0
                    ? 'Bạn chưa thuê dịch vụ freelance nào'
                    : 'Không có dự án nào trong trạng thái này'}
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {hiredProjects.length === 0
                    ? 'Khám phá các gói dịch vụ Thiết kế Canva, Kịch bản TikTok, Viết bài Content và Lập trình từ sinh viên trên Sàn Freelance.'
                    : 'Chuyển bộ lọc sang trạng thái khác để xem tiến độ các hợp đồng freelance.'}
                </p>
              </div>
              {hiredProjects.length === 0 && (
                <button
                  onClick={() => onNavigate && onNavigate('freelance')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Khám phá Sàn Freelance</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {hiredProjects
                .filter((p) => hiredStatusFilter === 'all' || p.status === hiredStatusFilter)
                .map((proj) => (
                  <div
                    key={proj.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-cardHover transition flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={proj.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                            alt={proj.studentName}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-100"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              {proj.studentName || 'Sinh viên Freelancer'}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {proj.studentUniversity || 'Đại học'}
                            </span>
                          </div>
                        </div>

                        {proj.status === 'in_progress' && (
                          <Badge variant="primary" size="sm">Đang thực hiện</Badge>
                        )}
                        {proj.status === 'pending_review' && (
                          <Badge variant="warning" size="sm">Chờ nghiệm thu</Badge>
                        )}
                        {proj.status === 'completed' && (
                          <Badge variant="success" size="sm">Đã hoàn thành</Badge>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-slate-900 mt-3 line-clamp-1">
                        {proj.title}
                      </h3>

                      {/* Info grid */}
                      <div className="mt-3 grid grid-cols-2 gap-2.5 p-3 bg-slate-50 rounded-xl text-xs">
                        <div>
                          <span className="text-slate-400 block font-medium text-[11px]">Ngân sách tạm giữ (Escrow)</span>
                          <span className="font-bold text-blue-600 mt-0.5 block">{proj.budget}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium text-[11px]">Hạn bàn giao</span>
                          <span className="font-semibold text-slate-700 mt-0.5 block">{proj.deadline}</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Tiến độ hoàn thiện:</span>
                          <span className="font-bold text-blue-600">{proj.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${proj.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Pending Review Box */}
                      {proj.status === 'pending_review' && (
                        <div className="mt-3.5 p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-2.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Sinh viên đã nộp sản phẩm bàn giao!</span>
                          </div>

                          <div className="text-xs bg-white p-2.5 rounded-lg border border-amber-200/60 space-y-1">
                            <div>
                              <span className="font-semibold text-slate-700">Link sản phẩm:</span>{' '}
                              <a
                                href={proj.deliveryFile}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 font-bold underline inline-flex items-center gap-1 ml-1 break-all"
                              >
                                {proj.deliveryFile || 'Mở link bàn giao'}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            {proj.deliveryNote && (
                              <p className="text-slate-600 text-[11px]">
                                <span className="font-semibold text-slate-700">Ghi chú:</span> {proj.deliveryNote}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (onUpdateProjectProgress) {
                                onUpdateProjectProgress({
                                  ...proj,
                                  status: 'completed',
                                  progress: 100
                                });
                              }
                              if (onShowToast) {
                                onShowToast('🎉 Đã xác nhận nghiệm thu và giải ngân thù lao thành công cho sinh viên!');
                              }
                            }}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Xác nhận nghiệm thu & Giải ngân {proj.budget} vào Ví sinh viên</span>
                          </button>
                        </div>
                      )}

                      {/* Completed Box */}
                      {proj.status === 'completed' && (
                        <div className="mt-3.5 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Hợp đồng đã hoàn tất nghiệm thu & giải ngân {proj.budget} thành công.</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom action row */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          if (onOpenChatWithEmployer) {
                            onOpenChatWithEmployer(proj.studentName || 'Sinh viên Freelancer', {
                              partnerId: proj.studentId,
                              partnerRole: 'student',
                              partnerAvatar: proj.studentAvatar
                            });
                          }
                        }}
                        className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 hover:underline"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Nhắn tin với Freelancer</span>
                      </button>

                      <button
                        onClick={() => onNavigate && onNavigate('my-projects')}
                        className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>Chi tiết tiến độ</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: CHỈNH SỬA TIN TUYỂN DỤNG */}
      {/* ===================================================================== */}
      {editingJob && (
        <Modal
          isOpen={!!editingJob}
          onClose={() => setEditingJob(null)}
          title={`Chỉnh sửa tin: ${editingJob.title}`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Tiêu đề công việc <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Hình thức</label>
                <select
                  value={editForm.job_type}
                  onChange={(e) => setEditForm({ ...editForm, job_type: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                >
                  <option value="Part-time">Part-time</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                  <option value="Full-time">Full-time</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Địa điểm</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Lương tối thiểu (VNĐ)
                </label>
                <input
                  type="text"
                  value={formatNumberWithDots(editForm.salary_min)}
                  onChange={(e) => setEditForm({ ...editForm, salary_min: formatNumberWithDots(e.target.value) })}
                  onBlur={(e) => setEditForm({ ...editForm, salary_min: formatNumberWithDots(e.target.value) })}
                  placeholder="Vd: 3.000.000"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-semibold text-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Lương tối đa (VNĐ)
                </label>
                <input
                  type="text"
                  value={formatNumberWithDots(editForm.salary_max)}
                  onChange={(e) => setEditForm({ ...editForm, salary_max: formatNumberWithDots(e.target.value) })}
                  onBlur={(e) => setEditForm({ ...editForm, salary_max: formatNumberWithDots(e.target.value) })}
                  placeholder="Vd: 5.000.000"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none font-semibold text-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Hạn chót ứng tuyển</label>
                <input
                  type="date"
                  value={editForm.deadline}
                  onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Mô tả công việc</label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
              >
                {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: CHI TIẾT ỨNG VIÊN (APPLICANT DETAIL MODAL) */}
      {/* ===================================================================== */}
      {selectedApplicant && (
        <Modal
          isOpen={!!selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          title={`Hồ sơ ứng viên: ${selectedApplicant.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            {/* Header info card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedApplicant.avatar}
                  alt={selectedApplicant.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white shadow-xs shrink-0"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedApplicant.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-blue-600">
                      <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                      {selectedApplicant.university}
                    </span>
                    {selectedApplicant.major && (
                      <>
                        <span>•</span>
                        <span>{selectedApplicant.major}</span>
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                    {selectedApplicant.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {selectedApplicant.email}
                      </span>
                    )}
                    {selectedApplicant.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {selectedApplicant.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="self-start sm:self-auto shrink-0">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold border rounded-xl ${mapStatusToBadgeStyle(
                    selectedApplicant.status
                  )}`}
                >
                  {mapStatusToVietnamese(selectedApplicant.status)}
                </span>
              </div>
            </div>

            {/* Thông tin công việc ứng tuyển & thời gian */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-slate-500">Vị trí ứng tuyển: </span>
                <span className="font-bold text-blue-900">{selectedApplicant.appliedFor || selectedApplicant.jobTitle}</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Nộp ngày: {selectedApplicant.appliedDate}</span>
              </div>
            </div>

            {/* LỊCH SỬ TIẾN TRÌNH TRẠNG THÁI (STATUS HISTORY AUDIT TRAIL) */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-blue-600" />
                <span>Lịch sử xét duyệt trạng thái:</span>
              </h4>

              {loadingHistory ? (
                <div className="py-2 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                  <span>Đang tải lịch sử...</span>
                </div>
              ) : statusHistory.length === 0 ? (
                <div className="text-[11px] text-slate-400 italic">
                  Đơn ứng tuyển được nộp lúc {selectedApplicant.appliedDate}.
                </div>
              ) : (
                <div className="space-y-1.5 text-xs">
                  {statusHistory.map((h, idx) => (
                    <div key={h.id || idx} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-500">
                          {h.old_status ? mapStatusToVietnamese(h.old_status) : 'Mới nộp'}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="font-bold text-blue-700">
                          {mapStatusToVietnamese(h.new_status)}
                        </span>
                      </div>
                      <span className="text-slate-400">
                        {formatDateTime(h.changed_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Thư giới thiệu / Cover Letter */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Thư giới thiệu bản thân (Cover Letter):</span>
              </h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl leading-relaxed whitespace-pre-line border border-slate-200/70">
                {selectedApplicant.coverLetter || 'Ứng viên chưa đính kèm thư giới thiệu chi tiết.'}
              </p>
            </div>

            {/* Kỹ năng chuyên môn */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 mb-1.5">Kỹ năng sinh viên sở hữu:</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedApplicant.skills && selectedApplicant.skills.length > 0 ? (
                  selectedApplicant.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg border border-blue-100"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Chưa liệt kê kỹ năng cụ thể</span>
                )}
              </div>
            </div>

            {/* Kinh nghiệm làm việc (nếu có) */}
            {selectedApplicant.experience && (
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">Kinh nghiệm thực tế:</h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {selectedApplicant.experience}
                </p>
              </div>
            )}

            {/* File CV đính kèm */}
            <div className="p-3 bg-slate-100/80 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-slate-600 shrink-0" />
                <span className="font-semibold text-slate-800 truncate">
                  {selectedApplicant.cvUrl?.split('/').pop() || `CV_SinhVien_${selectedApplicant.name?.replace(/\s+/g, '')}.pdf`}
                </span>
              </div>
              {selectedApplicant.cvUrl ? (
                <button
                  onClick={() => handleOpenCv(selectedApplicant.cvUrl)}
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 shrink-0 ml-2"
                >
                  <span>Mở xem file CV</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              ) : (
                <span className="text-xs text-slate-400 italic">Chưa tải CV</span>
              )}
            </div>

            {/* Chấm điểm & Đánh giá uy tín 2 chiều (Sprint 4: Review) */}
            {selectedApplicant.status === 'accepted' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-900 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>Ứng viên đã nhận việc thành công!</span>
                  </p>
                  <p className="text-[11px] text-amber-700">Đánh giá thái độ và năng lực của sinh viên để nâng cao uy tín cộng đồng.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenReviewModal(selectedApplicant)}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1 shrink-0 ml-3"
                >
                  <Star className="w-3.5 h-3.5 fill-white text-white" />
                  <span>Đánh giá sinh viên</span>
                </button>
              </div>
            )}

            {/* Xem Hồ sơ Portfolio chi tiết (Sprint 3.1) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleOpenStudentPortfolio(selectedApplicant)}
                disabled={loadingStudentPortfolio}
                className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition flex items-center justify-center gap-1.5"
              >
                {loadingStudentPortfolio ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang tải hồ sơ...</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span>Xem Portfolio sinh viên</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetName = selectedApplicant.studentName || selectedApplicant.name || 'Ứng viên';
                  setSelectedApplicant(null);
                  if (onOpenChatWithEmployer) {
                    onOpenChatWithEmployer(targetName, {
                      partnerId: selectedApplicant.studentId || selectedApplicant.student_id,
                      partnerRole: 'student',
                      partnerAvatar: selectedApplicant.avatar
                    });
                  }
                }}
                className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Nhắn tin với {selectedApplicant.studentName || selectedApplicant.name}</span>
              </button>
            </div>

            {/* GHI CHÚ NỘI BỘ DÀNH CHO NHÀ TUYỂN DỤNG (BẢNG RIÊNG: application_notes) */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ghi chú nội bộ bí mật (Chỉ Employer sở hữu Job mới thấy):</span>
                </label>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                  RLS Protected
                </span>
              </div>

              {/* Danh sách các ghi chú đã lưu */}
              {loadingNotes ? (
                <div className="py-2 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span>Đang tải ghi chú...</span>
                </div>
              ) : applicantNotesList.length > 0 ? (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {applicantNotesList.map((n) => (
                    <div key={n.id} className="p-2.5 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-slate-800 whitespace-pre-line leading-relaxed">{n.content}</p>
                        <span className="text-[10px] text-slate-400 block">{formatDateTime(n.created_at)}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(n.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition shrink-0"
                        title="Xóa ghi chú này"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 italic">
                  Chưa có ghi chú nội bộ nào cho ứng viên này.
                </div>
              )}

              {/* Khung thêm ghi chú mới */}
              <div className="pt-1.5">
                <textarea
                  rows={2}
                  value={employerNotesInput}
                  onChange={(e) => setEmployerNotesInput(e.target.value)}
                  placeholder="Thêm ghi chú đánh giá nội bộ mới..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 outline-none leading-relaxed"
                />
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={savingNotes || !employerNotesInput.trim()}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
                  >
                    {savingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    <span>{savingNotes ? 'Đang lưu...' : 'Lưu ghi chú mới'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* HÀNH ĐỘNG CHUYỂN TRẠNG THÁI (KIỂM SOÁT BẰNG MÁY TRẠNG THÁI STATE MACHINE) */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="text-xs font-bold text-slate-800">
                Thao tác chuyển trạng thái (Quy tắc luồng tuyển dụng):
              </div>

              {selectedApplicant.status === 'applied' && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedApplicant.id, 'reviewing')}
                    disabled={updatingStatusId === selectedApplicant.id}
                    className="px-3.5 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                  >
                    <span>Tiếp nhận & Chuyển sang "Đang xem xét"</span>
                  </button>
                  <button
                    onClick={() => handleOpenConfirm('reject', selectedApplicant)}
                    disabled={updatingStatusId === selectedApplicant.id}
                    className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-xl transition flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Từ chối hồ sơ (Reject)</span>
                  </button>
                </div>
              )}

              {selectedApplicant.status === 'reviewing' && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedApplicant.id, 'interview')}
                    disabled={updatingStatusId === selectedApplicant.id}
                    className="px-3.5 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                  >
                    <span>Hẹn phỏng vấn sinh viên</span>
                  </button>
                  <button
                    onClick={() => handleOpenConfirm('reject', selectedApplicant)}
                    disabled={updatingStatusId === selectedApplicant.id}
                    className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-xl transition flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Từ chối hồ sơ (Reject)</span>
                  </button>
                </div>
              )}

              {selectedApplicant.status === 'interview' && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleOpenConfirm('accept', selectedApplicant)}
                    disabled={updatingStatusId === selectedApplicant.id}
                    className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Trúng tuyển & Nhận việc (Accept)</span>
                  </button>
                  <button
                    onClick={() => handleOpenConfirm('reject', selectedApplicant)}
                    disabled={updatingStatusId === selectedApplicant.id}
                    className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-xl transition flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Không trúng tuyển (Reject)</span>
                  </button>
                </div>
              )}

              {(selectedApplicant.status === 'accepted' || selectedApplicant.status === 'rejected') && (
                <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                  {selectedApplicant.status === 'accepted' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Hồ sơ đã ở trạng thái trúng tuyển (Trạng thái kết thúc).</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Hồ sơ đã ở trạng thái từ chối (Trạng thái kết thúc).</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: XÁC NHẬN CHUYỂN TRẠNG THÁI (CONFIRMATION DIALOG) */}
      {/* ===================================================================== */}
      {confirmModal.isOpen && confirmModal.applicant && (
        <Modal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, type: 'accept', applicant: null })}
          title={confirmModal.type === 'accept' ? 'Xác nhận tuyển dụng sinh viên' : 'Xác nhận từ chối hồ sơ'}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  confirmModal.type === 'accept' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                }`}
              >
                {confirmModal.type === 'accept' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {confirmModal.type === 'accept' ? (
                    <>
                      Bạn có chắc chắn muốn tuyển dụng ứng viên{' '}
                      <strong className="text-slate-900">{confirmModal.applicant.name}</strong> cho vị trí{' '}
                      <strong className="text-blue-600">
                        {confirmModal.applicant.appliedFor || confirmModal.applicant.jobTitle}
                      </strong>
                      ? Trạng thái sẽ được cập nhật trong CSDL Supabase và tự động gửi thông báo đến sinh viên.
                    </>
                  ) : (
                    <>
                      Bạn có chắc chắn muốn đánh dấu từ chối hồ sơ của{' '}
                      <strong className="text-slate-900">{confirmModal.applicant.name}</strong>?
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, type: 'accept', applicant: null })}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteConfirm}
                className={`px-4 py-2 text-white font-bold text-xs rounded-xl shadow-xs transition ${
                  confirmModal.type === 'accept'
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                    : 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                }`}
              >
                {confirmModal.type === 'accept' ? 'Xác nhận tuyển dụng' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Public Student Profile Modal for Employer (Sprint 3.1) */}
      <PublicStudentProfileModal
        isOpen={Boolean(viewingStudentProfile)}
        onClose={() => setViewingStudentProfile(null)}
        studentProfile={viewingStudentProfile}
        studentProjects={viewingStudentProjects}
      />

      {/* Review Modal for Employer rating Student (Sprint 4) */}
      {reviewModalState.isOpen && (
        <ReviewModal
          isOpen={reviewModalState.isOpen}
          onClose={() => setReviewModalState({ isOpen: false, applicant: null })}
          jobId={reviewModalState.applicant?.jobId}
          jobTitle={reviewModalState.applicant?.jobTitle}
          revieweeId={reviewModalState.applicant?.studentId}
          revieweeName={reviewModalState.applicant?.name}
          revieweeRole="student"
          onSuccess={() => {
            alert('Cảm ơn bạn! Đánh giá sinh viên đã được ghi nhận.');
            loadApplicants();
          }}
        />
      )}
    </div>
  );
}
