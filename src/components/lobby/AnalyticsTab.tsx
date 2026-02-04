"use client";

import { useState, useEffect } from "react";
import { ClientContext } from "./LobbyShell";

/**
 * GUARDIA ANALYTICS — Post Performance Dashboard
 *
 * Shows engagement metrics for published posts.
 * Data from /engagement/posts/{client_id}/insights
 */

const API_BASE = "https://api.guardiacontent.com";

interface PostInsight {
  id: number;
  caption: string | null;
  image_url: string | null;
  platform: string;
  post_url: string | null;
  posted_at: string;
  insights: {
    reach: number;
    likes: number;
    comments: number;
    shares: number;
  };
}

interface AnalyticsTabProps {
  client: ClientContext | null;
  jwt: string | null;
}

export default function AnalyticsTab({ client, jwt }: AnalyticsTabProps) {
  const [posts, setPosts] = useState<PostInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!client?.id) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${API_BASE}/engagement/posts/${client.id}/insights?limit=20`,
          { headers: jwt ? { Authorization: `Bearer ${jwt}` } : {} }
        );

        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        } else {
          setError("Failed to load analytics");
        }
      } catch (err) {
        console.error("Analytics fetch error:", err);
        setError("Connection error");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [client?.id, jwt]);

  // Calculate totals
  const totals = posts.reduce(
    (acc, post) => ({
      reach: acc.reach + post.insights.reach,
      likes: acc.likes + post.insights.likes,
      comments: acc.comments + post.insights.comments,
      shares: acc.shares + post.insights.shares,
    }),
    { reach: 0, likes: 0, comments: 0, shares: 0 }
  );

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="h-full overflow-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">Analytics</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Track how your content is performing
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--border)] border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-[var(--text-muted)]">{error}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-[var(--border)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-[var(--text-muted)] mb-2">No published posts yet</p>
          <p className="text-xs text-[var(--text-muted)]">
            Analytics will appear once you start posting
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <SummaryCard
              label="Total Reach"
              value={formatNumber(totals.reach)}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              }
              color="blue"
            />
            <SummaryCard
              label="Total Likes"
              value={formatNumber(totals.likes)}
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              }
              color="red"
            />
            <SummaryCard
              label="Comments"
              value={formatNumber(totals.comments)}
              icon={
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z" />
                </svg>
              }
              color="green"
            />
            <SummaryCard
              label="Shares"
              value={formatNumber(totals.shares)}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              }
              color="purple"
            />
          </div>

          {/* Posts List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3">Recent Posts</h3>
            {posts.map((post) => (
              <PostInsightCard key={post.id} post={post} formatDate={formatDate} />
            ))}
          </div>
        </>
      )}

      {/* Meta App Review Notice */}
      {posts.length > 0 && totals.reach === 0 && (
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-amber-200 font-medium">Insights Coming Soon</p>
              <p className="text-xs text-amber-200/70 mt-1">
                Full engagement metrics (reach, impressions) will be available once Meta approves our app for advanced insights access.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Summary Card Component
function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "red" | "green" | "purple";
}) {
  const colorClasses = {
    blue: "text-blue-400 bg-blue-500/10",
    red: "text-red-400 bg-red-500/10",
    green: "text-green-400 bg-green-500/10",
    purple: "text-purple-400 bg-purple-500/10",
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-semibold text-[var(--text-primary)]">{value}</p>
      <p className="text-xs text-[var(--text-muted)] mt-1">{label}</p>
    </div>
  );
}

// Post Insight Card Component
function PostInsightCard({
  post,
  formatDate,
}: {
  post: PostInsight;
  formatDate: (d: string) => string;
}) {
  return (
    <div className="flex items-center gap-4 p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--border)] transition-colors">
      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-[var(--bg-elevated)] flex-shrink-0">
        {post.image_url ? (
          <img src={post.image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--border)]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--text-primary)] line-clamp-1">
          {post.caption || "No caption"}
        </p>
        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
          <span className="capitalize">{post.platform}</span>
          <span>•</span>
          <span>{formatDate(post.posted_at)}</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-4 text-xs">
        <MetricBadge icon="heart" value={post.insights.likes} />
        <MetricBadge icon="comment" value={post.insights.comments} />
        <MetricBadge icon="share" value={post.insights.shares} />
      </div>

      {/* Link */}
      {post.post_url && (
        <a
          href={post.post_url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  );
}

// Metric Badge Component
function MetricBadge({ icon, value }: { icon: "heart" | "comment" | "share"; value: number }) {
  const icons = {
    heart: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
    comment: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z" />
      </svg>
    ),
    share: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  };

  return (
    <div className="flex items-center gap-1 text-[var(--text-muted)]">
      {icons[icon]}
      <span>{value}</span>
    </div>
  );
}
