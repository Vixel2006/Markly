"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Bookmark as BookmarkIcon, Tag, Folder, Star, BookOpen } from "lucide-react";
import Sidebar from "../../../components/dashboard/Sidebar";
import Header from "../../../components/dashboard/Header";
import AddBookmarkModal from "../../../components/dashboard/AddBookmarkModal";
import AddCategoryModal from "../../../components/dashboard/AddCategoryModal";
import AddCollectionModal from "../../../components/dashboard/AddCollectionModal";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  emoji?: string;
}

interface Collection {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

interface Bookmark {
  id: string;
  title: string;
  url: string;
  summary: string;
  categories: Category[];
  collections: Collection[];
  tags: Tag[];
  isFav: boolean;
  createdAt: string;
}

interface BookmarkData {
  id?: string;
  title: string;
  url: string;
  summary: string;
  category_ids: string[];
  collection_ids: string[];
  tag_ids: string[];
  is_fav: boolean;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

interface CategoryForDisplay extends Category {
  count: number;
  icon: string;
  color: string;
}

interface CollectionForDisplay extends Collection {
  count: number;
}

const AllBookmarksPage = () => {
  const router = useRouter();

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [userBookmarks, setUserBookmarks] = useState<Bookmark[]>([]);
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
  const [activePanel, setActivePanel] = useState("bookmarks"); // Default to bookmarks view

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
      setError(err.message || `Failed to fetch from ${url}`);
      return null;
    }
  }, [router]);

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const bookmarks = await fetchData<Bookmark[]>("http://localhost:8080/api/bookmarks");
      if (bookmarks) {
        setUserBookmarks(bookmarks);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load bookmarks.");
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  const fetchCategories = useCallback(async () => {
    try {
      const fetchedCategories = await fetchData<CategoryForDisplay[]>("http://localhost:8080/api/categories");
      if (fetchedCategories) {
        setCategories(fetchedCategories.map(cat => ({
          ...cat,
          icon: cat.emoji || "📁", // Default icon if emoji is missing
          color: cat.color || "text-purple-600" // Default color if missing
        })));
      }
    } catch (err: any) {
      console.error("Failed to load categories: ", err);
    }
  }, [fetchData]);

  const fetchCollections = useCallback(async () => {
    try {
      const fetchedCollections = await fetchData<CollectionForDisplay[]>("http://localhost:8080/api/collections");
      if (fetchedCollections) {
        setCollections(fetchedCollections);
      }
    } catch (err: any) {
      console.error("Failed to load collections: ", err);
    }
  }, [fetchData]);

  const fetchTags = useCallback(async () => {
    try {
      const fetchedTags = await fetchData<Tag[]>("http://localhost:8080/api/tags");
      if (fetchedTags) {
        setTags(fetchedTags);
      }
    } catch (err: any) {
      console.error("Failed to load tags: ", err);
    }
  }, [fetchData]);

  useEffect(() => {
    fetchBookmarks();
    fetchCategories();
    fetchCollections();
    fetchTags();
  }, [fetchBookmarks, fetchCategories, fetchCollections, fetchTags]);

  const handleClearFilters = useCallback(() => {
    setSelectedCategoryId(null);
    setSelectedCollectionId(null);
    setSelectedTagId(null);
    setSearchQuery("");
  }, []);

  const handleAddBookmark = useCallback(async (bookmarkData: BookmarkData) => {
    setAddBookmarkLoading(true);
    setAddBookmarkError(null);
    try {
      const newBookmark = await fetchData<Bookmark>("http://localhost:8080/api/bookmarks", "POST", bookmarkData);
      if (newBookmark) {
        setUserBookmarks((prev) => [newBookmark, ...prev]);
        setIsAddBookmarkModalOpen(false);
      }
    } catch (err: any) {
      setAddBookmarkError(err.message || "Failed to add bookmark.");
    } finally {
      setAddBookmarkLoading(false);
    }
  }, [fetchData]);

  const handleAddNewTag = useCallback(async (tagName: string): Promise<string | null> => {
    const existingTag = tags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase());
    if (existingTag) {
      return existingTag.id;
    }

    try {
      const newTag = await fetchData<Tag>("http://localhost:8080/api/tags", "POST", { name: tagName });
      if (newTag) {
        setTags((prev) => [...prev, newTag]);
        return newTag.id;
      }
    } catch (err: any) {
      console.error("Failed to create new tag:", err);
      return null;
    }
    return null;
  }, [fetchData, tags]);

  const handleAddCategory = useCallback(async (name: string, emoji: string) => {
    setAddCategoryLoading(true);
    setAddCategoryError(null);
    try {
      const newCategory = await fetchData<Category>("http://localhost:8080/api/categories", "POST", { name, emoji });
      if (newCategory) {
        // Re-fetch categories to get updated counts and ensure consistency
        await fetchCategories();
        setIsAddCategoryModalOpen(false);
      }
    } catch (err: any) {
      setAddCategoryError(err.message || "Failed to add category.");
    } finally {
      setAddCategoryLoading(false);
    }
  }, [fetchData, fetchCategories]);

  const handleAddCollection = useCallback(async (name: string) => {
    setAddCollectionLoading(true);
    setAddCollectionError(null);
    try {
      const newCollection = await fetchData<Collection>("http://localhost:8080/api/collections", "POST", { name });
      if (newCollection) {
        // Re-fetch collections to get updated counts and ensure consistency
        await fetchCollections();
        setIsAddCollectionModalOpen(false);
      }
    } catch (err: any) {
      setAddCollectionError(err.message || "Failed to add collection.");
    } finally {
      setAddCollectionLoading(false);
    }
  }, [fetchData, fetchCollections]);

  const handleToggleFavorite = useCallback(async (bookmarkId: string) => {
    const currentBookmark = userBookmarks.find(bm => bm.id === bookmarkId);
    if (!currentBookmark) return;

    const newFavStatus = !currentBookmark.isFav;
    try {
      const updatedBm = await fetchData<Bookmark>(
        `http://localhost:8080/api/bookmarks/${bookmarkId}`,
        "PUT",
        { is_fav: newFavStatus }
      );
      if (updatedBm) {
        setUserBookmarks(prev => prev.map(bm => bm.id === bookmarkId ? { ...bm, isFav: updatedBm.isFav } : bm));
      }
    } catch (err: any) {
      setError(err.message || "Failed to toggle favorite status.");
    }
  }, [userBookmarks, fetchData]);

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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-green-50 to-green-200 text-slate-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold"
        >
          Loading bookmarks...
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
          className="text-xl font-semibold"
        >
          Error: {error}
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
        <Header onAddBookmarkClick={() => setIsAddBookmarkModalOpen(true)} onSearch={setSearchQuery} searchQuery={searchQuery} />

        {/* All Bookmarks View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredBookmarks.length > 0 ? (
            filteredBookmarks.map((bookmark) => (
              <motion.div
                key={bookmark.id}
                className="bg-white rounded-3xl shadow-lg p-6 flex flex-col justify-between border border-green-100 cursor-pointer"
                whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                transition={{ duration: 0.2 }}
                onClick={() => router.push(`/app/bookmarks/${bookmark.id}`)}
              >
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{bookmark.title}</h3>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:underline text-sm mb-3 block truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {bookmark.url}
                  </a>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{bookmark.summary}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {bookmark.categories?.map((cat) => (
                      <span
                        key={cat.id}
                        className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium"
                      >
                        {cat.name}
                      </span>
                    ))}
                    {bookmark.collections?.map((col) => (
                      <span
                        key={col.id}
                        className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium"
                      >
                        <Folder className="inline-block w-3 h-3 mr-1" />
                        {col.name}
                      </span>
                    ))}
                    {bookmark.tags?.map((tag) => (
                      <span
                        key={tag.id}
                        className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium"
                      >
                        <Tag className="inline-block w-3 h-3 mr-1" />
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center text-gray-500 text-xs">
                  <span>{new Date(bookmark.createdAt).toLocaleDateString()}</span>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(bookmark.id);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        bookmark.isFav ? "text-yellow-400 fill-current" : "text-gray-400"
                      }`}
                    />
                  </motion.button>
                </div>
              </motion.div>
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
      </main>

      <AnimatePresence>
        {isAddBookmarkModalOpen && (
          <AddBookmarkModal
            onClose={() => setIsAddBookmarkModalOpen(false)}
            onAddBookmark={handleAddBookmark}
            loading={addBookmarkLoading}
            error={addBookmarkError}
            categories={categories}
            collections={collections}
            tags={tags}
            onAddNewTag={handleAddNewTag}
          />
        )}
        {isAddCategoryModalOpen && (
          <AddCategoryModal
            onClose={() => setIsAddCategoryModalOpen(false)}
            onAddCategory={handleAddCategory}
            loading={addCategoryLoading}
            error={addCategoryError}
          />
        )}
        {isAddCollectionModalOpen && (
          <AddCollectionModal
            onClose={() => setIsAddCollectionModalOpen(false)}
            onAddCollection={handleAddCollection}
            loading={addCollectionLoading}
            error={addCollectionError}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllBookmarksPage;
