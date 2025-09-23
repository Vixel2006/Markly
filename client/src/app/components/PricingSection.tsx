"use client";
import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular: boolean;
  color: string;
}

interface PricingSectionProps {
  getSectionRef: (id: string) => (el: HTMLElement | null) => void;
  visibleSections: { [key: string]: boolean };
}

const PricingSection: React.FC<PricingSectionProps> = ({ getSectionRef, visibleSections }) => {
  const pricingPlans: PricingPlan[] = [
    {
      name: "Starter",
      price: "$0",
      period: "forever",
      features: [
        "1,000 bookmarks",
        "Basic AI organization",
        "Standard search",
        "Email support"
      ],
      popular: false,
      color: "bg-indigo-50"
    },
    {
      name: "Pro",
      price: "$9",
      period: "per month",
      features: [
        "Unlimited bookmarks",
        "Advanced AI features",
        "Team collaboration",
        "Priority support",
        "API access",
        "Custom integrations",
        "Analytics dashboard"
      ],
      popular: true,
      color: "bg-purple-50"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      features: [
        "All Pro features",
        "Dedicated account manager",
        "SSO & security features",
        "Custom AI training",
        "On-premise option",
        "Unlimited teams",
        "SLA guarantee"
      ],
      popular: false,
      color: "bg-pink-50"
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
      ref={getSectionRef('pricing-section')}
      id="pricing"
      className="py-24 px-6 bg-gradient-to-b from-white to-purple-50"
      initial="hidden"
      animate={visibleSections['pricing-section'] ? "visible" : "hidden"}
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-slate-600 max-w-xl mx-auto">Choose your plan • Billed annually or monthly • 14-day free trial</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={itemVariants}
              className={`relative p-8 rounded-3xl border transition-all bg-white shadow-lg hover:shadow-2xl ${plan.color} ${
                plan.popular ? 'scale-105 border-purple-400 ring-2 ring-purple-300' : 'border-indigo-100'
              }`}
              whileHover={{ scale: 1.03 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-2 rounded-full text-sm font-bold text-white shadow-md">
                  Most Popular
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-slate-600 ml-2">{plan.period}</span>}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-700">
                    <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link href={plan.name === 'Enterprise' ? '/contact-sales' : '/auth?form=register'} passHref legacyBehavior>
                <motion.button
                  className={`w-full py-4 rounded-full font-bold transition-all shadow-md ${
                    plan.popular
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default PricingSection;
