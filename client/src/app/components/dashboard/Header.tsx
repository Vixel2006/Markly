import React from "react";
import { Search, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddBookmarkClick: () => void;
  totalBookmarksCount: number;
}

const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onAddBookmarkClick,
  totalBookmarksCount,
}) => {
  return (
    <motion.header
      className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between border border-green-100 mb-6"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex-1 flex items-center gap-4">
        <h1 className="text-2xl font-bold text-black hidden md:block">Your Knowledge Vault</h1>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search all bookmarks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-full border border-green-200 bg-green-50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
          />
        </div>
      </div>

      <motion.button
        onClick={onAddBookmarkClick}
        className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 px-5 py-2.5 rounded-full text-white font-medium transition-all transform hover:scale-105 shadow-md flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-5 h-5" />
        <span className="hidden sm:inline">Add Bookmark</span>
      </motion.button>
    </motion.header>
  );
};

export default Header;
