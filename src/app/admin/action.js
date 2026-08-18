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
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/', 
      });
      redirect('/admin/dashboard');
    } else {
      throw new Error('Invalid password');
    }
  }

export async function logout() {
  // Correctly awaiting cookies for Next.js 15+
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  
  redirect('/admin/login');
}

// --- PRODUCT CREATION ACTIONS ---

const uploadImage = async (file) => {
  if (!file || file.size === 0) return null;
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabaseAdmin.storage
    .from('products')
    .upload(fileName, buffer, {
      contentType: file.type,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    throw uploadError;
  }

  const { data } = supabaseAdmin.storage
    .from('products')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

export async function addProduct(formData) {
  try {
    const category = formData.get('category');
    
    // Parse tags
    const tagsString = formData.get('tags');
    const tags = tagsString ? tagsString.split(',').map(t => t.trim()) : [];
    
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
      throw error;
    }
  } catch (error) {
    console.error("Failed to add product:", error);
    throw new Error('Failed to save product to database');
  }
  
  redirect('/admin/dashboard');
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
  const { data: product, error: fetchError } = await supabaseAdmin
    .from('products')
    .select('image_1, image_2')
    .eq('id', productId)
    .single();

  if (fetchError) {
    console.error("Fetch error during delete:", fetchError);
    throw new Error('Failed to fetch product details for deletion');
  }

  const filesToDelete = [];
  
  if (product.image_1) {
    filesToDelete.push(product.image_1.split('/').pop()); 
  }
  if (product.image_2) {
    filesToDelete.push(product.image_2.split('/').pop());
  }

  if (filesToDelete.length > 0) {
    const { error: storageError } = await supabaseAdmin.storage
      .from('products')
      .remove(filesToDelete);
      
    if (storageError) {
      console.error("Failed to delete images from storage:", storageError);
    }
  }

  const { error: dbError } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', productId);

  if (dbError) {
    console.error("Database delete error:", dbError);
    throw new Error('Failed to permanently delete product');
  }
}