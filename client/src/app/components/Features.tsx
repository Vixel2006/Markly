// components/Features.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Zap, Search, BookOpen, TrendingUp, Globe, Star } from 'lucide-react';

const Features = () => {
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[id^="feature-"]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI-Powered Organization",
      description: "Automatically categorize and tag your bookmarks with advanced AI algorithms"
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Semantic Search",
      description: "Find bookmarks by content, not just titles. Search naturally like you think"
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Smart Summaries",
      description: "Get AI-generated summaries so you never forget why you saved a link"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Usage Analytics",
      description: "Track which bookmarks you use most and discover forgotten gems"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Universal Access",
      description: "Access your bookmarks from anywhere with cloud synchronization"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Smart Recommendations",
      description: "Discover related content and get suggestions based on your interests"
    }
  ];

  return (
    <section id="features" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Powerful Features</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Everything you need to take control of your bookmarks and boost your productivity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              id={`feature-${index}`}
              className={`p-8 bg-slate-800/50 border border-slate-700 rounded-2xl hover:border-slate-600 transition-all transform hover:scale-105 ${
                isVisible[`feature-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-slate-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
