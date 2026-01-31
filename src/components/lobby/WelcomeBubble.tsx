"use client";

import { useState, useEffect } from "react";

const API_BASE = "https://api.guardiacontent.com";

interface WelcomeBubbleProps {
  jwt: string | null;
  onEngage: (message: string) => void;
  onOpenTablet?: (tab?: string) => void;
}

export default function WelcomeBubble({ jwt, onEngage, onOpenTablet }: WelcomeBubbleProps) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);

  useEffect(() => {
    if (!jwt || dismissed) return;

    // Wait 60 seconds before showing the bubble
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/lobby/welcome`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.message) {
            setMessage(data.message);
            setAction(data.action || null);
            setVisible(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch welcome message:", err);
      }
    }, 60000); // 60 seconds

    return () => clearTimeout(timer);
  }, [jwt, dismissed]);

  const handleDismiss = () => {
    setAnimatingOut(true);
    setTimeout(() => {
      setVisible(false);
      setDismissed(true);
    }, 300);
  };

  const handleAction = () => {
    // Handle action-specific behavior
    switch (action) {
      case "connect_facebook":
        if (onOpenTablet) onOpenTablet("account");
        break;
      case "open_gallery":
        if (onOpenTablet) onOpenTablet("gallery");
        break;
      case "open_calendar":
        if (onOpenTablet) onOpenTablet("calendar");
        break;
      case "open_planner":
        if (onOpenTablet) onOpenTablet("planner");
        break;
      default:
        // Default: send to Gio chat
        if (message) onEngage(message);
        break;
    }
    handleDismiss();
  };

  // Get button text based on action
  const getButtonText = () => {
    switch (action) {
      case "connect_facebook": return "Let's connect";
      case "open_gallery": return "Show me";
      case "open_calendar": return "Open Calendar";
      case "open_planner": return "Open Planner";
      default: return "Chat with Gio";
    }
  };

  if (!visible || !message) return null;

  return (
    <div 
      className={`fixed bottom-24 right-4 z-40 max-w-sm transition-all duration-300 ${
        animatingOut ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      }`}
    >
      {/* Bubble container */}
      <div 
        className="border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #1a1a1c, #111113)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold"
              style={{
                background: 'linear-gradient(145deg, #e8a060, #d4914f)',
                color: '#0c0c0d'
              }}
            >
              G
            </div>
            <div>
              <span className="text-[#e8e8e8] text-sm font-medium">Giovanni</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[#555] text-xs">Online</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-[#555] hover:text-[#888] transition-colors p-1"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message */}
        <div className="px-4 py-3">
          <p className="text-[#c8c8c8] text-sm leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={handleAction}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all active:scale-98"
            style={{
              background: 'linear-gradient(145deg, #e8a060, #d4914f)',
              color: '#0c0c0d',
              boxShadow: '0 2px 8px rgba(232,160,96,0.3)'
            }}
          >
            {getButtonText()}
          </button>
          <button
            onClick={handleDismiss}
            className="py-2.5 px-4 rounded-xl text-sm text-[#666] hover:text-[#888] transition-colors"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            Later
          </button>
        </div>
      </div>

      {/* Decorative tail */}
      <div 
        className="absolute -bottom-2 right-8 w-4 h-4 border-r border-b border-white/10 transform rotate-45"
        style={{ background: '#111113' }}
      />
    </div>
  );
}
