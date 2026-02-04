"use client";

/**
 * QUICK SETUP CARD
 * 
 * Shows setup progress for new clients
 * Disappears when all steps are complete
 */

interface SetupStep {
  id: string;
  label: string;
  complete: boolean;
  action?: () => void;
  actionLabel?: string;
}

interface QuickSetupCardProps {
  steps: SetupStep[];
  onDismiss?: () => void;
}

export default function QuickSetupCard({ steps, onDismiss }: QuickSetupCardProps) {
  const completedCount = steps.filter(s => s.complete).length;
  const totalSteps = steps.length;
  const allComplete = completedCount === totalSteps;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  // Don't show if all complete
  if (allComplete) return null;

  return (
    <div 
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.02), 0 4px 12px rgba(0,0,0,0.3)',
        border: '1px solid rgba(245,158,11,0.1)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, rgba(245,158,11,0.2), rgba(245,158,11,0.1))',
            }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-[var(--text-primary)]">Getting Started</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {completedCount}/{totalSteps} steps complete
            </p>
          </div>
        </div>
        
        {/* Progress ring */}
        <div className="relative w-12 h-12">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            {/* Background circle */}
            <circle
              cx="18" cy="18" r="14"
              fill="none"
              stroke="var(--bg-elevated)"
              strokeWidth="3"
            />
            {/* Progress circle */}
            <circle
              cx="18" cy="18" r="14"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeDasharray={`${progressPercent * 0.88} 88`}
              strokeLinecap="round"
              style={{ 
                transition: 'stroke-dasharray 0.5s ease',
                filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.4))'
              }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#f59e0b]">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="p-4 space-y-2">
        {steps.map((step, i) => (
          <div 
            key={step.id}
            className="flex items-center gap-3 p-3 rounded-xl transition-all"
            style={{
              background: step.complete 
                ? 'rgba(34,197,94,0.05)' 
                : 'rgba(255,255,255,0.02)',
              border: step.complete
                ? '1px solid rgba(34,197,94,0.2)'
                : '1px solid rgba(255,255,255,0.03)'
            }}
          >
            {/* Step indicator */}
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: step.complete 
                  ? 'linear-gradient(145deg, #22c55e, #16a34a)'
                  : 'var(--bg-elevated)',
                boxShadow: step.complete 
                  ? '0 2px 6px rgba(34,197,94,0.3)'
                  : 'inset 0 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              {step.complete ? (
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <span className="text-xs font-bold text-[var(--text-muted)]">{i + 1}</span>
              )}
            </div>
            
            {/* Step content */}
            <div className="flex-1 min-w-0">
              <span 
                className="text-sm transition-colors"
                style={{ 
                  color: step.complete ? '#22c55e' : 'var(--text-primary)',
                  textDecoration: step.complete ? 'line-through' : 'none',
                  opacity: step.complete ? 0.7 : 1
                }}
              >
                {step.label}
              </span>
            </div>

            {/* Action button */}
            {!step.complete && step.action && (
              <button
                onClick={step.action}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(145deg, #f59e0b, #d97706)',
                  color: 'white',
                  boxShadow: '0 2px 6px rgba(245,158,11,0.3)'
                }}
              >
                {step.actionLabel || 'Do it'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Dismiss option */}
      {onDismiss && (
        <div className="px-4 pb-4">
          <button
            onClick={onDismiss}
            className="w-full py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            I'll do this later
          </button>
        </div>
      )}
    </div>
  );
}
