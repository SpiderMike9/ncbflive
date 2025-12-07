
import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { getSocialConnections, getMarketingPosts, createMarketingPost, toggleSocialConnection } from '../../services/mockDb';
import { generateMarketingContent } from '../../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

export const MarketingHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'connect' | 'analytics'>('create');
  const [connections, setConnections] = useState(getSocialConnections());
  const [posts, setPosts] = useState(getMarketingPosts());
  
  // Composer State
  const [postContent, setPostContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');

  // Analytics Data (Mock)
  const analyticsData = [
      { name: 'Mon', views: 4000, interactions: 240 },
      { name: 'Tue', views: 3000, interactions: 139 },
      { name: 'Wed', views: 2000, interactions: 980 },
      { name: 'Thu', views: 2780, interactions: 390 },
      { name: 'Fri', views: 1890, interactions: 480 },
      { name: 'Sat', views: 2390, interactions: 380 },
      { name: 'Sun', views: 3490, interactions: 430 },
  ];

  const handleAiAssist = async (task: 'caption' | 'hashtags' | 'strategy') => {
    if (!postContent && task !== 'strategy') return;
    setIsGenerating(true);
    const result = await generateMarketingContent(task, postContent || 'Bail Bonds Services in North Carolina');
    if (task === 'strategy') {
        alert(result);
    } else {
        setPostContent(prev => prev + "\n\n" + result);
    }
    setIsGenerating(false);
  };

  const handlePost = () => {
      if (!postContent || selectedPlatforms.length === 0) return;
      
      selectedPlatforms.forEach(p => {
          createMarketingPost({
              platform: p as any,
              content: postContent,
              status: scheduleTime ? 'Scheduled' : 'Posted',
              scheduledFor: scheduleTime || undefined
          });
      });
      
      setPosts(getMarketingPosts());
      alert("Content successfully queued!");
      setPostContent('');
      setScheduleTime('');
  };

  const togglePlatform = (id: string) => {
      if (selectedPlatforms.includes(id)) {
          setSelectedPlatforms(selectedPlatforms.filter(p => p !== id));
      } else {
          setSelectedPlatforms([...selectedPlatforms, id]);
      }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold">Social Automation Hub</h1>
                <p className="text-slate-400 mt-1">AI-Powered Marketing & Analytics</p>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setActiveTab('create')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'create' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>Composer</button>
                <button onClick={() => setActiveTab('connect')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'connect' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>Connections</button>
                <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>Analytics</button>
            </div>
        </div>

        {/* COMPOSER TAB */}
        {activeTab === 'create' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="New Post">
                        <textarea 
                            className="w-full p-4 border border-zinc-200 rounded-lg text-sm min-h-[150px] focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Write your update here..."
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                        />
                        
                        <div className="flex gap-2 mt-3">
                            <Button variant="outline" className="text-xs" onClick={() => handleAiAssist('caption')} disabled={isGenerating}>✨ AI Rewrite</Button>
                            <Button variant="outline" className="text-xs" onClick={() => handleAiAssist('hashtags')} disabled={isGenerating}># Generate Tags</Button>
                            <Button variant="outline" className="text-xs" onClick={() => handleAiAssist('strategy')} disabled={isGenerating}>💡 Strategy Tip</Button>
                        </div>

                        <div className="mt-6 border-t border-zinc-100 pt-4">
                            <p className="text-xs font-bold text-zinc-500 uppercase mb-2">Select Platforms</p>
                            <div className="flex gap-3">
                                {connections.filter(c => c.isConnected).map(c => (
                                    <button 
                                        key={c.id}
                                        onClick={() => togglePlatform(c.platform)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${selectedPlatforms.includes(c.platform) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-zinc-600 border-zinc-200 hover:border-blue-300'}`}
                                    >
                                        {c.platform}
                                    </button>
                                ))}
                                {connections.filter(c => c.isConnected).length === 0 && <span className="text-xs text-red-400">No platforms connected. Go to Connections tab.</span>}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-between items-center">
                            <input 
                                type="datetime-local" 
                                className="p-2 border border-zinc-200 rounded text-sm text-zinc-600"
                                value={scheduleTime}
                                onChange={(e) => setScheduleTime(e.target.value)}
                            />
                            <Button onClick={handlePost} disabled={!postContent || selectedPlatforms.length === 0} className="bg-blue-600 hover:bg-blue-700">
                                {scheduleTime ? 'Schedule Post' : 'Post Now'}
                            </Button>
                        </div>
                    </Card>
                </div>
                
                <div className="lg:col-span-1">
                    <Card title="Upcoming Schedule">
                        <div className="space-y-3">
                            {posts.filter(p => p.status === 'Scheduled').length === 0 ? (
                                <p className="text-sm text-zinc-400 italic">No scheduled posts.</p>
                            ) : (
                                posts.filter(p => p.status === 'Scheduled').map(p => (
                                    <div key={p.id} className="bg-zinc-50 p-3 rounded border border-zinc-200">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-zinc-500">{p.platform}</span>
                                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded">
                                                {new Date(p.scheduledFor!).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-800 line-clamp-2">{p.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        )}

        {/* CONNECTIONS TAB */}
        {activeTab === 'connect' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connections.map(conn => (
                    <Card key={conn.id} className={conn.isConnected ? 'border-t-4 border-t-green-500' : ''}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg">{conn.platform}</h3>
                            {conn.isConnected ? (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold uppercase">Connected</span>
                            ) : (
                                <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-1 rounded font-bold uppercase">Inactive</span>
                            )}
                        </div>
                        <p className="text-sm text-zinc-500 mb-6 min-h-[40px]">
                            {conn.isConnected ? `Synced as @${conn.username || 'User'}` : 'Connect to automate posting and track analytics.'}
                        </p>
                        <Button 
                            fullWidth 
                            variant={conn.isConnected ? 'outline' : 'primary'}
                            onClick={() => {
                                toggleSocialConnection(conn.platform, !conn.isConnected, 'NCBondFlow');
                                setConnections(getSocialConnections());
                            }}
                        >
                            {conn.isConnected ? 'Disconnect' : 'Connect API'}
                        </Button>
                    </Card>
                ))}
            </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card noPadding className="border-l-4 border-l-blue-500 p-4">
                        <p className="text-xs font-bold text-zinc-500 uppercase">Total Reach</p>
                        <p className="text-2xl font-bold text-zinc-900">24.5K</p>
                    </Card>
                    <Card noPadding className="border-l-4 border-l-green-500 p-4">
                        <p className="text-xs font-bold text-zinc-500 uppercase">Engagement</p>
                        <p className="text-2xl font-bold text-zinc-900">3.2K</p>
                    </Card>
                    <Card noPadding className="border-l-4 border-l-purple-500 p-4">
                        <p className="text-xs font-bold text-zinc-500 uppercase">Ad Spend</p>
                        <p className="text-2xl font-bold text-zinc-900">$450</p>
                    </Card>
                    <Card noPadding className="border-l-4 border-l-orange-500 p-4">
                        <p className="text-xs font-bold text-zinc-500 uppercase">Leads Generated</p>
                        <p className="text-2xl font-bold text-zinc-900">48</p>
                    </Card>
                </div>

                <Card title="Weekly Engagement" className="lg:col-span-2 h-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analyticsData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} />
                            <Tooltip />
                            <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} dot={false} />
                            <Line type="monotone" dataKey="interactions" stroke="#10b981" strokeWidth={3} dot={false} />
                        </LineChart>
                     </ResponsiveContainer>
                </Card>

                <Card title="Ad Performance (CTR)">
                    <div className="h-[250px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData}>
                                <XAxis dataKey="name" hide />
                                <Tooltip />
                                <Bar dataKey="interactions" fill="#8b5cf6" radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        )}
    </div>
  );
};
