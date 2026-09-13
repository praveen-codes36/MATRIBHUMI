/**
 * Effect #19: Success confetti / checkmark burst on project closure
 * When a project reaches "Closed" status, a brief, tasteful particle burst plus scale-in checkmark.
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ConfettiBurstProps {
  show: boolean;
  onClose: () => void;
  projectName?: string;
  projectCode?: string;
}

export function ConfettiBurst({
  show,
  onClose,
  projectName = 'Delhi-Mumbai Expressway Phase-IV Greenfield Bypass',
  projectCode = 'NHAI/2026/DME-PKG-4',
}: ConfettiBurstProps) {
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (show && !triggeredRef.current) {
      triggeredRef.current = true;
      // Controlled, tasteful burst with official colors adapted to theme
      try {
        const isDark =
          typeof document !== 'undefined' &&
          document.documentElement.classList.contains('dark');

        confetti({
          particleCount: 50,
          spread: 55,
          origin: { y: 0.6, x: 0.5 },
          colors: isDark
            ? ['#2dd4c8', '#4ade80', '#60a5fa', '#cfe0f2', '#fbbf24']
            : ['#0b2c52', '#0ea5a3', '#16a34a', '#2563eb'],
          disableForReducedMotion: true,
        });
      } catch (err) {
        console.warn('Confetti effect failed', err);
      }
    } else if (!show) {
      triggeredRef.current = false;
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="relative bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl text-center"
          >
            {/* Scale-in Checkmark Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', damping: 14 }}
              className="w-16 h-16 rounded-full bg-[#16a34a]/10 text-[#16a34a] border-2 border-[#16a34a] mx-auto flex items-center justify-center shadow-md mb-4"
            >
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </motion.div>

            <span className="text-[11px] font-bold uppercase tracking-wider text-[#16a34a] bg-[#16a34a]/10 px-3 py-1 rounded-full">
              Acquisition Milestone Cleared
            </span>

            <h3 className="text-xl font-extrabold text-[#0b2c52] mt-3">
              Statutory Project Closure
            </h3>

            <p className="text-xs text-[#64748b] mt-1 font-mono">{projectCode}</p>

            <p className="text-xs sm:text-sm text-[#1c2530] mt-3 leading-relaxed">
              <strong className="text-[#0b2c52]">{projectName}</strong> has officially fulfilled all statutory requirements under RFCTLARR Act, 2013. 100% PFMS DBT compensation disbursed, physical possession taken, and R&R rehabilitation complete.
            </p>

            <div className="mt-5 p-3 rounded-lg bg-[#eef4fa] border border-blue-100 flex items-center justify-center gap-2 text-xs font-semibold text-[#0b2c52]">
              <ShieldCheck className="w-4 h-4 text-[#0ea5a3]" />
              <span>Audit Ledger Hash: #0x8f2d9c44b91</span>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full bg-[#0b2c52] hover:bg-[#0ea5a3] text-white text-xs sm:text-sm font-bold py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              Return to Control Tower
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
