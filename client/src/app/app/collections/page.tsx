"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, BookOpen, LayoutList, Grip, Plus, Trash2, Search } from "lucide-react";
import { useRouter } from "next/navigation";


import AddCollectionModal from "../../components/dashboard/AddCollectionModal";
import ConfirmationModal from "../../components/dashboard/ConfirmationModel";

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

// FIX: Aligned Tag interface with MarklyDashboard's more complete definition
interface Tag {
  id: string;
  name: string;
  weeklyCount?: number; // Optional as it might not be relevant for all tag displays
  prevCount?: number;   // Optional
  createdAt?: string;   // Optional
}

interface Collection {
  id: string;
  name: string;
}

// FIX: Adjusted Bookmark interface to match backend's actual JSON output for IDs
interface BackendBookmarkRaw { // Renamed to avoid confusion, represents raw data from /api/bookmarks
  id: string;
  // These field names match the 'json' tags in your Go models.Bookmark
  tags: string[]; // Array of tag IDs (strings)
  collections: string[]; // Array of collection IDs (strings)
  category: string | null; // Category ID (string) or null
  // Other fields from BackendBookmark if needed for this page, e.g., url, title
  url: string;
  title: string;
  summary: string;
  created_at: string;
  user_id: string;
  is_fav: boolean;
}


interface CollectionForDisplay extends Collection {
  count: number;
}

const AllCollectionsPage = () => {
  const router = useRouter();

  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');
  const [searchQuery, setSearchQuery] = useState('');

  const [collections, setCollections] = useState<CollectionForDisplay[]>([]);
  const [categories, setCategories] = useState<CategoryForDisplay[]>([]);
  const [tags, setTags] = useState<Tag[]>([]); // Use consistent Tag interface

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] = useState(false);
  const [addCollectionLoading, setAddCollectionLoading] = useState(false);
  const [addCollectionError, setAddCollectionError] = useState<string | null>(null);

  // State for Confirmation Modal
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteCollectionLoading, setDeleteCollectionLoading] = useState(false);

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
          Authorization: `Bearer ${token}`,
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
      // For DELETE requests, response might be 204 No Content, so don't try to parse JSON.
      if (method === "DELETE" || response.status === 204) {
        return null; // Return null for no content
      }
      return await response.json();
    } catch (err: any) {
      console.error(`Network or API error fetching from ${url}: `, err);
      // Removed setError here to let the calling function handle error display if needed
      throw err; // Re-throw the error
    }
  }, [router]);

  const loadCollectionsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // FIX: Fetch all tags from the /api/tags/user endpoint for sidebar consistency
      const [fetchedCollections, fetchedBookmarks, fetchedCategories, fetchedTags] = await Promise.all([
        fetchData<Collection[]>("http://localhost:8080/api/collections"),
        fetchData<BackendBookmarkRaw[]>("http://localhost:8080/api/bookmarks"), // Use BackendBookmarkRaw
        fetchData<Category[]>("http://localhost:8080/api/categories"),
        fetchData<Tag[]>("http://localhost:8080/api/tags/user"), // Use /api/tags/user
      ]);

      const actualFetchedCollections = fetchedCollections || [];
      const actualFetchedBookmarks = fetchedBookmarks || [];
      const actualFetchedCategories = fetchedCategories || [];
      const actualFetchedTags = fetchedTags || [];


      if (actualFetchedCollections && actualFetchedBookmarks) {
        const collectionsWithCounts = actualFetchedCollections.map(col => ({
          ...col,
          // FIX: Correctly calculate bookmark count using the 'collections' field
          count: actualFetchedBookmarks.filter(bm =>
            bm?.collections?.some(cID => cID === col.id)
          ).length
        }));
        setCollections(collectionsWithCounts);
      } else {
        setCollections([]);
      }

      if (actualFetchedCategories && actualFetchedBookmarks) {
        const categoriesForDisplay = actualFetchedCategories.map((cat: Category) => {
          // FIX: Correctly calculate category count using the 'category' field
          const count = actualFetchedBookmarks?.filter((bm: BackendBookmarkRaw) => bm.category === cat.id).length || 0;
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
            emoji: cat.emoji,
            count: count,
            icon: cat.emoji || "📚",
            color: assignedColor,
          };
        });
        setCategories(categoriesForDisplay);
      } else {
        setCategories([]);
      }

      // FIX: Set tags directly from fetchedTags from /api/tags/user
      setTags(actualFetchedTags);

    } catch (err: any) {
      setError(err.message || "Failed to load collections.");
      console.error("Error loading collections data:", err);
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

  // Function to open the confirmation modal
  const promptDeleteCollection = useCallback(
    (collectionId: string, collectionName: string) => {
      setCollectionToDelete({ id: collectionId, name: collectionName });
      setIsConfirmDeleteModalOpen(true);
    },
    []
  );

  // Function to actually delete the collection after confirmation
  const confirmDeleteCollection = useCallback(async () => {
    if (!collectionToDelete) return;

    setDeleteCollectionLoading(true);
    setError(null); // Clear previous errors
    try {
      await fetchData(`http://localhost:8080/api/collections/${collectionToDelete.id}`, "DELETE");
      await loadCollectionsData(); // Reload data after successful deletion
      setIsConfirmDeleteModalOpen(false); // Close modal on success
      setCollectionToDelete(null); // Clear pending deletion
    } catch (err: any) {
      setError(err.message || "Failed to delete collection.");
      console.error("Error deleting collection:", err);
    } finally {
      setDeleteCollectionLoading(false);
    }
  }, [fetchData, loadCollectionsData, collectionToDelete]);

  useEffect(() => {
    loadCollectionsData();
  }, [loadCollectionsData]);

  // Sidebar components are passed categories, collections, and tags for display/counts.
  // These should be memoized if they are complex calculations, but for now direct state is fine.
  // No changes needed here from previous review for these memoized values as they are derived from state.



  const filteredCollections = useMemo(() => {
    if (!searchQuery) {
      return collections;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return collections.filter(collection =>
      collection.name.toLowerCase().includes(lowerCaseQuery)
    );
  }, [collections, searchQuery]);

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

  // Display error if loading is complete and there's an error
  if (error && !loading) {
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


        <div className="flex justify-between items-center mb-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-gray-800"
          >
            Your Collections
          </motion.h1>
          <div className="relative flex-grow mx-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search collections by name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 text-gray-900 border border-gray-300 focus:ring-2 focus:ring-green-300 focus:outline-none shadow-sm placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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

        {filteredCollections.length > 0 ? (
          viewMode === 'gallery' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredCollections.map((collection) => (
                <motion.div
                  key={collection.id}
                  className="bg-white rounded-3xl shadow-lg p-6 flex flex-col items-center justify-center border border-green-100 relative"
                  whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      promptDeleteCollection(collection.id, collection.name);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors z-10"
                    aria-label={`Delete collection ${collection.name}`}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="text-5xl mb-3 mt-4 cursor-pointer"
                    onClick={() => router.push(`/app/collections/${collection.id}`)}
                  >
                    <Folder className="w-16 h-16 text-blue-500" />
                  </div>
                  <h3
                    className="text-xl font-semibold text-gray-800 mb-1 cursor-pointer"
                    onClick={() => router.push(`/app/collections/${collection.id}`)}
                  >
                    {collection.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{collection.count} bookmarks</p> {/* This will now show the correct count */}
                </motion.div>
              ))}
            </motion.div>
          ) : ( // List View
            (<motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col gap-4"
            >
              {filteredCollections.map((collection) => (
                <motion.div
                  key={collection.id}
                  className="bg-white rounded-3xl shadow-lg p-4 flex items-center justify-between border border-green-100"
                  whileHover={{ y: -3, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className="flex items-center gap-4 cursor-pointer flex-grow"
                    onClick={() => router.push(`/app/collections/${collection.id}`)}
                  >
                    <Folder className="w-8 h-8 text-blue-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{collection.name}</h3>
                      <p className="text-gray-600 text-sm">{collection.count} bookmarks</p> {/* This will now show the correct count */}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-gray-500 text-sm">
                      View Details
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        promptDeleteCollection(collection.id, collection.name);
                      }}
                      className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      aria-label={`Delete collection ${collection.name}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>)
          )
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
      </main>
      <AddCollectionModal
        isOpen={isAddCollectionModalOpen}
        onClose={() => setIsAddCollectionModalOpen(false)}
        onAddCollection={handleAddCollection}
        isLoading={addCollectionLoading}
        error={addCollectionError}
      />
      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={isConfirmDeleteModalOpen}
        onClose={() => {
          setIsConfirmDeleteModalOpen(false);
          setCollectionToDelete(null);
        }}
        onConfirm={confirmDeleteCollection}
        title="Delete Collection"
        message={`Are you sure you want to delete the collection "${collectionToDelete?.name}"? All bookmarks within this collection will remain but will no longer be associated with this specific collection. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteCollectionLoading}
      />
    </div>
  );
};

export default AllCollectionsPage;
