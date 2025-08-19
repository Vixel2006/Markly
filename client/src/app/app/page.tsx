"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, X, Folder, Star } from "lucide-react";
import { motion } from "framer-motion";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import AddBookmarkModal from "../components/dashboard/AddBookmarkModal";
import AddCategoryModal from "../components/dashboard/AddCategoryModal";
import AddCollectionModal from "../components/dashboard/AddCollectionModal";

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
  weeklyCount: number;
  prevCount: number;
  createdAt: string;
}

interface Bookmark {
  id: string;
  url: string;
  title: string;
  summary: string;
  tags: Tag[];
  collections: Collection[];
  category?: Category;
  datetime: string;
  userId: string;
  isFav: boolean;
  thumbnail?: string;
}

interface BookmarkData {
  url: string;
  title: string;
  summary: string;
  tags: string[];
  collections: string[];
  category?: string;
}

const MarklyDashboard = () => {
  const router = useRouter();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [activePanel, setActivePanel] = useState<string>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const [userBookmarks, setUserBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >(null);
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
        // router.push("/login");
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
    []
  );

  const handleAddNewTag = async (tagName: string): Promise<Tag | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8080/api/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: tagName }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData.message || `Failed to add tag: ${response.statusText}`
        );
      }
      const newTag: Tag = await response.json();
      setTags((prevTags) => [...prevTags, newTag]);
      return newTag;
    } catch (err: any) {
      console.error("Error adding new tag:", err);
      setError(err.message || "Failed to add tag.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        fetchedCategories,
        fetchedCollections,
        fetchedTags,
        fetchedBookmarks,
      ] = await Promise.all([
        fetchData<Category[]>("http://localhost:8080/api/categories"),
        fetchData<Collection[]>("http://localhost:8080/api/collections"),
        fetchData<Tag[]>("http://localhost:8080/api/tags"),
        fetchData<Bookmark[]>("http://localhost:8080/api/bookmarks"),
      ]);

      if (fetchedCategories)
        setCategories(
          fetchedCategories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            emoji: cat.emoji,
          }))
        );
      if (fetchedCollections)
        setCollections(
          fetchedCollections.map((col) => ({ id: col.id, name: col.name }))
        );
      if (fetchedTags)
        setTags(
          fetchedTags.map((tag) => ({
            id: tag.id,
            name: tag.name,
            weeklyCount: (tag as any).weekly_count || tag.weeklyCount,
            prevCount: (tag as any).prev_count || tag.prevCount,
            createdAt: (tag as any).created_at || tag.createdAt,
          }))
        );
      if (fetchedBookmarks) setUserBookmarks(fetchedBookmarks);
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

  const handleToggleFavorite = useCallback(
    async (bookmarkId: string) => {
      console.log(`Attempting to toggle favorite for bookmarkId: ${bookmarkId}`);
      const bookmarkToToggle = userBookmarks.find((bm) => bm.id === bookmarkId);
      if (!bookmarkToToggle) {
        console.warn(`Bookmark with ID ${bookmarkId} not found.`);
        return;
      }

      const newFavStatus = !bookmarkToToggle.isFav;
      console.log(`Current isFav: ${bookmarkToToggle.isFav}, new status will be: ${newFavStatus}`);

      try {
        const updatedBm = await fetchData<Bookmark>(
          `http://localhost:8080/api/bookmarks/${bookmarkId}`,
          "PUT",
          { isFav: newFavStatus }
        );
        if (updatedBm) {
          console.log("Bookmark updated successfully on backend:", updatedBm);
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
        const newBookmark = await fetchData<Bookmark>(
          "http://localhost:8080/api/bookmarks",
          "POST",
          { ...bookmarkData }
        );
        if (newBookmark) {
          setUserBookmarks((prev) => [newBookmark, ...prev]);
          setIsAddBookmarkModalOpen(false);
          await loadDashboardData();
        }
      } catch (err: any) {
        setAddBookmarkError(err.message || "Failed to add bookmark.");
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
          await loadDashboardData();
          setIsAddCategoryModalOpen(false);
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
          setCollections((prev) => [...prev, newCollection]);
          await loadDashboardData();
          setIsAddCollectionModalOpen(false);
        }
      } catch (err: any) {
        setAddCollectionError(err.message || "Failed to add collection.");
      } finally {
        setAddCollectionLoading(false);
      }
    },
    [fetchData, loadDashboardData]
  );

  const categoriesForDisplay: CategoryForDisplay[] = useMemo(() => {
    return categories.map((cat) => {
      const count = userBookmarks.filter(
        (bm) => bm.category?.id === cat.id
      ).length;
      const displayIcon = cat.emoji || "📚";
      let assignedColor = "bg-gray-500";
      switch (cat.name.toLowerCase()) {
        case "development":
          assignedColor = "bg-blue-500";
          break;
        case "design":
          assignedColor = "bg-purple-500";
          break;
        case "productivity":
          assignedColor = "bg-green-500";
          break;
        case "marketing":
          assignedColor = "bg-red-500";
          break;
        case "finance":
          assignedColor = "bg-yellow-500";
          break;
        default:
          assignedColor = "bg-gray-500";
          break;
      }
      return {
        id: cat.id,
        name: cat.name,
        count: count,
        icon: displayIcon,
        color: assignedColor,
      };
    });
  }, [categories, userBookmarks]);

  const collectionsForDisplay: CollectionForDisplay[] = useMemo(() => {
    return collections.map((col) => ({
      ...col,
      count: userBookmarks.filter((bm) =>
        bm && bm.collections?.some((c) => c.id === col.id)
      ).length,
    }));
  }, [collections, userBookmarks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-slate-900 flex items-center justify-center">
        <p className="text-xl font-semibold text-slate-700">
          Loading your Markly knowledge base...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 text-red-700 flex flex-col items-center justify-center p-4">
        <p className="text-xl font-bold mb-4">Error Loading Dashboard</p>
        <p className="text-center">{error}</p>
        <p className="text-sm mt-2">
          Please check your network connection or try again later.
        </p>
      </div>
    );
  }

  const mainContentMl = isSidebarExpanded ? "ml-64" : "ml-16";
  const mainContentWidth = "";

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
        tags={tags}
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
          setActivePanel("bookmarks");
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
          onSearchChange={setSearchQuery}
          onAddBookmarkClick={() => setIsAddBookmarkModalOpen(true)}
          totalBookmarksCount={userBookmarks.length}
        />

        {activePanel === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <motion.div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl text-center" whileHover={{ scale: 1.05 }}>
              <div className="text-3xl font-bold text-pink-600 mb-2">{userBookmarks.length}</div>
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
              <div className="text-3xl font-bold text-green-600 mb-2">{tags.length}</div>
              <div className="text-sm font-medium text-slate-700">Tags</div>
            </motion.div>
          </div>
        )}

        {activePanel === "dashboard" && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-black mb-4">Trending Tags This Week</h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {tags
                .sort((a, b) => b.weeklyCount - a.weeklyCount)
                .slice(0, 6)
                .map((tag) => (
                  <motion.div
                    key={tag.id}
                    className="bg-white border border-green-100 rounded-2xl shadow-md p-5 text-center flex flex-col items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-3xl font-bold text-purple-600">#{tag.name}</div>
                    <div className="text-sm text-slate-600">{tag.weeklyCount} mentions</div>
                  </motion.div>
                ))}
              {tags.length === 0 && (
                <p className="col-span-full text-center text-slate-600">No trending tags this week.</p>
              )}
            </motion.div>
          </div>
        )}

        {activePanel === "dashboard" && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-black mb-4">Recent Bookmarks</h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {userBookmarks
                .slice(0, 6)
                .map((bookmark) => (
                  <motion.div
                    key={bookmark.id}
                    className="bg-white border border-green-100 rounded-2xl shadow-md p-5 flex flex-col justify-between cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => router.push(`/app/bookmarks/${bookmark.id}`)}
                  >
                    <h3 className="text-lg font-semibold text-black mb-2 line-clamp-1">{bookmark.title}</h3>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-3">{bookmark.summary}</p>
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()} /* Prevent card click from triggering when clicking URL */
                      className="text-purple-600 hover:underline text-xs truncate"
                    >
                      {bookmark.url}
                    </a>
                    <div className="text-xs text-slate-500 mt-3 flex items-center justify-between">
                      <span>{new Date(bookmark.datetime).toLocaleDateString()}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(bookmark.id);
                        }}
                        className="p-1 rounded-full hover:bg-yellow-100 transition-colors"
                      >
                        <Star
                          className={`w-5 h-5 ${bookmark.isFav ? "text-yellow-500 fill-current" : "text-slate-400"}`}
                        />
                      </button>
                    </div>
                  </motion.div>
                ))}
              {userBookmarks.length === 0 && (
                <p className="col-span-full text-center text-slate-600">No recent bookmarks to display.</p>
              )}
            </motion.div>
          </div>
        )}

      </div>

      {/* Modals */}
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
