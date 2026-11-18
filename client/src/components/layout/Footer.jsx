import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  FileText,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Smartphone,
  CheckCircle2,
  X
} from 'lucide-react';

export default function Footer({ onNavigate }) {
  const [modalContent, setModalContent] = useState(null);

  const openInfoModal = (title, content) => {
    setModalContent({ title, content });
  };

  return (
    <footer className="bg-[#2D114D] text-white border-t border-[#461D72] mt-auto relative z-10 select-none">
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* COLUMN 1: Về chúng tôi (Chiếm 5/12 cột trên màn lớn) */}
          <div className="lg:col-span-5 space-y-3.5">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Về chúng tôi
            </h3>

            <div className="space-y-2 text-xs sm:text-[13px] text-purple-100/90 leading-relaxed font-normal">
              <p className="font-bold text-white text-sm sm:text-[15px]">
                StudentHub.vn - Nền Tảng Việc Làm & Freelance Sinh Viên Việt Nam
              </p>

              <div className="flex items-start gap-2 pt-0.5">
                <MapPin className="w-4 h-4 text-purple-300 shrink-0 mt-0.5" />
                <span>
                  <strong>Trụ sở chính:</strong> Tầng 6, Tòa nhà Innovation Hub, số 69/68 Đặng Thùy Trâm, Phường 13, Quận Bình Thạnh, Thành phố Hồ Chí Minh
                </span>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-purple-300 shrink-0 mt-0.5" />
                <span>
                  <strong>Chi nhánh:</strong> Tầng 3, Trung tâm Ươm mầm Khởi nghiệp, số 279 Nguyễn Tri Phương, Phường 5, Quận 10, Thành phố Hồ Chí Minh
                </span>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Giấy phép hoạt động dịch vụ việc làm số: <strong>28937/2026/SLĐTBXH-VLATLĐ</strong> do Sở Lao Động - Thương Binh và Xã Hội TP.HCM cấp ngày 18/11/2026
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-purple-300 shrink-0" />
                <span>
                  <strong>Điện thoại:</strong>{' '}
                  <a href="tel:02871082424" className="hover:text-white transition font-semibold underline underline-offset-2">
                    (028) 7108 2424
                  </a>{' '}
                  |{' '}
                  <a href="tel:02873082424" className="hover:text-white transition font-semibold underline underline-offset-2">
                    (028) 7308 2424
                  </a>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-300 shrink-0" />
                <span>
                  Email hỗ trợ người tìm việc:{' '}
                  <a
                    href="mailto:phu47008@gmail.com"
                    className="text-amber-300 font-semibold hover:underline underline-offset-2"
                  >
                    phu47008@gmail.com
                  </a>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-300 shrink-0" />
                <span>
                  Email hỗ trợ nhà tuyển dụng:{' '}
                  <a
                    href="mailto:phu47008@gmail.com"
                    className="text-amber-300 font-semibold hover:underline underline-offset-2"
                  >
                    phu47008@gmail.com
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: Thông tin (Chiếm 3/12 cột trên màn lớn) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Thông tin
            </h3>

            <ul className="space-y-2.5 text-xs sm:text-[13px] text-purple-200">
              <li>
                <button
                  onClick={() =>
                    openInfoModal(
                      'Cẩm nang nghề nghiệp sinh viên',
                      'Tổng hợp bí quyết viết CV chuyên nghiệp, kỹ năng trả lời phỏng vấn Part-time/Internship và kinh nghiệm bắt đầu nhận job Freelance đầu tay từ các chuyên gia tuyển dụng.'
                    )
                  }
                  className="hover:text-white transition text-left flex items-center gap-1.5 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Cẩm nang nghề nghiệp</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    openInfoModal(
                      'Báo giá dịch vụ & Ký quỹ Escrow',
                      'Hệ thống StudentHub miễn phí 100% cho sinh viên tìm việc. Đối với gói dịch vụ Freelance, cơ chế ký quỹ Escrow bảo đảm tạm giữ tiền an toàn và giải ngân ngay lập tức khi hoàn thành nghiệm thu.'
                    )
                  }
                  className="hover:text-white transition text-left flex items-center gap-1.5 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Báo giá dịch vụ</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    openInfoModal(
                      'Điều khoản sử dụng',
                      'Quy định quyền và nghĩa vụ của Người tìm việc (Sinh viên) và Doanh nghiệp tuyển dụng khi tham gia hệ thống sàn StudentHub. Cam kết không lừa đảo, không thu phí trái phép.'
                    )
                  }
                  className="hover:text-white transition text-left flex items-center gap-1.5 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Điều khoản sử dụng</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    openInfoModal(
                      'Quy định bảo mật thông tin',
                      'StudentHub cam kết bảo mật tuyệt đối thông tin cá nhân, số điện thoại, email và hồ sơ CV của người dùng theo Luật An ninh mạng Việt Nam và chuẩn mã hóa RLS PostgreSQL.'
                    )
                  }
                  className="hover:text-white transition text-left flex items-center gap-1.5 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Quy định bảo mật</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('landing');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition text-left flex items-center gap-1.5 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Sơ đồ trang web</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    openInfoModal(
                      'Tuân thủ và sự đồng ý của Khách Hàng',
                      'Người dùng khi đăng ký tài khoản xác nhận đồng ý với các quy tắc ứng xử văn minh, cung cấp thông tin trung thực về học vấn và kinh nghiệm làm việc.'
                    )
                  }
                  className="hover:text-white transition text-left flex items-center gap-1.5 group"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Tuân thủ và sự đồng ý của Khách Hàng</span>
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: Kết nối với chúng tôi & Tải ứng dụng (Chiếm 4/12 cột trên màn lớn) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Social Media Section */}
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Kết nối với chúng tôi
              </h3>

              {/* 6 Circular White Icons with Dark Purple Glyphs */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Facebook StudentHub"
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#2D114D] hover:bg-blue-600 hover:text-white hover:scale-110 active:scale-95 transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  title="TikTok StudentHub"
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#2D114D] hover:bg-black hover:text-white hover:scale-110 active:scale-95 transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </a>

                {/* Zalo */}
                <a
                  href="https://zalo.me"
                  target="_blank"
                  rel="noreferrer"
                  title="Zalo Official StudentHub"
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#2D114D] hover:bg-blue-500 hover:text-white hover:scale-110 active:scale-95 transition-all shadow-sm font-bold text-[11px]"
                >
                  <span className="tracking-tighter">Zalo</span>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  title="Instagram StudentHub"
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#2D114D] hover:bg-gradient-to-tr hover:from-amber-500 hover:to-rose-600 hover:text-white hover:scale-110 active:scale-95 transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  title="YouTube StudentHub"
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#2D114D] hover:bg-rose-600 hover:text-white hover:scale-110 active:scale-95 transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  title="LinkedIn StudentHub"
                  className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#2D114D] hover:bg-blue-700 hover:text-white hover:scale-110 active:scale-95 transition-all shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* App Download Section: QR Code + Badges */}
            <div className="space-y-3 pt-1">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Tải ứng dụng trên điện thoại
              </h3>

              <div className="flex items-center gap-3.5">
                {/* QR Code Container */}
                <div className="w-[84px] h-[84px] bg-white p-1.5 rounded-xl shadow-md flex items-center justify-center shrink-0 border border-purple-200">
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="none">
                    {/* Corner 1 */}
                    <rect x="6" y="6" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="6" />
                    <rect x="14" y="14" width="12" height="12" rx="2" fill="currentColor" />
                    {/* Corner 2 */}
                    <rect x="66" y="6" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="6" />
                    <rect x="74" y="14" width="12" height="12" rx="2" fill="currentColor" />
                    {/* Corner 3 */}
                    <rect x="6" y="66" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="6" />
                    <rect x="14" y="74" width="12" height="12" rx="2" fill="currentColor" />
                    {/* Data modules */}
                    <rect x="42" y="10" width="8" height="8" fill="currentColor" />
                    <rect x="52" y="18" width="6" height="6" fill="currentColor" />
                    <rect x="42" y="26" width="6" height="8" fill="currentColor" />
                    <rect x="10" y="44" width="8" height="8" fill="currentColor" />
                    <rect x="22" y="48" width="6" height="6" fill="currentColor" />
                    <rect x="32" y="40" width="8" height="8" fill="currentColor" />
                    <rect x="66" y="44" width="8" height="8" fill="currentColor" />
                    <rect x="78" y="42" width="6" height="8" fill="currentColor" />
                    <rect x="44" y="64" width="8" height="6" fill="currentColor" />
                    <rect x="56" y="72" width="8" height="8" fill="currentColor" />
                    <rect x="42" y="80" width="6" height="8" fill="currentColor" />
                    <rect x="72" y="66" width="8" height="8" fill="currentColor" />
                    <rect x="84" y="74" width="6" height="8" fill="currentColor" />
                    {/* Center Brand Dot */}
                    <circle cx="50" cy="50" r="7" fill="#2563EB" />
                  </svg>
                </div>

                {/* Google Play & App Store Buttons Stack */}
                <div className="flex flex-col gap-2">
                  {/* Google Play */}
                  <a
                    href="https://play.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-black/90 hover:bg-black border border-purple-400/40 rounded-xl transition shadow text-white hover:scale-102 active:scale-98"
                  >
                    <svg className="w-5 h-5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186c-.368-.332-.61-.83-.61-1.408V3.222c0-.578.242-1.076.61-1.408zm11.238 11.241l2.42 2.42-11.83 6.828 9.41-9.248zm2.42-2.11L20.89 12.8c.683.394.683 1.036 0 1.43l-3.623 1.855-2.23-2.23 2.23-2.91zm-2.42-.945L5.437 3.172l11.83 6.828-2.42 2.42z" />
                    </svg>
                    <div className="text-left leading-none">
                      <span className="text-[9px] uppercase tracking-wider text-purple-200 block">GET IT ON</span>
                      <span className="text-xs font-bold text-white tracking-tight">Google Play</span>
                    </div>
                  </a>

                  {/* App Store */}
                  <a
                    href="https://apple.com/app-store"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-black/90 hover:bg-black border border-purple-400/40 rounded-xl transition shadow text-white hover:scale-102 active:scale-98"
                  >
                    <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.87-.96.04-2.12.64-2.8 1.44-.59.69-1.12 1.76-1.05 2.81 1.07.08 2.16-.58 2.84-1.38z" />
                    </svg>
                    <div className="text-left leading-none">
                      <span className="text-[9px] uppercase tracking-wider text-purple-200 block">Available on the</span>
                      <span className="text-xs font-bold text-white tracking-tight">App Store</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT DIVIDER & BAR */}
        <div className="mt-10 pt-6 border-t border-[#461D72] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-purple-200/80">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>
              <strong>StudentHub Network</strong> © 2026 - Bản quyền thuộc về Nhóm Đồ Án Chuyên Đề Tốt Nghiệp 2 (CDTN2)
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-purple-300">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hệ sinh thái việc làm sinh viên TP.HCM</span>
            </span>
            <span>•</span>
            <span>Phiên bản 2.5 (Tháng 11/2026)</span>
          </div>
        </div>
      </div>

      {/* Thông tin Modal Popup (Khi bấm vào các liên kết trong cột Thông tin) */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-base">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3>{modalContent.title}</h3>
              </div>
              <button
                onClick={() => setModalContent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {modalContent.content}
            </p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalContent(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
