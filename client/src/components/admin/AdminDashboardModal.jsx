import React, { useState } from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import {
  ShieldAlert,
  Users,
  Briefcase,
  Building2,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Trash2,
  ExternalLink,
  Search
} from 'lucide-react';

export default function AdminDashboardModal({
  isOpen,
  onClose,
  jobs = [],
  appliedJobs = [],
  onDeleteJob,
  onApproveJob,
  onShowToast
}) {
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'users' | 'applications'
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bảng Điều Khiển Quản Trị Hệ Thống (Admin Dashboard)"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-5">
        {/* Admin Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl">
            <span className="text-[11px] font-bold text-blue-600 block">Tổng tin tuyển dụng</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{jobs.length} tin</span>
          </div>
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl">
            <span className="text-[11px] font-bold text-indigo-600 block">Hồ sơ ứng tuyển</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">{appliedJobs.length} đơn</span>
          </div>
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
            <span className="text-[11px] font-bold text-emerald-600 block">Sinh viên đã xác minh</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">1.240 bạn</span>
          </div>
          <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-xl">
            <span className="text-[11px] font-bold text-purple-600 block">Doanh nghiệp đối tác</span>
            <span className="text-xl font-extrabold text-slate-900 mt-0.5 block">158 đơn vị</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'jobs' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Quản lý Tin Việc làm ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'applications' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Hồ sơ Ứng tuyển ({appliedJobs.length})
            </button>
          </div>

          <span className="text-[11px] text-slate-400">Quyền hạn: Toàn quyền SuperAdmin</span>
        </div>

        {/* Table of Jobs */}
        {activeTab === 'jobs' && (
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Tiêu đề tin tuyển dụng</th>
                    <th className="py-2.5 px-4">Công ty</th>
                    <th className="py-2.5 px-4">Thù lao</th>
                    <th className="py-2.5 px-4">Trạng thái</th>
                    <th className="py-2.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-4 font-bold text-slate-900 truncate max-w-xs">
                        {job.title}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{job.company}</td>
                      <td className="py-2.5 px-4 font-semibold text-blue-600">{job.salary}</td>
                      <td className="py-2.5 px-4">
                        <Badge variant="success" size="sm">Đã duyệt</Badge>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa tin "${job.title}"?`)) {
                              if (onDeleteJob) onDeleteJob(job.id);
                              if (onShowToast) onShowToast('Đã xóa tin tuyển dụng vi phạm.');
                            }
                          }}
                          className="p-1 hover:bg-rose-50 rounded text-rose-600"
                          title="Xóa tin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Table of Applications */}
        {activeTab === 'applications' && (
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Vị trí ứng tuyển</th>
                    <th className="py-2.5 px-4">Doanh nghiệp</th>
                    <th className="py-2.5 px-4">Ngày nộp</th>
                    <th className="py-2.5 px-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {appliedJobs.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-4 font-bold text-slate-900">{app.jobTitle}</td>
                      <td className="py-2.5 px-4 text-slate-600">{app.company}</td>
                      <td className="py-2.5 px-4 text-slate-400">{app.appliedDate}</td>
                      <td className="py-2.5 px-4">
                        <Badge variant="primary" size="sm">{app.statusText || app.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
