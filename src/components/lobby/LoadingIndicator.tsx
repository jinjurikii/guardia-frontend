export default function LoadingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="w-8 h-8 bg-[var(--bg-elevated)] rounded-lg flex items-center justify-center text-[var(--accent)] text-sm mr-2 flex-shrink-0 border border-[var(--border-subtle)]">
        G
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-muted)] px-4 py-3 rounded-2xl rounded-bl-md">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-[var(--accent)] opacity-60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-[var(--accent)] opacity-60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-[var(--accent)] opacity-60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
