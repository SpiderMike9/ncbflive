
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
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-end gap-3 flex-wrap">
        <Button variant="outline" onClick={onInterpreter} className="flex items-center gap-2 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
            AI Interpreter
        </Button>
        <Button variant="outline" onClick={onQuickUpload} className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Quick Upload / Scan
        </Button>
        <Button variant="outline" onClick={onAuthorityHub} className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Authority & Compliance
        </Button>
        <Button onClick={onNewCase} className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            New Client Intake
        </Button>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <p className="text-slate-500 text-sm font-medium uppercase">Active Bonds</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{stats.activeBondsCount}</p>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <p className="text-slate-500 text-sm font-medium uppercase">Total Liability</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">${stats.totalLiability.toLocaleString()}</p>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <p className="text-slate-500 text-sm font-medium uppercase">FTA Alerts</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{stats.ftaCount}</p>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <p className="text-slate-500 text-sm font-medium uppercase">Check-Ins Due</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{stats.checkInsDueToday}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2" title="Financial Performance & Risk">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Premium Collected" />
                <Bar dataKey="risk" fill="#ef4444" radius={[4, 4, 0, 0]} name="Bond Risk" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Action List */}
        <Card title="Priority Actions & Cases">
          <div className="mb-4">
             <input 
                type="text" 
                placeholder="Search Client or Case #" 
                className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={caseSearch}
                onChange={(e) => setCaseSearch(e.target.value)}
             />
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {filteredCases.length > 0 ? (
                filteredCases.map((c: CaseFile) => {
                const client = getClientById(c.clientId);
                return (
                <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                    <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800">{client?.name || 'Unknown'}</p>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${c.status === CaseStatus.ACTIVE ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {c.status}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500">{c.county} • ${c.bondAmount.toLocaleString()}</p>
                    </div>
                    <Button 
                        variant="outline" 
                        className="text-xs px-2 py-1 h-8"
                        onClick={() => onSkipTrace(c.clientId)}
                    >
                        {c.status === CaseStatus.FTA ? '🕵️ Skip Trace' : 'View File'}
                    </Button>
                </div>
                )})
            ) : (
                <p className="text-sm text-slate-500 text-center py-4">No cases found matching "{caseSearch}".</p>
            )}
            
            <Button 
                variant="outline" 
                fullWidth 
                className="mt-2 text-sm"
                onClick={() => alert("Full Case Registry functionality coming in production release.")}
            >
                View All Cases
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};