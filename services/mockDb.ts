
import { Client, CaseFile, CheckInLog, CaseStatus, SkipTraceLogEntry, AuthorityContact, CommunicationLogEntry, CaseDocument, UserRole, SocialConnection, AgentProfile, AgentMedia, MarketingPost, PaymentRecord, SystemLog, Email } from '../types';

// Seed Data
let MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Marcus Johnson',
    phone: '(919) 555-0101',
    email: 'marcus.j@example.com',
    language: 'en',
    balance: 450.00,
    nextCourtDate: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 days from now
    courtLocation: 'Wake County Justice Center',
    caseNumber: '23CR001234',
    photoUrl: 'https://picsum.photos/200',
    pin: '1234',
    dob: '1995-04-12',
    bookingNumber: 'WAKE-23-999',
    address: '123 Maple St, Raleigh, NC',
    addressHistory: [
        { address: '123 Maple St, Raleigh, NC', dateAdded: '2023-01-15T10:00:00Z', isCurrent: true, source: 'Intake' }
    ],
    vehicleInfo: {
      make: 'Honda',
      model: 'Accord',
      year: '2018',
      color: 'Silver',
      plate: 'NC-ABC1234'
    },
    identifyingMarks: 'Tattoo on right forearm (Eagle)',
    employer: {
      name: 'Raleigh Construction Co',
      phone: '(919) 555-9999',
      address: '500 Builder Way, Raleigh'
    },
    ssn: '***-**-1234',
    dlNumber: 'NC-87654321'
  },
  {
    id: 'c2',
    name: 'Elena Rodriguez',
    phone: '(704) 555-0202',
    email: 'elena.r@example.com',
    language: 'es',
    balance: 1200.00,
    nextCourtDate: new Date(Date.now() + 86400000 * 14).toISOString(),
    courtLocation: 'Mecklenburg County Courthouse',
    caseNumber: '23CR005678',
    photoUrl: 'https://picsum.photos/201',
    pin: '5678',
    dob: '1988-11-23',
    address: '456 Oak Blvd, Charlotte, NC',
    addressHistory: [
        { address: '456 Oak Blvd, Charlotte, NC', dateAdded: '2023-03-20T14:30:00Z', isCurrent: true, source: 'Intake' }
    ]
  },
  {
    id: 'client_test',
    name: 'Test Client User',
    phone: '(555) 000-0000',
    email: 'client_test_user', 
    language: 'en',
    balance: 0,
    nextCourtDate: new Date().toISOString(),
    courtLocation: 'Test Court',
    caseNumber: 'TEST-CASE-001',
    photoUrl: 'https://via.placeholder.com/150',
    pin: '1234', 
    address: 'Test Address',
    addressHistory: []
  }
];

let MOCK_CASES: CaseFile[] = [
  {
    id: 'case1',
    clientId: 'c1',
    bondAmount: 5000,
    premium: 750,
    balancePaid: 300,
    status: CaseStatus.FTA, 
    county: 'Wake',
    indemnitors: [{
      name: 'Sarah Johnson',
      relation: 'Mother',
      phone: '(919) 555-0000',
      email: 'sarah.j@example.com',
      address: '123 Maple St, Raleigh, NC',
      dob: '1970-01-01'
    }],
    notes: 'Called regarding payment plan.',
    communicationLog: [],
    documents: []
  },
  {
    id: 'case2',
    clientId: 'c2',
    bondAmount: 15000,
    premium: 2250,
    balancePaid: 1050,
    status: CaseStatus.ACTIVE,
    county: 'Mecklenburg',
    indemnitors: [],
    notes: 'Check-in consistent.',
    communicationLog: [],
    documents: []
  },
  {
    id: 'case3',
    clientId: 'c1',
    bondAmount: 1000,
    premium: 150,
    balancePaid: 150,
    status: CaseStatus.CLOSED,
    county: 'Wake',
    indemnitors: [],
    notes: 'Closed successfully.',
    communicationLog: [],
    documents: []
  }
];

let MOCK_CHECKINS: CheckInLog[] = [
  {
    id: 'chk1',
    clientId: 'c1',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    latitude: 35.7796,
    longitude: -78.6382,
    photoData: '',
    verified: true
  }
];

let MOCK_SKIPTRACE_LOGS: SkipTraceLogEntry[] = [];

let MOCK_SOCIAL_CONNECTIONS: SocialConnection[] = [
    { id: 'fb', platform: 'Facebook', isConnected: true, username: 'NCBondFlow Official', lastSync: new Date().toISOString() },
    { id: 'x', platform: 'X', isConnected: false },
    { id: 'tt', platform: 'TikTok', isConnected: false },
    { id: 'wa', platform: 'WhatsApp', isConnected: false },
    { id: 'ig', platform: 'Instagram', isConnected: false }
];

// --- AGENT DATA STORE ---
// Using an array to support multiple agents for Admin View
let MOCK_AGENTS: AgentProfile[] = [
    {
        id: 'agent-1',
        userId: 'admin',
        fullName: 'Michael Jones',
        businessName: 'NC BondFlow Bail Agents',
        businessAddress: '123 Justice Ave, Raleigh, NC 27601',
        email: 'admin@ncbondflow.com',
        phone: '(919) 555-1234',
        suretyAgency: 'Palmetto Surety Corporation',
        licenseNumber: 'NCDOI-998877',
        bio: 'Dedicated to providing fast, reliable, and professional bail bond services across Wake and Durham counties. 24/7 availability.',
        profileImageUrl: 'https://i.pravatar.cc/300?img=11',
        coverImageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1000',
        geminiApiKey: '',
        whatsAppApiKey: '',
        facebookApiKey: '',
        tiktokApiKey: '',
        updatedAt: new Date().toISOString(),
        balanceOwed: 450.00,
        totalPaid: 15000.00
    },
    {
        id: 'agent-2',
        userId: 'sarah_connor',
        fullName: 'Sarah Connor',
        businessName: 'Skynet Bail Bonds',
        businessAddress: '456 Tech Blvd, Charlotte, NC',
        email: 'sarah@skynetbail.com',
        phone: '(704) 555-9876',
        suretyAgency: 'Palmetto Surety Corporation',
        licenseNumber: 'NCDOI-112233',
        bio: 'Protecting the future, one bond at a time.',
        profileImageUrl: 'https://i.pravatar.cc/300?img=5',
        coverImageUrl: '',
        geminiApiKey: '',
        whatsAppApiKey: '',
        facebookApiKey: '',
        tiktokApiKey: '',
        updatedAt: new Date().toISOString(),
        balanceOwed: 1250.00,
        totalPaid: 5000.00
    }
];

let MOCK_AGENT_MEDIA: AgentMedia[] = [
  { id: 'm1', agentId: 'agent-1', type: 'image', url: 'https://images.unsplash.com/photo-1589829585413-56de8ae18c73?auto=format&fit=crop&q=80&w=400', createdAt: new Date().toISOString() },
  { id: 'm2', agentId: 'agent-1', type: 'image', url: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=400', createdAt: new Date().toISOString() }
];

let MOCK_MARKETING_POSTS: MarketingPost[] = [
    {
        id: 'p1',
        platform: 'Facebook',
        content: 'We are open 24/7 this holiday weekend! Don\'t let your loved ones sit in jail. Call NC BondFlow now.',
        status: 'Posted',
        scheduledFor: new Date(Date.now() - 86400000 * 2).toISOString(),
        analytics: { views: 1250, likes: 45, shares: 12 }
    },
    {
        id: 'p2',
        platform: 'TikTok',
        content: 'Know your rights! #BailBonds #LegalTips #NC',
        status: 'Scheduled',
        scheduledFor: new Date(Date.now() + 86400000).toISOString(),
        analytics: { views: 0, likes: 0, shares: 0 }
    }
];

// --- ADMIN DATA ---
let MOCK_PAYMENTS: PaymentRecord[] = [
    { id: 'pay1', agentId: 'agent-1', amount: 500.00, method: 'Stripe', status: 'Completed', timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), referenceId: 'ch_12345' },
    { id: 'pay2', agentId: 'agent-2', amount: 250.00, method: 'CashApp', status: 'Pending', timestamp: new Date().toISOString(), referenceId: '$SarahBail' }
];

let MOCK_LOGS: SystemLog[] = [
    { id: 'log1', action: 'LOGIN', adminUser: 'MichaelJones', timestamp: new Date().toISOString(), details: 'Admin Dashboard Access' }
];

// --- MOCK EMAILS ---
let MOCK_EMAILS: Email[] = [
  {
    id: 'e1',
    threadId: 't1',
    from: 'Marcus Johnson <marcus.j@example.com>',
    to: 'admin@ncbondflow.com',
    subject: 'Question about my court date',
    body: '<p>Hi Michael,</p><p>I wanted to confirm if my court date is still set for next Tuesday at 9 AM? I lost the paper.</p><p>Thanks,<br>Marcus</p>',
    bodyPreview: 'I wanted to confirm if my court date is still set for next Tuesday...',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    folder: 'inbox',
    isRead: false,
    avatar: 'https://i.pravatar.cc/150?u=marcus'
  },
  {
    id: 'e2',
    threadId: 't2',
    from: 'Palmetto Surety <support@palmettosurety.com>',
    to: 'admin@ncbondflow.com',
    subject: 'Monthly Report Received',
    body: '<p>Dear Agent,</p><p>This is an automated confirmation that we have received your monthly production report for April. No further action is required.</p>',
    bodyPreview: 'This is an automated confirmation that we have received your monthly...',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    folder: 'inbox',
    isRead: true,
    avatar: 'https://ui-avatars.com/api/?name=Palmetto+Surety&background=0D9488&color=fff'
  },
  {
    id: 'e3',
    threadId: 't3',
    from: 'admin@ncbondflow.com',
    to: 'sarah@skynetbail.com',
    subject: 'Re: Transfer Bond Inquiry',
    body: '<p>Sarah,</p><p>Yes, we can handle the transfer bond for Wake County. The fee is standard. Let me know when you send the file.</p><p>Best,<br>Michael Jones</p>',
    bodyPreview: 'Yes, we can handle the transfer bond for Wake County. The fee is...',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    folder: 'sent',
    isRead: true,
    avatar: 'https://ui-avatars.com/api/?name=Michael+Jones&background=1e293b&color=fff'
  }
];

// Mock Authority Data
const MOCK_AUTHORITIES: AuthorityContact[] = [
  {
    county: 'Wake',
    clerk: { phone: '(919) 792-4000', email: 'wake.clerk@nccourts.org', address: '316 Fayetteville St, Raleigh, NC 27601' },
    sheriff: { phone: '(919) 856-6900', address: '330 S. Salisbury St, Raleigh, NC 27601' },
    da: { phone: '(919) 792-5000', email: 'wake.da@nccourts.org' }
  },
  {
    county: 'Mecklenburg',
    clerk: { phone: '(704) 686-0400', email: 'meck.clerk@nccourts.org', address: '832 E 4th St, Charlotte, NC 28202' },
    sheriff: { phone: '(980) 314-5000', address: '700 E 4th St, Charlotte, NC 28202' },
    da: { phone: '(704) 686-0700', email: 'meck.da@nccourts.org' }
  }
];

// Service Functions
export const getClients = (): Client[] => MOCK_CLIENTS;
export const getCases = (): CaseFile[] => MOCK_CASES;
export const getCheckIns = (): CheckInLog[] => MOCK_CHECKINS;
export const getAuthorities = (): AuthorityContact[] => MOCK_AUTHORITIES;

// --- PROFILE & MEDIA API ---
export const getAgentProfile = (id?: string): AgentProfile => {
    if (id) {
        return MOCK_AGENTS.find(a => a.id === id || a.userId === id) || MOCK_AGENTS[0];
    }
    return MOCK_AGENTS[0];
};

export const getAllAgents = (): AgentProfile[] => MOCK_AGENTS;

export const updateAgentProfile = (updates: Partial<AgentProfile>) => {
    // If Admin is updating a specific agent
    if (updates.id) {
        const idx = MOCK_AGENTS.findIndex(a => a.id === updates.id);
        if (idx !== -1) {
            MOCK_AGENTS[idx] = { ...MOCK_AGENTS[idx], ...updates, updatedAt: new Date().toISOString() };
            return MOCK_AGENTS[idx];
        }
    }
    // Default to first agent if no ID (Self update)
    MOCK_AGENTS[0] = { ...MOCK_AGENTS[0], ...updates, updatedAt: new Date().toISOString() };
    return MOCK_AGENTS[0];
};

export const deleteAgent = (id: string) => {
    MOCK_AGENTS = MOCK_AGENTS.filter(a => a.id !== id);
};

export const getAgentMedia = (agentId?: string): AgentMedia[] => {
    if (agentId) return MOCK_AGENT_MEDIA.filter(m => m.agentId === agentId);
    return MOCK_AGENT_MEDIA;
};

export const uploadAgentMedia = (media: Omit<AgentMedia, 'id' | 'createdAt'>) => {
    const newMedia: AgentMedia = {
        id: Math.random().toString(36).substr(2, 9),
        ...media,
        createdAt: new Date().toISOString()
    };
    MOCK_AGENT_MEDIA.unshift(newMedia);
    return newMedia;
};

export const deleteAgentMedia = (id: string) => {
    MOCK_AGENT_MEDIA = MOCK_AGENT_MEDIA.filter(m => m.id !== id);
};

// --- ADMIN API ---
export const getPayments = () => MOCK_PAYMENTS;
export const addPayment = (payment: Omit<PaymentRecord, 'id' | 'timestamp'>) => {
    const newPayment: PaymentRecord = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        ...payment
    };
    MOCK_PAYMENTS.unshift(newPayment);
    // Update Agent Balance logic
    const agent = MOCK_AGENTS.find(a => a.id === payment.agentId);
    if (agent) {
        agent.totalPaid += payment.amount;
        agent.balanceOwed = Math.max(0, agent.balanceOwed - payment.amount);
    }
    return newPayment;
};

export const getSystemLogs = () => MOCK_LOGS;
export const addSystemLog = (log: Omit<SystemLog, 'id' | 'timestamp'>) => {
    const newLog: SystemLog = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        ...log
    };
    MOCK_LOGS.unshift(newLog);
};

// --- EMAIL API ---
export const getEmails = (folder: string = 'inbox') => {
    return MOCK_EMAILS.filter(e => e.folder === folder).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const sendEmail = (to: string, subject: string, body: string, replyToThreadId?: string) => {
    const newEmail: Email = {
        id: Math.random().toString(36).substr(2, 9),
        threadId: replyToThreadId || Math.random().toString(36).substr(2, 9),
        from: 'Michael Jones <admin@ncbondflow.com>',
        to,
        subject,
        body,
        bodyPreview: body.replace(/<[^>]*>?/gm, '').substring(0, 50) + '...',
        timestamp: new Date().toISOString(),
        folder: 'sent',
        isRead: true,
        avatar: 'https://ui-avatars.com/api/?name=Michael+Jones&background=1e293b&color=fff'
    };
    MOCK_EMAILS.unshift(newEmail);
    return newEmail;
};

export const markEmailRead = (id: string, isRead: boolean = true) => {
    const email = MOCK_EMAILS.find(e => e.id === id);
    if (email) email.isRead = isRead;
};

export const deleteEmail = (id: string) => {
    const email = MOCK_EMAILS.find(e => e.id === id);
    if (email) {
        if (email.folder === 'trash') {
            MOCK_EMAILS = MOCK_EMAILS.filter(e => e.id !== id);
        } else {
            email.folder = 'trash';
        }
    }
};

export const syncGmail = async () => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1500));
    
    // Simulate finding a new email
    const newEmail: Email = {
        id: Math.random().toString(36).substr(2, 9),
        threadId: Math.random().toString(36).substr(2, 9),
        from: 'Google Cloud Platform <google-cloud-noreply@google.com>',
        to: 'admin@ncbondflow.com',
        subject: 'Billing Alert: Usage Threshold Reached',
        body: '<p>Your cloud storage usage has exceeded 85% of your free tier limit.</p>',
        bodyPreview: 'Your cloud storage usage has exceeded 85% of your free tier limit.',
        timestamp: new Date().toISOString(),
        folder: 'inbox',
        isRead: false,
        avatar: 'https://ui-avatars.com/api/?name=GCP&background=4285F4&color=fff'
    };
    MOCK_EMAILS.unshift(newEmail);
    return newEmail;
};

// --- MARKETING API ---
export const getMarketingPosts = (): MarketingPost[] => MOCK_MARKETING_POSTS;

export const createMarketingPost = (post: Omit<MarketingPost, 'id'>) => {
    const newPost: MarketingPost = {
        id: Math.random().toString(36).substr(2, 9),
        ...post
    };
    MOCK_MARKETING_POSTS.unshift(newPost);
    return newPost;
};

// --- EXISTING HELPERS ---
export const addCheckIn = (checkIn: CheckInLog) => {
  MOCK_CHECKINS.unshift(checkIn);
};

export const getClientById = (id: string) => MOCK_CLIENTS.find(c => c.id === id);

export const createClient = (client: Client) => {
  if (!client.addressHistory && client.address) {
      client.addressHistory = [{
          address: client.address,
          dateAdded: new Date().toISOString(),
          isCurrent: true,
          source: 'Intake'
      }];
  } else if (!client.addressHistory) {
      client.addressHistory = [];
  }
  MOCK_CLIENTS.unshift(client);
  return client;
};

export const createCase = (caseFile: CaseFile) => {
  if (!caseFile.communicationLog) caseFile.communicationLog = [];
  if (!caseFile.documents) caseFile.documents = [];
  MOCK_CASES.unshift(caseFile);
  return caseFile;
};

export const addCommunicationLog = (caseId: string, log: CommunicationLogEntry) => {
  const c = MOCK_CASES.find(x => x.id === caseId);
  if (c) {
    if (!c.communicationLog) c.communicationLog = [];
    c.communicationLog.unshift(log);
  }
};

export const addDocumentToCase = (caseId: string, doc: CaseDocument) => {
  const c = MOCK_CASES.find(x => x.id === caseId);
  if (c) {
    if (!c.documents) c.documents = [];
    c.documents.unshift(doc);
  }
};

export const getStats = () => {
  return {
    activeBondsCount: MOCK_CASES.filter(c => c.status === CaseStatus.ACTIVE).length,
    totalLiability: MOCK_CASES.reduce((acc, c) => acc + c.bondAmount, 0),
    ftaCount: MOCK_CASES.filter(c => c.status === CaseStatus.FTA).length,
    checkInsDueToday: 5 // Mock number
  };
};

export const getSkipTraceLogs = (clientId: string): SkipTraceLogEntry[] => {
  return MOCK_SKIPTRACE_LOGS.filter(l => l.clientId === clientId);
};

export const addSkipTraceLog = (entry: SkipTraceLogEntry) => {
  MOCK_SKIPTRACE_LOGS.unshift(entry);
};

// --- SOCIAL MEDIA MANAGEMENT ---

export const getSocialConnections = (): SocialConnection[] => {
    return MOCK_SOCIAL_CONNECTIONS;
};

export const toggleSocialConnection = (platform: string, isConnected: boolean, username?: string) => {
    const conn = MOCK_SOCIAL_CONNECTIONS.find(c => c.platform === platform);
    if (conn) {
        conn.isConnected = isConnected;
        if (isConnected && username) conn.username = username;
        if (isConnected) conn.lastSync = new Date().toISOString();
        else conn.username = undefined;
    }
};

// --- AUTHENTICATION & USER MANAGEMENT ---

export const registerTrialAgent = (firstName: string, lastName: string, email: string) => {
  // Simulate creating a new Trial Agent in DB
  const tempPassword = Math.random().toString(36).slice(-8); // Generate secure temp password
  return {
    id: email,
    name: `${firstName} ${lastName}`,
    email: email,
    role: UserRole.TRIAL_AGENT,
    tempPassword: tempPassword
  };
};

export const authenticateUser = (type: UserRole | string, id: string, secret: string) => {
  if (type === UserRole.AGENT || type === 'AGENT' || type === UserRole.TRIAL_AGENT || type === UserRole.ADMIN) {
    // SUPER ADMIN CREDENTIALS
    if (id === 'MichaelJones' && secret === 'MikeJones1') {
        return { id: 'admin-super', name: 'Michael Jones', role: UserRole.ADMIN };
    }
    // Standard Admin
    if (id === 'admin@ncbondflow.com' && secret === 'admin123') {
        return { id: 'admin', name: 'Agent Smith', role: UserRole.AGENT };
    }
    // Simulate generic login if registered (Mock)
    if (id.includes('@') && secret.length > 5) {
       return { id: id, name: 'Trial User', role: UserRole.TRIAL_AGENT };
    }
    return null;
  } else {
    // Client Login
    const client = MOCK_CLIENTS.find(c => c.email === id || c.caseNumber === id || c.id === id);
    if (client && client.pin === secret) {
      // Force return the user with the CLIENT role to ensure router logic works
      return { ...client, role: UserRole.CLIENT };
    }
    return null;
  }
};
