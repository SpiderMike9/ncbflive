import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { getClientById, getCases, getSkipTraceLogs, addSkipTraceLog } from '../../services/mockDb';
import { Client, CaseFile, SkipTraceLogEntry } from '../../types';

interface SkipTraceHubProps {
  clientId: string;
  onBack: () => void;
}

export const SkipTraceHub: React.FC<SkipTraceHubProps> = ({ clientId, onBack }) => {
  const [client, setClient] = useState<Client | undefined>();
  const [caseFile, setCaseFile] = useState<CaseFile | undefined>();
  const [logs, setLogs] = useState<SkipTraceLogEntry[]>([]);
  
  // New Log State
  const [newAction, setNewAction] = useState('');
  const [newResult, setNewResult] = useState('');

  useEffect(() => {
    const c = getClientById(clientId);
    setClient(c);
    const cf = getCases().find(x => x.clientId === clientId);
    setCaseFile(cf);
    setLogs(getSkipTraceLogs(clientId));
  }, [clientId]);

  if (!client || !caseFile) return <div>Loading...</div>;

  const handleAddLog = () => {
    if (!newAction || !newResult) return;
    const entry: SkipTraceLogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      clientId,
      timestamp: new Date().toISOString(),
      action: newAction,
      result: newResult
    };
    addSkipTraceLog(entry);
    setLogs([entry, ...logs]);
    setNewAction('');
    setNewResult('');
  };

  const openSearch = (url: string) => {
    window.open(url, '_blank');
  };

  // Helper to construct Google search URLs
  const googleSearch = (query: string) => `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
           Back to Dashboard
        </Button>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={handlePrint}>
                🖨️ Print Dossier
            </Button>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex justify-between items-center print-header">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
                {client.name} 
                <span className="text-sm bg-red-600 px-2 py-1 rounded font-bold uppercase tracking-wider">{caseFile.status}</span>
            </h1>
            <p className="text-slate-400 mt-1">DOB: {client.dob || 'Unknown'} • SSN: {client.ssn || '***-**-****'} • Case: {caseFile.id.toUpperCase()}</p>
        </div>
        <div className="text-right hidden sm:block">
            <p className="text-3xl font-bold text-red-400">${caseFile.bondAmount.toLocaleString()}</p>
            <p className="text-xs text-slate-400 uppercase">Total Liability</p>
        </div>
      </div>

      {/* The Cheat Sheet */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print-grid">
        <Card title="📍 Locations">
            <ul className="space-y-3 text-sm">
                <li className="pb-2 border-b border-slate-100">
                    <p className="text-xs text-slate-400 uppercase">Primary Residence</p>
                    <p className="font-medium">{client.address || 'N/A'}</p>
                    <p className="text-xs text-slate-500 italic">2+ Years (Verified)</p>
                </li>
                <li className="pb-2 border-b border-slate-100">
                    <p className="text-xs text-slate-400 uppercase">Employer</p>
                    <p className="font-medium">{client.employer?.name || 'Unemployed'}</p>
                    <p className="text-xs text-slate-500">{client.employer?.address}</p>
                </li>
            </ul>
        </Card>

        <Card title="📞 Contact Info">
            <ul className="space-y-3 text-sm">
                <li className="pb-2 border-b border-slate-100">
                    <p className="text-xs text-slate-400 uppercase">Mobile</p>
                    <a href={`tel:${client.phone}`} className="font-medium text-blue-600 hover:underline">{client.phone}</a>
                </li>
                <li className="pb-2 border-b border-slate-100">
                    <p className="text-xs text-slate-400 uppercase">Secondary</p>
                    <p className="font-medium">{client.secondaryPhone || 'N/A'}</p>
                </li>
                <li>
                    <p className="text-xs text-slate-400 uppercase">Email</p>
                    <p className="font-medium truncate">{client.email}</p>
                </li>
            </ul>
        </Card>

        <Card title="🚗 Vehicle & ID">
             <ul className="space-y-3 text-sm">
                <li className="pb-2 border-b border-slate-100">
                    <p className="text-xs text-slate-400 uppercase">Vehicle</p>
                    <p className="font-medium">
                        {client.vehicleInfo ? `${client.vehicleInfo.year} ${client.vehicleInfo.color} ${client.vehicleInfo.make} ${client.vehicleInfo.model}` : 'None'}
                    </p>
                    {client.vehicleInfo && <p className="font-mono text-xs bg-slate-100 p-1 rounded mt-1 inline-block">{client.vehicleInfo.plate}</p>}
                </li>
                <li>
                    <p className="text-xs text-slate-400 uppercase">Distinguishing Marks</p>
                    <p className="font-medium text-red-600">{client.identifyingMarks || 'None Recorded'}</p>
                </li>
            </ul>
        </Card>

        <Card title="🤝 Indemnitors">
            {caseFile.indemnitors.length > 0 ? (
                caseFile.indemnitors.map((ind, idx) => (
                    <div key={idx} className="text-sm mb-3 pb-2 border-b border-slate-100 last:border-0">
                        <p className="font-bold">{ind.name} <span className="font-normal text-xs text-slate-500">({ind.relation})</span></p>
                        <p className="text-blue-600">{ind.phone}</p>
                        <p className="text-slate-500 text-xs">{ind.address}</p>
                    </div>
                ))
            ) : (
                <p className="text-sm text-slate-400 italic">No indemnitors linked.</p>
            )}
        </Card>
      </div>

      {/* Automated Search Tools */}
      <div className="no-print">
          <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">One-Click Investigation Tools</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <button 
                onClick={() => openSearch('https://portal-nc.tylertech.cloud/Portal/')}
                className="p-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 text-sm font-medium transition flex flex-col items-center justify-center text-center h-24"
            >
                <span className="text-2xl mb-1">⚖️</span>
                NC eCourts
            </button>
            <button 
                onClick={() => openSearch(googleSearch('Wake County Inmate Search'))}
                className="p-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition flex flex-col items-center justify-center text-center h-24"
            >
                <span className="text-2xl mb-1">🏛️</span>
                Wake Jail
            </button>
            <button 
                onClick={() => openSearch(googleSearch('Mecklenburg County Inmate Search'))}
                className="p-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition flex flex-col items-center justify-center text-center h-24"
            >
                <span className="text-2xl mb-1">🏛️</span>
                Meck Jail
            </button>
             <button 
                onClick={() => openSearch(googleSearch(client.phone))}
                className="p-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium transition flex flex-col items-center justify-center text-center h-24"
            >
                <span className="text-2xl mb-1">📱</span>
                Reverse Phone
            </button>
             <button 
                onClick={() => openSearch(googleSearch(`${client.name} Facebook North Carolina`))}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition flex flex-col items-center justify-center text-center h-24"
            >
                <span className="text-2xl mb-1">🌐</span>
                Social Media
            </button>
            <button 
                onClick={() => openSearch(googleSearch(`${client.vehicleInfo?.plate || ''} ${client.vehicleInfo?.make || ''} owner`))}
                disabled={!client.vehicleInfo}
                className={`p-3 border rounded-lg text-sm font-medium transition flex flex-col items-center justify-center text-center h-24 ${!client.vehicleInfo ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            >
                <span className="text-2xl mb-1">🚘</span>
                Plate Search
            </button>
          </div>
      </div>

      {/* Investigation Log */}
      <Card title="Investigation Log" className="print-break-inside">
        <div className="flex gap-2 mb-4 no-print">
            <input 
                className="flex-1 p-2 border border-slate-300 rounded text-sm" 
                placeholder="Action (e.g., 'Checked Jail', 'Called Mother')..." 
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
            />
            <input 
                className="flex-1 p-2 border border-slate-300 rounded text-sm" 
                placeholder="Result / Outcome..." 
                value={newResult}
                onChange={(e) => setNewResult(e.target.value)}
            />
            <Button onClick={handleAddLog} disabled={!newAction || !newResult}>Log</Button>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500">
                    <tr>
                        <th className="p-3 rounded-tl">Time</th>
                        <th className="p-3">Action</th>
                        <th className="p-3 rounded-tr">Result</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {logs.length === 0 ? (
                        <tr><td colSpan={3} className="p-4 text-center text-slate-400 italic">No activity logged yet.</td></tr>
                    ) : (
                        logs.map(log => (
                            <tr key={log.id}>
                                <td className="p-3 text-slate-500 whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="p-3 font-medium text-slate-800">{log.action}</td>
                                <td className="p-3 text-slate-600">{log.result}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </Card>

      <style>{`
        @media print {
            .no-print { display: none !important; }
            .print-header { color: black !important; background: white !important; border: 1px solid #ccc; padding: 10px; margin-bottom: 20px; }
            .print-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            body { font-size: 12px; background: white; }
            .print-break-inside { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};