'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

const CATEGORIES = [
  "Short Kurti", "Long Kurti", "Cord Set", "One Piece", 
  "3 Piece Sets", "Bedsheets", "Pants", "Dress Materials"
];

const SIZES = ["S", "M", "L", "XL", "XXL", "3XL"];

export default function AddProductPage() {
  const router = useRouter();
  const [sizes, setSizes] = useState({
    S: false, M: false, L: false, XL: false, XXL: false, "3XL": false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  
  // Color variants state
  const [variants, setVariants] = useState([
    { id: Date.now(), color: '', file: null, fileName: '', error: '' }
  ]);

  const handleSizeToggle = (size) => {
    setSizes(prev => ({ ...prev, [size]: !prev[size] }));
  };

  const addVariant = () => {
    setVariants(prev => [...prev, { id: Date.now(), color: '', file: null, fileName: '', error: '' }]);
  };

  const removeVariant = (id) => {
    if (variants.length > 1) {
      setVariants(prev => prev.filter(v => v.id !== id));
    }
  };

  const handleVariantChange = (id, field, value) => {
    setVariants(prev => prev.map(v => {
      if (v.id !== id) return v;
      if (field === 'file') {
        const file = value;
        if (!file) return { ...v, file: null, fileName: '', error: '' };
        
        const ext = file.name.split('.').pop().toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
          return { ...v, file: null, fileName: '', error: `Unsupported type ".${ext}". Use JPG, PNG, or WEBP.` };
        }
        return { ...v, file, fileName: file.name, error: '' };
      }
      return { ...v, [field]: value };
    }));
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 4,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };
    try {
      return await imageCompression(file, options);
    } catch (error) {
      console.error("Compression error:", error);
      return file; // fallback to original if compression fails
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const hasErrors = variants.some(v => v.error);
    const missingFiles = variants.some(v => !v.file);
    const missingColors = variants.some(v => !v.color.trim());

    if (hasErrors || missingFiles || missingColors) {
      toast.error('Please fix the errors in your variants (ensure all have a color and an image).');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Compressing images and saving product...');

    try {
      const formData = new FormData(e.target);
      formData.set('sizes', JSON.stringify(sizes));
      formData.set('is_trending', isTrending);

      // Build variants metadata and compress files
      const variantsMetadata = [];
      
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const compressedFile = await compressImage(v.file);
        
        // Use the original file extension for the compressed file name
        const compressedFileWithName = new File([compressedFile], v.fileName, { type: compressedFile.type });
        
        formData.append(`variant_image_${i}`, compressedFileWithName);
        variantsMetadata.push({ color: v.color.trim() });
      }

      formData.append('variants_meta', JSON.stringify(variantsMetadata));

      const res = await fetch('/api/admin/add-product', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to save product');
      }

      toast.success('Successfully uploaded!', { id: loadingToast });
      router.push('/admin/dashboard');
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.', { id: loadingToast });
      setIsSubmitting(false);
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

          {/* Trending Checkbox */}
          <div className="flex items-center gap-3 bg-[#FDFBF7] p-4 rounded-md border border-[#F0EBE1]">
            <input 
              type="checkbox" 
              id="trending-checkbox"
              checked={isTrending}
              onChange={(e) => setIsTrending(e.target.checked)}
              className="w-5 h-5 accent-[#C17C6E] cursor-pointer"
            />
            <label htmlFor="trending-checkbox" className="text-sm font-medium text-gray-700 cursor-pointer">
              Mark as 🌟 Featured
            </label>
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

          {/* Color Variants */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-medium text-gray-700">Color Variants *</label>
            </div>
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={variant.id} className="p-4 border border-[#F0EBE1] rounded-lg bg-[#FDFBF7] relative">
                  {variants.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeVariant(variant.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Color Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Navy Blue" 
                        value={variant.color}
                        onChange={(e) => handleVariantChange(variant.id, 'color', e.target.value)}
                        className="w-full border border-[#E5E0D8] rounded-md p-2 bg-white focus:outline-none focus:border-[#b08968]" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Color Image</label>
                      <label className={`flex flex-col items-center justify-center border border-dashed rounded-md p-2 cursor-pointer transition-colors bg-white ${variant.error ? 'border-red-400' : variant.fileName ? 'border-[#C17C6E]' : 'border-[#E5E0D8] hover:border-[#C17C6E]'}`}>
                        <span className={`text-xs text-center truncate w-full px-2 ${variant.error ? 'text-red-500' : variant.fileName ? 'text-[#C17C6E]' : 'text-gray-500'}`}>
                          {variant.fileName ? variant.fileName : 'Click to upload image'}
                        </span>
                        {variant.error && <span className="text-[10px] text-red-400 text-center">{variant.error}</span>}
                        <input 
                          type="file" 
                          accept="image/*" 
                          required={!variant.file} 
                          className="hidden" 
                          onChange={(e) => handleVariantChange(variant.id, 'file', e.target.files?.[0])} 
                        />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              type="button"
              onClick={addVariant}
              className="mt-3 text-sm text-[#C17C6E] font-medium hover:underline flex items-center gap-1"
            >
              + Add another color
            </button>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full text-white py-3 rounded-md font-medium transition-colors mt-4 ${
              isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#C17C6E] hover:bg-[#b08968]'
            }`}
          >
            {isSubmitting ? 'UPLOADING & SAVING...' : 'SAVE PRODUCT'}
          </button>
        </form>
      </main>
    </div>
  );
}