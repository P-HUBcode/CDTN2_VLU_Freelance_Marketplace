import React, { useState } from 'react';
import Modal from '../common/Modal';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResetPasswordModal({ isOpen, onClose, onShowToast, onOpenLogin }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newPassword || newPassword.trim().length < 6) {
      setErrorMessage('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp với mật khẩu mới.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSupabaseConfigured) {
        // Cập nhật mật khẩu chính thức qua Supabase Auth
        const { error } = await supabase.auth.updateUser({
          password: newPassword.trim()
        });

        if (error) {
          setErrorMessage(`Thao tác trên Supabase thất bại: ${error.message}`);
          setIsLoading(false);
          return;
        }

        // Đăng xuất phiên recovery cũ để người dùng đăng nhập lại từ đầu
        await supabase.auth.signOut();
      }

      setIsLoading(false);
      onClose();

      if (typeof window !== 'undefined') {
        window.location.hash = '';
      }

      if (onShowToast) {
        onShowToast('🎉 Đặt lại mật khẩu thành công! Mật khẩu cũ đã bị hủy. Vui lòng đăng nhập với mật khẩu mới.');
      }

      if (onOpenLogin) {
        onOpenLogin();
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Lỗi khi cập nhật mật khẩu mới.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đặt Lại Mật Khẩu Mới (Supabase)" maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="text-center py-1">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 mx-auto flex items-center justify-center text-blue-600 shadow-xs mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Thiết lập mật khẩu mới</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Phiên khôi phục từ liên kết email của bạn đã được xác thực. Hãy nhập mật khẩu mới.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Mật khẩu mới <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                required
                minLength={6}
                className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-blue-600" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                required
                minLength={6}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Đang lưu mật khẩu mới...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Lưu mật khẩu mới & Đăng nhập</span>
              </>
            )}
          </button>
        </form>
      </div>
    </Modal>
  );
}
