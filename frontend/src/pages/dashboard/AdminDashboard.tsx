import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  Briefcase,
  ShieldCheck,
  Activity,
  AlertCircle,
} from 'lucide-react';
import {
  fetchAdminStats,
  fetchAdminJobs,
  fetchAdminUsers,
  fetchAdminLogs,
  updateAdminUserStatus,
  deleteAdminUser,
  deleteAdminJob,
  verifyAdminJob,
  unverifyAdminJob,
} from '../../api';
import { useToast } from '../../components/Toast';
import { StatCard } from '../../components/dashboard/StatCard';
import { AdminOverviewTab } from '../../components/admin/AdminOverviewTab';
import { AdminUsersTab } from '../../components/admin/AdminUsersTab';
import { AdminJobsTab } from '../../components/admin/AdminJobsTab';
import { AdminLogsTab } from '../../components/admin/AdminLogsTab';
import type { AdminJob, AdminLog, AdminStats, AdminUser } from '../../types/admin';
import { PageContainer } from '../../components/layout/PageContainer';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'jobseeker' | 'employer' | 'admin'>('all');
  const [jobIdSearchQuery, setJobIdSearchQuery] = useState('');
  const [jobTitleSearchQuery, setJobTitleSearchQuery] = useState('');
  const [jobLocationFilter, setJobLocationFilter] = useState('all');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [jobVerificationFilter, setJobVerificationFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logTableFilter, setLogTableFilter] = useState('all');

  const activeTab = searchParams.get('tab') ?? 'overview';
  const pendingJobs = jobs.filter((job) => !Boolean(job.is_verified));
  const normalizedUserSearch = userSearchQuery.trim().toLowerCase();
  const normalizedJobIdSearch = jobIdSearchQuery.trim();
  const normalizedJobTitleSearch = jobTitleSearchQuery.trim().toLowerCase();
  const availableJobLocations = Array.from(
    new Set(jobs.map((job) => String(job.location ?? '').trim()).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right));
  const availableJobTypes = Array.from(
    new Set(jobs.map((job) => String(job.job_type ?? '').trim()).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right));
  const availableLogTypes = Array.from(
    new Set(logs.map((log) => String(log.target_table ?? '').trim()).filter(Boolean)),
  ).sort((left, right) => left.localeCompare(right));
  const normalizedLogSearch = logSearchQuery.trim().toLowerCase();
  const filteredUsers = users.filter((user) => {
    const roleMatch = roleFilter === 'all' || user.role === roleFilter;
    if (!roleMatch) return false;
    if (!normalizedUserSearch) return true;

    const searchableParts = [
      String(user.user_id ?? ''),
      user.email ?? '',
      user.full_name ?? '',
      user.company_name ?? '',
    ];

    return searchableParts.join(' ').toLowerCase().includes(normalizedUserSearch);
  });
  const filteredJobs = jobs.filter((job) => {
    const matchesId = !normalizedJobIdSearch || String(job.job_id ?? '').includes(normalizedJobIdSearch);
    const matchesTitle = !normalizedJobTitleSearch || String(job.title ?? '').toLowerCase().includes(normalizedJobTitleSearch);
    const matchesLocation = jobLocationFilter === 'all' || String(job.location ?? '') === jobLocationFilter;
    const matchesJobType = jobTypeFilter === 'all' || String(job.job_type ?? '') === jobTypeFilter;
    const matchesVerification = jobVerificationFilter === 'all'
      || (jobVerificationFilter === 'verified' && Boolean(job.is_verified))
      || (jobVerificationFilter === 'unverified' && !Boolean(job.is_verified));
    return matchesId && matchesTitle && matchesLocation && matchesJobType && matchesVerification;
  });
  const filteredLogs = logs.filter((log) => {
    const tableMatch = logTableFilter === 'all' || String(log.target_table ?? '') === logTableFilter;
    if (!tableMatch) return false;
    if (!normalizedLogSearch) return true;

    const searchable = [
      String(log.log_id ?? ''),
      String(log.admin_id ?? ''),
      log.admin_email ?? '',
      log.action_type ?? '',
      log.target_table ?? '',
      String(log.target_id ?? ''),
    ];

    return searchable.join(' ').toLowerCase().includes(normalizedLogSearch);
  });

  const loadAdminData = async (silent = false): Promise<void> => {
    if (!silent) setLoading(true);
    try {
      const [statsPayload, jobsPayload, usersPayload, logsPayload] = await Promise.all([
        fetchAdminStats(),
        fetchAdminJobs(),
        fetchAdminUsers(),
        fetchAdminLogs(),
      ]);
      setStats(statsPayload);
      setJobs(jobsPayload);
      setUsers(usersPayload);
      setLogs(logsPayload);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load admin data';
      toast.error(message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const preserveScrollAndRefresh = async (): Promise<void> => {
    const prevY = window.scrollY;
    await loadAdminData(true);
    requestAnimationFrame(() => window.scrollTo({ top: prevY }));
  };

  useEffect(() => {
    void loadAdminData();
  }, []);

  const handleTabChange = (tab: string) => setSearchParams({ tab });
  const handleOpenUserDetail = (userId: number) => navigate(`/admin/users/${userId}`);
  const handleOpenJobDetail = (job: AdminJob) => navigate(`/admin/jobs/${job.job_id}`, { state: { job } });

  const handleToggleUserStatus = async (user: AdminUser): Promise<void> => {
    const nextActive = !Boolean(user.is_active);
    setActionKey(`user-status-${user.user_id}`);
    try {
      await updateAdminUserStatus(Number(user.user_id), nextActive);
      toast.success(nextActive ? 'User activated' : 'User deactivated');
      await preserveScrollAndRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update user status';
      toast.error(message);
    } finally {
      setActionKey(null);
    }
  };

  const handleDeleteUser = async (user: AdminUser): Promise<void> => {
    if (!window.confirm(`Delete user #${user.user_id}? This cannot be undone.`)) return;

    setActionKey(`user-delete-${user.user_id}`);
    try {
      await deleteAdminUser(Number(user.user_id));
      toast.success('User deleted');
      await preserveScrollAndRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete user';
      toast.error(message);
    } finally {
      setActionKey(null);
    }
  };

  const handleDeleteJob = async (job: AdminJob): Promise<void> => {
    if (!window.confirm(`Delete job #${job.job_id}? This cannot be undone.`)) return;

    setActionKey(`job-delete-${job.job_id}`);
    try {
      await deleteAdminJob(Number(job.job_id));
      toast.success('Job deleted');
      await preserveScrollAndRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete job';
      toast.error(message);
    } finally {
      setActionKey(null);
    }
  };

  const handleToggleJobVerification = async (job: AdminJob): Promise<void> => {
    const nextVerified = !Boolean(job.is_verified);
    setActionKey(`job-verify-toggle-${job.job_id}`);
    try {
      if (nextVerified) {
        await verifyAdminJob(Number(job.job_id));
      } else {
        await unverifyAdminJob(Number(job.job_id));
      }
      toast.success(nextVerified ? 'Job verified' : 'Job unverified');
      await preserveScrollAndRefresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update verification';
      toast.error(message);
    } finally {
      setActionKey(null);
    }
  };

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.users?.total ?? users.filter((user) => user.role !== 'admin').length,
      Icon: Users,
      colorClass: 'text-brand-accent bg-brand-accent/10',
    },
    {
      label: 'Total Jobs',
      value: stats?.jobs?.total ?? jobs.length,
      Icon: Briefcase,
      colorClass: 'text-yellow-400 bg-yellow-500/10',
    },
    {
      label: 'Pending Review',
      value: pendingJobs.length,
      Icon: AlertCircle,
      colorClass: 'text-red-400 bg-red-500/10',
    },
    {
      label: 'Applications',
      value: stats?.applications?.total ?? 0,
      Icon: Activity,
      colorClass: 'text-white bg-white/5',
    },
    {
      label: 'Logs',
      value: logs.length,
      Icon: ShieldCheck,
      colorClass: 'text-brand-accent bg-brand-accent/10',
    },
  ];

  const tabButtonClass = (tab: string) => (
    activeTab === tab
      ? 'bg-brand-accent text-white border-brand-accent'
      : 'bg-white/3 text-text-muted border-white/10 hover:text-white hover:border-white/20'
  );

  return (
    <PageContainer>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-white/40" /> Admin Panel
            </h1>
            <p className="text-text-muted mt-1">Manage jobs, users, and platform data.</p>
          </div>
        </div>

        <div className="tile-grid">
          {statCards.map(({ label, value, Icon, colorClass }, index) => (
            <StatCard
              key={label}
              label={label}
              value={value}
              Icon={Icon}
              colorClass={colorClass}
              loading={loading}
              index={index}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => handleTabChange('overview')} className={`inline-flex items-center justify-center min-w-28 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${tabButtonClass('overview')}`}>
            Overview
          </button>
          <button onClick={() => handleTabChange('users')} className={`inline-flex items-center justify-center min-w-28 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${tabButtonClass('users')}`}>
            Users
          </button>
          <button onClick={() => handleTabChange('jobs')} className={`inline-flex items-center justify-center min-w-28 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${tabButtonClass('jobs')}`}>
            Jobs
          </button>
          <button onClick={() => handleTabChange('logs')} className={`inline-flex items-center justify-center min-w-28 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${tabButtonClass('logs')}`}>
            Logs
          </button>
        </div>

        {activeTab === 'overview' && (
          <AdminOverviewTab
            loading={loading}
            stats={stats}
            users={users}
            jobs={jobs}
            pendingJobs={pendingJobs}
          />
        )}

        {activeTab === 'users' && (
          <AdminUsersTab
            loading={loading}
            filteredUsers={filteredUsers}
            userSearchQuery={userSearchQuery}
            onUserSearchChange={setUserSearchQuery}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            actionKey={actionKey}
            onOpenUserDetail={handleOpenUserDetail}
            onToggleUserStatus={handleToggleUserStatus}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {activeTab === 'jobs' && (
          <AdminJobsTab
            loading={loading}
            jobs={jobs}
            pendingJobsCount={pendingJobs.length}
            filteredJobs={filteredJobs}
            jobIdSearchQuery={jobIdSearchQuery}
            onJobIdSearchChange={setJobIdSearchQuery}
            jobTitleSearchQuery={jobTitleSearchQuery}
            onJobTitleSearchChange={setJobTitleSearchQuery}
            jobLocationFilter={jobLocationFilter}
            onJobLocationFilterChange={setJobLocationFilter}
            availableJobLocations={availableJobLocations}
            jobTypeFilter={jobTypeFilter}
            onJobTypeFilterChange={setJobTypeFilter}
            availableJobTypes={availableJobTypes}
            jobVerificationFilter={jobVerificationFilter}
            onJobVerificationFilterChange={setJobVerificationFilter}
            actionKey={actionKey}
            onOpenJobDetail={handleOpenJobDetail}
            onToggleJobVerification={handleToggleJobVerification}
            onDeleteJob={handleDeleteJob}
          />
        )}

        {activeTab === 'logs' && (
          <AdminLogsTab
            loading={loading}
            logs={logs}
            filteredLogs={filteredLogs}
            logSearchQuery={logSearchQuery}
            onLogSearchQueryChange={setLogSearchQuery}
            logTableFilter={logTableFilter}
            onLogTableFilterChange={setLogTableFilter}
            availableLogTypes={availableLogTypes}
          />
        )}
    </PageContainer>
  );
};
