/**
 * 2. State Admin Portal
 * Control tower narrowed to selected State jurisdiction (e.g. Maharashtra),
 * drills into district dockets, approval workflow queue, and district progress bars.
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, MapPin, CheckCircle2, Clock, 
  Send, RotateCcw, AlertCircle, FileText, ChevronRight, Check
} from 'lucide-react';
import { StateData, ProjectItem } from '../../types/nlams';
import { MicroPressButton } from '../effects/MicroPressButton';
import { useToast } from '../effects/ToastProvider';

interface StateAdminPortalProps {
  states: StateData[];
  projects: ProjectItem[];
}

export function StateAdminPortal({ states, projects }: StateAdminPortalProps) {
  const { push } = useToast();
  const [selectedStateCode, setSelectedStateCode] = useState<string>('MH');
  const [filterStage, setFilterStage] = useState<string>('ALL');

  const currentState = states.find((s) => s.code === selectedStateCode) || states[0];
  const stateProjects = projects.filter((p) => p.state === currentState.name);

  const filteredProjects =
    filterStage === 'ALL'
      ? stateProjects
      : stateProjects.filter((p) => p.stage === filterStage);

  const handleForwardToCenter = (project: ProjectItem) => {
    push(
      'success',
      `State Approval Granted: ${project.code}`,
      `DPR & Section 11 Notification endorsed. Forwarded to Central Ministry for final gazette clearance.`
    );
  };

  const handleSendBackToDistrict = (project: ProjectItem) => {
    push(
      'warning',
      `Sent Back to District Collector: ${project.district}`,
      `Remarks logged: Circle rate valuation discrepancy flagged for parcel 42/1B.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & State Selector */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#0ea5a3] text-white">
              PORTAL 02
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0b2c52]">
              State Land Revenue Directorate
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0b2c52] mt-1">
            {currentState.name} State Administration Portal
          </h2>
          <p className="text-xs text-[#64748b] mt-0.5">
            Jurisdictional control covering {currentState.districts.length} District Collector workbenches
          </p>
        </div>

        {/* State Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[#64748b]">Active State:</label>
          <select
            value={selectedStateCode}
            onChange={(e) => {
              setSelectedStateCode(e.target.value);
              push('info', `Jurisdiction Swapped to ${e.target.value}`);
            }}
            className="text-xs font-bold bg-[#eef4fa] border border-blue-200 text-[#0b2c52] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0ea5a3] cursor-pointer"
          >
            {states.map((st) => (
              <option key={st.code} value={st.code}>
                {st.name} ({st.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* State-Scoped KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-[#64748b] uppercase">State Corridors</span>
          <p className="text-2xl font-extrabold text-[#0b2c52] mt-1">{currentState.totalProjects}</p>
          <span className="text-[11px] text-[#16a34a] font-semibold mt-1 block">Active Statutory Projects</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-[#64748b] uppercase">Land Identified</span>
          <p className="text-2xl font-extrabold text-[#0b2c52] mt-1">
            {currentState.totalAcres.toLocaleString('en-IN')} <span className="text-sm font-semibold text-slate-500">ac</span>
          </p>
          <span className="text-[11px] text-[#0ea5a3] font-semibold mt-1 block">GIS Demarcated</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-[#64748b] uppercase">PFMS Disbursed</span>
          <p className="text-2xl font-extrabold text-[#0ea5a3] mt-1">
            ₹{currentState.compensationCr.toLocaleString('en-IN')} <span className="text-sm font-semibold text-slate-500">Cr</span>
          </p>
          <span className="text-[11px] text-[#16a34a] font-semibold mt-1 block">Direct DBT Payouts</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-[#64748b] uppercase">State Milestone</span>
          <p className="text-2xl font-extrabold text-[#16a34a] mt-1">{currentState.completionPct}%</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Possession Cleared</span>
        </div>
      </div>

      {/* District Drill-down Bars */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-[#0b2c52] flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#0ea5a3]" />
              <span>District Revenue Performance Comparison</span>
            </h3>
            <p className="text-xs text-[#64748b]">
              Live status across districts in {currentState.name}
            </p>
          </div>
          <span className="text-xs font-semibold text-[#0ea5a3]">
            {currentState.districts.length} Districts Reporting
          </span>
        </div>

        <div className="space-y-4">
          {currentState.districts.map((dist) => (
            <div key={dist.code} className="p-3 bg-[#f7f9fb] rounded-xl border border-slate-200/70">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0b2c52] text-sm">{dist.name}</span>
                  <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.2 bg-white rounded border border-slate-200">
                    {dist.code}
                  </span>
                  <span className="text-[11px] text-[#64748b]">
                    ({dist.activeProjects} projects · {dist.parcelsCount.toLocaleString('en-IN')} parcels)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[#d97706] font-semibold">
                    {dist.pendingApprovals} Approvals Pending
                  </span>
                  <span className="font-extrabold text-[#16a34a]">{dist.completionPct}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0ea5a3] to-[#16a34a] rounded-full transition-all duration-500"
                  style={{ width: `${dist.completionPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* State Approvals Queue & Action Handlers */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-[#0b2c52]">
              State Level Approval Inbox & Statutory Dockets
            </h3>
            <p className="text-xs text-[#64748b]">
              Endorse Section 11 notices or return to District Collectors with queries
            </p>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#64748b] font-medium">Filter:</span>
            {['ALL', 'Award Declared', 'District Approved', 'Central Approved'].map((stg) => (
              <button
                key={stg}
                onClick={() => setFilterStage(stg)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  filterStage === stg
                    ? 'bg-[#0b2c52] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {stg}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#0b2c52]">{project.name}</h4>
                  <span className="text-[10px] font-mono text-slate-400">{project.code}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748b] mt-1">
                  <span>District: <strong className="text-slate-800">{project.district}</strong></span>
                  <span>•</span>
                  <span>Lead Officer: {project.leadOfficer}</span>
                  <span>•</span>
                  <span>Parcels: {project.parcelsCount}</span>
                  <span>•</span>
                  <span className="font-semibold text-[#0ea5a3]">Stage: {project.stage}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <MicroPressButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendBackToDistrict(project)}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#d97706]" />
                  <span>Send Back</span>
                </MicroPressButton>

                <MicroPressButton
                  variant="accent"
                  size="sm"
                  onClick={() => handleForwardToCenter(project)}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Endorse to Center</span>
                </MicroPressButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
