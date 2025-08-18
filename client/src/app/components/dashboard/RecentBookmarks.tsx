"use client";

import React from 'react';
import Link from "next/link";
import { Star, Globe, Clock } from 'lucide-react';

interface PopulatedCategory {
  id: string;
  name: string;
  emoji?: string;
  description?: string;
}

interface PopulatedTag {
  id: string;
  name: string;
  weeklyCount: number;
}

interface PopulatedCollection {
  id: string;
  name: string;
}

interface PopulatedBookmark {
  id: string;
  url: string;
  title: string;
  summary: string;
  tags: PopulatedTag[];
  collections: PopulatedCollection[];
  category?: PopulatedCategory;
  datetime: string;
  isFav: boolean;
}

interface RecentBookmarksProps {
  bookmarks?: PopulatedBookmark[];
}

const RecentBookmarks: React.FC<RecentBookmarksProps> = ({ bookmarks }) => {
  const getFavicon = (bookmarkUrl: string, bookmarkTitle: string): string | undefined => {
    try {
      const url = new URL(bookmarkUrl);
      return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
    } catch (e) {
      const lowerTitle = bookmarkTitle.toLowerCase();
      if (lowerTitle.includes("google")) return "https://www.google.com/favicon.ico";
      if (lowerTitle.includes("youtube")) return "https://www.youtube.com/favicon.ico";
      if (lowerTitle.includes("github")) return "https://github.com/favicon.ico";
      if (lowerTitle.includes("react")) return "https://react.dev/favicon.ico";
      if (lowerTitle.includes("next.js")) return "https://nextjs.org/favicon.ico";
      return undefined;
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Recent Bookmarks</h3>
        <button className="text-blue-400 hover:text-blue-300 text-sm">View All</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookmarks && bookmarks.length > 0 ? (
          bookmarks.map((bookmark) => (
            <Link
              key={bookmark.id}
              href={`/app/bookmarks/${bookmark.id}`}
              className="group block bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {getFavicon(bookmark.url, bookmark.title) ? (
                    <img src={getFavicon(bookmark.url, bookmark.title)} alt="Favicon" className="w-6 h-6 object-contain" />
                  ) : (
                    <Globe className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                    {bookmark.title}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">{bookmark.url}</p>
                </div>
                <Star className={`w-4 h-4 cursor-pointer ${bookmark.isFav ? 'text-yellow-400' : 'text-slate-500 hover:text-yellow-400'}`} />
              </div>
              <p className="text-sm text-slate-300 mb-3 line-clamp-2">
                {bookmark.summary || 'No summary provided.'}
              </p>
              <div className="flex items-center justify-between">
                {bookmark.category && bookmark.category.name && (
                  <span className={`px-2 py-1 rounded-full text-xs text-blue-300 bg-blue-500 bg-opacity-20`}>
                    {bookmark.category.emoji ? `${bookmark.category.emoji} ` : ''}{bookmark.category.name}
                  </span>
                )}
                {bookmark.tags && bookmark.tags.length > 0 && (
                   <div className="flex flex-wrap gap-1">
                     {bookmark.tags.slice(0, 2).map(tag => (
                       <span key={tag.id} className="px-2 py-1 rounded-full text-xs text-slate-300 bg-slate-700">
                         {tag.name}
                       </span>
                     ))}
                     {bookmark.tags.length > 2 && (
                       <span className="px-2 py-1 rounded-full text-xs text-slate-300 bg-slate-700">
                         +{bookmark.tags.length - 2}
                       </span>
                     )}
                   </div>
                )}
                {bookmark.datetime && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(bookmark.datetime).toLocaleDateString()}
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
