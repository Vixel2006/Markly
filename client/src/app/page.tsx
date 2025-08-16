"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import { BookOpen, Zap, Search, Star, Globe, Folder, TrendingUp, ArrowRight, Play, Check, Menu, X, Github, Twitter, Mail, ChevronDown } from 'lucide-react';

const MarklyLandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentDemo, setCurrentDemo] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  // Demo slides data
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

  // Auto-advance demo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % demoSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for animations
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

    document.querySelectorAll('[id]').forEach((el) => observer.observe(el));
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

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Designer",
      avatar: "👩‍💼",
      content: "Markly transformed how I organize my design resources. The AI categorization is incredibly accurate!"
    },
    {
      name: "Marcus Rodriguez",
      role: "Software Engineer",
      avatar: "👨‍💻",
      content: "Finally, a bookmark manager that understands context. The search functionality is game-changing."
    },
    {
      name: "Emily Watson",
      role: "Content Creator",
      avatar: "👩‍🎨",
      content: "The AI summaries help me remember why I saved each article. It's like having a personal research assistant."
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "Up to 1,000 bookmarks",
        "Basic AI categorization",
        "Search functionality",
        "Web app access"
      ],
      popular: false
    },
    {
      name: "Pro",
      price: "$8",
      period: "per month",
      features: [
        "Unlimited bookmarks",
        "Advanced AI features",
        "Priority support",
        "Team collaboration",
        "API access",
        "Custom categories"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      features: [
        "Everything in Pro",
        "SSO integration",
        "Advanced analytics",
        "Custom integrations",
        "Dedicated support"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden">
      {/* Navigation */}
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
              <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#demo" className="text-slate-300 hover:text-white transition-colors">Demo</a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</a>
              <a href="#about" className="text-slate-300 hover:text-white transition-colors">About</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link href="/auth?form=signin" className="text-slate-300 hover:text-white transition-colors">Sign In</Link>
              <Link href="/auth?form=register" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-4 py-2 rounded-lg transition-all transform hover:scale-105">
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
              <a href="#features" className="block text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#demo" className="block text-slate-300 hover:text-white transition-colors">Demo</a>
              <a href="#pricing" className="block text-slate-300 hover:text-white transition-colors">Pricing</a>
              <a href="#about" className="block text-slate-300 hover:text-white transition-colors">About</a>
              <div className="pt-4 border-t border-slate-700 space-y-2">
                <button className="block w-full text-left text-slate-300 hover:text-white transition-colors">Sign In</button>
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-lg w-full">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div id="hero" className={`transition-all duration-1000 ${isVisible.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight">
              Beyond Bookmarks.
              <br />
              Your AI Knowledge Base.
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Markly transforms your scattered internet links into an intelligent knowledge base.
              Our AI automatically organizes, summarizes, and helps you rediscover everything,
              turning information overload into structured knowledge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                Start Free Trial
                <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </button>
              <button className="flex items-center gap-3 px-8 py-4 rounded-xl border border-slate-600 hover:border-slate-500 transition-all group">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </button>
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

      {/* Demo Section */}
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

      {/* Features Section */}
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

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">What Users Say</h2>
            <p className="text-xl text-slate-300">Join thousands of professionals who've transformed their workflow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 bg-slate-800/50 border border-slate-700 rounded-2xl hover:border-slate-600 transition-all transform hover:scale-105"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-slate-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple Pricing</h2>
            <p className="text-xl text-slate-300">Choose the plan that's right for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-2xl border transition-all transform hover:scale-105 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/50 shadow-xl'
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-slate-400 ml-2">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Organized?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who've already transformed their bookmark chaos into an organized, AI-powered knowledge base.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105">
              Start Free Trial
            </button>
            <button className="border-2 border-white/30 hover:border-white/50 px-8 py-4 rounded-xl text-lg font-semibold transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold">Markly</span>
              </div>
              <p className="text-slate-400 mb-4">
                AI-powered bookmark management for the modern web.
              </p>
              <div className="flex gap-4">
                <Twitter className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
                <Github className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
                <Mail className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer" />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 Markly. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MarklyLandingPage;

