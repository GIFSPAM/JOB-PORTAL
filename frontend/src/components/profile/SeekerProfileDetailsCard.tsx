import React, { ChangeEvent, RefObject } from 'react';
import { User, Image, GraduationCap, Phone, FileBadge2, Sparkles, Download, Upload, X, Plus } from 'lucide-react';
import type { SeekerProfile, SeekerSkill } from '../../types/seeker';
import { COMPANY_LOGOS } from '../../assets/logos';


interface SeekerProfileForm {
  full_name: string;
  education: string;
  phone_number: string;
  experience_years: string;
}

interface SeekerProfileDetailsCardProps {
  loading: boolean;
  profile: SeekerProfile | null;
  profileForm: SeekerProfileForm;
  isProfileEditMode: boolean;
  isSavingProfile: boolean;
  onToggleProfileEditor: () => void;
  onProfileFormChange: (field: keyof SeekerProfileForm, value: string) => void;
  onSaveProfile: () => void;
  profileImageInputRef: RefObject<HTMLInputElement | null>;
  onProfileImageUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onTriggerProfileImagePicker: () => void;
  profileImageUploading: boolean;
  resumeFileInputRef: RefObject<HTMLInputElement | null>;
  onResumeUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onTriggerResumePicker: () => void;
  resumeUploading: boolean;
  resumeDownloading: boolean;
  onResumeDownload: () => void;
  isSkillsEditMode: boolean;
  isSavingSkills: boolean;
  onOpenSkillsEditor: () => void;
  onCloseSkillsEditor: () => void;
  newSkillName: string;
  onNewSkillNameChange: (value: string) => void;
  newSkillProficiency: string;
  onNewSkillProficiencyChange: (value: string) => void;
  onAddSkill: () => void;
  skillsForm: SeekerSkill[];
  onUpdateSkillProficiency: (index: number, value: string) => void;
  onRemoveSkill: (index: number) => void;
  onSaveSkills: () => void;
}

export const SeekerProfileDetailsCard: React.FC<SeekerProfileDetailsCardProps> = ({
  loading,
  profile,
  profileForm,
  isProfileEditMode,
  isSavingProfile,
  onToggleProfileEditor,
  onProfileFormChange,
  onSaveProfile,
  profileImageInputRef,
  onProfileImageUpload,
  onTriggerProfileImagePicker,
  profileImageUploading,
  resumeFileInputRef,
  onResumeUpload,
  onTriggerResumePicker,
  resumeUploading,
  resumeDownloading,
  onResumeDownload,
  isSkillsEditMode,
  isSavingSkills,
  onOpenSkillsEditor,
  onCloseSkillsEditor,
  newSkillName,
  onNewSkillNameChange,
  newSkillProficiency,
  onNewSkillProficiencyChange,
  onAddSkill,
  skillsForm,
  onUpdateSkillProficiency,
  onRemoveSkill,
  onSaveSkills,
}) => {
  const profileAvatarSrc = String(profile?.profile_picture_url ?? '').trim();
  const profileInitial = String(profile?.full_name ?? 'S').trim().charAt(0).toUpperCase() || 'S';

  return (
    <div className="glass-card p-8">
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-brand-accent" /> Profile Details
        </h2>
        {!loading && (
          <button
            onClick={onToggleProfileEditor}
            disabled={isSavingProfile}
            className="inline-flex items-center justify-center min-w-40 px-4 py-2.5 rounded-xl border border-brand-accent/20 bg-brand-accent/10 text-brand-accent text-sm font-bold hover:bg-brand-accent/15 transition-all disabled:opacity-60"
          >
            {isProfileEditMode ? 'Close Editor' : 'Update Profile'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((index) => <div key={index} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl border border-white/5 bg-white/3 p-4 sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                <Image className="w-4 h-4" /> PROFILE
              </p>
              <div className="flex items-center gap-3 flex-wrap ">
                <div className="w-20 h-20 rounded-full border border-white/15 bg-brand-accent/15 text-brand-accent font-bold flex items-center justify-center overflow-hidden">
                  {profileAvatarSrc || COMPANY_LOGOS.co_opert ? (
                    <img
                      src={profileAvatarSrc || COMPANY_LOGOS.co_opert}
                      alt={String(profile?.full_name ?? 'Seeker avatar')}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    profileInitial
                  )}
                </div>
                {isProfileEditMode && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      ref={profileImageInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      onChange={onProfileImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={onTriggerProfileImagePicker}
                      disabled={profileImageUploading}
                      className="inline-flex items-center justify-center min-w-40 px-4 py-2.5 rounded-xl border border-brand-accent/20 bg-brand-accent/10 text-brand-accent text-sm font-bold hover:bg-brand-accent/15 transition-all disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {profileImageUploading ? 'Uploading...' : 'Upload Profile Photo'}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Full Name</p>
              {isProfileEditMode ? (
                <input
                  value={profileForm.full_name}
                  onChange={(event) => onProfileFormChange('full_name', event.target.value)}
                  placeholder="Your full name"
                  className="input-field h-11"
                />
              ) : (
                <p className="text-white font-medium">{profile?.full_name ?? 'Not added'}</p>
              )}
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Education
              </p>
              {isProfileEditMode ? (
                <input
                  value={profileForm.education}
                  onChange={(event) => onProfileFormChange('education', event.target.value)}
                  placeholder="Your education"
                  className="input-field h-11"
                />
              ) : (
                <p className="text-white font-medium">{profile?.education ?? 'Not added'}</p>
              )}
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Phone
              </p>
              {isProfileEditMode ? (
                <input
                  value={profileForm.phone_number}
                  onChange={(event) => onProfileFormChange('phone_number', event.target.value)}
                  placeholder="Your phone number"
                  className="input-field h-11"
                />
              ) : (
                <p className="text-white font-medium">{profile?.phone_number ?? 'Not added'}</p>
              )}
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Experience</p>
              {isProfileEditMode ? (
                <input
                  type="number"
                  min={0}
                  value={profileForm.experience_years}
                  onChange={(event) => onProfileFormChange('experience_years', event.target.value)}
                  className="input-field h-11"
                />
              ) : (
                <p className="text-white font-medium">{profile?.experience_years ?? 0} years</p>
              )}
            </div>
          </div>

          {isProfileEditMode && (
            <div className="flex justify-end mb-6">
              <button
                onClick={onSaveProfile}
                disabled={isSavingProfile}
                className="inline-flex items-center justify-center min-w-40 px-4 py-2.5 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 text-sm font-bold hover:bg-green-500/15 transition-all disabled:opacity-60"
              >
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          <div className="rounded-2xl border border-white/5 bg-white/3 p-4 mb-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                  <FileBadge2 className="w-4 h-4" /> Resume
                </p>
                <p className="text-white font-medium">{profile?.resume_filename ?? 'No resume uploaded yet'}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  ref={resumeFileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={onResumeUpload}
                  className="hidden"
                />
                <button
                  onClick={onTriggerResumePicker}
                  disabled={resumeUploading}
                  className="inline-flex items-center justify-center min-w-40 px-4 py-2.5 rounded-xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 text-sm font-bold hover:bg-yellow-500/15 transition-all disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {resumeUploading ? 'Uploading...' : 'Upload New Resume'}
                </button>
                <button
                  onClick={onResumeDownload}
                  disabled={!profile?.resume_filename || resumeDownloading}
                  className="inline-flex items-center justify-center min-w-40 px-4 py-2.5 rounded-xl border border-brand-accent/20 bg-brand-accent/10 text-brand-accent text-sm font-bold hover:bg-brand-accent/15 transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {resumeDownloading ? 'Downloading...' : 'Download Resume'}
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Skills
              </p>
              {!isSkillsEditMode && (
                <button
                  onClick={onOpenSkillsEditor}
                  disabled={isSavingSkills}
                  className="text-xs font-bold text-brand-accent hover:text-brand-accent/80 transition-colors disabled:opacity-60"
                >
                  Edit Skills
                </button>
              )}
            </div>

            {isSkillsEditMode ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={newSkillName}
                      onChange={(e) => onNewSkillNameChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          onAddSkill();
                        }
                      }}
                      placeholder="Add skill name"
                      className="input-field h-10 flex-1 min-w-45 text-sm"
                    />
                    <select
                      value={newSkillProficiency}
                      onChange={(e) => onNewSkillProficiencyChange(e.target.value)}
                      className="input-field h-10 min-w-37.5 text-sm"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                    <button
                      onClick={onAddSkill}
                      className="inline-flex items-center justify-center px-3 h-10 rounded-lg border border-brand-accent/20 bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/15 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {skillsForm.length > 0 ? (
                    skillsForm.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3 rounded-xl border border-brand-accent/20 bg-brand-accent/10 px-3 py-2"
                      >
                        <span className="text-xs font-bold text-brand-accent capitalize">{skill.name}</span>
                        <div className="flex items-center gap-2">
                          <select
                            value={skill.proficiency}
                            onChange={(e) => onUpdateSkillProficiency(index, e.target.value)}
                            className="input-field h-8 min-w-35 text-xs"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                          <button
                            onClick={() => onRemoveSkill(index)}
                            className="inline-flex items-center justify-center rounded-md p-1 text-text-muted hover:text-red-400 transition-colors"
                            aria-label={`Remove ${skill.name}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-text-muted">No skills added yet.</span>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={onSaveSkills}
                    disabled={isSavingSkills}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-green-500/20 bg-green-500/10 text-green-400 text-xs font-bold hover:bg-green-500/15 transition-all disabled:opacity-60"
                  >
                    {isSavingSkills ? 'Saving...' : 'Save Skills'}
                  </button>
                  <button
                    onClick={onCloseSkillsEditor}
                    disabled={isSavingSkills}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-white/10 text-text-muted text-xs font-bold hover:text-white transition-all disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile?.skills?.length ? profile.skills.map((skill) => (
                  <span
                    key={`${skill.name}-${skill.proficiency}`}
                    className="px-3 py-1.5 rounded-full border border-brand-accent/20 bg-brand-accent/10 text-brand-accent text-xs font-bold capitalize"
                  >
                    {skill.name} · {skill.proficiency}
                  </span>
                )) : <span className="text-sm text-text-muted">No skills added yet.</span>}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
