/**
 * Statutory Compensation Calculator component
 * RFCTLARR Act 2013 compliant: Area × Circle Rate × Rural/Urban Factor + 100% Solatium
 */

import { useState } from 'react';
import { Banknote, Calculator, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { MicroPressButton } from '../effects/MicroPressButton';
import { useToast } from '../effects/ToastProvider';

interface CompensationCalculatorProps {
  initialArea?: number;
  initialCircleRate?: number;
  onSaveAward?: (award: {
    area: number;
    circleRate: number;
    factor: number;
    solatium: number;
    total: number;
  }) => void;
}

export function CompensationCalculator({
  initialArea = 3.45,
  initialCircleRate = 4200000,
  onSaveAward,
}: CompensationCalculatorProps) {
  const { push } = useToast();
  const [area, setArea] = useState<number>(initialArea);
  const [circleRate, setCircleRate] = useState<number>(initialCircleRate);
  const [multiplierFactor, setMultiplierFactor] = useState<number>(1.25); // Rural = 1.0 - 2.0, Urban = 1.0
  const [solatiumPct, setSolatiumPct] = useState<number>(100); // 100% statutory mandate

  // Calculations
  const baseLandValue = area * circleRate;
  const marketValueWithFactor = baseLandValue * multiplierFactor;
  const solatiumAmount = marketValueWithFactor * (solatiumPct / 100);
  const totalAward = marketValueWithFactor + solatiumAmount;

  const handleSave = () => {
    onSaveAward?.({
      area,
      circleRate,
      factor: multiplierFactor,
      solatium: solatiumAmount,
      total: totalAward,
    });
    push(
      'success',
      'Statutory Award Computed & Saved',
      `Total assessed compensation: ₹${(totalAward / 10000000).toFixed(2)} Cr with 100% Solatium.`
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-[#0ea5a3]/10 text-[#0ea5a3]">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0b2c52]">
              RFCTLARR 2013 Statutory Compensation Engine
            </h3>
            <p className="text-[11px] text-[#64748b]">
              Automatic assessment with Section 30 Solatium & Multiplier factors
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#16a34a] border border-emerald-100">
          Section 26-30 Formula
        </span>
      </div>

      {/* Input Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-[11px] font-bold text-[#64748b] uppercase block mb-1">
            Demarcated Extent (Acres)
          </label>
          <input
            type="number"
            step="0.05"
            value={area}
            onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0ea5a3]"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-[#64748b] uppercase block mb-1">
            Circle Rate / Jantri (₹ / Acre)
          </label>
          <input
            type="number"
            step="50000"
            value={circleRate}
            onChange={(e) => setCircleRate(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0ea5a3]"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-[#64748b] uppercase block mb-1">
            Rural Multiplier Factor
          </label>
          <select
            value={multiplierFactor}
            onChange={(e) => setMultiplierFactor(parseFloat(e.target.value))}
            className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0ea5a3] bg-white"
          >
            <option value={1.0}>1.00x (Urban Municipal Limits)</option>
            <option value={1.25}>1.25x (Peri-Urban Buffer)</option>
            <option value={1.5}>1.50x (Rural Distance 10-20km)</option>
            <option value={2.0}>2.00x (Remote Rural / Schedule V)</option>
          </select>
        </div>
      </div>

      {/* Formula Breakdown Output */}
      <div className="mt-5 p-4 rounded-xl bg-[#f7f9fb] border border-slate-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-[#64748b] uppercase font-bold block">Base Land Value</span>
            <p className="text-sm font-bold text-[#0b2c52] mt-0.5">
              ₹{(baseLandValue / 100000).toFixed(2)} Lakh
            </p>
          </div>
          <div>
            <span className="text-[10px] text-[#64748b] uppercase font-bold block">With Multiplier ({multiplierFactor}x)</span>
            <p className="text-sm font-bold text-[#0b2c52] mt-0.5">
              ₹{(marketValueWithFactor / 100000).toFixed(2)} Lakh
            </p>
          </div>
          <div>
            <span className="text-[10px] text-[#64748b] uppercase font-bold block">100% Solatium (Sec 30)</span>
            <p className="text-sm font-bold text-[#0ea5a3] mt-0.5">
              ₹{(solatiumAmount / 100000).toFixed(2)} Lakh
            </p>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
            <span className="text-[10px] text-[#16a34a] uppercase font-bold block">Total Final Award</span>
            <p className="text-base font-extrabold text-[#16a34a] mt-0.5">
              ₹{(totalAward / 10000000).toFixed(2)} Cr
            </p>
          </div>
        </div>
      </div>

      {/* Submit Action */}
      <div className="mt-4 flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
          <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
          <span>Compliant with Section 26 to 30 First Schedule</span>
        </div>

        <MicroPressButton
          variant="primary"
          size="sm"
          onClick={handleSave}
        >
          <span>Declare Statutory Award</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </MicroPressButton>
      </div>
    </div>
  );
}
