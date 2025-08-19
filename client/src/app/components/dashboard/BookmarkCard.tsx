import React from 'react';
import { Star, Link as LinkIcon, Edit, Trash2, Globe } from 'lucide-react';

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
  thumbnail?: string;
}

interface BookmarkCardProps {
  bookmark: Bookmark;
  onSelect: (bookmarkId: string) => void;
  isSelected: boolean;
  onToggleFavorite: (bookmarkId: string) => void;
  categories: any[];
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  onSelect,
  isSelected,
  onToggleFavorite,
  categories
}) => {

  const displayCategory = categories.find(cat => cat.id === bookmark.category?.id);
  const categoryColor = displayCategory?.color || 'bg-gray-500';

  return (
    <div
      onClick={() => onSelect(bookmark.id)}
      className={`group bg-slate-800 p-5 rounded-xl border cursor-pointer transition-all duration-200
        ${isSelected ? 'border-blue-500 shadow-xl' : 'border-slate-700 hover:border-slate-600'}
        flex flex-col h-full`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-700 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
          </div>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 hover:underline flex-1 truncate"
            onClick={(e) => e.stopPropagation()}
            title={bookmark.url}
          >
          </a>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(bookmark.id); }}
          className="text-slate-500 hover:text-yellow-400 transition-colors"
          title={bookmark.isFav ? 'Remove from Favorites' : 'Add to Favorites'}
        >
          <Star className={`w-5 h-5 ${bookmark.isFav ? 'text-yellow-400 fill-yellow-400' : ''}`} />
        </button>
      </div>

      <h4 className="font-semibold text-lg text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
        {bookmark.title}
      </h4>
      <p className="text-sm text-slate-300 mb-4 line-clamp-3 flex-grow">
        {bookmark.summary || 'No AI summary available yet.'}
      </p>

      <div className="flex flex-wrap items-center gap-2 mt-auto">
        {displayCategory && (
          <span className={`px-2 py-1 rounded-full text-xs text-white ${displayCategory.color}`}>
            {displayCategory.icon ? `${displayCategory.icon} ` : ''}{displayCategory.name}
          </span>
        )}
        {(bookmark.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {(bookmark.tags ?? []).slice(0, 2).map(tag => (
              <span key={tag.id} className="px-2 py-1 rounded-full text-xs bg-slate-700 text-slate-300">
                {tag.name}
              </span>
            ))}
            {(bookmark.tags ?? []).length > 2 && (
              <span className="px-2 py-1 rounded-full text-xs bg-slate-700 text-slate-400">
                +{(bookmark.tags ?? []).length - 2}
              </span>
            )}
          </div>
        )}
      </div>


      <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
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
      </div>
    </div>
  );
};

export default BookmarkCard;
