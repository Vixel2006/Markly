import React from 'react';
import { BookOpen, Menu, X } from 'lucide-react';

const Navigation = ({ isMenuOpen, setIsMenuOpen }) => {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/50 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Markly</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Features</a>
            <a href="#demo" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Demo</a>
            <a href="#pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Pricing</a>
            <a href="#testimonials" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Reviews</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Sign In</button>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              Start Free Trial
            </button>
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
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200">
          <div className="px-6 py-4 space-y-4">
            <a href="#features" className="block text-slate-600 hover:text-slate-900 font-medium transition-colors">Features</a>
            <a href="#demo" className="block text-slate-600 hover:text-slate-900 font-medium transition-colors">Demo</a>
            <a href="#pricing" className="block text-slate-600 hover:text-slate-900 font-medium transition-colors">Pricing</a>
            <a href="#testimonials" className="block text-slate-600 hover:text-slate-900 font-medium transition-colors">Reviews</a>
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <button className="block w-full text-left text-slate-600 hover:text-slate-900 font-medium transition-colors">Sign In</button>
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold w-full">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
