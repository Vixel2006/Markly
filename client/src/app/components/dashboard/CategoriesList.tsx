// components/dashboard/CategoriesList.tsx
import React from 'react';

interface Category {
  name: string;
  count: number;
  icon: string;
  color: string;
}

interface CategoriesListProps {
  categories: Category[];
}

const CategoriesList: React.FC<CategoriesListProps> = ({ categories }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <h3 className="font-semibold mb-4">Categories</h3>
      <div className="space-y-3">
        {categories.map((category, index) => (
          <div key={index} className="flex items-center justify-between">
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
