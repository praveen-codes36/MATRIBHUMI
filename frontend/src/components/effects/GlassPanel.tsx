/**
 * Effect #20: Subtle glassmorphism container
 * Uses backdrop-filter: blur(12px) with light translucency, strictly for nav bars and floating panels.
 */

import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassPanel({ children, className = '' }: GlassPanelProps) {
  return (
    <div
      className={`bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
