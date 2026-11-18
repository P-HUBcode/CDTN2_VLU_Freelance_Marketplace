/**
 * Dịch vụ tích hợp Google Gemini AI cho nền tảng StudentHub
 * Hỗ trợ model gemini-1.5-flash với API Key của Google AI Studio
 */

const SYSTEM_INSTRUCTION = `Bạn là StudentHub AI, trợ lý ảo thông minh của nền tảng kết nối việc làm và freelance cho sinh viên Việt Nam (StudentHub.vn).
Nhiệm vụ của bạn là:
1. Tư vấn việc làm thêm (part-time), thực tập sinh (internship) và công việc freelance theo dự án phù hợp với sinh viên các trường đại học tại TP.HCM và toàn quốc.
2. Hướng dẫn sinh viên viết CV chuyên nghiệp, xây dựng Portfolio (Canva, Behance, GitHub) và kỹ năng trả lời phỏng vấn ấn tượng.
3. Giải thích về cơ chế Ký quỹ Escrow bảo đảm 100%: Tiền thù lao được sàn tạm giữ an toàn trước khi bắt đầu, chỉ giải ngân cho sinh viên khi sản phẩm được nghiệm thu hài lòng, giúp xóa bỏ 100% tình trạng lừa đảo và quỵt tiền.
4. Hỗ trợ nhà tuyển dụng đăng tin tuyển dụng, tạo yêu cầu dự án và chọn ứng viên sinh viên xuất sắc nhất.
Phong cách giao tiếp: Nhiệt tình, thân thiện, mang năng lượng tích cực cho sinh viên, câu trả lời rõ ràng, có cấu trúc bullet point và emoji sinh động.`;

/**
 * Tạo câu trả lời thông minh tích hợp sẵn khi chưa có Gemini API Key hoặc khi offline
 */
function getSmartFallbackReply(message, userRole = 'student') {
  const msgLower = (message || '').toLowerCase();

  if (msgLower.includes('escrow') || msgLower.includes('ký quỹ') || msgLower.includes('bảo vệ') || msgLower.includes('quỵt')) {
    return `🛡️ **Cơ chế Ký quỹ Escrow bảo đảm 100% trên StudentHub hoạt động như thế nào?**

1. **Khách hàng/Doanh nghiệp nạp thù lao vào Escrow:** Khi thuê freelance hoặc nhận ứng viên, số tiền thù lao thỏa thuận sẽ được sàn StudentHub tạm giữ an toàn.
2. **Sinh viên yên tâm làm việc:** Sinh viên thực hiện các đầu việc/task theo tiến độ mà không sợ bị quỵt tiền hay bùng kèo.
3. **Bàn giao sản phẩm & Nghiệm thu:** Khi sản phẩm hoàn thành, khách hàng kiểm tra và duyệt nghiệm thu.
4. **Giải ngân tức thì:** Tiền thù lao ngay lập tức được chuyển vào **Ví thu nhập** của sinh viên để rút về ngân hàng trong 1-Click!

✨ *Mọi giao dịch trên StudentHub đều được bảo đảm minh bạch tuyệt đối!*`;
  }

  if (msgLower.includes('cv') || msgLower.includes('hồ sơ') || msgLower.includes('kinh nghiệm') || msgLower.includes('xin việc')) {
    return `📝 **Mẹo viết CV chuẩn chỉnh dành cho sinh viên chưa có nhiều kinh nghiệm:**

1. **Tập trung vào Kỹ năng thực chiến:** Nêu rõ các công cụ bạn thành thạo (ví dụ: *Canva, CapCut, Excel, Figma, ReactJS...*).
2. **Đưa Dự án học tập & Hoạt động ngoại khóa vào:** Nếu chưa đi làm, các bài tập lớn, đề án môn học hoặc chiến dịch CLB sinh viên chính là minh chứng thuyết phục nhất!
3. **Đính kèm Link Portfolio:** Hãy đưa link Behance, Google Drive hoặc link sản phẩm mẫu vào hồ sơ ứng tuyển.
4. **Thư giới thiệu bản thân (Cover Letter) chân thành:** Nêu rõ thời gian biểu rảnh theo ca học và cam kết hoàn thành deadline đúng hạn.

🚀 *Bạn có thể ứng tuyển ngay các tin tuyển dụng Part-time & Internship đang mở trên StudentHub nhé!*`;
  }

  if (msgLower.includes('freelance') || msgLower.includes('dịch vụ') || msgLower.includes('bán') || msgLower.includes('kiếm tiền')) {
    return `💡 **Cách sinh viên bắt đầu nhận job và kiếm thu nhập trên StudentHub:**

1. **Tạo gói dịch vụ kỹ năng:** Bấm nút **"+ Tạo dịch vụ"** trên thanh menu, chọn nhóm ngành (Design Canva, Edit Video TikTok, Viết bài SEO, Gia sư, Lập trình...).
2. **Đặt giá khởi điểm hợp lý:** Đối với sinh viên mới bắt đầu, mức giá từ *150.000đ – 300.000đ* sẽ dễ dàng thu hút các khách hàng đầu tiên.
3. **Mô tả rõ sản phẩm bàn giao:** Nêu rõ số lượng (ví dụ: *5 ảnh banner Canva hoàn chỉnh, tặng kèm 2 lần chỉnh sửa*).
4. **Khách hàng đặt hàng qua Escrow:** Bạn nhận thông báo, tiến hành làm và bàn giao để nhận tiền về ví!

🎯 *Rất nhiều sinh viên đã có thu nhập từ 3 - 8 triệu/tháng từ chính kỹ năng của mình đấy!*`;
  }

  if (msgLower.includes('chào') || msgLower.includes('hello') || msgLower.includes('hi')) {
    return `👋 Xin chào bạn! Mình là **StudentHub AI** – Trợ lý ảo thông minh của sàn việc làm và freelance sinh viên.

Mình có thể giúp bạn:
- 🔍 **Tìm việc làm phù hợp:** Part-time, thực tập, làm remote linh hoạt theo ca học.
- 🎨 **Tư vấn Freelance:** Cách tạo gói dịch vụ kỹ năng và nhận khách hàng.
- 📝 **Tối ưu hồ sơ:** Cách viết CV, portfolio và thư ứng tuyển.
- 🛡️ **Hỗ trợ quyền lợi:** Quy trình ký quỹ Escrow và thanh toán an toàn.

Bạn đang quan tâm đến vấn đề gì, hãy hỏi mình nhé! ✨`;
  }

  return `🤖 **StudentHub AI trả lời:**

Cảm ơn bạn đã đặt câu hỏi: *"${message}"*!

Về vấn đề này, trên nền tảng StudentHub bạn có thể:
- Xem danh sách việc làm mới nhất tại tab **"Tìm Việc Làm"** (lọc theo Part-time, Remote, Internship, Ngành nghề).
- Tạo gói dịch vụ kỹ năng tại tab **"Thuê freelance"** để tiếp cận hàng trăm khách hàng.
- Theo dõi toàn bộ tiến độ công việc và thù lao tại mục **"Công việc của tôi"**.

💡 *Gợi ý: Bạn có thể nhập Google Gemini API Key tại nút ⚙️ Cài đặt để kích hoạt toàn bộ trí tuệ nhân tạo thế hệ mới của Google Gemini!*`;
}

/**
 * Gửi tin nhắn đến Google Gemini API (gemini-1.5-flash)
 */
async function generateGeminiChatReply({ message, history = [], userRole = 'student', userName = '', apiKey = '' }) {
  const activeKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

  // Nếu không có API Key, sử dụng bộ xử lý thông minh tích hợp sẵn
  if (!activeKey || activeKey.trim() === '') {
    const fallbackText = getSmartFallbackReply(message, userRole);
    return {
      reply: fallbackText,
      source: 'smart_fallback',
      model: 'StudentHub-Knowledge-Base',
      requiresApiKey: true
    };
  }

  try {
    // Chuẩn bị lịch sử hội thoại cho Gemini API
    const contents = [];

    // Chuyển đổi lịch sử chat (nếu có)
    if (Array.isArray(history) && history.length > 0) {
      history.slice(-6).forEach((h) => {
        contents.push({
          role: h.sender === 'user' || h.sender === 'me' ? 'user' : 'model',
          parts: [{ text: h.text || '' }]
        });
      });
    }

    // Thêm tin nhắn hiện tại
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Danh sách model ưu tiên theo tốc độ & tính ổn định của Google AI Studio
    const candidateModels = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];
    let candidateText = null;
    let usedModel = 'gemini-flash-lite-latest';

    for (const modelName of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${activeKey.trim()}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: `${SYSTEM_INSTRUCTION}\nNgười dùng hiện tại: ${userName || 'Sinh viên'} (Vai trò: ${userRole}).` }]
            },
            contents: contents,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024
            }
          }),
          signal: AbortSignal.timeout(9000)
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim()) {
            candidateText = text.trim();
            usedModel = modelName;
            break;
          }
        } else {
          console.warn(`[Gemini API ${modelName} Warning] Status: ${response.status}`);
        }
      } catch (err) {
        console.warn(`[Gemini ${modelName} fetch error]:`, err.message);
      }
    }

    if (candidateText && candidateText.trim()) {
      return {
        reply: candidateText.trim(),
        source: usedModel,
        model: `Google Gemini AI (${usedModel})`,
        requiresApiKey: false
      };
    } else {
      const fallbackText = getSmartFallbackReply(message, userRole);
      return {
        reply: fallbackText,
        source: 'smart_fallback',
        requiresApiKey: false
      };
    }

    if (candidateText && candidateText.trim()) {
      return {
        reply: candidateText.trim(),
        source: 'gemini-1.5-flash',
        model: 'Google Gemini 1.5 Flash',
        requiresApiKey: false
      };
    } else {
      const fallbackText = getSmartFallbackReply(message, userRole);
      return {
        reply: fallbackText,
        source: 'smart_fallback',
        requiresApiKey: false
      };
    }
  } catch (error) {
    console.error('[Gemini Service Exception]:', error.message);
    const fallbackText = getSmartFallbackReply(message, userRole);
    return {
      reply: fallbackText,
      source: 'smart_fallback',
      errorDetails: error.message,
      requiresApiKey: false
    };
  }
}

module.exports = {
  generateGeminiChatReply,
  getSmartFallbackReply
};
