
import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getStats, getCases, getClientById } from '../../services/mockDb';
import { CaseFile, CaseStatus } from '../../types';

interface AgentDashboardProps {
  onNewCase: () => void;
  onSkipTrace: (clientId: string) => void;
  onAuthorityHub: () => void;
  onQuickUpload: () => void;
  onInterpreter: () => void;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ onNewCase, onSkipTrace, onAuthorityHub, onQuickUpload, onInterpreter }) => {
  const stats = getStats();
  const allCases = getCases();
  const [caseSearch, setCaseSearch] = useState('');

  const data = [
    { name: 'Mon', revenue: 4000, risk: 2400 },
    { name: 'Tue', revenue: 3000, risk: 1398 },
    { name: 'Wed', revenue: 2000, risk: 9800 },
    { name: 'Thu', revenue: 2780, risk: 3908 },
    { name: 'Fri', revenue: 1890, risk: 4800 },
    { name: 'Sat', revenue: 2390, risk: 3800 },
    { name: 'Sun', revenue: 3490, risk: 4300 },
  ];

  const filteredCases = allCases.filter(c => {
    const client = getClientById(c.clientId);
    const searchLower = caseSearch.toLowerCase();
    return (
        (client?.name.toLowerCase() || '').includes(searchLower) ||
        (client?.caseNumber.toLowerCase() || '').includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Actions */}
      <div className="flex justify-end gap-3 flex-wrap">
        <Button variant="outline" onClick={onInterpreter} className="flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
            AI Interpreter
        </Button>
        <Button variant="outline" onClick={onQuickUpload} className="flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Quick Upload
        </Button>
        <Button variant="outline" onClick={onAuthorityHub} className="flex items-center gap-2">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Authority Hub
        </Button>
        <Button onClick={onNewCase} className="flex items-center gap-2 shadow-teal-500/20">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            New Client Intake
        </Button>
      </div>

      {/* Admin Profile & Social Sync Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User ID */}
        <div className="bg-white border-l-4 border-teal-500 p-4 rounded-lg shadow-sm flex items-center justify-between border border-zinc-200">
             <div className="flex items-center gap-3">
                 <div className="bg-teal-50 p-2 rounded-lg text-teal-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                 </div>
                 <div>
                    <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Current Admin User</p>
                    <p className="text-sm font-semibold text-zinc-800">ID: <span className="font-mono text-teal-700 bg-teal-50 px-1 rounded">admin@ncbondflow.com</span></p>
                 </div>
             </div>
             <div className="text-xs text-zinc-400 flex items-center gap-1">
                <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Session Secure
             </div>
        </div>

        {/* Social Sync */}
        <div className="bg-white border-l-4 border-blue-600 p-4 rounded-lg shadow-sm flex items-center justify-between border border-zinc-200">
            <div>
                <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider mb-2">Social Profile Sync</p>
                <div className="flex gap-3">
                    {/* Google - Synced */}
                    <div className="relative group cursor-pointer" title="Google: Connected">
                        <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm hover:border-blue-500 transition-colors">
                           <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        </div>
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>

                    {/* Facebook - Pending */}
                    <div className="relative group cursor-pointer" title="Facebook: Connect">
                        <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm hover:border-blue-700 hover:text-blue-700 text-zinc-400 transition-colors">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </div>
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-zinc-300 border-2 border-white rounded-full"></span>
                    </div>

                    {/* X (Twitter) - Pending */}
                    <div className="relative group cursor-pointer" title="X: Connect">
                         <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm hover:border-black hover:text-black text-zinc-400 transition-colors">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </div>
                         <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-zinc-300 border-2 border-white rounded-full"></span>
                    </div>

                    {/* TikTok - Pending */}
                    <div className="relative group cursor-pointer" title="TikTok: Connect">
                         <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm hover:border-pink-500 hover:text-pink-500 text-zinc-400 transition-colors">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-2.5 0-3.76 1.24-5.1 3.03l.96.55c.97-1.31 1.78-1.99 3.05-1.99.73 0 1.21.36 1.44.82-.76.12-1.63.38-2.48.88-2.18 1.3-3.15 3.43-3.15 5.56 0 2.29 1.56 4.38 4.67 4.38 3.04 0 5.09-2.04 5.09-5.41V4.87c.01-.29.23-.53.53-.53h2.62c-.02 1.57.51 3.02 1.49 4.19l.26.29V5.13c-1.25-1.04-2.01-2.56-2.01-4.22V.53c0-.29-.23-.53-.53-.53h-3.32c-.28.01-.51.25-.51.52z"/></svg>
                        </div>
                         <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-zinc-300 border-2 border-white rounded-full"></span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col justify-center items-end">
                <Button variant="outline" className="text-xs h-8">Manage Connections</Button>
            </div>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-0 border-l-4 border-l-blue-500" noPadding>
          <div className="p-4">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wide">Active Bonds</p>
            <p className="text-2xl font-bold text-zinc-900 mt-1">{stats.activeBondsCount}</p>
          </div>
        </Card>
        <Card className="border-t-0 border-l-4 border-l-red-500" noPadding>
          <div className="p-4">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wide">Total Liability</p>
            <p className="text-2xl font-bold text-zinc-900 mt-1">${stats.totalLiability.toLocaleString()}</p>
          </div>
        </Card>
        <Card className="border-t-0 border-l-4 border-l-orange-500" noPadding>
          <div className="p-4">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wide">FTA Alerts</p>
            <p className="text-2xl font-bold text-zinc-900 mt-1">{stats.ftaCount}</p>
          </div>
        </Card>
        <Card className="border-t-0 border-l-4 border-l-emerald-500" noPadding>
          <div className="p-4">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-wide">Check-Ins Due</p>
            <p className="text-2xl font-bold text-zinc-900 mt-1">{stats.checkInsDueToday}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2 border-t-4 border-t-teal-500" title="Financial Performance">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f4f4f5'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Bar dataKey="revenue" fill="#0d9488" radius={[4, 4, 0, 0]} name="Premium Collected" />
                <Bar dataKey="risk" fill="#ef4444" radius={[4, 4, 0, 0]} name="Bond Risk" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Action List */}
        <Card title="Priority Actions">
          <div className="mb-4">
             <input 
                type="text" 
                placeholder="Search Client or Case #" 
                className="w-full p-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-zinc-50"
                value={caseSearch}
                onChange={(e) => setCaseSearch(e.target.value)}
             />
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredCases.length > 0 ? (
                filteredCases.map((c: CaseFile) => {
                const client = getClientById(c.clientId);
                return (
                <div key={c.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-zinc-100 shadow-sm hover:border-teal-200 transition-colors">
                    <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-zinc-800">{client?.name || 'Unknown'}</p>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${c.status === CaseStatus.ACTIVE ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                            {c.status}
                        </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{c.county} • ${c.bondAmount.toLocaleString()}</p>
                    </div>
                    <Button 
                        variant="outline" 
                        className="text-xs px-2 py-1 h-8"
                        onClick={() => onSkipTrace(c.clientId)}
                    >
                        {c.status === CaseStatus.FTA ? 'Skip Trace' : 'View'}
                    </Button>
                </div>
                )})
            ) : (
                <p className="text-sm text-zinc-400 text-center py-4">No matching cases.</p>
            )}
            
            <Button 
                variant="outline" 
                fullWidth 
                className="mt-2 text-sm text-zinc-400"
                onClick={() => alert("Full Registry coming soon.")}
            >
                View All Cases
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
