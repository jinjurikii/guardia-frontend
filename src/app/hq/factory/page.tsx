"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_BASE = "https://api.guardiacontent.com";

interface Post {
  id: number;
  client_id: string;
  platform: string;
  caption: string;
  status: string;
  scheduled_for: string;
  posted_at: string | null;
  error_message: string | null;
}

interface PipelineStats {
  scheduled: number;
  posted: number;
  failed: number;
  cancelled: number;
}

export default function FactoryPage() {
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats from cortex-state
        const statsRes = await fetch(`${API_BASE}/hq/cortex-state`);
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.pipeline?.posts || { scheduled: 0, posted: 0, failed: 0, cancelled: 0 });
        }

        // Fetch recent posts
        const postsRes = await fetch(`${API_BASE}/hq/factory/posts`);
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPosts = filter === "all" ? posts : posts.filter(p => p.status === filter);

  const statusColors: Record<string, string> = {
    scheduled: "text-emerald-400",
    posted: "text-[#888]",
    failed: "text-red-400",
    cancelled: "text-[#555]",
    processing: "text-amber-400"
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-[#050506] text-[#e8e8e8]">
      {/* Header */}
      <header className="border-b border-[#1a1a1f] bg-[#0a0a0b]/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/hq?dev=serb" className="text-[#555] hover:text-[#888] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <h1 className="text-[#10b981] font-semibold text-sm tracking-wider">THE FACTORY</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Scheduled", value: stats?.scheduled || 0, color: "emerald" },
            { label: "Posted", value: stats?.posted || 0, color: "gray" },
            { label: "Failed", value: stats?.failed || 0, color: "red" },
            { label: "Cancelled", value: stats?.cancelled || 0, color: "gray" }
          ].map(({ label, value, color }) => (
            <button
              key={label}
              onClick={() => setFilter(label.toLowerCase())}
              className={`bg-[#0a0a0b] border rounded-xl p-4 text-left transition-all ${
                filter === label.toLowerCase() ? "border-[#2a2a2f]" : "border-[#1a1a1f] hover:border-[#2a2a2f]"
              }`}
            >
              <span className="text-[#555] text-[10px] tracking-wider block mb-1">{label.toUpperCase()}</span>
              <p className={`font-mono text-2xl ${color === "emerald" ? "text-emerald-400" : color === "red" ? "text-red-400" : "text-[#888]"}`}>
                {value}
              </p>
            </button>
          ))}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-6">
          {["all", "scheduled", "posted", "failed", "cancelled"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === f ? "bg-emerald-500/20 text-emerald-400" : "bg-[#1a1a1f] text-[#666] hover:text-[#888]"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Posts Table */}
        <div className="bg-[#0a0a0b] border border-[#1a1a1f] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-[#555]">Loading...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-8 text-center text-[#555]">No posts found</div>
          ) : (
            <>
            {/* Desktop table */}
            <table className="w-full hidden md:table">
              <thead>
                <tr className="border-b border-[#1a1a1f]">
                  <th className="text-left p-4 text-[10px] text-[#555] tracking-wider font-medium">CLIENT</th>
                  <th className="text-left p-4 text-[10px] text-[#555] tracking-wider font-medium">PLATFORM</th>
                  <th className="text-left p-4 text-[10px] text-[#555] tracking-wider font-medium">CAPTION</th>
                  <th className="text-left p-4 text-[10px] text-[#555] tracking-wider font-medium">STATUS</th>
                  <th className="text-left p-4 text-[10px] text-[#555] tracking-wider font-medium">DATE</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map(post => (
                  <tr key={post.id} className="border-b border-[#1a1a1f] hover:bg-[#0d0d0e]">
                    <td className="p-4 text-sm text-[#888]">{post.client_id}</td>
                    <td className="p-4 text-sm text-[#888]">{post.platform}</td>
                    <td className="p-4 text-sm text-[#888] max-w-[300px] truncate">{post.caption?.slice(0, 50)}...</td>
                    <td className={`p-4 text-sm font-mono ${statusColors[post.status] || "text-[#888]"}`}>
                      {post.status}
                    </td>
                    <td className="p-4 text-sm text-[#555]">
                      {formatDate(post.posted_at || post.scheduled_for)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-[#1a1a1f]">
              {filteredPosts.map(post => (
                <div key={post.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#ccc] font-medium">{post.client_id}</span>
                    <span className={`text-xs font-mono ${statusColors[post.status] || "text-[#888]"}`}>{post.status}</span>
                  </div>
                  <p className="text-sm text-[#666] line-clamp-2">{post.caption?.slice(0, 80)}</p>
                  <div className="flex items-center justify-between text-xs text-[#555]">
                    <span>{post.platform}</span>
                    <span>{formatDate(post.posted_at || post.scheduled_for)}</span>
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
