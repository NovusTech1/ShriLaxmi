import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/server';
import ProductGallery from '@/components/ProductGallery';

const PRODUCT_SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];

async function getProduct(id) {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center text-[#3A3A3A]">
        <h1 className="text-2xl font-serif mb-4">Product not found</h1>
        <Link href="/" className="text-[#C17C6E] underline text-sm">Back to Catalogue</Link>
      </div>
    );
  }

  const isOutOfStock = !Object.values(product.sizes).some(val => val === true);
  const images = [product.image_1, product.image_2].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3A3A3A] font-sans pb-20">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#F0EBE1] py-4 px-4 md:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-[#C17C6E] transition-colors flex items-center gap-1">
            ← Back
          </Link>
          <h1 className="text-lg font-serif text-[#b08968]">SHRI LAXMI</h1>
          <div className="w-8"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-8 md:pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start bg-white p-6 md:p-8 rounded-2xl border border-[#F0EBE1]">
          
          {/* Gallery Component */}
          <ProductGallery images={images} category={product.category} />

          {/* Details Column */}
          <div className="flex flex-col">
            {isOutOfStock && (
              <p className="text-red-500 text-xs font-semibold tracking-wide mb-2">OUT OF STOCK</p>
            )}
            
            <h1 className="text-xl md:text-2xl font-serif uppercase tracking-wide text-[#3A3A3A] mb-3">
              {product.category}
            </h1>

            {/* Pill Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag, i) => (
                  <span key={i} className="text-xs px-3 py-1 bg-[#F5F0E6] text-[#8B7355] rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <hr className="border-[#F0EBE1] mb-6" />

            {/* Available Sizes Box Grid */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold tracking-wider text-gray-400 mb-3 uppercase">Available Sizes</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 w-full">
                {PRODUCT_SIZES.map(size => {
                  const isAvailable = product.sizes[size] === true;
                  return (
                    <div 
                      key={size} 
                      className={`flex items-center justify-center h-12 text-xs rounded-lg transition-all font-medium ${
                        isAvailable 
                          ? 'border border-[#C17C6E] text-[#3A3A3A] bg-white shadow-xs' 
                          : 'bg-gray-50 text-gray-300'
                      }`}
                    >
                      {size}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#F0EBE1]">
              <p className="text-xs text-gray-500 leading-relaxed">
                Want to check availability or purchase? Visit our store or drop by to explore the complete collection.
              </p>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}