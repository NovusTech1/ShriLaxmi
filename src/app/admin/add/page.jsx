'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { DEFAULT_CATEGORIES } from '@/lib/categories';
import { APPAREL_SIZES, BEDSHEET_SIZES } from '@/lib/sizes';

const INITIAL_VARIANT = { id: 1, color: '', file: null, fileName: '', error: '' };

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sizeMode, setSizeMode] = useState('apparel'); // 'apparel' | 'bedsheet' | 'none'
  const [apparelSizes, setApparelSizes] = useState({
    S: false, M: false, L: false, XL: false, XXL: false, "3XL": false, "Free Size": false
  });
  const [bedsheetSizes, setBedsheetSizes] = useState({
    "Single Bed": false, "King Size": false
  });
  const [inStock, setInStock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTrending, setIsTrending] = useState(false);

  // Color variants state
  const [variants, setVariants] = useState([INITIAL_VARIANT]);

  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setCategories(data.map(c => c.name || c));
          }
        }
      } catch {
        // keep defaults
      }
    };
    void loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setSelectedCategory(cat);
    const lower = cat.toLowerCase();
    if (lower.includes('bedsheet')) {
      setSizeMode('bedsheet');
    } else if (lower.includes('bag')) {
      setSizeMode('none');
    } else {
      setSizeMode('apparel');
    }
  };

  const toggleApparelSize = (size) => {
    setApparelSizes(prev => ({ ...prev, [size]: !prev[size] }));
  };

  const toggleBedsheetSize = (size) => {
    setBedsheetSizes(prev => ({ ...prev, [size]: !prev[size] }));
  };

  const addVariant = () => {
    const nextId = Math.max(1, ...variants.map(variant => Number(variant.id) || 1)) + 1;
    setVariants(prev => [...prev, { id: nextId, color: '', file: null, fileName: '', error: '' }]);
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

      let finalSizes = {};
      if (sizeMode === 'none') {
        finalSizes = { no_sizes: true, in_stock: inStock };
      } else if (sizeMode === 'bedsheet') {
        const hasAnyTrue = Object.values(bedsheetSizes).some(Boolean);
        finalSizes = { ...bedsheetSizes, no_sizes: false, in_stock: hasAnyTrue };
      } else {
        const hasAnyTrue = Object.values(apparelSizes).some(Boolean);
        finalSizes = { ...apparelSizes, no_sizes: false, in_stock: hasAnyTrue };
      }

      formData.set('sizes', JSON.stringify(finalSizes));
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <Link href="/admin/categories" className="text-xs text-[#C17C6E] hover:underline flex items-center gap-1 font-medium">
                + Manage Categories
              </Link>
            </div>
            <select 
              name="category" 
              required 
              value={selectedCategory} 
              onChange={handleCategoryChange}
              className="w-full border border-[#F0EBE1] rounded-md p-3 bg-[#FDFBF7] focus:outline-none focus:border-[#b08968]"
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
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

          {/* Sizes Configuration */}
          <div className="border border-[#F0EBE1] rounded-xl p-5 bg-[#FDFBF7]/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Sizes & Inventory</label>
                <p className="text-xs text-gray-500">Choose the sizing type that applies to this item</p>
              </div>

              {/* Size Mode Selector Tabs */}
              <div className="flex bg-white p-1 rounded-lg border border-[#E5E0D8] text-xs">
                <button
                  type="button"
                  onClick={() => setSizeMode('apparel')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${sizeMode === 'apparel' ? 'bg-[#C17C6E] text-white shadow-xs' : 'text-gray-600 hover:text-black'}`}
                >
                  Clothing
                </button>
                <button
                  type="button"
                  onClick={() => setSizeMode('bedsheet')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${sizeMode === 'bedsheet' ? 'bg-[#C17C6E] text-white shadow-xs' : 'text-gray-600 hover:text-black'}`}
                >
                  Bedsheets
                </button>
                <button
                  type="button"
                  onClick={() => setSizeMode('none')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${sizeMode === 'none' ? 'bg-[#C17C6E] text-white shadow-xs' : 'text-gray-600 hover:text-black'}`}
                >
                  No Sizes (Bags)
                </button>
              </div>
            </div>

            {/* Mode 1: Apparel Sizes (S, M, L, XL, XXL, 3XL, Free Size) */}
            {sizeMode === 'apparel' && (
              <div>
                <p className="text-xs text-gray-500 mb-3">Tap each size to toggle availability for this product:</p>
                <div className="flex flex-wrap gap-2.5">
                  {APPAREL_SIZES.map(size => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => toggleApparelSize(size)}
                      className={`h-11 px-3.5 rounded-md text-xs font-medium transition-all border ${apparelSizes[size] ? 'bg-[#C17C6E] border-[#C17C6E] text-white shadow-xs' : 'bg-white border-[#E5E0D8] text-gray-500 hover:border-[#b08968]'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mode 2: Bedsheets (Single Bed, King Size) */}
            {sizeMode === 'bedsheet' && (
              <div>
                <p className="text-xs text-gray-500 mb-3">Select available bedsheet sizes:</p>
                <div className="flex flex-wrap gap-3">
                  {BEDSHEET_SIZES.map(size => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => toggleBedsheetSize(size)}
                      className={`h-11 px-5 rounded-md text-xs font-medium transition-all border flex items-center gap-2 ${bedsheetSizes[size] ? 'bg-[#C17C6E] border-[#C17C6E] text-white shadow-xs' : 'bg-white border-[#E5E0D8] text-gray-600 hover:border-[#b08968]'}`}
                    >
                      <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${bedsheetSizes[size] ? 'border-white bg-white text-[#C17C6E]' : 'border-gray-400'}`}>
                        {bedsheetSizes[size] ? '✓' : ''}
                      </span>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mode 3: No sizes needed (Bags, Accessories) */}
            {sizeMode === 'none' && (
              <div className="bg-white p-4 rounded-lg border border-[#E5E0D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-800">One Standard Size</p>
                  <p className="text-xs text-gray-500">Perfect for Tote Bags, Handbags, and accessories with no garment sizes.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setInStock(prev => !prev)}
                  className={`px-4 py-2 rounded-md text-xs font-medium border transition-colors self-start sm:self-auto ${inStock ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-red-50 border-red-300 text-red-600'}`}
                >
                  {inStock ? '✓ Marked In Stock' : '✕ Marked Out of Stock'}
                </button>
              </div>
            )}
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