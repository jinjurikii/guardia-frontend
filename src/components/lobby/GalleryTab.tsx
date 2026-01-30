"use client";

import { useState, useEffect, useCallback } from "react";
import { ClientContext } from "./LobbyShell";
import PublishPreviewModal from "./PublishPreviewModal";

/**
 * GUARDIA GALLERY — Content Workbench
 * 
 * Factory floor aesthetic - upload, generate, review, approve
 * 2B Calm with recessed zones and chrome accents
 */

const API_BASE = "https://api.guardiacontent.com";

interface GalleryImage {
  url?: string;
  id: number;
  original_filename: string;
  status: "pending" | "styled" | "approved" | "rejected" | "processing" | "ready" | "failed" | "queued" | "raw" | "styling" | "pending_review";
  styled_url?: string;
  original_url?: string;
  thumbnail_url?: string;
  uploaded_at: string;
  caption?: string;
}

interface TopPost {
  id: number;
  caption: string;
  platform: string;
  posted_at: string;
  post_url: string;
  image_url: string;
  metrics: { likes: number; comments: number; shares: number; reach: number; engagement_score: number };
}

interface TopPostsData {
  best_ever: TopPost | null;
  monthly_top: TopPost[];
  month: string;
  has_insights: boolean;
}

interface GalleryTabProps {
  client: ClientContext | null;
  jwt: string | null;
  onMessage: (msg: string) => void;
  onSwitchToGio?: (context?: string) => void;
}

const QUEUE_MAX = 30;

// SVG Filters for glows
function GlowFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <filter id="amberGlowGallery" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feFlood floodColor="#f59e0b" floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="greenGlowGallery" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feFlood floodColor="#22c55e" floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

// Status indicator light
function StatusLight({ active, color = "amber", size = 16 }: { active: boolean; color?: "amber" | "green"; size?: number }) {
  const colors = {
    amber: { fill: '#fbbf24', filter: 'url(#amberGlowGallery)' },
    green: { fill: '#22c55e', filter: 'url(#greenGlowGallery)' },
  };
  const c = colors[color];
  
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <linearGradient id={`chromeGallery-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#555" />
          <stop offset="50%" stopColor="#888" />
          <stop offset="100%" stopColor="#444" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="none" stroke={`url(#chromeGallery-${size})`} strokeWidth="2" />
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

// Chrome-framed image card
function ImageCard({ 
  image, 
  imageUrl,
  index, 
  total, 
  onRed, 
  onGreen,
  redLabel,
  greenLabel,
  emptyIcon,
  emptyTitle,
  emptySubtitle,
  isProcessing = false
}: {
  image: GalleryImage | null;
  imageUrl?: string;
  index: number;
  total: number;
  onRed: () => void;
  onGreen: () => void;
  redLabel: string;
  greenLabel: string;
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  emptySubtitle: string;
  isProcessing?: boolean;
}) {
  if (!image || total === 0) {
    return (
      <div 
        className="rounded-xl p-6 text-center"
        style={{
          background: 'linear-gradient(145deg, #0f0f10, #0a0a0b)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4), inset 0 -1px 1px rgba(255,255,255,0.02)'
        }}
      >
        {emptyIcon}
        <p className="text-sm font-medium text-[#888] mt-3">{emptyTitle}</p>
        <p className="text-xs text-[#555] mt-1">{emptySubtitle}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Chrome-framed image */}
      <div className="relative mx-auto" style={{ maxWidth: 260 }}>
        <div 
          className="rounded-xl p-[3px]"
          style={{
            background: 'linear-gradient(145deg, #666, #333)',
          }}
        >
          <div 
            className="rounded-lg overflow-hidden"
            style={{ background: '#0a0a0a' }}
          >
            <div className="aspect-square">
              {imageUrl ? (
                <img src={imageUrl} alt={image.original_filename || "image"} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#111]">
                  <div className="w-6 h-6 border-2 border-[#333] border-t-[#f59e0b] rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="p-2.5 border-t border-white/5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#888] truncate flex-1">{image.original_filename || "Image"}</p>
                <span className="text-xs text-[#555] ml-2">{index + 1}/{total}</span>
              </div>
              {image.caption && (
                <p className="text-xs text-[#aaa] mt-1.5 line-clamp-2">{image.caption}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons or processing state */}
      {isProcessing ? (
        <div className="flex flex-col items-center gap-2 mt-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#333] border-t-[#f59e0b] rounded-full animate-spin" />
            <span className="text-sm font-medium text-[#f59e0b]">Styling in progress...</span>
          </div>
          <p className="text-xs text-[#666]">This may take a minute</p>
        </div>
      ) : (
        <div className="flex justify-center gap-3 mt-4">
          <button 
            onClick={onRed} 
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all active:scale-95"
            style={{
              background: 'linear-gradient(145deg, #1a1a1c, #0f0f10)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.03), 2px 2px 6px rgba(0,0,0,0.3)',
              color: '#ef4444'
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
            {redLabel}
          </button>
          <button 
            onClick={onGreen} 
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all active:scale-95"
            style={{
              background: 'linear-gradient(145deg, #22c55e, #16a34a)',
              boxShadow: '0 2px 8px rgba(34,197,94,0.3), inset 0 1px 1px rgba(255,255,255,0.2)',
              color: '#052e16'
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            {greenLabel}
          </button>
        </div>
      )}
    </div>
  );
}

export default function GalleryTab({ client, jwt, onMessage, onSwitchToGio }: GalleryTabProps) {
  const [inFactory, setInFactory] = useState<GalleryImage[]>([]);
  const [fromFactory, setFromFactory] = useState<GalleryImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [topPosts, setTopPosts] = useState<TopPostsData | null>(null);
  const [topPostsLoading, setTopPostsLoading] = useState(true);
  const [inFactoryIndex, setInFactoryIndex] = useState(0);
  const [fromFactoryIndex, setFromFactoryIndex] = useState(0);
  const [publishingAssetId, setPublishingAssetId] = useState<number | null>(null);
  const [contentCount, setContentCount] = useState(0);
  const [styleName, setStyleName] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const loadGallery = useCallback(async () => {
    if (!jwt) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/lobby/gallery`, { headers: { Authorization: `Bearer ${jwt}` } });
      if (res.ok) {
        const data = await res.json();
        const items = data.items || [];
        setInFactory(items.filter((img: GalleryImage) => 
          img.status === "pending" || img.status === "processing" || img.status === "queued" || img.status === "raw" || img.status === "pending_review"
        ));
        setFromFactory(items.filter((img: GalleryImage) => 
          img.status === "ready" || img.status === "styled"
        ));
      }
      
      // Also load planner data for generate button
      const plannerRes = await fetch(`${API_BASE}/lobby/planner`, { headers: { Authorization: `Bearer ${jwt}` } });
      if (plannerRes.ok) {
        const plannerData = await plannerRes.json();
        setContentCount(plannerData.content_library_count || 0);
        setStyleName(plannerData.style || "");
        // Load cooldown
        if (plannerData.cooldown?.active) {
          setCooldownSeconds(plannerData.cooldown.remaining_seconds || 0);
        }
      }
    } catch (err) {
      console.error("Failed to load gallery:", err);
    }
    setLoading(false);
  }, [jwt]);

  useEffect(() => { loadGallery(); }, [loadGallery]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds(s => s > 0 ? s - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds > 0]);

  useEffect(() => {
    const fetchTopPosts = async () => {
      if (!jwt) return;
      try {
        const res = await fetch(`${API_BASE}/lobby/top-posts`, { headers: { Authorization: `Bearer ${jwt}` } });
        if (res.ok) setTopPosts(await res.json());
      } catch (err) { console.error("Top posts fetch error:", err); }
      finally { setTopPostsLoading(false); }
    };
    fetchTopPosts();
  }, [jwt]);

  // Generate post handler
  const handleGenerate = async () => {
    if (!jwt || generating || cooldownSeconds > 0) return;
    if (contentCount === 0) {
      onMessage("Add some quotes to your content library first!");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/lobby/planner/generate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` }
      });
      const data = await res.json();
      if (data.success) {
        // Silent - just start cooldown and refresh gallery
        setCooldownSeconds(data.cooldown_seconds || 3 * 60 * 60);
        setTimeout(loadGallery, 5000);
      } else {
        // On failure, set cooldown if provided (already on cooldown)
        if (data.cooldown_remaining) {
          setCooldownSeconds(data.cooldown_remaining);
        }
      }
    } catch {
      // Silent failure
    }
    setGenerating(false);
  };

  // Format cooldown for display
  const formatCooldown = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Factory actions
  const handleDiscardRaw = async () => {
    if (inFactory.length === 0) return;
    const img = inFactory[inFactoryIndex];
    try {
      await fetch(`${API_BASE}/lobby/gallery/${img.id}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setInFactory(items => items.filter((_, i) => i !== inFactoryIndex));
      setInFactoryIndex(i => Math.min(i, Math.max(0, inFactory.length - 2)));
      onMessage(`Discarded "${img.original_filename || 'image'}".`);
    } catch {
      onMessage("Had trouble with that. Let's try again.");
    }
  };

  const handleRushStyle = async () => {
    if (inFactory.length === 0 || !jwt) return;
    const img = inFactory[inFactoryIndex];
    try {
      const res = await fetch(`${API_BASE}/lobby/gallery/${img.id}/rush`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const data = await res.json();
      if (data.success) {
        setInFactory(items => items.filter((_, i) => i !== inFactoryIndex));
        setInFactoryIndex(i => Math.min(i, Math.max(0, inFactory.length - 2)));
        onMessage(data.message || "Giovanni's on it! ⚡");
      } else {
        onMessage(data.message || "Couldn't start rush styling. Try again?");
      }
    } catch (err) {
      console.error("Rush error:", err);
      onMessage("Something went wrong. Let's try that again.");
    }
  };


  const handleSendToFactory = async () => {
    if (inFactory.length === 0 || !jwt) return;
    const img = inFactory[inFactoryIndex];
    try {
      // Step 1: Send to factory (changes status from pending_review to raw)
      const res = await fetch(`${API_BASE}/lobby/gallery/${img.id}/send-to-factory`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const data = await res.json();
      if (!data.success) {
        onMessage(data.message || "Couldn't send to factory. Try again?");
        return;
      }
      
      // Step 2: Immediately rush it (starts styling)
      const rushRes = await fetch(`${API_BASE}/lobby/gallery/${img.id}/rush`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const rushData = await rushRes.json();
      if (rushData.success !== false) {
        onMessage(rushData.message || "Styling started! ⚡");
      } else {
        onMessage(rushData.message || "Sent to factory!");
      }
      loadGallery();
    } catch (err) {
      console.error("Send to factory error:", err);
      onMessage("Something went wrong. Let's try that again.");
    }
  };
  const handleRejectStyled = async () => {
    if (fromFactory.length === 0) return;
    const img = fromFactory[fromFactoryIndex];
    try {
      await fetch(`${API_BASE}/lobby/gallery/${img.id}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setFromFactory(items => items.filter((_, i) => i !== fromFactoryIndex));
      setFromFactoryIndex(i => Math.min(i, Math.max(0, fromFactory.length - 2)));
      if (onSwitchToGio) {
        onSwitchToGio(`I rejected the styled image "${img.original_filename || 'this image'}" because`);
      } else {
        onMessage(`Rejected "${img.original_filename || 'this image'}". Let me know what you'd like instead.`);
      }
    } catch {
      onMessage("Had trouble with that. Let's try again.");
    }
  };

  const handleApproveStyled = async () => {
    if (fromFactory.length === 0 || !jwt) return;
    const img = fromFactory[fromFactoryIndex];
    // Optimistic UI update - remove immediately
    setFromFactory(items => items.filter((_, i) => i !== fromFactoryIndex));
    setFromFactoryIndex(i => Math.min(i, Math.max(0, fromFactory.length - 2)));
    // Fire and forget - Gio tracks approvals silently
    fetch(`${API_BASE}/lobby/gallery/${img.id}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
    }).catch(() => loadGallery()); // Refresh on error
  };

  const handlePostNow = () => {
    if (fromFactory.length === 0) return;
    const img = fromFactory[fromFactoryIndex];
    setPublishingAssetId(img.id);
  };

  const handlePublished = () => {
    setFromFactory(items => items.filter((_, i) => i !== fromFactoryIndex));
    setFromFactoryIndex(i => Math.min(i, Math.max(0, fromFactory.length - 2)));
    loadGallery();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !jwt) return;
    const totalQueue = inFactory.length + fromFactory.length;
    if (totalQueue >= QUEUE_MAX) { onMessage(`Queue is full (${QUEUE_MAX} max).`); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/lobby/gallery/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) { onMessage(`Uploaded "${file.name}"! Sending to the factory.`); loadGallery(); }
      else { onMessage(data.message || "Upload failed."); }
    } catch { onMessage("Upload failed."); }
    setUploading(false);
    e.target.value = "";
  };

  const currentInFactory = inFactory[inFactoryIndex];
  const currentFromFactory = fromFactory[fromFactoryIndex];
  const totalQueue = inFactory.length + fromFactory.length;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0c0c0d]">
        <div className="w-8 h-8 border-2 border-[#2a2a2c] border-t-[#f59e0b] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0c0c0d] overflow-hidden">
      <GlowFilters />
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h2 className="text-lg font-semibold text-[#e8e8e8]">Gallery</h2>
        <div className="flex items-center gap-2">
          <label 
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm cursor-pointer transition-all active:scale-95"
            style={{
              background: 'linear-gradient(145deg, #f59e0b, #d97706)',
              boxShadow: '0 2px 8px rgba(245,158,11,0.3), inset 0 1px 1px rgba(255,255,255,0.2)',
              color: '#0c0c0d'
            }}
          >
            <input type="file" accept=".jpg,.jpeg,.png,.webp,.heic" onChange={handleUpload} className="hidden" disabled={uploading} />
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            {uploading ? "..." : "Add"}
          </label>
          <div 
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium"
            style={{
              background: 'linear-gradient(145deg, #1a1a1c, #0f0f10)',
              color: '#666'
            }}
          >
            {totalQueue}/{QUEUE_MAX}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        
        {/* ═══════════════════════════════════════════════════════════════════
            GENERATE POST - The Stamp Press
        ═══════════════════════════════════════════════════════════════════ */}
        <div 
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(145deg, #111113, #0a0a0b)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.02), 0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, #1a1a1c, #0f0f10)',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#e8e8e8]">Create Content</h3>
                <p className="text-xs text-[#555] mt-0.5">
                  {contentCount > 0 
                    ? `${contentCount} quotes • ${styleName || "default"} style`
                    : "Add quotes first"
                  }
                </p>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating || contentCount === 0 || cooldownSeconds > 0}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center gap-2"
              style={{
                background: cooldownSeconds > 0
                  ? 'linear-gradient(145deg, #1a1a1c, #0f0f10)'
                  : contentCount > 0 
                    ? 'linear-gradient(145deg, #f59e0b, #d97706)' 
                    : 'linear-gradient(145deg, #1a1a1c, #0f0f10)',
                boxShadow: cooldownSeconds > 0
                  ? 'inset 0 1px 2px rgba(0,0,0,0.3)'
                  : contentCount > 0
                    ? '0 2px 8px rgba(245,158,11,0.3), inset 0 1px 1px rgba(255,255,255,0.2)'
                    : 'inset 0 1px 2px rgba(0,0,0,0.3)',
                color: cooldownSeconds > 0 ? '#666' : contentCount > 0 ? '#0c0c0d' : '#444',
                opacity: generating ? 0.7 : 1
              }}
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Creating...
                </>
              ) : cooldownSeconds > 0 ? (
                <>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {formatCooldown(cooldownSeconds)}
                </>
              ) : (
                <>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  Generate
                </>
              )}
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            IN THE FACTORY
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
              <StatusLight active={inFactory.length > 0} color="amber" size={18} />
              <h3 className="text-sm font-medium text-[#e8e8e8]">In the Factory</h3>
            </div>
            {inFactory.length > 0 && (
              <span className="text-xs font-medium text-[#f59e0b]">{inFactory.length}</span>
            )}
          </div>

          <div className="p-4">
            <ImageCard
              image={currentInFactory}
              imageUrl={currentInFactory?.url || currentInFactory?.thumbnail_url}
              index={inFactoryIndex}
              total={inFactory.length}
              onRed={handleDiscardRaw}
              onGreen={currentInFactory?.status === "pending_review" ? handleSendToFactory : handleRushStyle}
              redLabel="Discard"
              greenLabel={currentInFactory?.status === "pending_review" ? "Style It" : "Rush"}
              isProcessing={currentInFactory?.status === "styling"}
              emptyIcon={
                <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" className="mx-auto">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M12 8v8M8 12h8"/>
                </svg>
              }
              emptyTitle="Nothing waiting"
              emptySubtitle="Upload images to style them"
            />

            {inFactory.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-4">
                {inFactory.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setInFactoryIndex(i)}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{
                      background: i === inFactoryIndex ? '#f59e0b' : '#333',
                      boxShadow: i === inFactoryIndex ? '0 0 6px rgba(245,158,11,0.5)' : 'none'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            FRESH FROM FACTORY
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
              <StatusLight active={fromFactory.length > 0} color="green" size={18} />
              <h3 className="text-sm font-medium text-[#e8e8e8]">Fresh from Factory</h3>
            </div>
            {fromFactory.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePostNow}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(145deg, #3b82f6, #2563eb)',
                    boxShadow: '0 2px 6px rgba(59,130,246,0.3), inset 0 1px 1px rgba(255,255,255,0.2)',
                    color: '#fff'
                  }}
                >
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                  Post
                </button>
                <span className="text-xs font-medium text-[#22c55e]">{fromFactory.length}</span>
              </div>
            )}
          </div>

          <div className="p-4">
            <ImageCard
              image={currentFromFactory}
              imageUrl={currentFromFactory?.styled_url}
              index={fromFactoryIndex}
              total={fromFactory.length}
              onRed={handleRejectStyled}
              onGreen={handleApproveStyled}
              redLabel="Reject"
              greenLabel="Approve"
              emptyIcon={
                <svg width={32} height={32} viewBox="0 0 24 24" fill="#22c55e" className="mx-auto" opacity="0.5">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              }
              emptyTitle="All caught up!"
              emptySubtitle="Styled images appear here"
            />

            {fromFactory.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-4">
                {fromFactory.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFromFactoryIndex(i)}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{
                      background: i === fromFactoryIndex ? '#22c55e' : '#333',
                      boxShadow: i === fromFactoryIndex ? '0 0 6px rgba(34,197,94,0.5)' : 'none'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            TOP CONTENT
        ═══════════════════════════════════════════════════════════════════ */}
        <div 
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #111113, #0a0a0b)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.02), 0 4px 12px rgba(0,0,0,0.3)'
          }}
        >
          <div className="flex items-center gap-2 p-4 border-b border-white/5">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="#f59e0b">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <h3 className="text-sm font-medium text-[#888]">Top Content</h3>
          </div>
          
          <div className="p-4">
            {topPostsLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-[#333] border-t-[#f59e0b] rounded-full animate-spin" />
              </div>
            ) : !topPosts?.has_insights ? (
              <div className="text-center py-4">
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" className="mx-auto mb-2">
                  <path d="M12 15l-2 5 9-9H4l9 9-2-5M12 2v4"/>
                </svg>
                <p className="text-xs text-[#555]">Top performers appear once you start posting</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topPosts.best_ever && (
                  <div 
                    className="rounded-xl p-3"
                    style={{ background: 'rgba(255,255,255,0.02)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="#f59e0b">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span className="text-xs font-medium text-[#f59e0b]">All-Time Best</span>
                    </div>
                    <div className="flex gap-3">
                      <div 
                        className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
                        style={{
                          background: 'linear-gradient(145deg, #555, #333)',
                          padding: '2px'
                        }}
                      >
                        <div className="w-full h-full rounded-md overflow-hidden bg-[#0a0a0a]">
                          {topPosts.best_ever.image_url && <img src={topPosts.best_ever.image_url} alt="" className="w-full h-full object-cover" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#888] line-clamp-2">{topPosts.best_ever.caption || "No caption"}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-[#666]">
                          <span className="flex items-center gap-1">
                            <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            {topPosts.best_ever.metrics.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor">
                              <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
                            </svg>
                            {topPosts.best_ever.metrics.comments}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {topPosts?.monthly_top?.length > 0 && (
                  <div>
                    <span className="text-xs text-[#555] mb-2 block">This Month</span>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {topPosts?.monthly_top?.slice(0, 3).map((post, i) => (
                        <div 
                          key={post.id} 
                          className="relative aspect-square rounded-lg overflow-hidden"
                          style={{
                            background: 'linear-gradient(145deg, #444, #222)',
                            padding: '2px'
                          }}
                        >
                          <div className="w-full h-full rounded-md overflow-hidden bg-[#0a0a0a] relative">
                            {post.image_url && <img src={post.image_url} alt="" className="w-full h-full object-cover" />}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 text-xs text-white/80">
                              <svg width={8} height={8} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                              </svg>
                              {post.metrics.likes}
                            </div>
                            <div 
                              className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                              style={{
                                background: 'linear-gradient(145deg, #f59e0b, #d97706)',
                                color: '#0c0c0d'
                              }}
                            >
                              {i + 1}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Publish modal */}
      {publishingAssetId && (
        <PublishPreviewModal
          assetId={publishingAssetId}
          jwt={jwt}
          onClose={() => setPublishingAssetId(null)}
          onPublished={handlePublished}
        />
      )}
    </div>
  );
}
