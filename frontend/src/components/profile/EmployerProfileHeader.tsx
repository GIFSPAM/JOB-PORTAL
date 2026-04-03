import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { COMPANY_LOGOS } from '../../assets/logos';

interface EmployerProfileHeaderProps {
  companyName?: string;
  logoUrl?: string;
  onBack: () => void;
}

export const EmployerProfileHeader: React.FC<EmployerProfileHeaderProps> = ({
  companyName,
  logoUrl,
  onBack,
}) => {
  const profileLogoSrc = String(logoUrl ?? '').trim() || COMPANY_LOGOS.co_opert;

  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/5 overflow-hidden shrink-0">
          <img
            src={profileLogoSrc}
            alt={`${companyName ?? 'Company'} logo`}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(event) => {
              event.currentTarget.src = COMPANY_LOGOS.co_opert;
            }}
          />
        </div>
        <div>
          <button
            onClick={onBack}
            className="mb-4 text-sm text-text-muted hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-display font-bold text-white">Employer Profile</h1>
          <p className="text-text-muted mt-1">Detailed company profile and posted jobs overview.</p>
        </div>
      </div>
    </div>
  );
};
