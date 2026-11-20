import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { sendRegistrationOtp, verifyRegistrationOtp } from '../../lib/emailService';
import {
  GraduationCap,
  Building2,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  ShieldCheck,
  RefreshCw,
  KeyRound
} from 'lucide-react';

// Biểu tượng Google 4 màu chính thức
const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onShowToast }) {
  const { signIn, signUp, signInWithGoogle, loginAsDemo, isSupabaseConfigured } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [role, setRole] = useState('student'); // 'student' | 'employer'

  // View state cho Google Account Picker
  const [isGooglePickerOpen, setIsGooglePickerOpen] = useState(false);
  const [selectedGoogleEmail, setSelectedGoogleEmail] = useState('phu47008@gmail.com');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('Nguyễn Minh Phú');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState('Đại học Kinh tế TP.HCM (UEH)');
  const [major, setMajor] = useState('Marketing Số & Truyền thông');
  const [companyName, setCompanyName] = useState('ABC Media Studio');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 🔐 Quy trình xác thực mã OTP gửi qua Gmail khi Đăng ký tài khoản
  const [registerStep, setRegisterStep] = useState('form'); // 'form' | 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState(null);

  // Đếm ngược thời gian chờ gửi lại mã OTP (cooldown 60s)
  useEffect(() => {
    let interval = null;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Yêu cầu Backend gửi mã OTP 6 số đến Gmail
  const handleRequestOtpForRegistration = async (regData) => {
    setIsSendingOtp(true);
    setErrorMessage('');
    try {
      const res = await sendRegistrationOtp({
        email: regData.email,
        fullName: regData.fullName
      });

      if (res && res.success) {
        setPendingRegistration(regData);
        setRegisterStep('otp');
        setOtpCode('');
        setResendCooldown(60);
        if (onShowToast) {
          onShowToast(`📧 Mã xác thực 6 số đã được gửi tới Gmail: ${regData.email}`);
        }
      } else {
        setErrorMessage(res?.message || 'Không thể gửi mã xác thực tới Gmail. Vui lòng kiểm tra lại địa chỉ email.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Lỗi khi kết nối máy chủ gửi mã OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Gửi lại mã OTP mới
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !pendingRegistration?.email) return;
    await handleRequestOtpForRegistration(pendingRegistration);
  };

  // Xác thực mã OTP và hoàn tất tạo tài khoản
  const handleVerifyAndCreateAccount = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số mã xác thực nhận được từ Gmail.');
      return;
    }

    setIsVerifyingOtp(true);
    setErrorMessage('');

    try {
      // 1. Kiểm tra mã OTP với máy chủ Backend
      const verifyRes = await verifyRegistrationOtp({
        email: pendingRegistration.email,
        code: otpCode.trim()
      });

      if (!verifyRes || !verifyRes.success) {
        setErrorMessage(verifyRes?.message || 'Mã xác thực không chính xác hoặc đã hết hạn.');
        setIsVerifyingOtp(false);
        return;
      }

      // 2. Mã chính xác -> Tiến hành tạo tài khoản và tự động đăng nhập
      let signUpRes = null;
      if (pendingRegistration.isGoogleAuth) {
        signUpRes = await signInWithGoogle({
          email: pendingRegistration.email,
          fullName: pendingRegistration.fullName,
          role: pendingRegistration.role,
          university: pendingRegistration.university,
          companyName: pendingRegistration.companyName
        });
      } else {
        signUpRes = await signUp({
          email: pendingRegistration.email,
          password: pendingRegistration.password,
          fullName: pendingRegistration.fullName,
          role: pendingRegistration.role,
          university: pendingRegistration.university,
          major: pendingRegistration.major,
          companyName: pendingRegistration.companyName
        });
      }

      setIsVerifyingOtp(false);

      if (signUpRes && signUpRes.success) {
        onClose();
        if (onShowToast) {
          onShowToast(`🎉 Xác thực Gmail thành công! Chào mừng ${pendingRegistration.fullName} gia nhập StudentHub.`);
        }
      } else {
        setErrorMessage(
          signUpRes?.error?.includes('already registered')
            ? 'Email này đã được đăng ký tài khoản trước đó. Vui lòng chuyển sang Đăng nhập.'
            : signUpRes?.error || 'Có lỗi xảy ra khi hoàn tất tạo tài khoản.'
        );
      }
    } catch (err) {
      setIsVerifyingOtp(false);
      setErrorMessage(err.message || 'Lỗi trong quá trình kích hoạt tài khoản.');
    }
  };

  // Xử lý đăng nhập / đăng ký bằng Google (Gmail)
  const handleExecuteGoogleAuth = async (targetEmail, targetName, targetRole) => {
    const emailToUse = targetEmail || customGoogleEmail || 'phu47008@gmail.com';
    const nameToUse = targetName || customGoogleName || (targetRole === 'employer' ? 'Chị Mai - HR' : 'Nguyễn Minh Phú');
    const roleToUse = targetRole || role;

    if (mode === 'login') {
      // Khi đăng nhập: Tiến hành đăng nhập nhanh
      setIsLoading(true);
      setErrorMessage('');
      try {
        const res = await signInWithGoogle({
          email: emailToUse,
          fullName: nameToUse,
          role: roleToUse,
          university: roleToUse === 'student' ? university : undefined,
          companyName: roleToUse === 'employer' ? companyName : undefined
        });

        setIsLoading(false);
        setIsGooglePickerOpen(false);

        if (res && res.success) {
          onClose();
          if (onShowToast) {
            onShowToast(`🎉 Đã kết nối & đăng nhập thành công với Gmail: ${emailToUse}`);
          }
        } else {
          setErrorMessage(res?.error || 'Không thể đăng nhập bằng tài khoản Google này.');
        }
      } catch (err) {
        setIsLoading(false);
        setErrorMessage(err.message || 'Lỗi khi kết nối Google Account.');
      }
    } else {
      // KHI TẠO TÀI KHOẢN MỚI BẰNG GMAIL:
      // BẮT BUỘC PHẢI CÓ MÃ XÁC THỰC CỦA GMAIL ĐỂ XÁC THỰC EMAIL MỚI CÓ THỂ TẠO TÀI KHOẢN
      setIsGooglePickerOpen(false);
      setEmail(emailToUse);
      setFullName(nameToUse);
      await handleRequestOtpForRegistration({
        email: emailToUse,
        password: password || 'Password123!',
        fullName: nameToUse,
        role: roleToUse,
        university: roleToUse === 'student' ? university : undefined,
        major: roleToUse === 'student' ? major : undefined,
        companyName: roleToUse === 'employer' ? companyName : undefined,
        isGoogleAuth: true
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'login') {
      setIsLoading(true);
      const res = await signIn({ email: email.trim(), password });
      setIsLoading(false);
      if (res.success) {
        onClose();
        if (onShowToast) onShowToast('👋 Đăng nhập thành công! Chào mừng bạn quay trở lại.');
      } else {
        setErrorMessage(
          res.error === 'Invalid login credentials'
            ? 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.'
            : res.error || 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.'
        );
      }
    } else {
      // ĐĂNG KÝ BẰNG FORM: KIỂM TRA THÔNG TIN & GỬI MÃ XÁC THỰC OTP QUA GMAIL
      if (!fullName.trim()) {
        setErrorMessage('Vui lòng nhập họ và tên của bạn.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Vui lòng nhập địa chỉ Gmail thật hợp lệ để nhận mã xác thực.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Mật khẩu cần tối thiểu 6 ký tự.');
        return;
      }

      await handleRequestOtpForRegistration({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role,
        university,
        major,
        companyName,
        isGoogleAuth: false
      });
    }
  };

  const handleQuickDemoLogin = async (demoRole) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await loginAsDemo(demoRole);
      setIsLoading(false);
      if (res && res.success === false) {
        setErrorMessage(res.error || 'Đăng nhập không thành công.');
        return;
      }
      onClose();
      if (onShowToast) {
        const title = demoRole === 'student' ? 'Sinh viên' : demoRole === 'employer' ? 'Nhà tuyển dụng' : 'Admin';
        onShowToast(`🚀 Đã đăng nhập nhanh với vai trò [${title}] thành công!`);
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Lỗi khi đăng nhập demo.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        registerStep === 'otp'
          ? 'Xác thực Email tạo tài khoản'
          : isGooglePickerOpen
          ? (mode === 'login' ? 'Đăng nhập với Google (Gmail)' : 'Đăng ký với Google (Gmail)')
          : mode === 'login'
          ? 'Đăng nhập vào StudentHub'
          : 'Tạo tài khoản StudentHub mới'
      }
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* ============================================================== */}
        {/* VIEW 0: XÁC THỰC MÃ OTP 6 SỐ TỪ GMAIL (BẮT BUỘC KHI TẠO TÀI KHOẢN) */}
        {/* ============================================================== */}
        {registerStep === 'otp' ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 mx-auto flex items-center justify-center text-emerald-600 shadow-xs mb-2.5">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Xác thực địa chỉ Gmail
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Để kích hoạt tài khoản của bạn, hệ thống đã gửi mã xác thực 6 chữ số đến Gmail:
              </p>
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-slate-100 rounded-full font-mono text-xs font-bold text-slate-800">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>{pendingRegistration?.email}</span>
              </div>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerifyAndCreateAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 text-center mb-2">
                  Nhập mã xác thực gồm 6 chữ số
                </label>
                <div className="relative max-w-[260px] mx-auto">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full py-3 text-center text-2xl font-mono font-extrabold tracking-[10px] bg-slate-50 border-2 border-blue-400 focus:border-blue-600 rounded-2xl outline-none transition shadow-sm text-blue-900"
                    autoFocus
                    required
                  />
                </div>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  ⏱️ Mã có hiệu lực trong <strong>5 phút</strong>. Vui lòng kiểm tra Hộp thư đến (hoặc Thư rác/Spam).
                </p>
              </div>

              <button
                type="submit"
                disabled={isVerifyingOtp || otpCode.length !== 6}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isVerifyingOtp ? (
                  <span>Đang kiểm tra mã xác thực...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác nhận mã & Tạo tài khoản</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setRegisterStep('form');
                    setErrorMessage('');
                  }}
                  className="text-slate-500 hover:text-slate-800 font-semibold transition"
                >
                  ← Đổi email / Thông tin
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isSendingOtp}
                  className="text-blue-600 hover:text-blue-800 font-bold transition disabled:text-slate-400 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSendingOtp ? 'animate-spin' : ''}`} />
                  <span>{resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã mới'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : isGooglePickerOpen ? (
          /* ============================================================== */
          /* VIEW 1: GOOGLE ACCOUNT PICKER (CHỌN HOẶC NHẬP GMAIL THẬT) */
          /* ============================================================== */
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setIsGooglePickerOpen(false)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Quay lại form thông thường</span>
              </button>
              <span className="text-[11px] font-bold text-slate-400">Google OAuth 2.0</span>
            </div>

            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 mx-auto flex items-center justify-center shadow-xs mb-2">
                <GoogleIcon />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                {mode === 'login' ? 'Đăng nhập bằng Gmail' : 'Đăng ký tài khoản bằng Gmail'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {mode === 'login'
                  ? 'Chọn tài khoản Gmail để đăng nhập nhanh'
                  : 'Hệ thống sẽ gửi mã xác thực 6 số đến Gmail để bảo vệ tài khoản'}
              </p>
            </div>

            {/* Chọn vai trò nếu đang đăng ký */}
            {mode === 'register' && (
              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800">
                  Bạn tham gia với tư cách:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      role === 'student'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Sinh viên</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('employer')}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      role === 'employer'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Nhà tuyển dụng</span>
                  </button>
                </div>
              </div>
            )}

            {/* Danh sách tài khoản Gmail mẫu sẵn */}
            <div className="space-y-2">
              {/* Tài khoản chính của user */}
              <button
                type="button"
                onClick={() => handleExecuteGoogleAuth('phu47008@gmail.com', 'Nguyễn Minh Phú', role)}
                disabled={isLoading || isSendingOtp}
                className="w-full p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 active:scale-98 transition flex items-center gap-3 text-left group"
              >
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                  P
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                      phu47008@gmail.com
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                      Chính chủ ✓
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {mode === 'login' ? 'Nguyễn Minh Phú • Đăng nhập ngay' : 'Nguyễn Minh Phú • Nhận mã xác thực'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition" />
              </button>

              {/* Tài khoản sinh viên demo */}
              <button
                type="button"
                onClick={() => handleExecuteGoogleAuth('minhanh.student@gmail.com', 'Nguyễn Minh Anh (UEH)', 'student')}
                disabled={isLoading || isSendingOtp}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-98 transition flex items-center gap-3 text-left group"
              >
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    minhanh.student@gmail.com
                  </span>
                  <p className="text-[11px] text-slate-500 truncate">Nguyễn Minh Anh • Sinh viên UEH</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
              </button>
            </div>

            {/* Hoặc nhập địa chỉ Gmail cá nhân bất kỳ */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Hoặc nhập địa chỉ Gmail khác của bạn:
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    placeholder="vd: tenban@gmail.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    placeholder="Họ và tên của bạn"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleExecuteGoogleAuth(customGoogleEmail, customGoogleName, role)}
                  disabled={isLoading || isSendingOtp || !customGoogleEmail.trim()}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <GoogleIcon />
                  <span>{mode === 'login' ? 'Tiếp tục với Gmail này' : 'Gửi mã xác thực đến Gmail này'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* VIEW 2: FORM ĐĂNG NHẬP / ĐĂNG KÝ VỚI NÚT GMAIL NỔI BẬT */
          /* ============================================================== */
          <>
            {/* Toggle Mode: Login vs Register */}
            <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setRegisterStep('form');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 rounded-lg transition ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setRegisterStep('form');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 rounded-lg transition ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Đăng ký tài khoản
              </button>
            </div>

            {/* Ô / NÚT ĐĂNG NHẬP HOẶC ĐĂNG KÝ BẰNG GMAIL (GOOGLE) */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => setIsGooglePickerOpen(true)}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 hover:border-slate-400 rounded-xl font-bold text-xs text-slate-700 shadow-xs transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <GoogleIcon />
                  <span>
                    {mode === 'login'
                      ? 'Đăng nhập bằng Google (Gmail)'
                      : 'Đăng ký nhanh bằng Google (Gmail)'}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-bold">
                  1-Chạm
                </span>
              </button>
              <p className="text-[10px] text-center text-slate-400">
                Sử dụng Gmail thật để nhận email trạng thái hồ sơ & lịch phỏng vấn tự động
              </p>
            </div>

            {/* Dải phân cách HOẶC */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] uppercase font-bold text-slate-400 shrink-0">
                Hoặc bằng email & mật khẩu
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* If registering: Choose Role */}
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Bạn tham gia với tư cách nào?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                        role === 'student'
                          ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-500'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block">Sinh viên</span>
                        <span className="text-[10px] text-slate-400">Tìm việc & Freelance</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('employer')}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition ${
                        role === 'employer'
                          ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-1 ring-emerald-500'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block">Nhà tuyển dụng</span>
                        <span className="text-[10px] text-slate-400">Đăng tin & Tuyển</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Full Name (when Register) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Vd: Nguyễn Minh Anh"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition font-medium"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Additional fields when Register as Student */}
              {mode === 'register' && role === 'student' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Trường Đại học
                    </label>
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="UEH, Văn Lang, TĐT..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Chuyên ngành
                    </label>
                    <input
                      type="text"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="Marketing, CNTT..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Additional fields when Register as Employer */}
              {mode === 'register' && role === 'employer' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tên Doanh nghiệp / Studio / Thương hiệu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Vd: ABC Media Studio"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                    required
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Địa chỉ Gmail thật <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setEmail('phu47008@gmail.com')}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold underline"
                  >
                    Điền phu47008@gmail.com
                  </button>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="phu47008@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition font-medium"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Hệ thống sẽ gửi email xác nhận nộp hồ sơ, thư mời phỏng vấn & kết quả trúng tuyển đến Gmail này.
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Mật khẩu <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isSendingOtp}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading || isSendingOtp ? (
                  <span>Đang gửi mã xác thực về Gmail...</span>
                ) : mode === 'login' ? (
                  <>
                    <span>Đăng nhập ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>Nhận mã xác thực qua Gmail</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Logins Section */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Hoặc thử nghiệm nhanh với tài khoản mẫu:</span>
                <span className="font-semibold text-blue-600">1-Click</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('student')}
                  className="px-2.5 py-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 transition flex items-center justify-center gap-1.5"
                  title="Nguyễn Minh Anh - Sinh viên Marketing UEH"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sinh viên Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('employer')}
                  className="px-2.5 py-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-700 transition flex items-center justify-center gap-1.5"
                  title="Chị Mai - HR ABC Media"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nhà tuyển dụng</span>
                </button>
              </div>

              <div className="pt-2 text-center">
                <a
                  href="/admin"
                  className="text-[11px] text-slate-400 hover:text-purple-600 transition flex items-center justify-center gap-1"
                >
                  <span>🔒 Cổng Quản trị viên Admin: Truy cập <strong>/admin</strong> để đăng nhập</span>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
