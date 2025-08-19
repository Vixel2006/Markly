"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Folder, Tags, Star } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface Bookmark {
  id: string;
  userId: string;
  url: string;
  title: string;
  summary: string;
  tags: string[];
  collections: string[];
  category?: string;
  isFav: boolean;
  datetime: string;
  thumbnail?: string;
}

interface Category {
  id: string;
  name: string;
  emoji?: string;
}

interface Collection {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

const BookmarkDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const handleToggleFavorite = async () => {
    if (!bookmark) return;
    setLoading(true); // Or a more specific loading state for just the favorite toggle
    setError(null);
    try {
      const newFavStatus = !bookmark.isFav;
      const updatedBm = await fetchData<Bookmark>(
        `http://localhost:8080/api/bookmarks/${bookmark.id}`,
        "PUT",
        { isFav: newFavStatus }
      );
      if (updatedBm) {
        setBookmark(updatedBm);
      }
    } catch (err: any) {
      setError(err.message || "Failed to toggle favorite status.");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async <T,>(url: string, method: string = "GET", body?: any): Promise<T | null> => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `API call failed with status ${response.status}`);
      }
      return await response.json();
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  useEffect(() => {
    const getBookmarkDetails = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const fetchedBookmark = await fetchData<Bookmark>(`http://localhost:8080/api/bookmarks/${id}`);
        setBookmark(fetchedBookmark);

        // Fetch related data (categories, collections, tags)
        const fetchedCategories = await fetchData<Category[]>("http://localhost:8080/api/categories");
        if (fetchedCategories) setCategories(fetchedCategories);

        const fetchedCollections = await fetchData<Collection[]>("http://localhost:8080/api/collections");
        if (fetchedCollections) setCollections(fetchedCollections);

        const fetchedTags = await fetchData<Tag[]>("http://localhost:8080/api/tags");
        if (fetchedTags) setTags(fetchedTags);

      } catch (err: any) {
        setError(err.message || "Failed to fetch bookmark details.");
      } finally {
        setLoading(false);
      }
    };
    getBookmarkDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-green-50 to-green-200 text-slate-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold"
        >
          Loading bookmark details...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-red-50 to-red-100 text-red-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold text-red-600"
        >
          Error: {error}
        </motion.div>
      </div>
    );
  }

  if (!bookmark) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-yellow-50 to-yellow-100 text-yellow-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold"
        >
          Bookmark not found.
        </motion.div>
      </div>
    );
  }

  const displayCategory = categories.find(cat => cat.id === bookmark.category);
  const displayCollections = collections.filter(col => bookmark.collections.includes(col.id));
  const displayTags = tags.filter(tag => bookmark.tags.includes(tag.id));

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
          <button
            onClick={handleToggleFavorite}
            className="p-2 rounded-full hover:bg-yellow-100 transition-colors"
            aria-label="Toggle Favorite"
          >
            <Star
              className={`w-8 h-8 ${bookmark.isFav ? "text-yellow-500 fill-current" : "text-slate-400"}`}
            />
          </button>
        </div>
        
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 hover:underline text-lg mb-6 block truncate"
        >
          {bookmark.url}
        </a>

        <div className="text-slate-700 text-lg leading-relaxed mb-6 markdown-content">
          {bookmark.summary ? (
            <ReactMarkdown>{bookmark.summary}</ReactMarkdown>
          ) : (
            "No summary available."
          )}
        </div>

        {displayCategory && (
          <div className="flex items-center gap-3 bg-green-50 rounded-full px-4 py-2 text-green-800 text-sm font-medium mb-4 w-fit shadow-sm">
            <BookOpen className="w-4 h-4" />
            Category: {displayCategory.emoji} {displayCategory.name}
          </div>
        )}

        {displayCollections.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-black mb-2">Collections:</h3>
            <div className="flex flex-wrap gap-2">
              {displayCollections.map((col) => (
                <span key={col.id} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm shadow-sm">
                  <Folder className="w-4 h-4" />
                  {col.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {displayTags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-2">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {displayTags.map((tag) => (
                <span key={tag.id} className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm shadow-sm">
                  <Tags className="w-4 h-4" />
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="text-right text-sm text-slate-500 mt-8">
          Added on: {new Date(bookmark.datetime).toLocaleDateString()} at {new Date(bookmark.datetime).toLocaleTimeString()}
        </div>
      </motion.div>
    </div>
  );
}

export default BookmarkDetailPage;
