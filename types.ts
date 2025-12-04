
export enum UserRole {
  AGENT = 'AGENT',
  CLIENT = 'CLIENT'
}

export enum CaseStatus {
  ACTIVE = 'Active',
  FTA = 'FTA (Forfeiture)',
  CLOSED = 'Closed',
  PENDING = 'Pending'
}

export type SubscriptionTier = 'Standard' | 'Professional' | 'Ultimate';
export type SubscriptionStatus = 'Trial' | 'Active' | 'Expired';

export interface Subscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startDate: string;
  trialEndDate?: string;
  aiMinutesUsed: number;
  aiMinutesCap: number; // -1 for unlimited
  maxUsers: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  language: 'en' | 'es';
  balance: number;
  nextCourtDate: string; // ISO Date
  courtLocation: string;
  caseNumber: string;
  photoUrl: string;
  
  // Extended Intake Fields
  dob?: string;
  ssn?: string; // Masked in UI
  dlNumber?: string;
  bookingNumber?: string;
  secondaryPhone?: string;
  address?: string;
  residencyDuration?: string;
  employer?: {
    name: string;
    phone: string;
    address: string;
  };
  vehicleInfo?: {
    make: string;
    model: string;
    plate: string;
    year: string;
    color: string;
  };
  identifyingMarks?: string; // Tattoos, scars
  pin?: string; // For login
}

export interface Indemnitor {
  name: string;
  relation: string;
  phone: string;
  email: string;
  address: string;
  dob: string;
}

export interface CommunicationLogEntry {
  id: string;
  timestamp: string;
  recipient: string; // e.g., "Wake Clerk"
  type: 'Phone' | 'Email' | 'Fax' | 'In-Person' | 'Filing';
  purpose: string; // e.g., "Notice of Surrender"
  summary: string;
  referenceId?: string; // eCourts tracking ID
}

export interface CaseDocument {
  id: string;
  type: 'Arrest Report' | 'Mugshot' | 'Indemnification' | 'Collateral' | 'Court Notice' | 'Other';
  name: string;
  url: string; // Base64 or URL
  timestamp: string;
}

export interface CaseFile {
  id: string;
  clientId: string;
  bondAmount: number;
  premium: number;
  balancePaid: number;
  status: CaseStatus;
  county: string;
  notes: string;
  
  // Extended Fields
  indemnitors: Indemnitor[];
  poaNumber?: string;
  collateral?: {
    type: string;
    value: number;
    description: string;
  };
  charges?: string[];
  communicationLog?: CommunicationLogEntry[];
  documents?: CaseDocument[];
}

export interface CheckInLog {
  id: string;
  clientId: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  photoData: string; // Base64 or URL
  verified: boolean;
  notes?: string;
}

export interface SkipTraceLogEntry {
  id: string;
  clientId: string;
  timestamp: string;
  action: string;
  result: string;
}

export interface AuthorityContact {
  county: string;
  clerk: { phone: string; email: string; address: string };
  sheriff: { phone: string; address: string };
  da: { phone: string; email: string };
}

// Stats for Dashboard
export interface AgentStats {
  activeBondsCount: number;
  totalLiability: number;
  ftaCount: number;
  checkInsDueToday: number;
}
