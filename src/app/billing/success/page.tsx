"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, ArrowLeft, Mail } from "lucide-react";

export default function BillingSuccessPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-[#0f0f10] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Success Card */}
        <div className={`bg-[#1a1a1c] border border-white/5 rounded-2xl p-8 text-center transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {/* Success Icon */}
          <div className={`mx-auto w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-6 transition-all duration-500 delay-100 ${mounted ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
            <Check className="w-8 h-8 text-white" strokeWidth={3} />
          </div>

          {/* Heading */}
          <h1 className={`text-2xl font-bold text-[#ebebeb] mb-3 transition-all duration-500 delay-150 ${mounted ? "opacity-100" : "opacity-0"}`}>
            You're all set
          </h1>

          {/* Subtitle */}
          <p className={`text-[#9a9a9a] mb-8 transition-all duration-500 delay-200 ${mounted ? "opacity-100" : "opacity-0"}`}>
            Check your email — Giovanni sent you a setup link. Click it, pick your style, upload some photos, and your first posts go live this week.
          </p>

          {/* What's Next */}
          <div className={`bg-[#252527] rounded-xl p-4 mb-6 text-left transition-all duration-500 delay-250 ${mounted ? "opacity-100" : "opacity-0"}`}>
            <h3 className="text-[#ebebeb] font-medium mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#e8a060]" />
              What's next?
            </h3>
            <ol className="space-y-2 text-sm text-[#9a9a9a]">
              <li className="flex items-start gap-2">
                <span className="text-[#e8a060] font-medium">1.</span>
                <span>Check your inbox for the welcome email</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#e8a060] font-medium">2.</span>
                <span>Click setup link → create username + PIN</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#e8a060] font-medium">3.</span>
                <span>Pick your style, upload photos, watch it happen</span>
              </li>
            </ol>
          </div>

          {/* CTA */}
          <Link
            href="/client"
            className={`inline-flex items-center gap-2 bg-[#e8a060] text-black px-6 py-3 rounded-xl font-semibold hover:bg-[#d4925a] transition-all duration-500 delay-300 mb-4 ${mounted ? "opacity-100" : "opacity-0"}`}
          >
            Go to Lobby
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div className={`transition-all duration-500 delay-350 ${mounted ? "opacity-100" : "opacity-0"}`}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#9a9a9a] hover:text-[#ebebeb] transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Homepage
            </Link>
          </div>
        </div>

        {/* Support line */}
        <p className={`text-center text-[#9a9a9a]/60 text-sm mt-6 transition-all duration-500 delay-400 ${mounted ? "opacity-100" : "opacity-0"}`}>
          Questions?{" "}
          <a href="mailto:support@guardiacontent.com" className="text-[#e8a060]/70 hover:text-[#e8a060] transition-colors">
            support@guardiacontent.com
          </a>
        </p>
      </div>
    </main>
  );
}
