// components/Hero.tsx - No changes needed for ID/Refs
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Play, Sparkles, Users, Folder, Clock, Award, BarChart3, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  getSectionRef: (id: string) => (el: HTMLElement | null) => void;
  visibleSections: { [key: string]: boolean };
}

const HeroSection: React.FC<HeroSectionProps> = ({ getSectionRef, visibleSections }) => {
  const [emailSignup, setEmailSignup] = useState('');

  const stats = [
    { value: "50K+", label: "Active Users", icon: <Users className="w-6 h-6" /> },
    { value: "2M+", label: "Bookmarks Organized", icon: <Folder className="w-6 h-6" /> },
    { value: "10hrs", label: "Average Time Saved/Week", icon: <Clock className="w-6 h-6" /> },
    { value: "94%", label: "Customer Satisfaction", icon: <Award className="w-6 h-6" /> }
  ];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thanks for your interest! We\'ll be in touch soon.');
    setEmailSignup('');
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.section
      ref={getSectionRef('hero-section')}
      id="hero-section" // ID matches ref string
      className="pt-32 pb-24 px-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden"
      initial="hidden"
      animate={visibleSections['hero-section'] ? "visible" : "hidden"}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.2),rgba(255,255,255,0))]"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-pulse"
          >
            <Sparkles className="w-4 h-4" />
            Now with GPT-4 powered intelligence
          </motion.div>
          
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-gray-900"
          >
            Your Bookmarks,
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              Supercharged by AI
            </span>
          </motion.h1>
          
          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-slate-700 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Stop losing track of important links. Markly's AI automatically organizes, 
            summarizes, and helps you rediscover your saved content when you need it most.
          </motion.p>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={visibleSections['hero-section'] ? "visible" : "hidden"}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          >
            <motion.button
              variants={fadeInUp}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-xl hover:shadow-2xl flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              variants={fadeInUp}
              className="flex items-center gap-3 px-8 py-4 rounded-full border border-indigo-200 hover:border-indigo-300 bg-white/80 backdrop-blur-sm text-indigo-700 font-semibold transition-all group shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
              Watch 2-min Demo
            </motion.button>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="text-sm text-slate-600 mb-12 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-yellow-500" />
            No credit card required • Instant setup • Money-back guarantee
          </motion.div>

          <motion.form
            variants={fadeInUp}
            onSubmit={handleEmailSubmit}
            className="max-w-md mx-auto mb-16"
          >
            <div className="flex gap-3">
              <input
                type="email"
                value={emailSignup}
                onChange={(e) => setEmailSignup(e.target.value)}
                placeholder="Enter your email for early access"
                className="flex-1 px-4 py-3 bg-white/70 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent text-gray-800 shadow-sm"
                required
              />
              <button
                type="submit"
                className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md"
              >
                Join Waitlist
              </button>
            </div>
          </motion.form>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={visibleSections['hero-section'] ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-indigo-100 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl mb-3 shadow-md">
                <div className="text-purple-600">{stat.icon}</div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-700 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={visibleSections['hero-section'] ? "visible" : "hidden"}
          className="relative max-w-6xl mx-auto"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-3xl blur-3xl opacity-50"></div>
          <div className="relative bg-white/90 backdrop-blur-md border border-indigo-100 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Hi, Sarah! 👋</h3>
                <p className="text-slate-700">Your productivity dashboard is ready</p>
              </div>
              <div className="text-6xl">📚</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <Folder className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-indigo-900">Total Bookmarks</span>
                </div>
                <div className="text-3xl font-bold text-indigo-900">2,347</div>
                <div className="text-sm text-indigo-700">+127 this week</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-md">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-purple-900">AI Organized</span>
                </div>
                <div className="text-3xl font-bold text-purple-900">94%</div>
                <div className="text-sm text-purple-700">Auto-categorized</div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-emerald-900">Time Saved</span>
                </div>
                <div className="text-3xl font-bold text-emerald-900">12.5h</div>
                <div className="text-sm text-emerald-700">This month</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-md">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-orange-900">Productivity</span>
                </div>
                <div className="text-3xl font-bold text-orange-900">+340%</div>
                <div className="text-sm text-orange-700">Since using Markly</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HeroSection;
