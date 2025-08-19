"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Star, Folder, Tag, BookOpen } from 'lucide-react';

import Sidebar from '../../../components/dashboard/Sidebar';
import Header from '../../../components/dashboard/Header';
import AddBookmarkModal from '../../../components/dashboard/AddBookmarkModal';
import AddCategoryModal from "../../../components/dashboard/AddCategoryModal";
import AddCollectionModal from "../../../components/dashboard/AddCollectionModal";
import BookmarkCard from '../../../components/dashboard/BookmarkCard';

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

interface Tag {
  id: string;
  name: string;
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
  categories?: Category[]; // Array of full category objects
  collections: Collection[]; // Array of full collection objects
  tags: Tag[]; // Array of full tag objects
  isFav: boolean; // Camel case for frontend
  createdAt: string; // Camel case for frontend
}

interface BookmarkData {
  id?: string;
  title: string;
  url: string;
  summary: string;
  tag_ids: string[];
  collection_ids: string[];
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

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [userBookmarks, setUserBookmarks] = useState<FrontendBookmark[]>([]);
  const [categories, setCategories] = useState<CategoryForDisplay[]>([]);
  const [collections, setCollections] = useState<CollectionForDisplay[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activePanel, setActivePanel] = useState("favorites");

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
        const errData = await response.json();
        throw new Error(errData.message || `API call failed with status ${response.status}`);
      }
      return await response.json();
    } catch (err: any) {
      console.error(`Network or API error fetching from ${url}: `, err);
      throw err; // Re-throw to be handled by calling function
    }
  }, [router]);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedBackendBookmarksData, fetchedCategoriesData, fetchedCollectionsData, fetchedTagsData] = await Promise.all([
        fetchData<BackendBookmark[]>("http://localhost:8080/api/bookmarks?isFav=true"),
        fetchData<Category[]>(`http://localhost:8080/api/categories`),
        fetchData<Collection[]>(`http://localhost:8080/api/collections`),
        fetchData<Tag[]>(`http://localhost:8080/api/tags`),
      ]);

      // Ensure we have arrays even if API returns null
      const actualCategories = fetchedCategoriesData || [];
      const actualCollections = fetchedCollectionsData || [];
      const actualTags = fetchedTagsData || [];
      const backendBookmarksData = fetchedBackendBookmarksData || [];

      // Set basic data first
      setTags(actualTags);

      // Hydrate bookmarks with full objects
      const hydratedBookmarks: FrontendBookmark[] = backendBookmarksData.map(bm => {
        const hydratedTags = (bm.tags || [])
          .map(tagId => actualTags.find(t => t.id === tagId))
          .filter((tag): tag is Tag => tag !== undefined);
        
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

      // Calculate categories with counts based on the hydrated bookmarks
      const categoriesWithCounts: CategoryForDisplay[] = actualCategories.map(cat => ({
        ...cat,
        count: hydratedBookmarks.filter(bm => 
          bm.categories?.some(c => c.id === cat.id)
        ).length,
        icon: cat.emoji || "📚",
        color: cat.color || getDefaultCategoryColor(cat.name),
      }));

      // Calculate collections with counts based on the hydrated bookmarks
      const collectionsWithCounts: CollectionForDisplay[] = actualCollections.map(col => ({
        ...col,
        count: hydratedBookmarks.filter(bm =>
          bm.collections?.some(c => c.id === col.id)
        ).length,
      }));

      setCategories(categoriesWithCounts);
      setCollections(collectionsWithCounts);

    } catch (err: any) {
      setError(err.message || "Failed to load favorite bookmarks.");
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  // Helper function to get default category colors
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

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleClearFilters = useCallback(() => {
    setSelectedCategoryId(null);
    setSelectedCollectionId(null);
    setSelectedTagId(null);
    setSearchQuery("");
  }, []);

  const handleAddNewTag = useCallback(async (tagName: string): Promise<Tag | null> => {
    const existingTag = tags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase());
    if (existingTag) {
      return existingTag;
    }

    try {
      const newTag = await fetchData<Tag>("http://localhost:8080/api/tags", "POST", { name: tagName });
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

  const handleAddBookmark = useCallback(async (bookmarkData: BookmarkData) => {
    setAddBookmarkLoading(true);
    setAddBookmarkError(null);
    try {
      const newBookmark = await fetchData<BackendBookmark>("http://localhost:8080/api/bookmarks", "POST", {
        url: bookmarkData.url,
        title: bookmarkData.title,
        summary: bookmarkData.summary,
        tag_ids: bookmarkData.tag_ids,
        collection_ids: bookmarkData.collection_ids,
        category_id: bookmarkData.category_id,
        is_fav: bookmarkData.is_fav,
      });
      
      if (newBookmark) {
        setIsAddBookmarkModalOpen(false);
        // Reload all data to ensure consistency
        await loadAllData();
      }
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
        // Reload all data to ensure consistency
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
        // Reload all data to ensure consistency
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
      const updatedBm = await fetchData<BackendBookmark>(
        `http://localhost:8080/api/bookmarks/${bookmarkId}`,
        "PUT",
        { is_fav: newFavStatus }
      );
      if (updatedBm) {
        // Since this is the favorites page, remove the bookmark if it's unfavorited
        if (!newFavStatus) {
          setUserBookmarks(prev => prev.filter(bm => bm.id !== bookmarkId));
        } else {
          // Update the bookmark in place if it's still favorited
          setUserBookmarks(prev => prev.map(bm => 
            bm.id === bookmarkId ? { ...bm, isFav: newFavStatus } : bm
          ));
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to toggle favorite status.");
    }
  }, [userBookmarks, fetchData]);

  const filteredBookmarks = useMemo(() => {
    let filtered = userBookmarks || []; // Add null check

    if (searchQuery) {
      filtered = filtered.filter(bookmark =>
        bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(searchQuery.toLowerCase())
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

    // Sort by creation date, newest first
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [userBookmarks, searchQuery, selectedCategoryId, selectedCollectionId, selectedTagId]);

  const mainContentMl = isSidebarExpanded ? "ml-64" : "ml-16";

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-green-50 to-green-200 text-slate-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold"
        >
          Loading favorite bookmarks...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-red-50 to-red-100 text-red-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xl font-semibold mb-2">Error Loading Favorites</p>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => loadAllData()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        categories={categories}
        collections={collections}
        tags={tags}
        onCategorySelect={setSelectedCategoryId}
        selectedCategoryId={selectedCategoryId}
        onCollectionSelect={setSelectedCollectionId}
        selectedCollectionId={selectedCollectionId}
        onTagSelect={setSelectedTagId}
        selectedTagId={selectedTagId}
        onClearFilters={handleClearFilters}
        onAddCategoryClick={() => setIsAddCategoryModalOpen(true)}
        onAddCollectionClick={() => setIsAddCollectionModalOpen(true)}
      />

      <main className={`flex-1 transition-all duration-300 ${mainContentMl} p-8 custom-scrollbar`}>
        <Header 
          onAddBookmarkClick={() => setIsAddBookmarkModalOpen(true)} 
          onSearchChange={setSearchQuery} 
          searchQuery={searchQuery} 
          totalBookmarksCount={userBookmarks.length} 
        />

        {/* Favorite Bookmarks View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-6 h-6 text-yellow-500" />
            <h1 className="text-2xl font-bold text-gray-900">Favorite Bookmarks</h1>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
              {filteredBookmarks.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookmarks.length > 0 ? (
              filteredBookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-600 py-16">
                <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-semibold mb-2">No favorite bookmarks found</p>
                <p className="mb-4">
                  {searchQuery || selectedCategoryId || selectedCollectionId || selectedTagId
                    ? "No favorites match your current filters."
                    : "You haven't marked any bookmarks as favorite yet."
                  }
                </p>
                {(searchQuery || selectedCategoryId || selectedCollectionId || selectedTagId) && (
                  <button
                    onClick={handleClearFilters}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all mr-4"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  onClick={() => router.push("/app/bookmarks/all")}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all"
                >
                  View All Bookmarks
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <AnimatePresence>
        {isAddBookmarkModalOpen && (
          <AddBookmarkModal
            onClose={() => setIsAddBookmarkModalOpen(false)}
            onAddBookmark={handleAddBookmark}
            isLoading={addBookmarkLoading}
            error={addBookmarkError}
            categories={categories}
            collections={collections}
            tags={tags}
            onAddNewTag={handleAddNewTag}
            isOpen={isAddBookmarkModalOpen}
          />
        )}
        {isAddCategoryModalOpen && (
          <AddCategoryModal
            onClose={() => setIsAddCategoryModalOpen(false)}
            onAddCategory={handleAddCategory}
            isLoading={addCategoryLoading}
            error={addCategoryError}
            isOpen={isAddCategoryModalOpen}
          />
        )}
        {isAddCollectionModalOpen && (
          <AddCollectionModal
            onClose={() => setIsAddCollectionModalOpen(false)}
            onAddCollection={handleAddCollection}
            isLoading={addCollectionLoading}
            error={addCollectionError}
            isOpen={isAddCollectionModalOpen}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FavoriteBookmarksPage;