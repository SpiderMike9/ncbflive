
'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getEmails, sendEmail, deleteEmail } from '@/lib/mockDb';
import { Email } from '@/lib/types';

export const AdminEmailInbox: React.FC = () => {
  const [folder, setFolder] = useState<'inbox' | 'sent' | 'trash'>('inbox');
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    setEmails(getEmails(folder));
  }, [folder, composeOpen]); // refresh when box closes

  const handleSend = () => {
    sendEmail(to, subject, body);
    setComposeOpen(false);
    alert("Sent!");
  };

  return (
    <div className="flex h-[600px] bg-white rounded-xl border border-slate-200 overflow-hidden">
      {composeOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg" title="Compose Email">
            <div className="space-y-4">
              <input className="w-full p-2 border rounded" placeholder="To" value={to} onChange={e=>setTo(e.target.value)} />
              <input className="w-full p-2 border rounded" placeholder="Subject" value={subject} onChange={e=>setSubject(e.target.value)} />
              <textarea className="w-full p-2 border rounded h-32" placeholder="Message" value={body} onChange={e=>setBody(e.target.value)} />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={()=>setComposeOpen(false)}>Cancel</Button>
                <Button onClick={handleSend}>Send</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="w-48 bg-slate-50 border-r p-4 flex flex-col gap-2">
        <Button onClick={() => setComposeOpen(true)}>Compose</Button>
        <button onClick={() => setFolder('inbox')} className={`p-2 rounded text-left ${folder==='inbox'?'bg-blue-100 text-blue-700':''}`}>Inbox</button>
        <button onClick={() => setFolder('sent')} className={`p-2 rounded text-left ${folder==='sent'?'bg-blue-100 text-blue-700':''}`}>Sent</button>
        <button onClick={() => setFolder('trash')} className={`p-2 rounded text-left ${folder==='trash'?'bg-blue-100 text-blue-700':''}`}>Trash</button>
      </div>

      <div className="w-72 border-r overflow-y-auto">
        {emails.map(e => (
          <div key={e.id} onClick={() => setSelectedEmail(e)} className="p-4 border-b cursor-pointer hover:bg-slate-50">
            <div className="font-bold text-sm truncate">{e.from}</div>
            <div className="text-sm truncate">{e.subject}</div>
            <div className="text-xs text-slate-500">{new Date(e.timestamp).toLocaleDateString()}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {selectedEmail ? (
          <div>
            <h2 className="text-xl font-bold mb-2">{selectedEmail.subject}</h2>
            <div className="text-sm text-slate-500 mb-4">From: {selectedEmail.from}</div>
            <div className="prose text-sm" dangerouslySetInnerHTML={{__html: selectedEmail.body}} />
            <div className="mt-8 flex gap-2">
               <Button variant="outline" onClick={() => { deleteEmail(selectedEmail.id); setSelectedEmail(null); setEmails(getEmails(folder)); }}>Delete</Button>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-400 mt-20">Select an email to read</div>
        )}
      </div>
    </div>
  );
};
