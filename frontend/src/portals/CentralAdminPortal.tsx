/**
 * 1. Central Ministry Admin Portal
 * National control tower: every state, every KPI, live StatCardGrid with simulated WS push,
 * AI high-risk alert banner, national progress bars, and shared-element state drill-down.
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building, AlertTriangle, ShieldAlert, ArrowUpRight, 
  MapPin, CheckCircle2, ChevronRight, Bell, Sparkles, Filter, ExternalLink
} from 'lucide-react';
import { StatCard } from '../effects/StatCard';
import { StateDrilldownView } from '../effects/StateDrilldownView';
import { MicroPressButton } from '../effects/MicroPressButton';
import { useToast } from '../effects/ToastProvider';
import { StatMetric, StateData, ProjectItem } from '../../types/nlams';

interface CentralAdminPortalProps {
  metrics: StatMetric[];
  states: StateData[];
  projects: ProjectItem[];
  onDrilldownState?: (state: StateData) => void;
}

export function CentralAdminPortal({
  metrics,
  states,
  projects,
  onDrilldownState,
}: CentralAdminPortalProps) {
  const { push } = useToast();
  const [activeAlertDismissed, setActiveAlertDismissed] = useState(false);

  // High risk projects count
  const highRiskCount = projects.filter((p) => p.riskScore >= 70).length;

  return (
    <div className="space-y-6">
      {/* Role Banner & National Header */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#0b2c52] text-white">
              PORTAL 01
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0ea5a3]">
              PM GatiShakti National Master Plan
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0b2c52] mt-1">
            Central Ministry Control Tower
          </h2>
          <p className="text-xs text-[#64748b] mt-0.5">
            Single-pane real-time surveillance across 28 States & 8 Union Territories
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eef4fa] border border-blue-100 text-xs font-semibold text-[#0b2c52]">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-ping" />
            <span>NIC Real-Time Data Pipeline: Active</span>
          </div>
        </div>
      </div>

      {/* Effect #1: Live KPI flash + count-up grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <StatCard key={metric.id} stat={metric} />
        ))}
      </div>

      {/* AI High-Risk Alert Banner */}
      {!activeAlertDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50/70 border-l-4 border-[#dc2626] rounded-r-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-red-200"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-100 text-[#dc2626] shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-red-950">
                  AI Critical Delay Warning: {highRiskCount} National Infrastructure Corridors At Risk
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-200 text-red-800">
                  ACTION REQUIRED
                </span>
              </div>
              <p className="text-xs text-red-800 mt-1 leading-relaxed">
                Western Dedicated Freight Corridor (JNPT Linkage, MH) and NICDC Tumakuru Node (KA) have projected delay probabilities exceeding 68% due to Gram Sabha NOC delays and title arbitration.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => {
                push(
                  'info',
                  'Inter-Ministerial Gazette Notice Triggered',
                  'Notice dispatched to Maharashtra and Karnataka State Revenue Secretaries.'
                );
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#dc2626] text-white hover:bg-red-700 transition-colors cursor-pointer shadow-xs"
            >
              Issue Secretary Notice
            </button>
            <button
              onClick={() => setActiveAlertDismissed(true)}
              className="text-xs text-slate-500 hover:text-slate-800 p-1.5 rounded hover:bg-red-100/50 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}

      {/* Effect #6: Shared-element drill-down (National -> State -> District) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-[#0b2c52]">
              State-Wise Acquisition Progress & Jurisdiction Drill-Down
            </h3>
            <p className="text-xs text-[#64748b]">
              Click any state card to smoothly expand and drill down into district dockets
            </p>
          </div>
          <span className="text-xs text-[#0ea5a3] font-semibold">
            {states.length} Active State Secretariats Connected
          </span>
        </div>

        <StateDrilldownView
          states={states}
          onSelectDistrict={(dist) => {
            push(
              'info',
              `District Selected: ${dist.name} (${dist.code})`,
              `Swapping context to LAO workbench for ${dist.activeProjects} projects.`
            );
          }}
        />
      </div>

      {/* National GatiShakti Corridor Progress Summary */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#0b2c52] mb-3">
          Major National Corridor Milestone Trajectory
        </h3>

        <div className="space-y-3">
          {projects.slice(0, 3).map((proj) => (
            <div
              key={proj.id}
              className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0b2c52] truncate">{proj.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">{proj.code}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#64748b] mt-1">
                  <span>Ministry: {proj.ministry}</span>
                  <span>•</span>
                  <span>Budget: ₹{proj.budgetCr} Cr</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-700">Stage: {proj.stage}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-xs font-bold text-[#0b2c52]">
                    ₹{proj.disbursedCr} / ₹{proj.budgetCr} Cr
                  </span>
                  <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-[#0ea5a3] rounded-full"
                      style={{ width: `${(proj.disbursedCr / proj.budgetCr) * 100}%` }}
                    />
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    proj.riskScore >= 70
                      ? 'bg-red-100 text-red-700'
                      : proj.riskScore >= 40
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {proj.riskScore < 40 ? 'On Track' : proj.riskScore < 70 ? 'Moderate' : 'Critical'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
