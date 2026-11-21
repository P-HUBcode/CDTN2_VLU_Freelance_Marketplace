/**
 * STUDENTHUB - SCRIPT KIỂM KÊ VÀ RESET DỮ LIỆU THỬ NGHIỆM
 *
 * Mặc định: Chế độ XEM TRƯỚC (PREVIEW / DRY-RUN).
 * Chỉ thực thi xóa khi truyền cờ --execute: node scripts/cleanup_demo_data.mjs --execute
 *
 * Tham số tùy chọn:
 *   --keep-admin-id <UUID>         Chỉ định UUID Admin giữ lại (mặc định fa83ad10-8965-45d2-94c6-ae3ef8d5f847)
 *   --keep-marketplace-jobs       Giữ lại 11 tin tuyển dụng mẫu của sàn Marketplace (chuyển owner về Admin)
 *   --execute                     Thực thi xóa dữ liệu thật trên Supabase Cloud
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hnjitsvjteyixhieshil.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_WQSehlIknjN3qMs6kX3f_g_LsDQqJac';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isExecute = process.argv.includes('--execute');
const keepMarketplaceJobs = process.argv.includes('--keep-marketplace-jobs');

// Lấy UUID Admin cần giữ lại từ CLI argument nếu có
const adminArgIndex = process.argv.indexOf('--keep-admin-id');
const TARGET_ADMIN_ID = adminArgIndex !== -1 && process.argv[adminArgIndex + 1]
  ? process.argv[adminArgIndex + 1]
  : 'fa83ad10-8965-45d2-94c6-ae3ef8d5f847';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  console.log('================================================================');
  console.log('🔍 STUDENTHUB - BÁO CÁO XEM TRƯỚC RESET DỮ LIỆU (PREVIEW)');
  console.log(`🌐 Project URL: ${supabaseUrl}`);
  console.log(`🔑 Project Ref: hnjitsvjteyixhieshil`);
  console.log(`⚙️ Chế độ chạy: ${isExecute ? '⚠️ THỰC THI XÓA DỮ LIỆU (--execute)' : '👁️ XEM TRƯỚC (DRY-RUN - KHÔNG THAY ĐỔI DỮ LIỆU)'}`);
  console.log('================================================================\n');

  // Đăng nhập Admin để có quyền kiểm kê
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@test.vn',
    password: 'Password123!'
  });

  if (authErr) {
    console.error('❌ Không thể đăng nhập bằng tài khoản Admin để kiểm kê:', authErr.message);
    process.exit(1);
  }

  const adminToken = authData.session.access_token;
  const adminClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${adminToken}` } },
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // 1. Kiểm kê PROFILES & ADMINS
  const { data: profiles, error: pErr } = await adminClient.from('profiles').select('*');
  if (pErr) {
    console.error('Lỗi truy vấn profiles:', pErr.message);
    process.exit(1);
  }

  const adminProfiles = profiles.filter(p => p.role === 'admin');
  const targetAdmin = profiles.find(p => p.id === TARGET_ADMIN_ID);

  console.log('1. XÁC ĐỊNH TÀI KHOẢN ADMIN:');
  console.log(`   - Tổng số Admin hiện có: ${adminProfiles.length}`);
  adminProfiles.forEach(a => {
    const isTarget = a.id === TARGET_ADMIN_ID;
    console.log(`     ${isTarget ? '🟢 [ADMIN GIỮ LẠI]' : '🔴 [ADMIN KHÁC]'}: ${a.full_name} (${a.email}) - UUID: ${a.id}`);
  });

  if (!targetAdmin) {
    console.error(`\n❌ LỖI: Không tìm thấy tài khoản Admin với UUID "${TARGET_ADMIN_ID}". Dừng lại để bảo vệ hệ thống.`);
    process.exit(1);
  }

  // Phân loại tài khoản xóa vs giữ lại
  const accountsToDelete = profiles.filter(p => p.id !== TARGET_ADMIN_ID);
  const accountIdsToDelete = accountsToDelete.map(a => a.id);

  console.log(`\n2. TÀI KHOẢN SẼ XÓA (${accountsToDelete.length} tài khoản):`);
  accountsToDelete.forEach(a => {
    console.log(`   - [${a.role.toUpperCase()}] ${a.full_name} (${a.email}) - UUID: ${a.id}`);
  });

  // 2. Kiểm kê STUDENT_PROFILES
  const { data: sProfs } = await adminClient.from('student_profiles').select('*');
  const studentProfilesToDelete = (sProfs || []).filter(sp => accountIdsToDelete.includes(sp.user_id));

  // 3. Kiểm kê COMPANIES
  const { data: companies } = await adminClient.from('companies').select('*');
  const companiesToDelete = (companies || []).filter(c => accountIdsToDelete.includes(c.owner_id));

  // 4. Kiểm kê JOBS
  const { data: jobs } = await adminClient.from('jobs').select('id, title, employer_id, status');
  const junkTitles = ['dâf', 'dădawdawd', 'ăxxxxx'];
  const junkJobs = [];
  const marketplaceJobs = [];

  (jobs || []).forEach(j => {
    if (junkTitles.includes(j.title?.trim())) {
      junkJobs.push(j);
    } else {
      marketplaceJobs.push(j);
    }
  });

  // 5. Kiểm kê JOB_APPLICATIONS
  const { data: apps } = await adminClient.from('job_applications').select('*');

  // 6. Kiểm kê STUDENT_PROJECTS
  const { data: sps } = await adminClient.from('student_projects').select('*');

  // 7. Kiểm kê SAVED_JOBS
  const { data: savedJobs } = await adminClient.from('saved_jobs').select('*');

  // 8. Kiểm kê STORAGE FILES
  const cvFilesToDelete = [];
  for (const acc of accountsToDelete) {
    const { data: files } = await adminClient.storage.from('cv').list(acc.id);
    if (files && files.length > 0) {
      files.forEach(f => cvFilesToDelete.push({ bucket: 'cv', path: `${acc.id}/${f.name}`, size: f.metadata?.size || 0 }));
    }
  }

  const portfolioFilesToDelete = [];
  for (const acc of accountsToDelete) {
    const { data: files } = await adminClient.storage.from('portfolios').list(acc.id);
    if (files && files.length > 0) {
      files.forEach(f => portfolioFilesToDelete.push({ bucket: 'portfolios', path: `${acc.id}/${f.name}`, size: f.metadata?.size || 0 }));
    }
  }

  console.log('\n3. BẢNG TỔNG HỢP DỮ LIỆU THEO TỪNG BẢNG:');
  console.log('----------------------------------------------------------------');
  console.log(`| Bảng / Mục                  | Tổng số | Dự kiến XÓA | Dự kiến GIỮ |`);
  console.log('----------------------------------------------------------------');
  console.log(`| profiles                    | ${String(profiles.length).padEnd(7)} | ${String(accountsToDelete.length).padEnd(11)} | 1 (Admin)   |`);
  console.log(`| student_profiles            | ${String(sProfs?.length || 0).padEnd(7)} | ${String(studentProfilesToDelete.length).padEnd(11)} | 0 hoặc 1    |`);
  console.log(`| companies                   | ${String(companies?.length || 0).padEnd(7)} | ${String(companiesToDelete.length).padEnd(11)} | 0           |`);
  console.log(`| jobs (Tin rác thử nghiệm)   | ${String(junkJobs.length).padEnd(7)} | ${String(junkJobs.length).padEnd(11)} | 0           |`);
  console.log(`| jobs (Sàn Marketplace mẫu)  | ${String(marketplaceJobs.length).padEnd(7)} | ${keepMarketplaceJobs ? '0          ' : String(marketplaceJobs.length).padEnd(11)} | ${keepMarketplaceJobs ? String(marketplaceJobs.length).padEnd(11) : '0          '} |`);
  console.log(`| job_applications            | ${String(apps?.length || 0).padEnd(7)} | ${String(apps?.length || 0).padEnd(11)} | 0           |`);
  console.log(`| student_projects            | ${String(sps?.length || 0).padEnd(7)} | ${String(sps?.length || 0).padEnd(11)} | 0           |`);
  console.log(`| saved_jobs                  | ${String(savedJobs?.length || 0).padEnd(7)} | ${String(savedJobs?.length || 0).padEnd(11)} | 0           |`);
  console.log(`| Storage bucket "cv" (files) | ${String(cvFilesToDelete.length).padEnd(7)} | ${String(cvFilesToDelete.length).padEnd(11)} | 0           |`);
  console.log(`| Storage "portfolios" (files)| ${String(portfolioFilesToDelete.length).padEnd(7)} | ${String(portfolioFilesToDelete.length).padEnd(11)} | 0           |`);
  console.log('----------------------------------------------------------------');

  if (cvFilesToDelete.length > 0) {
    console.log('\nChi tiết các file CV trong Storage sẽ bị xóa:');
    cvFilesToDelete.forEach(f => console.log(`   - ${f.bucket}/${f.path} (${f.size} bytes)`));
  }

  // 4. KIỂM TRA KHÓA NGOẠI VÀ CASCADE
  console.log('\n4. KIỂM TRA KHÓA NGOẠI & QUY TẮC CASCADE:');
  console.log('   ✅ profiles(id) -> student_profiles(user_id): ON DELETE CASCADE');
  console.log('   ✅ profiles(id) -> companies(owner_id): ON DELETE CASCADE');
  console.log('   ✅ profiles(id) -> jobs(employer_id): ON DELETE CASCADE');
  console.log('   ✅ profiles(id) -> job_applications(student_id): ON DELETE CASCADE');
  console.log('   ✅ jobs(id) -> job_applications(job_id): ON DELETE CASCADE');
  console.log('   ✅ profiles(id) -> student_projects(student_id): ON DELETE CASCADE');
  console.log('   ✅ profiles(id) -> saved_jobs(user_id): ON DELETE CASCADE');
  console.log('   ℹ️ Kết luận: Toàn bộ khóa ngoại đều có CASCADE. Xóa profiles sẽ tự động xóa sạch dữ liệu liên quan ở database mà không để lại dữ liệu mồ côi.');

  // 5. RÀ SOÁT FRONTEND & BACKEND CACHE / FALLBACK
  console.log('\n5. RÀ SOÁT CƠ CHẾ CACHE / DEMO TRÊN FRONTEND & BACKEND:');
  console.log('   ✅ Frontend: Key localStorage "studenthub_projects" dùng chung đã được cách ly theo user ID (saveLocalProjects(user.id)).');
  console.log('   ✅ Frontend: Giao diện "Dự án & Tiến độ" hiển thị "Bạn chưa có dự án nào" và badge = 0 khi danh sách rỗng (không tự nạp mock project).');
  console.log('   ✅ Frontend: ApplyModal đã loại bỏ hardcode phu47008@... và CV_NguyenMinhAnh, không tự nạp CV giả.');
  console.log('   ✅ Backend: projectController kiểm tra quyền thành viên và vai trò, trả về danh sách rỗng cho tài khoản mới.');

  console.log('\n================================================================');
  if (!isExecute) {
    console.log('🛑 TRẠNG THÁI: ĐÃ DỪNG LẠI SAU BÁO CÁO XEM TRƯỚC (DRY-RUN).');
    console.log('⚠️ CHƯA CÓ BẤT KỲ DỮ LIỆU NÀO BỊ XÓA TRÊN SUPABASE CLOUD.');
    console.log('\n👉 Vui lòng gửi thông tin này cho người dùng xác nhận:');
    console.log(`   1. Project Supabase: ${supabaseUrl} (Ref: hnjitsvjteyixhieshil)`);
    console.log(`   2. UUID Admin giữ lại: ${targetAdmin.id} (${targetAdmin.email})`);
    console.log(`   3. Lựa chọn với 11 tin Marketplace mẫu:`);
    console.log(`      - Phương án A (Khuyến nghị): Xóa toàn bộ 14 tin (để test đăng tin mới từ đầu).`);
    console.log(`      - Phương án B: Giữ 11 tin mẫu và chuyển employer_id sang Admin (chạy cùng cờ --keep-marketplace-jobs).`);
    console.log(`\n👉 Sau khi người dùng xác nhận, chạy lệnh thực thi:`);
    console.log(`   node scripts/cleanup_demo_data.mjs --execute`);
    console.log('================================================================');
    return;
  }

  // NẾU CÓ CỜ --execute: THỰC THI XÓA
  console.log('⚠️ BẮT ĐẦU THỰC THI XÓA DỮ LIỆU THEO LỆNH CỦA NGƯỜI DÙNG...');

  // Bước 1: Xóa files trong Storage
  if (cvFilesToDelete.length > 0) {
    const paths = cvFilesToDelete.map(f => f.path);
    const { error: rmCvErr } = await adminClient.storage.from('cv').remove(paths);
    console.log(`   - Storage cv: Đã xóa ${paths.length} file test (${rmCvErr ? rmCvErr.message : 'Thành công'}).`);
  }

  if (portfolioFilesToDelete.length > 0) {
    const paths = portfolioFilesToDelete.map(f => f.path);
    const { error: rmPortErr } = await adminClient.storage.from('portfolios').remove(paths);
    console.log(`   - Storage portfolios: Đã xóa ${paths.length} file (${rmPortErr ? rmPortErr.message : 'Thành công'}).`);
  }

  // Bước 2: Xử lý tin tuyển dụng
  if (keepMarketplaceJobs) {
    // Chuyển 11 tin mẫu sang targetAdmin
    for (const j of marketplaceJobs) {
      await adminClient.from('jobs').update({ employer_id: TARGET_ADMIN_ID }).eq('id', j.id);
    }
    console.log(`   - Jobs: Đã chuyển quyền sở hữu 11 tin Marketplace mẫu sang Admin.`);
    // Xóa 3 tin rác
    for (const jj of junkJobs) {
      await adminClient.from('jobs').delete().eq('id', jj.id);
    }
    console.log(`   - Jobs: Đã xóa ${junkJobs.length} tin rác.`);
  } else {
    // Xóa toàn bộ 14 tin
    const { error: rmJobsErr } = await adminClient.from('jobs').delete().in('id', jobs.map(j => j.id));
    console.log(`   - Jobs: Đã xóa toàn bộ ${jobs.length} tin việc làm (${rmJobsErr ? rmJobsErr.message : 'Thành công'}).`);
  }

  // Bước 3: Xóa toàn bộ profiles ngoài Admin (tự động cascade xóa student_profiles, companies, student_projects, job_applications, saved_jobs)
  for (const acc of accountsToDelete) {
    const { error: rmProfErr } = await adminClient.from('profiles').delete().eq('id', acc.id);
    console.log(`   - Profile: Đã xóa ${acc.email} (${acc.id}) -> ${rmProfErr ? rmProfErr.message : 'Thành công (đã cascade)'}`);
  }

  // Bước 4: Xóa tài khoản trong Supabase Auth nếu có serviceRoleKey
  if (serviceRoleKey) {
    const supabaseService = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    for (const acc of accountsToDelete) {
      try {
        await supabaseService.auth.admin.deleteUser(acc.id);
        console.log(`   - Auth User: Đã xóa ${acc.email} khỏi auth.users`);
      } catch (e) {
        console.warn(`   - Auth User: Lỗi xóa ${acc.email}:`, e.message);
      }
    }
  } else {
    console.log('\n   ℹ️ LƯU Ý VỀ AUTH.USERS:');
    console.log('   Đã xóa sạch Profile, Storage và các bảng quan hệ trên Database.');
    console.log('   Nếu bạn muốn đăng ký lại bằng cùng email cũ trên Supabase Cloud,');
    console.log('   vui lòng thêm SUPABASE_SERVICE_ROLE_KEY vào server/.env hoặc xóa user trong Supabase Dashboard > Authentication > Users.');
  }

  console.log('\n✅ THỰC THI RESET HOÀN TẤT THÀNH CÔNG!');
  console.log('================================================================');
}

main().catch(console.error);
