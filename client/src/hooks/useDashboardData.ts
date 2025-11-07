import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { fetchData } from '@/lib/api';
import {
  BackendBookmark,
  Category,
  Collection,
  Tag,
  FrontendBookmark,
  BookmarkData,
  CategoryForDisplay,
  CollectionForDisplay,
} from '@/types';

interface UseDashboardDataResult {
  userBookmarks: FrontendBookmark[];
  rawCategories: Category[];
  rawCollections: Collection[];
  tags: Tag[];
  categoriesForDisplay: CategoryForDisplay[];
  collectionsForDisplay: CollectionForDisplay[];
  loading: boolean;
  error: string | null;
  loadAllData: (bookmarkApiUrl?: string) => Promise<void>;
  handleToggleFavorite: (bookmarkId: string) => Promise<void>;
  handleAddBookmark: (bookmarkData: BookmarkData) => Promise<void>;
  addBookmarkLoading: boolean;
  addBookmarkError: string | null;
  handleAddCategory: (name: string, emoji: string) => Promise<void>;
  addCategoryLoading: boolean;
  addCategoryError: string | null;
  handleAddCollection: (name: string) => Promise<void>;
  addCollectionLoading: boolean;
  addCollectionError: string | null;
  handleUpdateCategory: (categoryId: string, name: string, emoji: string) => Promise<void>;
  updateCategoryLoading: boolean;
  updateCategoryError: string | null;
  handleAddNewTag: (tagName: string) => Promise<Tag | null>;
  addNewTagLoading: boolean;
  addNewTagError: string | null;
  getDefaultCategoryColor: (categoryName: string) => string;
}

export const useDashboardData = (): UseDashboardDataResult => {
  const router = useRouter();
  const [userBookmarks, setUserBookmarks] = useState<FrontendBookmark[]>([]);
  const [rawCategories, setRawCategories] = useState<Category[]>([]);
  const [rawCollections, setRawCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Specific loading and error states for add/edit operations
  const [addBookmarkLoading, setAddBookmarkLoading] = useState(false);
  const [addBookmarkError, setAddBookmarkError] = useState<string | null>(null);
  const [addCategoryLoading, setAddCategoryLoading] = useState(false);
  const [addCategoryError, setAddCategoryError] = useState<string | null>(null);
  const [addCollectionLoading, setAddCollectionLoading] = useState(false);
  const [addCollectionError, setAddCollectionError] = useState<string | null>(null);
  const [updateCategoryLoading, setUpdateCategoryLoading] = useState(false);
  const [updateCategoryError, setUpdateCategoryError] = useState<string | null>(null);
  const [addNewTagLoading, setAddNewTagLoading] = useState(false);
  const [addNewTagError, setAddNewTagError] = useState<string | null>(null);

  const getDefaultCategoryColor = useCallback((categoryName: string): string => {
    switch (categoryName.toLowerCase()) {
      case "development": return "bg-blue-500";
      case "design": return "bg-purple-500";
      case "productivity": return "bg-green-500";
      case "marketing": return "bg-red-500";
      case "finance": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  }, []);

  const hydrateBookmark = useCallback((
    bm: BackendBookmark,
    allCategories: Category[],
    allCollections: Collection[],
    allTags: Tag[]
  ): FrontendBookmark => {
    const hydratedTags = (bm.tags || [])
      .map(tagId => allTags.find(t => t.id === tagId))
      .filter((tag): tag is Tag => tag !== undefined);

    const hydratedCollections = (bm.collections || [])
      .map(colId => allCollections.find(c => c.id === colId))
      .filter((col): col is Collection => col !== undefined);

    const hydratedCategories = bm.category
      ? allCategories.filter(cat => cat.id === bm.category)
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
  }, []);

  const loadAllData = useCallback(async (
    bookmarkApiUrl: string = "http://localhost:8080/api/bookmarks"
  ) => {
    setLoading(true);
    setError(null);
    try {
      const [
        backendBookmarks,
        fetchedCategories,
        fetchedCollections,
        fetchedTags,
      ] = await Promise.all([
        fetchData<BackendBookmark[]>(bookmarkApiUrl),
        fetchData<Category[]>("http://localhost:8080/api/categories"),
        fetchData<Collection[]>("http://localhost:8080/api/collections"),
        fetchData<Tag[]>("http://localhost:8080/api/tags/user"),
      ]);

      const actualCategories = fetchedCategories || [];
      const actualCollections = fetchedCollections || [];
      const actualTags = fetchedTags || [];
      const actualBookmarks = backendBookmarks || [];

      setRawCategories(actualCategories);
      setRawCollections(actualCollections);
      setTags(actualTags);

      const hydratedBookmarks: FrontendBookmark[] = actualBookmarks.map((bm) =>
        hydrateBookmark(bm, actualCategories, actualCollections, actualTags)
      );
      setUserBookmarks(hydratedBookmarks);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [hydrateBookmark]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const categoriesForDisplay: CategoryForDisplay[] = useMemo(() => {
    return rawCategories.map((cat) => ({
      ...cat,
      count: userBookmarks.filter((bm) => bm.categories?.some((c) => c.id === cat.id)).length,
      icon: cat.emoji || "📚",
      color: getDefaultCategoryColor(cat.name),
    }));
  }, [rawCategories, userBookmarks, getDefaultCategoryColor]);

  const collectionsForDisplay: CollectionForDisplay[] = useMemo(() => {
    return rawCollections.map((col) => ({
      ...col,
      count: userBookmarks.filter((bm) => bm.collections?.some((c) => c.id === col.id)).length,
    }));
  }, [rawCollections, userBookmarks]);

  const handleToggleFavorite = useCallback(async (bookmarkId: string) => {
    const bookmark = userBookmarks.find(bm => bm.id === bookmarkId);
    if (!bookmark) return;

    const newFavStatus = !bookmark.isFav;
    setUserBookmarks(prev => prev.map(bm => bm.id === bookmarkId ? { ...bm, isFav: newFavStatus } : bm));

    try {
        await fetchData(`http://localhost:8080/api/bookmarks/${bookmarkId}`, 'PUT', { is_fav: newFavStatus });
        // Re-fetch all data to ensure sidebar counts are accurate after a favorite change
        loadAllData();
    } catch (err: any) {
        setUserBookmarks(prev => prev.map(bm => bm.id === bookmarkId ? { ...bm, isFav: bookmark.isFav } : bm));
        setError(err.message || "Failed to toggle favorite status.");
        console.error("Failed to toggle favorite status:", err);
    }
  }, [userBookmarks, loadAllData]);

  const handleAddBookmark = useCallback(async (bookmarkData: BookmarkData) => {
    setAddBookmarkLoading(true);
    setAddBookmarkError(null);
    try {
      await fetchData("http://localhost:8080/api/bookmarks", "POST", bookmarkData);
      await loadAllData();
    } catch (err: any) {
      setAddBookmarkError(err.message || "Failed to add bookmark.");
      throw err; // Re-throw to allow modal to catch and display
    } finally {
      setAddBookmarkLoading(false);
    }
  }, [loadAllData]);

  const handleAddCategory = useCallback(async (name: string, emoji: string) => {
    setAddCategoryLoading(true);
    setAddCategoryError(null);
    try {
      await fetchData("http://localhost:8080/api/categories", "POST", { name, emoji });
      await loadAllData();
    } catch (err: any) {
      setAddCategoryError(err.message || "Failed to add category.");
      throw err; // Re-throw to allow modal to catch and display
    } finally {
      setAddCategoryLoading(false);
    }
  }, [loadAllData]);

  const handleUpdateCategory = useCallback(async (categoryId: string, name: string, emoji: string) => {
    setUpdateCategoryLoading(true);
    setUpdateCategoryError(null);
    try {
      await fetchData(`http://localhost:8080/api/categories/${categoryId}`, "PUT", { name, emoji });
      await loadAllData(); // Re-fetch all data to update the UI
    } catch (err: any) {
      setUpdateCategoryError(err.message || "Failed to update category.");
      throw err; // Re-throw to allow modal to catch and display
    } finally {
      setUpdateCategoryLoading(false);
    }
  }, [loadAllData]);

  const handleAddCollection = useCallback(async (name: string) => {
    setAddCollectionLoading(true);
    setAddCollectionError(null);
    try {
      await fetchData("http://localhost:8080/api/collections", "POST", { name });
      await loadAllData();
    } catch (err: any) {
      setAddCollectionError(err.message || "Failed to add collection.");
      throw err; // Re-throw to allow modal to catch and display
    } finally {
      setAddCollectionLoading(false);
    }
  }, [loadAllData]);

  const handleAddNewTag = useCallback(async (tagName: string): Promise<Tag | null> => {
    setAddNewTagLoading(true);
    setAddNewTagError(null);
    const existingTag = tags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase());
    if (existingTag) {
      setAddNewTagLoading(false);
      return existingTag;
    }
    try {
      const newTag = await fetchData<Tag>("http://localhost:8080/api/tags", "POST", { name: tagName });
      if (newTag) {
          setTags(prev => [...prev, newTag]);
      }
      return newTag;
    } catch (err: any) {
      setAddNewTagError(err.message || "Failed to add new tag.");
      console.error("Error adding new tag:", err);
      throw err; // Re-throw to allow modal to catch and display
    } finally {
      setAddNewTagLoading(false);
    }
  }, [tags]);

  return {
    userBookmarks,
    rawCategories,
    rawCollections,
    tags,
    categoriesForDisplay,
    collectionsForDisplay,
    loading,
    error,
    loadAllData,
    handleToggleFavorite,
    handleAddBookmark,
    addBookmarkLoading,
    addBookmarkError,
    handleAddCategory,
    addCategoryLoading,
    addCategoryError,
    handleUpdateCategory,
    updateCategoryLoading,
    updateCategoryError,
    handleAddCollection,
    addCollectionLoading,
    addCollectionError,
    handleAddNewTag,
    addNewTagLoading,
    addNewTagError,
    getDefaultCategoryColor,
  };
};
