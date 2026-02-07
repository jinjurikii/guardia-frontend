"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ClientContext } from "./LobbyShell";
import PublishPreviewModal from "./PublishPreviewModal";

/**
 * GUARDIA GALLERY — Content Workbench
 *
 * Desert Mirage design language (LIGHT theme):
 * - Cream palette (#FAF6F1, #F0E8E0)
 * - Gold accent (#C9A227) for in-progress states
 * - Indigo CTAs (#4338CA) for primary actions
 * - Warm grays, soft shadows, grain texture
 *
 * Sections:
 * - Upload Review: new uploads needing confirmation
 * - The Factory: merged showcase window (finished) + conveyor belt (processing)
 *
 * Budget-aware: counter shows posts_used/posts_limit with tier-based colors
 */

const API_BASE = "https://api.guardiacontent.com";

// Deep compare gallery items to prevent unnecessary re-renders
function arraysEqual(a: GalleryImage[], b: GalleryImage[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id || a[i].status !== b[i].status || a[i].styled_url !== b[i].styled_url) {
      return false;
    }
  }
  return true;
}

interface GalleryImage {
  url?: string;
  id: number;
  original_filename: string;
  status: "pending" | "styled" | "approved" | "rejected" | "processing" | "ready" | "failed" | "queued" | "raw" | "styling" | "pending_review" | "received";
  styled_url?: string;
  original_url?: string;
  thumbnail_url?: string;
  uploaded_at: string;
  caption?: string;
}

interface GalleryTabProps {
  client: ClientContext | null;
  jwt: string | null;
  onMessage: (msg: string) => void;
  onSwitchToGio?: (context?: string) => void;
}

// Status dot for section headers
function StatusDot({ active, color = "gold" }: { active: boolean; color?: "gold" | "green" | "gray" }) {
  const colors = {
    gold: "#C9A227",
    green: "#22c55e",
    gray: "#9CA3AF",
  };

  return (
    <div
      className={`w-2 h-2 rounded-full transition-all ${active ? "animate-pulse" : ""}`}
      style={{
        background: active ? colors[color] : "#D1D5DB",
        boxShadow: active ? `0 0 8px ${colors[color]}40` : "none",
      }}
    />
  );
}

// Image card for review sections
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
  emptySubtitle
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
}) {
  if (!image || total === 0) {
    return (
      <div className="rounded-xl p-6 text-center bg-[var(--bg-elevated)] border border-[var(--border)]">
        {emptyIcon}
        <p className="text-sm font-medium text-[var(--text-secondary)] mt-3">{emptyTitle}</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">{emptySubtitle}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Soft-shadow framed image */}
      <div className="relative mx-auto" style={{ maxWidth: 260 }}>
        <div
          className="rounded-xl overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border)]"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="aspect-square bg-[var(--bg-surface)]">
            {imageUrl ? (
              <img src={imageUrl} alt={image.original_filename || "image"} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="p-3 border-t border-[var(--border)]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-[var(--text-primary)] truncate flex-1">{image.original_filename || "Image"}</p>
              <span className="text-xs text-[var(--text-muted)] ml-2">{index + 1}/{total}</span>
            </div>
            {image.caption && (
              <p className="text-xs text-[var(--text-secondary)] mt-1.5 line-clamp-2">{image.caption}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-3 mt-4">
        <button
          onClick={onRed}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all active:scale-95 bg-[var(--bg-elevated)] border border-[var(--border)] text-red-600 hover:bg-red-50 hover:border-red-200"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
          {redLabel}
        </button>
        <button
          onClick={onGreen}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all active:scale-95 text-white"
          style={{
            background: "#4338CA",
            boxShadow: "0 2px 8px rgba(67, 56, 202, 0.3)",
          }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          {greenLabel}
        </button>
      </div>
    </div>
  );
}

// Queue status badge for conveyor belt tooltip
function QueueStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; text: string; pulse?: boolean }> = {
    pending_review: { label: "New", bg: "#E5E7EB", text: "#6B7280" },
    received: { label: "New", bg: "#E5E7EB", text: "#6B7280" },
    raw: { label: "Waiting", bg: "#FEF3C7", text: "#B45309" },
    queued: { label: "Queued", bg: "#FEF3C7", text: "#B45309" },
    styling: { label: "Styling", bg: "#FDE68A", text: "#92400E", pulse: true },
    processing: { label: "Styling", bg: "#FDE68A", text: "#92400E", pulse: true },
    ready: { label: "Done", bg: "#D1FAE5", text: "#065F46" },
    styled: { label: "Done", bg: "#D1FAE5", text: "#065F46" },
  };
  const c = config[status] || { label: status, bg: "#F3F4F6", text: "#6B7280" };

  return (
    <span
      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide ${c.pulse ? "animate-pulse" : ""}`}
      style={{ background: c.bg, color: c.text }}
    >
      {c.label}
    </span>
  );
}

// Relative time helper
function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

// Cap-reached overlay card
function CapReachedCard({
  currentImage,
  postsLimit,
  tier
}: {
  currentImage: GalleryImage | null;
  postsLimit: number;
  tier?: string;
}) {
  return (
    <div className="relative mx-auto" style={{ maxWidth: 260 }}>
      <div
        className="rounded-xl overflow-hidden bg-[var(--bg-elevated)] border-2 border-amber-300"
        style={{ boxShadow: "0 0 16px rgba(245,158,11,0.15)" }}
      >
        <div className="aspect-square bg-[var(--bg-surface)] relative">
          {currentImage?.styled_url && (
            <img
              src={currentImage.styled_url}
              alt={currentImage.original_filename || "image"}
              className="w-full h-full object-cover opacity-40"
            />
          )}
          <div className="absolute inset-0 bg-amber-50/80 flex flex-col items-center justify-center p-4 text-center">
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" className="mb-2">
              <path d="M12 9v4M12 17h.01"/>
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            <p className="text-sm font-semibold text-amber-800">Monthly limit reached</p>
            <p className="text-xs text-amber-700 mt-1">{postsLimit} posts scheduled this month</p>
            <p className="text-xs text-amber-600 mt-0.5">This content is ready for next month</p>
            {tier !== "unleashed" && (
              <button
                className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all active:scale-95"
                style={{
                  background: "#4338CA",
                  boxShadow: "0 2px 8px rgba(67, 56, 202, 0.3)",
                }}
                onClick={() => window.open("https://guardiacontent.com/#pricing", "_blank")}
              >
                Unlock More Posts
              </button>
            )}
          </div>
        </div>
        {currentImage && (
          <div className="p-3 border-t border-amber-200 bg-amber-50/50">
            <p className="text-xs font-medium text-amber-800 truncate">{currentImage.original_filename || "Image"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GalleryTab({ client, jwt, onMessage, onSwitchToGio }: GalleryTabProps) {
  // Split into three categories
  const [uploadReview, setUploadReview] = useState<GalleryImage[]>([]); // pending_review, received
  const [fromFactory, setFromFactory] = useState<GalleryImage[]>([]);   // ready, styled
  const [inQueue, setInQueue] = useState<GalleryImage[]>([]);           // raw, queued, styling

  const [uploading, setUploading] = useState(false);
  const [recentUpload, setRecentUpload] = useState(false);
  const isInitialLoad = useRef(true);
  const [loading, setLoading] = useState(true);
  const [uploadReviewIndex, setUploadReviewIndex] = useState(0);
  const [fromFactoryIndex, setFromFactoryIndex] = useState(0);
  const [publishingAssetId, setPublishingAssetId] = useState<number | null>(null);

  // Budget state
  const [postsUsed, setPostsUsed] = useState(0);
  const [postsLimit, setPostsLimit] = useState(12);
  const [slotsLimit, setSlotsLimit] = useState(30);

  const loadGallery = useCallback(async () => {
    if (!jwt) return;
    if (isInitialLoad.current) {
      setLoading(true);
    }
    try {
      const res = await fetch(`${API_BASE}/lobby/gallery`, { headers: { Authorization: `Bearer ${jwt}` } });
      if (res.ok) {
        const data = await res.json();
        const items = data.items || [];

        // Budget data
        setPostsUsed(data.posts_used ?? 0);
        setPostsLimit(data.posts_limit ?? 12);
        setSlotsLimit(data.slots_limit ?? 30);

        // Upload Review: needs client confirmation
        const newUploadReview = items.filter((img: GalleryImage) =>
          img.status === "pending_review" || img.status === "received"
        );

        // In Queue: processing in factory (raw/queued/styling)
        const newInQueue = items.filter((img: GalleryImage) =>
          img.status === "raw" || img.status === "queued" || img.status === "styling" || img.status === "processing"
        );

        // From Factory: ready for approval
        const newFromFactory = items.filter((img: GalleryImage) =>
          img.status === "ready" || img.status === "styled"
        );

        setUploadReview(prev => arraysEqual(prev, newUploadReview) ? prev : newUploadReview);
        setInQueue(prev => arraysEqual(prev, newInQueue) ? prev : newInQueue);
        setFromFactory(prev => arraysEqual(prev, newFromFactory) ? prev : newFromFactory);
      }
    } catch (err) {
      console.error("Failed to load gallery:", err);
    }
    if (isInitialLoad.current) {
      setLoading(false);
      isInitialLoad.current = false;
    }
  }, [jwt]);

  useEffect(() => { loadGallery(); }, [loadGallery]);

  // Poll when items are in queue or after recent upload
  useEffect(() => {
    if (inQueue.length === 0 && uploadReview.length === 0 && !recentUpload) return;

    const pollTimer = setInterval(() => {
      if (!document.hidden) {
        loadGallery();
      }
    }, 3000);

    return () => clearInterval(pollTimer);
  }, [inQueue.length, uploadReview.length, recentUpload, loadGallery]);

  useEffect(() => {
    if (!recentUpload) return;
    const timeout = setTimeout(() => setRecentUpload(false), 30000);
    return () => clearTimeout(timeout);
  }, [recentUpload]);

  // Actions
  const handleDiscardUpload = async () => {
    if (uploadReview.length === 0) return;
    const img = uploadReview[uploadReviewIndex];
    try {
      await fetch(`${API_BASE}/lobby/gallery/${img.id}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setUploadReview(items => items.filter((_, i) => i !== uploadReviewIndex));
      setUploadReviewIndex(i => Math.min(i, Math.max(0, uploadReview.length - 2)));
      onMessage(`Discarded "${img.original_filename || 'image'}".`);
    } catch {
      onMessage("Had trouble with that. Let's try again.");
    }
  };

  const handleSendToFactory = async () => {
    if (uploadReview.length === 0 || !jwt) return;
    const img = uploadReview[uploadReviewIndex];
    try {
      const res = await fetch(`${API_BASE}/lobby/gallery/${img.id}/send-to-factory`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const data = await res.json();
      if (data.success) {
        onMessage(data.message || "Sent to polish! Check the queue below.");
      } else {
        onMessage(data.message || "Couldn't send to factory. Try again?");
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
    setFromFactory(items => items.filter((_, i) => i !== fromFactoryIndex));
    setFromFactoryIndex(i => Math.min(i, Math.max(0, fromFactory.length - 2)));
    fetch(`${API_BASE}/lobby/gallery/${img.id}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
    }).catch(() => loadGallery());
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
    const totalQueue = uploadReview.length + inQueue.length + fromFactory.length;
    if (totalQueue >= slotsLimit) {
      onMessage(`Queue is full (${slotsLimit} max). Approve or discard items to make room.`);
      return;
    }
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
      if (data.success) {
        onMessage(`Uploaded "${file.name}"! Review it below.`);
        setRecentUpload(true);
        loadGallery();
      }
      else { onMessage(data.message || "Upload failed."); }
    } catch { onMessage("Upload failed."); }
    setUploading(false);
    e.target.value = "";
  };

  // Showcase empty state logic
  const getShowcaseEmpty = () => {
    if (postsUsed >= postsLimit && fromFactory.length > 0) {
      return null; // handled by CapReachedCard
    }
    if (inQueue.length > 0) {
      return {
        title: "Polishing in progress",
        subtitle: `${inQueue.length} item${inQueue.length > 1 ? "s" : ""} in the factory`,
        icon: (
          <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="1.5" className="mx-auto">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        ),
      };
    }
    if (uploadReview.length > 0) {
      return {
        title: "Review your uploads first",
        subtitle: "Approve them above to start polishing",
        icon: (
          <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" className="mx-auto">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3"/>
          </svg>
        ),
      };
    }
    return {
      title: "All caught up!",
      subtitle: "Upload images to get started",
      icon: (
        <svg width={32} height={32} viewBox="0 0 24 24" fill="#22c55e" className="mx-auto" opacity="0.4">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
    };
  };

  const currentUploadReview = uploadReview[uploadReviewIndex];
  const currentFromFactory = fromFactory[fromFactoryIndex];
  const totalQueue = uploadReview.length + inQueue.length + fromFactory.length;

  // Budget display
  const budgetRatio = postsLimit > 0 ? postsUsed / postsLimit : 0;
  const budgetColor = budgetRatio >= 1 ? "#EF4444" : budgetRatio >= 0.8 ? "#F59E0B" : "var(--text-muted)";
  const budgetBg = budgetRatio >= 1 ? "#FEE2E2" : budgetRatio >= 0.8 ? "#FEF3C7" : "var(--bg-surface)";
  const isCapReached = postsUsed >= postsLimit;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[var(--bg-base)] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Gallery</h2>
        <div className="flex items-center gap-2">
          <label
            className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm cursor-pointer transition-all active:scale-95 text-white"
            style={{
              background: "#4338CA",
              boxShadow: "0 2px 8px rgba(67, 56, 202, 0.3)",
            }}
          >
            <input type="file" accept=".jpg,.jpeg,.png,.webp,.heic" onChange={handleUpload} className="hidden" disabled={uploading} />
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            {uploading ? "..." : "Add"}
          </label>
          {/* Budget counter */}
          <div
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)]"
            style={{ background: budgetBg, color: budgetColor }}
          >
            {postsUsed}/{postsLimit}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">

        {/* ═══════════════════════════════════════════════════════════════════
            UPLOAD REVIEW — New uploads needing confirmation
        ═══════════════════════════════════════════════════════════════════ */}
        <div
          className="rounded-2xl overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border)]"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <StatusDot active={uploadReview.length > 0} color="gold" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Upload Review</h3>
            </div>
            {uploadReview.length > 0 && (
              <span className="text-xs font-semibold" style={{ color: "#C9A227" }}>{uploadReview.length}</span>
            )}
          </div>

          <div className="p-4">
            <ImageCard
              image={currentUploadReview}
              imageUrl={currentUploadReview?.url || currentUploadReview?.thumbnail_url}
              index={uploadReviewIndex}
              total={uploadReview.length}
              onRed={handleDiscardUpload}
              onGreen={handleSendToFactory}
              redLabel="Discard"
              greenLabel="Polish It"
              emptyIcon={
                <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" className="mx-auto">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M12 8v8M8 12h8"/>
                </svg>
              }
              emptyTitle="Nothing to review"
              emptySubtitle="Upload images to get started"
            />

            {uploadReview.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-4">
                {uploadReview.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setUploadReviewIndex(i)}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{
                      background: i === uploadReviewIndex ? '#C9A227' : '#D1D5DB',
                      boxShadow: i === uploadReviewIndex ? '0 0 6px rgba(201,162,39,0.4)' : 'none'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            THE FACTORY — Showcase Window + Conveyor Belt
        ═══════════════════════════════════════════════════════════════════ */}
        <div
          className="rounded-2xl overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border)]"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          {/* Factory Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <StatusDot
                active={fromFactory.length > 0 || inQueue.length > 0}
                color={fromFactory.length > 0 ? "green" : "gold"}
              />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">The Factory</h3>
            </div>
            <div className="flex items-center gap-2">
              {fromFactory.length > 0 && !isCapReached && (
                <button
                  onClick={handlePostNow}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 text-white"
                  style={{
                    background: "#4338CA",
                    boxShadow: "0 2px 6px rgba(67, 56, 202, 0.25)",
                  }}
                >
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                  Post
                </button>
              )}
              {fromFactory.length > 0 && (
                <span className="text-xs font-semibold text-green-600">{fromFactory.length} ready</span>
              )}
              {inQueue.length > 0 && fromFactory.length === 0 && (
                <span className="text-xs text-[var(--text-muted)]">{inQueue.length} processing</span>
              )}
            </div>
          </div>

          {/* TOP ZONE: Showcase Window */}
          <div className="p-4">
            {isCapReached && fromFactory.length > 0 ? (
              /* Cap reached — show amber overlay */
              <CapReachedCard
                currentImage={currentFromFactory}
                postsLimit={postsLimit}
                tier={client?.tier}
              />
            ) : fromFactory.length > 0 ? (
              /* Normal showcase — show ImageCard */
              <ImageCard
                image={currentFromFactory}
                imageUrl={currentFromFactory?.styled_url}
                index={fromFactoryIndex}
                total={fromFactory.length}
                onRed={handleRejectStyled}
                onGreen={handleApproveStyled}
                redLabel="Reject"
                greenLabel="Approve"
                emptyIcon={<></>}
                emptyTitle=""
                emptySubtitle=""
              />
            ) : (
              /* Empty showcase — contextual message */
              (() => {
                const empty = getShowcaseEmpty();
                if (!empty) return null;
                return (
                  <div className="rounded-xl p-6 text-center bg-[var(--bg-elevated)] border border-[var(--border)]">
                    {empty.icon}
                    <p className="text-sm font-medium text-[var(--text-secondary)] mt-3">{empty.title}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{empty.subtitle}</p>
                  </div>
                );
              })()
            )}

            {/* Arrow navigation for showcase */}
            {fromFactory.length > 1 && (
              <div className="flex justify-center items-center gap-4 mt-4">
                <button
                  onClick={() => setFromFactoryIndex(i => Math.max(0, i - 1))}
                  disabled={fromFactoryIndex === 0}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 bg-[var(--bg-surface)] border border-[var(--border)] disabled:opacity-30"
                >
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                </button>
                <span className="text-xs text-[var(--text-muted)] tabular-nums">
                  {fromFactoryIndex + 1} / {fromFactory.length}
                </span>
                <button
                  onClick={() => setFromFactoryIndex(i => Math.min(fromFactory.length - 1, i + 1))}
                  disabled={fromFactoryIndex === fromFactory.length - 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 bg-[var(--bg-surface)] border border-[var(--border)] disabled:opacity-30"
                >
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          {inQueue.length > 0 && <div className="border-t border-[var(--border)]" />}

          {/* BOTTOM ZONE: Conveyor Belt */}
          {inQueue.length > 0 && (
            <div className="px-3 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse" />
                <span className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Processing</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollSnapType: "x mandatory" }}>
                {inQueue.map((img) => {
                  const isProcessing = img.status === "styling" || img.status === "processing";
                  return (
                    <div
                      key={img.id}
                      className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden relative"
                      style={{
                        scrollSnapAlign: "start",
                        border: isProcessing ? "2px solid #C9A227" : "1px solid var(--border)",
                        boxShadow: isProcessing ? "0 0 12px rgba(201,162,39,0.4)" : "none",
                      }}
                    >
                      {(img.url || img.thumbnail_url) ? (
                        <img src={img.url || img.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[var(--bg-base)] flex items-center justify-center">
                          <div className="w-3 h-3 border border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
                        </div>
                      )}
                      {/* Pulse overlay for active processing */}
                      {isProcessing && (
                        <div
                          className="absolute inset-0 rounded-lg animate-pulse pointer-events-none"
                          style={{ background: "rgba(201,162,39,0.08)" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Budget warning banner */}
        {isCapReached && fromFactory.length === 0 && (
          <div
            className="rounded-2xl p-4 border border-amber-200"
            style={{ background: "#FFFBEB" }}
          >
            <div className="flex items-start gap-3">
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" className="flex-shrink-0 mt-0.5">
                <path d="M12 9v4M12 17h.01"/>
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">
                  You&apos;ve used all {postsLimit} posts this month
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  New uploads will be saved for next month.
                  {client?.tier !== "unleashed" && " Upgrade your plan to unlock more."}
                </p>
              </div>
            </div>
          </div>
        )}
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
