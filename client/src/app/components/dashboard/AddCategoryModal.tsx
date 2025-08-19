// src/app/components/dashboard/AddCategoryModal.tsx
// (No changes needed from your original code, it's already well-structured for its purpose)
"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (name: string, emoji: string) => void;
  isLoading: boolean;
  error: string | null;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onAddCategory,
  isLoading,
  error,
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [categoryEmoji, setCategoryEmoji] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onAddCategory(categoryName.trim(), categoryEmoji.trim());
      setCategoryName('');
      setCategoryEmoji('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-md relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Add New Category</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="categoryName" className="block text-sm font-medium text-slate-300 mb-2">
              Category Name
            </label>
            <input
              type="text"
              id="categoryName"
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Web Development"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="categoryEmoji" className="block text-sm font-medium text-slate-300 mb-2">
              Emoji Icon (Optional)
            </label>
            <input
              type="text"
              id="categoryEmoji"
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 💻, 💡, 📚"
              value={categoryEmoji}
              onChange={(e) => setCategoryEmoji(e.target.value)}
              disabled={isLoading}
              maxLength={2}
            />
            <p className="text-xs text-slate-400 mt-1">Paste an emoji here. Max 2 characters.</p>
          </div>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isLoading || !categoryName.trim()}
          >
            {isLoading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Adding...
                </>
            ) : 'Add Category'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
