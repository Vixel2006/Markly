// app/app/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  X,
  Folder,
  Star,
  Tag as TagIcon, // Renamed to avoid conflict with TagData interface
  TrendingUp,
  LayoutDashboard,
  Search,
  Menu, // For sidebar toggle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Adjusted paths for components based on their location relative to this file
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import AddBookmarkModal from "../components/dashboard/AddBookmarkModal";
import AddCategoryModal from "../components/dashboard/AddCategoryModal";
import AddCollectionModal from "../components/dashboard/AddCollectionModal";
import BookmarkCard from "../components/dashboard/BookmarkCard"; // Used for Recent Bookmarks

// --- Interfaces (consistent with previous definitions) ---
interface Category {
  id: string;
  name: string;
  emoji?: string;
  color?: string;
}

interface Collection {
  id: string;
  name: string;
}

interface TagData {
  id: string;
  name: string;
  weeklyCount?: number;
  prevCount?: number;
  createdAt?: string;
}

interface BackendBookmark {
  id: string;
  url: string;
  title: string;
  summary: string;
  tags: string[];
  collections: string[];
  category: string | null;
  created_at: string;
  user_id: string;
  is_fav: boolean;
}

interface FrontendBookmark {
  id: string;
  title: string;
  url: string;
  summary: string;
  categories?: Category[];
  collections: Collection[];
  tags: TagData[];
  isFav: boolean;
  createdAt: string;
}

interface BookmarkDataForAdd {
  url: string;
  title: string;
  summary: string;
  tags: string[];
  collections: string[];
  category_id?: string;
  is_fav: boolean;
}

interface CategoryForDisplay extends Category {
  count: number;
  icon: string;
  color: string;
}

interface CollectionForDisplay extends Collection {
  count: number;
}

const MarklyDashboard = () => {
  const router = useRouter();

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [activePanel, setActivePanel] = useState<string>("overview"); // Default to overview

  const [overviewSearchInput, setOverviewSearchInput] = useState(""); // For quick search on dashboard

  const [userBookmarks, setUserBookmarks] = useState<FrontendBookmark[]>([]);
  const [categories, setCategories] = useState<CategoryForDisplay[]>([]);
  const [collections, setCollections] = useState<CollectionForDisplay[]>([]);
  const [tags, setTags] = useState<TagData[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddBookmarkModalOpen, setIsAddBookmarkModalOpen] = useState(false);
  const [addBookmarkLoading, setAddBookmarkLoading] = useState(false);
  const [addBookmarkError, setAddBookmarkError] = useState<string | null>(null);

  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [addCategoryLoading, setAddCategoryLoading] = useState(false);
  const [addCategoryError, setAddCategoryError] = useState<string | null>(null);

  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] = useState(false);
  const [addCollectionLoading, setAddCollectionLoading] = useState(false);
  const [addCollectionError, setAddCollectionError] = useState<string | null>(null);

  // --- Utility fetchData function (reused) ---
  const fetchData = useCallback(async <T,>(url: string, method: string = "GET", body?: any): Promise<T | null> => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token missing. Please log in.");
      router.push("/auth");
      return null;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/auth");
          throw new Error("Unauthorized. Please log in again.");
        }
        const errorBody = await response.text();
        try {
          const errData = JSON.parse(errorBody);
          throw new Error(errData.message || `API call failed with status ${response.status}`);
        } catch {
          throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
        }
      }

      if (response.status === 204 || response.headers.get("Content-Length") === "0") {
        return null;
      }
      return await response.json();
    } catch (err: any) {
      console.error(`Network or API error fetching from ${url}: `, err);
      throw err;
    }
  }, [router]);

  const getDefaultCategoryColor = (categoryName: string): string => {
    switch (categoryName.toLowerCase()) {
      case "development": return "bg-blue-500";
      case "design": return "bg-purple-500";
      case "productivity": return "bg-green-500";
      case "marketing": return "bg-red-500";
      case "finance": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const handleAddNewTag = useCallback(async (tagName: string): Promise<TagData | null> => {
    const existingTag = tags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase());
    if (existingTag) {
      return existingTag;
    }
    try {
      const newTag = await fetchData<TagData>("http://localhost:8080/api/tags", "POST", { name: tagName });
      if (newTag) {
        setTags((prev) => [...prev, newTag]);
        return newTag;
      }
    } catch (err: any) {
      console.error("Failed to create new tag:", err);
      setError(err.message || "Failed to add tag.");
      return null;
    }
    return null;
  }, [fetchData, tags]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedBackendBookmarksData, fetchedCategoriesData, fetchedCollectionsData, fetchedTagsData] = await Promise.all([
        fetchData<BackendBookmark[]>("http://localhost:8080/api/bookmarks"),
        fetchData<Category[]>(`http://localhost:8080/api/categories`),
        fetchData<Collection[]>(`http://localhost:8080/api/collections`),
        fetchData<TagData[]>(`http://localhost:8080/api/tags/user`), // Use /api/tags/user
      ]);

      const actualCategories = fetchedCategoriesData || [];
      const actualCollections = fetchedCollectionsData || [];
      const actualTags = fetchedTagsData || [];
      const backendBookmarksData = fetchedBackendBookmarksData || [];

      setTags(actualTags);

      const hydratedBookmarks: FrontendBookmark[] = backendBookmarksData.map(bm => {
        const hydratedTags = (bm.tags || [])
          .map(tagId => actualTags.find(t => t.id === tagId))
          .filter((tag): tag is TagData => tag !== undefined);
        
        const hydratedCollections = (bm.collections || [])
          .map(colId => actualCollections.find(c => c.id === colId))
          .filter((col): col is Collection => col !== undefined);
        
        const hydratedCategories = bm.category
          ? actualCategories.filter(cat => cat.id === bm.category)
          : [];
        
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

      const categoriesWithCounts: CategoryForDisplay[] = actualCategories.map(cat => ({
        ...cat,
        count: hydratedBookmarks.filter(bm =>
          bm.categories?.some(c => c.id === cat.id)
        ).length,
        icon: cat.emoji || "📚",
        color: cat.color || getDefaultCategoryColor(cat.name),
      }));
      setCategories(categoriesWithCounts);

      const collectionsWithCounts: CollectionForDisplay[] = actualCollections.map(col => ({
        ...col,
        count: hydratedBookmarks.filter(bm =>
          bm.collections?.some(c => c.id === col.id)
        ).length,
      }));
      setCollections(collectionsWithCounts);

    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleToggleFavorite = useCallback(async (bookmarkId: string) => {
    const currentBookmark = userBookmarks.find(bm => bm.id === bookmarkId);
    if (!currentBookmark) return;

    const newFavStatus = !currentBookmark.isFav;
    try {
      await fetchData<BackendBookmark>(
        `http://localhost:8080/api/bookmarks/${bookmarkId}`,
        "PUT",
        { is_fav: newFavStatus }
      );
      setUserBookmarks(prev => prev.map(bm =>
        bm.id === bookmarkId ? { ...bm, isFav: newFavStatus } : bm
      ));
    } catch (err: any) {
      setError(err.message || "Failed to toggle favorite status.");
    }
  }, [userBookmarks, fetchData]);

  const handleAddBookmark = useCallback(async (bookmarkData: BookmarkDataForAdd) => {
    setAddBookmarkLoading(true);
    setAddBookmarkError(null);
    try {
      await fetchData<BackendBookmark>("http://localhost:8080/api/bookmarks", "POST", {
        url: bookmarkData.url,
        title: bookmarkData.title,
        summary: bookmarkData.summary,
        tags: bookmarkData.tags,
        collections: bookmarkData.collections,
        category: bookmarkData.category_id,
        is_fav: bookmarkData.is_fav,
      });
      setIsAddBookmarkModalOpen(false);
      await loadDashboardData();
    } catch (err: any) {
      setAddBookmarkError(err.message || "Failed to add bookmark.");
    } finally {
      setAddBookmarkLoading(false);
    }
  }, [fetchData, loadDashboardData]);

  const handleAddCategory = useCallback(async (name: string, emoji: string) => {
    setAddCategoryLoading(true);
    setAddCategoryError(null);
    try {
      await fetchData<Category>("http://localhost:8080/api/categories", "POST", { name, emoji });
      setIsAddCategoryModalOpen(false);
      await loadDashboardData();
    } catch (err: any) {
      setAddCategoryError(err.message || "Failed to add category.");
    } finally {
      setAddCategoryLoading(false);
    }
  }, [fetchData, loadDashboardData]);

  const handleAddCollection = useCallback(async (name: string) => {
    setAddCollectionLoading(true);
    setAddCollectionError(null);
    try {
      await fetchData<Collection>("http://localhost:8080/api/collections", "POST", { name });
      setIsAddCollectionModalOpen(false);
      await loadDashboardData();
    } catch (err: any) {
      setAddCollectionError(err.message || "Failed to add collection.");
    } finally {
      setAddCollectionLoading(false);
    }
  }, [fetchData, loadDashboardData]);

  // Handle overview search submission
  const handleOverviewSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (overviewSearchInput.trim()) {
      router.push(`/app/bookmarks/all?q=${encodeURIComponent(overviewSearchInput.trim())}`);
      setOverviewSearchInput(""); // Clear the input after submission
    }
  };

  // --- Statistics for Dashboard Overview ---
  const totalBookmarks = userBookmarks.length;
  const favoriteBookmarks = userBookmarks.filter((bm) => bm.isFav).length;
  const uniqueCategoriesCount = categories.filter(c => c.count > 0).length;
  const uniqueCollectionsCount = collections.filter(c => c.count > 0).length;

  const trendingTags = useMemo(() => {
    return (tags || [])
      .filter(tag => tag.weeklyCount && tag.weeklyCount > 0)
      .sort((a, b) => (b.weeklyCount || 0) - (a.weeklyCount || 0))
      .slice(0, 5);
  }, [tags]);

  const recentBookmarks = useMemo(() => {
    return [...userBookmarks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [userBookmarks]);


  const mainContentMl = isSidebarExpanded ? "ml-64" : "ml-16"; // Adjust margin for sidebar

  // --- Loading, Error States ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-slate-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold flex items-center gap-3"
        >
          <LayoutDashboard className="w-6 h-6 animate-pulse" /> Loading your Markly Dashboard...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-red-100 text-red-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center p-6 rounded-lg bg-white shadow-lg border border-red-200"
        >
          <p className="text-xl font-semibold mb-2">Error Loading Dashboard</p>
          <p className="mb-4 text-red-600">{error}</p>
          <button
            onClick={() => loadDashboardData()}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all mr-2"
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
        </motion.div>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-slate-900 relative">
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
        activePanel={activePanel}
        setActivePanel={(panel) => {
          // Navigate to different pages based on panel selection
          if (panel === "overview") router.push(`/app`); // Already here
          else if (panel === "bookmarks") router.push(`/app/bookmarks/all`);
          else if (panel === "favorites") router.push(`/app/favorites`);
          else if (panel === "collections") router.push(`/app/collections/all`);
          else if (panel === "profile") router.push(`/app/profile`);
          // Set active panel for highlighting the sidebar item
          setActivePanel(panel);
        }}
        categories={categories}
        collections={collections}
        tags={tags}
        onCategorySelect={() => {}} // No filtering directly on dashboard overview
        selectedCategoryId={null}
        onCollectionSelect={() => {}} // No filtering directly on dashboard overview
        selectedCollectionId={null}
        onTagSelect={() => {}} // No filtering directly on dashboard overview
        selectedTagId={null}
        onClearFilters={() => {}} // No filters on dashboard overview
        onAddCategoryClick={() => setIsAddCategoryModalOpen(true)}
        onAddCollectionClick={() => setIsAddCollectionModalOpen(true)}
      />

      <main className={`flex-1 transition-all duration-300 ${mainContentMl} custom-scrollbar`}>
        {/* Header component for the dashboard */}
        <Header
          searchQuery={overviewSearchInput}
          onSearchChange={setOverviewSearchInput}
          onAddBookmarkClick={() => setIsAddBookmarkModalOpen(true)}
          isSidebarExpanded={isSidebarExpanded}
          onSidebarToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
          currentPageTitle="Dashboard Overview"
          showSearch={true} // Show quick search on dashboard
        />

        {/* Content Section - Add padding-top to avoid being hidden behind the fixed top bar */}
        <div className="pt-20 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Welcome Banner / Quick Actions */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-extrabold mb-2">Welcome to your Markly Dashboard!</h1>
                <p className="text-blue-100 text-lg">Your knowledge, organized and at your fingertips.</p>
              </div>
              {/* Search Bar within Overview */}
              <form onSubmit={handleOverviewSearchSubmit} className="flex items-center relative w-full md:w-auto min-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Quick search bookmarks..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white text-gray-800 border border-gray-200 focus:ring-2 focus:ring-blue-300 focus:outline-none shadow-sm"
                  value={overviewSearchInput}
                  onChange={(e) => setOverviewSearchInput(e.target.value)}
                />
                <motion.button
                  type="submit"
                  className="ml-2 px-4 py-2 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors hidden md:block"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Search
                </motion.button>
              </form>
            </div>

            {/* Key Statistics Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <LayoutDashboard className="w-7 h-7 text-indigo-500" /> Your Markly Snapshot
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl text-center shadow-md flex flex-col items-center" whileHover={{ scale: 1.03 }}>
                  <BookOpen className="w-8 h-8 text-indigo-600 mb-3" />
                  <div className="text-4xl font-bold text-indigo-800">{totalBookmarks}</div>
                  <div className="text-md font-medium text-slate-700 mt-1">Total Bookmarks</div>
                </motion.div>
                <motion.div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl text-center shadow-md flex flex-col items-center" whileHover={{ scale: 1.03 }}>
                  <Star className="w-8 h-8 text-pink-600 mb-3" />
                  <div className="text-4xl font-bold text-pink-800">{favoriteBookmarks}</div>
                  <div className="text-md font-medium text-slate-700 mt-1">Favorite Bookmarks</div>
                </motion.div>
                <motion.div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl text-center shadow-md flex flex-col items-center" whileHover={{ scale: 1.03 }}>
                  <Folder className="w-8 h-8 text-emerald-600 mb-3" />
                  <div className="text-4xl font-bold text-emerald-800">{uniqueCollectionsCount}</div>
                  <div className="text-md font-medium text-slate-700 mt-1">Unique Collections</div>
                </motion.div>
                <motion.div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl text-center shadow-md flex flex-col items-center" whileHover={{ scale: 1.03 }}>
                  <TagIcon className="w-8 h-8 text-purple-600 mb-3" />
                  <div className="text-4xl font-bold text-purple-800">{uniqueCategoriesCount}</div>
                  <div className="text-md font-medium text-slate-700 mt-1">Unique Categories</div>
                </motion.div>
              </div>
            </section>

            {/* Recent Activity & Trending */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Bookmarks */}
              <section className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <BookOpen className="w-7 h-7 text-green-500" /> Recent Bookmarks
                </h2>
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                >
                  {recentBookmarks.length > 0 ? (
                    recentBookmarks.map((bookmark) => (
                      <motion.div
                        key={bookmark.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <BookmarkCard
                          bookmark={bookmark}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center text-slate-500 py-10">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                      <p className="text-lg font-medium">No recent bookmarks.</p>
                      <button
                        onClick={() => setIsAddBookmarkModalOpen(true)}
                        className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all flex items-center mx-auto gap-2"
                      >
                        <Plus className="w-5 h-5" /> Add Your First
                      </button>
                    </div>
                  )}
                </motion.div>
              </section>

              {/* Trending Tags */}
              <section className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <TrendingUp className="w-7 h-7 text-red-500" /> Trending Tags
                </h2>
                <div className="space-y-4">
                  {trendingTags.length > 0 ? (
                    trendingTags.map((tag) => (
                      <motion.div
                        key={tag.id}
                        className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-4 rounded-xl cursor-pointer transition-all border border-gray-100"
                        whileHover={{ x: 5, boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}
                        onClick={() => {
                          // Redirect to all bookmarks page with tag filter
                          router.push(`/app/bookmarks/all?tag=${tag.id}`);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <TagIcon className="w-5 h-5 text-purple-600" />
                          <span className="text-lg font-semibold text-gray-700">#{tag.name}</span>
                        </div>
                        <span className="text-md text-gray-600 bg-purple-100 px-3 py-1 rounded-full">{tag.weeklyCount} mentions</span>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center text-slate-500 py-10">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                      <p className="text-lg font-medium">No trending tags this week.</p>
                      <p className="text-sm mt-2">Add more bookmarks with tags to see trends!</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isAddBookmarkModalOpen && (
          <AddBookmarkModal
            isOpen={isAddBookmarkModalOpen}
            onClose={() => setIsAddBookmarkModalOpen(false)}
            onAddBookmark={handleAddBookmark}
            isLoading={addBookmarkLoading}
            error={addBookmarkError}
            categories={categories}
            collections={collections}
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
