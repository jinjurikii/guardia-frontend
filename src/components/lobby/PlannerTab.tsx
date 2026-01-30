"use client";

import { useState, useEffect, useCallback } from "react";
import { ClientContext, TabletTab } from "./LobbyShell";
import QuickSetupCard from "./QuickSetupCard";
import ContentDirectionPanel from "./ContentDirectionPanel";
import PlanningPreferencesPanel from "./PlanningPreferencesPanel";

/**
 * GUARDIA PLANNER — Command Center
 * 
 * Channel configuration, engagement hub, insights dashboard
 * 2B Calm aesthetic with recessed indicators and meter wells
 */

const API_BASE = "https://api.guardiacontent.com";

interface ChannelProfile {
  client_id: string;
  channel_summary: string;
  content_instructions: string;
  generation_themes: string[];
  posts_generated: number;
  last_generated_at: string | null;
}

interface RecentGeneration {
  id: number;
  styled_url: string;
  created_at: string;
  caption: string | null;
}

interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  message: string;
  created_time: string;
  liked: boolean;
  replied: boolean;
  reply_suggestion: string | null;
}

interface InsightsData {
  total_reach: number;
  total_likes: number;
  total_comments: number;
  posts_count: number;
  top_post?: {
    id: number;
    image_url: string;
    reach: number;
  };
}

interface PlannerTabProps {
  onSwitchTab?: (tab: TabletTab) => void;
  client: ClientContext | null;
  jwt: string | null;
  onMessage: (msg: string) => void;
}

// SVG Filters
function GlowFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <filter id="amberGlowPlanner" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feFlood floodColor="#f59e0b" floodOpacity="0.7" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="greenGlowPlanner" x="-100%" y="-100%" width="300%" height="300%">
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

// Recessed indicator light (smaller version for inline use)
function StatusLight({ active, color = "amber", size = 16 }: { active: boolean; color?: "amber" | "green"; size?: number }) {
  const colors = {
    amber: { fill: '#fbbf24', filter: 'url(#amberGlowPlanner)' },
    green: { fill: '#22c55e', filter: 'url(#greenGlowPlanner)' },
  };
  const c = colors[color];
  
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <linearGradient id={`chrome-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#555" />
          <stop offset="50%" stopColor="#888" />
          <stop offset="100%" stopColor="#444" />
        </linearGradient>
        <radialGradient id={`glow-${color}-${size}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={c.fill} stopOpacity="1" />
          <stop offset="60%" stopColor={c.fill} stopOpacity="0.6" />
          <stop offset="100%" stopColor={c.fill} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="none" stroke={`url(#chrome-${size})`} strokeWidth="2" />
      <circle cx="12" cy="12" r="7" fill="#050505" />
      {active && (
        <g style={{ filter: c.filter }}>
          <circle cx="12" cy="12" r="5" fill={`url(#glow-${color}-${size})`} />
          <circle cx="12" cy="12" r="2" fill={c.fill} opacity="0.9" />
        </g>
      )}
    </svg>
  );
}

// Meter well for insights
function MeterWell({ value, max, label, icon }: { value: number; max: number; label: string; icon: React.ReactNode }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  
  return (
    <div 
      className="p-3 rounded-xl"
      style={{
        background: 'linear-gradient(145deg, #0f0f10, #0a0a0b)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4), inset 0 -1px 1px rgba(255,255,255,0.02)'
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="text-[#f59e0b]">{icon}</div>
        <span className="text-xs text-[#555] uppercase tracking-wider">{label}</span>
      </div>
      
      {/* Meter track */}
      <div 
        className="h-2 rounded-full mb-2 overflow-hidden"
        style={{
          background: '#0a0a0a',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)'
        }}
      >
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
            boxShadow: '0 0 8px rgba(245,158,11,0.4)'
          }}
        />
      </div>
      
      <div className="text-lg font-semibold text-[#e8e8e8]">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

export default function PlannerTab({ client, jwt, onMessage, onSwitchTab }: PlannerTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState<ChannelProfile | null>(null);
  const [recentGenerations, setRecentGenerations] = useState<RecentGeneration[]>([]);
  const [contentCount, setContentCount] = useState(0);
  const [styleName, setStyleName] = useState("");
  
  // Form state
  const [summary, setSummary] = useState("");
  const [instructions, setInstructions] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Engagement state
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Insights state
  const [insights, setInsights] = useState<InsightsData | null>(null);

  const loadPlanner = useCallback(async () => {
    if (!jwt) return;
    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/lobby/planner`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setRecentGenerations(data.recent_generations || []);
        setContentCount(data.content_library_count || 0);
        setStyleName(data.style || "");
        
        setSummary(data.profile?.channel_summary || "");
        setInstructions(data.profile?.content_instructions || "");
      }
    } catch (err) {
      console.error("Load planner error:", err);
    }
    
    setLoading(false);
  }, [jwt]);

  const loadComments = useCallback(async () => {
    if (!jwt || !client?.id) return;
    try {
      const res = await fetch(`${API_BASE}/engagement/comments/${client.id}?status=pending&limit=10`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error("Load comments error:", err);
    }
  }, [jwt, client?.id]);

  const loadInsights = useCallback(async () => {
    if (!jwt || !client?.id) return;
    try {
      const res = await fetch(`${API_BASE}/engagement/stats/${client.id}`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      }
    } catch (err) {
      console.error("Load insights error:", err);
    }
  }, [jwt, client?.id]);

  useEffect(() => {
    loadPlanner();
    loadComments();
    loadInsights();
  }, [loadPlanner, loadComments, loadInsights]);

  useEffect(() => {
    if (!profile) return;
    const changed = summary !== (profile.channel_summary || "") || 
                   instructions !== (profile.content_instructions || "");
    setHasChanges(changed);
  }, [summary, instructions, profile]);

  const handleSave = async () => {
    if (!jwt || !hasChanges) return;
    setSaving(true);
    
    try {
      const res = await fetch(`${API_BASE}/lobby/planner`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          channel_summary: summary,
          content_instructions: instructions
        })
      });
      
      if (res.ok) {
        setHasChanges(false);
        onMessage("Planner saved! ✨");
        loadPlanner();
      } else {
        onMessage("Couldn't save. Try again?");
      }
    } catch {
      onMessage("Save failed. Check your connection.");
    }
    
    setSaving(false);
  };

  const handleSendReply = async (commentId: string) => {
    if (!jwt || !replyText.trim() || sendingReply) return;
    setSendingReply(true);
    
    try {
      const res = await fetch(`${API_BASE}/engagement/reply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          comment_id: commentId,
          message: replyText
        })
      });
      
      if (res.ok) {
        onMessage("Reply sent! 💬");
        setReplyingTo(null);
        setReplyText("");
        setComments(comments.filter(c => c.id !== commentId));
      } else {
        onMessage("Couldn't send reply. Try again?");
      }
    } catch {
      onMessage("Reply failed. Check your connection.");
    }
    
    setSendingReply(false);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0c0c0d]">
        <div className="w-8 h-8 border-2 border-[#2a2a2c] border-t-[#f59e0b] rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate max for meter scaling
  const maxStat = Math.max(insights?.total_reach || 1, insights?.total_likes || 1, insights?.total_comments || 1);

  return (
    <div className="h-full flex flex-col bg-[#0c0c0d] overflow-hidden">
      <GlowFilters />
      
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-lg font-semibold text-[#e8e8e8]">Planner</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">

        {/* ═══════════════════════════════════════════════════════════════════
            QUICK SETUP GUIDE (shows only when incomplete)
        ═══════════════════════════════════════════════════════════════════ */}
        <QuickSetupCard
          steps={[
            {
              id: 'connect',
              label: 'Connect your Facebook page',
              complete: client?.facebook_connected || false,
              action: onSwitchTab ? () => onSwitchTab('account') : undefined,
              actionLabel: 'Connect'
            },
            {
              id: 'style',
              label: 'Choose your visual style',
              complete: !!styleName,
              action: onSwitchTab ? () => onSwitchTab('styles') : undefined,
              actionLabel: 'Choose'
            },
            {
              id: 'content',
              label: 'Add quotes to your library',
              complete: contentCount > 0,
            },
            {
              id: 'generate',
              label: 'Generate your first post',
              complete: (profile?.posts_generated || 0) > 0,
              action: onSwitchTab ? () => onSwitchTab('gallery') : undefined,
              actionLabel: 'Create'
            }
          ]}
        />

        
        {/* ═══════════════════════════════════════════════════════════════════
            CONTENT DIRECTION PANEL
        ═══════════════════════════════════════════════════════════════════ */}
        <ContentDirectionPanel
          clientId={client?.id || ""}
          industry={client?.industry || "other"}
          jwt={jwt}
          onSave={() => loadPlanner()}
          onMessage={onMessage}
        />

        {/* ═══════════════════════════════════════════════════════════════════
            PLANNING PREFERENCES PANEL
        ═══════════════════════════════════════════════════════════════════ */}
        <PlanningPreferencesPanel
          clientId={client?.id || ""}
          jwt={jwt}
          onSave={() => loadPlanner()}
          onMessage={onMessage}
        />
        {/* ═══════════════════════════════════════════════════════════════════
            INSIGHTS - Meter Wells
        ═══════════════════════════════════════════════════════════════════ */}
        <div 
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(145deg, #111113, #0a0a0b)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.02), 0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
            <h3 className="text-sm font-medium text-[#e8e8e8]">Insights</h3>
          </div>

          {insights ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <MeterWell 
                value={insights.total_reach || 0} 
                max={maxStat}
                label="Reach"
                icon={<svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20"/><path d="M2 12h20"/></svg>}
              />
              <MeterWell 
                value={insights.total_likes || 0} 
                max={maxStat}
                label="Likes"
                icon={<svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>}
              />
              <MeterWell 
                value={insights.total_comments || 0} 
                max={maxStat}
                label="Comments"
                icon={<svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>}
              />
            </div>
          ) : (
            <p className="text-xs text-[#555] text-center py-4">
              Insights appear once you have posted content
            </p>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            ENGAGEMENT - Comments with status lights
        ═══════════════════════════════════════════════════════════════════ */}
        <div 
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #111113, #0a0a0b)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.02), 0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              <h3 className="text-sm font-medium text-[#e8e8e8]">Engagement</h3>
            </div>
            <div className="flex items-center gap-2">
              <StatusLight active={comments.length > 0} color="amber" size={18} />
              {comments.length > 0 && (
                <span className="text-xs text-[#f59e0b] font-medium">{comments.length}</span>
              )}
            </div>
          </div>

          <div className="p-4 space-y-3">
            {comments.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-4">
                <StatusLight active={false} size={14} />
                <p className="text-xs text-[#555]">All caught up</p>
              </div>
            ) : (
              comments.slice(0, 5).map((comment) => (
                <div 
                  key={comment.id} 
                  className="rounded-xl p-3 space-y-2"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.03)'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-[#e8e8e8]">{comment.author_name}</span>
                      <p className="text-sm text-[#888] mt-1">{comment.message}</p>
                    </div>
                  </div>
                  
                  {replyingTo === comment.id ? (
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      {comment.reply_suggestion && (
                        <button
                          onClick={() => setReplyText(comment.reply_suggestion || "")}
                          className="text-xs text-[#f59e0b] hover:underline"
                        >
                          Use suggestion: &quot;{comment.reply_suggestion?.slice(0, 40)}...&quot;
                        </button>
                      )}
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        className="w-full h-16 px-3 py-2 rounded-lg text-sm text-[#e8e8e8] placeholder-[#444] resize-none focus:outline-none"
                        style={{
                          background: '#0a0a0a',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
                          border: 'none'
                        }}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSendReply(comment.id)}
                          disabled={sendingReply || !replyText.trim()}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95"
                          style={{
                            background: 'linear-gradient(145deg, #f59e0b, #d97706)',
                            color: '#0c0c0d',
                            opacity: sendingReply || !replyText.trim() ? 0.5 : 1
                          }}
                        >
                          {sendingReply ? "Sending..." : "Send"}
                        </button>
                        <button
                          onClick={() => { setReplyingTo(null); setReplyText(""); }}
                          className="px-4 py-2 rounded-lg text-sm text-[#666] hover:text-[#888] transition-colors"
                          style={{ background: 'rgba(255,255,255,0.03)' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingTo(comment.id)}
                      className="text-xs text-[#f59e0b] hover:text-[#fbbf24] transition-colors"
                    >
                      Reply →
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            RECENT GENERATIONS - Chrome framed
        ═══════════════════════════════════════════════════════════════════ */}
        {recentGenerations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <h3 className="text-xs font-medium text-[#555]">Recent Activity</h3>
              {profile?.posts_generated && (
                <span className="text-xs text-[#444]">({profile.posts_generated} total)</span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {recentGenerations.slice(0, 4).map((gen) => (
                <div 
                  key={gen.id}
                  className="aspect-square rounded-lg overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, #555, #333)',
                    padding: '2px'
                  }}
                >
                  <div className="w-full h-full rounded-md overflow-hidden bg-[#0a0a0a]">
                    <img 
                      src={gen.styled_url} 
                      alt="Generated"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
