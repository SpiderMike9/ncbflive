
import React, { useState, useEffect } from 'react';
import { AgentDashboard } from './components/agent/AgentDashboard';
import { AgentAI } from './components/agent/AgentAI';
import { NewCaseIntake } from './components/agent/NewCaseIntake';
import { SkipTraceHub } from './components/agent/SkipTraceHub';
import { AuthorityHub } from './components/agent/AuthorityHub';
import { QuickDocumentUpload } from './components/agent/QuickDocumentUpload';
import { Interpreter } from './components/agent/Interpreter';
import { GeoCheckIn } from './components/client/GeoCheckIn';
import { LoginScreen } from './components/auth/LoginScreen';
import { PricingScreen } from './components/auth/PricingScreen'; // New Import
import { UserRole, CheckInLog, Subscription, SubscriptionTier } from './types';
import { getCheckIns, getClientById } from './services/mockDb';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [clientLang, setClientLang] = useState<'en' | 'es'>('en');
  const [userName, setUserName] = useState<string>('Agent Smith');
  
  // Subscription State
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // Client View State
  const [activeClientId, setActiveClientId] = useState<string | undefined>(undefined);
  const [view, setView] = useState<'checkin' | 'dashboard' | 'intake' | 'skiptrace' | 'authority' | 'upload' | 'interpreter' | 'pricing'>('dashboard');
  
  // For Skip Trace view, we need to know which client we are looking at
  const [selectedCaseClientId, setSelectedCaseClientId] = useState<string | undefined>(undefined);

  // State to force re-render of recent checkins when one is added
  const [checkIns, setCheckIns] = useState<CheckInLog[]>([]);

  useEffect(() => {
    // Initial Load
    setCheckIns(getCheckIns());
    
    // Polling or Subscription mock
    const interval = setInterval(() => {
        setCheckIns([...getCheckIns()]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (userRole: UserRole, userId?: string, name?: string) => {
    setRole(userRole);
    setIsAuthenticated(true);
    if (name) setUserName(name);
    
    if (userRole === UserRole.CLIENT && userId) {
      setActiveClientId(userId);
      const client = getClientById(userId);
      if (client?.language) setClientLang(client.language);
      setView('dashboard');
    } else if (userRole === UserRole.AGENT) {
      // Logic for new agents: If no subscription, show pricing.
      
      // ADMIN BYPASS: MichaelJones skips pricing and gets Ultimate plan immediately.
      if (userId === 'MichaelJones') {
          setSubscription({
            tier: 'Ultimate',
            status: 'Active',
            startDate: new Date().toISOString(),
            aiMinutesUsed: 0,
            aiMinutesCap: -1,
            maxUsers: 999
          });
          setView('dashboard');
          return;
      }

      // Default Flow
      if (!subscription) {
          setView('pricing');
      } else {
          setView('dashboard');
      }
    }
  };

  const handlePlanSelection = (tier: SubscriptionTier) => {
    // Frictionless Provisioning Logic
    const isTrial = true; // For this flow, we default to trial signups
    const newSub: Subscription = {
        tier: tier,
        status: 'Trial',
        startDate: new Date().toISOString(),
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 Days
        aiMinutesUsed: 0,
        aiMinutesCap: tier === 'Ultimate' ? -1 : (tier === 'Standard' ? 30 : 60), // Set caps based on tier
        maxUsers: tier === 'Standard' ? 1 : (tier === 'Professional' ? 3 : 999)
    };
    setSubscription(newSub);
    setView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole(null);
    setActiveClientId(undefined);
    setView('dashboard');
    setSubscription(null); // Reset for demo purposes
    setUserName('Agent Smith');
  };

  const handleLaunchSkipTrace = (clientId: string) => {
    setSelectedCaseClientId(clientId);
    setView('skiptrace');
  };

  // Login View
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }
  
  // Pricing Gateway (Interceptors)
  if (role === UserRole.AGENT && view === 'pricing') {
      return <PricingScreen onSelectPlan={handlePlanSelection} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation Bar */}
      <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight">NC BondFlow</span>
                <span className="ml-2 text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                  {role === UserRole.AGENT ? 'AGENT PORTAL' : 'CLIENT APP'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {role === UserRole.CLIENT && (
                <button 
                  onClick={() => setClientLang(prev => prev === 'en' ? 'es' : 'en')}
                  className="text-sm font-medium hover:text-blue-400 transition-colors"
                >
                  {clientLang === 'en' ? '🇪🇸 Español' : '🇺🇸 English'}
                </button>
              )}
              
              <button 
                onClick={handleLogout}
                className="px-3 py-1 bg-red-900/50 hover:bg-red-800 rounded text-xs text-red-200 border border-red-800 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Trial Banner */}
      {role === UserRole.AGENT && subscription?.status === 'Trial' && (
        <div className="bg-indigo-600 text-white px-4 py-2 text-sm font-medium text-center relative">
            <p>
                ✨ You are on the <strong>{subscription.tier} Plan</strong> Free Trial. 
                {subscription.trialEndDate && (
                     <span className="ml-1 bg-indigo-800 px-2 py-0.5 rounded text-indigo-100">
                        {Math.ceil((new Date(subscription.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} Days Remaining
                     </span>
                )}
                <button className="ml-4 underline hover:text-indigo-200">Add Payment Method</button>
            </p>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {role === UserRole.AGENT ? (
          view === 'intake' ? (
            <NewCaseIntake 
              onCancel={() => setView('dashboard')} 
              onComplete={() => { setView('dashboard'); alert('Case Created Successfully'); }}
            />
          ) : view === 'skiptrace' && selectedCaseClientId ? (
            <SkipTraceHub 
              clientId={selectedCaseClientId}
              onBack={() => setView('dashboard')}
            />
          ) : view === 'authority' ? (
            <AuthorityHub onBack={() => setView('dashboard')} />
          ) : view === 'upload' ? (
            <QuickDocumentUpload 
              onComplete={() => { setView('dashboard'); alert("Document successfully saved to case file."); }}
              onCancel={() => setView('dashboard')}
            />
          ) : view === 'interpreter' ? (
            <Interpreter onBack={() => setView('dashboard')} subscription={subscription} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                 <div className="flex items-center justify-between">
                   <h1 className="text-2xl font-bold text-slate-800">Agent Dashboard</h1>
                   <div className="text-right">
                       <p className="text-sm font-medium text-slate-800">{userName}</p>
                       <p className="text-xs text-slate-500">{subscription?.tier} Plan ({subscription?.status})</p>
                   </div>
                 </div>
                 <AgentDashboard 
                    onNewCase={() => setView('intake')} 
                    onSkipTrace={handleLaunchSkipTrace}
                    onAuthorityHub={() => setView('authority')}
                    onQuickUpload={() => setView('upload')}
                    onInterpreter={() => setView('interpreter')}
                 />
                 
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Live Check-In Feed</h3>
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Real-time</span>
                   </div>
                   <div className="overflow-x-auto">
                     <table className="min-w-full text-sm text-left">
                       <thead className="bg-slate-50 text-slate-500 font-medium">
                         <tr>
                           <th className="px-4 py-3 rounded-tl-lg">Client</th>
                           <th className="px-4 py-3">Time</th>
                           <th className="px-4 py-3">GPS Location</th>
                           <th className="px-4 py-3">Photo Ref</th>
                           <th className="px-4 py-3 rounded-tr-lg">Status</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {checkIns.map((log) => {
                           const client = getClientById(log.clientId);
                           return (
                             <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                               <td className="px-4 py-3 font-medium flex items-center gap-2">
                                  {client && (
                                      <img src={client.photoUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                                  )}
                                  {client?.name || 'Unknown'}
                               </td>
                               <td className="px-4 py-3 text-slate-500">
                                  {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                               </td>
                               <td className="px-4 py-3 text-slate-500">
                                  {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
                               </td>
                               <td className="px-4 py-3">
                                  {log.photoData ? (
                                      <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 overflow-hidden relative group cursor-zoom-in">
                                          <img src={log.photoData} alt="CheckIn" className="w-full h-full object-cover" />
                                      </div>
                                  ) : (
                                      <span className="text-xs text-slate-300">No Img</span>
                                  )}
                               </td>
                               <td className="px-4 py-3">
                                  {log.verified ? (
                                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold inline-flex items-center gap-1">
                                          Verified
                                      </span>
                                  ) : (
                                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold inline-flex items-center gap-1 animate-pulse">
                                          Suspicious
                                      </span>
                                  )}
                               </td>
                             </tr>
                           );
                         })}
                       </tbody>
                     </table>
                   </div>
                 </div>
              </div>
              
              <div className="lg:col-span-1">
                <AgentAI />
              </div>
            </div>
          )
        ) : (
          /* Client Mobile View Simulation */
          <div className="max-w-md mx-auto">
            {view === 'dashboard' ? (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {clientLang === 'en' ? 'Welcome' : 'Bienvenido'}
                  </h2>
                  <p className="text-slate-500">
                    {clientLang === 'en' ? 'Next Court Date:' : 'Próxima Corte:'} <span className="font-semibold text-blue-600">Oct 24, 2023</span>
                  </p>
                </div>

                <div 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg shadow-blue-500/30 cursor-pointer transform transition hover:scale-[1.02]"
                  onClick={() => setView('checkin')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold mb-1">{clientLang === 'en' ? 'Check-In Now' : 'Registrarse Ahora'}</h3>
                      <p className="text-blue-100 text-sm">{clientLang === 'en' ? 'Due Today' : 'Vence Hoy'}</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                       <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                    <p className="text-slate-500 text-xs uppercase font-bold mb-1">{clientLang === 'en' ? 'Balance' : 'Saldo'}</p>
                    <p className="text-xl font-bold text-slate-900">$450.00</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                    <p className="text-slate-500 text-xs uppercase font-bold mb-1">{clientLang === 'en' ? 'Status' : 'Estado'}</p>
                    <p className="text-xl font-bold text-green-600">Active</p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <button 
                  onClick={() => setView('dashboard')}
                  className="mb-4 text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  {clientLang === 'en' ? 'Back' : 'Atrás'}
                </button>
                {activeClientId && (
                  <GeoCheckIn 
                    clientId={activeClientId} 
                    lang={clientLang}
                    onComplete={() => setView('dashboard')}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
