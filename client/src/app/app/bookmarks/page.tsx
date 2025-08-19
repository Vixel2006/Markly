"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BookOpen, Plus, X } from 'lucide-react';

import Header from '../../components/dashboard/Header';
import Sidebar from '../../components/dashboard/Sidebar';
import BookmarkFeed from '../../components/dashboard/BookmarkFeed';
import BookmarkDetailPanel from '../../components/dashboard/BookmarkDetailPanel';
import AddBookmarkModal from '../../components/dashboard/AddBookmarkModal';
import AddCategoryModal from '../../components/dashboard/AddCategoryModal';

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

interface TagForDisplay extends Tag {
  count: number;
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

const AllBookmarks = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [activePanel, setActivePanel] = useState<'dashboard' | 'bookmarks' | 'collections' | 'tags' | 'favorites' | 'ai-suggested'>('bookmarks');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [searchQuery, setSearchQuery] = useState('');

  const [userBookmarks, setUserBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [selectedBookmarkId, setSelectedBookmarkId] = useState<string | null>(null);

  const [isAddBookmarkModalOpen, setIsAddBookmarkModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [addCategoryLoading, setAddCategoryLoading] = useState(false);
  const [addCategoryError, setAddCategoryError] = useState<string | null>(null);
  const [addBookmarkLoading, setAddBookmarkLoading] = useState(false);
  const [addBookmarkError, setAddBookmarkError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAddNewTag = async (tagName: string): Promise<Tag | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_JWT_TOKEN',
        },
        body: JSON.stringify({ name: tagName }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to add tag: ${response.statusText}`);
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

  const fetchData = useCallback(async <T,>(url: string, method: string = 'GET', body?: any): Promise<T | null> => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found. User might not be authenticated.");
      setError("Authentication token missing. Please log in.");
      return null;
    }

    try {
      const fetchOptions: RequestInit = {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${token}`
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
          throw new Error(errorJson.message || `Failed to fetch from ${url}: ${res.status} - ${errText}`);
        } catch {
          throw new Error(`Failed to fetch from ${url}: ${res.status} - ${errText}`);
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
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedCategories, fetchedCollections, fetchedTags, fetchedBookmarks] = await Promise.all([
        fetchData<Category[]>("http://localhost:8080/api/categories"),
        fetchData<Collection[]>("http://localhost:8080/api/collections"),
        fetchData<Tag[]>("http://localhost:8080/api/tags"),
        fetchData<Bookmark[]>("http://localhost:8080/api/bookmarks"),
      ]);

      if (fetchedCategories) setCategories(fetchedCategories.map(cat => ({ id: cat.id, name: cat.name, emoji: cat.emoji })));
      if (fetchedCollections) setCollections(fetchedCollections.map(col => ({ id: col.id, name: col.name })));
      if (fetchedTags) setTags(fetchedTags.map(tag => ({
        id: tag.id,
        name: tag.name,
        weeklyCount: tag.weeklyCount || 0, // Adjust field names if needed
        prevCount: tag.prevCount || 0,
        createdAt: tag.createdAt || new Date().toISOString(),
      })));
      if (fetchedBookmarks) setUserBookmarks(fetchedBookmarks);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred loading data.");
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        loadData();
        setIsAddCategoryModalOpen(false);
      }
    } catch (err: any) {
      setAddCategoryError(err.message || "Failed to add category.");
    } finally {
      setAddCategoryLoading(false);
    }
  }, [fetchData, loadData]);

  const handleAddBookmark = useCallback(async (bookmarkData: Omit<Bookmark, 'id' | 'userId' | 'datetime'>) => {
    setAddBookmarkLoading(true);
    setAddBookmarkError(null);
    try {
      const newBookmark = await fetchData<Bookmark>(
        "http://localhost:8080/api/bookmarks",
        "POST",
        { ...bookmarkData }
      );
      if (newBookmark) {
        setUserBookmarks(prev => [newBookmark, ...prev]);
        setIsAddBookmarkModalOpen(false);
      }
    } catch (err: any) {
      setAddBookmarkError(err.message || "Failed to add bookmark.");
    } finally {
      setAddBookmarkLoading(false);
    }
  }, [fetchData]);

  const handleUpdateBookmark = useCallback(async (bookmarkId: string, updates: Partial<Bookmark>) => {
    console.log(`Updating bookmark ${bookmarkId} with:`, updates);
    setUserBookmarks(prev => prev.map(bm => bm.id === bookmarkId ? { ...bm, ...updates } : bm));
    setSelectedBookmarkId(null);
  }, []);

  const handleDeleteBookmark = useCallback(async (bookmarkId: string) => {
    console.log(`Deleting bookmark ${bookmarkId}`);
    setUserBookmarks(prev => prev.filter(bm => bm.id !== bookmarkId));
    setSelectedBookmarkId(null);
  }, []);

  const handleToggleFavorite = useCallback((bookmarkId: string) => {
    setUserBookmarks(prev => prev.map(bm =>
      bm.id === bookmarkId ? { ...bm, isFav: !bm.isFav } : bm
    ));
  }, []);

  const categoriesForDisplay: CategoryForDisplay[] = useMemo(() => {
    return categories.map(cat => {
      const count = userBookmarks.filter(bm => bm.category?.id === cat.id).length;
      const displayIcon = cat.emoji || "📚";
      let assignedColor = "bg-gray-500";
      switch (cat.name.toLowerCase()) {
        case 'development': assignedColor = 'bg-blue-500'; break;
        case 'design': assignedColor = 'bg-purple-500'; break;
        case 'productivity': assignedColor = 'bg-green-500'; break;
        case 'marketing': assignedColor = 'bg-red-500'; break;
        case 'finance': assignedColor = 'bg-yellow-500'; break;
        default: assignedColor = 'bg-gray-500'; break;
      }
      return { id: cat.id, name: cat.name, count, icon: displayIcon, color: assignedColor };
    });
  }, [categories, userBookmarks]);

  const collectionsForDisplay: CollectionForDisplay[] = useMemo(() => {
    return collections.map(col => ({
      ...col,
      count: userBookmarks.filter(bm => bm.collections.some(c => c.id === col.id)).length
    }));
  }, [collections, userBookmarks]);

  const tagsForDisplay: TagForDisplay[] = useMemo(() => {
    return tags.map(tag => ({
      ...tag,
      count: userBookmarks.filter(bm => bm.tags.some(t => t.id === tag.id)).length
    }));
  }, [tags, userBookmarks]);

  const filteredBookmarks = useMemo(() => {
    let filtered = userBookmarks;

    if (selectedCategoryId) {
      filtered = filtered.filter(bm => bm.category?.id === selectedCategoryId);
    }
    if (selectedCollectionId) {
      filtered = filtered.filter(bm => bm.collections.some(col => col.id === selectedCollectionId));
    }
    if (selectedTagId) {
      filtered = filtered.filter(bm => bm.tags.some(tag => tag.id === selectedTagId));
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(bm =>
        bm.title.toLowerCase().includes(lowerQuery) ||
        bm.summary.toLowerCase().includes(lowerQuery) ||
        bm.url.toLowerCase().includes(lowerQuery) ||
        bm.tags.some(tag => tag.name.toLowerCase().includes(lowerQuery)) ||
        bm.collections.some(col => col.name.toLowerCase().includes(lowerQuery)) ||
        bm.category?.name.toLowerCase().includes(lowerQuery)
      );
    }

    return filtered.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
  }, [userBookmarks, selectedCategoryId, selectedCollectionId, selectedTagId, searchQuery]);

  const currentSelectedBookmark = useMemo(() => {
    return selectedBookmarkId ? userBookmarks.find(bm => bm.id === selectedBookmarkId) : null;
  }, [selectedBookmarkId, userBookmarks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p>Loading your bookmarks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-red-500 flex flex-col items-center justify-center p-4">
        <p className="text-xl font-bold mb-4">Error Loading Bookmarks</p>
        <p className="text-center">{error}</p>
        <p className="text-sm mt-2">Please check your network connection or try again later.</p>
      </div>
    );
  }

  const mainContentMl = isSidebarExpanded ? 'ml-64' : 'ml-16';

  return (
    <div className="min-h-screen bg-slate-900 text-white flex relative">
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        categories={categoriesForDisplay}
        collections={collectionsForDisplay}
        tags={tagsForDisplay}
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
          setSearchQuery('');
          setActivePanel('bookmarks');
        }}
        onAddCategoryClick={() => setIsAddCategoryModalOpen(true)}
      />

      <div
        className={`flex-1 transition-all duration-300 ${mainContentMl} p-4 md:p-6 ${currentSelectedBookmark ? 'lg:pr-96' : ''}`}
      >
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddBookmarkClick={() => setIsAddBookmarkModalOpen(true)}
          totalBookmarksCount={userBookmarks.length}
          onViewModeChange={setViewMode}
          viewMode={viewMode}
        />

        <BookmarkFeed
          bookmarks={filteredBookmarks}
          onBookmarkSelect={setSelectedBookmarkId}
          selectedBookmarkId={selectedBookmarkId}
          viewMode={viewMode}
          onToggleFavorite={handleToggleFavorite}
          selectedCategoryId={selectedCategoryId}
          selectedCollectionId={selectedCollectionId}
          selectedTagId={selectedTagId}
          searchQuery={searchQuery}
          allCategories={categoriesForDisplay}
          allCollections={collectionsForDisplay}
          allTags={tags}
        />
      </div>

      {currentSelectedBookmark && (
        <BookmarkDetailPanel
          bookmark={currentSelectedBookmark}
          onClose={() => setSelectedBookmarkId(null)}
          onUpdate={handleUpdateBookmark}
          onDelete={handleDeleteBookmark}
          onToggleFavorite={handleToggleFavorite}
          allCategories={categories}
          allTags={tags}
          allCollections={collections}
          relatedBookmarks={userBookmarks.filter(bm => bm.id !== currentSelectedBookmark.id && bm.category?.id === currentSelectedBookmark.category?.id).slice(0, 3)}
        />
      )}

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
    </div>
  );
};

export default AllBookmarks;
