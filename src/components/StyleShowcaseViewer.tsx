"use client";

import { useState, useEffect, useRef } from "react";

/* ─── Types ──────────────────────────────────────────────── */

export interface StyleOption {
  id: string;
  name: string;
  description: string;
  afterImage: string;
}

interface StyleShowcaseViewerProps {
  beforeImage: string;
  styles: StyleOption[];
  activeId?: string;
  onSelect?: (id: string) => void;
  compact?: boolean;
}

/* ─── Drag Slider ────────────────────────────────────────── */

function DragSlider({
  before,
  after,
  compact,
}: {
  before: string;
  after: string;
  compact?: boolean;
}) {
  const [pos, setPos] = useState(50);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePos = (clientX: number) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(2, Math.min(98, pct)));
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      updatePos(e.clientX);
    };
    const onUp = () => {
      dragging.current = false;
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative w-full overflow-hidden cursor-col-resize select-none touch-none ${
        compact ? "aspect-[16/10] rounded-xl" : "aspect-[4/3] rounded-2xl"
      }`}
      style={{ background: "var(--bg-surface, #1a1a1a)" }}
      onPointerDown={(e) => {
        dragging.current = true;
        updatePos(e.clientX);
      }}
    >
      {/* After image (full background) */}
      <img
        src={after}
        alt="After"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
        draggable={false}
        loading="lazy"
      />
      {/* Before image (clipped from right) */}
      <img
        src={before}
        alt="Before"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        draggable={false}
        loading="lazy"
      />

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 -translate-x-1/2 pointer-events-none"
        style={{ left: `${pos}%` }}
      >
        <div className="w-0.5 h-full bg-white/80 shadow-[0_0_6px_rgba(0,0,0,0.3)]" />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white border-2 border-[#C9A227] shadow-md flex items-center justify-center ${
          compact ? "w-7 h-7" : "w-9 h-9"
        }`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4.5 3L1.5 7L4.5 11" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.5 3L12.5 7L9.5 11" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className={`absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white font-semibold rounded-full uppercase tracking-wider pointer-events-none ${
        compact ? "text-[9px] px-2 py-0.5" : "text-[10px] px-2.5 py-1"
      }`}>
        Before
      </div>
      <div className={`absolute top-3 right-3 bg-[#C9A227]/90 backdrop-blur-sm text-white font-semibold rounded-full uppercase tracking-wider pointer-events-none ${
        compact ? "text-[9px] px-2 py-0.5" : "text-[10px] px-2.5 py-1"
      }`}>
        After
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */

export default function StyleShowcaseViewer({
  beforeImage,
  styles,
  activeId,
  onSelect,
  compact = false,
}: StyleShowcaseViewerProps) {
  const [selected, setSelected] = useState(activeId || styles[0]?.id || "");

  // Sync with external activeId changes
  useEffect(() => {
    if (activeId) setSelected(activeId);
  }, [activeId]);

  const activeStyle = styles.find((s) => s.id === selected) || styles[0];

  const handleSelect = (id: string) => {
    setSelected(id);
    onSelect?.(id);
  };

  return (
    <div className={compact ? "space-y-3" : "space-y-5"}>
      {/* Before/After viewer */}
      <DragSlider
        before={beforeImage}
        after={activeStyle?.afterImage || beforeImage}
        compact={compact}
      />

      {/* Style selector grid */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 ${compact ? "gap-2" : "gap-3"}`}>
        {styles.map((style) => {
          const isActive = style.id === selected;

          return (
            <button
              key={style.id}
              onClick={() => handleSelect(style.id)}
              className={`relative text-left rounded-xl transition-all duration-200 ${
                isActive
                  ? "ring-2 ring-[#C9A227] ring-offset-2 ring-offset-[var(--bg-base,#faf6f1)]"
                  : "hover:scale-[1.02]"
              }`}
              style={{
                background: "var(--bg-surface, #fff)",
                border: "1px solid var(--border, #e8ddd3)",
              }}
            >
              <div className={compact ? "p-2.5" : "p-3"}>
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium text-[var(--text-primary,#2a2a2a)] ${compact ? "text-xs" : "text-sm"}`}>
                    {style.name}
                  </h4>
                  {isActive && (
                    <span className="bg-[#C9A227] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Active
                    </span>
                  )}
                </div>
                <p className={`text-[var(--text-muted,#635c54)] mt-1 line-clamp-1 ${compact ? "text-[10px]" : "text-[11px]"}`}>
                  {style.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
