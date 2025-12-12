
import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { generateLegalDoc, askAgentAssistant } from '../../services/geminiService';

export const AgentAI: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'docs'>('chat');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Doc Gen State
  const [docType, setDocType] = useState('Indemnification Agreement');
  const [clientName, setClientName] = useState('');
  const [county, setCounty] = useState('Wake');

  const handleChat = async () => {
    if (!query) return;
    setLoading(true);
    setSources([]);
    const res = await askAgentAssistant(query);
    setResponse(res.text || 'No response generated.');
    setSources(res.chunks || []);
    setLoading(false);
  };

  const handleDocGen = async () => {
    setLoading(true);
    const res = await generateLegalDoc(docType, clientName, county, 'Standard conditions apply.');
    setResponse(res || 'Document generation failed.');
    setLoading(false);
  };

  return (
    <Card title="AI Service Hub" className="h-full flex flex-col">
      <div className="flex border-b border-slate-200 mb-4">
        <button 
          className={`flex-1 py-2 text-sm font-medium border-b-2 ${activeTab === 'chat' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => { setActiveTab('chat'); setResponse(''); setSources([]); }}
        >
          AI Agent (Research)
        </button>
        <button 
          className={`flex-1 py-2 text-sm font-medium border-b-2 ${activeTab === 'docs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => { setActiveTab('docs'); setResponse(''); setSources([]); }}
        >
          Document Drafter
        </button>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto">
        {activeTab === 'chat' ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 border border-blue-100">
               <strong>Research Assistant:</strong> Capable of searching NC statutes, competitor rates, and court procedures via Google Search.
            </div>
            <textarea 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              rows={3}
              placeholder="Ex: 'What are the bonding limits for Class H felonies in NC?' or 'Search for competitor rates in Durham'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button onClick={handleChat} disabled={loading} fullWidth>
              {loading ? 'Analyzing...' : 'Execute Research'}
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
              <option>Payment Plan Addendum</option>
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
          <div className="mt-6 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">
              {activeTab === 'chat' ? 'Agent Strategy' : 'Drafted Document'}
            </h4>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 max-h-64 overflow-y-auto">
              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{response}</p>
            </div>
            
            {/* Display Sources for Search */}
            {activeTab === 'chat' && sources.length > 0 && (
                <div className="mt-3">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Sources Cited</p>
                    <div className="flex flex-wrap gap-2">
                        {sources.map((chunk, idx) => {
                            const uri = chunk.web?.uri;
                            const title = chunk.web?.title || `Source ${idx + 1}`;
                            if (!uri) return null;
                            return (
                                <a 
                                    key={idx} 
                                    href={uri} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-blue-600 hover:underline truncate max-w-[200px]"
                                >
                                    {title}
                                </a>
                            )
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'docs' && (
               <Button variant="outline" className="mt-2 text-xs" onClick={() => navigator.clipboard.writeText(response)}>Copy to Clipboard</Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
