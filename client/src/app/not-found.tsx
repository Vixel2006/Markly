// app/not-found.tsx
// Or if you're using the Pages Router: pages/404.tsx

import Link from 'next/link';
import React from 'react';
import { TriangleAlert } from 'lucide-react'; // Using TriangleAlert icon for the 404 page

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center shadow-lg">
        <TriangleAlert className="w-16 h-16 mx-auto text-red-500 mb-6" />
        <h1 className="text-5xl font-extrabold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-300 mb-3">Page Not Found</h2>
        <p className="text-slate-400 text-md mb-8 max-w-md mx-auto">
          Oops! The page you're looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          href="/app"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-semibold"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
