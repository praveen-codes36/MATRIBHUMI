/**
 * Effect #11: Hero section with scroll-linked parallax
 * Headline and abstract GIS vector graphic move at complementary parallax scroll speeds.
 */

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { MagneticButton } from './MagneticButton';
import { ArrowRight, ShieldCheck, MapPin, Activity, FileCheck, Layers } from 'lucide-react';

interface HeroParallaxProps {
  onExploreDemo: () => void;
  onExploreProblem: () => void;
}

export function HeroParallax({ onExploreDemo, onExploreProblem }: HeroParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Parallax offsets
  const textY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const visualY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.85], [1, 0.25]);

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative min-h-[90vh] pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-[#f7f9fb] flex items-center"
    >
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Parallax Typography */}
          <motion.div
            style={{ y: textY, opacity: opacityFade }}
            className="lg:col-span-7 flex flex-col items-start"
          >
            {/* National initiative badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-xs mb-6">
              <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-ping" />
              <span className="text-xs font-semibold text-[#0b2c52]">
                Smart India Hackathon · Problem Statement 26016
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0b2c52] tracking-tight leading-[1.15]">
              From Fragmented Files to One National Platform
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#64748b] max-w-2xl leading-relaxed">
              Eliminating multi-year land acquisition bottlenecks across India. NLAMS unites District Collector workbenches, State land records, Central Ministry tracking, PFMS direct benefit compensation, and satellite GIS demarcation into an immutable, real-time control tower.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <MagneticButton
                variant="accent"
                onClick={onExploreDemo}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Launch 5-Portal Interactive Demo
              </MagneticButton>

              <button
                onClick={onExploreProblem}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b2c52] hover:text-[#0ea5a3] px-4 py-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                <span>Inspect Problem Statement</span>
              </button>
            </div>

            {/* Key trust pillars */}
            <div className="mt-10 pt-6 border-t border-slate-200/80 w-full grid grid-cols-3 gap-4 text-left">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0b2c52]">
                  <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
                  <span>Zero Data Silos</span>
                </div>
                <p className="text-[11px] text-[#64748b] mt-0.5">Automated single source of truth</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0b2c52]">
                  <Activity className="w-4 h-4 text-[#0ea5a3]" />
                  <span>AI Delay Prediction</span>
                </div>
                <p className="text-[11px] text-[#64748b] mt-0.5">SHAP-based root cause analysis</p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0b2c52]">
                  <FileCheck className="w-4 h-4 text-[#2563eb]" />
                  <span>PFMS Direct Payouts</span>
                </div>
                <p className="text-[11px] text-[#64748b] mt-0.5">100% Solatium automated awards</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Parallax Abstract GIS Map & Interactive Preview Graphic */}
          <motion.div
            style={{ y: visualY }}
            className="lg:col-span-5 relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xl shadow-slate-200/50">
              
              {/* Header inside mockup */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" />
                  <span className="text-xs font-bold text-[#0b2c52] ml-2">NLAMS National Control Tower</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#eef4fa] text-[#0ea5a3] rounded font-semibold">
                  LIVE SYNC
                </span>
              </div>

              {/* Stylized GIS Map Canvas Graphic */}
              <div className="relative mt-4 h-56 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                {/* Abstract parcel grid layout */}
                <svg viewBox="0 0 400 240" className="w-full h-full">
                  {/* Cadastral grid lines */}
                  <line x1="40" y1="0" x2="40" y2="240" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="120" y1="0" x2="120" y2="240" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="220" y1="0" x2="220" y2="240" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="320" y1="0" x2="320" y2="240" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="80" x2="400" y2="80" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="0" y1="160" x2="400" y2="160" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />

                  {/* Corridor Path (e.g. Expressway) */}
                  <path
                    d="M 20,200 Q 140,160 210,110 T 380,40"
                    fill="none"
                    stroke="#0b2c52"
                    strokeWidth="8"
                    strokeLinecap="round"
                    opacity="0.2"
                  />
                  <path
                    d="M 20,200 Q 140,160 210,110 T 380,40"
                    fill="none"
                    stroke="#0ea5a3"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="6,4"
                  />

                  {/* Parcel Polygons with Status Colors */}
                  {/* Parcel 1: Approved Green */}
                  <polygon
                    points="60,110 130,95 145,150 75,165"
                    fill="#16a34a"
                    fillOpacity="0.25"
                    stroke="#16a34a"
                    strokeWidth="2"
                  />
                  {/* Parcel 2: Pending Amber */}
                  <polygon
                    points="145,90 220,70 235,130 160,145"
                    fill="#d97706"
                    fillOpacity="0.25"
                    stroke="#d97706"
                    strokeWidth="2"
                  />
                  {/* Parcel 3: Disputed Red */}
                  <polygon
                    points="225,65 295,45 310,105 240,125"
                    fill="#dc2626"
                    fillOpacity="0.25"
                    stroke="#dc2626"
                    strokeWidth="2"
                  />
                  {/* Parcel 4: Possession Blue/Green */}
                  <polygon
                    points="120,160 190,145 205,200 135,215"
                    fill="#0ea5a3"
                    fillOpacity="0.2"
                    stroke="#0ea5a3"
                    strokeWidth="2"
                  />
                </svg>

                {/* Floating Map Pin Badge */}
                <div className="absolute top-4 right-4 bg-white/95 px-2.5 py-1 rounded-md shadow-sm border border-slate-200 flex items-center gap-1.5 text-[11px] font-bold text-[#0b2c52]">
                  <MapPin className="w-3.5 h-3.5 text-[#0ea5a3]" />
                  <span>Raigad DME-PKG-4</span>
                </div>

                {/* Floating GPS live pulse indicator */}
                <div className="absolute bottom-4 left-4 bg-white/95 px-2.5 py-1 rounded-md shadow-sm border border-slate-200 flex items-center gap-1.5 text-[11px] font-bold text-[#16a34a]">
                  <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
                  <span>Field Sync: Online</span>
                </div>
              </div>

              {/* Bottom mini metric row */}
              <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div className="bg-[#f7f9fb] p-2.5 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-[#64748b]">Total Demarcated</span>
                  <p className="text-sm font-extrabold text-[#0b2c52] mt-0.5">2,84,950 Acres</p>
                </div>
                <div className="bg-[#f7f9fb] p-2.5 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-[#64748b]">AI Delay Probability</span>
                  <p className="text-sm font-extrabold text-[#16a34a] mt-0.5">18% (Low Risk)</p>
                </div>
              </div>

              {/* Action Button inside widget */}
              <button
                onClick={onExploreDemo}
                className="w-full mt-4 bg-[#0b2c52] hover:bg-[#0ea5a3] text-white text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Open Portal Workbench</span>
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
