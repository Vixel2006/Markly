"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link'
import { BookOpen, Zap, Search, Star, Globe, Folder, TrendingUp, ArrowRight, Play, Check, Menu, X, Github, Twitter, Mail, ChevronDown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const MarklyLandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentDemo, setCurrentDemo] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  const demoSlides = [
    {
      title: "AI-Powered Categorization",
      description: "Instantly organize your bookmarks with intelligent AI that understands context",
      image: "🤖",
      features: ["Context-aware grouping", "Automatic tagging", "Duplicate removal"],
      color: "bg-gradient-to-br from-pink-100 to-pink-200"
    },
    {
      title: "Intelligent Summaries",
      description: "Get concise AI-generated overviews of every saved link",
      image: "📝",
      features: ["Key insight extraction", "Custom length summaries", "Multi-language support"],
      color: "bg-gradient-to-br from-yellow-100 to-yellow-200"
    },
    {
      title: "Advanced Search",
      description: "Search semantically across content, not just titles",
      image: "🔍",
      features: ["Natural language queries", "Related content discovery", "Advanced filters"],
      color: "bg-gradient-to-br from-purple-100 to-purple-200"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % demoSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
      icon: <Zap className="w-8 h-8 text-pink-600" />,
      title: "AI Organization",
      description: "Save hours weekly with automatic categorization and tagging",
      benefit: "Boost productivity by 3x",
      color: "bg-pink-50"
    },
    {
      icon: <Search className="w-8 h-8 text-orange-600" />,
      title: "Semantic Search",
      description: "Find exactly what you need in seconds using natural language",
      benefit: "Reduce search time by 80%",
      color: "bg-orange-50"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-purple-600" />,
      title: "Smart Summaries",
      description: "Instant overviews help you recall and decide faster",
      benefit: "Improve retention by 2x",
      color: "bg-purple-50"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-yellow-600" />,
      title: "Analytics",
      description: "Track usage patterns and optimize your knowledge base",
      benefit: "Discover insights automatically",
      color: "bg-yellow-50"
    },
    {
      icon: <Globe className="w-8 h-8 text-pink-600" />,
      title: "Cross-Device Sync",
      description: "Access your organized bookmarks anywhere, anytime",
      benefit: "Seamless multi-device experience",
      color: "bg-pink-50"
    },
    {
      icon: <Star className="w-8 h-8 text-orange-600" />,
      title: "Recommendations",
      description: "AI suggests related content to expand your knowledge",
      benefit: "Stay ahead with curated discoveries",
      color: "bg-orange-50"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Designer at TechCorp",
      avatar: "👩‍💼",
      content: "Markly has revolutionized my workflow. I save hours every week!",
      rating: 5,
      color: "bg-pink-50"
    },
    {
      name: "Marcus Rodriguez",
      role: "Software Engineer at StartupX",
      avatar: "👨‍💻",
      content: "The semantic search is a game-changer. Found lost resources instantly.",
      rating: 5,
      color: "bg-yellow-50"
    },
    {
      name: "Emily Watson",
      role: "Content Creator",
      avatar: "👩‍🎨",
      content: "Like having a personal AI librarian. Absolutely essential now.",
      rating: 5,
      color: "bg-purple-50"
    },
    {
      name: "Alex Johnson",
      role: "Marketing Manager",
      avatar: "👨‍💼",
      content: "Team productivity soared. Best investment for our knowledge management.",
      rating: 5,
      color: "bg-orange-50"
    },
    {
      name: "Lisa Patel",
      role: "Researcher at UniLab",
      avatar: "👩‍🔬",
      content: "The summaries alone are worth the price. Invaluable for my work.",
      rating: 5,
      color: "bg-pink-50"
    },
    {
      name: "David Kim",
      role: "CEO at InnovateCo",
      avatar: "👨‍💼",
      content: "Scaled our team's knowledge sharing effortlessly. Highly recommend!",
      rating: 5,
      color: "bg-yellow-50"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$0",
      period: "forever",
      features: [
        "1,000 bookmarks",
        "Basic AI organization",
        "Standard search",
        "Email support"
      ],
      popular: false,
      color: "bg-yellow-50"
    },
    {
      name: "Pro",
      price: "$9",
      period: "per month",
      features: [
        "Unlimited bookmarks",
        "Advanced AI features",
        "Team collaboration",
        "Priority support",
        "API access",
        "Custom integrations",
        "Analytics dashboard"
      ],
      popular: true,
      color: "bg-pink-50"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      features: [
        "All Pro features",
        "Dedicated account manager",
        "SSO & security features",
        "Custom AI training",
        "On-premise option",
        "Unlimited teams",
        "SLA guarantee"
      ],
      popular: false,
      color: "bg-purple-50"
    }
  ];

  const faqs = [
    {
      question: "How does the AI organization work?",
      answer: "Our advanced AI analyzes content, metadata, and your usage patterns to automatically categorize and tag bookmarks. It's like having a smart assistant organizing your digital library."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use bank-grade encryption, comply with GDPR and CCPA, and never share your data. You own your bookmarks and can export anytime."
    },
    {
      question: "Can I import my existing bookmarks?",
      answer: "Yes! Easily import from Chrome, Firefox, Safari, or any standard export format. Our AI will organize them automatically upon import."
    },
    {
      question: "What if I need help?",
      answer: "Our support team is available 24/7 via chat and email. Pro users get priority response, and Enterprise gets dedicated support."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-200 text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-green-100 z-50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-black">Markly</span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-700 hover:text-black transition-colors font-medium">Features</a>
              <a href="#demo" className="text-slate-700 hover:text-black transition-colors font-medium">Demo</a>
              <a href="#testimonials" className="text-slate-700 hover:text-black transition-colors font-medium">Reviews</a>
              <a href="#pricing" className="text-slate-700 hover:text-black transition-colors font-medium">Pricing</a>
            </div>

            <motion.div 
              className="hidden md:flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/auth?form=signin" className="text-slate-700 hover:text-black transition-colors font-medium">Sign In</Link>
              <Link href="/auth?form=register" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 px-5 py-2.5 rounded-full text-white font-medium transition-all transform hover:scale-105 shadow-md">
                Start Free Trial
              </Link>
            </motion.div>

            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6 text-black" /> : <Menu className="w-6 h-6 text-black" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            className="md:hidden bg-white border-t border-green-100"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 py-4 space-y-4">
              <a href="#features" className="block text-slate-700 hover:text-black transition-colors">Features</a>
              <a href="#demo" className="block text-slate-700 hover:text-black transition-colors">Demo</a>
              <a href="#testimonials" className="block text-slate-700 hover:text-black transition-colors">Reviews</a>
              <a href="#pricing" className="block text-slate-700 hover:text-black transition-colors">Pricing</a>
              <div className="pt-4 border-t border-green-100 space-y-2">
                <button className="block w-full text-left text-slate-700 hover:text-black transition-colors">Sign In</button>
                <button className="bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 rounded-full text-white w-full">
                  Start Free Trial
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 bg-gradient-to-br from-green-50 via-green-100 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            id="hero"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-black leading-tight">
              Unlock Your Knowledge
              <br />
              with AI-Powered Organization
            </h1>
            <p className="text-xl md:text-2xl text-slate-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform chaotic bookmarks into a smart knowledge base. Save time, boost productivity, and never lose insights again. Join 15,000+ professionals who reclaim hours weekly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <motion.button 
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 px-8 py-4 rounded-full text-lg font-semibold text-white transition-all shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start 14-Day Free Trial
                <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </motion.button>
              <motion.button 
                className="flex items-center gap-3 px-8 py-4 rounded-full border border-purple-200 hover:border-purple-300 bg-white/80 backdrop-blur-sm transition-all group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                Watch Demo (2 min)
              </motion.button>
            </div>
            <p className="text-sm text-slate-600 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              No credit card required • Instant setup • Money-back guarantee
            </p>
          </motion.div>

          {/* Enhanced Dashboard Preview */}
          <motion.div 
            className="relative max-w-5xl mx-auto mt-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-200/20 to-purple-200/20 rounded-3xl blur-3xl opacity-50"></div>
            <div className="bg-white/90 backdrop-blur-md border border-green-100 rounded-3xl p-8 shadow-2xl relative">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl text-center" whileHover={{ scale: 1.05 }}>
                  <div className="text-3xl font-bold text-pink-600 mb-2">15,000+</div>
                  <div className="text-sm font-medium text-slate-700">Happy Users</div>
                </motion.div>
                <motion.div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl text-center" whileHover={{ scale: 1.05 }}>
                  <div className="text-3xl font-bold text-purple-600 mb-2">4.9/5</div>
                  <div className="text-sm font-medium text-slate-700">User Rating</div>
                </motion.div>
                <motion.div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-2xl text-center" whileHover={{ scale: 1.05 }}>
                  <div className="text-3xl font-bold text-yellow-600 mb-2">3x</div>
                  <div className="text-sm font-medium text-slate-700">Productivity Boost</div>
                </motion.div>
                <motion.div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl text-center" whileHover={{ scale: 1.05 }}>
                  <div className="text-3xl font-bold text-green-600 mb-2">99.9%</div>
                  <div className="text-sm font-medium text-slate-700">Uptime</div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Experience the Magic</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              See how Markly's AI transforms your bookmark chaos into organized brilliance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Demo Controls */}
            <div className="space-y-6">
              {demoSlides.map((slide, index) => (
                <motion.div
                  key={index}
                  className={`p-6 rounded-2xl cursor-pointer transform transition-all bg-white shadow-md hover:shadow-lg ${slide.color} ${
                    currentDemo === index ? 'ring-2 ring-purple-500 scale-105' : ''
                  }`}
                  onClick={() => setCurrentDemo(index)}
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl flex-shrink-0">{slide.image}</div>
                    <div>
                      <h3 className="text-xl font-semibold text-black mb-2">{slide.title}</h3>
                      <p className="text-slate-600 mb-4">{slide.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {slide.features.map((feature, idx) => (
                          <span key={idx} className="px-3 py-1 bg-white/50 rounded-full text-sm text-black font-medium">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Demo Visualization */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-white rounded-3xl p-8 border border-green-100 shadow-xl">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div className="flex-1 bg-green-50 h-6 rounded mx-4"></div>
                  </div>
                  
                  <motion.div 
                    key={currentDemo}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {currentDemo === 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl">
                          <div className="w-10 h-10 bg-pink-200 rounded-lg flex items-center justify-center text-xl">💻</div>
                          <div className="flex-1">
                            <div className="font-semibold text-black">React Best Practices</div>
                            <div className="text-sm text-slate-600">Dev • AI-Categorized • 4.8 ⭐</div>
                          </div>
                          <Sparkles className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                          <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center text-xl">🎨</div>
                          <div className="flex-1">
                            <div className="font-semibold text-black">UI Design Trends 2025</div>
                            <div className="text-sm text-slate-600">Design • AI-Categorized • 4.9 ⭐</div>
                          </div>
                          <Sparkles className="w-5 h-5 text-yellow-500" />
                        </div>
                      </div>
                    )}

                    {currentDemo === 1 && (
                      <div className="space-y-4">
                        <div className="p-5 bg-yellow-50 rounded-xl">
                          <div className="font-semibold text-black mb-3">AI in Productivity Guide</div>
                          <div className="text-sm text-slate-600 bg-white p-4 rounded-lg shadow-sm">
                            Key points: AI tools for workflow optimization, top 10 apps, implementation tips, case studies from Fortune 500 companies...
                          </div>
                          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <Sparkles className="w-4 h-4 text-yellow-500" />
                            AI-Generated Summary
                          </div>
                        </div>
                      </div>
                    )}

                    {currentDemo === 2 && (
                      <div>
                        <div className="relative mb-4">
                          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                          <input
                            type="text"
                            value="best ai tools for designers 2025"
                            className="w-full pl-12 pr-4 py-3 bg-green-50 border border-green-200 rounded-xl font-medium"
                            disabled
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-black flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center">🎨</div>
                            Figma AI Plugins - High relevance match
                          </div>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-black flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center">🤖</div>
                            Midjourney V6 - Semantic similarity 95%
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>

              <div className="flex justify-center gap-3 mt-6">
                {demoSlides.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${
                      currentDemo === index ? 'bg-purple-500 scale-125' : 'bg-green-200'
                    }`}
                    onClick={() => setCurrentDemo(index)}
                    whileHover={{ scale: 1.5 }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Features That Empower</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Designed to supercharge your knowledge management and productivity
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                id={`feature-${index}`}
                className={`p-8 bg-white border border-green-100 rounded-3xl shadow-md hover:shadow-xl transition-all ${feature.color}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-md">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold text-black mb-3">{feature.title}</h3>
                <p className="text-slate-600 mb-4">{feature.description}</p>
                <div className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full inline-block">
                  {feature.benefit}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">What Our Users Say</h2>
            <p className="text-xl text-slate-600">Real stories from professionals like you</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className={`p-8 bg-white border border-green-100 rounded-3xl shadow-md hover:shadow-xl transition-all ${testimonial.color}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl shadow-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-black">{testimonial.name}</div>
                    <div className="text-sm text-slate-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed mb-4">"{testimonial.content}"</p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-slate-600 max-w-xl mx-auto">Choose your plan • Billed annually or monthly • 14-day free trial</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                className={`relative p-8 rounded-3xl border transition-all bg-white shadow-lg hover:shadow-2xl ${plan.color} ${
                  plan.popular ? 'scale-105 border-purple-300' : 'border-green-100'
                }`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-2 rounded-full text-sm font-bold text-white shadow-md">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-black mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-black">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-slate-600 ml-2">{plan.period}</span>}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-700">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <motion.button
                  className={`w-full py-4 rounded-full font-bold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-black mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-slate-600">Everything you need to know about Markly</p>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                className="bg-green-50 p-6 rounded-2xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h3 className="text-xl font-semibold text-black mb-3">{faq.question}</h3>
                <p className="text-slate-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-pink-500 to-purple-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Organize Your World?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals transforming their knowledge management. Start your free trial today and experience the difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button 
                className="bg-white text-purple-600 hover:bg-green-50 px-10 py-4 rounded-full text-lg font-bold transition-all shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free Trial Now
              </motion.button>
              <motion.button 
                className="border-2 border-white/40 hover:border-white/80 px-10 py-4 rounded-full text-lg font-bold text-white transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book a Demo
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-50 py-12 px-6 border-t border-green-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-black">Markly</span>
              </div>
              <p className="text-slate-600 mb-4">
                Empowering knowledge with AI.
              </p>
              <div className="flex gap-4">
                <Twitter className="w-5 h-5 text-slate-600 hover:text-purple-500 cursor-pointer transition-colors" />
                <Github className="w-5 h-5 text-slate-600 hover:text-purple-500 cursor-pointer transition-colors" />
                <Mail className="w-5 h-5 text-slate-600 hover:text-purple-500 cursor-pointer transition-colors" />
              </div>
            </div>

            <div>
              <h4 className="font-bold text-black mb-4">Product</h4>
              <ul className="space-y-2 text-slate-600">
                <li><a href="#features" className="hover:text-black transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-black transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-black transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-black mb-4">Company</h4>
              <ul className="space-y-2 text-slate-600">
                <li><a href="#" className="hover:text-black transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-black mb-4">Support</h4>
              <ul className="space-y-2 text-slate-600">
                <li><a href="#" className="hover:text-black transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-green-100 mt-8 pt-8 text-center text-slate-600">
            <p>&copy; 2025 Markly Inc. All rights reserved.</p>
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
