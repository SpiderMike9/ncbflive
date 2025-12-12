import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { addCheckIn, getClientById } from '../../services/mockDb';

interface GeoCheckInProps {
  clientId: string;
  lang: 'en' | 'es';
  onComplete: () => void;
}

export const GeoCheckIn: React.FC<GeoCheckInProps> = ({ clientId, lang, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'verifying' | 'success'>('idle');
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const client = getClientById(clientId);

  const t = {
    title: lang === 'en' ? 'Weekly Check-In' : 'Registro Semanal',
    step1: lang === 'en' ? 'Step 1: Get Location' : 'Paso 1: Obtener Ubicación',
    step2: lang === 'en' ? 'Step 2: Take Selfie' : 'Paso 2: Tomar Selfie',
    getLocation: lang === 'en' ? 'Get My Location' : 'Obtener Mi Ubicación',
    takePhoto: lang === 'en' ? 'Take Photo' : 'Tomar Foto',
    submit: lang === 'en' ? 'Submit Check-In' : 'Enviar Registro',
    success: lang === 'en' ? 'Location verified' : 'Ubicación verificada',
    errorLoc: lang === 'en' ? 'Could not access location.' : 'No se pudo acceder a la ubicación.',
    wait: lang === 'en' ? 'Verifying Identity...' : 'Verificando Identidad...',
    verified: lang === 'en' ? 'Check-in Complete' : 'Registro Completo',
    comparing: lang === 'en' ? 'Comparing biometric data...' : 'Comparando datos biométricos...'
  };

  const handleGetLocation = () => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position);
        setLoading(false);
      },
      (err) => {
        setError(`${t.errorLoc} (${err.message})`);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!location || !photoPreview || !client) return;
    
    setLoading(true);
    setProcessingStatus('verifying');

    // Simulate Biometric Verification Delay (2.5 seconds)
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Mock verification logic
    // In production: Send photoPreview and client.photoUrl to facial recognition API
    const isFaceMatch = true; // Hardcoded for MVP happy path. Change to false to test 'Suspicious'.

    const checkIn = {
      id: Math.random().toString(36).substr(2, 9),
      clientId,
      timestamp: new Date().toISOString(),
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      photoData: photoPreview,
      verified: isFaceMatch,
      notes: isFaceMatch ? undefined : 'Face mismatch detected (Automated Check)'
    };

    addCheckIn(checkIn);
    
    setProcessingStatus('success');
    
    setTimeout(() => {
        setLoading(false);
        onComplete();
    }, 1500);
  };

  // Render Verification Overlay
  if (processingStatus === 'verifying' || processingStatus === 'success') {
     return (
        <Card className="max-w-md mx-auto h-[400px] flex flex-col items-center justify-center text-center" title={t.title}>
            {processingStatus === 'verifying' ? (
                <div className="space-y-8 animate-pulse w-full">
                    <div className="flex items-center justify-center gap-6 relative">
                        {/* Reference Photo */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-200 shadow-sm relative grayscale opacity-70">
                                <img src={client?.photoUrl} alt="Reference" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-slate-900/10"></div>
                            </div>
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">File Photo</span>
                        </div>

                        {/* Scanner Animation */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-blue-500 z-10 bg-white rounded-full shadow-lg">
                             <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </div>

                        {/* Selfie */}
                        <div className="flex flex-col items-center gap-2">
                             <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500 shadow-xl shadow-blue-500/20">
                                <img src={photoPreview!} alt="Selfie" className="w-full h-full object-cover" />
                             </div>
                             <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Live Check</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{t.wait}</h3>
                        <p className="text-sm text-slate-500 mt-1">{t.comparing}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                     <div>
                        <h3 className="text-2xl font-bold text-slate-800">{t.verified}</h3>
                        <p className="text-slate-500 mt-2">Location & Identity Confirmed.</p>
                    </div>
                </div>
            )}
        </Card>
     );
  }

  return (
    <Card className="max-w-md mx-auto" title={t.title}>
      <div className="space-y-6">
        {/* Step 1: Location */}
        <div className="space-y-2">
          <p className="font-semibold text-slate-700">{t.step1}</p>
          {!location ? (
            <Button 
              onClick={handleGetLocation} 
              disabled={loading} 
              variant="secondary"
              fullWidth
            >
              {loading ? '...' : t.getLocation}
            </Button>
          ) : (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 border border-green-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span className="text-sm font-medium">{t.success} (±{Math.round(location.coords.accuracy)}m)</span>
            </div>
          )}
        </div>

        {/* Step 2: Photo */}
        <div className="space-y-2">
          <p className="font-semibold text-slate-700">{t.step2}</p>
          <div className="relative">
            {photoPreview ? (
              <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 group">
                <img src={photoPreview} alt="Selfie preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => { setPhotoPreview(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400 group-hover:text-slate-600 transition-colors">
                  <svg className="w-10 h-10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <p className="mb-2 text-sm font-medium">{t.takePhoto}</p>
                  <p className="text-xs text-slate-400">Tap to capture</p>
                </div>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  capture="user" 
                  className="hidden" 
                  onChange={handlePhotoCapture}
                />
              </label>
            )}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}

        <Button 
          fullWidth 
          onClick={handleSubmit} 
          disabled={!location || !photoPreview || loading}
          variant="primary"
          className="h-12 text-lg font-semibold shadow-lg shadow-blue-500/30"
        >
          {loading ? t.wait : t.submit}
        </Button>
      </div>
    </Card>
  );
};
