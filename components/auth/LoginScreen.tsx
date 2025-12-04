
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { authenticateUser, registerTrialAgent } from '../../services/mockDb';
import { UserRole } from '../../types';

interface LoginScreenProps {
  onLoginSuccess: (role: UserRole, userId?: string, userName?: string) => void;
}

type AuthView = 'signup' | 'login' | 'welcome';

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<AuthView>('signup'); // Default to Sign-Up
  const [roleMode, setRoleMode] = useState<UserRole>(UserRole.AGENT);
  
  // Sign Up State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Shared State
  const [identifier, setIdentifier] = useState(''); // Email
  const [secret, setSecret] = useState(''); // Password or PIN
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Welcome State
  const [tempPassword, setTempPassword] = useState('');

  useEffect(() => {
    // Check for saved user preference
    const savedUser = localStorage.getItem('rememberedUser');
    if (savedUser) {
        setIdentifier(savedUser);
        setRememberMe(true);
        setView('login'); // If remembered, assume they want to login
    }
  }, []);

  const handleGoogleAuth = () => {
    setLoading(true);
    setTimeout(() => {
        if (view === 'signup') {
            // Create Trial User via Google
            const newUser = registerTrialAgent('Google', 'User', 'google@example.com');
            setFirstName('Google');
            setLastName('User');
            setIdentifier(newUser.email);
            setTempPassword(newUser.tempPassword);
            setView('welcome');
        } else {
            // Login via Google
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const result = authenticateUser(roleMode, identifier, secret);
      if (result) {
        if (rememberMe) {
            localStorage.setItem('rememberedUser', identifier);
        } else {
            localStorage.removeItem('rememberedUser');
        }
        const user = result as any;
        onLoginSuccess(user.role || UserRole.AGENT, user.id, user.name);
      } else {
        setError('Invalid credentials. Please try again.');
      }
      setLoading(false);
    }, 800);
  };

  const handleProceedToDashboard = () => {
      onLoginSuccess(UserRole.TRIAL_AGENT, identifier, `${firstName} ${lastName}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
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
            
            {/* System Status Indicator */}
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-zinc-200 shadow-sm">
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
                <div className="text-center p-4">
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-2">Account Created Successfully</h2>
                    <p className="text-zinc-500 text-sm mb-6">Welcome to the future of bail management.</p>
                    
                    <div className="bg-zinc-50 rounded-lg p-6 border border-zinc-200 text-left mb-6">
                        <p className="text-xs text-zinc-400 uppercase font-bold mb-1">Your Username</p>
                        <p className="font-mono text-zinc-800 mb-4">{identifier}</p>
                        
                        <p className="text-xs text-zinc-400 uppercase font-bold mb-1">Temporary Password</p>
                        <div className="flex justify-between items-center">
                            <p className="font-mono text-xl font-bold text-zinc-900 tracking-wider">{tempPassword}</p>
                            <button onClick={() => navigator.clipboard.writeText(tempPassword)} className="text-teal-600 text-xs font-bold hover:underline">Copy</button>
                        </div>
                    </div>

                    <div className="bg-red-50 border border-red-100 rounded p-3 mb-6 flex gap-3 items-start text-left">
                        <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <p className="text-xs text-red-700"><strong>Security Alert:</strong> For your protection, you must change this temporary password immediately upon your first login.</p>
                    </div>

                    <Button fullWidth onClick={handleProceedToDashboard} className="h-12 text-base shadow-lg shadow-teal-500/20">
                        Enter Dashboard
                    </Button>
                </div>
            </Card>
        )}

        {/* --- VIEW: SIGN UP --- */}
        {view === 'signup' && (
             <Card className="shadow-xl border-0">
                <div className="px-6 py-8">
                    <h2 className="text-xl font-bold text-zinc-900 mb-6">Create Agent Account</h2>
                    
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

                        <Button fullWidth className="h-12 text-base shadow-lg shadow-teal-500/20 mt-2" disabled={loading}>
                            {loading ? 'Creating Profile...' : 'Sign Up Free'}
                        </Button>
                    </form>

                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-zinc-200"></div>
                        <span className="px-3 text-xs text-zinc-400 font-bold uppercase">Or</span>
                        <div className="flex-1 border-t border-zinc-200"></div>
                    </div>

                    <Button variant="google" fullWidth onClick={handleGoogleAuth} className="h-12 text-sm font-medium relative">
                        <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign up with Google
                    </Button>
                    
                    <p className="text-center mt-6 text-sm text-zinc-500">
                        Already have an account? <button onClick={() => setView('login')} className="text-teal-600 font-bold hover:underline">Log In</button>
                    </p>
                </div>
             </Card>
        )}

        {/* --- VIEW: LOGIN --- */}
        {view === 'login' && (
            <Card className="shadow-xl border-0">
                 {/* Role Toggle */}
                <div className="flex border-b border-zinc-100 mb-6 bg-zinc-50/50">
                    <button
                        className={`flex-1 py-4 text-sm font-semibold transition-colors ${roleMode === UserRole.AGENT ? 'text-teal-600 border-b-2 border-teal-600 bg-white' : 'text-zinc-400 hover:text-zinc-600'}`}
                        onClick={() => { setRoleMode(UserRole.AGENT); setError(''); }}
                    >
                        Agent Portal
                    </button>
                    <button
                        className={`flex-1 py-4 text-sm font-semibold transition-colors ${roleMode === UserRole.CLIENT ? 'text-teal-600 border-b-2 border-teal-600 bg-white' : 'text-zinc-400 hover:text-zinc-600'}`}
                        onClick={() => { setRoleMode(UserRole.CLIENT); setError(''); }}
                    >
                        Client Check-In
                    </button>
                </div>

                <div className="px-6 pb-6 space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
                            {roleMode === UserRole.AGENT ? 'Email' : 'Client Email'}
                        </label>
                        <input
                            type="text"
                            className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-zinc-50 focus:bg-white"
                            placeholder={roleMode === UserRole.AGENT ? 'name@agency.com' : 'client@example.com'}
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                        />
                        </div>

                        <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
                            {roleMode === UserRole.AGENT ? 'Password' : 'PIN'}
                        </label>
                        <input
                            type="password"
                            className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-zinc-50 focus:bg-white"
                            placeholder={roleMode === UserRole.AGENT ? '••••••••' : '••••'}
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            required
                        />
                        </div>

                        {/* Remember Me Checkbox */}
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

                        <Button fullWidth className="h-12 text-base shadow-lg shadow-teal-500/20" disabled={loading}>
                        {loading ? 'Authenticating...' : (roleMode === UserRole.AGENT ? 'Access Dashboard' : 'Client Login')}
                        </Button>
                    </form>
                    
                    {roleMode === UserRole.AGENT && (
                        <p className="text-center mt-4 text-sm text-zinc-500">
                            New here? <button onClick={() => setView('signup')} className="text-teal-600 font-bold hover:underline">Sign Up</button>
                        </p>
                    )}
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
