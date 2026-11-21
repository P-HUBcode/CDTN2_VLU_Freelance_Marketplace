import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Bắt được lỗi hiển thị React:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-50 border border-rose-200 rounded-2xl mx-auto flex items-center justify-center text-rose-600 shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">
                Đã xảy ra sự cố khi tải giao diện
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hệ thống gặp gián đoạn tạm thời trong quá trình hiển thị. Bạn có thể tải lại trang hoặc quay về trang chủ để tiếp tục.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-100 rounded-xl text-left border border-slate-200/80">
                <p className="text-[11px] font-mono text-rose-600 break-words font-semibold">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tải lại trang
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition"
              >
                <Home className="w-3.5 h-3.5" />
                Trang chủ
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
