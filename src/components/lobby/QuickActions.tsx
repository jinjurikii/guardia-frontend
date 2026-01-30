import { ClientContext } from "./LobbyShell";

interface QuickActionsProps {
  client: ClientContext | null;
  onConnectFacebook: () => void;
  onOpenTablet: () => void;
}

export default function QuickActions({ client, onConnectFacebook, onOpenTablet }: QuickActionsProps) {
  if (!client) return null;

  const needsSetup = client.needs_platform_setup;
  const styledReady = client.styled_ready || 0;

  if (!needsSetup && styledReady === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {needsSetup && (
        <button
          onClick={onConnectFacebook}
          className="text-xs px-3 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors min-h-[36px]"
        >
          Connect Facebook →
        </button>
      )}
      {styledReady > 0 && (
        <button
          onClick={onOpenTablet}
          className="text-xs px-3 py-2 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors min-h-[36px]"
        >
          {styledReady} ready to approve →
        </button>
      )}
    </div>
  );
}
