"use client";
import React from "react";
import {
  BookOpen,
  Plus,
  X,
  Folder,
  LayoutDashboard,
  Bookmark,
  Tags as TagsIcon,
  Star,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  User,
  Search,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// --- Interfaces for data (aligned with MarklyDashboard) ---
interface Category {
  id: string;
  name: string;
  emoji?: string;
}

interface Collection {
  id: string;
  name: string;
}

interface CollectionForDisplay extends Collection {
  count: number;
}

interface TagData {
  id: string;
  name: string;
  weeklyCount: number;
  prevCount: number;
  createdAt: string;
}

// --- Sidebar Props ---
interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  activePanel: string;
  setActivePanel: (panel: string) => void;

  collections: CollectionForDisplay[];
  tags: TagData[];

  onCategorySelect: (categoryId: string | null) => void;
  selectedCategoryId: string | null;

  onCollectionSelect: (collectionId: string | null) => void;
  selectedCollectionId: string | null;
  onTagSelect: (tagId: string | null) => void;
  selectedTagId: string | null;
  onClearFilters: () => void;
  onAddCategoryClick: () => void;
  onAddCollectionClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isExpanded,
  onToggle,
  activePanel,
  setActivePanel,
  collections,
  tags,
  onCategorySelect,
  selectedCategoryId,
  onCollectionSelect,
  selectedCollectionId,
  onTagSelect,
  selectedTagId,
  onClearFilters,
  onAddCategoryClick,
  onAddCollectionClick,
}) => {
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, panel: "overview", path: "/app" },
    { name: "All Bookmarks", icon: Bookmark, panel: "bookmarks", path: "/app" },
    { name: "Favorites", icon: Star, panel: "favorites", path: "/app/favorites" },
    { name: "AI Suggested", icon: Lightbulb, panel: "ai-suggested", path: "/app/ai-suggested" },
    { name: "Profile", icon: User, panel: "profile", path: "/app/profile" },
  ];

  const sidebarVariants = {
    expanded: { width: "16rem" },
    collapsed: { width: "4rem" },
  };

  const itemTextVariants = {
    expanded: { opacity: 1, x: 0, display: "block" },
    collapsed: { opacity: 0, x: -20, transitionEnd: { display: "none" } },
  };

  const menuSectionHeaderVariants = {
    expanded: { opacity: 1, height: "auto", marginTop: "1.5rem" },
    collapsed: { opacity: 0, height: 0, marginTop: "0rem", transitionEnd: { display: "none" } },
  }

  const handleNavLinkClick = (panel: string, path: string | undefined = undefined) => {
    setActivePanel(panel);
    onClearFilters(); // Clear all filters (search query)
    onCategorySelect(null); // Explicitly clear category filter
    onCollectionSelect(null); // Explicitly clear collection filter
    onTagSelect(null); // Explicitly clear tag filter
    if (path) {
      router.push(path);
    }
  };

  const handleCollectionFilterClick = (collectionId: string) => {
    setActivePanel("bookmarks"); // Always switch to bookmarks view when filtering
    onCollectionSelect(collectionId);
    // Clear other filters when a collection filter is applied
    onCategorySelect(null);
    onTagSelect(null);
    router.push("/app"); // Navigate to the main app page which will show filtered bookmarks
  };

  const handleTagFilterClick = (tagId: string) => {
    setActivePanel("bookmarks"); // Always switch to bookmarks view when filtering
    onTagSelect(tagId);
    // Clear other filters when a tag filter is applied
    onCategorySelect(null);
    onCollectionSelect(null);
    router.push("/app"); // Navigate to the main app page which will show filtered bookmarks
  };

  return (
    <motion.div
      className="bg-gradient-to-br from-indigo-50 to-purple-50 border-r border-indigo-100 h-screen fixed top-0 left-0 flex flex-col shadow-xl z-40 text-slate-700"
      initial={isExpanded ? "expanded" : "collapsed"}
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Sidebar Header (Logo and Toggle) */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-indigo-100">
        <motion.div
          className="flex items-center gap-3 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          {isExpanded && <span className="text-xl font-bold text-gray-900 whitespace-nowrap">Markly</span>}
        </motion.div>
        {/* Toggle button is now in the fixed top header of MarklyDashboard */}
        {/* If you wanted a toggle button here as well, you would put it back and potentially hide the one in the main content. */}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4 custom-scrollbar">
        <motion.h3
          variants={menuSectionHeaderVariants}
          animate={isExpanded ? "expanded" : "collapsed"}
          transition={{ duration: 0.2 }}
          className="text-xs font-semibold text-slate-500 uppercase mb-4"
        >
          MENU
        </motion.h3>
        <nav className="space-y-2 mb-6">
          {navItems.map((item) => (
            <motion.button
              key={item.panel}
              onClick={() => handleNavLinkClick(item.panel, item.path)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                // Conditional justify-content for collapsed state centering
                !isExpanded ? 'justify-center' : 'justify-start'
              } ${
                activePanel === item.panel
                  ? 'bg-indigo-100 text-indigo-800 font-bold shadow-sm'
                  : 'hover:bg-indigo-50 text-slate-700'
              } focus:outline-none focus:ring-2 focus:ring-indigo-300`}
              whileHover={{ scale: 1.02 }}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${activePanel === item.panel ? 'text-indigo-700' : 'text-slate-600'}`} />
              {isExpanded && <motion.span variants={itemTextVariants} transition={{ duration: 0.1 }}>{item.name}</motion.span>}
            </motion.button>
          ))}
        </nav>

        {/* Collections Section */}
        <motion.h3
          variants={menuSectionHeaderVariants}
          animate={isExpanded ? "expanded" : "collapsed"}
          transition={{ duration: 0.2 }}
          className="text-xs font-semibold text-slate-500 uppercase mb-4"
        >
          COLLECTIONS ({collections.length})
        </motion.h3>
        <div className="space-y-2">
          {collections.map((collection) => (
            <motion.button
              key={collection.id}
              onClick={() => handleCollectionFilterClick(collection.id)}
              className={`w-full flex items-center ${
                // Conditional justify-content for collapsed state centering
                !isExpanded ? 'justify-center' : 'justify-between'
              } p-3 rounded-xl transition-all ${
                selectedCollectionId === collection.id && activePanel === "bookmarks"
                  ? 'bg-indigo-100 text-indigo-800 font-semibold shadow-sm'
                  : 'hover:bg-indigo-50 text-slate-700'
              } focus:outline-none focus:ring-2 focus:ring-indigo-300`}
              whileHover={{ scale: 1.02 }}
            >
              <motion.span className={`flex items-center gap-3 overflow-hidden ${!isExpanded && 'justify-center w-full'}`} variants={itemTextVariants}>
                <Folder className={`w-5 h-5 flex-shrink-0 ${selectedCollectionId === collection.id ? 'text-indigo-700' : 'text-slate-600'}`} />
                {isExpanded && <span className="whitespace-nowrap truncate">{collection.name}</span>}
              </motion.span>
              {isExpanded && (
                <motion.span
                  className="text-sm font-medium text-slate-500 bg-indigo-50 px-2 py-0.5 rounded-full flex-shrink-0"
                  variants={itemTextVariants}
                >
                  {collection.count}
                </motion.span>
              )}
            </motion.button>
          ))}
          <motion.button
            onClick={onAddCollectionClick}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-white font-semibold
                       bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600
                       transition-all shadow-md mt-4 focus:outline-none focus:ring-2 focus:ring-pink-300 ${!isExpanded && 'justify-center'}`}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <motion.span variants={itemTextVariants}>Add New Collection</motion.span>}
          </motion.button>
        </div>

        {/* Tags Section */}
        {tags.length > 0 && (
          <>
            <motion.h3
              variants={menuSectionHeaderVariants}
              animate={isExpanded ? "expanded" : "collapsed"}
              transition={{ duration: 0.2 }}
              className="text-xs font-semibold text-slate-500 uppercase mb-4"
            >
              TAGS ({tags.length})
            </motion.h3>
            <div className="space-y-2">
              {tags.map((tag) => (
                <motion.button
                  key={tag.id}
                  onClick={() => handleTagFilterClick(tag.id)}
                  className={`w-full flex items-center ${
                    // Conditional justify-content for collapsed state centering
                    !isExpanded ? 'justify-center' : 'justify-between'
                  } p-3 rounded-xl transition-all ${
                    selectedTagId === tag.id && activePanel === "bookmarks"
                      ? 'bg-indigo-100 text-indigo-800 font-semibold shadow-sm'
                      : 'hover:bg-indigo-50 text-slate-700'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-300`}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.span className={`flex items-center gap-3 overflow-hidden ${!isExpanded && 'justify-center w-full'}`} variants={itemTextVariants}>
                    <TagsIcon className={`w-5 h-5 flex-shrink-0 ${selectedTagId === tag.id ? 'text-indigo-700' : 'text-slate-600'}`} />
                    {isExpanded && <span className="whitespace-nowrap truncate">#{tag.name}</span>}
                  </motion.span>
                </motion.button>
              ))}
            </div>
          </>
        )}

        {/* "Add New Category" is now a standalone button */}
        <motion.button
          onClick={onAddCategoryClick}
          className={`w-full flex items-center gap-3 p-3 rounded-xl text-white font-semibold
                     bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600
                     transition-all shadow-md mt-6 focus:outline-none focus:ring-2 focus:ring-teal-300 ${!isExpanded && 'justify-center'}`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5 flex-shrink-0" />
          {isExpanded && <motion.span variants={itemTextVariants}>Add New Category</motion.span>}
        </motion.button>

      </div>
    </motion.div>
  );
};

export default Sidebar;
