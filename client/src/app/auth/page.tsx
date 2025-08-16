"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Import Next.js routing hooks
import AuthWrapper from '../components/auth/AuthWrapper';
import SignInForm from '../components/auth/SignInForm';
import RegisterForm from '../components/auth/RegisterForm';

const MarklyAuthPages = () => {
  const router = useRouter(); // Initialize router for navigation
  const searchParams = useSearchParams(); // Get current URL search parameters

  // Get the 'form' query parameter from the URL
  const formParam = searchParams.get('form');

  // Determine the current page based on the query parameter
  // Defaults to 'signin' if no 'form' parameter or an invalid one is present
  const currentPage = formParam === 'register' ? 'register' : 'signin';

  // Function to navigate to a specific form by updating the URL query parameter
  const navigateToForm = (formType: 'signin' | 'register') => {
    // Create a new URLSearchParams object from the current ones to preserve other parameters
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('form', formType); // Set or update the 'form' parameter

    // Use router.replace to change the URL without adding to the browser history.
    // This is good for "tab-like" navigation within the same page.
    router.replace(`?${newSearchParams.toString()}`);
  };

  return (
    <AuthWrapper>
      {/* Page Toggle buttons - now update the URL */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={() => navigateToForm('signin')} // Call navigateToForm
          className={`px-4 py-2 rounded-lg transition-all ${
            currentPage === 'signin'
              ? 'bg-blue-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => navigateToForm('register')} // Call navigateToForm
          className={`px-4 py-2 rounded-lg transition-all ${
            currentPage === 'register'
              ? 'bg-blue-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Register
        </button>
      </div>

      <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
        {/* Render form based on currentPage (derived from URL) */}
        {currentPage === 'signin' ? (
          <SignInForm onSwitchToRegister={() => navigateToForm('register')} />
        ) : (
          <RegisterForm onSwitchToSignIn={() => navigateToForm('signin')} />
        )}
      </div>
    </AuthWrapper>
  );
};

export default MarklyAuthPages;
