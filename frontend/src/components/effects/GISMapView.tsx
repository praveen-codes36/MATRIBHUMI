/**
 * Effect #8: GIS cluster-explode + parcel fade-in
 * Below a zoom threshold, parcels are shown as an aggregate cluster marker.
 * On "zoom in", the cluster scales away while individual parcels burst outward with
 * a staggered spring-scale entrance (~50-60ms stagger), colored by acquisition status.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ZoomIn, ZoomOut, Layers, Maximize2, MapPin, Eye, 
  CheckCircle2, AlertTriangle, XCircle, Clock, Info, ShieldCheck, Compass, Check
} from 'lucide-react';
import { Parcel, AcquisitionStatus } from '../../types/nlams';

interface GISMapViewProps {
  parcels: Parcel[];
  onSelectParcel?: (parcel: Parcel) => void;
  selectedParcel?: Parcel | null;
}

export function GISMapView({ parcels, onSelectParcel, selectedParcel }: GISMapViewProps) {
  // Zoom level: 1 = Aggregated National Cluster, 2 = District Exploded Parcels
  const [zoomLevel, setZoomLevel] = useState<number>(2);
  const [activeLayer, setActiveLayer] = useState<'cadastral' | 'satellite' | 'status'>('status');
  const [showInspector, setShowInspector] = useState<boolean>(true);
  const [activeParcel, setActiveParcel] = useState<Parcel | null>(parcels[0] || null);

  const handleZoomToggle = () => {
    setZoomLevel((prev) => (prev === 1 ? 2 : 1));
  };

  const handleParcelClick = (p: Parcel) => {
    setActiveParcel(p);
    setShowInspector(true);
    onSelectParcel?.(p);
  };

  const getStatusColor = (status: AcquisitionStatus) => {
    switch (status) {
      case 'Approved':
      case 'Possession Taken':
        return '#16a34a';
      case 'Pending':
        return '#d97706';
      case 'Disputed':
        return '#dc2626';
    }
  };

  // Status breakdown counts
  const approvedCount = parcels.filter((p) => p.status === 'Approved' || p.status === 'Possession Taken').length;
  const pendingCount = parcels.filter((p) => p.status === 'Pending').length;
  const disputedCount = parcels.filter((p) => p.status === 'Disputed').length;

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-[580px]">
      {/* Top Map Bar Controls */}
      <div className="p-3.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-xs text-[#0b2c52]">
            <Compass className="w-4 h-4 text-[#0ea5a3]" />
            <span>GIS Cadastral Demarcation Engine</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#eef4fa] text-[#0ea5a3]">
            Survey Nos: 42/1A - 44/3
          </span>
        </div>

        {/* Legend pills */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" />
            <span className="text-slate-600">Approved ({approvedCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
            <span className="text-slate-600">Pending ({pendingCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" />
            <span className="text-slate-600">Disputed ({disputedCount})</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoomLevel((z) => Math.min(2, z + 1))}
            className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Zoom In (Explode Clusters)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(1, z - 1))}
            className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Zoom Out (Cluster Aggregation)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-slate-300 mx-1" />
          <button
            onClick={handleZoomToggle}
            className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-[#eef4fa] text-[#0b2c52] hover:bg-[#0ea5a3] hover:text-white transition-colors cursor-pointer"
          >
            {zoomLevel === 1 ? 'Explode Cluster' : 'Aggregate View'}
          </button>
        </div>
      </div>

      {/* Main Map Stage Canvas */}
      <div className="relative flex-1 bg-[#eef4fa] dark:bg-[#0b1220] overflow-hidden select-none">
        {/* Base Tile Layer (Theme-swapped via CSS filter in dark mode) */}
        <div className="map-base-layer absolute inset-0 pointer-events-none">
          {/* Abstract Map Canvas Backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />

          {/* Cadastral Land Grid Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <pattern id="cadastralGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#dbeafe" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cadastralGrid)" />

            {/* Infrastructure Alignment Corridor */}
            <path
              d="M 50,480 C 220,380 340,240 680,120"
              fill="none"
              stroke="#0b2c52"
              strokeWidth="38"
              strokeOpacity="0.08"
            />
            <path
              d="M 50,480 C 220,380 340,240 680,120"
              fill="none"
              stroke="#0ea5a3"
              strokeWidth="3"
              strokeDasharray="8,6"
            />
          </svg>
        </div>

        {/* Cluster / Exploded View */}
        <div className="relative w-full h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            {zoomLevel === 1 ? (
              /* Single Aggregated Cluster Marker */
              <motion.div
                key="cluster-marker"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                onClick={() => setZoomLevel(2)}
                className="cursor-pointer group flex flex-col items-center"
              >
                <div className="relative w-28 h-28 rounded-full bg-[#0b2c52] text-white flex flex-col items-center justify-center shadow-xl group-hover:scale-105 transition-transform ring-8 ring-[#0ea5a3]/30">
                  <span className="text-2xl font-extrabold">{parcels.length}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-300">
                    Parcels
                  </span>
                  <span className="text-[10px] text-slate-300">Raigad Node</span>
                </div>
                <span className="mt-3 text-xs font-bold px-3 py-1 rounded-full bg-white text-[#0b2c52] shadow-md border border-slate-200">
                  Click to Explode into Cadastral Parcels
                </span>
              </motion.div>
            ) : (
              /* Exploded Parcels (Bursts outward with staggered spring-scale entrance) */
              <motion.div
                key="exploded-parcels"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative w-full h-full p-8 flex items-center justify-center"
              >
                {/* Positions mapped around canvas */}
                <div className="relative w-[540px] h-[360px] max-w-full">
                  {parcels.map((parcel, idx) => {
                    const statusColor = getStatusColor(parcel.status);
                    const isSelected = activeParcel?.id === parcel.id;

                    // Compute layout coordinates
                    const coords = [
                      { left: '15%', top: '22%' },
                      { left: '42%', top: '16%' },
                      { left: '68%', top: '30%' },
                      { left: '30%', top: '60%' },
                      { left: '58%', top: '66%' },
                    ][idx % 5];

                    return (
                      <motion.div
                        key={parcel.id}
                        initial={{ scale: 0, opacity: 0, y: 15 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 24,
                          delay: idx * 0.06, // 60ms stagger per marker
                        }}
                        style={{ left: coords.left, top: coords.top }}
                        onClick={() => handleParcelClick(parcel)}
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                      >
                        {/* Animated Selection Ping Ring */}
                        {isSelected && (
                          <motion.div
                            className="absolute -inset-2 rounded-xl"
                            style={{ backgroundColor: `${statusColor}30` }}
                            animate={{ scale: [1, 1.25, 1] }}
                            transition={{ repeat: Infinity, duration: 1.8 }}
                          />
                        )}

                        {/* Interactive Parcel Card Token */}
                        <div
                          className={`relative p-3 rounded-xl bg-white border-2 shadow-md transition-all group-hover:-translate-y-1 ${
                            isSelected
                              ? 'ring-2 ring-offset-2'
                              : 'hover:border-slate-400'
                          }`}
                          style={{
                            borderColor: statusColor,
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: statusColor }}
                            />
                            <span className="text-xs font-mono font-bold text-[#0b2c52]">
                              {parcel.surveyNumber}
                            </span>
                          </div>

                          <p className="text-[11px] font-semibold text-slate-700 mt-1 truncate max-w-[120px]">
                            {parcel.ownerName}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                            <span>{parcel.areaAcres} ac</span>
                            <span
                              className="font-bold uppercase"
                              style={{ color: statusColor }}
                            >
                              {parcel.status}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Map Watermark & Location Badge */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] text-[#64748b] border border-slate-200">
          EPSG:4326 WGS84 · Lat: 18.9942° N, Lng: 73.1235° E · Village: Panvel Rural
        </div>
      </div>

      {/* Slide-over Parcel Detail Panel (Inspector) */}
      <AnimatePresence>
        {showInspector && activeParcel && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white border-t border-slate-200 p-4 shadow-lg z-20"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: getStatusColor(activeParcel.status) }}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#0b2c52]">
                      Survey No: {activeParcel.surveyNumber}
                    </h4>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: `${getStatusColor(activeParcel.status)}15`,
                        color: getStatusColor(activeParcel.status),
                        borderColor: `${getStatusColor(activeParcel.status)}30`,
                      }}
                    >
                      {activeParcel.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ID: {activeParcel.id}</span>
                  </div>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Landowner: <strong className="text-slate-800">{activeParcel.ownerName}</strong> ({activeParcel.aadhaarMasked}) · Village: {activeParcel.village}, {activeParcel.district}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs">
                <div>
                  <span className="text-[10px] text-[#64748b] uppercase block">Acquisition Extent</span>
                  <span className="font-extrabold text-[#0b2c52] text-sm">{activeParcel.areaAcres} Acres</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748b] uppercase block">Assessed Award (100% Solatium)</span>
                  <span className="font-extrabold text-[#16a34a] text-sm">
                    ₹{(activeParcel.totalCompensation / 10000000).toFixed(2)} Cr
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748b] uppercase block">Payment Status</span>
                  <span className="font-semibold text-slate-700">{activeParcel.paymentStatus}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
