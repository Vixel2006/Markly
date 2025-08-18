// components/dashboard/RecentBookmarks.tsx
import React from 'react';
import Link from "next/link"; // Import Link from next/link
import { Star, Globe, Clock } from 'lucide-react'; // Added Globe and Clock from previous examples

interface Bookmark {
  id: string; // Changed from number to string to match ObjectID
  title: string;
  url: string;
  favicon?: string; // Made optional as it's not consistently used in the backend model
  category?: string; // Made optional as per backend model and detail page
  color?: string; // Made optional, might be derived from category
  description?: string; // Added description based on your backend model
  created_at?: string; // Added created_at based on your backend model
  summary?: string; // Kept summary, assuming it's a derived/front-end field
}

interface RecentBookmarksProps {
  bookmarks?: Bookmark[];
}

const RecentBookmarks: React.FC<RecentBookmarksProps> = ({ bookmarks }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700"> {/* Wrapped in a container div for consistent padding */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Recent Bookmarks</h3>
        {/* You might want to make this Link or a button triggering navigation */}
        <button className="text-blue-400 hover:text-blue-300 text-sm">View All</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookmarks && bookmarks.length > 0 ? (
          bookmarks.map((bookmark) => (
            <Link // Wrap the entire card with Next.js Link
              key={bookmark.id}
              href={`/app/bookmarks/${bookmark.id}`} // Dynamic route construction
              // Apply hover styles and general styling to the Link itself
              className="group block bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3 mb-3">
                {/* Fallback for favicon or use a default icon if favicon is not available */}
                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                  {bookmark.favicon ? (
                    <img src={bookmark.favicon} alt="Favicon" className="w-6 h-6 rounded" />
                  ) : (
                    <Globe className="w-5 h-5 text-slate-400" /> // Default icon
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                    {bookmark.title}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">{bookmark.url}</p>
                </div>
                {/* Star icon can remain interactive, it's not part of the navigation */}
                <Star className="w-4 h-4 text-slate-500 hover:text-yellow-400 cursor-pointer" />
              </div>
              <p className="text-sm text-slate-300 mb-3 line-clamp-2">
                {bookmark.summary || bookmark.description || 'No description provided.'}
              </p>
              <div className="flex items-center justify-between">
                {bookmark.category && (
                  <span className={`px-2 py-1 rounded-full text-xs text-blue-300 bg-blue-500 bg-opacity-20`}>
                    {bookmark.category}
                  </span>
                )}
                {bookmark.created_at && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(bookmark.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Link>
          ))
        ) : (
          <p className="text-slate-400 text-center col-span-full py-4">No recent bookmarks to display.</p>
        )}
      </div>
    </div>
  );
};

export default RecentBookmarks;
