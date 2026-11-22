import { hasSupabaseConfig, supabase } from '@/lib/supabase/client';
import Catalogue from '@/components/Catalogue';
import { fetchCategories } from '@/lib/categories';

// This forces Next.js to always fetch fresh data, bypassing static caching
export const dynamic = 'force-dynamic';

export default async function CustomerCataloguePage() {
  if (!hasSupabaseConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-6">
        <div className="max-w-lg rounded-2xl border border-[#F0EBE1] bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-medium text-[#3A3A3A]">Catalogue is not connected yet.</p>
          <p className="mt-3 text-sm text-gray-500">
            Add the Supabase environment variables to enable live product data.
          </p>
        </div>
      </div>
    );
  }

  // Fetch all active products
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching catalogue:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <p className="text-red-500">Failed to load the catalogue. Please try again later.</p>
      </div>
    );
  }

  // Fetch dynamic categories
  const categoriesData = await fetchCategories(supabase);
  const categories = categoriesData.map(c => c.name || c);

  // Pass fresh database records and categories to our interactive client component
  return <Catalogue initialProducts={products || []} initialCategories={categories} />;
}