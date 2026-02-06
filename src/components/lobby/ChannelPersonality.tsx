"use client";

/**
 * CHANNEL PERSONALITY — Placeholder
 * TODO: Implement channel personality/voice settings
 */

interface ChannelPersonalityProps {
  jwt: string;
  onSaved?: () => void;
}

export default function ChannelPersonality({ jwt, onSaved }: ChannelPersonalityProps) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Channel Personality</h3>
      <p className="text-sm text-[var(--text-secondary)] mb-4">
        Customize your brand voice and caption style. Coming soon.
      </p>
      <div className="text-center py-8">
        <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" className="mx-auto mb-3">
          <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
        <p className="text-sm text-[var(--text-muted)]">Feature in development</p>
      </div>
    </div>
  );
}
