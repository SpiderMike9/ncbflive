import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Client, CaseFile, CaseStatus, Indemnitor } from '../../types';
import { createClient, createCase } from '../../services/mockDb';

interface NewCaseIntakeProps {
  onCancel: () => void;
  onComplete: () => void;
}

export const NewCaseIntake: React.FC<NewCaseIntakeProps> = ({ onCancel, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Defendant
    firstName: '',
    lastName: '',
    dob: '',
    ssn: '', // Full ssn for intake, masked in viewing
    dlNumber: '',
    bookingNumber: '',
    phone: '',
    secondaryPhone: '',
    email: '',
    address: '',
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
    premiumCharged: 0,
    premiumPaid: 0,
    caseNumber: '',
    charges: '',
    collateralType: '',
    collateralValue: 0,
    poaNumber: ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (currentStep: number) => {
    // Basic validation logic
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.courtDate) return false;
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
      name: `${formData.firstName} ${formData.lastName}`,
      phone: formData.phone,
      email: formData.email,
      language: formData.language as 'en' | 'es',
      balance: formData.premiumCharged - formData.premiumPaid,
      nextCourtDate: formData.courtDate,
      courtLocation: formData.courtLocation,
      caseNumber: formData.caseNumber,
      photoUrl: 'https://via.placeholder.com/150', // Placeholder
      pin: '0000', // Default PIN for new users
      dob: formData.dob,
      ssn: formData.ssn,
      bookingNumber: formData.bookingNumber,
      address: formData.address,
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

    // Create Indemnitor Array
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

    // Create Case Object
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
      charges: formData.charges.split(',').map(s => s.trim())
    };

    // Simulate API Call
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
          <div key={s.num} className={`flex items-center gap-2 ${step >= s.num ? 'text-blue-600' : 'text-slate-300'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 ${step >= s.num ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>
              {s.num}
            </div>
            <span className="font-semibold hidden sm:inline">{s.title}</span>
            {s.num !== 3 && <div className={`h-0.5 w-12 sm:w-24 ml-2 ${step > s.num ? 'bg-blue-600' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase border-b border-slate-200 pb-2 mb-4">A. Legal & Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input className="input-field" placeholder="First Name *" value={formData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
                    <input className="input-field" placeholder="Last Name *" value={formData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
                    <input type="date" className="input-field" value={formData.dob} onChange={(e) => handleChange('dob', e.target.value)} />
                    <input className="input-field" placeholder="SSN" value={formData.ssn} onChange={(e) => handleChange('ssn', e.target.value)} />
                    <input className="input-field" placeholder="Driver's License #" value={formData.dlNumber} onChange={(e) => handleChange('dlNumber', e.target.value)} />
                    <input className="input-field" placeholder="Booking / Jail ID" value={formData.bookingNumber} onChange={(e) => handleChange('bookingNumber', e.target.value)} />
                </div>
            </div>

            <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase border-b border-slate-200 pb-2 mb-4">B. Contact & Skip Tracing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className="input-field" placeholder="Primary Phone *" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                    <input className="input-field" placeholder="Secondary Phone" value={formData.secondaryPhone} onChange={(e) => handleChange('secondaryPhone', e.target.value)} />
                    <input className="input-field md:col-span-2" placeholder="Full Residential Address" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} />
                </div>
            </div>

            <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase border-b border-slate-200 pb-2 mb-4">C. Locating Factors</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                     <input className="input-field" placeholder="Employer Name" value={formData.employerName} onChange={(e) => handleChange('employerName', e.target.value)} />
                     <input className="input-field" placeholder="Employer Phone" value={formData.employerPhone} onChange={(e) => handleChange('employerPhone', e.target.value)} />
                     <input className="input-field" placeholder="Vehicle (Year/Make/Model)" value={formData.vehicleModel} onChange={(e) => handleChange('vehicleModel', e.target.value)} />
                     <input className="input-field" placeholder="Plate #" value={formData.vehiclePlate} onChange={(e) => handleChange('vehiclePlate', e.target.value)} />
                     <input className="input-field md:col-span-2" placeholder="Tattoos / Identifying Marks" value={formData.identifyingMarks} onChange={(e) => handleChange('identifyingMarks', e.target.value)} />
                </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-sm font-bold text-slate-500 uppercase border-b border-slate-200 pb-2 mb-4">Primary Indemnitor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="input-field" placeholder="Full Name" value={formData.indemName} onChange={(e) => handleChange('indemName', e.target.value)} />
                <input className="input-field" placeholder="Relationship to Defendant" value={formData.indemRel} onChange={(e) => handleChange('indemRel', e.target.value)} />
                <input className="input-field" placeholder="Phone Number" value={formData.indemPhone} onChange={(e) => handleChange('indemPhone', e.target.value)} />
                <input className="input-field" placeholder="Email Address" value={formData.indemEmail} onChange={(e) => handleChange('indemEmail', e.target.value)} />
                <input className="input-field md:col-span-2" placeholder="Residential Address" value={formData.indemAddress} onChange={(e) => handleChange('indemAddress', e.target.value)} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase border-b border-slate-200 pb-2 mb-4">Case Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input className="input-field" placeholder="Case Number (e.g., 23CR...)" value={formData.caseNumber} onChange={(e) => handleChange('caseNumber', e.target.value)} />
                    <input type="date" className="input-field" placeholder="Court Date" value={formData.courtDate} onChange={(e) => handleChange('courtDate', e.target.value)} />
                    <select className="input-field" value={formData.county} onChange={(e) => handleChange('county', e.target.value)}>
                        <option>Wake</option>
                        <option>Mecklenburg</option>
                        <option>Durham</option>
                        <option>Guilford</option>
                    </select>
                </div>
                <textarea className="input-field w-full mt-4" placeholder="Charges (comma separated)" rows={2} value={formData.charges} onChange={(e) => handleChange('charges', e.target.value)} />
            </div>

            <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase border-b border-slate-200 pb-2 mb-4">Financials & Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label className="text-xs text-slate-500">Total Bond Amount</label>
                        <div className="flex items-center"><span className="mr-2">$</span><input type="number" className="input-field" value={formData.bondAmount} onChange={(e) => handleChange('bondAmount', e.target.value)} /></div>
                    </div>
                    <div className="col-span-1">
                        <label className="text-xs text-slate-500">Premium Charged (15%)</label>
                        <div className="flex items-center"><span className="mr-2">$</span><input type="number" className="input-field" value={formData.premiumCharged} onChange={(e) => handleChange('premiumCharged', e.target.value)} /></div>
                    </div>
                    <div className="col-span-1">
                        <label className="text-xs text-slate-500">Premium Paid Today</label>
                        <div className="flex items-center"><span className="mr-2">$</span><input type="number" className="input-field" value={formData.premiumPaid} onChange={(e) => handleChange('premiumPaid', e.target.value)} /></div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                     <input className="input-field" placeholder="Collateral Type (e.g. Car Title)" value={formData.collateralType} onChange={(e) => handleChange('collateralType', e.target.value)} />
                     <input className="input-field" placeholder="POA Number (Power of Attorney)" value={formData.poaNumber} onChange={(e) => handleChange('poaNumber', e.target.value)} />
                </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between pt-6 border-t border-slate-200 mt-8">
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
      
      {/* Styles for inputs handled via Tailwind utility class abstraction or plain CSS in index */}
      <style>{`
        .input-field {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border-radius: 0.5rem;
            border: 1px solid #cbd5e1;
            font-size: 0.875rem;
            outline: none;
            transition: all 0.2s;
        }
        .input-field:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </Card>
  );
};