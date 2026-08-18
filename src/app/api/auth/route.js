import { NextResponse } from 'next/server';
import { createSessionCookieValue } from '@/lib/session';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (password === process.env.ADMIN_PASSWORD) {
      const cookieValue = await createSessionCookieValue();
      
      // We must 'await' cookies() in the latest version of Next.js
      const cookieStore = await cookies();
      cookieStore.set('admin_session', cookieValue, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}