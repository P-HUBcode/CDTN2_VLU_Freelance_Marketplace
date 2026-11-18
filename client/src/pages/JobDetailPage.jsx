import React from 'react';
import Badge from '../components/common/Badge';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Calendar,
  Bookmark,
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertTriangle,
  Award,
  Share2,
  TrendingUp,
  Percent,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export default function JobDetailPage({
  job,
  onBack,
  onApply,
  onToggleBookmark,
  isBookmarked = false,
  isAlreadyApplied = false,
  onViewCompany,
  onOpenChatWithEmployer
}) {
  if (!job) return null;

  const matching = job.matchingScore || {
    percentage: 87,
    reasons: [
      { text: 'Bạn có kỹ năng Canva', status: 'match' },
      { text: 'Bạn có kỹ năng Content', status: 'match' },
      { text: 'Thời gian làm việc phù hợp', status: 'match' },
      { text: 'Chưa có kinh nghiệm 1 năm', status: 'warn' }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top breadcrumb navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại sàn việc làm</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleBookmark(job.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              isBookmarked
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current text-amber-500' : ''}`} />
            <span>{isBookmarked ? 'Đã lưu' : 'Lưu công việc'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Job Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={job.companyLogo}
                  alt={job.company}
                  onClick={() => onViewCompany && onViewCompany(job)}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm cursor-pointer hover:opacity-85 transition"
                  title="Xem hồ sơ doanh nghiệp"
                />
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {job.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => onViewCompany && onViewCompany(job)}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 transition"
                    >
                      <span>{job.company}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    {job.verified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <ShieldCheck className="w-3 h-3" />
                        Doanh nghiệp đã xác thực
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-amber-500 font-bold ml-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {job.employerRating || '4.8'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant={job.workMode === 'Remote' ? 'primary' : 'neutral'}>
                  {job.workMode}
                </Badge>
                <Badge variant="outline">{job.type}</Badge>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Thù lao đề xuất</span>
                <span className="text-sm font-bold text-blue-600 mt-0.5 block">{job.salary}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Địa điểm làm việc</span>
                <span className="text-slate-800 font-semibold mt-0.5 block truncate">{job.location}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Hạn nộp hồ sơ</span>
                <span className="text-slate-800 font-semibold mt-0.5 block">{job.deadline}</span>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-subtle space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-3">Mô tả công việc</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Trách nhiệm & Nhiệm vụ chính</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Yêu cầu đối với sinh viên</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-2" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Skills */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Kỹ năng cần thiết</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Working Time */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Thời gian làm việc</h3>
              <p className="text-sm text-slate-600 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{job.workingHours}</span>
              </p>
            </div>

            {/* Benefits */}
            {job.benefits && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Quyền lợi & Hỗ trợ sinh viên</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  {job.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Application Card & Matching Score */}
        <div className="space-y-6 lg:sticky lg:top-20">
          {/* Application Box */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-subtle space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Thù lao công việc</span>
              <div className="text-2xl font-extrabold text-blue-600 mt-1">{job.salary}</div>
              <span className="text-xs text-slate-500 mt-0.5 block">Ký quỹ bảo đảm thù lao 100% qua StudentHub</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Thời gian
                </span>
                <span className="font-semibold text-slate-900">{job.workingHours}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  Hình thức
                </span>
                <span className="font-semibold text-slate-900">{job.workMode}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Hạn chót
                </span>
                <span className="font-semibold text-slate-900">{job.deadline}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  Ứng viên
                </span>
                <span className="font-semibold text-slate-900">{job.applicantsCount} bạn sinh viên đã nộp</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5 pt-2">
              {isAlreadyApplied ? (
                <div className="w-full py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Đã ứng tuyển (Hồ sơ đang xét duyệt)</span>
                </div>
              ) : job.status === 'closed' ? (
                <div className="w-full py-3 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Tin tuyển dụng đã đóng</span>
                </div>
              ) : job.deadline && new Date(job.deadline).setHours(23, 59, 59, 999) < Date.now() ? (
                <div className="w-full py-3 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>Đã hết hạn ứng tuyển</span>
                </div>
              ) : (
                <button
                  onClick={() => onApply(job)}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Ứng tuyển ngay</span>
                  <span className="text-blue-200">→</span>
                </button>
              )}

              {/* Nút Nhắn tin với Nhà tuyển dụng */}
              {onOpenChatWithEmployer && (
                <button
                  type="button"
                  onClick={() => onOpenChatWithEmployer(job.company)}
                  className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl border border-blue-200 transition flex items-center justify-center gap-2 active:scale-98"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>Nhắn tin với Nhà tuyển dụng</span>
                </button>
              )}

              <button
                onClick={() => onToggleBookmark(job.id)}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current text-amber-500' : ''}`} />
                <span>{isBookmarked ? 'Đã lưu công việc' : '♡ Lưu công việc'}</span>
              </button>
            </div>
          </div>

          {/* MATCHING SCORE SECTION (AI Profile Matcher) */}
          <div className="bg-white rounded-3xl border border-blue-100 p-5 shadow-subtle space-y-3.5 bg-gradient-to-br from-white to-blue-50/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900">
                  Công việc này có phù hợp với bạn?
                </h4>
              </div>
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-extrabold rounded-full">
                {matching.percentage}% phù hợp
              </span>
            </div>

            <div className="space-y-2 text-xs pt-1">
              {matching.reasons.map((r, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  {r.status === 'match' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <span
                    className={
                      r.status === 'match'
                        ? 'text-slate-700 font-medium'
                        : 'text-amber-800 font-medium'
                    }
                  >
                    {r.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Employer Verification Summary */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Chính sách bảo vệ Sinh viên</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              100% việc làm trên StudentHub được kiểm duyệt mã số thuế, ký quỹ thù lao minh bạch và cam kết hỗ trợ xác nhận thực tập.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
