import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  User,
  GraduationCap,
  Phone,
  FileBadge2,
  Sparkles,
  ArrowLeft,
  Download,
  Upload,
  X,
  Plus,
} from 'lucide-react';
import {
  fetchSeekerOverview,
  fetchSeekerProfile,
  downloadSeekerResume,
  removeSeekerSavedJob,
  updateSeekerResume,
  updateSeekerProfile,
  updateSeekerSkills,
} from '../../api';
import { useToast } from '../../components/Toast';
import { PageContainer } from '../../components/layout/PageContainer';
import { RecentApplicationsCard } from '../../components/profile/RecentApplicationsCard';
import { SavedJobsSummaryCard } from '../../components/profile/SavedJobsSummaryCard';
import type { SavedJob, SeekerApplication, SeekerProfile as SeekerProfileData, SeekerSkill, SeekerStats } from '../../types/seeker';

export const SeekerProfile: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [profile, setProfile] = useState<SeekerProfileData | null>(null);
  const [stats, setStats] = useState<SeekerStats | null>(null);
  const [applications, setApplications] = useState<SeekerApplication[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeDownloading, setResumeDownloading] = useState(false);
  const [removingSavedJobId, setRemovingSavedJobId] = useState<number | null>(null);
  const [isProfileEditMode, setIsProfileEditMode] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    education: '',
    phone_number: '',
    experience_years: '0',
  });
  const [isSkillsEditMode, setIsSkillsEditMode] = useState(false);
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const [skillsForm, setSkillsForm] = useState<SeekerSkill[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState('intermediate');
  const resumeFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchSeekerOverview()
      .then(({ profile: profilePayload, stats: statsPayload, applications: applicationsPayload, savedJobs: savedJobsPayload }) => {
        setProfile(profilePayload);
        setStats(statsPayload);
        setApplications(applicationsPayload);
        setSavedJobs(savedJobsPayload);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [toast]);

  const statItems = [
    { label: 'Applications', value: stats?.total_applications ?? applications.length },
    { label: 'Saved Jobs', value: stats?.saved_jobs ?? savedJobs.length },
    { label: 'Skills', value: stats?.skills_count ?? profile?.skills?.length ?? 0 },
  ];

  const triggerResumePicker = () => {
    resumeFileInputRef.current?.click();
  };

  const handleResumeUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      toast.error('Please upload a PDF resume file.');
      event.target.value = '';
      return;
    }

    setResumeUploading(true);
    try {
      await updateSeekerResume(selectedFile);
      const refreshedProfile = await fetchSeekerProfile();
      setProfile(refreshedProfile);
      toast.success('Resume updated successfully.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update resume';
      toast.error(message);
    } finally {
      setResumeUploading(false);
      event.target.value = '';
    }
  };

  const handleResumeDownload = async () => {
    setResumeDownloading(true);
    try {
      await downloadSeekerResume();
      toast.success('Resume download started.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to download resume';
      toast.error(message);
    } finally {
      setResumeDownloading(false);
    }
  };

  const openProfileEditor = () => {
    setProfileForm({
      full_name: profile?.full_name ?? '',
      education: profile?.education ?? '',
      phone_number: profile?.phone_number ?? '',
      experience_years: String(profile?.experience_years ?? 0),
    });
    setIsProfileEditMode(true);
  };

  const closeProfileEditor = () => {
    setIsProfileEditMode(false);
  };

  const handleProfileFormChange = (field: 'full_name' | 'education' | 'phone_number' | 'experience_years', value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    const parsedExperience = Number(profileForm.experience_years);
    const safeExperience = Number.isFinite(parsedExperience) && parsedExperience >= 0
      ? Math.floor(parsedExperience)
      : 0;

    setIsSavingProfile(true);
    try {
      await updateSeekerProfile({
        full_name: profileForm.full_name.trim(),
        education: profileForm.education.trim(),
        phone_number: profileForm.phone_number.trim(),
        experience_years: safeExperience,
      });

      const refreshedProfile = await fetchSeekerProfile();
      setProfile(refreshedProfile);
      setIsProfileEditMode(false);
      toast.success('Profile updated successfully.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const openSkillsEditor = () => {
    setSkillsForm(profile?.skills?.length ? [...profile.skills] : []);
    setNewSkillName('');
    setNewSkillProficiency('intermediate');
    setIsSkillsEditMode(true);
  };

  const closeSkillsEditor = () => {
    setIsSkillsEditMode(false);
    setSkillsForm([]);
    setNewSkillName('');
  };

  const addSkill = () => {
    if (!newSkillName.trim()) {
      toast.error('Skill name cannot be empty');
      return;
    }
    if (skillsForm.some(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      toast.error('Skill already added');
      return;
    }
    setSkillsForm([...skillsForm, { name: newSkillName.trim(), proficiency: newSkillProficiency }]);
    setNewSkillName('');
    setNewSkillProficiency('intermediate');
  };

  const removeSkill = (index: number) => {
    setSkillsForm((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSkillProficiency = (index: number, proficiency: string) => {
    setSkillsForm((prev) => prev.map((skill, i) => (i === index ? { ...skill, proficiency } : skill)));
  };

  const handleSaveSkills = async () => {
    const allowedProficiency = new Set(['beginner', 'intermediate', 'advanced']);
    const normalizedSkills = skillsForm.map((skill) => ({
      ...skill,
      proficiency: allowedProficiency.has(String(skill.proficiency).toLowerCase())
        ? String(skill.proficiency).toLowerCase()
        : 'intermediate',
    }));

    setIsSavingSkills(true);
    try {
      await updateSeekerSkills(normalizedSkills);
      const refreshedProfile = await fetchSeekerProfile();
      setProfile(refreshedProfile);
      setIsSkillsEditMode(false);
      toast.success('Skills updated successfully.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update skills';
      toast.error(message);
    } finally {
      setIsSavingSkills(false);
    }
  };

  const handleRemoveSavedJob = async (jobId: number) => {
    if (!Number.isInteger(jobId) || jobId <= 0) return;
    setRemovingSavedJobId(jobId);
    try {
      await removeSeekerSavedJob(jobId);
      setSavedJobs((prev) => prev.filter((job) => Number(job.job_id) !== Number(jobId)));
      toast.success('Removed from saved jobs.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to remove saved job';
      toast.error(message);
    } finally {
      setRemovingSavedJobId(null);
    }
  };

  return (
    <PageContainer>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <button
              onClick={() => navigate('/seeker/dashboard')}
              className="mb-4 text-sm text-text-muted hover:text-white transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-display font-bold text-white">Seeker Profile</h1>
            <p className="text-text-muted mt-1">Detailed personal profile and activity overview.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="glass-card p-6"
            >
              <p className="text-xs uppercase tracking-widest text-text-muted font-bold">{item.label}</p>
              <p className="text-3xl font-display font-bold text-white mt-2">{loading ? '–' : item.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="glass-card p-8">
            <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
              <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-brand-accent" /> Profile Details
              </h2>
              {!loading && (
                <button
                  onClick={isProfileEditMode ? closeProfileEditor : openProfileEditor}
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
                  <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Full Name</p>
                    {isProfileEditMode ? (
                      <input
                        value={profileForm.full_name}
                        onChange={(event) => handleProfileFormChange('full_name', event.target.value)}
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
                        onChange={(event) => handleProfileFormChange('education', event.target.value)}
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
                        onChange={(event) => handleProfileFormChange('phone_number', event.target.value)}
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
                        onChange={(event) => handleProfileFormChange('experience_years', event.target.value)}
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
                      onClick={() => void handleSaveProfile()}
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
                        onChange={handleResumeUpload}
                        className="hidden"
                      />
                      <button
                        onClick={triggerResumePicker}
                        disabled={resumeUploading}
                        className="inline-flex items-center justify-center min-w-40 px-4 py-2.5 rounded-xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 text-sm font-bold hover:bg-yellow-500/15 transition-all disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {resumeUploading ? 'Uploading...' : 'Upload New Resume'}
                      </button>
                      <button
                        onClick={() => void handleResumeDownload()}
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
                        onClick={openSkillsEditor}
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
                            onChange={(e) => setNewSkillName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addSkill();
                              }
                            }}
                            placeholder="Add skill name"
                            className="input-field h-10 flex-1 min-w-45 text-sm"
                          />
                          <select
                            value={newSkillProficiency}
                            onChange={(e) => setNewSkillProficiency(e.target.value)}
                            className="input-field h-10 min-w-37.5 text-sm"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                          <button
                            onClick={addSkill}
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
                                  onChange={(e) => updateSkillProficiency(index, e.target.value)}
                                  className="input-field h-8 min-w-35 text-xs"
                                >
                                  <option value="beginner">Beginner</option>
                                  <option value="intermediate">Intermediate</option>
                                  <option value="advanced">Advanced</option>
                                </select>
                                <button
                                  onClick={() => removeSkill(index)}
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
                          onClick={() => void handleSaveSkills()}
                          disabled={isSavingSkills}
                          className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-green-500/20 bg-green-500/10 text-green-400 text-xs font-bold hover:bg-green-500/15 transition-all disabled:opacity-60"
                        >
                          {isSavingSkills ? 'Saving...' : 'Save Skills'}
                        </button>
                        <button
                          onClick={closeSkillsEditor}
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

          <div className="space-y-6">
            <RecentApplicationsCard
              loading={loading}
              applications={applications}
              onViewJob={(jobId) => navigate(`/jobs/${jobId}`)}
            />

            <SavedJobsSummaryCard
              loading={loading}
              savedJobs={savedJobs}
              removingSavedJobId={removingSavedJobId}
              onViewJob={(jobId) => navigate(`/jobs/${jobId}`)}
              onRemoveSavedJob={(jobId) => void handleRemoveSavedJob(jobId)}
            />
          </div>
        </div>
    </PageContainer>
  );
};
