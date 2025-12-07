
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { getAgentProfile, updateAgentProfile, getAgentMedia, uploadAgentMedia, deleteAgentMedia } from '../../services/mockDb';
import { AgentProfile, AgentMedia } from '../../types';

export const AgentProfilePortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'surety' | 'api' | 'media'>('general');
  const [profile, setProfile] = useState<AgentProfile>(getAgentProfile());
  const [mediaList, setMediaList] = useState<AgentMedia[]>(getAgentMedia());
  const [isSaving, setIsSaving] = useState(false);

  // File Upload State
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (field: keyof AgentProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API Call
    await new Promise(r => setTimeout(r, 800));
    updateAgentProfile(profile);
    setIsSaving(false);
    alert('Profile updated successfully!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' = 'image') => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Mock Upload
        const newMedia = uploadAgentMedia({
          agentId: profile.id,
          type,
          url: base64,
          duration: type === 'video' ? 120 : undefined // Mock duration
        });
        setMediaList([newMedia, ...mediaList]);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteMedia = (id: string) => {
    if (confirm('Delete this media?')) {
        deleteAgentMedia(id);
        setMediaList(mediaList.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-zinc-900">Agent Profile Portal</h1>
           <p className="text-sm text-zinc-500">Manage your business identity, credentials, and integrations.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="shadow-lg shadow-teal-500/20 bg-teal-600 hover:bg-teal-700">
           {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="flex border-b border-zinc-200 bg-white rounded-t-xl px-2">
        {['General', 'Surety & License', 'API Connections', 'Media Gallery'].map((tab, idx) => {
           const key = ['general', 'surety', 'api', 'media'][idx] as any;
           return (
             <button 
               key={key}
               onClick={() => setActiveTab(key)}
               className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? 'border-teal-600 text-teal-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
             >
               {tab}
             </button>
           )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Sidebar Profile Preview */}
         <div className="lg:col-span-1">
             <Card>
                 <div className="relative h-32 bg-zinc-200 rounded-t-lg overflow-hidden">
                     {profile.coverImageUrl ? <img src={profile.coverImageUrl} className="w-full h-full object-cover" alt="Cover" /> : <div className="w-full h-full bg-gradient-to-r from-teal-500 to-blue-600"></div>}
                 </div>
                 <div className="px-6 relative">
                     <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden absolute -top-10 bg-white shadow-md">
                         <img src={profile.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                     </div>
                     <div className="pt-12 pb-4">
                         <h3 className="text-lg font-bold text-zinc-900">{profile.businessName || 'Your Agency'}</h3>
                         <p className="text-sm text-zinc-500">{profile.fullName}</p>
                         <div className="mt-4 flex flex-col gap-2 text-sm text-zinc-600">
                             <span className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                {profile.phone || 'No phone'}
                             </span>
                             <span className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {profile.email}
                             </span>
                         </div>
                     </div>
                 </div>
             </Card>
         </div>

         {/* Main Form Area */}
         <div className="lg:col-span-2">
             <Card title={activeTab === 'general' ? 'Business Information' : activeTab === 'surety' ? 'Licensing & Surety' : activeTab === 'api' ? 'API Integration' : 'Media Library'}>
                 
                 {/* GENERAL TAB */}
                 {activeTab === 'general' && (
                     <div className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                 <label className="text-xs font-bold text-zinc-500 uppercase">Full Name</label>
                                 <input className="w-full p-2 border border-zinc-300 rounded mt-1 text-sm" value={profile.fullName} onChange={e => handleInputChange('fullName', e.target.value)} />
                             </div>
                             <div>
                                 <label className="text-xs font-bold text-zinc-500 uppercase">Business Name</label>
                                 <input className="w-full p-2 border border-zinc-300 rounded mt-1 text-sm" value={profile.businessName} onChange={e => handleInputChange('businessName', e.target.value)} />
                             </div>
                             <div className="md:col-span-2">
                                 <label className="text-xs font-bold text-zinc-500 uppercase">Business Address</label>
                                 <input className="w-full p-2 border border-zinc-300 rounded mt-1 text-sm" value={profile.businessAddress} onChange={e => handleInputChange('businessAddress', e.target.value)} />
                             </div>
                             <div>
                                 <label className="text-xs font-bold text-zinc-500 uppercase">Phone</label>
                                 <input className="w-full p-2 border border-zinc-300 rounded mt-1 text-sm" value={profile.phone} onChange={e => handleInputChange('phone', e.target.value)} />
                             </div>
                             <div>
                                 <label className="text-xs font-bold text-zinc-500 uppercase">Email</label>
                                 <input className="w-full p-2 border border-zinc-300 rounded mt-1 text-sm" value={profile.email} onChange={e => handleInputChange('email', e.target.value)} />
                             </div>
                             <div className="md:col-span-2">
                                 <label className="text-xs font-bold text-zinc-500 uppercase">Bio / About Us</label>
                                 <textarea className="w-full p-2 border border-zinc-300 rounded mt-1 text-sm" rows={4} value={profile.bio} onChange={e => handleInputChange('bio', e.target.value)} />
                             </div>
                         </div>
                     </div>
                 )}

                 {/* SURETY TAB */}
                 {activeTab === 'surety' && (
                     <div className="space-y-4">
                         <div>
                             <label className="text-xs font-bold text-zinc-500 uppercase">Surety Agency</label>
                             <input className="w-full p-2 border border-zinc-300 rounded mt-1 text-sm" value={profile.suretyAgency} onChange={e => handleInputChange('suretyAgency', e.target.value)} />
                         </div>
                         <div>
                             <label className="text-xs font-bold text-zinc-500 uppercase">NCDOI License Number</label>
                             <input className="w-full p-2 border border-zinc-300 rounded mt-1 text-sm font-mono" value={profile.licenseNumber} onChange={e => handleInputChange('licenseNumber', e.target.value)} />
                         </div>
                         <div className="border-2 border-dashed border-zinc-300 rounded-lg p-6 text-center">
                             <div className="text-zinc-400 mb-2">
                                 <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                             </div>
                             <p className="text-sm font-medium text-zinc-600">Upload License Document (PDF/JPG)</p>
                             <input type="file" className="hidden" />
                             <Button variant="outline" className="mt-4 text-xs">Select File</Button>
                         </div>
                     </div>
                 )}

                 {/* API TAB */}
                 {activeTab === 'api' && (
                     <div className="space-y-6">
                         <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                             <strong>Secure Storage:</strong> API keys are stored locally in your browser for the demo. In production, these are encrypted.
                         </div>
                         
                         <div>
                             <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase mb-1">
                                 <span className="w-2 h-2 rounded-full bg-green-500"></span> Gemini AI Studio Key
                             </label>
                             <input type="password" className="w-full p-2 border border-zinc-300 rounded text-sm font-mono" placeholder="AIza..." value={profile.geminiApiKey} onChange={e => handleInputChange('geminiApiKey', e.target.value)} />
                         </div>
                         <div>
                             <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase mb-1">
                                 <span className="w-2 h-2 rounded-full bg-slate-300"></span> Facebook Graph API
                             </label>
                             <input type="password" className="w-full p-2 border border-zinc-300 rounded text-sm font-mono" placeholder="EAA..." value={profile.facebookApiKey} onChange={e => handleInputChange('facebookApiKey', e.target.value)} />
                         </div>
                         <div>
                             <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase mb-1">
                                 <span className="w-2 h-2 rounded-full bg-slate-300"></span> WhatsApp Business API
                             </label>
                             <input type="password" className="w-full p-2 border border-zinc-300 rounded text-sm font-mono" placeholder="Token..." value={profile.whatsAppApiKey} onChange={e => handleInputChange('whatsAppApiKey', e.target.value)} />
                         </div>
                     </div>
                 )}

                 {/* MEDIA TAB */}
                 {activeTab === 'media' && (
                     <div className="space-y-6">
                         <div className="flex gap-4">
                             <label className="flex-1 border-2 border-dashed border-zinc-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 transition-colors">
                                 <span className="text-2xl mb-1">📷</span>
                                 <span className="text-xs font-bold text-zinc-500">Upload Image</span>
                                 <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />
                             </label>
                             <label className="flex-1 border-2 border-dashed border-zinc-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 transition-colors">
                                 <span className="text-2xl mb-1">🎥</span>
                                 <span className="text-xs font-bold text-zinc-500">Upload Video (Max 5m)</span>
                                 <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} />
                             </label>
                         </div>

                         {uploading && <div className="text-center text-sm text-teal-600 animate-pulse font-bold">Uploading media...</div>}

                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                             {mediaList.map(media => (
                                 <div key={media.id} className="relative group aspect-square bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200">
                                     {media.type === 'image' ? (
                                         <img src={media.url} className="w-full h-full object-cover" alt="Upload" />
                                     ) : (
                                         <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-white">
                                             <span className="text-2xl">▶️</span>
                                         </div>
                                     )}
                                     <button 
                                        onClick={() => handleDeleteMedia(media.id)}
                                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity"
                                     >
                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                     </button>
                                     <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                                         {media.type === 'video' ? 'VIDEO' : 'IMG'}
                                     </span>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}

             </Card>
         </div>
      </div>
    </div>
  );
};
