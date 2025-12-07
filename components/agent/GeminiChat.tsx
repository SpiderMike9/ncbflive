import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { complianceChat } from '../../services/geminiService';

export const GeminiChat: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse('');

    const result = await complianceChat(prompt);
    setResponse(result);
    setLoading(false);
  };

  return (
    <Card title="Gemini Compliance Assistant" className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
         <div className="bg-teal-50 p-4 rounded-lg border border-teal-100 text-sm text-teal-800">
            <strong>System:</strong> Connected to Google Gemini. Ready to analyze cases, draft notices, or explain NC Statutes.
         </div>

         {response && (
             <div className="p-4 rounded-lg border shadow-sm animate-fadeIn bg-white border-zinc-200">
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
      </div>

      <form onSubmit={handleSubmit} className="mt-auto pt-4 border-t border-zinc-100">
         <textarea
            className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm mb-3"
            rows={3}
            placeholder="e.g., 'Draft a Notice of Forfeiture explanation for Wake County...'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
         />
         <Button fullWidth disabled={loading || !prompt} className="bg-teal-600 hover:bg-teal-700">
            {loading ? 'Processing with Gemini...' : 'Analyze'}
         </Button>
      </form>
    </Card>
  );
};