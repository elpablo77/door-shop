import React from "react";

export default function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-control border border-border bg-muted px-2 py-0.5 text-xs text-text-secondary">{children}</span>;
}
