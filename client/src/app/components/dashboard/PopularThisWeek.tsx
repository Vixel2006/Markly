// components/dashboard/PopularThisWeek.tsx
import React from 'react';

interface PopularBookmark {
  title: string;
  visits: number;
  trend: string;
}

interface PopularThisWeekProps {
  bookmarks: PopularBookmark[];
}

const PopularThisWeek: React.FC<PopularThisWeekProps> = ({ bookmarks }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
      <h3 className="font-semibold mb-4">Popular This Week</h3>
      <div className="space-y-3">
        {bookmarks.map((bookmark, index) => (
          <div key={index} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{bookmark.title}</p>
              <p className="text-xs text-slate-400">{bookmark.visits} visits</p>
            </div>
            <span className="text-xs text-green-400">{bookmark.trend}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularThisWeek;
