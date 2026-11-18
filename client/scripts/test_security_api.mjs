/**
 * STUDENTHUB - SECURITY VERIFICATION TEST SUITE VIA SUPABASE-JS REAL API
 * Date: 2026-11-13
 * 
 * BẮT BUỘC KẾT NỐI SUPABASE THẬT:
 * Script đọc VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY từ client/.env hoặc environment variables.
 * Nếu thiếu hoặc chứa giá trị mẫu (placeholder) -> THOÁT NGAY VỚI MÃ LỖI 1.
 * TUYỆT ĐỐI KHÔNG DÙNG MOCK SIMULATION HOẶC TỰ IN PASS.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Đọc file .env
const envFiles = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'client/.env')
];

let supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
let supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

for (const envPath of envFiles) {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...vals] = trimmed.split('=');
        const val = vals.join('=').trim().replace(/^["']|["']$/g, '');
        if (key === 'VITE_SUPABASE_URL' && !supabaseUrl) supabaseUrl = val;
        if (key === 'VITE_SUPABASE_ANON_KEY' && !supabaseAnonKey) supabaseAnonKey = val;
      }
    });
  }
}

console.log('========================================================================');
console.log('STUDENTHUB - SUPABASE-JS SECURITY & RLS REAL API VERIFICATION');
console.log('========================================================================');
console.log(`Supabase URL: ${supabaseUrl || '(Chưa cấu hình)'}`);

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseUrl.includes('dummy-project') &&
  !supabaseAnonKey.includes('placeholder') &&
  !supabaseAnonKey.includes('dummy-anon-key')
);

if (!isConfigured) {
  console.error('\n❌ [LỖI NGHIÊM TRỌNG]: Thiếu biến môi trường Supabase thực tế!');
  console.error('File client/.env hiện chưa có VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY hợp lệ.');
  console.error('Script dừng lại ngay lập tức theo yêu cầu bảo mật, không chạy giả lập (no simulation).\n');
  console.error('HƯỚNG DẪN:');
  console.error('1. Tạo project trên Supabase (hoặc chạy Supabase local).');
  console.error('2. Điền VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào client/.env.');
  console.error('3. Nạp seed SQL và chạy lại script này.\n');
  process.exit(1);
}

// 4 Tài khoản kiểm thử thực tế trong Supabase Auth
const ACCOUNTS = {
  studentA: { email: 'student.a@test.vn', password: 'Password123!', role: 'student', id: '11111111-1111-1111-1111-111111111111' },
  studentB: { email: 'student.b@test.vn', password: 'Password123!', role: 'student', id: '22222222-2222-2222-2222-222222222222' },
  employerA: { email: 'employer.a@test.vn', password: 'Password123!', role: 'employer', id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
  employerB: { email: 'employer.b@test.vn', password: 'Password123!', role: 'employer', id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' }
};

async function main() {
  console.log('\n[BƯỚC 1]: Đăng nhập 4 tài khoản thật qua supabase.auth.signInWithPassword()...');
  const clients = {};

  for (const [key, acc] of Object.entries(ACCOUNTS)) {
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email: acc.email,
      password: acc.password
    });

    if (authError) {
      console.error(`❌ Đăng nhập thất bại cho ${key} (${acc.email}): HTTP Status ${authError.status || 400} - Code: ${authError.code || 'AUTH_ERR'} - Message: ${authError.message}`);
      console.error('Vui lòng đảm bảo 4 tài khoản test đã được tạo trong Supabase Auth (chạy seed_auth.sql).');
      process.exit(1);
    }

    clients[key] = {
      client,
      uid: authData.user.id,
      email: authData.user.email
    };
    console.log(`  ✓ ${key}: Đăng nhập thành công (UID: ${authData.user.id})`);
  }

  console.log('\n[BƯỚC 2]: Thực thi các kịch bản kiểm thử bảo mật trực tiếp qua HTTP API...');
  let passCount = 0;
  let totalCases = 0;

  // Helper hàm in kết quả thật từ Supabase
  function assertResult(testName, result, isExpectedSuccess, errorExpectation = null) {
    totalCases++;
    console.log(`\n------------------------------------------------------------------------`);
    console.log(`[TEST #${totalCases}] ${testName}`);
    console.log(`HTTP Status / Error: ${result.status || (result.error ? result.error.status || 'ERROR' : 200)}`);
    if (result.error) {
      console.log(`Supabase Error Code: ${result.error.code}`);
      console.log(`Error Message: ${result.error.message}`);
      if (result.error.details) console.log(`Details: ${result.error.details}`);
    } else {
      console.log(`Data count / payload: ${Array.isArray(result.data) ? `${result.data.length} rows` : JSON.stringify(result.data)}`);
    }

    if (isExpectedSuccess) {
      if (!result.error) {
        console.log(`=> KẾT QUẢ: PASS (Thành công đúng kỳ vọng)`);
        passCount++;
      } else {
        console.error(`=> KẾT QUẢ: FAIL (Kỳ vọng thành công nhưng Supabase báo lỗi)`);
      }
    } else {
      // Kỳ vọng bị chặn (RLS hoặc Trigger)
      if (result.error) {
        if (!errorExpectation || result.error.message.includes(errorExpectation) || result.error.code === errorExpectation) {
          console.log(`=> KẾT QUẢ: PASS (Bị chặn chuẩn xác bởi RLS / Trigger / Grant)`);
          passCount++;
        } else {
          console.error(`=> KẾT QUẢ: FAIL (Bị lỗi nhưng thông điệp lỗi không khớp)`);
        }
      } else if (Array.isArray(result.data) && result.data.length === 0) {
        console.log(`=> KẾT QUẢ: PASS (Bị lọc bởi RLS -> Trả về 0 bản ghi an toàn)`);
        passCount++;
      } else {
        console.error(`=> KẾT QUẢ: FAIL (Kỳ vọng bị chặn nhưng thao tác lại lọt qua!)`);
      }
    }
  }

  // TC 1: Student A truy vấn application_notes
  const tc1 = await clients.studentA.client.from('application_notes').select('*');
  assertResult('Student A truy vấn bảng ghi chú nội bộ application_notes', tc1, false);

  // TC 2: Student A truy vấn notifications của Student B
  const tc2 = await clients.studentA.client.from('notifications').select('*').eq('user_id', clients.studentB.uid);
  assertResult('Student A truy vấn thông báo của Student B', tc2, false);

  // TC 3: Client (Student A) tự ý INSERT vào notifications
  const tc3 = await clients.studentA.client.from('notifications').insert({
    user_id: clients.studentA.uid,
    type: 'system_message',
    title: 'Hacked Title',
    message: 'Tự tạo thông báo từ Frontend'
  });
  assertResult('Student A tự ý INSERT vào bảng notifications', tc3, false, '42501');

  // TC 4: User (Student A) cố tình sửa cột title trên notifications
  const tc4 = await clients.studentA.client.from('notifications').update({ title: 'Hacked' }).eq('user_id', clients.studentA.uid);
  assertResult('Student A cố tình sửa cột title trên notifications (Chỉ có quyền UPDATE is_read)', tc4, false, '42501');

  // TC 5: Student A tự ý sửa role = admin trên profiles (Privilege Escalation UPDATE)
  const tc5 = await clients.studentA.client.from('profiles').update({ role: 'admin' }).eq('id', clients.studentA.uid);
  assertResult('Student A cố tình UPDATE role = admin trên profiles', tc5, false, 'vai trò (role)');

  // TC 6: Student A tự ý INSERT profile với role = admin
  const tc6 = await clients.studentA.client.from('profiles').insert({
    id: '99999999-9999-9999-9999-999999999999',
    email: 'hacker@test.vn',
    role: 'admin'
  });
  assertResult('Student A cố tình INSERT profile mới với role = admin', tc6, false);

  // TC 7: Employer B truy vấn student_profiles của Student A (Student A chỉ nộp vào Job của Employer A)
  const tc7 = await clients.employerB.client.from('student_profiles').select('*').eq('user_id', clients.studentA.uid);
  assertResult('Employer B truy vấn student_profiles của Student A (Không có quan hệ ứng tuyển)', tc7, false);

  // TC 8: Employer A truy vấn student_profiles của Student A (Đã nộp đơn vào Job A)
  const tc8 = await clients.employerA.client.from('student_profiles').select('*').eq('user_id', clients.studentA.uid);
  assertResult('Employer A truy vấn student_profiles của Student A (Ứng viên hợp lệ)', tc8, true);

  // TC 9: Employer B truy vấn application_status_history của ứng viên thuộc Job A
  const tc9 = await clients.employerB.client.from('application_status_history').select('*');
  assertResult('Employer B truy vấn lịch sử trạng thái của Employer A', tc9, false);

  // TC 10: Employer A cố tình sửa cover_letter trên đơn ứng tuyển
  const tc10 = await clients.employerA.client.from('job_applications').update({ cover_letter: 'Can thiệp trái phép' }).eq('student_id', clients.studentA.uid);
  assertResult('Employer A can thiệp sửa cover_letter của ứng viên', tc10, false, 'trạng thái');

  // TC 11: Stranger (Student B) cố gắng đọc email và phone từ profiles của Student A
  const tc11 = await clients.studentB.client.from('profiles').select('email, phone').eq('id', clients.studentA.uid);
  assertResult('Student B cố gắng đọc thông tin nhạy cảm (email, phone) của Student A từ profiles', tc11, false);

  console.log('\n========================================================================');
  console.log(`>>> TỔNG KẾT API TEST THẬT: ${passCount}/${totalCases} CASES ĐẠT CHUẨN`);
  console.log('========================================================================');

  if (passCount !== totalCases) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
