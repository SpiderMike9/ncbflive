
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { authenticateUser } from '@/lib/mockDb';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = authenticateUser(identifier, password);
    
    if (user) {
      if (user.role === 'ADMIN') router.push('/admin');
      else router.push('/agent');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8" title="BondFlow Login">
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            className="w-full p-3 border rounded" 
            placeholder="Username / Email" 
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
          />
          <input 
            type="password" 
            className="w-full p-3 border rounded" 
            placeholder="Password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button fullWidth>Sign In</Button>
        </form>
        <div className="mt-4 text-center text-xs text-slate-400">
          <p>Admin: MichaelJones / MikeJones1</p>
          <p>Agent: admin@ncbondflow.com / admin123</p>
        </div>
      </Card>
    </div>
  );
}
