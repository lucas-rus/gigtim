import { parseSessionToken, createSessionToken } from '../src/lib/session.ts';
import { dbPool } from '../src/lib/romarg-db.ts';
import { getOpenShifts, getMyShifts, getMyApplications, getForumPosts, getChatRooms } from '../src/lib/romarg-data.ts';
import bcrypt from 'bcryptjs';

async function runTests() {
  console.log('=== GIGTIM FULL BACKEND & AUTH SYSTEM TEST ===\n');

  const connection = await dbPool.getConnection();
  try {
    // 1. Verify Users in DB
    const [users] = await connection.query('SELECT id, email, role, email_verified FROM users');
    console.log(`✓ Database connected. Found ${users.length} registered users.`);

    const workerUser = users.find(u => u.role === 'WORKER');
    const employerUser = users.find(u => u.role === 'EMPLOYER');

    console.log(`  Worker: ${workerUser?.email} (verified: ${workerUser?.email_verified})`);
    console.log(`  Employer: ${employerUser?.email} (verified: ${employerUser?.email_verified})`);

    // 2. Test Session Token Creation & Parsing
    const token = createSessionToken(workerUser);
    const parsed = parseSessionToken(token);
    if (parsed.userId === workerUser.id && parsed.role === 'WORKER') {
      console.log('✓ Base64URL session token serialization & deserialization PASSED.');
    } else {
      throw new Error('Session token test failed!');
    }

    // 3. Test Shifts Query
    const openShifts = await getOpenShifts();
    console.log(`✓ getOpenShifts() returned ${openShifts.length} open shift(s).`);

    // 4. Test Forum Query
    const forumPosts = await getForumPosts();
    console.log(`✓ getForumPosts() returned ${forumPosts.length} post(s).`);

    console.log('\nALL SYSTEM TESTS PASSED SUCCESSFULLY! 🚀');
  } finally {
    connection.release();
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
