
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { getCases, getClientById, addDocumentToCase } from '../../services/mockDb';
import { translateText } from '../../services/geminiService';
import { CaseDocument, Subscription } from '../../types';

interface InterpreterProps {
  onBack: () => void;
  subscription: Subscription | null;
}

interface TranscriptEntry {
  id: string;
  speaker: 'Bondsman' | 'Client';
  original: string;
  translated: string;
  timestamp: string;
}

export const Interpreter: React.FC<InterpreterProps> = ({ onBack, subscription }) => {
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<'Bondsman' | 'Client' | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [processing, setProcessing] = useState(false);
  
  // Usage Tracking
  const [minutesUsed, setMinutesUsed] = useState(subscription?.aiMinutesUsed || 0);
  const minutesCap = subscription?.aiMinutesCap || 60;
  const isCapReached = minutesCap !== -1 && minutesUsed >= minutesCap;

  // Speech Recognition Refs
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);

  const activeCases = getCases().filter(c => c.status !== 'Closed');

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        await handleSpeechResult(text);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Error", event.error);
        setProcessing(false);
        setActiveSpeaker(null);
      };
      
      recognitionRef.current.onend = () => {
         // Auto-restart if we wanted continuous mode, but for turn-based we stop.
         if (processing) {
             // do nothing, let processing finish
         } else {
            setActiveSpeaker(null);
         }
      };
    } else {
      alert("Speech Recognition not supported in this browser.");
    }
  }, [activeSpeaker]); // Re-bind if needed

  const startListening = (speaker: 'Bondsman' | 'Client') => {
    if (isCapReached) {
        alert("Trial Limit Reached. Please upgrade your plan to continue using AI services.");
        return;
    }
    if (!selectedCaseId) {
        alert("Please select a case file to link this conversation log.");
        return;
    }
    if (processing || activeSpeaker) return;

    setActiveSpeaker(speaker);
    setIsRecording(true);
    
    if (recognitionRef.current) {
        recognitionRef.current.lang = speaker === 'Bondsman' ? 'en-US' : 'es-MX';
        recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setActiveSpeaker(null);
    setIsRecording(false);
  };

  const handleSpeechResult = async (originalText: string) => {
    setProcessing(true);
    stopListening(); // Stop mic while translating/speaking

    const currentSpeaker = activeSpeaker || 'Bondsman'; // Fallback
    const targetLang = currentSpeaker === 'Bondsman' ? 'es' : 'en';
    
    // 1. Translate
    const translatedText = await translateText(originalText, targetLang);

    // 2. Add to Log
    const newEntry: TranscriptEntry = {
        id: Math.random().toString(36).substr(2, 9),
        speaker: currentSpeaker,
        original: originalText,
        translated: translatedText,
        timestamp: new Date().toLocaleTimeString()
    };
    setTranscript(prev => [...prev, newEntry]);
    
    // Increment Usage (Simulated approximate minute calculation)
    // In a real app, this would be server-side calculated based on audio length
    setMinutesUsed(prev => Math.min(prev + 0.5, minutesCap === -1 ? Infinity : minutesCap)); 

    // 3. Speak Translation
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = targetLang === 'es' ? 'es-MX' : 'en-US';
    utterance.rate = 1.0;
    
    utterance.onend = () => {
        setProcessing(false);
    };
    
    synthRef.current.speak(utterance);
  };

  const handleSaveSession = async () => {
    if (transcript.length === 0 || !selectedCaseId) return;

    // Generate Text Content
    const header = `INTERPRETER TRANSCRIPT LOG\nDate: ${new Date().toLocaleString()}\nCase ID: ${selectedCaseId}\n----------------------------\n\n`;
    const body = transcript.map(t => 
        `[${t.timestamp}] ${t.speaker.toUpperCase()} (${t.speaker === 'Bondsman' ? 'EN' : 'ES'}): ${t.original}\n` +
        `>>> TRANSLATION: ${t.translated}\n`
    ).join('\n');

    const fullContent = header + body;
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const reader = new FileReader();
    
    reader.onloadend = () => {
        const base64 = reader.result as string;
        const newDoc: CaseDocument = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'Other', // In a real app, 'Transcript' type
            name: `Transcript_${new Date().toISOString().slice(0,10)}.txt`,
            url: base64,
            timestamp: new Date().toISOString()
        };
        addDocumentToCase(selectedCaseId, newDoc);
        alert("Transcript saved to Case File successfully.");
        onBack();
    };
    reader.readAsDataURL(blob);
  };

  // Calculate Progress percentage
  const usagePercentage = minutesCap === -1 ? 0 : Math.min((minutesUsed / minutesCap) * 100, 100);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] animate-fadeIn">
       {/* Header */}
       <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onBack} className="h-10 w-10 p-0 flex items-center justify-center rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Button>
            <div>
                <h2 className="text-xl font-bold text-slate-800">AI Interpreter</h2>
                <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-500">Real-time translation & compliance logging</p>
                    {subscription?.status === 'Trial' && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">
                            TRIAL MODE
                        </span>
                    )}
                </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select 
                className="p-2 border border-slate-300 rounded text-sm bg-white"
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
            >
                <option value="">Select Case to Log...</option>
                {activeCases.map(c => {
                    const client = getClientById(c.clientId);
                    return <option key={c.id} value={c.id}>{client?.name} ({client?.caseNumber})</option>
                })}
            </select>
            <Button 
                onClick={handleSaveSession} 
                disabled={transcript.length === 0 || !selectedCaseId}
                className="bg-red-600 hover:bg-red-700 text-white"
            >
                Stop & Save Log
            </Button>
          </div>
       </div>

       {/* Usage Meter (If Trial) */}
       {minutesCap !== -1 && (
           <div className="mb-4 bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">Monthly AI Usage</span>
                    <span className={`text-xs font-bold ${isCapReached ? 'text-red-600' : 'text-blue-600'}`}>
                        {Math.floor(minutesUsed)} / {minutesCap} Minutes Used
                    </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full transition-all duration-500 ${isCapReached ? 'bg-red-500' : 'bg-blue-500'}`} 
                        style={{ width: `${usagePercentage}%` }}
                    ></div>
                </div>
                {isCapReached && (
                    <div className="mt-2 text-center">
                        <p className="text-xs text-red-600 font-bold">Limit Reached.</p>
                        <button className="text-xs text-blue-600 underline">Upgrade to Unlimited</button>
                    </div>
                )}
           </div>
       )}

       {/* Main Interpreter UI */}
       <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-0">
          
          {/* Client Side (Top/Left) */}
          <div className={`relative rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all ${activeSpeaker === 'Client' ? 'bg-blue-100 ring-4 ring-blue-300' : 'bg-slate-100'}`}>
              <div className="absolute top-4 left-4 bg-white/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-slate-600">
                  Client (Español)
              </div>
              
              <div className="flex-1 flex items-center justify-center w-full">
                  {activeSpeaker === 'Client' ? (
                      <div className="animate-pulse text-2xl font-medium text-blue-800">Listening...</div>
                  ) : (
                      <div className="text-slate-400">Tap microphone to speak Spanish</div>
                  )}
              </div>

              <button 
                className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${activeSpeaker === 'Client' ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-slate-700 hover:bg-blue-50'} ${isCapReached ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => startListening('Client')}
                disabled={processing || (activeSpeaker !== null && activeSpeaker !== 'Client') || isCapReached}
              >
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </button>
          </div>

          {/* Bondsman Side (Bottom/Right) */}
          <div className={`relative rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all ${activeSpeaker === 'Bondsman' ? 'bg-indigo-100 ring-4 ring-indigo-300' : 'bg-slate-800 text-white'}`}>
             <div className="absolute top-4 left-4 bg-black/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white/80">
                  Bondsman (English)
              </div>

              <div className="flex-1 flex items-center justify-center w-full">
                  {activeSpeaker === 'Bondsman' ? (
                      <div className="animate-pulse text-2xl font-medium text-indigo-900">Listening...</div>
                  ) : (
                      <div className="text-slate-400">Tap microphone to speak English</div>
                  )}
              </div>

              <button 
                className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${activeSpeaker === 'Bondsman' ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-700 text-white hover:bg-slate-600'} ${isCapReached ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => startListening('Bondsman')}
                disabled={processing || (activeSpeaker !== null && activeSpeaker !== 'Bondsman') || isCapReached}
              >
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </button>
          </div>
       </div>

       {/* Live Transcript / Feedback Area */}
       <div className="h-48 mt-4 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase flex justify-between">
                <span>Live Transcript</span>
                {processing && <span className="text-blue-600 animate-pulse">Translating...</span>}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {transcript.length === 0 ? (
                    <p className="text-center text-slate-400 text-sm mt-4 italic">Conversation history will appear here...</p>
                ) : (
                    transcript.map((entry, idx) => (
                        <div key={entry.id} className={`flex flex-col ${entry.speaker === 'Bondsman' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${entry.speaker === 'Bondsman' ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-blue-100 text-blue-900 rounded-tl-none'}`}>
                                <p className="text-xs opacity-75 mb-1">{entry.speaker} • {entry.timestamp}</p>
                                <p className="font-medium">{entry.original}</p>
                                <div className={`mt-2 pt-2 border-t text-sm italic ${entry.speaker === 'Bondsman' ? 'border-slate-600 text-slate-300' : 'border-blue-200 text-blue-700'}`}>
                                    {entry.translated}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
       </div>
    </div>
  );
};
