"use client";
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Sparkles, ArrowRight, FileText, Clock, Mail } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('order_id') ?? null;
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.guardiacontent.com'}/websites/order/${orderId}`)
        .then(res => res.json())
        .then(data => setOrder(data))
        .catch(err => console.error(err));
    }
  }, [orderId]);

  return (
    <div className="mx-auto max-w-2xl px-6 pt-32 pb-16 text-center">
      {/* Success Icon */}
      <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
        <CheckCircle className="h-10 w-10" />
      </div>

      <h1 className="mb-4 text-3xl font-bold">
        Your website is officially in motion
      </h1>

      <p className="mb-8 text-lg text-gray-400">
        {order?.business_name ? `We're building something great for ${order.business_name}.` : "We're building something great for you."}
      </p>

      {orderId && (
        <div className="mb-8 inline-block rounded-xl border border-white/10 bg-white/5 px-6 py-3">
          <span className="text-sm text-gray-400">Order ID:</span>
          <span className="ml-2 font-mono font-semibold">{orderId}</span>
        </div>
      )}

      {/* What's Next */}
      <div className="mb-12 rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl text-left">
        <h2 className="mb-6 text-xl font-semibold text-center">What happens next</h2>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20">
              <Mail className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Check your inbox</h3>
              <p className="text-sm text-gray-400">You'll receive a confirmation email with your receipt and a project questionnaire within 10 minutes.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20">
              <FileText className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Fill out the questionnaire</h3>
              <p className="text-sm text-gray-400">Tell us about your brand, share your content, and upload your logo and photos. Takes about 15 minutes.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
              <Clock className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-medium mb-1">We get to work</h3>
              <p className="text-sm text-gray-400">Once we have your materials, we'll send you a preview within a few days. Then iterate until it's perfect.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3 font-medium transition-all hover:bg-white/20"
        >
          Back to Home
        </a>
        <a
          href="/websites"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 font-medium transition-all hover:shadow-lg hover:shadow-emerald-500/25"
        >
          View Website Packages
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      {/* Support Note */}
      <p className="mt-12 text-sm text-gray-500">
        Questions? Reply to any email from us or reach out at support@guardiacontent.com
      </p>
    </div>
  );
}

export default function WebsiteSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Guardia</span>
          </a>
        </div>
      </nav>

      <Suspense fallback={
        <div className="mx-auto max-w-2xl px-6 pt-32 pb-16 text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
