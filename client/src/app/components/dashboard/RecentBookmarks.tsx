// components/dashboard/RecentBookmarks.tsx
import React from 'react';
import { Star } from 'lucide-react';

interface Bookmark {
  id: number;
  title: string;
  url: string;
  favicon: string;
  category: string;
  color: string;
  summary: string;
}

interface RecentBookmarksProps {
  bookmarks: Bookmark[];
}

const RecentBookmarks: React.FC<RecentBookmarksProps> = ({ bookmarks }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Recent Bookmarks</h3>
        <button className="text-blue-400 hover:text-blue-300 text-sm">View All</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookmarks.map((bookmark) => (
          <div key={bookmark.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer group">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-lg">
                {bookmark.favicon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate group-hover:text-blue-400 transition-colors">{bookmark.title}</h4>
                <p className="text-xs text-slate-400 truncate">{bookmark.url}</p>
              </div>
              <Star className="w-4 h-4 text-slate-500 hover:text-yellow-400 cursor-pointer" />
            </div>
            <p className="text-sm text-slate-300 mb-3 line-clamp-2">{bookmark.summary}</p>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs ${bookmark.color} bg-opacity-20`}>
                {bookmark.category}
              </span>
              <span className="text-xs text-slate-500">2h ago</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentBookmarks;
