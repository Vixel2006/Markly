"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, BookOpen, LayoutList, Grip, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/dashboard/Sidebar";
import Header from "../../components/dashboard/Header";
import AddCollectionModal from "../../components/dashboard/AddCollectionModal";

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

interface Tag {
  id: string;
  name: string;
  weeklyCount: number;
  prevCount: number;
  createdAt: string;
}

interface Collection {
  id: string;
  name: string;
}

interface Bookmark {
  id: string;
  collections: Collection[];
  category?: Category;
}

interface CollectionForDisplay extends Collection {
  count: number;
}

const AllCollectionsPage = () => {
  const router = useRouter();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [activePanel, setActivePanel] = useState<string>("collections");
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');

  const [collections, setCollections] = useState<CollectionForDisplay[]>([]);
  const [categories, setCategories] = useState<CategoryForDisplay[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] = useState(false);
  const [addCollectionLoading, setAddCollectionLoading] = useState(false);
  const [addCollectionError, setAddCollectionError] = useState<string | null>(null);

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
      return await response.json();
    } catch (err: any) {
      console.error(`Network or API error fetching from ${url}: `, err);
      setError(err.message || `Failed to fetch from ${url}`);
      return null;
    }
  }, [router]);

  const loadCollectionsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedCollections, fetchedBookmarks, fetchedCategories, fetchedTags] = await Promise.all([
        fetchData<Collection[]>("http://localhost:8080/api/collections"),
        fetchData<Bookmark[]>("http://localhost:8080/api/bookmarks"),
        fetchData<Category[]>("http://localhost:8080/api/categories"),
        fetchData<Tag[]>("http://localhost:8080/api/tags"),
      ]);

      if (fetchedCollections && fetchedBookmarks) {
        const collectionsWithCounts = fetchedCollections.map(col => ({
          ...col,
          count: fetchedBookmarks.filter(bm =>
            bm?.collections?.some(c => c.id === col.id)
          ).length
        }));
        setCollections(collectionsWithCounts);
      }
      if (fetchedCategories) {
        const categoriesForDisplay = fetchedCategories.map((cat: Category) => {
          const count = fetchedBookmarks?.filter((bm: Bookmark) => bm.category?.id === cat.id).length || 0;
          let assignedColor = "bg-gray-500"; // Default color
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
            emoji: cat.emoji,
            count: count,
            icon: cat.emoji || "📚",
            color: assignedColor,
          };
        });
        setCategories(categoriesForDisplay);
      }
      if (fetchedTags) {
        setTags(fetchedTags.map(tag => ({...tag, weeklyCount: (tag as any).weekly_count || tag.weeklyCount, prevCount: (tag as any).prevCount, createdAt: (tag as any).created_at || tag.createdAt})));
      }
    } catch (err: any) {
      setError(err.message || "Failed to load collections.");
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

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
          await loadCollectionsData(); // Reload all data to update counts and list
          setIsAddCollectionModalOpen(false);
        }
      } catch (err: any) {
        setAddCollectionError(err.message || "Failed to add collection.");
      } finally {
        setAddCollectionLoading(false);
      }
    },
    [fetchData, loadCollectionsData]
  );

  useEffect(() => {
    loadCollectionsData();
  }, [loadCollectionsData]);

  const mainContentMl = isSidebarExpanded ? "ml-64" : "ml-16";

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 text-slate-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold"
        >
          Loading collections...
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
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        categories={categories}
        collections={collections}
        tags={tags}
        onCategorySelect={() => {}} // No category filtering on this page
        selectedCategoryId={null}
        onCollectionSelect={() => {}} // No collection filtering on this page (already showing all)
        selectedCollectionId={null}
        onTagSelect={() => {}} // No tag filtering on this page
        selectedTagId={null}
        onClearFilters={() => {}} // No filters to clear
        onAddCategoryClick={() => {}} // Not adding categories from here
        onAddCollectionClick={() => setIsAddCollectionModalOpen(true)}
      />

      <main className={`flex-1 transition-all duration-300 ${mainContentMl} p-8 custom-scrollbar`}>
        <Header
          searchQuery=""
          onSearchChange={() => {}} // No search on this page
          onAddBookmarkClick={() => {}} // Not adding bookmarks from here
          totalBookmarksCount={0} // Not showing total bookmarks here
        />

        <div className="flex justify-between items-center mb-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-gray-800"
          >
            Your Collections
          </motion.h1>
          <div className="flex gap-2">
            <motion.button
              onClick={() => setViewMode('gallery')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'gallery' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              whileHover={{ scale: 1.05 }}
            >
              <Grip className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              whileHover={{ scale: 1.05 }}
            >
              <LayoutList className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={() => setIsAddCollectionModalOpen(true)}
              className="ml-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <Plus className="w-5 h-5" />
              Add Collection
            </motion.button>
          </div>
        </div>

        {viewMode === 'gallery' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {collections.length > 0 ? (
              collections.map((collection) => (
                <motion.div
                  key={collection.id}
                  className="bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center justify-center border border-green-100 cursor-pointer"
                  whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                  transition={{ duration: 0.2 }}
                  onClick={() => router.push(`/app/collections/${collection.id}`)} // Placeholder for collection detail page
                >
                  <div className="text-5xl mb-3">
                    <Folder className="w-16 h-16 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">{collection.name}</h3>
                  <p className="text-gray-600 text-sm">{collection.count} bookmarks</p>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-600 py-10">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-semibold mb-2">No collections found</p>
                <p>Start organizing your bookmarks by adding new collections!</p>
                <button
                  onClick={() => setIsAddCollectionModalOpen(true)}
                  className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all"
                >
                  Add Your First Collection
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            {collections.length > 0 ? (
              collections.map((collection) => (
                <motion.div
                  key={collection.id}
                  className="bg-white rounded-3xl shadow-lg p-4 flex items-center justify-between border border-green-100 cursor-pointer"
                  whileHover={{ y: -3, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
                  transition={{ duration: 0.2 }}
                  onClick={() => router.push(`/app/collections/${collection.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <Folder className="w-8 h-8 text-blue-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{collection.name}</h3>
                      <p className="text-gray-600 text-sm">{collection.count} bookmarks</p>
                    </div>
                  </div>
                  <div className="text-gray-500 text-sm">
                    View Details
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center text-gray-600 py-10">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-semibold mb-2">No collections found</p>
                <p>Start organizing your bookmarks by adding new collections!</p>
                <button
                  onClick={() => setIsAddCollectionModalOpen(true)}
                  className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all"
                >
                  Add Your First Collection
                </button>
              </div>
            )}
          </motion.div>
        )}
      </main>

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

export default AllCollectionsPage;
