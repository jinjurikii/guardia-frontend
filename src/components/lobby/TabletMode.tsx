"use client";

import { Dispatch, SetStateAction } from "react";
import { ClientContext, TabletTab } from "./LobbyShell";
import CalendarTab from "./CalendarTab";
import GalleryTab from "./GalleryTab";
import GuardiaAccount from "./GuardiaAccount";

interface TabletModeProps {
  client: ClientContext | null;
  jwt: string | null;
  activeTab: TabletTab;
  setActiveTab: Dispatch<SetStateAction<TabletTab>>;
  onClose: () => void;
  onMessage: (msg: string) => void;
}

export default function TabletMode({
  client,
  jwt,
  activeTab,
  setActiveTab,
  onClose,
  onMessage,
}: TabletModeProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Tablet container - 90% of screen */}
      <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] bg-[#0c0c0c] border border-white/10 rounded-2xl overflow-hidden flex flex-col animate-tablet-open">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
          {/* Left: Tabs */}
          <div className="flex items-center gap-1">
            <TabButton
              active={activeTab === "calendar"}
              onClick={() => setActiveTab("calendar")}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              label="Calendar"
            />
            <TabButton
              active={activeTab === "gallery"}
              onClick={() => setActiveTab("gallery")}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              label="Gallery"
            />
            <TabButton
              active={activeTab === "account"}
              onClick={() => setActiveTab("account")}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              label="Account"
            />
          </div>

          {/* Right: Gio bubble + Settings + Close */}
          <div className="flex items-center gap-2">
            {/* Gio chat bubble - notification style */}
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 rounded-full text-white/80 hover:text-white hover:border-white/20 transition-all"
              title="Back to Giovanni"
            >
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-[10px] text-white font-semibold">
                G
              </div>
              <span className="text-xs">Chat</span>
            </button>

            {/* Settings gear */}
            <button
              className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "calendar" && (
            <CalendarTab client={client} jwt={jwt} onMessage={onMessage} />
          )}
          {activeTab === "gallery" && (
            <GalleryTab client={client} jwt={jwt} onMessage={onMessage} />
          )}
          {activeTab === "account" && (
            <div className="h-full overflow-y-auto">
              <GuardiaAccount />
            </div>
          )}
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes tablet-open {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-tablet-open {
          animation: tablet-open 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

// Tab button component
function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-white/10 text-white"
          : "text-white/50 hover:text-white hover:bg-white/5"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
