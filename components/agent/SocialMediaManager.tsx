
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { getSocialConnections, toggleSocialConnection } from '../../services/mockDb';
import { SocialConnection } from '../../types';
import { generateSocialPost } from '../../services/geminiService';

interface SocialMediaManagerProps {
  onBack: () => void;
}

export const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({ onBack }) => {
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [syncTopic, setSyncTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{[key: string]: string}>({});

  useEffect(() => {
    setConnections(getSocialConnections());
  }, []);

  const handleConnect = (platformId: string, platformName: string) => {
    setLoadingId(platformId);
    // Simulate OAuth Delay
    setTimeout(() => {
        toggleSocialConnection(platformName, true, `NCBondFlow ${platformName}`);
        setConnections([...getSocialConnections()]);
        setLoadingId(null);
    }, 1500);
  };

  const handleDisconnect = (platformId: string, platformName: string) => {
    if(window.confirm(`Are you sure you want to disconnect ${platformName}?`)) {
        toggleSocialConnection(platformName, false);
        setConnections([...getSocialConnections()]);
    }
  };

  const handleGenerateContent = async () => {
    if (!syncTopic) return;
    setIsGenerating(true);
    const activePlatforms = connections.filter(c => c.isConnected);
    
    const newContent: {[key: string]: string} = {};
    
    // Parallel generation
    await Promise.all(activePlatforms.map(async (c) => {
        const text = await generateSocialPost(c.platform, syncTopic);
        newContent[c.platform] = text;
    }));

    setGeneratedContent(newContent);
    setIsGenerating(false);
  };

  const handlePost = () => {
    alert("Updates successfully queued for synchronization to all connected platforms.");
    setSyncModalOpen(false);
    setSyncTopic('');
    setGeneratedContent({});
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
         <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Dashboard
         </Button>
         <Button onClick={() => setSyncModalOpen(true)} className="flex items-center gap-2 shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Sync Update
         </Button>
      </div>

      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold flex items-center gap-3">
             Social Connection Manager
          </h1>
          <p className="text-slate-400 mt-1">Manage API integrations for automated compliance reporting and marketing updates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {connections.map((conn) => (
             <Card key={conn.id} className={`transition-all border-t-4 ${conn.isConnected ? 'border-t-green-500' : 'border-t-slate-300'}`}>
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${conn.platform === 'Facebook' ? 'bg-blue-600 text-white' : conn.platform === 'X' ? 'bg-black text-white' : 'bg-pink-500 text-white'}`}>
                            {conn.platform === 'Facebook' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>}
                            {conn.platform === 'X' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>}
                            {conn.platform === 'TikTok' && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-2.5 0-3.76 1.24-5.1 3.03l.96.55c.97-1.31 1.78-1.99 3.05-1.99.73 0 1.21.36 1.44.82-.76.12-1.63.38-2.48.88-2.18 1.3-3.15 3.43-3.15 5.56 0 2.29 1.56 4.38 4.67 4.38 3.04 0 5.09-2.04 5.09-5.41V4.87c.01-.29.23-.53.53-.53h2.62c-.02 1.57.51 3.02 1.49 4.19l.26.29V5.13c-1.25-1.04-2.01-2.56-2.01-4.22V.53c0-.29-.23-.53-.53-.53h-3.32c-.28.01-.51.25-.51.52z"/></svg>}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">{conn.platform}</h3>
                            <p className="text-xs text-slate-500">{conn.isConnected ? 'Connected' : 'Not Connected'}</p>
                        </div>
                    </div>
                    {conn.isConnected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm animate-pulse"></span>
                    )}
                 </div>

                 <div className="space-y-4">
                     {conn.isConnected ? (
                        <div className="bg-slate-50 p-3 rounded text-xs border border-slate-100">
                             <p className="text-slate-400 uppercase font-bold mb-1">Authenticated As</p>
                             <p className="font-medium text-slate-700">{conn.username}</p>
                             <p className="text-slate-400 mt-2">Last Sync: {conn.lastSync ? new Date(conn.lastSync).toLocaleDateString() : 'Never'}</p>
                        </div>
                     ) : (
                        <p className="text-sm text-slate-500 italic">Connect to enable auto-posting and compliance updates.</p>
                     )}

                     <Button 
                        fullWidth 
                        variant={conn.isConnected ? 'outline' : 'primary'}
                        onClick={() => conn.isConnected ? handleDisconnect(conn.id, conn.platform) : handleConnect(conn.id, conn.platform)}
                        disabled={loadingId === conn.id}
                        className={conn.isConnected ? 'border-red-200 text-red-600 hover:bg-red-50' : 'bg-slate-800 hover:bg-slate-900'}
                     >
                        {loadingId === conn.id ? 'Connecting...' : (conn.isConnected ? 'Disconnect' : `Connect ${conn.platform}`)}
                     </Button>
                 </div>
             </Card>
         ))}
      </div>

      {/* Sync Modal */}
      {syncModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg bg-white shadow-2xl animate-scaleIn" title="Automated Content Sync">
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Update Topic / Prompt</label>
                        <textarea 
                            className="w-full p-3 border border-slate-300 rounded-lg text-sm mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g., 'Office open late for holiday weekend' or 'New zero-down financing options available'"
                            rows={2}
                            value={syncTopic}
                            onChange={(e) => setSyncTopic(e.target.value)}
                        />
                    </div>
                    
                    {Object.keys(generatedContent).length > 0 ? (
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                            {Object.entries(generatedContent).map(([platform, content]) => (
                                <div key={platform} className="bg-slate-50 p-3 rounded border border-slate-200">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">{platform} Preview</p>
                                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{content}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded border border-blue-100 flex items-start gap-2">
                             <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             Gemini AI will automatically format your update for each connected platform (e.g., Hashtags for X, Video Script for TikTok).
                        </div>
                    )}

                    <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                        <Button variant="secondary" onClick={() => { setSyncModalOpen(false); setGeneratedContent({}); }}>Cancel</Button>
                        {!Object.keys(generatedContent).length ? (
                            <Button onClick={handleGenerateContent} disabled={isGenerating || !syncTopic}>
                                {isGenerating ? 'Drafting...' : 'Generate Drafts'}
                            </Button>
                        ) : (
                            <Button onClick={handlePost} className="bg-green-600 hover:bg-green-700">
                                Confirm & Post All
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </div>
      )}
    </div>
  );
};
