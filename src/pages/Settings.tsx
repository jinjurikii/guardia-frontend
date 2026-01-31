"use client";

import React, { useState, useEffect } from 'react';

/**
 * SETTINGS PAGE
 *
 * Comprehensive settings interface with form controls
 * Following 2B Calm design aesthetic
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.guardiacontent.com';

// 2B Calm Design System
const tokens = {
  bg: {
    base: '#0c0c0d',
    surface: '#111113',
    elevated: '#1a1a1c',
    overlay: '#222224',
  },
  text: {
    primary: '#e8e8e8',
    secondary: '#888888',
    tertiary: '#555555',
  },
  accent: {
    primary: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.15)',
  },
  status: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  shadow: {
    inset: 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.02)',
    raised: '0 4px 12px rgba(0,0,0,0.3)',
    button: 'inset 0 1px 1px rgba(255,255,255,0.03), 2px 2px 6px rgba(0,0,0,0.3)',
  }
};

// Types
interface IconProps { size?: number; color?: string; }

interface SettingsFormData {
  // Profile
  businessName: string;
  contactName: string;
  contactEmail: string;
  username: string;

  // Preferences
  notifications: boolean;
  emailDigest: boolean;
  autoPublish: boolean;
  darkMode: boolean;

  // Content
  defaultTone: string;
  contentLanguage: string;
  timezone: string;

  // Privacy
  dataCollection: boolean;
  analyticsSharing: boolean;
}

// Icons
const Icons = {
  Save: ({ size = 24, color }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
      <polyline points="17,21 17,13 7,13 7,21"/>
      <polyline points="7,3 7,8 15,8"/>
    </svg>
  ),
  User: ({ size = 24, color }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <circle cx="12" cy="8" r="4"/>
      <path d="M20 21a8 8 0 10-16 0"/>
    </svg>
  ),
  Bell: ({ size = 24, color }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  FileText: ({ size = 24, color }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10,9 9,9 8,9"/>
    </svg>
  ),
  Shield: ({ size = 24, color }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Check: ({ size = 24, color }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  ),
};

// =============================================================================
// FORM COMPONENTS
// =============================================================================

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  helpText?: string;
}

const InputField = ({ label, value, onChange, type = 'text', placeholder, helpText }: InputFieldProps) => (
  <div>
    <label className="block text-[10px] uppercase tracking-wider mb-2" style={{ color: tokens.text.tertiary }}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl text-sm placeholder-[#444] focus:outline-none transition-all"
      style={{
        background: '#0a0a0a',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.03)',
        border: 'none',
        color: tokens.text.primary
      }}
      placeholder={placeholder}
    />
    {helpText && (
      <p className="text-xs mt-1.5" style={{ color: tokens.text.tertiary }}>
        {helpText}
      </p>
    )}
  </div>
);

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  helpText?: string;
}

const SelectField = ({ label, value, onChange, options, helpText }: SelectFieldProps) => (
  <div>
    <label className="block text-[10px] uppercase tracking-wider mb-2" style={{ color: tokens.text.tertiary }}>
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all appearance-none cursor-pointer"
      style={{
        background: '#0a0a0a',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.03)',
        border: 'none',
        color: tokens.text.primary
      }}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {helpText && (
      <p className="text-xs mt-1.5" style={{ color: tokens.text.tertiary }}>
        {helpText}
      </p>
    )}
  </div>
);

interface ToggleFieldProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}

const ToggleField = ({ label, value, onChange, description }: ToggleFieldProps) => (
  <div className="flex items-start justify-between py-2">
    <div className="flex-1">
      <p className="text-sm font-medium mb-0.5" style={{ color: tokens.text.primary }}>
        {label}
      </p>
      {description && (
        <p className="text-xs" style={{ color: tokens.text.tertiary }}>
          {description}
        </p>
      )}
    </div>
    <button
      onClick={() => onChange(!value)}
      className="w-11 h-6 rounded-full p-0.5 transition-colors flex-shrink-0 ml-4"
      style={{ backgroundColor: value ? tokens.accent.primary : tokens.bg.overlay }}
    >
      <div
        className="w-5 h-5 rounded-full transition-transform"
        style={{
          backgroundColor: '#fff',
          transform: value ? 'translateX(20px)' : 'translateX(0)'
        }}
      />
    </button>
  </div>
);

// =============================================================================
// SECTION COMPONENT
// =============================================================================

interface SectionProps {
  title: string;
  icon: React.ComponentType<IconProps>;
  children: React.ReactNode;
}

const Section = ({ title, icon: Icon, children }: SectionProps) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3 px-1">
      <Icon size={16} color={tokens.text.tertiary} />
      <h3 className="text-xs font-medium uppercase tracking-wider" style={{ color: tokens.text.tertiary }}>
        {title}
      </h3>
    </div>
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'linear-gradient(145deg, #111113, #0a0a0b)',
        boxShadow: `${tokens.shadow.inset}, ${tokens.shadow.raised}`
      }}
    >
      {children}
    </div>
  </div>
);

// =============================================================================
// MAIN SETTINGS COMPONENT
// =============================================================================

export default function Settings() {
  const [formData, setFormData] = useState<SettingsFormData>({
    // Profile
    businessName: '',
    contactName: '',
    contactEmail: '',
    username: '',

    // Preferences
    notifications: true,
    emailDigest: true,
    autoPublish: false,
    darkMode: true,

    // Content
    defaultTone: 'professional',
    contentLanguage: 'en',
    timezone: 'UTC',

    // Privacy
    dataCollection: true,
    analyticsSharing: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load settings from API
    const loadSettings = async () => {
      const jwt = localStorage.getItem('guardia_jwt');
      if (!jwt) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/lobby/client/settings`, {
          headers: { Authorization: `Bearer ${jwt}` }
        });

        if (res.ok) {
          const data = await res.json();
          setFormData(prevData => ({ ...prevData, ...data }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }

      setLoading(false);
    };

    loadSettings();
  }, []);

  const updateField = <K extends keyof SettingsFormData>(
    field: K,
    value: SettingsFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      const jwt = localStorage.getItem('guardia_jwt');
      if (!jwt) throw new Error('Not authenticated');

      const res = await fetch(`${API_BASE}/lobby/client/settings`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setHasChanges(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error('Save failed');
      }
    } catch (err) {
      console.error('Save error:', err);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: tokens.bg.base }}>
        <div className="w-8 h-8 border-2 border-[#333] border-t-[#f59e0b] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-safe pb-24" style={{ backgroundColor: tokens.bg.base }}>
      {/* Header */}
      <header className="px-5 py-4 mb-4">
        <h1 className="text-2xl font-semibold" style={{ color: tokens.text.primary }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: tokens.text.tertiary }}>
          Manage your account and preferences
        </p>
      </header>

      {/* Content */}
      <div className="px-4">
        {/* Profile Settings */}
        <Section title="Profile Information" icon={Icons.User}>
          <div className="space-y-4">
            <InputField
              label="Business Name"
              value={formData.businessName}
              onChange={(v) => updateField('businessName', v)}
              placeholder="Your business name"
            />
            <InputField
              label="Contact Name"
              value={formData.contactName}
              onChange={(v) => updateField('contactName', v)}
              placeholder="Your full name"
            />
            <InputField
              label="Email Address"
              type="email"
              value={formData.contactEmail}
              onChange={(v) => updateField('contactEmail', v)}
              placeholder="you@example.com"
              helpText="We'll send important updates to this email"
            />
            <InputField
              label="Username"
              value={formData.username}
              onChange={(v) => updateField('username', v)}
              placeholder="username"
              helpText="This will be your unique identifier"
            />
          </div>
        </Section>

        {/* Notification Preferences */}
        <Section title="Notifications" icon={Icons.Bell}>
          <div className="space-y-4">
            <ToggleField
              label="Push Notifications"
              value={formData.notifications}
              onChange={(v) => updateField('notifications', v)}
              description="Receive notifications about your content"
            />
            <ToggleField
              label="Email Digest"
              value={formData.emailDigest}
              onChange={(v) => updateField('emailDigest', v)}
              description="Get weekly summary of your activity"
            />
            <ToggleField
              label="Auto-Publish Alerts"
              value={formData.autoPublish}
              onChange={(v) => updateField('autoPublish', v)}
              description="Notify when content is auto-published"
            />
          </div>
        </Section>

        {/* Content Preferences */}
        <Section title="Content Settings" icon={Icons.FileText}>
          <div className="space-y-4">
            <SelectField
              label="Default Tone"
              value={formData.defaultTone}
              onChange={(v) => updateField('defaultTone', v)}
              options={[
                { value: 'professional', label: 'Professional' },
                { value: 'casual', label: 'Casual' },
                { value: 'friendly', label: 'Friendly' },
                { value: 'formal', label: 'Formal' },
                { value: 'creative', label: 'Creative' }
              ]}
              helpText="Default voice for AI-generated content"
            />
            <SelectField
              label="Content Language"
              value={formData.contentLanguage}
              onChange={(v) => updateField('contentLanguage', v)}
              options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Spanish' },
                { value: 'fr', label: 'French' },
                { value: 'de', label: 'German' },
                { value: 'it', label: 'Italian' }
              ]}
            />
            <SelectField
              label="Timezone"
              value={formData.timezone}
              onChange={(v) => updateField('timezone', v)}
              options={[
                { value: 'UTC', label: 'UTC' },
                { value: 'America/New_York', label: 'Eastern Time (ET)' },
                { value: 'America/Chicago', label: 'Central Time (CT)' },
                { value: 'America/Denver', label: 'Mountain Time (MT)' },
                { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                { value: 'Europe/London', label: 'London (GMT)' },
                { value: 'Europe/Paris', label: 'Paris (CET)' }
              ]}
              helpText="Used for scheduling posts"
            />
          </div>
        </Section>

        {/* Privacy & Security */}
        <Section title="Privacy & Security" icon={Icons.Shield}>
          <div className="space-y-4">
            <ToggleField
              label="Data Collection"
              value={formData.dataCollection}
              onChange={(v) => updateField('dataCollection', v)}
              description="Allow us to collect usage data to improve your experience"
            />
            <ToggleField
              label="Analytics Sharing"
              value={formData.analyticsSharing}
              onChange={(v) => updateField('analyticsSharing', v)}
              description="Share anonymized analytics with third parties"
            />
          </div>
        </Section>
      </div>

      {/* Floating Save Button */}
      {hasChanges && (
        <div
          className="fixed bottom-0 left-0 right-0 p-4 border-t border-white/5"
          style={{
            background: 'linear-gradient(180deg, transparent, #0c0c0d 20%)',
            paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))'
          }}
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(145deg, #f59e0b, #d97706)',
              boxShadow: '0 2px 8px rgba(245,158,11,0.3), inset 0 1px 1px rgba(255,255,255,0.2)',
              color: '#0c0c0d'
            }}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0c0c0d]/30 border-t-[#0c0c0d] rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Icons.Save size={18} color="#0c0c0d" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Save Success Toast */}
      {saveSuccess && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl flex items-center gap-2 z-50 transition-all"
          style={{
            background: 'linear-gradient(145deg, #22c55e, #16a34a)',
            boxShadow: '0 4px 12px rgba(34,197,94,0.4)',
            color: '#fff'
          }}
        >
          <Icons.Check size={18} color="#fff" />
          <span className="text-sm font-medium">Settings saved successfully</span>
        </div>
      )}

      <style jsx global>{`
        .pt-safe { padding-top: env(safe-area-inset-top, 12px); }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 8px); }
      `}</style>
    </div>
  );
}
