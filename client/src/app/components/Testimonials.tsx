// components/Testimonials.tsx
"use client";
import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface TestimonialsSectionProps {
  getSectionRef: (id: string) => (el: HTMLElement | null) => void;
  visibleSections: { [key: string]: boolean };
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ getSectionRef, visibleSections }) => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Designer at TechCorp",
      avatar: "👩‍💼",
      content: "Markly transformed how I organize my design resources. The AI categorization is incredibly accurate and saves me hours weekly!",
      rating: 5,
      color: "bg-indigo-50"
    },
    {
      name: "Marcus Rodriguez",
      role: "Software Engineer at StartupX",
      avatar: "👨‍💻",
      content: "Finally, a bookmark manager that understands context. The semantic search functionality is a game-changer for finding lost insights.",
      rating: 5,
      color: "bg-purple-50"
    },
    {
      name: "Emily Watson",
      role: "Content Creator",
      avatar: "👩‍🎨",
      content: "The AI summaries help me remember why I saved each article. It's truly like having a personal research assistant guiding my content creation.",
      rating: 5,
      color: "bg-pink-50"
    },
    {
      name: "Alex Johnson",
      role: "Marketing Manager",
      avatar: "👨‍💼",
      content: "Our team's knowledge sharing has never been more efficient. Markly has been a pivotal tool in boosting our collective productivity.",
      rating: 5,
      color: "bg-emerald-50"
    },
     {
      name: "Lisa Patel",
      role: "Researcher at UniLab",
      avatar: "👩‍🔬",
      content: "The intelligent summarization feature alone makes Markly indispensable. It's invaluable for distilling complex research papers.",
      rating: 5,
      color: "bg-blue-50"
    },
    {
      name: "David Kim",
      role: "CEO at InnovateCo",
      avatar: "👨‍💼",
      content: "Markly seamlessly scaled with our growing needs. It's the best investment for agile knowledge management across all our projects.",
      rating: 5,
      color: "bg-orange-50"
    }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
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
      ref={getSectionRef('testimonials-section')}
      id="testimonials-section" // FIXED: ID now matches ref string
      className="py-24 px-6 bg-white"
      initial="hidden"
      animate={visibleSections['testimonials-section'] ? "visible" : "hidden"}
      variants={fadeInUp}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          variants={fadeInUp}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Real stories from professionals like you</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate={visibleSections['testimonials-section'] ? "visible" : "hidden"}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={itemVariants}
              className={`p-8 bg-white border border-indigo-100 rounded-3xl shadow-lg hover:shadow-xl transition-all ${testimonial.color}`}
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-slate-700">{testimonial.role}</div>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed mb-4">"{testimonial.content}"</p>
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default TestimonialsSection;
