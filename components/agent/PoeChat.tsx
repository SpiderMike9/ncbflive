
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { poeChatAnalysis, setPoeRuntimeConfig, getPoeConfig } from '../../services/poeAi';

export const PoeChat: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  
  // Config State
  const [showConfig, setShowConfig] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState(''); 

  useEffect(() => {
    const { key, url } = getPoeConfig();
    setApiKey(key);
    setBaseUrl(url);
  }, [showConfig]);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setApiKey(val);
      // Smart Auto-fill URL if user changes key and URL is default
      if (val.startsWith('sk-')) {
          setBaseUrl('https://api.openai.com/v1');
      } else if (val.length > 20 && !val.startsWith('AIza')) {
          setBaseUrl('https://api.poe.com/v1');
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResponse('');
    setShowConfig(false);
    setIsMock(false);

    const result = await poeChatAnalysis(prompt);

    if (result.success && result.data) {
        setResponse(result.data);
        if (result.isMock) setIsMock(true);
    } else {
        // If error suggests invalid key, force config open
        if (result.isMissingKey || result.error?.includes('Invalid API Key')) {
            setError(result.error || "Authentication Failed.");
            setShowConfig(true);
        } else if (result.isConnectionError) {
             setError(result.error || "Connection Error");
             setShowConfig(true);
        } else {
             setError(result.error || "An unexpected error occurred.");
        }
    }
    setLoading(false);
  };

  const handleSaveConfig = () => {
      if(apiKey) {
          setPoeRuntimeConfig(apiKey, baseUrl);
          setShowConfig(false);
          setError(null);
          alert("Configuration saved. Please try your request again.");
      }
  };

  return (
    <Card title="AI Compliance Assistant" className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
         <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
            <strong>System:</strong> Connected to AI Engine. Ready to analyze cases, draft notices, or explain NC Statutes.
         </div>

         {isMock && (
             <div className="bg-amber-100 p-2 rounded text-xs text-amber-800 font-bold text-center border border-amber-200">
                 ⚠️ Connection Failed: Showing Simulated Response
             </div>
         )}

         {response && (
             <div className={`p-4 rounded-lg border shadow-sm animate-fadeIn ${isMock ? 'bg-amber-50 border-amber-200' : 'bg-white border-zinc-200'}`}>
                 <h4 className="text-xs font-bold text-zinc-400 uppercase mb-2">Analysis Result</h4>
                 <div className="prose prose-sm text-zinc-800 whitespace-pre-wrap">
                     {response}
                 </div>
                 <div className="mt-3 flex justify-end">
                    <Button variant="outline" className="text-xs h-8" onClick={() => navigator.clipboard.writeText(response)}>
                        Copy Text
                    </Button>
                 </div>
             </div>
         )}

         {error && (
             <div className="bg-red-50 p-3 rounded text-red-600 text-sm border border-red-200 flex justify-between items-center">
                 <span><strong>Error:</strong> {error}</span>
                 <button onClick={() => setShowConfig(!showConfig)} className="text-xs underline hover:text-red-800">Config</button>
             </div>
         )}

         {showConfig && (
             <div className="bg-slate-50 p-4 rounded border border-slate-200 animate-fadeIn space-y-3">
                 <p className="text-xs font-bold text-slate-700 uppercase">Connection Settings</p>
                 <div className="p-2 bg-yellow-50 text-yellow-800 text-xs border border-yellow-100 rounded">
                     <strong>Note:</strong> Ensure your API Key matches the Base URL provider (OpenAI vs Poe).
                 </div>
                 
                 <div>
                    <label className="text-xs text-slate-500 block mb-1">API Key</label>
                    <input 
                        type="password" 
                        placeholder="sk-..." 
                        className="w-full p-2 border border-slate-300 rounded text-sm"
                        value={apiKey}
                        onChange={handleKeyChange}
                    />
                 </div>

                 <div>
                    <label className="text-xs text-slate-500 block mb-1">Base URL (Provider)</label>
                    <input 
                        type="text" 
                        placeholder="https://api.openai.com/v1" 
                        className="w-full p-2 border border-slate-300 rounded text-sm font-mono"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                        Use <code>https://api.openai.com/v1</code> for OpenAI, <code>https://api.poe.com/v1</code> for Poe.
                    </p>
                 </div>

                 <Button onClick={handleSaveConfig} className="h-8 text-xs w-full">Save Configuration</Button>
             </div>
         )}
      </div>

      <form onSubmit={handleSubmit} className="mt-auto pt-4 border-t border-zinc-100">
         <textarea
            className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm mb-3"
            rows={3}
            placeholder="e.g., 'Draft a Notice of Forfeiture explanation...'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
         />
         <Button fullWidth disabled={loading || !prompt} className="bg-blue-600 hover:bg-blue-700">
            {loading ? 'Processing...' : 'Analyze with AI'}
         </Button>
      </form>
    </Card>
  );
};
