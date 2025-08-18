// src/app/app/page.tsx (MarklyDashboard.tsx)
"use client";

import React, { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import StatsCards from '../components/dashboard/StatsCards';
import RecentBookmarks from '../components/dashboard/RecentBookmarks';
import CategoriesList from '../components/dashboard/CategoriesList';
import PopularThisWeek from '../components/dashboard/PopularThisWeek';
import AIInsights from '../components/dashboard/AIInsights';
import AddCategoryModal from '../components/dashboard/AddCategoryModal';

// Define interfaces for fetched data
interface Category {
  id: string;
  name: string;
  emoji?: string; // Include emoji as it's now part of your Category model
}

// Frontend specific Category for display (with count, icon, color)
interface CategoryForDisplay extends Category {
  count: number;
  icon: string;
  color: string;
}

interface Collection {
  id: string;
  name: string;
  // Add other collection fields if your model has them and they're populated
}

interface Tag {
  id: string;
  name: string;
  weeklyCount: number;
  prevCount: number;
  createdAt: string;
  // Add other tag fields if your model has them and they're populated
}

// This interface reflects the *populated* Bookmark coming from your backend aggregation
interface Bookmark {
  id: string;
  url: string; // Ensure this is mapped from the backend's `url` field
  title: string;
  summary: string;
  tags: Tag[]; // Now an array of Tag objects
  collections: Collection[]; // Now an array of Collection objects
  category?: Category; // Now a single Category object (optional if not set)
  datetime: string; // Corresponds to backend's `CreatedAt`
  userId: string; // Corresponds to backend's `UserID`
  isFav: boolean;
}

const MarklyDashboard = () => {
  // const router = useRouter();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [userBookmarks, setUserBookmarks] = useState<Bookmark[]>([]); // Use the updated Bookmark interface
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [addCategoryLoading, setAddCategoryLoading] = useState(false);
  const [addCategoryError, setAddCategoryError] = useState<string | null>(null);

  const fetchData = useCallback(async <T,>(url: string, method: string = 'GET', body?: any): Promise<T | null> => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found. User might not be authenticated.");
      setError("Authentication token missing. Please log in.");
      // router.push("/login"); // Uncomment if you want to redirect
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

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Categories
      const fetchedCategories = await fetchData<Category[]>("http://localhost:8080/api/categories");
      if (fetchedCategories) {
        setCategories(fetchedCategories.map(cat => ({ id: cat.id, name: cat.name, emoji: cat.emoji }))); // Map emoji
      }

      // 2. Fetch Collections
      const fetchedCollections = await fetchData<Collection[]>("http://localhost:8080/api/collections");
      if (fetchedCollections) {
        setCollections(fetchedCollections.map(col => ({ id: col.id, name: col.name })));
      }

      // 3. Fetch Tags
      const fetchedTags = await fetchData<Tag[]>("http://localhost:8080/api/tags");
      if (fetchedTags) {
        setTags(fetchedTags.map(tag => ({
          id: tag.id,
          name: tag.name,
          weeklyCount: tag.weekly_count,
          prevCount: tag.prev_count,
          createdAt: tag.created_at,
        })));
      }

      // 4. Fetch Bookmarks (these are now populated with category, tags, collections objects)
      let bookmarksUrl = "http://localhost:8080/api/bookmarks";
      if (selectedCategoryId) {
        bookmarksUrl += `?category=${selectedCategoryId}`;
      }
      const fetchedBookmarks = await fetchData<Bookmark[]>(bookmarksUrl); // Expect Bookmark[] (populated)
      if (fetchedBookmarks) {
        // Data should already be in the correct populated format from backend aggregation
        setUserBookmarks(fetchedBookmarks);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred loading dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId, fetchData]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);


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
        await loadDashboardData();
        setIsAddCategoryModalOpen(false);
      }
    } catch (err: any) {
      setAddCategoryError(err.message || "Failed to add category.");
    } finally {
      setAddCategoryLoading(false);
    }
  }, [fetchData, loadDashboardData]);

  // --- Data Derivation for Components ---
  const categoriesForDisplay: CategoryForDisplay[] = categories.map(cat => {
    const count = userBookmarks.filter(bm => bm.category?.id === cat.id).length; // Check category?.id
    const displayIcon = cat.emoji || "📚";
    let assignedColor = "bg-gray-500";
    switch (cat.name.toLowerCase()) {
      case 'development': assignedColor = 'bg-blue-500'; break;
      case 'design': assignedColor = 'bg-purple-500'; break;
      case 'productivity': assignedColor = 'bg-green-500'; break;
      case 'marketing': assignedColor = 'bg-red-500'; break;
      case 'finance': assignedColor = 'bg-yellow-500'; break;
      default: assignedColor = 'bg-gray-500'; break; // Default for unmapped categories
    }
    return { id: cat.id, name: cat.name, count: count, icon: displayIcon, color: assignedColor };
  });

  const popularBookmarks = userBookmarks.filter(bm => bm.isFav).slice(0, 5);


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-red-500 flex flex-col items-center justify-center p-4">
        <p className="text-xl font-bold mb-4">Error Loading Dashboard</p>
        <p className="text-center">{error}</p>
        <p className="text-sm mt-2">Please check your network connection or try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
        categories={categoriesForDisplay}
        onCategorySelect={setSelectedCategoryId}
        selectedCategoryId={selectedCategoryId}
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarExpanded ? 'ml-64' : 'ml-16'
        } p-4 md:p-6`}
      >
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <StatsCards
          totalBookmarksCount={userBookmarks?.length ?? 0}
          totalCategoriesCount={categories?.length ?? 0}
          totalCollectionsCount={collections?.length ?? 0}
          totalTagsCount={tags?.length ?? 0}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-8">
          <div className="lg:col-span-2">
            <RecentBookmarks
              bookmarks={userBookmarks} // userBookmarks now contains populated objects
            />
          </div>
          <div className="space-y-6">
            <CategoriesList
              categories={categoriesForDisplay}
              onAddCategoryClick={() => setIsAddCategoryModalOpen(true)}
            />
            <PopularThisWeek bookmarks={popularBookmarks} />
            <AIInsights />
          </div>
        </div>
      </div>

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

export default MarklyDashboard;
