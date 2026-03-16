import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  User,
  GraduationCap,
  Phone,
  FileBadge2,
  Sparkles,
  Briefcase,
  BookmarkCheck,
  ArrowLeft,
  Download,
  Upload,
} from 'lucide-react';
import {
  fetchSeekerProfile,
  fetchSeekerStats,
  fetchSeekerApplications,
  fetchSeekerSavedJobs,
  downloadSeekerResume,
  updateSeekerResume,
} from '../../api';
import { useToast } from '../../components/Toast';
import { PageContainer } from '../../components/layout/PageContainer';

const STATUS_STYLES: Record<string, string> = {
  applied: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  shortlisted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  hired: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export const SeekerProfile: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeDownloading, setResumeDownloading] = useState(false);
  const resumeFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    Promise.all([
      fetchSeekerProfile(),
      fetchSeekerStats(),
      fetchSeekerApplications(),
      fetchSeekerSavedJobs(),
    ])
      .then(([profilePayload, statsPayload, applicationsPayload, savedJobsPayload]) => {
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
            <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-accent" /> Profile Details
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((index) => <div key={index} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Full Name</p>
                    <p className="text-white font-medium">{profile?.full_name ?? 'Not added'}</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" /> Education
                    </p>
                    <p className="text-white font-medium">{profile?.education ?? 'Not added'}</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Phone
                    </p>
                    <p className="text-white font-medium">{profile?.phone_number ?? 'Not added'}</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Experience</p>
                    <p className="text-white font-medium">{profile?.experience_years ?? 0} years</p>
                  </div>
                </div>

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
                  <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills?.length ? profile.skills.map((skill: any) => (
                      <span
                        key={`${skill.name}-${skill.proficiency}`}
                        className="px-3 py-1.5 rounded-full border border-brand-accent/20 bg-brand-accent/10 text-brand-accent text-xs font-bold capitalize"
                      >
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
                <Briefcase className="w-5 h-5 text-brand-accent" /> Recent Applications
              </h2>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((index) => <div key={index} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : applications.length === 0 ? (
                <p className="text-sm text-text-muted">No applications yet.</p>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 5).map((app, index) => {
                    const cls = STATUS_STYLES[app.status?.toLowerCase()] ?? 'bg-white/5 text-text-muted border-white/10';
                    return (
                      <div key={app.application_id ?? index} className="rounded-2xl border border-white/5 bg-white/3 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-white font-medium truncate">{app.title ?? 'Untitled job'}</p>
                          <span className={`px-2.5 py-1 rounded-full border text-xs font-bold capitalize ${cls}`}>{app.status ?? 'applied'}</span>
                        </div>
                        <p className="text-xs text-text-muted mt-1">{app.company_name ?? 'Unknown company'}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="glass-card p-8">
              <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-brand-yellow" /> Saved Jobs
              </h2>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((index) => <div key={index} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : savedJobs.length === 0 ? (
                <p className="text-sm text-text-muted">No saved jobs yet.</p>
              ) : (
                <div className="space-y-3">
                  {savedJobs.slice(0, 5).map((job, index) => (
                    <div key={job.job_id ?? index} className="rounded-2xl border border-white/5 bg-white/3 p-4">
                      <p className="text-white font-medium">{job.title}</p>
                      <p className="text-xs text-text-muted mt-1">{job.company_name} · {job.location ?? 'Remote'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
    </PageContainer>
  );
};
