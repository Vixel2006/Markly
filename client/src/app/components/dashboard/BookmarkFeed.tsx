// src/app/components/dashboard/BookmarkFeed.tsx
"use client";

import React from 'react';
import BookmarkCard from './BookmarkCard'; // New component
import BookmarkListRow from './BookmarkListRow'; // New component
import { ChevronRight } from 'lucide-react'; // For "View All" in empty state

// Re-using interfaces from MarklyDashboard.tsx
interface Category { id: string; name: string; emoji?: string; }
interface Collection { id: string; name: string; }
interface Tag { id: string; name: string; }
interface Bookmark {
  id: string;
  url: string;
  title: string;
  summary: string;
  tags: Tag[];
  collections: Collection[];
  category?: Category;
  datetime: string;
  isFav: boolean;
  thumbnail?: string; // Potential addition
}

interface BookmarkFeedProps {
  bookmarks: Bookmark[];
  onBookmarkSelect: (bookmarkId: string) => void;
  selectedBookmarkId: string | null;
  viewMode: 'card' | 'list';
  onToggleFavorite: (bookmarkId: string) => void;
  // For context display in Feed header
  selectedCategoryId: string | null;
  selectedCollectionId: string | null;
  selectedTagId: string | null;
  searchQuery: string;
  // Pass all categories/collections/tags for display on cards/rows if needed
  allCategories: any[];
  allCollections: any[];
  allTags: any[];
}

const BookmarkFeed: React.FC<BookmarkFeedProps> = ({
  bookmarks,
  onBookmarkSelect,
  selectedBookmarkId,
  viewMode,
  onToggleFavorite,
  selectedCategoryId,
  selectedCollectionId,
  selectedTagId,
  searchQuery,
  allCategories,
  allCollections,
  allTags,
}) => {
  // Determine the current heading based on filters
  const getFeedHeading = () => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (selectedCategoryId) {
      const cat = allCategories.find(c => c.id === selectedCategoryId);
      return `Category: ${cat?.icon} ${cat?.name}`;
    }
    if (selectedCollectionId) {
      const col = allCollections.find(c => c.id === selectedCollectionId);
      return `Collection: ${col?.name}`;
    }
    if (selectedTagId) {
      const tag = allTags.find(t => t.id === selectedTagId);
      return `Tag: ${tag?.name}`;
    }
    // Add logic for 'favorites', 'AI suggested' etc. if they come directly to this feed
    return 'All Bookmarks';
  };

  const currentHeading = getFeedHeading();

  return (
    <div className="mt-8 bg-slate-800 p-6 rounded-xl border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">{currentHeading} ({bookmarks.length})</h3>
        {/* Placeholder for 'View All' if this were a subset, but it's the main feed */}
      </div>

      {bookmarks.length > 0 ? (
        viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onSelect={onBookmarkSelect}
                isSelected={bookmark.id === selectedBookmarkId}
                onToggleFavorite={onToggleFavorite}
                categories={allCategories} // Pass for detailed display in card if needed
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider rounded-tl-lg">
                    Title
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Tags
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {bookmarks.map((bookmark) => (
                  <BookmarkListRow
                    key={bookmark.id}
                    bookmark={bookmark}
                    onSelect={onBookmarkSelect}
                    isSelected={bookmark.id === selectedBookmarkId}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center py-12 text-slate-400">
          <p className="text-lg mb-4">No bookmarks found matching your criteria.</p>
          <p className="text-sm mb-4">Try adjusting your filters or search query.</p>
          {(!selectedCategoryId && !selectedCollectionId && !selectedTagId && !searchQuery) && (
            <p className="text-sm">Start by adding your first bookmark!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BookmarkFeed;
