"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../../../components/dashboard/Sidebar';
import Header from '../../../../components/dashboard/Header';
import { ArrowLeft, Plus, Save } from 'lucide-react';

interface PopulatedCategory {
  id: string;
  name: string;
  emoji?: string;
}

interface PopulatedTag {
  id: string;
  name: string;
}

interface PopulatedCollection {
  id: string;
  name: string;
}

interface BookmarkData {
  id: string;
  url: string;
  title: string;
  summary: string;
  category?: PopulatedCategory;
  tags?: PopulatedTag[];
  collections?: PopulatedCollection[];
  datetime: string;
  isFav: boolean;
  userId: string;
}

interface BookmarkEditFormData {
  url: string;
  title: string;
  summary: string;
  categoryName: string;
  tagNames: string;
  collectionNames: string;
  isFav: boolean;
}

interface CategoryForDisplay extends PopulatedCategory {
  count: number;
  icon: string;
  color: string;
}


const BookmarkEditPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [bookmark, setBookmark] = useState<BookmarkData | null>(null);
  const [formData, setFormData] = useState<BookmarkEditFormData>({
    url: '',
    title: '',
    summary: '',
    categoryName: '',
    tagNames: '',
    collectionNames: '',
    isFav: false,
  });

  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);


  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [availableCategories, setAvailableCategories] = useState<PopulatedCategory[]>([]);
  const [availableCollections, setAvailableCollections] = useState<PopulatedCollection[]>([]);
  const [availableTags, setAvailableTags] = useState<PopulatedTag[]>([]);

  const fetchData = useCallback(async <T,>(url: string, method: string = 'GET', body?: any): Promise<T | null> => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found. User might not be authenticated.");
      setPageError("Authentication token missing. Please log in.");
      router.push("/login");
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
  }, [router]);


  useEffect(() => {
    const loadBookmarkAndOptions = async () => {
      setPageLoading(true);
      setPageError(null);

      if (!id || typeof id !== 'string') {
        setPageLoading(false);
        setPageError("Invalid bookmark ID provided.");
        return;
      }

      try {
        const fetchedBookmark = await fetchData<BookmarkData>(`http://localhost:8080/api/bookmarks/${id}`);
        if (fetchedBookmark) {
          setBookmark(fetchedBookmark);
          setFormData({
            url: fetchedBookmark.url,
            title: fetchedBookmark.title,
            summary: fetchedBookmark.summary,
            categoryName: fetchedBookmark.category?.name || '',
            tagNames: fetchedBookmark.tags?.map(t => t.name).join(', ') || '',
            collectionNames: fetchedBookmark.collections?.map(c => c.name).join(', ') || '',
            isFav: fetchedBookmark.isFav,
          });
        }
      } catch (err: any) {
        setPageError(err.message || "Failed to fetch bookmark details for editing.");
      }

      try {
        const fetchedCategories = await fetchData<PopulatedCategory[]>("http://localhost:8080/api/categories");
        if (fetchedCategories) setAvailableCategories(fetchedCategories);

        const fetchedCollections = await fetchData<PopulatedCollection[]>("http://localhost:8080/api/collections");
        if (fetchedCollections) setAvailableCollections(fetchedCollections);

        const fetchedTags = await fetchData<PopulatedTag[]>("http://localhost:8080/api/tags");
        if (fetchedTags) setAvailableTags(fetchedTags);
      } catch (err: any) {
        console.warn("Could not fetch options for bookmark edit form:", err);
      } finally {
        setPageLoading(false);
      }
    };

    loadBookmarkAndOptions();
  }, [id, fetchData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    if (!id || typeof id !== 'string') {
      setUpdateError("Invalid bookmark ID for update.");
      setUpdateLoading(false);
      return;
    }

    try {
      const payload: Partial<BookmarkEditFormData> = {
        title: formData.title,
        summary: formData.summary,
        categoryName: formData.categoryName || undefined,
        tagNames: formData.tagNames.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        collectionNames: formData.collectionNames.split(',').map(col => col.trim()).filter(col => col.length > 0),
        isFav: formData.isFav,
      };

      const updatedBookmark = await fetchData<BookmarkData>(`http://localhost:8080/api/bookmarks/${id}`, "PUT", payload);

      if (updatedBookmark) {
        setBookmark(updatedBookmark);
        setFormData({
            url: updatedBookmark.url,
            title: updatedBookmark.title,
            summary: updatedBookmark.summary,
            categoryName: updatedBookmark.category?.name || '',
            tagNames: updatedBookmark.tags?.map(t => t.name).join(', ') || '',
            collectionNames: updatedBookmark.collections?.map(c => c.name).join(', ') || '',
            isFav: updatedBookmark.isFav,
        });
        setUpdateSuccess("Bookmark updated successfully!");
      }
    } catch (err: any) {
      console.error("Error updating bookmark: ", err);
      setUpdateError(err.message || "Failed to update bookmark.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Prepare categories for Sidebar
  const categoriesForSidebar: CategoryForDisplay[] = availableCategories.map(cat => {
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
    return { id: cat.id, name: cat.name, count: 0, icon: displayIcon, color: assignedColor };
  });


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
          {/* Back to Bookmark Detail Link */}
          <Link href={`/app/bookmarks/${id}`} className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 mb-6 group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Bookmark Details</span>
          </Link>

          {pageLoading && (
            <div className="flex justify-center items-center h-48 flex-col">
              <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="mt-3 text-lg text-slate-400">Loading bookmark for edit...</span>
            </div>
          )}

          {pageError && (
            <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-300 p-3 rounded-lg text-sm text-center">
              {pageError}
            </div>
          )}

          {bookmark && !pageLoading && !pageError && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center">Edit Bookmark</h2>
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
                    disabled={true}
                  />
                  <p className="text-xs text-slate-400 mt-1">URL cannot be changed.</p>
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
                    disabled={updateLoading}
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
                    disabled={updateLoading}
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
                    disabled={updateLoading}
                  >
                    <option value="">Select a category</option>
                    {availableCategories.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.emoji ? `${cat.emoji} ` : ''}{cat.name}
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
                    disabled={updateLoading}
                  />
                  {availableTags.length > 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      Suggestions: {availableTags.slice(0, 5).map(t => t.name).join(', ')}{availableTags.length > 5 ? '...' : ''}
                    </p>
                  )}
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
                    disabled={updateLoading}
                  />
                  {availableCollections.length > 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      Suggestions: {availableCollections.slice(0, 5).map(c => c.name).join(', ')}{availableCollections.length > 5 ? '...' : ''}
                    </p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFav"
                    name="isFav"
                    checked={formData.isFav}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                    disabled={updateLoading}
                  />
                  <label htmlFor="isFav" className="ml-2 block text-sm text-slate-300">
                    Mark as Favorite
                  </label>
                </div>

                {updateError && (
                  <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-300 p-3 rounded-lg text-sm">
                    {updateError}
                  </div>
                )}

                {updateSuccess && (
                  <div className="bg-green-900 bg-opacity-30 border border-green-700 text-green-300 p-3 rounded-lg text-sm">
                    {updateSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {!bookmark && !pageLoading && !pageError && (
             <div className="bg-slate-700 p-5 rounded-lg text-center text-slate-400">
                <p>Bookmark not found or unable to load details for editing.</p>
                <Link href="/app" className="text-blue-400 hover:underline mt-3 block">Go back to Dashboard</Link>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookmarkEditPage;

