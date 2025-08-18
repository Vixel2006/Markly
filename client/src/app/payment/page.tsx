"use client";
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '../../lib/stripe';
import { CheckoutForm } from './checkout-form';

interface PaymentIntentResponse {
  clientSecret: string;
}

export default async function PaymentPage() {
  let clientSecret: string | null = null;
  let errorMessage: string | null = null;

  try {
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8080';

    const res = await fetch(`${backendUrl}/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 2000, currency: 'usd' }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `Failed to create PaymentIntent: ${res.status}`);
    }

    const data: PaymentIntentResponse = await res.json();
    clientSecret = data.clientSecret;
    
  } catch (error: any) {
    console.error('Error creating PaymentIntent:', error);
    errorMessage = error.message || 'Could not initiate payment. Please try again later.';
  }

  if (!clientSecret) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-6">
        <div className="text-center p-8 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Payment Error</h2>
          <p className="text-lg text-red-400 mb-6">{errorMessage}</p>
          <p className="text-slate-300">Please contact support or try again.</p>
        </div>
      </section>
    );
  }

  const appearance = {
    theme: 'night',
    variables: {
      colorPrimary: '#8B5CF6',
      colorBackground: '#1E293B',
      colorText: '#E2E8F0',
      colorDanger: '#EF4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        backgroundColor: '#334155',
        borderColor: '#475569',
        color: '#E2E8F0',
        boxShadow: 'none',
      },
      '.Input--invalid': {
        borderColor: '#EF4444',
      },
      '.Label': {
        color: '#94A3B8',
      },
      '.Tab': {
        backgroundColor: '#334155',
        color: '#CBD5E1',
        borderColor: '#475569',
      },
      '.Tab--selected': {
        backgroundColor: '#2563EB',
        color: '#FFFFFF',
      },
      '.TabIcon': {
        fill: '#94A3B8',
      },
      '.TabIcon--selected': {
        fill: '#FFFFFF',
      },
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-6">
      <div className="w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-10 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Complete Your Purchase
        </h1>
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm clientSecret={clientSecret} />
        </Elements>
      </div>
    </section>
  );
}
