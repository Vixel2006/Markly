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

interface BookmarkData {
  url: string;
  title: string;
  summary: string;
  tag_ids: string[];
  collection_ids: string[];
  category_id?: string;
  is_fav: boolean;
  thumbnail?: string;
}

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBookmark: (data: BookmarkData) => void;
  isLoading: boolean;
  error: string | null;
  categories: Category[];
  collections: Collection[];
  tags: Tag[];
  onAddNewTag: (tagName: string) => Promise<Tag | null>;
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
    }
  }, [isOpen]);

  const handleTagAdd = async () => {
    if (newTagInput.trim() === "") return;
    const existingTag = tags.find(tag => tag.name.toLowerCase() === newTagInput.trim().toLowerCase());
    if (existingTag) {
      if (!selectedTags.includes(existingTag.id)) {
        setSelectedTags([...selectedTags, existingTag.id]);
      }
    } else {
      const newTag = await onAddNewTag(newTagInput.trim());
      if (newTag && !selectedTags.includes(newTag.id)) {
        setSelectedTags([...selectedTags, newTag.id]);
      }
    }
    setNewTagInput("");
  };

  const handleCollectionToggle = (collectionId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !title) return;

    onAddBookmark({
      url,
      title,
      summary,
      tag_ids: selectedTags,
      collection_ids: selectedCollections,
      category_id: selectedCategory,
      is_fav: isFav,
    });
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
            className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto transform scale-95 custom-scrollbar"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-black">Add New Bookmark</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-1">URL <span className="text-red-500">*</span></label>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full p-3 border border-green-200 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border border-green-200 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-slate-700 mb-1">Summary</label>
                <textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-green-200 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                ></textarea>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  id="category"
                  value={selectedCategory || ""} // Controlled component
                  onChange={(e) => setSelectedCategory(e.target.value || undefined)}
                  className="w-full p-3 border border-green-200 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Collections field updated to be like tags */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Collections</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedCollections.map((colId) => {
                    const collection = collections.find(c => c.id === colId);
                    return collection ? (
                      <span key={colId} className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {collection.name}
                        <button
                          type="button"
                          onClick={() => handleCollectionToggle(colId)}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
                {collections.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 border border-green-200 rounded-lg p-2 bg-green-50 max-h-28 overflow-y-auto custom-scrollbar">
                    {collections.filter(col => !selectedCollections.includes(col.id)).map(col => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => handleCollectionToggle(col.id)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
                      >
                        {col.name}
                      </button>
                    ))}
                  </div>
                )}
                {collections.length === 0 && (
                  <p className="text-sm text-slate-500">No collections available. Create some in the dashboard sidebar!</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map((tagId) => {
                    const tag = tags.find(t => t.id === tagId);
                    return tag ? (
                      <span key={tagId} className="flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => setSelectedTags(selectedTags.filter(id => id !== tagId))}
                          className="ml-2 text-purple-500 hover:text-purple-700"
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
                        e.preventDefault(); // Prevent form submission
                        handleTagAdd();
                      }
                    }}
                    placeholder="Add new tag or select existing"
                    className="flex-1 p-3 border border-green-200 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleTagAdd}
                    className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 border border-green-200 rounded-lg p-2 bg-green-50 max-h-28 overflow-y-auto custom-scrollbar">
                    {tags.filter(tag => !selectedTags.includes(tag.id)).map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => setSelectedTags([...selectedTags, tag.id])}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                )}
                {tags.length === 0 && (
                  <p className="text-sm text-slate-500">No tags available. Add a new one above!</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFav"
                  checked={isFav}
                  onChange={(e) => setIsFav(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-green-300 rounded"
                />
                <label htmlFor="isFav" className="text-sm font-medium text-slate-700">Mark as Favorite</label>
              </div>

              {error && <p className="text-red-500 text-sm">Error: {error}</p>}

              <motion.button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? "Adding Bookmark..." : "Add Bookmark"}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddBookmarkModal;