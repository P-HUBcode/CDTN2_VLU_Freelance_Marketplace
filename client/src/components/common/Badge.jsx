import React from 'react';

export default function Badge({ children, variant = 'neutral', size = 'md', className = '' }) {
  const variantStyles = {
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    brand: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    outline: 'bg-white text-slate-600 border-slate-300',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-medium px-2.5 py-1',
    lg: 'text-sm font-medium px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border transition-colors ${
        variantStyles[variant] || variantStyles.neutral
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {children}
    </span>
  );
}
