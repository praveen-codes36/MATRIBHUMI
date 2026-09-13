/**
 * User & Authentication Models for NLAMS
 * Pre-seeded with official mock users according to GoI RBAC hierarchy
 */

export interface AuthOfficer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  portalId: 'central' | 'state' | 'district' | 'field' | 'policy';
  jurisdiction?: string;
  avatarBgLight: string;
  avatarBgDark: string;
  avatarText: string;
  requiresMFA: boolean;
}

export const MOCK_OFFICERS: Record<string, AuthOfficer> = {
  'central-admin': {
    id: 'off-01',
    name: 'Anjali Sharma',
    email: 'anjali.sharma@nlams.gov.in',
    phone: '+91 98••••1023',
    role: 'Central Admin',
    portalId: 'central',
    jurisdiction: undefined, // Central role: no jurisdiction suffix
    avatarBgLight: 'bg-[#0b2c52]',
    avatarBgDark: 'bg-[#0ea5a3]/30 border border-[#2dd4c8]/50',
    avatarText: 'text-[#2dd4c8]',
    requiresMFA: true,
  },
  'state-admin': {
    id: 'off-02',
    name: 'Rajeev Menon',
    email: 'rajeev.menon@nlams.gov.in',
    phone: '+91 97••••4488',
    role: 'State Admin',
    portalId: 'state',
    jurisdiction: 'Uttar Pradesh',
    avatarBgLight: 'bg-[#0ea5a3]',
    avatarBgDark: 'bg-[#0ea5a3]/30 border border-[#0ea5a3]/50',
    avatarText: 'text-white dark:text-[#2dd4c8]',
    requiresMFA: true,
  },
  'district-collector': {
    id: 'off-03',
    name: 'Ram Kumar',
    email: 'ram.kumar@nlams.gov.in',
    phone: '+91 98••••7210',
    role: 'District Collector',
    portalId: 'district',
    jurisdiction: 'Prayagraj, UP',
    avatarBgLight: 'bg-[#2563eb]',
    avatarBgDark: 'bg-[#2563eb]/30 border border-[#60a5fa]/50',
    avatarText: 'text-white dark:text-[#60a5fa]',
    requiresMFA: false,
  },
  'la-officer': {
    id: 'off-04',
    name: 'Ram Kumar',
    email: 'ram.kumar@nlams.gov.in',
    phone: '+91 98••••7210',
    role: 'LA Officer',
    portalId: 'district',
    jurisdiction: 'Prayagraj, UP',
    avatarBgLight: 'bg-[#7c3aed]',
    avatarBgDark: 'bg-[#7c3aed]/30 border border-[#a78bfa]/50',
    avatarText: 'text-white dark:text-[#c4b5fd]',
    requiresMFA: false,
  },
  'field-officer': {
    id: 'off-05',
    name: 'Sunita Devi',
    email: 'sunita.devi@nlams.gov.in',
    phone: '+91 91••••3390',
    role: 'Field Officer',
    portalId: 'field',
    jurisdiction: 'Village-scoped',
    avatarBgLight: 'bg-[#16a34a]',
    avatarBgDark: 'bg-[#16a34a]/30 border border-[#4ade80]/50',
    avatarText: 'text-white dark:text-[#4ade80]',
    requiresMFA: false,
  },
  'policy-maker': {
    id: 'off-06',
    name: 'Arvind Rao',
    email: 'arvind.rao@nlams.gov.in',
    phone: '+91 99••••5567',
    role: 'Policy Maker',
    portalId: 'policy',
    jurisdiction: undefined, // Central role: no jurisdiction suffix
    avatarBgLight: 'bg-[#d97706]',
    avatarBgDark: 'bg-[#d97706]/30 border border-[#fbbf24]/50',
    avatarText: 'text-white dark:text-[#fbbf24]',
    requiresMFA: false,
  },
};
