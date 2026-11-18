import React, { useState } from 'react';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import {
  FileCheck2,
  CheckCircle2,
  Clock,
  Calendar,
  MessageSquare,
  Building2,
  ExternalLink,
  AlertCircle,
  HelpCircle,
  XCircle,
  FileText,
  Star,
  Briefcase
} from 'lucide-react';
import { getCvSignedUrl } from '../lib/applicationService';
import ReviewModal from '../components/common/ReviewModal';

export default function AppliedJobsPage({
  appliedJobs = [],
  loading = false,
  onNavigate,
  onOpenChatWithEmployer,
  onCancelApplication
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [reviewModalState, setReviewModalState] = useState({ isOpen: false, app: null });

  const handleOpenReviewModal = (app) => {
    setReviewModalState({ isOpen: true, app });
  };

  const handleOpenCv = async (cvPath) => {
    if (!cvPath) return;
    try {
      const signedUrl = await getCvSignedUrl(cvPath);
      if (signedUrl) {
        window.open(signedUrl, '_blank');
      } else {
        alert('Không thể tạo liên kết bảo mật để mở CV. Vui lòng kiểm tra lại quyền truy cập.');
      }
    } catch (err) {
      console.error('Lỗi khi mở CV:', err);
    }
  };

  // Timeline steps
  const steps = [
    { key: 'pending', label: 'Đã gửi hồ sơ' },
    { key: 'reviewing', label: 'Đang xem xét' },
    { key: 'interview', label: 'Phỏng vấn' },
    { key: 'hired', label: 'Được nhận' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'applied':
      case 'pending':
      case 'submitted':
      case 'new':
        return 0;
      case 'reviewing':
      case 'shortlisted':
        return 1;
      case 'interview':
        return 2;
      case 'hired':
      case 'accepted':
        return 3;
      case 'rejected':
        return -1;
      default:
        return 0;
    }
  };

  const filteredList = appliedJobs.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'applied') return ['applied', 'pending', 'new', 'submitted'].includes(item.status);
    if (activeFilter === 'reviewing') return item.status === 'reviewing' || item.status === 'shortlisted';
    if (activeFilter === 'interview') return item.status === 'interview';
    if (activeFilter === 'accepted' || activeFilter === 'hired') return item.status === 'accepted' || item.status === 'hired';
    if (activeFilter === 'rejected') return item.status === 'rejected';
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Việc đã ứng tuyển
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi tiến trình xét duyệt hồ sơ từ các nhà tuyển dụng theo thời gian thực.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({appliedJobs.length})
          </button>
          <button
            onClick={() => setActiveFilter('reviewing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === 'reviewing'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đang xem xét
          </button>
          <button
            onClick={() => setActiveFilter('interview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === 'interview'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Phỏng vấn
          </button>
          <button
            onClick={() => setActiveFilter('accepted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === 'accepted' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Được nhận
          </button>
          <button
            onClick={() => setActiveFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeFilter === 'rejected' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Từ chối
          </button>
        </div>
      </div>

      {/* Applied List */}
      {filteredList.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="Chưa có hồ sơ ứng tuyển nào trong mục này"
          description="Hãy khám phá các cơ hội việc làm part-time hấp dẫn trên Marketplace và nộp đơn ngay!"
          actionLabel="Khám phá việc làm"
          onAction={() => onNavigate('marketplace')}
        />
      ) : (
        <div className="space-y-4">
          {filteredList.map((app) => {
            const currentStepIdx = getStepIndex(app.status);
            const isRejected = app.status === 'rejected';

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:border-slate-300 transition space-y-5"
              >
                {/* Header row: Employer info, salary, action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <img
                      src={app.companyLogo}
                      alt={app.company}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-100 shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-900 hover:text-blue-600 transition">
                        {app.jobTitle}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-700">{app.company}</span>
                        <span>•</span>
                        <span>Nộp ngày {app.appliedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:self-center">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs text-slate-400 block font-medium">Thù lao</span>
                      <span className="text-xs font-bold text-blue-600">{app.expectedSalary || app.salary}</span>
                    </div>

                    <button
                      onClick={() => onOpenChatWithEmployer(app.company)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Nhắn tin</span>
                    </button>
                  </div>
                </div>

                {/* Timeline Component: Đã gửi hồ sơ → Đang xem xét → Phỏng vấn → Được nhận */}
                {!isRejected ? (
                  <div className="pt-2">
                    <div className="relative">
                      {/* Connecting Line */}
                      <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-slate-100 -z-0">
                        <div
                          className="h-full bg-blue-600 transition-all duration-500"
                          style={{
                            width: `${(currentStepIdx / (steps.length - 1)) * 100}%`,
                          }}
                        />
                      </div>

                      {/* Step Nodes */}
                      <div className="relative z-10 flex items-center justify-between">
                        {steps.map((step, idx) => {
                          const isDone = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;

                          return (
                            <div key={step.key} className="flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                  isCurrent
                                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md scale-110'
                                    : isDone
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border-2 border-slate-200 text-slate-400'
                                }`}
                              >
                                {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                              </div>
                              <span
                                className={`text-[11px] sm:text-xs mt-2 font-medium tracking-tight text-center ${
                                  isCurrent
                                    ? 'text-blue-700 font-bold'
                                    : isDone
                                    ? 'text-slate-800'
                                    : 'text-slate-400'
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
                    <XCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>Hồ sơ chưa phù hợp trong đợt tuyển này. Đừng nản lòng, hãy ứng tuyển thêm các công việc khác!</span>
                  </div>
                )}

                {/* Additional Note / Interview Details */}
                {app.interviewSchedule && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                    <Calendar className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Lịch hẹn trao đổi / Phỏng vấn:</span> {app.interviewSchedule}
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        Hình thức: Google Meet qua link gửi trong mục Tin nhắn.
                      </p>
                    </div>
                  </div>
                )}

                {/* Cover Letter preview */}
                {app.coverLetter && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 space-y-1">
                    <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">Thư giới thiệu đã gửi:</span>
                    <p className="line-clamp-2 leading-relaxed">{app.coverLetter}</p>
                  </div>
                )}

                {/* Footer notes & withdraw option */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span>Trạng thái: <strong className="text-blue-600">{app.statusText || 'Đang chờ HR phản hồi'}</strong></span>
                    {app.cvUrl && (
                      <button
                        onClick={() => handleOpenCv(app.cvUrl)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Xem lại CV</span>
                      </button>
                    )}

                    {(app.status === 'accepted' || app.status === 'hired') && (
                      <>
                        <button
                          onClick={() => onNavigate('my-projects')}
                          className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 text-xs font-bold transition shadow-xs"
                          title="Xem tiến độ công việc và bàn giao"
                        >
                          <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                          <span>Dự án & Tiến độ</span>
                        </button>
                        <button
                          onClick={() => handleOpenReviewModal(app)}
                          className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 text-xs font-bold transition shadow-xs"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>Đánh giá</span>
                        </button>
                      </>
                    )}
                  </div>

                  {currentStepIdx < 2 && onCancelApplication && (
                    <button
                      onClick={() => onCancelApplication(app.id)}
                      className="text-slate-400 hover:text-rose-600 text-xs transition"
                    >
                      Rút hồ sơ
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal for Student rating Employer (Sprint 4) */}
      {reviewModalState.isOpen && (
        <ReviewModal
          isOpen={reviewModalState.isOpen}
          onClose={() => setReviewModalState({ isOpen: false, app: null })}
          jobId={reviewModalState.app?.jobId || reviewModalState.app?.id}
          jobTitle={reviewModalState.app?.jobTitle || reviewModalState.app?.title}
          revieweeId={reviewModalState.app?.employerId || reviewModalState.app?.companyId || 'b0000000-0000-0000-0000-000000000002'}
          revieweeName={reviewModalState.app?.company || 'Doanh nghiệp tuyển dụng'}
          revieweeRole="employer"
          onSuccess={() => {
            alert('Cảm ơn bạn! Đánh giá doanh nghiệp đã được gửi thành công.');
          }}
        />
      )}
    </div>
  );
}
