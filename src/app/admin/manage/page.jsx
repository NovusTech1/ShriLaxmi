'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAdminProducts,updateProductSizes,deleteProduct } from '../action';

const SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];

export default function ManageProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getAdminProducts();
      setProducts(data);
    } catch (error) {
      alert("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const handleSizeToggle = async (product, sizeToToggle) => {
    // Optimistically update the UI so it feels instant
    const newSizes = { ...product.sizes, [sizeToToggle]: !product.sizes[sizeToToggle] };
    
    setProducts(products.map(p => 
      p.id === product.id ? { ...p, sizes: newSizes } : p
    ));

    // Send the update to Supabase in the background
    try {
      await updateProductSizes(product.id, newSizes);
    } catch (error) {
      alert("Failed to save size update.");
      fetchProducts(); // Revert UI on failure
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to remove this product?")) return;
    
    // Remove from UI instantly
    setProducts(products.filter(p => p.id !== productId));

    try {
      await deleteProduct(productId);
    } catch (error) {
      alert("Failed to delete product.");
      fetchProducts(); // Revert UI on failure
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3A3A3A] p-6 pb-20">
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-8 py-4 border-b border-[#F0EBE1]">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-gray-400 hover:text-[#C17C6E] transition-colors">
            ← Back
          </Link>
          <h1 className="text-xl font-medium">Manage Products</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {loading ? (
          <p className="text-gray-500">Loading catalogue...</p>
        ) : products.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-[#F0EBE1] text-center">
            <p className="text-gray-500 mb-4">No active products found.</p>
            <Link href="/admin/add" className="text-[#C17C6E] font-medium hover:underline">
              + Add your first product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-xl border border-[#F0EBE1] p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition-all">
                
                {/* Image */}
                <div className="relative w-24 h-32 flex-shrink-0 bg-[#FDFBF7] rounded-md overflow-hidden border border-[#F0EBE1]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image_1} alt="Product" className="object-cover w-full h-full" />
                </div>

                {/* Info & Controls */}
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-sm">{product.category}</h3>
                      <p className="text-xs text-gray-400 mt-1">{product.tags?.join(', ')}</p>
                    </div>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors text-sm"
                      title="Delete Product"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Size Toggles */}
                  <div className="mt-4">
                    <p className="text-[10px] tracking-wider text-gray-400 mb-2 uppercase">Tap to toggle availability</p>
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map(size => {
                        const isAvailable = product.sizes[size] === true;
                        return (
                          <button
                            key={size}
                            onClick={() => handleSizeToggle(product, size)}
                            className={`w-8 h-8 rounded text-xs font-medium transition-colors border ${
                              isAvailable 
                                ? 'bg-[#FDFBF7] border-[#C17C6E] text-[#C17C6E]' 
                                : 'bg-gray-50 border-gray-200 text-gray-300'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}