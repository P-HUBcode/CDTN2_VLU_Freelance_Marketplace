import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  ArrowLeft,
  Send,
  X,
  Trash2,
  Search,
  Minus,
  Sparkles
} from 'lucide-react';

export default function ChatBox({
  isOpen,
  onClose,
  isMinimized = false,
  setIsMinimized = () => {},
  conversations = [],
  activeTargetName = null,
  onSelectConversation,
  onSendMessage,
  onDeleteConversation,
  onClearMockConversations,
  currentUser,
  currentRole = 'student'
}) {
  const [activeConvName, setActiveConvName] = useState(activeTargetName);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);
  const inputRef = useRef(null);

  // Cập nhật active conversation khi activeTargetName từ bên ngoài thay đổi (ví dụ: bấm "Nhắn tin với...")
  useEffect(() => {
    if (activeTargetName) {
      setActiveConvName(activeTargetName);
    }
  }, [activeTargetName]);

  // Tìm cuộc hội thoại đang được kích hoạt
  const activeConv = conversations.find(
    (c) =>
      c.name.toLowerCase() === (activeConvName || '').toLowerCase() ||
      (activeConvName && c.name.toLowerCase().includes(activeConvName.toLowerCase())) ||
      (activeConvName && activeConvName.toLowerCase().includes(c.name.toLowerCase()))
  );

  // Tính tổng tin nhắn chưa đọc
  const unreadCount = conversations.reduce((acc, c) => {
    return acc + (c.unread ? 1 : 0);
  }, 0);

  // Định danh người dùng hiện tại để phân biệt tin nhắn gửi (Me) và tin nhắn nhận (Them)
  const myName = currentUser?.name || currentUser?.full_name || (currentRole === 'employer' ? 'Nhà tuyển dụng' : 'Sinh viên');
  const myAvatar = currentUser?.avatar || (currentRole === 'employer' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
  const myRole = currentRole || currentUser?.role || 'student';
  const myId = currentUser?.id || (myRole === 'employer' ? 'role_employer' : 'role_student');

  const checkIsMe = (msg) => {
    // 1. So khớp senderId cụ thể
    if (msg.senderId) {
      if (myId && msg.senderId.toLowerCase() === myId.toLowerCase()) return true;
      if (msg.senderId === (myRole === 'employer' ? 'role_employer' : 'role_student')) return true;
      return false;
    }
    // 2. So khớp senderRole nếu 2 bên khác vai trò (1 bên student, 1 bên employer)
    if (msg.senderRole) {
      return msg.senderRole === myRole;
    }
    // 3. So khớp senderName
    if (msg.senderName && myName) {
      if (msg.senderName.trim().toLowerCase() === myName.trim().toLowerCase()) return true;
    }
    // 4. Fallback mặc định
    return msg.sender === 'me';
  };

  // Cuộn xuống tin nhắn cuối cùng khi có tin mới hoặc khi mở hội thoại
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!isMinimized && activeConv) {
      scrollToBottom();
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    }
  }, [activeConv?.messages?.length, activeConvName, isMinimized]);

  if (!isOpen) return null;

  // Lọc danh sách hội thoại theo từ khóa tìm kiếm
  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.jobTitle && c.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    onSendMessage(activeConv.id, inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Gợi ý tin nhắn mẫu nhanh
  const quickChips =
    currentRole === 'employer'
      ? [
          'Chào em, chị đã xem hồ sơ của em! 👋',
          'Chị muốn hẹn trao đổi phỏng vấn trực tiếp nhé 🗓️',
          'Dự án công việc đã được nghiệm thu thành công! 🚀'
        ]
      : [
          'Dạ em chào anh/chị ạ! 👋',
          'Em rất quan tâm đến vị trí/dịch vụ này 💼',
          'Dạ anh/chị cho em hỏi thêm về thời gian làm việc ạ? ⏰'
        ];

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. BONG BÓNG CHAT FACEBOOK (MINIMIZED CHAT HEAD - GÓC DƯỚI BÊN PHẢI)     */}
      {/* ========================================================================= */}
      {isMinimized ? (
        <div className="fixed bottom-6 right-24 z-50 flex items-center group animate-in zoom-in-75 duration-200">
          {/* Tooltip hiển thị xem trước đối tác khi rê chuột */}
          <div className="hidden sm:group-hover:flex items-center gap-2 mr-3 px-3.5 py-2 bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold rounded-2xl shadow-2xl animate-in fade-in slide-in-from-right-2 duration-150 pointer-events-none whitespace-nowrap border border-slate-700/50">
            <div className="flex flex-col">
              <span className="font-bold text-slate-100">
                {activeConv ? activeConv.name : 'Hộp thư tin nhắn'}
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Bấm để mở rộng cửa sổ chat
              </span>
            </div>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-rose-500 rounded-full text-[10px] font-extrabold text-white">
                {unreadCount} mới
              </span>
            )}
          </div>

          {/* Quả bong bóng chat tròn phong cách Facebook */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="relative w-14 h-14 sm:w-15 sm:h-15 rounded-full shadow-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center p-0.5 border-2 border-white ring-4 ring-blue-500/20 hover:scale-110 active:scale-95 transition-all cursor-pointer group-hover:shadow-blue-500/30"
              title="Bấm để mở chat (Facebook Messenger)"
            >
              {activeConv?.avatar ? (
                <img
                  src={activeConv.avatar}
                  alt={activeConv.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <MessageSquare className="w-6 h-6 text-white" />
              )}

              {/* Dấu chấm xanh online phát sáng */}
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full ring-1 ring-emerald-400/50" />
            </button>

            {/* Badge số tin nhắn chưa đọc (màu đỏ nảy nhịp như Facebook) */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 bg-rose-500 text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}

            {/* Nút đóng nhanh bong bóng khi hover */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="opacity-0 group-hover:opacity-100 absolute -top-1.5 -left-1.5 w-5 h-5 bg-slate-700/90 hover:bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] shadow-md transition"
              title="Tắt bong bóng chat"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. CỬA SỔ CHAT MỞ RỘNG (EXPANDED CHAT BOX DOCKED AT BOTTOM-RIGHT)        */
        /* ========================================================================= */
        <div
          ref={chatBoxRef}
          className="fixed bottom-6 right-6 z-50 w-[calc(100vw-2rem)] sm:w-[385px] h-[525px] max-h-[calc(100vh-4rem)] bg-white border border-slate-200/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-150"
        >
          {/* ===================== VIEW 1: CHI TIẾT CUỘC TRÒ CHUYỆN ===================== */}
          {activeConv ? (
            <div className="flex flex-col h-full">
              {/* Header hội thoại */}
              <div className="px-3.5 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveConvName(null);
                      if (onSelectConversation) onSelectConversation(null);
                    }}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition shrink-0"
                    title="Quay lại danh sách hội thoại"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="relative shrink-0">
                    <img
                      src={activeConv.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={activeConv.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{activeConv.name}</h4>
                    <p className="text-[10px] text-emerald-600 font-medium truncate flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                      {activeConv.jobTitle || 'Trực tuyến'}
                    </p>
                  </div>
                </div>

                {/* Các nút điều khiển ở Header (Giống Facebook: Thùng rác, Nút gạch ngang, Nút đóng) */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn xóa cuộc trò chuyện với ${activeConv.name}?`)) {
                        onDeleteConversation(activeConv.id);
                        setActiveConvName(null);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Xóa cuộc trò chuyện này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* NÚT GẠCH NGANG — THU NHỎ THÀNH BONG BÓNG CHAT NHƯ FACEBOOK */}
                  <button
                    type="button"
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                    title="Thu nhỏ thành bong bóng chat (—)"
                  >
                    <Minus className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  {/* Nút đóng hoàn toàn */}
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Đóng cửa sổ chat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/60">
                {activeConv.messages && activeConv.messages.length > 0 ? (
                  activeConv.messages.map((msg) => {
                    const isMe = checkIsMe(msg);
                    const senderDisplayName = isMe
                      ? 'Bạn'
                      : (msg.senderName || activeConv.name || 'Người liên hệ');
                    const senderDisplayAvatar = isMe
                      ? myAvatar
                      : (msg.senderAvatar || activeConv.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
                    const roleLabel = isMe
                      ? (myRole === 'employer' ? 'Nhà tuyển dụng' : 'Sinh viên')
                      : (msg.senderRole === 'employer' ? 'Nhà tuyển dụng' : msg.senderRole === 'student' ? 'Sinh viên' : (activeConv.jobTitle || ''));

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-100`}
                      >
                        {/* Avatar bên trái (của người đối thoại) */}
                        {!isMe && (
                          <img
                            src={senderDisplayAvatar}
                            alt={senderDisplayName}
                            className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-200 mb-1"
                            title={senderDisplayName}
                          />
                        )}

                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[82%]`}>
                          {/* Tên người gửi & Nhãn Role */}
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span className={`text-[10px] font-bold ${isMe ? 'text-blue-700' : 'text-slate-800'}`}>
                              {senderDisplayName}
                            </span>
                            {roleLabel && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                                  roleLabel.includes('tuyển dụng')
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {roleLabel}
                              </span>
                            )}
                          </div>

                          {/* Bong bóng tin nhắn */}
                          <div
                            className={`px-3.5 py-2 text-xs leading-relaxed break-words whitespace-pre-wrap shadow-xs ${
                              isMe
                                ? 'bg-blue-600 text-white rounded-2xl rounded-tr-xs font-normal'
                                : 'bg-white text-slate-800 rounded-2xl rounded-tl-xs border border-slate-200/80'
                            }`}
                          >
                            {msg.text}
                          </div>

                          {/* Thời gian gửi */}
                          <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                            {msg.time || 'Vừa xong'}
                          </span>
                        </div>

                        {/* Avatar bên phải (của tôi) */}
                        {isMe && (
                          <img
                            src={senderDisplayAvatar}
                            alt="Bạn"
                            className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-blue-200 mb-1"
                            title="Bạn"
                          />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
                    <MessageSquare className="w-8 h-8 text-slate-300 stroke-[1.5] mb-2" />
                    <p className="text-xs font-semibold text-slate-700">Bắt đầu trò chuyện</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Gửi tin nhắn đầu tiên để kết nối và trao đổi công việc nhé!
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestions Chips */}
              <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 overflow-x-auto no-scrollbar flex items-center gap-1.5">
                {quickChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInputText(chip)}
                    className="whitespace-nowrap px-2.5 py-1 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 text-slate-600 rounded-full text-[10px] font-medium transition shrink-0"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Box Footer */}
              <form
                onSubmit={handleSend}
                className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhập tin nhắn... (Enter gửi)"
                  className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-800 rounded-xl border border-transparent focus:border-blue-400 focus:outline-hidden transition"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-xs transition active:scale-95 shrink-0"
                  title="Gửi tin nhắn"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            /* ===================== VIEW 2: DANH SÁCH CUỘC HỘI THOẠI ===================== */
            <div className="flex flex-col h-full">
              {/* Header danh sách */}
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Tin nhắn</h3>
                  {conversations.length > 0 && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
                      {conversations.length}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {conversations.length > 0 && onClearMockConversations && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Bạn có muốn làm sạch toàn bộ hộp thư này không?')) {
                          onClearMockConversations();
                        }
                      }}
                      className="px-2 py-1 text-[10px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Xóa toàn bộ tin nhắn để hộp thư sạch"
                    >
                      Xóa tin ảo
                    </button>
                  )}

                  {/* NÚT GẠCH NGANG — THU NHỎ THÀNH BONG BÓNG CHAT NHƯ FACEBOOK */}
                  <button
                    type="button"
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                    title="Thu nhỏ thành bong bóng chat (—)"
                  >
                    <Minus className="w-4 h-4 stroke-[2.5]" />
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Đóng chat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Thanh tìm kiếm */}
              <div className="p-2.5 border-b border-slate-100 bg-slate-50/50">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm người liên hệ..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white text-xs text-slate-800 rounded-xl border border-slate-200 focus:border-blue-400 focus:outline-hidden transition"
                  />
                </div>
              </div>

              {/* Danh sách các cuộc trò chuyện */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => {
                    const lastMsg =
                      conv.messages && conv.messages.length > 0
                        ? conv.messages[conv.messages.length - 1]
                        : null;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          setActiveConvName(conv.name);
                          if (onSelectConversation) onSelectConversation(conv.name);
                        }}
                        className="p-3 hover:bg-blue-50/50 cursor-pointer transition flex items-center justify-between group relative"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="relative shrink-0">
                            <img
                              src={conv.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                              alt={conv.name}
                              className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            {conv.online && (
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <h4 className={`text-xs truncate ${conv.unread ? 'font-black text-blue-900' : 'font-bold text-slate-900'}`}>
                                  {conv.name}
                                </h4>
                                {conv.unread && (
                                  <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0 animate-pulse" />
                                )}
                              </div>
                              {lastMsg && (
                                <span className={`text-[10px] shrink-0 ml-1 ${conv.unread ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                                  {lastMsg.time || 'Mới'}
                                </span>
                              )}
                            </div>

                            <p className={`text-[11px] truncate mt-0.5 ${conv.unread ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                              {lastMsg ? (
                                <span>
                                  {lastMsg.sender === 'me' ? (
                                    <span className="font-semibold text-slate-700">Bạn: </span>
                                  ) : null}
                                  {lastMsg.text}
                                </span>
                              ) : (
                                conv.jobTitle || 'Nhấn để bắt đầu trò chuyện'
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Quick delete button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                          title="Xóa cuộc trò chuyện"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">Chưa có tin nhắn nào</p>
                    <p className="text-[11px] text-slate-400 max-w-[240px] leading-relaxed">
                      Bấm nút <strong>"Nhắn tin"</strong> từ các bài tuyển dụng hoặc thẻ ứng viên để bắt đầu kết nối!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
