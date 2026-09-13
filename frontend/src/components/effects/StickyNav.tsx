/**
 * Effect #12 & #20: Sticky nav with scroll shrink, shadow transition & dark glassmorphism tint
 * Starts transparent/subtle over hero, then smoothly shrinks in height and gains solid glass blur + border.
 * Integrated with ProfileBadge (Addition 3) and ThemeToggle (Addition 1).
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Layers, ChevronRight, LogIn } from 'lucide-react';
import { AuthOfficer } from '../../types/auth';
import { ProfileBadge } from '../common/ProfileBadge';
import { ThemeToggle } from '../theme/ThemeProvider';

interface StickyNavProps {
  onNavigateToDemo?: (portal?: string) => void;
  onScrollToSection?: (sectionId: string) => void;
  activeView?: 'landing' | 'demo' | 'login';
  onOpenSignIn?: () => void;
  onOpenDemo?: () => void;
  isDemoActive?: boolean;
  currentUser?: AuthOfficer | null;
  onLogout?: () => void;
  onNavigateHome?: () => void;
}

export function StickyNav({
  onNavigateToDemo,
  onScrollToSection,
  activeView,
  onOpenSignIn,
  onOpenDemo,
  isDemoActive,
  currentUser,
  onLogout,
  onNavigateHome,
}: StickyNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  const handleDemoClick = () => {
    if (onOpenDemo) onOpenDemo();
    else if (onNavigateToDemo) onNavigateToDemo();
  };

  const handleScroll = (id: string) => {
    if (onNavigateHome && activeView !== 'landing') {
      onNavigateHome();
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    if (onScrollToSection) {
      onScrollToSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScrollEvent = () => {
      if (window.scrollY > 60) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScrollEvent, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollEvent);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md ${
        isScrolled
          ? 'bg-[var(--nav-glass-bg)] shadow-md shadow-slate-900/5 dark:shadow-black/30 border-b border-[var(--nav-glass-border)] py-2 sm:py-2.5'
          : 'bg-[var(--nav-glass-bg)] border-b border-[var(--nav-glass-border)] py-3 sm:py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Emblem & Logo */}
        <div
          onClick={() => (onNavigateHome ? onNavigateHome() : handleScroll('hero'))}
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-[#0b2c52] dark:bg-[#0f2237] border border-blue-900/40 dark:border-teal-500/30 flex items-center justify-center text-white shadow-sm group-hover:bg-[#0ea5a3] transition-colors">
            <Layers className="w-5 h-5 text-[#2dd4c8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#0b2c52] dark:text-[#cfe0f2] tracking-tight text-base sm:text-lg leading-tight">
                NLAMS
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#0ea5a3]/15 text-[#0ea5a3] dark:text-[#2dd4c8] border border-[#0ea5a3]/20">
                SIH 26016
              </span>
            </div>
            <p className="text-[11px] text-[#64748b] dark:text-[#94a3b8] hidden md:block leading-none font-medium mt-0.5">
              National Land Acquisition & Management System
            </p>
          </div>
        </div>

        {/* Center Nav Links (Visible on Landing page on desktop) */}
        {activeView === 'landing' ? (
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#1c2530] dark:text-[#e5eaf0]">
            <button
              onClick={() => handleScroll('problem')}
              className="hover:text-[#0ea5a3] dark:hover:text-[#2dd4c8] transition-colors py-1 cursor-pointer"
            >
              The Silo Problem
            </button>
            <button
              onClick={() => handleScroll('lifecycle')}
              className="hover:text-[#0ea5a3] dark:hover:text-[#2dd4c8] transition-colors py-1 cursor-pointer"
            >
              12-Stage Lifecycle
            </button>
            <button
              onClick={() => handleScroll('features')}
              className="hover:text-[#0ea5a3] dark:hover:text-[#2dd4c8] transition-colors py-1 cursor-pointer"
            >
              Platform Capabilities
            </button>
            <button
              onClick={() => handleScroll('portals')}
              className="hover:text-[#0ea5a3] dark:hover:text-[#2dd4c8] transition-colors py-1 cursor-pointer"
            >
              5 Portals
            </button>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full bg-[#eef4fa] dark:bg-[#0f2237] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
            <span>NIC Real-Time Cadastral Data Pipeline</span>
          </div>
        )}

        {/* Action CTAs: Theme Toggle & Profile / Auth buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle (Sun/Moon cross-fade) */}
          <ThemeToggle size="md" />

          {/* If user is logged in or inside demo, render persistent ProfileBadge */}
          {currentUser ? (
            <ProfileBadge user={currentUser} onLogout={onLogout} />
          ) : (
            <>
              <button
                type="button"
                onClick={() => (onOpenSignIn ? onOpenSignIn() : handleDemoClick())}
                className="text-xs font-semibold text-[#0b2c52] dark:text-[#cfe0f2] hover:text-[#0ea5a3] dark:hover:text-[#2dd4c8] px-2.5 py-1.5 transition-colors hidden sm:inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In (NIC)</span>
              </button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleDemoClick}
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all shadow-sm cursor-pointer ${
                  isDemoActive
                    ? 'bg-[#0ea5a3] text-white ring-2 ring-[#0ea5a3]/40'
                    : 'bg-[#0b2c52] text-white hover:bg-[#0ea5a3]'
                }`}
              >
                <span>{isDemoActive ? 'Demo Active' : 'Live Interactive Demo'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
