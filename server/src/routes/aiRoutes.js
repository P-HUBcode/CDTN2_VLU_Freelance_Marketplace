const express = require('express');
const router = express.Router();
const { generateGeminiChatReply } = require('../services/geminiService');

/**
 * POST /api/ai/chat
 * Nhận tin nhắn từ người dùng và trả về phản hồi từ Google Gemini AI
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, history, userRole, userName, apiKey } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Nội dung tin nhắn không được để trống.'
      });
    }

    const result = await generateGeminiChatReply({
      message: message.trim(),
      history: history || [],
      userRole: userRole || 'student',
      userName: userName || '',
      apiKey: apiKey || ''
    });

    return res.json({
      success: true,
      reply: result.reply,
      source: result.source,
      model: result.model,
      requiresApiKey: result.requiresApiKey || false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Lỗi API /api/ai/chat:', error);
    return res.status(500).json({
      success: false,
      error: 'Không thể kết nối đến máy chủ AI: ' + error.message
    });
  }
});

/**
 * GET /api/ai/status
 * Kiểm tra trạng thái cấu hình Gemini API Key
 */
router.get('/status', (req, res) => {
  const hasKey = Boolean(
    (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') ||
    (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.trim() !== '')
  );

  res.json({
    hasServerApiKey: hasKey,
    model: 'gemini-1.5-flash',
    provider: 'Google AI Studio',
    status: hasKey ? 'connected' : 'needs_key'
  });
});

module.exports = router;
