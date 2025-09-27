"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react"; // Added useMemo
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";


import BookmarkCard from "../../../components/dashboard/BookmarkCard"; // Import BookmarkCard
import { BookOpen, ArrowLeft, Search, Filter, X } from "lucide-react";
import AddBookmarkModal from "../../../components/dashboard/AddBookmarkModal"; // For Add Bookmark functionality
import AddCategoryModal from "../../../components/dashboard/AddCategoryModal"; // For Add Category functionality
import AddCollectionModal from "../../../components/dashboard/AddCollectionModal"; // For Add Collection functionality


// --- Consistent Interfaces (Re-using from MarklyDashboard for consistency) ---
// Frontend Category interface
interface Category {
  id: string;
  name: string;
  emoji?: string;
}

// Frontend Category for display in sidebar
interface CategoryForDisplay extends Category {
  count: number;
  icon: string;
  color: string;
}

// Frontend Collection interface
interface Collection {
  id: string;
  name: string;
}

// Frontend Collection for display in sidebar
interface CollectionForDisplay extends Collection {
  count: number;
}

// Frontend Tag interface (consistent with MarklyDashboard)
interface Tag {
  id: string;
  name: string;
  weeklyCount?: number; // Optional, might not be displayed everywhere
  prevCount?: number;   // Optional
  createdAt?: string;   // Optional
}

// Backend Bookmark structure (snake_case from API, raw IDs)
interface BackendBookmark {
  id: string;
  url: string;
  title: string;
  summary: string;
  tags: string[]; // Array of tag IDs (strings)
  collections: string[]; // Array of collection IDs (strings)
  category: string | null; // Single category ID (string) or null
  created_at: string;
  user_id: string;
  is_fav: boolean;
  thumbnail?: string;
}

// Frontend Bookmark structure (camelCase, hydrated with full objects)
// This is the type BookmarkCard expects
interface FrontendBookmark {
  id: string;
  url: string;
  title: string;
  summary: string;
  tags: Tag[]; // Full Tag objects
  collections: Collection[]; // Full Collection objects
  categories: Category[]; // Full Category objects (even if just one)
  createdAt: string;
  isFav: boolean;
  userId?: string; // Optional, only if needed for display
  thumbnail?: string;
}

// BookmarkData interface for sending data to the backend API
interface BookmarkData {
  url: string;
  title: string;
  summary: string;
  tags: string[]; // Array of string IDs
  collections: string[]; // Array of string IDs
  category_id?: string; // Optional single category ID
  is_fav?: boolean;
}
// --- End Interfaces ---

const CollectionBookmarksPage = () => {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.collectionId as string;


  const [bookmarks, setBookmarks] = useState<FrontendBookmark[]>([]); // FIX: Use FrontendBookmark
  const [collectionName, setCollectionName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for modals and their loading/error
  const [isAddBookmarkModalOpen, setIsAddBookmarkModalOpen] = useState(false);
  const [addBookmarkLoading, setAddBookmarkLoading] = useState(false);
  const [addBookmarkError, setAddBookmarkError] = useState<string | null>(null);

  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [addCategoryLoading, setAddCategoryLoading] = useState(false);
  const [addCategoryError, setAddCategoryError] = useState<string | null>(null);

  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] = useState(false);
  const [addCollectionLoading, setAddCollectionLoading] = useState(false);
  const [addCollectionError, setAddCollectionError] = useState<string | null>(null);

  const [sidebarCategories, setSidebarCategories] = useState<CategoryForDisplay[]>([]);
  const [sidebarCollections, setSidebarCollections] = useState<CollectionForDisplay[]>([]);
  const [sidebarTags, setSidebarTags] = useState<Tag[]>([]); // FIX: Use consistent Tag interface
  const [allUserBookmarksForSidebar, setAllUserBookmarksForSidebar] = useState<FrontendBookmark[]>([]); // All bookmarks for sidebar counts

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]); // To hold all tags for filter dropdown

  const handleClearFilters = useCallback(() => {
    setSelectedCategoryId(null);
    setSelectedCollectionId(null);
    setSelectedTagId(null);
    setSearchQuery("");
  }, []);

  const isFilterActive = useMemo(() => {
    return (
      searchQuery !== "" ||
      selectedCategoryId !== null ||
      selectedCollectionId !== null ||
      selectedTagId !== null
    );
  }, [searchQuery, selectedCategoryId, selectedCollectionId, selectedTagId]);

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
        const contentType = response.headers.get("content-type");
        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/auth");
          throw new Error("Unauthorized. Please log in again.");
        }

        let errorMessage = `API call failed with status ${response.status}`;
        if (contentType && contentType.includes("application/json")) {
          const errData = await response.json();
          errorMessage = errData.message || errorMessage;
        } else {
          const errText = await response.text();
          errorMessage = errText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      // Handle 204 No Content for successful delete operations without a response body
      if (response.status === 204 || response.headers.get("Content-Length") === "0") {
        return null;
      }
      return await response.json();
    } catch (err: any) {
      console.error(`Network or API error fetching from ${url}: `, err);
      // Don't set global error here if handling specific modal errors
      // setError(err.message || `Failed to fetch from ${url}`); // Keep this line if you want to show it as main page error
      throw err; // Re-throw for specific modal error handling
    }
  }, [router]);

  // Helper to hydrate BackendBookmark to FrontendBookmark
  const hydrateBookmark = useCallback((
    bm: BackendBookmark,
    allCategories: Category[],
    allCollections: Collection[],
    allTags: Tag[]
  ): FrontendBookmark => {
    const hydratedTags = (bm.tags || [])
      .map(tagId => allTags.find(t => t.id === tagId))
      .filter((tag): tag is Tag => tag !== undefined);

    const hydratedCollections = (bm.collections || [])
      .map(colId => allCollections.find(c => c.id === colId))
      .filter((col): col is Collection => col !== undefined);

    const hydratedCategories = bm.category
      ? allCategories.filter(cat => cat.id === bm.category)
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
      userId: bm.user_id,
      thumbnail: bm.thumbnail,
    };
  }, []);

  const loadPageData = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!collectionId) {
      setError("Collection ID is missing.");
      setLoading(false);
      return;
    }

    try {
      // Fetch all necessary data concurrently
      const [
        fetchedCollectionDetails,
        allCategoriesRaw,
        allCollectionsRaw,
        allTagsRaw, // Use /api/tags/user for all user tags
        allBookmarksRaw, // All bookmarks for sidebar counts and general hydration
        filteredBookmarksRaw, // Bookmarks specific to this collection
      ] = await Promise.all([
        fetchData<Collection>(`http://localhost:8080/api/collections/${collectionId}`),
        fetchData<Category[]>("http://localhost:8080/api/categories"),
        fetchData<Collection[]>("http://localhost:8080/api/collections"),
        fetchData<Tag[]>("http://localhost:8080/api/tags/user"), // FIX: Correct endpoint for all user tags
        fetchData<BackendBookmark[]>("http://localhost:8080/api/bookmarks"),
        fetchData<BackendBookmark[]>(`http://localhost:8080/api/bookmarks?collections=${collectionId}`),
      ]);

      const actualAllCategories = allCategoriesRaw || [];
      const actualAllCollections = allCollectionsRaw || [];
      const actualAllTags = allTagsRaw || [];
      const actualAllBookmarks = allBookmarksRaw || [];
      const actualFilteredBookmarks = filteredBookmarksRaw || [];

      setAllTags(actualAllTags); // Set all tags for filter dropdown

      // Set Collection Name
      if (fetchedCollectionDetails) {
        setCollectionName(fetchedCollectionDetails.name);
      } else {
        setCollectionName("Unknown Collection");
      }

      // Hydrate all bookmarks for sidebar counts
      const hydratedAllBookmarks = actualAllBookmarks.map(bm =>
        hydrateBookmark(bm, actualAllCategories, actualAllCollections, actualAllTags)
      );
      setAllUserBookmarksForSidebar(hydratedAllBookmarks);

      // Hydrate filtered bookmarks for this page
      const hydratedFilteredBookmarks = actualFilteredBookmarks.map(bm =>
        hydrateBookmark(bm, actualAllCategories, actualAllCollections, actualAllTags)
      );
      setBookmarks(hydratedFilteredBookmarks);

      // Prepare data for sidebar collections
      const sidebarCollectionsWithCounts = actualAllCollections.map(col => ({
        ...col,
        count: hydratedAllBookmarks.filter(bm =>
          bm?.collections?.some(c => c.id === col.id)
        ).length
      }));
      setSidebarCollections(sidebarCollectionsWithCounts);

      // Prepare data for sidebar categories
      const sidebarCategoriesForDisplay = actualAllCategories.map((cat: Category) => {
        const count = hydratedAllBookmarks.filter((bm: FrontendBookmark) =>
          bm.categories?.some(c => c.id === cat.id)
        ).length || 0;
        let assignedColor = "bg-gray-500";
        switch (cat.name.toLowerCase()) {
          case "development": assignedColor = "bg-blue-500"; break;
          case "design": assignedColor = "bg-purple-500"; break;
          case "productivity": assignedColor = "bg-green-500"; break;
          case "marketing": assignedColor = "bg-red-500"; break;
          case "finance": assignedColor = "bg-yellow-500"; break;
          default: assignedColor = "bg-gray-500"; break;
        }
        return { id: cat.id, name: cat.name, emoji: cat.emoji, count: count, icon: cat.emoji || "📚", color: assignedColor };
      });
      setSidebarCategories(sidebarCategoriesForDisplay);

      // Prepare data for sidebar tags
      setSidebarTags(actualAllTags); // Tags are already hydrated from initial fetch

    } catch (err: any) {
      setError(err.message || "Failed to load collection bookmarks.");
      console.error("Error in loadPageData:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchData, collectionId, hydrateBookmark]);


  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  const handleToggleFavorite = useCallback(async (bookmarkId: string) => {
    const bookmarkToToggle = bookmarks.find(bm => bm.id === bookmarkId);
    if (!bookmarkToToggle) return;

    try {
      const newFavStatus = !bookmarkToToggle.isFav;
      await fetchData<BackendBookmark>(
        `http://localhost:8080/api/bookmarks/${bookmarkId}`,
        "PUT",
        { is_fav: newFavStatus }
      );
      // Re-fetch data to ensure consistency across the page and sidebar
      await loadPageData();
    } catch (err: any) {
      console.error("Failed to toggle favorite status:", err);
      // You could set a specific error state for this action if needed
    }
  }, [fetchData, bookmarks, loadPageData]);

  const handleAddNewTag = useCallback(async (tagName: string): Promise<Tag | null> => {
    const existingTag = sidebarTags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase());
    if (existingTag) {
      return existingTag;
    }
    try {
      const response = await fetchData<Tag>(`http://localhost:8080/api/tags`, "POST", { name: tagName });
      if (response) {
        // Update sidebarTags immediately
        setSidebarTags((prevTags) => [...prevTags, response]);
        return response;
      }
    } catch (err: any) {
      console.error("Error adding new tag:", err);
      // Set error for the modal if applicable
    }
    return null;
  }, [fetchData, sidebarTags]);

  const handleAddBookmark = useCallback(async (bookmarkData: BookmarkData) => {
    setAddBookmarkLoading(true);
    setAddBookmarkError(null);
    try {
      await fetchData<BackendBookmark>(
        "http://localhost:8080/api/bookmarks",
        "POST",
        bookmarkData
      );
      setIsAddBookmarkModalOpen(false);
      await loadPageData(); // Refresh all data
    } catch (err: any) {
      setAddBookmarkError(err.message || "Failed to add bookmark.");
    } finally {
      setAddBookmarkLoading(false);
    }
  }, [fetchData, loadPageData]);

  const handleAddCategory = useCallback(async (name: string, emoji: string) => {
    setAddCategoryLoading(true);
    setAddCategoryError(null);
    try {
      await fetchData<Category>(
        "http://localhost:8080/api/categories",
        "POST",
        { name, emoji }
      );
      setIsAddCategoryModalOpen(false);
      await loadPageData(); // Refresh all data
    } catch (err: any) {
      setAddCategoryError(err.message || "Failed to add category.");
    } finally {
      setAddCategoryLoading(false);
    }
  }, [fetchData, loadPageData]);

  const handleAddCollection = useCallback(async (name: string) => {
    setAddCollectionLoading(true);
    setAddCollectionError(null);
    try {
      await fetchData<Collection>(
        "http://localhost:8080/api/collections",
        "POST",
        { name }
      );
      setIsAddCollectionModalOpen(false);
      await loadPageData(); // Refresh all data
    } catch (err: any) {
      setAddCollectionError(err.message || "Failed to add collection.");
    } finally {
      setAddCollectionLoading(false);
    }
  }, [fetchData, loadPageData]);




  const filteredBookmarks = useMemo(() => {
    let filtered = bookmarks;

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(bookmark =>
        (bookmark.title ?? '').toLowerCase().includes(lowerCaseQuery) ||
        (bookmark.url ?? '').toLowerCase().includes(lowerCaseQuery) ||
        (bookmark.summary ?? '').toLowerCase().includes(lowerCaseQuery) ||
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

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookmarks, searchQuery, selectedCategoryId, selectedCollectionId, selectedTagId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 text-slate-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold"
        >
          Loading collection bookmarks...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-50 text-red-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold"
        >
          Error: {error}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">


      <main className={`flex-1 transition-all duration-300 p-8 custom-scrollbar`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Search and Filter Controls */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-600" /> Search & Filter Collection: {collectionName}
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search bookmarks by title, URL, tags..."
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
                      Category: {sidebarCategories.find(c => c.id === selectedCategoryId)?.name} <X className="w-3 h-3 ml-1 cursor-pointer hover:text-blue-900" onClick={() => setSelectedCategoryId(null)} />
                    </span>
                  )}
                  {selectedCollectionId && (
                    <span className="bg-blue-200 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                      Collection: {sidebarCollections.find(c => c.id === selectedCollectionId)?.name} <X className="w-3 h-3 ml-1 cursor-pointer hover:text-blue-900" onClick={() => setSelectedCollectionId(null)} />
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

          {/* Bookmarks Grid */}
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" /> Bookmarks in "{collectionName}" ({filteredBookmarks.length})
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" // Example layout for bookmarks
          >
          {filteredBookmarks.length > 0 ? (
            filteredBookmarks.map((bookmark) => (
              <BookmarkCard // FIX: Render BookmarkCard here
                key={bookmark.id}
                bookmark={bookmark}
                onToggleFavorite={handleToggleFavorite}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-600 py-10">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-semibold mb-2">No bookmarks in this collection</p>
              <p>Add some bookmarks and assign them to "{collectionName}".</p>
            </div>
          )}
        </motion.div>
        </motion.div>
      </main>

      {/* Modals for adding new items, shared with Dashboard */}
      <AddBookmarkModal
        isOpen={isAddBookmarkModalOpen}
        onClose={() => setIsAddBookmarkModalOpen(false)}
        onAddBookmark={({ url, title, summary, tags, collections, category_id, is_fav }) =>
          handleAddBookmark({ url, title, summary, tags, collections, category_id, is_fav })}
        isLoading={addBookmarkLoading}
        error={addBookmarkError}
        categories={sidebarCategories} // Pass sidebar categories to modal
        collections={sidebarCollections} // Pass sidebar collections to modal
        tags={sidebarTags} // Pass sidebar tags to modal
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

export default CollectionBookmarksPage;
