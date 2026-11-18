import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Mail, CheckCircle2, Clock, Calendar, AlertCircle, RefreshCw, ExternalLink, ShieldCheck } from 'lucide-react';
import { fetchRecentEmails } from '../../lib/emailService';

export default function EmailPreviewModal({ isOpen, onClose, targetEmail = null }) {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadEmails = async () => {
    setIsLoading(true);
    try {
      const data = await fetchRecentEmails();
      setEmails(data || []);
      if (targetEmail) {
        const found = data.find(e => e.id === targetEmail.id || e.to === targetEmail.to);
        setSelectedEmail(found || data[0] || null);
      } else if (data.length > 0 && !selectedEmail) {
        setSelectedEmail(data[0]);
      }
    } catch (e) {
      console.warn('Lỗi load emails:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadEmails();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getEmailBadge = (type) => {
    switch (type) {
      case 'application_submitted':
        return { label: 'Xác nhận nộp đơn', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'interview_invitation':
        return { label: 'Thư mời phỏng vấn', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'job_offer_accepted':
        return { label: 'Trúng tuyển / Nhận việc', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'rejection':
        return { label: 'Thông báo kết quả', color: 'bg-slate-100 text-slate-800 border-slate-200' };
      default:
        return { label: 'Thông báo hệ thống', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📧 Hộp Thư Thông Báo Tuyển Dụng & Trạng Thái (Email Service)"
      maxWidth="max-w-5xl"
    >
      <div className="space-y-4">
        {/* Header alert */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Hệ thống thông báo qua Gmail tự động của StudentHub</p>
              <p className="text-blue-700 mt-0.5">
                Các email (Xác nhận nộp hồ sơ, Hẹn phỏng vấn, Trúng tuyển, Từ chối) được gửi tự động đến Gmail của ứng viên.
                (Lưu ý: Trạng thái <em>Đang xem xét</em> không gửi email theo quy định).
              </p>
            </div>
          </div>
          <button
            onClick={loadEmails}
            disabled={isLoading}
            className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-700 transition shrink-0"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Master-Detail layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[520px]">
          {/* Left column: Email list */}
          <div className="md:col-span-5 border border-slate-200 rounded-2xl p-2 overflow-y-auto space-y-1.5 bg-slate-50/50">
            {emails.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                <Mail className="w-8 h-8 text-slate-300 mx-auto stroke-1" />
                <p>Chưa có email nào được gửi trong phiên làm việc này.</p>
                <p className="text-[11px] text-slate-400">Hãy thử ứng tuyển một công việc hoặc chuyển trạng thái ứng viên trên Kanban!</p>
              </div>
            ) : (
              emails.map((em) => {
                const badge = getEmailBadge(em.type);
                const isSelected = selectedEmail?.id === em.id;
                return (
                  <div
                    key={em.id}
                    onClick={() => setSelectedEmail(em)}
                    className={`p-3 rounded-xl border cursor-pointer transition text-left ${
                      isSelected
                        ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(em.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 truncate">{em.subject}</p>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                      <span className="truncate">Tới: <strong>{em.to}</strong></span>
                      {em.isLiveSent ? (
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Đã gửi Gmail
                        </span>
                      ) : (
                        <span className="text-[10px] text-blue-600 font-medium">Đã ghi nhận</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right column: Rendered Email Preview */}
          <div className="md:col-span-7 border border-slate-200 rounded-2xl overflow-hidden flex flex-col bg-white">
            {selectedEmail ? (
              <>
                {/* Email metadata bar */}
                <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm truncate">{selectedEmail.subject}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(selectedEmail.sentAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span><strong>Từ:</strong> {selectedEmail.from}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span><strong>Người nhận:</strong> <span className="text-blue-700 font-semibold">{selectedEmail.to}</span></span>
                  </div>
                </div>

                {/* Email HTML iframe preview */}
                <div className="flex-1 bg-slate-100 p-2 overflow-hidden">
                  <iframe
                    title="Nội dung Email"
                    srcDoc={selectedEmail.html}
                    className="w-full h-full bg-white rounded-xl border border-slate-200 shadow-inner"
                    sandbox="allow-same-origin"
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-xs text-slate-400 space-y-2 p-6">
                <Mail className="w-10 h-10 text-slate-300 stroke-1" />
                <p>Chọn một email bên trái để xem nội dung chi tiết</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Hệ thống Nodemailer kết nối trực tiếp Backend API `http://localhost:5000/api/emails`</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
}
