export default function LoadingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="w-8 h-8 bg-[#1c1c1e] rounded-lg flex items-center justify-center text-[#e8a060] text-sm mr-2 flex-shrink-0 border border-white/5">
        G
      </div>
      <div className="bg-[#1c1c1e] border border-white/5 text-[#6a6a6a] px-4 py-3 rounded-2xl rounded-bl-md">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-[#e8a060]/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-[#e8a060]/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-[#e8a060]/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
