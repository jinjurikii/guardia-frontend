import Link from "next/link";
import { ReactNode } from "react";

interface WidgetProps {
  title: string;
  icon: ReactNode;
  accentColor: string;
  href: string;
  loading?: boolean;
  error?: string;
  alert?: boolean;
  children: ReactNode;
}

export default function Widget({
  title,
  icon,
  accentColor,
  href,
  loading = false,
  error,
  alert = false,
  children
}: WidgetProps) {
  const content = (
    <div
      className={`group relative bg-[#0a0a0b] border border-[#1a1a1f] rounded-xl p-5 transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
        alert ? "animate-pulse-border" : ""
      }`}
      style={{
        ...(alert && {
          boxShadow: `0 0 20px ${accentColor}40`
        })
      }}
    >
      {/* Hover glow effect */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          boxShadow: `0 4px 30px ${accentColor}30, inset 0 0 0 1px ${accentColor}20`
        }}
      />

      {/* Alert indicator */}
      {alert && (
        <div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
          style={{ backgroundColor: accentColor }}
        />
      )}

      {/* Error indicator */}
      {error && (
        <div className="absolute top-3 right-3 w-2 h-2 bg-red-500/60 rounded-full" />
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div
          className="text-xl transition-transform group-hover:scale-110"
          style={{ color: accentColor }}
        >
          {icon}
        </div>
        <h3
          className="text-sm font-semibold tracking-wide uppercase"
          style={{ color: accentColor }}
        >
          {title}
        </h3>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-[#1a1a1f] rounded animate-pulse" />
            <div className="h-4 bg-[#1a1a1f] rounded animate-pulse w-3/4" />
            <div className="h-4 bg-[#1a1a1f] rounded animate-pulse w-1/2" />
          </div>
        ) : error ? (
          <div className="text-[#888] text-sm">
            <p className="text-red-400/60 text-xs mb-1">Error loading data</p>
            <p className="text-[#444] text-xs">{error}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );

  return <Link href={href}>{content}</Link>;
}
