import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { generateLegalDoc, askAgentAssistant } from '../../services/geminiService';

export const AgentAI: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'docs'>('chat');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  // Doc Gen State
  const [docType, setDocType] = useState('Indemnification Agreement');
  const [clientName, setClientName] = useState('');
  const [county, setCounty] = useState('Wake');

  const handleChat = async () => {
    if (!query) return;
    setLoading(true);
    const res = await askAgentAssistant(query);
    setResponse(res || 'No response generated.');
    setLoading(false);
  };

  const handleDocGen = async () => {
    setLoading(true);
    const res = await generateLegalDoc(docType, clientName, county, 'Standard conditions apply.');
    setResponse(res || 'Document generation failed.');
    setLoading(false);
  };

  return (
    <Card title="AI Legal Assistant" className="h-full">
      <div className="flex border-b border-slate-200 mb-4">
        <button 
          className={`flex-1 py-2 text-sm font-medium border-b-2 ${activeTab === 'chat' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => { setActiveTab('chat'); setResponse(''); }}
        >
          Agent Chat
        </button>
        <button 
          className={`flex-1 py-2 text-sm font-medium border-b-2 ${activeTab === 'docs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => { setActiveTab('docs'); setResponse(''); }}
        >
          Document Drafter
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'chat' ? (
          <div className="space-y-4">
            <textarea 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              rows={3}
              placeholder="Ask about NC Statutes, Jail numbers, or process..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button onClick={handleChat} disabled={loading} fullWidth>
              {loading ? 'Thinking...' : 'Ask Assistant'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <select 
              className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              <option>Indemnification Agreement</option>
              <option>Notice of Forfeiture</option>
              <option>Promissory Note</option>
            </select>
            <input 
              type="text"
              placeholder="Client Name"
              className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
             <select 
              className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
            >
              <option>Wake</option>
              <option>Mecklenburg</option>
              <option>Durham</option>
              <option>Guilford</option>
            </select>
            <Button onClick={handleDocGen} disabled={loading} fullWidth>
              {loading ? 'Drafting...' : 'Generate Document'}
            </Button>
          </div>
        )}

        {/* Output Area */}
        {response && (
          <div className="mt-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">
              {activeTab === 'chat' ? 'Assistant Response' : 'Drafted Document'}
            </h4>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 max-h-64 overflow-y-auto">
              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{response}</p>
            </div>
            {activeTab === 'docs' && (
               <Button variant="outline" className="mt-2 text-xs" onClick={() => navigator.clipboard.writeText(response)}>Copy to Clipboard</Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};