
export enum UserRole {
  AGENT = 'AGENT',
  CLIENT = 'CLIENT',
  TRIAL_AGENT = 'TRIAL_AGENT',
  ADMIN = 'ADMIN' // Super User
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

export interface AddressRecord {
  address: string;
  lat?: number;
  lng?: number;
  dateAdded: string;
  isCurrent: boolean;
  source: 'Intake' | 'CheckIn' | 'SkipTrace';
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
  address?: string; // Current Address
  addressHistory?: AddressRecord[]; // Historical Addresses
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

// --- NEW: Agent Profile & Marketing Types ---

export interface AgentProfile {
  id: string;
  userId: string;
  fullName: string;
  businessName: string;
  businessAddress: string;
  email: string;
  phone: string;
  suretyAgency: string;
  licenseNumber: string;
  bio: string;
  profileImageUrl: string;
  coverImageUrl: string;
  
  // API Keys
  geminiApiKey: string;
  whatsAppApiKey: string;
  facebookApiKey: string;
  tiktokApiKey: string;
  xApiKey?: string;
  stripeSecretKey?: string;
  cashAppKey?: string;
  
  // Financials
  balanceOwed: number;
  totalPaid: number;
  
  updatedAt: string;
}

export interface AgentMedia {
  id: string;
  agentId: string;
  type: 'image' | 'video';
  url: string; // Base64 for demo
  duration?: number; // seconds
  createdAt: string;
}

export type SocialPlatform = 'Facebook' | 'X' | 'TikTok' | 'WhatsApp' | 'Instagram';

export interface SocialConnection {
    id: string;
    platform: SocialPlatform;
    isConnected: boolean;
    username?: string;
    lastSync?: string;
    avatarUrl?: string;
}

export interface MarketingPost {
    id: string;
    platform: SocialPlatform;
    content: string;
    mediaUrl?: string;
    scheduledFor?: string;
    status: 'Draft' | 'Scheduled' | 'Posted';
    analytics?: {
        views: number;
        likes: number;
        shares: number;
    }
}

// --- ADMIN TYPES ---
export interface PaymentRecord {
  id: string;
  agentId: string;
  amount: number;
  method: 'Stripe' | 'CashApp' | 'Manual';
  status: 'Pending' | 'Completed' | 'Failed';
  timestamp: string;
  referenceId?: string;
}

export interface SystemLog {
  id: string;
  action: string;
  adminUser: string;
  targetId?: string;
  timestamp: string;
  details: string;
}

// --- EMAIL INBOX TYPES ---
export interface EmailAttachment {
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface Email {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  body: string; // HTML
  bodyPreview: string; // Text preview
  timestamp: string;
  folder: 'inbox' | 'sent' | 'trash' | 'archive';
  isRead: boolean;
  attachments?: EmailAttachment[];
  avatar?: string;
}
