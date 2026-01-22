"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DaemonRoomsIndicator from "@/components/DaemonRoomsIndicator";
import { useLunaNotifications } from "@/hooks/useLunaNotifications";

const API_BASE = "https://api.guardiacontent.com";
const HQ_CREDENTIALS = { username: "jinjurikii", pin: "1991" };

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════

interface Specialist {
  model: string;
  color: string;
  emoji: string;
}

interface RoomType {
  name: string;
  default_persona: string;
  closeable: boolean;
  project: string | null;
  description: string;
}

interface Room {
  id: number;
  title: string;
  room_type: string;
  project: string | null;
  is_open: boolean;
  created_at: string;
  last_message_at: string;
  default_persona: string;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  preview?: string;
}

interface Message {
  id: number;
  role: "user" | "assistant";
  speaker: string | null;
  content: string;
  model: string | null;
  created_at: string;
  attachments?: Attachment[];
  proactive?: boolean; // Mark as proactive/unsolicited message
  isNew?: boolean; // For animation purposes
}

// ══════════════════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════════════════

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === HQ_CREDENTIALS.username && pin === HQ_CREDENTIALS.pin) {
      localStorage.setItem("hq_auth", "true");
      onLogin();
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-[#050506] flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-[#0d0d0e] border border-[#1a1a1f] rounded-lg p-6 w-full max-w-[320px]">
        <h1 className="text-[#888] font-semibold text-sm tracking-wider mb-6">LUNA</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-[#0a0a0b] border border-[#1a1a1f] rounded px-3 py-2.5 text-[#ccc] text-sm mb-3 focus:outline-none focus:border-[#333]"
        />
        <input
          type="password"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full bg-[#0a0a0b] border border-[#1a1a1f] rounded px-3 py-2.5 text-[#ccc] text-sm mb-4 focus:outline-none focus:border-[#333]"
        />
        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
        <button type="submit" className="w-full bg-violet-600 text-white py-2.5 rounded text-sm hover:bg-violet-500">
          Enter
        </button>
      </form>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOM TYPE COLORS
// ══════════════════════════════════════════════════════════════════════════════

const ROOM_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  base: { bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-400" },
  gio: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400" },
  paradise: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400" },
  athernyx: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" },
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function LunaPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [specialists, setSpecialists] = useState<Record<string, Specialist>>({});
  const [roomTypes, setRoomTypes] = useState<Record<string, RoomType>>({});
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mentionFilter, setMentionFilter] = useState("");
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const messageIdsRef = useRef<Set<number>>(new Set()); // Track message IDs to prevent duplicates

  // Check auth
  useEffect(() => {
    setAuthenticated(localStorage.getItem("hq_auth") === "true");
  }, []);

  // Load specialists and room types
  useEffect(() => {
    if (!authenticated) return;
    
    fetch(`${API_BASE}/luna/specialists`)
      .then(r => r.json())
      .then(data => setSpecialists(data))
      .catch(console.error);
      
    fetch(`${API_BASE}/luna/room-types`)
      .then(r => r.json())
      .then(data => setRoomTypes(data))
      .catch(console.error);
  }, [authenticated]);

  // Load rooms
  useEffect(() => {
    if (!authenticated) return;
    loadRooms();
  }, [authenticated]);

  // Load messages when room changes
  useEffect(() => {
    if (!activeRoomId) return;
    loadMessages(activeRoomId);
    // Find and set active room info
    const room = rooms.find(r => r.id === activeRoomId);
    setActiveRoom(room || null);
  }, [activeRoomId, rooms]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Voice recognition setup
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  // Proactive notifications via SSE
  const { isConnected: sseConnected, lastNotification } = useLunaNotifications({
    enabled: authenticated,
    onMessage: (notification) => {
      console.log("[Luna] Proactive notification received:", notification);

      // Create unique message ID
      const msgId = Date.now() + Math.random();

      // Prevent duplicate messages
      if (messageIdsRef.current.has(msgId)) {
        console.log("[Luna] Skipping duplicate message");
        return;
      }
      messageIdsRef.current.add(msgId);

      // Only add to messages if we're in the relevant room (or no room_id specified = lobby message)
      const shouldDisplay = !notification.room_id || notification.room_id === activeRoomId;

      if (shouldDisplay) {
        const proactiveMsg: Message = {
          id: msgId,
          role: "assistant",
          speaker: notification.speaker || "luna",
          content: notification.text,
          model: null,
          created_at: notification.timestamp,
          proactive: true,
          isNew: true, // For animation
        };

        setMessages((prev) => [...prev, proactiveMsg]);

        // Show brief status indicator
        setNotificationStatus("Luna noticed something...");
        setTimeout(() => setNotificationStatus(null), 3000);

        // Remove isNew flag after animation
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) => (m.id === msgId ? { ...m, isNew: false } : m))
          );
        }, 500);

        // Optional: Auto-speak proactive messages if enabled
        if (autoSpeak && "speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(notification.text);
          utterance.rate = 1.1;
          window.speechSynthesis.speak(utterance);
        }
      }
    },
    onConnectionChange: (connected) => {
      console.log(`[Luna SSE] Connection status: ${connected ? "connected" : "disconnected"}`);
    },
    onError: (error) => {
      console.error("[Luna SSE] Error:", error);
    },
  });

  const loadRooms = async () => {
    try {
      const res = await fetch(`${API_BASE}/luna/rooms`);
      const data = await res.json();
      setRooms(data.rooms || []);
      
      // Auto-select the lobby (base room) if no room selected
      if (!activeRoomId && data.rooms?.length > 0) {
        const lobby = data.rooms.find((r: Room) => r.room_type === "base");
        if (lobby) setActiveRoomId(lobby.id);
      }
    } catch (e) {
      console.error("Failed to load rooms:", e);
    }
  };

  const loadMessages = async (roomId: number) => {
    try {
      const res = await fetch(`${API_BASE}/luna/rooms/${roomId}/messages`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e) {
      console.error("Failed to load messages:", e);
    }
  };

  const createRoom = async (roomType: string) => {
    try {
      const res = await fetch(`${API_BASE}/luna/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_type: roomType })
      });
      const data = await res.json();
      await loadRooms();
      setActiveRoomId(data.room_id);
      setShowNewRoom(false);
    } catch (e) {
      console.error("Failed to create room:", e);
    }
  };

  const closeRoom = async (roomId: number) => {
    if (!confirm("Close this room? It will be archived.")) return;
    try {
      await fetch(`${API_BASE}/luna/rooms/${roomId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_id: roomId })
      });
      await loadRooms();
      // Switch to lobby
      const lobby = rooms.find(r => r.room_type === "base");
      if (lobby) setActiveRoomId(lobby.id);
    } catch (e) {
      console.error("Failed to close room:", e);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || !activeRoomId || sending) return;

    const message = input.trim();
    const currentAttachments = [...attachments];
    setInput("");
    setAttachments([]);
    setSending(true);

    // Optimistic user message with attachments
    const userMsgId = Date.now();
    const tempMsg: Message = {
      id: userMsgId,
      role: "user",
      speaker: null,
      content: message,
      model: null,
      created_at: new Date().toISOString(),
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined
    };
    setMessages(prev => [...prev, tempMsg]);

    // Create placeholder assistant message for streaming
    const assistantMsgId = userMsgId + 1;
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      speaker: null,
      content: "",
      model: null,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, assistantMsg]);

    // Prepare attachments for API (only images for now)
    const imageAttachments = currentAttachments
      .filter(a => a.type.startsWith("image/") && a.url)
      .map(a => ({ name: a.name, type: a.type, data: a.url }));

    try {
      const res = await fetch(`${API_BASE}/luna/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: activeRoomId,
          message,
          attachments: imageAttachments.length > 0 ? imageAttachments : undefined
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let currentSpeaker = "luna";
      let currentModel = "";
      let currentEmoji = "🌙";
      let currentColor = "#a78bfa";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === "meta") {
                  currentSpeaker = data.speaker;
                  currentModel = data.model;
                  currentEmoji = data.emoji;
                  currentColor = data.color;
                  // Update message with metadata
                  setMessages(prev => prev.map(m =>
                    m.id === assistantMsgId
                      ? { ...m, speaker: currentSpeaker, model: currentModel }
                      : m
                  ));
                } else if (data.type === "chunk") {
                  fullText += data.text;
                  // Update message content progressively
                  setMessages(prev => prev.map(m =>
                    m.id === assistantMsgId
                      ? { ...m, content: fullText }
                      : m
                  ));
                } else if (data.type === "done") {
                  // Final update
                  setMessages(prev => prev.map(m =>
                    m.id === assistantMsgId
                      ? { ...m, content: data.full_text || fullText }
                      : m
                  ));

                  // Text-to-speech if enabled
                  if (autoSpeak && "speechSynthesis" in window) {
                    const utterance = new SpeechSynthesisUtterance(data.full_text || fullText);
                    utterance.rate = 1.1;
                    window.speechSynthesis.speak(utterance);
                  }
                } else if (data.type === "error") {
                  console.error("Stream error:", data.message);
                  setMessages(prev => prev.map(m =>
                    m.id === assistantMsgId
                      ? { ...m, content: `Error: ${data.message}` }
                      : m
                  ));
                }
              } catch (e) {
                // Skip malformed JSON
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("Chat error:", e);
      // Update placeholder with error
      setMessages(prev => prev.map(m =>
        m.id === assistantMsgId
          ? { ...m, content: "Failed to get response. Please try again." }
          : m
      ));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    
    if (e.key === "@") {
      setShowMentions(true);
      setMentionFilter("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1 && !value.slice(lastAtIndex).includes(" ")) {
      setShowMentions(true);
      setMentionFilter(value.slice(lastAtIndex + 1).toLowerCase());
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (name: string) => {
    const lastAtIndex = input.lastIndexOf("@");
    const newInput = input.slice(0, lastAtIndex) + `@${name} `;
    setInput(newInput);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const processFiles = (files: FileList | File[]) => {
    const newAttachments: Attachment[] = [];
    Array.from(files).forEach(file => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const attachment: Attachment = {
        id,
        name: file.name,
        type: file.type,
        size: file.size,
      };

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachments(prev => prev.map(a =>
            a.id === id ? { ...a, preview: e.target?.result as string } : a
          ));
        };
        reader.readAsDataURL(file);
      }

      // Store file data for upload
      const dataReader = new FileReader();
      dataReader.onload = (e) => {
        setAttachments(prev => prev.map(a =>
          a.id === id ? { ...a, url: e.target?.result as string } : a
        ));
      };
      dataReader.readAsDataURL(file);

      newAttachments.push(attachment);
    });
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (mins > 0) return `${mins}m`;
    return "now";
  };

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  }

  const filteredSpecialists = Object.entries(specialists).filter(
    ([name]) => name.toLowerCase().includes(mentionFilter)
  );

  // Separate base room from project rooms
  const baseRoom = rooms.find(r => r.room_type === "base");
  const projectRooms = rooms.filter(r => r.room_type !== "base" && r.is_open);

  return (
    <div className="h-screen bg-[#050506] flex">
      {/* Sidebar */}
      <div className="w-72 border-r border-[#1a1a1f] flex flex-col bg-[#0a0a0b]">
        {/* Header */}
        <div className="p-3 border-b border-[#1a1a1f] flex items-center justify-between">
          <Link href="/hq" className="text-[#888] font-semibold text-xs tracking-wider hover:text-[#aaa]">
            ← HQ
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="text-lg">🌙</span>
            <span className="text-violet-400 font-medium text-sm">Luna</span>
          </div>
        </div>

        {/* The Lobby (always visible) */}
        {baseRoom && (
          <div className="p-3 border-b border-[#1a1a1f]">
            <button
              onClick={() => setActiveRoomId(baseRoom.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                activeRoomId === baseRoom.id
                  ? "bg-violet-500/20 border-violet-500/50"
                  : "bg-[#0d0d0e] border-[#1a1a1f] hover:border-[#333]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🏠</span>
                <div>
                  <div className="text-[#ccc] text-sm font-medium">The Lobby</div>
                  <div className="text-[#555] text-xs">Always open</div>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* New Project Room */}
        <div className="p-3 border-b border-[#1a1a1f]">
          <button
            onClick={() => setShowNewRoom(!showNewRoom)}
            className="w-full bg-[#0d0d0e] hover:bg-[#111] text-[#888] py-2 px-3 rounded text-sm flex items-center justify-center gap-2 border border-[#1a1a1f] hover:border-[#333]"
          >
            <span className="text-lg leading-none">+</span>
            <span>New Room</span>
          </button>
          
          {showNewRoom && (
            <div className="mt-2 space-y-1">
              {Object.entries(roomTypes)
                .filter(([key]) => key !== "base")
                .map(([key, type]) => {
                  const colors = ROOM_COLORS[key] || ROOM_COLORS.base;
                  return (
                    <button
                      key={key}
                      onClick={() => createRoom(key)}
                      className={`w-full text-left p-2 rounded ${colors.bg} border ${colors.border} ${colors.text} text-xs hover:opacity-80`}
                    >
                      <div className="font-medium">{type.name}</div>
                      <div className="text-[#666] text-[10px]">{type.description}</div>
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        {/* Project Rooms */}
        <div className="flex-1 overflow-y-auto">
          {projectRooms.length > 0 && (
            <div className="p-3">
              <div className="text-[#555] text-xs uppercase tracking-wider mb-2">Project Rooms</div>
              <div className="space-y-1">
                {projectRooms.map(room => {
                  const colors = ROOM_COLORS[room.room_type] || ROOM_COLORS.base;
                  const defaultPersona = specialists[room.default_persona];
                  
                  return (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoomId(room.id)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                        activeRoomId === room.id
                          ? `${colors.bg} ${colors.border}`
                          : "bg-[#0d0d0e] border-[#1a1a1f] hover:border-[#333]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {defaultPersona && <span>{defaultPersona.emoji}</span>}
                          <span className={`text-sm ${colors.text}`}>{room.title}</span>
                        </div>
                        <span className="text-[#444] text-xs">{timeAgo(room.last_message_at)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Daemon Rooms Indicator */}
        <div className="p-3 border-t border-[#1a1a1f]">
          <DaemonRoomsIndicator />

          {/* Live Notifications Status */}
          <div className="mt-2 p-2 rounded-lg bg-[#0d0d0e] border border-[#1a1a1f]">
            <div className="flex items-center gap-2 text-xs">
              <div
                className={`w-2 h-2 rounded-full transition-all ${
                  sseConnected
                    ? "bg-green-500 animate-pulse"
                    : "bg-red-500/50"
                }`}
              />
              <span className="text-[#888]">
                {sseConnected ? "Live notifications active" : "Notifications offline"}
              </span>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="p-3 border-t border-[#1a1a1f]">
          <div className="text-[#555] text-xs uppercase tracking-wider mb-2">Team</div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(specialists).map(([name, spec]) => (
              <div
                key={name}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                style={{ backgroundColor: `${spec.color}20`, color: spec.color }}
              >
                <span>{spec.emoji}</span>
                <span className="capitalize">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Room Header */}
        {activeRoom && (
          <div className="px-4 py-3 border-b border-[#1a1a1f] bg-[#0a0a0b] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">{specialists[activeRoom.default_persona]?.emoji || "💬"}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-[#ccc] text-sm font-medium">{activeRoom.title}</div>
                  {/* SSE Connection Indicator */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        sseConnected
                          ? "bg-green-500 animate-pulse"
                          : "bg-red-500/50"
                      }`}
                      title={sseConnected ? "Live notifications connected" : "Notifications disconnected"}
                    />
                    {notificationStatus && (
                      <span className="text-violet-400 text-xs animate-fade-in">
                        {notificationStatus}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-[#555] text-xs">
                  Default: @{activeRoom.default_persona} • {roomTypes[activeRoom.room_type]?.description}
                </div>
              </div>
            </div>
            {roomTypes[activeRoom.room_type]?.closeable && (
              <button
                onClick={() => closeRoom(activeRoom.id)}
                className="text-[#555] hover:text-red-400 text-xs px-2 py-1 rounded hover:bg-red-500/10"
              >
                Close Room
              </button>
            )}
          </div>
        )}

        {!activeRoomId ? (
          <div className="flex-1 flex items-center justify-center text-[#333]">
            <div className="text-center">
              <div className="text-6xl mb-4">🌙</div>
              <div className="text-[#555] text-sm">Select a room to start</div>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => {
                const isUser = msg.role === "user";
                const speaker = msg.speaker || "luna";
                const spec = specialists[speaker] || { emoji: "🌙", color: "#a78bfa" };
                const isProactive = msg.proactive === true;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"} ${
                      msg.isNew ? "animate-slide-in" : ""
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 transition-all ${
                        isUser
                          ? "bg-violet-600/20 border border-violet-500/30"
                          : isProactive
                          ? "bg-violet-500/10 border border-violet-500/40 shadow-lg shadow-violet-500/10"
                          : "bg-[#0d0d0e] border border-[#1a1a1f]"
                      }`}
                    >
                      {!isUser && (
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span>{spec.emoji}</span>
                          <span className="text-xs font-medium capitalize" style={{ color: spec.color }}>
                            {speaker}
                          </span>
                          {isProactive && (
                            <span className="text-[#666] text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20 border border-violet-500/30">
                              proactive
                            </span>
                          )}
                          {msg.model && (
                            <span className="text-[#444] text-xs font-mono">
                              {msg.model}
                            </span>
                          )}
                        </div>
                      )}
                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex gap-2 mb-2 flex-wrap">
                          {msg.attachments.map(att => (
                            att.type.startsWith("image/") && (att.preview || att.url) ? (
                              <img
                                key={att.id}
                                src={att.preview || att.url}
                                alt={att.name}
                                className="max-h-48 rounded-lg border border-[#1a1a1f]"
                              />
                            ) : (
                              <div
                                key={att.id}
                                className="flex items-center gap-2 bg-[#0a0a0b] px-2 py-1 rounded text-xs text-[#888]"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                </svg>
                                {att.name}
                              </div>
                            )
                          ))}
                        </div>
                      )}
                      <div className="text-[#ccc] text-sm">
                        {isUser ? (
                          msg.content && <span className="whitespace-pre-wrap">{msg.content}</span>
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              code: ({ className, children, ...props }) => {
                                const isInline = !className;
                                return isInline ? (
                                  <code className="bg-[#1a1a1f] px-1.5 py-0.5 rounded text-violet-300 text-xs font-mono" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <code className="block bg-[#0a0a0b] p-3 rounded-lg text-xs font-mono overflow-x-auto my-2 text-[#ccc]" {...props}>
                                    {children}
                                  </code>
                                );
                              },
                              pre: ({ children }) => <pre className="my-2">{children}</pre>,
                              ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                              li: ({ children }) => <li>{children}</li>,
                              h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-white">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-white">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-white">{children}</h3>,
                              a: ({ href, children }) => <a href={href} className="text-violet-400 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                              blockquote: ({ children }) => <blockquote className="border-l-2 border-violet-500/50 pl-3 my-2 text-[#888]">{children}</blockquote>,
                              table: ({ children }) => <table className="border-collapse my-2 text-xs">{children}</table>,
                              th: ({ children }) => <th className="border border-[#333] px-2 py-1 bg-[#1a1a1f]">{children}</th>,
                              td: ({ children }) => <td className="border border-[#333] px-2 py-1">{children}</td>,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className={`border-t border-[#1a1a1f] p-3 bg-[#0a0a0b] relative transition-all ${
                isDragging ? "bg-violet-500/10 border-violet-500/50" : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Drag overlay */}
              {isDragging && (
                <div className="absolute inset-0 flex items-center justify-center bg-violet-500/10 border-2 border-dashed border-violet-500/50 rounded-lg z-10 pointer-events-none">
                  <span className="text-violet-400 text-sm font-medium">Drop files here</span>
                </div>
              )}

              {/* Mention Popup */}
              {showMentions && filteredSpecialists.length > 0 && (
                <div className="absolute bottom-full left-3 mb-2 bg-[#0d0d0e] border border-[#1a1a1f] rounded-lg shadow-xl overflow-hidden z-20">
                  {filteredSpecialists.map(([name, spec]) => (
                    <button
                      key={name}
                      onClick={() => insertMention(name)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1a1a1f] text-left"
                    >
                      <span>{spec.emoji}</span>
                      <span className="text-sm capitalize" style={{ color: spec.color }}>
                        @{name}
                      </span>
                      <span className="text-xs text-[#555]">{spec.model}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Attachment Preview */}
              {attachments.length > 0 && (
                <div className="flex gap-2 mb-2 flex-wrap">
                  {attachments.map(attachment => (
                    <div
                      key={attachment.id}
                      className="relative group bg-[#0d0d0e] border border-[#1a1a1f] rounded-lg overflow-hidden"
                    >
                      {attachment.type.startsWith("image/") && attachment.preview ? (
                        <img
                          src={attachment.preview}
                          alt={attachment.name}
                          className="h-16 w-16 object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 flex flex-col items-center justify-center p-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#555]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span className="text-[10px] text-[#555] truncate w-full text-center mt-1">
                            {attachment.name.slice(0, 8)}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => removeAttachment(attachment.id)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5 text-[8px] text-[#888] truncate">
                        {formatFileSize(attachment.size)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.md,.json,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex gap-2 items-end">
                {/* File Attachment Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending}
                  className="p-3 rounded-lg bg-[#050506] border border-[#1a1a1f] text-[#666] hover:text-[#888] hover:border-[#333] transition-all disabled:opacity-50"
                  title="Attach files"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </button>

                {/* Voice Button */}
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  disabled={sending}
                  className={`p-3 rounded-lg transition-all ${
                    isListening
                      ? "bg-red-500/20 border border-red-500/50 text-red-400 animate-pulse"
                      : "bg-[#050506] border border-[#1a1a1f] text-[#666] hover:text-[#888] hover:border-[#333]"
                  }`}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  )}
                </button>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={activeRoom ? `Message ${activeRoom.default_persona}... (@ to switch)` : "Select a room..."}
                  disabled={sending}
                  rows={1}
                  className="flex-1 bg-[#050506] border border-[#1a1a1f] rounded-lg px-4 py-3 text-[#ccc] text-sm focus:outline-none focus:border-[#333] resize-none disabled:opacity-50"
                />

                {/* Auto-speak Toggle */}
                <button
                  type="button"
                  onClick={() => setAutoSpeak(!autoSpeak)}
                  className={`p-3 rounded-lg transition-all ${
                    autoSpeak
                      ? "bg-violet-500/20 border border-violet-500/50 text-violet-400"
                      : "bg-[#050506] border border-[#1a1a1f] text-[#666] hover:text-[#888] hover:border-[#333]"
                  }`}
                  title={autoSpeak ? "Auto-speak on" : "Auto-speak off"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                </button>

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={sending || (!input.trim() && attachments.length === 0)}
                  className="p-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 disabled:hover:bg-violet-600"
                >
                  {sending ? (
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
