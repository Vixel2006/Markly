// src/app/components/dashboard/BookmarkDetailPanel.tsx
import React, { useState, useEffect } from 'react';
import { X, Star, Link as LinkIcon, Edit, Trash2, Zap, Tags, Folder, LayoutGrid, Check, PlusCircle } from 'lucide-react';

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

interface BookmarkDetailPanelProps {
  bookmark: Bookmark;
  onClose: () => void;
  onUpdate: (bookmarkId: string, updates: Partial<Bookmark>) => void;
  onDelete: (bookmarkId: string) => void;
  onToggleFavorite: (bookmarkId: string) => void;
  allCategories: Category[];
  allCollections: Collection[];
  allTags: Tag[];
  relatedBookmarks: Bookmark[]; // For AI insights
}

const BookmarkDetailPanel: React.FC<BookmarkDetailPanelProps> = ({
  bookmark,
  onClose,
  onUpdate,
  onDelete,
  onToggleFavorite,
  allCategories,
  allCollections,
  allTags,
  relatedBookmarks,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(bookmark.title);
  const [editedSummary, setEditedSummary] = useState(bookmark.summary);
  const [editedCategory, setEditedCategory] = useState<string | undefined>(bookmark.category?.id);
  const [editedTags, setEditedTags] = useState<string[]>(bookmark.tags.map(t => t.id));
  const [editedCollections, setEditedCollections] = useState<string[]>(bookmark.collections.map(c => c.id));
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    // Reset edit state when bookmark changes
    setIsEditing(false);
    setEditedTitle(bookmark.title);
    setEditedSummary(bookmark.summary);
    setEditedCategory(bookmark.category?.id);
    setEditedTags(bookmark.tags.map(t => t.id));
    setEditedCollections(bookmark.collections.map(c => c.id));
    setNewTagInput('');
  }, [bookmark]);

  const handleSave = () => {
    onUpdate(bookmark.id, {
      title: editedTitle,
      summary: editedSummary,
      category: allCategories.find(cat => cat.id === editedCategory),
      tags: allTags.filter(tag => editedTags.includes(tag.id)),
      collections: allCollections.filter(col => editedCollections.includes(col.id)),
    });
    setIsEditing(false);
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !allTags.some(t => t.name.toLowerCase() === newTagInput.trim().toLowerCase())) {
      // In a real app, you'd add this tag to `allTags` state or database first
      // For this demo, let's just add it as a new "dummy" tag
      const newTag: Tag = { id: `new-${Date.now()}`, name: newTagInput.trim() };
      // (This is a simplified mock. In production, you'd manage `allTags` more robustly)
      // Here, just add its ID to editedTags
      setEditedTags(prev => [...prev, newTag.id]); // Assuming newTag.id is unique
      allTags.push(newTag); // Directly modify allTags for demo purpose, bad practice normally
      setNewTagInput('');
    } else if (newTagInput.trim() && allTags.some(t => t.name.toLowerCase() === newTagInput.trim().toLowerCase())) {
        // If tag already exists, just add its ID to editedTags if not already there
        const existingTag = allTags.find(t => t.name.toLowerCase() === newTagInput.trim().toLowerCase());
        if (existingTag && !editedTags.includes(existingTag.id)) {
            setEditedTags(prev => [...prev, existingTag.id]);
        }
        setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setEditedTags(prev => prev.filter(id => id !== tagId));
  };


  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-slate-800 border-l border-slate-700 p-6 z-40 overflow-y-auto shadow-2xl flex flex-col">
      {/* Header with Close and Actions */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
        <h2 className="text-xl font-bold truncate pr-8">{bookmark.title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(bookmark.id)}
            className="text-slate-400 hover:text-yellow-400 transition-colors p-1"
            title={bookmark.isFav ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            <Star className={`w-6 h-6 ${bookmark.isFav ? 'text-yellow-400 fill-yellow-400' : ''}`} />
          </button>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-slate-400 hover:text-blue-400 transition-colors p-1"
              title="Edit Bookmark"
            >
              <Edit className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="text-blue-400 hover:text-blue-300 transition-colors p-1"
              title="Save Changes"
            >
              <Check className="w-6 h-6" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
            title="Close Panel"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Bookmark Details / Edit Form */}
      <div className="flex-grow space-y-6">
        {/* URL and Open Link */}
        <div className="bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline text-sm truncate"
            title={bookmark.url}
          >
            {bookmark.url}
          </a>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 text-blue-400 hover:text-blue-300 transition-colors"
            title="Open Link in New Tab"
          >
            <LinkIcon className="w-5 h-5" />
          </a>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="editTitle" className="block text-sm font-medium text-slate-300 mb-2">Title</label>
              <input
                id="editTitle"
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="editSummary" className="block text-sm font-medium text-slate-300 mb-2">Summary</label>
              <textarea
                id="editSummary"
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>
            {/* Category Selector */}
            <div>
              <label htmlFor="editCategory" className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <select
                id="editCategory"
                value={editedCategory}
                onChange={(e) => setEditedCategory(e.target.value || undefined)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Category</option>
                {allCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji} {cat.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Tags Editor */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {editedTags.map(tagId => {
                        const tag = allTags.find(t => t.id === tagId);
                        if (!tag) return null; // Should not happen with proper ID management
                        return (
                            <span key={tag.id} className="px-3 py-1 rounded-full bg-blue-600 text-white flex items-center gap-1 text-sm">
                                {tag.name}
                                <button onClick={() => handleRemoveTag(tag.id)} className="ml-1 text-white opacity-70 hover:opacity-100">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        );
                    })}
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Add new tag"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                        className="flex-grow px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button onClick={handleAddTag} className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white" title="Add Tag">
                        <PlusCircle className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">Press Enter to add tag.</p>
            </div>
            {/* Collections Editor (Simplified) */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Collections</label>
                <div className="flex flex-wrap gap-2">
                    {allCollections.map(col => (
                        <button
                            key={col.id}
                            onClick={() => {
                                setEditedCollections(prev =>
                                    prev.includes(col.id) ? prev.filter(id => id !== col.id) : [...prev, col.id]
                                );
                            }}
                            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                                editedCollections.includes(col.id)
                                    ? 'bg-purple-600 border-purple-600 text-white'
                                    : 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-300'
                            }`}
                        >
                            {col.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Delete Action in Edit Mode */}
            <button
              onClick={() => { if (confirm('Are you sure you want to delete this bookmark?')) onDelete(bookmark.id); }}
              className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5 inline-block mr-2" /> Delete Bookmark
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* AI Summary */}
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <h4 className="font-semibold text-purple-300">AI Summary</h4>
              </div>
              <p className="text-sm text-slate-300">{bookmark.summary || 'No AI summary available yet.'}</p>
            </div>

            {/* Category & Tags Display */}
            <div className="flex flex-wrap gap-3">
              {bookmark.category && (
                <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-white text-sm">
                  {bookmark.category.emoji || '📚'} {bookmark.category.name}
                </span>
              )}
              {bookmark.tags.length > 0 && bookmark.tags.map(tag => (
                <span key={tag.id} className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-700 text-slate-300 text-sm">
                  <Tags className="w-4 h-4" /> {tag.name}
                </span>
              ))}
              {bookmark.collections.length > 0 && bookmark.collections.map(col => (
                <span key={col.id} className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-700 text-slate-300 text-sm">
                  <Folder className="w-4 h-4" /> {col.name}
                </span>
              ))}
            </div>

            {/* AI Related Bookmarks */}
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-green-400" />
                    <h4 className="font-semibold text-green-300">AI Related Bookmarks</h4>
                </div>
                {relatedBookmarks.length > 0 ? (
                    <div className="space-y-2">
                        {relatedBookmarks.map(rb => (
                            <a key={rb.id} href={rb.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-slate-700/50 rounded-md hover:bg-slate-700 transition-colors">
                                <p className="font-medium text-sm truncate">{rb.title}</p>
                                <p className="text-xs text-slate-400 truncate">{rb.url}</p>
                            </a>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-400">No related bookmarks found by AI yet.</p>
                )}
            </div>

            {/* Metadata */}
            <div className="text-sm text-slate-400">
              Added on: {new Date(bookmark.datetime).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkDetailPanel;
