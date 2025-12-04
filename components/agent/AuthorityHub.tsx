
import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { getAuthorities, getCases, getClientById, addCommunicationLog } from '../../services/mockDb';
import { CaseFile, CommunicationLogEntry, AuthorityContact } from '../../types';
import { searchAuthorityWithMaps, MapSearchResult } from '../../services/geminiService';

interface AuthorityHubProps {
  onBack: () => void;
}

export const AuthorityHub: React.FC<AuthorityHubProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'compliance'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  
  // Quick Actions State
  const [quickActionCase, setQuickActionCase] = useState('');

  // Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [pendingLog, setPendingLog] = useState<Partial<CommunicationLogEntry>>({});

  // Maps Search State
  const [isSearchingMaps, setIsSearchingMaps] = useState(false);
  const [mapResult, setMapResult] = useState<MapSearchResult | null>(null);

  const authorities = getAuthorities().filter(a => 
    a.county.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const activeCases = getCases().filter(c => c.status !== 'Closed');

  // Helpers
  const getContextSubject = () => {
    if (!selectedCaseId) return '';
    const c = getCases().find(x => x.id === selectedCaseId);
    const client = c ? getClientById(c.clientId) : null;
    return `Re: Defendant ${client?.name || 'Unknown'} - Case ${client?.caseNumber || 'Unknown'}`;
  };

  const handleAction = (recipient: string, type: 'Phone' | 'Email', contactValue: string) => {
    // 1. Trigger the Action
    if (type === 'Phone') {
      window.location.href = `tel:${contactValue}`;
    } else {
      const subject = getContextSubject();
      window.location.href = `mailto:${contactValue}?subject=${encodeURIComponent(subject)}`;
    }

    // 2. Open Log Modal if a case is contextually active
    if (selectedCaseId) {
      setPendingLog({
        recipient,
        type,
        timestamp: new Date().toISOString(),
        purpose: 'General Inquiry'
      });
      setShowLogModal(true);
    }
  };

  const handleQuickAction = (action: string) => {
    if (!quickActionCase || quickActionCase === 'Select Case...') {
        alert("Please select a target case from the dropdown first.");
        return;
    }

    const confirmSend = window.confirm(`Generate and send ${action} for Case ${quickActionCase}?`);
    if (confirmSend) {
         // Pre-fill the log modal
         setPendingLog({
            recipient: 'Surety / Court',
            type: 'Filing',
            timestamp: new Date().toISOString(),
            purpose: action,
            summary: `Automated generation and dispatch of ${action} for case ${quickActionCase}.`
         });
         setShowLogModal(true);
    }
  };

  const handleAddSurety = () => {
      const name = prompt("Enter Surety Company Name:");
      if (name) {
          alert(`Surety "${name}" has been added to your partner list.`);
      }
  };

  const submitLog = () => {
    // Use selectedCaseId if available for the main context, otherwise try to find the case from quick action
    const caseIdToLog = selectedCaseId || activeCases.find(c => {
         const client = getClientById(c.clientId);
         return client?.caseNumber === quickActionCase;
    })?.id;

    if (caseIdToLog && pendingLog.recipient && pendingLog.type) {
      addCommunicationLog(caseIdToLog, {
        id: Math.random().toString(36).substr(2, 9),
        recipient: pendingLog.recipient,
        type: pendingLog.type,
        timestamp: new Date().toISOString(),
        purpose: pendingLog.purpose || 'General',
        summary: pendingLog.summary || 'No summary provided.',
        referenceId: pendingLog.referenceId
      });
    }
    setShowLogModal(false);
    setPendingLog({});
  };

  const handleMapsSearch = async () => {
    if (!searchQuery) return;
    setIsSearchingMaps(true);
    setMapResult(null);
    const result = await searchAuthorityWithMaps(searchQuery);
    setMapResult(result);
    setIsSearchingMaps(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Context Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onBack}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Button>
            <div>
                <h1 className="text-xl font-bold text-slate-800">Authority & Compliance Hub</h1>
                <p className="text-xs text-slate-500">Directory, Filing & Reporting</p>
            </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-xs font-bold uppercase text-slate-500 whitespace-nowrap">Active Context:</label>
            <select 
                className="flex-1 md:w-64 p-2 border border-slate-300 rounded text-sm bg-slate-50"
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
            >
                <option value="">-- No Case Selected --</option>
                {activeCases.map(c => {
                    const client = getClientById(c.clientId);
                    return <option key={c.id} value={c.id}>{client?.name} ({client?.caseNumber})</option>
                })}
            </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'directory' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('directory')}
        >
          County Directory
        </button>
        <button 
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'compliance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('compliance')}
        >
          Surety & Reporting
        </button>
      </div>

      {activeTab === 'directory' ? (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                    <input 
                        type="text"
                        placeholder="Search for a County (e.g. Wake, Durham)..."
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleMapsSearch()}
                    />
                    <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                {searchQuery && (
                   <Button 
                      onClick={handleMapsSearch} 
                      disabled={isSearchingMaps}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/30"
                   >
                      {isSearchingMaps ? 'Searching Maps...' : 'Search Google Maps'}
                   </Button>
                )}
            </div>

            {/* Google Maps Result Card */}
            {mapResult && (
              <Card className="bg-emerald-50/50 border-emerald-200 shadow-md">
                 <div className="flex items-center gap-3 mb-4 border-b border-emerald-100 pb-2">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                       <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    </div>
                    <h3 className="font-bold text-emerald-900">Google Maps Verified Results</h3>
                 </div>
                 <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {mapResult.text}
                 </div>
                 {mapResult.chunks && mapResult.chunks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-emerald-100">
                        <p className="text-xs font-bold text-emerald-700 uppercase mb-2">Verified Locations (Click to Open)</p>
                        <div className="flex flex-wrap gap-2">
                            {mapResult.chunks.map((chunk, i) => {
                                // Extract URI from grounding chunk (maps or web)
                                const uri = chunk.maps?.uri || chunk.web?.uri;
                                const title = chunk.maps?.title || chunk.web?.title || `Location ${i+1}`;
                                if (!uri) return null;
                                return (
                                    <a 
                                      key={i} 
                                      href={uri} 
                                      target="_blank" 
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-full text-xs hover:bg-emerald-50 transition-colors"
                                    >
                                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                       {title}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                 )}
              </Card>
            )}

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {authorities.map((auth, idx) => (
                    <Card key={idx} className="border-t-4 border-t-slate-600">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-slate-800">{auth.county} County</h3>
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">NC</span>
                        </div>
                        
                        <div className="space-y-4">
                            {/* Clerk */}
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Clerk of Court</p>
                                <div className="text-sm space-y-1">
                                    <p className="truncate text-slate-600">{auth.clerk.address}</p>
                                    <div className="flex gap-2 mt-2">
                                        <button 
                                            onClick={() => handleAction(`${auth.county} Clerk`, 'Phone', auth.clerk.phone)}
                                            className="flex-1 bg-white border border-slate-200 py-1.5 rounded text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1 text-xs font-medium"
                                        >
                                            📞 {auth.clerk.phone}
                                        </button>
                                        <button 
                                            onClick={() => handleAction(`${auth.county} Clerk`, 'Email', auth.clerk.email)}
                                            className="flex-1 bg-white border border-slate-200 py-1.5 rounded text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1 text-xs font-medium"
                                        >
                                            ✉️ Email
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Sheriff */}
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Sheriff / Jail</p>
                                <div className="text-sm space-y-1">
                                    <p className="truncate text-slate-600">{auth.sheriff.address}</p>
                                    <div className="flex gap-2 mt-2">
                                         <button 
                                            onClick={() => handleAction(`${auth.county} Sheriff`, 'Phone', auth.sheriff.phone)}
                                            className="w-full bg-white border border-slate-200 py-1.5 rounded text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1 text-xs font-medium"
                                        >
                                            📞 {auth.sheriff.phone}
                                        </button>
                                    </div>
                                </div>
                            </div>

                             {/* DA */}
                             <div className="p-3 bg-slate-50 rounded-lg">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">District Attorney</p>
                                <div className="text-sm space-y-1">
                                    <div className="flex gap-2 mt-2">
                                        <button 
                                            onClick={() => handleAction(`${auth.county} DA`, 'Phone', auth.da.phone)}
                                            className="flex-1 bg-white border border-slate-200 py-1.5 rounded text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1 text-xs font-medium"
                                        >
                                            📞 {auth.da.phone}
                                        </button>
                                        <button 
                                            onClick={() => handleAction(`${auth.county} DA`, 'Email', auth.da.email)}
                                            className="flex-1 bg-white border border-slate-200 py-1.5 rounded text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1 text-xs font-medium"
                                        >
                                            ✉️ Email
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <Card title="Surety Management">
                    <div className="space-y-4">
                        <div className="p-4 border border-blue-100 bg-blue-50 rounded-lg">
                            <h4 className="font-bold text-blue-900 mb-2">Palmetto Surety Corp.</h4>
                            <div className="text-sm space-y-1 text-blue-800">
                                <p><strong>General Agent:</strong> John Smith (919-555-0000)</p>
                                <p><strong>Underwriting:</strong> underwriting@palmetto.example</p>
                                <p><strong>Collateral Acct:</strong> accounts@palmetto.example</p>
                            </div>
                        </div>
                        <Button fullWidth variant="outline" onClick={handleAddSurety}>+ Add Surety Partner</Button>
                    </div>
                </Card>

                <Card title="Reporting & Compliance Links">
                    <div className="grid grid-cols-1 gap-4">
                        <a 
                            href="https://sbs.naic.org/solar-web/pages/public/stateServices.jsf?state=NC" 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                            <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors">
                                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">NC DOI - SBS Connect</h4>
                                <p className="text-sm text-slate-500">File Monthly Reports (NCGS 58-71-165)</p>
                            </div>
                            <svg className="w-5 h-5 text-slate-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>

                        <a 
                            href="https://portal-nc.tylertech.cloud/Portal/" 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                             <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                                <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">NC eCourts Portal (File & Serve)</h4>
                                <p className="text-sm text-slate-500">Electronic Filing System</p>
                            </div>
                             <svg className="w-5 h-5 text-slate-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                    </div>
                </Card>
            </div>

            <div className="space-y-6">
                <Card title="Quick Form Actions">
                    <p className="text-sm text-slate-500 mb-4">Send standard forms to your surety or generate filing notices.</p>
                    <div className="space-y-3">
                         <div className="p-3 bg-slate-50 rounded border border-slate-200">
                             <label className="text-xs font-bold text-slate-500 uppercase">Target Case</label>
                             <select 
                                className="w-full mt-1 p-2 bg-white border border-slate-300 rounded text-sm"
                                value={quickActionCase}
                                onChange={(e) => setQuickActionCase(e.target.value)}
                             >
                                <option>Select Case...</option>
                                {activeCases.map(c => {
                                  const client = getClientById(c.clientId);
                                  return <option key={c.id}>{client?.caseNumber || 'Unknown'}</option>
                                })}
                             </select>
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                             <Button variant="outline" className="text-xs h-10" onClick={() => handleQuickAction('POA Copy')}>Send POA Copy</Button>
                             <Button variant="outline" className="text-xs h-10" onClick={() => handleQuickAction('Notice of Surrender')}>Notice of Surrender</Button>
                             <Button variant="outline" className="text-xs h-10" onClick={() => handleQuickAction('Forfeiture Inquiry')}>Forfeiture Inquiry</Button>
                             <Button variant="outline" className="text-xs h-10" onClick={() => handleQuickAction('Premium Receipt')}>Premium Receipt</Button>
                         </div>
                    </div>
                </Card>

                <Card title="Latest Filing Logs" className="opacity-75">
                     <div className="text-sm text-slate-500 text-center py-4">
                        No recent e-filings recorded in this session.
                     </div>
                </Card>
            </div>
        </div>
      )}

      {/* Log Correspondence Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg bg-white shadow-2xl animate-scaleIn" title="Log Correspondence">
                <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-800">
                        <strong>Compliance Required:</strong> Please log the details of this interaction for the case file.
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Recipient</label>
                            <input 
                                className="w-full p-2 border border-slate-300 rounded bg-slate-100 text-slate-600" 
                                value={pendingLog.recipient} 
                                readOnly 
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                            <input 
                                className="w-full p-2 border border-slate-300 rounded bg-slate-100 text-slate-600" 
                                value={pendingLog.type} 
                                readOnly 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Purpose</label>
                         <select 
                            className="w-full p-2 border border-slate-300 rounded text-sm"
                            value={pendingLog.purpose}
                            onChange={(e) => setPendingLog({...pendingLog, purpose: e.target.value})}
                         >
                            <option>General Inquiry</option>
                            <option>Notice of Surrender</option>
                            <option>Forfeiture Status Check</option>
                            <option>Court Date Verification</option>
                            <option>Payment/Bond Issue</option>
                            <option>Filing</option>
                            <option>POA Copy</option>
                            <option>Premium Receipt</option>
                         </select>
                    </div>

                    <div>
                         <label className="text-xs font-bold text-slate-500 uppercase">Tracking ID / Reference (Optional)</label>
                         <input 
                            className="w-full p-2 border border-slate-300 rounded text-sm"
                            placeholder="e.g. eCourts Confirmation #"
                            value={pendingLog.referenceId || ''}
                            onChange={(e) => setPendingLog({...pendingLog, referenceId: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Summary</label>
                        <textarea 
                            className="w-full p-2 border border-slate-300 rounded text-sm h-24"
                            placeholder="Briefly describe the conversation or outcome..."
                            value={pendingLog.summary || ''}
                            onChange={(e) => setPendingLog({...pendingLog, summary: e.target.value})}
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <Button variant="secondary" onClick={() => setShowLogModal(false)}>Skip Log (Non-Compliant)</Button>
                        <Button onClick={submitLog}>Save Log</Button>
                    </div>
                </div>
            </Card>
        </div>
      )}
    </div>
  );
};
