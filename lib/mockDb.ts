
import { UserRole, AgentProfile, AgentMedia, SocialConnection, MarketingPost, PaymentRecord, SystemLog, Email } from './types';

// --- DATA STORES ---

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
        bio: 'Dedicated to providing fast, reliable, and professional bail bond services across Wake and Durham counties.',
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

let MOCK_SOCIAL_CONNECTIONS: SocialConnection[] = [
    { id: 'fb', platform: 'Facebook', isConnected: true, username: 'NCBondFlow Official', lastSync: new Date().toISOString() },
    { id: 'x', platform: 'X', isConnected: false },
    { id: 'tt', platform: 'TikTok', isConnected: false },
    { id: 'wa', platform: 'WhatsApp', isConnected: false },
    { id: 'ig', platform: 'Instagram', isConnected: false }
];

let MOCK_MARKETING_POSTS: MarketingPost[] = [
    {
        id: 'p1',
        platform: 'Facebook',
        content: 'We are open 24/7 this holiday weekend! Call NC BondFlow now.',
        status: 'Posted',
        scheduledFor: new Date(Date.now() - 86400000 * 2).toISOString(),
        analytics: { views: 1250, likes: 45, shares: 12 }
    }
];

let MOCK_PAYMENTS: PaymentRecord[] = [
    { id: 'pay1', agentId: 'agent-1', amount: 500.00, method: 'Stripe', status: 'Completed', timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), referenceId: 'ch_12345' }
];

let MOCK_LOGS: SystemLog[] = [
    { id: 'log1', action: 'LOGIN', adminUser: 'MichaelJones', timestamp: new Date().toISOString(), details: 'Admin Dashboard Access' }
];

let MOCK_EMAILS: Email[] = [
  {
    id: 'e1',
    threadId: 't1',
    from: 'Marcus Johnson <marcus.j@example.com>',
    to: 'admin@ncbondflow.com',
    subject: 'Question about my court date',
    body: '<p>Hi Michael,</p><p>I wanted to confirm if my court date is still set for next Tuesday at 9 AM?</p>',
    bodyPreview: 'I wanted to confirm if my court date is still set for next Tuesday...',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    folder: 'inbox',
    isRead: false,
    avatar: 'https://i.pravatar.cc/150?u=marcus'
  }
];

// --- EXPORTED FUNCTIONS ---

// Auth
export const authenticateUser = (id: string, secret: string) => {
    // Admin
    if (id === 'MichaelJones' && secret === 'MikeJones1') {
        return { id: 'admin-super', name: 'Michael Jones', role: UserRole.ADMIN };
    }
    // Agent
    if (id === 'admin@ncbondflow.com' && secret === 'admin123') {
        return { id: 'agent-1', name: 'Agent Smith', role: UserRole.AGENT };
    }
    return null;
};

// Agents
export const getAllAgents = () => MOCK_AGENTS;
export const getAgentProfile = (id?: string) => MOCK_AGENTS.find(a => a.id === id || a.userId === id) || MOCK_AGENTS[0];
export const updateAgentProfile = (updates: Partial<AgentProfile>) => {
    const idx = MOCK_AGENTS.findIndex(a => a.id === updates.id);
    if (idx !== -1) {
        MOCK_AGENTS[idx] = { ...MOCK_AGENTS[idx], ...updates, updatedAt: new Date().toISOString() };
    } else {
        // Fallback for demo single agent
        MOCK_AGENTS[0] = { ...MOCK_AGENTS[0], ...updates, updatedAt: new Date().toISOString() };
    }
};
export const deleteAgent = (id: string) => { MOCK_AGENTS = MOCK_AGENTS.filter(a => a.id !== id); };

// Media
export const getAgentMedia = (agentId?: string) => agentId ? MOCK_AGENT_MEDIA.filter(m => m.agentId === agentId) : MOCK_AGENT_MEDIA;
export const uploadAgentMedia = (media: Omit<AgentMedia, 'id'|'createdAt'>) => {
    const newMedia = { id: Math.random().toString(36).substr(2,9), ...media, createdAt: new Date().toISOString() };
    MOCK_AGENT_MEDIA.unshift(newMedia);
    return newMedia;
};
export const deleteAgentMedia = (id: string) => { MOCK_AGENT_MEDIA = MOCK_AGENT_MEDIA.filter(m => m.id !== id); };

// Social
export const getSocialConnections = () => MOCK_SOCIAL_CONNECTIONS;
export const toggleSocialConnection = (platform: string, isConnected: boolean, username?: string) => {
    const conn = MOCK_SOCIAL_CONNECTIONS.find(c => c.platform === platform);
    if (conn) {
        conn.isConnected = isConnected;
        if(isConnected) { conn.username = username; conn.lastSync = new Date().toISOString(); }
    }
};
export const getMarketingPosts = () => MOCK_MARKETING_POSTS;
export const createMarketingPost = (post: Omit<MarketingPost, 'id'>) => {
    const newPost = { id: Math.random().toString(36).substr(2,9), ...post };
    MOCK_MARKETING_POSTS.unshift(newPost);
    return newPost;
};

// Admin
export const getPayments = () => MOCK_PAYMENTS;
export const addPayment = (p: Omit<PaymentRecord, 'id'|'timestamp'>) => {
    const newP = { id: Math.random().toString(36).substr(2,9), ...p, timestamp: new Date().toISOString() };
    MOCK_PAYMENTS.unshift(newP);
    const agent = MOCK_AGENTS.find(a => a.id === p.agentId);
    if(agent) { agent.totalPaid += p.amount; agent.balanceOwed -= p.amount; }
};
export const getSystemLogs = () => MOCK_LOGS;
export const addSystemLog = (l: Omit<SystemLog, 'id'|'timestamp'>) => MOCK_LOGS.unshift({ id: Math.random().toString(36).substr(2,9), ...l, timestamp: new Date().toISOString() });

// Email
export const getEmails = (folder: string) => MOCK_EMAILS.filter(e => e.folder === folder);
export const sendEmail = (to: string, subject: string, body: string) => {
    MOCK_EMAILS.unshift({
        id: Math.random().toString(36).substr(2,9),
        threadId: Math.random().toString(36).substr(2,9),
        from: 'admin@ncbondflow.com',
        to, subject, body, bodyPreview: body.substring(0,50),
        timestamp: new Date().toISOString(),
        folder: 'sent', isRead: true, avatar: 'https://ui-avatars.com/api/?name=Admin'
    });
};
export const deleteEmail = (id: string) => {
    const e = MOCK_EMAILS.find(x => x.id === id);
    if(e) e.folder = 'trash';
};
