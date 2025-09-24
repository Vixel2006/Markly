// components/Demo.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { Search, Check, Folder, Brain, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractiveDemoProps {
  getSectionRef: (id: string) => (el: HTMLElement | null) => void;
  visibleSections: { [key: string]: boolean };
}

const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ getSectionRef, visibleSections }) => {
  const [currentDemo, setCurrentDemo] = useState(0);

  const demoSlides = [
    {
      title: "AI Auto-Organization",
      description: "Watch AI instantly categorize 1,000+ bookmarks in seconds",
      image: "🧠",
      stats: { processed: "1,247", time: "0.3s", accuracy: "94%" },
      mockData: [
        { category: "Development", count: 234, color: "bg-indigo-500" },
        { category: "Design", count: 187, color: "bg-purple-500" },
        { category: "Research", count: 156, color: "bg-emerald-500" },
        { category: "Marketing", count: 98, color: "bg-pink-500" }
      ]
    },
    {
      title: "Smart Content Summaries",
      description: "Never forget why you saved something with AI-generated insights",
      image: "📝",
      stats: { summaries: "1,247", time: "instant", satisfaction: "96%" },
      mockContent: {
        title: "Complete Guide to React Server Components",
        url: "nextjs.org/docs/server-components",
        summary: "Comprehensive overview of RSCs, rendering patterns, and performance benefits for modern React applications...",
        tags: ["React", "Next.js", "Performance", "SSR"]
      }
    },
    {
      title: "Semantic Search Magic",
      description: "Find anything by meaning, not just keywords",
      image: "🔍",
      stats: { queries: "50K+", speed: "0.1s", relevance: "97%" },
      searchQuery: "AI tools for creative work",
      results: [
        { title: "Midjourney - AI Art Generator", relevance: 98 },
        { title: "Copy.ai - Writing Assistant", relevance: 95 },
        { title: "Runway ML - Video Creation", relevance: 92 }
      ]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % demoSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [demoSlides.length]);

  // Framer Motion Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const slideTransition = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3, ease: "easeIn" } },
  };

  return (
    <motion.section
      ref={getSectionRef('demo-section')}
      id="demo-section" // FIXED: ID now matches ref string
      className="py-24 px-6 bg-gradient-to-b from-white to-indigo-50"
      initial="hidden"
      animate={visibleSections['demo-section'] ? "visible" : "hidden"}
      variants={fadeInUp}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          variants={fadeInUp}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            See The <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Magic</span> Happen
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Watch how Markly's AI transforms bookmark chaos into organized knowledge
          </p>
        </motion.div>

        <div className="bg-white rounded-3xl border border-indigo-100 shadow-2xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Demo Visualization */}
            <div className="order-2 lg:order-1">
              <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-200 min-h-[400px] shadow-inner">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="flex-1 bg-indigo-100 h-8 rounded-lg mx-4 flex items-center px-4">
                    <span className="text-sm text-slate-600">markly.ai/dashboard</span>
                  </div>
                </div>
                
                <AnimatePresence mode="wait">
                  {currentDemo === 0 && (
                    <motion.div key="demo0" variants={slideTransition} initial="initial" animate="animate" exit="exit" className="space-y-4">
                      <div className="text-lg font-semibold mb-4 text-gray-900">AI Categorization in Progress...</div>
                      {demoSlides[0].mockData.map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1, duration: 0.4 }}
                          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-indigo-100 transform transition-all hover:scale-[1.02] shadow-sm"
                        >
                          <div className={`w-4 h-4 ${item.color} rounded-full`}></div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{item.category}</div>
                            <div className="text-sm text-slate-600">{item.count} bookmarks</div>
                          </div>
                          <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center shadow-xs">
                            <Check className="w-4 h-4 text-emerald-600" />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {currentDemo === 1 && (
                    <motion.div key="demo1" variants={slideTransition} initial="initial" animate="animate" exit="exit">
                      <div className="text-lg font-semibold mb-4 text-gray-900">AI Summary Generation</div>
                      <div className="bg-white p-6 rounded-xl border border-indigo-100 space-y-4 shadow-sm">
                        <div className="font-medium text-gray-900">{demoSlides[1].mockContent.title}</div>
                        <div className="text-sm text-indigo-600">{demoSlides[1].mockContent.url}</div>
                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                          <div className="text-sm text-slate-600 italic mb-2">✨ AI Summary:</div>
                          <div className="text-slate-700">{demoSlides[1].mockContent.summary}</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {demoSlides[1].mockContent.tags.map((tag, idx) => (
                            <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentDemo === 2 && (
                    <motion.div key="demo2" variants={slideTransition} initial="initial" animate="animate" exit="exit">
                      <div className="text-lg font-semibold mb-4 text-gray-900">Semantic Search</div>
                      <div className="relative mb-6">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                        <input
                          type="text"
                          value={demoSlides[2].searchQuery}
                          className="w-full pl-12 pr-4 py-3 bg-white border border-indigo-200 rounded-xl font-medium text-gray-800 shadow-sm"
                          disabled
                        />
                      </div>
                      <div className="space-y-3">
                        {demoSlides[2].results.map((result, idx) => (
                          <div key={idx} className="p-4 bg-white rounded-xl border border-indigo-100 flex items-center justify-between hover:shadow-md transition-all shadow-sm">
                            <div className="font-medium text-gray-900">{result.title}</div>
                            <div className="text-sm bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
                              {result.relevance}% match
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Progress indicators */}
              <div className="flex justify-center gap-3 mt-6">
                {demoSlides.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`h-3 rounded-full transition-all duration-300 ${
                      currentDemo === index ? 'bg-indigo-500 w-8' : 'bg-indigo-200 w-3'
                    }`}
                    onClick={() => setCurrentDemo(index)}
                    whileHover={{ scale: 1.2 }}
                    aria-label={`Show demo slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Demo Controls */}
            <div className="order-1 lg:order-2 space-y-6">
              {demoSlides.map((slide, index) => (
                <motion.div
                  key={index}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer transform hover:scale-[1.02] shadow-lg ${
                    currentDemo === index
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300 ring-2 ring-purple-200'
                      : 'bg-white border-indigo-100 hover:border-indigo-200'
                  }`}
                  onClick={() => setCurrentDemo(index)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{slide.image}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 text-gray-900">{slide.title}</h3>
                      <p className="text-slate-700 mb-4">{slide.description}</p>
                      <div className="flex gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-gray-900">{Object.values(slide.stats)[0]}</div>
                          <div className="text-slate-600">{Object.keys(slide.stats)[0]}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-gray-900">{Object.values(slide.stats)[1]}</div>
                          <div className="text-slate-600">{Object.keys(slide.stats)[1]}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-gray-900">{Object.values(slide.stats)[2]}</div>
                          <div className="text-slate-600">{Object.keys(slide.stats)[2]}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default InteractiveDemo;
