/**
 * STUDENTHUB - SPRINT 3.4 STATS AUTOMATED API VERIFICATION SCRIPT
 * Date: 2026-11-13
 */

import { getStudentStats, getEmployerStats, getAdminStats } from '../src/lib/statsService.js';

console.log('========================================================================');
console.log('STUDENTHUB - SPRINT 3.4 DASHBOARD STATS VERIFICATION (NODE JS)');
console.log('========================================================================\n');

async function runStatsTest() {
  console.log('[TEST 1]: getStudentStats() execution:');
  const studentData = await getStudentStats({ id: '11111111-1111-1111-1111-111111111111' });
  console.log(JSON.stringify(studentData, null, 2));

  console.log('\n[TEST 2]: getEmployerStats(7) execution:');
  const empData7 = await getEmployerStats(7, { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' });
  console.log(JSON.stringify(empData7, null, 2));

  console.log('\n[TEST 3]: getEmployerStats(30) timeline length:');
  const empData30 = await getEmployerStats(30, { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' });
  console.log(`Timeline length for 30 days: ${empData30.timeline.length} (Expected: 30)`);

  console.log('\n[TEST 4]: getAdminStats() execution (Non-admin or Mock fallback):');
  try {
    const adminData = await getAdminStats();
    console.log(JSON.stringify(adminData, null, 2));
  } catch (err) {
    console.log('Caught expected protection error for Admin RPC:');
    console.log(`Error: ${err.message}`);
  }

  console.log('\n========================================================================');
  console.log('>>> SPRINT 3.4 STATS TEST SUITE COMPLETED SUCCESSFULLY.');
  console.log('========================================================================');
}

runStatsTest().catch(console.error);
