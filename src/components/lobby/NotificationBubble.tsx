"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * GIO NOTIFICATION BUBBLE
 * 
 * Displays popup notifications separate from chat:
 * - Request outcomes (auto-dismiss after 10s)
 * - Soul questions (first after 60s, then every 20min)
 * 
 * Polls /client/notifications every 30s or on tab focus
 */

const API_BASE = "https://api.guardiacontent.com";

interface Notification {
  type: "outcome" | "question";
  id: string;
  message: string;
  request_id?: number;
  request_type?: string;
  status?: string;
  question_id?: number;
  category?: string;
}

interface NotificationBubbleProps {
  jwt: string | null;
}

export default function NotificationBubble({ jwt }: NotificationBubbleProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [current, setCurrent] = useState<Notification | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  
  // Track session start time
  const sessionStartRef = useRef<number>(Date.now());

  // Get session elapsed time in seconds
  const getSessionSeconds = useCallback(() => {
    return Math.floor((Date.now() - sessionStartRef.current) / 1000);
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!jwt) return;
    
    const sessionSeconds = getSessionSeconds();
    
    try {
      const res = await fetch(`${API_BASE}/client/notifications?session_seconds=${sessionSeconds}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.notifications?.length > 0) {
          setNotifications(prev => {
            // Add new ones that aren't already in queue
            const existingIds = new Set(prev.map(n => n.id));
            const newOnes = data.notifications.filter(
              (n: Notification) => !existingIds.has(n.id)
            );
            return [...prev, ...newOnes];
          });
        }
      }
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  }, [jwt, getSessionSeconds]);

  // Poll every 30s and on focus
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    
    const handleFocus = () => fetchNotifications();
    window.addEventListener("focus", handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchNotifications]);

  // Show next notification when current is cleared
  useEffect(() => {
    if (!current && notifications.length > 0) {
      setCurrent(notifications[0]);
      setNotifications(prev => prev.slice(1));
    }
  }, [current, notifications]);

  // Auto-dismiss outcomes after 10s
  useEffect(() => {
    if (current?.type === "outcome" && !dismissing) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [current, dismissing]);

  // Dismiss notification
  const handleDismiss = async () => {
    if (!current || !jwt) return;
    setDismissing(true);
    
    try {
      await fetch(`${API_BASE}/client/notifications/${current.id}/dismiss`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
      });
    } catch (err) {
      console.error("Dismiss error:", err);
    }
    
    setTimeout(() => {
      setCurrent(null);
      setDismissing(false);
      setShowReply(false);
      setReplyText("");
    }, 300);
  };

  // Handle question response
  const handleQuestionAction = async (action: "answer" | "skip" | "later") => {
    if (!current || current.type !== "question" || !jwt) return;
    
    try {
      await fetch(`${API_BASE}/client/notifications/question/${current.question_id}`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action,
          answer: action === "answer" ? replyText : null
        }),
      });
    } catch (err) {
      console.error("Question response error:", err);
    }
    
    handleDismiss();
  };

  if (!current) return null;

  const isQuestion = current.type === "question";
  const isOutcome = current.type === "outcome";

  return (
    <div 
      className={`fixed bottom-24 left-4 right-4 z-50 transition-all duration-300 ${
        dismissing ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="bg-[#1c1c1e] border border-white/10 rounded-2xl shadow-xl overflow-hidden max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
          {isOutcome && (
            <>
              <span className="text-lg">
                {current.status === "approved" ? "✓" : current.status === "denied" ? "✗" : "○"}
              </span>
              <span className="text-xs text-white/50">
                {current.status === "approved" ? "Request approved" : 
                 current.status === "denied" ? "Request update" : "Update"}
              </span>
            </>
          )}
          {isQuestion && (
            <>
              <span className="text-lg">✨</span>
              <span className="text-xs text-[#e8a060]">Quick question from Giovanni</span>
            </>
          )}
          
          <button 
            onClick={handleDismiss}
            className="ml-auto text-white/30 hover:text-white/60 transition-colors"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4">
          <p className="text-sm text-[#e8e8e8] leading-relaxed">
            {current.message}
          </p>
        </div>

        {/* Reply input for questions */}
        {isQuestion && showReply && (
          <div className="px-4 pb-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your answer..."
              className="w-full bg-[#2a2a2c] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#e8e8e8] placeholder-white/30 resize-none focus:outline-none focus:border-[#e8a060]/50"
              rows={2}
              autoFocus
            />
          </div>
        )}

        {/* Actions */}
        <div className="px-4 pb-4">
          {isOutcome && (
            <button
              onClick={handleDismiss}
              className="w-full py-2 text-sm text-white/50 hover:text-white/80 transition-colors"
            >
              Got it
            </button>
          )}
          
          {isQuestion && !showReply && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowReply(true)}
                className="flex-1 py-2.5 bg-[#e8a060] text-[#121214] rounded-xl text-sm font-medium transition-transform active:scale-98"
              >
                Reply
              </button>
              <button
                onClick={() => handleQuestionAction("later")}
                className="px-4 py-2.5 bg-white/5 text-white/60 rounded-xl text-sm hover:bg-white/10 transition-colors"
              >
                Later
              </button>
              <button
                onClick={() => handleQuestionAction("skip")}
                className="px-4 py-2.5 text-white/30 text-sm hover:text-white/50 transition-colors"
              >
                Skip
              </button>
            </div>
          )}
          
          {isQuestion && showReply && (
            <div className="flex gap-2">
              <button
                onClick={() => handleQuestionAction("answer")}
                disabled={!replyText.trim()}
                className="flex-1 py-2.5 bg-[#e8a060] text-[#121214] rounded-xl text-sm font-medium transition-transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
              <button
                onClick={() => setShowReply(false)}
                className="px-4 py-2.5 bg-white/5 text-white/60 rounded-xl text-sm hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Auto-dismiss indicator for outcomes */}
        {isOutcome && !dismissing && (
          <div className="h-1 bg-white/5">
            <div 
              className="h-full bg-[#e8a060]/30 animate-shrink"
              style={{ 
                animation: "shrink 10s linear forwards"
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
