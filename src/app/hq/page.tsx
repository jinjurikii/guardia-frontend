"use client";

import { Suspense } from "react";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Widget from "@/components/hq/Widget";

const API_BASE = "https://api.guardiacontent.com";

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

interface PortfolioData {
  positions: unknown[];
  summary: {
    cash: number;
    invested: number;
    unrealized_pnl: number;
  };
}

interface CortexData {
  focus: { p: number; task: string; owner: string }[];
  pipeline: { scheduled: number; posted: number; failed: number; draft: number };
  services_online: number;
  services_total: number;
  signals?: { type: string; content: string }[];
}

interface ClientData {
  id: number;
  business_name: string;
  updated_at?: string;
}

interface HealthData {
  services: { name: string; status: string }[];
  status: string;
}

interface LabData {
  outputs: number;
  pending: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════

const HQ_CREDENTIALS = { username: "jinjurikii", pin: "1991" };
const DEV_BYPASS_KEY = "serb";

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === HQ_CREDENTIALS.username && pin === HQ_CREDENTIALS.pin) {
      localStorage.setItem("hq_auth", "true");
      onLogin();
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-[#0d0d0e] border border-[#1a1a1f] rounded-xl p-6 sm:p-8 w-full max-w-[320px]">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🌙</span>
          <h1 className="text-[#888] font-semibold text-sm tracking-wider">GUARDIA HQ</h1>
        </div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-[#0a0a0b] border border-[#1a1a1f] rounded-lg px-3 py-2.5 text-[#ccc] text-sm mb-3 focus:outline-none focus:border-violet-500/50 transition-colors"
        />
        <input
          type="password"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full bg-[#0a0a0b] border border-[#1a1a1f] rounded-lg px-3 py-2.5 text-[#ccc] text-sm mb-4 focus:outline-none focus:border-violet-500/50 transition-colors"
        />
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
        <button type="submit" className="w-full bg-violet-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-violet-500 transition-colors">
          Enter
        </button>
      </form>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// WIDGET COMPONENTS - Each fetches its own data
// ══════════════════════════════════════════════════════════════════════════════

function ParadiseWidget() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/hq/paradise/portfolio`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const nav = data ? data.summary.cash + data.summary.invested + data.summary.unrealized_pnl : 0;
  const pnl = data?.summary.unrealized_pnl || 0;
  const positionCount = data?.positions?.length || 0;

  return (
    <Widget
      title="Paradise"
      icon="🏆"
      accentColor="#d4af37"
      href="/hq/paradise"
      loading={loading}
      error={error}
    >
      <div className="space-y-3">
        <div>
          <span className="text-[#6b6555] text-[10px] tracking-wider">NAV</span>
          <p className="text-[#d4af37] font-mono text-lg">
            ${nav.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-[#555]">P/L</span>
            <span className={`ml-2 font-mono ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {pnl >= 0 ? "+" : ""}{pnl.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-[#555]">Positions</span>
            <span className="ml-2 text-[#888]">{positionCount}</span>
          </div>
        </div>
      </div>
    </Widget>
  );
}

function PipelineWidget() {
  const [data, setData] = useState<CortexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/hq/cortex-state`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const pipeline = data?.pipeline || { scheduled: 0, posted: 0, failed: 0 };
  const hasFailed = pipeline.failed > 0;

  return (
    <Widget
      title="Pipeline"
      icon="📊"
      accentColor="#10b981"
      href="/hq/cortex-state"
      loading={loading}
      error={error}
      alert={hasFailed}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-[#555] text-xs">Scheduled</span>
            <p className="text-emerald-400 font-mono">{pipeline.scheduled}</p>
          </div>
          <div>
            <span className="text-[#555] text-xs">Posted</span>
            <p className="text-[#888] font-mono">{pipeline.posted}</p>
          </div>
          <div>
            <span className="text-[#555] text-xs">Failed</span>
            <p className={`font-mono ${hasFailed ? "text-red-400" : "text-[#444]"}`}>
              {pipeline.failed}
            </p>
          </div>
        </div>
        {hasFailed && (
          <p className="text-red-400/80 text-xs">⚠ {pipeline.failed} failed post{pipeline.failed > 1 ? "s" : ""}</p>
        )}
      </div>
    </Widget>
  );
}

function CortexWidget() {
  const [data, setData] = useState<CortexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/hq/cortex-state`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    // Stagger from Pipeline widget by 5s
    const timeout = setTimeout(() => {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  const focusCount = data?.focus?.length || 0;
  const topFocus = data?.focus?.[0];
  const latestSignal = data?.signals?.[0];

  return (
    <Widget
      title="Cortex"
      icon="🧠"
      accentColor="#8b5cf6"
      href="/hq/cortex-state"
      loading={loading}
      error={error}
    >
      <div className="space-y-3">
        <div>
          <span className="text-[#555] text-xs">Focus Items</span>
          <p className="text-violet-400 font-mono">{focusCount}</p>
        </div>
        {topFocus && (
          <div className="text-xs">
            <span className={`${topFocus.p === 0 ? "text-red-400" : "text-[#555]"}`}>P{topFocus.p}</span>
            <span className="text-[#888] ml-2 line-clamp-1">{topFocus.task}</span>
          </div>
        )}
        {latestSignal && (
          <div className="text-xs text-[#666] line-clamp-1">
            <span className="text-violet-400/60">[{latestSignal.type}]</span> {latestSignal.content}
          </div>
        )}
      </div>
    </Widget>
  );
}

function ClientsWidget() {
  const [data, setData] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/clients`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(Array.isArray(json) ? json : json.clients || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    // Stagger by 10s
    const timeout = setTimeout(() => {
      fetchData();
      const interval = setInterval(fetchData, 120000); // Refresh every 2 min
      return () => clearInterval(interval);
    }, 10000);
    return () => clearTimeout(timeout);
  }, []);

  const activeCount = data.length;
  const recentClient = data.sort((a, b) =>
    new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
  )[0];

  return (
    <Widget
      title="Clients"
      icon="👥"
      accentColor="#e8a060"
      href="/clients"
      loading={loading}
      error={error}
    >
      <div className="space-y-3">
        <div>
          <span className="text-[#555] text-xs">Active Clients</span>
          <p className="text-[#e8a060] font-mono text-lg">{activeCount}</p>
        </div>
        {recentClient && (
          <div className="text-xs">
            <span className="text-[#555]">Recent:</span>
            <span className="text-[#888] ml-2 line-clamp-1">{recentClient.business_name}</span>
          </div>
        )}
      </div>
    </Widget>
  );
}

function ServicesWidget() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    // Stagger by 15s
    const timeout = setTimeout(() => {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }, 15000);
    return () => clearTimeout(timeout);
  }, []);

  const services = data?.services || [];
  const online = services.filter(s => s.status === "online" || s.status === "healthy").length;
  const total = services.length;
  const healthy = online === total && total > 0;

  return (
    <Widget
      title="Services"
      icon="⚡"
      accentColor="#00d4d4"
      href="/health"
      loading={loading}
      error={error}
      alert={!healthy && total > 0}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[#555] text-xs">Status</span>
            <p className={`font-mono text-lg ${healthy ? "text-emerald-400" : "text-amber-400"}`}>
              {online}/{total}
            </p>
          </div>
          <div className={`w-3 h-3 rounded-full ${healthy ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
        </div>
        <p className={`text-xs ${healthy ? "text-emerald-400/60" : "text-amber-400/60"}`}>
          {healthy ? "All systems operational" : `${total - online} service${total - online > 1 ? "s" : ""} degraded`}
        </p>
      </div>
    </Widget>
  );
}

function LabWidget() {
  const [data, setData] = useState<LabData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/hq/lab/status`);
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    // Stagger by 20s
    const timeout = setTimeout(() => {
      fetchData();
      const interval = setInterval(fetchData, 60000);
      return () => clearInterval(interval);
    }, 20000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Widget
      title="Lab"
      icon="🔬"
      accentColor="#14b8a6"
      href="/hq/lab"
      loading={loading}
      error={error}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[#555] text-xs">Outputs</span>
            <p className="text-teal-400 font-mono">{data?.outputs || 0}</p>
          </div>
          <div>
            <span className="text-[#555] text-xs">Pending</span>
            <p className="text-[#888] font-mono">{data?.pending || 0}</p>
          </div>
        </div>
      </div>
    </Widget>
  );
}

function AtheryxWidget() {
  // Placeholder - endpoint TBD (MCP: athernyx_awareness or new endpoint)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate load for now
    const timeout = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Widget
      title="Athernyx"
      icon="✨"
      accentColor="#a855f7"
      href="/hq/lab"
      loading={loading}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[#555] text-xs">Chapters</span>
            <p className="text-purple-400 font-mono">1/3</p>
          </div>
          <div>
            <span className="text-[#555] text-xs">Threads</span>
            <p className="text-[#888] font-mono">4</p>
          </div>
          <div>
            <span className="text-[#555] text-xs">Orphans</span>
            <p className="text-[#888] font-mono">2</p>
          </div>
        </div>
        <p className="text-purple-400/40 text-[10px]">Chapter 1: The Awakening</p>
      </div>
    </Widget>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════

function HQPageContent() {
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [globalHealth, setGlobalHealth] = useState<"healthy" | "degraded" | "loading">("loading");

  // Check auth - supports ?dev=serb bypass for Serberus
  useEffect(() => {
    const devKey = searchParams?.get("dev");
    if (devKey === DEV_BYPASS_KEY) {
      localStorage.setItem("hq_auth", "true");
      setIsAuthenticated(true);
      return;
    }
    setIsAuthenticated(localStorage.getItem("hq_auth") === "true");
  }, [searchParams]);

  // Global health indicator
  useEffect(() => {
    if (!isAuthenticated) return;
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`);
        if (res.ok) {
          const data = await res.json();
          const online = data.services?.filter((s: {status: string}) =>
            s.status === "online" || s.status === "healthy"
          ).length || 0;
          const total = data.services?.length || 0;
          setGlobalHealth(online === total ? "healthy" : "degraded");
        }
      } catch {
        setGlobalHealth("degraded");
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#050506] text-[#e8e8e8]">
      {/* Header */}
      <header className="border-b border-[#1a1a1f] bg-[#0a0a0b] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌙</span>
            <h1 className="text-[#888] font-semibold text-sm tracking-wider">GUARDIA HQ</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full transition-colors ${
              globalHealth === "loading" ? "bg-[#444] animate-pulse" :
              globalHealth === "healthy" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
            }`} />
            <span className="text-[#666] text-xs font-mono uppercase">
              {globalHealth === "loading" ? "..." : globalHealth}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Widget Grid - 7 widgets matching spec */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ParadiseWidget />
          <PipelineWidget />
          <CortexWidget />
          <ClientsWidget />
          <ServicesWidget />
          <LabWidget />
          <AtheryxWidget />
        </div>
      </main>
    </div>
  );
}

// Wrapper with Suspense for useSearchParams
export default function HQPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050506]" />}>
      <HQPageContent />
    </Suspense>
  );
}
