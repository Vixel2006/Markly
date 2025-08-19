import Link from 'next/link';
import React from 'react';
import { TriangleAlert } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl border border-green-100 text-center shadow-lg">
        <TriangleAlert className="w-16 h-16 mx-auto text-purple-500 mb-6" />
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mb-3">Page Not Found</h2>
        <p className="text-slate-600 text-md mb-8 max-w-md mx-auto">
          Oops! The page you're looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          href="/app"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
