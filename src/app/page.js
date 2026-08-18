import { supabase } from '@/lib/supabase/client';
import Catalogue from '@/components/Catalogue';

// This forces Next.js to always fetch fresh data, bypassing static caching
export const dynamic = 'force-dynamic';

export default async function CustomerCataloguePage() {
  // Fetch all active products
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching catalogue:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <p className="text-red-500">Failed to load the catalogue. Please try again later.</p>
      </div>
    );
  }

  // Pass the fresh database records to our interactive client component
  return <Catalogue initialProducts={products || []} />;
}