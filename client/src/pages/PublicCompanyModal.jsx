import React from 'react';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import {
  Building2,
  Globe,
  MapPin,
  Mail,
  Phone,
  Users,
  Calendar,
  Briefcase,
  ShieldCheck,
  ExternalLink,
  DollarSign,
  Clock,
  Sparkles
} from 'lucide-react';

export default function PublicCompanyModal({
  isOpen,
  onClose,
  company,
  jobs = [],
  onSelectJob
}) {
  if (!isOpen || !company) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thông tin Doanh nghiệp & Việc làm Tuyển dụng"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Header Cover & Logo */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white">
          <div className="h-32 sm:h-44 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 relative overflow-hidden">
            {company.cover_url && (
              <img
                src={company.cover_url}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-slate-900/15" />
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Đối tác đã xác thực</span>
            </div>
          </div>

          <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-12 sm:-mt-14">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <img
                src={company.logo_url || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=160&auto=format&fit=crop&q=80'}
                alt={company.company_name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-md bg-white shrink-0"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {company.company_name}
                  </h2>
                  <Badge variant="blue">{company.industry || 'Truyền thông'}</Badge>
                </div>
                <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate max-w-md">{company.location}</span>
                </p>
              </div>
            </div>

            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Trang web công ty</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* 2-Column Info & Active Jobs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Quick Details */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Tổng quan doanh nghiệp
              </h3>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Quy mô: {company.company_size || '10 - 50 nhân viên'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Thành lập: {company.founded_year || '2020'}</span>
                </div>
                {company.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{company.contact_email}</span>
                  </div>
                )}
                {company.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{company.contact_phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 space-y-1.5 text-emerald-900">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Cam kết quyền lợi sinh viên
              </span>
              <p className="text-[11px] text-emerald-700 leading-relaxed font-normal">
                Doanh nghiệp đã ký cam kết ký quỹ minh bạch, thanh toán thù lao đúng hạn và tạo điều kiện làm việc linh hoạt theo lịch thi cử của sinh viên.
              </p>
            </div>
          </div>

          {/* Right Column: Bio & Job Openings */}
          <div className="lg:col-span-2 space-y-5">
            {/* Description */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Về chúng tôi & Môi trường làm việc
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {company.description || 'Doanh nghiệp chưa cập nhật mô tả chi tiết.'}
              </p>
            </div>

            {/* Jobs Openings */}
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Vị trí đang mở tuyển ({jobs.length})</span>
              </h3>

              {jobs.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-xs text-slate-500">Hiện tại doanh nghiệp chưa có vị trí tuyển dụng mới.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {job.title}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                            {job.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="font-semibold text-emerald-600">{job.salary}</span>
                          <span>•</span>
                          <span>{job.location}</span>
                          <span>•</span>
                          <span>Hạn: {job.deadline}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          if (onSelectJob) onSelectJob(job);
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0"
                      >
                        Ứng tuyển ngay →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
