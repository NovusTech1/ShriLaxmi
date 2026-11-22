import { NextResponse } from 'next/server';
import { getAdminProducts } from '@/app/admin/action';
import { cookies } from 'next/headers';
import { verifySessionCookie } from '@/lib/session';
import { hasSupabaseConfig } from '@/lib/supabase/server';

async function isAuthorized() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session')?.value;
  return await verifySessionCookie(sessionCookie);
}

// GET /api/admin/products — fetch all active products
export async function GET() {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasSupabaseConfig) {
    return NextResponse.json([], { status: 200 });
  }
  try {
    const products = await getAdminProducts();
    return NextResponse.json(products);
  } catch (err) {
    console.error('GET /api/admin/products error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
