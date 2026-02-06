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
 * - Upload Review: new uploads needing confirmation (pending_review/received)
 * - Fresh from Factory: styled images ready for approval (ready/styled)
 * - The Factory: queue view of everything in pipeline (raw/queued/styling)
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

const QUEUE_MAX = 30;

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

// Queue status badge for factory view
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

  const currentUploadReview = uploadReview[uploadReviewIndex];
  const currentFromFactory = fromFactory[fromFactoryIndex];
  const totalQueue = uploadReview.length + inQueue.length + fromFactory.length;

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
          <div className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border)]">
            {totalQueue}/{QUEUE_MAX}
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
            FRESH FROM FACTORY — Styled images ready for approval
        ═══════════════════════════════════════════════════════════════════ */}
        <div
          className="rounded-2xl overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border)]"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <StatusDot active={fromFactory.length > 0} color="green" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Fresh from Factory</h3>
            </div>
            {fromFactory.length > 0 && (
              <div className="flex items-center gap-2">
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
                <span className="text-xs font-semibold text-green-600">{fromFactory.length}</span>
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
                <svg width={32} height={32} viewBox="0 0 24 24" fill="#22c55e" className="mx-auto" opacity="0.4">
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
                      background: i === fromFactoryIndex ? '#22c55e' : '#D1D5DB',
                      boxShadow: i === fromFactoryIndex ? '0 0 6px rgba(34,197,94,0.4)' : 'none'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            THE FACTORY — Queue view of all images in pipeline
        ═══════════════════════════════════════════════════════════════════ */}
        <div
          className="rounded-2xl overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border)]"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <StatusDot active={inQueue.length > 0} color="gold" />
              <h3 className="text-sm font-semibold text-[var(--text-secondary)]">The Factory</h3>
            </div>
            {inQueue.length > 0 && (
              <span className="text-xs text-[var(--text-muted)]">{inQueue.length} processing</span>
            )}
          </div>

          <div className="p-3">
            {inQueue.length === 0 ? (
              <div className="text-center py-4">
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" className="mx-auto mb-2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M9 9h6M9 13h6M9 17h4"/>
                </svg>
                <p className="text-xs text-[var(--text-muted)]">Queue is empty</p>
              </div>
            ) : (
              <div className="space-y-2">
                {inQueue.map((img) => (
                  <div
                    key={img.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]"
                  >
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--bg-base)] border border-[var(--border)]">
                      {(img.url || img.thumbnail_url) ? (
                        <img src={img.url || img.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-3 h-3 border border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">{img.original_filename || "Image"}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{timeAgo(img.uploaded_at)}</p>
                    </div>

                    {/* Status badge */}
                    <QueueStatusBadge status={img.status} />
                  </div>
                ))}
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
