
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
  const [error, setError] = useState<string | null>(null);
  
  // Usage Tracking
  const [minutesUsed, setMinutesUsed] = useState(subscription?.aiMinutesUsed || 0);
  const minutesCap = subscription?.aiMinutesCap || 60;
  const isCapReached = minutesCap !== -1 && minutesUsed >= minutesCap;

  // Speech Recognition Refs
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);

  const activeCases = getCases().filter(c => c.status !== 'Closed');

  useEffect(() => {
    // Initialize Speech Recognition with Cross-Browser check
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
           await handleSpeechResult(text);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'no-speech') {
            console.log("No speech detected.");
        } else {
            console.error("Speech Error", event.error);
            setError(`Microphone Error: ${event.error}`);
        }
        setProcessing(false);
        setActiveSpeaker(null);
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
         // Auto-stop if not explicitly chained (simple toggle mode)
         if (!processing) {
            setActiveSpeaker(null);
            setIsRecording(false);
         }
      };
    } else {
        setError("Your browser does not support Speech Recognition. Please use Chrome.");
    }
  }, [activeSpeaker, processing]);

  const startListening = (speaker: 'Bondsman' | 'Client') => {
    if (error) {
        alert(error);
        return;
    }
    if (isCapReached) {
        alert("Trial Limit Reached.");
        return;
    }
    if (!selectedCaseId) {
        alert("Please select a case file first to associate this transcript.");
        return;
    }
    if (processing || activeSpeaker) return;

    setError(null);
    setActiveSpeaker(speaker);
    setIsRecording(true);
    
    if (recognitionRef.current) {
        try {
            recognitionRef.current.lang = speaker === 'Bondsman' ? 'en-US' : 'es-MX';
            recognitionRef.current.start();
        } catch (e) {
            console.error("Failed to start recognition:", e);
            setError("Could not start microphone. Please refresh and try again.");
            setIsRecording(false);
            setActiveSpeaker(null);
        }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setActiveSpeaker(null);
    setIsRecording(false);
  };

  const handleSpeechResult = async (originalText: string) => {
    setProcessing(true);
    // Explicitly stop listening to process results
    stopListening();

    const currentSpeaker = activeSpeaker || 'Bondsman';
    const targetLang = currentSpeaker === 'Bondsman' ? 'es' : 'en';
    
    // Call Gemini AI for context-aware legal translation
    const translatedText = await translateText(originalText, targetLang);

    const newEntry: TranscriptEntry = {
        id: Math.random().toString(36).substr(2, 9),
        speaker: currentSpeaker,
        original: originalText,
        translated: translatedText,
        timestamp: new Date().toLocaleTimeString()
    };
    setTranscript(prev => [...prev, newEntry]);
    
    setMinutesUsed(prev => Math.min(prev + 0.5, minutesCap === -1 ? Infinity : minutesCap)); 

    // Text-to-Speech Output
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
            type: 'Other',
            name: `Transcript_${new Date().toISOString().slice(0,10)}.txt`,
            url: base64,
            timestamp: new Date().toISOString()
        };
        addDocumentToCase(selectedCaseId, newDoc);
        alert("Transcript successfully saved to Case Documents.");
        onBack();
    };
    reader.readAsDataURL(blob);
  };

  const usagePercentage = minutesCap === -1 ? 0 : Math.min((minutesUsed / minutesCap) * 100, 100);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] animate-fadeIn">
       {/* Header */}
       <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm border-t-4 border-t-teal-500">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onBack} className="h-10 w-10 p-0 flex items-center justify-center rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Button>
            <div>
                <h2 className="text-xl font-bold text-zinc-900">AI Interpreter</h2>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-[10px] bg-white text-teal-700 px-3 py-1 rounded-full border border-teal-200 font-bold shadow-sm">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"/></svg>
                        Legal Context Active
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-zinc-300'}`}></span>
                        {isRecording ? 'Listening...' : 'Mic Ready'}
                    </span>
                </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select 
                className="p-2 border border-zinc-300 rounded text-sm bg-zinc-50 focus:ring-2 focus:ring-teal-500 outline-none"
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
                className="bg-red-600 hover:bg-red-700 text-white shadow-red-500/20"
            >
                End & Save
            </Button>
          </div>
       </div>

       {error && (
           <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 text-sm flex items-center gap-2">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
               {error}
           </div>
       )}

       {/* Usage Meter */}
       {minutesCap !== -1 && (
           <div className="mb-4 bg-white border border-zinc-200 p-3 rounded-lg shadow-sm">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-bold text-zinc-500 uppercase">Monthly AI Allowance</span>
                    <span className={`text-xs font-bold ${isCapReached ? 'text-red-600' : 'text-teal-600'}`}>
                        {Math.floor(minutesUsed)} / {minutesCap} Minutes
                    </span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full transition-all duration-500 ${isCapReached ? 'bg-red-500' : 'bg-teal-500'}`} 
                        style={{ width: `${usagePercentage}%` }}
                    ></div>
                </div>
           </div>
       )}

       {/* Main Interpreter UI */}
       <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-0">
          
          {/* Client Side (Spanish) */}
          <div className={`relative rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 ${activeSpeaker === 'Client' ? 'bg-teal-50 ring-4 ring-teal-200 shadow-xl scale-[1.02]' : 'bg-zinc-50 border border-zinc-200'}`}>
              <div className="absolute top-4 left-4 bg-white border border-zinc-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-500 shadow-sm">
                  Client (Español)
              </div>
              
              <div className="flex-1 flex items-center justify-center w-full">
                  {activeSpeaker === 'Client' ? (
                      <div className="animate-pulse text-2xl font-bold text-teal-800 flex flex-col items-center gap-2">
                          <span className="text-4xl animate-bounce">🎙️</span>
                          Escuchando...
                      </div>
                  ) : (
                      <div className="text-zinc-400 font-medium flex flex-col items-center gap-2">
                          <span className="text-2xl opacity-50">🇪🇸</span>
                          Tap to speak Spanish
                      </div>
                  )}
              </div>

              <button 
                className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${activeSpeaker === 'Client' ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200' : 'bg-white text-teal-600 hover:bg-teal-50 border-4 border-teal-100'} ${isCapReached ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => startListening('Client')}
                disabled={processing || (activeSpeaker !== null && activeSpeaker !== 'Client') || isCapReached}
              >
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </button>
          </div>

          {/* Bondsman Side (English) */}
          <div className={`relative rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 ${activeSpeaker === 'Bondsman' ? 'bg-zinc-800 ring-4 ring-zinc-400 shadow-xl scale-[1.02]' : 'bg-white border border-zinc-300'}`}>
             <div className="absolute top-4 left-4 bg-zinc-900 border border-zinc-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-300 shadow-sm">
                  Bondsman (English)
              </div>

              <div className="flex-1 flex items-center justify-center w-full">
                  {activeSpeaker === 'Bondsman' ? (
                      <div className="animate-pulse text-2xl font-bold text-white flex flex-col items-center gap-2">
                          <span className="text-4xl animate-bounce">🎙️</span>
                          Listening...
                      </div>
                  ) : (
                      <div className="text-zinc-400 font-medium flex flex-col items-center gap-2">
                          <span className="text-2xl opacity-50">🇺🇸</span>
                          Tap to speak English
                      </div>
                  )}
              </div>

              <button 
                className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${activeSpeaker === 'Bondsman' ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200' : 'bg-zinc-800 text-white hover:bg-zinc-700 border-4 border-zinc-700'} ${isCapReached ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => startListening('Bondsman')}
                disabled={processing || (activeSpeaker !== null && activeSpeaker !== 'Bondsman') || isCapReached}
              >
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </button>
          </div>
       </div>

       {/* Transcript */}
       <div className="h-48 mt-4 bg-white border border-zinc-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
            <div className="bg-zinc-50 px-4 py-2 border-b border-zinc-200 text-xs font-bold text-zinc-500 uppercase flex justify-between">
                <span>Live Transcript</span>
                {processing && <span className="text-teal-600 animate-pulse font-bold flex items-center gap-1"><span className="w-2 h-2 bg-teal-600 rounded-full"></span>Translating...</span>}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
                {transcript.length === 0 ? (
                    <p className="text-center text-zinc-400 text-sm mt-4 italic">Conversation history will appear here...</p>
                ) : (
                    transcript.map((entry, idx) => (
                        <div key={entry.id} className={`flex flex-col ${entry.speaker === 'Bondsman' ? 'items-end' : 'items-start'} animate-fadeIn`}>
                            <div className={`max-w-[80%] rounded-lg p-3 shadow-sm ${entry.speaker === 'Bondsman' ? 'bg-zinc-800 text-white rounded-tr-none' : 'bg-teal-50 text-teal-900 border border-teal-100 rounded-tl-none'}`}>
                                <p className="text-xs opacity-75 mb-1 flex justify-between gap-4">
                                    <span>{entry.speaker}</span>
                                    <span>{entry.timestamp}</span>
                                </p>
                                <p className="font-medium text-lg leading-snug">{entry.original}</p>
                                <div className={`mt-2 pt-2 border-t text-sm font-medium ${entry.speaker === 'Bondsman' ? 'border-zinc-600 text-teal-300' : 'border-teal-200 text-zinc-600'}`}>
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
