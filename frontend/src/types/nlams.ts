/**
 * Core type definitions for NLAMS - National Land Acquisition & Management System
 */

export type Role = 
  | 'CENTRAL_ADMIN'
  | 'STATE_ADMIN'
  | 'DISTRICT_COLLECTOR'
  | 'FIELD_OFFICER'
  | 'POLICY_MAKER';

export type AcquisitionStatus = 'Approved' | 'Pending' | 'Disputed' | 'Possession Taken';

export type WorkflowStage = 
  | 'Submitted'
  | 'District Scrutiny'
  | 'District Approved'
  | 'State Approved'
  | 'Central Approved'
  | 'Award Declared'
  | 'Possession Taken'
  | 'Closed';

export interface StatMetric {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  changePct: number;
  trend: 'up' | 'down' | 'neutral';
  subtext: string;
  updatedAt: number; // timestamp
}

export interface StateData {
  code: string;
  name: string;
  capital: string;
  totalProjects: number;
  totalAcres: number;
  compensationCr: number;
  completionPct: number;
  riskScore: number;
  status: 'High Progress' | 'On Track' | 'Attention Required';
  districts: DistrictData[];
}

export interface DistrictData {
  code: string;
  name: string;
  stateCode: string;
  activeProjects: number;
  parcelsCount: number;
  pendingApprovals: number;
  disbursedCr: number;
  completionPct: number;
}

export interface ProjectItem {
  id: string;
  code: string;
  name: string;
  ministry: string;
  state: string;
  district: string;
  acres: number;
  parcelsCount: number;
  budgetCr: number;
  disbursedCr: number;
  stage: WorkflowStage;
  currentStepIndex: number;
  riskScore: number;
  priorityScore: number;
  delayReasons: Array<{
    reason: string;
    percentage: number;
  }>;
  notifiedDate: string;
  awardDate?: string;
  possessionDate?: string;
  leadOfficer: string;
}

export interface Parcel {
  id: string;
  surveyNumber: string;
  village: string;
  district: string;
  state: string;
  ownerName: string;
  aadhaarMasked: string;
  areaAcres: number;
  circleRatePerAcre: number;
  baseCompensation: number;
  solatiumPct: number;
  totalCompensation: number;
  paymentStatus: 'Paid' | 'Pending' | 'Disputed' | 'Under Scrutiny';
  status: AcquisitionStatus;
  lat: number;
  lng: number;
  polygonPoints?: Array<[number, number]>;
  disputeNotes?: string;
}

export interface AffectedFamily {
  id: string;
  headOfFamily: string;
  surveyNumber: string;
  village: string;
  familyMembersCount: number;
  scStStatus: 'SC' | 'ST' | 'General' | 'OBC';
  livelihoodLoss: 'Agricultural' | 'Commercial' | 'Homestead';
  resettlementHouseStatus: 'Allocated' | 'In Construction' | 'Pending Choice';
  annuityGranted: boolean;
  trainingEnrolled: boolean;
}

export interface ToastMessage {
  id: string;
  severity: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  timestamp: number;
  durationMs?: number;
}

export interface FieldCaptureItem {
  id: string;
  surveyNumber: string;
  village: string;
  lat: number;
  lng: number;
  accuracyMeters: number;
  ownerName: string;
  landType: 'Dry Agricultural' | 'Wet Agricultural' | 'Homestead' | 'Industrial';
  notes: string;
  photosCount: number;
  timestamp: string;
  synced: boolean;
}
