interface AvatarProps {
  label: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
}

export default function Avatar({ label, size = "md", variant = "primary" }: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-xl"
  };

  const variantClasses = {
    primary: "bg-[#1c1c1e] text-[#e8a060] border-white/5",
    secondary: "bg-[#e8a060] text-[#121214]"
  };

  return (
    <div className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-xl flex items-center justify-center font-semibold border`}>
      {label}
    </div>
  );
}
