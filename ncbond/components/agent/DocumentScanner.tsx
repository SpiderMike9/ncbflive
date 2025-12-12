
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface DocumentScannerProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError('Camera access denied or unavailable.');
      }
    };
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const processImage = (imageData: ImageData) => {
    const data = imageData.data;
    // Simple Binarization (Thresholding) + Contrast Boost
    // This makes the text pop like a scanner
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Convert to Grayscale (Luminance)
      let gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      // Increase Contrast
      const contrast = 1.5; // Factor
      gray = (gray - 128) * contrast + 128;

      // Thresholding (Binarization) - Optional, keeps it grayscale but high contrast looks more professional than pure B&W often
      // if (gray > 140) gray = 255;
      // else if (gray < 80) gray = 0;

      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
    return imageData;
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Set canvas size to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw original frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data for processing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const processedData = processImage(imageData);
      
      // Put processed data back
      ctx.putImageData(processedData, 0, 0);

      // Convert to base64
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
    }
    setIsProcessing(false);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleAccept = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 bg-red-50 rounded-xl border border-red-200">
        <p>{error}</p>
        <Button onClick={onCancel} className="mt-4" variant="secondary">Close</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-slate-900 text-white p-3 flex justify-between items-center z-10">
        <h3 className="font-semibold text-sm uppercase tracking-wider">Smart Doc Scanner</h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        {capturedImage ? (
          <img src={capturedImage} alt="Scanned Doc" className="max-w-full max-h-full object-contain" />
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Alignment Guide Overlay */}
            <div className="absolute inset-8 border-2 border-white/50 rounded-lg pointer-events-none shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]">
               <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1"></div>
               <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1"></div>
               <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1"></div>
               <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1"></div>
            </div>
            <div className="absolute bottom-12 bg-black/60 text-white px-4 py-1 rounded-full text-sm font-medium backdrop-blur">
                Align document edges within frame
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="bg-slate-900 p-6 flex justify-center items-center gap-6 z-10">
        {capturedImage ? (
           <>
             <Button variant="secondary" onClick={handleRetake} className="w-32">Retake</Button>
             <Button variant="primary" onClick={handleAccept} className="w-32 bg-green-600 hover:bg-green-700">Accept Scan</Button>
           </>
        ) : (
           <button 
             onClick={handleCapture}
             className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:bg-white/40 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-500/50"
             aria-label="Capture Photo"
           >
             <div className="w-12 h-12 bg-white rounded-full"></div>
           </button>
        )}
      </div>
    </div>
  );
};
