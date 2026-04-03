import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Users, TrendingUp, Building2, Globe, MapPin, Phone, BadgeCheck } from 'lucide-react';
import { fetchEmployerStats, fetchEmployerJobs, fetchEmployerProfile } from '../../api';
import { useToast } from '../../components/Toast';
import { PageContainer } from '../../components/layout/PageContainer';

export const EmployerDashboard: React.FC = () => {
  const toast      = useToast();

  const [stats,   setStats]   = useState<any>(null);
  const [jobs,    setJobs]    = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchEmployerStats(), fetchEmployerJobs(), fetchEmployerProfile()])
      .then(([s, j, p]) => { setStats(s); setJobs(j); setProfile(p); })
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [toast]);

  const statCards = [
    { label: 'Jobs Posted',      value: stats?.total_jobs       ?? jobs.length,                              Icon: Briefcase,  color: 'text-yellow-400 bg-yellow-500/10' },
    { label: 'Total Applicants', value: stats?.total_applications ?? 0,                                       Icon: Users,      color: 'text-brand-accent bg-brand-accent/10' },
    { label: 'Open Listings',    value: stats?.open_jobs        ?? jobs.filter(j => j.status === 'open').length, Icon: TrendingUp, color: 'text-green-400 bg-green-500/10' },
    { label: 'Verified Jobs',    value: stats?.verified_jobs    ?? jobs.filter(j => j.is_verified).length, Icon: BadgeCheck, color: 'text-white bg-white/5' },
  ];

  return (
    <PageContainer>

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            {loading
              ? <div className="h-8 w-56 bg-white/5 rounded-lg animate-pulse" />
              : <h1 className="text-3xl font-display font-bold text-white">{profile?.company_name ?? 'Your Company'}</h1>
            }
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold">
                <Building2 className="w-3 h-3" /> Employer
              </span>
              {profile?.industry && <span className="text-sm text-text-muted">{profile.industry}</span>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="tile-grid">
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

        <div className="tile-grid-details">
          <div className="glass-card p-8">
            <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-brand-yellow" /> Company Profile
            </h2>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <div className="tile-grid-fields">
                <div className="tile-card">
                  <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Company Name</p>
                  <p className="text-white font-medium">{profile?.company_name ?? 'Not added'}</p>
                </div>
                <div className="tile-card">
                  <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Industry</p>
                  <p className="text-white font-medium">{profile?.industry ?? 'Not added'}</p>
                </div>
                <div className="tile-card">
                  <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Location
                  </p>
                  <p className="text-white font-medium">{profile?.company_location ?? 'Not added'}</p>
                </div>
                <div className="tile-card">
                  <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Team Size</p>
                  <p className="text-white font-medium">{profile?.company_size ?? 'Not added'}</p>
                </div>
                <div className="tile-card">
                  <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Phone
                  </p>
                  <p className="text-white font-medium">{profile?.company_phone ?? 'Not added'}</p>
                </div>
                <div className="tile-card">
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
              <Users className="w-5 h-5 text-brand-accent" /> Hiring Pipeline
            </h2>
            <div className="space-y-3 mb-6">
              {[
                { label: 'Applied', value: stats?.applications_by_status?.applied ?? 0, cls: 'text-brand-accent bg-brand-accent/10 border-brand-accent/20' },
                { label: 'Shortlisted', value: stats?.applications_by_status?.shortlisted ?? 0, cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
                { label: 'Rejected', value: stats?.applications_by_status?.rejected ?? 0, cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
                { label: 'Hired', value: stats?.applications_by_status?.hired ?? 0, cls: 'text-green-400 bg-green-500/10 border-green-500/20' },
              ].map((item) => (
                <div key={item.label} className="tile-card flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium text-white">{item.label}</span>
                  <span className={`px-3 py-1 rounded-full border text-xs font-bold ${item.cls}`}>{loading ? '–' : item.value}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="tile-card text-center">
                <p className="text-xl font-display font-bold text-white">{loading ? '–' : stats?.open_jobs ?? 0}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mt-1">Open</p>
              </div>
              <div className="tile-card text-center">
                <p className="text-xl font-display font-bold text-white">{loading ? '–' : stats?.closed_jobs ?? 0}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mt-1">Closed</p>
              </div>
              <div className="tile-card text-center">
                <p className="text-xl font-display font-bold text-white">{loading ? '–' : stats?.verified_jobs ?? 0}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mt-1">Verified</p>
              </div>
            </div>
          </div>
        </div>
    </PageContainer>
  );
};
