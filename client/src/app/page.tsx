"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  BookOpen, Zap, Search, Star, Globe, TrendingUp, ArrowRight, Play, Check, Menu, X, Github, Twitter, Mail, ChevronDown, Sparkles, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import all your section components
import Navigation from './components/landing/Navbar';
import HeroSection from './components/landing/Hero';
import InteractiveDemo from './components/landing/Demo';
import FeaturesSection from './components/landing/Features';
import TestimonialsSection from './components/landing/Testimonials';
import PricingSection from './components/landing/PricingSection';
import FAQSection from './components/landing/FAQSection';
import CTASection from './components/landing/CTA';
import FooterSection from './components/landing/Footer';


const MarklyLandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // CurrentDemo state and demoSlides data moved into InteractiveDemo component
  // features, testimonials, pricingPlans, faqs data moved into their respective components

  // Using useRef to manage IntersectionObserver instances for the entire page
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const [visibleSections, setVisibleSections] = useState<{ [key: string]: boolean }>({});

  // Intersection Observer for `whileInView` logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setVisibleSections((prev) => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting,
          }));
        });
      },
      { threshold: 0.1, rootMargin: "-50px 0px" } // Added rootMargin for better trigger points
    );

    // Observe all elements that have been registered via getSectionRef
    const currentRefs = Object.values(sectionRefs.current).filter(Boolean) as HTMLElement[];
    currentRefs.forEach((ref) => observer.observe(ref));

    return () => {
      currentRefs.forEach((ref) => observer.unobserve(ref));
    };
  }, []);

  const getSectionRef = useCallback((id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <Navigation isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Hero Section */}
      <HeroSection getSectionRef={getSectionRef} visibleSections={visibleSections} />

      {/* Interactive Demo Section */}
      <InteractiveDemo getSectionRef={getSectionRef} visibleSections={visibleSections} />

      {/* Features Section */}
      <FeaturesSection getSectionRef={getSectionRef} visibleSections={visibleSections} />

      {/* Testimonials Section */}
      <TestimonialsSection getSectionRef={getSectionRef} visibleSections={visibleSections} />

      {/* Pricing Section */}
      <PricingSection getSectionRef={getSectionRef} visibleSections={visibleSections} />

      {/* FAQ Section */}
      <FAQSection getSectionRef={getSectionRef} visibleSections={visibleSections} />

      {/* CTA Section */}
      <CTASection getSectionRef={getSectionRef} visibleSections={visibleSections} getStartedUrl="/auth?form=register" contactSalesUrl="/contact-sales" />

      {/* Footer */}
      <FooterSection /> {/* Footer doesn't need visibility props for now, but keeping component structure */}
    </div>
  );
};

export default MarklyLandingPage;
