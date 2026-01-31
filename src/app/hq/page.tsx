"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

const API_BASE = "https://api.guardiacontent.com";

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

interface Message {
  id: number;
  role: "user" | "assistant";
  speaker: string | null;
  content: string;
  model: string | null;
  created_at: string;
}

interface AgentCard {
  id: string;
  name: string;
  emoji: string;
  color: string;
  tagline: string;
  domain: string;
  gradient: string;
}

interface FocusItem {
  p: number;
  task: string;
  owner: string;
}

interface Signal {
  id: number;
  type: string;
  content: string;
  from_agent: string;
  time_ago: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// AGENT CARDS CONFIG
// ══════════════════════════════════════════════════════════════════════════════

const AGENT_CARDS: AgentCard[] = [
  {
    id: "serberus",
    name: "Serberus",
    emoji: "🤖",
    color: "#f97316",
    tagline: "Backend & Frontend",
    domain: "Code, APIs, deploys, architecture",
    gradient: "from-orange-500/20 to-amber-500/10"
  },
  {
    id: "oracle",
    name: "Oracle",
    emoji: "🦉",
    color: "#eab308",
    tagline: "Trading Advisor",
    domain: "Paradise cats, forex, performance",
    gradient: "from-yellow-500/20 to-amber-500/10"
  },
  {
    id: "magii",
    name: "Magii",
    emoji: "✨",
    color: "#a855f7",
    tagline: "Creative Writer",
    domain: "Athernyx, prose, worldbuilding",
    gradient: "from-purple-500/20 to-violet-500/10"
  },
  {
    id: "quill",
    name: "Quill",
    emoji: "🪶",
    color: "#3b82f6",
    tagline: "Copywriter",
    domain: "Captions, headlines, brand voice",
    gradient: "from-blue-500/20 to-cyan-500/10"
  },
  {
    id: "gio",
    name: "Gio",
    emoji: "🤝",
    color: "#10b981",
    tagline: "Client Relations",
    domain: "Support, onboarding, comms",
    gradient: "from-emerald-500/20 to-teal-500/10"
  },
  {
    id: "celibii",
    name: "Celibii",
    emoji: "🔍",
    color: "#ec4899",
    tagline: "Research & Prompts",
    domain: "Deep research, agent profiles",
    gradient: "from-pink-500/20 to-rose-500/10"
  }
];

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════

const HQ_CREDENTIALS = { username: "jinjurikii", pin: "1991" };

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
// AGENT ROOM OVERLAY
// ══════════════════════════════════════════════════════════════════════════════

function AgentRoom({ 
  agent, 
  onClose 
}: { 
  agent: AgentCard; 
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  // Messages loaded via polling effect

  // Poll for new messages every 1.5s
  const lastMsgCountRef = useRef(0);
  
  useEffect(() => {
    const pollMessages = async () => {
      try {
        const res = await fetch(`${API_BASE}/luna/agent-room/${agent.id}/messages`);
        if (res.ok) {
          const data = await res.json();
          const newMessages = data.messages || [];
          
          // Only update if message count changed (avoids scroll reset)
          if (newMessages.length !== lastMsgCountRef.current) {
            lastMsgCountRef.current = newMessages.length;
            setMessages(newMessages);
          }
          
          // Check if there's a pending message (daemon still processing)
          const hasPending = newMessages.some((m: any) => m.status === "pending" || m.status === "processing");
          setSending(hasPending);
        }
      } catch (e) {
        console.log("Poll error:", e);
      }
    };
    
    // Initial load
    pollMessages();
    
    // Poll every 2 seconds
    const interval = setInterval(pollMessages, 2000);
    return () => clearInterval(interval);
  }, [agent.id]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    
    const message = input.trim();
    setInput("");
    setSending(true);

    try {
      // Just queue the message - daemon will process
      await fetch(`${API_BASE}/luna/agent-room/${agent.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      // Polling will pick up the response
    } catch (e) {
      console.error("Queue error:", e);
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  const endSession = () => {
    if (messages.length > 0 && !confirm("End this session? Messages will be cleared.")) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={endSession}
      />
      
      {/* Room Panel - slides in from right */}
      <div 
        className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-[#0a0a0b] border-l border-[#1a1a1f] flex flex-col animate-slide-in"
        style={{
          animation: "slideIn 0.2s ease-out"
        }}
      >
        {/* Room Header */}
        <div 
          className={`px-5 py-4 border-b border-[#1a1a1f] bg-gradient-to-r ${agent.gradient}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              
              <div>
                <h2 className="font-semibold text-lg" style={{ color: agent.color }}>
                  {agent.name}
                </h2>
                <p className="text-[#666] text-xs">{agent.tagline}</p>
              </div>
            </div>
            <button
              onClick={endSession}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1a1a1f] text-[#888] hover:text-white hover:bg-red-500/20 transition-colors"
            >
              End Session
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-sm">
                <div className="text-2xl font-bold mb-2" style={{ color: agent.color }}>{agent.name}</div>
                <p className="text-[#666] text-sm mb-2">{agent.domain}</p>
                <p className="text-[#444] text-xs">Start a conversation...</p>
              </div>
            </div>
          )}
          
          {messages.map(msg => {
            const isUser = msg.role === "user";
            
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 ${
                    isUser
                      ? "bg-violet-600/20 border border-violet-500/30"
                      : "bg-[#0d0d0e] border border-[#1a1a1f]"
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center gap-2 mb-1.5">
                      
                      <span className="text-xs font-medium" style={{ color: agent.color }}>
                        {agent.name}
                      </span>
                      {msg.model && (
                        <span className="text-[#333] text-[10px] font-mono">{msg.model}</span>
                      )}
                    </div>
                  )}
                  <div className="text-[#ccc] text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          
          {sending && (
            <div className="flex justify-start">
              <div className="bg-[#0d0d0e] border border-[#1a1a1f] rounded-xl px-4 py-3 flex items-center gap-2">
                
                <span className="text-[#666] text-sm">thinking...</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: agent.color, animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: agent.color, animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: agent.color, animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[#1a1a1f] p-4 bg-[#0a0a0b]">
          <div className="flex gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Talk to ${agent.name}...`}
              disabled={sending}
              rows={1}
              className="flex-1 bg-[#050506] border border-[#1a1a1f] rounded-xl px-4 py-3 text-[#ccc] text-sm focus:outline-none focus:border-violet-500/50 resize-none disabled:opacity-50 min-h-[48px] transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="p-3 rounded-xl text-white disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: agent.color }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div className="text-center mt-2">
            <span className="text-[#333] text-[10px]">Enter to send • Esc to close</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HIDEAWAY PANEL
// ══════════════════════════════════════════════════════════════════════════════

function HideawayPanel({
  isOpen,
  onClose,
  onSelectAgent
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectAgent: (agent: AgentCard) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel - slides up from bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-[#0a0a0b] border-t border-[#1a1a1f] rounded-t-2xl p-6 animate-slide-up"
        style={{
          animation: "slideUp 0.25s ease-out"
        }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Handle */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1 bg-[#333] rounded-full" />
          </div>
          
          <h3 className="text-[#888] font-semibold text-sm tracking-wider mb-4 text-center">
            SUMMON AGENT
          </h3>
          
          {/* Agent Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {AGENT_CARDS.map(agent => (
              <button
                key={agent.id}
                onClick={() => {
                  onSelectAgent(agent);
                  onClose();
                }}
                className={`group relative bg-gradient-to-br ${agent.gradient} border border-[#1a1a1f] rounded-xl p-4 text-left hover:border-[#333] transition-all hover:scale-105 active:scale-95`}
              >
                <div className="font-semibold text-sm" style={{ color: agent.color }}>
                  {agent.name}
                </div>
                <div className="text-[#555] text-[10px] leading-tight mt-1">
                  {agent.tagline}
                </div>
                
                {/* Glow effect on hover */}
                <div 
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    boxShadow: `0 0 30px ${agent.color}20`
                  }}
                />
              </button>
            ))}
          </div>
          
          <div className="text-center mt-4">
            <span className="text-[#333] text-xs">Click to open a focused session</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════

export default function HQPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Luna state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [awareness, setAwareness] = useState<string>("");
  
  // Hideaway & Agent Room state
  const [showHideaway, setShowHideaway] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentCard | null>(null);
  
  // Sidebar state
  const [showSidebar, setShowSidebar] = useState(false);
  const [focus, setFocus] = useState<FocusItem[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [pipeline, setPipeline] = useState({ scheduled: 0, posted: 0, failed: 0, draft: 0 });
  const [servicesOnline, setServicesOnline] = useState(0);
  const [servicesTotal, setServicesTotal] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check auth
  useEffect(() => {
    setIsAuthenticated(localStorage.getItem("hq_auth") === "true");
  }, []);

  // Load Luna messages and awareness
  useEffect(() => {
    if (!isAuthenticated) return;
    loadMessages();
    loadAwareness();
    loadCortexData();
    
    const interval = setInterval(() => {
      loadCortexData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const loadMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/luna/v2/messages?limit=50`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e) {
      console.error("Failed to load messages:", e);
    }
  };

  const loadAwareness = async () => {
    try {
      const res = await fetch(`${API_BASE}/luna/v2/awareness`);
      const data = await res.json();
      setAwareness(data.awareness || "");
    } catch (e) {
      console.error("Failed to load awareness:", e);
    }
  };

  const loadCortexData = async () => {
    try {
      const [cortexRes, signalsRes] = await Promise.all([
        fetch(`${API_BASE}/hq/cortex-state`),
        fetch(`${API_BASE}/hq/signals?limit=5`)
      ]);
      
      if (cortexRes.ok) {
        const data = await cortexRes.json();
        setFocus(data.focus || []);
        setPipeline(data.pipeline || { scheduled: 0, posted: 0, failed: 0, draft: 0 });
        setServicesOnline(data.services_online || 0);
        setServicesTotal(data.services_total || 0);
      }
      
      if (signalsRes.ok) {
        const data = await signalsRes.json();
        setSignals(data.signals || []);
      }
    } catch (e) {
      console.error("Failed to load cortex data:", e);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    
    const message = input.trim();
    setInput("");
    setSending(true);
    
    const tempMsg: Message = {
      id: Date.now(),
      role: "user",
      speaker: null,
      content: message,
      model: null,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await fetch(`${API_BASE}/luna/v2/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      
      if (data.responses) {
        for (const resp of data.responses) {
          const assistantMsg: Message = {
            id: Date.now() + Math.random(),
            role: "assistant",
            speaker: resp.speaker,
            content: resp.content,
            model: resp.model,
            created_at: new Date().toISOString()
          };
          setMessages(prev => [...prev, assistantMsg]);
        }
      }
    } catch (e) {
      console.error("Chat error:", e);
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: "assistant",
        speaker: "system",
        content: "Connection error. Please try again.",
        model: null,
        created_at: new Date().toISOString()
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  const healthy = servicesOnline === servicesTotal && servicesTotal > 0;

  return (
    <div className="h-screen bg-[#050506] text-[#e8e8e8] flex flex-col">
      {/* Minimal Header */}
      <header className="border-b border-[#1a1a1f] bg-[#0a0a0b] px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl">🌙</span>
          <span className="text-violet-400 font-medium">Luna</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Quick Nav */}
          <nav className="hidden sm:flex items-center gap-1">
            <Link 
              href="/hq/paradise" 
              className="px-2.5 py-1 text-[10px] font-medium tracking-wide text-[#d4af37] hover:bg-[#d4af37]/10 rounded transition-colors"
            >
              PARADISE
            </Link>
            <Link 
              href="/hq/lab" 
              className="px-2.5 py-1 text-[10px] font-medium tracking-wide text-[#00d4d4] hover:bg-[#00d4d4]/10 rounded transition-colors"
            >
              LAB
            </Link>
          </nav>
          
          {/* Pipeline Status */}
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-2 text-[#555]">
              <span className="text-emerald-400">{pipeline.scheduled}</span>
              <span>/</span>
              <span className="text-[#888]">{pipeline.posted}</span>
              {pipeline.failed > 0 && (
                <span className="text-red-400">/{pipeline.failed}!</span>
              )}
            </div>
            <span className={`w-2 h-2 rounded-full ${healthy ? 'bg-emerald-400' : 'bg-red-400'}`} />
          </div>

          {/* Sidebar Toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-1.5 rounded transition-colors ${
              showSidebar 
                ? "bg-violet-500/20 text-violet-400" 
                : "text-[#555] hover:text-[#888] hover:bg-[#1a1a1f]"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Luna Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌙</div>
                  <div className="text-[#555] text-sm mb-2">Talk to Luna</div>
                  <div className="text-[#444] text-xs">
                    She knows what's happening and can delegate when needed
                  </div>
                </div>
              </div>
            )}
            
            {messages.map(msg => {
              const isUser = msg.role === "user";
              const speaker = msg.speaker || "luna";
              const isSerb = speaker === "serberus";
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 ${
                      isUser
                        ? "bg-violet-600/20 border border-violet-500/30"
                        : isSerb
                        ? "bg-orange-500/10 border border-orange-500/20"
                        : "bg-[#0d0d0e] border border-[#1a1a1f]"
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm">{isSerb ? "🤖" : "🌙"}</span>
                        <span className={`text-xs font-medium ${isSerb ? "text-orange-400" : "text-violet-400"}`}>
                          {isSerb ? "Serberus" : "Luna"}
                        </span>
                        {msg.model && (
                          <span className="text-[#333] text-[10px] font-mono">
                            {msg.model.includes("gemini") ? "gemini" : msg.model.includes("sonnet") ? "sonnet" : msg.model}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text-[#ccc] text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {sending && (
              <div className="flex justify-start">
                <div className="bg-[#0d0d0e] border border-[#1a1a1f] rounded-xl px-4 py-3 flex items-center gap-2">
                  <span>🌙</span>
                  <span className="text-[#666] text-sm">thinking...</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-[#1a1a1f] p-4 bg-[#0a0a0b]">
            <div className="flex gap-3 items-end max-w-4xl mx-auto">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Talk to Luna..."
                disabled={sending}
                rows={1}
                className="flex-1 bg-[#050506] border border-[#1a1a1f] rounded-xl px-4 py-3 text-[#ccc] text-sm focus:outline-none focus:border-violet-500/50 resize-none disabled:opacity-50 min-h-[48px] transition-colors"
              />
              
              {/* Hideaway Button */}
              <button
                onClick={() => setShowHideaway(true)}
                className="p-3 rounded-xl bg-[#1a1a1f] text-[#888] hover:text-white hover:bg-[#252528] transition-all hover:scale-105 active:scale-95 group"
                title="Summon Agent"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-45 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="p-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 disabled:hover:bg-violet-600 transition-all hover:scale-105 active:scale-95"
              >
                {sending ? (
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                )}
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[#333] text-[10px]">Enter to send • + to summon agents</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="w-72 border-l border-[#1a1a1f] bg-[#0a0a0b] overflow-y-auto flex-shrink-0">
            {/* Focus Queue */}
            <div className="border-b border-[#1a1a1f]">
              <div className="px-3 py-2 flex justify-between items-center">
                <span className="text-[#555] font-semibold text-[10px] tracking-wider">FOCUS</span>
                <span className="text-[9px] text-[#333]">{focus.length}</span>
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {focus.slice(0, 5).map((item, i) => (
                  <div
                    key={i}
                    className={`px-3 py-2 border-t border-[#151518] text-[11px] ${
                      item.p === 0 ? 'bg-red-500/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`text-[9px] font-bold ${item.p === 0 ? 'text-red-400' : 'text-[#444]'}`}>
                        P{item.p}
                      </span>
                      <span className="text-[#888] flex-1 leading-relaxed">{item.task}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Signals */}
            <div className="border-b border-[#1a1a1f]">
              <div className="px-3 py-2">
                <span className="text-[#555] font-semibold text-[10px] tracking-wider">SIGNALS</span>
              </div>
              <div className="max-h-[250px] overflow-y-auto">
                {signals.map((s) => (
                  <div key={s.id} className="px-3 py-2 border-t border-[#151518]">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[8px] font-semibold uppercase tracking-wide ${
                        s.type === 'complete' || s.type === 'milestone' ? 'text-emerald-400' :
                        s.type === 'discovery' ? 'text-purple-400' :
                        s.type.includes('alert') ? 'text-red-400' : 'text-[#444]'
                      }`}>
                        {s.type}
                      </span>
                      <span className="text-[#2a2a2a] text-[9px]">{s.time_ago}</span>
                    </div>
                    <p className="text-[#666] text-[10px] leading-relaxed line-clamp-2">{s.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Agent Access */}
            <div className="p-3">
              <div className="text-[#555] font-semibold text-[10px] tracking-wider mb-2">AGENTS</div>
              <div className="grid grid-cols-3 gap-1.5">
                {AGENT_CARDS.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => setActiveAgent(agent)}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[#1a1a1f] transition-colors group"
                  >
                    <span className="text-xs font-bold" style={{ color: agent.color }}>{agent.name.slice(0, 2).toUpperCase()}</span>
                    <span className="text-[9px]" style={{ color: agent.color }}>{agent.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hideaway Panel */}
      <HideawayPanel
        isOpen={showHideaway}
        onClose={() => setShowHideaway(false)}
        onSelectAgent={(agent) => setActiveAgent(agent)}
      />

      {/* Agent Room Overlay */}
      {activeAgent && (
        <AgentRoom
          agent={activeAgent}
          onClose={() => setActiveAgent(null)}
        />
      )}
    </div>
  );
}
