async function runE2ETests() {
  console.log('=== GIGTIM E2E HTTP CLIENT & AUTH SESSION VERIFICATION ===\n');

  const email = 'testuser@gigtim.ro';
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
  if (!rawSetCookie) {
    throw new Error('No Set-Cookie header returned from login route!');
  }
  console.log('   ✓ Set-Cookie header received:', rawSetCookie.substring(0, 70) + '...');

  // Extract gigtim_session cookie value
  const cookieMatch = rawSetCookie.match(/gigtim_session=([^;]+)/);
  if (!cookieMatch) {
    throw new Error('gigtim_session cookie not found in Set-Cookie header!');
  }
  const sessionCookie = `gigtim_session=${cookieMatch[1]}`;
  console.log('   ✓ Extracted session cookie string.');

  // 2. Fetch /shifts with session cookie
  console.log('\n2. Requesting GET http://localhost:3000/shifts with session cookie...');
  const shiftsRes = await fetch('http://localhost:3000/shifts', {
    headers: { Cookie: sessionCookie },
    redirect: 'manual', // do not auto follow redirects so we can inspect status
  });

  console.log('   Response Status:', shiftsRes.status);
  if (shiftsRes.status === 200) {
    const html = await shiftsRes.text();
    const hasDashboardContent = html.includes('GigTim') || html.includes('Ture');
    console.log('   ✓ HTTP 200 OK! Content received (has dashboard elements:', hasDashboardContent, ')');
  } else if (shiftsRes.status === 307 || shiftsRes.status === 303 || shiftsRes.status === 302) {
    const location = shiftsRes.headers.get('location');
    throw new Error(`Unexpected redirect to: ${location} (status ${shiftsRes.status})`);
  } else {
    throw new Error(`Unexpected status code: ${shiftsRes.status}`);
  }

  // 3. Fetch all other dashboard pages
  const pages = ['/jobs', '/applications', '/profile', '/forum', '/chat'];
  for (const page of pages) {
    console.log(`\n3. Requesting GET http://localhost:3000${page}...`);
    const res = await fetch(`http://localhost:3000${page}`, {
      headers: { Cookie: sessionCookie },
      redirect: 'manual',
    });
    console.log(`   Response Status: ${res.status}`);
    if (res.status !== 200) {
      throw new Error(`Page ${page} failed with status ${res.status}`);
    }
    console.log(`   ✓ ${page} rendered with HTTP 200 OK.`);
  }

  // 4. Test Unauthenticated Protected Route Access (Must redirect to /login)
  console.log('\n4. Testing protected route without cookie (GET http://localhost:3000/shifts)...');
  const unauthRes = await fetch('http://localhost:3000/shifts', {
    redirect: 'manual',
  });
  console.log('   Response Status:', unauthRes.status);
  const redirectTarget = unauthRes.headers.get('location');
  console.log('   Redirect Location:', redirectTarget);
  if ((unauthRes.status === 307 || unauthRes.status === 303 || unauthRes.status === 302) && redirectTarget?.includes('/login')) {
    console.log('   ✓ Correctly redirected unauthenticated user to /login.');
  } else {
    throw new Error(`Expected redirect to /login, got ${unauthRes.status} -> ${redirectTarget}`);
  }

  console.log('\n======================================================');
  console.log('🎉 ALL END-TO-END HTTP AUTH & PAGE TESTS PASSED 100%!');
  console.log('======================================================\n');
}

runE2ETests().catch(err => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
