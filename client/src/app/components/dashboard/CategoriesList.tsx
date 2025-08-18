import React from 'react';
import { Plus } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  count: number;
  icon: string;
  color: string;
}

interface CategoriesListProps {
  categories: Category[];
  onAddCategoryClick: () => void;
}

const CategoriesList: React.FC<CategoriesListProps> = ({ categories, onAddCategoryClick }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-xl">Categories</h3>
        <button
          onClick={onAddCategoryClick}
          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
          title="Add New Category"
        >
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>
      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
              <span className="text-sm">{category.name}</span>
            </div>
            <span className="text-sm text-slate-400">{category.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesList;
