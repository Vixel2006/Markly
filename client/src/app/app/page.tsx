"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  X, // Used for clearing filters AND sidebar toggle
  Folder,
  Star,
  Tag, // Used for general tags, distinct from TagData interface
  Heart,
  Settings,
  TrendingUp,
  LayoutDashboard,
  Bell,
  Search,
  Zap,
  Filter,
  Menu, // Used for sidebar toggle
} from "lucide-react";
import { motion } from "framer-motion";

import Sidebar from "../components/dashboard/Sidebar";
// Removed Header import as it's no longer needed
import AddBookmarkModal from "../components/dashboard/AddBookmarkModal";
import AddCategoryModal from "../components/dashboard/AddCategoryModal";
import AddCollectionModal from "../components/dashboard/AddCollectionModal";
import BookmarkCard from "../components/dashboard/BookmarkCard";

// --- Interfaces (kept as is for consistency) ---
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

interface TagData {
  id: string;
  name: string;
  weeklyCount: number;
  prevCount: number;
  createdAt: string;
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
  url: string;
  title: string;
  summary: string;
  tags: TagData[];
  collections: Collection[];
  category?: Category;
  createdAt: string;
  isFav: boolean;
}

interface BookmarkData {
  url: string;
  title: string;
  summary: string;
  tags: string[];
  collections: string[];
  category_id?: string;
  is_fav?: boolean;
}

// --- Dashboard Component ---
const MarklyDashboard = () => {
  const router = useRouter();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [activePanel, setActivePanel] = useState<string>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [overviewSearchInput, setOverviewSearchInput] = useState("");

  const [userBookmarks, setUserBookmarks] = useState<FrontendBookmark[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<TagData[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  const [isAddBookmarkModalOpen, setIsAddBookmarkModalOpen] = useState(false);
  const [addBookmarkLoading, setAddBookmarkLoading] = useState(false);
  const [addBookmarkError, setAddBookmarkError] = useState<string | null>(null);

  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [addCategoryLoading, setAddCategoryLoading] = useState(false);
  const [addCategoryError, setAddCategoryError] = useState<string | null>(null);

  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] = useState(false);
  const [addCollectionLoading, setAddCollectionLoading] = useState(false);
  const [addCollectionError, setAddCollectionError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Utility fetchData function ---
  const fetchData = useCallback(
    async <T,>(
      url: string,
      method: string = "GET",
      body?: any
    ): Promise<T | null> => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found. User might not be authenticated.");
        setError("Authentication token missing. Please log in.");
        return null;
      }

      try {
        const fetchOptions: RequestInit = {
          method: method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        };
        if (body) {
          fetchOptions.body = JSON.stringify(body);
        }

        const res = await fetch(url, fetchOptions);

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("token");
            router.push("/auth");
            throw new Error("Unauthorized. Please log in again.");
          }
          const errText = await res.text();
          try {
            const errorJson = JSON.parse(errText);
            throw new Error(
              errorJson.message ||
                `Failed to fetch from ${url}: ${res.status} - ${errText}`
            );
          } catch {
            throw new Error(
              `Failed to fetch from ${url}: ${res.status} - ${errText}`
            );
          }
        }

        if (res.status === 204 || res.headers.get("Content-Length") === "0") {
          return null;
        }

        return await res.json();
      } catch (err: any) {
        console.error(`Network or API error fetching from ${url}: `, err);
        throw err;
      }
    },
    [router]
  );

  // --- Tag Handling ---
  const handleAddNewTag = useCallback(async (tagName: string): Promise<TagData | null> => {
    const existingTag = tags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase());
    if (existingTag) {
      return existingTag;
    }

    try {
      const response = await fetchData<TagData>(`http://localhost:8080/api/tags`, "POST", { name: tagName });
      if (response) {
        setTags((prevTags) => [...prevTags, response]);
        return response;
      }
    } catch (err: any) {
      console.error("Error adding new tag:", err);
      setError(err.message || "Failed to add tag.");
    }
    return null;
  }, [fetchData, tags]);

  // --- Data Loading Logic ---
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
        fetchData<TagData[]>(`http://localhost:8080/api/tags/user`),
        fetchData<BackendBookmark[]>(`http://localhost:8080/api/bookmarks`),
      ]);

      const actualCategories = fetchedCategories || [];
      const actualCollections = fetchedCollections || [];
      const actualTags = fetchedTags || [];
      const actualBookmarks = backendBookmarks || [];

      setCategories(actualCategories);
      setCollections(actualCollections);
      setTags(actualTags);

      const hydratedBookmarks: FrontendBookmark[] = actualBookmarks.map((bm) => {
        const hydratedTags = (bm.tags || [])
          .map((tagId) => actualTags.find((t) => t.id === tagId))
          .filter((tag): tag is TagData => tag !== undefined);
        
        const hydratedCollections = (bm.collections || [])
          .map((colId) => actualCollections.find((c) => c.id === colId))
          .filter((col): col is Collection => col !== undefined);
        
        const hydratedCategory = bm.category
          ? actualCategories.find((cat) => cat.id === bm.category)
          : undefined;
        
        return {
          id: bm.id,
          url: bm.url,
          title: bm.title,
          summary: bm.summary,
          tags: hydratedTags,
          collections: hydratedCollections,
          category: hydratedCategory,
          createdAt: bm.created_at,
          isFav: bm.is_fav,
        };
      });

      setUserBookmarks(hydratedBookmarks);
    } catch (err: any) {
      setError(
        err.message || "An unexpected error occurred loading dashboard data."
      );
      console.error("Error in loadDashboardData:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // --- Bookmark Actions ---
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
            tags: bookmarkData.tags,
            collections: bookmarkData.collections,
            category_id: bookmarkData.category_id,
            is_fav: bookmarkData.is_fav ?? false,
          }
        );
        if (newBookmark) {
          setIsAddBookmarkModalOpen(false);
          await loadDashboardData();
        }
      } catch (err: any) {
        setAddBookmarkError(err.message || "Failed to add bookmark.");
        console.error("Error adding bookmark:", err);
      } finally {
        setAddBookmarkLoading(false);
      }
    },
    [fetchData, loadDashboardData]
  );

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
          await loadDashboardData();
        }
      } catch (err: any) {
        setAddCategoryError(err.message || "Failed to add category.");
      } finally {
        setAddCategoryLoading(false);
      }
    },
    [fetchData, loadDashboardData]
  );

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
          await loadDashboardData();
        }
      } catch (err: any) {
        setAddCollectionError(err.message || "Failed to add collection.");
      } finally {
        setAddCollectionLoading(false);
      }
    },
    [fetchData, loadDashboardData]
  );

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

  const categoriesForDisplay: CategoryForDisplay[] = useMemo(() => {
    return (categories || []).map((cat) => {
      const count = (userBookmarks || []).filter(
        (bm) => bm.category?.id === cat.id
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

  const collectionsForDisplay: CollectionForDisplay[] = useMemo(() => {
    return (collections || []).map((col) => ({
      ...col,
      count: (userBookmarks || []).filter((bm) =>
        bm.collections?.some((c) => c.id === col.id)
      ).length,
    }));
  }, [collections, userBookmarks]);

  // --- Filtering Logic for Bookmarks ---
  const filteredBookmarks = useMemo(() => {
    let tempBookmarks = userBookmarks;

    // Filter by search query
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      tempBookmarks = tempBookmarks.filter(
        (bm) =>
          bm.title.toLowerCase().includes(lowerCaseQuery) ||
          bm.summary.toLowerCase().includes(lowerCaseQuery) ||
          bm.url.toLowerCase().includes(lowerCaseQuery) ||
          (bm.tags && bm.tags.some((tag) => tag.name.toLowerCase().includes(lowerCaseQuery))) ||
          (bm.collections && bm.collections.some((col) => col.name.toLowerCase().includes(lowerCaseQuery))) ||
          (bm.category && bm.category.name.toLowerCase().includes(lowerCaseQuery))
      );
    }

    // Filter by category
    if (selectedCategoryId) {
      tempBookmarks = tempBookmarks.filter((bm) =>
        bm.category?.id === selectedCategoryId
      );
    }

    // Filter by collection
    if (selectedCollectionId) {
      tempBookmarks = tempBookmarks.filter((bm) =>
        bm.collections?.some((col) => col.id === selectedCollectionId)
      );
    }

    // Filter by tag
    if (selectedTagId) {
      tempBookmarks = tempBookmarks.filter((bm) =>
        bm.tags?.some((tag) => tag.id === selectedTagId)
      );
    }

    return tempBookmarks;
  }, [userBookmarks, searchQuery, selectedCategoryId, selectedCollectionId, selectedTagId]);

  const isFilterActive = useMemo(() => {
    return (
      searchQuery !== "" ||
      selectedCategoryId !== null ||
      selectedCollectionId !== null ||
      selectedTagId !== null
    );
  }, [searchQuery, selectedCategoryId, selectedCollectionId, selectedTagId]);

  const clearAllFilters = () => {
    setSelectedCategoryId(null);
    setSelectedCollectionId(null);
    setSelectedTagId(null);
    setSearchQuery("");
  };

  // --- Statistics for Dashboard Overview ---
  const totalBookmarks = userBookmarks.length;
  const favoriteBookmarks = userBookmarks.filter((bm) => bm.isFav).length;
  const uniqueCategoriesCount = categoriesForDisplay.filter(c => c.count > 0).length;
  const uniqueCollectionsCount = collectionsForDisplay.filter(c => c.count > 0).length;

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

  // Handle overview search submission
  const handleOverviewSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (overviewSearchInput.trim()) {
      setSearchQuery(overviewSearchInput);
      setActivePanel("bookmarks");
      setOverviewSearchInput(""); // Clear the input after submission
    }
  };

  // --- Loading/Error/Empty States ---
  if (loading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 text-red-700 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xl font-bold mb-4">Error Loading Dashboard</p>
          <p className="text-center mb-4">{error}</p>
          <button
            onClick={() => loadDashboardData()}
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

  const sidebarWidthCollapsed = '4rem'; // 64px
  const sidebarWidthExpanded = '16rem'; // 256px
  const mainContentLeftMargin = isSidebarExpanded ? sidebarWidthExpanded : sidebarWidthCollapsed;
  const fixedHeaderHeight = '80px'; // Consistent height for the top fixed bar

  return (
    // Outer container: takes full viewport height, hides global scrollbar
    <div className="h-screen flex relative overflow-hidden bg-gray-50 text-slate-900">
      {/* Sidebar */}
      {/* The Sidebar itself has h-screen and its inner scrollable area has overflow-y-auto */}
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        categories={categoriesForDisplay}
        collections={collectionsForDisplay}
        tags={tags || []}
        onCategorySelect={(id) => { setSelectedCategoryId(id); setActivePanel("bookmarks"); }}
        selectedCategoryId={selectedCategoryId}
        onCollectionSelect={(id) => { setSelectedCollectionId(id); setActivePanel("bookmarks"); }}
        selectedCollectionId={selectedCollectionId}
        onTagSelect={(id) => { setSelectedTagId(id); setActivePanel("bookmarks"); }}
        selectedTagId={selectedTagId}
        onClearFilters={clearAllFilters}
        onAddCategoryClick={() => setIsAddCategoryModalOpen(true)}
        onAddCollectionClick={() => setIsAddCollectionModalOpen(true)}
      />

      {/* Main Content Area */}
      {/* This container handles the left margin based on sidebar expansion */}
      <div
        className={`flex-1 transition-all duration-300 flex flex-col`} // Use flex-col to stack fixed header and scrollable content
        style={{ marginLeft: mainContentLeftMargin }}
      >
        {/* Fixed Top Bar */}
        <div
          className="flex-shrink-0 bg-white bg-opacity-95 backdrop-blur-sm p-4 flex items-center justify-between shadow-sm border-b border-gray-100"
          style={{ height: fixedHeaderHeight }} // Explicit height for the fixed header
        >
          <div className="flex items-center gap-4">
            {/* Sidebar toggle button - NOW INSIDE THE FIXED HEADER */}
            <button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isSidebarExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              {activePanel === "overview" ? "Dashboard Overview" : "Your Bookmarks"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setIsAddBookmarkModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center gap-2 text-sm font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" /> New Bookmark
            </motion.button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        {/* This div takes the remaining height and handles its own scrolling */}
        <div
          className="flex-1 p-6 custom-scrollbar overflow-y-auto" // flex-1 makes it fill remaining height
        >
          {/* --- Overview Dashboard Panel --- */}
          {activePanel === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8" // No need for mt-4 or pt-XX, spacing handled by container's p-6
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
                    <Heart className="w-8 h-8 text-pink-600 mb-3" />
                    <div className="text-4xl font-bold text-pink-800">{favoriteBookmarks}</div>
                    <div className="text-md font-medium text-slate-700 mt-1">Favorite Bookmarks</div>
                  </motion.div>
                  <motion.div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl text-center shadow-md flex flex-col items-center" whileHover={{ scale: 1.03 }}>
                    <Folder className="w-8 h-8 text-emerald-600 mb-3" />
                    <div className="text-4xl font-bold text-emerald-800">{uniqueCollectionsCount}</div>
                    <div className="text-md font-medium text-slate-700 mt-1">Unique Collections</div>
                  </motion.div>
                  <motion.div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl text-center shadow-md flex flex-col items-center" whileHover={{ scale: 1.03 }}>
                    <Tag className="w-8 h-8 text-purple-600 mb-3" />
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
                            setSelectedTagId(tag.id);
                            setActivePanel("bookmarks"); // Switch to bookmarks panel with filter
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Tag className="w-5 h-5 text-purple-600" />
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
          )}

          {/* --- All Bookmarks Panel (with integrated search/filter) --- */}
          {activePanel === "bookmarks" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8" // Removed mt-4
            >
              {/* Integrated Search and Filter Controls */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-3">
                  <BookOpen className="w-7 h-7 text-indigo-600" /> Manage All Bookmarks
                </h2>

                <div className="flex flex-col md:flex-row items-center gap-4 mb-5">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by title, URL, tags, or categories..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 text-gray-800 border border-gray-200 focus:ring-2 focus:ring-blue-300 focus:outline-none shadow-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <motion.button
                    onClick={() => setIsAddBookmarkModalOpen(true)}
                    className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-lg shadow-md hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 text-base font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="w-5 h-5" /> Add Bookmark
                  </motion.button>
                </div>

                {/* Active Filters Display */}
                {isFilterActive && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                      <Filter className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-lg">Active Filters:</span>
                      {searchQuery && (
                        <span className="bg-blue-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          Search: "{searchQuery}" <X className="w-4 h-4 ml-1 cursor-pointer" onClick={() => setSearchQuery("")} />
                        </span>
                      )}
                      {selectedCategoryId && (
                        <span className="bg-blue-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          Category: {categories.find(c => c.id === selectedCategoryId)?.name} <X className="w-4 h-4 ml-1 cursor-pointer" onClick={() => setSelectedCategoryId(null)} />
                        </span>
                      )}
                      {selectedCollectionId && (
                        <span className="bg-blue-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          Collection: {collections.find(c => c.id === selectedCollectionId)?.name} <X className="w-4 h-4 ml-1 cursor-pointer" onClick={() => setSelectedCollectionId(null)} />
                        </span>
                      )}
                      {selectedTagId && (
                        <span className="bg-blue-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          Tag: {tags.find(t => t.id === selectedTagId)?.name} <X className="w-4 h-4 ml-1 cursor-pointer" onClick={() => setSelectedTagId(null)} />
                        </span>
                      )}
                    </div>
                    <button
                      onClick={clearAllFilters}
                      className="flex-shrink-0 ml-0 sm:ml-4 px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-md"
                    >
                      <X className="w-4 h-4" /> Clear All
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Display Filtered Bookmarks */}
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
                  <div className="col-span-full text-center text-slate-600 py-20 bg-white rounded-2xl shadow-lg border border-gray-100">
                    <BookOpen className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                    {isFilterActive ? (
                      <>
                        <p className="text-2xl font-semibold mb-3">No bookmarks match your filters.</p>
                        <p className="text-lg mb-6">Try adjusting your search or clearing some filters.</p>
                        <button
                          onClick={clearAllFilters}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all flex items-center mx-auto gap-2 text-lg"
                        >
                          <X className="w-5 h-5" /> Clear All Filters
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-semibold mb-3">Your knowledge base is empty!</p>
                        <p className="text-lg mb-6">Get started by adding your first bookmark.</p>
                        <button
                          onClick={() => setIsAddBookmarkModalOpen(true)}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all flex items-center mx-auto gap-2 text-lg"
                        >
                          <Plus className="w-5 h-5" /> Add Your First Bookmark
                        </button>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

        </div> {/* End scrollable content div */}
      </div>

      {/* Modals (kept as is) */}
      <AddBookmarkModal
        isOpen={isAddBookmarkModalOpen}
        onClose={() => setIsAddBookmarkModalOpen(false)}
        onAddBookmark={({ url, title, summary, tags, collections, category_id, is_fav }) =>
          handleAddBookmark({
            url,
            title,
            summary,
            tags: tags,
            collections: collections,
            category_id: category_id,
            is_fav: is_fav,
          })}
        isLoading={addBookmarkLoading}
        error={addBookmarkError}
        categories={categories || []}
        collections={collections || []}
        tags={tags || []}
        onAddNewTag={handleAddNewTag}
      />

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onAddCategory={handleAddCategory}
        isLoading={addCategoryLoading}
        error={addCategoryError}
      />

      <AddCollectionModal
        isOpen={isAddCollectionModalOpen}
        onClose={() => setIsAddCollectionModalOpen(false)}
        onAddCollection={handleAddCollection}
        isLoading={addCollectionLoading}
        error={addCollectionError}
      />
    </div>
  );
};

export default MarklyDashboard;
