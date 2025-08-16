// components/dashboard/AIInsights.tsx
import React from 'react';
import { Zap } from 'lucide-react';

const AIInsights = () => {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-5 h-5" />
        <h3 className="font-semibold">AI Insights</h3>
      </div>
      <p className="text-sm opacity-90 mb-4">
        You've been reading a lot about Next.js lately. Here are some related bookmarks you might find useful.
      </p>
      <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm transition-colors">
        View Suggestions
      </button>
    </div>
  );
};

export default AIInsights;
