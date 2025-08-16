// components/dashboard/Header.tsx
import React from 'react';
import { Search, Plus } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
      <div>
        <h2 className="text-2xl font-bold mb-1">Your Bookmarks</h2>
        <p className="text-slate-400 text-sm md:text-base">AI-powered bookmark management made simple</p>
      </div>
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="relative flex-1 md:flex-none">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg w-full md:w-80 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
          <Plus className="w-5 h-5" />
          Add Bookmark
        </button>
      </div>
    </div>
  );
};

export default Header;
