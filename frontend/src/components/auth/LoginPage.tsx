/**
 * Official Dignified Login Page (Addition 2)
 * Split-screen layout:
 * - Left 60%: Form with NLAMS abstract emblem, 6-role animated segmented control,
 *   credentials with pre-fills, 6-digit auto-advancing MFA OTP for admin roles,
 *   magnetic CTA button, and 3 GoI trust badges.
 * - Right 40%: Ambient auto-looping lifecycle diagram with live telemetry.
 * Full keyboard navigability, visible focus rings, calm inline validation,
 * top-loading bar integration, and top-right theme toggle.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, History, Lock, Eye, EyeOff, 
  ArrowRight, KeyRound, Sparkles, AlertCircle, CheckCircle2, ChevronLeft
} from 'lucide-react';
import { MOCK_OFFICERS, AuthOfficer } from '../../types/auth';
import { MagneticButton } from '../effects/MagneticButton';
import { ThemeToggle } from '../theme/ThemeProvider';
import { useToast } from '../effects/ToastProvider';
import { AmbientLifecycleLoop } from './AmbientLifecycleLoop';

interface LoginPageProps {
  onLoginSuccess: (officer: AuthOfficer) => void;
  onNavigateLanding?: () => void;
}

const ROLES_LIST = [
  { key: 'central-admin', label: 'Central Admin', portalId: 'central' },
  { key: 'state-admin', label: 'State Admin', portalId: 'state' },
  { key: 'district-collector', label: 'District Collector', portalId: 'district' },
  { key: 'la-officer', label: 'LA Officer', portalId: 'district' },
  { key: 'field-officer', label: 'Field Officer', portalId: 'field' },
  { key: 'policy-maker', label: 'Policy Maker', portalId: 'policy' },
] as const;

export function LoginPage({ onLoginSuccess, onNavigateLanding }: LoginPageProps) {
  const { push } = useToast();
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>('central-admin');
  const activeOfficer = MOCK_OFFICERS[selectedRoleKey] || MOCK_OFFICERS['central-admin'];

  // Form states
  const [email, setEmail] = useState<string>(activeOfficer.email);
  const [password, setPassword] = useState<string>('GovtSecretPass@2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  // MFA OTP states
  const [isMfaStep, setIsMfaStep] = useState<boolean>(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update credentials when role changes
  const handleRoleChange = (roleKey: string) => {
    setSelectedRoleKey(roleKey);
    const newOfficer = MOCK_OFFICERS[roleKey];
    if (newOfficer) {
      setEmail(newOfficer.email);
      setPassword('GovtSecretPass@2026');
      setEmailError('');
      setPasswordError('');
      setIsMfaStep(false);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError('');
    }
  };

  // Primary Login / MFA Transition Handler
  const handleSubmitCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    // Calm client-side validation
    let hasError = false;
    if (!email.trim() || !email.includes('@')) {
      setEmailError('Please enter a valid government email address');
      hasError = true;
    }
    if (!password.trim() || password.length < 6) {
      setPasswordError('Password must contain at least 6 characters');
      hasError = true;
    }
    if (hasError) return;

    // Check if role requires 2nd Factor MFA (Central & State Admins)
    if (activeOfficer.requiresMFA) {
      setIsMfaStep(true);
      // Auto focus first OTP input on next tick
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } else {
      executeLogin();
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    // Only accept single numeric digit
    const cleaned = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (cleaned.length > 0) {
      newDigits[index] = cleaned[cleaned.length - 1]; // Last entered digit
      setOtpDigits(newDigits);
      setOtpError('');

      // Auto-advance focus to next input
      if (index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    } else {
      newDigits[index] = '';
      setOtpDigits(newDigits);
    }
  };

  // Handle Backspace in OTP boxes
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Paste in OTP
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setOtpDigits(newDigits);
    setOtpError('');

    // Focus last filled or first empty
    const focusIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[focusIndex]?.focus();
  };

  // Quick fill helper for demo convenience
  const handleAutoFillDemoOtp = () => {
    setOtpDigits(['8', '4', '9', '2', '0', '1']);
    setOtpError('');
    setTimeout(() => {
      otpInputRefs.current[5]?.focus();
    }, 50);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setOtpError('Please enter the complete 6-digit verification code');
      return;
    }
    executeLogin();
  };

  const executeLogin = () => {
    setIsSubmitting(true);
    // Simulate brief NIC authentication clearance
    setTimeout(() => {
      push(
        'success',
        `Authentication Verified: ${activeOfficer.role}`,
        `Welcome, ${activeOfficer.name}. Secure session initiated under Statutory RBAC.`
      );
      setIsSubmitting(false);
      onLoginSuccess(activeOfficer);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface,#f7f9fb)] text-[var(--color-text,#1c2530)] flex flex-col justify-between relative transition-colors duration-300">
      {/* Top Header Bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between z-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0b1220]/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {onNavigateLanding && (
            <button
              type="button"
              onClick={onNavigateLanding}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0b2c52] dark:hover:text-white transition-colors cursor-pointer mr-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Portal Home</span>
            </button>
          )}

          {/* Abstract Geometric Emblem + Brand Wordmark */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0b2c52] to-[#0ea5a3] flex items-center justify-center text-white shadow-sm ring-2 ring-[#0ea5a3]/30">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-[#0b2c52] dark:text-[#cfe0f2]">
                NLAMS
              </span>
              <span className="text-[10px] font-mono text-[#0ea5a3] ml-1 font-bold">
                GoI · SIH PS 26016
              </span>
            </div>
          </div>
        </div>

        {/* Right Corner: Security indicator + Theme Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            <Lock className="w-3 h-3" />
            <span>NIC 256-Bit TLS</span>
          </div>

          <ThemeToggle size="md" />
        </div>
      </header>

      {/* Main Split-Screen Container */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 items-stretch justify-center gap-6 lg:gap-8 my-auto">
        {/* Left Panel: 60% Width Form Card */}
        <div className="w-full lg:w-[60%] flex flex-col justify-center">
          <div className="bg-white dark:bg-[#131c2e] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 md:p-10 shadow-xl shadow-slate-900/5 dark:shadow-black/30 relative">
            {/* Header / Titles */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#eef4fa] dark:bg-[#0f2237] border border-blue-100 dark:border-slate-800 text-[11px] font-bold text-[#0ea5a3] dark:text-[#2dd4c8]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Statutory Land Acquisition Gateway</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0b2c52] dark:text-[#cfe0f2] mt-2 tracking-tight">
                National Land Acquisition & Management System
              </h1>
              <p className="text-xs sm:text-sm text-[#64748b] dark:text-[#94a3b8] mt-1 font-medium">
                Government of India · Smart India Hackathon PS 26016
              </p>
            </div>

            {/* Role Selector: Segmented Control with Shared Layout Animation */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Designated Officer Role
              </label>
              <div 
                role="radiogroup" 
                aria-label="Select officer role"
                className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-1.5 bg-[#f1f5f9] dark:bg-[#0b1220] rounded-xl border border-slate-200/80 dark:border-slate-800/80"
              >
                {ROLES_LIST.map((r) => {
                  const isSelected = selectedRoleKey === r.key;
                  return (
                    <button
                      key={r.key}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleRoleChange(r.key)}
                      className={`relative px-3 py-2 rounded-lg text-xs font-bold transition-colors select-none text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0ea5a3] ${
                        isSelected
                          ? 'text-[#0b2c52] dark:text-[#cfe0f2]'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="login-role-active-indicator"
                          className="absolute inset-0 bg-white dark:bg-[#131c2e] rounded-lg shadow-sm border border-slate-200/90 dark:border-slate-700/80"
                          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                        />
                      )}
                      <span className="relative z-10 block truncate">
                        {r.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Officer Context Pill */}
              <div className="mt-2.5 flex items-center justify-between text-[11px] px-3 py-1.5 rounded-lg bg-[#eef4fa]/60 dark:bg-[#0f2237]/60 border border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#0b2c52] dark:text-[#cfe0f2]">{activeOfficer.name}</span>
                  {activeOfficer.jurisdiction && (
                    <span className="text-slate-400 dark:text-slate-500">· {activeOfficer.jurisdiction}</span>
                  )}
                </div>
                {activeOfficer.requiresMFA ? (
                  <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <KeyRound className="w-3 h-3" />
                    2FA MFA Enforced
                  </span>
                ) : (
                  <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Single-Factor RBAC
                  </span>
                )}
              </div>
            </div>

            {/* Slide + Fade between Step 1 (Credentials) and Step 2 (MFA OTP) */}
            <AnimatePresence mode="wait">
              {!isMfaStep ? (
                /* STEP 1: Primary Credentials Form */
                <motion.form
                  key="credentials-step"
                  onSubmit={handleSubmitCredentials}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Email Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="login-email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Official NIC Email
                      </label>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">gov.in domain verified</span>
                    </div>
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      placeholder="officer@nlams.gov.in"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#0ea5a3] dark:bg-[#0b1220] ${
                        emailError
                          ? 'border-red-500 text-red-700 dark:text-red-400 focus:ring-red-400'
                          : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                      }`}
                    />
                    {emailError && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{emailError}</span>
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="login-password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => push('info', 'NIC Self-Service Reset', 'Password recovery instructions sent to registered official mobile.')}
                        className="text-[11px] text-[#0ea5a3] dark:text-[#2dd4c8] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (passwordError) setPasswordError('');
                        }}
                        placeholder="••••••••••••"
                        className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#0ea5a3] dark:bg-[#0b1220] ${
                          passwordError
                            ? 'border-red-500 text-red-700 dark:text-red-400 focus:ring-red-400'
                            : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{passwordError}</span>
                      </p>
                    )}
                  </div>

                  {/* Submit Button (Magnetic CTA) */}
                  <div className="pt-2">
                    <MagneticButton
                      type="submit"
                      variant="accent"
                      disabled={isSubmitting}
                      className="w-full text-center"
                      icon={<ArrowRight className="w-4 h-4" />}
                    >
                      {isSubmitting
                        ? 'Verifying with NIC...'
                        : activeOfficer.requiresMFA
                        ? 'Proceed to MFA Verification'
                        : 'Secure Officer Login'}
                    </MagneticButton>
                  </div>
                </motion.form>
              ) : (
                /* STEP 2: 2FA MFA OTP Screen for Admin Roles */
                <motion.form
                  key="mfa-step"
                  onSubmit={handleVerifyOtp}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-[#eef4fa] dark:bg-[#0f2237] border border-blue-100 dark:border-slate-800 text-left">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0b2c52] dark:text-[#cfe0f2]">
                      <KeyRound className="w-4 h-4 text-[#0ea5a3]" />
                      <span>Second-Factor Authentication (OTP)</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                      A 6-digit verification code has been dispatched to {activeOfficer.phone} and official NIC email.
                    </p>
                  </div>

                  {/* 6 Individually Boxed Digits */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Enter 6-Digit Verification Code
                    </label>
                    <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpInputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className={`w-11 h-12 sm:w-12 sm:h-14 text-center font-mono text-lg font-bold rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-[#0ea5a3] dark:bg-[#0b1220] ${
                            otpError
                              ? 'border-red-500 text-red-600 dark:text-red-400 focus:ring-red-400'
                              : digit
                              ? 'border-[#0ea5a3] bg-teal-50/40 dark:bg-teal-950/20 text-[#0b2c52] dark:text-[#2dd4c8]'
                              : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                          }`}
                          aria-label={`Digit ${idx + 1}`}
                        />
                      ))}
                    </div>
                    {otpError && (
                      <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{otpError}</span>
                      </p>
                    )}
                  </div>

                  {/* Demo Helper Pill for instant testing */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setIsMfaStep(false)}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#0b2c52] dark:hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Back to credentials</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleAutoFillDemoOtp}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100 cursor-pointer"
                      title="Click to automatically fill code 849201"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Test Demo OTP: 849201</span>
                    </button>
                  </div>

                  {/* Verify & Enter Portal */}
                  <div className="pt-2">
                    <MagneticButton
                      type="submit"
                      variant="accent"
                      disabled={isSubmitting}
                      className="w-full text-center"
                      icon={<ArrowRight className="w-4 h-4" />}
                    >
                      {isSubmitting ? 'Verifying OTP with NIC...' : 'Authenticate & Launch Portal'}
                    </MagneticButton>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Trust Strip Beneath Form */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <div className="w-6 h-6 rounded-md bg-teal-50 dark:bg-teal-950/40 text-[#0ea5a3] dark:text-[#2dd4c8] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium leading-tight">Role-Based Access Control</span>
                </div>

                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <History className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium leading-tight">End-to-End Audit Trail</span>
                </div>

                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-medium leading-tight">GoI Cybersecurity Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: 40% Width Animated Lifecycle Visual (Desktop Only) */}
        <div className="hidden lg:block lg:w-[40%] rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl">
          <AmbientLifecycleLoop />
        </div>
      </main>

      {/* Footer Strip */}
      <footer className="w-full py-3 px-6 text-center text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-[#0b1220]/40">
        <span>Ministry of Road Transport & Highways · National Informatics Centre · SIH 2026</span>
      </footer>
    </div>
  );
}
