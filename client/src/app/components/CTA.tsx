// components/CTA.tsx
"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface CTASectionProps {
  getStartedUrl: string;
  contactSalesUrl: string;
  getSectionRef: (id: string) => (el: HTMLElement | null) => void;
  visibleSections: { [key: string]: boolean };
}

const CTASection: React.FC<CTASectionProps> = ({ getStartedUrl, contactSalesUrl, getSectionRef, visibleSections }) => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <motion.section
      ref={getSectionRef('cta-section')}
      id="cta-section" // ID matches ref string
      className="py-24 px-6 bg-gradient-to-r from-purple-600 to-indigo-700 relative overflow-hidden"
      initial="hidden"
      animate={visibleSections['cta-section'] ? "visible" : "hidden"}
      variants={fadeInUp}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent)]"></div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div variants={fadeInUp}>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Organize Your World?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals transforming their knowledge management. Start your free trial today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div variants={fadeInUp}>
              <Link
                href={getStartedUrl}
                className="bg-white text-indigo-700 hover:bg-indigo-50 px-10 py-4 rounded-full text-lg font-bold transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Free Trial Now
              </Link>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <Link
                href={contactSalesUrl}
                className="border-2 border-white/40 hover:border-white/80 px-10 py-4 rounded-full text-lg font-bold text-white transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book a Demo
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default CTASection;
