"use client";

import Image from "next/image";
import LobbyChat from "@/components/lobby/LobbyChat";
import { Check } from "lucide-react";

export default function LobbyPage() {
  return (
    <main className="min-h-screen bg-[#0f0f10] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#e8a060] flex items-center justify-center">
            <span className="text-black font-bold text-sm">G</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#ebebeb] font-semibold tracking-tight">Guardia</span>
            <span className="text-[#9a9a9a] text-xs">Content Intelligence</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/start"
            className="text-sm text-[#9a9a9a] hover:text-[#ebebeb] transition-colors px-4 py-2"
          >
            See Pricing
          </a>
          <a
            href="/client"
            className="text-sm text-[#ebebeb] bg-[#1a1a1c] border border-white/10 hover:bg-[#252527] transition-colors px-4 py-2 rounded-xl"
          >
            Client Portal
          </a>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex">
        {/* Left Side - Giovanni */}
        <div className="hidden md:flex flex-col w-[320px] lg:w-[400px] xl:w-[480px] flex-shrink-0 relative">
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <Image
              src="/images/gio/wave.png"
              alt="Giovanni"
              width={340}
              height={460}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Right Side - Hero + Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Hero Section */}
          <div className="px-6 py-8 md:py-10 text-center md:text-left md:pr-12">
            <div className="max-w-xl mx-auto md:mx-0">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#ebebeb] mb-4">
                Your Social Runs{" "}
                <span className="text-[#e8a060]">Itself</span>
              </h1>
              <p className="text-[#9a9a9a] text-lg md:text-xl mb-6">
                AI-powered content creation and scheduling for small businesses.
                Look incredible online — without the grind.
              </p>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 text-sm text-[#9a9a9a]">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#e8a060]" />
                  <span>No contracts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#e8a060]" />
                  <span>From $79/mo</span>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#e8a060]" />
                  <span>Set up in minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-h-0 px-6 pb-6 md:pr-12">
            <LobbyChat />
          </div>

          {/* Quick links */}
          <div className="px-6 pb-6 md:pr-12 flex flex-wrap gap-4 justify-center md:justify-start text-sm">
            <a href="/start" className="text-[#9a9a9a] hover:text-[#ebebeb] transition-colors">
              How it works →
            </a>
            <a href="/start#pricing" className="text-[#9a9a9a] hover:text-[#ebebeb] transition-colors">
              Pricing →
            </a>
            <a href="/start#faq" className="text-[#9a9a9a] hover:text-[#ebebeb] transition-colors">
              FAQ →
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
