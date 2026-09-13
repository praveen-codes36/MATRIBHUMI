/**
 * Effect #15: Animated process-flow diagram
 * Draws connected nodes with an animated SVG line as the user scrolls through the 12-stage lifecycle.
 */

import { useRef, type ComponentType } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { 
  FileText, CheckSquare, Map, Bell, 
  Banknote, Award, Shield, Home, Flag, Compass, CheckCircle2, Milestone
} from 'lucide-react';

interface StageNode {
  step: number;
  title: string;
  sub: string;
  role: string;
  icon: ComponentType<{ className?: string }>;
}

const LIFECYCLE_STAGES: StageNode[] = [
  { step: 1, title: 'Project Need', sub: 'Infrastructure corridor identified by Ministry', role: 'Central Admin', icon: Milestone },
  { step: 2, title: 'Requisition Proposal', sub: 'Detailed Project Report (DPR) & Alignment', role: 'State / Central', icon: FileText },
  { step: 3, title: 'Competent Authority Approval', sub: 'Statutory Section 3A / 4 gazette notification', role: 'District Collector', icon: CheckSquare },
  { step: 4, title: 'Land Identified', sub: 'Cadastral village survey numbers matched', role: 'District LAO', icon: Compass },
  { step: 5, title: 'GIS Demarcation', sub: 'Drone + Geo-tagged boundary polygon', role: 'GIS & Field Officer', icon: Map },
  { step: 6, title: 'Section 11 Notification', sub: 'Public disclosure & 60-day objection hearing', role: 'District LAO', icon: Bell },
  { step: 7, title: 'Compensation Assessment', sub: 'Circle rate × Factor + 100% Solatium', role: 'Competent Authority', icon: Banknote },
  { step: 8, title: 'Award Declaration', sub: 'Final digital award with digital signatures', role: 'District Collector', icon: Award },
  { step: 9, title: 'Direct PFMS Payment', sub: 'Bank DBT to verified Aadhaar-seeded accounts', role: 'Finance / PFMS', icon: Shield },
  { step: 10, title: 'Possession Handover', sub: 'Physical possession certificate issued', role: 'LAO & Revenue Inspector', icon: CheckCircle2 },
  { step: 11, title: 'R&R Package Rollout', sub: 'Rehabilitation housing & annuity grant', role: 'R&R Commissioner', icon: Home },
  { step: 12, title: 'Project Closure', sub: 'Audit-cleared certificate & asset ledger', role: 'Central Ministry', icon: Flag },
];

export function ProcessFlowDiagram() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center'],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
  });

  return (
    <div ref={containerRef} className="relative py-8">
      {/* Background Line */}
      <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-1 bg-slate-200 -translate-x-1/2 rounded-full" />

      {/* Animated Scroll Fill Line */}
      <motion.div
        style={{ scaleY }}
        className="absolute left-6 md:left-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-[#0b2c52] via-[#0ea5a3] to-[#16a34a] -translate-x-1/2 rounded-full origin-top"
      />

      {/* Nodes */}
      <div className="space-y-6 md:space-y-10">
        {LIFECYCLE_STAGES.map((stage, idx) => {
          const isEven = idx % 2 === 0;
          const Icon = stage.icon;

          return (
            <motion.div
              key={stage.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className={`relative flex flex-col md:flex-row items-start md:items-center ${
                isEven ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Content Card */}
              <div className={`w-full md:w-1/2 pl-14 md:pl-0 ${isEven ? 'md:pl-10 text-left' : 'md:pr-10 md:text-right'}`}>
                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-[#0ea5a3]/50 transition-all inline-block w-full max-w-md">
                  <div className={`flex items-center gap-2 mb-1.5 ${isEven ? 'justify-start' : 'md:justify-end justify-start'}`}>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#eef4fa] text-[#0b2c52] border border-blue-100">
                      Step {stage.step < 10 ? `0${stage.step}` : stage.step}
                    </span>
                    <span className="text-[10px] font-semibold text-[#0ea5a3]">
                      {stage.role}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#0b2c52]">{stage.title}</h4>
                  <p className="text-xs text-[#64748b] mt-1 leading-relaxed">{stage.sub}</p>
                </div>
              </div>

              {/* Center Node Circle */}
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 top-4 md:top-auto z-10">
                <div className="w-10 h-10 rounded-full bg-white border-2 border-[#0ea5a3] text-[#0b2c52] flex items-center justify-center shadow-md">
                  <Icon className="w-4 h-4 text-[#0ea5a3]" />
                </div>
              </div>

              {/* Empty placeholder for balance on desktop */}
              <div className="hidden md:block md:w-1/2" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
