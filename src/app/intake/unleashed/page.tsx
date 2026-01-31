'use client';

import { useState } from 'react';
import { ArrowLeft, Rocket, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';

const contentThemes = [
  { id: 'promos', label: 'Promotions & Offers' },
  { id: 'education', label: 'Tips & Education' },
  { id: 'behind-scenes', label: 'Behind the Scenes' },
  { id: 'testimonials', label: 'Customer Stories' },
  { id: 'products', label: 'Product Showcases' },
  { id: 'team', label: 'Team & Culture' },
  { id: 'thought-leadership', label: 'Thought Leadership' },
  { id: 'community', label: 'Community & Events' },
];

const platforms = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'twitter', label: 'X / Twitter' },
  { id: 'gbp', label: 'Google Business' },
];

const strategyGoals = [
  { id: 'awareness', label: 'Brand Awareness' },
  { id: 'traffic', label: 'More Foot Traffic' },
  { id: 'online-sales', label: 'Online Sales' },
  { id: 'leads', label: 'Lead Generation' },
  { id: 'reputation', label: 'Reputation Management' },
  { id: 'community', label: 'Community Building' },
];

export default function IntakeUnleashedPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    business_name: '',
    industry: '',
    website: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    platforms: [] as string[],
    handles: {} as Record<string, string>,
    brand_voice: '',
    brand_colors: '',
    content_themes: [] as string[],
    gbp_status: 'not_setup',
    review_tone: 'professional',
    niche_type: 'local',
    video_style: 'educational',
    voice_preference: 'natural',
    strategy_goals: [] as string[],
    strategy_call_preference: '',
    additional_notes: '',
  });

  const updateField = (field: string, value: string | string[] | Record<string, string>) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePlatform = (platformId: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const updateHandle = (platformId: string, handle: string) => {
    setFormData(prev => ({
      ...prev,
      handles: { ...prev.handles, [platformId]: handle }
    }));
  };

  const toggleTheme = (themeId: string) => {
    setFormData(prev => ({
      ...prev,
      content_themes: prev.content_themes.includes(themeId)
        ? prev.content_themes.filter(t => t !== themeId)
        : [...prev.content_themes, themeId]
    }));
  };

  const toggleGoal = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      strategy_goals: prev.strategy_goals.includes(goalId)
        ? prev.strategy_goals.filter(g => g !== goalId)
        : [...prev.strategy_goals, goalId]
    }));
  };

  const canProceed = () => {
    if (step === 1) {
      return formData.business_name && formData.industry && formData.contact_name && formData.contact_email && formData.contact_phone;
    }
    if (step === 2) {
      return formData.platforms.length > 0;
    }
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('https://api.guardiacontent.com/intake/unleashed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        } else {
          setError('Something went wrong. Please try again.');
          setIsSubmitting(false);
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.detail || 'Submission failed. Please check your information.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Connection error. Please try again.');
      setIsSubmitting(false);
    }
  };

  const tierColor = '#8b5cf6';
  const inputClass = "w-full rounded-xl border border-white/10 bg-[#252527] px-4 py-3 text-[#ebebeb] placeholder-[#9a9a9a]/50 transition-colors focus:border-[#e8a060]/50 focus:outline-none";
  const selectClass = "w-full rounded-xl border border-white/10 bg-[#252527] px-4 py-3 text-[#ebebeb] transition-colors focus:border-[#e8a060]/50 focus:outline-none";

  return (
    <div className="min-h-screen bg-[#0f0f10] text-[#ebebeb]">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Back link */}
        <Link 
          href="/start#pricing" 
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#9a9a9a] transition-colors hover:text-[#ebebeb]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to pricing
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <div 
            className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2"
            style={{ borderColor: `${tierColor}30`, backgroundColor: `${tierColor}10` }}
          >
            <Rocket className="h-4 w-4" style={{ color: tierColor }} />
            <span className="text-sm font-medium" style={{ color: tierColor }}>Unleashed • $299/month</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">Move faster than your competition</h1>
          <p className="text-[#9a9a9a]">Full-service setup. We&apos;ll handle everything.</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm text-[#9a9a9a]">
            <span>Step {step} of 4</span>
            <span>{Math.round((step / 4) * 100)}% complete</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%`, backgroundColor: tierColor }}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-red-300">
            {error}
          </div>
        )}

        {/* Form card */}
        <div className="rounded-2xl border border-white/5 bg-[#1a1a1c] p-8">
          
          {/* Step 1: Business Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-1 text-xl font-semibold">Tell us about your business</h2>
                <p className="text-sm text-[#9a9a9a]">We&apos;ll use this to build your strategy.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-[#9a9a9a]">Business Name *</label>
                  <input
                    type="text"
                    placeholder="Acme Coffee Shop"
                    value={formData.business_name}
                    onChange={e => updateField('business_name', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-[#9a9a9a]">Industry *</label>
                  <select
                    value={formData.industry}
                    onChange={e => updateField('industry', e.target.value)}
                    className={selectClass}
                  >
                    <option value="" className="bg-[#1a1a1c]">Select your industry</option>
                    <option value="restaurant" className="bg-[#1a1a1c]">Restaurant / Food & Beverage</option>
                    <option value="retail" className="bg-[#1a1a1c]">Retail / E-commerce</option>
                    <option value="salon" className="bg-[#1a1a1c]">Salon / Beauty / Spa</option>
                    <option value="pet_grooming" className="bg-[#1a1a1c]">Pet Grooming / Pet Services</option>
                    <option value="fitness" className="bg-[#1a1a1c]">Fitness / Wellness</option>
                    <option value="professional" className="bg-[#1a1a1c]">Professional Services</option>
                    <option value="healthcare" className="bg-[#1a1a1c]">Healthcare / Medical</option>
                    <option value="realestate" className="bg-[#1a1a1c]">Real Estate</option>
                    <option value="automotive" className="bg-[#1a1a1c]">Automotive</option>
                    <option value="other" className="bg-[#1a1a1c]">Other</option>
                  </select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-[#9a9a9a]">Your Name *</label>
                    <input
                      type="text"
                      placeholder="Jane Smith"
                      value={formData.contact_name}
                      onChange={e => updateField('contact_name', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-[#9a9a9a]">Phone *</label>
                    <input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.contact_phone}
                      onChange={e => updateField('contact_phone', e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-[#9a9a9a]">Email *</label>
                  <input
                    type="email"
                    placeholder="jane@acmecoffee.com"
                    value={formData.contact_email}
                    onChange={e => updateField('contact_email', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-[#9a9a9a]">Website</label>
                  <input
                    type="url"
                    placeholder="https://acmecoffee.com"
                    value={formData.website}
                    onChange={e => updateField('website', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Platforms */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-1 text-xl font-semibold">Select your platforms</h2>
                <p className="text-sm text-[#9a9a9a]">Unleashed includes unlimited platforms. Pick all that apply.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {platforms.map(platform => (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => togglePlatform(platform.id)}
                      className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                        formData.platforms.includes(platform.id)
                          ? 'border-[#e8a060]/50 bg-[#e8a060]/10 text-[#ebebeb]'
                          : 'border-white/10 bg-[#252527] text-[#9a9a9a] hover:border-white/20 hover:bg-[#2a2a2c]'
                      }`}
                    >
                      <div className={`flex h-4 w-4 items-center justify-center rounded border ${
                        formData.platforms.includes(platform.id)
                          ? 'border-[#e8a060] bg-[#e8a060]'
                          : 'border-[#9a9a9a]/50'
                      }`}>
                        {formData.platforms.includes(platform.id) && <Check className="h-3 w-3 text-black" />}
                      </div>
                      {platform.label}
                    </button>
                  ))}
                </div>

                {formData.platforms.length > 0 && (
                  <div className="space-y-3 pt-4">
                    {formData.platforms.map(platformId => {
                      const platform = platforms.find(p => p.id === platformId);
                      return (
                        <div key={platformId}>
                          <label className="mb-2 block text-sm text-[#9a9a9a]">{platform?.label} handle</label>
                          <input
                            type="text"
                            placeholder={platformId === 'gbp' ? 'Business name as listed' : `@${formData.business_name?.toLowerCase().replace(/\s/g, '') || 'handle'}`}
                            value={formData.handles[platformId] || ''}
                            onChange={e => updateHandle(platformId, e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Brand & Content */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-1 text-xl font-semibold">Define your brand</h2>
                <p className="text-sm text-[#9a9a9a]">Help us understand your vibe.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-3 block text-sm text-[#9a9a9a]">Content themes</label>
                  <div className="grid grid-cols-2 gap-2">
                    {contentThemes.map(theme => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => toggleTheme(theme.id)}
                        className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                          formData.content_themes.includes(theme.id)
                            ? 'border-[#e8a060]/50 bg-[#e8a060]/10 text-[#ebebeb]'
                            : 'border-white/10 bg-[#252527] text-[#9a9a9a] hover:border-white/20 hover:bg-[#2a2a2c]'
                        }`}
                      >
                        <div className={`flex h-4 w-4 items-center justify-center rounded border ${
                          formData.content_themes.includes(theme.id)
                            ? 'border-[#e8a060] bg-[#e8a060]'
                            : 'border-[#9a9a9a]/50'
                        }`}>
                          {formData.content_themes.includes(theme.id) && <Check className="h-3 w-3 text-black" />}
                        </div>
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-[#9a9a9a]">Brand colors</label>
                  <input
                    type="text"
                    placeholder="#FF6B00 or 'match my website'"
                    value={formData.brand_colors}
                    onChange={e => updateField('brand_colors', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-[#9a9a9a]">Brand voice</label>
                  <textarea
                    placeholder="E.g., 'Friendly and casual' or 'Professional but warm'"
                    value={formData.brand_voice}
                    onChange={e => updateField('brand_voice', e.target.value)}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Strategy */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-1 text-xl font-semibold">Your strategy goals</h2>
                <p className="text-sm text-[#9a9a9a]">What matters most to your business?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-3 block text-sm text-[#9a9a9a]">Primary goals</label>
                  <div className="grid grid-cols-2 gap-2">
                    {strategyGoals.map(goal => (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => toggleGoal(goal.id)}
                        className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                          formData.strategy_goals.includes(goal.id)
                            ? 'border-[#e8a060]/50 bg-[#e8a060]/10 text-[#ebebeb]'
                            : 'border-white/10 bg-[#252527] text-[#9a9a9a] hover:border-white/20 hover:bg-[#2a2a2c]'
                        }`}
                      >
                        <div className={`flex h-4 w-4 items-center justify-center rounded border ${
                          formData.strategy_goals.includes(goal.id)
                            ? 'border-[#e8a060] bg-[#e8a060]'
                            : 'border-[#9a9a9a]/50'
                        }`}>
                          {formData.strategy_goals.includes(goal.id) && <Check className="h-3 w-3 text-black" />}
                        </div>
                        {goal.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-[#9a9a9a]">Strategy call preference</label>
                  <select
                    value={formData.strategy_call_preference}
                    onChange={e => updateField('strategy_call_preference', e.target.value)}
                    className={selectClass}
                  >
                    <option value="" className="bg-[#1a1a1c]">Select preferred time</option>
                    <option value="morning" className="bg-[#1a1a1c]">Mornings (9-12 ET)</option>
                    <option value="afternoon" className="bg-[#1a1a1c]">Afternoons (12-5 ET)</option>
                    <option value="evening" className="bg-[#1a1a1c]">Evenings (5-8 ET)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-[#9a9a9a]">Anything else we should know?</label>
                  <textarea
                    placeholder="Special requests, upcoming launches, busy seasons..."
                    value={formData.additional_notes}
                    onChange={e => updateField('additional_notes', e.target.value)}
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="rounded-xl border border-white/10 bg-[#252527] px-6 py-3 font-medium transition-colors hover:bg-[#2a2a2c]"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="rounded-xl px-8 py-3 font-semibold transition-colors disabled:opacity-50"
                style={{ backgroundColor: tierColor }}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl px-8 py-3 font-semibold transition-colors disabled:opacity-70"
                style={{ backgroundColor: tierColor }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting to checkout...
                  </>
                ) : (
                  'Continue to Payment →'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Trust signals */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-[#9a9a9a]">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#e8a060]" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#e8a060]" />
            <span>30 posts + 4 videos/month</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#e8a060]" />
            <span>Monthly strategy call</span>
          </div>
        </div>
      </div>
    </div>
  );
}
