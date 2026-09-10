'use client';

import { useState } from 'react';

export default function ProductGallery({ images, colorVariants = [], category }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[3/4] w-full bg-[#F0EBE1] rounded-lg overflow-hidden shadow-sm group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[currentIndex]} alt={category} className="object-cover w-full h-full transition-all duration-300" />

        {/* Navigation Arrows (Visible if multiple images exist) */}
        {images.length > 1 && (
          <>
            <button 
              onClick={() => setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all"
            >
              ‹
            </button>
            <button 
              onClick={() => setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all"
            >
              ›
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${currentIndex === idx ? 'bg-white w-4' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Bar for Desktop/Mobile Click Selection */}
      {images.length > 1 && (
        <div className="flex flex-wrap gap-4 mt-2">
          {images.map((img, idx) => {
            const variantColor = colorVariants[idx]?.color;
            return (
              <button 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`flex flex-col items-center gap-1.5 transition-all ${currentIndex === idx ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
              >
                <div className={`relative w-16 md:w-20 aspect-[3/4] rounded-md overflow-hidden border-2 ${currentIndex === idx ? 'border-[#C17C6E]' : 'border-transparent'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={variantColor || ''} className="object-cover w-full h-full" />
                </div>
                {variantColor && (
                  <span className={`text-[10px] md:text-xs font-medium uppercase tracking-wider ${currentIndex === idx ? 'text-[#C17C6E]' : 'text-gray-500'}`}>
                    {variantColor}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}