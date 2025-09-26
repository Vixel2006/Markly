"use client";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, LayoutDashboard, TrendingUp } from "lucide-react";
import { useDashboardData as useDashboard } from "../../hooks/useDashboardData";
import DashboardStats from "../components/dashboard/DashboardStats";
import BookmarkCard from "../components/dashboard/BookmarkCard";

const MarklyDashboardPage = () => {
  const router = useRouter();
  const { userBookmarks, tags, loading, error, handleToggleFavorite } =
    useDashboard();

  const favoriteBookmarks = userBookmarks.filter((bm) => bm.isFav).length;
  const uniqueCategoriesCount = useMemo(
    () =>
      new Set(userBookmarks.flatMap((bm) => bm.categories.map((c) => c.id)))
        .size,
    [userBookmarks],
  );
  const uniqueCollectionsCount = useMemo(
    () =>
      new Set(userBookmarks.flatMap((bm) => bm.collections.map((c) => c.id)))
        .size,
    [userBookmarks],
  );

  const trendingTags = useMemo(() => {
    return (tags || [])
      .filter((tag) => tag.weeklyCount && tag.weeklyCount > 0)
      .sort((a, b) => (b.weeklyCount || 0) - (a.weeklyCount || 0))
      .slice(0, 5);
  }, [tags]);

  const recentBookmarks = useMemo(() => {
    return [...userBookmarks]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 4);
  }, [userBookmarks]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-slate-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold flex items-center gap-3"
        >
          <LayoutDashboard className="w-6 h-6 animate-pulse" /> Loading your
          Markly Dashboard...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-red-100 text-red-700">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <DashboardStats
        totalBookmarks={userBookmarks.length}
        favoriteBookmarks={favoriteBookmarks}
        uniqueCategoriesCount={uniqueCategoriesCount}
        uniqueCollectionsCount={uniqueCollectionsCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-green-500" /> Recent Bookmarks
          </h2>
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {recentBookmarks.length > 0 ? (
              recentBookmarks.map((bookmark) => (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <BookmarkCard
                    bookmark={bookmark}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </motion.div>
              ))
            ) : (
              <div className="text-center text-slate-500 py-10">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                <p className="text-lg font-medium">No recent bookmarks.</p>
              </div>
            )}
          </motion.div>
        </section>

        <section className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-red-500" /> Trending Tags
          </h2>
          <div className="space-y-4">
            {trendingTags.length > 0 ? (
              trendingTags.map((tag) => (
                <motion.div
                  key={tag.id}
                  className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-4 rounded-xl cursor-pointer transition-all border border-gray-100"
                  whileHover={{
                    x: 5,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                  }}
                  onClick={() =>
                    router.push(`/app/bookmarks/all?tag=${tag.id}`)
                  }
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <span className="text-lg font-semibold text-gray-700">
                      #{tag.name}
                    </span>
                  </div>
                  <span className="text-md text-gray-600 bg-purple-100 px-3 py-1 rounded-full">
                    {tag.weeklyCount} mentions
                  </span>
                </motion.div>
              ))
            ) : (
              <div className="text-center text-slate-500 py-10">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                <p className="text-lg font-medium">
                  No trending tags this week.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default MarklyDashboardPage;

