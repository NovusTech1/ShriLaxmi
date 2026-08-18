'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ProductCard from './ProductCard';

const CATEGORIES = ["All", "Kurtis", "2 Piece Sets", "3 Piece Sets", "Co-ord Sets", "Dress Materials", "Pants", "Bedsheets"];
const SIZES = ["All", "S", "M", "L", "XL", "XXL", "3XL"];

export default function Catalogue({ initialProducts }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');

  const filteredProducts = initialProducts.filter(product => {
    const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory;
    const sizeMatch = selectedSize === 'All' || product.sizes[selectedSize] === true;
    return categoryMatch && sizeMatch;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3A3A3A] font-sans flex flex-col relative">
      
      <Navbar />

      {/* Filters */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-6 w-full">
        <div className="flex flex-row justify-between md:justify-start gap-4 md:gap-16 w-full">
          <div className="flex flex-col w-1/2 md:w-auto overflow-hidden">
            <h3 className="text-xs font-semibold tracking-wider text-gray-400 mb-3 uppercase text-left">Category</h3>
            <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs md:text-sm transition-colors border ${selectedCategory === cat ? 'bg-[#C17C6E] border-[#C17C6E] text-white' : 'bg-white border-[#E5E0D8] text-gray-600 hover:border-[#b08968]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col w-1/2 md:w-auto overflow-hidden">
            <h3 className="text-xs font-semibold tracking-wider text-gray-400 mb-3 uppercase text-left">Size</h3>
            <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
              {SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs md:text-sm transition-colors border ${selectedSize === size ? 'bg-[#C17C6E] border-[#C17C6E] text-white' : 'bg-white border-[#E5E0D8] text-gray-600 hover:border-[#b08968]'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-4 flex-grow w-full">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20"><p className="text-gray-400">No products found.</p></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-8 pb-10">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}