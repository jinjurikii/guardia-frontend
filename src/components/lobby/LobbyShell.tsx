"use client";

import { useState, useEffect, useCallback } from "react";
import GioMode from "./GioMode";
import TabletMode from "./TabletMode";
import WelcomeBubble from "./WelcomeBubble";

// ============================================
// TYPES
// ============================================
export interface ClientContext {
  id: string;
  business_name: string;
  contact_name: string;
  tier: "spark" | "pro" | "unleashed";
  preferred_style?: string;
  industry?: string;
  pending_uploads: number;
  styled_ready: number;
  scheduled_posts: number;
  posted_this_month: number;
  last_post?: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  tool?: string | null;
}

type AuthState = "loading" | "setup" | "login" | "authenticated";
export type LobbyMode = "gio" | "tablet";
export type TabletTab = "calendar" | "gallery" | "account";

const API_BASE = "https://api.guardiacontent.com";

// ============================================
// TIER COLORS
// ============================================
export const tierColors = {
  spark: { bg: "bg-amber-500/20", text: "text-amber-300", accent: "amber-500" },
  pro: { bg: "bg-blue-500/20", text: "text-blue-300", accent: "blue-500" },
  unleashed: { bg: "bg-purple-500/20", text: "text-purple-300", accent: "purple-500" },
};

// ============================================
// MAIN SHELL
// ============================================
export default function LobbyShell() {
  // Auth state
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [setupToken, setSetupToken] = useState<string | null>(null);
  const [setupData, setSetupData] = useState<{ business_name: string; contact_name: string } | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [client, setClient] = useState<ClientContext | null>(null);

  // Mode state
  const [mode, setMode] = useState<LobbyMode>("gio");
  const [activeTab, setActiveTab] = useState<TabletTab>("calendar");

  // Chat state (shared so it persists across mode switches)
  const [messages, setMessages] = useState<Message[]>([]);

  // ============================================
  // AUTH INITIALIZATION
  // ============================================
  useEffect(() => {
    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("setup");

      if (token) {
        try {
          const res = await fetch(`${API_BASE}/client/check-setup/${token}`);
          if (res.ok) {
            const data = await res.json();
            if (data.valid) {
              setSetupToken(token);
              setSetupData({ business_name: data.business_name, contact_name: data.contact_name });
              setAuthState("setup");
              return;
            }
          }
          setAuthState("login");
        } catch {
          setAuthState("login");
        }
        return;
      }

      const storedJwt = localStorage.getItem("guardia_jwt");
      if (storedJwt) {
        try {
          const res = await fetch(`${API_BASE}/client/me`, {
            headers: { Authorization: `Bearer ${storedJwt}` },
          });
          if (res.ok) {
            const data = await res.json();
            setJwt(storedJwt);
            setClient(data);
            setAuthState("authenticated");
            await loadContext(storedJwt);
            return;
          }
        } catch {
          // Token invalid
        }
        localStorage.removeItem("guardia_jwt");
      }

      setAuthState("login");
    };

    init();
  }, []);

  // ============================================
  // CONTEXT & GREETING
  // ============================================
  const loadContext = useCallback(async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/client/context`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClient(data);
        const greeting = getGreeting(data);
        setMessages([{ role: "assistant", content: greeting }]);
      }
    } catch {
      console.error("Failed to load context");
    }
  }, []);

  const getGreeting = (ctx: ClientContext) => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const name = ctx.contact_name || "there";

    let status = "";
    if (ctx.scheduled_posts > 0) {
      status = ` You have ${ctx.scheduled_posts} post${ctx.scheduled_posts > 1 ? "s" : ""} scheduled.`;
    }
    if (ctx.pending_uploads > 0) {
      status += ` ${ctx.pending_uploads} image${ctx.pending_uploads > 1 ? "s" : ""} awaiting styling.`;
    }

    return `${timeGreeting}, ${name}! Welcome back.${status} How can I help you today?`;
  };

  // ============================================
  // AUTH HANDLERS
  // ============================================
  const handleAuthSuccess = useCallback(async (token: string, clientData: ClientContext, isSetup: boolean) => {
    localStorage.setItem("guardia_jwt", token);
    setJwt(token);
    setClient(clientData);
    setAuthState("authenticated");

    if (isSetup) {
      setMessages([{
        role: "assistant",
        content: `Welcome to Guardia, ${clientData.contact_name || "there"}! I'm Giovanni, your dedicated concierge. Let's start by picking a visual style for your content. Tap the tablet icon above to explore your options.`,
      }]);
      window.history.replaceState({}, "", "/client");
    } else {
      await loadContext(token);
    }
  }, [loadContext]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("guardia_jwt");
    setJwt(null);
    setClient(null);
    setMessages([]);
    setMode("gio");
    setAuthState("login");
  }, []);

  // ============================================
  // RENDER: LOADING
  // ============================================
  if (authState === "loading") {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
  
      {/* Welcome Bubble - appears 60s after auth */}
      <WelcomeBubble
        jwt={jwt}
        onEngage={(msg) => {
          setMessages((m) => [...m, { role: "assistant", content: msg }]);
          setMode("gio");
        }}
      />
    </main>
    );
  }

  // ============================================
  // RENDER: SETUP / LOGIN (will add these screens back)
  // ============================================
  if (authState === "setup" || authState === "login") {
    return (
      <AuthScreen
        mode={authState}
        setupToken={setupToken}
        setupData={setupData}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  // ============================================
  // RENDER: AUTHENTICATED — GIO + TABLET MODES
  // ============================================
  return (
    <main className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-[120px]" />
      </div>

      {/* Noise overlay */}
      <div className="fixed inset-0 opacity-[0.035] pointer-events-none z-50" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Gio Mode (base layer, always rendered for depth) */}
      <div className={`relative z-10 ${mode === "tablet" ? "pointer-events-none" : ""}`}>
        <GioMode
          client={client}
          jwt={jwt}
          messages={messages}
          setMessages={setMessages}
          onOpenTablet={() => setMode("tablet")}
          onLogout={handleLogout}
          isBackground={mode === "tablet"}
        />
      </div>

      {/* Tablet Mode (overlay) */}
      {mode === "tablet" && (
        <TabletMode
          client={client}
          jwt={jwt}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={() => setMode("gio")}
          onMessage={(msg) => {
            setMessages((m) => [...m, { role: "assistant", content: msg }]);
            setMode("gio");
          }}
        />
      )}
    </main>
  );
}

// ============================================
// AUTH SCREEN (simplified placeholder)
// ============================================
interface AuthScreenProps {
  mode: "setup" | "login";
  setupToken: string | null;
  setupData: { business_name: string; contact_name: string } | null;
  onSuccess: (token: string, client: ClientContext, isSetup: boolean) => void;
}

function AuthScreen({ mode, setupToken, setupData, onSuccess }: AuthScreenProps) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || pin.length !== 4) {
      setError(mode === "setup" ? "Please enter a username and 4-digit PIN." : "Please enter your username and PIN.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint = mode === "setup" ? "/client/setup" : "/client/login";
      const body = mode === "setup"
        ? { token: setupToken, username: username.toLowerCase().trim(), pin }
        : { username: username.toLowerCase().trim(), pin };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onSuccess(data.token, data.client, mode === "setup");
      } else {
        setError(data.detail || (mode === "setup" ? "Setup failed." : "Invalid username or PIN."));
      }
    } catch {
      setError("Connection error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="fixed inset-0 opacity-[0.035] pointer-events-none z-50" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
              <span className="text-xl font-semibold text-white">Guardia</span>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            {/* Giovanni avatar */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
                G
              </div>
              <div>
                <div className="text-white font-medium">Giovanni</div>
                <div className="text-white/50 text-sm">Your Concierge</div>
              </div>
            </div>

            {/* Message */}
            <div className="bg-white/[0.03] rounded-xl p-4 mb-6">
              {mode === "setup" ? (
                <>
                  <p className="text-white/90">
                    Welcome to Guardia, {setupData?.contact_name || "there"}! I'm Giovanni, your dedicated concierge for{" "}
                    <span className="text-blue-400 font-medium">{setupData?.business_name}</span>.
                  </p>
                  <p className="text-white/60 text-sm mt-2">
                    Let's set up your login credentials. Choose a username and 4-digit PIN.
                  </p>
                </>
              ) : (
                <p className="text-white/90">Welcome back! Enter your username and PIN to continue.</p>
              )}
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-white/60 text-sm mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))}
                  placeholder={mode === "setup" ? "e.g. sunnybakery" : "Your username"}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-white/60 text-sm mb-2">{mode === "setup" ? "4-Digit PIN" : "PIN"}</label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="••••"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-center tracking-[0.5em] text-xl"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !username.trim() || pin.length !== 4}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === "setup" ? "Setting up..." : "Signing in..."}
                  </>
                ) : (
                  mode === "setup" ? "Continue" : "Sign In"
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-white/40 text-sm mt-6">
            Need help? Contact{" "}
            <a href="mailto:support@guardiacontent.com" className="text-blue-400 hover:underline">
              support@guardiacontent.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
