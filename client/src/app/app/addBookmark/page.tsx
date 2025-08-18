"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import Header from '../../components/dashboard/Header';
import { Plus } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Collection {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
  weeklyCount: number;
  prevCount: number;
  createdAt: string;
}

interface CategoryForDisplay extends Category {
  count: number;
  icon: string;
  color: string;
}

interface BookmarkFormData {
  url: string;
  title: string;
  summary: string;
  categoryName: string;
  tagNames: string;
  collectionNames: string;
  isFav: boolean;
}

const AddBookmarkPage = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<BookmarkFormData>({
    url: '',
    title: '',
    summary: '',
    categoryName: '',
    tagNames: '',
    collectionNames: '',
    isFav: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [availableCollections, setAvailableCollections] = useState<Collection[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

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

  useEffect(() => {
    const loadFormData = async () => {
      const fetchedCategories = await fetchData<Category[]>("http://localhost:8080/api/categories");
      if (fetchedCategories) {
        setAvailableCategories(fetchedCategories.map(cat => ({ id: cat.id, name: cat.name })));
      }

      const fetchedCollections = await fetchData<Collection[]>("http://localhost:8080/api/collections");
      if (fetchedCollections) {
        setAvailableCollections(fetchedCollections.map(col => ({ id: col.id, name: col.name })));
      }

      const fetchedTags = await fetchData<Tag[]>("http://localhost:8080/api/tags");
      if (fetchedTags) {
        setAvailableTags(fetchedTags.map(tag => ({
          id: tag.id, name: tag.name, weeklyCount: tag.weekly_count, prevCount: tag.prev_count, createdAt: tag.created_at
        })));
      }
    };

    loadFormData();
  }, [fetchData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: Omit<BookmarkFormData, 'tagNames' | 'collectionNames'> & { tagNames: string[], collectionNames: string[] } = {
        url: formData.url,
        title: formData.title,
        summary: formData.summary || "",
        categoryName: formData.categoryName || "",
        tagNames: formData.tagNames.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        collectionNames: formData.collectionNames.split(',').map(col => col.trim()).filter(col => col.length > 0),
        isFav: formData.isFav,
      };

      const res = await fetchData<any>("http://localhost:8080/api/bookmarks", "POST", payload);

      if (res) {
        setSuccess(`Bookmark "${res.title}" added successfully!`);
        setFormData({
          url: '',
          title: '',
          summary: '',
          categoryName: '',
          tagNames: '',
          collectionNames: '',
          isFav: false,
        });
      }
    } catch (err: any) {
      console.error("Error adding bookmark: ", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const categoriesForSidebar: CategoryForDisplay[] = availableCategories.map(cat => ({
    id: cat.id,
    name: cat.name,
    count: 0,
    icon: "📚",
    color: "bg-gray-500",
  }));


  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
        categories={categoriesForSidebar}
        onCategorySelect={() => {}}
        selectedCategoryId={null}
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

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-2xl mx-auto mt-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Add New Bookmark</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-slate-300 mb-1">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 placeholder-slate-400 text-white"
                placeholder="https://example.com/awesome-resource"
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 placeholder-slate-400 text-white"
                placeholder="A concise title for your bookmark"
              />
            </div>

            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-slate-300 mb-1">
                Summary (Optional, supports Markdown)
              </label>
              <textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 placeholder-slate-400 text-white"
                placeholder="A brief summary of the content. Leave empty for AI to generate."
              ></textarea>
            </div>

            <div>
              <label htmlFor="categoryName" className="block text-sm font-medium text-slate-300 mb-1">
                Category (Optional)
              </label>
              <select
                id="categoryName"
                name="categoryName"
                value={formData.categoryName}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 text-white appearance-none pr-8"
              >
                <option value="">Select a category</option>
                {availableCategories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tagNames" className="block text-sm font-medium text-slate-300 mb-1">
                Tags (Optional, comma-separated names)
              </label>
              <input
                type="text"
                id="tagNames"
                name="tagNames"
                value={formData.tagNames}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 placeholder-slate-400 text-white"
                placeholder="e.g., react, javascript, frontend"
              />
            </div>

            <div>
              <label htmlFor="collectionNames" className="block text-sm font-medium text-slate-300 mb-1">
                Collections (Optional, comma-separated names)
              </label>
              <input
                type="text"
                id="collectionNames"
                name="collectionNames"
                value={formData.collectionNames}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 placeholder-slate-400 text-white"
                placeholder="e.g., my-favorites, projects"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFav"
                name="isFav"
                checked={formData.isFav}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isFav" className="ml-2 block text-sm text-slate-300">
                Mark as Favorite
              </label>
            </div>

            {error && (
              <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-300 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-900 bg-opacity-30 border border-green-700 text-green-300 p-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Bookmark...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add Bookmark
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBookmarkPage;
