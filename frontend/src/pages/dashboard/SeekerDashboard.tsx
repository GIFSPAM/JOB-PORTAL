import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  BookmarkCheck, FileText, Calendar,
  User, Sparkles, ArrowRight,
} from 'lucide-react';
import {
  fetchSeekerOverview,
} from '../../api';
import { useToast } from '../../components/Toast';
import { PageContainer } from '../../components/layout/PageContainer';
import type { SavedJob, SeekerApplication, SeekerProfile, SeekerStats } from '../../types/seeker';

export const SeekerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [stats,        setStats]        = useState<SeekerStats | null>(null);
  const [applications, setApplications] = useState<SeekerApplication[]>([]);
  const [profile,      setProfile]      = useState<SeekerProfile | null>(null);
  const [savedJobs,    setSavedJobs]    = useState<SavedJob[]>([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    fetchSeekerOverview()
      .then(({ stats: seekerStats, applications: seekerApplications, profile: seekerProfile, savedJobs: seekerSavedJobs }) => {
        setStats(seekerStats);
        setApplications(seekerApplications);
        setProfile(seekerProfile);
        setSavedJobs(seekerSavedJobs);
      })
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [toast]);

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
        </div>

        <div className="space-y-6">

            {/* Stats Grid */}
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

            {/* Overview Content */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
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
                <button onClick={() => navigate('/seeker/applications')} className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-brand-accent/20 bg-brand-accent/10 text-brand-accent font-semibold hover:bg-brand-accent/15 transition-all">
                  View All Applications
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="glass-card p-8">
                <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
                  <BookmarkCheck className="w-5 h-5 text-brand-yellow" /> Saved Jobs Preview
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
                <button onClick={() => navigate('/seeker/saved-jobs')} className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 font-semibold hover:bg-yellow-500/15 transition-all">
                  View All Saved Jobs
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Access Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => navigate('/seeker/profile')} className="glass-card p-6 flex items-center justify-between hover:border-brand-accent/40 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-brand-accent/10">
                    <User className="w-5 h-5 text-brand-accent" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Manage Profile</p>
                    <p className="text-xs text-text-muted mt-1">Edit personal info & skills</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-brand-accent transition-colors" />
              </button>

              <button onClick={() => navigate('/explore-jobs')} className="glass-card p-6 flex items-center justify-between hover:border-green-400/40 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500/10">
                    <BookmarkCheck className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Browse Jobs</p>
                    <p className="text-xs text-text-muted mt-1">Explore available positions</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-green-400 transition-colors" />
              </button>
            </div>
        </div>
    </PageContainer>
  );
};
