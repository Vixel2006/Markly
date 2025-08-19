// src/app/components/dashboard/BookmarkListRow.tsx
import React from 'react';
import { Star, Link as LinkIcon, Edit, Trash2, Globe, Clock } from 'lucide-react';

interface Category { id: string; name: string; emoji?: string; }
interface Collection { id: string; name: string; }
interface Tag { id: string; name: string; }
interface Bookmark {
  id: string;
  url: string;
  title: string;
  summary: string;
  tags: Tag[];
  collections: Collection[];
  category?: Category;
  datetime: string;
  isFav: boolean;
}

interface BookmarkListRowProps {
  bookmark: Bookmark;
  onSelect: (bookmarkId: string) => void;
  isSelected: boolean;
  onToggleFavorite: (bookmarkId: string) => void;
}

const BookmarkListRow: React.FC<BookmarkListRowProps> = ({
  bookmark,
  onSelect,
  isSelected,
  onToggleFavorite,
}) => {
  const getFavicon = (bookmarkUrl: string): string | undefined => {
    try {
      const url = new URL(bookmarkUrl);
      return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
    } catch (e) {
      return undefined;
    }
  };

  const faviconSrc = getFavicon(bookmark.url);
  const displayCategoryEmoji = bookmark.category?.emoji || '📚';
  const displayCategoryName = bookmark.category?.name || 'Uncategorized';

  return (
    <tr
      onClick={() => onSelect(bookmark.id)}
      className={`group ${isSelected ? 'bg-blue-900/20' : 'hover:bg-slate-700/50'} transition-colors cursor-pointer`}
    >
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(bookmark.id); }}
            className="text-slate-500 hover:text-yellow-400 transition-colors"
            title={bookmark.isFav ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            <Star className={`w-4 h-4 ${bookmark.isFav ? 'text-yellow-400 fill-yellow-400' : ''}`} />
          </button>
          <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
            {faviconSrc ? (
              <img src={faviconSrc} alt="Favicon" className="w-4 h-4 object-contain" onError={(e) => { e.currentTarget.src = 'https://www.google.com/s2/favicons?domain=default&sz=32'; }} />
            ) : (
              <Globe className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div className="flex flex-col">
            <h4 className="font-medium text-white truncate max-w-[300px] group-hover:text-blue-400 transition-colors">
              {bookmark.title}
            </h4>
            <p className="text-xs text-slate-400 truncate max-w-[300px]">{bookmark.url}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-sm text-slate-300 flex items-center gap-1">
          {displayCategoryEmoji} {displayCategoryName}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {bookmark.tags.slice(0, 2).map(tag => (
            <span key={tag.id} className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">
              {tag.name}
            </span>
          ))}
          {bookmark.tags.length > 2 && (
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-400">
              +{bookmark.tags.length - 2}
            </span>
          )}
          {bookmark.tags.length === 0 && <span className="text-slate-500 text-xs italic">No tags</span>}
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(bookmark.datetime).toLocaleDateString()}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right">
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-full bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors"
            title="Open Link"
          >
            <LinkIcon className="w-4 h-4" />
          </a>
          {/*
          <button className="p-2 rounded-full bg-slate-700 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors" title="Edit Bookmark">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-full bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white transition-colors" title="Delete Bookmark">
            <Trash2 className="w-4 h-4" />
          </button>
          */}
        </div>
      </td>
    </tr>
  );
};

export default BookmarkListRow;
