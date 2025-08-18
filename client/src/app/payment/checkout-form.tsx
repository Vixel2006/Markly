'use client';

import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation'; // For redirection after payment

interface CheckoutFormProps {
  clientSecret: string;
}

export function CheckoutForm({ clientSecret }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  useEffect(() => {
    if (!stripe) {
      return;
    }

    if (!clientSecret) {
      return;
    }

    // You can retrieve the PaymentIntent to check its status if needed,
    // though confirmPayment usually handles this.
    // stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
    //   switch (paymentIntent.status) {
    //     case 'succeeded':
    //       setMessage('Payment succeeded!');
    //       break;
    //     case 'processing':
    //       setMessage('Your payment is processing.');
    //       break;
    //     case 'requires_payment_method':
    //       setMessage('Your payment was not successful, please try again.');
    //       break;
    //     default:
    //       setMessage('Something went wrong.');
    //       break;
    //   }
    // });
  }, [stripe, clientSecret]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error.type === "card_error" || error.type === "validation_error") {
      setMessage(error.message || "An error occurred with your payment details.");
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="p-8 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl max-w-lg mx-auto">
      <PaymentElement
        id="payment-element"
        options={{
          layout: 'tabs',
        }}
      />
      
      <button
        disabled={isLoading || !stripe || !elements}
        id="submit"
        className="mt-8 w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <span id="button-text">
          {isLoading ? "Processing..." : "Pay now"}
        </span>
      </button>

      {message && <div id="payment-message" className="text-red-400 text-center mt-4">{message}</div>}
    </form>
  );
}
