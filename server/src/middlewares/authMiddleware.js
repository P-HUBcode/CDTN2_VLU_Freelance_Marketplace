const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const JWT_SECRET = process.env.JWT_SECRET || 'vlu_freelance_secret_key_k27_cntt_2026';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://hnjitsvjteyixhieshil.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_WQSehlIknjN3qMs6kX3f_g_LsDQqJac';

let supabaseClient = null;
function getSupabase() {
  if (!supabaseClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Yêu cầu token xác thực (Thiếu header Authorization)' });
  }

  // 1. Kiểm tra JWT nội bộ của Backend Server
  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (!err && user) {
      req.user = user;
      return next();
    }

    // 2. Nếu không khớp JWT nội bộ, xác thực với Supabase Auth
    try {
      const supabase = getSupabase();
      if (supabase) {
        const { data: supaData, error: supaErr } = await supabase.auth.getUser(token);
        if (!supaErr && supaData?.user) {
          const sUser = supaData.user;
          // NGUỒN ĐÁNG TIN CẬY: Truy vấn vai trò trực tiếp từ bảng profiles trong Database Supabase
          let trustedRole = 'student';
          try {
            const { data: profileRow } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', sUser.id)
              .single();
            if (profileRow?.role) {
              trustedRole = profileRow.role;
            } else if (sUser.email === 'admin@test.vn' || sUser.email === 'admin.demo@gmail.com') {
              trustedRole = 'admin';
            }
          } catch (pe) {
            if (sUser.email === 'admin@test.vn' || sUser.email === 'admin.demo@gmail.com') {
              trustedRole = 'admin';
            }
          }

          req.user = {
            id: sUser.id,
            email: sUser.email,
            role: trustedRole,
            full_name: sUser.user_metadata?.full_name || sUser.email
          };
          return next();
        }
      }
    } catch (e) {}

    return res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  });
}

function optionalAuthenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (!err && user) {
      req.user = user;
      return next();
    }

    try {
      const supabase = getSupabase();
      if (supabase) {
        const { data: supaData, error: supaErr } = await supabase.auth.getUser(token);
        if (!supaErr && supaData?.user) {
          const sUser = supaData.user;
          let trustedRole = 'student';
          try {
            const { data: profileRow } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', sUser.id)
              .single();
            if (profileRow?.role) {
              trustedRole = profileRow.role;
            } else if (sUser.email === 'admin@test.vn' || sUser.email === 'admin.demo@gmail.com') {
              trustedRole = 'admin';
            }
          } catch (pe) {
            if (sUser.email === 'admin@test.vn' || sUser.email === 'admin.demo@gmail.com') {
              trustedRole = 'admin';
            }
          }

          req.user = {
            id: sUser.id,
            email: sUser.email,
            role: trustedRole,
            full_name: sUser.user_metadata?.full_name || sUser.email
          };
          return next();
        }
      }
    } catch (e) {}

    req.user = null;
    return next();
  });
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa xác thực người dùng' });
    }
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền thực hiện hành động này. Yêu cầu quyền: ${roles.join(', ')}`
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  optionalAuthenticateToken,
  requireRole
};
