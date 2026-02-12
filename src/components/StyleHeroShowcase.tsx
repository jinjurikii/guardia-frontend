"use client";

import { useState, useEffect, useRef } from "react";

/* ─── Config ─────────────────────────────────────────────── */

const BASE = "https://api.guardiacontent.com/storage/showcase";

const NICHES = [
  { id: "bakery", name: "Bakery" },
  { id: "salon", name: "Salon" },
  { id: "restaurant", name: "Restaurant" },
  { id: "barbershop", name: "Barbershop" },
  { id: "tattoo", name: "Tattoo" },
  { id: "fitness", name: "Fitness" },
];

const STYLES = [
  { id: "natural", name: "Natural", description: "Minimal touch, colors stay true" },
  { id: "warm", name: "Warm", description: "Golden hour vibes, soft warmth" },
  { id: "crisp", name: "Crisp", description: "Sharp and punchy, enhanced clarity" },
  { id: "vibrant", name: "Vibrant", description: "Bold colors that pop on feeds" },
  { id: "moody", name: "Moody", description: "Cinematic, desaturated, editorial" },
];

/* ─── Drag Slider ────────────────────────────────────────── */

function DragSlider({ before, after }: { before: string; after: string }) {
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
    const onUp = () => { dragging.current = false; };
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
      className="relative w-full aspect-[16/10] md:aspect-[2/1] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(42,42,42,0.15)] cursor-col-resize select-none touch-none"
      style={{ background: "#1a1a1a" }}
      onPointerDown={(e) => {
        dragging.current = true;
        updatePos(e.clientX);
      }}
    >
      <img
        src={after}
        alt="After"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      <img
        src={before}
        alt="Before"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        draggable={false}
      />

      {/* Slider line + handle */}
      <div
        className="absolute top-0 bottom-0 -translate-x-1/2 pointer-events-none"
        style={{ left: `${pos}%` }}
      >
        <div className="w-0.5 h-full bg-white/80 shadow-[0_0_8px_rgba(0,0,0,0.3)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border-2 border-[#C9A227] shadow-lg flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path d="M4.5 3L1.5 7L4.5 11" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.5 3L12.5 7L9.5 11" stroke="#C9A227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider pointer-events-none">
        Before
      </div>
      <div className="absolute top-4 right-4 bg-[#C9A227]/90 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider pointer-events-none">
        After
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */

export default function StyleHeroShowcase() {
  const [niche, setNiche] = useState("bakery");
  const [style, setStyle] = useState("warm");

  const beforeImg = `${BASE}/${niche}_before.jpg`;
  const afterImg = `${BASE}/${niche}_after_${style}.jpg`;

  return (
    <div className="space-y-6">
      {/* Hero slider */}
      <DragSlider before={beforeImg} after={afterImg} />

      {/* Niche selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {NICHES.map((n) => {
          const active = n.id === niche;
          return (
            <button
              key={n.id}
              onClick={() => setNiche(n.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-[#2A2A2A] text-white shadow-sm"
                  : "bg-white/80 text-[#635C54] hover:bg-white hover:text-[#2A2A2A] border border-[#e8ddd3]"
              }`}
            >
              {n.name}
            </button>
          );
        })}
      </div>

      {/* Style selector */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
        {STYLES.map((s) => {
          const active = s.id === style;
          return (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`text-left rounded-xl p-3 transition-all duration-200 ${
                active
                  ? "ring-2 ring-[#C9A227] ring-offset-2 ring-offset-[#F0E8E0] bg-white shadow-sm"
                  : "bg-white/60 hover:bg-white border border-[#e8ddd3]"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <h4 className={`text-sm font-medium ${active ? "text-[#C9A227]" : "text-[#2A2A2A]"}`}>
                  {s.name}
                </h4>
                {active && (
                  <svg className="w-3.5 h-3.5 text-[#C9A227] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className="text-[11px] text-[#635C54] mt-0.5 line-clamp-1">{s.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
