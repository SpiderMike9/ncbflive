
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
    getAllAgents, updateAgentProfile, deleteAgent, 
    getPayments, addPayment, getSystemLogs, addSystemLog,
    getAgentMedia, deleteAgentMedia, getSocialConnections
} from '../../services/mockDb';
import { AgentProfile, PaymentRecord, SystemLog, AgentMedia } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AdminEmailInbox } from './AdminEmailInbox';

export const AdminPortal: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'agents' | 'finance' | 'media' | 'settings' | 'email'>('dashboard');
  const [agents, setAgents] = useState<AgentProfile[]>(getAllAgents());
  const [payments, setPayments] = useState<PaymentRecord[]>(getPayments());
  const [logs, setLogs] = useState<SystemLog[]>(getSystemLogs());
  const [media, setMedia] = useState<AgentMedia[]>(getAgentMedia());

  // Edit State
  const [editingAgent, setEditingAgent] = useState<AgentProfile | null>(null);

  useEffect(() => {
    // Refresh data on mount or view change
    setAgents(getAllAgents());
    setPayments(getPayments());
    setLogs(getSystemLogs());
    setMedia(getAgentMedia());
  }, [activeView]);

  const handleEditAgent = (agent: AgentProfile) => {
    setEditingAgent({ ...agent });
  };

  const handleSaveAgent = () => {
    if (editingAgent) {
        updateAgentProfile(editingAgent);
        addSystemLog({ 
            action: 'UPDATE_PROFILE', 
            adminUser: 'MichaelJones', 
            targetId: editingAgent.id, 
            details: `Updated profile for ${editingAgent.fullName}` 
        });
        setAgents(getAllAgents());
        setEditingAgent(null);
        alert("Agent profile updated.");
    }
  };

  const handleDeleteAgent = (id: string) => {
      if (confirm("CRITICAL: Are you sure you want to delete this agent? This cannot be undone.")) {
          deleteAgent(id);
          addSystemLog({ 
            action: 'DELETE_AGENT', 
            adminUser: 'MichaelJones', 
            targetId: id, 
            details: `Deleted agent account ${id}` 
          });
          setAgents(getAllAgents());
      }
  };

  // --- VIEWS ---

  const DashboardView = () => (
      <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card noPadding className="border-l-4 border-blue-600 p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase">Total Agents</p>
                  <p className="text-3xl font-bold text-slate-800">{agents.length}</p>
              </Card>
              <Card noPadding className="border-l-4 border-green-600 p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-slate-800">${payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</p>
              </Card>
              <Card noPadding className="border-l-4 border-purple-600 p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase">Media Uploads</p>
                  <p className="text-3xl font-bold text-slate-800">{media.length}</p>
              </Card>
              <Card noPadding className="border-l-4 border-orange-600 p-4">
                  <p className="text-xs font-bold text-slate-400 uppercase">System Alerts</p>
                  <p className="text-3xl font-bold text-slate-800">0</p>
              </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card title="Revenue Overview" className="lg:col-span-2 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={payments}>
                          <XAxis dataKey="method" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="amount" fill="#3b82f6" radius={[4,4,0,0]} />
                      </BarChart>
                  </ResponsiveContainer>
              </Card>
              <Card title="System Logs" className="lg:col-span-1 h-[300px] overflow-y-auto">
                  <div className="space-y-2">
                      {logs.map(log => (
                          <div key={log.id} className="text-xs p-2 border-b border-slate-100">
                              <span className="font-bold text-slate-700">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                              <span className="ml-2 text-slate-600">{log.details}</span>
                          </div>
                      ))}
                  </div>
              </Card>
          </div>
      </div>
  );

  const AgentsView = () => (
      <div className="space-y-6 animate-fadeIn">
          {editingAgent ? (
              <Card title={`Editing: ${editingAgent.fullName}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                          <input className="w-full p-2 border border-slate-300 rounded" value={editingAgent.fullName} onChange={e => setEditingAgent({...editingAgent, fullName: e.target.value})} />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Business Name</label>
                          <input className="w-full p-2 border border-slate-300 rounded" value={editingAgent.businessName} onChange={e => setEditingAgent({...editingAgent, businessName: e.target.value})} />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Email (Login)</label>
                          <input className="w-full p-2 border border-slate-300 rounded" value={editingAgent.email} onChange={e => setEditingAgent({...editingAgent, email: e.target.value})} />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">License #</label>
                          <input className="w-full p-2 border border-slate-300 rounded" value={editingAgent.licenseNumber} onChange={e => setEditingAgent({...editingAgent, licenseNumber: e.target.value})} />
                      </div>
                      <div className="md:col-span-2 border-t border-slate-200 pt-4 mt-2">
                          <h4 className="text-sm font-bold text-slate-800 mb-2">API Configuration (Super Admin Override)</h4>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-xs font-bold text-slate-500">Gemini API Key</label>
                                  <input type="password" className="w-full p-2 border border-slate-300 rounded font-mono text-sm" value={editingAgent.geminiApiKey} onChange={e => setEditingAgent({...editingAgent, geminiApiKey: e.target.value})} />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-slate-500">Stripe Secret Key</label>
                                  <input type="password" className="w-full p-2 border border-slate-300 rounded font-mono text-sm" value={editingAgent.stripeSecretKey || ''} onChange={e => setEditingAgent({...editingAgent, stripeSecretKey: e.target.value})} />
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setEditingAgent(null)}>Cancel</Button>
                      <Button onClick={handleSaveAgent} className="bg-green-600 hover:bg-green-700">Save Changes</Button>
                  </div>
              </Card>
          ) : (
            <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                        <tr>
                            <th className="p-4">Agent Name</th>
                            <th className="p-4">Business</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {agents.map(agent => (
                            <tr key={agent.id} className="hover:bg-slate-50">
                                <td className="p-4 font-medium text-slate-900">{agent.fullName}<br/><span className="text-slate-500 text-xs font-normal">{agent.email}</span></td>
                                <td className="p-4 text-slate-600">{agent.businessName}</td>
                                <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Active</span></td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    <Button variant="outline" className="h-8 text-xs px-2" onClick={() => handleEditAgent(agent)}>Edit Profile</Button>
                                    <Button variant="danger" className="h-8 text-xs px-2" onClick={() => handleDeleteAgent(agent.id)}>Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          )}
      </div>
  );

  const FinanceView = () => {
      const [amount, setAmount] = useState('');
      const [method, setMethod] = useState<'Stripe' | 'CashApp' | 'Manual'>('Stripe');
      const [targetAgent, setTargetAgent] = useState(agents[0]?.id || '');

      const handleCapturePayment = () => {
          if (!amount || !targetAgent) return;
          addPayment({
              agentId: targetAgent,
              amount: Number(amount),
              method,
              status: 'Completed',
              referenceId: `REF-${Math.random().toString(36).substr(2,6).toUpperCase()}`
          });
          setPayments(getPayments());
          setAmount('');
          alert("Payment Captured Successfully");
      };

      const selectedAgentProfile = agents.find(a => a.id === targetAgent);

      return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
              <Card title="Capture Payment">
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Select Agent</label>
                          <select className="w-full p-2 border border-slate-300 rounded" value={targetAgent} onChange={e => setTargetAgent(e.target.value)}>
                              {agents.map(a => <option key={a.id} value={a.id}>{a.fullName} ({a.businessName})</option>)}
                          </select>
                      </div>
                      <div>
                           <label className="text-xs font-bold text-slate-500 uppercase">Payment Method</label>
                           <div className="flex gap-2 mt-1">
                               {['Stripe', 'CashApp', 'Manual'].map(m => (
                                   <button 
                                      key={m} 
                                      onClick={() => setMethod(m as any)}
                                      className={`flex-1 py-2 rounded border text-sm font-bold ${method === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300'}`}
                                   >
                                       {m}
                                   </button>
                               ))}
                           </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Amount ($)</label>
                          <input type="number" className="w-full p-2 border border-slate-300 rounded font-mono text-lg" value={amount} onChange={e => setAmount(e.target.value)} />
                      </div>
                      <Button fullWidth onClick={handleCapturePayment} className="bg-green-600 hover:bg-green-700 h-12 text-lg">Process Payment</Button>
                  </div>
              </Card>

              <Card title="Balance Calculator">
                  {selectedAgentProfile ? (
                       <div className="space-y-4">
                           <div className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-200">
                               <span className="text-slate-600 font-medium">Total Owed</span>
                               <span className="text-xl font-bold text-slate-900">${selectedAgentProfile.balanceOwed.toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-200">
                               <span className="text-slate-600 font-medium">Total Paid</span>
                               <span className="text-xl font-bold text-green-600">${selectedAgentProfile.totalPaid.toFixed(2)}</span>
                           </div>
                           <div className="border-t border-slate-200 pt-4">
                               <div className="flex justify-between items-center">
                                   <span className="text-lg font-bold text-slate-800">Net Balance</span>
                                   <span className={`text-2xl font-bold ${selectedAgentProfile.balanceOwed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                       ${Math.max(0, selectedAgentProfile.balanceOwed).toFixed(2)}
                                   </span>
                               </div>
                           </div>
                       </div>
                  ) : (
                      <p className="text-slate-400 italic">Select an agent to view balance.</p>
                  )}
              </Card>

              <Card title="Recent Transactions" className="lg:col-span-2">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                          <tr><th>ID</th><th>Agent</th><th>Method</th><th>Amount</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                          {payments.map(p => {
                              const ag = agents.find(a => a.id === p.agentId);
                              return (
                                  <tr key={p.id} className="border-b border-slate-50 last:border-0">
                                      <td className="p-3 font-mono text-xs">{p.id}</td>
                                      <td className="p-3 font-bold">{ag?.fullName || 'Unknown'}</td>
                                      <td className="p-3">{p.method}</td>
                                      <td className="p-3 font-mono">${p.amount.toFixed(2)}</td>
                                      <td className="p-3"><span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">{p.status}</span></td>
                                  </tr>
                              )
                          })}
                      </tbody>
                  </table>
              </Card>
          </div>
      );
  };

  const MediaView = () => (
      <div className="animate-fadeIn">
          <div className="bg-white p-4 rounded-lg shadow border border-slate-200 mb-6 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Global Media Manager ({media.length} Files)</h2>
              <Button variant="danger" className="text-xs" onClick={() => { if(confirm("Nuke all media?")) { alert("Simulated: All media deleted."); setMedia([]); } }}>Delete All</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {media.map(m => (
                  <div key={m.id} className="relative group bg-slate-100 rounded-lg overflow-hidden aspect-square border border-slate-200 shadow-sm">
                      {m.type === 'image' ? (
                          <img src={m.url} className="w-full h-full object-cover" />
                      ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800 text-white font-bold">VIDEO</div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          <span className="text-xs text-white font-mono">ID: {m.id}</span>
                          <button onClick={() => { deleteAgentMedia(m.id); setMedia(getAgentMedia()); }} className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700">Delete</button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col md:flex-row">
       {/* Sidebar */}
       <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col h-auto md:h-screen sticky top-0">
           <div className="p-6 border-b border-slate-800">
               <h1 className="text-xl font-bold tracking-tight">BondFlow Admin</h1>
               <p className="text-xs text-slate-400 mt-1">Super User: Michael Jones</p>
           </div>
           
           <nav className="flex-1 p-4 space-y-2">
               {[
                   { id: 'dashboard', label: 'Dashboard Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                   { id: 'agents', label: 'Agent Management', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                   { id: 'finance', label: 'Financial Center', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                   { id: 'email', label: 'Admin Mail', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                   { id: 'media', label: 'Media Control', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
                   { id: 'settings', label: 'Global Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
               ].map(item => (
                   <button 
                      key={item.id}
                      onClick={() => setActiveView(item.id as any)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeView === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                   >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                       <span className="font-medium text-sm">{item.label}</span>
                   </button>
               ))}
           </nav>

           <div className="p-4 border-t border-slate-800">
               <button onClick={onLogout} className="w-full flex items-center gap-2 justify-center bg-red-900/30 text-red-400 py-2 rounded border border-red-900/50 hover:bg-red-900/50 transition-colors text-sm font-bold">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                   Secure Logout
               </button>
           </div>
       </aside>

       {/* Main Content Area */}
       <main className="flex-1 flex flex-col h-screen overflow-hidden">
           {/* Top Nav */}
           <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
               <div className="flex items-center gap-2 text-sm text-slate-500">
                   <span className="font-bold text-slate-800">Admin Portal</span>
                   <span>/</span>
                   <span className="capitalize">{activeView}</span>
               </div>
               <div className="flex items-center gap-4">
                   <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full uppercase tracking-wider">System Online</span>
                   <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xs">MJ</div>
               </div>
           </header>

           {/* Scrollable Content */}
           <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
               {activeView === 'dashboard' && <DashboardView />}
               {activeView === 'agents' && <AgentsView />}
               {activeView === 'finance' && <FinanceView />}
               {activeView === 'media' && <MediaView />}
               {activeView === 'email' && <AdminEmailInbox />}
               {activeView === 'settings' && (
                   <Card title="Global System Settings">
                       <p className="text-sm text-slate-500 mb-4">Control global flags and features for the NC BondFlow platform.</p>
                       <div className="space-y-4">
                           <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                               <span className="font-bold text-slate-700">Maintenance Mode</span>
                               <input type="checkbox" className="w-5 h-5 text-blue-600" />
                           </div>
                           <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                               <span className="font-bold text-slate-700">Disable New Registrations</span>
                               <input type="checkbox" className="w-5 h-5 text-blue-600" />
                           </div>
                           <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                               <span className="font-bold text-slate-700">Force Global API Key Refresh</span>
                               <Button variant="outline" className="text-xs h-8">Execute</Button>
                           </div>
                       </div>
                   </Card>
               )}
           </div>

           {/* Bottom Nav (Action Bar) */}
           <footer className="h-14 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0">
               <Button variant="outline" className="text-xs h-8" onClick={() => alert("Previous")}>Previous Section</Button>
               <span className="text-xs text-slate-400 font-mono">v2.4.0-ADMIN-BUILD</span>
               <Button variant="primary" className="text-xs h-8 bg-slate-900 text-white" onClick={() => alert("Next")}>Next Section</Button>
           </footer>
       </main>
    </div>
  );
};
