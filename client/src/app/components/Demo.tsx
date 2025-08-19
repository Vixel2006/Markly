import React, { useState, useEffect } from 'react';
import { Search, Check, Folder, Brain, Zap } from 'lucide-react';

const InteractiveDemo = () => {
  const [currentDemo, setCurrentDemo] = useState(0);

  const demoSlides = [
    {
      title: "AI Auto-Organization",
      description: "Watch AI instantly categorize 1,000+ bookmarks in seconds",
      image: "🧠",
      stats: { processed: "1,247", time: "0.3s", accuracy: "94%" },
      mockData: [
        { category: "Development", count: 234, color: "bg-blue-500" },
        { category: "Design", count: 187, color: "bg-purple-500" },
        { category: "Research", count: 156, color: "bg-green-500" },
        { category: "Marketing", count: 98, color: "bg-orange-500" }
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
  }, []);

  return (
    <section id="demo" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            See The <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Magic</span> Happen
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Watch how Markly's AI transforms bookmark chaos into organized knowledge
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-200/50 shadow-2xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Demo Visualization */}
            <div className="order-2 lg:order-1">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 min-h-[400px]">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="flex-1 bg-slate-200 h-8 rounded-lg mx-4 flex items-center px-4">
                    <span className="text-sm text-slate-500">markly.ai/dashboard</span>
                  </div>
                </div>
                
                {currentDemo === 0 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="text-lg font-semibold mb-4 text-slate-800">AI Categorization in Progress...</div>
                    {demoSlides[0].mockData.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 transform transition-all hover:scale-105" style={{ animationDelay: `${idx * 200}ms` }}>
                        <div className={`w-4 h-4 ${item.color} rounded-full`}></div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-800">{item.category}</div>
                          <div className="text-sm text-slate-500">{item.count} bookmarks</div>
                        </div>
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {currentDemo === 1 && (
                  <div className="animate-fadeIn">
                    <div className="text-lg font-semibold mb-4 text-slate-800">AI Summary Generation</div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                      <div className="font-medium text-slate-800">{demoSlides[1].mockContent.title}</div>
                      <div className="text-sm text-blue-600">{demoSlides[1].mockContent.url}</div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <div className="text-sm text-slate-600 italic mb-2">✨ AI Summary:</div>
                        <div className="text-slate-700">{demoSlides[1].mockContent.summary}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {demoSlides[1].mockContent.tags.map((tag, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentDemo === 2 && (
                  <div className="animate-fadeIn">
                    <div className="text-lg font-semibold mb-4 text-slate-800">Semantic Search</div>
                    <div className="relative mb-6">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        value={demoSlides[2].searchQuery}
                        className="w-full pl-12 pr-4 py-3 bg-white border-2 border-blue-200 rounded-xl font-medium"
                        disabled
                      />
                    </div>
                    <div className="space-y-3">
                      {demoSlides[2].results.map((result, idx) => (
                        <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between hover:shadow-md transition-all">
                          <div className="font-medium text-slate-800">{result.title}</div>
                          <div className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                            {result.relevance}% match
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Progress indicators */}
              <div className="flex justify-center gap-3 mt-6">
                {demoSlides.map((_, index) => (
                  <button
                    key={index}
                    className={`h-3 rounded-full transition-all ${
                      currentDemo === index ? 'bg-blue-500 w-8' : 'bg-slate-300 w-3'
                    }`}
                    onClick={() => setCurrentDemo(index)}
                  />
                ))}
              </div>
            </div>

            {/* Demo Controls */}
            <div className="order-1 lg:order-2 space-y-6">
              {demoSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer transform hover:scale-105 ${
                    currentDemo === index
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 shadow-lg'
                      : 'bg-white/50 border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setCurrentDemo(index)}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{slide.image}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 text-slate-800">{slide.title}</h3>
                      <p className="text-slate-600 mb-4">{slide.description}</p>
                      <div className="flex gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-bold text-slate-800">{Object.values(slide.stats)[0]}</div>
                          <div className="text-slate-500">{Object.keys(slide.stats)[0]}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-slate-800">{Object.values(slide.stats)[1]}</div>
                          <div className="text-slate-500">{Object.keys(slide.stats)[1]}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-slate-800">{Object.values(slide.stats)[2]}</div>
                          <div className="text-slate-500">{Object.keys(slide.stats)[2]}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default InteractiveDemo;
