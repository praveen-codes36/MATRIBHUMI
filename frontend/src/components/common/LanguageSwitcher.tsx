/**
 * LanguageSwitcher Component
 * Allows toggling official Indian government supported working languages.
 */

import { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
];

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'compact' | 'inline';
}

export function LanguageSwitcher({ className = '', variant = 'compact' }: LanguageSwitcherProps) {
  const [selectedLang, setSelectedLang] = useState<string>('en');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        id="language-switcher-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#0ea5a3] ${
          isOpen
            ? 'bg-[#eef4fa] text-[#0b2c52] border-[#0ea5a3] dark:bg-[#0f2237] dark:text-[#cfe0f2]'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-[#131c2e] dark:text-[#e5eaf0] dark:border-slate-800 dark:hover:bg-[#1a263d]'
        }`}
      >
        <Globe className="w-3.5 h-3.5 text-[#0ea5a3]" />
        <span>{variant === 'compact' ? current.nativeLabel : `${current.label} (${current.nativeLabel})`}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-[#131c2e] rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg py-1.5 z-50 overflow-hidden"
            role="listbox"
          >
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1">
              Select Official Language
            </div>
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === selectedLang;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setSelectedLang(lang.code);
                    setIsOpen(false);
                  }}
                  role="option"
                  aria-selected={isSelected}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#eef4fa] text-[#0b2c52] font-bold dark:bg-[#0f2237] dark:text-[#2dd4c8]'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-[#e5eaf0] dark:hover:bg-[#1a263d]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{lang.label}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">({lang.nativeLabel})</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#0ea5a3] dark:text-[#2dd4c8]" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
