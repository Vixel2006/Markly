'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CheckoutForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/lemonsqueezy/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID, // Ensure this is accessible client-side
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      if (data.data && data.data.attributes && data.data.attributes.url) {
        router.push(data.data.attributes.url);
      } else {
        throw new Error('Invalid checkout response from Lemon Squeezy');
      }
    } catch (error: any) {
      console.error('[LEMONSQUEEZY_CHECKOUT_ERROR]', error);
      setMessage(error.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="p-8 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl max-w-lg mx-auto">
      <div className="mb-4 text-center text-white text-lg">
        Click below to proceed to secure checkout.
      </div>
      
      <button
        disabled={isLoading}
        id="submit"
        className="mt-8 w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <span id="button-text">
          {isLoading ? "Redirecting..." : "Proceed to Checkout"}
        </span>
      </button>

      {message && <div id="payment-message" className="text-red-400 text-center mt-4">{message}</div>}
    </form>
  );
}
