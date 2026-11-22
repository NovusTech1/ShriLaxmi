import { NextResponse } from 'next/server';
import { supabase, hasSupabaseConfig } from '@/lib/supabase/client';
import { fetchCategories, DEFAULT_CATEGORIES } from '@/lib/categories';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!hasSupabaseConfig) {
    return NextResponse.json(
      DEFAULT_CATEGORIES.map((name, idx) => ({ id: `default-${idx}`, name, is_default: true }))
    );
  }

  try {
    const categories = await fetchCategories(supabase);
    return NextResponse.json(categories);
  } catch (err) {
    console.error('GET /api/categories error:', err);
    return NextResponse.json(
      DEFAULT_CATEGORIES.map((name, idx) => ({ id: `default-${idx}`, name, is_default: true }))
    );
  }
}
