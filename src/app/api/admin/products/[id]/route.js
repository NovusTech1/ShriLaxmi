import { NextResponse } from 'next/server';
import { updateProductSizes, deleteProduct } from '@/app/admin/action';
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
    const { sizes } = await request.json();
    await updateProductSizes(id, sizes);
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
