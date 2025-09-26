"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import {
  BookmarkData,
  Category,
  Collection,
  Tag,
  FrontendBookmark,
} from "@/types";

interface EditBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditBookmark: (bookmarkId: string, data: BookmarkData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  categories: Category[];
  collections: Collection[];
  tags: Tag[];
  onAddNewTag: (tagName: string) => Promise<Tag | null>;
  initialBookmark: FrontendBookmark;
}

const EditBookmarkModal: React.FC<EditBookmarkModalProps> = ({
  isOpen,
  onClose,
  onEditBookmark,
  isLoading,
  error,
  categories,
  collections,
  tags,
  onAddNewTag,
  initialBookmark,
}) => {
  const [title, setTitle] = useState(initialBookmark.title);
  const [url, setUrl] = useState(initialBookmark.url);
  const [summary, setSummary] = useState(initialBookmark.summary);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    initialBookmark.categories[0]?.id || undefined
  );
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    initialBookmark.collections.map((col) => col.id)
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialBookmark.tags.map((tag) => tag.id)
  );
  const [newTagInput, setNewTagInput] = useState("");
  const [isFav, setIsFav] = useState(initialBookmark.isFav);
  const [isAddingTag, setIsAddingTag] = useState(false); // Local loading state for adding tag


  // Reset form on initialBookmark change or modal open
  useEffect(() => {
    if (isOpen) {
      setTitle(initialBookmark.title);
      setUrl(initialBookmark.url);
      setSummary(initialBookmark.summary);
      setSelectedCategory(initialBookmark.categories[0]?.id || undefined);
      setSelectedCollections(initialBookmark.collections.map((col) => col.id));
      setSelectedTags(initialBookmark.tags.map((tag) => tag.id));
      setNewTagInput("");
      setIsFav(initialBookmark.isFav);
      setIsAddingTag(false); // Reset this too
    }
  }, [isOpen, initialBookmark]);

  const handleTagAdd = async () => {
    if (newTagInput.trim() === "" || isAddingTag) return;

    setIsAddingTag(true);
    try {
      const existingTag = tags.find(
        (tag) => tag.name.toLowerCase() === newTagInput.trim().toLowerCase()
      );

      if (existingTag) {
        if (!selectedTags.includes(existingTag.id)) {
          setSelectedTags((prev) => [...prev, existingTag.id]);
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
      // You might want to display a user-friendly error here within the modal
    } finally {
      setIsAddingTag(false);
    }
  };

  const handleTagToggle = (tagId: string) => { // Renamed from handleTagRemove for consistency
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };


  const handleCollectionToggle = (collectionId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    );
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      alert("Title and URL are required.");
      return;
    }

    const bookmarkData: BookmarkData = {
      title: title.trim(),
      url: url.trim(),
      summary: summary ? summary.trim() : "",
      tags: selectedTags,
      collections: selectedCollections,
      category_id: selectedCategory && selectedCategory !== "" ? selectedCategory : undefined,
      is_fav: isFav,
    };

    await onEditBookmark(initialBookmark.id, bookmarkData);
  };

  if (!isOpen) return null;

  const modalVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  };

  const isFormDisabled = isLoading || isAddingTag; // Combine loading states for form

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto transform scale-95 custom-scrollbar"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">Edit Bookmark</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
            disabled={isFormDisabled} // Disable close button while saving
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-green-200 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
              required
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-1">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-3 border border-green-200 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
              required
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-slate-700 mb-1">
              Summary (Markdown supported)
            </label>
            <textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full p-3 border border-green-200 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
              disabled={isFormDisabled}
              placeholder="Optional description or notes (supports Markdown)"
            ></textarea>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || undefined)}
              className="w-full p-3 border border-green-200 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
              disabled={isFormDisabled}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji ? `${cat.emoji} ${cat.name}` : cat.name} {/* Display emoji */}
                </option>
              ))}
            </select>
          </div>

          {/* Collections field updated for multi-selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Collections</label>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[24px]">
              {selectedCollections.map((colId) => {
                const collection = collections.find(c => c.id === colId);
                return collection ? (
                  <span key={colId} className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {collection.name}
                    <button
                      type="button"
                      onClick={() => handleCollectionToggle(colId)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                      disabled={isFormDisabled}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
            {collections.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2 border border-green-200 rounded-lg p-2 bg-green-50 max-h-28 overflow-y-auto custom-scrollbar">
                {collections.filter(col => !selectedCollections.includes(col.id)).map(col => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => handleCollectionToggle(col.id)}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors disabled:opacity-50"
                    disabled={isFormDisabled}
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No collections available.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[24px]">
              {selectedTags.map((tagId) => {
                const tag = tags.find((t) => t.id === tagId);
                return tag ? (
                  <span
                    key={tag.id}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag.name}
                    <button
                      type="button"
                      onClick={() => handleTagToggle(tag.id)} // Use toggle for consistency
                      className="ml-1 text-purple-500 hover:text-purple-800"
                      disabled={isFormDisabled}
                    >
                      <X size={14} />
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
                className="flex-grow p-3 border border-green-200 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                disabled={isFormDisabled || isAddingTag}
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isFormDisabled || isAddingTag || !newTagInput.trim()}
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
              <div className="flex flex-wrap gap-2 mt-2 border border-green-200 rounded-lg p-2 bg-green-50 max-h-28 overflow-y-auto custom-scrollbar">
                {tags.filter(tag => !selectedTags.includes(tag.id)).map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)} // Use toggle for consistency
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors disabled:opacity-50"
                    disabled={isFormDisabled}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No tags available.</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFav"
              checked={isFav}
              onChange={(e) => setIsFav(e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-green-300 rounded"
              disabled={isFormDisabled}
            />
            <label htmlFor="isFav" className="text-sm font-medium text-slate-700">Mark as Favorite</label>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isFormDisabled || !title.trim() || !url.trim()}
            whileHover={!isFormDisabled ? { scale: 1.02 } : {}}
            whileTap={!isFormDisabled ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Changes...
              </>
            ) : (
              "Save Changes"
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EditBookmarkModal;
