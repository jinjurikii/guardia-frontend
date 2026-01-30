"use client";

import { useState, useEffect, useCallback } from "react";
import { ClientContext } from "./LobbyShell";

/**
 * GUARDIA CALENDAR — Factory Floor Edition v2
 * 
 * Improvements:
 * - Today gets green checkmark ONLY if all posts succeeded
 * - Failed posts = red indicator remains as proof (no checkmark)
 * - Gold seal for past posted days
 * - Today's status banner at top
 * - 2B Calm aesthetic
 */

const API_BASE = "https://api.guardiacontent.com";

interface CalendarPost {
  id: number;
  caption: string;
  scheduled_for: string;
  posted_at: string | null;
  status: "draft" | "pending_approval" | "scheduled" | "posted" | "failed";
  platform: string;
  thumbnail_url?: string;
}

interface CalendarTabProps {
  client: ClientContext | null;
  jwt: string | null;
  onMessage: (msg: string) => void;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

// SVG Filters for glow effects
function GlowFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <filter id="amberGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feFlood floodColor="#f59e0b" floodOpacity="0.8" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        <filter id="greenGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feFlood floodColor="#22c55e" floodOpacity="0.7" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        <filter id="redGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feFlood floodColor="#ef4444" floodOpacity="0.8" result="color" />
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

// Simple glowing dot
function StatusLight({ state, size = 12 }: { state: "off" | "waiting" | "ready" | "failed"; size?: number }) {
  if (state === 'off') return null;
  
  const configs = {
    waiting: { filter: 'url(#amberGlow)', color: '#fbbf24' },
    ready: { filter: 'url(#greenGlow)', color: '#22c55e' },
    failed: { filter: 'url(#redGlow)', color: '#ef4444' },
  };
  
  const c = configs[state];
  
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <g style={{ filter: c.filter }}>
        <circle cx="12" cy="12" r="8" fill={c.color} opacity="0.6" />
        <circle cx="12" cy="12" r="4" fill={c.color} />
      </g>
    </svg>
  );
}

// Gold Guardia Seal - for past posted days
function GuardiaSeal({ size = 32 }: { size?: number }) {
  return (
    <img 
      src="/wax-seal.png" 
      alt="Posted" 
      width={size} 
      height={size}
      className="object-contain"
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
    />
  );
}

// Today's Success Checkmark - clean green check
function TodayCheckmark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ filter: 'url(#greenGlow)' }}>
      <circle cx="12" cy="12" r="10" fill="#22c55e" opacity="0.2" />
      <circle cx="12" cy="12" r="8" fill="#22c55e" opacity="0.3" />
      <path 
        d="M8 12l3 3 5-6" 
        fill="none" 
        stroke="#22c55e" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Today's Status Banner
function TodayStatusBanner({ posts }: { posts: CalendarPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1a1a1c] border border-[#2a2a2c]">
        <span className="text-xs text-[#666]">Today</span>
        <span className="text-xs text-[#888]">No posts scheduled</span>
      </div>
    );
  }

  const failed = posts.filter(p => p.status === "failed").length;
  const posted = posts.filter(p => p.status === "posted").length;
  const scheduled = posts.filter(p => p.status === "scheduled").length;
  const pending = posts.filter(p => p.status === "draft" || p.status === "pending_approval").length;
  
  const allGood = failed === 0 && pending === 0 && scheduled === 0 && posted > 0;
  const hasFailed = failed > 0;
  
  return (
    <div 
      className="flex items-center gap-3 px-3 py-2 rounded-xl border transition-all"
      style={{
        background: hasFailed 
          ? 'linear-gradient(145deg, rgba(239,68,68,0.1), transparent)'
          : allGood 
            ? 'linear-gradient(145deg, rgba(34,197,94,0.1), transparent)'
            : 'linear-gradient(145deg, #1a1a1c, #141416)',
        borderColor: hasFailed 
          ? 'rgba(239,68,68,0.3)' 
          : allGood 
            ? 'rgba(34,197,94,0.3)' 
            : 'rgba(255,255,255,0.05)'
      }}
    >
      <span className="text-xs font-medium text-[#888]">Today</span>
      
      {allGood ? (
        <div className="flex items-center gap-1.5">
          <TodayCheckmark size={16} />
          <span className="text-xs text-emerald-400">All {posted} post{posted > 1 ? 's' : ''} delivered</span>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-xs">
          {posted > 0 && (
            <span className="text-emerald-400">{posted} posted</span>
          )}
          {scheduled > 0 && (
            <span className="text-green-400">{scheduled} scheduled</span>
          )}
          {pending > 0 && (
            <span className="text-amber-400">{pending} pending</span>
          )}
          {failed > 0 && (
            <span className="text-red-400 font-medium">{failed} failed</span>
          )}
        </div>
      )}
    </div>
  );
}

// Auto-Schedule Toggle - Gold border, grey off / gold on
function AutoScheduleToggle({ 
  enabled, 
  loading, 
  onToggle 
}: { 
  enabled: boolean; 
  loading: boolean; 
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 active:scale-98"
      style={{
        background: 'linear-gradient(145deg, #141416, #0f0f10)',
        border: '1px solid rgba(212, 175, 55, 0.4)',
        boxShadow: enabled 
          ? 'inset 0 0 12px rgba(212, 175, 55, 0.15), 0 0 8px rgba(212, 175, 55, 0.1)' 
          : 'none',
        opacity: loading ? 0.6 : 1,
      }}
    >
      {/* Toggle indicator */}
      <div 
        className="w-8 h-4 rounded-full relative transition-all duration-200"
        style={{
          background: enabled 
            ? 'linear-gradient(90deg, #d4af37, #c9a227)' 
            : 'linear-gradient(90deg, #3a3a3c, #2a2a2c)',
          boxShadow: enabled 
            ? 'inset 0 1px 2px rgba(255,255,255,0.2)' 
            : 'inset 0 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        <div 
          className="absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200"
          style={{
            left: enabled ? '18px' : '2px',
            background: enabled 
              ? '#fff' 
              : '#666',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      </div>
      
      {/* Label */}
      <span 
        className="text-xs font-medium transition-colors"
        style={{ color: enabled ? '#d4af37' : '#666' }}
      >
        Auto
      </span>
      
      {/* Loading spinner */}
      {loading && (
        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#d4af37" strokeWidth="2" strokeDasharray="30 70" />
        </svg>
      )}
    </button>
  );
}

export default function CalendarTab({ client, jwt, onMessage }: CalendarTabProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<CalendarPost[]>([]);
  const [selectedPostIndex, setSelectedPostIndex] = useState(0);
  
  // Auto-schedule state
  const [autoSchedule, setAutoSchedule] = useState(false);
  const [autoScheduleLoading, setAutoScheduleLoading] = useState(false);

  const loadCalendar = useCallback(async () => {
    if (!jwt) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/client/calendar`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to load calendar:", err);
    }
    setLoading(false);
  }, [jwt]);

  // Load auto-schedule status
  const loadAutoSchedule = useCallback(async () => {
    if (!jwt) return;
    try {
      const res = await fetch(`${API_BASE}/lobby/settings/auto-schedule`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAutoSchedule(data.enabled);
      }
    } catch (err) {
      console.error("Failed to load auto-schedule status:", err);
    }
  }, [jwt]);

  // Toggle auto-schedule
  const toggleAutoSchedule = async () => {
    if (!jwt || autoScheduleLoading) return;
    setAutoScheduleLoading(true);
    try {
      const res = await fetch(`${API_BASE}/lobby/settings/auto-schedule`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAutoSchedule(data.enabled);
        onMessage(data.message);
      }
    } catch (err) {
      console.error("Failed to toggle auto-schedule:", err);
      onMessage("Failed to update auto-schedule setting");
    }
    setAutoScheduleLoading(false);
  };

  useEffect(() => {
    loadCalendar();
    loadAutoSchedule();
  }, [loadCalendar, loadAutoSchedule]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  while (calendarDays.length < totalCells) calendarDays.push(null);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
  };

  const getPostsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return posts.filter(p => 
      p.scheduled_for?.startsWith(dateStr) || p.posted_at?.startsWith(dateStr)
    );
  };

  const isToday = (day: number) => 
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const isPast = (day: number) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return checkDate < todayStart;
  };

  // Determine what to show for each day
  const getDayDisplay = (day: number): { 
    type: "off" | "checkmark" | "seal" | "light";
    lightState?: "waiting" | "ready" | "failed";
  } => {
    const dayPosts = getPostsForDay(day);
    if (dayPosts.length === 0) return { type: "off" };

    const hasFailed = dayPosts.some(p => p.status === "failed");
    const hasPosted = dayPosts.some(p => p.status === "posted");
    const hasScheduled = dayPosts.some(p => p.status === "scheduled");
    const hasPending = dayPosts.some(p => p.status === "draft" || p.status === "pending_approval");
    const allPostedSuccessfully = hasPosted && !hasFailed && !hasScheduled && !hasPending;

    // TODAY: Show checkmark if all good, otherwise show appropriate light
    if (isToday(day)) {
      if (hasFailed) return { type: "light", lightState: "failed" };
      if (allPostedSuccessfully) return { type: "checkmark" };
      if (hasScheduled) return { type: "light", lightState: "ready" };
      if (hasPending) return { type: "light", lightState: "waiting" };
      return { type: "off" };
    }

    // PAST: Show seal if posted, otherwise show failure indicator
    if (isPast(day)) {
      if (hasFailed) return { type: "light", lightState: "failed" };
      if (hasPosted) return { type: "seal" };
      return { type: "off" };
    }

    // FUTURE: Show status lights
    if (hasFailed) return { type: "light", lightState: "failed" };
    if (hasScheduled) return { type: "light", lightState: "ready" };
    if (hasPending) return { type: "light", lightState: "waiting" };
    return { type: "off" };
  };

  const handleDayClick = (day: number) => {
    const dayPosts = getPostsForDay(day);
    setSelectedDay(day);
    setSelectedPosts(dayPosts);
    setSelectedPostIndex(0);
  };

  // Get today's posts for the banner
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayPosts = posts.filter(p => 
    p.scheduled_for?.startsWith(todayStr) || p.posted_at?.startsWith(todayStr)
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0c0c0d]">
        <div className="w-8 h-8 rounded-full border-2 border-[#2a2a2c] border-t-[#f59e0b] animate-spin" />
      </div>
    );
  }

  const numRows = Math.ceil(calendarDays.length / 7);

  return (
    <div className="h-full flex flex-col bg-[#0c0c0d] overflow-hidden">
      <GlowFilters />
      
      {/* Today's Status Banner + Auto-Schedule Toggle */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between gap-3">
        <TodayStatusBanner posts={todayPosts} />
        <AutoScheduleToggle 
          enabled={autoSchedule} 
          loading={autoScheduleLoading}
          onToggle={toggleAutoSchedule}
        />
      </div>
      
      {/* Header */}
      <div className="px-4 pt-2 pb-3">
        <div className="flex items-center justify-between">
          <button 
            onClick={prevMonth}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95"
            style={{
              background: 'linear-gradient(145deg, #141416, #0a0a0b)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.03), 3px 3px 8px rgba(0,0,0,0.4), -2px -2px 6px rgba(40,40,45,0.15)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          
          <div className="text-center">
            <span className="text-lg font-semibold text-[#e8e8e8] tracking-wide">
              {MONTHS[currentMonth]}
            </span>
            <span className="text-sm text-[#666] ml-2">{currentYear}</span>
          </div>
          
          <button 
            onClick={nextMonth}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95"
            style={{
              background: 'linear-gradient(145deg, #141416, #0a0a0b)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.03), 3px 3px 8px rgba(0,0,0,0.4), -2px -2px 6px rgba(40,40,45,0.15)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="overflow-x-auto px-3">
        <div className="grid grid-cols-7 min-w-[320px]">
          {DAYS.map((day, i) => (
            <div key={i} className="text-center py-2 text-xs font-medium text-[#555] tracking-wider">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div
        className="flex-1 mx-3 mb-2 rounded-2xl overflow-x-auto"
        style={{
          background: 'linear-gradient(145deg, #111113, #0a0a0b)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.02), 0 4px 12px rgba(0,0,0,0.4)'
        }}
      >
        <div className="grid grid-cols-7 h-full min-w-[320px]">
          {calendarDays.map((day, i) => {
            const display = day ? getDayDisplay(day) : { type: "off" as const };
            const dayPosts = day ? getPostsForDay(day) : [];
            const isSelected = day === selectedDay;
            const row = Math.floor(i / 7);
            const col = i % 7;
            const isTodayCell = day ? isToday(day) : false;
            const hasContent = display.type !== "off";
            
            return (
              <button
                key={i}
                onClick={() => day && handleDayClick(day)}
                disabled={!day}
                className="relative p-1 transition-all duration-150"
                style={{ 
                  background: isSelected 
                    ? 'linear-gradient(145deg, #1a1a1c, #0f0f10)' 
                    : isTodayCell
                      ? 'linear-gradient(145deg, rgba(245,158,11,0.05), transparent)'
                      : 'transparent',
                  borderRight: col < 6 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                  borderBottom: row < numRows - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                  boxShadow: isSelected 
                    ? 'inset 0 0 12px rgba(245,158,11,0.08)' 
                    : isTodayCell 
                      ? 'inset 0 0 20px rgba(245,158,11,0.03)'
                      : 'none'
                }}
              >
                {day && (
                  <>
                    {/* Day number - top right */}
                    <span 
                      className="absolute top-1.5 right-2 text-xs font-medium transition-colors"
                      style={{ 
                        color: isTodayCell ? '#f59e0b' : isSelected ? '#e8e8e8' : '#666',
                        textShadow: isTodayCell ? '0 0 8px rgba(245,158,11,0.5)' : 'none'
                      }}
                    >
                      {day}
                    </span>
                    
                    {/* Today indicator ring */}
                    {isTodayCell && (
                      <div 
                        className="absolute top-0.5 right-0.5 w-6 h-6 rounded-full pointer-events-none"
                        style={{
                          border: '1px solid rgba(245,158,11,0.3)',
                          background: 'transparent'
                        }}
                      />
                    )}
                    
                    {/* Checkmark - TODAY only, if all good */}
                    {display.type === "checkmark" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <TodayCheckmark size={32} />
                      </div>
                    )}
                    
                    {/* Gold seal - PAST posted days only */}
                    {display.type === "seal" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <GuardiaSeal size={32} />
                      </div>
                    )}
                    
                    {/* Status light - for pending/scheduled/failed */}
                    {display.type === "light" && display.lightState && (
                      <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5">
                        <StatusLight state={display.lightState} size={14} />
                        {dayPosts.length > 1 && (
                          <span className="text-[9px] font-medium text-[#555]">
                            {dayPosts.length}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 flex justify-center gap-4 flex-wrap">
        {[
          { element: <StatusLight state="waiting" size={12} />, label: "Pending" },
          { element: <StatusLight state="ready" size={12} />, label: "Scheduled" },
          { element: <StatusLight state="failed" size={12} />, label: "Failed" },
          { element: <TodayCheckmark size={14} />, label: "Today ✓" },
          { element: <GuardiaSeal size={14} />, label: "Posted" },
        ].map(({ element, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            {element}
            <span className="text-xs text-[#555] tracking-wide">{label}</span>
          </div>
        ))}
      </div>

      {/* Selected Day Panel — Image-First Design */}
      {selectedDay !== null && (
        <div 
          className="mx-3 mb-3 rounded-2xl p-4"
          style={{
            background: 'linear-gradient(145deg, #151517, #0d0d0e)',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.03), 0 4px 16px rgba(0,0,0,0.4)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#e8e8e8]">
                {MONTHS[currentMonth]} {selectedDay}
              </span>
              {selectedDay && isToday(selectedDay) && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                  Today
                </span>
              )}
            </div>
            <button 
              onClick={() => setSelectedDay(null)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-[#666] hover:text-[#888] transition-colors"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              ✕
            </button>
          </div>
          
          {selectedPosts.length === 0 ? (
            <p className="text-xs text-[#555]">No content scheduled for this day</p>
          ) : (
            <div className="space-y-3">
              {/* Image Gallery with Arrows */}
              <div className="flex items-center gap-2">
                {/* Left Arrow */}
                <button
                  onClick={() => setSelectedPostIndex(i => Math.max(0, i - 1))}
                  disabled={selectedPostIndex === 0 || selectedPosts.length <= 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-20 disabled:cursor-default"
                  style={{ 
                    background: selectedPosts.length > 1 ? 'rgba(255,255,255,0.05)' : 'transparent',
                    visibility: selectedPosts.length > 1 ? 'visible' : 'hidden'
                  }}
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                </button>
                
                {/* Image Container */}
                <div 
                  className="flex-1 aspect-square max-h-48 rounded-xl overflow-hidden relative"
                  style={{ 
                    background: 'linear-gradient(145deg, #1a1a1c, #0f0f10)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  {selectedPosts[selectedPostIndex]?.thumbnail_url ? (
                    <img 
                      src={selectedPosts[selectedPostIndex].thumbnail_url} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl opacity-30">📝</span>
                    </div>
                  )}
                  
                  {/* Post counter badge */}
                  {selectedPosts.length > 1 && (
                    <div 
                      className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ 
                        background: 'rgba(0,0,0,0.6)', 
                        backdropFilter: 'blur(4px)',
                        color: '#ccc'
                      }}
                    >
                      {selectedPostIndex + 1} / {selectedPosts.length}
                    </div>
                  )}
                </div>
                
                {/* Right Arrow */}
                <button
                  onClick={() => setSelectedPostIndex(i => Math.min(selectedPosts.length - 1, i + 1))}
                  disabled={selectedPostIndex === selectedPosts.length - 1 || selectedPosts.length <= 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-20 disabled:cursor-default"
                  style={{ 
                    background: selectedPosts.length > 1 ? 'rgba(255,255,255,0.05)' : 'transparent',
                    visibility: selectedPosts.length > 1 ? 'visible' : 'hidden'
                  }}
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </div>
              
              {/* Caption & Meta below image */}
              <div className="px-1">
                <p className="text-xs text-[#aaa] line-clamp-2 mb-2">
                  {selectedPosts[selectedPostIndex]?.caption || "No caption"}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#666] uppercase tracking-wide">
                    {selectedPosts[selectedPostIndex]?.platform}
                  </span>
                  <span 
                    className="text-xs font-medium capitalize"
                    style={{ 
                      color: {
                        draft: '#f59e0b',
                        pending_approval: '#f59e0b', 
                        scheduled: '#22c55e',
                        posted: '#d97706',
                        failed: '#ef4444'
                      }[selectedPosts[selectedPostIndex]?.status] || '#666' 
                    }}
                  >
                    {selectedPosts[selectedPostIndex]?.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
