interface InputProps {
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function Input({
  type = "text",
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled = false,
  className = ""
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      className={`px-4 py-3 bg-[#1c1c1e] border border-white/5 rounded-xl text-[#e8e8e8] placeholder-[#6a6a6a] focus:outline-none focus:border-[#e8a060]/50 focus:ring-2 focus:ring-[#e8a060]/20 transition-all disabled:opacity-50 ${className}`}
    />
  );
}
