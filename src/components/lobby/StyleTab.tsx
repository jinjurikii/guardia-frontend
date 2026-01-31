"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * GUARDIA STYLE STUDIO — Visual Identity Creator
 * 
 * Chat with Giovanni to craft your brand's aesthetic
 * Style Deck: Last 5 cards + up to 3 favorites
 */

const API_BASE = "https://api.guardiacontent.com";

interface StyleProfile {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  mood: string | null;
  art_direction: string | null;
  color_palette: string[] | null;
}

interface DeckItem {
  id: number;
  style_profile_id: number;
  style_snapshot: StyleProfile;
  is_current: number;
  is_favorite: number;
  activated_at: string;
}

interface StyleProposal {
  name: string;
  display_name: string;
  mood: string;
  description: string;
  colors: string[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface StyleTabProps {
  clientId: string;
  jwt: string;
  onStyleUpdated?: (style: StyleProfile) => void;
}

// SVG Filters
function GlowFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <filter id="amberGlowStyle" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feFlood floodColor="#f59e0b" floodOpacity="0.7" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="greenGlowStyle" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feFlood floodColor="#22c55e" floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

// Status indicator
function StatusLight({ active, color = "amber", size = 16 }: { active: boolean; color?: "amber" | "green"; size?: number }) {
  const colors = {
    amber: { fill: '#fbbf24', filter: 'url(#amberGlowStyle)' },
    green: { fill: '#22c55e', filter: 'url(#greenGlowStyle)' },
  };
  const c = colors[color];
  
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="none" stroke="#444" strokeWidth="2" />
      <circle cx="12" cy="12" r="7" fill="#050505" />
      {active && (
        <g style={{ filter: c.filter }}>
          <circle cx="12" cy="12" r="5" fill={c.fill} opacity="0.8" />
          <circle cx="12" cy="12" r="2" fill={c.fill} />
        </g>
      )}
    </svg>
  );
}

// Heart icon for favorites
function HeartIcon({ filled, size = 16 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "none"} stroke={filled ? "#f59e0b" : "#555"} strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// Compact Style Card for deck
function StyleCard({ 
  item, 
  onActivate, 
  onToggleFavorite,
  isActivating 
}: { 
  item: DeckItem; 
  onActivate: () => void; 
  onToggleFavorite: () => void;
  isActivating: boolean;
}) {
  const style = item.style_snapshot;
  const isCurrent = item.is_current === 1;
  const isFavorite = item.is_favorite === 1;
  
  return (
    <div 
      className={`rounded-xl p-3 transition-all ${isCurrent ? 'ring-1 ring-[#f59e0b]/50' : ''}`}
      style={{
        background: isCurrent 
          ? 'linear-gradient(145deg, #1a1814, #0f0e0c)'
          : 'linear-gradient(145deg, #111113, #0a0a0b)',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {isCurrent && <StatusLight active={true} color="green" size={12} />}
            <span className={`text-sm font-medium truncate ${isCurrent ? 'text-[#f59e0b]' : 'text-[#ccc]'}`}>
              {style.display_name || style.name}
            </span>
          </div>
          {style.mood && (
            <p className="text-xs text-[#555] mt-0.5 line-clamp-1">{style.mood}</p>
          )}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className="p-1 hover:bg-white/5 rounded transition-colors"
        >
          <HeartIcon filled={isFavorite} size={14} />
        </button>
      </div>
      
      {/* Color palette preview */}
      {style.color_palette && style.color_palette.length > 0 && (
        <div className="flex gap-1 mb-2">
          {style.color_palette.slice(0, 4).map((color, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded"
              style={{ backgroundColor: color, boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1)' }}
            />
          ))}
        </div>
      )}
      
      {/* Activate button */}
      {!isCurrent && (
        <button
          onClick={onActivate}
          disabled={isActivating}
          className="w-full py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-white/5 disabled:opacity-50"
          style={{ color: '#888', background: 'rgba(255,255,255,0.03)' }}
        >
          {isActivating ? 'Activating...' : 'Use This Style'}
        </button>
      )}
    </div>
  );
}

function parseStyleProposal(content: string): StyleProposal | null {
  const match = content.match(/\[STYLE_PROPOSAL\]([\s\S]*?)\[\/STYLE_PROPOSAL\]/);
  if (!match) return null;
  const block = match[1];
  const getValue = (key: string) => {
    const m = block.match(new RegExp(`${key}:\\s*(.+?)(?:\\n|$)`));
    return m ? m[1].trim() : "";
  };
  const name = getValue("name");
  if (!name) return null;
  const colorsStr = getValue("colors");
  const colors = colorsStr ? colorsStr.split(",").map(c => c.trim()) : [];
  return {
    name: name.toLowerCase().replace(/\s+/g, "_"),
    display_name: name,
    mood: getValue("mood"),
    description: getValue("description"),
    colors,
  };
}

function stripProposalBlock(content: string): string {
  return content.replace(/\[STYLE_PROPOSAL\][\s\S]*?\[\/STYLE_PROPOSAL\]/g, "").trim();
}

export default function StyleTab({ clientId, jwt, onStyleUpdated }: StyleTabProps) {
  const [deck, setDeck] = useState<DeckItem[]>([]);
  const [loadingDeck, setLoadingDeck] = useState(true);
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [proposal, setProposal] = useState<StyleProposal | null>(null);
  const [pendingExpanded, setPendingExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey! Let's create a visual style that captures your brand's personality. Describe the vibe you're going for — warm and cozy? Bold and modern? I'll craft something unique for you." }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [approving, setApproving] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch style deck
  const fetchDeck = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/styles/deck/${clientId}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDeck(data.deck || []);
      }
    } catch (err) {
      console.error("Failed to fetch deck:", err);
    }
    setLoadingDeck(false);
  }, [clientId, jwt]);

  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const currentStyle = deck.find(d => d.is_current === 1)?.style_snapshot || null;
  const favoriteCount = deck.filter(d => d.is_favorite === 1).length;

  const handleActivate = async (deckItemId: number) => {
    setActivatingId(deckItemId);
    try {
      const res = await fetch(`${API_BASE}/styles/deck/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ client_id: clientId, deck_item_id: deckItemId }),
      });
      if (res.ok) {
        await fetchDeck();
      }
    } catch (err) {
      console.error("Failed to activate:", err);
    }
    setActivatingId(null);
  };

  const handleToggleFavorite = async (deckItemId: number) => {
    const item = deck.find(d => d.id === deckItemId);
    if (!item) return;
    
    // Check if trying to add favorite when at max
    if (item.is_favorite === 0 && favoriteCount >= 3) {
      setMessages(prev => [...prev, { role: "assistant", content: "You can only have 3 favorite styles. Unfavorite one first!" }]);
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/styles/deck/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ client_id: clientId, deck_item_id: deckItemId }),
      });
      if (res.ok) {
        await fetchDeck();
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || sending) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/client/gio/style-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ client_id: clientId, message: userMsg, history: messages.slice(-10) }),
      });

      if (res.ok) {
        const data = await res.json();
        const response = data.response || "I'm having trouble thinking right now. Try again?";
        const parsed = parseStyleProposal(response);
        if (parsed) {
          setProposal(parsed);
          setPendingExpanded(true);
        }
        const cleanedResponse = stripProposalBlock(response);
        if (cleanedResponse) {
          setMessages(prev => [...prev, { role: "assistant", content: cleanedResponse }]);
        }
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Let's try that again." }]);
      }
    } catch (err) {
      console.error("Style chat error:", err);
      setMessages(prev => [...prev, { role: "assistant", content: "Connection issue. Give it another shot." }]);
    }
    setSending(false);
  }, [input, sending, messages, clientId, jwt]);

  const handleAccept = async () => {
    if (!proposal || approving) return;
    setApproving(true);
    try {
      const res = await fetch(`${API_BASE}/styles/approve-direct`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ client_id: clientId, style_name: proposal.display_name, style_description: proposal.description || proposal.mood }),
      });
      if (res.ok) {
        await fetchDeck(); // Refresh deck to show new style
        onStyleUpdated?.(currentStyle as StyleProfile);
        setPendingExpanded(false);
        setTimeout(() => setProposal(null), 300);
        setMessages(prev => [...prev, { role: "assistant", content: `"${proposal.display_name}" is now your active style! All your future content will carry this aesthetic. Want to refine it further or are we good?` }]);
      }
    } catch (err) {
      console.error("Failed to approve style:", err);
      setMessages(prev => [...prev, { role: "assistant", content: "Couldn't save that style. Let's try again." }]);
    }
    setApproving(false);
  };

  const handleReject = () => {
    setPendingExpanded(false);
    setTimeout(() => setProposal(null), 300);
    setMessages(prev => [...prev, { role: "assistant", content: "No problem! What would you like to change? More vibrant? Softer? Different mood entirely?" }]);
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-3 p-3 md:p-4 overflow-hidden bg-[#0c0c0d]">
      <GlowFilters />
      
      {/* LEFT COLUMN - Style Deck */}
      <div className="w-full md:w-[320px] flex flex-col gap-3 md:shrink-0 overflow-hidden">
        
        {/* Deck Header */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-medium text-[#e8e8e8]">Style Deck</h3>
          <span className="text-xs text-[#555]">
            {favoriteCount}/3 favorites
          </span>
        </div>
        
        {/* Style Cards */}
        <div 
          className="flex-1 rounded-2xl p-3 overflow-y-auto space-y-2"
          style={{
            background: 'linear-gradient(145deg, #111113, #0a0a0b)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.02), 0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          {loadingDeck ? (
            <div className="h-24 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-[#333] border-t-[#f59e0b] rounded-full animate-spin" />
            </div>
          ) : deck.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-center">
              <StatusLight active={false} size={24} />
              <p className="text-xs text-[#555] mt-2">No styles yet</p>
              <p className="text-xs text-[#444]">Chat with Gio to create one</p>
            </div>
          ) : (
            deck.map(item => (
              <StyleCard
                key={item.id}
                item={item}
                onActivate={() => handleActivate(item.id)}
                onToggleFavorite={() => handleToggleFavorite(item.id)}
                isActivating={activatingId === item.id}
              />
            ))
          )}
        </div>

        {/* Pending Proposal */}
        <div 
          className={`rounded-2xl overflow-hidden transition-all duration-300 ease-out shrink-0 ${pendingExpanded ? "max-h-64" : "h-12"}`}
          style={{
            background: 'linear-gradient(145deg, #111113, #0a0a0b)',
            boxShadow: proposal 
              ? 'inset 0 0 0 1px rgba(245,158,11,0.3), inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.3)'
              : 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.02), 0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          <div className={`h-12 px-4 flex items-center justify-between ${pendingExpanded ? "border-b border-white/5" : ""}`}>
            <div className="flex items-center gap-2">
              <StatusLight active={!!proposal} color="amber" size={16} />
              <span className={`text-xs ${proposal ? "text-[#f59e0b]" : "text-[#555]"}`}>
                {proposal ? "New Proposal" : "Waiting for proposal..."}
              </span>
            </div>
            {proposal && !pendingExpanded && (
              <button onClick={() => setPendingExpanded(true)} className="text-xs text-[#f59e0b] font-medium">
                View
              </button>
            )}
          </div>

          {pendingExpanded && proposal && (
            <div className="p-4">
              <div className="text-base text-[#f59e0b] font-medium mb-1">"{proposal.display_name}"</div>
              {proposal.mood && <p className="text-xs text-[#888] mb-2">{proposal.mood}</p>}
              {proposal.description && <p className="text-xs text-[#666] mb-3 line-clamp-2">{proposal.description}</p>}
              {proposal.colors.length > 0 && (
                <div className="flex gap-1.5 mb-3">
                  {proposal.colors.map((color, i) => (
                    <div key={i} className="w-6 h-6 rounded-lg" style={{ backgroundColor: color }} />
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  disabled={approving}
                  className="flex-1 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-30"
                  style={{ background: 'rgba(255,255,255,0.03)', color: '#888' }}
                >
                  Reject
                </button>
                <button
                  onClick={handleAccept}
                  disabled={approving}
                  className="flex-[2] py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-30"
                  style={{
                    background: 'linear-gradient(145deg, #f59e0b, #d97706)',
                    color: '#0c0c0d'
                  }}
                >
                  {approving ? "Saving..." : "Accept"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN - Chat */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        
        {/* Chat Container */}
        <div 
          className="flex-1 rounded-2xl flex flex-col overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #111113, #0a0a0b)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.02), 0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          {/* Chat header */}
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold"
              style={{ background: 'linear-gradient(145deg, #f59e0b, #d97706)', color: '#0c0c0d' }}
            >
              G
            </div>
            <div>
              <div className="text-sm text-[#e8e8e8] font-medium">Giovanni</div>
              <div className="text-xs text-[#555]">Style Studio</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm"
                  style={msg.role === "user" ? {
                    background: 'linear-gradient(145deg, #f59e0b, #d97706)',
                    color: '#0c0c0d',
                    borderBottomRightRadius: '6px'
                  } : {
                    background: 'rgba(255,255,255,0.03)',
                    color: '#e8e8e8',
                    borderBottomLeftRadius: '6px'
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#555] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-[#555] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-[#555] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/5">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Describe your ideal style..."
                className="flex-1 px-4 py-2.5 rounded-xl text-sm text-[#e8e8e8] placeholder-[#444] focus:outline-none transition-all"
                style={{
                  background: '#0a0a0a',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.03)',
                  border: 'none'
                }}
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="px-4 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(145deg, #f59e0b, #d97706)',
                  boxShadow: '0 2px 8px rgba(245,158,11,0.3)'
                }}
              >
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#0c0c0d" strokeWidth="2.5">
                  <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div 
          className="rounded-2xl p-4 shrink-0"
          style={{
            background: 'linear-gradient(145deg, #111113, #0a0a0b)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.02)'
          }}
        >
          <h4 className="text-[#f59e0b] text-xs font-medium mb-2">💡 Tips for Great Styles</h4>
          <ul className="text-xs text-[#666] space-y-1">
            <li>• Describe the <span className="text-[#888]">feeling</span> you want (cozy, bold, elegant)</li>
            <li>• Mention colors or palettes you love</li>
            <li>• Reference styles you admire (minimalist, vintage)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
