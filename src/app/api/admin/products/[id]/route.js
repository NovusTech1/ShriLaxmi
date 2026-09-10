import { NextResponse } from 'next/server';
import { deleteProduct } from '@/app/admin/action';
import { supabaseAdmin } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { verifySessionCookie } from '@/lib/session';

async function isAuthorized() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session')?.value;
  return await verifySessionCookie(sessionCookie);
}

// PATCH /api/admin/products/[id] — update sizes for a product
export async function PATCH(request, { params }) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const { sizes, is_trending } = await request.json();
    const updates = {};
    if (sizes) updates.sizes = sizes;
    if (typeof is_trending !== 'undefined') updates.is_trending = is_trending;
    await supabaseAdmin.from('products').update(updates).eq('id', id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/admin/products/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id] — delete a product and its images
export async function DELETE(request, { params }) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await params;
    await deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/products/[id] error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
