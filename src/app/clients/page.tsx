"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_BASE = "https://api.guardiacontent.com";

interface Client {
  id: string;
  business_name: string;
  tier: string;
  status: string;
  pin?: string;
  created_at?: string;
  last_post?: string;
}

const TIER_COLORS: Record<string, string> = {
  unleashed: "#d4af37",
  pro: "#8b5cf6",
  spark: "#10b981",
};

function ClientCard({ client }: { client: Client }) {
  const [showPin, setShowPin] = useState(false);
  const [copied, setCopied] = useState(false);

  const tierColor = TIER_COLORS[client.tier] || "#666";
  const lobbyUrl = `https://guardiacontent.com/lobby/${client.id}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(lobbyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = lobbyUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[#0a0a0b] border border-[#1a1a1f] rounded-xl p-5 hover:border-[#2a2a2f] transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Business Name */}
          <h3 className="text-[#e8e8e8] font-semibold text-base truncate">
            {client.business_name.toUpperCase()}
          </h3>

          {/* Client ID & Tier */}
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[#555] text-xs font-mono">{client.id}</span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ color: tierColor, backgroundColor: `${tierColor}15` }}
            >
              {client.tier}
            </span>
            <span className={`text-xs ${client.status === "active" ? "text-emerald-400" : "text-[#555]"}`}>
              {client.status}
            </span>
          </div>
        </div>

        {/* Right side: PIN & Actions */}
        <div className="flex flex-col items-end gap-2">
          {/* PIN */}
          {client.pin && (
            <div className="flex items-center gap-2">
              <span className="text-[#555] text-xs">PIN:</span>
              <span className="text-[#888] font-mono text-sm tracking-wider">
                {showPin ? client.pin : "••••"}
              </span>
              <button
                onClick={() => setShowPin(!showPin)}
                className="text-[#555] hover:text-[#888] text-xs transition-colors"
              >
                {showPin ? "hide" : "show"}
              </button>
            </div>
          )}

          {/* Copy Link */}
          <button
            onClick={copyLink}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
              copied
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-[#1a1a1f] text-[#888] hover:text-[#ccc] hover:bg-[#252528]"
            }`}
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* Last Post */}
      {client.last_post && (
        <p className="text-[#444] text-xs mt-3">
          Last post: {new Date(client.last_post).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetch(`${API_BASE}/hq/clients`)
      .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch"))
      .then(data => setClients(Array.isArray(data) ? data : []))
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  // Group by tier
  const tiers = ["unleashed", "pro", "spark"];
  const grouped = tiers.map(tier => ({
    tier,
    clients: clients.filter(c => c.tier === tier)
  })).filter(g => g.clients.length > 0);

  // Add any clients with unknown tiers
  const knownTiers = new Set(tiers);
  const otherClients = clients.filter(c => !knownTiers.has(c.tier));
  if (otherClients.length > 0) {
    grouped.push({ tier: "other", clients: otherClients });
  }

  return (
    <div className="min-h-screen bg-[#050506] text-[#e8e8e8]">
      {/* Header */}
      <header className="border-b border-[#1a1a1f] bg-[#0a0a0b]/50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/hq" className="text-[#555] hover:text-[#888] text-sm transition-colors">
              ← HQ
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <h1 className="text-amber-400 font-semibold text-sm tracking-wider">CLIENTS</h1>
            </div>
          </div>
          <span className="text-[#555] text-xs font-mono">{clients.length} total</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-[#555] text-sm">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-400/60 text-sm">{error}</div>
          </div>
        ) : clients.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-[#444] text-sm">No clients yet</div>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(({ tier, clients: tierClients }) => (
              <div key={tier}>
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: TIER_COLORS[tier] || "#666" }}
                  />
                  <h2
                    className="text-xs font-semibold tracking-wider uppercase"
                    style={{ color: TIER_COLORS[tier] || "#666" }}
                  >
                    {tier}
                  </h2>
                  <span className="text-[#444] text-xs font-mono ml-2">{tierClients.length}</span>
                </div>
                <div className="space-y-3">
                  {tierClients.map(client => (
                    <ClientCard key={client.id} client={client} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
