/**
 * AmbientLifecycleLoop Component
 * Auto-animating ambient lifecycle diagram for the Login Page right panel.
 * Cycles smoothly through the 12 statutory acquisition stages (~2s per node),
 * signaling a live real-time government pipeline.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Milestone, FileText, CheckSquare, Compass, Map, Bell,
  Banknote, Award, Shield, CheckCircle2, Home, Flag, Activity
} from 'lucide-react';

interface StageInfo {
  step: number;
  title: string;
  sub: string;
  role: string;
  icon: React.ComponentType<{ className?: string }>;
}

const LIFECYCLE_STAGES: StageInfo[] = [
  { step: 1, title: 'Project Need', sub: 'Corridor identified by Central Ministry', role: 'Central Admin', icon: Milestone },
  { step: 2, title: 'Requisition Proposal', sub: 'DPR & alignment clearance', role: 'State / Central', icon: FileText },
  { step: 3, title: 'Competent Authority Approval', sub: 'Section 3A / 4 gazette notification', role: 'District Collector', icon: CheckSquare },
  { step: 4, title: 'Land Identified', sub: 'Cadastral survey numbers matched', role: 'District LAO', icon: Compass },
  { step: 5, title: 'GIS Demarcation', sub: 'Geo-tagged boundary polygon', role: 'Field Officer', icon: Map },
  { step: 6, title: 'Section 11 Notification', sub: 'Public hearing & objections', role: 'District LAO', icon: Bell },
  { step: 7, title: 'Compensation Assessment', sub: 'Circle rate × Factor + 100% Solatium', role: 'Competent Authority', icon: Banknote },
  { step: 8, title: 'Award Declaration', sub: 'Final digital award with signatures', role: 'District Collector', icon: Award },
  { step: 9, title: 'Direct PFMS Payment', sub: 'DBT to Aadhaar-seeded accounts', role: 'Finance / PFMS', icon: Shield },
  { step: 10, title: 'Possession Handover', sub: 'Physical possession certificate issued', role: 'Revenue Inspector', icon: CheckCircle2 },
  { step: 11, title: 'R&R Package Rollout', sub: 'Rehabilitation housing & annuity', role: 'R&R Commissioner', icon: Home },
  { step: 12, title: 'Project Closure', sub: 'Audit-cleared certificate & ledger', role: 'Central Ministry', icon: Flag },
];

export function AmbientLifecycleLoop() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Auto-advance loop every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % LIFECYCLE_STAGES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const activeStage = LIFECYCLE_STAGES[activeStepIndex];
  const ActiveIcon = activeStage.icon;

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-8 lg:p-10 text-white overflow-hidden select-none bg-gradient-to-br from-[#0b2c52] via-[#09223f] to-[#06172d] dark:from-[#0f2237] dark:via-[#091523] dark:to-[#050b13]">
      {/* Ambient background glow & grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#2dd4c8_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />
      <div className="absolute top-1/4 -right-16 w-80 h-80 rounded-full bg-[#0ea5a3]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-16 w-80 h-80 rounded-full bg-[#2563eb]/15 blur-3xl pointer-events-none" />

      {/* Top Telemetry Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2dd4c8] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0ea5a3]" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-teal-300 font-semibold">
              Live Statutory Pipeline
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-[10px] font-mono text-slate-300">
            <Activity className="w-3 h-3 text-[#2dd4c8]" />
            <span>NIC Stream v2.4</span>
          </div>
        </div>

        <h3 className="text-xl font-extrabold text-white mt-3 tracking-tight">
          Statutory Land Lifecycle Engine
        </h3>
        <p className="text-xs text-slate-300 mt-1 max-w-sm leading-relaxed">
          Continuous tracking of 1,482 national infrastructure corridors from requisition to possession handover.
        </p>
      </div>

      {/* Center: Stage Stepper Showcase */}
      <div className="relative z-10 my-6">
        {/* Active Stage Highlight Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage.step}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl relative overflow-hidden"
          >
            {/* Top glowing accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2dd4c8] via-[#60a5fa] to-[#4ade80]" />

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0 shadow-lg text-[#2dd4c8]">
                <ActiveIcon className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#0ea5a3] text-white">
                    Step {activeStage.step < 10 ? `0${activeStage.step}` : activeStage.step} of 12
                  </span>
                  <span className="text-[10px] font-semibold text-teal-300">
                    {activeStage.role}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-1.5 truncate">
                  {activeStage.title}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {activeStage.sub}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Ambient Mini-Node Rail */}
        <div className="mt-5 grid grid-cols-6 gap-2">
          {LIFECYCLE_STAGES.map((s, idx) => {
            const isActive = idx === activeStepIndex;
            const isPast = idx < activeStepIndex;
            const IconComponent = s.icon;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => setActiveStepIndex(idx)}
                className={`group relative flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-500/20 border-teal-400/80 ring-2 ring-teal-400/40'
                    : isPast
                    ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                }`}
                title={`Stage ${s.step}: ${s.title}`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-transform group-hover:scale-110 ${
                    isActive ? 'text-teal-300' : isPast ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-mono mt-1 font-bold">
                  {s.step < 10 ? `0${s.step}` : s.step}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Live System Telemetry Strip */}
      <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-teal-400 font-bold">RFCTLARR 2013</span>
          <span>· Automated Solatium</span>
        </div>
        <div className="font-mono text-[10px] text-slate-400">
          NIC Central Gateway
        </div>
      </div>
    </div>
  );
}
