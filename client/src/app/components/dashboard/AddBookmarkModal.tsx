// components/dashboard/AddBookmarkModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
  id: string;
  name: string;
  emoji?: string;
}

interface Collection {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

// BookmarkData interface matches the Go backend's AddBookmarkRequestBody JSON tags
interface BookmarkData {
  url: string;
  title: string;
  summary: string;
  tags: string[]; // Array of Tag IDs (strings)
  collections: string[]; // Array of Collection IDs (strings)
  category_id?: string; // Optional Category ID (string)
  is_fav: boolean;
  thumbnail?: string; // Not used in backend AddBookmarkRequestBody but kept for potential future use
}

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBookmark: (data: BookmarkData) => void;
  isLoading: boolean;
  error: string | null;
  categories: Category[]; // All categories available to the user
  collections: Collection[]; // All collections available to the user
  tags: Tag[]; // All tags available to the user (from /api/tags/user)
  onAddNewTag: (tagName: string) => Promise<Tag | null>; // Callback to add a new tag
}

const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({
  isOpen,
  onClose,
  onAddBookmark,
  isLoading,
  error,
  categories,
  collections,
  tags,
  onAddNewTag,
}) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [isFav, setIsFav] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Reset form fields when modal closes
  useEffect(() => {
    if (!isOpen) {
      setUrl("");
      setTitle("");
      setSummary("");
      setSelectedTags([]);
      setNewTagInput("");
      setSelectedCollections([]);
      setSelectedCategory(undefined);
      setIsFav(false);
      setIsAddingTag(false);
    }
  }, [isOpen]);

  const handleTagAdd = async () => {
    if (newTagInput.trim() === "" || isAddingTag) return;

    setIsAddingTag(true);
    try {
      const existingTag = tags.find(tag =>
        tag.name.toLowerCase() === newTagInput.trim().toLowerCase()
      );

      if (existingTag) {
        if (!selectedTags.includes(existingTag.id)) {
          setSelectedTags([...selectedTags, existingTag.id]);
        }
      } else {
        const newTag = await onAddNewTag(newTagInput.trim());
        if (newTag && !selectedTags.includes(newTag.id)) {
          setSelectedTags((prev) => [...prev, newTag.id]);
        }
      }
      setNewTagInput("");
    } catch (tagError) {
      console.error("Error adding tag:", tagError);
      // In a real app, display a user-friendly error (e.g., a toast notification)
    } finally {
      setIsAddingTag(false);
    }
  };

  const handleCollectionToggle = (collectionId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) {
      return; // Basic validation
    }

    const bookmarkData: BookmarkData = {
      url: url.trim(),
      title: title.trim(),
      summary: summary.trim(),
      tags: selectedTags,
      collections: selectedCollections,
      category_id: selectedCategory && selectedCategory !== "" ? selectedCategory : undefined,
      is_fav: isFav,
    };

    onAddBookmark(bookmarkData);
  };

  if (!isOpen) return null;

  const modalVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-95 border border-indigo-100" // Adjusted max-w and added border
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#a78bfa #e0e7ff' }} // Custom scrollbar styling (purple-400 thumb, indigo-100 track)
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Bookmark</h2> {/* Consistent heading color */}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-1">
                  URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all placeholder-slate-500" // Updated colors, added text-gray-900
                  required
                  disabled={isLoading}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all placeholder-slate-500" // Updated colors
                  required
                  disabled={isLoading}
                  placeholder="Enter bookmark title"
                />
              </div>

              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-slate-700 mb-1">
                  Summary
                </label>
                <textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all resize-y placeholder-slate-500" // Updated colors
                  disabled={isLoading}
                  placeholder="Optional description or notes"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || undefined)}
                  className="w-full p-3 border border-indigo-200 rounded-lg bg-indigo-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all" // Updated colors
                  disabled={isLoading}
                >
                  <option value="" className="text-slate-500">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji ? `${cat.emoji} ${cat.name}` : cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Collections</label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[24px]">
                  {selectedCollections.map((colId) => {
                    const collection = collections.find(c => c.id === colId);
                    return collection ? (
                      <span key={colId} className="flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"> {/* Updated colors */}
                        {collection.name}
                        <button
                          type="button"
                          onClick={() => handleCollectionToggle(colId)}
                          className="ml-2 text-indigo-500 hover:text-indigo-700" // Updated colors
                          disabled={isLoading}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
                {collections.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2 border border-indigo-200 rounded-lg p-2 bg-indigo-50 max-h-28 overflow-y-auto custom-scrollbar"> {/* Updated colors */}
                    {collections.filter(col => !selectedCollections.includes(col.id)).map(col => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => handleCollectionToggle(col.id)}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200 transition-colors disabled:opacity-50" // Updated colors
                        disabled={isLoading}
                      >
                        {col.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 mt-2">No collections available. Create some in the dashboard sidebar!</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[24px]">
                  {selectedTags.map((tagId) => {
                    const tag = tags.find(t => t.id === tagId);
                    return tag ? (
                      <span key={tagId} className="flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"> {/* Updated colors */}
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => handleTagToggle(tagId)}
                          className="ml-2 text-purple-500 hover:text-purple-700" // Updated colors
                          disabled={isLoading}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleTagAdd();
                      }
                    }}
                    placeholder="Add new tag or select existing"
                    className="flex-1 p-3 border border-indigo-200 rounded-lg bg-indigo-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all placeholder-slate-500" // Updated colors
                    disabled={isLoading || isAddingTag}
                  />
                  <button
                    type="button"
                    onClick={handleTagAdd}
                    className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md" // Added shadow
                    disabled={isLoading || isAddingTag || !newTagInput.trim()}
                  >
                    {isAddingTag ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-2 border border-indigo-200 rounded-lg p-2 bg-indigo-50 max-h-28 overflow-y-auto custom-scrollbar"> {/* Updated colors */}
                    {tags.filter(tag => !selectedTags.includes(tag.id)).map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagToggle(tag.id)}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200 transition-colors disabled:opacity-50" // Updated colors
                        disabled={isLoading}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 mt-2">No tags available. Add a new one above!</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFav"
                  checked={isFav}
                  onChange={(e) => setIsFav(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-indigo-300 rounded" // Updated border color
                  disabled={isLoading}
                />
                <label htmlFor="isFav" className="text-sm font-medium text-slate-700">
                  Mark as Favorite
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <p className="text-sm">Error: {error}</p>
                </div>
              )}

              <motion.button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !url.trim() || !title.trim()}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Bookmark...
                  </>
                ) : (
                  "Add Bookmark"
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddBookmarkModal;
