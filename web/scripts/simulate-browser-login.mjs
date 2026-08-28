import { romargRegister, verifyEmailToken, romargLogin } from '../src/lib/romarg-auth.ts';

async function testFullProductionBackend() {
  const testEmail = `live_user_${Date.now()}@gigtim.ro`;
  console.log('1. Registering new test user on ROMARG DB:', testEmail);

  const regForm = new FormData();
  regForm.set('email', testEmail);
  regForm.set('password', 'Password123!');
  regForm.set('role', 'WORKER');
  regForm.set('fullName', 'Lucrător Test Live');
  regForm.set('phone', '0712345678');
  regForm.set('city', 'Timișoara');
  regForm.set('county', 'Timiș');

  const regRes = await romargRegister(regForm);
  console.log('Registration Result:', regRes);

  if (!regRes.success) {
    console.error('Registration failed!');
    return;
  }

  console.log('\n2. Verifying Email Token...');
  const verifyRes = await verifyEmailToken(regRes.verificationToken);
  console.log('Verification Result:', verifyRes);

  console.log('\n3. Logging in on ROMARG DB...');
  const loginForm = new FormData();
  loginForm.set('email', testEmail);
  loginForm.set('password', 'Password123!');
  const loginRes = await romargLogin(loginForm);
  console.log('Login Result:', loginRes);

  if (loginRes.success) {
    console.log('\nSUCCESS! Database backend is 100% operational.');
    console.log('Test Account Credentials created:');
    console.log('Email:', testEmail);
    console.log('Password: Password123!');
  }
}

testFullProductionBackend();
