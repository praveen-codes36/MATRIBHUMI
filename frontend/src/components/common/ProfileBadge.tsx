/**
 * ProfileBadge Component (Addition 3)
 * Shared profile badge displayed in the sticky nav across all authenticated screens & portals.
 * Shows initials-based avatar, officer name, role & jurisdiction, with rich dropdown controls:
 * government email, masked mobile, inlined language switcher, inlined theme toggle, and logout action.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, LogOut, ShieldCheck, Mail, Phone, Palette, Globe } from 'lucide-react';
import { AuthOfficer } from '../../types/auth';
import { useToast } from '../effects/ToastProvider';
import { ThemeToggle } from '../theme/ThemeProvider';
import { LanguageSwitcher } from './LanguageSwitcher';

interface ProfileBadgeProps {
  user: AuthOfficer;
  onLogout?: () => void;
  className?: string;
}

export function ProfileBadge({ user, onLogout, className = '' }: ProfileBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { push } = useToast();

  // Extract initials (e.g. "Ram Kumar" -> "R K", "Sunita Devi" -> "S D")
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    },
    [isOpen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleLogoutClick = () => {
    setIsOpen(false);
    push('info', 'Logged Out Successfully', 'Your secure session has been terminated.');
    if (onLogout) {
      onLogout();
    }
  };

  // Format display subtitle (e.g., "District Collector · Prayagraj, UP" or "Central Admin")
  const roleJurisdictionText = user.jurisdiction
    ? `${user.role} · ${user.jurisdiction}`
    : user.role;

  return (
    <div className={`relative inline-block text-left ${className}`}>
      {/* Collapsed State: Interactive Badge Button */}
      <button
        ref={buttonRef}
        type="button"
        id="profile-badge-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`Officer profile: ${user.name}, ${roleJurisdictionText}`}
        className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#0ea5a3] focus:ring-offset-2 dark:focus:ring-offset-[#0b1220] ${
          isOpen
            ? 'bg-[#eef4fa] dark:bg-[#0f2237] border-[#0ea5a3] shadow-sm'
            : 'bg-white dark:bg-[#131c2e] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
        }`}
      >
        {/* Initials Avatar */}
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${user.avatarBgLight} ${user.avatarText}`}
        >
          {initials}
        </div>

        {/* Text Details */}
        <div className="text-left hidden sm:block leading-tight">
          <div className="text-xs font-bold text-[#0b2c52] dark:text-[#cfe0f2] tracking-tight">
            {user.name}
          </div>
          <div className="text-[10px] text-[#64748b] dark:text-[#94a3b8] truncate max-w-[155px]">
            {roleJurisdictionText}
          </div>
        </div>

        {/* Chevron Icon */}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#0ea5a3] dark:text-[#2dd4c8]' : ''
          }`}
        />
      </button>

      {/* Expanded State: Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-32px)] bg-white dark:bg-[#131c2e] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/10 dark:shadow-black/40 z-50 overflow-hidden"
            role="dialog"
            aria-label="User Profile Details"
          >
            {/* Header: Large Avatar + Full Name + Role Badge */}
            <div className="p-4 bg-gradient-to-b from-[#eef4fa] to-transparent dark:from-[#0f2237] dark:to-transparent border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-start gap-3">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 shadow-md ${user.avatarBgLight} ${user.avatarText}`}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-extrabold text-[#0b2c52] dark:text-[#cfe0f2] truncate">
                      {user.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0ea5a3]/15 text-[#0ea5a3] dark:text-[#2dd4c8] border border-[#0ea5a3]/20">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      Verified
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-[#94a3b8] mt-0.5">
                    {roleJurisdictionText}
                  </div>
                </div>
              </div>

              {/* Contact info cards */}
              <div className="mt-3 space-y-1.5 bg-white/70 dark:bg-[#0b1220]/60 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800/80 text-[11px]">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-[#0ea5a3] shrink-0" />
                  <span className="truncate font-mono">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-[#16a34a] dark:text-[#4ade80] shrink-0" />
                  <span className="font-mono tracking-wider">{user.phone}</span>
                </div>
              </div>
            </div>

            {/* Inlined Controls: Language & Theme */}
            <div className="p-3 space-y-2 text-xs">
              {/* Language Row */}
              <div className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1a263d]/60 transition-colors">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                  <Globe className="w-4 h-4 text-[#0ea5a3]" />
                  <span>Language</span>
                </div>
                <LanguageSwitcher variant="compact" />
              </div>

              {/* Theme Row */}
              <div className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1a263d]/60 transition-colors">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                  <Palette className="w-4 h-4 text-amber-500" />
                  <span>Theme Mode</span>
                </div>
                <ThemeToggle size="sm" />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* Logout Action Row */}
            <div className="p-2">
              <button
                type="button"
                id="profile-logout-btn"
                onClick={handleLogoutClick}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#dc2626] dark:text-[#f87171] hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer group focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                  <span>Logout from Session</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-100/70 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                  NIC SSO
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
