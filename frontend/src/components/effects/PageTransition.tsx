/**
 * Effect #10: Consistent page transition wrapper
 * Guarantees a standardized 180ms fade + slide-up across routes and tabs.
 */

import React from 'react';
import { motion } from 'motion/react';

interface PageTransitionProps {
  children: React.ReactNode;
  transitionKey?: string;
  key?: string | number;
  className?: string;
}

export function PageTransition({ children, transitionKey, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      key={transitionKey}
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}
