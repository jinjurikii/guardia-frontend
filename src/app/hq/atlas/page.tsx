"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_BASE = "https://api.guardiacontent.com";

interface Service {
  name: string;
  status: string;
  cpu: number;
  memory: number;
  restarts: number;
}

interface Node {
  id: string;
  name: string;
  role: string;
  services: Service[];
  connects_to: string[];
  health: "green" | "amber" | "red";
  online: number;
  total: number;
}

interface MapData {
  factory: Node[];
  lobby: Node[];
  total_services: number;
  total_online: number;
}

const HEALTH_COLORS = {
  green: { bg: "bg-emerald-500", text: "text-emerald-400", glow: "shadow-emerald-500/30" },
  amber: { bg: "bg-amber-500", text: "text-amber-400", glow: "shadow-amber-500/30" },
  red: { bg: "bg-red-500", text: "text-red-400", glow: "shadow-red-500/30" },
};

function ServiceRow({ service }: { service: Service }) {
  const isOnline = service.status === "online";
  return (
    <div className="flex items-center justify-between py-1.5 px-3 bg-[#0a0a0a] rounded">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-red-400"}`} />
        <span className="text-[#888] text-xs font-mono">{service.name}</span>
      </div>
      <div className="flex items-center gap-3 text-[10px] text-[#555]">
        <span>{service.cpu}%</span>
        <span>{service.memory}MB</span>
        {service.restarts > 0 && <span className="text-amber-400">R{service.restarts}</span>}
      </div>
    </div>
  );
}

function NodeCard({ node, expanded, onToggle, position }: {
  node: Node;
  expanded: boolean;
  onToggle: () => void;
  position: { x: number; y: number };
}) {
  const colors = HEALTH_COLORS[node.health];

  return (
    <div
      className="absolute transition-all duration-300"
      style={{ left: `${position.x}%`, top: `${position.y}%`, transform: "translate(-50%, -50%)" }}
    >
      <div
        onClick={onToggle}
        className={`bg-[#0d0d0e] border border-[#1a1a1f] rounded-xl p-4 cursor-pointer transition-all hover:border-[#2a2a2f] ${
          expanded ? `shadow-lg ${colors.glow}` : ""
        }`}
        style={{ minWidth: expanded ? "240px" : "160px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${colors.bg} ${node.health !== "green" ? "animate-pulse" : ""}`} />
            <span className={`font-semibold text-sm ${colors.text}`}>{node.name}</span>
          </div>
          <span className="text-[#444] text-[10px] font-mono">{node.online}/{node.total}</span>
        </div>

        {/* Role */}
        <p className="text-[#555] text-[10px] mb-2">{node.role}</p>

        {/* Expanded Services */}
        {expanded && (
          <div className="space-y-1 mt-3 pt-3 border-t border-[#1a1a1f]">
            {node.services.map(svc => (
              <ServiceRow key={svc.name} service={svc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ConnectionLine({ from, to, nodes }: { from: string; to: string; nodes: Node[] }) {
  const fromNode = nodes.find(n => n.id === from);
  const toNode = nodes.find(n => n.id === to);
  if (!fromNode || !toNode) return null;

  // Get positions (will be calculated based on view)
  const positions = getNodePositions(nodes);
  const fromPos = positions[from];
  const toPos = positions[to];
  if (!fromPos || !toPos) return null;

  return (
    <line
      x1={`${fromPos.x}%`}
      y1={`${fromPos.y}%`}
      x2={`${toPos.x}%`}
      y2={`${toPos.y}%`}
      stroke="#1a1a1f"
      strokeWidth="2"
      strokeDasharray="4 4"
    />
  );
}

function getNodePositions(nodes: Node[]): Record<string, { x: number; y: number }> {
  // Factory: linear flow left to right
  if (nodes.some(n => n.id === "minerva")) {
    return {
      minerva: { x: 15, y: 50 },
      mercury: { x: 32, y: 50 },
      argus: { x: 50, y: 50 },
      artemis: { x: 68, y: 50 },
      judge: { x: 85, y: 50 },
    };
  }

  // Lobby: hub and spoke
  return {
    giovanni: { x: 50, y: 35 },
    chloe: { x: 25, y: 65 },
    bruce: { x: 40, y: 75 },
    muse: { x: 60, y: 75 },
    chronos: { x: 75, y: 65 },
  };
}

function ServiceMap({ nodes, view }: { nodes: Node[]; view: "factory" | "lobby" }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const positions = getNodePositions(nodes);

  // Build connection pairs
  const connections: { from: string; to: string }[] = [];
  nodes.forEach(node => {
    node.connects_to.forEach(target => {
      connections.push({ from: node.id, to: target });
    });
  });

  return (
    <div className="relative w-full h-[500px] bg-[#050506] border border-[#1a1a1f] rounded-xl overflow-hidden">
      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {connections.map((conn, i) => {
          const fromPos = positions[conn.from];
          const toPos = positions[conn.to];
          if (!fromPos || !toPos) return null;
          return (
            <line
              key={i}
              x1={`${fromPos.x}%`}
              y1={`${fromPos.y}%`}
              x2={`${toPos.x}%`}
              y2={`${toPos.y}%`}
              stroke="#1a1a1f"
              strokeWidth="2"
              strokeDasharray="6 4"
              className="animate-dash"
            />
          );
        })}
        {/* Arrowheads */}
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#333" />
          </marker>
        </defs>
      </svg>

      {/* Flow Direction Label */}
      {view === "factory" && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[#333] text-xs">
          <span>INPUT</span>
          <svg className="w-16 h-2" viewBox="0 0 64 8">
            <path d="M0,4 L56,4 L52,0 M56,4 L52,8" stroke="#333" fill="none" strokeWidth="1" />
          </svg>
          <span>OUTPUT</span>
        </div>
      )}

      {/* Nodes */}
      {nodes.map(node => (
        <NodeCard
          key={node.id}
          node={node}
          expanded={expanded === node.id}
          onToggle={() => setExpanded(expanded === node.id ? null : node.id)}
          position={positions[node.id] || { x: 50, y: 50 }}
        />
      ))}
    </div>
  );
}

export default function AtlasPage() {
  const [data, setData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"factory" | "lobby">("factory");

  useEffect(() => {
    const fetchData = () => {
      fetch(`${API_BASE}/hq/services/map`)
        .then(res => res.json())
        .then(setData)
        .catch(() => {})
        .finally(() => setLoading(false));
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const nodes = view === "factory" ? data?.factory : data?.lobby;

  return (
    <div className="min-h-screen bg-[#050506] text-[#e8e8e8]">
      {/* Header */}
      <header className="border-b border-[#1a1a1f] bg-[#0a0a0b]/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/hq" className="text-[#555] hover:text-[#888] text-sm transition-colors">
              ← HQ
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <h1 className="text-cyan-400 font-semibold text-sm tracking-wider">SYSTEM ATLAS</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-[#0a0a0b] border border-[#1a1a1f] rounded-lg p-1">
              <button
                onClick={() => setView("factory")}
                className={`px-4 py-1.5 text-xs font-medium rounded transition-colors ${
                  view === "factory"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-[#555] hover:text-[#888]"
                }`}
              >
                FACTORY
              </button>
              <button
                onClick={() => setView("lobby")}
                className={`px-4 py-1.5 text-xs font-medium rounded transition-colors ${
                  view === "lobby"
                    ? "bg-violet-500/20 text-violet-400"
                    : "text-[#555] hover:text-[#888]"
                }`}
              >
                LOBBY
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <div className={`w-2 h-2 rounded-full ${
                data?.total_online === data?.total_services ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
              }`} />
              <span className="text-[#555]">
                <span className={data?.total_online === data?.total_services ? "text-emerald-400" : "text-amber-400"}>
                  {data?.total_online || 0}
                </span>
                /{data?.total_services || 0}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="h-[500px] bg-[#0a0a0b] border border-[#1a1a1f] rounded-xl flex items-center justify-center">
            <div className="text-[#555] text-sm">Loading service map...</div>
          </div>
        ) : nodes ? (
          <ServiceMap nodes={nodes} view={view} />
        ) : (
          <div className="h-[500px] bg-[#0a0a0b] border border-[#1a1a1f] rounded-xl flex items-center justify-center">
            <div className="text-red-400/60 text-sm">Failed to load service map</div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-8 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[#555]">All Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[#555]">Partial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[#555]">Down</span>
          </div>
          <div className="text-[#333]">|</div>
          <span className="text-[#444]">Click node to expand services</span>
        </div>
      </main>

      {/* CSS for animated dashes */}
      <style jsx global>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-dash {
          animation: dash 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
