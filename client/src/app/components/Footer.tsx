// components/Footer.tsx
import React from 'react';
import { BookOpen, Twitter, Github, Mail } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
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
              <Link href="https://twitter.com" className="cursor-pointer">
                <Twitter className="w-5 h-5 text-slate-400 hover:text-white" />
              </Link>
              <Link href="https://github.com" className="cursor-pointer">
                <Github className="w-5 h-5 text-slate-400 hover:text-white" />
              </Link>
              <Link href="mailto:info@markly.com" className="cursor-pointer">
                <Mail className="w-5 h-5 text-slate-400 hover:text-white" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/api" className="hover:text-white transition-colors">API</Link></li>
              <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/status" className="hover:text-white transition-colors">Status</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; 2025 Markly. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
