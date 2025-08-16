// components/Navbar.tsx
"use client";

import React, { useState } from 'react';
import { BookOpen, Menu, X } from 'lucide-react';
import Link from 'next/link'; // Use Next.js Link for navigation

interface NavbarProps {
  navigationLinks: { label: string; url: string }[];
  signInUrl: string;
  getStartedUrl: string;
}

const Navbar: React.FC<NavbarProps> = ({ navigationLinks, signInUrl, getStartedUrl }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold">Markly</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link key={link.label} href={link.url} className="text-slate-300 hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href={signInUrl} className="text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link 
              href={getStartedUrl} 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-4 py-2 rounded-lg transition-all transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-6 py-4 space-y-4">
            {navigationLinks.map((link) => (
              <Link 
                key={link.label} 
                href={link.url} 
                className="block text-slate-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-700 space-y-2">
              <Link 
                href={signInUrl} 
                className="block w-full text-left text-slate-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href={getStartedUrl}
                className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-lg w-full block text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
