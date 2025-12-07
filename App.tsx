
import React, { useState, useEffect } from 'react';
import { AgentDashboard } from './components/agent/AgentDashboard';
import { NewCaseIntake } from './components/agent/NewCaseIntake';
import { SkipTraceHub } from './components/agent/SkipTraceHub';
import { AuthorityHub } from './components/agent/AuthorityHub';
import { QuickDocumentUpload } from './components/agent/QuickDocumentUpload';
import { SocialMediaManager } from './components/agent/SocialMediaManager'; // Keeps legacy ref if needed, but replaced by MarketingHub mostly
import { MarketingHub } from './components/agent/MarketingHub';
import { AgentProfilePortal } from './components/agent/AgentProfile';
import { AdminPortal } from './components/admin/AdminPortal'; // NEW IMPORT
import { GeoCheckIn } from './components/client/GeoCheckIn';
import { LoginScreen } from './components/auth/LoginScreen';
import { PricingScreen } from './components/auth/PricingScreen';
import { GeminiChat } from './components/agent/GeminiChat';
import { GeminiTranslate } from './components/client/GeminiTranslate';
import { UserRole, CheckInLog, Subscription, SubscriptionTier } from './types';
import { getCheckIns, getClientById, getAgentProfile } from './services/mockDb';
import { Button } from './components/ui/Button';

const App: React.FC = () => {
  // DEBUG MODE: Default to Authenticated Agent
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [role, setRole] = useState<UserRole | null>(UserRole.AGENT);
  const [clientLang, setClientLang] = useState<'en' | 'es'>('en');
  const [userName, setUserName] = useState<string>('Admin (Debug Mode)');
  
  // Subscription State
  const [subscription, setSubscription] = useState<Subscription | null>({
    tier: 'Ultimate',
    status: 'Active',
    startDate: new Date().toISOString(),
    aiMinutesUsed: 0,
    aiMinutesCap: -1,
    maxUsers: 999
  });

  // View State
  const [activeClientId, setActiveClientId] = useState<string | undefined>(undefined);
  const [view, setView] = useState<'checkin' | 'dashboard' | 'intake' | 'skiptrace' | 'authority' | 'upload' | 'poe-chat' | 'marketing' | 'profile' | 'pricing' | 'poe-translate'>('dashboard');
  
  const [selectedCaseClientId, setSelectedCaseClientId] = useState<string | undefined>(undefined);
  const [checkIns, setCheckIns] = useState<CheckInLog[]>([]);

  useEffect(() => {
    setCheckIns(getCheckIns());
    const interval = setInterval(() => {
        setCheckIns([...getCheckIns()]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (userRole: UserRole, userId?: string, name?: string) => {
    setRole(userRole);
    setIsAuthenticated(true);
    if (name) setUserName(name);
    
    // --- ADMIN REDIRECT ---
    if (userRole === UserRole.ADMIN) {
        return; // Render logic handles this
    }

    if (userRole === UserRole.CLIENT) {
      if (userId) setActiveClientId(userId);
      const client = userId ? getClientById(userId) : null;
      if (client?.language) setClientLang(client.language);
      setView('dashboard');
    } else {
      if (userId === 'MichaelJones') {
          setSubscription({ tier: 'Ultimate', status: 'Active', startDate: new Date().toISOString(), aiMinutesUsed: 0, aiMinutesCap: -1, maxUsers: 999 });
          setView('dashboard');
          return;
      }
      setSubscription(prev => {
          if (prev) return prev;
           return { tier: 'Standard', status: 'Trial', startDate: new Date().toISOString(), trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), aiMinutesUsed: 0, aiMinutesCap: 30, maxUsers: 1 };
      });
      setView('dashboard');
    }
  };

  const handlePlanSelection = (tier: SubscriptionTier) => {
    const newSub: Subscription = {
        tier: tier,
        status: 'Trial',
        startDate: new Date().toISOString(),
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        aiMinutesUsed: 0,
        aiMinutesCap: tier === 'Ultimate' ? -1 : (tier === 'Standard' ? 30 : 60),
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
    setSubscription(null);
    setUserName('Agent Smith');
  };

  const handleLaunchSkipTrace = (clientId: string) => {
    setSelectedCaseClientId(clientId);
    setView('skiptrace');
  };

  // 1. Authentication Guard
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // --- NEW: ADMIN PORTAL ---
  if (role === UserRole.ADMIN) {
      return <AdminPortal onLogout={handleLogout} />;
  }

  // 2. Client Role Guard
  if (role === UserRole.CLIENT) {
      return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
                    <span className="font-bold text-lg text-slate-800">NC BondFlow</span>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setClientLang(prev => prev === 'en' ? 'es' : 'en')} className="text-sm font-medium text-slate-500">
                            {clientLang === 'en' ? '🇪🇸' : '🇺🇸'}
                        </button>
                        <button onClick={() => handleLoginSuccess(UserRole.AGENT, 'admin', 'Admin (Debug Mode)')} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-bold border border-purple-200">
                            Switch to Agent
                        </button>
                        <button onClick={handleLogout} className="text-xs text-red-500 font-medium">Log Out</button>
                    </div>
                </div>
            </nav>
            <main className="flex-1 w-full max-w-md mx-auto p-4">
                {view === 'checkin' ? (
                    <div>
                        <button onClick={() => setView('dashboard')} className="mb-4 text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium">
                           ← {clientLang === 'en' ? 'Back' : 'Atrás'}
                        </button>
                        {activeClientId && <GeoCheckIn clientId={activeClientId} lang={clientLang} onComplete={() => setView('dashboard')} />}
                    </div>
                ) : view === 'poe-translate' ? (
                    <GeminiTranslate onBack={() => setView('dashboard')} />
                ) : (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="text-center mb-8 mt-4">
                           <h2 className="text-2xl font-bold text-slate-900">{clientLang === 'en' ? `Welcome, ${userName}` : `Bienvenido, ${userName}`}</h2>
                        </div>
                        
                        <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg cursor-pointer transform transition hover:scale-[1.02]" onClick={() => setView('checkin')}>
                           <div className="flex items-center justify-between">
                               <div>
                                  <h3 className="text-lg font-bold mb-1">{clientLang === 'en' ? 'Check-In Now' : 'Registrarse Ahora'}</h3>
                                  <p className="text-blue-100 text-sm opacity-90">{clientLang === 'en' ? 'Due Today' : 'Vence Hoy'}</p>
                               </div>
                               <div className="bg-white/20 p-3 rounded-full">
                                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                               </div>
                           </div>
                        </div>

                        <div className="bg-teal-600 rounded-xl p-6 text-white shadow-lg cursor-pointer transform transition hover:scale-[1.02]" onClick={() => setView('poe-translate')}>
                           <div className="flex items-center justify-between">
                               <div>
                                  <h3 className="text-lg font-bold mb-1">{clientLang === 'en' ? 'Interpreter / Translator' : 'Intérprete / Traductor'}</h3>
                                  <p className="text-teal-100 text-sm opacity-90">{clientLang === 'en' ? 'Voice & Text' : 'Voz y Texto'}</p>
                               </div>
                               <div className="bg-white/20 p-3 rounded-full">
                                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                               </div>
                           </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
      );
  }

  // 3. Agent Pricing Guard
  if ((role === UserRole.AGENT || role === UserRole.TRIAL_AGENT) && view === 'pricing') {
      return <PricingScreen onSelectPlan={handlePlanSelection} />;
  }

  // 4. Standard Agent Layout
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col">
      <nav className="bg-gray-100 border-b border-gray-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
              <div className="bg-teal-600 p-2 rounded-lg shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight text-zinc-900">NC BondFlow</span>
                <span className="ml-2 text-[10px] font-bold bg-zinc-200 text-zinc-600 px-2 py-0.5 rounded uppercase tracking-wide">Agent Portal</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button onClick={() => handleLoginSuccess(UserRole.CLIENT, 'client_test', 'Test Client')} className="hidden md:block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded hover:bg-purple-200 border border-purple-300">
                Switch to Client
              </button>
              <button onClick={handleLogout} className="px-4 py-1.5 rounded-full text-xs font-bold bg-white border border-zinc-300 text-zinc-600 hover:bg-zinc-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm">
                Log Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Debug Mode Banner */}
      <div className="bg-red-500 text-white text-[10px] font-bold text-center py-1 uppercase tracking-widest">
        Debug Mode Active - Login Bypassed
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          {view === 'intake' ? (
            <NewCaseIntake onCancel={() => setView('dashboard')} onComplete={() => { setView('dashboard'); alert('Case Created Successfully'); }} />
          ) : view === 'skiptrace' && selectedCaseClientId ? (
            <SkipTraceHub clientId={selectedCaseClientId} onBack={() => setView('dashboard')} />
          ) : view === 'authority' ? (
            <AuthorityHub onBack={() => setView('dashboard')} />
          ) : view === 'upload' ? (
            <QuickDocumentUpload onComplete={() => { setView('dashboard'); alert("Saved."); }} onCancel={() => setView('dashboard')} />
          ) : view === 'poe-chat' ? (
             <div className="h-[600px]">
                <div className="mb-4"><Button variant="outline" onClick={() => setView('dashboard')}>Back</Button></div>
                <GeminiChat /> 
             </div>
          ) : view === 'marketing' ? (
            <MarketingHub />
          ) : view === 'profile' ? (
            <AgentProfilePortal />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
              <div className="lg:col-span-2 space-y-8">
                 <div className="flex items-center justify-between">
                   <div>
                       <h1 className="text-2xl font-bold text-zinc-900">Agent Dashboard</h1>
                       <p className="text-sm text-zinc-500">Welcome back, {userName}</p>
                   </div>
                   <div className="text-right">
                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
                           {subscription?.tier} Plan
                       </span>
                   </div>
                 </div>
                 <AgentDashboard 
                    onNewCase={() => setView('intake')} 
                    onSkipTrace={handleLaunchSkipTrace}
                    onAuthorityHub={() => setView('authority')}
                    onQuickUpload={() => setView('upload')}
                    onInterpreter={() => setView('poe-chat')} 
                    onSocial={() => setView('marketing')}
                    onProfile={() => setView('profile')}
                 />
                 
                 {/* Live Feed Table */}
                 <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden border-t-4 border-t-teal-500">
                    <div className="px-6 py-4 border-b border-zinc-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-zinc-800">Live Check-In Feed</h3>
                        <span className="text-xs font-bold text-teal-600 uppercase tracking-wide flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>Real-time
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-zinc-50 text-zinc-500 font-bold uppercase text-xs">
                                <tr><th className="px-6 py-3">Client</th><th className="px-6 py-3">Time</th><th className="px-6 py-3">Status</th></tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {checkIns.map((log) => {
                                const client = getClientById(log.clientId);
                                return (
                                    <tr key={log.id}>
                                        <td className="px-6 py-3 font-medium">{client?.name || 'Unknown'}</td>
                                        <td className="px-6 py-3 text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                        <td className="px-6 py-3"><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">Verified</span></td>
                                    </tr>
                                );
                                })}
                            </tbody>
                        </table>
                    </div>
                 </div>
              </div>
              
              <div className="lg:col-span-1">
                <GeminiChat />
              </div>
            </div>
          )}
      </main>

      <footer className="bg-white border-t border-zinc-200 py-6 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-zinc-400 text-xs">Copyright Michael Jones 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
