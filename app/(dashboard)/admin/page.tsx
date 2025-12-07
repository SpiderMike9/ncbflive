
'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AdminEmailInbox } from '@/components/admin/AdminEmailInbox';
import { getAllAgents, deleteAgent } from '@/lib/mockDb';

export default function AdminPage() {
  const [view, setView] = useState<'agents' | 'email'>('agents');
  const [agents, setAgents] = useState(getAllAgents());

  const handleDelete = (id: string) => {
    deleteAgent(id);
    setAgents(getAllAgents());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Portal</h1>
        <div className="flex gap-2">
          <Button variant={view === 'agents' ? 'primary' : 'outline'} onClick={() => setView('agents')}>Agents</Button>
          <Button variant={view === 'email' ? 'primary' : 'outline'} onClick={() => setView('email')}>Inbox</Button>
        </div>
      </div>

      {view === 'agents' && (
        <Card title="Registered Agents">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 uppercase text-xs text-slate-500">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Agency</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map(agent => (
                  <tr key={agent.id} className="border-t">
                    <td className="p-4 font-bold">{agent.fullName}</td>
                    <td className="p-4">{agent.email}</td>
                    <td className="p-4">{agent.suretyAgency}</td>
                    <td className="p-4">
                      <button onClick={() => handleDelete(agent.id)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {view === 'email' && <AdminEmailInbox />}
    </div>
  );
}
