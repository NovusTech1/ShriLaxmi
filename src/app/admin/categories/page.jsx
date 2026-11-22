'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) throw new Error('Failed to load categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load categories. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const res = await fetch('/api/admin/categories');
        if (!res.ok) throw new Error('Failed to load categories');
        const data = await res.json();
        if (isMounted) {
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch {
        if (isMounted) {
          toast.error('Failed to load categories. Please refresh.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      toast.error('Please enter a category name');
      return;
    }

    // Check for local duplicate
    if (categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`Category "${trimmed}" already exists.`);
      return;
    }

    setIsAdding(true);
    const loadingToast = toast.loading('Adding category...');

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add category');
      }

      toast.success(`Category "${trimmed}" added!`, { id: loadingToast });
      setNewCategoryName('');
      await fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Something went wrong', { id: loadingToast });
    } finally {
      setIsAdding(false);
    }
  };

  const startEditing = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleSaveEdit = async (cat) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      toast.error('Category name cannot be empty');
      return;
    }

    if (trimmed.toLowerCase() === cat.name.toLowerCase()) {
      cancelEditing();
      return;
    }

    setIsSavingEdit(true);
    const loadingToast = toast.loading('Updating category...');

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cat.id,
          oldName: cat.name,
          newName: trimmed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update category');
      }

      toast.success('Category updated successfully!', { id: loadingToast });
      cancelEditing();
      await fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to update category', { id: loadingToast });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    const countWarning = cat.productCount > 0 
      ? ` Note: There are currently ${cat.productCount} product(s) in this category.` 
      : '';

    if (!window.confirm(`Are you sure you want to delete the category "${cat.name}"?${countWarning}`)) {
      return;
    }

    const loadingToast = toast.loading('Deleting category...');

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: cat.id,
          name: cat.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete category');
      }

      toast.success(`Category "${cat.name}" removed!`, { id: loadingToast });
      await fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to delete category', { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3A3A3A] p-6 pb-20">
      
      {/* Header */}
      <header className="max-w-3xl mx-auto flex justify-between items-center mb-8 py-4 border-b border-[#F0EBE1]">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-gray-400 hover:text-[#C17C6E] transition-colors">
            ← Back
          </Link>
          <div>
            <h1 className="text-xl font-medium">Manage Categories</h1>
            <p className="text-xs text-gray-400">Add, rename, or remove categories across your catalogue</p>
          </div>
        </div>
        <button
          onClick={fetchCategories}
          className="text-xs text-gray-500 hover:text-[#C17C6E] transition-colors border border-[#F0EBE1] bg-white px-3 py-1.5 rounded-md"
        >
          ↻ Refresh
        </button>
      </header>

      <main className="max-w-3xl mx-auto space-y-6">

        {/* Add Category Card */}
        <section className="bg-white p-6 rounded-xl border border-[#F0EBE1] shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#b08968] mb-3">Add New Category</h2>
          <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. Silk Sarees, Cotton Nightwear, Dupattas"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              disabled={isAdding}
              className="flex-grow border border-[#E5E0D8] rounded-md px-4 py-2.5 bg-[#FDFBF7] focus:outline-none focus:border-[#b08968] text-sm"
            />
            <button
              type="submit"
              disabled={isAdding || !newCategoryName.trim()}
              className="bg-[#C17C6E] hover:bg-[#A86A5D] disabled:opacity-50 text-white font-medium text-sm px-6 py-2.5 rounded-md transition-colors whitespace-nowrap"
            >
              {isAdding ? 'Adding...' : '+ Add Category'}
            </button>
          </form>
        </section>

        {/* Categories List */}
        <section className="bg-white p-6 rounded-xl border border-[#F0EBE1] shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#b08968]">
              Existing Categories ({categories.length})
            </h2>
            <span className="text-xs text-gray-400">Staff Access Only</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No categories found. Use the form above to add your first category!
            </div>
          ) : (
            <div className="divide-y divide-[#F0EBE1]">
              {categories.map((cat) => {
                const isEditing = editingId === cat.id;

                return (
                  <div key={cat.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Left: Category Name or Edit Input */}
                    <div className="flex items-center gap-3 flex-grow">
                      {isEditing ? (
                        <div className="flex items-center gap-2 w-full max-w-md">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            disabled={isSavingEdit}
                            className="border border-[#C17C6E] rounded-md px-3 py-1.5 bg-[#FDFBF7] text-sm flex-grow focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(cat)}
                            disabled={isSavingEdit || !editName.trim()}
                            className="bg-[#C17C6E] text-white text-xs px-3 py-1.5 rounded hover:bg-[#A86A5D] transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={isSavingEdit}
                            className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <span className="font-medium text-sm text-[#3A3A3A]">{cat.name}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F5F0E6] text-[#8B7355] font-medium">
                            {cat.productCount ?? 0} {cat.productCount === 1 ? 'product' : 'products'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    {!isEditing && (
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => startEditing(cat)}
                          className="text-xs text-gray-500 hover:text-[#C17C6E] px-2.5 py-1 rounded border border-[#E5E0D8] hover:border-[#C17C6E] transition-colors bg-[#FDFBF7]"
                        >
                          ✎ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="text-xs text-red-500 hover:text-red-700 px-2.5 py-1 rounded border border-red-100 hover:border-red-300 bg-red-50/50 transition-colors"
                        >
                          ✕ Delete
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
