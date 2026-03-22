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
  Pencil,
} from 'lucide-react';
import { fetchEmployerProfile, fetchEmployerJobs, fetchEmployerStats, updateEmployerProfile } from '../../api';
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
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

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

  useEffect(() => {
    if (!profile) return;
    setCompanyName(String(profile.company_name ?? ''));
    setIndustry(String(profile.industry ?? ''));
    setCompanyLocation(String(profile.company_location ?? ''));
    setCompanySize(String(profile.company_size ?? ''));
    setCompanyPhone(String(profile.company_phone ?? ''));
    setCompanyWebsite(String(profile.company_website ?? ''));
  }, [profile]);

  const resetProfileDraft = () => {
    setCompanyName(String(profile?.company_name ?? ''));
    setIndustry(String(profile?.industry ?? ''));
    setCompanyLocation(String(profile?.company_location ?? ''));
    setCompanySize(String(profile?.company_size ?? ''));
    setCompanyPhone(String(profile?.company_phone ?? ''));
    setCompanyWebsite(String(profile?.company_website ?? ''));
  };

  const handleSaveProfile = async () => {
    const payload = {
      company_name: companyName.trim(),
      industry: industry.trim(),
      company_location: companyLocation.trim(),
      company_size: companySize.trim(),
      company_phone: companyPhone.trim(),
      company_website: companyWebsite.trim(),
    };

    setSaving(true);
    try {
      await updateEmployerProfile(payload);
      setProfile((prev: any) => ({ ...prev, ...payload }));
      toast.success('Profile updated successfully.');
      setEditMode(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

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
                      onClick={() => {
                        resetProfileDraft();
                        setEditMode(false);
                      }}
                      className="px-3 py-2 rounded-xl border border-white/10 text-xs font-bold text-text-muted hover:text-white hover:border-white/20 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleSaveProfile()}
                      disabled={saving}
                      className="btn-yellow px-3 py-2 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
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
                    onChange={(event) => setCompanyName(event.target.value)}
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
                    onChange={(event) => setIndustry(event.target.value)}
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
                    onChange={(event) => setCompanyLocation(event.target.value)}
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
                    onChange={(event) => setCompanySize(event.target.value)}
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
                    onChange={(event) => setCompanyPhone(event.target.value)}
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
                    onChange={(event) => setCompanyWebsite(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/60"
                    placeholder="https://example.com"
                  />
                ) : (
                  <p className="text-white font-medium break-all">{profile?.company_website ?? 'Not added'}</p>
                )}
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
