import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionCookie } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase/server';

async function isAuthorized() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session')?.value;
  return await verifySessionCookie(sessionCookie);
}

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB

async function uploadImage(file) {
  if (!file || file.size === 0) return null;

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`Image "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max is 4MB.`);
  }

  const fileExt = file.name.split('.').pop().toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'webp'];
  if (!allowed.includes(fileExt)) {
    throw new Error(`Unsupported file type ".${fileExt}". Use JPG, PNG, or WEBP.`);
  }

  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabaseAdmin.storage
    .from('products')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    throw new Error(`Image upload failed: ${uploadError.message}`);
  }

  const { data } = supabaseAdmin.storage.from('products').getPublicUrl(fileName);
  return data.publicUrl;
}

export async function POST(request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    const category = formData.get('category');
    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const tagsString = formData.get('tags');
    const tags = tagsString
      ? tagsString.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const sizesData = formData.get('sizes');
    let sizes = { S: false, M: false, L: false, XL: false, XXL: false, '3XL': false };
    if (sizesData && sizesData !== 'undefined') {
      try {
        sizes = JSON.parse(sizesData);
      } catch {
        console.error('Failed to parse sizes');
      }
    }

    // Process Color Variants
    const variantsMetaStr = formData.get('variants_meta');
    if (!variantsMetaStr) {
      return NextResponse.json({ error: 'Color variants are required' }, { status: 400 });
    }

    const variantsMeta = JSON.parse(variantsMetaStr);
    const colorVariants = [];

    for (let i = 0; i < variantsMeta.length; i++) {
      const file = formData.get(`variant_image_${i}`);
      const imageUrl = await uploadImage(file);
      
      colorVariants.push({
        color: variantsMeta[i].color,
        image_url: imageUrl
      });
    }

    // For backward compatibility and storefront ease, use the first variant's image as image_1
    const image_1 = colorVariants.length > 0 ? colorVariants[0].image_url : null;

    const isTrendingStr = formData.get('is_trending');
    const is_trending = isTrendingStr === 'true' || isTrendingStr === true;

    const { error } = await supabaseAdmin.from('products').insert([
      { category, tags, sizes, image_1, color_variants: colorVariants, is_trending, is_active: true },
    ]);

    if (error) {
      console.error('DB insert error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/admin/add-product error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
