// components/dashboard/AddCollectionModal.tsx
import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

interface AddCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCollection: (name: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AddCollectionModal: React.FC<AddCollectionModalProps> = ({
  isOpen,
  onClose,
  onAddCollection,
  isLoading,
  error,
}) => {
  const [collectionName, setCollectionName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCollectionName('');
      setLocalError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!collectionName.trim()) {
      setLocalError("Collection name cannot be empty.");
      return;
    }

    try {
      await onAddCollection(collectionName);
      // Parent component (MarklyDashboard) will handle closing on success
    } catch (err) {
      // Error is handled by parent's error state, but local for immediate feedback if needed
      setLocalError("Failed to add collection. Please try again.");
      console.error("Error in AddCollectionModal handleSubmit:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-lg bg-slate-800 p-6 shadow-xl border border-slate-700 animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors duration-200"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <h2 className="mb-6 text-2xl font-bold text-white flex items-center">
          <Plus size={24} className="mr-2 text-indigo-400" /> Add New Collection
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="collectionName" className="mb-2 block text-sm font-medium text-slate-300">
              Collection Name
            </label>
            <input
              type="text"
              id="collectionName"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              className="w-full rounded-md border border-slate-600 bg-slate-700 p-3 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="e.g., Web Development Resources"
              required
              disabled={isLoading}
            />
          </div>

          {(error || localError) && (
            <p className="mb-4 text-sm text-red-400">{error || localError}</p>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-slate-600 px-5 py-2 text-white hover:bg-slate-500 transition-colors duration-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCollectionModal;
