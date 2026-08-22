import { NextResponse } from 'next/server';
import { verifySessionCookie } from '@/lib/session';

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // We only care about protecting /admin routes
  if (pathname.startsWith('/admin')) {
    
    const sessionCookie = request.cookies.get('admin_session')?.value;
    const isValid = await verifySessionCookie(sessionCookie);

    // If they are already logged in and try to go to the login page, send them to dashboard
    if (pathname === '/admin/login' && isValid) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Let them access the login page if they are NOT logged in
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // If they have no valid cookie and try to access the dashboard/add page, kick them to login
    if (!isValid) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply proxy strictly to admin routes
  matcher: ['/admin/:path*'],
};
