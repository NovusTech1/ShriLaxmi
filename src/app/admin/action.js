'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';

// --- AUTHENTICATION ACTIONS ---

export async function login(formData) {
    const password = formData.get('password');
    
    if (password === process.env.ADMIN_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set('admin_session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      redirect('/admin/dashboard');
    } else {
      throw new Error('Invalid password');
    }
  }

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  redirect('/admin/login');
}

// --- PRODUCT CREATION ACTIONS ---

const uploadImage = async (file) => {
  if (!file || file.size === 0) return null;

  // Guard: Vercel serverless limit is 4.5MB. Warn clearly.
  if (file.size > 4 * 1024 * 1024) {
    throw new Error(`Image "${file.name}" is too large (max 4MB). Please compress it before uploading.`);
  }

  const fileExt = file.name.split('.').pop().toLowerCase();
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  if (!allowedExts.includes(fileExt)) {
    throw new Error(`File type ".${fileExt}" is not supported. Use JPG, PNG, or WEBP.`);
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
    console.error("Storage upload error:", uploadError);
    throw new Error(`Image upload failed: ${uploadError.message}`);
  }

  const { data } = supabaseAdmin.storage
    .from('products')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

// Helper: extract just the storage filename from a full Supabase public URL
function extractStorageFileName(publicUrl) {
  if (!publicUrl) return null;
  try {
    const url = new URL(publicUrl);
    // Supabase public URL path: /storage/v1/object/public/<bucket>/<filename>
    const parts = url.pathname.split('/');
    // filename is the last segment
    return parts[parts.length - 1];
  } catch {
    // Fallback to simple split
    return publicUrl.split('/').pop().split('?')[0];
  }
}

export async function addProduct(formData) {
  // NOTE: redirect() must be OUTSIDE try/catch — it throws internally and must not be caught
  let redirectPath = null;

  try {
    const category = formData.get('category');
    
    // Parse tags
    const tagsString = formData.get('tags');
    const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];
    
    // Robust parsing for sizes
    const sizesData = formData.get('sizes');
    let sizes = { "S": false, "M": false, "L": false, "XL": false, "XXL": false, "3XL": false };
    
    if (sizesData && sizesData !== 'undefined') {
      try {
        sizes = JSON.parse(sizesData);
      } catch (e) {
        console.error("Failed to parse sizes:", e);
      }
    }

    const image1File = formData.get('image1');
    const image2File = formData.get('image2');

    const image_1 = await uploadImage(image1File);
    const image_2 = await uploadImage(image2File);

    // Save to Database
    const { error } = await supabaseAdmin
      .from('products')
      .insert([
        {
          category,
          tags,
          sizes,
          image_1,
          image_2,
          is_active: true
        }
      ]);

    if (error) {
      console.error("Database insert error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    redirectPath = '/admin/dashboard';
  } catch (error) {
    console.error("Failed to add product:", error);
    throw new Error(error.message || 'Failed to save product to database');
  }

  // redirect() is called OUTSIDE the try/catch so Next.js can handle it correctly
  if (redirectPath) {
    redirect(redirectPath);
  }
}

// --- MANAGE PRODUCT ACTIONS ---

export async function getAdminProducts() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Fetch error:", error);
    throw new Error('Failed to fetch products');
  }
  
  return data;
}

export async function updateProductSizes(productId, newSizes) {
  const { error } = await supabaseAdmin
    .from('products')
    .update({ sizes: newSizes })
    .eq('id', productId);

  if (error) {
    console.error("Update error:", error);
    throw new Error('Failed to update sizes');
  }
}

export async function deleteProduct(productId) {
  // Step 1: fetch the product's image URLs
  const { data: product, error: fetchError } = await supabaseAdmin
    .from('products')
    .select('image_1, image_2')
    .eq('id', productId)
    .single();

  if (fetchError) {
    console.error("Fetch error during delete:", fetchError);
    throw new Error('Failed to fetch product details for deletion');
  }

  // Step 2: delete images from Supabase Storage using extracted filenames
  const filesToDelete = [];
  
  const file1 = extractStorageFileName(product.image_1);
  const file2 = extractStorageFileName(product.image_2);

  if (file1) filesToDelete.push(file1);
  if (file2) filesToDelete.push(file2);

  if (filesToDelete.length > 0) {
    const { error: storageError } = await supabaseAdmin.storage
      .from('products')
      .remove(filesToDelete);
      
    if (storageError) {
      // Log but don't throw — still delete the DB record
      console.error("Failed to delete images from storage:", storageError);
    }
  }

  // Step 3: delete the database record
  const { error: dbError } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', productId);

  if (dbError) {
    console.error("Database delete error:", dbError);
    throw new Error('Failed to permanently delete product');
  }
}