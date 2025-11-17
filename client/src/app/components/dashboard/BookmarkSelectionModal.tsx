import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import { BackendBookmark } from "@/types";

interface BookmarkSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BackendBookmark[];
  onSelectBookmarks: (selectedIds: string[]) => void;
  initialSelectedBookmarkIds: string[];
}

const BookmarkSelectionModal: React.FC<BookmarkSelectionModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  onSelectBookmarks,
  initialSelectedBookmarkIds,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedBookmarkIds);

  useEffect(() => {
    setSelectedIds(initialSelectedBookmarkIds);
  }, [initialSelectedBookmarkIds]);

  const filteredBookmarks = bookmarks.filter((bookmark) =>
    bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bookmark.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleBookmark = (bookmarkId: string) => {
    setSelectedIds((prev) =>
      prev.includes(bookmarkId)
        ? prev.filter((id) => id !== bookmarkId)
        : [...prev, bookmarkId]
    );
  };

  const handleApplySelection = () => {
    onSelectBookmarks(selectedIds);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Select Bookmarks</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search bookmarks by title or URL..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-md p-2 custom-scrollbar">
                {filteredBookmarks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No bookmarks found.</p>
                ) : (
                  filteredBookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className={`flex items-center justify-between p-3 rounded-md cursor-pointer mb-1
                        ${selectedIds.includes(bookmark.id) ? "bg-purple-100 border-purple-300" : "hover:bg-gray-50"}`}
                      onClick={() => handleToggleBookmark(bookmark.id)}
                    >
                      <div>
                        <p className="font-medium text-gray-800">{bookmark.title}</p>
                        <p className="text-sm text-gray-500 truncate">{bookmark.url}</p>
                      </div>
                      {selectedIds.includes(bookmark.id) && (
                        <span className="text-purple-600 font-semibold">Selected</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 border-t flex justify-end">
              <button
                onClick={handleApplySelection}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                Apply Selection ({selectedIds.length})
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookmarkSelectionModal;