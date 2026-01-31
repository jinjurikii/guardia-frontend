import { Message } from "./LobbyShell";

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
}

export default function MessageBubble({ message, isUser }: MessageBubbleProps) {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
      {!isUser && (
        <div className="w-8 h-8 bg-[#1c1c1e] rounded-lg flex items-center justify-center text-[#e8a060] text-sm mr-2 flex-shrink-0 mt-1 border border-white/5">
          G
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          isUser
            ? "bg-[#e8a060] text-[#121214] rounded-br-md"
            : "bg-[#1c1c1e] border border-white/5 text-[#e8e8e8] rounded-bl-md"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
