import { getCurrentProfile } from '../src/lib/romarg-auth.ts';
import { getMyShifts } from '../src/lib/romarg-data.ts';

async function testShifts() {
  console.log('Testing getCurrentProfile()...');
  const profile = await getCurrentProfile();
  console.log('Profile:', profile);

  console.log('\nTesting getMyShifts()...');
  const shifts = await getMyShifts();
  console.log('Shifts count:', shifts.length);
  console.log('Sample shift:', shifts[0] || 'None');
}

testShifts();
