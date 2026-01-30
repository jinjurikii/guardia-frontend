"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Camera,
  Palette,
  CalendarCheck,
  Check,
  ChevronDown,
  Zap,
  Star,
  Rocket,
  ArrowRight,
  Sparkles,
} from "lucide-react";

/* =============================================================================
   DATA
============================================================================= */

const tiers = [
  {
    id: "spark",
    name: "Spark",
    price: 79,
    priceDaily: "2.60",
    tagline: "Stop being invisible online",
    icon: Zap,
    color: "#f59e0b",
    features: [
      "12 styled posts per month",
      "2 platforms (FB + IG)",
      "AI-transformed images",
      "Captions that sound like you",
      "Optimal posting times",
    ],
    cta: "Start for $2.60/day",
    href: "/intake/spark",
  },
  {
    id: "pro",
    name: "Pro",
    price: 149,
    priceDaily: "4.97",
    tagline: "Your competitors won't know what hit them",
    icon: Star,
    color: "#3b82f6",
    popular: true,
    features: [
      "20 styled posts per month",
      "3 platforms",
      "2 videos included (worth $99)",
      "We handle comments & DMs",
      "Google Business Profile posts",
      "Review responses",
    ],
    cta: "See Your First Post in 48 Hours",
    href: "/intake/pro",
  },
  {
    id: "unleashed",
    name: "Unleashed",
    price: 299,
    priceDaily: "9.97",
    tagline: "Set it. Forget it. Dominate.",
    icon: Rocket,
    color: "#8b5cf6",
    features: [
      "30 styled posts per month",
      "Unlimited platforms",
      "8 videos per month",
      "Full GBP management (worth $200+)",
      "Monthly strategy call",
      "Same-day priority support",
    ],
    cta: "Go Unleashed",
    href: "/intake/unleashed",
  },
];

const steps = [
  {
    icon: Camera,
    title: "You snap. We transform.",
    desc: "Send us your phone photos—your shop, your food, your team. The stuff you already have.",
  },
  {
    icon: Palette,
    title: "AI magic happens",
    desc: "Your photos become scroll-stopping art. Styles your competitors can't copy because they're uniquely yours.",
  },
  {
    icon: CalendarCheck,
    title: "You show up. Every day.",
    desc: "Posts go live while you're busy running your business. Captions, hashtags, timing—all handled.",
  },
];

// Real transformations from our pipeline
const transformations = [
  {
    before: "https://api.guardiacontent.com/storage/library/unsplash_t1jlLrsMpjc.jpg",
    after: "https://api.guardiacontent.com/storage/clients/guardia00/overlay/d978095d61f74b6bb60b2161e6ae8b8d.png",
    style: "Salon",
    business: "Beauty & Wellness",
  },
  {
    before: "https://api.guardiacontent.com/storage/stock/pexels_414029.jpg",
    after: "https://api.guardiacontent.com/storage/clients/guardia00/overlay/8f4488178e3048acae5a6f04fb3359b9.png",
    style: "Fitness",
    business: "Gym & Training",
  },
  {
    before: "https://api.guardiacontent.com/storage/library/unsplash_w2oj_k8w-UM.jpg",
    after: "https://api.guardiacontent.com/storage/clients/guardia00/overlay/a067650035774f8cb51f58a9506cd1bf.png",
    style: "Cafe",
    business: "Food & Beverage",
  },
];

const stats = [
  { value: "3-5", label: "hours saved per week" },
  { value: "48", label: "hours to first post" },
  { value: "90%+", label: "posts approved first pass" },
];

const faqs = [
  {
    q: "How fast do I see results?",
    a: "Your first styled content is ready within 48 hours of signing up. Not weeks—hours. We move fast because your competitors aren't waiting.",
  },
  {
    q: "What makes this different from posting myself?",
    a: "Time and quality. You get back 3-5 hours per week, and your posts look like you hired a design agency. The AI styling creates looks that are literally impossible to replicate manually.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no commitments, no guilt trips. Cancel with one click. We keep customers by being good, not by trapping them.",
  },
  {
    q: "What if I don't like what you create?",
    a: "Pro and Unleashed include revisions—we'll remake anything that misses the mark. But honestly? Most clients approve 90%+ of posts on first pass. We dial in your brand during onboarding.",
  },
  {
    q: "Why is this so much cheaper than agencies?",
    a: "AI. We use AI to transform images and optimize content, which lets us deliver agency-quality results at a fraction of the cost. No offshore teams churning out generic content—actual AI creating unique art from YOUR photos.",
  },
];

/* =============================================================================
   COMPONENTS
============================================================================= */

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f10]/90 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#e8a060] flex items-center justify-center">
            <span className="text-black font-bold text-sm">G</span>
          </div>
          <span className="text-[#ebebeb] font-semibold tracking-tight">Guardia</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how" className="text-sm text-[#9a9a9a] hover:text-[#ebebeb] transition-colors">
            How it works
          </a>
          <a href="#styles" className="text-sm text-[#9a9a9a] hover:text-[#ebebeb] transition-colors">
            See styles
          </a>
          <a href="#pricing" className="text-sm text-[#9a9a9a] hover:text-[#ebebeb] transition-colors">
            Pricing
          </a>
          <a href="#faq" className="text-sm text-[#9a9a9a] hover:text-[#ebebeb] transition-colors">
            FAQ
          </a>
        </div>

        <a
          href="/"
          className="bg-[#e8a060] text-black text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#d4914f] transition-colors"
        >
          Talk to Gio
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="min-h-screen pt-24 pb-16 px-6 flex items-center">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-[340px,1fr] gap-12 items-center">
          {/* Gio - Wave */}
          <div className="hidden md:flex justify-center">
            <Image
              src="/images/gio/wave.png"
              alt="Gio"
              width={320}
              height={440}
              className="object-contain"
              priority
            />
          </div>

          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Anchor pricing */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6">
              <span className="text-sm text-[#9a9a9a]">
                Agencies charge <span className="line-through">$1,500+/mo</span>
              </span>
              <span className="text-sm font-medium text-[#e8a060]">You pay $79-299</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#ebebeb] mb-6 leading-[1.1]">
              Your photos.{" "}
              <span className="text-[#e8a060]">Styled. Posted. Done.</span>
            </h1>

            <p className="text-lg md:text-xl text-[#9a9a9a] mb-6 max-w-xl mx-auto lg:mx-0">
              While you run your business, we run your social media. 
              Your phone photos transformed into scroll-stopping posts. 
              Every platform. Every week.
            </p>

            <p className="text-base text-[#9a9a9a]/80 mb-10 max-w-xl mx-auto lg:mx-0 italic">
              Every day you're not posting, potential customers are finding your competitors instead.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <a
                href="/intake/pro"
                className="inline-flex items-center justify-center gap-2 bg-[#e8a060] text-black font-semibold px-8 py-4 rounded-xl hover:bg-[#d4914f] transition-colors"
              >
                See Your First Post in 48 Hours
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#styles"
                className="inline-flex items-center justify-center gap-2 border border-white/10 text-[#ebebeb] font-medium px-8 py-4 rounded-xl hover:bg-white/5 transition-colors"
              >
                See the Transformations
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-[#9a9a9a]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#e8a060]" />
                <span>First content in 48 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#e8a060]" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#e8a060]" />
                <span>From $2.60/day</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#ebebeb] mb-4">
            Three steps. Zero headaches.
          </h2>
          <p className="text-[#9a9a9a]">
            No apps to learn. No templates to fill. No hours lost to scheduling.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className="bg-[#1a1a1c] rounded-xl p-8 border border-white/5"
            >
              <div className="w-12 h-12 rounded-xl bg-[#e8a060]/10 flex items-center justify-center mb-6">
                <step.icon className="w-6 h-6 text-[#e8a060]" />
              </div>
              <div className="text-sm text-[#e8a060] font-medium mb-2">Step {i + 1}</div>
              <h3 className="text-xl font-semibold text-[#ebebeb] mb-3">
                {step.title}
              </h3>
              <p className="text-[#9a9a9a] leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StyleShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="styles" className="py-24 px-6 bg-[#0a0a0b]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-[#e8a060]/10 border border-[#e8a060]/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-[#e8a060]" />
            <span className="text-sm font-medium text-[#e8a060]">Real transformations from our pipeline</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#ebebeb] mb-4">
            See what we actually create
          </h2>
          <p className="text-[#9a9a9a] max-w-2xl mx-auto">
            These aren't mockups. These are real posts we've styled and published for businesses like yours.
          </p>
        </div>

        {/* Main showcase */}
        <div className="mt-12">
          {/* Active transformation - large */}
          <div className="bg-[#1a1a1c] rounded-2xl p-6 md:p-8 border border-white/5 mb-6">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Before */}
              <div className="relative">
                <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  Your photo
                </div>
                <div className="aspect-square rounded-xl overflow-hidden bg-[#252527]">
                  <img
                    src={transformations[activeIndex].before}
                    alt="Before"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* After */}
              <div className="relative">
                <div className="absolute top-3 left-3 z-10 bg-[#e8a060] text-black text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  Guardia styled
                </div>
                <div className="aspect-square rounded-xl overflow-hidden bg-[#252527] ring-2 ring-[#e8a060]/30">
                  <img
                    src={transformations[activeIndex].after}
                    alt="After"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Style info */}
            <div className="mt-6 flex items-center justify-between">
              <div>
                <div className="text-sm text-[#9a9a9a]">Style applied</div>
                <div className="text-[#ebebeb] font-medium">{transformations[activeIndex].style}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-[#9a9a9a]">Perfect for</div>
                <div className="text-[#ebebeb] font-medium">{transformations[activeIndex].business}</div>
              </div>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {transformations.map((t, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`relative aspect-square rounded-xl overflow-hidden transition-all ${
                  activeIndex === i
                    ? "ring-2 ring-[#e8a060] ring-offset-2 ring-offset-[#0a0a0b]"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={t.after}
                  alt={t.style}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2 text-left">
                  <div className="text-white text-xs font-medium">{t.style}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-[#9a9a9a] mb-4">
            We have styles for every industry. During onboarding, we'll find the perfect one for your brand.
          </p>
          <a
            href="/intake/pro"
            className="inline-flex items-center gap-2 text-[#e8a060] hover:text-[#d4914f] font-medium transition-colors"
          >
            Get your style in 48 hours
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#e8a060] mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-[#9a9a9a]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#ebebeb] mb-4">
            Pick your pace. See results this week.
          </h2>
          <p className="text-[#9a9a9a] mb-4">
            No contracts. Cancel anytime. First content in 48 hours.
          </p>
          <p className="text-sm text-[#9a9a9a]/70">
            Traditional agencies charge $1,500-5,000/month. Freelancers charge $50/hour.
            <br />
            <span className="text-[#e8a060]">You get agency results for less than the cost of lunch.</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr,2fr] gap-12 items-start mt-12">
          {/* Gio - Pointing */}
          <div className="hidden md:flex justify-center sticky top-32">
            <Image
              src="/images/gio/pointing.png"
              alt="Gio presenting options"
              width={280}
              height={380}
              className="object-contain"
            />
          </div>

          {/* Tier Cards */}
          <div className="space-y-6">
            {/* Pro - THE TARGET */}
            <div className="relative bg-[#1a1a1c] rounded-2xl p-8 border-2 border-[#3b82f6]/40">
              <div className="absolute -top-3 left-6">
                <span className="text-xs font-bold px-4 py-1.5 rounded-full bg-[#3b82f6] text-white uppercase tracking-wide">
                  Most Popular — Best Value
                </span>
              </div>

              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#3b82f6]/20">
                      <Star className="w-5 h-5 text-[#3b82f6]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#ebebeb]">Pro</h3>
                  </div>
                  <p className="text-[#9a9a9a]">Your competitors won't know what hit them</p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[#ebebeb]">$149</span>
                    <span className="text-[#9a9a9a]">/mo</span>
                  </div>
                  <div className="text-sm text-[#3b82f6]">Just $4.97/day</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {tiers[1].features.map((feature, j) => (
                  <div key={j} className="flex items-start gap-3">
                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#3b82f6]" />
                    <span className="text-[#ebebeb]">{feature}</span>
                  </div>
                ))}
              </div>

              <a
                href="/intake/pro"
                className="block w-full text-center font-semibold py-4 rounded-xl bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-colors text-lg"
              >
                See Your First Post in 48 Hours →
              </a>
            </div>

            {/* Spark and Unleashed */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Spark */}
              <div className="bg-[#1a1a1c] rounded-xl p-6 border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#f59e0b]/20">
                    <Zap className="w-4 h-4 text-[#f59e0b]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#ebebeb]">Spark</h3>
                </div>
                <p className="text-sm text-[#9a9a9a] mb-4">Stop being invisible online</p>

                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold text-[#ebebeb]">$79</span>
                  <span className="text-[#9a9a9a]">/mo</span>
                </div>
                <div className="text-sm text-[#f59e0b] mb-4">Just $2.60/day — less than coffee</div>

                <ul className="space-y-2 mb-6">
                  {tiers[0].features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#f59e0b]" />
                      <span className="text-[#9a9a9a]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="/intake/spark"
                  className="block w-full text-center font-medium py-3 rounded-xl border border-white/10 text-[#ebebeb] hover:bg-white/5 transition-colors"
                >
                  Start for $2.60/day
                </a>
              </div>

              {/* Unleashed */}
              <div className="bg-[#1a1a1c] rounded-xl p-6 border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#8b5cf6]/20">
                    <Rocket className="w-4 h-4 text-[#8b5cf6]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#ebebeb]">Unleashed</h3>
                </div>
                <p className="text-sm text-[#9a9a9a] mb-4">Set it. Forget it. Dominate.</p>

                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold text-[#ebebeb]">$299</span>
                  <span className="text-[#9a9a9a]">/mo</span>
                </div>
                <div className="text-sm text-[#8b5cf6] mb-4">$9.97/day — less than a freelancer hour</div>

                <ul className="space-y-2 mb-6">
                  {tiers[2].features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#8b5cf6]" />
                      <span className="text-[#9a9a9a]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="/intake/unleashed"
                  className="block w-full text-center font-medium py-3 rounded-xl border border-white/10 text-[#ebebeb] hover:bg-white/5 transition-colors"
                >
                  Go Unleashed
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-[#ebebeb] text-center mb-4">
          Questions? Answers.
        </h2>
        <p className="text-center text-[#9a9a9a] mb-12">
          Or just <a href="/" className="text-[#e8a060] hover:underline">talk to Gio</a> — he's friendly.
        </p>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-[#1a1a1c] rounded-xl border border-white/5 overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="font-medium text-[#ebebeb] pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#9a9a9a] flex-shrink-0 transition-transform duration-200 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  open === i ? "max-h-48" : "max-h-0"
                }`}
              >
                <p className="px-5 pb-5 text-[#9a9a9a] leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-[#1a1a1c] to-[#1f1f21] rounded-2xl border border-white/5 p-12 text-center">
          <div className="flex justify-center mb-8">
            <Image
              src="/images/gio/thumbs.png"
              alt="Gio ready to help"
              width={200}
              height={280}
              className="object-contain"
            />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-[#ebebeb] mb-4">
            Your competitors are posting right now.
          </h2>
          <p className="text-lg text-[#9a9a9a] mb-2 max-w-xl mx-auto">
            Every day they show up online is a day you don't.
          </p>
          <p className="text-lg text-[#ebebeb] mb-8 max-w-xl mx-auto">
            Start showing up in 48 hours.
          </p>

          <a
            href="/intake/pro"
            className="inline-flex items-center gap-2 bg-[#e8a060] text-black font-semibold px-8 py-4 rounded-xl hover:bg-[#d4914f] transition-colors text-lg"
          >
            See Your First Post in 48 Hours
            <ArrowRight className="w-5 h-5" />
          </a>

          <p className="mt-6 text-sm text-[#9a9a9a]">
            Pro plan • $149/mo • Cancel anytime • No contracts
          </p>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#e8a060] flex items-center justify-center">
            <span className="text-black font-bold text-sm">G</span>
          </div>
          <span className="text-[#ebebeb] font-semibold">Guardia</span>
        </div>

        <p className="text-sm text-[#9a9a9a]">Your photos. Styled. Posted. Done.</p>

        <div className="flex gap-6 text-sm text-[#9a9a9a]">
          <a href="/terms" className="hover:text-[#ebebeb] transition-colors">
            Terms
          </a>
          <a href="/privacy" className="hover:text-[#ebebeb] transition-colors">
            Privacy
          </a>
          <a href="mailto:hello@guardiacontent.com" className="hover:text-[#ebebeb] transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

/* =============================================================================
   PAGE
============================================================================= */

export default function StartPage() {
  return (
    <main className="min-h-screen bg-[#0f0f10]">
      <Nav />
      <Hero />
      <HowItWorks />
      <StyleShowcase />
      <Stats />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
