"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
// Added 'X' to the import list
import { User, Mail, Calendar, LogOut, BookOpen, Heart, Folder, Tag, Settings, Key, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

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

interface TagData { // Renamed from Tag to TagData to avoid conflict with LucideReact Tag icon
  id: string;
  name: string;
  // weeklyCount?: number; // Not relevant for profile stats, but could be added
  // prevCount?: number;
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

// --- ProfileSidebar Component ---
interface ProfileSidebarProps {
  isExpanded: boolean;
  onToggleExpand: () => void; // Added for internal toggle
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  isExpanded,
  onToggleExpand,
  activeSection,
  setActiveSection,
  onLogout,
}) => {
  const sidebarVariants = {
    expanded: { width: "16rem" }, // 256px
    collapsed: { width: "4rem" }, // 64px
  };

  const navItemVariants = {
    expanded: { opacity: 1, x: 0, display: "block" },
    collapsed: { opacity: 0, x: -10, transitionEnd: { display: "none" } },
  };

  return (
    <motion.div
      initial={false}
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 h-full bg-gradient-to-br from-green-50 to-emerald-100 text-slate-700 shadow-lg border-r border-green-200 z-30 flex flex-col pt-24"
    >
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <nav className="space-y-2">
          <motion.div
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
              activeSection === "overview" ? "bg-green-200 text-green-800 font-semibold" : "hover:bg-green-100"
            }`}
            onClick={() => setActiveSection("overview")}
          >
            <User className="w-5 h-5 flex-shrink-0" />
            <motion.span
              variants={navItemVariants}
              animate={isExpanded ? "expanded" : "collapsed"}
              transition={{ duration: 0.1, delay: isExpanded ? 0.1 : 0 }}
              className="ml-3 whitespace-nowrap"
            >
              Overview
            </motion.span>
          </motion.div>

          <motion.div
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
              activeSection === "settings" ? "bg-green-200 text-green-800 font-semibold" : "hover:bg-green-100"
            }`}
            onClick={() => setActiveSection("settings")}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <motion.span
              variants={navItemVariants}
              animate={isExpanded ? "expanded" : "collapsed"}
              transition={{ duration: 0.1, delay: isExpanded ? 0.1 : 0 }}
              className="ml-3 whitespace-nowrap"
            >
              Account Settings
            </motion.span>
          </motion.div>

          <motion.div
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
              activeSection === "security" ? "bg-green-200 text-green-800 font-semibold" : "hover:bg-green-100"
            }`}
            onClick={() => setActiveSection("security")}
          >
            <Key className="w-5 h-5 flex-shrink-0" />
            <motion.span
              variants={navItemVariants}
              animate={isExpanded ? "expanded" : "collapsed"}
              transition={{ duration: 0.1, delay: isExpanded ? 0.1 : 0 }}
              className="ml-3 whitespace-nowrap"
            >
              Security
            </motion.span>
          </motion.div>

          {/* You can add more profile-specific navigation items here */}
        </nav>
      </div>

      <div className="p-4 border-t border-green-200">
        <motion.button
          onClick={onLogout}
          className="w-full flex items-center justify-start p-3 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <motion.span
            variants={navItemVariants}
            animate={isExpanded ? "expanded" : "collapsed"}
            transition={{ duration: 0.1, delay: isExpanded ? 0.1 : 0 }}
            className="ml-3 whitespace-nowrap"
          >
            Logout
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
};

// --- ProfilePage Component ---
export default function ProfilePage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userBookmarks, setUserBookmarks] = useState<BackendBookmark[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<TagData[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true); // For toggling sidebar
  const [activeProfileSection, setActiveProfileSection] = useState<string>("overview"); // For sidebar navigation

  const fetchData = useCallback(
    async <T,>(url: string, method: string = "GET", body?: any): Promise<T | null> => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token missing. Please log in.");
        router.push("/auth"); // Redirect to login page
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
          const errData = await response.json();
          throw new Error(errData.message || `API call failed with status ${response.status}`);
        }

        if (response.status === 204 || response.headers.get("Content-Length") === "0") {
          return null; // No content for 204 responses
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
        bookmarks,
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

      if (profile) setUserProfile(profile);
      setUserBookmarks(bookmarks || []);
      setCategories(fetchedCategories || []);
      setCollections(fetchedCollections || []);
      setTags(fetchedTags || []);

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
    router.push("/auth"); // Redirect to login page
  };

  // --- Derived Statistics ---
  const totalBookmarks = userBookmarks.length;
  const favoriteBookmarks = userBookmarks.filter((bm) => bm.is_fav).length;

  const uniqueCategoriesUsed = useMemo(() => {
    const categoryIdsInBookmarks = new Set(
      userBookmarks.map((bm) => bm.category).filter((id) => id !== null) as string[]
    );
    return categories.filter((cat) => categoryIdsInBookmarks.has(cat.id)).length;
  }, [userBookmarks, categories]);

  const uniqueCollectionsUsed = useMemo(() => {
    const collectionIdsInBookmarks = new Set<string>();
    userBookmarks.forEach((bm) => {
      // Safely check if bm.collections exists before calling forEach
      if (bm.collections) {
        bm.collections.forEach((colId) => collectionIdsInBookmarks.add(colId));
      }
    });
    return collections.filter((col) => collectionIdsInBookmarks.has(col.id)).length;
  }, [userBookmarks, collections]);

  const mostUsedTag = useMemo(() => {
    const tagCounts: { [key: string]: number } = {};
    userBookmarks.forEach((bm) => {
      // Safely check if bm.tags exists before calling forEach
      if (bm.tags) {
        bm.tags.forEach((tagId) => {
          tagCounts[tagId] = (tagCounts[tagId] || 0) + 1;
        });
      }
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

  // --- Loading, Error, No Profile States ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-green-50 to-green-200 text-slate-700">
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-red-50 to-red-100 text-red-700">
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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-yellow-50 to-yellow-100 text-yellow-700">
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

  const mainContentMl = isSidebarExpanded ? "ml-64" : "ml-16"; // Adjust margin for sidebar

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 flex relative">
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
        <button
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="fixed top-4 left-4 z-40 p-2 rounded-full bg-white shadow-md text-slate-600 hover:bg-gray-100 transition-colors"
          style={{ marginLeft: isSidebarExpanded ? '16rem' : '4rem' }} // Adjust button position
        >
          {isSidebarExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        
        <motion.div
          className="bg-white rounded-3xl shadow-xl p-8 max-w-4xl mx-auto border border-green-100"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-extrabold text-black mb-6 text-center">My Profile</h1>

          {/* Overview Section */}
          {activeProfileSection === "overview" && (
            <>
              <div className="space-y-6 mb-10">
                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl shadow-sm">
                  <User className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-500">Username</span>
                    <span className="text-lg font-semibold text-black">{userProfile.username}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl shadow-sm">
                  <Mail className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-500">Email</span>
                    <span className="text-lg font-semibold text-black">{userProfile.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl shadow-sm">
                  <Calendar className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-500">Member Since</span>
                    <span className="text-lg font-semibold text-black">
                      {new Date(userProfile.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-extrabold text-black mb-6 text-center">My Markly Activity</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <motion.div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl text-center flex flex-col items-center justify-center" whileHover={{ scale: 1.05 }}>
                  <BookOpen className="w-8 h-8 text-pink-600 mb-2" />
                  <div className="text-3xl font-bold text-pink-700 mb-1">{totalBookmarks}</div>
                  <div className="text-sm font-medium text-slate-700">Total Bookmarks</div>
                </motion.div>
                <motion.div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl text-center flex flex-col items-center justify-center" whileHover={{ scale: 1.05 }}>
                  <Heart className="w-8 h-8 text-purple-600 mb-2" />
                  <div className="text-3xl font-bold text-purple-700 mb-1">{favoriteBookmarks}</div>
                  <div className="text-sm font-medium text-slate-700">Favorite Bookmarks</div>
                </motion.div>
                <motion.div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl text-center flex flex-col items-center justify-center" whileHover={{ scale: 1.05 }}>
                  <Tag className="w-8 h-8 text-yellow-600 mb-2" />
                  <div className="text-3xl font-bold text-yellow-700 mb-1">{uniqueCategoriesUsed}</div>
                  <div className="text-sm font-medium text-slate-700">Categories Used</div>
                </motion.div>
                <motion.div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl text-center flex flex-col items-center justify-center" whileHover={{ scale: 1.05 }}>
                  <Folder className="w-8 h-8 text-green-600 mb-2" />
                  <div className="text-3xl font-bold text-green-700 mb-1">{uniqueCollectionsUsed}</div>
                  <div className="text-sm font-medium text-slate-700">Collections Used</div>
                </motion.div>
              </div>

              <div className="mt-8">
                <h3 className="text-2xl font-semibold text-black mb-4 text-center">My Most Used Tag</h3>
                <motion.div
                  className="bg-white border border-green-100 rounded-2xl shadow-md p-5 text-center flex flex-col items-center justify-center max-w-xs mx-auto"
                  whileHover={{ scale: 1.05 }}
                >
                  {mostUsedTag ? (
                    <>
                      <div className="text-4xl font-extrabold text-purple-600 mb-2">#{mostUsedTag.name}</div>
                      <div className="text-md text-slate-600">{mostUsedTag.count} mentions</div>
                    </>
                  ) : (
                    <p className="text-slate-600 text-lg">No tags used yet!</p>
                  )}
                </motion.div>
              </div>
            </>
          )}

          {/* Account Settings Section */}
          {activeProfileSection === "settings" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-6 bg-blue-50 rounded-xl border border-blue-200"
            >
              <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">Account Settings</h2>
              <p className="text-slate-700 mb-6 text-center">Manage your personal information and preferences.</p>
              <div className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    id="username"
                    defaultValue={userProfile.username}
                    className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    aria-label="New Username"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    defaultValue={userProfile.email}
                    className="w-full p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    aria-label="New Email Address"
                  />
                </div>
                {/* Add more settings fields here, e.g., preferred language, timezone */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md transition-all"
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
              className="p-6 bg-purple-50 rounded-xl border border-purple-200"
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
                    className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-300 focus:outline-none"
                    aria-label="Current Password"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    placeholder="Enter new password"
                    className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-300 focus:outline-none"
                    aria-label="New Password"
                  />
                </div>
                <div>
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    placeholder="Confirm new password"
                    className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-300 focus:outline-none"
                    aria-label="Confirm New Password"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg shadow-md transition-all"
                >
                  Change Password
                </motion.button>
                
                <div className="border-t border-purple-200 pt-6 mt-6">
                  <h3 className="text-xl font-semibold text-purple-700 mb-3">Two-Factor Authentication</h3>
                  <p className="text-slate-600 mb-4">Add an extra layer of security to your account.</p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg shadow-sm transition-all"
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
              className="p-6 bg-gray-100 rounded-xl text-center"
            >
              <p className="text-xl text-slate-600">Content for "{activeProfileSection}" is under construction!</p>
            </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
