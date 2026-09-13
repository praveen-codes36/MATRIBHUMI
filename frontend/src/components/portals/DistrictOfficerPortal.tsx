/**
 * 3. District Collector / Land Acquisition Officer (LAO) Portal
 * Daily workbench: Statutory WorkflowStepper (Effect #2), GIS Workspace with cluster explode & parcel inspector (Effect #8),
 * Compensation assessment engine, and PFMS DBT PaymentStatusTracker.
 * Includes Project Closure button that triggers ConfettiBurst (Effect #19)!
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileCheck, Map, Banknote, ShieldCheck, CheckCircle2, 
  Clock, AlertCircle, ArrowRight, Flag, DollarSign, Award
} from 'lucide-react';
import { WorkflowStepper } from '../effects/WorkflowStepper';
import { GISMapView } from '../effects/GISMapView';
import { CompensationCalculator } from './CompensationCalculator';
import { MicroPressButton } from '../effects/MicroPressButton';
import { ConfettiBurst } from '../effects/ConfettiBurst';
import { useToast } from '../effects/ToastProvider';
import { ProjectItem, Parcel, WorkflowStage } from '../../types/nlams';

interface DistrictOfficerPortalProps {
  project: ProjectItem;
  parcels: Parcel[];
}

export function DistrictOfficerPortal({ project, parcels }: DistrictOfficerPortalProps) {
  const { push } = useToast();
  const [currentStage, setCurrentStage] = useState<WorkflowStage>(project.stage);
  const [activeTab, setActiveTab] = useState<'workflow' | 'gis' | 'compensation' | 'payments'>('workflow');
  const [showClosureBurst, setShowClosureBurst] = useState(false);

  // Advance stage function
  const handleAdvanceStage = () => {
    const stages: WorkflowStage[] = [
      'Submitted',
      'District Scrutiny',
      'District Approved',
      'State Approved',
      'Central Approved',
      'Award Declared',
      'Possession Taken',
      'Closed',
    ];
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      setCurrentStage(nextStage);

      if (nextStage === 'Closed') {
        setShowClosureBurst(true);
        push('success', 'Statutory Project Closed', '100% Possession and PFMS DBT Compensation complete.');
      } else {
        push('success', `Milestone Advanced: ${nextStage}`, 'Statutory docket logged and signed.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Effect #19 Confetti Modal on Project Closure */}
      <ConfettiBurst
        show={showClosureBurst}
        onClose={() => setShowClosureBurst(false)}
        projectName={project.name}
        projectCode={project.code}
      />

      {/* Header Docket Info */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#0b2c52] text-white">
              PORTAL 03
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0ea5a3]">
              Office of the District Collector & SLAO
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0b2c52] mt-1">
            District Collector / LAO Daily Workbench
          </h2>
          <p className="text-xs text-[#64748b] mt-0.5">
            Jurisdiction: <strong className="text-slate-800">{project.district} District, {project.state}</strong> · Lead: {project.leadOfficer}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {currentStage !== 'Closed' ? (
            <MicroPressButton
              variant="accent"
              size="sm"
              onClick={handleAdvanceStage}
            >
              <span>Advance to Next Stage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </MicroPressButton>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-[#16a34a] border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Project Fully Closed</span>
            </div>
          )}
        </div>
      </div>

      {/* Effect #2: Animated WorkflowStepper */}
      <WorkflowStepper
        currentStage={currentStage}
        interactive
        onSelectStage={(stg) => {
          setCurrentStage(stg);
          if (stg === 'Closed') setShowClosureBurst(true);
        }}
      />

      {/* Workbench Sub-Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('workflow')}
          className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'workflow'
              ? 'bg-[#0b2c52] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Statutory Docket Inbox</span>
        </button>

        <button
          onClick={() => setActiveTab('gis')}
          className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'gis'
              ? 'bg-[#0b2c52] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>GIS Cadastral Workspace</span>
        </button>

        <button
          onClick={() => setActiveTab('compensation')}
          className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'compensation'
              ? 'bg-[#0b2c52] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Banknote className="w-3.5 h-3.5" />
          <span>Compensation Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'payments'
              ? 'bg-[#0b2c52] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PFMS DBT Disbursement</span>
        </button>
      </div>

      {/* Tab 1: Workflow Inbox */}
      {activeTab === 'workflow' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#0b2c52]">
                Active Project Acquisition Docket: {project.name}
              </h3>
              <p className="text-xs text-[#64748b]">
                Notified on {project.notifiedDate} under Section 11 of Act 30 of 2013
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#eef4fa] text-[#0b2c52]">
              {project.code}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-[#f7f9fb] rounded-lg">
              <span className="text-[10px] text-[#64748b] uppercase font-bold">Acquisition Area</span>
              <p className="text-base font-bold text-[#0b2c52] mt-0.5">{project.acres} Acres</p>
            </div>
            <div className="p-3 bg-[#f7f9fb] rounded-lg">
              <span className="text-[10px] text-[#64748b] uppercase font-bold">Cadastral Parcels</span>
              <p className="text-base font-bold text-[#0b2c52] mt-0.5">{project.parcelsCount} Plots</p>
            </div>
            <div className="p-3 bg-[#f7f9fb] rounded-lg">
              <span className="text-[10px] text-[#64748b] uppercase font-bold">Total Budget</span>
              <p className="text-base font-bold text-[#0b2c52] mt-0.5">₹{project.budgetCr} Cr</p>
            </div>
            <div className="p-3 bg-[#f7f9fb] rounded-lg">
              <span className="text-[10px] text-[#64748b] uppercase font-bold">Current Milestone</span>
              <p className="text-base font-bold text-[#0ea5a3] mt-0.5">{currentStage}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-blue-100 bg-[#eef4fa] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-[#0b2c52]">Next Statutory Action Item</h4>
              <p className="text-xs text-[#64748b] mt-0.5">
                Verify Joint Measurement Survey (JMS) records submitted by Panvel Field Survey Unit.
              </p>
            </div>
            <MicroPressButton
              variant="accent"
              size="sm"
              onClick={() => {
                push('success', 'Digital Sign-Off Executed', 'Signed via e-Mudhra USB Token / Aadhaar eSign.');
              }}
            >
              Sign Off Measurement
            </MicroPressButton>
          </div>
        </div>
      )}

      {/* Tab 2: GIS Workspace (Effect #8) */}
      {activeTab === 'gis' && (
        <GISMapView parcels={parcels} />
      )}

      {/* Tab 3: Compensation Engine */}
      {activeTab === 'compensation' && (
        <CompensationCalculator />
      )}

      {/* Tab 4: PFMS DBT Payments Tracker */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#0b2c52]">
                Public Financial Management System (PFMS) DBT Disbursement Tracker
              </h3>
              <p className="text-xs text-[#64748b]">
                Real-time bank API reconciliation of direct Aadhaar-seeded compensation transfers
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#16a34a] border border-emerald-200">
              PFMS Server: Reconciled
            </span>
          </div>

          {/* Progress overview */}
          <div className="p-4 rounded-xl bg-[#f7f9fb] border border-slate-200">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-bold text-[#0b2c52]">Total Project Compensation: ₹1,240.00 Cr</span>
              <span className="font-bold text-[#16a34a]">Disbursed: ₹980.00 Cr (79.0%)</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
              <div className="h-full bg-[#16a34a]" style={{ width: '79%' }} title="Paid: 79%" />
              <div className="h-full bg-[#d97706]" style={{ width: '15%' }} title="Pending: 15%" />
              <div className="h-full bg-[#dc2626]" style={{ width: '6%' }} title="Disputed: 6%" />
            </div>
            <div className="flex items-center gap-4 text-[11px] font-semibold mt-2 text-[#64748b]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#16a34a]" /> Paid (₹980 Cr)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#d97706]" /> In Processing (₹186 Cr)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#dc2626]" /> Under Court Escrow (₹74 Cr)
              </span>
            </div>
          </div>

          {/* Beneficiary transactions table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#0b2c52] uppercase tracking-wider">
              Recent PFMS Account Dispatches
            </h4>
            {parcels.map((pcl) => (
              <div
                key={pcl.id}
                className="p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs hover:bg-[#f7f9fb] transition-colors"
              >
                <div>
                  <span className="font-bold text-[#0b2c52]">{pcl.ownerName}</span>
                  <p className="text-[11px] text-[#64748b]">
                    Survey No: {pcl.surveyNumber} · Aadhaar: {pcl.aadhaarMasked}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-extrabold text-[#0b2c52]">
                    ₹{(pcl.totalCompensation / 100000).toFixed(2)} Lakh
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      pcl.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-[#16a34a]'
                        : pcl.paymentStatus === 'Pending'
                        ? 'bg-amber-100 text-[#d97706]'
                        : 'bg-red-100 text-[#dc2626]'
                    }`}
                  >
                    {pcl.paymentStatus}
                  </span>

                  {pcl.paymentStatus !== 'Paid' && (
                    <MicroPressButton
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        push(
                          'success',
                          `Payment Authorized: ${pcl.ownerName}`,
                          `Dispatched ₹${(pcl.totalCompensation / 100000).toFixed(2)} Lakh via PFMS DBT.`
                        );
                      }}
                    >
                      Authorize DBT
                    </MicroPressButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
