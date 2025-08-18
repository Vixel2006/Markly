"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
// Assuming these paths are correct, or use aliases like @/components
import Sidebar from '../../../components/dashboard/Sidebar';
import Header from '../../../components/dashboard/Header';
import { Link as LinkIcon, Tag, Folder, CalendarDays, ArrowLeft, Edit, Trash2 } from 'lucide-react'; // Added Edit, Trash2 icons

// Bookmark interface (ensure this matches your Go model's JSON output)
interface Bookmark {
  id: string; // primitive.ObjectID comes as string
  url: string;
  title: string;
  description?: string; // Optional
  category?: string;    // Optional
  tags?: string[];      // Optional
  created_at: string;   // primitive.DateTime comes as string
  // user_id is internal, not usually displayed
}

const BookmarkDetailPage = () => {
  const { id } = useParams(); // Get the bookmark ID from the URL
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // For Header

  // Dummy categories for sidebar, adjust if you fetch these globally
  const categories = [
    { name: "Development", count: 24, icon: "💻", color: "bg-blue-500" },
    { name: "Design", count: 18, icon: "🎨", color: "bg-pink-500" },
    { name: "Productivity", count: 30, icon: "⏱️", color: "bg-green-500" },
    { name: "AI/ML", count: 12, icon: "🤖", color: "bg-purple-500" },
  ];

  useEffect(() => {
    const fetchBookmarkDetails = async () => {
      if (!id || typeof id !== 'string') { // Ensure ID is a string and exists
        setLoading(false);
        setError("Invalid bookmark ID provided.");
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8080/api/bookmarks/${id}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `${token}`
          }
        });

        if (!res.ok) {
          const errText = await res.text();
          try {
            const errData = JSON.parse(errText);
            setError(errData.message || "Failed to fetch bookmark details.");
          } catch (parseError) {
            setError(errText || `Failed to fetch bookmark details: ${res.status} ${res.statusText}`);
          }
          setBookmark(null);
          return;
        }

        const data: Bookmark = await res.json();
        setBookmark(data);
      } catch (err) {
        console.error("Network error fetching bookmark details: ", err);
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarkDetails();
  }, [id]); // Re-run effect if ID changes

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
        categories={categories}
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
                <h2 className="text-4xl font-extrabold text-white mb-2 leading-tight">
                  {bookmark.title}
                </h2>
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
                {/* Description Section */}
                {bookmark.description && (
                  <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                    <h4 className="text-slate-300 text-sm font-medium mb-2">Description</h4>
                    <p className="text-slate-200 leading-relaxed">
                      {bookmark.description}
                    </p>
                  </div>
                )}

                {/* Details Grid: Category, Tags, Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookmark.category && (
                    <div className="bg-slate-700 p-4 rounded-lg border border-slate-600 flex items-center gap-3">
                      <Folder className="w-6 h-6 text-purple-400 flex-shrink-0" />
                      <div>
                        <p className="text-slate-300 text-sm font-medium">Category</p>
                        <span className="bg-blue-600 bg-opacity-20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                          {bookmark.category}
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
                        {bookmark.tags.map((tag, index) => (
                          <span key={index} className="bg-slate-600 px-3 py-1 rounded-full text-xs text-slate-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {bookmark.created_at && (
                    <div className="bg-slate-700 p-4 rounded-lg border border-slate-600 flex items-center gap-3">
                      <CalendarDays className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                      <div>
                        <p className="text-slate-300 text-sm font-medium">Added On</p>
                        <span className="text-slate-200 text-sm">
                          {new Date(bookmark.created_at).toLocaleDateString()}
                          <br />
                          <span className="text-xs text-slate-400">{new Date(bookmark.created_at).toLocaleTimeString()}</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons (uncomment and implement onClick handlers later) */}
                <div className="flex gap-4 mt-8 justify-end pt-6 border-t border-slate-700">
                  <button className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </>
          )}

          {!bookmark && !loading && !error && (
             <div className="bg-slate-700 p-5 rounded-lg text-center text-slate-400">
                <p>Bookmark not found or unable to load details.</p>
                <Link href="/app/dashboard" className="text-blue-400 hover:underline mt-3 block">Go back to Dashboard</Link>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookmarkDetailPage;
