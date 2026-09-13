/**
 * Effect #3: AI Delay Risk Gauge + explainability bars
 * Semi-circular SVG gauge sweeping to risk percentage with count-up number,
 * colored <40 green, 40-69 amber, >=70 red, with staggered explainability bars below.
 */

import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';
import { AlertTriangle, ShieldCheck, ShieldAlert, BrainCircuit } from 'lucide-react';

interface DelayReason {
  reason: string;
  percentage: number;
}

interface AIDelayRiskGaugeProps {
  score: number; // 0 to 100
  title?: string;
  subtitle?: string;
  delayReasons: DelayReason[];
}

export function AIDelayRiskGauge({
  score,
  title = 'AI Delay Risk Index',
  subtitle = 'Predictive ML Model (LightGBM + SHAP explainability)',
  delayReasons,
}: AIDelayRiskGaugeProps) {
  const [mounted, setMounted] = useState(false);

  // Animated spring for the score count-up
  const springScore = useSpring(0, {
    stiffness: 60,
    damping: 15,
  });

  const displayScore = useTransform(springScore, (val) => Math.round(val));

  useEffect(() => {
    setMounted(true);
    springScore.set(score);
  }, [score, springScore]);

  // Threshold colors
  const isLow = score < 40;
  const isMedium = score >= 40 && score < 70;
  const isHigh = score >= 70;

  const colorHex = isLow ? '#16a34a' : isMedium ? '#d97706' : '#dc2626';
  const riskLabel = isLow ? 'Low Risk' : isMedium ? 'Moderate Risk' : 'High Delay Risk';
  const RiskIcon = isLow ? ShieldCheck : isMedium ? AlertTriangle : ShieldAlert;

  // Gauge geometry: semi-circle radius = 70, arc length = pi * 70 = 219.9
  const radius = 70;
  const circumference = Math.PI * radius;
  // Arc fraction
  const strokeDashoffset = circumference - (Math.min(score, 100) / 100) * circumference;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-[#eef4fa] text-[#0ea5a3]">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0b2c52]">{title}</h3>
            <p className="text-[11px] text-[#64748b]">{subtitle}</p>
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border"
          style={{
            backgroundColor: `${colorHex}15`,
            color: colorHex,
            borderColor: `${colorHex}40`,
          }}
        >
          <RiskIcon className="w-3.5 h-3.5" />
          {riskLabel}
        </span>
      </div>

      {/* Semi-circular Gauge */}
      <div className="relative flex flex-col items-center justify-center pt-5 pb-2">
        <svg
          viewBox="0 0 180 100"
          className="w-48 overflow-visible"
          role="img"
          aria-label={`Risk gauge score ${score}%`}
        >
          {/* Background track arc */}
          <path
            d="M 20,95 A 70,70 0 0,1 160,95"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Animated filled gauge arc */}
          <motion.path
            d="M 20,95 A 70,70 0 0,1 160,95"
            fill="none"
            stroke={colorHex}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: mounted ? strokeDashoffset : circumference }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>

        {/* Centered count-up number */}
        <div className="absolute top-14 text-center">
          <div className="flex items-baseline justify-center">
            <motion.span
              className="text-3xl font-extrabold tabular-nums tracking-tight"
              style={{ color: colorHex }}
            >
              {displayScore}
            </motion.span>
            <span className="text-sm font-bold text-slate-400 ml-0.5">%</span>
          </div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Probability of Delay
          </p>
        </div>
      </div>

      {/* Explainability Bars (Ranked reasons sliding in with stagger) */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block mb-2.5">
          Top Root-Cause Contributors (SHAP Values)
        </span>

        <div className="space-y-2.5">
          {delayReasons.map((item, index) => (
            <motion.div
              key={item.reason}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.45,
                delay: index * 0.09, // 90ms stagger per bar
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group"
            >
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-slate-700 font-medium truncate max-w-[220px]">
                  {item.reason}
                </span>
                <span className="font-semibold text-[#0b2c52] tabular-nums">
                  {item.percentage}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor:
                      index === 0
                        ? colorHex
                        : index === 1
                        ? '#0ea5a3'
                        : '#64748b',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{
                    duration: 0.8,
                    delay: 0.2 + index * 0.1,
                    ease: 'easeOut',
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
