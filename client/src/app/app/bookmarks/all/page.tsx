"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, X, Folder, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // AnimatePresence added for modals
import Sidebar from "../../../components/dashboard/Sidebar"; // Adjusted path
import Header from "../../../components/dashboard/Header"; // Adjusted path
import AddBookmarkModal from "../../../components/dashboard/AddBookmarkModal"; // Adjusted path
import AddCategoryModal from "../../../components/dashboard/AddCategoryModal"; // Adjusted path
import AddCollectionModal from "../../../components/dashboard/AddCollectionModal"; // Adjusted path
import BookmarkCard from "../../../components/dashboard/BookmarkCard"; // Adjusted path

// Interfaces from the second code block, adopted for consistency
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

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  // Default to "bookmarks" view as the original component was AllBookmarksPage
  const [activePanel, setActivePanel] = useState("bookmarks");
  const [searchQuery, setSearchQuery] = useState("");

  const [userBookmarks, setUserBookmarks] = useState<FrontendBookmark[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

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

  // Adopted fetchData from the second code block
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
        router.push("/auth");
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
        throw err; // Re-throw to be handled by calling function
      }
    },
    [router]
  );

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
        fetchData<Tag[]>(`http://localhost:8080/api/tags`),
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
      filtered = filtered.filter(bookmark =>
        bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(searchQuery.toLowerCase())
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


  const mainContentMl = isSidebarExpanded ? "ml-64" : "ml-16";

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

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex relative">
      {/* Sidebar */}
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        categories={categoriesForDisplay}
        collections={collectionsForDisplay}
        tags={tags || []} // Ensure tags is an array
        onCategorySelect={setSelectedCategoryId}
        selectedCategoryId={selectedCategoryId}
        onCollectionSelect={setSelectedCollectionId}
        selectedCollectionId={selectedCollectionId}
        onTagSelect={setSelectedTagId}
        selectedTagId={selectedTagId}
        onClearFilters={() => {
          setSelectedCategoryId(null);
          setSelectedCollectionId(null);
          setSelectedTagId(null);
          setSearchQuery("");
          // No change to activePanel here, allows user to clear filters within current panel
        }}
        onAddCategoryClick={() => setIsAddCategoryModalOpen(true)}
        onAddCollectionClick={() => setIsAddCollectionModalOpen(true)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 p-6 transition-all duration-300 ${mainContentMl} custom-scrollbar`}
      >
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery} // Consistent with second code block
          onAddBookmarkClick={() => setIsAddBookmarkModalOpen(true)}
          totalBookmarksCount={(userBookmarks || []).length} // From second code block
        />

        {/* Dashboard View */}
        {activePanel === "dashboard" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              <motion.div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl text-center" whileHover={{ scale: 1.05 }}>
                <div className="text-3xl font-bold text-pink-600 mb-2">{(userBookmarks || []).length}</div>
                <div className="text-sm font-medium text-slate-700">Total Bookmarks</div>
              </motion.div>
              <motion.div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl text-center" whileHover={{ scale: 1.05 }}>
                <div className="text-3xl font-bold text-purple-600 mb-2">{categoriesForDisplay.length}</div>
                <div className="text-sm font-medium text-slate-700">Categories</div>
              </motion.div>
              <motion.div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl text-center" whileHover={{ scale: 1.05 }}>
                <div className="text-3xl font-bold text-yellow-600 mb-2">{collectionsForDisplay.length}</div>
                <div className="text-sm font-medium text-slate-700">Collections</div>
              </motion.div>
              <motion.div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl text-center" whileHover={{ scale: 1.05 }}>
                <div className="text-3xl font-bold text-green-600 mb-2">{(tags || []).length}</div>
                <div className="text-sm font-medium text-slate-700">Tags</div>
              </motion.div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-black mb-4">Trending Tags This Week</h2>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                {(tags || [])
                  .sort((a, b) => (b.weeklyCount || 0) - (a.weeklyCount || 0))
                  .slice(0, 6)
                  .map((tag) => (
                    <motion.div
                      key={tag.id}
                      className="bg-white border border-green-100 rounded-2xl shadow-md p-5 text-center flex flex-col items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-3xl font-bold text-purple-600">#{tag.name}</div>
                      <div className="text-sm text-slate-600">{tag.weeklyCount || 0} mentions</div>
                    </motion.div>
                  ))}
                {(tags || []).length === 0 && (
                  <p className="col-span-full text-center text-slate-600">No trending tags this week.</p>
                )}
              </motion.div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-black mb-4">Recent Bookmarks</h2>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                {(userBookmarks || [])
                  .slice(0, 6)
                  .map((bookmark) => (
                    <BookmarkCard
                      key={bookmark.id}
                      bookmark={bookmark}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                {(userBookmarks || []).length === 0 && (
                  <div className="col-span-full text-center text-slate-600 py-16">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-xl font-semibold mb-2">No bookmarks yet</p>
                    <p className="mb-4">Get started by adding your first bookmark!</p>
                    <button
                      onClick={() => setIsAddBookmarkModalOpen(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all"
                    >
                      Add Your First Bookmark
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}

        {/* All Bookmarks View (from the original AllBookmarksPage) */}
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
            // Ensure data passed matches BookmarkData interface for backend
            onAddBookmark={({ url, title, summary, tags, collections, category }) =>
              handleAddBookmark({ url, title, summary, tag_ids: tags, collection_ids: collections, category_id: category })}
            isLoading={addBookmarkLoading}
            error={addBookmarkError}
            categories={categories || []}
            collections={collections || []}
            tags={tags || []}
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