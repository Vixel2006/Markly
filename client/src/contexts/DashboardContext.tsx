import React, { createContext, useContext } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData'; // Import the new hook
import {
  Tag,
  FrontendBookmark,
  BookmarkData,
  CategoryForDisplay,
  CollectionForDisplay,
} from '@/types';

interface DashboardContextProps {
  userBookmarks: FrontendBookmark[];
  categories: CategoryForDisplay[];
  collections: CollectionForDisplay[];
  tags: Tag[];
  loading: boolean;
  error: string | null;
  loadDashboardData: (bookmarkApiUrl?: string) => Promise<void>;
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
  handleAddNewTag: (tagName: string) => Promise<Tag | null>;
  addNewTagLoading: boolean;
  addNewTagError: string | null;
  getDefaultCategoryColor: (categoryName: string) => string;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    userBookmarks,
    rawCategories,
    rawCollections,
    tags,
    categoriesForDisplay: categories,
    collectionsForDisplay: collections,
    loading,
    error,
    loadAllData: loadDashboardData,
    handleToggleFavorite,
    handleAddBookmark,
    addBookmarkLoading,
    addBookmarkError,
    handleAddCategory,
    addCategoryLoading,
    addCategoryError,
    handleAddCollection,
    addCollectionLoading,
    addCollectionError,
    handleAddNewTag,
    addNewTagLoading,
    addNewTagError,
    getDefaultCategoryColor,
  } = useDashboardData();

  const value = {
    userBookmarks,
    categories,
    collections,
    tags,
    loading,
    error,
    loadDashboardData,
    handleToggleFavorite,
    handleAddBookmark,
    addBookmarkLoading,
    addBookmarkError,
    handleAddCategory,
    addCategoryLoading,
    addCategoryError,
    handleAddCollection,
    addCollectionLoading,
    addCollectionError,
    handleAddNewTag,
    addNewTagLoading,
    addNewTagError,
    getDefaultCategoryColor,
  };

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
