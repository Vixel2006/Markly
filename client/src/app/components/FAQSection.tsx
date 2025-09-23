"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  getSectionRef: (id: string) => (el: HTMLElement | null) => void;
  visibleSections: { [key: string]: boolean };
}

const FAQSection: React.FC<FAQSectionProps> = ({ getSectionRef, visibleSections }) => {
  const faqs: FAQ[] = [
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

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      }
    })
  };

  return (
    <motion.section
      ref={getSectionRef('faq-section')}
      id="faq"
      className="py-24 px-6 bg-white"
      initial="hidden"
      animate={visibleSections['faq-section'] ? "visible" : "hidden"}
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-slate-600">Everything you need to know about Markly</p>
        </motion.div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={itemVariants}
              className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{faq.question}</h3>
              <p className="text-slate-700">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default FAQSection;
