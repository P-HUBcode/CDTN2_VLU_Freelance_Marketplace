const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const freelanceRoutes = require('./routes/freelanceRoutes');
const chatRoutes = require('./routes/chatRoutes');
const projectRoutes = require('./routes/projectRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const emailRoutes = require('./routes/emailRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { apiLimiter, authLimiter } = require('./middlewares/rateLimiter');
const { isCloudinaryConfigured } = require('./config/cloudinary');
const { isMySQLConnected } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// =============================================================================
// TẦNG 2: SECURITY & GATEWAY (CORS, RATE LIMITER, JWT)
// =============================================================================

// 1. CORS Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Global Rate Limiter chống DoS / Web Scraping spam
app.use('/api', apiLimiter);

// 3. Parser JSON & Form-data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Phục vụ file tĩnh (Local fallback uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// =============================================================================
// TẦNG 3: BUSINESS LOGIC LAYER & ROUTING
// =============================================================================

// Route Auth với Rate Limiter nghiêm ngặt chống Brute-force
app.use('/api/auth', authLimiter, authRoutes);

// Tuyến đường Nghiệp vụ
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/freelance', freelanceRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/ai', aiRoutes);

// Root Healthcheck & Kiến trúc 4 phân tầng
app.get('/', (req, res) => {
  res.json({
    project: 'Student Freelance Hub / VLU Freelance Marketplace API (CDTN2)',
    authors: 'Nguyễn Minh Phú (MSSV: 2374802013447) & Hà Đại Vĩ (MSSV: 2374802010551)',
    instructor: 'ThS. Nguyễn Văn Trung',
    architecture: {
      tier_1_presentation: 'ReactJS + TailwindCSS (Desktop & Mobile Responsive, Axios / React Query)',
      tier_2_security_gateway: 'JWT (JSON Web Token), CORS, Rate Limiter (express-rate-limit)',
      tier_3_business_logic: 'Node.js (Express.js) - Kiểm duyệt tin, Bộ lọc ca làm, Quy trình ứng tuyển, Tính điểm uy tín',
      tier_4_data_access_storage: {
        database: isMySQLConnected() ? 'MySQL 8.0 (Connected)' : 'Smart In-Memory Store / Supabase PostgreSQL Compatible',
        cloud_storage: isCloudinaryConfigured() ? 'Cloudinary Object Storage (Active)' : 'Local File Storage Fallback (/uploads)'
      }
    },
    endpoints: {
      auth: ['POST /api/auth/register', 'POST /api/auth/login', 'GET /api/auth/me'],
      jobs: ['GET /api/jobs', 'GET /api/jobs/:id', 'POST /api/jobs'],
      applications: ['POST /api/applications', 'GET /api/applications/job/:jobId', 'PUT /api/applications/:id/status'],
      reviews: ['POST /api/reviews', 'GET /api/reviews/user/:userId'],
      upload: ['POST /api/upload (CV PDF / Avatar image)'],
      admin: ['GET /api/admin/stats', 'GET /api/admin/jobs/pending', 'PUT /api/admin/jobs/:id/moderate']
    }
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 [VLU Freelance Server] Backend API đang chạy tại:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`🛡️ Rate Limiter: Active | ☁️ Cloudinary: ${isCloudinaryConfigured() ? 'Configured' : 'Local Fallback'}`);
  console.log(`=======================================================`);
});
