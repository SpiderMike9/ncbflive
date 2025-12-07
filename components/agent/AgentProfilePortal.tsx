
import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { getAgentProfile, updateAgentProfile } from '../../services/mockDb';
import { AgentProfile } from '../../types';

export const AgentProfilePortal = () => {
  const [profile, setProfile] = useState<AgentProfile>(getAgentProfile());

  const handleChange = (field: keyof AgentProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateAgentProfile(profile);
    alert("Profile Saved Successfully!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Business Information">
        <div className="space-y-4">
          <input className="w-full p-2 border rounded" placeholder="Full Name" value={profile.fullName} onChange={e => handleChange('fullName', e.target.value)} />
          <input className="w-full p-2 border rounded" placeholder="Business Name" value={profile.businessName} onChange={e => handleChange('businessName', e.target.value)} />
          <input className="w-full p-2 border rounded" placeholder="Address" value={profile.businessAddress} onChange={e => handleChange('businessAddress', e.target.value)} />
          <input className="w-full p-2 border rounded" placeholder="Phone" value={profile.phone} onChange={e => handleChange('phone', e.target.value)} />
          <input className="w-full p-2 border rounded" placeholder="License #" value={profile.licenseNumber} onChange={e => handleChange('licenseNumber', e.target.value)} />
        </div>
      </Card>

      <Card title="API Keys & Integrations">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500">Gemini API Key</label>
            <input type="password" className="w-full p-2 border rounded font-mono text-sm" value={profile.geminiApiKey} onChange={e => handleChange('geminiApiKey', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500">Stripe Secret Key</label>
            <input type="password" className="w-full p-2 border rounded font-mono text-sm" value={profile.stripeSecretKey} onChange={e => handleChange('stripeSecretKey', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500">Facebook API Key</label>
            <input type="password" className="w-full p-2 border rounded font-mono text-sm" value={profile.facebookApiKey} onChange={e => handleChange('facebookApiKey', e.target.value)} />
          </div>
        </div>
      </Card>

      <div className="lg:col-span-2">
        <Button fullWidth onClick={handleSave}>Save All Changes</Button>
      </div>
    </div>
  );
};
