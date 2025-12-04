
import { Client, CaseFile, CheckInLog, CaseStatus, SkipTraceLogEntry, AuthorityContact, CommunicationLogEntry, CaseDocument } from '../types';

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
    dob: '1988-11-23'
  }
];

let MOCK_CASES: CaseFile[] = [
  {
    id: 'case1',
    clientId: 'c1',
    bondAmount: 5000,
    premium: 750,
    balancePaid: 300,
    status: CaseStatus.FTA, // Changed to FTA for Skip Trace Demo
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
  },
  {
    county: 'Durham',
    clerk: { phone: '(919) 808-3000', email: 'durham.clerk@nccourts.org', address: '510 S Dillard St, Durham, NC 27701' },
    sheriff: { phone: '(919) 560-0897', address: '510 S Dillard St, Durham, NC 27701' },
    da: { phone: '(919) 808-3010', email: 'durham.da@nccourts.org' }
  },
  {
    county: 'Guilford',
    clerk: { phone: '(336) 412-7300', email: 'guilford.clerk@nccourts.org', address: '201 S Eugene St, Greensboro, NC 27401' },
    sheriff: { phone: '(336) 641-3690', address: '400 W Washington St, Greensboro, NC 27401' },
    da: { phone: '(336) 412-7600', email: 'guilford.da@nccourts.org' }
  }
];

// Service Functions
export const getClients = (): Client[] => MOCK_CLIENTS;
export const getCases = (): CaseFile[] => MOCK_CASES;
export const getCheckIns = (): CheckInLog[] => MOCK_CHECKINS;
export const getAuthorities = (): AuthorityContact[] => MOCK_AUTHORITIES;

export const addCheckIn = (checkIn: CheckInLog) => {
  MOCK_CHECKINS.unshift(checkIn);
};

export const getClientById = (id: string) => MOCK_CLIENTS.find(c => c.id === id);

export const createClient = (client: Client) => {
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

// Skip Trace Services
export const getSkipTraceLogs = (clientId: string): SkipTraceLogEntry[] => {
  return MOCK_SKIPTRACE_LOGS.filter(l => l.clientId === clientId);
};

export const addSkipTraceLog = (entry: SkipTraceLogEntry) => {
  MOCK_SKIPTRACE_LOGS.unshift(entry);
};

// Mock Authentication
export const authenticateUser = (type: 'AGENT' | 'CLIENT', id: string, secret: string) => {
  if (type === 'AGENT') {
    // Standard Admin
    if (id === 'admin@ncbondflow.com' && secret === 'admin123') {
        return { id: 'admin', name: 'Agent Smith', role: 'AGENT' };
    }
    // New Admin MichaelJones (Pricing Bypass)
    if (id === 'MichaelJones' && secret === 'MikeJones1') {
        return { id: 'MichaelJones', name: 'Michael Jones', role: 'ADMIN' };
    }
    return null;
  } else {
    // Check by Email OR Case Number (to support legacy/demo flow)
    const client = MOCK_CLIENTS.find(c => c.email === id || c.caseNumber === id || c.id === id);
    if (client && client.pin === secret) {
      return client;
    }
    return null;
  }
};
