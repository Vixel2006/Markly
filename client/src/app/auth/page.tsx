"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthWrapper from '../components/auth/AuthWrapper';
import SignInForm from '../components/auth/SignInForm';
import RegisterForm from '../components/auth/RegisterForm';

const MarklyAuthPages = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const formParam = searchParams.get('form');

  const currentPage = formParam === 'register' ? 'register' : 'signin';

  const navigateToForm = (formType: 'signin' | 'register') => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('form', formType);

    router.replace(`?${newSearchParams.toString()}`);
  };

  return (
    <AuthWrapper>
      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={() => navigateToForm('signin')}
          className={`px-4 py-2 rounded-lg transition-all ${
            currentPage === 'signin'
              ? 'bg-blue-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => navigateToForm('register')}
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
