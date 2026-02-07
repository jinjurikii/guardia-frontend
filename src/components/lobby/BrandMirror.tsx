"use client";

import { useState, useEffect } from "react";

const API_BASE = "https://api.guardiacontent.com";

interface BrandMirrorProps {
  clientId: string;
  jwt: string;
  onStyleUpdated?: () => void;
}

interface BrandData {
  identity: {
    name: string;
    industry: string | null;
    soul: string | null;
    differentiator: string | null;
  };
  colors: string[];
  voice: {
    summary: string | null;
    traits: string[];
  };
  audience: {
    description: string | null;
  };
  visual: {
    style: string | null;
    polish_preset: string;
  };
  recent_posts: { styled_url: string; original_url: string }[];
}

interface Preset {
  id: string;
  name: string;
  description: string;
  gradient: string;
  accent: string;
}

const PRESETS: Preset[] = [
  { id: "natural", name: "Natural", description: "Minimal touch, colors stay true", gradient: "from-stone-600 to-stone-800", accent: "#a8a29e" },
  { id: "warm", name: "Warm", description: "Golden hour vibes, soft vignette", gradient: "from-amber-500 to-orange-700", accent: "#f59e0b" },
  { id: "crisp", name: "Crisp", description: "Sharp and punchy, enhanced clarity", gradient: "from-slate-400 to-slate-700", accent: "#94a3b8" },
  { id: "vibrant", name: "Vibrant", description: "Bold colors that pop on feeds", gradient: "from-fuchsia-500 to-purple-700", accent: "#d946ef" },
  { id: "moody", name: "Moody", description: "Dramatic, desaturated, film grain", gradient: "from-zinc-600 to-zinc-900", accent: "#71717a" },
  { id: "none", name: "None", description: "Zero processing, web-optimized only", gradient: "from-neutral-500 to-neutral-700", accent: "#737373" },
];

export default function BrandMirror({ clientId, jwt, onStyleUpdated }: BrandMirrorProps) {
  const [brand, setBrand] = useState<BrandData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const res = await fetch(`${API_BASE}/client/me/brand-mirror`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (res.ok) {
          setBrand(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch brand mirror:", err);
      }
      setLoading(false);
    };
    fetchBrand();
  }, [jwt]);

  const applyPreset = async (presetId: string) => {
    if (!brand || presetId === brand.visual.polish_preset || applying) return;
    setApplying(presetId);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/client/polish-preset`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ preset: presetId }),
      });
      if (res.ok) {
        setBrand({ ...brand, visual: { ...brand.visual, polish_preset: presetId } });
        onStyleUpdated?.();
      } else {
        const data = await res.json();
        setError(data.detail || "Failed to update");
      }
    } catch (err) {
      setError("Connection error");
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

  if (!brand) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--bg-base)]">
        <p className="text-[var(--text-muted)]">Unable to load brand profile</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[var(--bg-base)]">
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">

        {/* Identity */}
        <div className="rounded-2xl p-6" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shrink-0"
              style={{
                background: brand.colors[0] ? `${brand.colors[0]}25` : 'var(--bg-surface)',
                color: brand.colors[0] || 'var(--accent)',
              }}>
              {brand.identity.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">{brand.identity.name}</h2>
              {brand.identity.industry && (
                <p className="text-sm text-[var(--text-muted)] mt-0.5">{brand.identity.industry}</p>
              )}
              {brand.identity.differentiator && (
                <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">{brand.identity.differentiator}</p>
              )}
            </div>
          </div>
        </div>

        {/* Colors */}
        {brand.colors.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">Brand Colors</h3>
            <div className="flex gap-3">
              {brand.colors.map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-12 h-12 rounded-xl shadow-sm"
                    style={{ backgroundColor: color, border: '1px solid var(--border)' }}
                  />
                  <span className="text-xs text-[var(--text-muted)] font-mono">{color}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voice */}
        {(brand.voice.summary || brand.voice.traits.length > 0) && (
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">Voice & Tone</h3>
            {brand.voice.traits.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {brand.voice.traits.map((trait, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                    {trait}
                  </span>
                ))}
              </div>
            )}
            {brand.voice.summary && (
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{brand.voice.summary}</p>
            )}
          </div>
        )}

        {/* Audience */}
        {brand.audience.description && (
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">Audience</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{brand.audience.description}</p>
          </div>
        )}

        {/* Visual Style */}
        {brand.visual.style && (
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">Visual Style</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{brand.visual.style}</p>
          </div>
        )}

        {/* Recent Posts */}
        {brand.recent_posts.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">Recent Work</h3>
            <div className="grid grid-cols-3 gap-2">
              {brand.recent_posts.map((post, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <img src={post.styled_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 pt-2">
          <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
          <span className="text-xs text-[var(--text-muted)]">Photo Polish</span>
          <div className="h-px flex-1" style={{ background: 'var(--border)' }} />
        </div>

        {/* Polish Preset Selector */}
        <div>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            How your photos look after polish. Applies to all future uploads.
          </p>

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PRESETS.map((preset) => {
              const isActive = brand.visual.polish_preset === preset.id;
              const isApplying = applying === preset.id;

              return (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  disabled={isActive || !!applying}
                  className={`relative text-left rounded-xl overflow-hidden transition-all duration-200 ${
                    isActive ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-base)]" : "hover:scale-[1.02]"
                  } ${applying && !isApplying ? "opacity-50" : ""}`}
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                >
                  <div className={`h-14 bg-gradient-to-br ${preset.gradient} relative`}>
                    {isActive && (
                      <div className="absolute top-2 right-2 bg-[var(--accent)] text-[var(--bg-base)] text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Active
                      </div>
                    )}
                    {isApplying && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-[var(--text-primary)]">{preset.name}</h4>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-1">{preset.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom breathing room */}
        <div className="h-4" />
      </div>
    </div>
  );
}
