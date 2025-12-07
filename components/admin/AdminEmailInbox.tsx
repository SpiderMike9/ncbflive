
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { getEmails, sendEmail, markEmailRead, deleteEmail, syncGmail } from '../../services/mockDb';
import { Email } from '../../types';

export const AdminEmailInbox: React.FC = () => {
  const [folder, setFolder] = useState<'inbox' | 'sent' | 'trash'>('inbox');
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Compose State
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    refreshEmails();
  }, [folder]);

  const refreshEmails = () => {
    setEmails(getEmails(folder));
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await syncGmail();
    refreshEmails();
    setIsSyncing(false);
  };

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      markEmailRead(email.id, true);
      refreshEmails(); // Update UI to show read status
    }
  };

  const handleDelete = (id: string) => {
    deleteEmail(id);
    setSelectedEmail(null);
    refreshEmails();
  };

  const handleSend = () => {
    if (!to || !subject || !body) return;
    sendEmail(to, subject, body);
    setComposeOpen(false);
    setTo('');
    setSubject('');
    setBody('');
    if (folder === 'sent') refreshEmails();
    alert("Email Sent Successfully.");
  };

  const handleReply = () => {
    if (!selectedEmail) return;
    setTo(selectedEmail.from.includes('<') ? selectedEmail.from.match(/<([^>]+)>/)?.[1] || selectedEmail.from : selectedEmail.from);
    setSubject(`Re: ${selectedEmail.subject}`);
    setComposeOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] animate-fadeIn">
      {/* Compose Modal */}
      {composeOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-white shadow-2xl" title="New Message">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">To</label>
                <input className="w-full p-2 border border-slate-300 rounded" value={to} onChange={e => setTo(e.target.value)} placeholder="recipient@example.com" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Subject</label>
                <input className="w-full p-2 border border-slate-300 rounded" value={subject} onChange={e => setSubject(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
                <textarea className="w-full p-2 border border-slate-300 rounded h-48" value={body} onChange={e => setBody(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setComposeOpen(false)}>Discard</Button>
                <Button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700">Send Message</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* Sidebar */}
        <div className="w-48 bg-slate-50 border-r border-slate-200 flex flex-col p-4 space-y-2">
          <Button onClick={() => { setComposeOpen(true); setTo(''); setSubject(''); setBody(''); }} className="mb-4 bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 w-full justify-start pl-4">
             <span className="mr-2">✏️</span> Compose
          </Button>
          
          <button onClick={() => { setFolder('inbox'); setSelectedEmail(null); }} className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${folder === 'inbox' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
             <span className="mr-2">📥</span> Inbox
          </button>
          <button onClick={() => { setFolder('sent'); setSelectedEmail(null); }} className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${folder === 'sent' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
             <span className="mr-2">📤</span> Sent
          </button>
          <button onClick={() => { setFolder('trash'); setSelectedEmail(null); }} className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${folder === 'trash' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
             <span className="mr-2">🗑️</span> Trash
          </button>

          <div className="mt-auto pt-4 border-t border-slate-200">
             <button onClick={handleSync} disabled={isSyncing} className="flex items-center justify-center w-full px-3 py-2 rounded-lg text-xs font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50">
                {isSyncing ? 'Syncing...' : '🔄 Sync Gmail'}
             </button>
          </div>
        </div>

        {/* Email List */}
        <div className={`w-80 border-r border-slate-200 overflow-y-auto ${selectedEmail ? 'hidden md:block' : 'block w-full'}`}>
           <div className="p-3 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
              <input type="text" placeholder="Search mail..." className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500" />
           </div>
           <div>
              {emails.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">Folder is empty</div>
              ) : (
                  emails.map(email => (
                      <div 
                        key={email.id} 
                        onClick={() => handleSelectEmail(email)}
                        className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${selectedEmail?.id === email.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''} ${!email.isRead ? 'bg-white' : 'bg-slate-50/50'}`}
                      >
                          <div className="flex justify-between items-start mb-1">
                              <span className={`text-sm truncate w-32 ${!email.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>{email.from.split('<')[0]}</span>
                              <span className="text-[10px] text-slate-400">{new Date(email.timestamp).toLocaleDateString()}</span>
                          </div>
                          <div className={`text-sm mb-1 truncate ${!email.isRead ? 'font-bold text-slate-800' : 'text-slate-700'}`}>{email.subject}</div>
                          <div className="text-xs text-slate-500 truncate">{email.bodyPreview}</div>
                      </div>
                  ))
              )}
           </div>
        </div>

        {/* Reading Pane */}
        <div className={`flex-1 flex flex-col bg-slate-50 ${!selectedEmail ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
            {selectedEmail ? (
                <>
                    {/* Email Header */}
                    <div className="p-6 bg-white border-b border-slate-200">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-slate-800">{selectedEmail.subject}</h2>
                            <div className="flex gap-2">
                                <button onClick={() => handleDelete(selectedEmail.id)} className="p-2 text-slate-400 hover:text-red-500 rounded hover:bg-red-50">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <img src={selectedEmail.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
                            <div>
                                <div className="text-sm font-bold text-slate-900">{selectedEmail.from}</div>
                                <div className="text-xs text-slate-500">to {selectedEmail.to} • {new Date(selectedEmail.timestamp).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Email Body */}
                    <div className="flex-1 p-8 overflow-y-auto bg-white">
                        <div className="prose prose-sm max-w-none text-slate-800" dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
                        <Button onClick={handleReply} className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                            Reply
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2" onClick={() => { setComposeOpen(true); setTo(''); setSubject(`Fwd: ${selectedEmail.subject}`); setBody(`\n\n---------- Forwarded message ---------\nFrom: ${selectedEmail.from}\nDate: ${new Date(selectedEmail.timestamp).toLocaleString()}\nSubject: ${selectedEmail.subject}\nTo: ${selectedEmail.to}\n\n${selectedEmail.bodyPreview}`); }}>
                            Forward
                        </Button>
                    </div>
                </>
            ) : (
                <div className="text-center text-slate-400">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <p>Select an email to view details</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
