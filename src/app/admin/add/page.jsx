'use client';

import { useState } from 'react';
import Link from 'next/link';
import { addProduct } from '../action';

const CATEGORIES = [
  "Kurtis", "2 Piece Sets", "3 Piece Sets", "Co-ord Sets", 
  "Dress Materials", "Pants", "Bedsheets"
];

const SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];

export default function AddProductPage() {
  const [sizes, setSizes] = useState({
    S: false, M: false, L: false, XL: false, XXL: false, "3XL": false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State to track and display the selected file names
  const [image1Name, setImage1Name] = useState('');
  const [image2Name, setImage2Name] = useState('');

  const handleSizeToggle = (size) => {
    setSizes(prev => ({ ...prev, [size]: !prev[size] }));
  };

  const handleImage1Change = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage1Name(e.target.files[0].name);
    } else {
      setImage1Name('');
    }
  };

  const handleImage2Change = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage2Name(e.target.files[0].name);
    } else {
      setImage2Name('');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3A3A3A] p-6 pb-20">
      <header className="max-w-3xl mx-auto flex justify-between items-center mb-8 py-4 border-b border-[#F0EBE1]">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-gray-400 hover:text-[#C17C6E] transition-colors">
            ← Back
          </Link>
          <h1 className="text-xl font-medium">Add New Product</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto bg-white p-8 rounded-xl border border-[#F0EBE1] shadow-sm">
        <form action={addProduct} onSubmit={() => setIsSubmitting(true)} className="space-y-6">
          
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select name="category" required className="w-full border border-[#F0EBE1] rounded-md p-3 bg-[#FDFBF7] focus:outline-none focus:border-[#b08968]">
              <option value="">Select a category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
            <input type="text" name="tags" placeholder="e.g. Cotton, Floral Print, Summer" className="w-full border border-[#F0EBE1] rounded-md p-3 bg-[#FDFBF7] focus:outline-none focus:border-[#b08968]" />
          </div>

          {/* Sizes UI - Controlled by React State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
            <div className="flex flex-wrap gap-3">
              {SIZES.map(size => (
                <button
                  type="button"
                  key={size}
                  onClick={() => handleSizeToggle(size)}
                  className={`w-12 h-12 rounded-md font-medium transition-colors border ${sizes[size] ? 'bg-[#C17C6E] border-[#C17C6E] text-white' : 'bg-[#FDFBF7] border-[#F0EBE1] text-gray-400 hover:border-[#b08968]'}`}
                >
                  {size}
                </button>
              ))}
            </div>
            
            {/* Hidden Input passing the state directly to the formData */}
            <input type="hidden" name="sizes" value={JSON.stringify(sizes)} />
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Primary Image */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Image *</label>
              <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${image1Name ? 'border-[#C17C6E] bg-[#FDFBF7]' : 'border-[#E5E0D8] bg-[#FDFBF7] hover:border-[#C17C6E]'}`}>
                <span className={`text-xs font-medium mb-1 text-center truncate w-full px-2 ${image1Name ? 'text-[#C17C6E]' : 'text-gray-500'}`}>
                  {image1Name ? `Selected: ${image1Name}` : 'Click to upload primary photo'}
                </span>
                {!image1Name && <span className="text-[10px] text-gray-400">PNG, JPG up to 10MB</span>}
                <input type="file" name="image1" accept="image/*" required className="hidden" onChange={handleImage1Change} />
              </label>
            </div>

            {/* Secondary Image */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Image (Optional)</label>
              <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${image2Name ? 'border-[#C17C6E] bg-[#FDFBF7]' : 'border-[#E5E0D8] bg-[#FDFBF7] hover:border-[#C17C6E]'}`}>
                <span className={`text-xs font-medium mb-1 text-center truncate w-full px-2 ${image2Name ? 'text-[#C17C6E]' : 'text-gray-500'}`}>
                  {image2Name ? `Selected: ${image2Name}` : 'Click to upload second photo'}
                </span>
                {!image2Name && <span className="text-[10px] text-gray-400">PNG, JPG up to 10MB</span>}
                <input type="file" name="image2" accept="image/*" className="hidden" onChange={handleImage2Change} />
              </label>
            </div>
            
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full text-white py-3 rounded-md font-medium transition-colors mt-4 ${isSubmitting ? 'bg-gray-400' : 'bg-[#C17C6E] hover:bg-[#b08968]'}`}
          >
            {isSubmitting ? 'UPLOADING & SAVING...' : 'SAVE PRODUCT'}
          </button>
        </form>
      </main>
    </div>
  );
}