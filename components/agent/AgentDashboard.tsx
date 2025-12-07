
import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getStats, getCases, getClientById, getAgentProfile } from '../../services/mockDb';
import { CaseFile, CaseStatus } from '../../types';

interface AgentDashboardProps {
  onNewCase: () => void;
  onSkipTrace: (clientId: string) => void;
  onAuthorityHub: () => void;
  onQuickUpload: () => void;
  onInterpreter: () => void;
  onSocial: () => void;
  onProfile: () => void;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ onNewCase, onSkipTrace, onAuthorityHub, onQuickUpload, onInterpreter, onSocial, onProfile }) => {
  const stats = getStats();
  const allCases = getCases();
  const profile = getAgentProfile();
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
        <Button variant="outline" onClick={onInterpreter} className="flex items-center gap-2 border-zinc-300 hover:border-blue-500 hover:text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            AI Compliance Chat
        </Button>
        <Button variant="outline" onClick={onQuickUpload} className="flex items-center gap-2 border-zinc-300 hover:border-teal-500 hover:text-teal-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Quick Upload
        </Button>
        <Button variant="outline" onClick={onAuthorityHub} className="flex items-center gap-2 border-zinc-300 hover:border-teal-500 hover:text-teal-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Authority Hub
        </Button>
        <Button onClick={onNewCase} className="flex items-center gap-2 shadow-lg shadow-teal-500/20 bg-teal-600 hover:bg-teal-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            New Client Intake
        </Button>
      </div>

      {/* Admin Profile & Social Sync Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User ID */}
        <div className="bg-white border-l-4 border-teal-500 p-4 rounded-lg shadow-sm flex items-center justify-between border border-zinc-200 cursor-pointer hover:bg-zinc-50 transition-colors" onClick={onProfile}>
             <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-teal-100">
                    <img src={profile.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Agent Profile</p>
                    <p className="text-sm font-semibold text-zinc-800">{profile.businessName || profile.fullName}</p>
                 </div>
             </div>
             <div className="text-xs text-teal-600 font-bold uppercase">Manage Profile →</div>
        </div>

        {/* Social Sync */}
        <div className="bg-white border-l-4 border-blue-600 p-4 rounded-lg shadow-sm flex items-center justify-between border border-zinc-200 cursor-pointer hover:bg-zinc-50 transition-colors" onClick={onSocial}>
            <div>
                <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider mb-2">Marketing Hub</p>
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">f</div>
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-bold border border-zinc-200">X</div>
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold border border-pink-200">t</div>
                </div>
            </div>
            <div className="flex flex-col justify-center items-end">
                <span className="text-xs text-blue-600 font-bold uppercase">Automate Posts →</span>
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
