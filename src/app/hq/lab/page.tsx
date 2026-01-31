"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const API_BASE = "https://api.guardiacontent.com";

// ══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS - Based on dark UI research
// ══════════════════════════════════════════════════════════════════════════════
const tokens = {
  // Backgrounds (layered grays, not pure black)
  bg: {
    base: '#0a0a0a',      // Deepest layer
    elevated: '#111111',   // Cards, panels
    surface: '#1a1a1a',    // Interactive elements
  },
  // Text (not pure white - causes eye strain)
  text: {
    high: 'rgba(255,255,255,0.87)',    // Primary text
    medium: 'rgba(255,255,255,0.60)',  // Secondary
    low: 'rgba(255,255,255,0.38)',     // Disabled/hint
  },
  // Accent colors (slightly desaturated for dark mode)
  accent: {
    cyan: '#00d4d4',      // Kael's frequency - pending
    cyanGlow: 'rgba(0,212,212,0.15)',
    gold: '#e6c200',      // Canon/approved
    goldGlow: 'rgba(230,194,0,0.12)',
    crimson: '#c41e3a',   // Returned/rejected
    crimsonGlow: 'rgba(196,30,58,0.12)',
    purple: '#a855f7',    // Dropbox accent
    purpleGlow: 'rgba(168,85,247,0.15)',
  },
  // Borders
  border: {
    subtle: 'rgba(255,255,255,0.06)',
    medium: 'rgba(255,255,255,0.12)',
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════
interface Chapter {
  number: number;
  title: string;
  sections: number;
  approved: number;
  pending: number;
}

interface Draft {
  id: string;
  chapter: number;
  section: number;
  title: string;
  content: string;
  wordCount: number;
  status: 'pending' | 'approved' | 'returned';
  createdAt: string;
}

interface InboxFile {
  name: string;
  path: string;
  size: number;
  modified: string;
  type: string;
  url: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ══════════════════════════════════════════════════════════════════════════════
const mockChapters: Chapter[] = [
  { number: 1, title: "The Awakening", sections: 20, approved: 9, pending: 11 },
  { number: 2, title: "The Descent", sections: 18, approved: 0, pending: 0 },
  { number: 3, title: "The Convergence", sections: 0, approved: 0, pending: 0 },
];

const mockDrafts: Draft[] = Array.from({ length: 20 }, (_, i) => ({
  id: `draft-1-${i + 1}`,
  chapter: 1,
  section: i + 1,
  title: i === 0 ? "The Weight of Stars" : "",
  content: `The void between stars holds no warmth—only the eternal hum of frequencies too vast for mortal comprehension. Kael knew this. He had learned it in the way one learns the shape of grief: slowly, then all at once.

"Huh." The word escaped him like breath. Not surprise. Recognition.

The Pyramid's spire pierced the horizon, a needle threading sky to earth. Its shadow fell across the valley where the last of the Resonant gathered, their frequencies dimming like candles in a storm that had no wind.

Veyra stood at the cliff's edge, crimson light pulsing at her fingertips. She didn't turn when he approached. She never did.

"Your plan is insane," she said.

"You have a better one?"

The silence stretched. Below them, the Dying crept closer—not moving, not still, just... less. Where it touched, color drained. Sound flattened. Even memory seemed to thin, like parchment held too close to flame.

"...No." Her scowl deepened. "But I'm noting my objection."

"Noted."

The cyan runes on his coat flickered once. Twice. Then held steady.`,
  wordCount: 892 + i * 47,
  status: i < 9 ? 'approved' : 'pending',
  createdAt: '2026-01-16'
}));

// ══════════════════════════════════════════════════════════════════════════════
// MANGA PANEL - Clean borders with corner accents
// ══════════════════════════════════════════════════════════════════════════════
function MangaPanel({ children, accent = "cyan", glow = false, className = "" }: {
  children: React.ReactNode;
  accent?: "cyan" | "gold" | "crimson";
  glow?: boolean;
  className?: string;
}) {
  const colors = {
    cyan: { border: tokens.accent.cyan, glowColor: tokens.accent.cyanGlow },
    gold: { border: tokens.accent.gold, glowColor: tokens.accent.goldGlow },
    crimson: { border: tokens.accent.crimson, glowColor: tokens.accent.crimsonGlow },
  };
  const c = colors[accent];

  return (
    <div 
      className={`relative ${className}`}
      style={{ 
        background: tokens.bg.elevated,
        border: `2px solid ${c.border}`,
        boxShadow: glow ? `0 0 30px ${c.glowColor}, 0 0 60px ${c.glowColor}` : 'none',
      }}
    >
      {/* Corner brackets - manga panel style */}
      {[
        { top: -1, left: -1, borderTop: true, borderLeft: true },
        { top: -1, right: -1, borderTop: true, borderRight: true },
        { bottom: -1, left: -1, borderBottom: true, borderLeft: true },
        { bottom: -1, right: -1, borderBottom: true, borderRight: true },
      ].map((pos, i) => (
        <div 
          key={i}
          className="absolute w-4 h-4"
          style={{
            top: pos.top,
            left: pos.left,
            right: pos.right,
            bottom: pos.bottom,
            borderTop: pos.borderTop ? `3px solid ${c.border}` : 'none',
            borderLeft: pos.borderLeft ? `3px solid ${c.border}` : 'none',
            borderRight: pos.borderRight ? `3px solid ${c.border}` : 'none',
            borderBottom: pos.borderBottom ? `3px solid ${c.border}` : 'none',
          }}
        />
      ))}
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// BOOK SPINE
// ══════════════════════════════════════════════════════════════════════════════
function BookSpine({ chapter, isSelected, onClick }: {
  chapter: Chapter;
  isSelected: boolean;
  onClick: () => void;
}) {
  const hasContent = chapter.sections > 0;
  const progress = hasContent ? chapter.approved / chapter.sections : 0;
  const allApproved = chapter.approved === chapter.sections && hasContent;
  
  return (
    <button
      onClick={onClick}
      className="group relative transition-all duration-200"
      style={{
        width: '32px',
        height: '72px',
        background: isSelected 
          ? `linear-gradient(180deg, ${tokens.accent.cyanGlow} 0%, transparent 100%)`
          : tokens.bg.elevated,
        borderLeft: isSelected 
          ? `3px solid ${tokens.accent.cyan}` 
          : `2px solid ${tokens.border.medium}`,
        borderRight: `1px solid ${tokens.border.subtle}`,
        borderTop: `1px solid ${tokens.border.subtle}`,
        borderBottom: `1px solid ${tokens.border.subtle}`,
        transform: isSelected ? 'translateX(3px)' : 'none',
      }}
    >
      {/* Chapter number */}
      <span 
        className="absolute inset-0 flex items-center justify-center text-xs font-mono"
        style={{ 
          color: isSelected 
            ? tokens.accent.cyan 
            : hasContent 
              ? tokens.text.medium 
              : tokens.text.low,
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
        }}
      >
        {String(chapter.number).padStart(2, '0')}
      </span>
      
      {/* Progress fill from bottom */}
      {hasContent && (
        <div 
          className="absolute left-0 bottom-0 w-full transition-all duration-500"
          style={{
            height: `${progress * 100}%`,
            background: allApproved 
              ? `linear-gradient(0deg, ${tokens.accent.gold}40 0%, transparent 100%)`
              : `linear-gradient(0deg, ${tokens.accent.cyan}30 0%, transparent 100%)`,
            borderLeft: allApproved 
              ? `3px solid ${tokens.accent.gold}` 
              : isSelected 
                ? `3px solid ${tokens.accent.cyan}` 
                : `2px solid ${tokens.accent.cyan}50`,
          }}
        />
      )}
      
      {/* Pending badge */}
      {chapter.pending > 0 && (
        <div 
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
          style={{ 
            background: tokens.accent.cyan,
            color: '#000',
            boxShadow: `0 0 8px ${tokens.accent.cyanGlow}`
          }}
        >
          {chapter.pending}
        </div>
      )}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DROPBOX PANEL
// ══════════════════════════════════════════════════════════════════════════════
function DropboxPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [files, setFiles] = useState<InboxFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/lab/inbox`);
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (err) {
      console.error("Failed to fetch inbox:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchFiles();
  }, [isOpen, fetchFiles]);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    
    setUploading(true);
    for (const file of Array.from(fileList)) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const res = await fetch(`${API_BASE}/lab/upload`, {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          await fetchFiles();
        }
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
    setUploading(false);
  };

  const handleDelete = async (filename: string) => {
    try {
      const res = await fetch(`${API_BASE}/lab/file/inbox/${filename}`, { method: 'DELETE' });
      if (res.ok) {
        setFiles(prev => prev.filter(f => f.name !== filename));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose} 
      />
      
      {/* Panel */}
      <div 
        className="fixed bottom-0 left-16 w-80 z-50 flex flex-col max-h-[70vh]"
        style={{ 
          background: tokens.bg.base,
          border: `2px solid ${tokens.accent.purple}40`,
          borderBottom: 'none',
          boxShadow: `0 -4px 30px ${tokens.accent.purpleGlow}`,
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: `1px solid ${tokens.accent.purple}20` }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: tokens.accent.purple }}>◈</span>
            <span className="text-sm tracking-[0.15em]" style={{ color: tokens.accent.purple }}>
              DROPBOX
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded" style={{ 
              background: tokens.accent.purpleGlow, 
              color: tokens.accent.purple 
            }}>
              {files.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center transition-colors hover:opacity-70"
            style={{ color: tokens.text.low }}
          >
            ✕
          </button>
        </div>
        
        {/* Drop zone */}
        <div 
          className={`m-3 p-4 border-2 border-dashed transition-all cursor-pointer ${dragOver ? 'scale-[1.02]' : ''}`}
          style={{ 
            borderColor: dragOver ? tokens.accent.purple : tokens.border.medium,
            background: dragOver ? tokens.accent.purpleGlow : 'transparent',
          }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleUpload(e.dataTransfer.files);
          }}
          onClick={() => document.getElementById('dropbox-input')?.click()}
        >
          <input 
            id="dropbox-input"
            type="file" 
            multiple 
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <div className="text-center">
            <div className="text-2xl mb-2" style={{ color: tokens.accent.purple }}>
              {uploading ? '⟳' : '↑'}
            </div>
            <p className="text-xs" style={{ color: tokens.text.medium }}>
              {uploading ? 'Uploading...' : 'Drop files or click to upload'}
            </p>
          </div>
        </div>
        
        {/* Files list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {loading ? (
            <p className="text-center py-4 text-sm" style={{ color: tokens.text.low }}>Loading...</p>
          ) : files.length === 0 ? (
            <p className="text-center py-4 text-sm" style={{ color: tokens.text.low }}>Inbox empty</p>
          ) : (
            <div className="space-y-1">
              {files.map((file) => (
                <div 
                  key={file.name}
                  className="flex items-center gap-2 px-3 py-2 group transition-colors"
                  style={{ 
                    background: tokens.bg.elevated,
                    border: `1px solid ${tokens.border.subtle}`,
                  }}
                >
                  <span className="text-sm" style={{ color: file.type === 'image' ? '#4ade80' : file.type === 'video' ? '#f472b6' : tokens.text.low }}>
                    {file.type === 'image' ? '◻' : file.type === 'video' ? '▶' : '◇'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate" style={{ color: tokens.text.high }}>{file.name}</p>
                    <p className="text-[10px]" style={{ color: tokens.text.low }}>
                      {formatSize(file.size)} · {formatTime(file.modified)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(file.name)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1"
                    style={{ color: tokens.accent.crimson }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ARCHIVE SIDEBAR
// ══════════════════════════════════════════════════════════════════════════════
function TheArchive({ chapters, selected, onSelect, onDropboxOpen }: {
  chapters: Chapter[];
  selected: number;
  onSelect: (n: number) => void;
  onDropboxOpen: () => void;
}) {
  return (
    <div 
      className="flex flex-col items-center py-6"
      style={{ 
        width: '64px',
        background: `linear-gradient(90deg, ${tokens.bg.base} 0%, ${tokens.bg.elevated} 100%)`,
        borderRight: `1px solid ${tokens.border.subtle}`,
      }}
    >
      {/* Label */}
      <div 
        className="text-[9px] tracking-[0.4em] uppercase mb-6"
        style={{ 
          color: tokens.text.low,
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)'
        }}
      >
        Archive
      </div>
      
      {/* Spines */}
      <div className="flex-1 flex flex-col gap-2 items-center">
        {chapters.map((ch) => (
          <BookSpine 
            key={ch.number}
            chapter={ch}
            isSelected={selected === ch.number}
            onClick={() => onSelect(ch.number)}
          />
        ))}
      </div>
      
      {/* Dropbox button */}
      <button 
        onClick={onDropboxOpen}
        className="mt-4 w-7 h-7 flex items-center justify-center transition-all hover:scale-110"
        style={{ 
          border: `1px solid ${tokens.accent.purple}50`,
          color: tokens.accent.purple,
          background: tokens.accent.purpleGlow,
        }}
        title="Open Dropbox"
      >
        +
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PROSE RENDERER
// ══════════════════════════════════════════════════════════════════════════════
function ProseContent({ content }: { content: string }) {
  return (
    <div className="space-y-5">
      {content.split('\n\n').map((p, i) => {
        const isDialogue = p.startsWith('"') || p.startsWith('"');
        
        return (
          <p 
            key={i} 
            className="leading-[1.8]"
            style={{ 
              color: isDialogue ? tokens.text.high : tokens.text.medium,
              fontSize: '15px',
              fontFamily: 'Georgia, serif',
              paddingLeft: isDialogue ? '16px' : '0',
              borderLeft: isDialogue ? `2px solid ${tokens.accent.cyan}40` : 'none',
            }}
          >
            {p}
          </p>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MANUSCRIPT VIEW
// ══════════════════════════════════════════════════════════════════════════════
function TheManuscript({ draft, sectionIndex, totalSections, onPrev, onNext }: {
  draft: Draft | null;
  sectionIndex: number;
  totalSections: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (!draft) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl mb-4" style={{ color: tokens.text.low }}>◇</div>
          <p className="text-sm tracking-[0.2em] uppercase" style={{ color: tokens.text.low }}>
            The archive awaits
          </p>
          <p className="text-xs mt-2" style={{ color: tokens.border.medium }}>
            Select a chapter to begin
          </p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: { color: tokens.accent.cyan, label: 'AWAITING JUDGMENT', accent: 'cyan' as const },
    approved: { color: tokens.accent.gold, label: '— CANON —', accent: 'gold' as const },
    returned: { color: tokens.accent.crimson, label: 'RETURNED', accent: 'crimson' as const }
  };
  const status = statusConfig[draft.status];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-8 py-4"
        style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}
      >
        <div className="flex items-center gap-5">
          <span className="text-xs font-mono" style={{ color: tokens.text.low }}>
            CH.{draft.chapter} · §{draft.section}
          </span>
          <span 
            className="text-[10px] tracking-[0.25em] font-medium"
            style={{ color: status.color }}
          >
            {status.label}
          </span>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onPrev}
            disabled={sectionIndex === 0}
            className="w-9 h-9 flex items-center justify-center transition-all disabled:opacity-20"
            style={{ 
              border: `1px solid ${tokens.border.medium}`,
              color: tokens.text.medium,
              background: tokens.bg.surface,
            }}
          >
            ◄
          </button>
          <span className="text-xs font-mono px-3" style={{ color: tokens.text.low }}>
            {sectionIndex + 1} / {totalSections}
          </span>
          <button 
            onClick={onNext}
            disabled={sectionIndex === totalSections - 1}
            className="w-9 h-9 flex items-center justify-center transition-all disabled:opacity-20"
            style={{ 
              border: `1px solid ${tokens.border.medium}`,
              color: tokens.text.medium,
              background: tokens.bg.surface,
            }}
          >
            ►
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-10 py-8">
        <MangaPanel 
          accent={status.accent} 
          glow={draft.status === 'approved'}
          className="max-w-3xl mx-auto"
        >
          <div className="p-8">
            {draft.title && (
              <h2 
                className="text-xl font-light tracking-wide mb-6 pb-5"
                style={{ 
                  color: tokens.text.high,
                  borderBottom: `1px solid ${status.color}30`,
                  fontFamily: 'Georgia, serif',
                }}
              >
                {draft.title}
              </h2>
            )}
            
            <ProseContent content={draft.content} />
            
            <div 
              className="mt-8 pt-4 flex items-center justify-between text-xs"
              style={{ borderTop: `1px solid ${tokens.border.subtle}` }}
            >
              <span style={{ color: tokens.text.low }}>
                {draft.wordCount.toLocaleString()} words
              </span>
              <span style={{ color: tokens.text.low }}>
                {draft.createdAt}
              </span>
            </div>
          </div>
        </MangaPanel>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// VERDICT BAR
// ══════════════════════════════════════════════════════════════════════════════
function TheVerdict({ draft, onApprove, onReturn, onCanon }: {
  draft: Draft | null;
  onApprove: () => void;
  onReturn: () => void;
  onCanon: () => void;
}) {
  const [approving, setApproving] = useState(false);
  
  if (!draft || draft.status !== 'pending') return null;

  const handleApprove = () => {
    setApproving(true);
    setTimeout(() => {
      onApprove();
      setApproving(false);
    }, 500);
  };

  return (
    <div 
      className="px-8 py-4"
      style={{ 
        borderTop: `1px solid ${tokens.border.subtle}`,
        background: tokens.bg.elevated,
      }}
    >
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {/* Canon reference */}
        <button 
          onClick={onCanon}
          className="flex items-center gap-2 px-4 py-2 transition-all hover:opacity-80"
          style={{ 
            border: `1px solid ${tokens.accent.gold}30`,
            color: tokens.accent.gold,
            background: tokens.accent.goldGlow,
          }}
        >
          <span>◇</span>
          <span className="text-sm">Canon</span>
        </button>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onReturn}
            className="px-5 py-2 text-sm tracking-[0.15em] transition-all hover:opacity-80"
            style={{ 
              border: `2px solid ${tokens.accent.crimson}50`,
              color: tokens.accent.crimson,
            }}
          >
            RETURN
          </button>
          
          <button 
            onClick={handleApprove}
            disabled={approving}
            className="px-7 py-2 text-sm tracking-[0.15em] font-medium transition-all"
            style={{ 
              border: `2px solid ${tokens.accent.cyan}`,
              color: approving ? '#000' : tokens.accent.cyan,
              background: approving ? tokens.accent.cyan : tokens.accent.cyanGlow,
              boxShadow: `0 0 20px ${tokens.accent.cyanGlow}`,
            }}
          >
            {approving ? '✓ CANON' : 'APPROVE'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CANON SIDEBAR
// ══════════════════════════════════════════════════════════════════════════════
function CanonSidebar({ isOpen, onClose }: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  
  return (
    <>
      <div 
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose} 
      />
      <div 
        className="fixed top-0 right-0 h-full w-72 z-50 flex flex-col"
        style={{ 
          background: tokens.bg.base,
          borderLeft: `2px solid ${tokens.accent.gold}40`,
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${tokens.accent.gold}20` }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: tokens.accent.gold }}>◇</span>
            <span className="text-sm tracking-[0.2em]" style={{ color: tokens.accent.gold }}>
              CANON
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center"
            style={{ color: tokens.text.low }}
          >
            ✕
          </button>
        </div>
        
        {/* Search */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Search lore..."
            className="w-full px-4 py-2 text-sm focus:outline-none"
            style={{ 
              background: tokens.bg.surface, 
              border: `1px solid ${tokens.accent.gold}30`,
              color: tokens.text.high,
            }}
          />
        </div>
        
        {/* Quick links */}
        <div className="flex-1 px-4 overflow-y-auto">
          <div className="text-[9px] tracking-[0.2em] mb-3" style={{ color: tokens.text.low }}>
            QUICK ACCESS
          </div>
          {['Characters', 'Locations', 'Timeline', 'Magic System', 'The Dying'].map((item) => (
            <button
              key={item}
              className="w-full text-left px-3 py-2 transition-colors text-sm"
              style={{ 
                color: tokens.text.medium,
                borderBottom: `1px solid ${tokens.border.subtle}`,
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function LabPage() {
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [sectionIndex, setSectionIndex] = useState(9);
  const [canonOpen, setCanonOpen] = useState(false);
  const [dropboxOpen, setDropboxOpen] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>(mockDrafts);

  const chapterDrafts = drafts.filter(d => d.chapter === selectedChapter);
  const currentDraft = chapterDrafts[sectionIndex] || null;
  
  const pendingCount = drafts.filter(d => d.status === 'pending').length;
  const approvedCount = drafts.filter(d => d.status === 'approved').length;

  const handleApprove = () => {
    if (!currentDraft) return;
    setDrafts(prev => prev.map(d => 
      d.id === currentDraft.id ? { ...d, status: 'approved' } : d
    ));
    if (sectionIndex < chapterDrafts.length - 1) {
      setSectionIndex(i => i + 1);
    }
  };

  const handleReturn = () => {
    if (!currentDraft) return;
    setDrafts(prev => prev.map(d => 
      d.id === currentDraft.id ? { ...d, status: 'returned' } : d
    ));
  };

  return (
    <div 
      className="h-screen w-full overflow-hidden relative"
      style={{ background: tokens.bg.base, color: tokens.text.high }}
    >
      {/* Subtle ambient glow */}
      <div 
        className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${tokens.accent.cyanGlow} 0%, transparent 70%)`,
          transform: 'translate(-30%, -30%)',
        }}
      />
      <div 
        className="absolute bottom-0 right-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${tokens.accent.goldGlow} 0%, transparent 70%)`,
          transform: 'translate(30%, 30%)',
          opacity: 0.5,
        }}
      />

      {/* Header */}
      <header style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link 
              href="/hq"
              className="text-sm transition-colors hover:opacity-70" 
              style={{ color: tokens.text.low }}
            >
              ← HQ
            </Link>
            <div>
              <h1 
                className="text-lg tracking-[0.4em] font-light"
                style={{ color: tokens.accent.cyan }}
              >
                THE SCRIPTORIUM
              </h1>
              <p 
                className="text-[9px] tracking-[0.3em] mt-0.5 uppercase"
                style={{ color: tokens.text.low }}
              >
                Where words become canon
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-lg font-mono" style={{ color: tokens.accent.cyan }}>
                {pendingCount}
              </div>
              <div className="text-[9px] tracking-[0.15em]" style={{ color: tokens.text.low }}>
                PENDING
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-mono" style={{ color: tokens.accent.gold }}>
                {approvedCount}
              </div>
              <div className="text-[9px] tracking-[0.15em]" style={{ color: tokens.text.low }}>
                CANON
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="relative flex" style={{ height: 'calc(100vh - 73px)' }}>
        <TheArchive 
          chapters={mockChapters} 
          selected={selectedChapter} 
          onSelect={(n) => { setSelectedChapter(n); setSectionIndex(0); }}
          onDropboxOpen={() => setDropboxOpen(true)}
        />
        
        <div className="flex-1 flex flex-col min-h-0">
          <TheManuscript 
            draft={currentDraft}
            sectionIndex={sectionIndex}
            totalSections={chapterDrafts.length}
            onPrev={() => setSectionIndex(i => Math.max(0, i - 1))}
            onNext={() => setSectionIndex(i => Math.min(chapterDrafts.length - 1, i + 1))}
          />
          
          <TheVerdict 
            draft={currentDraft}
            onApprove={handleApprove}
            onReturn={handleReturn}
            onCanon={() => setCanonOpen(true)}
          />
        </div>
      </div>
      
      <CanonSidebar isOpen={canonOpen} onClose={() => setCanonOpen(false)} />
      <DropboxPanel isOpen={dropboxOpen} onClose={() => setDropboxOpen(false)} />
    </div>
  );
}
