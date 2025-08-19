import React from 'react';
import { Search, Plus, List, Grid } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddBookmarkClick: () => void;
  totalBookmarksCount: number;
  viewMode: 'card' | 'list';
  onViewModeChange: (mode: 'card' | 'list') => void;
}

const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onAddBookmarkClick,
  totalBookmarksCount,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="sticky top-0 z-20 bg-gradient-to-br from-green-50 via-green-100 to-purple-50 pt-6 pb-4 -mx-6 px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search your bookmarks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-green-200 rounded-full
                       text-black placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-full bg-white border border-green-200 p-1 shadow-sm">
            <button
              onClick={() => onViewModeChange('card')}
              className={`p-2 rounded-full transition-all ${
                viewMode === 'card' ? 'bg-green-100 text-green-700' : 'text-slate-500 hover:text-black'
              }`}
              aria-label="Card View"
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-full transition-all ${
                viewMode === 'list' ? 'bg-green-100 text-green-700' : 'text-slate-500 hover:text-black'
              }`}
              aria-label="List View"
            >
              <List size={20} />
            </button>
          </div>

          <button
            onClick={onAddBookmarkClick}
            className="inline-flex items-center rounded-full bg-gradient-to-r from-pink-500 to-purple-500
                       px-5 py-2.5 text-white font-medium transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} className="mr-2" /> Add Bookmark
          </button>
        </div>
      </div>

      <div className="mt-4 text-sm text-slate-600 text-center md:text-left">
        You have <span className="font-semibold text-black">{totalBookmarksCount}</span> bookmarks.
      </div>
    </div>
  );
};

export default Header;

