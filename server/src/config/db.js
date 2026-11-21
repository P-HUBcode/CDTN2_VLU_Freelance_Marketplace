const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

let pool = null;
let isConnected = false;

// Băm mật khẩu mặc định bằng bcrypt cho các tài khoản seed
const defaultDemoHash = bcrypt.hashSync('Password123!', 10);

// Fallback in-memory seed data matching database_schema.sql
const memoryStore = {
  users: [
    { id: 1, email: 'admin@test.vn', role: 'admin', full_name: 'Quản trị viên Hệ thống (Admin)', password_hash: defaultDemoHash, is_verified: 1 }
  ],
  jobs: [],
  applications: [],
  projects: [],
  chatConversations: []
};

async function initDB() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'vlu_freelance_db',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ [Database] Đã kết nối thành công tới MySQL CSDL: ' + (process.env.DB_NAME || 'vlu_freelance_db'));
    connection.release();
    isConnected = true;
  } catch (err) {
    console.warn('⚠️ [Database Warning] Không thể kết nối tới MySQL trực tiếp (' + err.message + ').');
    console.log('💡 [Database Fallback] Chuyển sang chế độ Smart In-Memory Store để hệ thống chạy mượt mà ngay lập tức!');
    isConnected = false;
  }
}

initDB();

module.exports = {
  getPool: () => pool,
  isMySQLConnected: () => isConnected,
  memoryStore
};
