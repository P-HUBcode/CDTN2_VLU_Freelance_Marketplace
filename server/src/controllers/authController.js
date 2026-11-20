const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool, isMySQLConnected, memoryStore } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'vlu_freelance_secret_key_k27_cntt_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

exports.register = async (req, res) => {
  try {
    const { email, password, full_name, role, mssv, phone } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ email, mật khẩu và họ tên' });
    }

    const assignedRole = role || (email.endsWith('@student.vlu.edu.vn') ? 'student' : 'employer');
    const isVluStudent = email.endsWith('@student.vlu.edu.vn');
    const hashedPassword = await bcrypt.hash(password, 10);

    if (isMySQLConnected()) {
      const pool = getPool();
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message: 'Email này đã được đăng ký trong hệ thống' });
      }

      const [result] = await pool.query(
        'INSERT INTO users (email, password_hash, role, is_verified) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, assignedRole, isVluStudent ? 1 : 0]
      );

      const userId = result.insertId;
      if (assignedRole === 'student') {
        await pool.query(
          'INSERT INTO student_profiles (user_id, full_name, student_code, phone) VALUES (?, ?, ?, ?)',
          [userId, full_name, mssv || '2374802013447', phone || '']
        );
      } else if (assignedRole === 'employer') {
        await pool.query(
          'INSERT INTO employer_profiles (user_id, company_name, contact_phone) VALUES (?, ?, ?)',
          [userId, full_name, phone || '']
        );
      }

      const token = jwt.sign({ id: userId, email, role: assignedRole, full_name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      return res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công',
        token,
        user: { id: userId, email, role: assignedRole, full_name, is_verified: isVluStudent }
      });
    } else {
      // Memory fallback
      const found = memoryStore.users.find(u => u.email === email);
      if (found) {
        return res.status(409).json({ success: false, message: 'Email này đã được đăng ký trong hệ thống' });
      }

      const newId = memoryStore.users.length + 1;
      const newUser = {
        id: newId,
        email,
        full_name,
        role: assignedRole,
        is_verified: isVluStudent ? 1 : 0,
        mssv: mssv || '2374802013447'
      };
      memoryStore.users.push(newUser);

      const token = jwt.sign({ id: newId, email, role: assignedRole, full_name }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      return res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công (Chế độ In-memory)',
        token,
        user: newUser
      });
    }
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và mật khẩu' });
    }

    if (isMySQLConnected()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
      }

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
      }

      let profileName = user.email;
      if (user.role === 'student') {
        const [sp] = await pool.query('SELECT full_name FROM student_profiles WHERE user_id = ?', [user.id]);
        if (sp.length > 0) profileName = sp[0].full_name;
      } else if (user.role === 'employer') {
        const [ep] = await pool.query('SELECT company_name FROM employer_profiles WHERE user_id = ?', [user.id]);
        if (ep.length > 0) profileName = ep[0].company_name;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, full_name: profileName },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        success: true,
        message: 'Đăng nhập thành công',
        token,
        user: { id: user.id, email: user.email, role: user.role, full_name: profileName, is_verified: !!user.is_verified }
      });
    } else {
      // Memory Store default test logins
      const user = memoryStore.users.find(u => u.email === email) || {
        id: 2,
        email: email,
        full_name: email.includes('student') ? 'Nguyễn Minh Phú' : 'Người dùng VLU',
        role: email.includes('admin') ? 'admin' : (email.includes('student') ? 'student' : 'employer'),
        is_verified: 1
      };

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        success: true,
        message: 'Đăng nhập thành công',
        token,
        user
      });
    }
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

const fs = require('fs');
const path = require('path');
const passwordsFilePath = path.join(__dirname, '../config/user_passwords.json');

function loadPasswordsFromFile() {
  try {
    if (fs.existsSync(passwordsFilePath)) {
      return JSON.parse(fs.readFileSync(passwordsFilePath, 'utf8'));
    }
  } catch (e) {
    console.warn('Lỗi đọc user_passwords.json:', e);
  }
  return {
    'student.a@test.vn': 'Password123!',
    'student.b@test.vn': 'Password123!',
    'employer.a@test.vn': 'Password123!',
    'employer.b@test.vn': 'Password123!',
    'admin@test.vn': 'Password123!',
    'phu47008@gmail.com': 'Password123!',
    'havykute0101@gmail.com': 'Password123!',
    'sinhvien.demo@student.vlu.edu.vn': 'VluStudent@2026',
    'tuyendung.demo@gmail.com': 'Employer@2026'
  };
}

function savePasswordsToFile(passMap) {
  try {
    fs.writeFileSync(passwordsFilePath, JSON.stringify(passMap, null, 2), 'utf8');
  } catch (e) {
    console.warn('Lỗi ghi user_passwords.json:', e);
  }
}

// Lấy danh sách mật khẩu hệ thống (phục vụ đăng nhập đa thiết bị & Admin)
exports.getUserPasswords = async (req, res) => {
  try {
    const data = loadPasswordsFromFile();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Cập nhật mật khẩu người dùng (Admin đổi mật khẩu hoặc User đổi mật khẩu)
exports.updateUserPassword = async (req, res) => {
  try {
    const { email, userId, newPassword } = req.body;
    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải từ 6 ký tự trở lên' });
    }

    const currentMap = loadPasswordsFromFile();
    const cleanPass = newPassword.trim();
    if (email) currentMap[email.trim().toLowerCase()] = cleanPass;
    if (userId) currentMap[userId] = cleanPass;

    savePasswordsToFile(currentMap);
    res.json({ success: true, message: 'Đã cập nhật mật khẩu thành công trên máy chủ' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
