// components/Hero.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, Zap, Search, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface HeroProps {
  getStartedUrl: string;
  watchDemoUrl: string;
}

const Hero: React.FC<HeroProps> = ({ getStartedUrl, watchDemoUrl }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const heroElement = document.getElementById('hero');
    if (heroElement) observer.observe(heroElement);

    return () => observer.disconnect();
  }, []);

  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <div id="hero" className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight">
            Never Lose a
            <br />
            Bookmark Again
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Markly uses AI to automatically organize, summarize, and help you rediscover your saved links. 
            Turn your bookmark chaos into an intelligent knowledge base.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link 
              href={getStartedUrl}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Free Trial
              <ArrowRight className="inline-block ml-2 w-5 h-5" />
            </Link>
            <Link 
              href={watchDemoUrl}
              className="flex items-center gap-3 px-8 py-4 rounded-xl border border-slate-600 hover:border-slate-500 transition-all group"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Link>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="relative max-w-4xl mx-auto">
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          
          {/* Mock Dashboard Preview */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-700/50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="font-medium">AI Categorized</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">1,247</div>
                <div className="text-sm text-slate-400">Bookmarks organized</div>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Search className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Smart Search</span>
                </div>
                <div className="text-2xl font-bold text-purple-400">0.3s</div>
                <div className="text-sm text-slate-400">Average search time</div>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Time Saved</span>
                </div>
                <div className="text-2xl font-bold text-green-400">2.5h</div>
                <div className="text-sm text-slate-400">Per week</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
