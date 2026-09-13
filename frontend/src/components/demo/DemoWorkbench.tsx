/**
 * Live Interactive Demo Workbench (`/demo`)
 * Hosts all 5 role-scoped portals with quick role-switching tabs,
 * project selector, live WS push simulator ticker, and breadcrumbs.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, MapPin, UserCheck, Smartphone, 
  BarChart4, ArrowLeft, RefreshCw, Radio, Sparkles
} from 'lucide-react';
import { CentralAdminPortal } from '../portals/CentralAdminPortal';
import { StateAdminPortal } from '../portals/StateAdminPortal';
import { DistrictOfficerPortal } from '../portals/DistrictOfficerPortal';
import { FieldOfficerPortal } from '../portals/FieldOfficerPortal';
import { PolicyMakerPortal } from '../portals/PolicyMakerPortal';
import { 
  INITIAL_METRICS, 
  INITIAL_STATES, 
  INITIAL_PROJECTS, 
  INITIAL_PARCELS 
} from '../../data/mockData';
import { StatMetric, StateData, ProjectItem, Parcel } from '../../types/nlams';
import { useToast } from '../effects/ToastProvider';

interface DemoWorkbenchProps {
  initialPortal?: string;
  onBackToHome: () => void;
  onActivePortalChange?: (portalId: string) => void;
}

export function DemoWorkbench({
  initialPortal = 'central',
  onBackToHome,
  onActivePortalChange,
}: DemoWorkbenchProps) {
  const { push } = useToast();
  const [activePortal, setActivePortal] = useState<string>(initialPortal);
  const [metrics, setMetrics] = useState<StatMetric[]>(INITIAL_METRICS);
  const [states, setStates] = useState<StateData[]>(INITIAL_STATES);
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [parcels, setParcels] = useState<Parcel[]>(INITIAL_PARCELS);
  const [selectedProject, setSelectedProject] = useState<ProjectItem>(INITIAL_PROJECTS[0]);
  const [isLiveWsActive, setIsLiveWsActive] = useState<boolean>(true);

  // Sync initialPortal prop if changed
  useEffect(() => {
    if (initialPortal) {
      setActivePortal(initialPortal);
      onActivePortalChange?.(initialPortal);
    }
  }, [initialPortal, onActivePortalChange]);

  const handlePortalSelect = (portalId: string) => {
    setActivePortal(portalId);
    onActivePortalChange?.(portalId);
  };

  // Effect #1 simulated websocket push every 8 seconds
  useEffect(() => {
    if (!isLiveWsActive) return;

    const interval = setInterval(() => {
      // Small jitter to disbursed amount or parcels
      setMetrics((prev) =>
        prev.map((m) => {
          if (m.id === 'disbursed') {
            const add = Math.round(Math.random() * 4);
            return {
              ...m,
              value: m.value + add,
              delta: `+₹${add} Cr last min`,
            };
          }
          if (m.id === 'parcels') {
            const addPcl = Math.round(Math.random() * 2);
            return {
              ...m,
              value: m.value + addPcl,
            };
          }
          return m;
        })
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [isLiveWsActive]);

  const portalRoles = [
    {
      id: 'central',
      name: 'Central Admin',
      icon: Building2,
      subtitle: 'PM GatiShakti Control Tower',
    },
    {
      id: 'state',
      name: 'State Admin',
      icon: Building2,
      subtitle: 'State Revenue Directorate',
    },
    {
      id: 'district',
      name: 'District / LAO',
      icon: UserCheck,
      subtitle: 'Officer Daily Workbench',
    },
    {
      id: 'field',
      name: 'Field Officer',
      icon: Smartphone,
      subtitle: 'Mobile-First Offline PWA',
    },
    {
      id: 'policy',
      name: 'Policy & AI',
      icon: BarChart4,
      subtitle: 'Predictive Synthesis & Copilot',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#1c2530] pb-20 pt-20">
      {/* Top Demo Context Bar */}
      <div className="bg-white border-b border-slate-200 shadow-xs sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Back & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0b2c52] transition-colors cursor-pointer"
              title="Return to Public Overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#0b2c52]">NLAMS Live Demo</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-mono text-[#64748b] uppercase">Sandbox Environment</span>
              </div>
              <p className="text-[11px] text-[#64748b]">
                SIH Problem Statement 26016 · 5 Connected Role Workbenches
              </p>
            </div>
          </div>

          {/* Role Navigation Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {portalRoles.map((role) => {
              const Icon = role.icon;
              const isActive = activePortal === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => {
                    handlePortalSelect(role.id);
                    push('info', `Swapped to ${role.name}`, role.subtitle);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#0b2c52] text-white shadow-xs'
                      : 'bg-[#f7f9fb] text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-300' : 'text-[#0ea5a3]'}`} />
                  <span>{role.name}</span>
                </button>
              );
            })}
          </div>

          {/* Live WebSocket Simulator Status */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => {
                setIsLiveWsActive(!isLiveWsActive);
                push(
                  'info',
                  isLiveWsActive ? 'WebSocket Simulation Paused' : 'WebSocket Simulation Resumed (8s interval)'
                );
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#eef4fa] text-[#0b2c52] border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Radio className={`w-3 h-3 ${isLiveWsActive ? 'text-[#16a34a] animate-pulse' : 'text-slate-400'}`} />
              <span className="text-[11px] font-semibold">
                {isLiveWsActive ? 'Live Sync Active (8s)' : 'Sync Paused'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePortal}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activePortal === 'central' && (
              <CentralAdminPortal
                metrics={metrics}
                states={states}
                projects={projects}
                onDrilldownState={(st) => {
                  setActivePortal('state');
                  push('info', `Swapped to State Directorate: ${st.name}`);
                }}
              />
            )}

            {activePortal === 'state' && (
              <StateAdminPortal states={states} projects={projects} />
            )}

            {activePortal === 'district' && (
              <DistrictOfficerPortal project={selectedProject} parcels={parcels} />
            )}

            {activePortal === 'field' && (
              <FieldOfficerPortal />
            )}

            {activePortal === 'policy' && (
              <PolicyMakerPortal projects={projects} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
