"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Plus, Save, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchData } from "@/lib/api";
import { useSession } from "next-auth/react";
import {
  Category,
  Collection,
  Tag,
  BookmarkData,
  BackendBookmark,
} from "@/types";
import BookmarkSelectionModal from "../../components/dashboard/BookmarkSelectionModal"; // Import the new modal component
import MultiSelectDropdown from "../../components/ui/MultiSelectDropdown";

// Define the structure for an AI-generated suggestion
interface AISuggestion {
  url: string;
  title: string;
  summary: string;
  category: string; // Category name
  collection: string; // Collection name
  tags: string[]; // Array of tag names
}

const AISuggestionsPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingBookmarkId, setSavingBookmarkId] = useState<string | null>(null); // To track which suggestion is being saved

  // State for filters
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | undefined>(undefined);
  const [selectedCollectionFilter, setSelectedCollectionFilter] = useState<string | undefined>(undefined);
  const [selectedTagsFilter, setSelectedTagsFilter] = useState<string[]>([]);
  const [selectedBookmarksFilter, setSelectedBookmarksFilter] = useState<string>(""); // Stores comma-separated IDs
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false); // State for modal visibility

  // Data needed for saving bookmarks (categories, collections, tags)
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [allBookmarks, setAllBookmarks] = useState<BackendBookmark[]>([]);
  const [loadingMetaData, setLoadingMetaData] = useState(true);

  const filteredBookmarksForModal = useMemo(() => {
    let filtered = allBookmarks;
    if (selectedCategoryFilter) {
      filtered = filtered.filter((bm) => bm.category_id === selectedCategoryFilter);
    }
    if (selectedCollectionFilter) {
      filtered = filtered.filter((bm) => bm.collection_ids?.includes(selectedCollectionFilter));
    }
    return filtered;
  }, [allBookmarks, selectedCategoryFilter, selectedCollectionFilter]);

  useEffect(() => {
    if (session) {
      console.log("NextAuth Session:", session);
      console.log("Access Token from Session:", session.user?.accessToken);
    }
  }, [session]);

  const loadMetaData = useCallback(async () => {
    setLoadingMetaData(true);
    try {
      const [fetchedCategories, fetchedCollections, fetchedTags, fetchedBookmarks] =
        await Promise.all([
          fetchData<Category[]>(`http://localhost:8080/api/categories`),
          fetchData<Collection[]>(`http://localhost:8080/api/collections`),
          fetchData<Tag[]>(`http://localhost:8080/api/tags/user`),
          fetchData<BackendBookmark[]>(`http://localhost:8080/api/bookmarks`),
        ]);
      setAllCategories(fetchedCategories || []);
      setAllCollections(fetchedCollections || []);
      setAllTags(fetchedTags || []);
      setAllBookmarks(fetchedBookmarks || []);
    } catch (err: any) {
      setError(err.message || "Failed to load metadata for suggestions.");
    } finally {
      setLoadingMetaData(false);
    }
  }, []);

  useEffect(() => {
    loadMetaData();
  }, [loadMetaData]);

  const fetchAISuggestions = useCallback(async () => {
    setLoadingSuggestions(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (selectedCategoryFilter) {
        queryParams.append("category", selectedCategoryFilter);
      }
      if (selectedCollectionFilter) {
        queryParams.append("collection", selectedCollectionFilter);
      }
      if (selectedTagsFilter.length > 0) {
        queryParams.append("tag", selectedTagsFilter.join(","));
      }
      if (selectedBookmarksFilter) {
        queryParams.append("bookmarks", selectedBookmarksFilter);
      }

      const queryString = queryParams.toString();
      const url = `http://localhost:8080/api/agent/suggestions${
        queryString ? `?${queryString}` : ""
      }`;

      const fetchedSuggestions = await fetchData<AISuggestion[]>(url);
      setSuggestions(fetchedSuggestions || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch AI suggestions.");
    } finally {
      setLoadingSuggestions(false);
    }
  }, [selectedCategoryFilter, selectedCollectionFilter, selectedTagsFilter, selectedBookmarksFilter]);

  const handleSaveSuggestion = useCallback(
    async (suggestion: AISuggestion, index: number) => {
      setSavingBookmarkId(suggestion.url); // Use URL as a temporary ID for tracking
      try {
        // Map AI suggestion names to existing IDs or create new ones
        const category = allCategories.find(
          (cat) => cat.name.toLowerCase() === suggestion.category.toLowerCase()
        );
        const collection = allCollections.find(
          (col) =>
            col.name.toLowerCase() === suggestion.collection.toLowerCase()
        );

        const tagIds: string[] = [];
        for (const tagName of suggestion.tags) {
          let tag = allTags.find(
            (t) => t.name.toLowerCase() === tagName.toLowerCase()
          );
          if (!tag) {
            // If tag doesn't exist, create it
            tag = await fetchData<Tag>(`http://localhost:8080/api/tags`, "POST", {
              name: tagName,
            });
            if (tag) {
              setAllTags((prev) => [...prev, tag!]); // Update local tags state
            }
          }
          if (tag) {
            tagIds.push(tag.id);
          }
        }

        const bookmarkData: BookmarkData = {
          url: suggestion.url,
          title: suggestion.title,
          summary: suggestion.summary,
          tag_ids: tagIds,
          collection_ids: collection ? [collection.id] : [],
          category_id: category ? category.id : undefined,
          is_fav: false, // Default to not favorite
        };

        await fetchData<BackendBookmark>(
          `http://localhost:8080/api/bookmarks`,
          "POST",
          bookmarkData
        );

        // Remove the saved suggestion from the list
        setSuggestions((prev) => prev.filter((_, i) => i !== index));
      } catch (err: any) {
        setError(err.message || "Failed to save bookmark.");
      } finally {
        setSavingBookmarkId(null);
      }
    },
    [allCategories, allCollections, allTags, fetchData]
  );

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex relative">
      <div className="flex-1 p-6 pt-20 transition-all duration-300 custom-scrollbar">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center flex items-center justify-center gap-3">
            <Brain className="w-10 h-10 text-purple-600" /> AI Suggestions
          </h1>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-purple-200 text-center">
            <p className="text-lg text-gray-700 mb-4">
              Get personalized bookmark suggestions based on your recent activity.
            </p>

            {/* Filter Section */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              {/* Category Filter */}
              <MultiSelectDropdown
                label="Filter by Category"
                items={allCategories.map((cat) => ({ id: cat.id, name: cat.name }))}
                selectedItems={selectedCategoryFilter ? [selectedCategoryFilter] : []}
                onSelectionChange={(ids) => setSelectedCategoryFilter(ids[0] || undefined)}
                placeholder="All Categories"
                isMulti={false}
              />

              {/* Collection Filter */}
              <MultiSelectDropdown
                label="Filter by Collection"
                items={allCollections.map((col) => ({ id: col.id, name: col.name }))}
                selectedItems={selectedCollectionFilter ? [selectedCollectionFilter] : []}
                onSelectionChange={(ids) => setSelectedCollectionFilter(ids[0] || undefined)}
                placeholder="All Collections"
                isMulti={false}
              />

              {/* Tags Filter (Multi-select) */}
              <MultiSelectDropdown
                label="Filter by Tags"
                items={allTags.map((tag) => ({ id: tag.id, name: tag.name }))}
                selectedItems={selectedTagsFilter}
                onSelectionChange={setSelectedTagsFilter}
                placeholder="All Tags"
                isMulti={true}
              />

              {/* Bookmark IDs Filter */}
              <div>
                <label htmlFor="bookmarkIdsFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Bookmarks:
                </label>
                <button
                  type="button"
                  onClick={() => setIsBookmarkModalOpen(true)}
                  className="mt-1 w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-left cursor-pointer focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                >
                  {selectedBookmarksFilter.split(",").filter(Boolean).length > 0
                    ? `${selectedBookmarksFilter.split(",").filter(Boolean).length} bookmark(s) selected`
                    : "Select Bookmarks"}
                </button>
              </div>
            </div>

            <button
              onClick={fetchAISuggestions}
              disabled={loadingSuggestions}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center mx-auto gap-2"
            >
              {loadingSuggestions ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Generating Ideas...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" /> Generate New Suggestions
                </>
              )}
            </button>
          </div>

          <BookmarkSelectionModal
            isOpen={isBookmarkModalOpen}
            onClose={() => setIsBookmarkModalOpen(false)}
            bookmarks={filteredBookmarksForModal}
            onSelectBookmarks={(ids) => setSelectedBookmarksFilter(ids.join(","))}
            initialSelectedBookmarkIds={selectedBookmarksFilter.split(",").filter(Boolean)}
          />

          <AnimatePresence mode="wait">
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 gap-6"
              >
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.url + index} // Unique key for each suggestion
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-2xl shadow-md p-6 border border-green-100 flex flex-col"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {suggestion.title}
                    </h2>
                    <a
                      href={suggestion.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline mb-3 block truncate"
                    >
                      {suggestion.url}
                    </a>
                    <div className="text-gray-700 text-base mb-4 prose prose-sm max-w-none">
                      {suggestion.summary}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {suggestion.category && (
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                          Category: {suggestion.category}
                        </span>
                      )}
                      {suggestion.collection && (
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                          Collection: {suggestion.collection}
                        </span>
                      )}
                      {suggestion.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          Tag: {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleSaveSuggestion(suggestion, index)}
                      disabled={savingBookmarkId === suggestion.url}
                      className="mt-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-full shadow-md transition-all duration-200 flex items-center justify-center gap-2 self-end"
                    >
                      {savingBookmarkId === suggestion.url ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Save Bookmark
                        </>
                      )}
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {!loadingSuggestions && suggestions.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-500 border border-gray-200"
              >
                <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-xl font-semibold mb-2">No suggestions yet!</p>
                <p className="mb-4">Click the button above to generate some AI-powered bookmark ideas.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AISuggestionsPage;