
import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { authenticateUser } from '../../services/mockDb';
import { UserRole } from '../../types';

interface LoginScreenProps {
  onLoginSuccess: (role: UserRole, userId?: string, userName?: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [roleMode, setRoleMode] = useState<UserRole>(UserRole.AGENT);
  const [identifier, setIdentifier] = useState(''); // Email
  const [secret, setSecret] = useState(''); // Password or PIN
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<UserRole | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate network delay
    setTimeout(() => {
      const result = authenticateUser(roleMode, identifier, secret);
      if (result) {
        const user = result as any;
        if (roleMode === UserRole.AGENT) {
          onLoginSuccess(UserRole.AGENT, user.id, user.name);
        } else {
          // result is the client object for client login
          onLoginSuccess(UserRole.CLIENT, user.id, user.name);
        }
      } else {
        setError('Invalid credentials. Please try again.');
      }
      setLoading(false);
    }, 800);
  };

  const handleDemoLaunch = (role: UserRole) => {
    setDemoLoading(role);
    setTimeout(() => {
        if (role === UserRole.AGENT) {
            onLoginSuccess(UserRole.AGENT, 'admin', 'Agent Smith');
        } else {
            // Use a hardcoded ID for the demo client (Marcus Johnson from mockDb)
            onLoginSuccess(UserRole.CLIENT, 'c1', 'Marcus Johnson');
        }
        setDemoLoading(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8 items-center lg:items-start pt-8 lg:pt-0">
        
        {/* Left Side: Brand & Login Form */}
        <div className="w-full max-w-md flex-1 order-2 lg:order-1">
            <div className="text-center lg:text-left mb-8 hidden lg:block">
                <div className="inline-flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">NC BondFlow</h1>
                </div>
                <p className="text-slate-400 text-lg">Secure Bail Management & Compliance Platform</p>
            </div>

            <Card className="bg-white/95 backdrop-blur shadow-2xl border-0">
            <div className="flex border-b border-slate-200 mb-6">
                <button
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${roleMode === UserRole.AGENT ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                onClick={() => { setRoleMode(UserRole.AGENT); setError(''); setIdentifier(''); setSecret(''); }}
                >
                Agent Portal
                </button>
                <button
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${roleMode === UserRole.CLIENT ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                onClick={() => { setRoleMode(UserRole.CLIENT); setError(''); setIdentifier(''); setSecret(''); }}
                >
                Client Check-In
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                    {roleMode === UserRole.AGENT ? 'Email Address / Username' : 'Client Email'}
                </label>
                <input
                    type="text"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                    placeholder={roleMode === UserRole.AGENT ? 'username or email' : 'client@example.com'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                />
                </div>

                <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                    {roleMode === UserRole.AGENT ? 'Password' : 'Secure PIN'}
                </label>
                <input
                    type="password"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                    placeholder={roleMode === UserRole.AGENT ? '••••••••' : '••••'}
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    required
                />
                </div>

                {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                </div>
                )}

                <Button fullWidth className="h-12 text-base shadow-lg shadow-blue-500/30" disabled={loading}>
                {loading ? 'Authenticating...' : (roleMode === UserRole.AGENT ? 'Log In to Dashboard' : 'Access Client Portal')}
                </Button>
            </form>
            </Card>
        </div>

        {/* Right Side: Demo Portal */}
        <div className="w-full max-w-md flex-1 order-1 lg:order-2 animate-fadeIn">
            {/* Mobile Branding */}
            <div className="text-center mb-8 lg:hidden">
                <div className="inline-flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">NC BondFlow</h1>
                </div>
                <p className="text-slate-400 text-lg">Secure Bail Management Platform</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                         <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Live Demo Portal</h2>
                        <p className="text-slate-400 text-sm">Experience the platform instantly</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="group relative bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-xl p-4 transition-all cursor-pointer" onClick={() => handleDemoLaunch(UserRole.AGENT)}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">Agent Dashboard</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Full access to case management, analytics, AI legal drafting, and fugitive recovery tools.
                                </p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                                {demoLoading === UserRole.AGENT ? (
                                    <svg className="w-4 h-4 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <svg className="w-4 h-4 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="group relative bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-xl p-4 transition-all cursor-pointer" onClick={() => handleDemoLaunch(UserRole.CLIENT)}>
                         <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">Client Mobile App</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Simulate defendant view: Check-in with geolocation, view court dates, and spanish toggle.
                                </p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                                {demoLoading === UserRole.CLIENT ? (
                                    <svg className="w-4 h-4 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <svg className="w-4 h-4 text-slate-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Systems Operational
                </div>
            </div>
        </div>

      </div>
      
      <p className="text-center text-slate-500 text-xs mt-12 w-full max-w-lg mx-auto leading-relaxed opacity-60">
        Authorized Access Only. All activities are monitored and logged in accordance with NC General Statutes Chapter 58, Article 71.
      </p>
    </div>
  );
};
