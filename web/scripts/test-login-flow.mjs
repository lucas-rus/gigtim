import { romargRegister, verifyEmailToken, romargLogin } from '../src/lib/romarg-auth.ts';

async function testFullAuthFlow() {
  const email = `testuser_${Date.now()}@gigtim.ro`;
  console.log('--- 1. Testing Registration for', email, '---');
  const regForm = new FormData();
  regForm.set('email', email);
  regForm.set('password', 'Password123!');
  regForm.set('role', 'WORKER');
  regForm.set('fullName', 'Lucrător Test');
  regForm.set('phone', '0712345678');
  regForm.set('city', 'Timișoara');
  regForm.set('county', 'Timiș');

  const regResult = await romargRegister(regForm);
  console.log('Registration Result:', regResult);

  if (regResult.error) return;

  console.log('\n--- 2. Testing Login BEFORE Email Verification ---');
  const loginForm1 = new FormData();
  loginForm1.set('email', email);
  loginForm1.set('password', 'Password123!');
  const unverifiedLogin = await romargLogin(loginForm1);
  console.log('Unverified Login Result:', unverifiedLogin);

  console.log('\n--- 3. Testing Email Token Verification ---');
  const verifyResult = await verifyEmailToken(regResult.verificationToken);
  console.log('Email Verification Result:', verifyResult);

  console.log('\n--- 4. Testing Login AFTER Email Verification ---');
  const loginForm2 = new FormData();
  loginForm2.set('email', email);
  loginForm2.set('password', 'Password123!');
  const verifiedLogin = await romargLogin(loginForm2);
  console.log('Verified Login Result:', verifiedLogin);
}

testFullAuthFlow();
