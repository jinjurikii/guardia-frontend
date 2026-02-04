"use client";

import { useState, useEffect } from "react";

const API_BASE = "https://api.guardiacontent.com";

interface StyleProfile {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  mood: string | null;
  is_system: boolean;
}

interface StyleShowcaseProps {
  onSelect?: (style: StyleProfile) => void;
  onClose?: () => void;
}

// Color schemes for each showcase style
const styleColors: Record<string, { gradient: string; accent: string }> = {
  golden_hour_dreamer: { gradient: "from-amber-500/20 to-orange-500/20", accent: "text-amber-400" },
  bold_graphic_pop: { gradient: "from-rose-500/20 to-cyan-500/20", accent: "text-rose-400" },
  soft_studio_ghibli: { gradient: "from-sky-400/20 to-green-400/20", accent: "text-sky-400" },
  midnight_neon_pulse: { gradient: "from-fuchsia-500/20 to-cyan-500/20", accent: "text-fuchsia-400" },
  earthy_artisan_warmth: { gradient: "from-amber-700/20 to-stone-500/20", accent: "text-amber-600" },
  tropical_paradise_bold: { gradient: "from-teal-500/20 to-orange-400/20", accent: "text-teal-400" },
};

export default function StyleShowcase({ onSelect, onClose }: StyleShowcaseProps) {
  const [styles, setStyles] = useState<StyleProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const res = await fetch(`${API_BASE}/styles/showcase`);
        if (res.ok) {
          const data = await res.json();
          // Filter to just the 6 premium showcase styles
          const showcaseNames = [
            "golden_hour_dreamer",
            "bold_graphic_pop", 
            "soft_studio_ghibli",
            "midnight_neon_pulse",
            "earthy_artisan_warmth",
            "tropical_paradise_bold"
          ];
          const filtered = data.filter((s: StyleProfile) => showcaseNames.includes(s.name));
          setStyles(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch styles:", err);
      }
      setLoading(false);
    };

    fetchStyles();
  }, []);

  const handleSelect = (style: StyleProfile) => {
    setSelectedId(style.id);
    onSelect?.(style);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div>
          <h3 className="text-[var(--text-primary)] font-medium">Style Showcase</h3>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Curated visual identities for your brand</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-surface)] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Style Grid */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {styles.map((style) => {
          const colors = styleColors[style.name] || { gradient: "from-gray-500/20 to-gray-600/20", accent: "text-gray-400" };
          const isSelected = selectedId === style.id;

          return (
            <button
              key={style.id}
              onClick={() => handleSelect(style)}
              className={`group relative p-4 rounded-xl border transition-all duration-200 text-left
                ${isSelected 
                  ? "border-amber-500/50 bg-amber-500/10" 
                  : "border-[var(--border-subtle)] hover:border-[var(--border)] bg-gradient-to-br " + colors.gradient
                }
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Style name */}
              <h4 className={`font-medium ${colors.accent} mb-1`}>
                {style.display_name}
              </h4>

              {/* Description */}
              {style.description && (
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-2">
                  {style.description}
                </p>
              )}

              {/* Mood */}
              {style.mood && (
                <p className="text-xs text-[var(--text-muted)] line-clamp-1 italic">
                  {style.mood.split('.')[0]}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <p className="text-xs text-[var(--text-muted)] text-center">
          Or describe your vision and we&apos;ll create something custom
        </p>
      </div>
    </div>
  );
}
