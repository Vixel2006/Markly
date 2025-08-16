// components/Testimonials.tsx
import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Designer",
      avatar: "👩‍💼",
      content: "Markly transformed how I organize my design resources. The AI categorization is incredibly accurate!"
    },
    {
      name: "Marcus Rodriguez",
      role: "Software Engineer",
      avatar: "👨‍💻",
      content: "Finally, a bookmark manager that understands context. The search functionality is game-changing."
    },
    {
      name: "Emily Watson",
      role: "Content Creator",
      avatar: "👩‍🎨",
      content: "The AI summaries help me remember why I saved each article. It's like having a personal research assistant."
    }
  ];

  return (
    <section className="py-20 px-6 bg-slate-800/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">What Users Say</h2>
          <p className="text-xl text-slate-300">Join thousands of professionals who've transformed their workflow</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-8 bg-slate-800/50 border border-slate-700 rounded-2xl hover:border-slate-600 transition-all transform hover:scale-105"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="text-3xl">{testimonial.avatar}</div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-slate-400 text-sm">{testimonial.role}</div>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
