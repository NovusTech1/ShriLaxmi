import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionCookie } from '@/lib/session';
import { hasSupabaseConfig, supabaseAdmin } from '@/lib/supabase/server';
import { DEFAULT_CATEGORIES } from '@/lib/categories';

async function isAuthorized() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session')?.value;
  return await verifySessionCookie(sessionCookie);
}

// GET /api/admin/categories — fetch categories along with product counts
export async function GET() {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasSupabaseConfig) {
    const list = DEFAULT_CATEGORIES.map((name, idx) => ({
      id: `default-${idx}`,
      name,
      productCount: 0,
      is_default: true,
    }));
    return NextResponse.json(list);
  }

  try {
    // 1. Fetch categories from database
    const { data: dbCategories, error: catError } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    // 2. Fetch product category counts
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('category')
      .eq('is_active', true);

    const counts = {};
    if (Array.isArray(products)) {
      for (const p of products) {
        if (p.category) {
          counts[p.category] = (counts[p.category] || 0) + 1;
        }
      }
    }

    let categories = dbCategories;

    // If table doesn't exist yet or is empty, seed/fallback to defaults
    if (catError || !categories || categories.length === 0) {
      // Try to seed default categories into the table if table exists
      try {
        const seedPayload = DEFAULT_CATEGORIES.map(name => ({ name }));
        const { data: seeded } = await supabaseAdmin
          .from('categories')
          .insert(seedPayload)
          .select('*');

        if (seeded && seeded.length > 0) {
          categories = seeded;
        }
      } catch {
        // Table may not exist yet, fallback to in-memory defaults
      }

      if (!categories || categories.length === 0) {
        categories = DEFAULT_CATEGORIES.map((name, idx) => ({
          id: `default-${idx}`,
          name,
          is_default: true,
        }));
      }
    }

    const categoriesWithCount = categories.map(cat => ({
      ...cat,
      productCount: counts[cat.name] || 0,
    }));

    return NextResponse.json(categoriesWithCount);
  } catch (err) {
    console.error('GET /api/admin/categories error:', err);
    return NextResponse.json(
      DEFAULT_CATEGORIES.map((name, idx) => ({
        id: `default-${idx}`,
        name,
        productCount: 0,
        is_default: true,
      }))
    );
  }
}

// POST /api/admin/categories — add a new category
export async function POST(request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasSupabaseConfig) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  }

  try {
    const { name } = await request.json();
    const trimmed = typeof name === 'string' ? name.trim() : '';

    if (!trimmed) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert([{ name: trimmed }])
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation in Postgres
        return NextResponse.json({ error: `Category "${trimmed}" already exists` }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, category: data });
  } catch (err) {
    console.error('POST /api/admin/categories error:', err);
    return NextResponse.json({ error: err.message || 'Failed to add category' }, { status: 500 });
  }
}

// PATCH /api/admin/categories — edit/rename a category
export async function PATCH(request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasSupabaseConfig) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  }

  try {
    const { id, oldName, newName } = await request.json();
    const trimmedNew = typeof newName === 'string' ? newName.trim() : '';

    if (!trimmedNew) {
      return NextResponse.json({ error: 'New category name is required' }, { status: 400 });
    }

    // 1. Update category name in categories table
    let catUpdateQuery = supabaseAdmin.from('categories').update({ name: trimmedNew });
    if (id && !String(id).startsWith('default-')) {
      catUpdateQuery = catUpdateQuery.eq('id', id);
    } else if (oldName) {
      catUpdateQuery = catUpdateQuery.eq('name', oldName);
    }

    const { error: catError } = await catUpdateQuery;
    if (catError) {
      throw catError;
    }

    // 2. Cascade rename to existing products if oldName provided
    if (oldName && oldName !== trimmedNew) {
      const { error: prodError } = await supabaseAdmin
        .from('products')
        .update({ category: trimmedNew })
        .eq('category', oldName);

      if (prodError) {
        console.error('Product category cascade rename error:', prodError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/admin/categories error:', err);
    return NextResponse.json({ error: err.message || 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/admin/categories — delete a category
export async function DELETE(request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasSupabaseConfig) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  }

  try {
    const { id, name } = await request.json();

    let query = supabaseAdmin.from('categories').delete();
    if (id && !String(id).startsWith('default-')) {
      query = query.eq('id', id);
    } else if (name) {
      query = query.eq('name', name);
    } else {
      return NextResponse.json({ error: 'Category identifier is required' }, { status: 400 });
    }

    const { error } = await query;
    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/categories error:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete category' }, { status: 500 });
  }
}
