import React from 'react';
import {
  Users,
  BadgeCheck,
  UserRound,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import type { AdminJob, AdminStats, AdminUser } from '../../types/admin';

const ROLE_COLOR: Record<string, string> = {
  jobseeker: 'bg-brand-accent/10 text-brand-accent border-brand-accent/20',
  employer: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  admin: 'bg-white/5 text-white border-white/10',
};

interface AdminOverviewTabProps {
  loading: boolean;
  stats: AdminStats | null;
  users: AdminUser[];
  jobs: AdminJob[];
  pendingJobs: AdminJob[];
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  loading,
  stats,
  users,
  jobs,
  pendingJobs,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-card p-8">
        <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
          <UserRound className="w-5 h-5 text-brand-accent" /> Platform User Mix
        </h2>
        <div className="space-y-3">
          {[
            { label: 'Employers', value: stats?.users?.employers ?? users.filter((user) => user.role === 'employer').length, cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
            { label: 'Seekers', value: stats?.users?.seekers ?? users.filter((user) => user.role === 'jobseeker').length, cls: 'text-brand-accent bg-brand-accent/10 border-brand-accent/20' },
            { label: 'Verified Jobs', value: stats?.jobs?.verified ?? jobs.filter((job) => job.is_verified).length, cls: 'text-green-400 bg-green-500/10 border-green-500/20' },
            { label: 'Open Jobs', value: stats?.jobs?.open ?? jobs.filter((job) => job.status === 'open').length, cls: 'text-white bg-white/5 border-white/10' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/3 px-4 py-3">
              <span className="text-sm font-medium text-white">{item.label}</span>
              <span className={`px-3 py-1 rounded-full border text-xs font-bold ${item.cls}`}>{loading ? '–' : item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-8">
        <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
          <BadgeCheck className="w-5 h-5 text-green-400" /> Application Flow
        </h2>
        <div className="space-y-3">
          {[
            { label: 'Applied', value: stats?.applications?.applied ?? 0, cls: 'text-brand-accent bg-brand-accent/10 border-brand-accent/20' },
            { label: 'Shortlisted', value: stats?.applications?.shortlisted ?? 0, cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
            { label: 'Rejected', value: stats?.applications?.rejected ?? 0, cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
            { label: 'Hired', value: stats?.applications?.hired ?? 0, cls: 'text-green-400 bg-green-500/10 border-green-500/20' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/3 px-4 py-3">
              <span className="text-sm font-medium text-white">{item.label}</span>
              <span className={`px-3 py-1 rounded-full border text-xs font-bold ${item.cls}`}>{loading ? '–' : item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-8">
        <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" /> Pending Verification
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((index) => <div key={index} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
          </div>
        ) : pendingJobs.length === 0 ? (
          <div className="text-center py-10">
            <CheckCircle className="w-9 h-9 text-green-400 mx-auto mb-2" />
            <p className="text-text-muted text-sm">All jobs are verified.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingJobs.slice(0, 8).map((job, index) => (
              <div key={job.job_id ?? index} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all">
                <div>
                  <p className="text-sm font-medium text-white">{job.title}</p>
                  <p className="text-xs text-text-muted">{job.company_name}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                  Unverified
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card p-8">
        <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-accent" /> Recent Users
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((index) => <div key={index} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
          </div>
        ) : users.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-10">No users yet.</p>
        ) : (
          <div className="space-y-3">
            {users.slice(0, 8).map((user, index) => {
              const cls = ROLE_COLOR[user.role] ?? ROLE_COLOR.admin;
              return (
                <div key={user.user_id ?? index} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-all">
                  <p className="text-sm text-white truncate max-w-[60%]">{user.email}</p>
                  <span className={`text-xs px-2 py-1 rounded-full border font-bold capitalize ${cls}`}>
                    {user.role === 'jobseeker' ? 'Seeker' : user.role}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
