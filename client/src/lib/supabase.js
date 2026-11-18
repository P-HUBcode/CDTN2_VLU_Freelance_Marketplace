import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  '';
const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  '';

// Kiểm tra xem đã cấu hình key thật chưa (tránh crash khi developer chưa điền env)
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('placeholder')
);

if (!isSupabaseConfigured) {
  console.info(
    'ℹ️ [StudentHub Info] Supabase chưa được cấu hình khóa API thực tế.\n' +
    'Hệ thống đang chạy chế độ Mock Auth & Local State an toàn.\n' +
    'Để kết nối Supabase thật: Hãy điền VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong file client/.env'
  );
}

// Khởi tạo Supabase Client với tính năng tự động duy trì phiên đăng nhập (Session Persistence)
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://dummy-project.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'dummy-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export default supabase;
