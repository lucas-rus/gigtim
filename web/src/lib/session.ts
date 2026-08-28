export function createSessionToken(user: { id: string; email: string; role: string }): string {
  const payload = JSON.stringify({ userId: user.id, email: user.email, role: user.role });
  return Buffer.from(payload, 'utf8').toString('base64url');
}

export function parseSessionToken(token: string | undefined): { userId: string; email: string; role: string } | null {
  if (!token) return null;

  // 1. Try base64url decode
  try {
    if (!token.startsWith('{') && !token.startsWith('%7B')) {
      const decoded = Buffer.from(token, 'base64url').toString('utf8');
      const parsed = JSON.parse(decoded);
      if (parsed?.userId) return parsed;
    }
  } catch {}

  // 2. Try URL-encoded JSON
  try {
    let val = token;
    if (val.includes('%')) val = decodeURIComponent(val);
    const parsed = JSON.parse(val);
    if (parsed?.userId) return parsed;
  } catch {}

  // 3. Try plain JSON
  try {
    const parsed = JSON.parse(token);
    if (parsed?.userId) return parsed;
  } catch {}

  return null;
}
