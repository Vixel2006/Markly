import React, { useState, useEffect } from 'react';
import { X, Loader2, Sparkles, PlusCircle } from 'lucide-react';

interface Category { id: string; name: string; emoji?: string; }
interface Collection { id: string; name: string; }
interface Tag { id: string; name: string; }

interface BookmarkPayload {
  url: string;
  title: string;
  summary?: string;
  tags?: string[];
  collections?: string[];
  category?: string | null;
  isFav: boolean;
}

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBookmark: (bookmarkData: BookmarkPayload) => void;
  isLoading: boolean;
  error: string | null;
  categories: Category[];
  collections: Collection[];
  tags: Tag[];
  onAddNewTag: (tagName: string) => Promise<Tag | null>;
}

const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({
  isOpen,
  onClose,
  onAddBookmark,
  isLoading,
  error,
  categories,
  collections,
  tags,
  onAddNewTag,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // Stores IDs of selected/added tags
  const [isFav, setIsFav] = useState(false);
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  // Reset form on open/close
  useEffect(() => {
    if (isOpen) {
      setUrl('');
      setTitle('');
      setSummary('');
      setSelectedCategory(undefined);
      setSelectedCollections([]);
      setSelectedTags([]);
      setIsFav(false);
      setIsProcessingUrl(false);
      setNewTagInput('');
    }
  }, [isOpen]);

  const handleAddTag = async () => {
    const trimmedInput = newTagInput.trim();
    if (!trimmedInput) return;

    // Check if the tag already exists in the provided tags prop (global list)
    const existingTag = tags.find(t => t.name.toLowerCase() === trimmedInput.toLowerCase());

    if (existingTag) {
      // If tag exists and not already selected, add its ID to selectedTags
      if (!selectedTags.includes(existingTag.id)) {
        setSelectedTags(prev => [...prev, existingTag.id]);
      }
    } else {
      // If it's a new tag, call the prop function to add it via API
      // This function will handle the actual API call to your /api/tags endpoint
      const newTag = await onAddNewTag(trimmedInput);
      if (newTag) {
        setSelectedTags(prev => [...prev, newTag.id]);
      } else {
        // Handle error if tag creation failed (e.g., show a toast/alert)
        console.error("Failed to add new tag via API.");
      }
    }
    setNewTagInput(''); // Clear input after processing
  };

  const handleRemoveSelectedTag = (tagId: string) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && title.trim()) {
      // Construct the payload to match the backend's expected BookmarkPayload
      const payload: BookmarkPayload = {
        url: url.trim(),
        title: title.trim(),
        summary: summary.trim(),
        isFav: isFav,
      };

      // Category: Send ID string or null if selectedCategory is undefined or empty
      if (selectedCategory) {
        payload.category = selectedCategory;
      } else {
        payload.category = null; // Explicitly send null if no category is selected
      }

      // Tags: Send array of ID strings
      payload.tags = selectedTags;

      // Collections: Send array of ID strings
      payload.collections = selectedCollections;

      // Call the onAddBookmark prop with the correctly structured payload
      onAddBookmark(payload);
    }
  };

  const handleUrlPaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedUrl = e.clipboardData.getData('text');
    if (pastedUrl && (pastedUrl.startsWith('http://') || pastedUrl.startsWith('https://'))) {
      setUrl(pastedUrl);
      setIsProcessingUrl(true);
      // Simulate API call to fetch page info and AI suggestions
      try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        const mockTitle = `AI-Fetched Title for: ${pastedUrl.split('/')[2]}`;
        const mockSummary = `This is an AI-generated summary for the content at ${pastedUrl}. It covers key points and main ideas. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`;

        // AI suggestions should pick actual IDs from the provided props
        const mockCategory = categories.length > 0 ? categories[Math.floor(Math.random() * categories.length)].id : undefined;
        const mockTags = tags.length > 0 ? tags.slice(0, 2).map(t => t.id) : []; // Use actual tag IDs
        const mockCollections = collections.length > 0 ? collections.slice(0, 1).map(c => c.id) : []; // Use actual collection IDs

        setTitle(mockTitle);
        setSummary(mockSummary);
        setSelectedCategory(mockCategory);
        setSelectedTags(mockTags); // Set selectedTags with IDs
        setSelectedCollections(mockCollections); // Set selectedCollections with IDs
      } catch (err) {
        console.error("Failed to process URL:", err);
        setTitle(`(Failed to fetch title for: ${pastedUrl})`);
        setSummary("Failed to generate summary.");
      } finally {
        setIsProcessingUrl(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100]">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-2xl relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Add New Bookmark</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* URL Input */}
          <div>
            <label htmlFor="bookmarkUrl" className="block text-sm font-medium text-slate-300 mb-2">
              URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              id="bookmarkUrl"
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
              placeholder="Paste URL here, e.g., https://react.dev/"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onPaste={handleUrlPaste}
              disabled={isLoading || isProcessingUrl}
              required
            />
            <p className="text-xs text-slate-400 mt-1">Paste a URL, and AI will try to auto-fill details.</p>
          </div>

          {isProcessingUrl && (
            <div className="flex items-center justify-center gap-3 text-blue-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>AI is processing your link...</span>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label htmlFor="bookmarkTitle" className="block text-sm font-medium text-slate-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="bookmarkTitle"
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., The Ultimate Guide to React Hooks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading || isProcessingUrl}
              required
            />
          </div>

          {/* Summary Input */}
          <div>
            <label htmlFor="bookmarkSummary" className="block text-sm font-medium text-slate-300 mb-2">
              Summary <span className="text-slate-400">(AI-generated or your own)</span>
            </label>
            <textarea
              id="bookmarkSummary"
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="AI will generate a summary or you can write your own."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              disabled={isLoading || isProcessingUrl}
            ></textarea>
            {summary && <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Summary</p>}
          </div>

          {/* Category Selector */}
          <div>
            <label htmlFor="bookmarkCategory" className="block text-sm font-medium text-slate-300 mb-2">
              Category
            </label>
            <select
              id="bookmarkCategory"
              className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || undefined)}
              disabled={isLoading || isProcessingUrl}
            >
              <option value="">Select a Category (Optional)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji ? `${cat.emoji} ` : ''}{cat.name}
                </option>
              ))}
            </select>
            {selectedCategory && <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Suggested</p>}
          </div>

          {/* Tags Selector/Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map(tagId => {
                const tag = tags.find(t => t.id === tagId); // Find the actual tag object from the prop
                return tag ? (
                  <span key={tag.id} className="px-3 py-1 rounded-full bg-blue-600 text-white flex items-center gap-1 text-sm">
                    {tag.name}
                    <button type="button" onClick={() => handleRemoveSelectedTag(tag.id)} className="ml-1 text-white opacity-70 hover:opacity-100">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add new or existing tag (Press Enter)"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                className="flex-grow px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isLoading || isProcessingUrl}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50"
                disabled={isLoading || isProcessingUrl || !newTagInput.trim()}
                title="Add Tag"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            </div>
            {/* Displaying existing tags for suggestion, not for selection in this component */}
            <p className="text-xs text-slate-400 mt-1">Available: {tags.map(t => t.name).join(', ')}</p>
          </div>

          {/* Collections Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Collections</label>
            <div className="flex flex-wrap gap-2">
              {collections.map(col => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => {
                    setSelectedCollections(prev =>
                      prev.includes(col.id) ? prev.filter(id => id !== col.id) : [...prev, col.id]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedCollections.includes(col.id)
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-300'
                  }`}
                  disabled={isLoading || isProcessingUrl}
                >
                  {col.name}
                </button>
              ))}
            </div>
          </div>

          {/* Is Favorite Toggle */}
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="isFav"
              checked={isFav}
              onChange={(e) => setIsFav(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              disabled={isLoading || isProcessingUrl}
            />
            <label htmlFor="isFav" className="ml-2 text-sm font-medium text-slate-300">
              Mark as Favorite
            </label>
          </div>

          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isLoading || isProcessingUrl || !url.trim() || !title.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Saving...
              </>
            ) : (
              'Add Bookmark'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBookmarkModal;
