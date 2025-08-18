export default function PaymentSuccessPage() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-6">
      <div className="text-center p-8 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-4 text-green-400">Payment Successful!</h2>
        <p className="text-lg mb-6">Thank you for your purchase. Your account has been upgraded.</p>
        <a href="/" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6 py-3 rounded-lg text-lg font-semibold transition-all transform hover:scale-105">
          Go to Dashboard
        </a>
      </div>
    </section>
  );
}
