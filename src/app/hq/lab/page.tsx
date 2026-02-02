"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const API_BASE = "https://api.guardiacontent.com";

interface LabOutput {
  id: number;
  original_url: string;
  style: string;
  output_url: string;
  created_at: string;
}

function Dropbox() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string>();

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length === 0) {
      setMessage("No images found");
      return;
    }

    setUploading(true);
    setMessage(`Uploading ${files.length} image${files.length > 1 ? "s" : ""}...`);

    // TODO: Implement actual upload to /lab/upload endpoint
    await new Promise(r => setTimeout(r, 1500));
    setMessage("Upload complete - processing will begin shortly");
    setUploading(false);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
        dragging
          ? "border-teal-500 bg-teal-500/5"
          : "border-[#2a2a2f] hover:border-[#3a3a3f]"
      }`}
    >
      <div className="text-[#555] mb-2">
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </div>
        ) : (
          <>
            <svg className="w-8 h-8 mx-auto mb-2 text-[#444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm">Drop images here to style</p>
          </>
        )}
      </div>
      {message && (
        <p className={`text-xs mt-2 ${message.includes("complete") ? "text-teal-400" : "text-[#666]"}`}>
          {message}
        </p>
      )}
    </div>
  );
}

function OutputCard({ output }: { output: LabOutput }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="bg-[#0d0d0e] border border-[#1a1a1f] rounded-lg overflow-hidden cursor-pointer hover:border-[#2a2a2f] transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="aspect-square bg-[#0a0a0a] relative">
        {output.output_url ? (
          <img
            src={output.output_url}
            alt={output.style}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#333]">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-teal-400 text-xs font-medium truncate">{output.style}</p>
        <p className="text-[#444] text-[10px] mt-1">
          {new Date(output.created_at).toLocaleDateString()}
        </p>
      </div>
      {expanded && (
        <div className="p-3 pt-0 border-t border-[#1a1a1f]">
          <p className="text-[#666] text-xs truncate">
            Original: {output.original_url}
          </p>
        </div>
      )}
    </div>
  );
}

export default function LabPage() {
  const [outputs, setOutputs] = useState<LabOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ outputs: 0, pending: 0 });

  useEffect(() => {
    // Fetch outputs
    fetch(`${API_BASE}/hq/lab/outputs`)
      .then(res => res.json())
      .then(data => setOutputs(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch stats
    fetch(`${API_BASE}/hq/lab/status`)
      .then(res => res.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#050506] text-[#e8e8e8]">
      {/* Header */}
      <header className="border-b border-[#1a1a1f] bg-[#0a0a0b]/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/hq" className="text-[#555] hover:text-[#888] text-sm transition-colors">
              ← HQ
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500" />
              <h1 className="text-teal-400 font-semibold text-sm tracking-wider">LAB</h1>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-[#555]">Outputs <span className="text-teal-400">{stats.outputs}</span></span>
            <span className="text-[#555]">Pending <span className="text-amber-400">{stats.pending}</span></span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Dropbox */}
        <section>
          <h2 className="text-[#555] text-xs font-semibold tracking-wider mb-3">UPLOAD</h2>
          <Dropbox />
        </section>

        {/* Gallery */}
        <section>
          <h2 className="text-[#555] text-xs font-semibold tracking-wider mb-3">RECENT OUTPUTS</h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-[#0d0d0e] border border-[#1a1a1f] rounded-lg overflow-hidden">
                  <div className="aspect-square bg-[#1a1a1f] animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-[#1a1a1f] rounded animate-pulse w-2/3" />
                    <div className="h-2 bg-[#1a1a1f] rounded animate-pulse w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : outputs.length === 0 ? (
            <div className="text-center py-12 text-[#444]">
              <p className="text-sm">No outputs yet</p>
              <p className="text-xs mt-1">Drop some images above to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {outputs.map(output => (
                <OutputCard key={output.id} output={output} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
