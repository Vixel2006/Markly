"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, X, Folder, Star, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // AnimatePresence added for modals


import AddBookmarkModal from "../../../components/dashboard/AddBookmarkModal"; // Adjusted path
import AddCategoryModal from "../../../components/dashboard/AddCategoryModal"; // Adjusted path
import AddCollectionModal from "../../../components/dashboard/AddCollectionModal"; // Adjusted path
import BookmarkCard from "../../../components/dashboard/BookmarkCard"; // Adjusted path

import { fetchData } from "@/lib/api";
interface Category {
  id: string;
  name: string;
  emoji?: string;
}

interface CategoryForDisplay extends Category {
  count: number;
  icon: string;
  color: string;
}

interface Collection {
  id: string;
  name: string;
}

interface CollectionForDisplay extends Collection {
  count: number;
}

interface Tag {
  id: string;
  name: string;
  weeklyCount?: number; // Optional, as not all tags might have this
  prevCount?: number; // Optional
  createdAt?: string; // Optional
}

// Bookmark interface as received from the backend API
interface BackendBookmark {
  id: string;
  url: string;
  title: string;
  summary: string;
  tags: string[]; // Array of tag IDs
  collections: string[]; // Array of collection IDs
  category: string | null; // Single category ID or null
  created_at: string; // Backend uses snake_case for timestamp
  user_id: string; // Backend uses snake_case for user ID
  is_fav: boolean; // Backend uses snake_case for is_fav
}

// Bookmark interface for frontend display (as expected by BookmarkCard)
interface FrontendBookmark {
  id: string;
  url: string;
  title: string;
  summary: string;
  tags: Tag[];
  collections: Collection[];
  categories: Category[]; // Array of full category objects for display (can be empty or contain one)
  createdAt: string; // Consistent camelCase for frontend display
  isFav: boolean; // Consistent camelCase for frontend display
}

// BookmarkData interface for sending data to the backend API
interface BookmarkData {
  url: string;
  title: string;
  summary: string;
  tag_ids: string[]; // Backend expects snake_case IDs
  collection_ids: string[]; // Backend expects snake_case IDs
  category_id?: string; // Optional single category ID, backend expects snake_case
}

const MarklyDashboard = () => {
  const router = useRouter();



  const [userBookmarks, setUserBookmarks] = useState<FrontendBookmark[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);



  const [isAddBookmarkModalOpen, setIsAddBookmarkModalOpen] = useState(false);
  const [addBookmarkLoading, setAddBookmarkLoading] = useState(false);
  const [addBookmarkError, setAddBookmarkError] = useState<string | null>(null);

  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [addCategoryLoading, setAddCategoryLoading] = useState(false);
  const [addCategoryError, setAddCategoryError] = useState<string | null>(null);

  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] = useState(false);
  const [addCollectionLoading, setAddCollectionLoading] = useState(false);
  const [addCollectionError, setAddCollectionError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState("dashboard");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleClearFilters = useCallback(() => {
    setSelectedCategoryId(null);
    setSelectedCollectionId(null);
    setSelectedTagId(null);
    setSearchQuery("");
    router.replace('/app/bookmarks/all');
  }, [router]);

  const isFilterActive = useMemo(() => {
    return (
      searchQuery !== "" ||
      selectedCategoryId !== null ||
      selectedCollectionId !== null ||
      selectedTagId !== null
    );
  }, [searchQuery, selectedCategoryId, selectedCollectionId, selectedTagId]);


  // Adopted handleAddNewTag from the second code block
  const handleAddNewTag = useCallback(async (tagName: string): Promise<Tag | null> => {
    const existingTag = tags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase());
    if (existingTag) {
      return existingTag;
    }

    try {
      const response = await fetchData<Tag>(`http://localhost:8080/api/tags`, "POST", { name: tagName });
      if (response) {
        setTags((prevTags) => [...prevTags, response]);
        return response;
      }
    } catch (err: any) {
      console.error("Error adding new tag:", err);
      setError(err.message || "Failed to add tag."); // Use main error state for general errors
    }
    return null;
  }, [fetchData, tags]);

  // Adopted loadDashboardData from the second code block, ensures full data hydration
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        fetchedCategories,
        fetchedCollections,
        fetchedTags,
        backendBookmarks,
      ] = await Promise.all([
        fetchData<Category[]>(`http://localhost:8080/api/categories`),
        fetchData<Collection[]>(`http://localhost:8080/api/collections`),
        fetchData<Tag[]>(`http://localhost:8080/api/tags/user`),
        fetchData<BackendBookmark[]>(`http://localhost:8080/api/bookmarks`),
      ]);

      // Ensure we have arrays even if API returns null
      const actualCategories = fetchedCategories || [];
      const actualCollections = fetchedCollections || [];
      const actualTags = fetchedTags || [];
      const actualBookmarks = backendBookmarks || [];

      // Set basic data first
      setCategories(actualCategories);
      setCollections(actualCollections);
      setTags(actualTags);

      // Hydrate bookmarks with full objects for frontend display
      const hydratedBookmarks: FrontendBookmark[] = actualBookmarks.map((bm) => {
        const hydratedTags = (bm.tags || [])
          .map((tagId) => actualTags.find((t) => t.id === tagId))
          .filter((tag): tag is Tag => tag !== undefined);

        const hydratedCollections = (bm.collections || [])
          .map((colId) => actualCollections.find((c) => c.id === colId))
          .filter((col): col is Collection => col !== undefined);

        const hydratedCategories = bm.category
          ? actualCategories.filter((cat) => cat.id === bm.category)
          : []; // A bookmark can have one category, but frontend expects array

        return {
          id: bm.id,
          url: bm.url,
          title: bm.title,
          summary: bm.summary,
          tags: hydratedTags,
          collections: hydratedCollections,
          categories: hydratedCategories,
          createdAt: bm.created_at,
          isFav: bm.is_fav,
        };
      });

      setUserBookmarks(hydratedBookmarks);
    } catch (err: any) {
      setError(
        err.message || "An unexpected error occurred loading dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Adopted handleToggleFavorite from the second code block
  const handleToggleFavorite = useCallback(
    async (bookmarkId: string) => {
      const bookmarkToToggle = userBookmarks.find((bm) => bm.id === bookmarkId);
      if (!bookmarkToToggle) {
        console.warn(`Bookmark with ID ${bookmarkId} not found.`);
        return;
      }

      const newFavStatus = !bookmarkToToggle.isFav;

      try {
        const updatedBm = await fetchData<BackendBookmark>(
          `http://localhost:8080/api/bookmarks/${bookmarkId}`,
          "PUT",
          { is_fav: newFavStatus }
        );
        if (updatedBm) {
          setUserBookmarks((prev) =>
            prev.map((bm) =>
              bm.id === bookmarkId ? { ...bm, isFav: newFavStatus } : bm
            )
          );
        } else {
          console.warn("Backend update returned null or unexpected response.");
        }
      } catch (err: any) {
        console.error("Failed to toggle favorite status:", err);
        setError(err.message || "Failed to toggle favorite status.");
      }
    },
    [userBookmarks, fetchData]
  );

  // Adopted handleAddBookmark from the second code block
  const handleAddBookmark = useCallback(
    async (bookmarkData: BookmarkData) => {
      setAddBookmarkLoading(true);
      setAddBookmarkError(null);
      try {
        const newBookmark = await fetchData<BackendBookmark>(
          "http://localhost:8080/api/bookmarks",
          "POST",
          {
            url: bookmarkData.url,
            title: bookmarkData.title,
            summary: bookmarkData.summary,
            tag_ids: bookmarkData.tag_ids,
            collection_ids: bookmarkData.collection_ids,
            category_id: bookmarkData.category_id,
          }
        );
        if (newBookmark) {
          setIsAddBookmarkModalOpen(false);
          await loadDashboardData(); // Re-fetch all data to ensure consistency and counts are updated
        }
      } catch (err: any) {
        setAddBookmarkError(err.message || "Failed to add bookmark.");
      } finally {
        setAddBookmarkLoading(false);
      }
    },
    [fetchData, loadDashboardData]
  );

  // Adopted handleAddCategory from the second code block
  const handleAddCategory = useCallback(
    async (name: string, emoji: string) => {
      setAddCategoryLoading(true);
      setAddCategoryError(null);
      try {
        const newCategory = await fetchData<Category>(
          "http://localhost:8080/api/categories",
          "POST",
          { name, emoji }
        );
        if (newCategory) {
          setIsAddCategoryModalOpen(false);
          await loadDashboardData(); // Re-fetch to get updated counts and ensure consistency
        }
      } catch (err: any) {
        setAddCategoryError(err.message || "Failed to add category.");
      } finally {
        setAddCategoryLoading(false);
      }
    },
    [fetchData, loadDashboardData]
  );

  // Adopted handleAddCollection from the second code block
  const handleAddCollection = useCallback(
    async (name: string) => {
      setAddCollectionLoading(true);
      setAddCollectionError(null);
      try {
        const newCollection = await fetchData<Collection>(
          "http://localhost:8080/api/collections",
          "POST",
          { name }
        );
        if (newCollection) {
          setIsAddCollectionModalOpen(false);
          await loadDashboardData(); // Re-fetch to get updated counts and ensure consistency
        }
      } catch (err: any) {
        setAddCollectionError(err.message || "Failed to add collection.");
      } finally {
        setAddCollectionLoading(false);
      }
    },
    [fetchData, loadDashboardData]
  );

  // Helper for category colors from the second code block
  const getDefaultCategoryColor = (categoryName: string): string => {
    switch (categoryName.toLowerCase()) {
      case "development":
        return "bg-blue-500";
      case "design":
        return "bg-purple-500";
      case "productivity":
        return "bg-green-500";
      case "marketing":
        return "bg-red-500";
      case "finance":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  // Derived state for categories to be displayed in Sidebar, matching the second code block
  const categoriesForDisplay: CategoryForDisplay[] = useMemo(() => {
    return (categories || []).map((cat) => {
      const count = (userBookmarks || []).filter(
        (bm) => bm.categories?.some((c) => c.id === cat.id)
      ).length;
      const displayIcon = cat.emoji || "📚";
      const assignedColor = getDefaultCategoryColor(cat.name);

      return {
        id: cat.id,
        name: cat.name,
        emoji: cat.emoji,
        count: count,
        icon: displayIcon,
        color: assignedColor,
      };
    });
  }, [categories, userBookmarks]);

  // Derived state for collections to be displayed in Sidebar, matching the second code block
  const collectionsForDisplay: CollectionForDisplay[] = useMemo(() => {
    return (collections || []).map((col) => ({
      ...col,
      count: (userBookmarks || []).filter((bm) =>
        bm && bm.collections?.some((c) => c.id === col.id)
      ).length,
    }));
  }, [collections, userBookmarks]);


  // Filtering logic for the "All Bookmarks" view (adapted from the first code block)
  const filteredBookmarks = useMemo(() => {
    let filtered = userBookmarks;

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
        bookmark.categories.some(cat => cat.id === selectedCategoryId)
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

    // Sort by creation date, newest first
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [userBookmarks, searchQuery, selectedCategoryId, selectedCollectionId, selectedTagId]);




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
              <Search className="w-5 h-5 text-indigo-600" /> Search & Filter All Bookmarks
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search all bookmarks by title, URL, tags..."
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

          {/* All Bookmarks Grid */}
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" /> All Bookmarks ({filteredBookmarks.length})
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
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                {isFilterActive ? (
                  <>
                    <p className="text-xl font-semibold mb-2">No bookmarks match your filters.</p>
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
                    <p className="text-xl font-semibold mb-2">Your bookmark list is empty!</p>
                    <p className="mb-4">Start adding bookmarks to see them here.</p>
                    <button
                      onClick={() => setIsAddBookmarkModalOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all flex items-center mx-auto gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add New Bookmark
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
            onAddBookmark={({ url, title, summary, tags, collections, category }) =>
              handleAddBookmark({ url, title, summary, tag_ids: tags, collection_ids: collections, category_id: category })}
            isLoading={addBookmarkLoading}
            error={addBookmarkError}
            categories={categoriesForDisplay}
            collections={collectionsForDisplay}
            tags={tags}
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

export default MarklyDashboard;
