// components/dashboard/Header.tsx
"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Menu, X } from 'lucide-react'; // Removed Search as requested

interface HeaderProps {
  onAddBookmarkClick: () => void;
  isSidebarExpanded: boolean; // Prop to control sidebar toggle icon
  onSidebarToggle: () => void; // Prop to handle sidebar toggle action
  currentPageTitle: string; // Prop for dynamic page titles
}

const Header: React.FC<HeaderProps> = ({
  onAddBookmarkClick,
  isSidebarExpanded,
  onSidebarToggle,
  currentPageTitle,
}) => {
  return (
    <div // Changed to div from motion.header to match usage in page components
      className="fixed top-0 right-0 z-20 bg-white bg-opacity-95 backdrop-blur-sm p-4 w-full flex items-center justify-between shadow-sm border-b border-indigo-100"
      // Styles for fixed position and dynamic margin/width based on sidebar state
      style={{ marginLeft: isSidebarExpanded ? '16rem' : '4rem', width: `calc(100% - ${isSidebarExpanded ? '16rem' : '4rem'})` }}
    >
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle Button */}
        <button
          onClick={onSidebarToggle}
          className="p-2 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
          aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        {/* Current Page Title */}
        <h1 className="text-xl font-semibold text-gray-900">{currentPageTitle}</h1>
      </div>

      {/* Add Bookmark Button */}
      <motion.button
        onClick={onAddBookmarkClick}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg shadow-md hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 text-sm font-medium"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Plus className="w-4 h-4" /> New Bookmark
      </motion.button>
    </div>
  );
};

export default Header;
