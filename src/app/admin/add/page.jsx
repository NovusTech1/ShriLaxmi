'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  "Kurtis", "2 Piece Sets", "3 Piece Sets", "Co-ord Sets", 
  "Dress Materials", "Pants", "Bedsheets"
];

const SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];

const MAX_IMAGE_MB = 4;
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

export default function AddProductPage() {
  const router = useRouter();
  const [sizes, setSizes] = useState({
    S: false, M: false, L: false, XL: false, XXL: false, "3XL": false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const [image1Name, setImage1Name] = useState('');
  const [image2Name, setImage2Name] = useState('');
  const [image1Error, setImage1Error] = useState('');
  const [image2Error, setImage2Error] = useState('');

  const handleSizeToggle = (size) => {
    setSizes(prev => ({ ...prev, [size]: !prev[size] }));
  };

  const validateImage = (file) => {
    if (!file) return '';
    if (file.size > MAX_IMAGE_BYTES) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max is ${MAX_IMAGE_MB}MB. Please compress first.`;
    }
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      return `Unsupported type ".${ext}". Use JPG, PNG, or WEBP.`;
    }
    return '';
  };

  const handleImage1Change = (e) => {
    const file = e.target.files?.[0];
    setImage1Name(file ? file.name : '');
    setImage1Error(file ? validateImage(file) : '');
  };

  const handleImage2Change = (e) => {
    const file = e.target.files?.[0];
    setImage2Name(file ? file.name : '');
    setImage2Error(file ? validateImage(file) : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Block submission if image validation failed
    if (image1Error || image2Error) {
      setSubmitError('Please fix the image errors above before saving.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target);
      formData.set('sizes', JSON.stringify(sizes));

      const res = await fetch('/api/admin/add-product', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to save product');
      }

      // Success — redirect to dashboard
      router.push('/admin/dashboard');
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const hasErrors = !!image1Error || !!image2Error;

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
        <form onSubmit={handleSubmit} className="space-y-6">
          
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

          {/* Sizes */}
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
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Primary Image */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Image *</label>
              <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${image1Error ? 'border-red-400 bg-red-50' : image1Name ? 'border-[#C17C6E] bg-[#FDFBF7]' : 'border-[#E5E0D8] bg-[#FDFBF7] hover:border-[#C17C6E]'}`}>
                <span className={`text-xs font-medium mb-1 text-center truncate w-full px-2 ${image1Error ? 'text-red-500' : image1Name ? 'text-[#C17C6E]' : 'text-gray-500'}`}>
                  {image1Name ? `Selected: ${image1Name}` : 'Click to upload primary photo'}
                </span>
                {image1Error
                  ? <span className="text-[10px] text-red-400 text-center">{image1Error}</span>
                  : !image1Name && <span className="text-[10px] text-gray-400">PNG, JPG, WEBP — max {MAX_IMAGE_MB}MB</span>
                }
                <input type="file" name="image1" accept="image/*" required className="hidden" onChange={handleImage1Change} />
              </label>
            </div>

            {/* Secondary Image */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Image (Optional)</label>
              <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${image2Error ? 'border-red-400 bg-red-50' : image2Name ? 'border-[#C17C6E] bg-[#FDFBF7]' : 'border-[#E5E0D8] bg-[#FDFBF7] hover:border-[#C17C6E]'}`}>
                <span className={`text-xs font-medium mb-1 text-center truncate w-full px-2 ${image2Error ? 'text-red-500' : image2Name ? 'text-[#C17C6E]' : 'text-gray-500'}`}>
                  {image2Name ? `Selected: ${image2Name}` : 'Click to upload second photo'}
                </span>
                {image2Error
                  ? <span className="text-[10px] text-red-400 text-center">{image2Error}</span>
                  : !image2Name && <span className="text-[10px] text-gray-400">PNG, JPG, WEBP — max {MAX_IMAGE_MB}MB</span>
                }
                <input type="file" name="image2" accept="image/*" className="hidden" onChange={handleImage2Change} />
              </label>
            </div>
            
          </div>

          {/* Submission error banner */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md p-3">
              {submitError}
            </div>
          )}

          {/* Submit */}
          <button 
            type="submit" 
            disabled={isSubmitting || hasErrors}
            className={`w-full text-white py-3 rounded-md font-medium transition-colors mt-4 ${
              isSubmitting || hasErrors ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#C17C6E] hover:bg-[#b08968]'
            }`}
          >
            {isSubmitting ? 'UPLOADING & SAVING...' : 'SAVE PRODUCT'}
          </button>
        </form>
      </main>
    </div>
  );
}