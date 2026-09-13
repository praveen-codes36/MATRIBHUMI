/**
 * Effect #1: Live KPI flash + count-up
 * Number tweens from old -> new value over 800ms, border flashes teal for 900ms,
 * and a small "● updated just now" badge appears in teal before fading to "updated Xs ago".
 */

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { StatMetric } from '../../types/nlams';

interface StatCardProps {
  stat: StatMetric;
  icon?: ReactNode;
  key?: string | number;
}

export function StatCard({ stat, icon }: StatCardProps) {
  const [isFlashing, setIsFlashing] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(2);
  const prevValueRef = useRef(stat.value);

  // Spring tween for the count-up over ~800ms
  const springValue = useSpring(stat.value, {
    stiffness: 70,
    damping: 18,
    mass: 0.8,
  });

  const displayValue = useTransform(springValue, (current) => {
    if (stat.decimals && stat.decimals > 0) {
      return current.toFixed(stat.decimals);
    }
    return Math.round(current).toLocaleString('en-IN');
  });

  // Track updates to trigger the teal flash
  useEffect(() => {
    if (stat.value !== prevValueRef.current) {
      prevValueRef.current = stat.value;
      springValue.set(stat.value);
      setIsFlashing(true);
      setJustUpdated(true);
      setSecondsAgo(0);

      const flashTimer = setTimeout(() => {
        setIsFlashing(false);
      }, 900);

      const badgeTimer = setTimeout(() => {
        setJustUpdated(false);
      }, 2500);

      return () => {
        clearTimeout(flashTimer);
        clearTimeout(badgeTimer);
      };
    }
  }, [stat.value, springValue]);

  // Tick the "updated Xs ago" counter
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`relative bg-white rounded-xl p-5 border transition-all duration-300 shadow-sm ${
        isFlashing
          ? 'border-[#0ea5a3] shadow-[0_0_0_2px_rgba(14,165,163,0.25)]'
          : 'border-slate-200/90 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
          {stat.label}
        </span>
        {icon && (
          <div className="p-2 rounded-lg bg-[#eef4fa] text-[#0b2c52] shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        {stat.prefix && (
          <span className="text-xl font-bold text-[#0b2c52] tracking-tight">{stat.prefix}</span>
        )}
        <motion.span className="text-2xl lg:text-3xl font-extrabold text-[#1c2530] tabular-nums tracking-tight">
          {displayValue}
        </motion.span>
        {stat.suffix && (
          <span className="text-sm font-semibold text-[#64748b] ml-0.5">{stat.suffix}</span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 font-medium">
          {stat.trend === 'up' && (
            <span className="inline-flex items-center text-[#16a34a] font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +{stat.changePct}%
            </span>
          )}
          {stat.trend === 'down' && (
            <span className="inline-flex items-center text-[#dc2626] font-semibold">
              <ArrowDownRight className="w-3.5 h-3.5" />
              -{stat.changePct}%
            </span>
          )}
          {stat.trend === 'neutral' && (
            <span className="inline-flex items-center text-[#64748b]">
              <Minus className="w-3.5 h-3.5" />
              0.0%
            </span>
          )}
          <span className="text-[#64748b] text-[11px] truncate max-w-[130px]">{stat.subtext}</span>
        </div>

        {/* Live status badge */}
        <div>
          {justUpdated ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0ea5a3] bg-[#0ea5a3]/10 px-2 py-0.5 rounded-full animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0ea5a3]" />
              updated just now
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">
              updated {secondsAgo}s ago
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
