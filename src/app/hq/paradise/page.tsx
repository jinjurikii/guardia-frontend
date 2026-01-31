"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const API_BASE = "https://api.guardiacontent.com";

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

interface Position {
  id: number;
  symbol: string;
  cat: string;
  shares: number;
  entry_price: number;
  current_price: number;
  pnl: number;
  pnl_pct: number;
}

interface PortfolioSummary {
  cash: number;
  invested: number;
  unrealized_pnl: number;
  unrealized_pct: number;
  realized_pnl: number;
}

const CAT_COLORS: Record<string, string> = {
  cheetah: '#FFD700',
  lion: '#FF8C00',
  jaguar: '#00CED1',
  tiger: '#FF6347'
};

const CAT_LABELS: Record<string, string> = {
  cheetah: 'Momentum',
  lion: 'Value',
  jaguar: 'Growth',
  tiger: 'Swing'
};

// ══════════════════════════════════════════════════════════════════════════════
// AUTH CHECK
// ══════════════════════════════════════════════════════════════════════════════

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem("hq_auth");
    setIsAuthenticated(auth === "true");
    setChecking(false);
  }, []);

  return { isAuthenticated, checking };
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

function ParadiseHeader({ summary }: { summary: PortfolioSummary }) {
  const nav = (summary.cash + summary.invested + summary.unrealized_pnl);
  const navFormatted = nav.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <header className="border-b border-[#1a1a10] bg-gradient-to-b from-[#0c0a08] to-[#080706]">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/hq" className="text-[#666] hover:text-[#888] text-sm transition-colors">
            ← HQ
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[#d4af37] font-serif text-xl tracking-wide">PARADISE</span>
            <span className="text-[#4a4535] text-xs font-mono tracking-wider">PAPER TRADING</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#6b6555] text-xs tracking-wider mr-2">NAV</span>
          <span className="text-[#d4af37] font-mono text-lg tracking-tight">${navFormatted}</span>
        </div>
      </div>
    </header>
  );
}

function AccountCard({ summary }: { summary: PortfolioSummary }) {
  const formatMoney = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-gradient-to-br from-[#0f0d0a] to-[#0a0908] border border-[#1f1c15] rounded-lg p-5">
      <div className="text-[#6b6555] text-[10px] tracking-[0.2em] mb-4 font-medium">ACCOUNT</div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[#7a7568] text-sm">Cash</span>
          <span className="text-[#c9c4b5] font-mono text-sm">${formatMoney(summary.cash)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#7a7568] text-sm">Invested</span>
          <span className="text-[#8a8578] font-mono text-sm">${formatMoney(summary.invested)}</span>
        </div>
        
        <div className="border-t border-[#1f1c15] pt-3 mt-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#7a7568] text-sm">Unrealized</span>
            <span className={`font-mono text-sm ${summary.unrealized_pnl >= 0 ? 'text-[#50c878]' : 'text-[#e74c3c]'}`}>
              {summary.unrealized_pnl >= 0 ? '+' : ''}${formatMoney(summary.unrealized_pnl)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#7a7568] text-sm">Realized</span>
            <span className={`font-mono text-sm ${summary.realized_pnl >= 0 ? 'text-[#50c878]' : 'text-[#e74c3c]'}`}>
              {summary.realized_pnl >= 0 ? '+' : ''}${formatMoney(summary.realized_pnl)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StrategyFilter({ 
  selected, 
  onSelect,
  positions 
}: { 
  selected: string | null; 
  onSelect: (cat: string | null) => void;
  positions: Position[];
}) {
  const cats = ['cheetah', 'lion', 'jaguar', 'tiger'];
  
  const getCatCount = (cat: string) => positions.filter(p => p.cat === cat).length;

  return (
    <div className="bg-gradient-to-br from-[#0f0d0a] to-[#0a0908] border border-[#1f1c15] rounded-lg p-5">
      <div className="text-[#6b6555] text-[10px] tracking-[0.2em] mb-4 font-medium">STRATEGIES</div>
      
      <div className="space-y-1">
        <button
          onClick={() => onSelect(null)}
          className={`w-full text-left px-3 py-2.5 rounded text-sm transition-all ${
            !selected 
              ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20' 
              : 'text-[#7a7568] hover:bg-[#151310] border border-transparent'
          }`}
        >
          All Positions
        </button>
        
        {cats.map(cat => {
          const count = getCatCount(cat);
          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={`w-full text-left px-3 py-2.5 rounded text-sm transition-all flex items-center justify-between ${
                selected === cat 
                  ? 'border' 
                  : 'text-[#7a7568] hover:bg-[#151310] border border-transparent'
              }`}
              style={{
                backgroundColor: selected === cat ? `${CAT_COLORS[cat]}10` : undefined,
                borderColor: selected === cat ? `${CAT_COLORS[cat]}30` : 'transparent',
                color: selected === cat ? CAT_COLORS[cat] : undefined
              }}
            >
              <div className="flex items-center gap-2">
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: CAT_COLORS[cat], opacity: selected === cat ? 1 : 0.4 }}
                />
                <span className="capitalize">{cat}</span>
              </div>
              {count > 0 && (
                <span className={`text-xs ${selected === cat ? '' : 'text-[#4a4540]'}`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PositionsTable({ positions }: { positions: Position[] }) {
  const formatMoney = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatPct = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';

  if (positions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-[#0f0d0a] to-[#0a0908] border border-[#1f1c15] rounded-lg p-8 text-center">
        <div className="text-[#4a4540] text-sm">No open positions</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#0f0d0a] to-[#0a0908] border border-[#1f1c15] rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1f1c15]">
              <th className="text-left text-[10px] tracking-[0.15em] text-[#6b6555] font-medium px-5 py-3">SYMBOL</th>
              <th className="text-left text-[10px] tracking-[0.15em] text-[#6b6555] font-medium px-5 py-3">STRATEGY</th>
              <th className="text-right text-[10px] tracking-[0.15em] text-[#6b6555] font-medium px-5 py-3">SHARES</th>
              <th className="text-right text-[10px] tracking-[0.15em] text-[#6b6555] font-medium px-5 py-3">ENTRY</th>
              <th className="text-right text-[10px] tracking-[0.15em] text-[#6b6555] font-medium px-5 py-3">CURRENT</th>
              <th className="text-right text-[10px] tracking-[0.15em] text-[#6b6555] font-medium px-5 py-3">P/L</th>
              <th className="text-right text-[10px] tracking-[0.15em] text-[#6b6555] font-medium px-5 py-3">RETURN</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos, i) => (
              <tr 
                key={pos.id} 
                className={`border-b border-[#151310] hover:bg-[#0d0b09] transition-colors ${
                  i % 2 === 0 ? 'bg-[#0c0a08]' : ''
                }`}
              >
                <td className="px-5 py-4">
                  <span className="text-[#e8e4d9] font-mono font-medium">{pos.symbol}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: CAT_COLORS[pos.cat] }}
                    />
                    <span className="text-[#7a7568] text-sm capitalize">{pos.cat}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="text-[#8a8578] font-mono text-sm">{pos.shares}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="text-[#6b6555] font-mono text-sm">${pos.entry_price.toFixed(2)}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="text-[#9a9588] font-mono text-sm">${pos.current_price.toFixed(2)}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className={`font-mono text-sm ${pos.pnl >= 0 ? 'text-[#50c878]' : 'text-[#e74c3c]'}`}>
                    {pos.pnl >= 0 ? '+' : ''}${formatMoney(Math.abs(pos.pnl))}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className={`font-mono text-sm ${pos.pnl_pct >= 0 ? 'text-[#50c878]' : 'text-[#e74c3c]'}`}>
                    {formatPct(pos.pnl_pct)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-[#1f1c15]">
        {positions.map((pos) => (
          <div key={pos.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[#e8e4d9] font-mono font-medium text-lg">{pos.symbol}</span>
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: CAT_COLORS[pos.cat] }}
                />
              </div>
              <span className={`font-mono ${pos.pnl >= 0 ? 'text-[#50c878]' : 'text-[#e74c3c]'}`}>
                {formatPct(pos.pnl_pct)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-[#4a4540] text-xs mb-1">Shares</div>
                <div className="text-[#8a8578] font-mono">{pos.shares}</div>
              </div>
              <div>
                <div className="text-[#4a4540] text-xs mb-1">Entry</div>
                <div className="text-[#6b6555] font-mono">${pos.entry_price.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[#4a4540] text-xs mb-1">P/L</div>
                <div className={`font-mono ${pos.pnl >= 0 ? 'text-[#50c878]' : 'text-[#e74c3c]'}`}>
                  {pos.pnl >= 0 ? '+' : ''}${formatMoney(Math.abs(pos.pnl))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════

export default function ParadisePage() {
  const { isAuthenticated, checking } = useAuth();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary>({
    cash: 100000, invested: 0, unrealized_pnl: 0, unrealized_pct: 0, realized_pnl: 0
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/hq/paradise/portfolio`);
      if (res.ok) {
        const data = await res.json();
        setPositions(data.positions || []);
        setSummary(data.summary || { cash: 100000, invested: 0, unrealized_pnl: 0, unrealized_pct: 0, realized_pnl: 0 });
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      const interval = setInterval(fetchData, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchData]);

  const filteredPositions = selectedCat 
    ? positions.filter(p => p.cat === selectedCat)
    : positions;

  if (checking) {
    return <div className="min-h-screen bg-[#080706]" />;
  }

  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/hq';
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-[#080706] text-[#e8e4d9]">
      {/* Ambient gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#d4af37]/[0.02] via-transparent to-[#d4af37]/[0.01] pointer-events-none" />
      
      <div className="relative">
        <ParadiseHeader summary={summary} />
        
        <main className="max-w-[1400px] mx-auto p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-[280px] flex-shrink-0 space-y-4">
              <AccountCard summary={summary} />
              <StrategyFilter 
                selected={selectedCat} 
                onSelect={setSelectedCat}
                positions={positions}
              />
            </div>
            
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[#6b6555] text-[10px] tracking-[0.2em] font-medium">
                  {selectedCat ? `${selectedCat.toUpperCase()} POSITIONS` : 'ALL POSITIONS'}
                </h2>
                <span className="text-[#4a4540] text-xs">
                  {filteredPositions.length} {filteredPositions.length === 1 ? 'position' : 'positions'}
                </span>
              </div>
              <PositionsTable positions={filteredPositions} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
