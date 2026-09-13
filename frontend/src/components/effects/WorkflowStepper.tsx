/**
 * Effect #2: Animated WorkflowStepper
 * Horizontal stage tracker with 700ms smooth line fill, pulsing expanding ring on the active node,
 * and checkmarks fading into completed nodes.
 */

import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { WorkflowStage } from '../../types/nlams';

interface WorkflowStepperProps {
  stages?: WorkflowStage[];
  currentStage: WorkflowStage;
  onSelectStage?: (stage: WorkflowStage) => void;
  interactive?: boolean;
}

const DEFAULT_STAGES: WorkflowStage[] = [
  'Submitted',
  'District Scrutiny',
  'District Approved',
  'State Approved',
  'Central Approved',
  'Award Declared',
  'Possession Taken',
  'Closed',
];

export function WorkflowStepper({
  stages = DEFAULT_STAGES,
  currentStage,
  onSelectStage,
  interactive = false,
}: WorkflowStepperProps) {
  const currentIndex = stages.indexOf(currentStage);
  const activeIdx = currentIndex >= 0 ? currentIndex : 0;
  const progressFraction = stages.length > 1 ? activeIdx / (stages.length - 1) : 0;

  return (
    <div className="w-full bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-bold text-[#0ea5a3] tracking-wider uppercase">
            Statutory Workflow
          </span>
          <h3 className="text-sm font-bold text-[#0b2c52] mt-0.5">
            Stage {activeIdx + 1} of {stages.length}: {currentStage}
          </h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#eef4fa] text-[#0b2c52] border border-blue-100">
          {Math.round(progressFraction * 100)}% Milestone Complete
        </span>
      </div>

      <div className="relative pt-3 pb-2">
        {/* Background track line */}
        <div className="absolute top-[26px] left-6 right-6 h-1 bg-slate-200 rounded-full z-0" />

        {/* Animated fill line with 700ms cubic-bezier transition */}
        <motion.div
          className="absolute top-[26px] left-6 h-1 bg-gradient-to-r from-[#0b2c52] via-[#0ea5a3] to-[#16a34a] rounded-full z-0 origin-left"
          style={{ width: `calc(${progressFraction * 100}% * (1 - 48px / 100%))` }}
          animate={{
            width: `calc(${progressFraction * 100}% - ${progressFraction * 48}px)`,
          }}
          transition={{
            duration: 0.7,
            ease: [0.33, 1, 0.68, 1], // ease-out-cubic
          }}
        />

        {/* Nodes */}
        <div className="relative z-10 flex items-center justify-between">
          {stages.map((stage, idx) => {
            const isCompleted = idx < activeIdx;
            const isCurrent = idx === activeIdx;

            return (
              <div
                key={stage}
                onClick={() => interactive && onSelectStage?.(stage)}
                className={`flex flex-col items-center group ${
                  interactive ? 'cursor-pointer' : 'cursor-default'
                }`}
                style={{ flex: 1 }}
              >
                <div className="relative flex items-center justify-center">
                  {/* Expanding ring pulse on newly reached active node */}
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#0ea5a3]"
                      animate={{
                        scale: [1, 1.85, 2.3],
                        opacity: [0.75, 0.25, 0],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                  )}

                  {/* Node Circle */}
                  <motion.div
                    layout
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      isCompleted
                        ? 'bg-[#16a34a] text-white shadow-sm'
                        : isCurrent
                        ? 'bg-[#0b2c52] text-white ring-4 ring-[#0ea5a3]/30 shadow-md'
                        : 'bg-white border-2 border-slate-300 text-slate-400 group-hover:border-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.25, delay: 0.1 }}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </motion.div>
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </motion.div>
                </div>

                {/* Stage Label */}
                <span
                  className={`mt-2.5 text-[11px] font-medium text-center px-1 leading-tight transition-colors ${
                    isCurrent
                      ? 'text-[#0b2c52] font-bold'
                      : isCompleted
                      ? 'text-slate-700 font-medium'
                      : 'text-slate-400'
                  }`}
                >
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
