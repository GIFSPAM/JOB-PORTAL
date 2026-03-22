import React from 'react';
import { COMPANY_LOGOS } from '../../assets/logos';

export const HomeCompanyLogosStrip: React.FC = () => (
  <div className="max-w-7xl mx-auto px-6 mt-20">
    <div className="flex flex-wrap justify-center items-center gap-12 opacity-20 grayscale hover:grayscale-0 hover:opacity-50 transition-all duration-500">
      <img src={COMPANY_LOGOS.microsoft} className="h-5" alt="Microsoft" referrerPolicy="no-referrer" />
      <img src={COMPANY_LOGOS.google} className="h-5" alt="Google" referrerPolicy="no-referrer" />
      <img src={COMPANY_LOGOS.amazon} className="h-5" alt="Amazon" referrerPolicy="no-referrer" />
      <img src={COMPANY_LOGOS.apple} className="h-5" alt="Apple" referrerPolicy="no-referrer" />
      <img src={COMPANY_LOGOS.netflix} className="h-5" alt="Netflix" referrerPolicy="no-referrer" />
    </div>
  </div>
);
