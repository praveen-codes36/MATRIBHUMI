/**
 * NIC Parichay / Single Sign-On Modal
 * Simulates Government of India Jan Parichay (e-Pramaan) unified authentication
 * with role credential selection and OTP simulation.
 */

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Lock, User, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';
import { MicroPressButton } from '../effects/MicroPressButton';
import { useToast } from '../effects/ToastProvider';

interface NicSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (roleId: string) => void;
}

export function NicSignInModal({ isOpen, onClose, onSelectRole }: NicSignInModalProps) {
  const { push } = useToast();
  const [selectedRole, setSelectedRole] = useState('central');
  const [govId, setGovId] = useState('nic.gov.in/officer-4482');
  const [isVerifying, setIsVerifying] = useState(false);

  const roles = [
    { id: 'central', label: 'Central Ministry Admin', desc: 'MoRTH / PM GatiShakti Division' },
    { id: 'state', label: 'State Revenue Admin', desc: 'Maharashtra Revenue Secretariat' },
    { id: 'district', label: 'District Collector / LAO', desc: 'Raigad Collectorate & SLAO Unit' },
    { id: 'field', label: 'Field Officer Mobile', desc: 'Panvel Rural Cadastral Unit' },
    { id: 'policy', label: 'Policy Maker & Analyst', desc: 'NITI Aayog / Cabinet Secretariat' },
  ];

  const handleSignIn = (e: FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      onClose();
      onSelectRole(selectedRole);
      push('success', 'e-Pramaan / Jan Parichay Verified', 'Session initialized with digital signature certificate.');
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-[#0b2c52] text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5 text-teal-300" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0b2c52]">
                  Jan Parichay Single Sign-On (SSO)
                </h3>
                <p className="text-[11px] text-[#64748b]">
                  National Informatics Centre (NIC) e-Authentication Gateway
                </p>
              </div>
            </div>

            <form onSubmit={handleSignIn} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-[#64748b] uppercase block mb-1">
                  Select Role Workbench
                </label>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {roles.map((r) => (
                    <label
                      key={r.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                        selectedRole === r.id
                          ? 'border-[#0ea5a3] bg-[#eef4fa]'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="role"
                          value={r.id}
                          checked={selectedRole === r.id}
                          onChange={() => setSelectedRole(r.id)}
                          className="accent-[#0ea5a3]"
                        />
                        <div>
                          <span className="font-bold text-[#0b2c52] block">{r.label}</span>
                          <span className="text-[10px] text-slate-500">{r.desc}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#64748b] uppercase block mb-1">
                  Government Email / e-Pramaan ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={govId}
                    onChange={(e) => setGovId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0ea5a3]"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-[#64748b] flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                <span>Sandbox token auto-generated with statutory audit clearance.</span>
              </div>

              <MicroPressButton
                variant="primary"
                size="md"
                type="submit"
                disabled={isVerifying}
                className="w-full justify-center"
              >
                <span>{isVerifying ? 'Authenticating with NIC...' : 'Authenticate & Enter Workbench'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </MicroPressButton>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
