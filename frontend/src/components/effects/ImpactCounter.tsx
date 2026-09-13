/**
 * Effect #14: Animated impact/stat counter on scroll-into-view
 * Counts up smoothly from 0 only when entering the viewport.
 */

import { useRef, useEffect } from 'react';
import { motion, useInView, useSpring, useTransform } from 'motion/react';

interface ImpactCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  sublabel?: string;
  decimals?: number;
}

export function ImpactCounter({
  value,
  prefix = '',
  suffix = '',
  label,
  sublabel,
  decimals = 0,
}: ImpactCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  const spring = useSpring(0, {
    stiffness: 45,
    damping: 14,
    mass: 0.9,
  });

  const display = useTransform(spring, (latest) => {
    if (decimals > 0) {
      return latest.toFixed(decimals);
    }
    return Math.round(latest).toLocaleString('en-IN');
  });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return (
    <div ref={ref} className="text-center sm:text-left">
      <div className="flex items-baseline justify-center sm:justify-start">
        {prefix && (
          <span className="text-2xl sm:text-3xl font-bold text-[#0ea5a3] mr-0.5">{prefix}</span>
        )}
        <motion.span className="text-3xl sm:text-4xl font-extrabold text-[#0b2c52] tabular-nums tracking-tight">
          {display}
        </motion.span>
        {suffix && (
          <span className="text-xl sm:text-2xl font-bold text-[#0ea5a3] ml-0.5">{suffix}</span>
        )}
      </div>
      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#1c2530]">{label}</p>
      {sublabel && <p className="text-[11px] text-[#64748b] mt-0.5 leading-snug">{sublabel}</p>}
    </div>
  );
}
