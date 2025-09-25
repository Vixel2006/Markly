"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Folder, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  emoji?: string; // Emoji is an optional property
}

interface Collection {
  id: string;
  name: string;
}

interface TagType { // Renamed from Tag to TagType to avoid conflict with 'lucide-react' Tag component
  id: string;
  name: string;
}

interface BookmarkCardData {
  id: string;
  title: string;
  url: string;
  summary: string; // The summary data will still be present in the bookmark object
  categories?: Category[]; // Array of Category objects
  collections: Collection[]; // Array of Collection objects
  tags: TagType[]; // Array of TagType objects
  isFav: boolean;
  createdAt: string;
}

interface BookmarkCardProps {
  bookmark: BookmarkCardData;
  onToggleFavorite: (bookmarkId: string) => void;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, onToggleFavorite }) => {
  const router = useRouter();

  return (
    <motion.div
      key={bookmark.id}
      className="bg-white rounded-3xl shadow-lg p-6 flex flex-col justify-between border border-green-100 cursor-pointer"
      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.2 }}
      onClick={() => router.push(`/app/bookmarks/${bookmark.id}`)} // Navigate to bookmark details
    >
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{bookmark.title}</h3>
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 hover:underline text-sm mb-3 block truncate"
          onClick={(e) => e.stopPropagation()} // Prevent card click when clicking URL
        >
          {bookmark.url}
        </a>
        {/* Removed the summary display here */}
        {/* <p className="text-gray-600 text-sm mb-4 line-clamp-3">{bookmark.summary}</p> */}

        <div className="flex flex-wrap gap-2 mb-4">
          {bookmark.categories?.map((cat) => (
            <span
              key={cat.id}
              className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium"
            >
              {cat.emoji ? `${cat.emoji} ${cat.name}` : cat.name}
            </span>
          ))}
          {bookmark.collections?.map((col) => (
            <span
              key={col.id}
              className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium"
            >
              <Folder className="inline-block w-3 h-3 mr-1" />
              {col.name}
            </span>
          ))}
          {bookmark.tags?.map((tag) => (
            <span
              key={tag.id}
              className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium"
            >
              <Tag className="inline-block w-3 h-3 mr-1" />
              {tag.name}
            </span>
          ))}
          {(!bookmark.tags || bookmark.tags.length === 0) &&
            (!bookmark.categories || bookmark.categories.length === 0) &&
            (!bookmark.collections || bookmark.collections.length === 0) && (
              <span className="text-xs text-gray-500 italic">No tags or categories</span>
            )}
        </div>
      </div>
      <div className="flex justify-between items-center text-gray-500 text-xs">
        <span>{new Date(bookmark.createdAt).toLocaleDateString()}</span>
        <motion.button
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click when clicking favorite button
            onToggleFavorite(bookmark.id);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Star
            className={`w-5 h-5 ${
              bookmark.isFav ? "text-yellow-400 fill-current" : "text-gray-400"
            }`}
          />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default BookmarkCard;
