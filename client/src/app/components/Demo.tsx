// components/Demo.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const Demo = () => {
  const [currentDemo, setCurrentDemo] = useState(0);

  const demoSlides = [
    {
      title: "AI-Powered Categorization",
      description: "Our AI automatically organizes your bookmarks into smart categories",
      image: "🤖",
      features: ["Auto-categorization", "Smart tagging", "Duplicate detection"]
    },
    {
      title: "Intelligent Summaries",
      description: "Never forget why you saved a link with AI-generated summaries",
      image: "📝",
      features: ["Content analysis", "Key points extraction", "Quick previews"]
    },
    {
      title: "Advanced Search",
      description: "Find any bookmark instantly with semantic search capabilities",
      image: "🔍",
      features: ["Natural language search", "Content-based results", "Filter by category"]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % demoSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="demo" className="py-20 px-6 bg-slate-800/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">See Markly in Action</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Experience how AI transforms your bookmark management workflow
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Demo Controls */}
          <div className="space-y-8">
            {demoSlides.map((slide, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl border transition-all cursor-pointer transform hover:scale-105 ${
                  currentDemo === index
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/50'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
                onClick={() => setCurrentDemo(index)}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{slide.image}</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{slide.title}</h3>
                    <p className="text-slate-300 mb-4">{slide.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {slide.features.map((feature, idx) => (
                        <span key={idx} className="px-3 py-1 bg-slate-700 rounded-full text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Demo Visualization */}
          <div className="relative">
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1 bg-slate-700 h-6 rounded mx-4"></div>
                </div>
                
                {currentDemo === 0 && (
                  <div className="space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">💻</div>
                      <div className="flex-1">
                        <div className="font-medium">React Documentation</div>
                        <div className="text-sm text-slate-400">Development • Auto-categorized</div>
                      </div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-700 rounded-lg">
                      <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">🎨</div>
                      <div className="flex-1">
                        <div className="font-medium">Figma Design System</div>
                        <div className="text-sm text-slate-400">Design • Auto-categorized</div>
                      </div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                )}

                {currentDemo === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="p-4 bg-slate-700 rounded-lg">
                      <div className="font-medium mb-2">Next.js Documentation</div>
                      <div className="text-sm text-slate-300 bg-slate-600 p-3 rounded">
                        "Complete guide to Next.js framework covering routing, API routes, deployment, and performance optimization..."
                      </div>
                      <div className="text-xs text-slate-400 mt-2">✨ AI Summary generated</div>
                    </div>
                  </div>
                )}

                {currentDemo === 2 && (
                  <div className="animate-fadeIn">
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="AI design tools for productivity"
                        className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-blue-500 rounded-lg"
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="p-2 bg-blue-500/20 border border-blue-500/50 rounded text-sm">
                        🤖 Midjourney AI - Found by content match
                      </div>
                      <div className="p-2 bg-blue-500/20 border border-blue-500/50 rounded text-sm">
                        🎨 Adobe Firefly - Semantic similarity
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {demoSlides.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentDemo === index ? 'bg-blue-500' : 'bg-slate-600'
                  }`}
                  onClick={() => setCurrentDemo(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Demo;
