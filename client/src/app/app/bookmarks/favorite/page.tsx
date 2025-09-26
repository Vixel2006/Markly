// app/favorites/page.tsx
"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Star,
  Folder,
  Tag as TagIcon,
  BookOpen,
  Search,
  Filter,
  Plus,
  X,
  Menu,
  LayoutDashboard
} from 'lucide-react';

import { useDashboard } from "@/contexts/DashboardContext"; // Import useDashboard



import AddBookmarkModal from '../../../components/dashboard/AddBookmarkModal';
import AddCategoryModal from "../../../components/dashboard/AddCategoryModal";
import AddCollectionModal from "../../../components/dashboard/AddCollectionModal";
import BookmarkCard from '../../../components/dashboard/BookmarkCard';

import {
  BookmarkData,
  FrontendBookmark,
} from "@/types";

const FavoriteBookmarksPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { // Destructure from useDashboard
    userBookmarks,
    categories: categoriesForDisplay,
    collections: collectionsForDisplay,
    tags: allTags,
    loading: dashboardLoading,
    error: dashboardError,
    loadDashboardData,
    handleToggleFavorite,
    handleAddBookmark: contextAddBookmark,
    addBookmarkLoading,
    addBookmarkError,
    handleAddCategory: contextAddCategory,
    addCategoryLoading,
    addCategoryError,
    handleAddCollection: contextAddCollection,
    addCollectionLoading,
    addCollectionError,
    handleAddNewTag,
  } = useDashboard();



  const [isAddBookmarkModalOpen, setIsAddBookmarkModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  const loadFavoriteBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await loadDashboardData("http://localhost:8080/api/bookmarks?isFav=true");
    } catch (err: any) {
      setError(err.message || "Failed to load favorite bookmarks.");
    } finally {
      setLoading(false);
    }
  }, [loadDashboardData]);

  useEffect(() => {
    loadFavoriteBookmarks();
  }, [loadFavoriteBookmarks]);

  const handleClearFilters = useCallback(() => {
    setSelectedCategoryId(null);
    setSelectedCollectionId(null);
    setSelectedTagId(null);
    setSearchQuery("");
    router.replace('/app/favorites');
  }, [router]);

  const handleAddBookmark = useCallback(async (bookmarkData: BookmarkData) => {
    try {
      await contextAddBookmark(bookmarkData);
      setIsAddBookmarkModalOpen(false);
      await loadFavoriteBookmarks(); // Re-load favorite bookmarks after adding
    } catch (err: any) {
      console.error("Error adding bookmark in page:", err);
    }
  }, [contextAddBookmark, loadFavoriteBookmarks]);

  const handleAddCategory = useCallback(async (name: string, emoji: string) => {
    try {
      await contextAddCategory(name, emoji);
      setIsAddCategoryModalOpen(false);
      await loadFavoriteBookmarks();
    } catch (err: any) {
      console.error("Error adding category in page:", err);
    }
  }, [contextAddCategory, loadFavoriteBookmarks]);

  const handleAddCollection = useCallback(async (name: string) => {
    try {
      await contextAddCollection(name);
      setIsAddCollectionModalOpen(false);
      await loadFavoriteBookmarks();
    } catch (err: any) {
      console.error("Error adding collection in page:", err);
    }
  }, [contextAddCollection, loadFavoriteBookmarks]);

  const filteredBookmarks = useMemo(() => {
    let filtered = userBookmarks || [];

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(bookmark =>
        (bookmark.title ?? '').toLowerCase().includes(lowerCaseQuery) ||
        (bookmark.summary ?? '').toLowerCase().includes(lowerCaseQuery) ||
        (bookmark.url ?? '').toLowerCase().includes(lowerCaseQuery) ||
        (bookmark.tags?.some(tag => (tag.name ?? '').toLowerCase().includes(lowerCaseQuery))) ||
        (bookmark.collections?.some(col => (col.name ?? '').toLowerCase().includes(lowerCaseQuery))) ||
        (bookmark.categories?.some(cat => (cat.name ?? '').toLowerCase().includes(lowerCaseQuery)))
      );
    }

    if (selectedCategoryId) {
      filtered = filtered.filter(bookmark =>
        bookmark.categories?.some(cat => cat.id === selectedCategoryId)
      );
    }

    if (selectedCollectionId) {
      filtered = filtered.filter(bookmark =>
        bookmark.collections?.some(col => col.id === selectedCollectionId)
      );
    }

    if (selectedTagId) {
      filtered = filtered.filter(bookmark =>
        bookmark.tags?.some(tag => tag.id === selectedTagId)
      );
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [userBookmarks, searchQuery, selectedCategoryId, selectedCollectionId, selectedTagId]);

  const isFilterActive = useMemo(() => {
    return (
      searchQuery !== "" ||
      selectedCategoryId !== null ||
      selectedCollectionId !== null ||
      selectedTagId !== null
    );
  }, [searchQuery, selectedCategoryId, selectedCollectionId, selectedTagId]);



  if (loading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-slate-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-xl border border-gray-200"
        >
          <Star className="w-12 h-12 text-yellow-500 animate-pulse" />
          <p className="text-xl font-semibold">Loading your favorite bookmarks...</p>
          <p className="text-sm text-gray-500">Please wait a moment.</p>
        </motion.div>
      </div>
    );
  }

  if (error || dashboardError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center text-red-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-xl border border-red-200"
        >
          <X className="w-12 h-12 text-red-500" />
          <p className="text-xl font-semibold">Error Loading Favorites</p>
          <p className="text-sm text-red-600 text-center">{error || dashboardError}</p>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => loadFavoriteBookmarks()}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                router.push("/auth");
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
            >
              Re-login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex relative">
      {/* Main Content Area */}
      <div className={`flex-1 p-6 transition-all duration-300 custom-scrollbar`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Search and Filter Controls */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-600" /> Search & Filter Favorites
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search favorite bookmarks by title, URL, tags..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 text-gray-900 border border-gray-300 focus:ring-2 focus:ring-indigo-300 focus:outline-none shadow-sm placeholder-gray-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Active Filters Display */}
            {isFilterActive && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm mt-4"
              >
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-base">Active Filters:</span>
                  {searchQuery && (
                    <span className="bg-blue-200 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                      Search: "{searchQuery}" <X className="w-3 h-3 ml-1 cursor-pointer hover:text-blue-900" onClick={() => setSearchQuery("")} />
                    </span>
                  )}
                  {selectedCategoryId && (
                    <span className="bg-blue-200 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                      Category: {categoriesForDisplay.find(c => c.id === selectedCategoryId)?.name} <X className="w-3 h-3 ml-1 cursor-pointer hover:text-blue-900" onClick={() => setSelectedCategoryId(null)} />
                    </span>
                  )}
                  {selectedCollectionId && (
                    <span className="bg-blue-200 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                      Collection: {collectionsForDisplay.find(c => c.id === selectedCollectionId)?.name} <X className="w-3 h-3 ml-1 cursor-pointer hover:text-blue-900" onClick={() => setSelectedCollectionId(null)} />
                    </span>
                  )}
                  {selectedTagId && (
                    <span className="bg-blue-200 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                      Tag: {allTags.find(t => t.id === selectedTagId)?.name} <X className="w-3 h-3 ml-1 cursor-pointer hover:text-blue-900" onClick={() => setSelectedTagId(null)} />
                    </span>
                  )}
                </div>
                <button
                  onClick={handleClearFilters}
                  className="flex-shrink-0 ml-0 sm:ml-auto px-3 py-1.5 bg-blue-600 text-white rounded-full text-xs hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-md"
                >
                  <X className="w-3 h-3" /> Clear All
                </button>
              </motion.div>
            )}
          </div>

          {/* Favorite Bookmarks Grid */}
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" /> All Favorites ({filteredBookmarks.length})
          </h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.05 }}
          >
            {filteredBookmarks.length > 0 ? (
              filteredBookmarks.map((bookmark) => (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <BookmarkCard
                    bookmark={bookmark}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-16 bg-white rounded-2xl shadow-lg border border-gray-200">
                <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                {isFilterActive ? (
                  <>
                    <p className="text-xl font-semibold mb-2">No favorite bookmarks match your filters.</p>
                    <p className="mb-4">Try adjusting your search or clearing some filters.</p>
                    <button
                      onClick={handleClearFilters}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all flex items-center mx-auto gap-2"
                    >
                      <X className="w-4 h-4" /> Clear All Filters
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xl font-semibold mb-2">Your favorite bookmarks list is empty!</p>
                    <p className="mb-4">Start marking bookmarks with a <Star className="inline-block w-5 h-5 text-yellow-400 align-text-bottom" /> to see them here.</p>
                    <button
                      onClick={() => router.push("/app/bookmarks/all")}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all flex items-center mx-auto gap-2"
                    >
                      <BookOpen className="w-4 h-4" /> View All Bookmarks
                    </button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAddBookmarkModalOpen && (
          <AddBookmarkModal
            isOpen={isAddBookmarkModalOpen}
            onClose={() => setIsAddBookmarkModalOpen(false)}
            onAddBookmark={handleAddBookmark}
            isLoading={addBookmarkLoading}
            error={addBookmarkError}
            categories={categoriesForDisplay}
            collections={collectionsForDisplay}
            tags={allTags}
            onAddNewTag={handleAddNewTag}
          />
        )}
        {isAddCategoryModalOpen && (
          <AddCategoryModal
            isOpen={isAddCategoryModalOpen}
            onClose={() => setIsAddCategoryModalOpen(false)}
            onAddCategory={handleAddCategory}
            isLoading={addCategoryLoading}
            error={addCategoryError}
          />
        )}
        {isAddCollectionModalOpen && (
          <AddCollectionModal
            isOpen={isAddCollectionModalOpen}
            onClose={() => setIsAddCollectionModalOpen(false)}
            onAddCollection={handleAddCollection}
            isLoading={addCollectionLoading}
            error={addCollectionError}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FavoriteBookmarksPage;
