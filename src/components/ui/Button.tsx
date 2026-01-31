import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  className = ""
}: ButtonProps) {
  const baseClasses = "rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-[#e8a060] text-[#121214] hover:bg-[#d4914f]",
    secondary: "bg-[#1c1c1e] text-[#a0a0a0] hover:bg-[#2a2a2c] hover:text-[#e8e8e8] border border-white/5",
    ghost: "text-[#6a6a6a] hover:text-[#e8e8e8] hover:bg-[#1c1c1e]"
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
}
