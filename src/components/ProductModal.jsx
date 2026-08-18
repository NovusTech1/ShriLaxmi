'use client';

import { useState } from 'react';

const PRODUCT_SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];

export default function ProductModal({ product, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return null;

  const nextImage = (e) => {
    e.stopPropagation();
    if (product.image_2) setCurrentImageIndex(prev => prev === 0 ? 1 : 0);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (product.image_2) setCurrentImageIndex(prev => prev === 1 ? 0 : 1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-lg bg-white rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        
        <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-white/90 text-black w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#C17C6E] hover:text-white transition-colors shadow-sm">
          ✕
        </button>

        <div className="relative aspect-[3/4] w-full bg-gray-100 flex items-center justify-center group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentImageIndex === 0 ? product.image_1 : product.image_2} alt={product.category} className="object-contain w-full h-full" />

          {product.image_2 && (
            <>
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:bg-white text-gray-800 transition-all opacity-0 group-hover:opacity-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:bg-white text-gray-800 transition-all opacity-0 group-hover:opacity-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                <div className={`w-2 h-2 rounded-full ${currentImageIndex === 0 ? 'bg-white' : 'bg-white/50'}`}></div>
                <div className={`w-2 h-2 rounded-full ${currentImageIndex === 1 ? 'bg-white' : 'bg-white/50'}`}></div>
              </div>
            </>
          )}
        </div>

        <div className="p-6 bg-white">
          <h2 className="font-serif text-xl text-[#3A3A3A] mb-2">{product.category}</h2>
          {product.tags && <p className="text-sm text-gray-500 mb-4">{product.tags.join(', ')}</p>}
          <div className="flex flex-nowrap gap-2 w-full">
            {PRODUCT_SIZES.map(size => {
              const isAvailable = product.sizes[size] === true;
              return (
                <div key={size} className={`flex flex-1 items-center justify-center h-8 text-xs rounded-md transition-all ${isAvailable ? 'border border-[#C17C6E] text-[#3A3A3A] font-medium' : 'bg-gray-100 text-gray-300'}`}>
                  {size}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}