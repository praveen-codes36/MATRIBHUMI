/**
 * Effect #5: Micro-press interactive button
 * Micro-press with scale(0.97) on active (120ms ease), visible focus rings using teal.
 */

import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface MicroPressButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function MicroPressButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: MicroPressButtonProps) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5a3] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
    md: 'text-sm px-4 py-2 h-10 gap-2',
    lg: 'text-base px-6 py-3 h-12 gap-2.5',
  }[size];

  const variantStyles = {
    primary: 'bg-[#0b2c52] text-white hover:bg-[#0b2c52]/90 shadow-sm',
    accent: 'bg-[#0ea5a3] text-white hover:bg-[#0ea5a3]/90 shadow-sm',
    secondary: 'bg-[#eef4fa] text-[#0b2c52] hover:bg-[#e2e8f0]',
    outline: 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50',
    ghost: 'text-slate-700 hover:bg-slate-100',
    danger: 'bg-[#dc2626] text-white hover:bg-[#dc2626]/90 shadow-sm',
  }[variant];

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}
