"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Folder, Tags, Star, Pencil, X, Plus, Brain } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useDashboard } from "@/contexts/DashboardContext";


import AddBookmarkModal from "../../../components/dashboard/AddBookmarkModal";
import AddCategoryModal from "../../../components/dashboard/AddCategoryModal";
import AddCollectionModal from "../../../components/dashboard/AddCollectionModal";
import EditBookmarkModal from "../../../components/dashboard/EditBookmarkModal";
import {
  Category,
  Collection,
  Tag,
  BackendBookmark,
  FrontendBookmark,
  BookmarkData,
} from "@/types";
import { fetchData } from "@/lib/api";


const BookmarkDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [
    summarizing,
    setSummarizing,
  ] = useState(false);
  const [summarizeError, setSummarizeError] = useState<string | null>(null);

  const handleSummarizeBookmark = async () => {
    if (!bookmark) return;

    setSummarizing(true);
    setSummarizeError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setSummarizeError("Authentication token missing. Please log in.");
        router.push("/auth");
        return;
      }
      console.log("Frontend: Token retrieved from localStorage:", token ? "Exists" : "Does not exist");

      const BACKEND_API_BASE_URL = "http://localhost:8080"; // Or from environment variable
      const response = await fetch(`${BACKEND_API_BASE_URL}/api/agent/summarize/${bookmark.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = 'Failed to summarize bookmark';
        const responseText = await response.text(); // Read body once
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          errorMessage = `Server error: ${response.status} - Non-JSON response: ${responseText || 'Invalid response from server.'}`;
        }
        throw new Error(errorMessage);
      }

      let result;
      const responseText = await response.text(); // Read body once for success case
      try {
        result = JSON.parse(responseText);
      } catch (jsonError) {
        throw new Error(`Server returned non-JSON response for successful request: ${response.status} - ${responseText || 'Empty response'}`);
      }
      // Optionally, update the bookmark summary in the UI
      setBookmark((prev) => prev ? { ...prev, summary: result.summary } : null);
      loadDashboardData(); // Refresh dashboard data to reflect changes
    } catch (error: any) {
      console.error('Error summarizing bookmark:', error);
      // Ensure that the error message displayed is the one we constructed,
      // or a generic one if the error object itself is malformed.
      setSummarizeError(error instanceof Error ? error.message : 'Failed to summarize bookmark');
    } finally {
      setSummarizing(false);
    }
  };

  const {
    // Destructure from useDashboard
    userBookmarks,
    categories: categoriesForDisplay,
    collections: collectionsForDisplay,
    tags: allTags,
    loading: dashboardLoading,
    error: dashboardError,
    loadDashboardData,
    handleToggleFavorite,
    handleAddBookmark: contextAddBookmark,
    addBookmarkLoading,
    addBookmarkError,
    handleAddCategory: contextAddCategory,
    addCategoryLoading,
    addCategoryError,
    handleAddCollection: contextAddCollection,
    addCollectionLoading,
    addCollectionError,
    handleAddNewTag,
    getDefaultCategoryColor,
  } = useDashboard();



  const [bookmark, setBookmark] = useState<FrontendBookmark | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddBookmarkModalOpen, setIsAddBookmarkModalOpen] = useState(false);
  const [isEditBookmarkModalOpen, setIsEditBookmarkModalOpen] = useState(false);
  const [editBookmarkLoading, setEditBookmarkLoading] = useState(false);
  const [editBookmarkError, setEditBookmarkError] = useState<string | null>(
    null,
  );
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddCollectionModalOpen, setIsAddCollectionModalOpen] =
    useState(false);



  const loadBookmarkDetails = useCallback(async () => {
    if (!id) {
      router.push("/app/dashboard");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch the specific bookmark
      const backendBookmark = await fetchData<BackendBookmark>(
        `http://localhost:8080/api/bookmarks/${id}`,
      );

      if (backendBookmark) {
        // Hydrate the specific bookmark using data from the context
        const hydratedBookmark: FrontendBookmark = {
          id: backendBookmark.id,
          url: backendBookmark.url,
          title: backendBookmark.title,
          summary: backendBookmark.summary,
          tags: (backendBookmark.tags || [])
            .map((tagId) => allTags.find((t) => t.id === tagId))
            .filter((tag): tag is Tag => tag !== undefined),
          collections: (backendBookmark.collections || [])
            .map((colId) => collectionsForDisplay.find((c) => c.id === colId))
            .filter((col): col is Collection => col !== undefined),
          categories: backendBookmark.category
            ? categoriesForDisplay.filter(
                (cat) => cat.id === backendBookmark.category,
              )
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
      console.error("Error loading bookmark details:", err);
    } finally {
      setLoading(false);
    }
  }, [id, allTags, categoriesForDisplay, collectionsForDisplay, router]);

  useEffect(() => {
    // Ensure dashboard data is loaded first, then load specific bookmark
    if (!dashboardLoading && !dashboardError) {
      loadBookmarkDetails();
    }
  }, [dashboardLoading, dashboardError, loadBookmarkDetails]);

  const handleAddBookmark = useCallback(
    async (bookmarkData: BookmarkData) => {
      try {
        await contextAddBookmark(bookmarkData);
        setIsAddBookmarkModalOpen(false);
        await loadDashboardData(); // Refresh all data including current bookmark and sidebar counts
        await loadBookmarkDetails(); // Re-load specific bookmark details
      } catch (err: any) {
        // Error handled by contextAddBookmark, but can log here if needed
        console.error("Error adding bookmark in page:", err);
      }
    },
    [contextAddBookmark, loadDashboardData, loadBookmarkDetails],
  );

  const handleEditBookmark = useCallback(
    async (bookmarkId: string, bookmarkData: BookmarkData) => {
      setEditBookmarkLoading(true);
      setEditBookmarkError(null);
      try {
        await fetchData<BackendBookmark>(
          `http://localhost:8080/api/bookmarks/${bookmarkId}`,
          "PUT",
          bookmarkData,
        );
        setIsEditBookmarkModalOpen(false);
        await loadDashboardData(); // Refresh all data
        await loadBookmarkDetails(); // Re-load specific bookmark details
      } catch (err: any) {
        setEditBookmarkError(err.message || "Failed to update bookmark.");
        console.error("Error updating bookmark:", err);
      } finally {
        setEditBookmarkLoading(false);
      }
    },
    [loadDashboardData, loadBookmarkDetails],
  );

  const handleAddCategory = useCallback(
    async (name: string, emoji: string) => {
      try {
        await contextAddCategory(name, emoji);
        setIsAddCategoryModalOpen(false);
        await loadDashboardData();
      } catch (err: any) {
        console.error("Error adding category in page:", err);
      }
    },
    [contextAddCategory, loadDashboardData],
  );

  const handleAddCollection = useCallback(
    async (name: string) => {
      try {
        await contextAddCollection(name);
        setIsAddCollectionModalOpen(false);
        await loadDashboardData();
      } catch (err: any) {
        console.error("Error adding collection in page:", err);
      }
    },
    [contextAddCollection, loadDashboardData],
  );



  if (loading || dashboardLoading) {
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

  if (error || dashboardError) {
    return (
      <div className="min-h-screen bg-red-50 text-red-700 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xl font-bold mb-4">Error Loading Bookmark</p>
          <p className="text-center mb-4">{error || dashboardError}</p>
          <button
            onClick={() => {
              loadDashboardData();
              loadBookmarkDetails();
            }}
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

  const displayCategory =
    bookmark.categories.length > 0 ? bookmark.categories[0] : null;

  // Function to format date and time
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex relative">


      {/* Main Content Area */}
      <div
        className={`flex-1 p-6 pt-20 transition-all duration-300 custom-scrollbar`}
      >


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
                onClick={handleSummarizeBookmark}
                className="p-2 rounded-full hover:bg-blue-100 transition-colors"
                aria-label="Summarize Bookmark"
                disabled={summarizing || editBookmarkLoading}
              >
                <BookOpen className="w-6 h-6 text-blue-500 hover:text-blue-700" />
              </button>
              <button
                onClick={() => handleToggleFavorite(bookmark.id)}
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
              <h3 className="text-lg font-semibold text-black mb-2">
                Collections:
              </h3>
              <div className="flex flex-wrap gap-2">
                {bookmark.collections.map((col) => (
                  <span
                    key={col.id}
                    className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm shadow-sm"
                  >
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
                  <span
                    key={tag.id}
                    className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm shadow-sm"
                  >
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
        {summarizeError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4 max-w-4xl mx-auto"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{summarizeError}</span>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAddBookmarkModalOpen && (
          <AddBookmarkModal
            isOpen={isAddBookmarkModalOpen}
            onClose={() => setIsAddBookmarkModalOpen(false)}
            onAddBookmark={({
              url,
              title,
              summary,
              tags,
              collections,
              category_id,
              is_fav,
            }) =>
              handleAddBookmark({
                url,
                title,
                summary,
                tags,
                collections,
                category_id,
                is_fav,
              })
            }
            isLoading={addBookmarkLoading}
            error={addBookmarkError}
            categories={categoriesForDisplay || []}
            collections={collectionsForDisplay || []}
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
            categories={categoriesForDisplay || []}
            collections={collectionsForDisplay || []}
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
};

export default BookmarkDetailPage;
