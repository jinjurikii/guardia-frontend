"use client";

interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp?: Date;
}

export default function Message({ content, isUser, timestamp }: MessageProps) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[85%] md:max-w-[70%] px-4 py-3 rounded-2xl ${
          isUser
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-white/10 backdrop-blur-sm text-white/90 rounded-bl-md border border-white/10"
        }`}
      >
        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
        {timestamp && (
          <p className={`text-xs mt-1 ${isUser ? "text-blue-200" : "text-white/40"}`}>
            {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>
    </div>
  );
}
