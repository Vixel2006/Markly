// app/profile/page.tsx
"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Calendar, LogOut, BookOpen, Heart, Folder, Tag, Settings, Key,
  TrendingUp, BarChart3, LayoutDashboard, Clock // Added Clock for time-related stats
} from "lucide-react";
import { useRouter } from "next/navigation";

// Import the revised ProfileSidebar
import ProfileSidebar from "../../components/profile/ProfileSidebar"; // Adjust path as necessary
// Assuming BookmarkCard is available from your dashboard components
import BookmarkCard from "../../components/dashboard/BookmarkCard"; // Adjust path as necessary

// --- Interfaces for fetched data (adapted from MarklyDashboard) ---
interface UserProfile {
  id: string;
  username: string;
  email: string;
  createdAt: string;
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

interface TagData {
  id: string;
  name: string;
  createdAt: string;
}

interface BackendBookmark {
  id: string;
  url: string;
  title: string;
  summary: string;
  tags: string[]; // IDs of tags
  collections: string[]; // IDs of collections
  category: string | null; // ID of category
  created_at: string;
  user_id: string;
  is_fav: boolean;
}

// Frontend bookmark for display in recent activity
interface FrontendBookmark {
  id: string;
  url: string;
  title: string;
  summary: string;
  tags: TagData[];
  collections: Collection[];
  category?: Category;
  createdAt: string;
  isFav: boolean;
}


// --- ProfilePage Component ---
export default function ProfilePage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userBookmarks, setUserBookmarks] = useState<FrontendBookmark[]>([]); // Changed to FrontendBookmark
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<TagData[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [activeProfileSection, setActiveProfileSection] = useState<string>("overview");

  // Re-use fetchData from dashboard for consistency
  const fetchData = useCallback(
    async <T,>(url: string, method: string = "GET", body?: any): Promise<T | null> => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token missing. Please log in.");
        router.push("/auth");
        return null;
      }

      try {
        const fetchOptions: RequestInit = {
          method: method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        };
        if (body) {
          fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            router.push("/auth");
            throw new Error("Unauthorized. Please log in again.");
          }
          const errData = await response.json().catch(() => ({ message: `API call failed with status ${response.status}` }));
          throw new Error(errData.message || `API call failed with status ${response.status}`);
        }

        if (response.status === 204 || response.headers.get("Content-Length") === "0") {
          return null;
        }
        return await response.json();
      } catch (err: any) {
        console.error(`Network or API error fetching from ${url}: `, err);
        throw err;
      }
    },
    [router]
  );

  const loadProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        profile,
        backendBookmarks, // Fetched as BackendBookmark[]
        fetchedCategories,
        fetchedCollections,
        fetchedTags,
      ] = await Promise.all([
        fetchData<UserProfile>("http://localhost:8080/api/me"),
        fetchData<BackendBookmark[]>("http://localhost:8080/api/bookmarks"),
        fetchData<Category[]>(`http://localhost:8080/api/categories`),
        fetchData<Collection[]>(`http://localhost:8080/api/collections`),
        fetchData<TagData[]>(`http://localhost:8080/api/tags/user`),
      ]);

      const actualCategories = fetchedCategories || [];
      const actualCollections = fetchedCollections || [];
      const actualTags = fetchedTags || [];
      const actualBookmarks = backendBookmarks || [];

      if (profile) setUserProfile(profile);
      setCategories(actualCategories);
      setCollections(actualCollections);
      setTags(actualTags);

      // Hydrate BackendBookmarks to FrontendBookmarks for consistent usage
      const hydratedBookmarks: FrontendBookmark[] = actualBookmarks.map((bm) => {
        const hydratedTags = (bm.tags || [])
          .map((tagId) => actualTags.find((t) => t.id === tagId))
          .filter((tag): tag is TagData => tag !== undefined);

        const hydratedCollections = (bm.collections || [])
          .map((colId) => actualCollections.find((c) => c.id === colId))
          .filter((col): col is Collection => col !== undefined);

        const hydratedCategory = bm.category
          ? actualCategories.find((cat) => cat.id === bm.category)
          : undefined;

        return {
          id: bm.id,
          url: bm.url,
          title: bm.title,
          summary: bm.summary,
          tags: hydratedTags,
          collections: hydratedCollections,
          category: hydratedCategory,
          createdAt: bm.created_at,
          isFav: bm.is_fav,
        };
      });
      setUserBookmarks(hydratedBookmarks);

    } catch (err: any) {
      setError(err.message || "Failed to load profile data.");
      console.error("Error in loadProfileData:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth");
  };

  // --- Derived Statistics ---
  const totalBookmarks = userBookmarks.length;
  const favoriteBookmarks = userBookmarks.filter((bm) => bm.isFav).length;

  const uniqueCategoriesUsed = useMemo(() => {
    const categoryIdsInBookmarks = new Set(
      userBookmarks.map((bm) => bm.category?.id).filter((id) => id !== undefined) as string[]
    );
    return categories.filter((cat) => categoryIdsInBookmarks.has(cat.id)).length;
  }, [userBookmarks, categories]);

  const uniqueCollectionsUsed = useMemo(() => {
    const collectionIdsInBookmarks = new Set<string>();
    userBookmarks.forEach((bm) => {
      bm.collections?.forEach((col) => collectionIdsInBookmarks.add(col.id)); // Using col.id since now it's FrontendBookmark
    });
    return collections.filter((col) => collectionIdsInBookmarks.has(col.id)).length;
  }, [userBookmarks, collections]);

  const mostUsedTag = useMemo(() => {
    const tagCounts: { [key: string]: number } = {};
    userBookmarks.forEach((bm) => {
      bm.tags?.forEach((tag) => { // Using tag.id now
        tagCounts[tag.id] = (tagCounts[tag.id] || 0) + 1;
      });
    });

    if (Object.keys(tagCounts).length === 0) {
      return null;
    }

    const sortedTags = Object.entries(tagCounts).sort(([, countA], [, countB]) => countB - countA);
    const topTagId = sortedTags[0][0];
    const topTagName = tags.find((t) => t.id === topTagId)?.name;
    const topTagCount = sortedTags[0][1];

    return topTagName ? { name: topTagName, count: topTagCount } : null;
  }, [userBookmarks, tags]);

  const bookmarksAddedLast30Days = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return userBookmarks.filter(bm => new Date(bm.createdAt) > thirtyDaysAgo).length;
  }, [userBookmarks]);

  const bookmarksAddedLastYear = useMemo(() => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return userBookmarks.filter(bm => new Date(bm.createdAt) > oneYearAgo).length;
  }, [userBookmarks]);

  const averageTagsPerBookmark = useMemo(() => {
    if (userBookmarks.length === 0) return 0;
    const totalTags = userBookmarks.reduce((sum, bm) => sum + (bm.tags?.length || 0), 0);
    return (totalTags / userBookmarks.length).toFixed(1);
  }, [userBookmarks]);

  const averageCollectionsPerBookmark = useMemo(() => {
    if (userBookmarks.length === 0) return 0;
    const totalCollections = userBookmarks.reduce((sum, bm) => sum + (bm.collections?.length || 0), 0);
    return (totalCollections / userBookmarks.length).toFixed(1);
  }, [userBookmarks]);

  const recentBookmarks = useMemo(() => {
    return [...userBookmarks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5); // Get top 5 recent bookmarks
  }, [userBookmarks]);

  const handleToggleFavorite = useCallback(async (bookmarkId: string) => {
    // This is a dummy function. In a real app, you'd call an API to update the bookmark
    // and then refresh the local state or reload data.
    setUserBookmarks(prev => prev.map(bm =>
      bm.id === bookmarkId ? { ...bm, isFav: !bm.isFav } : bm
    ));
    // Here you would also call your fetchData to persist this change
    // e.g., await fetchData(`/api/bookmarks/${bookmarkId}`, 'PUT', { is_fav: !currentStatus });
  }, []);

  // --- Loading, Error, No Profile States ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-slate-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold"
        >
          Loading your profile and Markly activity...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-red-100 text-red-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold text-center"
        >
          Error: {error}
          <button
            onClick={() => loadProfileData()}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors block mx-auto"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-semibold"
        >
          No profile data found. Please log in again.
          <button
            onClick={() => handleLogout()}
            className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors block mx-auto"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  const mainContentMl = isSidebarExpanded ? "ml-64" : "ml-16";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-slate-900 flex relative">
      {/* Profile Sidebar */}
      <ProfileSidebar
        isExpanded={isSidebarExpanded}
        onToggleExpand={() => setIsSidebarExpanded(!isSidebarExpanded)}
        activeSection={activeProfileSection}
        setActiveSection={setActiveProfileSection}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 p-6 transition-all duration-300 ${mainContentMl} custom-scrollbar pt-10`}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-xl p-8 max-w-4xl mx-auto border border-indigo-100" // Consistent card styling
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">My Profile</h1>

          {/* Overview Section */}
          {activeProfileSection === "overview" && (
            <>
              {/* User Info */}
              <div className="space-y-6 mb-10">
                <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl shadow-sm border border-indigo-100"> {/* Consistent background */}
                  <User className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-600">Username</span>
                    <span className="text-lg font-semibold text-gray-900">{userProfile.username}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl shadow-sm border border-indigo-100">
                  <Mail className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-600">Email</span>
                    <span className="text-lg font-semibold text-gray-900">{userProfile.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl shadow-sm border border-indigo-100">
                  <Calendar className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-600">Member Since</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {new Date(userProfile.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">My Markly Activity</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <motion.div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl text-center flex flex-col items-center justify-center shadow-md border border-pink-100" whileHover={{ scale: 1.05 }}>
                  <BookOpen className="w-8 h-8 text-pink-600 mb-2" />
                  <div className="text-3xl font-bold text-pink-700 mb-1">{totalBookmarks}</div>
                  <div className="text-sm font-medium text-slate-700">Total Bookmarks</div>
                </motion.div>
                <motion.div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl text-center flex flex-col items-center justify-center shadow-md border border-purple-100" whileHover={{ scale: 1.05 }}>
                  <Heart className="w-8 h-8 text-purple-600 mb-2" />
                  <div className="text-3xl font-bold text-purple-700 mb-1">{favoriteBookmarks}</div>
                  <div className="text-sm font-medium text-slate-700">Favorite Bookmarks</div>
                </motion.div>
                <motion.div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl text-center flex flex-col items-center justify-center shadow-md border border-indigo-100" whileHover={{ scale: 1.05 }}>
                  <Tag className="w-8 h-8 text-indigo-600 mb-2" />
                  <div className="text-3xl font-bold text-indigo-700 mb-1">{uniqueCategoriesUsed}</div>
                  <div className="text-sm font-medium text-slate-700">Categories Used</div>
                </motion.div>
                <motion.div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl text-center flex flex-col items-center justify-center shadow-md border border-emerald-100" whileHover={{ scale: 1.05 }}>
                  <Folder className="w-8 h-8 text-emerald-600 mb-2" />
                  <div className="text-3xl font-bold text-emerald-700 mb-1">{uniqueCollectionsUsed}</div>
                  <div className="text-sm font-medium text-slate-700">Collections Used</div>
                </motion.div>
              </div>

              {/* Additional Usage Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <motion.div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100" whileHover={{ scale: 1.02 }}>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-500" /> Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Bookmarks last 30 days:</span>
                      <span className="font-bold text-indigo-700">{bookmarksAddedLast30Days}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Bookmarks last year:</span>
                      <span className="font-bold text-indigo-700">{bookmarksAddedLastYear}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Avg. Tags per bookmark:</span>
                      <span className="font-bold text-indigo-700">{averageTagsPerBookmark}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Avg. Collections per bookmark:</span>
                      <span className="font-bold text-indigo-700">{averageCollectionsPerBookmark}</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100" whileHover={{ scale: 1.02 }}>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-red-500" /> Most Used Tag</h3>
                  <div className="flex flex-col items-center justify-center py-4">
                    {mostUsedTag ? (
                      <>
                        <div className="text-4xl font-extrabold text-purple-600 mb-2">#{mostUsedTag.name}</div>
                        <div className="text-md text-slate-600">{mostUsedTag.count} mentions</div>
                      </>
                    ) : (
                      <p className="text-slate-600 text-lg">No tags used yet!</p>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Last 5 Recent Bookmarks (Requires BookmarkCard component) */}
              <section className="mt-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <BookOpen className="w-7 h-7 text-green-500" /> Last 5 Bookmarks Added
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          onToggleFavorite={handleToggleFavorite} // Pass a dummy or real toggle func
                        />
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center text-slate-500 py-10 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">You haven't added any bookmarks yet!</p>
                      <p className="text-sm mt-2">Start organizing your knowledge.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Conceptual Activity Over Time (Placeholder) */}
              <section className="mt-10">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <BarChart3 className="w-7 h-7 text-purple-500" /> Activity Trend
                </h3>
                <motion.div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 min-h-[200px] flex items-center justify-center text-center text-slate-500" whileHover={{ scale: 1.01 }}>
                  <p>Visualize your bookmarking activity over time here (e.g., bookmarks per month).</p>
                </motion.div>
              </section>
            </>
          )}

          {/* Account Settings Section */}
          {activeProfileSection === "settings" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-6 bg-indigo-50 rounded-xl border border-indigo-200" // Consistent background
            >
              <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center">Account Settings</h2>
              <p className="text-slate-700 mb-6 text-center">Manage your personal information and preferences.</p>
              <div className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    id="username"
                    defaultValue={userProfile.username}
                    className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-purple-300 focus:outline-none text-gray-900" // Consistent border/focus/text
                    aria-label="New Username"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    defaultValue={userProfile.email}
                    className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-purple-300 focus:outline-none text-gray-900" // Consistent border/focus/text
                    aria-label="New Email Address"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg shadow-md transition-all" // Consistent button
                >
                  Save Account Changes
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Security Section */}
          {activeProfileSection === "security" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-6 bg-purple-50 rounded-xl border border-purple-200" // Consistent background
            >
              <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">Security & Privacy</h2>
              <p className="text-slate-700 mb-6 text-center">Manage your password and security settings.</p>
              <div className="space-y-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    placeholder="Enter current password"
                    className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:outline-none text-gray-900" // Consistent border/focus/text
                    aria-label="Current Password"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    placeholder="Enter new password"
                    className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:outline-none text-gray-900" // Consistent border/focus/text
                    aria-label="New Password"
                  />
                </div>
                <div>
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    placeholder="Confirm new password"
                    className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:outline-none text-gray-900" // Consistent border/focus/text
                    aria-label="Confirm New Password"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg shadow-md transition-all" // Consistent button
                >
                  Change Password
                </motion.button>

                <div className="border-t border-purple-200 pt-6 mt-6">
                  <h3 className="text-xl font-semibold text-purple-700 mb-3">Two-Factor Authentication</h3>
                  <p className="text-slate-600 mb-4">Add an extra layer of security to your account.</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-semibold py-3 rounded-lg shadow-sm transition-all" // Consistent button
                  >
                    Set Up 2FA
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Fallback for unknown section (optional) */}
          {activeProfileSection !== "overview" && activeProfileSection !== "settings" && activeProfileSection !== "security" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-6 bg-gray-100 rounded-xl text-center border border-gray-200"
            >
              <p className="text-xl text-slate-600">Content for "{activeProfileSection}" is under construction!</p>
            </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
