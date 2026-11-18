/**
 * Dịch vụ gửi nhận tin nhắn với Google Gemini AI trên Client
 */

const API_BASE = 'http://localhost:5000/api/ai';

export function getStoredGeminiApiKey() {
  try {
    return localStorage.getItem('studenthub_gemini_api_key') || '';
  } catch (e) {
    return '';
  }
}

export function setStoredGeminiApiKey(key) {
  try {
    if (key && key.trim()) {
      localStorage.setItem('studenthub_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('studenthub_gemini_api_key');
    }
  } catch (e) {
    console.warn('Không thể lưu Gemini API Key:', e);
  }
}

export async function askGeminiAI({ message, history = [], userRole = 'student', userName = '' }) {
  const localKey = getStoredGeminiApiKey();

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        history,
        userRole,
        userName,
        apiKey: localKey
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        reply: data.reply,
        source: data.source,
        model: data.model,
        requiresApiKey: data.requiresApiKey
      };
    }
  } catch (err) {
    console.warn('Lỗi kết nối backend AI, kích hoạt phản hồi dự phòng:', err);
  }

  // Fallback client response nếu server không phản hồi
  return {
    success: true,
    reply: `🤖 **Trợ lý AI StudentHub:**\n\nCảm ơn bạn đã hỏi về: *"${message}"*.\n\nStudentHub luôn đồng hành cùng sinh viên:\n- 🛡️ **Ký quỹ Escrow:** Bảo vệ 100% thù lao của bạn.\n- 💼 **Việc làm:** Tìm việc part-time & internship linh hoạt theo ca học.\n- 🚀 **Freelance:** Tự đăng gói dịch vụ để có thu nhập chủ động.\n\n*Bạn hãy bấm nút Cài đặt để thêm Google Gemini API Key và trò chuyện nâng cao nhé!*`,
    source: 'client_fallback',
    requiresApiKey: true
  };
}
