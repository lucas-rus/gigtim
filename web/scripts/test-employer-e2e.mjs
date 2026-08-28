async function runEmployerE2ETest() {
  console.log('=== GIGTIM EMPLOYER E2E HTTP CLIENT TEST ===\n');

  const email = 'lucas.rus05@e-uvt.ro';
  const password = 'Password123!';

  // 1. Submit Login via /api/auth/login
  console.log(`1. Authenticating via POST http://localhost:3000/api/auth/login (${email})...`);
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const loginData = await loginRes.json();
  console.log('   Response Status:', loginRes.status);
  console.log('   Response Data:', loginData);

  const rawSetCookie = loginRes.headers.get('set-cookie');
  const cookieMatch = rawSetCookie?.match(/gigtim_session=([^;]+)/);
  if (!cookieMatch) throw new Error('Cookie not found!');
  const sessionCookie = `gigtim_session=${cookieMatch[1]}`;

  // 2. Fetch /shifts as employer
  const shiftsRes = await fetch('http://localhost:3000/shifts', {
    headers: { Cookie: sessionCookie },
    redirect: 'manual',
  });
  console.log('   /shifts Status:', shiftsRes.status);
  if (shiftsRes.status !== 200) throw new Error('Failed to load /shifts as employer');
  console.log('   ✓ /shifts rendered for employer with HTTP 200 OK.');

  // 3. Fetch /applications as employer
  const appsRes = await fetch('http://localhost:3000/applications', {
    headers: { Cookie: sessionCookie },
    redirect: 'manual',
  });
  console.log('   /applications Status:', appsRes.status);
  if (appsRes.status !== 200) throw new Error('Failed to load /applications as employer');
  console.log('   ✓ /applications rendered for employer with HTTP 200 OK.');

  console.log('\n🎉 EMPLOYER E2E TEST PASSED 100%!');
}

runEmployerE2ETest().catch(err => {
  console.error('Employer E2E Test Failed:', err);
  process.exit(1);
});
