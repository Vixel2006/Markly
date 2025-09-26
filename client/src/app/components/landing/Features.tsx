// components/Features.tsx
"use client";
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Zap, Search, BookOpen, TrendingUp, Globe, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeaturesSectionProps {
  getSectionRef: (id: string) => (el: HTMLElement | null) => void;
  visibleSections: { [key: string]: boolean };
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ getSectionRef, visibleSections }) => {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-indigo-600" />,
      title: "AI Organization",
      description: "Save hours weekly with automatic categorization and tagging",
      benefit: "Boost productivity by 3x",
      color: "bg-indigo-50"
    },
    {
      icon: <Search className="w-8 h-8 text-purple-600" />,
      title: "Semantic Search",
      description: "Find exactly what you need in seconds using natural language",
      benefit: "Reduce search time by 80%",
      color: "bg-purple-50"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-pink-600" />,
      title: "Smart Summaries",
      description: "Instant overviews help you recall and decide faster",
      benefit: "Improve retention by 2x",
      color: "bg-pink-50"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-emerald-600" />,
      title: "Analytics",
      description: "Track usage patterns and optimize your knowledge base",
      benefit: "Discover insights automatically",
      color: "bg-emerald-50"
    },
    {
      icon: <Globe className="w-8 h-8 text-blue-600" />,
      title: "Cross-Device Sync",
      description: "Access your organized bookmarks anywhere, anytime",
      benefit: "Seamless multi-device experience",
      color: "bg-blue-50"
    },
    {
      icon: <Star className="w-8 h-8 text-orange-600" />,
      title: "Recommendations",
      description: "AI suggests related content to expand your knowledge",
      benefit: "Stay ahead with curated discoveries",
      color: "bg-orange-50"
    }
  ];

  const fadeInUpVariant = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <motion.section
      ref={getSectionRef('features-section')}
      id="features-section" // FIXED: ID now matches ref string
      className="py-24 px-6 bg-gradient-to-b from-white to-purple-50"
      initial="hidden"
      animate={visibleSections['features-section'] ? "visible" : "hidden"}
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={fadeInUpVariant}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Features That Empower</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Designed to supercharge your knowledge management and productivity
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate={visibleSections['features-section'] ? "visible" : "hidden"}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={itemVariants}
              className={`p-8 bg-white border border-indigo-100 rounded-3xl shadow-lg hover:shadow-xl transition-all ${feature.color}`}
              whileHover={{ scale: 1.03 }}
            >
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-slate-700 mb-4">{feature.description}</p>
              <div className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full inline-block">
                {feature.benefit}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FeaturesSection;
