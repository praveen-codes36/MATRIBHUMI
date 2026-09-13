/**
 * Effect #16: Magnetic / hover-lift primary CTA button
 * Subtly attracts toward cursor within small radius and lifts with a soft shadow on hover.
 */

import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'motion/react';

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'accent';
  icon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function MagneticButton({
  children,
  onClick,
  className = '',
  variant = 'accent',
  icon,
  type = 'button',
  disabled = false,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Smooth springs for magnetic attraction
  const x = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });
  const y = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Max magnetic offset is 8px
    const distanceX = (e.clientX - centerX) * 0.15;
    const distanceY = (e.clientY - centerY) * 0.15;
    x.set(distanceX);
    y.set(distanceY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const bgStyles =
    variant === 'accent'
      ? 'bg-[#0ea5a3] text-white hover:bg-[#0d9488]'
      : 'bg-[#0b2c52] text-white hover:bg-[#133c6d]';

  return (
    <motion.button
      ref={buttonRef}
      style={{ x, y }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      animate={{
        y: isHovered ? -2 : 0,
        boxShadow: isHovered
          ? '0 12px 24px -6px rgba(14, 165, 163, 0.35)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
      transition={{ duration: 0.2 }}
      className={`relative inline-flex items-center justify-center font-bold px-7 py-3.5 rounded-xl cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5a3] focus-visible:ring-offset-2 ${bgStyles} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2 text-sm tracking-wide">
        {children}
        {icon && <span className="transition-transform duration-200 group-hover:translate-x-1">{icon}</span>}
      </span>
    </motion.button>
  );
}
