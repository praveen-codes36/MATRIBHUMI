/**
 * Effect #6: Shared-element drill-down transition (National -> State -> District)
 * Clicking a state card visually morphs into the detail panel using motion `layoutId`.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Building2, MapPin, CheckCircle2, AlertCircle, ChevronRight, Layers } from 'lucide-react';
import { StateData, DistrictData } from '../../types/nlams';

interface StateDrilldownViewProps {
  states: StateData[];
  onSelectDistrict?: (district: DistrictData) => void;
}

export function StateDrilldownView({ states, onSelectDistrict }: StateDrilldownViewProps) {
  const [selectedState, setSelectedState] = useState<StateData | null>(null);

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {!selectedState ? (
          /* National View Grid of States */
          <motion.div
            key="states-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {states.map((state) => (
              <motion.div
                key={state.code}
                layoutId={`state-card-${state.code}`}
                onClick={() => setSelectedState(state)}
                whileHover={{ y: -2 }}
                className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-[#0ea5a3] hover:shadow-md cursor-pointer transition-colors group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#eef4fa] text-[#0b2c52]">
                      {state.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        state.status === 'High Progress'
                          ? 'bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20'
                          : state.status === 'On Track'
                          ? 'bg-[#0ea5a3]/10 text-[#0ea5a3] border-[#0ea5a3]/20'
                          : 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/20'
                      }`}
                    >
                      {state.status}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#0b2c52] mt-3 group-hover:text-[#0ea5a3] transition-colors">
                    {state.name}
                  </h4>
                  <p className="text-xs text-[#64748b]">Capital: {state.capital}</p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#f7f9fb] p-2 rounded">
                      <span className="text-[10px] text-[#64748b] block uppercase">Active Projects</span>
                      <span className="font-extrabold text-[#0b2c52]">{state.totalProjects}</span>
                    </div>
                    <div className="bg-[#f7f9fb] p-2 rounded">
                      <span className="text-[10px] text-[#64748b] block uppercase">Total Land</span>
                      <span className="font-extrabold text-[#0b2c52]">{state.totalAcres.toLocaleString('en-IN')} ac</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[#64748b]">
                    <span>Completion:</span>
                    <strong className="text-[#0b2c52]">{state.completionPct}%</strong>
                  </div>
                  <span className="text-[#0ea5a3] font-semibold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Drill down</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Expanded Morph Detail Panel */
          <motion.div
            key={`detail-${selectedState.code}`}
            layoutId={`state-card-${selectedState.code}`}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md"
          >
            {/* Header with back navigation */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedState(null)}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  aria-label="Back to National Overview"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-[#0b2c52]">{selectedState.name}</h3>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#eef4fa] text-[#0b2c52]">
                      {selectedState.code}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748b]">
                    State Jurisdiction Portal · {selectedState.districts.length} Monitored Acquisition Districts
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  selectedState.status === 'High Progress'
                    ? 'bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20'
                    : 'bg-[#0ea5a3]/10 text-[#0ea5a3] border-[#0ea5a3]/20'
                }`}
              >
                {selectedState.status}
              </span>
            </div>

            {/* State KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
              <div className="p-3 bg-[#f7f9fb] rounded-xl">
                <span className="text-[11px] text-[#64748b] uppercase font-bold">Total Corridors</span>
                <p className="text-xl font-extrabold text-[#0b2c52] mt-0.5">{selectedState.totalProjects}</p>
              </div>
              <div className="p-3 bg-[#f7f9fb] rounded-xl">
                <span className="text-[11px] text-[#64748b] uppercase font-bold">Land Extent</span>
                <p className="text-xl font-extrabold text-[#0b2c52] mt-0.5">{selectedState.totalAcres.toLocaleString('en-IN')} ac</p>
              </div>
              <div className="p-3 bg-[#f7f9fb] rounded-xl">
                <span className="text-[11px] text-[#64748b] uppercase font-bold">Disbursed (PFMS)</span>
                <p className="text-xl font-extrabold text-[#0ea5a3] mt-0.5">₹{selectedState.compensationCr.toLocaleString('en-IN')} Cr</p>
              </div>
              <div className="p-3 bg-[#f7f9fb] rounded-xl">
                <span className="text-[11px] text-[#64748b] uppercase font-bold">Statewide Progress</span>
                <p className="text-xl font-extrabold text-[#16a34a] mt-0.5">{selectedState.completionPct}%</p>
              </div>
            </div>

            {/* District breakdown table */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-[#0b2c52] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#0ea5a3]" />
                  <span>District Administration Workbenches</span>
                </h4>
                <span className="text-xs text-[#64748b]">Select a district to inspect LAO docket</span>
              </div>

              <div className="space-y-2.5">
                {selectedState.districts.map((dist) => (
                  <div
                    key={dist.code}
                    onClick={() => onSelectDistrict?.(dist)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-[#0ea5a3] hover:bg-[#f7f9fb] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#eef4fa] text-[#0b2c52] flex items-center justify-center font-bold text-xs group-hover:bg-[#0ea5a3] group-hover:text-white transition-colors">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#0b2c52]">{dist.name}</span>
                          <span className="text-[10px] font-mono text-[#64748b]">{dist.code}</span>
                        </div>
                        <p className="text-xs text-[#64748b]">
                          {dist.activeProjects} Projects · {dist.parcelsCount.toLocaleString('en-IN')} Registered Cadastral Parcels
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-xs font-bold text-[#0b2c52] block">{dist.completionPct}%</span>
                        <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-[#16a34a] rounded-full"
                            style={{ width: `${dist.completionPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-[#0ea5a3] group-hover:text-white text-slate-500 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
