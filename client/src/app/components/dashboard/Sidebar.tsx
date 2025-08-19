import React from 'react';
import { BookOpen, Zap, Search, Star, Globe, Folder, TrendingUp, X, Menu, Plus } from 'lucide-react'; // Ensure all icons are imported

// Define more precise interfaces if you have them in MarklyDashboard
interface CategoryForDisplay {
  id: string;
  name: string;
  emoji?: string;
  count: number;
  icon: string;
  color: string;
}

interface CollectionForDisplay {
  id: string;
  name: string;
  count: number;
}

interface Tag { // Assuming a simpler Tag interface here for sidebar display
  id: string;
  name: string;
  weeklyCount: number; // Keep consistent with MarklyDashboard
}

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  activePanel: 'dashboard' | 'bookmarks' | 'collections' | 'tags' | 'favorites' | 'ai-suggested';
  setActivePanel: (panel: 'dashboard' | 'bookmarks' | 'collections' | 'tags' | 'favorites' | 'ai-suggested') => void;
  categories: CategoryForDisplay[];
  collections: CollectionForDisplay[];
  tags: Tag[];
  onCategorySelect: (id: string | null) => void;
  selectedCategoryId: string | null;
  onCollectionSelect: (id: string | null) => void;
  selectedCollectionId: string | null;
  onTagSelect: (id: string | null) => void;
  selectedTagId: string | null;
  onClearFilters: () => void;
  onAddCategoryClick: () => void;
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
}) => {
  const NavItem = ({ icon, label, panelName, isFilter = false, count = 0, isSelected = false, onClick }: any) => {
    const activeBg = isSelected ? 'bg-purple-100 text-purple-700' : (activePanel === panelName && !isFilter ? 'bg-purple-100 text-purple-700' : '');
    const hoverBg = isSelected ? 'hover:bg-purple-200' : 'hover:bg-green-50';
    const textColor = isSelected ? 'text-purple-700' : 'text-slate-700';

    return (
      <button
        onClick={onClick}
        className={`flex items-center w-full p-3 rounded-md transition-colors duration-200
                    ${activeBg} ${hoverBg} ${textColor}
                    ${isExpanded ? '' : 'justify-center'}
                  `}
        aria-label={label}
      >
        {icon}
        {isExpanded && <span className={`font-medium ${isExpanded ? 'ml-3' : ''}`}>{label}</span>}
        {isExpanded && count > 0 && <span className="ml-auto text-xs font-semibold px-2 py-1 bg-green-100 rounded-full text-green-700">{count}</span>}
      </button>
    );
  };

  return (
    <div className={`fixed inset-y-0 left-0 bg-white border-r border-green-100 shadow-xl transition-all duration-300 z-40
                     ${isExpanded ? 'w-64' : 'w-16'}
                     flex flex-col`}>
      {/* Sidebar Header/Logo */}
      <div className="flex items-center p-4 h-16 border-b border-green-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          {isExpanded && <span className="text-xl font-bold text-black">Markly</span>}
        </div>
        <button
          onClick={onToggle}
          className={`ml-auto text-slate-500 hover:text-black transition-colors md:block hidden ${isExpanded ? '' : 'absolute right-0 translate-x-1/2 bg-white border border-green-100 rounded-full p-1 shadow-md'}`}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isExpanded ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 mt-8 space-y-2 px-4 overflow-y-auto custom-scrollbar">
        <NavItem
          icon={<Zap size={20} />}
          label="Dashboard"
          panelName="dashboard"
          isSelected={activePanel === 'dashboard'}
          onClick={() => { setActivePanel('dashboard'); onClearFilters(); }}
        />
        <NavItem
          icon={<BookOpen size={20} />}
          label="All Bookmarks"
          panelName="bookmarks"
          isSelected={activePanel === 'bookmarks' && !selectedCategoryId && !selectedCollectionId && !selectedTagId}
          onClick={() => { setActivePanel('bookmarks'); onClearFilters(); }}
        />
        <NavItem
          icon={<Folder size={20} />}
          label="Collections"
          panelName="collections"
          isSelected={activePanel === 'collections'}
          onClick={() => {
            setActivePanel('collections');
            onCollectionSelect(null); // Clear specific collection view if navigating from filter or another panel
            onClearFilters(); // Clear other filters
          }}
        />
        <NavItem
          icon={<Star size={20} />}
          label="Favorites"
          panelName="favorites"
          isSelected={activePanel === 'favorites'}
          onClick={() => { setActivePanel('favorites'); onClearFilters(); }}
        />
        {/* You can add 'AI Suggested' or 'Tags' as top-level if needed */}

        {isExpanded && (
          <>
            <div className="px-3 pt-6 pb-2 text-xs font-semibold uppercase text-slate-500">
              Filters
            </div>

            {/* Categories Filter */}
            <div className="mt-4 px-3">
              <h3 className="text-sm font-semibold text-black mb-2">Categories</h3>
              <ul className="space-y-1">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <NavItem
                      icon={<span className={`w-2.5 h-2.5 rounded-full mr-2 ${cat.color}`}></span>}
                      label={cat.name}
                      panelName="bookmarks" // Filters always show in bookmark feed
                      isFilter={true}
                      count={cat.count}
                      isSelected={selectedCategoryId === cat.id}
                      onClick={() => {
                        onCategorySelect(cat.id);
                        setActivePanel('bookmarks');
                        onCollectionSelect(null);
                        onTagSelect(null);
                      }}
                    />
                  </li>
                ))}
                <li>
                  <button
                    onClick={onAddCategoryClick}
                    className="flex items-center w-full p-2 rounded-md text-purple-600 hover:bg-green-50 hover:text-purple-700 transition-colors duration-200"
                  >
                    <Plus size={16} className="mr-2" /> Add Category
                  </button>
                </li>
              </ul>
            </div>

            {/* Tags Filter */}
            <div className="mt-4 px-3">
              <h3 className="text-sm font-semibold text-black mb-2">Tags</h3>
              <ul className="space-y-1">
                {tags.map((tag) => (
                  <li key={tag.id}>
                    <NavItem
                      icon={<span className="text-xs text-purple-500 mr-2">#</span>}
                      label={tag.name}
                      panelName="bookmarks"
                      isFilter={true}
                      count={tag.weeklyCount}
                      isSelected={selectedTagId === tag.id}
                      onClick={() => {
                        onTagSelect(tag.id);
                        setActivePanel('bookmarks');
                        onCategorySelect(null);
                        onCollectionSelect(null);
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/* Clear All Filters button */}
            {(selectedCategoryId || selectedCollectionId || selectedTagId || (activePanel === 'bookmarks' && searchQuery)) && (
              <div className="mt-6 px-3">
                <button
                  onClick={onClearFilters}
                  className="flex items-center w-full p-2 rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                >
                  <X size={16} className="mr-2" /> Clear All Filters
                </button>
              </div>
            )}
          </>
        )}
      </nav>

      {/* Sidebar Footer/Profile */}
      {isExpanded && (
        <div className="mt-auto p-4 border-t border-green-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-300 to-blue-300 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
            JD
          </div>
          <div>
            <div className="font-semibold text-black">John Doe</div>
            <div className="text-sm text-slate-600">Free Plan</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

