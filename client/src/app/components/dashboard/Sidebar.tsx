import React from 'react';
import { BookOpen, Globe, Star, Clock, Zap, Folder, User, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  categories: { name: string; count: number; icon: string; color: string }[];
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, onToggle, categories }) => {
  const navItems = [
    { icon: Globe, label: 'All Bookmarks', active: true },
    { icon: Star, label: 'Favorites' },
    { icon: Clock, label: 'Recent' },
    { icon: Zap, label: 'AI Suggested' },
    { icon: Folder, label: 'Collections' },
  ];

  const bottomItems = [
    { icon: User, label: 'Profile' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-full transition-all duration-300 bg-slate-800 border-r border-slate-700 p-4 overflow-y-auto z-50 ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
    >
      {/* Header Section - Conditional Rendering based on isExpanded */}
      {isExpanded ? (
        // Header for Expanded State
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold">Markly</h1>
          </div>
          <button
            onClick={onToggle}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded"
          >
            <ChevronLeft className="w-5 h-5" /> {/* Icon for collapsing */}
          </button>
        </div>
      ) : (
        // Header for Folded State
        <div className="flex flex-col items-center pt-2">
          {/* Toggle Button - now horizontally centered by parent's items-center */}
          <button
            onClick={onToggle}
            className="text-slate-400 hover:text-white transition-colors py-2 px-3 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" /> {/* Icon for expanding */}
          </button>
          {/* Logo element, centered below the button with increased margin */}
          <div className="flex items-center justify-center mt-4"> {/* Increased mt-2 to mt-4 for better separation */}
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            {/* Title is not displayed when folded */}
          </div>
          {/* Spacer div to maintain consistent spacing between header and nav items */}
          <div className="mb-8"></div>
        </div>
      )}

      <nav className="space-y-2">
        {navItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              item.active ? 'bg-slate-700 text-blue-400' : 'hover:bg-slate-700'
            } ${!isExpanded && 'justify-center'}`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span>{item.label}</span>}
          </a>
        ))}
      </nav>

      {isExpanded && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Categories</h3>
          <div className="space-y-1">
            {categories.slice(0, 4).map((category, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{category.icon}</span>
                  <span className="text-sm">{category.name}</span>
                </div>
                <span className="text-xs text-slate-400">{category.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`absolute bottom-4 left-4 right-4 space-y-2 ${!isExpanded && 'flex flex-col items-center gap-2'}`}>
        {bottomItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors ${
              !isExpanded && 'justify-center px-0'
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="text-sm">{item.label}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
