import React from "react";

export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      className={`focus-ring min-h-[44px] w-full rounded-control border border-border bg-surface px-3 text-sm text-text-primary placeholder:text-text-secondary ${className}`}
      {...rest}
    />
  );
}
