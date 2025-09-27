"use client";
import { CheckoutForm } from './checkout-form';

export default function PaymentPage() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-6">
      <div className="w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-10 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Complete Your Purchase
        </h1>
        <CheckoutForm />
      </div>
    </section>
  );
}
