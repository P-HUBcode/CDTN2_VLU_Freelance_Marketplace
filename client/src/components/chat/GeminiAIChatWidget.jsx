import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  Minus,
  Settings,
  Bot,
  User,
  Key,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { askGeminiAI, getStoredGeminiApiKey, setStoredGeminiApiKey } from '../../lib/geminiChatService';

// Logo Google Gemini chính thức
const GeminiBadge = () => (
  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 text-indigo-200 border border-indigo-400/30">
    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
    <span>Gemini 1.5</span>
  </span>
);

export default function GeminiAIChatWidget({ currentUser, currentRole = 'student' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Xin chào ${currentUser?.name ? currentUser.name : 'bạn'}! 👋\n\nMình là **Trợ lý AI tự động của StudentHub**, vận hành trên nền tảng **Google Gemini**.\n\nMình có thể hỗ trợ bạn:\n- 💼 Tư vấn việc làm thêm, thực tập sinh phù hợp lịch học.\n- 📝 Hướng dẫn cách viết CV và Portfolio chuẩn chỉnh.\n- 🛡️ Giải đáp cơ chế Ký quỹ Escrow bảo đảm thù lao 100%.\n- 🎨 Cách tạo dịch vụ Freelance và thu hút khách hàng.\n\nBạn cần hỗ trợ điều gì hôm nay? ✨`,
      time: 'Vừa xong'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const key = getStoredGeminiApiKey();
    setSavedKey(key);
    setApiKeyInput(key);
  }, []);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 150);
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        sender: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      const res = await askGeminiAI({
        message: text,
        history,
        userRole: currentRole,
        userName: currentUser?.name || 'Sinh viên'
      });

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: res.reply || 'Dạ mình đã nhận được tin nhắn, mình có thể hỗ trợ thêm gì cho bạn nữa không?',
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        source: res.source
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Lỗi khi nhắn tin với Gemini AI:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: '⚠️ Xin lỗi bạn, hiện tại kết nối đến AI đang bận. Bạn hãy thử lại sau giây lát nhé!',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSaveApiKey = () => {
    setStoredGeminiApiKey(apiKeyInput);
    setSavedKey(apiKeyInput.trim());
    setShowKeyModal(false);
  };

  const handleCopyText = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const quickPrompts = [
    'Tư vấn việc làm thêm phù hợp sinh viên',
    'Cách viết CV khi chưa có kinh nghiệm',
    'Cơ chế ký quỹ Escrow bảo đảm thù lao là gì?',
    'Làm thế nào để bắt đầu nhận job freelance?'
  ];

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. NÚT CHAT NỔI (LUÔN LUÔN HIỆN Ở GÓC DƯỚI BÊN PHẢI MÀN HÌNH)           */}
      {/* ========================================================================= */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center group animate-in fade-in zoom-in-95 duration-200">
          {/* Tooltip khi rê chuột */}
          <div className="hidden sm:group-hover:flex items-center gap-2 mr-3 px-3.5 py-2 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold rounded-2xl shadow-2xl animate-in fade-in slide-in-from-right-2 duration-150 pointer-events-none whitespace-nowrap border border-indigo-500/30">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <div className="flex flex-col">
              <span className="font-bold text-slate-100 flex items-center gap-1">
                Trợ lý AI StudentHub <GeminiBadge />
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Hỏi đáp việc làm, CV & Freelance 24/7
              </span>
            </div>
          </div>

          {/* Quả bong bóng chat tròn phát sáng đặc trưng của Google Gemini */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center justify-center p-0.5 border-2 border-white ring-4 ring-indigo-500/25 hover:scale-110 active:scale-95 transition-all cursor-pointer group-hover:shadow-indigo-500/40"
            title="Nhấp để trò chuyện với Trợ lý AI Gemini"
          >
            {/* Hiệu ứng hào quang xung quanh */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-40 blur-sm group-hover:opacity-75 transition duration-300 animate-pulse" />

            <div className="relative w-full h-full rounded-full flex flex-col items-center justify-center">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300" />
              <span className="text-[8px] font-extrabold tracking-tighter text-white/90">AI GEMINI</span>
            </div>

            {/* Dấu chấm xanh online phát sáng */}
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full ring-1 ring-emerald-400/50" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CỬA SỔ CHAT AI MỞ RỘNG (EXPANDED GEMINI AI CHAT BOX)                  */}
      {/* ========================================================================= */}
      {isOpen && (
        <div
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[420px] bg-white rounded-3xl shadow-2xl border border-indigo-200/90 flex flex-col overflow-hidden transition-all duration-300 ease-out origin-bottom-right ${
            isMinimized
              ? 'h-14 sm:h-16'
              : 'h-[580px] max-h-[88vh]'
          }`}
        >
          {/* Header Gemini Gradient */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold truncate">Trợ lý AI StudentHub</h3>
                  <GeminiBadge />
                </div>
                <p className="text-[10px] text-indigo-200 truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping inline-block" />
                  <span>Google Gemini AI • Trực tuyến 24/7</span>
                </p>
              </div>
            </div>

            {/* Nút hành động trên Header */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Nút cài đặt API Key */}
              <button
                type="button"
                onClick={() => setShowKeyModal(!showKeyModal)}
                className={`p-1.5 rounded-xl transition ${
                  savedKey
                    ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title="Cài đặt Google Gemini API Key"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Nút Thu nhỏ */}
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white/90 transition"
                title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* Nút Đóng */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white/90 transition"
                title="Đóng cửa sổ chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Nếu không thu nhỏ, hiển thị phần thân chat */}
          {!isMinimized && (
            <>
              {/* MODAL CÀI ĐẶT GEMINI API KEY */}
              {showKeyModal && (
                <div className="p-3.5 bg-indigo-50 border-b border-indigo-100 text-xs text-slate-800 space-y-2.5 animate-in slide-in-from-top duration-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5 text-indigo-900">
                      <Key className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Cấu hình Google Gemini API Key</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowKeyModal(false)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Nhập API Key từ <strong>Google AI Studio</strong> (hoàn toàn miễn phí) để kích hoạt toàn bộ khả năng phân tích thông minh của Gemini:
                  </p>

                  <div className="relative">
                    <input
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Dán API Key dạng AIzaSy..."
                      className="w-full pl-3 pr-20 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-mono outline-none focus:border-indigo-500"
                    />
                    <div className="absolute right-1 top-1 bottom-1 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleSaveApiKey}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] transition"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1"
                    >
                      <span>Lấy API Key miễn phí tại Google AI Studio</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    {savedKey && (
                      <button
                        type="button"
                        onClick={() => {
                          setApiKeyInput('');
                          setStoredGeminiApiKey('');
                          setSavedKey('');
                        }}
                        className="text-rose-600 hover:underline"
                      >
                        Xóa Key
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* DANH SÁCH TIN NHẮN (MESSAGE FEED) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 text-xs">
                {messages.map((msg, idx) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    {msg.sender === 'user' ? (
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-[11px] font-bold shadow-xs">
                        {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      </div>
                    )}

                    {/* Khung nội dung tin nhắn */}
                    <div
                      className={`max-w-[82%] rounded-2xl p-3 shadow-xs leading-relaxed relative group ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-line text-xs font-normal">
                        {msg.text}
                      </div>

                      <div className="flex items-center justify-between mt-1 text-[9px] opacity-70 gap-2">
                        <span>{msg.time}</span>
                        {msg.sender === 'ai' && (
                          <button
                            type="button"
                            onClick={() => handleCopyText(msg.text, idx)}
                            className="opacity-0 group-hover:opacity-100 transition hover:text-indigo-600 flex items-center gap-0.5"
                            title="Sao chép câu trả lời"
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check className="w-2.5 h-2.5 text-emerald-600" />
                                <span className="text-emerald-600 font-bold">Đã chép</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-2.5 h-2.5" />
                                <span>Chép</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Loading indicator khi Gemini đang phân tích */}
                {isLoading && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-xs flex items-center gap-2 text-slate-500 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">Gemini đang suy nghĩ câu trả lời...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* GỢI Ý CÂU HỎI NHANH (QUICK PROMPT PILLS) */}
              {messages.length <= 3 && (
                <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
                  {quickPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(p)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-full text-[10px] font-semibold transition shrink-0 border border-slate-200/60"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* KHUNG NHẬP LIỆU (INPUT BAR) */}
              <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Hỏi AI Gemini về việc làm, CV, freelance..."
                      disabled={isLoading}
                      className="w-full pl-3.5 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition disabled:opacity-50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    title="Gửi tin nhắn (Enter)"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 px-1">
                  <span>Nhấn <strong>Enter</strong> để gửi</span>
                  <span>Mô hình: <strong>Google Gemini 1.5 Flash</strong></span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
