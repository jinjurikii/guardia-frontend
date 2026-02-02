"use client";

import { useState, useEffect } from "react";
import ChannelPersonality from "./ChannelPersonality";
import StyleCards from "./StyleCards";

/**
 * STYLE TAB — Channel Personality + Polish Presets
 */

const API_BASE = "https://api.guardiacontent.com";

interface StyleTabProps {
  clientId: string;
  jwt: string;
  onStyleUpdated?: () => void;
}

interface Preset {
  id: string;
  name: string;
  description: string;
  preview: {
    temperature: string;
    contrast: string;
    saturation: string;
    effect: string;
  };
  gradient: string;
  accent: string;
}

const PRESETS: Preset[] = [
  {
    id: "natural",
    name: "Natural",
    description: "Minimal touch that keeps your photos authentic. Very subtle sharpening, colors stay true.",
    preview: { temperature: "Neutral", contrast: "Unchanged", saturation: "True to life", effect: "Subtle sharpen" },
    gradient: "from-stone-600 to-stone-800",
    accent: "#a8a29e"
  },
  {
    id: "warm",
    name: "Warm",
    description: "Golden hour vibes. Adds warmth and a soft vignette for that cozy, inviting feel.",
    preview: { temperature: "+15%", contrast: "-10%", saturation: "Slightly boosted", effect: "Soft vignette" },
    gradient: "from-amber-500 to-orange-700",
    accent: "#f59e0b"
  },
  {
    id: "crisp",
    name: "Crisp",
    description: "Sharp and punchy. Higher contrast with enhanced clarity for products and food.",
    preview: { temperature: "Neutral", contrast: "+20%", saturation: "True to life", effect: "Strong sharpen" },
    gradient: "from-slate-400 to-slate-700",
    accent: "#94a3b8"
  },
  {
    id: "vibrant",
    name: "Vibrant",
    description: "Bold and eye-catching. Boosted colors and brightness that pop on social feeds.",
    preview: { temperature: "Slightly warm", contrast: "Balanced", saturation: "+25%", effect: "Brightness lift" },
    gradient: "from-fuchsia-500 to-purple-700",
    accent: "#d946ef"
  },
  {
    id: "moody",
    name: "Moody",
    description: "Dramatic and atmospheric. Lifted shadows, subtle desaturation, and film grain.",
    preview: { temperature: "Cool", contrast: "+15%", saturation: "-15%", effect: "Film grain" },
    gradient: "from-zinc-600 to-zinc-900",
    accent: "#71717a"
  },
  {
    id: "none",
    name: "None",
    description: "Zero processing. Your images stay exactly as uploaded — just optimized for web.",
    preview: { temperature: "Unchanged", contrast: "Unchanged", saturation: "Unchanged", effect: "Web optimization only" },
    gradient: "from-neutral-500 to-neutral-700",
    accent: "#737373"
  }
];

export default function StyleTab({ clientId, jwt, onStyleUpdated }: StyleTabProps) {
  const [currentPreset, setCurrentPreset] = useState<string>("natural");
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"cards" | "personality" | "polish">("cards");

  useEffect(() => {
    const fetchPreset = async () => {
      try {
        const res = await fetch(`${API_BASE}/client/me`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentPreset(data.polish_preset || "natural");
        }
      } catch (err) {
        console.error("Failed to fetch preset:", err);
      }
      setLoading(false);
    };
    fetchPreset();
  }, [jwt]);

  const applyPreset = async (presetId: string) => {
    if (presetId === currentPreset || applying) return;
    setApplying(presetId);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/client/polish-preset`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ preset: presetId }),
      });

      if (res.ok) {
        setCurrentPreset(presetId);
        onStyleUpdated?.();
      } else {
        const data = await res.json();
        setError(data.detail || "Failed to update preset");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    }
    setApplying(null);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-base)]">
      {/* Section Tabs */}
      <div className="sticky top-0 z-10 px-4 pt-4 pb-2" style={{ background: 'var(--bg-base)' }}>
        <div className="max-w-3xl mx-auto flex gap-2">
          <button
            onClick={() => setActiveSection("cards")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeSection === "cards"
                ? 'bg-[var(--accent)] text-[var(--bg-base)]'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            Style Cards
          </button>
          <button
            onClick={() => setActiveSection("personality")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeSection === "personality"
                ? 'bg-[var(--accent)] text-[var(--bg-base)]'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            Channel Personality
          </button>
          <button
            onClick={() => setActiveSection("polish")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeSection === "polish"
                ? 'bg-[var(--accent)] text-[var(--bg-base)]'
                : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            Polish Style
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          {activeSection === "cards" ? (
            <StyleCards jwt={jwt} clientId={clientId} onUpdated={onStyleUpdated} />
          ) : activeSection === "personality" ? (
            <ChannelPersonality jwt={jwt} onSaved={onStyleUpdated} />
          ) : (
            <>
              {/* Polish Header */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Polish Style</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Choose how your photos look after polish. Applies to all future uploads.
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Preset Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PRESETS.map((preset) => {
                  const isActive = currentPreset === preset.id;
                  const isApplying = applying === preset.id;

                  return (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset.id)}
                      disabled={isActive || !!applying}
                      className={`relative text-left rounded-2xl overflow-hidden transition-all duration-200 ${
                        isActive ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-base)]" : "hover:scale-[1.02]"
                      } ${applying && !isApplying ? "opacity-50" : ""}`}
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                    >
                      <div className={`h-20 bg-gradient-to-br ${preset.gradient} relative`}>
                        {isActive && (
                          <div className="absolute top-3 right-3 bg-[var(--accent)] text-[var(--bg-base)] text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Active
                          </div>
                        )}
                        {isApplying && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="text-base font-medium text-[var(--text-primary)] mb-1">{preset.name}</h3>
                        <p className="text-xs text-[var(--text-secondary)] mb-3 line-clamp-2">{preset.description}</p>
                        <div className="space-y-1 text-xs">
                          {Object.entries(preset.preview).map(([key, val]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-[var(--text-muted)] capitalize">{key}</span>
                              <span className="text-[var(--text-secondary)]">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {!isActive && !isApplying && (
                        <div className="px-4 pb-4">
                          <div
                            className="w-full py-2 rounded-lg text-xs font-medium text-center"
                            style={{ background: 'var(--bg-elevated)', color: preset.accent }}
                          >
                            Apply this style
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs text-[var(--text-muted)]">
                  Current: <span className="text-[var(--accent)] font-medium">{PRESETS.find(p => p.id === currentPreset)?.name}</span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
