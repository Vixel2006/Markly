"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Folder, Tags, Star, Pencil, X, Plus } from "lucide-react";
import ReactMarkdown from 'react-markdown'; // Already imported, good!

// Consistent component imports (adjusted paths to be relative to the page)
import Sidebar from "../../../components/dashboard/Sidebar";
import Header from "../../../components/dashboard/Header";
import AddBookmarkModal from "../../../components/dashboard/AddBookmarkModal";
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

// FIX: BookmarkData interface for sending data to the backend API (consistent with backend's AddBookmarkRequestBody/BookmarkUpdate)
interface BookmarkData {
  url: string;
  title: string;
  summary: string;
  tags: string[]; // Changed from tag_ids to tags
  collections: string[]; // Changed from collection_ids to collections
  category_id?: string; // Optional single category ID
  is_fav?: boolean; // Added for PUT requests
}
// --- End Consistent Interfaces ---

// --- New/Modified Interfaces for EditBookmarkModal ---
interface EditBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  // FIX: onEditBookmark now expects BookmarkData matching backend's PUT payload
  onEditBookmark: (bookmarkId: string, data: BookmarkData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  categories: Category[];
  collections: Collection[];
  tags: Tag[];
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
  collections,
  tags,
  onAddNewTag,
  initialBookmark,
}) => {
  const [title, setTitle] = useState(initialBookmark.title);
  const [url, setUrl] = useState(initialBookmark.url);
  const [summary, setSummary] = useState(initialBookmark.summary);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    initialBookmark.categories[0]?.id || undefined
  );
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    initialBookmark.collections.map((col) => col.id)
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialBookmark.tags.map((tag) => tag.id)
  );
  const [newTagInput, setNewTagInput] = useState("");
  const [isFav, setIsFav] = useState(initialBookmark.isFav);
  const [isAddingTag, setIsAddingTag] = useState(false); // Local loading state for adding tag


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
      setIsAddingTag(false); // Reset this too
    }
  }, [isOpen, initialBookmark]);

  const handleTagAdd = async () => {
    if (newTagInput.trim() === "" || isAddingTag) return;

    setIsAddingTag(true);
    try {
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
    } catch (tagError) {
      console.error("Error adding tag:", tagError);
      // You might want to display a user-friendly error here within the modal
    } finally {
      setIsAddingTag(false);
    }
  };

  const handleTagToggle = (tagId: string) => { // Renamed from handleTagRemove for consistency
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };


  const handleCollectionToggle = (collectionId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    );
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      alert("Title and URL are required.");
      return;
    }

    const bookmarkData: BookmarkData = {
      title: title.trim(),
      url: url.trim(),
      summary: summary ? summary.trim() : "",
      // FIX: Changed to 'tags' and 'collections' to match backend
      tags: selectedTags,
      collections: selectedCollections,
      // FIX: Correctly send undefined if no category is selected or it's an empty string
      category_id: selectedCategory && selectedCategory !== "" ? selectedCategory : undefined,
      is_fav: isFav,
    };

    await onEditBookmark(initialBookmark.id, bookmarkData);
  };

  if (!isOpen) return null;

  const modalVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  };

  const isFormDisabled = isLoading || isAddingTag; // Combine loading states for form

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto transform scale-95 custom-scrollbar"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-black">Edit Bookmark</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
            disabled={isFormDisabled} // Disable close button while saving
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
              disabled={isFormDisabled}
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
              disabled={isFormDisabled}
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
              rows={3}
              className="w-full p-3 border border-green-200 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
              disabled={isFormDisabled}
              placeholder="Optional description or notes (supports Markdown)"
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
              disabled={isFormDisabled}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji ? `${cat.emoji} ${cat.name}` : cat.name} {/* Display emoji */}
                </option>
              ))}
            </select>
          </div>

          {/* Collections field updated for multi-selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Collections</label>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[24px]">
              {selectedCollections.map((colId) => {
                const collection = collections.find(c => c.id === colId);
                return collection ? (
                  <span key={colId} className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {collection.name}
                    <button
                      type="button"
                      onClick={() => handleCollectionToggle(colId)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                      disabled={isFormDisabled}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
            {collections.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2 border border-green-200 rounded-lg p-2 bg-green-50 max-h-28 overflow-y-auto custom-scrollbar">
                {collections.filter(col => !selectedCollections.includes(col.id)).map(col => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => handleCollectionToggle(col.id)}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors disabled:opacity-50"
                    disabled={isFormDisabled}
                  >
                    {col.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No collections available.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[24px]">
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
                      onClick={() => handleTagToggle(tag.id)} // Use toggle for consistency
                      className="ml-1 text-purple-500 hover:text-purple-800"
                      disabled={isFormDisabled}
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
                placeholder="Add new tag or select existing"
                className="flex-grow p-3 border border-green-200 rounded-lg bg-green-50 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all"
                disabled={isFormDisabled || isAddingTag}
              />
              <button
                type="button"
                onClick={handleTagAdd}
                className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isFormDisabled || isAddingTag || !newTagInput.trim()}
              >
                 {isAddingTag ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
              </button>
            </div>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2 border border-green-200 rounded-lg p-2 bg-green-50 max-h-28 overflow-y-auto custom-scrollbar">
                {tags.filter(tag => !selectedTags.includes(tag.id)).map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)} // Use toggle for consistency
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors disabled:opacity-50"
                    disabled={isFormDisabled}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No tags available.</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFav"
              checked={isFav}
              onChange={(e) => setIsFav(e.target.checked)}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-green-300 rounded"
              disabled={isFormDisabled}
            />
            <label htmlFor="isFav" className="text-sm font-medium text-slate-700">Mark as Favorite</label>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <motion.button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isFormDisabled || !title.trim() || !url.trim()}
            whileHover={!isFormDisabled ? { scale: 1.02 } : {}}
            whileTap={!isFormDisabled ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Changes...
              </>
            ) : (
              "Save Changes"
            )}
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
  const [activePanel, setActivePanel] = useState("bookmarks"); // Defaulting to 'bookmarks' for sidebar highlighting
  const [searchQuery, setSearchQuery] = useState("");

  const [bookmark, setBookmark] = useState<FrontendBookmark | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allUserBookmarks, setAllUserBookmarks] = useState<FrontendBookmark[]>([]); // Used for sidebar counts

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

  // Filters for sidebar, not directly affecting this page, but good for consistency
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
    if (!id) {
        router.push("/app/dashboard"); // Redirect if no ID is present
        return;
    }
    setLoading(true);
    setError(null);
    try {
      // FIX: Fetch all categories, collections, ALL user tags, and then the specific bookmark concurrently
      const [
        fetchedCategories,
        fetchedCollections,
        fetchedTags, // Correctly fetch all user tags
        backendBookmark,
        allBackendBookmarks, // For sidebar counts
      ] = await Promise.all([
        fetchData<Category[]>("http://localhost:8080/api/categories"),
        fetchData<Collection[]>("http://localhost:8080/api/collections"),
        fetchData<Tag[]>("http://localhost:8080/api/tags/user"), // <-- CORRECTED TAG FETCH ENDPOINT
        fetchData<BackendBookmark>(`http://localhost:8080/api/bookmarks/${id}`),
        fetchData<BackendBookmark[]>("http://localhost:8080/api/bookmarks"), // Fetch all bookmarks for sidebar counts
      ]);

      const actualCategories = fetchedCategories || [];
      const actualCollections = fetchedCollections || [];
      const actualTags = fetchedTags || [];
      const actualAllBackendBookmarks = allBackendBookmarks || [];


      setAllCategories(actualCategories);
      setAllCollections(actualCollections);
      setAllTags(actualTags);

      // Hydrate all bookmarks for sidebar counts
      const hydratedAllBookmarks: FrontendBookmark[] = actualAllBackendBookmarks.map((bm) => {
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
      setAllUserBookmarks(hydratedAllBookmarks); // Update state for sidebar counts


      // Hydrate the specific bookmark
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
      console.error("Error loading page data:", err); // Add more detailed logging
    } finally {
      setLoading(false);
    }
  }, [id, fetchData, router]); // Add router as dependency for redirect

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  const handleToggleFavorite = useCallback(async () => {
    if (!bookmark) return;
    setEditBookmarkLoading(true); // Use a specific loading state for toggling fav
    setEditBookmarkError(null);
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
      setEditBookmarkError(err.message || "Failed to toggle favorite status.");
    } finally {
      setEditBookmarkLoading(false);
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
      // It's good to provide feedback to the user if this fails
      // For now, we'll let the modal's error prop handle this via the error state
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
        bookmarkData // BookmarkData now matches backend
      );
      if (newBookmark) {
        setIsAddBookmarkModalOpen(false);
        await loadPageData(); // Refresh all page data including current bookmark and sidebar counts
      }
    } catch (err: any) {
      setAddBookmarkError(err.message || "Failed to add bookmark.");
      console.error("Error adding bookmark:", err);
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
        bookmarkData // BookmarkData now matches backend
      );
      if (updatedBookmark) {
        setIsEditBookmarkModalOpen(false);
        await loadPageData(); // Refresh all page data
      }
    } catch (err: any) {
      setEditBookmarkError(err.message || "Failed to update bookmark.");
      console.error("Error updating bookmark:", err);
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
        await loadPageData(); // Refresh all page data
      }
    } catch (err: any) {
      setAddCategoryError(err.message || "Failed to add category.");
      console.error("Error adding category:", err);
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
        await loadPageData(); // Refresh all page data
      }
    } catch (err: any) {
      setAddCollectionError(err.message || "Failed to add collection.");
      console.error("Error adding collection:", err);
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

  // Memoized categories for sidebar display
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

  // Memoized collections for sidebar display
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

  // Function to format date and time
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

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
        className={`flex-1 p-6 pt-20 transition-all duration-300 ${mainContentMl} custom-scrollbar`}
      >
        <Header
          isSidebarExpanded={isSidebarExpanded}
          onSidebarToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
          currentPageTitle="Bookmark Detail"
          onAddBookmarkClick={() => setIsAddBookmarkModalOpen(true)}
        />

        {/* Bookmark Detail Content */}
        <motion.div
          className="bg-white rounded-3xl shadow-xl p-8 max-w-4xl mx-auto border border-green-100"
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
                disabled={editBookmarkLoading} // Disable while favorite is toggling
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

          {/* Markdown content rendering */}
          <div className="text-slate-700 text-lg leading-relaxed mb-6 markdown-content">
            {bookmark.summary ? (
              <ReactMarkdown>{bookmark.summary}</ReactMarkdown>
            ) : (
              <p className="text-slate-500 italic">No summary available.</p>
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
            Added on: {formatDateTime(bookmark.createdAt)}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAddBookmarkModalOpen && (
          <AddBookmarkModal
            isOpen={isAddBookmarkModalOpen}
            onClose={() => setIsAddBookmarkModalOpen(false)}
            onAddBookmark={({ url, title, summary, tags, collections, category_id, is_fav }) =>
              handleAddBookmark({ url, title, summary, tags, collections, category_id, is_fav })}
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
            isLoading={editBookmarkLoading} // Pass loading state
            error={editBookmarkError} // Pass error state
            categories={allCategories || []}
            collections={allCollections || []}
            tags={allTags || []}
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
