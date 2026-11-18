import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { msg, type = 'success' } = toast;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    danger: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-white border-emerald-200 text-slate-800 shadow-emerald-500/10',
    warning: 'bg-white border-amber-200 text-slate-800 shadow-amber-500/10',
    danger: 'bg-white border-rose-200 text-slate-800 shadow-rose-500/10',
    info: 'bg-white border-blue-200 text-slate-800 shadow-blue-500/10',
  };

  return (
    <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${
          bgStyles[type] || bgStyles.info
        }`}
      >
        {icons[type] || icons.info}
        <span className="text-sm font-medium pr-2">{msg}</span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
