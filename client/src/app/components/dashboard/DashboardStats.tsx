"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Star, Folder, Tag as TagIcon } from "lucide-react";

interface DashboardStatsProps {
  totalBookmarks: number;
  favoriteBookmarks: number;
  uniqueCollectionsCount: number;
  uniqueCategoriesCount: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalBookmarks,
  favoriteBookmarks,
  uniqueCollectionsCount,
  uniqueCategoriesCount,
}) => {
  return (
    <section>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <BookOpen className="w-7 h-7 text-indigo-500" /> Your Markly Snapshot
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl text-center shadow-md flex flex-col items-center"
          whileHover={{ scale: 1.03 }}
        >
          <BookOpen className="w-8 h-8 text-indigo-600 mb-3" />
          <div className="text-4xl font-bold text-indigo-800">
            {totalBookmarks}
          </div>
          <div className="text-md font-medium text-slate-700 mt-1">
            Total Bookmarks
          </div>
        </motion.div>
        <motion.div
          className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl text-center shadow-md flex flex-col items-center"
          whileHover={{ scale: 1.03 }}
        >
          <Star className="w-8 h-8 text-pink-600 mb-3" />
          <div className="text-4xl font-bold text-pink-800">
            {favoriteBookmarks}
          </div>
          <div className="text-md font-medium text-slate-700 mt-1">
            Favorite Bookmarks
          </div>
        </motion.div>
        <motion.div
          className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl text-center shadow-md flex flex-col items-center"
          whileHover={{ scale: 1.03 }}
        >
          <Folder className="w-8 h-8 text-emerald-600 mb-3" />
          <div className="text-4xl font-bold text-emerald-800">
            {uniqueCollectionsCount}
          </div>
          <div className="text-md font-medium text-slate-700 mt-1">
            Unique Collections
          </div>
        </motion.div>
        <motion.div
          className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl text-center shadow-md flex flex-col items-center"
          whileHover={{ scale: 1.03 }}
        >
          <TagIcon className="w-8 h-8 text-purple-600 mb-3" />
          <div className="text-4xl font-bold text-purple-800">
            {uniqueCategoriesCount}
          </div>
          <div className="text-md font-medium text-slate-700 mt-1">
            Unique Categories
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardStats;
