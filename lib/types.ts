
export enum UserRole {
  AGENT = 'AGENT',
  CLIENT = 'CLIENT',
  TRIAL_AGENT = 'TRIAL_AGENT',
  ADMIN = 'ADMIN'
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
  aiMinutesCap: number;
  maxUsers: number;
}

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
  url: string;
  duration?: number;
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
  body: string;
  bodyPreview: string;
  timestamp: string;
  folder: 'inbox' | 'sent' | 'trash' | 'archive';
  isRead: boolean;
  attachments?: EmailAttachment[];
  avatar?: string;
}
