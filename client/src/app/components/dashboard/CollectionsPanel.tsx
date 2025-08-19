// components/dashboard/CollectionsPanel.tsx
import React from 'react';
import { Folder, Plus } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  count: number; // Assuming count is added by collectionsForDisplay
}

interface CollectionsPanelProps {
  collections: Collection[];
  onAddCollectionClick: () => void;
}

const CollectionsPanel: React.FC<CollectionsPanelProps> = ({
  collections,
  onAddCollectionClick,
}) => {
  return (
    <div className="mt-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Your Collections</h2>
        <button
          onClick={onAddCollectionClick}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 transition-colors duration-200 shadow-md"
        >
          <Plus size={20} className="mr-2" /> Add New Collection
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-8 text-center text-slate-400 shadow-lg">
          <Folder size={48} className="mx-auto mb-4 text-slate-500" />
          <p className="text-xl font-semibold">No collections yet!</p>
          <p className="mt-2 text-sm">Start by adding your first collection to organize your bookmarks.</p>
          <button
            onClick={onAddCollectionClick}
            className="mt-6 inline-flex items-center rounded-md bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 transition-colors duration-200 shadow-lg"
          >
            <Plus size={20} className="mr-2" /> Create First Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {collections.map((col) => (
            <div
              key={col.id}
              className="relative flex items-center rounded-lg border border-slate-700 bg-slate-800 p-5 shadow-lg transition-transform duration-200 hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 text-indigo-400">
                <Folder size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{col.name}</h3>
                <p className="text-sm text-slate-400">{col.count} bookmark{col.count !== 1 ? 's' : ''}</p>
              </div>
              {/* Future: Add edit/delete options here */}
              {/* <div className="absolute top-2 right-2">
                <button className="text-slate-500 hover:text-white">
                  <MoreHorizontal size={18} />
                </button>
              </div> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionsPanel;
