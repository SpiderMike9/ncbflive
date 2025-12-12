
import React from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { SubscriptionTier } from '../../types';

interface PricingScreenProps {
  onSelectPlan: (tier: SubscriptionTier) => void;
}

export const PricingScreen: React.FC<PricingScreenProps> = ({ onSelectPlan }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 lg:p-8 font-sans">
      <div className="max-w-6xl w-full space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Activate Your Agency's <span className="text-blue-500">Compliance Platform</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the path to zero forfeitures. Simple, transparent pricing for modern bail agents.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Standard Tier */}
          <Card className="bg-slate-800 border-slate-700 text-white flex flex-col relative overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
            <div className="p-6 flex-1">
              <h3 className="text-xl font-bold text-slate-300 mb-2">Standard</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-slate-400">/mo</span>
              </div>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  1 Agent User
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Full Case Management
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="font-semibold text-white">30 AI Interpreter Mins</span>
                </li>
              </ul>
            </div>
            <div className="p-6 pt-0">
               <Button 
                variant="outline" 
                fullWidth 
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                onClick={() => onSelectPlan('Standard')}
               >
                 Select Standard
               </Button>
            </div>
          </Card>

          {/* Professional Tier (Recommended) */}
          <div className="relative transform scale-105 z-10">
            <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-sm opacity-20"></div>
            <Card className="bg-slate-800 border-2 border-blue-500 text-white flex flex-col h-full shadow-2xl relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-b-lg uppercase tracking-wider">
                Recommended
              </div>
              <div className="p-8 flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-bold">$99</span>
                  <span className="text-slate-400">/mo</span>
                </div>
                <ul className="space-y-4 text-base text-slate-200">
                  <li className="flex items-center gap-3">
                    <div className="bg-blue-500/20 p-1 rounded-full">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="font-semibold">3 Agent Users</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-blue-500/20 p-1 rounded-full">
                       <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    Skip Trace Hub Access
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-blue-500/20 p-1 rounded-full">
                       <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="font-bold text-blue-300">60 AI Interpreter Mins</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="bg-blue-500/20 p-1 rounded-full">
                       <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    Unlimited Client Check-ins
                  </li>
                </ul>
              </div>
              <div className="p-8 pt-0 space-y-3">
                 <Button 
                  fullWidth 
                  className="h-14 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                  onClick={() => onSelectPlan('Professional')}
                 >
                   Start 14-Day FREE Trial
                 </Button>
                 <p className="text-center text-xs text-slate-400">
                   No credit card needed. Access all features. Cancel anytime.
                 </p>
              </div>
            </Card>
          </div>

          {/* Ultimate Tier */}
          <Card className="bg-slate-800 border-slate-700 text-white flex flex-col relative overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
            <div className="p-6 flex-1">
              <h3 className="text-xl font-bold text-slate-300 mb-2">Ultimate</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">$199</span>
                <span className="text-slate-400">/mo</span>
              </div>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Unlimited Users
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  API Access & Webhooks
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="font-semibold text-white">Unlimited AI Interpreter</span>
                </li>
              </ul>
            </div>
            <div className="p-6 pt-0">
               <Button 
                variant="outline" 
                fullWidth 
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                onClick={() => onSelectPlan('Ultimate')}
               >
                 Contact Sales
               </Button>
            </div>
          </Card>

        </div>

        <div className="text-center pt-8 pb-8">
            <p className="text-slate-500 text-sm mb-4">
                Already have a subscription? <button className="text-blue-500 hover:underline">Restore Purchase</button>
            </p>
            <p className="text-slate-600 text-xs">
                Copyright Michael Jones 2025 All rights reserved
            </p>
        </div>

      </div>
    </div>
  );
};
