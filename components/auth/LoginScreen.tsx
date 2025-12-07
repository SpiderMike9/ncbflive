
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { authenticateUser, registerTrialAgent } from '../../services/mockDb';
import { UserRole } from '../../types';

interface LoginScreenProps {
  onLoginSuccess: (role: UserRole, userId?: string, userName?: string) => void;
}

type AuthView = 'signup' | 'login' | 'welcome' | 'client-login';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<AuthView>('signup'); 
  
  // Sign Up State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Login/Shared State
  const [identifier, setIdentifier] = useState(''); 
  const [secret, setSecret] = useState(''); 
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Welcome State
  const [tempPassword, setTempPassword] = useState('');

  useEffect(() => {
    // Check for saved user preference for AGENTS only
    const savedUser = localStorage.getItem('rememberedUser');
    if (savedUser && view !== 'client-login') {
        setIdentifier(savedUser);
        setRememberMe(true);
        setView('login');
    }
  }, [view]);

  const handleGoogleAuth = () => {
    setLoading(true);
    setTimeout(() => {
        if (view === 'signup') {
            const newUser = registerTrialAgent('Google', 'User', 'google@example.com');
            setFirstName('Google');
            setLastName('User');
            setIdentifier(newUser.email);
            setTempPassword(newUser.tempPassword);
            setView('welcome');
        } else {
            onLoginSuccess(UserRole.AGENT, 'admin', 'Agent Smith');
        }
        setLoading(false);
    }, 1500);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
        const newUser = registerTrialAgent(firstName, lastName, identifier);
        setTempPassword(newUser.tempPassword);
        setView('welcome');
        setLoading(false);
    }, 1000);
  };

  const handleAgentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      // Universal Auth Check (includes Admin)
      const result = authenticateUser('AGENT', identifier, secret); // Type string to allow flexibility in mockDb
      
      if (result) {
        if (result.role === UserRole.ADMIN) {
             // Admin Specific Flow
             onLoginSuccess(UserRole.ADMIN, result.id, result.name);
        } else {
             // Standard Agent Flow
             if (rememberMe) {
                 localStorage.setItem('rememberedUser', identifier);
             } else {
                 localStorage.removeItem('rememberedUser');
             }
             const user = result as any;
             onLoginSuccess(user.role, user.id, user.name);
        }
      } else {
        setError('Invalid credentials.');
      }
      setLoading(false);
    }, 800);
  };

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
        // STRICT: Only authenticate as Client role here
        const result = authenticateUser(UserRole.CLIENT, identifier, secret);
        if (result) {
            const user = result as any;
            // Force role to CLIENT just in case mockDb didn't return it
            onLoginSuccess(UserRole.CLIENT, user.id, user.name); 
        } else {
            setError('Check-in failed. Invalid Username or PIN.');
        }
        setLoading(false);
    }, 800);
  };

  const handleProceedToDashboard = () => {
      onLoginSuccess(UserRole.TRIAL_AGENT, identifier, `${firstName} ${lastName}`);
  };

  // --- VIEW: CLIENT CHECK-IN PORTAL (Isolated) ---
  if (view === 'client-login') {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans border-t-8 border-teal-600">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">Client Portal</h1>
                    <p className="text-slate-500 text-sm">Secure Check-in System</p>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-green-700 uppercase">System Active</span>
                    </div>
                </div>

                <Card className="shadow-lg border-t-4 border-t-blue-500">
                    <form onSubmit={handleClientLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username / Email</label>
                            <input
                                type="text"
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="client_test_user"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Secure PIN</label>
                            <input
                                type="password"
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="••••"
                                value={secret}
                                onChange={(e) => setSecret(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100 text-center font-medium">
                                {error}
                            </div>
                        )}

                        <Button fullWidth className="bg-blue-600 hover:bg-blue-700 h-12 text-base font-bold shadow-blue-500/20" disabled={loading}>
                            {loading ? 'Verifying...' : 'Check In Now'}
                        </Button>
                    </form>
                    
                    <div className="mt-6 text-center border-t border-slate-100 pt-4">
                        <button onClick={() => { setView('login'); setIdentifier(''); setSecret(''); }} className="text-xs text-slate-400 hover:text-teal-600 font-medium">
                            Agent / Bondsman Login
                        </button>
                    </div>

                    {/* DEBUG BUTTON */}
                    <div className="mt-2 text-center">
                         <button onClick={() => onLoginSuccess(UserRole.CLIENT, 'client_test', 'Test Client')} className="text-[10px] text-purple-400 font-mono hover:text-purple-600">
                             [DEBUG] Quick Client Login
                         </button>
                    </div>
                </Card>
            </div>
        </div>
      );
  }

  // --- VIEW: AGENT / ADMIN PORTAL ---
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
                <div className="p-3 bg-teal-600 rounded-xl shadow-lg shadow-teal-500/20">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">NC BondFlow</h1>
            <p className="text-zinc-500 mt-2">Professional Bail Management & Compliance</p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-zinc-200 shadow-sm">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-xs font-bold text-zinc-600 uppercase tracking-wide">Systems Operational</span>
            </div>
        </div>

        {/* --- VIEW: WELCOME / ONBOARDING --- */}
        {view === 'welcome' && (
            <Card className="shadow-2xl border-0 animate-fadeIn border-t-4 border-t-teal-500">
                <div className="text-center p-6">
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-2">Welcome Aboard</h2>
                    <p className="text-zinc-500 text-sm mb-6">Your trial agent profile has been provisioned.</p>
                    
                    <div className="bg-zinc-50 rounded-lg p-6 border border-zinc-200 text-left mb-6">
                        <p className="text-xs text-zinc-400 uppercase font-bold mb-1">Your Username</p>
                        <p className="font-mono text-zinc-800 mb-4 font-bold">{identifier}</p>
                        
                        <p className="text-xs text-zinc-400 uppercase font-bold mb-1">Temporary Password</p>
                        <div className="flex justify-between items-center bg-white p-2 rounded border border-zinc-200">
                            <p className="font-mono text-xl font-bold text-zinc-900 tracking-wider">{tempPassword}</p>
                            <button onClick={() => navigator.clipboard.writeText(tempPassword)} className="text-teal-600 text-xs font-bold hover:underline uppercase">Copy</button>
                        </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-100 rounded p-3 mb-6 flex gap-3 items-start text-left">
                        <svg className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <p className="text-xs text-orange-800 font-medium"><strong>Action Required:</strong> Please change this temporary password immediately upon your first dashboard access.</p>
                    </div>

                    <Button fullWidth onClick={handleProceedToDashboard} className="h-12 text-base shadow-lg shadow-teal-500/20 bg-teal-600 hover:bg-teal-700 text-white font-bold">
                        Enter Dashboard
                    </Button>
                </div>
            </Card>
        )}

        {/* --- VIEW: AGENT SIGN UP (DEFAULT) --- */}
        {view === 'signup' && (
             <Card className="shadow-xl border-0 border-t-4 border-t-teal-500">
                <div className="px-6 py-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-zinc-900">Agent Sign-Up Portal</h2>
                        <button onClick={() => setView('login')} className="text-sm text-teal-600 font-bold hover:underline">
                            Existing Login
                        </button>
                    </div>
                    
                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">First Name</label>
                                <input required type="text" className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-zinc-50 focus:bg-white" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Last Name</label>
                                <input required type="text" className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-zinc-50 focus:bg-white" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Work Email</label>
                            <input required type="email" className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-zinc-50 focus:bg-white" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="agent@agency.com" />
                        </div>

                        <Button fullWidth className="h-12 text-base font-bold shadow-lg shadow-teal-500/20 mt-2 bg-teal-600 hover:bg-teal-700" disabled={loading}>
                            {loading ? 'Creating Profile...' : 'Start Free Trial'}
                        </Button>
                    </form>

                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-zinc-200"></div>
                        <span className="px-3 text-xs text-zinc-400 font-bold uppercase">Or</span>
                        <div className="flex-1 border-t border-zinc-200"></div>
                    </div>

                    <Button variant="google" fullWidth onClick={handleGoogleAuth} className="h-12 text-sm font-bold text-zinc-600 border-zinc-300 hover:bg-zinc-50 relative">
                        <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign up with Google
                    </Button>
                    
                    <div className="mt-8 pt-4 border-t border-zinc-100 text-center">
                        <button onClick={() => { setView('client-login'); setIdentifier(''); setSecret(''); }} className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2 mx-auto">
                            Are you a Client? Access Client Portal
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                    </div>
                </div>
             </Card>
        )}

        {/* --- VIEW: AGENT LOGIN --- */}
        {view === 'login' && (
            <Card className="shadow-xl border-0 border-t-4 border-t-teal-500">
                <div className="px-6 py-8 space-y-4">
                     <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold text-zinc-900">Agent Login</h2>
                        <button onClick={() => setView('signup')} className="text-sm text-teal-600 font-bold hover:underline">
                            Create Account
                        </button>
                    </div>

                    <form onSubmit={handleAgentLogin} className="space-y-4">
                        <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Email / Username</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-zinc-50 focus:bg-white"
                            placeholder="name@agency.com"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                        />
                        </div>

                        <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-zinc-50 focus:bg-white"
                            placeholder="••••••••"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            required
                        />
                        </div>

                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="rememberMe" 
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 text-teal-600 rounded border-zinc-300 focus:ring-teal-500"
                            />
                            <label htmlFor="rememberMe" className="text-sm text-zinc-600 select-none cursor-pointer">Remember me</label>
                        </div>

                        {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                        </div>
                        )}

                        <Button fullWidth className="h-12 text-base shadow-lg shadow-teal-500/20 bg-teal-600 hover:bg-teal-700 font-bold" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Access Dashboard'}
                        </Button>
                    </form>
                    
                    <div className="mt-6 pt-4 border-t border-zinc-100 text-center">
                        <button onClick={() => { setView('client-login'); setIdentifier(''); setSecret(''); }} className="text-sm text-slate-400 hover:text-slate-600 hover:underline">
                            Go to Client Check-In
                        </button>
                    </div>

                    {/* DEBUG BUTTON */}
                    <div className="mt-2 text-center flex justify-center gap-4">
                         <button onClick={() => onLoginSuccess(UserRole.AGENT, 'admin', 'Agent Smith')} className="text-[10px] text-teal-400 font-mono hover:text-teal-600">
                             [DEBUG] Admin Agent
                         </button>
                         <button onClick={() => onLoginSuccess(UserRole.ADMIN, 'MichaelJones', 'Michael Jones')} className="text-[10px] text-purple-400 font-mono hover:text-purple-600">
                             [DEBUG] Super Admin
                         </button>
                    </div>
                </div>
            </Card>
        )}
        
        <div className="text-center mt-8">
            <p className="text-zinc-400 text-xs">
              Secure 256-bit Encrypted Session • Authorized Personnel Only
            </p>
        </div>
      </div>
    </div>
  );
};
