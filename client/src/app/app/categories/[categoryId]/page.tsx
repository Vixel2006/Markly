"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { BookOpen, Plus, X, Folder, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


import AddBookmarkModal from "../../../components/dashboard/AddBookmarkModal";
import AddCategoryModal from "../../../components/dashboard/AddCategoryModal";
import AddCollectionModal from "../../../components/dashboard/AddCollectionModal";
import BookmarkCard from "../../../components/dashboard/BookmarkCard";

import {
  BookmarkData,
  FrontendBookmark,
} from "@/types";

const CategoryBookmarksPage = () => {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.categoryId as string;

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



  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddBookmarkModalOpen, setIsAddBookmarkModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] = useState(false);



  const loadCategorySpecificData = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!categoryId) {
      setError("Category ID is missing.");
      setLoading(false);
      return;
    }
    try {
      await loadDashboardData(`http://localhost:8080/api/categories/${categoryId}/bookmarks`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred loading category data.");
    } finally {
      setLoading(false);
    }
  }, [categoryId, loadDashboardData]);

  useEffect(() => {
    if (!dashboardLoading && !dashboardError) {
      loadCategorySpecificData();
    }
  }, [dashboardLoading, dashboardError, loadCategorySpecificData]);

  const handleAddBookmark = useCallback(
    async (bookmarkData: BookmarkData) => {
      try {
        await contextAddBookmark(bookmarkData);
        setIsAddBookmarkModalOpen(false);
        await loadCategorySpecificData(); // Re-fetch category specific data
      } catch (err: any) {
        console.error("Error adding bookmark in page:", err);
      }
    },
    [contextAddBookmark, loadCategorySpecificData]
  );

  const handleAddCategory = useCallback(
    async (name: string, emoji: string) => {
      try {
        await contextAddCategory(name, emoji);
        setIsAddCategoryModalOpen(false);
        await loadCategorySpecificData();
      } catch (err: any) {
        console.error("Error adding category in page:", err);
      }
    },
    [contextAddCategory, loadCategorySpecificData]
  );

  const handleAddCollection = useCallback(
    async (name: string) => {
      try {
        await contextAddCollection(name);
        setIsAddCollectionModalOpen(false);
        await loadCategorySpecificData();
      } catch (err: any) {
        console.error("Error adding collection in page:", err);
      }
    },
    [contextAddCollection, loadCategorySpecificData]
  );

  const filteredBookmarks = useMemo(() => {
    let filtered = userBookmarks;

    if (searchQuery) {
      filtered = filtered.filter(bookmark =>
        bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCollectionId) {
      filtered = filtered.filter(bookmark =>
        bookmark.collections.some(col => col.id === selectedCollectionId)
      );
    }

    if (selectedTagId) {
      filtered = filtered.filter(bookmark =>
        bookmark.tags.some(tag => tag.id === selectedTagId)
      );
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [userBookmarks, searchQuery, selectedCollectionId, selectedTagId]);

  const categoryTitle = useMemo(() => {
    const currentCategory = categoriesForDisplay.find(cat => cat.id === categoryId);
    return currentCategory ? currentCategory.name : "Unknown Category";
  }, [categoriesForDisplay, categoryId]);



  if (loading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 text-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold text-slate-700"
        >
          Loading your Markly knowledge base...
        </motion.div>
      </div>
    );
  }

  if (error || dashboardError) {
    return (
      <div className="min-h-screen bg-red-50 text-red-700 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xl font-bold mb-4">Error Loading Dashboard</p>
          <p className="text-center mb-4">{error || dashboardError}</p>
          <button
            onClick={() => { loadDashboardData(); loadCategorySpecificData(); }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors mr-2"
          >
            Try Again
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/auth");
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Re-login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex relative">


      {/* Main Content Area */}
      <div
        className={`flex-1 p-6 transition-all duration-300 custom-scrollbar`}
      >


        {/* All Bookmarks View */}
        {activePanel === "bookmarks" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredBookmarks.length > 0 ? (
              filteredBookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-600 py-10">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-semibold mb-2">No bookmarks found</p>
                <p>Looks like you haven't added any bookmarks yet, or your filters are too strict.</p>
                <button
                  onClick={() => setIsAddBookmarkModalOpen(true)}
                  className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all"
                >
                  Add Your First Bookmark
                </button>
              </div>
            )}
          </motion.div>
        )}

      </div>

      {/* Modals - AnimatePresence ensures smooth unmounting */}
      <AnimatePresence>
        {isAddBookmarkModalOpen && (
          <AddBookmarkModal
            isOpen={isAddBookmarkModalOpen}
            onClose={() => setIsAddBookmarkModalOpen(false)}
            onAddBookmark={({ url, title, summary, tags, collections, category }) =>
              handleAddBookmark({ url, title, summary, tag_ids: tags, collection_ids: collections, category_id: category })}
            isLoading={addBookmarkLoading}
            error={addBookmarkError}
            categories={categoriesForDisplay || []}
            collections={collectionsForDisplay || []}
            tags={allTags || []}
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

export default CategoryBookmarksPage;