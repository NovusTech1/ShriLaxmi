import { NextResponse } from 'next/server';
import { createSessionCookieValue } from '@/lib/session';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function normalize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[\r\n\t]/g, '').trim().replace(/^["']|["']$/g, '').trim();
}

export async function POST(request) {
  try {
    const { password } = await request.json();

    const rawEnvPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    const cleanEnv = normalize(rawEnvPassword);
    const cleanInput = normalize(password);

    console.log('[Auth Check] ADMIN_PASSWORD configured in env:', Boolean(process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD));

    const isMatch = Boolean(
      (password && password === rawEnvPassword) ||
      (cleanInput && cleanInput === cleanEnv) ||
      (cleanInput && cleanInput === rawEnvPassword) ||
      (password && password === cleanEnv)
    );

    if (isMatch) {
      const cookieValue = await createSessionCookieValue();

      // We must 'await' cookies() in the latest version of Next.js
      const cookieStore = await cookies();
      cookieStore.set('admin_session', cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}