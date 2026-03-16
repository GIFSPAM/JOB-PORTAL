import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  BookmarkCheck, LogOut, FileText, Calendar,
  User, GraduationCap, Phone, Sparkles, FileBadge2, Download, Upload,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchSeekerStats,
  fetchSeekerApplications,
  fetchSeekerProfile,
  updateSeekerProfile,
  fetchSeekerSavedJobs,
  downloadSeekerResume,
  updateSeekerResume,
  revokeSeekerApplication,
} from '../../api';
import { SeekerApplicationsSection } from '../../components/dashboard/SeekerApplicationsSection';
import { useToast } from '../../components/Toast';
import { PageContainer } from '../../components/layout/PageContainer';

export const SeekerDashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const toast      = useToast();

  const [stats,        setStats]        = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [profile,      setProfile]      = useState<any>(null);
  const [savedJobs,    setSavedJobs]    = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [resumeDownloading, setResumeDownloading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [revokingApplicationId, setRevokingApplicationId] = useState<number | null>(null);
  const [isProfileEditMode, setIsProfileEditMode] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    education: '',
    phone_number: '',
    experience_years: '0',
  });
  const resumeFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    Promise.all([fetchSeekerStats(), fetchSeekerApplications(), fetchSeekerProfile(), fetchSeekerSavedJobs()])
      .then(([s, a, p, saved]) => {
        setStats(s);
        setApplications(a);
        setProfile(p);
        setSavedJobs(saved);
      })
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [toast]);

  const handleLogout = () => { logout(); navigate('/login'); };

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

  const handleRevokeApplication = async (applicationId: number) => {
    setRevokingApplicationId(applicationId);
    try {
      const target = applications.find((item) => Number(item.application_id) === Number(applicationId));
      await revokeSeekerApplication(applicationId);
      setApplications((prev) => prev.filter((item) => Number(item.application_id) !== Number(applicationId)));
      setStats((prev: any) => {
        if (!prev) return prev;
        const statusKey = String(target?.status || '').toLowerCase();
        const currentBucket = Number(prev?.applications_by_status?.[statusKey] ?? 0);
        return {
          ...prev,
          total_applications: Math.max(0, Number(prev.total_applications ?? 0) - 1),
          applications_by_status: {
            ...prev.applications_by_status,
            ...(statusKey
              ? { [statusKey]: Math.max(0, currentBucket - 1) }
              : {}),
          },
        };
      });
      toast.success('Application revoked.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to revoke application';
      toast.error(message);
    } finally {
      setRevokingApplicationId(null);
    }
  };

  const statCards = [
    { label: 'Applications', value: stats?.total_applications ?? applications.length, Icon: FileText,      color: 'text-brand-accent bg-brand-accent/10' },
    { label: 'Saved Jobs',   value: stats?.saved_jobs         ?? 0,                   Icon: BookmarkCheck, color: 'text-yellow-400 bg-yellow-500/10'     },
    { label: 'Shortlisted',  value: stats?.applications_by_status?.shortlisted ?? applications.filter(a => a.status === 'shortlisted').length, Icon: Calendar, color: 'text-green-400 bg-green-500/10' },
    { label: 'Skills',       value: stats?.skills_count       ?? profile?.skills?.length ?? 0, Icon: Sparkles, color: 'text-white bg-white/5' },
  ];

  return (
    <PageContainer>

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            {loading
              ? <div className="h-8 w-56 bg-white/5 rounded-lg animate-pulse" />
              : <h1 className="text-3xl font-display font-bold text-white">{profile?.full_name ?? 'Welcome'}</h1>
            }
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-bold">
                <User className="w-3 h-3" /> Job Seeker
              </span>
              {profile?.education && <span className="text-sm text-text-muted">{profile.education}</span>}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm font-bold text-text-muted hover:text-white hover:border-white/20 transition-all"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {statCards.map(({ label, value, Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card p-6 flex items-center gap-5"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-white">{loading ? '–' : value}</p>
                <p className="text-xs text-text-muted font-bold uppercase tracking-widest">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6">
          <div className="glass-card p-8">
            <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
              <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-brand-accent" /> Profile Snapshot
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
                {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
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

                <div className="rounded-2xl border border-white/5 bg-white/3 p-4 mb-4">
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
                  <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills?.length ? profile.skills.map((skill: any) => (
                      <span key={`${skill.name}-${skill.proficiency}`} className="px-3 py-1.5 rounded-full border border-brand-accent/20 bg-brand-accent/10 text-brand-accent text-xs font-bold capitalize">
                        {skill.name} · {skill.proficiency}
                      </span>
                    )) : <span className="text-sm text-text-muted">No skills added yet.</span>}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-6">
            <div className="glass-card p-8">
              <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-400" /> Application Breakdown
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'Applied', value: stats?.applications_by_status?.applied ?? 0, cls: 'text-brand-accent bg-brand-accent/10 border-brand-accent/20' },
                  { label: 'Shortlisted', value: stats?.applications_by_status?.shortlisted ?? 0, cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
                  { label: 'Rejected', value: stats?.applications_by_status?.rejected ?? 0, cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
                  { label: 'Hired', value: stats?.applications_by_status?.hired ?? 0, cls: 'text-green-400 bg-green-500/10 border-green-500/20' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/3 px-4 py-3">
                    <span className="text-sm font-medium text-white">{item.label}</span>
                    <span className={`px-3 py-1 rounded-full border text-xs font-bold ${item.cls}`}>
                      {loading ? '–' : item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-brand-yellow" /> Saved Jobs
              </h2>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : savedJobs.length === 0 ? (
                <p className="text-sm text-text-muted">No saved jobs yet.</p>
              ) : (
                <div className="space-y-3">
                  {savedJobs.slice(0, 4).map((job, i) => (
                    <div key={job.job_id ?? i} className="rounded-2xl border border-white/5 bg-white/3 p-4">
                      <p className="text-white font-medium">{job.title}</p>
                      <p className="text-xs text-text-muted mt-1">{job.company_name} · {job.location ?? 'Remote'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Applications */}
        <SeekerApplicationsSection
          applications={applications}
          loading={loading}
          revokingApplicationId={revokingApplicationId}
          onRevoke={handleRevokeApplication}
          onBrowseJobs={() => navigate('/explore-jobs')}
        />
    </PageContainer>
  );
};
