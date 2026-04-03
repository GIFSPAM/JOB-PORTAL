import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { COMPANY_LOGOS } from '../../assets/logos';

interface SeekerProfileHeaderProps {
  fullName?: string;
  avatarUrl?: string;
  onBack: () => void;
}

export const SeekerProfileHeader: React.FC<SeekerProfileHeaderProps> = ({
  fullName,
  avatarUrl,
  onBack,
}) => {
  const profileAvatarSrc = String(avatarUrl ?? '').trim();
  const profileInitial = String(fullName ?? 'S').trim().charAt(0).toUpperCase() || 'S';

  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="flex items-start gap-4 ">
        <div className="w-20 h-20 rounded-full border border-white/15 bg-brand-accent/15 text-brand-accent font-bold text-xl flex items-center justify-center overflow-hidden shrink-0 mt-8">
          {profileAvatarSrc ? (
            <img
              src={profileAvatarSrc}
              alt={String(fullName ?? 'Seeker avatar')}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(event) => {
                event.currentTarget.src = COMPANY_LOGOS.co_opert;
              }}
            />
          ) : (
            profileInitial
          )}
        </div>
        <div>
          <button
            onClick={onBack}
            className="mb-4 text-sm text-text-muted hover:text-white transition-colors inline-flex items-center gap-2 "
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-display font-bold text-white">Seeker Profile</h1>
          <p className="text-text-muted mt-1">Detailed personal profile and activity overview.</p>
        </div>
      </div>
    </div>
  );
};
