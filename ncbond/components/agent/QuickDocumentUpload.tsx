
import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { DocumentScanner } from './DocumentScanner';
import { getCases, getClientById, addDocumentToCase } from '../../services/mockDb';
import { CaseDocument } from '../../types';

interface QuickDocumentUploadProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const QuickDocumentUpload: React.FC<QuickDocumentUploadProps> = ({ onComplete, onCancel }) => {
  const [mode, setMode] = useState<'upload' | 'scan'>('upload');
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [docType, setDocType] = useState<CaseDocument['type']>('Other');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState<string | null>(null); // Base64
  const [loading, setLoading] = useState(false);

  const activeCases = getCases().filter(c => c.status !== 'Closed');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanCapture = (base64Image: string) => {
    setFileData(base64Image);
    setFileName(`Scan_${new Date().toISOString().slice(0,10)}.jpg`);
    setMode('upload'); // Switch back to form to confirm
  };

  const handleSave = async () => {
    if (!selectedCaseId || !fileData || !docType) return;
    setLoading(true);

    const newDoc: CaseDocument = {
      id: Math.random().toString(36).substr(2, 9),
      type: docType,
      name: fileName || 'Untitled',
      url: fileData,
      timestamp: new Date().toISOString()
    };

    // Simulate upload delay
    await new Promise(r => setTimeout(r, 1000));
    
    addDocumentToCase(selectedCaseId, newDoc);
    setLoading(false);
    onComplete();
  };

  if (mode === 'scan') {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <DocumentScanner onCapture={handleScanCapture} onCancel={() => setMode('upload')} />
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto animate-fadeIn" title="Quick Form Actions">
      <div className="space-y-6">
        <p className="text-sm text-slate-500">Securely upload or scan legal documents directly to a client's case file.</p>
        
        {/* Case Selection */}
        <div>
           <label className="block text-sm font-semibold text-slate-700 mb-1">Link to Case File *</label>
           <select 
             className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
             value={selectedCaseId}
             onChange={(e) => setSelectedCaseId(e.target.value)}
           >
             <option value="">Select a Case...</option>
             {activeCases.map(c => {
               const client = getClientById(c.clientId);
               return <option key={c.id} value={c.id}>{client?.name} - {client?.caseNumber}</option>;
             })}
           </select>
        </div>

        {/* Document Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Document Category *</label>
                <select 
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                >
                  <option>Arrest Report</option>
                  <option>Mugshot</option>
                  <option>Indemnification</option>
                  <option>Collateral</option>
                  <option>Court Notice</option>
                  <option>Other</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Document Name</label>
                <input 
                   type="text" 
                   className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                   placeholder="e.g. Signed Agreement"
                   value={fileName}
                   onChange={(e) => setFileName(e.target.value)}
                />
             </div>
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 text-center space-y-4">
            {fileData ? (
                <div className="relative inline-block group">
                    <img src={fileData} alt="Preview" className="h-48 object-contain rounded shadow-sm border border-slate-200 bg-white" />
                    <button 
                        onClick={() => { setFileData(null); setFileName(''); }}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow hover:bg-red-700"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="mt-2 text-xs font-medium text-green-600 flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Ready to Save
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-center gap-4">
                        <button 
                            className="flex flex-col items-center justify-center w-32 h-32 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all group"
                            onClick={() => setMode('scan')}
                        >
                            <div className="bg-blue-100 text-blue-600 p-3 rounded-full mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <span className="text-sm font-medium text-slate-700">Smart Camera</span>
                        </button>
                        
                        <label className="flex flex-col items-center justify-center w-32 h-32 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group">
                             <div className="bg-slate-100 text-slate-600 p-3 rounded-full mb-2 group-hover:bg-slate-600 group-hover:text-white transition-colors">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            </div>
                            <span className="text-sm font-medium text-slate-700">Upload File</span>
                            <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                        </label>
                    </div>
                    <p className="text-xs text-slate-400">PDF, JPG, PNG supported</p>
                </>
            )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
             <Button variant="secondary" onClick={onCancel}>Cancel</Button>
             <Button onClick={handleSave} disabled={!fileData || !selectedCaseId || loading}>
                {loading ? 'Saving...' : 'Save to Case File'}
             </Button>
        </div>
      </div>
    </Card>
  );
};
