import React, { useState } from 'react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Calendar,
  DollarSign,
  ArrowRight,
  Upload,
  CheckSquare,
  Square,
  ExternalLink,
  ShieldCheck,
  FileText,
  MessageSquare,
  Layers,
  AlertCircle,
  Wallet
} from 'lucide-react';

export default function MyProjectsPage({
  projects = [],
  onUpdateProjectProgress,
  onOpenChatWithEmployer,
  onShowToast,
  currentUser,
  role = 'student'
}) {
  const [activeTab, setActiveTab] = useState('all'); // all | in_progress | pending_review | completed | cancelled
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectModalTab, setProjectModalTab] = useState('tasks'); // overview | tasks | files | messages | payments

  // Submission form state
  const [deliveryFile, setDeliveryFile] = useState('https://figma.com/file/student-project-submission');
  const [deliveryNote, setDeliveryNote] = useState('Em đã hoàn thành đủ các hạng mục theo brief, gửi Anh/Chị nghiệm thu ạ!');

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'in_progress', label: 'Đang thực hiện' },
    { id: 'pending_review', label: 'Chờ duyệt' },
    { id: 'completed', label: 'Hoàn thành' },
    { id: 'cancelled', label: 'Đã hủy' },
  ];

  const filteredProjects = projects.filter((p) => {
    if (activeTab === 'all') return true;
    return p.status === activeTab;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_progress':
        return <Badge variant="primary">Đang thực hiện</Badge>;
      case 'pending_review':
        return <Badge variant="warning">Chờ duyệt</Badge>;
      case 'completed':
        return <Badge variant="success">Hoàn thành</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Đã hủy</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const handleToggleTask = (taskIndex) => {
    if (!selectedProject) return;
    const updatedTasks = [...selectedProject.tasks];
    updatedTasks[taskIndex].completed = !updatedTasks[taskIndex].completed;

    const completedCount = updatedTasks.filter((t) => t.completed).length;
    const newProgress = Math.round((completedCount / updatedTasks.length) * 100);

    const updated = {
      ...selectedProject,
      tasks: updatedTasks,
      progress: newProgress,
      status: newProgress === 100 ? 'pending_review' : 'in_progress',
    };

    setSelectedProject(updated);
    if (onUpdateProjectProgress) {
      onUpdateProjectProgress(updated);
    }
  };

  const handleSubmitDelivery = (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    const updated = {
      ...selectedProject,
      status: 'pending_review',
      progress: 100,
      deliveryFile,
      deliveryNote,
    };
    if (onUpdateProjectProgress) {
      onUpdateProjectProgress(updated);
    }
    setSelectedProject(updated);
    if (onShowToast) {
      onShowToast('🎉 Đã nộp sản phẩm nghiệm thu! Đang chờ Client kiểm tra & giải ngân.');
    }
  };

  const handleApproveAndRelease = () => {
    if (!selectedProject) return;
    const updated = {
      ...selectedProject,
      status: 'completed',
      progress: 100,
    };
    setSelectedProject(updated);
    if (onUpdateProjectProgress) {
      onUpdateProjectProgress(updated);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dự án & Tiến độ bàn giao
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản lý các project freelance, theo dõi checklist đầu việc, nộp hoặc kiểm tra sản phẩm bàn giao và nghiệm thu giải ngân.
          </p>
        </div>

        {/* Tabs Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Không có project nào trong mục này"
          description="Khám phá việc làm hoặc nhận thêm các yêu cầu freelance để tích lũy kinh nghiệm!"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-subtle hover:border-blue-500/50 hover:shadow-cardHover transition-all flex flex-col justify-between"
            >
              <div>
                {/* Top header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-blue-600 block">
                      {role === 'employer' ? `Freelancer: ${proj.studentName || 'Sinh viên Freelancer'}` : `Client: ${proj.client || proj.employerName || 'Doanh nghiệp'}`}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {proj.title}
                    </h3>
                  </div>
                  {getStatusBadge(proj.status)}
                </div>

                {/* Deadline & Budget */}
                <div className="mt-4 grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Hạn bàn giao</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {proj.deadline}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Ngân sách / Budget</span>
                    <span className="font-bold text-blue-600 flex items-center gap-1 mt-0.5">
                      <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                      {proj.budget}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">Tiến độ công việc</span>
                    <div className="flex items-center gap-2">
                      {proj.remainingDays > 0 && (
                        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          Còn {proj.remainingDays} ngày
                        </span>
                      )}
                      <span className="text-blue-600 font-bold">{proj.progress}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                {/* Pending Review Callout */}
                {proj.status === 'pending_review' && (
                  <div className="mt-4 p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs">
                    <span className="text-amber-800 font-semibold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      Đang chờ nghiệm thu & giải ngân {proj.budget}
                    </span>
                  </div>
                )}

                {/* Next Task Callout */}
                {proj.status === 'in_progress' && proj.nextTask && (
                  <div className="mt-4 p-2.5 bg-blue-50/50 rounded-xl border border-blue-100/60 flex items-center gap-2 text-xs">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-slate-700">
                      Nhiệm vụ tiếp theo: <strong>{proj.nextTask}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* CTAs */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    const chatTarget = role === 'employer'
                      ? (proj.studentName || 'Sinh viên Freelancer')
                      : (proj.client || proj.employerName || 'Client Hợp đồng');
                    if (onOpenChatWithEmployer) onOpenChatWithEmployer(chatTarget);
                  }}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 hover:underline flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{role === 'employer' ? 'Nhắn tin với Freelancer' : 'Trao đổi với Client'}</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedProject(proj);
                    setProjectModalTab('tasks');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm transition active:scale-95"
                >
                  <span>Mở project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL PROJECT DETAIL MODAL (Trang 14 – Project Detail) */}
      {selectedProject && (
        <Modal
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          title={`Project: ${selectedProject.title}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-5">
            {/* Project Header Info */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">
                  {role === 'employer' ? 'Sinh viên thực hiện (Freelancer)' : 'Khách hàng / Doanh nghiệp'}
                </p>
                <h3 className="text-sm font-bold text-slate-900">
                  {role === 'employer' ? (selectedProject.studentName || 'Sinh viên Freelancer') : (selectedProject.client || selectedProject.employerName || 'Khách hàng')}
                </h3>
                <span className="text-sm font-extrabold text-blue-600 block mt-0.5">
                  Thù lao: {selectedProject.budget}
                </span>
              </div>

              <div className="sm:text-right space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Hạn chót: {selectedProject.deadline} (Còn {selectedProject.remainingDays || 4} ngày)</span>
                </div>
                <div className="text-xs text-slate-500">
                  Tiến độ hoàn thành: <strong className="text-blue-600">{selectedProject.progress}%</strong>
                </div>
              </div>
            </div>

            {/* Project Detail Tabs: Overview, Tasks, Files, Messages, Payments */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
              {[
                { id: 'tasks', label: 'Tasks (Đầu việc)' },
                { id: 'overview', label: 'Overview' },
                { id: 'files', label: 'Files & Tài liệu' },
                { id: 'payments', label: 'Thanh toán Escrow' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setProjectModalTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    projectModalTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB: TASKS (CHECKLIST) */}
            {projectModalTab === 'tasks' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Checklist tiến độ (Bấm để cập nhật):
                  </h4>
                  <span className="text-xs text-slate-400">
                    {selectedProject.tasks?.filter((t) => t.completed).length} / {selectedProject.tasks?.length} hoàn thành
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedProject.tasks?.map((t, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleToggleTask(idx)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        t.completed
                          ? 'bg-emerald-50/40 border-emerald-200 text-slate-700 line-through'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      {t.completed ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="text-xs font-medium">{t.name}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery Submission Box */}
                {selectedProject.status === 'in_progress' && (
                  role === 'employer' ? (
                    <div className="p-4 border border-blue-100 bg-blue-50/60 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>Sinh viên đang thực hiện dự án (Tiến độ: {selectedProject.progress}%)</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Sinh viên <strong>{selectedProject.studentName || 'Freelancer'}</strong> đang hoàn thiện các đầu việc theo thỏa thuận. Khi sản phẩm được nộp, link sản phẩm sẽ hiển thị tại đây để bạn kiểm tra và duyệt giải ngân.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitDelivery} className="p-4 border border-blue-100 bg-blue-50/40 rounded-2xl space-y-3 pt-4">
                      <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span>Nộp sản phẩm bàn giao & yêu cầu nghiệm thu</span>
                      </h4>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Link file bàn giao (Google Drive, Figma, Canva, GitHub...):
                        </label>
                        <input
                          type="url"
                          value={deliveryFile}
                          onChange={(e) => setDeliveryFile(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                          placeholder="https://drive.google.com/..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Ghi chú gửi Client:
                        </label>
                        <textarea
                          rows={2}
                          value={deliveryNote}
                          onChange={(e) => setDeliveryNote(e.target.value)}
                          className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        Gửi nghiệm thu & Yêu cầu giải ngân {selectedProject.budget}
                      </button>
                    </form>
                  )
                )}

                {/* Pending Review Box */}
                {selectedProject.status === 'pending_review' && (
                  <div className="p-4 border border-amber-200 bg-amber-50/70 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Sản phẩm đã bàn giao — Đang chờ kiểm tra & giải ngân</span>
                    </div>

                    <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-amber-200/60 space-y-1.5">
                      <div>
                        <span className="font-semibold text-slate-700">Link sản phẩm bàn giao:</span>{' '}
                        <a
                          href={selectedProject.deliveryFile || deliveryFile}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 font-medium underline inline-flex items-center gap-1 ml-1 break-all"
                        >
                          {selectedProject.deliveryFile || deliveryFile}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <p>
                        <span className="font-semibold text-slate-700">Ghi chú:</span>{' '}
                        {selectedProject.deliveryNote || deliveryNote}
                      </p>
                    </div>

                    <div className="pt-1">
                      {role === 'employer' ? (
                        <>
                          <button
                            type="button"
                            onClick={handleApproveAndRelease}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Xác nhận nghiệm thu & Giải ngân {selectedProject.budget} vào Ví sinh viên</span>
                          </button>
                          <p className="text-[11px] text-center text-slate-500 mt-2">
                            Bấm nút trên để xác nhận sản phẩm đạt yêu cầu và chuyển tiền thù lao từ Escrow vào Ví của sinh viên ngay lập tức.
                          </p>
                        </>
                      ) : (
                        <div className="p-3 bg-white/80 rounded-xl border border-amber-200 text-center text-xs text-amber-900 font-medium">
                          ⏳ Bạn đã gửi sản phẩm nghiệm thu thành công! Đang chờ Khách hàng kiểm tra sản phẩm và giải ngân {selectedProject.budget} vào Ví của bạn.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Completed Box */}
                {selectedProject.status === 'completed' && (
                  <div className="p-4 border border-emerald-200 bg-emerald-50/80 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Dự án đã nghiệm thu thành công & Hoàn tất giải ngân!</span>
                    </div>
                    <p className="text-xs text-emerald-700 leading-relaxed">
                      Toàn bộ số tiền thù lao <strong>{selectedProject.budget}</strong> đã được chuyển từ tài khoản ký quỹ Escrow vào <strong>Số dư khả dụng</strong> trong Ví của bạn.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: OVERVIEW */}
            {projectModalTab === 'overview' && (
              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p>
                  <strong>Mô tả dự án:</strong> Dự án thiết kế trọn gói các ấn phẩm truyền thông cho chuỗi F&B ABC Coffee trong chiến dịch tháng 11.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <p>• <strong>Kênh đăng:</strong> Facebook Fanpage, Instagram Feed & Story.</p>
                  <p>• <strong>Kích thước chuẩn:</strong> 1080x1080px (Square) và 1080x1920px (Story).</p>
                  <p>• <strong>Yêu cầu file:</strong> Xuất định dạng PNG không vỡ hạt và chia sẻ link Canva có thể chỉnh sửa.</p>
                </div>
              </div>
            )}

            {/* TAB: FILES */}
            {projectModalTab === 'files' && (
              <div className="space-y-2">
                {selectedProject.files?.map((file, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <div>
                        <span className="font-bold text-slate-800 block">{file.name}</span>
                        <span className="text-[11px] text-slate-400">{file.size} • Tải lên ngày {file.date}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Đang tải file ${file.name}...`)}
                      className="px-3 py-1 bg-white border border-slate-200 hover:bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg"
                    >
                      Tải về
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: PAYMENTS */}
            {projectModalTab === 'payments' && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Ký quỹ thù lao an toàn (Escrow Secured)</span>
                </div>
                <p className="text-emerald-700 leading-relaxed">
                  Client ABC Coffee đã ký quỹ trước số tiền <strong>{selectedProject.budget}</strong> vào tài khoản trung gian của StudentHub. Tiền sẽ được chuyển ngay vào Ví của bạn sau khi client bấm nút nghiệm thu.
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
