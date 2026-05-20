import React, { ChangeEvent, RefObject } from 'react';
import { Building2, Image, Globe, MapPin, Phone, Pencil, Upload } from 'lucide-react';
import { COMPANY_LOGOS } from '../../assets/logos';

interface EmployerCompanyDetailsCardProps {
  loading: boolean;
  profile: any;
  editMode: boolean;
  saving: boolean;
  logoUploading: boolean;
  companyName: string;
  industry: string;
  companyLocation: string;
  companySize: string;
  companyPhone: string;
  companyWebsite: string;
  onCompanyNameChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onCompanyLocationChange: (value: string) => void;
  onCompanySizeChange: (value: string) => void;
  onCompanyPhoneChange: (value: string) => void;
  onCompanyWebsiteChange: (value: string) => void;
  onEnableEdit: () => void;
  onCancelEdit: () => void;
  onSaveProfile: () => void;
  logoInputRef: RefObject<HTMLInputElement | null>;
  onLogoUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onTriggerLogoPicker: () => void;
}

export const EmployerCompanyDetailsCard: React.FC<EmployerCompanyDetailsCardProps> = ({
  loading,
  profile,
  editMode,
  saving,
  logoUploading,
  companyName,
  industry,
  companyLocation,
  companySize,
  companyPhone,
  companyWebsite,
  onCompanyNameChange,
  onIndustryChange,
  onCompanyLocationChange,
  onCompanySizeChange,
  onCompanyPhoneChange,
  onCompanyWebsiteChange,
  onEnableEdit,
  onCancelEdit,
  onSaveProfile,
  logoInputRef,
  onLogoUpload,
  onTriggerLogoPicker,
}) => {
  const profileLogoSrc = String(profile?.profile_picture_url ?? profile?.logo_url ?? '').trim() || COMPANY_LOGOS.co_opert;

  return (
    <div className="glass-card p-8">
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-brand-yellow" /> Company Details
        </h2>
        {!loading && (
          <div className="flex items-center gap-2">
            {editMode ? (
              <>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="px-3 py-2 rounded-xl border border-white/10 text-xs font-bold text-text-muted hover:text-white hover:border-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSaveProfile}
                  disabled={saving}
                  className="btn-yellow px-3 py-2 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onEnableEdit}
                className="px-3 py-2 rounded-xl border border-white/10 text-xs font-bold text-white hover:border-brand-accent/40 hover:bg-white/5 transition-all inline-flex items-center gap-2"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit Profile
              </button>
            )}
          </div>
        )}
      </div>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((index) => <div key={index} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Company Name</p>
            {editMode ? (
              <input
                value={companyName}
                onChange={(event) => onCompanyNameChange(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/60"
                placeholder="Company name"
              />
            ) : (
              <p className="text-white font-medium">{profile?.company_name ?? 'Not added'}</p>
            )}
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Industry</p>
            {editMode ? (
              <input
                value={industry}
                onChange={(event) => onIndustryChange(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/60"
                placeholder="Industry"
              />
            ) : (
              <p className="text-white font-medium">{profile?.industry ?? 'Not added'}</p>
            )}
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Location
            </p>
            {editMode ? (
              <input
                value={companyLocation}
                onChange={(event) => onCompanyLocationChange(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/60"
                placeholder="Company location"
              />
            ) : (
              <p className="text-white font-medium">{profile?.company_location ?? 'Not added'}</p>
            )}
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Team Size</p>
            {editMode ? (
              <input
                value={companySize}
                onChange={(event) => onCompanySizeChange(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/60"
                placeholder="Company size"
              />
            ) : (
              <p className="text-white font-medium">{profile?.company_size ?? 'Not added'}</p>
            )}
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" /> Phone
            </p>
            {editMode ? (
              <input
                value={companyPhone}
                onChange={(event) => onCompanyPhoneChange(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/60"
                placeholder="Company phone"
              />
            ) : (
              <p className="text-white font-medium">{profile?.company_phone ?? 'Not added'}</p>
            )}
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Website
            </p>
            {editMode ? (
              <input
                value={companyWebsite}
                onChange={(event) => onCompanyWebsiteChange(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/60"
                placeholder="https://example.com"
              />
            ) : (
              <p className="text-white font-medium break-all">{profile?.company_website ?? 'Not added'}</p>
            )}
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/3 p-4 sm:col-span-2">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
              <Image className="w-4 h-4" /> Company Logo
            </p>
            {editMode ? (
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={onLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={onTriggerLogoPicker}
                  disabled={logoUploading}
                  className="inline-flex items-center justify-center min-w-40 px-4 py-2.5 rounded-xl border border-brand-accent/20 bg-brand-accent/10 text-brand-accent text-sm font-bold hover:bg-brand-accent/15 transition-all disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {logoUploading ? 'Uploading...' : 'Upload Company Logo'}
                </button>
                <p className="text-xs text-text-muted">Image files only</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                  <img
                    src={profileLogoSrc}
                    alt={`${profile?.company_name ?? 'Company'} logo`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(event) => {
                      event.currentTarget.src = COMPANY_LOGOS.co_opert;
                    }}
                  />
                </div>
                <p className="text-white font-medium break-all">
                  {!(profile?.profile_picture_url || profile?.logo_url) && 'No company logo uploaded'}                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
