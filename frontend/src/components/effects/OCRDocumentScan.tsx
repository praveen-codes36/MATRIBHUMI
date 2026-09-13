/**
 * Effect #9: OCR document-intelligence scan effect
 * Uploaded land deed / 7/12 extract / Section 11 notice shows glowing teal scan line sweeping down (1.4s),
 * green tint confirms "processed", and extracted key-value fields populate with ~260ms stagger.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scan, FileText, CheckCircle2, RefreshCw, Sparkles, Check } from 'lucide-react';
import { MicroPressButton } from './MicroPressButton';

interface ExtractedField {
  label: string;
  value: string;
  confidence: number;
}

const SAMPLE_EXTRACTED_FIELDS: ExtractedField[] = [
  { label: 'Document Type', value: 'Record of Rights (Form 7/12 & Mutation Entry)', confidence: 99.4 },
  { label: 'Village & Taluka', value: 'Panvel Rural, District Raigad (Maharashtra)', confidence: 98.8 },
  { label: 'Survey / Gat Number', value: '42/1A-108 (Sub-division cleared)', confidence: 99.1 },
  { label: 'Title Holder (Khatadar)', value: 'Ramakant Baliram Patil (Joint Holder: 1)', confidence: 97.6 },
  { label: 'Encumbrance / Hypothecation', value: 'NIL (Bank of Maharashtra NOC Verified)', confidence: 96.9 },
  { label: 'Demarcated Land Area', value: '3.45 Acres (1.396 Hectares)', confidence: 99.8 },
  { label: 'Applicable Circle Rate', value: '₹42,00,000 / Acre (Jantri FY25-26)', confidence: 98.5 },
];

export function OCRDocumentScan() {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessed, setIsProcessed] = useState(true);
  const [fields, setFields] = useState<ExtractedField[]>(SAMPLE_EXTRACTED_FIELDS);

  const handleTriggerScan = () => {
    setIsScanning(true);
    setIsProcessed(false);
    setFields([]);

    // Scanline downward sweep for ~1.4s
    setTimeout(() => {
      setIsScanning(false);
      setIsProcessed(true);

      // Populate fields one by one with ~260ms stagger
      SAMPLE_EXTRACTED_FIELDS.forEach((field, i) => {
        setTimeout(() => {
          setFields((prev) => [...prev, field]);
        }, i * 260);
      });
    }, 1400);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-[#0ea5a3]/10 text-[#0ea5a3]">
              <Scan className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-[#0b2c52]">
              AI Document Intelligence & Land Deed OCR
            </h3>
          </div>
          <p className="text-[11px] text-[#64748b] mt-0.5">
            Automated entity extraction from scanned 7/12 Land Records, Khatauni, & Sale Deeds
          </p>
        </div>

        <MicroPressButton
          variant="secondary"
          size="sm"
          onClick={handleTriggerScan}
          disabled={isScanning}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-[#0ea5a3]' : ''}`} />
          <span>{isScanning ? 'Scanning Deed...' : 'Scan New Document'}</span>
        </MicroPressButton>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Document Preview with Sweeping Scanline (Effect #9) */}
        <div className="lg:col-span-5 relative bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 p-4 overflow-hidden group">
          {/* Green Tint overlay when processed */}
          <AnimatePresence>
            {isProcessed && !isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.08 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 bg-[#16a34a] pointer-events-none z-10"
              />
            )}
          </AnimatePresence>

          {/* Sweeping glowing teal scanning line */}
          {isScanning && (
            <div className="absolute left-0 right-0 z-20 pointer-events-none animate-scanline">
              <div className="h-1 bg-[#0ea5a3] shadow-[0_0_12px_#0ea5a3,0_0_24px_#0ea5a3]" />
              <div className="h-12 bg-gradient-to-t from-[#0ea5a3]/20 to-transparent" />
            </div>
          )}

          {/* Simulated Land Deed Header */}
          <div className="bg-white rounded-lg p-4 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0b2c52]" />
                <span className="text-xs font-bold text-[#0b2c52]">
                  GOVT. OF MAHARASHTRA · REVENUE DEPT.
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">P-712/2026</span>
            </div>

            {/* Document Content Skeleton/Mock Deed */}
            <div className="mt-3 space-y-2 text-[11px] text-slate-600 font-serif leading-relaxed">
              <p className="font-sans text-[10px] uppercase font-bold text-[#0ea5a3]">
                FORM VII-XII (VILLAGE SAMPLE NO. 7 & 12)
              </p>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200/60 text-[10px] font-mono space-y-1">
                <p>Village: Panvel Rural | Sub-Division: Raigad</p>
                <p>Survey No: 42/1A-108 | Khata No: 892</p>
                <p>Occupant Class: Bhumiswami (Full Ownership)</p>
                <p>Boundary: North: Canal | South: SH-54 Road</p>
              </div>
              <p className="text-[10px] text-slate-400">
                Certified Digital Record extracted via State Land Records Integration Service.
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Digital Seal: SHA-256</span>
              <span className="text-[10px] font-bold text-[#16a34a] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified Legal Title
              </span>
            </div>
          </div>
        </div>

        {/* Extracted Fields (Populate with 260ms stagger) */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0b2c52] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0ea5a3]" />
              <span>Extracted Statutory Parameters</span>
            </h4>
            <span className="text-[11px] font-semibold text-[#16a34a]">
              {fields.length} of {SAMPLE_EXTRACTED_FIELDS.length} Fields Populated
            </span>
          </div>

          <div className="space-y-2">
            {fields.map((field) => (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-[#0ea5a3] transition-colors flex items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#64748b] block">
                    {field.label}
                  </span>
                  <p className="text-xs font-bold text-[#0b2c52] mt-0.5">{field.value}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-[#16a34a] border border-emerald-100">
                    {field.confidence}% match
                  </span>
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#16a34a] flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              </motion.div>
            ))}

            {isScanning && (
              <div className="p-3 text-center text-xs text-[#0ea5a3] font-semibold bg-[#eef4fa] rounded-lg animate-pulse">
                Parsing document structure and legal covenants...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
