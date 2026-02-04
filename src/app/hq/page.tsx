"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const API_BASE = "https://api.guardiacontent.com";

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

interface PortfolioData {
  positions: unknown[];
  summary: { cash: number; invested: number; unrealized_pnl: number };
}

interface CortexData {
  focus: { p: number; task: string; owner: string }[];
  pipeline: { posts: { scheduled: number; posted: number; failed: number; cancelled: number } };
  services_online: number;
  services_total: number;
}

interface ClientData {
  id: string;
  business_name: string;
  tier: string;
  status: string;
}

interface HealthData {
  services: { name: string; status: string }[];
  status: string;
}

interface AtlasNode {
  id: string;
  name: string;
  health: "green" | "amber" | "red";
  online: number;
  total: number;
}

interface AtlasData {
  factory: AtlasNode[];
  lobby: AtlasNode[];
  total_services: number;
  total_online: number;
}

interface LabData {
  outputs: number;
  pending: number;
}

interface AthernyxData {
  orphan_designs: number;
  open_threads: number;
  current_chapter: { chapter: number; chapter_title: string; pages_written: number; status: string } | null;
}
interface FlockLead {
  id: number;
  address: string;
  city: string;
  county: string;
  asking_price: number;
  units: number;
  dom: number;
  image_url: string | null;
  price_per_door: number;
  estimated_dscr: number;
  composite_score: number;
  owl_reasoning: string;
  status: string;
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
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
          <h1 className="text-[#888] font-semibold text-sm tracking-wider">GUARDIA HQ</h1>
        </div>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-[#0a0a0b] border border-[#1a1a1f] rounded-lg px-3 py-2.5 text-[#ccc] text-sm mb-3 focus:outline-none focus:border-violet-500/50" />
        <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)}
          className="w-full bg-[#0a0a0b] border border-[#1a1a1f] rounded-lg px-3 py-2.5 text-[#ccc] text-sm mb-4 focus:outline-none focus:border-violet-500/50" />
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
        <button type="submit" className="w-full bg-violet-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-violet-500">Enter</button>
      </form>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// WIDGET WRAPPER (no emoji, just colored dot)
// ══════════════════════════════════════════════════════════════════════════════

interface WidgetProps {
  title: string;
  color: string;
  href: string;
  loading?: boolean;
  error?: string;
  alert?: boolean;
  children: React.ReactNode;
}

function Widget({ title, color, href, loading, error, alert, children }: WidgetProps) {
  return (
    <Link href={href}>
      <div className="group relative bg-[#0a0a0b] border border-[#1a1a1f] rounded-xl p-5 transition-all duration-200 hover:border-[#2a2a2f] cursor-pointer min-h-[140px]">
        {alert && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: color }} />}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-xs font-medium tracking-wider uppercase" style={{ color }}>{title}</h3>
        </div>
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-[#1a1a1f] rounded animate-pulse w-1/2" />
            <div className="h-3 bg-[#1a1a1f] rounded animate-pulse w-3/4" />
          </div>
        ) : error ? (
          <div className="text-xs">
            <p className="text-red-400/60 mb-1">Error loading data</p>
            <p className="text-[#444]">{error}</p>
          </div>
        ) : children}
      </div>
    </Link>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// WIDGETS
// ══════════════════════════════════════════════════════════════════════════════

function ParadiseWidget() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetch(`${API_BASE}/hq/paradise/portfolio`)
      .then(res => res.ok ? res.json() : Promise.reject("Failed"))
      .then(setData)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const nav = data ? data.summary.cash + data.summary.invested + data.summary.unrealized_pnl : 0;
  const pnl = data?.summary.unrealized_pnl || 0;

  return (
    <Widget title="Paradise" color="#d4af37" href="/hq/paradise" loading={loading} error={error}>
      <div className="space-y-3">
        <div>
          <span className="text-[#555] text-[10px] tracking-wider">NAV</span>
          <p className="text-[#d4af37] font-mono text-lg">${nav.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-[#555]">P/L <span className={`ml-1 font-mono ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}</span></span>
          <span className="text-[#555]">Positions <span className="ml-1 text-[#888]">{data?.positions?.length || 0}</span></span>
        </div>
      </div>
    </Widget>
  );
}

function FactoryWidget() {
  const [data, setData] = useState<CortexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetch(`${API_BASE}/hq/cortex-state`)
      .then(res => res.ok ? res.json() : Promise.reject("Failed"))
      .then(setData)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const posts = data?.pipeline?.posts || { scheduled: 0, posted: 0, failed: 0 };
  const hasFailed = posts.failed > 0;

  return (
    <Widget title="Factory" color="#10b981" href="/hq/factory" loading={loading} error={error} alert={hasFailed}>
      <div className="space-y-3">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[#555] text-[10px] tracking-wider block">SCHEDULED</span>
            <p className="text-emerald-400 font-mono text-lg">{posts.scheduled}</p>
          </div>
          <div>
            <span className="text-[#555] text-[10px] tracking-wider block">POSTED</span>
            <p className="text-[#888] font-mono text-lg">{posts.posted}</p>
          </div>
          <div>
            <span className="text-[#555] text-[10px] tracking-wider block">FAILED</span>
            <p className={`font-mono text-lg ${hasFailed ? "text-red-400" : "text-[#444]"}`}>{posts.failed}</p>
          </div>
        </div>
        {hasFailed && <p className="text-red-400/80 text-xs">Attention needed</p>}
      </div>
    </Widget>
  );
}

function CortexWidget() {
  const [data, setData] = useState<CortexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetch(`${API_BASE}/hq/cortex-state`)
      .then(res => res.ok ? res.json() : Promise.reject("Failed"))
      .then(setData)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const focusCount = data?.focus?.length || 0;

  return (
    <Widget title="Cortex" color="#8b5cf6" href="/hq/cortex" loading={loading} error={error}>
      <div>
        <span className="text-[#555] text-[10px] tracking-wider">FOCUS ITEMS</span>
        <p className="text-violet-400 font-mono text-lg">{focusCount}</p>
      </div>
    </Widget>
  );
}

function ClientsWidget() {
  const [data, setData] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetch(`${API_BASE}/hq/clients`)
      .then(res => res.ok ? res.json() : Promise.reject("Failed"))
      .then(d => setData(Array.isArray(d) ? d : []))
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Widget title="Clients" color="#f59e0b" href="/clients" loading={loading} error={error}>
      <div className="space-y-2">
        <div>
          <span className="text-[#555] text-[10px] tracking-wider">ACTIVE</span>
          <p className="text-amber-400 font-mono text-lg">{data.length}</p>
        </div>
        {data[0] && <p className="text-xs text-[#666] truncate">{data[0].business_name}</p>}
      </div>
    </Widget>
  );
}

function AtlasWidget() {
  const [data, setData] = useState<AtlasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetch(`${API_BASE}/hq/services/map`)
      .then(res => res.ok ? res.json() : Promise.reject("Failed"))
      .then(setData)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const healthy = data?.total_online === data?.total_services && (data?.total_services || 0) > 0;
  const HEALTH_COLORS = { green: "bg-emerald-400", amber: "bg-amber-400", red: "bg-red-400" };

  const renderDots = (nodes: AtlasNode[]) => (
    <div className="flex items-center gap-1">
      {nodes.map(n => (
        <div key={n.id} className={`w-2 h-2 rounded-full ${HEALTH_COLORS[n.health]} ${n.health !== "green" ? "animate-pulse" : ""}`} title={n.name} />
      ))}
    </div>
  );

  return (
    <Widget title="Atlas" color="#06b6d4" href="/hq/atlas" loading={loading} error={error} alert={!healthy && !!data}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-emerald-400/60 text-[10px] tracking-wider">FACTORY</span>
          {data?.factory && renderDots(data.factory)}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-violet-400/60 text-[10px] tracking-wider">LOBBY</span>
          {data?.lobby && renderDots(data.lobby)}
        </div>
        <div className="pt-1 border-t border-[#1a1a1f] flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${healthy ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
          <span className={`text-xs font-mono ${healthy ? "text-cyan-400" : "text-amber-400"}`}>
            {data?.total_online || 0}/{data?.total_services || 0} healthy
          </span>
        </div>
      </div>
    </Widget>
  );
}

function LabWidget() {
  const [data, setData] = useState<LabData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetch(`${API_BASE}/hq/lab/status`)
      .then(res => res.ok ? res.json() : Promise.reject("Failed"))
      .then(setData)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Widget title="Lab" color="#14b8a6" href="/hq/lab" loading={loading} error={error}>
      <div className="flex items-center gap-6">
        <div>
          <span className="text-[#555] text-[10px] tracking-wider">OUTPUTS</span>
          <p className="text-teal-400 font-mono text-lg">{data?.outputs || 0}</p>
        </div>
        <div>
          <span className="text-[#555] text-[10px] tracking-wider">PENDING</span>
          <p className="text-[#888] font-mono text-lg">{data?.pending || 0}</p>
        </div>
      </div>
    </Widget>
  );
}

function AthernyxWidget() {
  const [data, setData] = useState<AthernyxData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetch(`${API_BASE}/hq/athernyx/status`)
      .then(res => res.ok ? res.json() : Promise.reject("Failed"))
      .then(setData)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const chapter = data?.current_chapter;
  const hasOrphans = (data?.orphan_designs || 0) > 0;

  return (
    <Widget title="Athernyx" color="#a855f7" href="/hq/athernyx" loading={loading} error={error} alert={hasOrphans}>
      <div className="space-y-2">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[#555] text-[10px] tracking-wider">CHAPTER</span>
            <p className="text-purple-400 font-mono text-lg">{chapter?.chapter || "-"}</p>
          </div>
          <div>
            <span className="text-[#555] text-[10px] tracking-wider">THREADS</span>
            <p className="text-[#888] font-mono text-lg">{data?.open_threads || 0}</p>
          </div>
          <div>
            <span className="text-[#555] text-[10px] tracking-wider">ORPHANS</span>
            <p className={`font-mono text-lg ${hasOrphans ? "text-amber-400" : "text-[#888]"}`}>{data?.orphan_designs || 0}</p>
          </div>
        </div>
        {chapter && <p className="text-purple-400/60 text-[10px]">{chapter.chapter_title} • {chapter.pages_written}pg</p>}
      </div>
    </Widget>
  );
}



// ══════════════════════════════════════════════════════════════════════════════
// FLOCK (Lead Pipeline)
// ══════════════════════════════════════════════════════════════════════════════

function FlockSection() {
  const [leads, setLeads] = useState<FlockLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/hq/flock/top`)
      .then(res => res.ok ? res.json() : Promise.reject("Failed"))
      .then(data => setLeads(Array.isArray(data) ? data : data.picks || data.leads || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && leads.length === 0) return null;

  return (
    <div className="mt-6">
      <Link href="/hq/flock">
        <div className="flex items-center gap-2 mb-4 group cursor-pointer">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <h3 className="text-xs font-medium tracking-wider uppercase text-blue-500">Flock</h3>
          <span className="text-[#444] text-xs ml-auto group-hover:text-[#666] transition-colors">View all \u2192</span>
        </div>
      </Link>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-[#0a0a0b] border border-[#1a1a1f] rounded-xl p-4 h-[160px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leads.map(lead => (
            <div key={lead.id} className="bg-[#0a0a0b] border border-[#1a1a1f] rounded-xl p-4 hover:border-[#2a2a2f] transition-all">
              <div className="flex items-start gap-3">
                {lead.image_url ? (
                  <img src={lead.image_url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-[#1a1a1f] flex-shrink-0 flex items-center justify-center">
                    <span className="text-[#333] text-[10px]">NO IMG</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#ccc] truncate">{lead.address}</p>
                  <p className="text-xs text-[#555]">{lead.city}, {lead.county}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs">
                <span className="text-blue-400 font-mono">${(lead.asking_price / 1000).toFixed(0)}K</span>
                <span className="text-[#666]">{lead.units} units</span>
                <span className="text-[#666]">{lead.dom}d</span>
                <span className={`ml-auto font-mono ${lead.composite_score >= 70 ? "text-emerald-400" : lead.composite_score >= 40 ? "text-amber-400" : "text-[#555]"}`}>
                  {lead.composite_score}
                </span>
              </div>
              <p className="text-[10px] text-[#555] mt-2 line-clamp-2">{lead.owl_reasoning}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════

function HQPageContent() {
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [globalHealth, setGlobalHealth] = useState<"healthy" | "degraded" | "loading">("loading");

  useEffect(() => {
    const devKey = searchParams?.get("dev");
    if (devKey === DEV_BYPASS_KEY) {
      localStorage.setItem("hq_auth", "true");
      setIsAuthenticated(true);
      return;
    }
    setIsAuthenticated(localStorage.getItem("hq_auth") === "true");
  }, [searchParams]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${API_BASE}/health`)
      .then(res => res.json())
      .then(data => {
        const online = data.services?.filter((s: {status: string}) => s.status === "online" || s.status === "healthy").length || 0;
        const total = data.services?.length || 0;
        setGlobalHealth(online === total ? "healthy" : "degraded");
      })
      .catch(() => setGlobalHealth("degraded"));
  }, [isAuthenticated]);

  if (!isAuthenticated) return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;

  return (
    <div className="min-h-screen bg-[#050506] text-[#e8e8e8]">
      <header className="border-b border-[#1a1a1f] bg-[#0a0a0b]/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
            <h1 className="text-[#888] font-semibold text-sm tracking-wider">GUARDIA HQ</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${globalHealth === "loading" ? "bg-[#444] animate-pulse" : globalHealth === "healthy" ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
            <span className="text-[#666] text-xs font-mono uppercase">{globalHealth === "loading" ? "..." : globalHealth}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ParadiseWidget />
          <FactoryWidget />
          <CortexWidget />
          <ClientsWidget />
          <AtlasWidget />
          <LabWidget />
          <AthernyxWidget />
        </div>
        <FlockSection />
      </main>
    </div>
  );
}

export default function HQPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050506]" />}>
      <HQPageContent />
    </Suspense>
  );
}
