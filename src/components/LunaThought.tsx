"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * LunaThought - Async thought display component
 *
 * Handles the polling lifecycle for Luna's async thought processing:
 * 1. Shows acknowledgment immediately
 * 2. Polls for completion
 * 3. Displays final synthesis when ready
 */

interface LunaThoughtProps {
  thoughtId: number;
  acknowledgment: string;
  onComplete?: (synthesis: string) => void;
  onError?: (error: string) => void;
  apiBase?: string;
}

type ThoughtStatus = "pending" | "working" | "ready" | "resolved" | "failed";

interface ThoughtState {
  status: ThoughtStatus;
  synthesis: string | null;
  processor: string | null;
  latencyMs: number | null;
}

const POLL_INTERVAL = 1000; // 1 second
const MAX_POLLS = 60; // 60 seconds max wait

export default function LunaThought({
  thoughtId,
  acknowledgment,
  onComplete,
  onError,
  apiBase = "https://api.guardiacontent.com",
}: LunaThoughtProps) {
  const [state, setState] = useState<ThoughtState>({
    status: "pending",
    synthesis: null,
    processor: null,
    latencyMs: null,
  });
  const [pollCount, setPollCount] = useState(0);

  const pollThought = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/luna/thought/${thoughtId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch thought status");
      }

      const data = await res.json();

      setState({
        status: data.status,
        synthesis: data.luna_synthesis,
        processor: data.processor,
        latencyMs: data.latency_ms,
      });

      if (data.status === "resolved" && data.luna_synthesis) {
        onComplete?.(data.luna_synthesis);
      } else if (data.status === "failed") {
        onError?.("Thought processing failed");
      }

      return data.status;
    } catch (err) {
      console.error("[LunaThought] Poll error:", err);
      return "error";
    }
  }, [thoughtId, apiBase, onComplete, onError]);

  useEffect(() => {
    if (state.status === "resolved" || state.status === "failed") {
      return;
    }

    if (pollCount >= MAX_POLLS) {
      onError?.("Thought timed out");
      return;
    }

    const timer = setTimeout(async () => {
      const status = await pollThought();
      if (status !== "resolved" && status !== "failed" && status !== "error") {
        setPollCount((c) => c + 1);
      }
    }, POLL_INTERVAL);

    return () => clearTimeout(timer);
  }, [pollCount, state.status, pollThought, onError]);

  // Status indicator styles
  const statusStyles: Record<ThoughtStatus, string> = {
    pending: "text-yellow-400",
    working: "text-blue-400",
    ready: "text-purple-400",
    resolved: "text-green-400",
    failed: "text-red-400",
  };

  const statusLabels: Record<ThoughtStatus, string> = {
    pending: "Thinking...",
    working: "Processing...",
    ready: "Synthesizing...",
    resolved: "",
    failed: "Failed",
  };

  return (
    <div className="luna-thought">
      {/* Show acknowledgment while processing */}
      {state.status !== "resolved" && (
        <div className="flex items-center gap-2 text-[#888]">
          {state.status !== "failed" && (
            <div className="w-4 h-4 border-2 border-[#333] border-t-blue-500 rounded-full animate-spin" />
          )}
          <span className={statusStyles[state.status]}>
            {state.status === "pending" ? acknowledgment : statusLabels[state.status]}
          </span>
        </div>
      )}

      {/* Show synthesis when ready */}
      {state.status === "resolved" && state.synthesis && (
        <div className="luna-synthesis">
          {state.synthesis}
        </div>
      )}

      {/* Debug info (dev only) */}
      {process.env.NODE_ENV === "development" && state.processor && (
        <div className="mt-2 text-xs text-[#444]">
          via {state.processor} • {state.latencyMs}ms
        </div>
      )}
    </div>
  );
}


/**
 * Hook for managing Luna thought lifecycle
 */
export function useLunaThought(apiBase = "https://api.guardiacontent.com") {
  const [currentThought, setCurrentThought] = useState<{
    id: number;
    acknowledgment: string;
  } | null>(null);

  const submitThought = async (
    message: string,
    roomId: number,
    roomType: string = "general",
    context?: string
  ) => {
    try {
      const res = await fetch(`${apiBase}/luna/think`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          room_id: roomId,
          room_type: roomType,
          context,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit thought");
      }

      const data = await res.json();
      setCurrentThought({
        id: data.thought_id,
        acknowledgment: data.acknowledgment,
      });

      return data;
    } catch (err) {
      console.error("[useLunaThought] Submit error:", err);
      throw err;
    }
  };

  const clearThought = () => setCurrentThought(null);

  return {
    currentThought,
    submitThought,
    clearThought,
  };
}
