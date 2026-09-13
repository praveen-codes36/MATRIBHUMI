/**
 * Effect #18: Top-of-page route-loading progress bar
 * Renders a thin teal progress line at the very top of the viewport when transitions occur.
 */

import { motion, AnimatePresence } from 'motion/react';

interface TopProgressBarProps {
  isLoading?: boolean;
  isNavigating?: boolean;
}

export function TopProgressBar({ isLoading, isNavigating }: TopProgressBarProps) {
  const active = isLoading || isNavigating;
  return (
    <AnimatePresence>
      {active && (
        <div className="fixed top-0 left-0 right-0 z-[10000] h-1 bg-transparent pointer-events-none">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{
              x: ['-100%', '-20%', '0%'],
              transition: {
                duration: 0.85,
                ease: [0.16, 1, 0.3, 1],
              },
            }}
            exit={{
              opacity: 0,
              transition: { duration: 0.2 },
            }}
            className="h-full w-full bg-gradient-to-r from-[#0ea5a3] via-[#14b8a6] to-[#0ea5a3] shadow-[0_0_8px_rgba(14,165,163,0.6)]"
          />
        </div>
      )}
    </AnimatePresence>
  );
}
