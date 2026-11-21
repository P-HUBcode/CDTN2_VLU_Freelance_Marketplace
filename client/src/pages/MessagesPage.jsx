import React, { useState, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Search,
  CheckCheck,
  MoreVertical,
  Phone,
  Video,
  FileText,
  Image as ImageIcon,
  Trash2,
  MessageSquare
} from 'lucide-react';

export default function MessagesPage({
  conversations = [],
  onSendMessage,
  onDeleteConversation,
  onClearMockConversations,
  activeChatEmployerName,
  currentUser,
  currentRole = 'student'
}) {
  const [selectedConvId, setSelectedConvId] = useState(() => {
    if (activeChatEmployerName) {
      const match = conversations.find(c => c.name.toLowerCase().includes(activeChatEmployerName.toLowerCase()));
      if (match) return match.id;
    }
    return conversations[0]?.id || null;
  });

  // Sync active chat when changed from external buttons (Trao đổi với Client, Nhắn tin trao đổi)
  useEffect(() => {
    if (activeChatEmployerName && conversations.length > 0) {
      const match = conversations.find(
        (c) =>
          c.name.toLowerCase().includes(activeChatEmployerName.toLowerCase()) ||
          activeChatEmployerName.toLowerCase().includes(c.name.toLowerCase())
      );
      if (match) {
        setSelectedConvId(match.id);
      }
    } else if (!conversations.some(c => c.id === selectedConvId)) {
      setSelectedConvId(conversations[0]?.id || null);
    }
  }, [activeChatEmployerName, conversations]);

  const [inputMessage, setInputMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0] || null;

  const myName = currentUser?.name || currentUser?.full_name || (currentRole === 'employer' ? 'Nhà tuyển dụng' : 'Sinh viên');
  const myAvatar = currentUser?.avatar || (currentRole === 'employer' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
  const myRole = currentRole || currentUser?.role || 'student';
  const myId = currentUser?.id || (myRole === 'employer' ? 'role_employer' : 'role_student');

  const checkIsMe = (msg) => {
    if (msg.senderId) {
      if (myId && msg.senderId.toLowerCase() === myId.toLowerCase()) return true;
      if (msg.senderId === (myRole === 'employer' ? 'role_employer' : 'role_student')) return true;
      return false;
    }
    if (msg.senderRole) {
      return msg.senderRole === myRole;
    }
    if (msg.senderName && myName) {
      if (msg.senderName.trim().toLowerCase() === myName.trim().toLowerCase()) return true;
    }
    return msg.sender === 'me';
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConv) return;

    if (onSendMessage) {
      onSendMessage(activeConv.id, inputMessage.trim());
    }
    setInputMessage('');
  };

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden h-[calc(100vh-8.5rem)] flex flex-col md:flex-row">
      {/* Left Column: Conversations List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200/80 flex flex-col shrink-0">
        {/* Search header */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Tin nhắn</h2>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-100 text-blue-700 rounded-full">
                {conversations.length} hội thoại
              </span>
              {conversations.length > 0 && onClearMockConversations && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Bạn có chắc chắn muốn xóa hết tất cả tin nhắn ảo mẫu để làm sạch hộp thư và chỉ lưu tin nhắn thật?')) {
                      onClearMockConversations();
                    }
                  }}
                  className="px-2 py-0.5 text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                  title="Xóa toàn bộ các tin nhắn mẫu cũ"
                >
                  Xóa tin ảo
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên hoặc công việc..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Conversations Scrollable List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              const lastMsg = conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition group relative ${
                    isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={conv.avatar}
                      alt={conv.name}
                      className="w-11 h-11 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h4 className={`text-xs truncate ${conv.unread ? 'font-black text-blue-900' : 'font-bold text-slate-900'}`}>{conv.name}</h4>
                        {conv.unread && <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0 animate-pulse" />}
                      </div>
                      <span className={`text-[10px] ${conv.unread ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>{lastMsg?.time || 'Vừa xong'}</span>
                    </div>

                    <p className="text-[11px] text-blue-600 font-medium truncate mb-1">
                      {conv.jobTitle}
                    </p>

                    <p className={`text-xs truncate ${conv.unread ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                      {lastMsg?.sender === 'me' ? 'Bạn: ' : ''}
                      {lastMsg?.text || 'Bắt đầu cuộc trò chuyện'}
                    </p>
                  </div>

                  {/* Nút xóa cuộc trò chuyện này */}
                  {onDeleteConversation && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Bạn có chắc muốn xóa cuộc trò chuyện với "${conv.name}"?`)) {
                          onDeleteConversation(conv.id);
                        }
                      }}
                      className="absolute right-2.5 top-3 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Xóa cuộc trò chuyện này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto stroke-[1.5]" />
              <p className="font-semibold text-slate-600">Hộp thư trống</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Chưa có tin nhắn nào. Bấm <strong>"Nhắn tin trao đổi"</strong> từ tin tuyển dụng, hồ sơ ứng viên hoặc gói dịch vụ để bắt đầu nhắn tin thật!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Chat Box Area */}
      {activeConv ? (
        <div className="flex-1 flex flex-col h-full bg-slate-50/50">
          {/* Chat Header */}
          <div className="h-16 px-6 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={activeConv.avatar}
                  alt={activeConv.name}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-100"
                />
                {activeConv.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">{activeConv.name}</h3>
                <span className="text-[11px] text-slate-400">
                  {activeConv.online ? (
                    <span className="text-emerald-600 font-medium">Đang trực tuyến</span>
                  ) : (
                    'Hoạt động vừa xong'
                  )}{' '}
                  • {activeConv.jobTitle}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <button className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-600">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-600">
                <Video className="w-4 h-4" />
              </button>
              {onDeleteConversation && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Bạn có chắc muốn xóa cuộc trò chuyện với "${activeConv.name}"?`)) {
                      onDeleteConversation(activeConv.id);
                    }
                  }}
                  className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition"
                  title="Xóa cuộc trò chuyện này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Messages Scrollable Thread */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
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
                    className={`flex items-end gap-3 ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-100`}
                  >
                    {!isMe && (
                      <img
                        src={senderDisplayAvatar}
                        alt={senderDisplayName}
                        className="w-8 h-8 rounded-full object-cover shrink-0 mb-1 ring-1 ring-slate-200"
                        title={senderDisplayName}
                      />
                    )}

                    <div className={`max-w-md flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {/* Name and role badge */}
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className={`text-xs font-bold ${isMe ? 'text-blue-700' : 'text-slate-800'}`}>
                          {senderDisplayName}
                        </span>
                        {roleLabel && (
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                              roleLabel.includes('tuyển dụng')
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {roleLabel}
                          </span>
                        )}
                      </div>

                      <div
                        className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 block px-1 mt-0.5">
                        {msg.time || 'Vừa xong'}
                      </span>
                    </div>

                    {isMe && (
                      <img
                        src={senderDisplayAvatar}
                        alt="Bạn"
                        className="w-8 h-8 rounded-full object-cover shrink-0 mb-1 ring-1 ring-blue-200"
                        title="Bạn"
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <p>Chưa có tin nhắn nào trong cuộc trò chuyện này.</p>
                <p className="text-[11px] mt-1 text-slate-400">Hãy gửi lời chào đầu tiên bên dưới!</p>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSend}
            className="p-3.5 bg-white border-t border-slate-200/80 flex items-center gap-2 shrink-0"
          >
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              title="Đính kèm file hoặc ảnh"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition hidden sm:block"
              title="Biểu tượng cảm xúc"
            >
              <Smile className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Nhập tin nhắn trao đổi..."
              className="flex-1 px-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 text-white rounded-xl shadow-md transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 text-xs bg-slate-50/50">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">Kênh trao đổi trực tiếp</h3>
          <p className="max-w-sm text-slate-500 leading-relaxed text-xs">
            Hộp thư đã được làm sạch. Bạn có thể bấm <strong>"Nhắn tin trao đổi"</strong> từ các bài đăng việc làm, hồ sơ ứng viên hoặc gói dịch vụ freelance để bắt đầu trò chuyện thật.
          </p>
        </div>
      )}
    </div>
  );
}
