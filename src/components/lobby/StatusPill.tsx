import { ClientContext } from "./LobbyShell";

interface StatusPillProps {
  client: ClientContext | null;
}

export default function StatusPill({ client }: StatusPillProps) {
  if (!client) return null;

  const scheduled = client.scheduled_posts || 0;
  const pending = client.pending_uploads || 0;
  const ready = client.styled_ready || 0;
  const needsSetup = client.needs_platform_setup;

  if (needsSetup) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs text-red-400 font-medium">Setup needed</span>
      </div>
    );
  }

  if (scheduled > 0) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="text-xs text-emerald-400 font-medium">{scheduled} scheduled</span>
      </div>
    );
  }

  if (pending > 0 || ready > 0) {
    const total = pending + ready;
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span className="text-xs text-amber-400 font-medium">{total} in queue</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10">
      <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
      <span className="text-xs text-white/40 font-medium">Ready</span>
    </div>
  );
}
