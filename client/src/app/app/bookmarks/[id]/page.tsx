"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Folder, Tags, Star, Pencil, X, Plus } from "lucide-react"; // Added Plus for consistency in modals
import ReactMarkdown from 'react-markdown';

// Consistent component imports (adjusted paths to be relative to the page)
import Sidebar from "../../../components/dashboard/Sidebar";
import Header from "../../../components/dashboard/Header";
import AddBookmarkModal from "../../../components/dashboard/AddBookmarkModal"; // This is your original AddModal
import AddCategoryModal from "../../../components/dashboard/AddCategoryModal";
import AddCollectionModal from "../../../components/dashboard/AddCollectionModal";

// --- Consistent Interfaces (from MarklyDashboard and updated AddBookmarkModal) ---
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
  weeklyCount?: number;
  prevCount?: number;
  createdAt?: string;
}

// Backend Bookmark structure (snake_case from API)
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
  thumbnail?: string; // Optional thumbnail
}

// Frontend Bookmark structure (camelCase, hydrated with full objects)
interface FrontendBookmark {
  id: string;
  url: string;
  title: string;
  summary: string;
  tags: Tag[]; // Full Tag objects
  collections: Collection[]; // Full Collection objects
  categories: Category[]; // Full Category objects (even if just one)
  createdAt: string; // Consistent camelCase
  isFav: boolean; // Consistent camelCase
  userId: string; // From backend user_id
  thumbnail?: string; // Optional thumbnail
}

// BookmarkData interface for sending data to the backend API (consistent with MarklyDashboard)
interface BookmarkData {
  url: string;
  title: string;
  summary: string;
  tag_ids: string[]; // Backend expects snake_case IDs
  collection_ids: string[]; // Backend expects snake_case IDs
  category_id?: string; // Optional single category ID, backend expects snake_case
}
// --- End Consistent Interfaces ---

// --- New/Modified Interfaces for EditBookmarkModal ---
interface EditBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditBookmark: (bookmarkId: string, data: BookmarkData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  categories: Category[];
  collections: Collection[]; // Pass all collections
  tags: Tag[]; // Pass all tags
  onAddNewTag: (tagName: string) => Promise<Tag | null>;
  initialBookmark: FrontendBookmark;
}

// --- EditBookmarkModal Component (defined inline for this file) ---
const EditBookmarkModal: React.FC<EditBookmarkModalProps> = ({
  isOpen,
  onClose,
  onEditBookmark,
  isLoading,
  error,
  categories,
  collections, // Now receives all collections
  tags, // Now receives all tags
  onAddNewTag,
  initialBookmark,
}) => {
  const [title, setTitle] = useState(initialBookmark.title);
  const [url, setUrl] = useState(initialBookmark.url);
  const [summary, setSummary] = useState(initialBookmark.summary);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    initialBookmark.categories[0]?.id || undefined
  );
  // Initialize with IDs from initial bookmark's full objects
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    initialBookmark.collections.map((col) => col.id)
  );
  // Initialize with IDs from initial bookmark's full objects
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialBookmark.tags.map((tag) => tag.id)
  );
  const [newTagInput, setNewTagInput] = useState("");
  // Assuming isFav is part of initialBookmark and can be edited
  const [isFav, setIsFav] = useState(initialBookmark.isFav);


  // Reset form on initialBookmark change or modal open
  useEffect(() => {
    if (isOpen) {
      setTitle(initialBookmark.title);
      setUrl(initialBookmark.url);
      setSummary(initialBookmark.summary);
      setSelectedCategory(initialBookmark.categories[0]?.id || undefined);
      setSelectedCollections(initialBookmark.collections.map((col) => col.id));
      setSelectedTags(initialBookmark.tags.map((tag) => tag.id));
      setNewTagInput("");
      setIsFav(initialBookmark.isFav);
    }
  }, [isOpen, initialBookmark]);

  const handleTagAdd = async () => {
    if (newTagInput.trim() === "") return;
    const existingTag = tags.find(
      (tag) => tag.name.toLowerCase() === newTagInput.trim().toLowerCase()
    );

    if (existingTag) {
      if (!selectedTags.includes(existingTag.id)) {
        setSelectedTags((prev) => [...prev, existingTag.id]);
      }
    } else {
      const newTag = await onAddNewTag(newTagInput.trim());
      if (newTag && !selectedTags.includes(newTag.id)) {
        setSelectedTags((prev) => [...prev, newTag.id]);
      }
    }
    setNewTagInput("");
  };

  const handleTagRemove = (tagId: string) => {
    setSelectedTags((prev) => prev.filter((id) => id !== tagId));
  };

  // New handler for toggling collections (consistent with AddBookmarkModal)
  const handleCollectionToggle = (collectionId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    );
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) {
      alert("Title and URL are required.");
      return;
    }

    const bookmarkData: BookmarkData = {
      title,
      url,
      summary,
      tag_ids: selectedTags,
      collection_ids: selectedCollections,
      category_id: selectedCategory,
      is_fav: isFav, // Include is_fav for editing
    };

    await onEditBookmark(initialBookmark.id, bookmarkData);
  };

  if (!isOpen) return null;

  const modalVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  };


  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose} // Allow clicking outside to close
    >
      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto transform scale-95 custom-scrollbar" // Added overflow-y-auto
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">Edit Bookmark</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-green-200 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
              required
            />
          </div>
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-1">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-3 border border-green-200 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
              required
            />
          </div>
          <div>
            <label htmlFor="summary" className="block text-sm font-medium text-slate-700 mb-1">
              Summary (Markdown supported)
            </label>
            <textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3} // Consistent row count
              className="w-full p-3 border border-green-200 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
            ></textarea>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value || undefined)}
              className="w-full p-3 border border-green-200 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
            >
              <option value="">Select Category</option> {/* Consistent placeholder */}
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Collections field updated to be like tags for multi-selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Collections</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedCollections.map((colId) => {
                const collection = collections.find(c => c.id === colId);
                return collection ? (
                  <span key={colId} className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {collection.name}
                    <button
                      type="button"
                      onClick={() => handleCollectionToggle(colId)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
            {collections.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 border border-green-200 rounded-lg p-2 bg-green-50 max-h-28 overflow-y-auto custom-scrollbar">
                {collections.filter(col => !selectedCollections.includes(col.id)).map(col => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => handleCollectionToggle(col.id)}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            )}
            {collections.length === 0 && (
              <p className="text-sm text-slate-500">No collections available. Create some in the dashboard sidebar!</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map((tagId) => {
                const tag = tags.find((t) => t.id === tagId);
                return tag ? (
                  <span
                    key={tag.id}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag.name}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag.id)}
                      className="ml-1 text-purple-500 hover:text-purple-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleTagAdd();
                  }
                }}
                placeholder="Add new tag or select existing" // Consistent placeholder
                className="flex-grow p-3 border border-green-200 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-lg transition-colors flex items-center justify-center"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 border border-green-200 rounded-lg p-2 bg-green-50 max-h-28 overflow-y-auto custom-scrollbar">
                {tags.filter(tag => !selectedTags.includes(tag.id)).map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setSelectedTags([...selectedTags, tag.id])}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors"
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}
            {tags.length === 0 && (
              <p className="text-sm text-slate-500">No tags available. Add a new one above!</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFav"
              checked={isFav}
              onChange={(e) => setIsFav(e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-green-300 rounded"
            />
            <label htmlFor="isFav" className="text-sm font-medium text-slate-700">Mark as Favorite</label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? "Saving Changes..." : "Save Changes"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};
// --- End EditBookmarkModal Component ---


const BookmarkDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [activePanel, setActivePanel] = useState("bookmarks");
  const [searchQuery, setSearchQuery] = useState("");

  const [bookmark, setBookmark] = useState<FrontendBookmark | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allUserBookmarks, setAllUserBookmarks] = useState<FrontendBookmark[]>([]);

  const [isAddBookmarkModalOpen, setIsAddBookmarkModalOpen] = useState(false);
  const [addBookmarkLoading, setAddBookmarkLoading] = useState(false);
  const [addBookmarkError, setAddBookmarkError] = useState<string | null>(null);

  const [isEditBookmarkModalOpen, setIsEditBookmarkModalOpen] = useState(false);
  const [editBookmarkLoading, setEditBookmarkLoading] = useState(false);
  const [editBookmarkError, setEditBookmarkError] = useState<string | null>(null);

  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [addCategoryLoading, setAddCategoryLoading] = useState(false);
  const [addCategoryError, setAddCategoryError] = useState<string | null>(null);

  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] = useState(false);
  const [addCollectionLoading, setAddCollectionLoading] = useState(false);
  const [addCollectionError, setAddCollectionError] = useState<string | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);


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
        throw err;
      }
    },
    [router]
  );

  const loadPageData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [
        backendBookmark,
        fetchedCategories,
        fetchedCollections,
        fetchedTags,
        backendBookmarks,
      ] = await Promise.all([
        fetchData<BackendBookmark>(`http://localhost:8080/api/bookmarks/${id}`),
        fetchData<Category[]>("http://localhost:8080/api/categories"),
        fetchData<Collection[]>("http://localhost:8080/api/collections"),
        fetchData<Tag[]>("http://localhost:8080/api/tags"),
        fetchData<BackendBookmark[]>("http://localhost:8080/api/bookmarks"),
      ]);

      const actualCategories = fetchedCategories || [];
      const actualCollections = fetchedCollections || [];
      const actualTags = fetchedTags || [];
      const actualBackendBookmarks = backendBookmarks || [];

      setAllCategories(actualCategories);
      setAllCollections(actualCollections);
      setAllTags(actualTags);

      const hydratedAllBookmarks: FrontendBookmark[] = actualBackendBookmarks.map((bm) => {
        const hydratedTags = (bm.tags || [])
          .map((tagId) => actualTags.find((t) => t.id === tagId))
          .filter((tag): tag is Tag => tag !== undefined);
        const hydratedCollections = (bm.collections || [])
          .map((colId) => actualCollections.find((c) => c.id === colId))
          .filter((col): col is Collection => col !== undefined);
        const hydratedCategories = bm.category
          ? actualCategories.filter((cat) => cat.id === bm.category)
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
      });
      setAllUserBookmarks(hydratedAllBookmarks);

      if (backendBookmark) {
        const hydratedBookmark: FrontendBookmark = {
          id: backendBookmark.id,
          url: backendBookmark.url,
          title: backendBookmark.title,
          summary: backendBookmark.summary,
          tags: (backendBookmark.tags || [])
            .map(tagId => actualTags.find(t => t.id === tagId))
            .filter((tag): tag is Tag => tag !== undefined),
          collections: (backendBookmark.collections || [])
            .map(colId => actualCollections.find(c => c.id === colId))
            .filter((col): col is Collection => col !== undefined),
          categories: backendBookmark.category
            ? actualCategories.filter(cat => cat.id === backendBookmark.category)
            : [],
          createdAt: backendBookmark.created_at,
          isFav: backendBookmark.is_fav,
          userId: backendBookmark.user_id,
          thumbnail: backendBookmark.thumbnail,
        };
        setBookmark(hydratedBookmark);
      } else {
        setError("Bookmark not found.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch bookmark details.");
    } finally {
      setLoading(false);
    }
  }, [id, fetchData]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  const handleToggleFavorite = useCallback(async () => {
    if (!bookmark) return;
    setLoading(true);
    setError(null);
    try {
      const newFavStatus = !bookmark.isFav;
      const updatedBm = await fetchData<BackendBookmark>(
        `http://localhost:8080/api/bookmarks/${bookmark.id}`,
        "PUT",
        { is_fav: newFavStatus }
      );
      if (updatedBm) {
        setBookmark(prev => prev ? { ...prev, isFav: newFavStatus } : null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to toggle favorite status.");
    } finally {
      setLoading(false);
    }
  }, [bookmark, fetchData]);

  const handleAddNewTag = useCallback(async (tagName: string): Promise<Tag | null> => {
    const existingTag = allTags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase());
    if (existingTag) {
      return existingTag;
    }

    try {
      const response = await fetchData<Tag>(`http://localhost:8080/api/tags`, "POST", { name: tagName });
      if (response) {
        setAllTags((prevTags) => [...prevTags, response]);
        return response;
      }
    } catch (err: any) {
      console.error("Error adding new tag:", err);
    }
    return null;
  }, [fetchData, allTags]);

  const handleAddBookmark = useCallback(async (bookmarkData: BookmarkData) => {
    setAddBookmarkLoading(true);
    setAddBookmarkError(null);
    try {
      const newBookmark = await fetchData<BackendBookmark>(
        "http://localhost:8080/api/bookmarks",
        "POST",
        bookmarkData
      );
      if (newBookmark) {
        setIsAddBookmarkModalOpen(false);
        await loadPageData();
      }
    } catch (err: any) {
      setAddBookmarkError(err.message || "Failed to add bookmark.");
    } finally {
      setAddBookmarkLoading(false);
    }
  }, [fetchData, loadPageData]);

  const handleEditBookmark = useCallback(async (bookmarkId: string, bookmarkData: BookmarkData) => {
    setEditBookmarkLoading(true);
    setEditBookmarkError(null);
    try {
      const updatedBookmark = await fetchData<BackendBookmark>(
        `http://localhost:8080/api/bookmarks/${bookmarkId}`,
        "PUT",
        bookmarkData
      );
      if (updatedBookmark) {
        setIsEditBookmarkModalOpen(false);
        await loadPageData();
      }
    } catch (err: any) {
      setEditBookmarkError(err.message || "Failed to update bookmark.");
    } finally {
      setEditBookmarkLoading(false);
    }
  }, [fetchData, loadPageData]);


  const handleAddCategory = useCallback(async (name: string, emoji: string) => {
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
        await loadPageData();
      }
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
      const newCollection = await fetchData<Collection>(
        "http://localhost:8080/api/collections",
        "POST",
        { name }
      );
      if (newCollection) {
        setIsAddCollectionModalOpen(false);
        await loadPageData();
      }
    } catch (err: any) {
      setAddCollectionError(err.message || "Failed to add collection.");
    } finally {
      setAddCollectionLoading(false);
    }
  }, [fetchData, loadPageData]);

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
    return (allCategories || []).map((cat) => {
      const count = (allUserBookmarks || []).filter(
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
  }, [allCategories, allUserBookmarks]);

  const collectionsForDisplay: CollectionForDisplay[] = useMemo(() => {
    return (allCollections || []).map((col) => ({
      ...col,
      count: (allUserBookmarks || []).filter((bm) =>
        bm && bm.collections?.some((c) => c.id === col.id)
      ).length,
    }));
  }, [allCollections, allUserBookmarks]);


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
          Loading bookmark details...
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
          <p className="text-xl font-bold mb-4">Error Loading Bookmark</p>
          <p className="text-center mb-4">{error}</p>
          <button
            onClick={loadPageData}
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

  if (!bookmark) {
    return (
      <div className="min-h-screen bg-yellow-50 text-yellow-700 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold text-yellow-600"
        >
          Bookmark not found.
        </motion.div>
      </div>
    );
  }

  const displayCategory = bookmark.categories.length > 0 ? bookmark.categories[0] : null;

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
        tags={allTags || []}
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
          totalBookmarksCount={(allUserBookmarks || []).length}
        />

        {/* Bookmark Detail Content */}
        <motion.div
          className="bg-white rounded-3xl shadow-xl p-8 max-w-4xl mx-auto border border-green-100 mt-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-extrabold text-black leading-tight">
              {bookmark.title}
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditBookmarkModalOpen(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Edit Bookmark"
              >
                <Pencil className="w-6 h-6 text-slate-500 hover:text-slate-700" />
              </button>
              <button
                onClick={handleToggleFavorite}
                className="p-2 rounded-full hover:bg-yellow-100 transition-colors"
                aria-label="Toggle Favorite"
              >
                <Star
                  className={`w-8 h-8 ${bookmark.isFav ? "text-yellow-500 fill-current" : "text-slate-400"}`}
                />
              </button>
            </div>
          </div>

          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:underline text-lg mb-6 block truncate"
          >
            {bookmark.url}
          </a>

          <div className="text-slate-700 text-lg leading-relaxed mb-6 markdown-content">
            {bookmark.summary ? (
              <ReactMarkdown>{bookmark.summary}</ReactMarkdown>
            ) : (
              "No summary available."
            )}
          </div>

          {displayCategory && (
            <div className="flex items-center gap-3 bg-green-50 rounded-full px-4 py-2 text-green-800 text-sm font-medium mb-4 w-fit shadow-sm">
              <BookOpen className="w-4 h-4" />
              Category: {displayCategory.emoji} {displayCategory.name}
            </div>
          )}

          {bookmark.collections.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-black mb-2">Collections:</h3>
              <div className="flex flex-wrap gap-2">
                {bookmark.collections.map((col) => (
                  <span key={col.id} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm shadow-sm">
                    <Folder className="w-4 h-4" />
                    {col.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {bookmark.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {bookmark.tags.map((tag) => (
                  <span key={tag.id} className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm shadow-sm">
                    <Tags className="w-4 h-4" />
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="text-right text-sm text-slate-500 mt-8">
            Added on: {new Date(bookmark.createdAt).toLocaleDateString()} at {new Date(bookmark.createdAt).toLocaleTimeString()}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAddBookmarkModalOpen && (
          <AddBookmarkModal
            isOpen={isAddBookmarkModalOpen}
            onClose={() => setIsAddBookmarkModalOpen(false)}
            onAddBookmark={({ url, title, summary, tags, collections, category }) =>
              handleAddBookmark({ url, title, summary, tag_ids: tags, collection_ids: collections, category_id: category })}
            isLoading={addBookmarkLoading}
            error={addBookmarkError}
            categories={allCategories || []}
            collections={allCollections || []}
            tags={allTags || []}
            onAddNewTag={handleAddNewTag}
          />
        )}

        {isEditBookmarkModalOpen && bookmark && (
          <EditBookmarkModal
            isOpen={isEditBookmarkModalOpen}
            onClose={() => setIsEditBookmarkModalOpen(false)}
            onEditBookmark={handleEditBookmark}
            isLoading={editBookmarkLoading}
            error={editBookmarkError}
            categories={allCategories || []}
            collections={allCollections || []} // Pass all collections to EditModal
            tags={allTags || []} // Pass all tags to EditModal
            onAddNewTag={handleAddNewTag}
            initialBookmark={bookmark}
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
}

export default BookmarkDetailPage;