import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "sm";
};

export default function Button({ variant = "primary", size = "md", className = "", ...rest }: Props) {
  const base = "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-control px-4 text-sm font-medium transition focus-ring disabled:cursor-not-allowed disabled:opacity-60";
  const variants = {
    primary: "bg-accent text-white hover:bg-[#94684a]",
    secondary: "border border-border bg-surface text-text-primary hover:bg-muted",
    ghost: "text-text-secondary hover:bg-muted",
  };
  const sizes = { md: "py-2.5", sm: "min-h-[38px] py-2 px-3" };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest} />;
}
