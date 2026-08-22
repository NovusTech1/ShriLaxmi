import Link from 'next/link';

const PRODUCT_SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];

export default function ProductCard({ product }) {
  const isOutOfStock = !Object.values(product.sizes).some(val => val === true);

  return (
    <Link href={`/product/${product.id}`} className="group cursor-pointer flex flex-col h-full bg-white p-3 rounded-xl border border-[#F0EBE1] hover:shadow-md transition-all">
      
      {/* Image Container */}
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[#F0EBE1] mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={product.image_1} 
          alt={product.category} 
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
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.map((tag, i) => (
              <span key={i} className="text-[9px] md:text-[10px] px-2 py-0.5 bg-[#F5F0E6] text-[#8B7355] rounded-full truncate max-w-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Sizes Bar */}
        <div className="mt-auto pt-2 grid grid-cols-3 gap-1 w-full">
          {PRODUCT_SIZES.map(size => {
            const isAvailable = product.sizes[size] === true;
            return (
              <div 
                key={size} 
                className={`flex items-center justify-center py-1 text-[9px] rounded-md transition-all ${
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

      </div>
    </Link>
  );
}