// components/landing/FooterSection.tsx - No changes needed for ID/Refs
"use client";
import React from 'react';
import { BookOpen, Twitter, Github, Mail } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const FooterSection = () => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const fadeInUpVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.5 } }
  };

  return (
    <motion.footer
      className="bg-indigo-50 py-12 px-6 border-t border-indigo-100 text-slate-700"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Markly</span>
            </div>
            <p className="text-slate-700 mb-4">
              Empowering knowledge with AI.
            </p>
            <div className="flex gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Markly on Twitter">
                <Twitter className="w-5 h-5 text-slate-600 hover:text-indigo-500 cursor-pointer transition-colors" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Markly on GitHub">
                <Github className="w-5 h-5 text-slate-600 hover:text-indigo-500 cursor-pointer transition-colors" />
              </a>
              <a href="mailto:info@markly.com" aria-label="Email Markly">
                <Mail className="w-5 h-5 text-slate-600 hover:text-indigo-500 cursor-pointer transition-colors" />
              </a>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="font-bold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2 text-slate-700">
              <li><Link href="#features-section" className="hover:text-indigo-700 transition-colors">Features</Link></li> {/* UPDATED HREF */}
              <li><Link href="#pricing-section" className="hover:text-indigo-700 transition-colors">Pricing</Link></li> {/* UPDATED HREF */}
              <li><Link href="/api" className="hover:text-indigo-700 transition-colors">API Docs</Link></li>
              <li><Link href="/changelog" className="hover:text-indigo-700 transition-colors">Changelog</Link></li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="font-bold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2 text-slate-700">
              <li><Link href="/about" className="hover:text-indigo-700 transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="hover:text-indigo-700 transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-indigo-700 transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-indigo-700 transition-colors">Contact</Link></li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="font-bold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 text-slate-700">
              <li><Link href="/help" className="hover:text-indigo-700 transition-colors">Help Center</Link></li>
              <li><Link href="/privacy" className="hover:text-indigo-700 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-indigo-700 transition-colors">Terms of Service</Link></li>
              <li><Link href="/status" className="hover:text-indigo-700 transition-colors">Status</Link></li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          variants={fadeInUpVariant}
          initial="hidden"
          animate="visible"
          className="border-t border-indigo-100 mt-8 pt-8 text-center text-slate-600"
        >
          <p>&copy; {new Date().getFullYear()} Markly Inc. All rights reserved.</p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default FooterSection;
