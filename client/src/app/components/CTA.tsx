// components/CTA.tsx
import React from 'react';
import Link from 'next/link';

interface CTAProps {
  getStartedUrl: string;
  contactSalesUrl: string;
}

const CTA: React.FC<CTAProps> = ({ getStartedUrl, contactSalesUrl }) => {
  return (
    <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-700">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Organized?</h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of users who've already transformed their bookmark chaos into an organized, AI-powered knowledge base.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href={getStartedUrl}
            className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105"
          >
            Start Free Trial
          </Link>
          <Link 
            href={contactSalesUrl}
            className="border-2 border-white/30 hover:border-white/50 px-8 py-4 rounded-xl text-lg font-semibold transition-all"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
