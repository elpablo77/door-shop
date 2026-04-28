import React from "react";

export default function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", children, ...rest } = props;
  return (
    <select
      className={`focus-ring min-h-[44px] w-full rounded-control border border-border bg-surface px-3 text-sm text-text-primary ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}
