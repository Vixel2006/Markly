import React from "react";
import { BookOpen, Plus, X, Folder, LayoutDashboard, Bookmark, Tags, Star, Lightbulb, ChevronLeft, ChevronRight, User } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  emoji?: string;
}

interface CategoryForDisplay extends Category {
  count: number;
  icon: string;
  color: string;
}

interface Collection {
  id: string;
  name: string;
}

interface CollectionForDisplay extends Collection {
  count: number;
}

interface Tag {
  id: string;
  name: string;
}

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  activePanel: string;
  setActivePanel: (panel: string) => void;
  categories: CategoryForDisplay[];
  collections: CollectionForDisplay[];
  tags: Tag[];
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
  categories,
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
    { name: "Dashboard", icon: LayoutDashboard, panel: "dashboard" },
    { name: "All Bookmarks", icon: Bookmark, panel: "bookmarks" },
    { name: "Collections", icon: Folder, panel: "collections" },
    { name: "Tags", icon: Tags, panel: "tags" },
    { name: "Favorites", icon: Star, panel: "favorites" },
    { name: "AI Suggested", icon: Lightbulb, panel: "ai-suggested" },
    { name: "Profile", icon: User, panel: "profile" },
  ];

  const sidebarVariants = {
    expanded: { width: "16rem" },
    collapsed: { width: "4rem" },
  };

  const itemVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 },
  };

  return (
    <motion.div
      className="bg-white border-r border-green-100 h-screen fixed top-0 left-0 flex flex-col shadow-lg z-40"
      initial={isExpanded ? "expanded" : "collapsed"}
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-green-100">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          {isExpanded && <span className="text-xl font-bold text-black">Markly</span>}
        </motion.div>
        <button
          onClick={onToggle}
          className="p-2 rounded-full hover:bg-green-100 transition-colors text-slate-700"
        >
          {isExpanded ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-4 custom-scrollbar">
        <h3 className={`text-xs font-semibold text-slate-500 uppercase mb-4 ${!isExpanded && 'hidden'}`}>MENU</h3>
        <nav className="space-y-2 mb-6">
          {navItems.map((item) => (
            <motion.button
              key={item.panel}
              onClick={() => {
                if (item.panel === "profile") {
                  router.push("/app/profile");
                } else if (item.panel === "bookmarks") {
                  router.push("/app/bookmarks/all");
                } else if (item.panel === "dashboard") {
                  router.push("/app")
                } else if (item.panel === "collections") {
                  router.push("/app/collections")
                } else if (item.panel === "favorites") {
                  router.push("/app/bookmarks/favorite")
                } else {
                  setActivePanel(item.panel);
                  onClearFilters();
                }
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-slate-700 hover:bg-green-100 ${
                activePanel === item.panel ? 'bg-green-100 text-black font-semibold' : ''
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isExpanded && <motion.span variants={itemVariants}>{item.name}</motion.span>}
            </motion.button>
          ))}
        </nav>

        {/* Categories */}
        <h3 className={`text-xs font-semibold text-slate-500 uppercase mb-4 mt-6 ${!isExpanded && 'hidden'}`}>CATEGORIES</h3>
        <div className="space-y-2 mb-6">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => {
                setActivePanel("bookmarks");
                onCategorySelect(category.id);
                onCollectionSelect(null);
                onTagSelect(null);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-slate-700 hover:bg-green-100 ${
                selectedCategoryId === category.id ? 'bg-green-100 text-black font-semibold' : ''
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <motion.span className="flex items-center gap-3" variants={itemVariants}>
                <span>{category.icon}</span>
                {isExpanded && <span>{category.name}</span>}
              </motion.span>
              {isExpanded && <motion.span className="text-sm font-medium text-slate-500 bg-green-50 px-2 py-0.5 rounded-full" variants={itemVariants}>{category.count}</motion.span>}
            </motion.button>
          ))}
          <motion.button
            onClick={onAddCategoryClick}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-purple-600 hover:bg-purple-50 transition-all"
            whileHover={{ scale: 1.02 }}
          >
            <Plus className="w-5 h-5" />
            {isExpanded && <motion.span variants={itemVariants}>Add New Category</motion.span>}
          </motion.button>
        </div>

        {/* Collections */}
        <h3 className={`text-xs font-semibold text-slate-500 uppercase mb-4 mt-6 ${!isExpanded && 'hidden'}`}>COLLECTIONS</h3>
        <div className="space-y-2">
          {collections.map((collection) => (
            <motion.button
              key={collection.id}
              onClick={() => {
                setActivePanel("collections");
                onCollectionSelect(collection.id);
                onCategorySelect(null);
                onTagSelect(null);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-slate-700 hover:bg-green-100 ${
                selectedCollectionId === collection.id ? 'bg-green-100 text-black font-semibold' : ''
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <motion.span className="flex items-center gap-3" variants={itemVariants}>
                <Folder className="w-5 h-5 flex-shrink-0" />
                {isExpanded && <span>{collection.name}</span>}
              </motion.span>
              {isExpanded && <motion.span className="text-sm font-medium text-slate-500 bg-green-50 px-2 py-0.5 rounded-full" variants={itemVariants}>{collection.count}</motion.span>}
            </motion.button>
          ))}
          <motion.button
            onClick={onAddCollectionClick}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-purple-600 hover:bg-purple-50 transition-all"
            whileHover={{ scale: 1.02 }}
          >
            <Plus className="w-5 h-5" />
            {isExpanded && <motion.span variants={itemVariants}>Add New Collection</motion.span>}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
