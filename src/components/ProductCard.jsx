import Link from 'next/link';
import { isProductOutOfStock, getProductSizes } from '@/lib/sizes';

export default function ProductCard({ product }) {
  const sizes = (product.sizes && typeof product.sizes === 'object') ? product.sizes : {};
  const isOutOfStock = isProductOutOfStock(product);
  const sizeOptions = getProductSizes(product);
  const displayImage = product.image_1 || product.color_variants?.[0]?.image_url || '';

  return (
    <Link href={`/product/${product.id}`} className="group cursor-pointer flex flex-col h-full bg-white p-3 rounded-xl border border-[#F0EBE1] hover:shadow-md transition-all">
      
      {/* Image Container */}
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[#F0EBE1] mb-3">
        {product.is_trending && (
          <div className="absolute top-2 right-2 bg-[#C17C6E] text-white text-[9px] md:text-[10px] font-bold px-2 py-1 rounded shadow-md z-10 uppercase tracking-wider">
            🌟 Featured
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={displayImage} 
          alt={product.category || 'Product'} 
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" 
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-grow space-y-2">
        
        {isOutOfStock && (
          <p className="text-red-500 text-[10px] font-semibold tracking-wide">
            OUT OF STOCK
          </p>
        )}
        
        {/* Name */}
        <h2 className="font-medium text-xs md:text-sm uppercase tracking-wide text-[#3A3A3A] truncate">
          {product.category}
        </h2>
        
        {/* Pill Tags */}
        {Array.isArray(product.tags) && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.map((tag, i) => (
              <span key={i} className="text-[9px] md:text-[10px] px-2 py-0.5 bg-[#F5F0E6] text-[#8B7355] rounded-full truncate max-w-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Sizes Bar (only shown if product has sizes) */}
        {sizeOptions.length > 0 && (
          <div className={`mt-auto pt-2 grid ${sizeOptions.length <= 3 ? 'grid-cols-2' : 'grid-cols-4'} gap-1 w-full`}>
            {sizeOptions.map(size => {
              const isAvailable = sizes[size] === true;
              return (
                <div 
                  key={size} 
                  className={`flex items-center justify-center py-1 px-0.5 text-[8px] md:text-[9px] rounded-md transition-all text-center leading-tight ${
                    isAvailable 
                      ? 'border border-[#C17C6E] text-[#3A3A3A] font-medium bg-white' 
                      : 'bg-gray-50 text-gray-300'
                  }`}
                >
                  {size}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </Link>
  );
}