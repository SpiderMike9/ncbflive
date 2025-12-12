
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Client, CaseFile, CaseStatus, Indemnitor } from '../../types';
import { createClient, createCase } from '../../services/mockDb';

interface NewCaseIntakeProps {
  onCancel: () => void;
  onComplete: () => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export const NewCaseIntake: React.FC<NewCaseIntakeProps> = ({ onCancel, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // --- NEW: Google Maps State ---
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [structuredAddress, setStructuredAddress] = useState({
    streetNumber: '',
    route: '',
    city: '',
    state: '',
    zip: ''
  });

  // --- NEW: Mugshot State ---
  const [mugshotFile, setMugshotFile] = useState<File | null>(null);
  const [mugshotPreview, setMugshotPreview] = useState<string | null>(null);

  // --- NEW: Premium Rate State ---
  const [premiumRate, setPremiumRate] = useState<number>(15);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Defendant
    firstName: '',
    lastName: '',
    dob: '',
    ssn: '', 
    dlNumber: '',
    bookingNumber: '',
    phone: '',
    secondaryPhone: '',
    email: '',
    address: '', // Full formatted address string
    residencyDuration: '',
    employerName: '',
    employerPhone: '',
    employerAddress: '',
    vehicleMake: '',
    vehicleModel: '',
    vehiclePlate: '',
    vehicleYear: '',
    vehicleColor: '',
    identifyingMarks: '',
    language: 'en',
    
    // Step 2: Indemnitor
    indemName: '',
    indemRel: '',
    indemPhone: '',
    indemEmail: '',
    indemAddress: '',
    indemDob: '',

    // Step 3: Case/Financial
    courtDate: '',
    courtLocation: '',
    county: 'Wake',
    bondAmount: 0,
    premiumCharged: 0, // Calculated automatically
    premiumPaid: 0,
    caseNumber: '',
    charges: '',
    collateralType: '',
    collateralValue: 0,
    poaNumber: ''
  });

  // Load Google Maps Script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      const apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      script.onload = initAutocomplete;
    } else {
      initAutocomplete();
    }
  }, []);

  // Recalculate Premium
  useEffect(() => {
    const bond = Number(formData.bondAmount) || 0;
    const rate = Number(premiumRate) || 0;
    const calculatedPremium = (bond * rate) / 100;
    
    setFormData(prev => {
        if (prev.premiumCharged !== calculatedPremium) {
            return { ...prev, premiumCharged: calculatedPremium };
        }
        return prev;
    });
  }, [formData.bondAmount, premiumRate]);

  const initAutocomplete = () => {
    if (!addressInputRef.current || !window.google) return;
    
    const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'us' },
      fields: ['address_components', 'formatted_address', 'name']
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (!place.address_components) {
        setIsAddressValid(false);
        return;
      }
      
      const getComponent = (type: string) => 
        place.address_components.find((c: any) => c.types.includes(type))?.long_name || '';

      const newStruct = {
        streetNumber: getComponent('street_number'),
        route: getComponent('route'),
        city: getComponent('locality') || getComponent('postal_town'),
        state: getComponent('administrative_area_level_1'),
        zip: getComponent('postal_code')
      };

      setStructuredAddress(newStruct);
      setIsAddressValid(true);
      handleChange('address', place.formatted_address || '');
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMugshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMugshotFile(file);
      setMugshotPreview(URL.createObjectURL(file));
    }
  };

  const handleShareMugshot = async () => {
    if (!mugshotFile) return;

    if (navigator.canShare && navigator.canShare({ files: [mugshotFile] })) {
      try {
        await navigator.share({
          files: [mugshotFile],
          title: 'Defendant Mugshot',
          text: `Intake photo for ${formData.firstName} ${formData.lastName}`
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      alert("Native sharing is not supported on this device/browser.");
    }
  };

  const validateStep = (currentStep: number) => {
    if (currentStep === 1) {
       // Debug mode allows bypass, but ideally we check validity
    }
    return true; 
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    // Create Client Object
    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${formData.firstName} ${formData.lastName}`.trim() || 'Unknown Client',
      phone: formData.phone || 'N/A',
      email: formData.email,
      language: formData.language as 'en' | 'es',
      balance: formData.premiumCharged - formData.premiumPaid,
      nextCourtDate: formData.courtDate || new Date().toISOString(),
      courtLocation: formData.courtLocation,
      caseNumber: formData.caseNumber || 'PENDING',
      photoUrl: mugshotPreview || 'https://via.placeholder.com/150',
      pin: '0000',
      dob: formData.dob,
      ssn: formData.ssn,
      bookingNumber: formData.bookingNumber,
      address: formData.address,
      addressHistory: formData.address ? [{
          address: formData.address,
          dateAdded: new Date().toISOString(),
          isCurrent: true,
          source: 'Intake'
      }] : [],
      employer: {
        name: formData.employerName,
        phone: formData.employerPhone,
        address: formData.employerAddress
      },
      vehicleInfo: {
        make: formData.vehicleMake,
        model: formData.vehicleModel,
        plate: formData.vehiclePlate,
        year: formData.vehicleYear,
        color: formData.vehicleColor
      },
      identifyingMarks: formData.identifyingMarks
    };

    const indemnitors: Indemnitor[] = [];
    if (formData.indemName) {
      indemnitors.push({
        name: formData.indemName,
        relation: formData.indemRel,
        phone: formData.indemPhone,
        email: formData.indemEmail,
        address: formData.indemAddress,
        dob: formData.indemDob
      });
    }

    const newCase: CaseFile = {
      id: Math.random().toString(36).substr(2, 9),
      clientId: newClient.id,
      bondAmount: Number(formData.bondAmount),
      premium: Number(formData.premiumCharged),
      balancePaid: Number(formData.premiumPaid),
      status: CaseStatus.ACTIVE,
      county: formData.county,
      indemnitors: indemnitors,
      poaNumber: formData.poaNumber,
      collateral: formData.collateralType ? {
        type: formData.collateralType,
        value: Number(formData.collateralValue),
        description: formData.collateralType
      } : undefined,
      notes: 'Initial Intake',
      charges: formData.charges ? formData.charges.split(',').map(s => s.trim()) : []
    };

    await new Promise(r => setTimeout(r, 1000));
    createClient(newClient);
    createCase(newCase);
    
    setLoading(false);
    onComplete();
  };

  return (
    <Card className="max-w-4xl mx-auto" title="New Case Intake">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 px-4">
        {[
          { num: 1, title: 'Defendant Info' },
          { num: 2, title: 'Indemnitor' },
          { num: 3, title: 'Financials' },
        ].map((s) => (
          <div key={s.num} className={`flex items-center gap-2 ${step >= s.num ? 'text-teal-600' : 'text-zinc-300'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= s.num ? 'border-teal-600 bg-teal-50' : 'border-zinc-300'}`}>
              {s.num}
            </div>
            <span className="font-semibold hidden sm:inline">{s.title}</span>
            {s.num !== 3 && <div className={`h-0.5 w-12 sm:w-24 ml-2 ${step > s.num ? 'bg-teal-600' : 'bg-zinc-200'}`} />}
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
                <h3 className="text-sm font-bold text-zinc-500 uppercase border-b border-zinc-200 pb-2 mb-4">A. Identity & Mugshot</h3>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3 flex flex-col gap-3">
                         <div className="relative aspect-square bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-lg flex items-center justify-center overflow-hidden hover:bg-zinc-100 transition-colors">
                             {mugshotPreview ? (
                                 <img src={mugshotPreview} alt="Preview" className="w-full h-full object-cover" />
                             ) : (
                                 <div className="text-center p-4">
                                     <span className="text-xs text-zinc-500 font-medium">Upload Mugshot</span>
                                 </div>
                             )}
                             <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleMugshotChange} />
                         </div>
                         <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleShareMugshot}
                            disabled={!mugshotPreview}
                            className="text-xs flex items-center justify-center gap-2"
                         >
                            Share Image
                         </Button>
                    </div>

                    <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4 h-fit">
                        <input className="input-field" placeholder="First Name *" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
                        <input className="input-field" placeholder="Last Name *" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
                        <input type="date" className="input-field" value={formData.dob} onChange={(e) => handleChange('dob', e.target.value)} />
                        <input className="input-field" placeholder="SSN" value={formData.ssn} onChange={(e) => handleChange('ssn', e.target.value)} />
                        <input className="input-field" placeholder="Driver's License #" value={formData.dlNumber} onChange={(e) => handleChange('dlNumber', e.target.value)} />
                        <input className="input-field" placeholder="Booking / Jail ID" value={formData.bookingNumber} onChange={(e) => handleChange('bookingNumber', e.target.value)} />
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-bold text-zinc-500 uppercase border-b border-zinc-200 pb-2 mb-4">B. Verified Residence</h3>
                <div className="space-y-4">
                    <div className="relative">
                        <label className="text-xs font-semibold text-zinc-600 mb-1 block">Address Search</label>
                        <div className="relative">
                            <input 
                                ref={addressInputRef}
                                type="text"
                                className={`input-field pl-10 ${isAddressValid ? 'border-teal-500 ring-1 ring-teal-500' : ''}`}
                                placeholder="Start typing address..."
                            />
                            {isAddressValid && (
                                <svg className="w-5 h-5 text-teal-500 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-bold text-zinc-500 uppercase border-b border-zinc-200 pb-2 mb-4">C. Contact Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className="input-field" placeholder="Primary Phone *" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                    <input className="input-field" placeholder="Secondary Phone" value={formData.secondaryPhone} onChange={(e) => handleChange('secondaryPhone', e.target.value)} />
                </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-sm font-bold text-zinc-500 uppercase border-b border-zinc-200 pb-2 mb-4">Primary Indemnitor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="input-field" placeholder="Full Name" value={formData.indemName} onChange={(e) => handleChange('indemName', e.target.value)} />
                <input className="input-field" placeholder="Relationship" value={formData.indemRel} onChange={(e) => handleChange('indemRel', e.target.value)} />
                <input className="input-field" placeholder="Phone Number" value={formData.indemPhone} onChange={(e) => handleChange('indemPhone', e.target.value)} />
                <input className="input-field" placeholder="Email" value={formData.indemEmail} onChange={(e) => handleChange('indemEmail', e.target.value)} />
                <input className="input-field md:col-span-2" placeholder="Address" value={formData.indemAddress} onChange={(e) => handleChange('indemAddress', e.target.value)} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
                <h3 className="text-sm font-bold text-zinc-500 uppercase border-b border-zinc-200 pb-2 mb-4">Case Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input className="input-field" placeholder="Case Number" value={formData.caseNumber} onChange={(e) => handleChange('caseNumber', e.target.value)} />
                    <input type="date" className="input-field" value={formData.courtDate} onChange={(e) => handleChange('courtDate', e.target.value)} />
                    <select className="input-field" value={formData.county} onChange={(e) => handleChange('county', e.target.value)}>
                        <option>Wake</option>
                        <option>Mecklenburg</option>
                        <option>Durham</option>
                        <option>Guilford</option>
                    </select>
                </div>
                <textarea className="input-field w-full mt-4" placeholder="Charges" rows={2} value={formData.charges} onChange={(e) => handleChange('charges', e.target.value)} />
            </div>

            <div>
                <h3 className="text-sm font-bold text-zinc-500 uppercase border-b border-zinc-200 pb-2 mb-4">Financials</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="col-span-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Total Bond</label>
                        <input type="number" className="input-field font-mono" value={formData.bondAmount} onChange={(e) => handleChange('bondAmount', e.target.value)} />
                    </div>
                    <div className="col-span-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Rate (%)</label>
                        <input type="number" min="1" max="15" className="input-field font-mono" value={premiumRate} onChange={(e) => setPremiumRate(Number(e.target.value))} />
                    </div>
                    <div className="col-span-1">
                        <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Paid Today</label>
                        <input type="number" className="input-field font-mono" value={formData.premiumPaid} onChange={(e) => handleChange('premiumPaid', e.target.value)} />
                    </div>
                </div>
                
                <div className="bg-zinc-50 p-3 rounded mt-4 flex justify-between items-center border border-zinc-200">
                    <span className="text-sm font-bold text-zinc-600">Total Premium:</span>
                    <span className="text-lg font-bold text-teal-600">${formData.premiumCharged.toFixed(2)}</span>
                </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between pt-6 border-t border-zinc-200 mt-8">
          <Button variant="outline" onClick={step === 1 ? onCancel : () => setStep(step - 1)}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          <div className="flex gap-2">
            {step < 3 ? (
              <Button onClick={handleNext}>Next Step</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700">
                {loading ? 'Processing...' : 'Complete Intake'}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        .input-field {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border-radius: 0.5rem;
            border: 1px solid #d4d4d8;
            font-size: 0.875rem;
            outline: none;
            transition: all 0.2s;
            background-color: #fafafa;
        }
        .input-field:focus {
            border-color: #0d9488;
            background-color: #ffffff;
            box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2);
        }
      `}</style>
    </Card>
  );
};
