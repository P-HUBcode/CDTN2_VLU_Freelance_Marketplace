import React from 'react';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import {
  Star,
  Clock,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Sparkles,
  DollarSign,
  AlertCircle
} from 'lucide-react';

export default function ServiceDetailModal({
  isOpen,
  onClose,
  service,
  onHire,
  onOpenChat,
  currentUser
}) {
  if (!service) return null;

  const isOwner = Boolean(
    currentUser && (
      (service.studentId && currentUser.id && service.studentId === currentUser.id) ||
      (service.studentEmail && currentUser.email && service.studentEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      (service.studentName && currentUser.name && service.studentName.trim().toLowerCase() === currentUser.name.trim().toLowerCase())
    )
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết gói dịch vụ Freelance"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Cover / Service Image */}
        <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="primary" size="sm">
              {service.category}
            </Badge>
          </div>
        </div>

        {/* Title & Student Info */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {service.title}
            </h2>
            <div className="flex items-center gap-2.5 pt-1">
              <img
                src={service.studentAvatar}
                alt={service.studentName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
              />
              <div>
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{service.studentName}</span>
                  <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-semibold">
                    {service.studentUniversity}
                  </span>
                </p>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-slate-800">{service.rating}</span>
                  <span className="text-slate-400 font-normal">({service.reviewsCount} đánh giá hoàn thành)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Highlight Box */}
          <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl shrink-0 sm:text-right">
            <span className="text-[11px] text-slate-500 block font-medium">Giá trọn gói</span>
            <div className="text-2xl font-extrabold text-blue-600 mt-0.5">
              {new Intl.NumberFormat('vi-VN').format(service.startingPrice)}đ
            </div>
            <span className="text-[11px] text-slate-500 flex items-center sm:justify-end gap-1 mt-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Giao hàng: <strong>{service.deliveryDays} ngày</strong>
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Mô tả dịch vụ:
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {service.description}
          </p>
        </div>

        {/* What's included checklist */}
        {service.includes && (
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Gói dịch vụ bao gồm:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {service.includes.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Safety Escrow notice */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <span>
            Thanh toán được ký quỹ an toàn qua <strong>StudentHub Escrow</strong>. Tiền chỉ được chuyển cho sinh viên khi bạn bấm nghiệm thu hài lòng.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          {isOwner ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full p-3 bg-amber-50 border border-amber-200 rounded-xl gap-2">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Đây là gói dịch vụ do bạn đăng bán (Bạn không thể tự nhận/thuê dịch vụ của chính mình).</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition self-end sm:self-auto"
              >
                Đóng
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-end w-full gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenChat) onOpenChat(service.studentName);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Nhắn tin trao đổi</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onHire) onHire(service);
                }}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Thuê ngay ({new Intl.NumberFormat('vi-VN').format(service.startingPrice)}đ)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
