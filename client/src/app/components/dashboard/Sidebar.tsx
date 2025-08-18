"use client";

import React from 'react';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { BookOpen, Globe, Star, Clock, Zap, Folder, User, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  count: number;
  icon: string;
  color: string;
}

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  categories: Category[];
  onCategorySelect: (categoryId: string | null) => void;
  selectedCategoryId: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  isExpanded,
  onToggle,
  categories,
  onCategorySelect,
  selectedCategoryId,
}) => {
  const pathname = usePathname();

  const navItems = [
    { icon: Globe, label: 'All Bookmarks', path: '/app', isFilter: true, filterId: null },
    { icon: Star, label: 'Favorites', path: '/app/favorites', isFilter: false },
    { icon: Clock, label: 'Recent', path: '/app/recent', isFilter: false },
    { icon: Zap, label: 'AI Suggested', path: '/app/ai-suggested', isFilter: false },
    { icon: Folder, label: 'Collections', path: '/app/collections', isFilter: false },
  ];

  const bottomItems = [
    { icon: User, label: 'Profile', path: '/app/profile' },
    { icon: Settings, label: 'Settings', path: '/app/settings' },
  ];

  const totalCategoriesCount = categories.reduce((acc, cat) => acc + cat.count, 0);

  return (
    <div
      className={`fixed left-0 top-0 h-full transition-all duration-300 bg-slate-800 border-r border-slate-700 p-4 z-50
        flex flex-col
        ${isExpanded ? 'w-64' : 'w-16'}
        // Scrollbar styling classes
        overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800 hover:scrollbar-thumb-slate-600
      `}
    >
      {isExpanded ? (
        <div className="flex items-center justify-between mb-8">
          <Link href="/app" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold">Markly</h1>
          </Link>
          <button
            onClick={onToggle}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center pt-2">
          <button
            onClick={onToggle}
            className="text-slate-400 hover:text-white transition-colors py-2 px-3 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <Link href="/app" className="flex items-center justify-center mt-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
          </Link>
          <div className="mb-8"></div>
        </div>
      )}

      <nav className="space-y-2 flex-grow">
        {navItems.map((item, index) => (
          <Link
            key={index}
            href={item.path}
            onClick={() => {
              if (item.isFilter) {
                onCategorySelect(item.filterId);
              }
            }}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              (item.isFilter && item.filterId === selectedCategoryId) ||
              (!item.isFilter && pathname === item.path)
                ? 'bg-slate-700 text-blue-400'
                : 'hover:bg-slate-700'
            } ${!isExpanded && 'justify-center'}`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {isExpanded && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Categories</h3>
          <div className="space-y-1">
            <div
              onClick={() => onCategorySelect(null)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors ${
                selectedCategoryId === null ? 'bg-slate-700 text-blue-400' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">📁</span>
                <span className="text-sm">All Categories</span>
              </div>
              <span className="text-xs text-slate-400">{totalCategoriesCount}</span>
            </div>
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors ${
                  selectedCategoryId === category.id ? 'bg-slate-700 text-blue-400' : ''
                }`}
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

      <div className={`mt-auto space-y-2 pb-4 ${!isExpanded && 'flex flex-col items-center gap-2 pt-4'}`}>
        {bottomItems.map((item, index) => (
          <Link
            key={index}
            href={item.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors ${
              !isExpanded && 'justify-center px-0'
            } ${pathname === item.path ? 'bg-slate-700 text-blue-400' : ''}`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="text-sm">{item.label}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
