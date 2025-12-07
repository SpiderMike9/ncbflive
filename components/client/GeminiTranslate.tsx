import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { translateText } from '../../services/geminiService';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export const GeminiTranslate: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [targetLang, setTargetLang] = useState('Spanish');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.webkitSpeechRecognition) {
      const r = new window.webkitSpeechRecognition();
      r.continuous = false;
      r.interimResults = false;
      r.lang = 'en-US';
      r.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleTranslate(transcript);
      };
      r.onend = () => setIsRecording(false);
      setRecognition(r);
    }
  }, []);

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
    
    const result = await translateText(text, targetLang);
    setTranslatedText(result);
    setLoading(false);
  };

  return (
    <Card title="Gemini Live Interpreter" className="max-w-md mx-auto">
       <div className="space-y-4">
          {onBack && (
              <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2">
                 ← Back
              </button>
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
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-red-500 animate-pulse ring-4 ring-red-200' : 'bg-teal-600 hover:bg-teal-700'}`}
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
             
             {loading && <div className="h-1 w-full bg-teal-100 rounded overflow-hidden"><div className="h-full bg-teal-500 animate-progress"></div></div>}

             {translatedText && (
                <div className="animate-fadeIn">
                    <label className="text-xs font-bold text-green-600 uppercase flex justify-between">
                        <span>Translation ({targetLang})</span>
                    </label>
                    <div className="w-full p-4 border rounded-lg text-lg font-medium shadow-sm bg-green-50 border-green-200 text-green-900">
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