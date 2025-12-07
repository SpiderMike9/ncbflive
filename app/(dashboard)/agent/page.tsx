
'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { AgentProfilePortal } from '@/components/agent/AgentProfilePortal';
import { MarketingHub } from '@/components/agent/MarketingHub';

export default function AgentPage() {
  const [view, setView] = useState<'profile' | 'marketing'>('profile');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Agent Dashboard</h1>
        <div className="flex gap-2">
          <Button variant={view === 'profile' ? 'primary' : 'outline'} onClick={() => setView('profile')}>Profile</Button>
          <Button variant={view === 'marketing' ? 'primary' : 'outline'} onClick={() => setView('marketing')}>Marketing Hub</Button>
        </div>
      </div>

      {view === 'profile' && <AgentProfilePortal />}
      {view === 'marketing' && <MarketingHub />}
    </div>
  );
}
