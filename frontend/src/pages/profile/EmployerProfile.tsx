import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Building2,
  Globe,
  MapPin,
  Phone,
  Users,
  Briefcase,
  TrendingUp,
  BadgeCheck,
  ArrowLeft,
} from 'lucide-react';
import { fetchEmployerProfile, fetchEmployerJobs, fetchEmployerStats } from '../../api';
import { useToast } from '../../components/Toast';

const JOB_STATUS: Record<string, string> = {
  open: 'bg-green-500/10 text-green-400 border-green-500/20',
  closed: 'bg-white/5 text-text-muted border-white/10',
};

export const EmployerProfile: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchEmployerProfile(), fetchEmployerJobs(), fetchEmployerStats()])
      .then(([profilePayload, jobsPayload, statsPayload]) => {
        setProfile(profilePayload);
        setJobs(jobsPayload);
        setStats(statsPayload);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [toast]);

  const totalApplicants = useMemo(
    () => Number(stats?.total_applications ?? 0),
    [stats],
  );

  const statItems = [
    { label: 'Jobs Posted', value: stats?.total_jobs ?? jobs.length, Icon: Briefcase, color: 'text-yellow-400 bg-yellow-500/10' },
    { label: 'Open Listings', value: stats?.open_jobs ?? jobs.filter((job) => job.status === 'open').length, Icon: TrendingUp, color: 'text-green-400 bg-green-500/10' },
    { label: 'Verified Jobs', value: stats?.verified_jobs ?? jobs.filter((job) => job.is_verified).length, Icon: BadgeCheck, color: 'text-white bg-white/5' },
    { label: 'Applicants', value: totalApplicants, Icon: Users, color: 'text-brand-accent bg-brand-accent/10' },
  ];

  return (
    <section className="pt-28 pb-16 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <button
              onClick={() => navigate('/employer/dashboard')}
              className="mb-4 text-sm text-text-muted hover:text-white transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-display font-bold text-white">Employer Profile</h1>
            <p className="text-text-muted mt-1">Detailed company profile and posted jobs overview.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {statItems.map(({ label, value, Icon, color }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="glass-card p-6 flex items-center gap-5"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-white">{loading ? '–' : value}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="glass-card p-8">
          <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-yellow" /> Company Details
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((index) => <div key={index} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Company Name</p>
                <p className="text-white font-medium">{profile?.company_name ?? 'Not added'}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Industry</p>
                <p className="text-white font-medium">{profile?.industry ?? 'Not added'}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Location
                </p>
                <p className="text-white font-medium">{profile?.company_location ?? 'Not added'}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Team Size</p>
                <p className="text-white font-medium">{profile?.company_size ?? 'Not added'}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone
                </p>
                <p className="text-white font-medium">{profile?.company_phone ?? 'Not added'}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/3 p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Website
                </p>
                <p className="text-white font-medium break-all">{profile?.company_website ?? 'Not added'}</p>
              </div>
            </div>
          )}
        </div>

        <div className="glass-card p-8">
          <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-yellow" /> Jobs Posted
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((index) => <div key={index} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-10">No jobs posted yet.</p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job, index) => {
                const statusClass = JOB_STATUS[job.status?.toLowerCase()] ?? JOB_STATUS.closed;
                return (
                  <div key={job.job_id ?? index} className="rounded-2xl border border-white/5 bg-white/3 p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-white font-semibold">{job.title}</p>
                        <p className="text-sm text-text-muted mt-1">{job.location ?? 'No location'} · {job.job_type ?? 'No type'}</p>
                        {job.salary_min && job.salary_max && (
                          <p className="text-xs text-text-muted mt-1">Salary: ${Number(job.salary_min).toLocaleString()} - ${Number(job.salary_max).toLocaleString()}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full border text-xs font-bold capitalize ${statusClass}`}>
                          {job.status ?? 'closed'}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${job.is_verified ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                          {job.is_verified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
