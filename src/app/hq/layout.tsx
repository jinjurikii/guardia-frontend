"use client";

import HQNav from "@/components/hq/HQNav";

export default function HQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050506]">
      <HQNav />
      {children}
    </div>
  );
}
