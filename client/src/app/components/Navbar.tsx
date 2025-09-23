"use client";
import React from 'react';
import Link from 'next/link';
import { BookOpen, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = ({ isMenuOpen, setIsMenuOpen }) => {
  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-indigo-100 z-50 shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Markly</span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-700 hover:text-indigo-700 transition-colors font-medium">Features</a>
            <a href="#demo" className="text-slate-700 hover:text-indigo-700 transition-colors font-medium">Demo</a>
            <a href="#testimonials" className="text-slate-700 hover:text-indigo-700 transition-colors font-medium">Reviews</a>
            <a href="#pricing" className="text-slate-700 hover:text-indigo-700 transition-colors font-medium">Pricing</a>
          </div>

          <motion.div
            className="hidden md:flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/auth?form=signin" className="text-slate-700 hover:text-indigo-700 transition-colors font-medium">Sign In</Link>
            <Link href="/auth?form=register" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-5 py-2.5 rounded-full text-white font-medium transition-all transform hover:scale-105 shadow-lg">
              Start Free Trial
            </Link>
          </motion.div>

          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="w-6 h-6 text-gray-800" /> : <Menu className="w-6 h-6 text-gray-800" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-white border-t border-indigo-100 shadow-inner"
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 py-4 space-y-4">
              <a href="#features" onClick={() => setIsMenuOpen(false)} className="block text-slate-700 hover:text-indigo-700 transition-colors font-medium text-lg">Features</a>
              <a href="#demo" onClick={() => setIsMenuOpen(false)} className="block text-slate-700 hover:text-indigo-700 transition-colors font-medium text-lg">Demo</a>
              <a href="#testimonials" onClick={() => setIsMenuOpen(false)} className="block text-slate-700 hover:text-indigo-700 transition-colors font-medium text-lg">Reviews</a>
              <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="block text-slate-700 hover:text-indigo-700 transition-colors font-medium text-lg">Pricing</a>
              <div className="pt-4 border-t border-indigo-100 space-y-3">
                <Link href="/auth?form=signin" onClick={() => setIsMenuOpen(false)} className="block w-full text-left text-indigo-700 hover:text-indigo-900 transition-colors font-medium text-lg">Sign In</Link>
                <Link href="/auth?form=register" onClick={() => setIsMenuOpen(false)} className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 rounded-full text-white w-full text-center font-semibold text-lg shadow-md hover:from-purple-600 hover:to-pink-600 transition-all">
                  Start Free Trial
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
