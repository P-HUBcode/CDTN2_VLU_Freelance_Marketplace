const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { isMySQLConnected } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files (CVs, images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);

// Root Healthcheck & API Info
app.get('/', (req, res) => {
  res.json({
    project: 'VLU Freelance Marketplace API (Chuyên đề tốt nghiệp 2)',
    author: 'Nguyễn Minh Phú (MSSV: 2374802013447) & Hà Đại Vĩ (MSSV: 2374802010551)',
    instructor: 'ThS. Nguyễn Văn Trung',
    database_status: isMySQLConnected() ? 'Connected (MySQL 8.0)' : 'Running (In-Memory Fallback)',
    endpoints: {
      auth: ['POST /api/auth/register', 'POST /api/auth/login', 'GET /api/auth/me'],
      jobs: ['GET /api/jobs', 'GET /api/jobs/:id', 'POST /api/jobs'],
      applications: ['POST /api/applications', 'GET /api/applications/job/:jobId', 'PUT /api/applications/:id/status'],
      admin: ['GET /api/admin/stats', 'GET /api/admin/jobs/pending', 'PUT /api/admin/jobs/:id/moderate']
    }
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 [VLU Freelance Server] Backend API đang chạy tại:`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
