"use client";

import React, { useState, useEffect, useCallback } from 'react';

/**
 * GUARDIA ACCOUNT — Settings & Profile
 *
 * Standard account management:
 * - Profile info
 * - Subscription tier & usage
 * - Connected accounts (with real-time status from API)
 * - Settings
 * - Logout
 */

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.guardiacontent.com';

// Get client ID from localStorage or auth context
const getClientId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('guardia_client_id') || localStorage.getItem('clientId');
  }
  return null;
};

// =============================================================================
// DESIGN TOKENS
// =============================================================================

const tokens = {
  bg: {
    base: '#121214',
    surface: '#1c1c1e',
    elevated: '#2a2a2c',
    overlay: '#3a3a3c',
  },
  text: {
    primary: '#e8e8e8',
    secondary: '#a0a0a0',
    tertiary: '#6a6a6a',
  },
  accent: {
    primary: '#e8a060',
    glow: 'rgba(232, 160, 96, 0.2)',
  },
  status: {
    connected: '#10b981',
    needs_refresh: '#f59e0b',
    limited: '#f59e0b',
    disconnected: '#6a6a6a',
  },
  tier: {
    spark: '#f59e0b',
    pro: '#8b5cf6',
    unleashed: '#ec4899',
  }
};

// =============================================================================
// TYPES
// =============================================================================

interface IconProps {
  size?: number;
  color?: string;
}

interface Connection {
  platform: string;
  handle?: string;
  display_name?: string;
  connected_at?: string;
  status: 'connected' | 'needs_refresh' | 'limited' | 'disconnected';
  days_until_expiry?: number | null;
  message?: string;
  needs_action?: boolean;
}

interface ConnectionsResponse {
  connections: Connection[];
  facebook: boolean;
  instagram: boolean;
  warnings: Array<{ platform: string; message: string }>;
  healthy: boolean;
}

interface ProfileHeaderProps {
  name: string;
  email: string;
  tier: 'spark' | 'pro' | 'unleashed';
}

interface UsageStatsProps {
  used: number;
  total: number;
  period: string;
}

interface ConnectedAccountProps {
  platform: string;
  icon: React.ComponentType<IconProps>;
  connection?: Connection;
  onConnect?: () => void;
  onDisconnect?: (platform: string) => void;
  isLoading?: boolean;
}

interface MenuItemProps {
  icon: React.ComponentType<IconProps>;
  label: string;
  onClick?: () => void;
  danger?: boolean;
  toggle?: boolean;
  toggled?: boolean;
}

interface SectionProps {
  title?: string;
  children: React.ReactNode;
}

interface BottomNavProps {
  active: string;
  onChange: (id: string) => void;
}

// =============================================================================
// ICONS
// =============================================================================

const Icons = {
  User: ({ size = 24, color }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <circle cx="12" cy="8" r="4"/>
      <path d="M20 21a8 8 0 10-16 0"/>
    </svg>
  ),
  CreditCard: ({ size = 24, color }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="M2 10h20"/>
    </svg>
  ),
  BarChart: ({ size = 24, color }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M12 20V10M18 20V4M6 20v-4"/>
    </svg>
  ),
  Link: ({ size = 24, color }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
    </svg>
  ),
  Bell: ({ size = 24, color }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  Shield: ({ size = 24, color }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  HelpCircle: ({ size = 24, color }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
      <circle cx="12" cy="17" r="0.5" fill={color}/>
    </svg>
  ),
  LogOut: ({ size = 24, color }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16,17 21,12 16,7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  ChevronRight: ({ size = 24, color }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  ),
  Facebook: ({ size = 24, color }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  Instagram: ({ size = 24, color }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  ),
  Check: ({ size = 24, color }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12l5 5L19 7"/>
    </svg>
  ),
};

// =============================================================================
// COMPONENTS
// =============================================================================

// Profile header
const ProfileHeader = ({ name, email, tier }: ProfileHeaderProps) => {
  const tierColors = {
    spark: tokens.tier.spark,
    pro: tokens.tier.pro,
    unleashed: tokens.tier.unleashed,
  };

  return (
    <div 
      className="p-5 rounded-2xl flex items-center gap-4"
      style={{ backgroundColor: tokens.bg.surface }}
    >
      {/* Avatar */}
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
        style={{ 
          backgroundColor: tokens.accent.glow,
          color: tokens.accent.primary,
        }}
      >
        {name.charAt(0)}
      </div>
      
      {/* Info */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold" style={{ color: tokens.text.primary }}>
          {name}
        </h2>
        <p className="text-sm" style={{ color: tokens.text.tertiary }}>
          {email}
        </p>
        <div 
          className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{ 
            backgroundColor: `${tierColors[tier]}20`,
            color: tierColors[tier],
          }}
        >
          <span className="capitalize">{tier}</span>
          <span>Plan</span>
        </div>
      </div>
    </div>
  );
};

// Usage stats
const UsageStats = ({ used, total, period }: UsageStatsProps) => {
  const percentage = Math.round((used / total) * 100);
  
  return (
    <div 
      className="p-4 rounded-2xl"
      style={{ backgroundColor: tokens.bg.surface }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium" style={{ color: tokens.text.secondary }}>
          Monthly Usage
        </h3>
        <span className="text-xs" style={{ color: tokens.text.tertiary }}>
          {period}
        </span>
      </div>
      
      {/* Progress bar */}
      <div 
        className="h-2 rounded-full overflow-hidden mb-2"
        style={{ backgroundColor: tokens.bg.elevated }}
      >
        <div 
          className="h-full rounded-full transition-all"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: percentage > 80 ? tokens.tier.spark : tokens.accent.primary,
          }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: tokens.text.primary }}>
          <span className="font-semibold">{used}</span>
          <span style={{ color: tokens.text.tertiary }}> / {total} posts</span>
        </span>
        <span 
          className="text-xs"
          style={{ color: percentage > 80 ? tokens.tier.spark : tokens.text.tertiary }}
        >
          {percentage}% used
        </span>
      </div>
    </div>
  );
};

// Connected account item with full status support
const ConnectedAccount = ({
  platform,
  icon: Icon,
  connection,
  onConnect,
  onDisconnect,
  isLoading
}: ConnectedAccountProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const status = connection?.status || 'disconnected';
  const handle = connection?.handle;
  const daysUntilExpiry = connection?.days_until_expiry;
  const message = connection?.message;

  const statusConfig = {
    connected: {
      color: tokens.status.connected,
      label: 'Connected',
      icon: '🟢',
    },
    needs_refresh: {
      color: tokens.status.needs_refresh,
      label: daysUntilExpiry !== null ? `Expires in ${daysUntilExpiry}d` : 'Needs Refresh',
      icon: '🟡',
    },
    limited: {
      color: tokens.status.limited,
      label: 'Limited',
      icon: '🟡',
    },
    disconnected: {
      color: tokens.status.disconnected,
      label: 'Disconnected',
      icon: '⚪',
    },
  };

  const config = statusConfig[status] || statusConfig.disconnected;
  const isConnected = status === 'connected' || status === 'needs_refresh' || status === 'limited';

  const handleDisconnect = () => {
    setShowConfirm(false);
    onDisconnect?.(platform.toLowerCase());
  };

  return (
    <div
      className="p-4 rounded-xl"
      style={{ backgroundColor: tokens.bg.elevated }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: tokens.bg.overlay }}
          >
            <Icon size={20} color={isConnected ? tokens.text.primary : tokens.text.tertiary} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: tokens.text.primary }}>
              {platform}
            </p>
            {handle && (
              <p className="text-xs" style={{ color: tokens.text.tertiary }}>
                {handle.startsWith('@') ? handle : `@${handle}`}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status indicator */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs">{config.icon}</span>
            <span className="text-xs" style={{ color: config.color }}>
              {config.label}
            </span>
          </div>
        </div>
      </div>

      {/* Warning message for needs_refresh */}
      {status === 'needs_refresh' && message && (
        <div
          className="mt-3 p-2 rounded-lg text-xs"
          style={{
            backgroundColor: `${tokens.status.needs_refresh}15`,
            color: tokens.status.needs_refresh,
          }}
        >
          ⚠️ {message}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-3 flex gap-2">
        {isConnected ? (
          <>
            {status === 'needs_refresh' && (
              <button
                onClick={() => onConnect?.()}
                disabled={isLoading}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-opacity"
                style={{
                  backgroundColor: tokens.accent.primary,
                  color: tokens.bg.base,
                  opacity: isLoading ? 0.5 : 1,
                }}
              >
                Reconnect
              </button>
            )}
            {!showConfirm ? (
              <button
                onClick={() => setShowConfirm(true)}
                disabled={isLoading}
                className="px-3 py-2 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: tokens.bg.overlay,
                  color: tokens.text.secondary,
                }}
              >
                Disconnect
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleDisconnect}
                  disabled={isLoading}
                  className="px-3 py-2 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                  }}
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-3 py-2 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: tokens.bg.overlay,
                    color: tokens.text.secondary,
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={() => onConnect?.()}
            disabled={isLoading}
            className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-opacity"
            style={{
              backgroundColor: tokens.accent.glow,
              color: tokens.accent.primary,
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </button>
        )}
      </div>
    </div>
  );
};

// Settings menu item
const MenuItem = ({ icon: Icon, label, onClick, danger, toggle, toggled }: MenuItemProps) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 rounded-xl transition-colors active:opacity-80"
    style={{ backgroundColor: tokens.bg.surface }}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} color={danger ? tokens.tier.spark : tokens.text.secondary} />
      <span 
        className="text-sm font-medium"
        style={{ color: danger ? tokens.tier.spark : tokens.text.primary }}
      >
        {label}
      </span>
    </div>
    
    {toggle ? (
      <div 
        className="w-11 h-6 rounded-full p-0.5 transition-colors"
        style={{ backgroundColor: toggled ? tokens.accent.primary : tokens.bg.overlay }}
      >
        <div 
          className="w-5 h-5 rounded-full transition-transform"
          style={{ 
            backgroundColor: tokens.text.primary,
            transform: toggled ? 'translateX(20px)' : 'translateX(0)',
          }}
        />
      </div>
    ) : (
      <Icons.ChevronRight size={20} color={tokens.text.tertiary} />
    )}
  </button>
);

// Section wrapper
const Section = ({ title, children }: SectionProps) => (
  <div className="mb-6">
    {title && (
      <h3 
        className="text-xs font-medium uppercase tracking-wider px-1 mb-3"
        style={{ color: tokens.text.tertiary }}
      >
        {title}
      </h3>
    )}
    <div className="space-y-2">
      {children}
    </div>
  </div>
);

// Bottom navigation
const BottomNav = ({ active, onChange }: BottomNavProps) => {
  const items = [
    { id: 'home', label: 'Home', icon: (color: string, filled: boolean) => filled ? (
      <svg width={24} height={24} viewBox="0 0 24 24" fill={color}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
    ) : (
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10"/></svg>
    )},
    { id: 'gallery', label: 'Gallery', icon: (color: string, filled: boolean) => filled ? (
      <svg width={24} height={24} viewBox="0 0 24 24" fill={color}><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
    ) : (
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
    )},
    { id: 'schedule', label: 'Schedule', icon: (color: string, filled: boolean) => filled ? (
      <svg width={24} height={24} viewBox="0 0 24 24" fill={color}><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/></svg>
    ) : (
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
    )},
    { id: 'account', label: 'Account', icon: (color: string, filled: boolean) => filled ? (
      <svg width={24} height={24} viewBox="0 0 24 24" fill={color}><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
    ) : (
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 10-16 0"/></svg>
    )},
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 pb-safe"
      style={{ backgroundColor: tokens.bg.surface }}
    >
      <div className="flex justify-around items-center h-16">
        {items.map(({ id, label, icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex flex-col items-center justify-center"
              style={{ width: 64, height: 48 }}
            >
              {icon(isActive ? tokens.accent.primary : tokens.text.tertiary, isActive)}
              <span 
                className="text-[10px] mt-1"
                style={{ color: isActive ? tokens.accent.primary : tokens.text.tertiary }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// =============================================================================
// MAIN ACCOUNT VIEW
// =============================================================================

// Connected Accounts Section with API integration
const ConnectedAccountsSection = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const clientId = getClientId();

  const fetchConnections = useCallback(async () => {
    if (!clientId) {
      setError('No client ID found. Please log in again.');
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch(`${API_BASE}/auth/facebook/status?client_id=${clientId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch connection status');
      }

      const data = await response.json();
      setConnections(data.connections || []);
    } catch (err) {
      console.error('Error fetching connections:', err);
      setError('Unable to load connection status');
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleConnect = (platform: string) => {
    if (!clientId) {
      setError('No client ID found. Please log in again.');
      return;
    }

    setActionLoading(platform);
    // Redirect to OAuth flow
    window.location.href = `${API_BASE}/auth/facebook/connect?client_id=${clientId}`;
  };

  const handleDisconnect = async (platform: string) => {
    if (!clientId) return;

    setActionLoading(platform);

    try {
      const response = await fetch(
        `${API_BASE}/auth/facebook/disconnect?client_id=${clientId}&platform=${platform}`
      );

      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }

      // Refresh the connections list
      await fetchConnections();
    } catch (err) {
      console.error('Error disconnecting:', err);
      setError('Failed to disconnect. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Find connections by platform
  const facebookConnection = connections.find(c => c.platform === 'facebook');
  const instagramConnection = connections.find(c => c.platform === 'instagram');

  if (isLoading) {
    return (
      <Section title="Connected Accounts">
        <div
          className="p-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: tokens.bg.elevated }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: tokens.accent.primary, borderTopColor: 'transparent' }}
            />
            <span className="text-sm" style={{ color: tokens.text.secondary }}>
              Loading connections...
            </span>
          </div>
        </div>
      </Section>
    );
  }

  if (error) {
    return (
      <Section title="Connected Accounts">
        <div
          className="p-4 rounded-xl"
          style={{ backgroundColor: tokens.bg.elevated }}
        >
          <div
            className="p-3 rounded-lg text-sm mb-3"
            style={{ backgroundColor: '#ef444420', color: '#ef4444' }}
          >
            {error}
          </div>
          <button
            onClick={() => {
              setIsLoading(true);
              setError(null);
              fetchConnections();
            }}
            className="w-full px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: tokens.accent.glow,
              color: tokens.accent.primary,
            }}
          >
            Retry
          </button>
        </div>
      </Section>
    );
  }

  return (
    <Section title="Connected Accounts">
      <div className="space-y-2">
        <ConnectedAccount
          platform="Facebook"
          icon={Icons.Facebook}
          connection={facebookConnection}
          onConnect={() => handleConnect('facebook')}
          onDisconnect={handleDisconnect}
          isLoading={actionLoading === 'facebook'}
        />
        <ConnectedAccount
          platform="Instagram"
          icon={Icons.Instagram}
          connection={instagramConnection}
          onConnect={() => handleConnect('instagram')}
          onDisconnect={handleDisconnect}
          isLoading={actionLoading === 'instagram'}
        />
      </div>

      {/* Health summary */}
      {connections.length > 0 && connections.some(c => c.needs_action) && (
        <div
          className="mt-3 p-3 rounded-lg text-xs"
          style={{
            backgroundColor: `${tokens.status.needs_refresh}15`,
            color: tokens.status.needs_refresh,
          }}
        >
          ⚠️ Some connections need attention. Reconnect to maintain posting access.
        </div>
      )}
    </Section>
  );
};

export default function GuardiaAccount() {
  const [activeTab, setActiveTab] = useState('account');
  const [notifications, setNotifications] = useState(true);

  return (
    <div 
      className="min-h-screen pt-safe pb-20"
      style={{ backgroundColor: tokens.bg.base }}
    >
      {/* Header */}
      <header className="px-5 py-4">
        <h1 
          className="text-xl font-semibold"
          style={{ color: tokens.text.primary }}
        >
          Account
        </h1>
      </header>

      {/* Content */}
      <div className="px-4">
        {/* Profile */}
        <div className="mb-6">
          <ProfileHeader
            name="Alex Thompson"
            email="alex@example.com"
            tier="pro"
          />
        </div>

        {/* Usage */}
        <div className="mb-6">
          <UsageStats
            used={127}
            total={150}
            period="Jan 2025"
          />
        </div>

        {/* Connected Accounts */}
        <ConnectedAccountsSection />

        {/* Subscription */}
        <Section title="Subscription">
          <MenuItem
            icon={Icons.CreditCard}
            label="Manage Subscription"
            onClick={() => {}}
          />
          <MenuItem
            icon={Icons.BarChart}
            label="Billing History"
            onClick={() => {}}
          />
        </Section>

        {/* Settings */}
        <Section title="Settings">
          <MenuItem
            icon={Icons.Bell}
            label="Push Notifications"
            toggle
            toggled={notifications}
            onClick={() => setNotifications(!notifications)}
          />
          <MenuItem
            icon={Icons.Shield}
            label="Privacy & Security"
            onClick={() => {}}
          />
          <MenuItem
            icon={Icons.HelpCircle}
            label="Help & Support"
            onClick={() => {}}
          />
        </Section>

        {/* Logout */}
        <Section>
          <MenuItem
            icon={Icons.LogOut}
            label="Log Out"
            danger
            onClick={() => {}}
          />
        </Section>

        {/* Version */}
        <p 
          className="text-center text-xs mt-6 mb-4"
          style={{ color: tokens.text.tertiary }}
        >
          Guardia v1.0.0
        </p>
      </div>

      {/* Bottom Nav */}
      <BottomNav active={activeTab} onChange={setActiveTab} />

      {/* Global styles */}
      <style jsx global>{`
        .pt-safe { padding-top: env(safe-area-inset-top, 12px); }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 8px); }
      `}</style>
    </div>
  );
}
