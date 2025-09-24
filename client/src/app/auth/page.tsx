// MarklyAuthPages.tsx
"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen } from 'lucide-react';

// Assuming these components are in components/auth/
import SignInForm from '../components/auth/SignInForm';
import RegisterForm from '../components/auth/RegisterForm';

const MarklyAuthPages = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const formParam = searchParams.get('form');

  // Determine current page: default to 'signin'
  const currentPage = formParam === 'register' ? 'register' : 'signin';

  const navigateToForm = (formType: 'signin' | 'register') => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('form', formType);
    router.replace(`?${newSearchParams.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6
                    bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-slate-900 relative overflow-hidden"> {/* Updated gradient to match landing page */}
      {/* Background radial gradient effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.2),rgba(255,255,255,0))]"></div> {/* Updated opacity for consistency */}

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* App Logo and Name */}
        <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-900">Markly</span> {/* Updated text color */}
        </div>

        {/* Form Switcher Buttons */}
        <div className="flex items-center justify-center gap-4 mb-8 bg-white/70 backdrop-blur-md rounded-full p-2 shadow-inner border border-indigo-100"> {/* Updated border color */}
          <button
            onClick={() => navigateToForm('signin')}
            className={`flex-1 px-6 py-2 rounded-full font-semibold transition-all duration-300
                        ${currentPage === 'signin'
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                            : 'text-slate-700 hover:text-gray-900' // Updated text colors
                        }`}
          >
            Sign In
          </button>
          <button
            onClick={() => navigateToForm('register')}
            className={`flex-1 px-6 py-2 rounded-full font-semibold transition-all duration-300
                        ${currentPage === 'register'
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                            : 'text-slate-700 hover:text-gray-900' // Updated text colors
                        }`}
          >
            Register
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-lg border border-indigo-100 rounded-3xl p-8 shadow-2xl"> {/* Updated border color */}
          {currentPage === 'signin' ? (
            <SignInForm onSwitchToRegister={() => navigateToForm('register')} />
          ) : (
            <RegisterForm onSwitchToSignIn={() => navigateToForm('signin')} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MarklyAuthPages;
