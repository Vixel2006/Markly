"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../../components/dashboard/Sidebar';
import Header from '../../../components/dashboard/Header';
import { Link as LinkIcon, Tag, Folder, CalendarDays, ArrowLeft, Edit, Trash2, Star } from 'lucide-react';

interface PopulatedCategory {
  id: string;
  name: string;
  emoji?: string;
}

interface PopulatedTag {
  id: string;
  name: string;
  weeklyCount?: number;
  prevCount?: number;
  createdAt?: string;
}

interface PopulatedCollection {
  id: string;
  name: string;
}

interface DetailBookmark {
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

interface CategoryForDisplay extends PopulatedCategory {
  count: number;
  icon: string;
  color: string;
}


const BookmarkDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [bookmark, setBookmark] = useState<DetailBookmark | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [categories, setCategories] = useState<PopulatedCategory[]>([]);
  const [collections, setCollections] = useState<PopulatedCollection[]>([]);


  const fetchData = useCallback(async <T,>(url: string, method: string = 'GET', body?: any): Promise<T | null> => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found. User might not be authenticated.");
      setError("Authentication token missing. Please log in.");
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
    const loadPageData = async () => {
      setLoading(true);
      setError(null);

      try {
        const fetchedCategories = await fetchData<PopulatedCategory[]>("http://localhost:8080/api/categories");
        if (fetchedCategories) {
          setCategories(fetchedCategories);
        }
      } catch (err: any) {
        console.error("Error fetching sidebar categories: ", err);
      }

      try {
        const fetchedCollections = await fetchData<PopulatedCollection[]>("http://localhost:8080/api/collections");
        if (fetchedCollections) {
          setCollections(fetchedCollections);
        }
      } catch (err: any) {
        console.error("Error fetching sidebar collections: ", err);
      }


      if (!id || typeof id !== 'string') {
        setLoading(false);
        setError("Invalid bookmark ID provided.");
        return;
      }

      try {
        const data: DetailBookmark = await fetchData<DetailBookmark>(`http://localhost:8080/api/bookmarks/${id}`);
        setBookmark(data);
      } catch (err: any) {
        console.error("Error fetching bookmark details: ", err);
        setError(err.message || "Failed to fetch bookmark details.");
        setBookmark(null);
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [id, fetchData]);


  const categoriesForSidebar: CategoryForDisplay[] = categories.map(cat => {
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

  const handleDeleteBookmark = async () => {
    if (!bookmark || !id) return;

    if (!window.confirm(`Are you sure you want to delete the bookmark "${bookmark.title}"?`)) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      await fetchData(`http://localhost:8080/api/bookmarks/${id}`, "DELETE");
      alert(`Bookmark "${bookmark.title}" deleted successfully!`);
      router.push('/app');
    } catch (err: any) {
      console.error("Error deleting bookmark: ", err);
      setError(err.message || "Failed to delete bookmark.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditBookmark = () => {
    if (bookmark && id) {
      router.push(`/app/bookmarks/edit/${id}`);
    }
  };


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

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-3xl mx-auto mt-8">
          {/* Back to Dashboard Link */}
          <Link href="/app" className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 mb-6 group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>

          {loading && (
            <div className="flex justify-center items-center h-48 flex-col">
              <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="mt-3 text-lg text-slate-400">Loading bookmark...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-300 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {bookmark && !loading && !error && (
            <>
              {/* Main Title and URL Section */}
              <div className="pb-6 mb-6 border-b border-slate-700">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-4xl font-extrabold text-white leading-tight">
                        {bookmark.title}
                    </h2>
                    {bookmark.isFav && (
                        <Star className="w-7 h-7 text-yellow-400 fill-current" title="Favorite Bookmark" />
                    )}
                </div>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline flex items-center gap-2 text-sm"
                >
                  <LinkIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{bookmark.url}</span>
                </a>
              </div>

              <div className="space-y-6">
                {bookmark.summary && (
                  <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                    <h4 className="text-slate-300 text-sm font-medium mb-2">Summary</h4>
                    <p className="text-slate-200 leading-relaxed">
                      {bookmark.summary}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookmark.category && bookmark.category.name && (
                    <div className="bg-slate-700 p-4 rounded-lg border border-slate-600 flex items-center gap-3">
                      <Folder className="w-6 h-6 text-purple-400 flex-shrink-0" />
                      <div>
                        <p className="text-slate-300 text-sm font-medium">Category</p>
                        <span className="bg-blue-600 bg-opacity-20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                          {bookmark.category.emoji ? `${bookmark.category.emoji} ` : ''}{bookmark.category.name}
                        </span>
                      </div>
                    </div>
                  )}

                  {bookmark.tags && bookmark.tags.length > 0 && (
                    <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="w-6 h-6 text-green-400 flex-shrink-0" />
                        <h4 className="text-slate-300 text-sm font-medium">Tags</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {bookmark.tags.map((tag) => (
                          <span key={tag.id} className="bg-slate-600 px-3 py-1 rounded-full text-xs text-slate-300">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {bookmark.collections && bookmark.collections.length > 0 && (
                    <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                      <div className="flex items-center gap-2 mb-2">
                        <Folder className="w-6 h-6 text-orange-400 flex-shrink-0" />
                        <h4 className="text-slate-300 text-sm font-medium">Collections</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {bookmark.collections.map((collection) => (
                          <span key={collection.id} className="bg-slate-600 px-3 py-1 rounded-full text-xs text-slate-300">
                            {collection.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {bookmark.datetime && (
                    <div className="bg-slate-700 p-4 rounded-lg border border-slate-600 flex items-center gap-3">
                      <CalendarDays className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                      <div>
                        <p className="text-slate-300 text-sm font-medium">Added On</p>
                        <span className="text-slate-200 text-sm">
                          {new Date(bookmark.datetime).toLocaleDateString()}
                          <br />
                          <span className="text-xs text-slate-400">{new Date(bookmark.datetime).toLocaleTimeString()}</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-4 mt-8 justify-end pt-6 border-t border-slate-700">
                  <button
                    onClick={handleEditBookmark} // Attach edit handler
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={handleDeleteBookmark} // Attach delete handler
                    disabled={isDeleting} // Disable during deletion
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" /> Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {!bookmark && !loading && !error && (
             <div className="bg-slate-700 p-5 rounded-lg text-center text-slate-400">
                <p>Bookmark not found or unable to load details.</p>
                <Link href="/app" className="text-blue-400 hover:underline mt-3 block">Go back to Dashboard</Link>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookmarkDetailPage;
