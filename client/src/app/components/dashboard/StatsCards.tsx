// components/dashboard/StatsCards.tsx
import React from 'react';
import { BookOpen, Folder, Zap, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  totalBookmarksCount: number;
}

const StatsCards: React.FC<StatusCardProps> = ({ totalBookmarksCount }) => {
  const stats = [
    { title: 'Total Bookmarks', value: totalBookmarksCount.toLocaleString(), icon: BookOpen, color: 'blue-400' },
    { title: 'Categories', value: '24', icon: Folder, color: 'purple-400' },
    { title: 'AI Suggestions', value: '38', icon: Zap, color: 'green-400' },
    { title: 'This Week', value: '156', icon: TrendingUp, color: 'orange-400' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-slate-800 p-4 md:p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">{stat.title}</p>
              <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
            </div>
            <div className={`w-10 h-10 md:w-12 md:h-12 bg-${stat.color} bg-opacity-20 rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 md:w-6 md:h-6 text-${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
