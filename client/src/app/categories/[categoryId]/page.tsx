'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BookmarkCard from '@/app/components/dashboard/BookmarkCard';
import { Bookmark, Category as BackendCategory, Collection as BackendCollection, Tag as BackendTag } from '@/app/types';
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

interface BookmarkCardData {
  id: string;
  title: string;
  url: string;
  summary: string;
  categories?: { id: string; name: string; emoji?: string }[];
  collections: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  isFav: boolean;
  createdAt: string;
}

export default function CategoryBookmarksPage() {
  const { categoryId } = useParams();
  const [bookmarks, setBookmarks] = useState<BookmarkCardData[]>([]);
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [collections, setCollections] = useState<BackendCollection[]>([]);
  const [tags, setTags] = useState<BackendTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async <T,>(url: string): Promise<T | null> => {
    const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
    if (!token) {
      setError("Authentication token missing.");
      return null;
    }
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      if (!categoryId) {
        setLoading(false);
        return;
      }

      try {
        const [fetchedBookmarks, fetchedCategories, fetchedCollections, fetchedTags] = await Promise.all([
          fetchData<Bookmark[]>(`http://localhost:8080/api/bookmarks?category=${categoryId}`),
          fetchData<BackendCategory[]>(`http://localhost:8080/api/categories`),
          fetchData<BackendCollection[]>(`http://localhost:8080/api/collections`),
          fetchData<BackendTag[]>(`http://localhost:8080/api/tags`),
        ]);

        if (fetchedBookmarks && fetchedCategories && fetchedCollections && fetchedTags) {
          setCategories(fetchedCategories);
          setCollections(fetchedCollections);
          setTags(fetchedTags);

          const mappedBookmarks: BookmarkCardData[] = fetchedBookmarks.map(bm => {
            const categoryName = fetchedCategories.find(cat => cat.ID === bm.CategoryID)?.Name || "Unknown Category";
            const categoryEmoji = fetchedCategories.find(cat => cat.ID === bm.CategoryID)?.Emoji || undefined;

            const hydratedCollections = (bm.CollectionsID || [])
              .map((colId) => fetchedCollections.find((col) => col.ID === colId))
              .filter((col): col is BackendCollection => col !== undefined)
              .map(col => ({ id: col.ID, name: col.Name }));
            
            const hydratedTags = (bm.TagsID || [])
              .map((tagId) => fetchedTags.find((tag) => tag.ID === tagId))
              .filter((tag): tag is BackendTag => tag !== undefined)
              .map(tag => ({ id: tag.ID, name: tag.Name }));

            return {
              id: bm.ID,
              title: bm.Title,
              url: bm.URL,
              summary: bm.Summary,
              categories: bm.CategoryID ? [{ id: bm.CategoryID, name: categoryName, emoji: categoryEmoji }] : [],
              collections: hydratedCollections,
              tags: hydratedTags,
              isFav: bm.IsFav,
              createdAt: bm.CreatedAt,
            };
          });
          setBookmarks(mappedBookmarks);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [categoryId]);

  const handleToggleFavorite = (bookmarkId: string) => {
    console.log(`Toggle favorite for bookmark: ${bookmarkId}`);
    // Implement actual favorite toggling logic here
  };

  const categoryTitle = categories.find(cat => cat.ID === categoryId)?.Name || "";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold text-slate-700"
        >
          Loading bookmarks...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 text-red-700 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xl font-bold mb-4">Error Loading Bookmarks</p>
          <p className="text-center mb-4">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex relative">
      {/* This page is designed to be rendered within the main app layout that provides the sidebar */}
      <div className={`flex-1 p-6 transition-all duration-300 ml-64 custom-scrollbar`}>
        <h1 className="text-2xl font-bold mb-4">Bookmarks in Category: {categoryTitle}</h1>
        {bookmarks.length === 0 ? (
          <div className="col-span-full text-center text-slate-600 py-16">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-xl font-semibold mb-2">No bookmarks found for this category.</p>
            <p className="mb-4">Try adding some bookmarks to this category!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarks.map((bookmark) => (
              <BookmarkCard key={bookmark.id} bookmark={bookmark} onToggleFavorite={handleToggleFavorite} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
