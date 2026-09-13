/**
 * 4. Field Officer Mobile View (Mobile-First, Offline-Capable)
 * Rendered in a realistic phone-frame mockup.
 * Features GPS boundary capture pulse, offline sync queue badge & manual sync trigger,
 * skeleton loader toggle (Effect #5), and photo geo-tagging simulation.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, Wifi, WifiOff, RefreshCw, MapPin, 
  CheckCircle2, Plus, Users, Compass, UploadCloud, AlertCircle
} from 'lucide-react';
import { FieldCaptureItem } from '../../types/nlams';
import { INITIAL_FIELD_CAPTURES } from '../../data/mockData';
import { SkeletonLoader } from '../effects/SkeletonLoader';
import { MicroPressButton } from '../effects/MicroPressButton';
import { useToast } from '../effects/ToastProvider';

export function FieldOfficerPortal() {
  const { push } = useToast();
  const [isOnline, setIsOnline] = useState(false); // Default offline to showcase offline-first capability
  const [captures, setCaptures] = useState<FieldCaptureItem[]>(INITIAL_FIELD_CAPTURES);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingSkeletons, setIsLoadingSkeletons] = useState(false);

  // Form input state inside phone
  const [newSurvey, setNewSurvey] = useState('98/2-B');
  const [newOwner, setNewOwner] = useState('Dattatray V. Patil');
  const [newType, setNewType] = useState<FieldCaptureItem['landType']>('Dry Agricultural');
  const [isGpsActive, setIsGpsActive] = useState(true);

  // Unsynced count
  const unsyncedCount = captures.filter((c) => !c.synced).length;

  const handleCaptureParcel = () => {
    const newRecord: FieldCaptureItem = {
      id: `CAP-2026-0${captures.length + 84}`,
      surveyNumber: newSurvey,
      village: 'Navghar-Panvel',
      lat: 18.9982,
      lng: 73.1264,
      accuracyMeters: 1.6,
      ownerName: newOwner,
      landType: newType,
      notes: 'GPS 4-vertex boundary walked. Standing coconut trees counted.',
      photosCount: 2,
      timestamp: 'Just now',
      synced: false, // Saved in IndexedDB offline first
    };

    setCaptures([newRecord, ...captures]);
    push(
      'info',
      'Saved to Offline IndexedDB Cache',
      `Survey ${newSurvey} recorded with GPS pin (1.6m accuracy). Ready for auto-sync.`
    );
  };

  const handleSyncAll = () => {
    if (!isOnline) {
      push('warning', 'Device Currently Offline', 'Toggle connection status to online before syncing queue.');
      return;
    }

    setIsSyncing(true);
    setTimeout(() => {
      setCaptures((prev) => prev.map((c) => ({ ...c, synced: true })));
      setIsSyncing(false);
      push('success', 'Background Sync Successful', `${unsyncedCount} offline records reconciled with Central NIC server.`);
    }, 1200);
  };

  const toggleLoadingState = () => {
    setIsLoadingSkeletons(true);
    setTimeout(() => {
      setIsLoadingSkeletons(false);
    }, 1300);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#0ea5a3] text-white">
              PORTAL 04
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0b2c52]">
              Offline PWA / Field Inspection Shell
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0b2c52] mt-1">
            Field Officer Mobile View
          </h2>
          <p className="text-xs text-[#64748b] mt-0.5">
            Designed for harsh field conditions, muddy gloves, and zero signal villages
          </p>
        </div>

        {/* Demo Controls Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Network Simulator Toggle */}
          <button
            onClick={() => {
              setIsOnline(!isOnline);
              push(
                !isOnline ? 'success' : 'warning',
                !isOnline ? 'Cellular Connection Restored (4G)' : 'Connection Dropped (Offline Mode)'
              );
            }}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isOnline
                ? 'bg-emerald-50 text-[#16a34a] border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-[#d97706] border-amber-200 hover:bg-amber-100'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Online (4G LTE)' : 'Simulated Offline (0 Signal)'}</span>
          </button>

          {/* Skeleton Toggle Button */}
          <button
            onClick={toggleLoadingState}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
          >
            Simulate Shimmer Load
          </button>
        </div>
      </div>

      {/* Center Phone Frame Mockup Container */}
      <div className="flex justify-center py-4">
        <div className="w-[375px] max-w-full bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 relative">
          
          {/* Phone Top Notch / Dynamic Island */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 mr-2" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>

          {/* Phone Inner Screen Screen */}
          <div className="bg-[#f7f9fb] rounded-[36px] overflow-hidden min-h-[660px] flex flex-col relative text-[#1c2530]">
            
            {/* Mobile Header Bar */}
            <div className="pt-8 px-4 pb-3 bg-[#0b2c52] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wide block">
                  NLAMS Field Surveyor
                </span>
                <h3 className="text-sm font-bold leading-tight">Panvel Rural Unit</h3>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-full text-[10px] font-semibold">
                {isOnline ? (
                  <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#d97706]" />
                )}
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>

            {/* Offline Sync Status Banner */}
            <div className="px-4 py-2 bg-[#eef4fa] border-b border-blue-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[#0b2c52] font-semibold text-[11px]">
                <UploadCloud className="w-3.5 h-3.5 text-[#0ea5a3]" />
                <span>{unsyncedCount} Records Queued in IDB</span>
              </div>
              <button
                onClick={handleSyncAll}
                disabled={isSyncing}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0b2c52] text-white hover:bg-[#0ea5a3] transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync Now</span>
              </button>
            </div>

            {/* Phone Body Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {isLoadingSkeletons ? (
                /* Effect #5 Skeleton Loader */
                <div className="space-y-4">
                  <SkeletonLoader variant="rect" className="h-32 w-full" />
                  <SkeletonLoader variant="text" count={3} />
                  <SkeletonLoader variant="rect" className="h-20 w-full" />
                </div>
              ) : (
                <>
                  {/* GPS Boundary Capture Card */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-[#0b2c52] flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-[#0ea5a3]" />
                        <span>GPS Pinning & Cadastral Demarcation</span>
                      </span>
                      <span className="text-[10px] font-bold text-[#16a34a] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                        ±1.6m Fix
                      </span>
                    </div>

                    {/* Simulated GPS Radar Pulse */}
                    <div className="relative h-24 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200">
                      {isGpsActive && (
                        <>
                          <div className="absolute w-16 h-16 rounded-full bg-[#0ea5a3]/20 animate-ping" />
                          <div className="absolute w-24 h-24 rounded-full bg-[#0ea5a3]/10" />
                        </>
                      )}
                      <div className="relative z-10 flex flex-col items-center">
                        <MapPin className="w-6 h-6 text-[#0ea5a3]" />
                        <span className="text-[10px] font-mono font-bold text-[#0b2c52] mt-0.5">
                          18.9982° N, 73.1264° E
                        </span>
                      </div>
                    </div>

                    {/* Quick Input Fields */}
                    <div className="mt-3 space-y-2 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-[#64748b] block">
                          Gat / Survey Number
                        </label>
                        <input
                          type="text"
                          value={newSurvey}
                          onChange={(e) => setNewSurvey(e.target.value)}
                          className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0ea5a3]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#64748b] block">
                          Landowner Name (Aadhaar Verified)
                        </label>
                        <input
                          type="text"
                          value={newOwner}
                          onChange={(e) => setNewOwner(e.target.value)}
                          className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0ea5a3]"
                        />
                      </div>
                    </div>

                    {/* Action Buttons in Phone (Effect #5 Micro-Press) */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => push('info', 'Camera Geo-Tag Activated', 'EXIF metadata with Lat/Lng & timestamp embedded.')}
                        className="btn-press py-2 bg-slate-100 hover:bg-slate-200 text-[#0b2c52] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Geo-Photo</span>
                      </button>

                      <button
                        onClick={handleCaptureParcel}
                        className="btn-press py-2 bg-[#0ea5a3] hover:bg-teal-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Save Parcel</span>
                      </button>
                    </div>
                  </div>

                  {/* Offline Inspection Queue Feed */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider block">
                      Local Queue (IndexedDB)
                    </span>

                    {captures.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#0b2c52]">{item.surveyNumber}</span>
                          {item.synced ? (
                            <span className="text-[10px] font-semibold text-[#16a34a] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Synced
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-[#d97706] bg-amber-50 px-1.5 py-0.2 rounded border border-amber-100">
                              Offline Draft
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-700">{item.ownerName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{item.notes}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Phone Bottom Home Bar */}
            <div className="py-2.5 flex justify-center bg-white border-t border-slate-200">
              <div className="w-32 h-1 bg-slate-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
