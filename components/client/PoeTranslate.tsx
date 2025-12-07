
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { poeTranslation, setPoeRuntimeConfig, getPoeConfig } from '../../services/poeAi';

// Mock speech recognition types for TS
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export const PoeTranslate: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [targetLang, setTargetLang] = useState('Spanish');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
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

  useEffect(() => {
    if (typeof window !== 'undefined' && window.webkitSpeechRecognition) {
      const r = new window.webkitSpeechRecognition();
      r.continuous = false;
      r.interimResults = false;
      r.lang = 'en-US';
      r.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        if (!showConfig) handleTranslate(transcript);
      };
      r.onend = () => setIsRecording(false);
      setRecognition(r);
    }
  }, [showConfig]);

  const toggleMic = () => {
    if (!recognition) {
        alert("Microphone not supported. Please use Chrome.");
        return;
    }
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleTranslate = async (text: string) => {
    if (!text) return;
    setLoading(true);
    setShowConfig(false);
    setIsMock(false);
    
    const result = await poeTranslation(text, targetLang);
    
    if (result.success && result.data) {
        setTranslatedText(result.data);
        if (result.isMock) setIsMock(true);
    } else {
        if (result.isMissingKey || result.error?.includes('Invalid API Key')) {
            setShowConfig(true);
        } else if (result.isConnectionError) {
            setShowConfig(true);
        } else {
            alert("Translation failed: " + result.error);
        }
    }
    setLoading(false);
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setApiKey(val);
    if (val.startsWith('sk-')) {
        setBaseUrl('https://api.openai.com/v1');
    } else if (val.length > 20 && !val.startsWith('AIza')) {
        setBaseUrl('https://api.poe.com/v1');
    }
  };

  const handleSaveConfig = () => {
    if(apiKey) {
        setPoeRuntimeConfig(apiKey, baseUrl);
        setShowConfig(false);
        if (inputText) handleTranslate(inputText);
    }
  };

  return (
    <Card title="Live Interpreter" className="max-w-md mx-auto">
       <div className="space-y-4">
          {onBack && (
              <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2">
                 ← Back
              </button>
          )}

          {showConfig && (
             <div className="bg-yellow-50 p-4 rounded border border-yellow-200 animate-fadeIn mb-4 space-y-3">
                 <p className="text-xs text-yellow-800 font-bold">Authentication Settings Required</p>
                 <p className="text-xs text-yellow-700">The previously loaded key was invalid.</p>
                 <input 
                    type="password" 
                    placeholder="API Key (sk-...)" 
                    className="w-full p-2 border border-yellow-300 rounded text-sm"
                    value={apiKey}
                    onChange={handleKeyChange}
                 />
                 <input 
                    type="text" 
                    placeholder="Base URL (e.g. https://api.openai.com/v1)" 
                    className="w-full p-2 border border-yellow-300 rounded text-sm font-mono"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                 />
                 <Button onClick={handleSaveConfig} className="h-8 text-xs w-full">Save & Retry</Button>
             </div>
          )}

          <div className="flex gap-2 mb-4">
             <select 
                value={targetLang} 
                onChange={(e) => setTargetLang(e.target.value)}
                className="flex-1 p-2 border border-slate-300 rounded text-sm bg-white"
             >
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
                <option value="Vietnamese">Vietnamese (Tiếng Việt)</option>
             </select>
          </div>

          <div className="flex justify-center my-6">
             <button
                onClick={toggleMic}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-red-500 animate-pulse ring-4 ring-red-200' : 'bg-blue-600 hover:bg-blue-700'}`}
             >
                <span className="text-3xl">{isRecording ? '⏹' : '🎙'}</span>
             </button>
          </div>
          <p className="text-center text-xs text-slate-400 font-medium">
             {isRecording ? 'Listening...' : 'Tap to Record'}
          </p>

          <div className="space-y-3">
             <div>
                <label className="text-xs font-bold text-slate-400 uppercase">English Input</label>
                <textarea 
                    className="w-full p-3 border border-slate-200 rounded bg-slate-50 text-slate-800 text-sm"
                    rows={2}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Or type here..."
                />
             </div>
             
             {loading && <div className="h-1 w-full bg-blue-100 rounded overflow-hidden"><div className="h-full bg-blue-500 animate-progress"></div></div>}

             {translatedText && (
                <div className="animate-fadeIn">
                    <label className="text-xs font-bold text-green-600 uppercase flex justify-between">
                        <span>Translation ({targetLang})</span>
                        {isMock && <span className="text-[10px] bg-amber-100 text-amber-800 px-2 rounded">SIMULATED</span>}
                    </label>
                    <div className={`w-full p-4 border rounded-lg text-lg font-medium shadow-sm ${isMock ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-green-50 border-green-200 text-green-900'}`}>
                        {translatedText}
                    </div>
                </div>
             )}
          </div>

          <div className="pt-2">
             <Button fullWidth onClick={() => handleTranslate(inputText)} disabled={loading || !inputText}>
                Translate Text
             </Button>
          </div>
       </div>
    </Card>
  );
};
