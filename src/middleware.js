import { NextResponse } from 'next/server';
import { verifySessionCookie } from './lib/session';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // We only care about protecting /admin routes
  if (pathname.startsWith('/admin')) {
    // Let them access the login page itself
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check for the secure session cookie
    const sessionCookie = request.cookies.get('admin_session')?.value;
    const isValid = await verifySessionCookie(sessionCookie);

    // If no cookie or invalid signature, redirect to login
    if (!isValid) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware strictly to admin routes
  matcher: ['/admin/:path*'],
};