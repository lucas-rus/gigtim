const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const AUTH_ACTIONS_PATH = path.join(__dirname, 'web', 'src', 'lib', 'supabase', 'auth-actions.ts');
const PROJECT_ID = '11024261575852370002';
const GCLOUD_PATH = '/Users/a/.stitch-mcp/google-cloud-sdk/bin/gcloud';
const CLOUDSDK_CONFIG = '/Users/a/.stitch-mcp/config';
const GOOGLE_CLOUD_PROJECT = 'beaming-benefit-435011-r0';

const WORKER_PAGES = [
  { url: 'http://localhost:3000/', filename: 'landing.html', title: 'Landing Page' },
  { url: 'http://localhost:3000/login', filename: 'login.html', title: 'Login Screen' },
  { url: 'http://localhost:3000/register', filename: 'register.html', title: 'Register Screen' },
  { url: 'http://localhost:3000/forgot-password', filename: 'forgot-password.html', title: 'Forgot Password Screen' },
  { url: 'http://localhost:3000/update-password', filename: 'update-password.html', title: 'Update Password Screen' },
  { url: 'http://localhost:3000/jobs', filename: 'jobs.html', title: 'Jobs Marketplace' },
  { url: 'http://localhost:3000/shifts', filename: 'shifts.html', title: 'Shifts Management' },
  { url: 'http://localhost:3000/applications', filename: 'applications.html', title: 'Applications Board' },
  { url: 'http://localhost:3000/chat', filename: 'chat.html', title: 'Chat Inbox' },
  { url: 'http://localhost:3000/forum', filename: 'forum.html', title: 'Community Forum' },
  { url: 'http://localhost:3000/profile', filename: 'profile.html', title: 'User Profile' }
];

const ADMIN_PAGES = [
  { url: 'http://localhost:3000/admin/users', filename: 'admin-users.html', title: 'Admin: Users Directory' },
  { url: 'http://localhost:3000/admin/verifications', filename: 'admin-verifications.html', title: 'Admin: ID Verifications' },
  { url: 'http://localhost:3000/admin/audit-log', filename: 'admin-audit-log.html', title: 'Admin: Audit Log' }
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const originalFunc = `export async function getCurrentProfile() {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data: dbUser } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authUser.id)
    .single()

  if (!dbUser) return null

  const email = authUser.email || null

  if (dbUser.role === 'WORKER') {
    const { data: profile } = await supabase
      .from('worker_profiles')
      .select('*')
      .eq('user_id', dbUser.id)
      .single()
    return { user: dbUser, profile, profileType: 'worker' as const, email }
  }

  if (dbUser.role === 'EMPLOYER') {
    const { data: profile } = await supabase
      .from('employer_profiles')
      .select('*')
      .eq('user_id', dbUser.id)
      .single()
    return { user: dbUser, profile, profileType: 'employer' as const, email }
  }

  return { user: dbUser, profile: null, profileType: 'admin' as const, email }
}`;

const mockWorkerFunc = `export async function getCurrentProfile() {
  return {
    user: { id: 'mock-worker-id', role: 'WORKER', auth_id: 'mock-worker-auth-id' },
    profile: {
      id: 'mock-worker-profile-id',
      full_name: 'Alex Zilieru',
      phone_number: '0712 345 678',
      city: 'Timișoara',
      county: 'Timiș',
      bio: 'Lucrător zilier cu experiență în servire și ajutor în bucătărie.',
      skills: ['WAITER', 'KITCHEN_HELP'],
      reliability_score: 4.8
    },
    profileType: 'worker' as const,
    email: 'alex.worker@example.com'
  };
}`;

const mockAdminFunc = `export async function getCurrentProfile() {
  return {
    user: { id: 'mock-admin-id', role: 'ADMIN', auth_id: 'mock-admin-auth-id' },
    profile: null,
    profileType: 'admin' as const,
    email: 'admin.gigtim@example.com'
  };
}`;

async function fetchPage(url, filepath) {
  console.log(`[Fetch] Fetching ${url} ...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const html = await res.text();
  fs.writeFileSync(filepath, html);
  console.log(`[Fetch] Saved ${filepath} (${Math.round(html.length / 102.4) / 10} KB)`);
}

async function uploadToStitch(filename, title, token) {
  const filePath = path.join(__dirname, filename);
  console.log(`[Upload] Uploading ${filename} ("${title}")...`);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`[Upload] Attempt ${attempt} / 3...`);
      const cmd = `GOOGLE_CLOUD_PROJECT=${GOOGLE_CLOUD_PROJECT} STITCH_ACCESS_TOKEN=${token} npx @_davideast/stitch-mcp upload -p ${PROJECT_ID} -f "${filePath}" --title "${title}"`;
      const output = execSync(cmd, { timeout: 35000 }).toString();
      console.log(`[Upload] Success! Output:\n\n${output}`);
      return;
    } catch (err) {
      console.error(`[Upload] Attempt ${attempt} failed: ${err.message}`);
      if (attempt < 3) {
        console.log('[Upload] Retrying in 3 seconds...');
        await sleep(3000);
      } else {
        throw new Error(`Failed to upload ${filename} after 3 attempts`);
      }
    }
  }
}

async function main() {
  const originalFileContent = fs.readFileSync(AUTH_ACTIONS_PATH, 'utf-8');
  const allFiles = [];

  try {
    // 1. Get access token
    console.log('[Auth] Retrieving Stitch Access Token...');
    const token = execSync(`CLOUDSDK_CONFIG=${CLOUDSDK_CONFIG} ${GCLOUD_PATH} auth application-default print-access-token`).toString().trim();
    console.log('[Auth] Retrieved Stitch Access Token successfully.');

    // 2. Fetch worker pages
    console.log('[Auth Actions] Injected mock profile: worker');
    fs.writeFileSync(AUTH_ACTIONS_PATH, originalFileContent.replace(originalFunc, mockWorkerFunc));
    // Wait for Next.js to compile/refresh
    await sleep(4000);
    for (const page of WORKER_PAGES) {
      const dest = path.join(__dirname, page.filename);
      await fetchPage(page.url, dest);
      allFiles.push({ filename: page.filename, title: page.title });
    }

    // 3. Fetch admin pages
    console.log('[Auth Actions] Injected mock profile: admin');
    fs.writeFileSync(AUTH_ACTIONS_PATH, originalFileContent.replace(originalFunc, mockAdminFunc));
    // Wait for Next.js to compile/refresh
    await sleep(4000);
    for (const page of ADMIN_PAGES) {
      const dest = path.join(__dirname, page.filename);
      await fetchPage(page.url, dest);
      allFiles.push({ filename: page.filename, title: page.title });
    }

    // 4. Restore file
    console.log('[Auth Actions] Restoring original file...');
    fs.writeFileSync(AUTH_ACTIONS_PATH, originalFileContent);
    await sleep(2000);

    // 5. Upload everything to Stitch
    for (const file of allFiles) {
      await uploadToStitch(file.filename, file.title, token);
      await sleep(2000); // Cool down between uploads
    }

    // 6. Cleanup HTML files
    console.log('[Cleanup] Deleting temporary HTML files...');
    for (const file of allFiles) {
      const dest = path.join(__dirname, file.filename);
      if (fs.existsSync(dest)) {
        fs.unlinkSync(dest);
        console.log(`[Cleanup] Deleted ${file.filename}`);
      }
    }

    console.log('[Done] Screen capture and upload process completed!');

  } catch (err) {
    console.error('Fatal Error:', err);
    // Ensure restoration of auth-actions.ts
    fs.writeFileSync(AUTH_ACTIONS_PATH, originalFileContent);
    process.exit(1);
  }
}

main();