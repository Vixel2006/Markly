// app/favorites/page.tsx
"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Star,
  Folder,
  Tag as TagIcon, // Renamed to avoid conflict with TagData interface
  BookOpen,
  Search, // For integrated search
  Filter, // For active filter display
  Plus, // For add bookmark button
  X, // For clearing filters / sidebar toggle
  Menu, // For sidebar toggle (handled by Header now)
  LayoutDashboard // For the "Back to Dashboard" in the sidebar logic if needed
} from 'lucide-react';

// Assuming these are in their respective paths
import Sidebar from '../../../components/dashboard/Sidebar';
import Header from '../../../components/dashboard/Header'; // Import the generic Header component
import AddBookmarkModal from '../../../components/dashboard/AddBookmarkModal';
import AddCategoryModal from "../../../components/dashboard/AddCategoryModal";
import AddCollectionModal from "../../../components/dashboard/AddCollectionModal";
import BookmarkCard from '../../../components/dashboard/BookmarkCard';

// --- Interfaces (kept consistent with dashboard) ---
interface Category {
  id: string;
  name: string;
  emoji?: string;
  color?: string; // Added color property if you store it in backend
}

interface Collection {
  id: string;
  name: string;
}

interface TagData { // Renamed from Tag to TagData for clarity
  id: string;
  name: string;
  // If tags had weeklyCount, prevCount from dashboard, include here
}

// Backend Bookmark interface
interface BackendBookmark {
  id: string;
  url: string;
  title: string;
  summary: string;
  tags: string[]; // IDs only from backend
  collections: string[]; // IDs only from backend
  category: string | null; // ID or null from backend
  created_at: string; // Snake case from backend
  user_id: string; // Snake case from backend
  is_fav: boolean; // Snake case from backend
}

// Frontend Bookmark interface (for hydrated data, as expected by BookmarkCard)
interface FrontendBookmark {
  id: string;
  title: string;
  url: string;
  summary: string;
  categories?: Category[]; // Array of full category objects (can be single category if API allows)
  collections: Collection[]; // Array of full collection objects
  tags: TagData[]; // Array of full tag objects (using TagData)
  isFav: boolean; // Camel case for frontend
  createdAt: string; // Camel case for frontend
}

interface BookmarkDataForAdd { // Used for onAddBookmark prop in modal
  url: string;
  title: string;
  summary: string;
  tags: string[]; // Array of Tag IDs (strings)
  collections: string[]; // Array of Collection IDs (strings)
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


const FavoriteBookmarksPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
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

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || "");
  const [activePanel, setActivePanel] = useState("favorites");

  // --- Utility fetchData function (kept as is) ---
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

  // Helper function to get default category colors
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

  // --- Data Loading Logic ---
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedBackendBookmarksData, fetchedCategoriesData, fetchedCollectionsData, fetchedTagsData] = await Promise.all([
        fetchData<BackendBookmark[]>("http://localhost:8080/api/bookmarks?isFav=true"),
        fetchData<Category[]>(`http://localhost:8080/api/categories`),
        fetchData<Collection[]>(`http://localhost:8080/api/collections`),
        fetchData<TagData[]>(`http://localhost:8080/api/tags/user`),
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

      const collectionsWithCounts: CollectionForDisplay[] = actualCollections.map(col => ({
        ...col,
        count: hydratedBookmarks.filter(bm =>
          bm.collections?.some(c => c.id === col.id)
        ).length,
      }));

      setCategories(categoriesWithCounts); // FIX: Corrected this line
      setCollections(collectionsWithCounts);

    } catch (err: any) {
      setError(err.message || "Failed to load favorite bookmarks.");
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleClearFilters = useCallback(() => {
    setSelectedCategoryId(null);
    setSelectedCollectionId(null);
    setSelectedTagId(null);
    setSearchQuery("");
    // Also update URL params to clear them visually
    router.replace('/app/favorites');
  }, [router]);

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
      return null;
    }
    return null;
  }, [fetchData, tags]);

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
      await loadAllData();
    } catch (err: any) {
      setAddBookmarkError(err.message || "Failed to add bookmark.");
    } finally {
      setAddBookmarkLoading(false);
    }
  }, [fetchData, loadAllData]);

  const handleAddCategory = useCallback(async (name: string, emoji: string) => {
    setAddCategoryLoading(true);
    setAddCategoryError(null);
    try {
      const newCategory = await fetchData<Category>("http://localhost:8080/api/categories", "POST", { name, emoji });
      if (newCategory) {
        setIsAddCategoryModalOpen(false);
        await loadAllData();
      }
    } catch (err: any) {
      setAddCategoryError(err.message || "Failed to add category.");
    } finally {
      setAddCategoryLoading(false);
    }
  }, [fetchData, loadAllData]);

  const handleAddCollection = useCallback(async (name: string) => {
    setAddCollectionLoading(true);
    setAddCollectionError(null);
    try {
      const newCollection = await fetchData<Collection>("http://localhost:8080/api/collections", "POST", { name });
      if (newCollection) {
        setIsAddCollectionModalOpen(false);
        await loadAllData();
      }
    } catch (err: any) {
      setAddCollectionError(err.message || "Failed to add collection.");
    } finally {
      setAddCollectionLoading(false);
    }
  }, [fetchData, loadAllData]);

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
      
      // If a bookmark is unfavorited from the favorites page, remove it from the display
      // Otherwise, update its status.
      setUserBookmarks(prev => prev.filter(bm => bm.id !== bookmarkId));
      
      // Re-fetch data to ensure sidebar counts are accurate after a favorite change
      loadAllData();
    } catch (err: any) {
      setError(err.message || "Failed to toggle favorite status.");
    }
  }, [userBookmarks, fetchData, loadAllData]);

  // --- Filtering Logic for Favorite Bookmarks ---
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

  const mainContentMl = isSidebarExpanded ? "ml-64" : "ml-16";

  // --- Loading, Error, Empty States ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-indigo-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold flex items-center gap-3"
        >
          <Star className="w-6 h-6 animate-pulse text-yellow-500" /> Loading favorite bookmarks...
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
          <p className="text-xl font-semibold mb-2">Error Loading Favorites</p>
          <p className="mb-4 text-red-600">{error}</p>
          <button
            onClick={() => loadAllData()}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-slate-900 relative">
      {/* Sidebar */}
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
        activePanel={activePanel}
        setActivePanel={(panel) => {
          if (panel === "overview") router.push(`/app`);
          else if (panel === "bookmarks") router.push(`/app/bookmarks/all`);
          else if (panel === "collections") router.push(`/app/collections/all`);
          else if (panel === "profile") router.push(`/app/profile`);
          else { // If panel is 'favorites' (which this page is), just set it
            setActivePanel(panel);
            // Optionally clear filters if navigating back to favorites from another favorites filter
            handleClearFilters();
          }
        }}
        categories={categories}
        collections={collections}
        tags={tags}
        onCategorySelect={(id) => { setSelectedCategoryId(id); setActivePanel("favorites"); }}
        selectedCategoryId={selectedCategoryId}
        onCollectionSelect={(id) => { setSelectedCollectionId(id); setActivePanel("favorites"); }}
        selectedCollectionId={selectedCollectionId}
        onTagSelect={(id) => { setSelectedTagId(id); setActivePanel("favorites"); }}
        selectedTagId={selectedTagId}
        onClearFilters={handleClearFilters}
        onAddCategoryClick={() => setIsAddCategoryModalOpen(true)}
        onAddCollectionClick={() => setIsAddCollectionModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 ${mainContentMl} custom-scrollbar`}>
        {/* Header component */}
        <Header
          onAddBookmarkClick={() => setIsAddBookmarkModalOpen(true)}
          isSidebarExpanded={isSidebarExpanded}
          onSidebarToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
          currentPageTitle="Favorite Bookmarks" // Specific title for this page
          // Search functionality is integrated directly into this page's content,
          // so we pass an empty search query and no-op for onSearchChange
          searchQuery={searchQuery} // Pass the local search query
          onSearchChange={(query) => {
            // If user types in Header search, redirect to AllBookmarksPage with query
            router.push(`/app/bookmarks/all?q=${encodeURIComponent(query)}`);
          }}
          showSearch={true} // Show search in header
        />

        {/* Content Section - Add padding-top to avoid being hidden behind the fixed top bar */}
        <div className="pt-20 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-4"
          >
            {/* Integrated Search and Filter Controls for Favorites */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-indigo-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                <Search className="w-7 h-7 text-indigo-600" /> Search & Filter Favorites
              </h2>

              <div className="flex flex-col md:flex-row items-center gap-4 mb-5">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search favorite bookmarks by title, URL, tags..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-indigo-50 text-gray-900 border border-indigo-200 focus:ring-2 focus:ring-purple-300 focus:outline-none shadow-sm placeholder-slate-500"
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
                  className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                    <Filter className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-lg">Active Filters:</span>
                    {searchQuery && (
                      <span className="bg-blue-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        Search: "{searchQuery}" <X className="w-4 h-4 ml-1 cursor-pointer hover:text-blue-900" onClick={() => setSearchQuery("")} />
                      </span>
                    )}
                    {selectedCategoryId && (
                      <span className="bg-blue-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        Category: {categories.find(c => c.id === selectedCategoryId)?.name} <X className="w-4 h-4 ml-1 cursor-pointer hover:text-blue-900" onClick={() => setSelectedCategoryId(null)} />
                      </span>
                    )}
                    {selectedCollectionId && (
                      <span className="bg-blue-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        Collection: {collections.find(c => c.id === selectedCollectionId)?.name} <X className="w-4 h-4 ml-1 cursor-pointer hover:text-blue-900" onClick={() => setSelectedCollectionId(null)} />
                      </span>
                    )}
                    {selectedTagId && (
                      <span className="bg-blue-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        Tag: {tags.find(t => t.id === selectedTagId)?.name} <X className="w-4 h-4 ml-1 cursor-pointer hover:text-blue-900" onClick={() => setSelectedTagId(null)} />
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleClearFilters}
                    className="flex-shrink-0 ml-0 sm:ml-4 px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-md"
                  >
                    <X className="w-4 h-4" /> Clear All
                  </button>
                </motion.div>
              )}
            </div>

            {/* Favorite Bookmarks Grid */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-500" /> Your Favorite Bookmarks ({filteredBookmarks.length})
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
                <div className="col-span-full text-center text-slate-600 py-20 bg-white rounded-2xl shadow-lg border border-indigo-100">
                  <Star className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                  {isFilterActive ? (
                    <>
                      <p className="text-2xl font-semibold mb-3">No favorite bookmarks match your filters.</p>
                      <p className="text-lg mb-6">Try adjusting your search or clearing some filters.</p>
                      <button
                        onClick={handleClearFilters}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all flex items-center mx-auto gap-2 text-lg"
                      >
                        <X className="w-5 h-5" /> Clear All Filters
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-semibold mb-3">Your favorite bookmarks list is empty!</p>
                      <p className="text-lg mb-6">Start marking bookmarks with a <Star className="inline-block w-6 h-6 text-yellow-400 align-text-bottom" /> to see them here.</p>
                      <button
                        onClick={() => router.push("/app/bookmarks/all")} // Navigate to All Bookmarks page
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all flex items-center mx-auto gap-2 text-lg"
                      >
                        <BookOpen className="w-5 h-5" /> View All Bookmarks
                      </button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
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

export default FavoriteBookmarksPage;
