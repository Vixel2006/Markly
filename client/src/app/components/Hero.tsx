import React, { useState } from 'react';
import { ArrowRight, Play, Sparkles, Users, Folder, Clock, Award, BarChart3, Brain } from 'lucide-react';

const HeroSection = () => {
  const [emailSignup, setEmailSignup] = useState('');

  const stats = [
    { value: "50K+", label: "Active Users", icon: <Users className="w-6 h-6" /> },
    { value: "2M+", label: "Bookmarks Organized", icon: <Folder className="w-6 h-6" /> },
    { value: "10hrs", label: "Average Time Saved/Week", icon: <Clock className="w-6 h-6" /> },
    { value: "94%", label: "Customer Satisfaction", icon: <Award className="w-6 h-6" /> }
  ];

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    alert('Thanks for your interest! We\'ll be in touch soon.');
    setEmailSignup('');
  };

  return (
    <section className="pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-bounce">
            <Sparkles className="w-4 h-4" />
            Now with GPT-4 powered intelligence
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Your Bookmarks,
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Supercharged by AI
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Stop losing track of important links. Markly's AI automatically organizes, 
            summarizes, and helps you rediscover your saved content when you need it most.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl flex items-center gap-2">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-3 px-8 py-4 rounded-xl border-2 border-slate-300 hover:border-slate-400 transition-all group bg-white/50 backdrop-blur-sm">
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform text-slate-700" />
              <span className="font-semibold text-slate-700">Watch 2-min Demo</span>
            </button>
          </div>

          <div className="text-sm text-slate-500 mb-12">
            ✅ Free 14-day trial • ✅ No credit card required • ✅ Cancel anytime
          </div>

          {/* Email Signup */}
          <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto mb-16">
            <div className="flex gap-3">
              <input
                type="email"
                value={emailSignup}
                onChange={(e) => setEmailSignup(e.target.value)}
                placeholder="Enter your email for early access"
                className="flex-1 px-4 py-3 bg-white/70 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Join Waitlist
              </button>
            </div>
          </form>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-lg transition-all transform hover:scale-105">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mb-3">
                <div className="text-blue-600">{stat.icon}</div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Hero Dashboard Preview */}
        <div className="relative max-w-6xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/90 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Hi, Sarah! 👋</h3>
                <p className="text-slate-600">Your productivity dashboard is ready</p>
              </div>
              <div className="text-6xl">📚</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Folder className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-blue-900">Total Bookmarks</span>
                </div>
                <div className="text-3xl font-bold text-blue-900">2,347</div>
                <div className="text-sm text-blue-700">+127 this week</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-purple-900">AI Organized</span>
                </div>
                <div className="text-3xl font-bold text-purple-900">94%</div>
                <div className="text-sm text-purple-700">Auto-categorized</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-green-900">Time Saved</span>
                </div>
                <div className="text-3xl font-bold text-green-900">12.5h</div>
                <div className="text-sm text-green-700">This month</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-orange-900">Productivity</span>
                </div>
                <div className="text-3xl font-bold text-orange-900">+340%</div>
                <div className="text-sm text-orange-700">Since using Markly</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
