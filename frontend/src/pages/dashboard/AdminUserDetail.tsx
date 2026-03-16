import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  Mail,
  UserRound,
  Building2,
  Briefcase,
  GraduationCap,
  Phone,
  MapPin,
  Globe,
  ShieldCheck,
  UserX,
  Trash2,
} from 'lucide-react';
import {
  fetchAdminUserById,
  fetchAdminJobs,
  updateAdminUserStatus,
  deleteAdminUser,
} from '../../api';
import { useToast } from '../../components/Toast';
import { DetailFieldCard } from '../../components/dashboard/DetailFieldCard';
import type { AdminJob, AdminUser } from '../../types/admin';
import { formatDateShort, formatDateTime, formatSalaryRange } from '../../utils/formatters';

const ROLE_COLOR: Record<string, string> = {
  jobseeker: 'bg-brand-accent/10 text-brand-accent border-brand-accent/20',
  employer: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  admin: 'bg-white/5 text-white border-white/10',
};

const labelForRole = (role?: AdminUser['role']) => {
  if (role === 'jobseeker') return 'Seeker';
  if (role === 'employer') return 'Employer';
  if (role === 'admin') return 'Admin';
  return 'Unknown';
};

const displayNameForUser = (user: AdminUser | null) => {
  if (user?.role === 'jobseeker') return user.full_name || 'Unnamed seeker';
  if (user?.role === 'employer') return user.company_name || 'Unnamed employer';
  return user?.email || 'Unnamed user';
};

export const AdminUserDetail: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const parsedUserId = Number(userId);
  const validUserId = Number.isInteger(parsedUserId) && parsedUserId > 0;

  const [user, setUser] = useState<AdminUser | null>(null);
  const [employerPostedJobs, setEmployerPostedJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState<string | null>(null);

  const loadUser = useCallback(async (silent = false) => {
    if (!validUserId) return;
    if (!silent) setLoading(true);

    try {
      const payload = await fetchAdminUserById(parsedUserId);
      setUser(payload);

      if (payload?.role === 'employer') {
        try {
          const allJobs = await fetchAdminJobs();
          const ownJobs = allJobs.filter((job) => Number(job.employer_id) === Number(payload.user_id));
          setEmployerPostedJobs(ownJobs);
        } catch (jobErr: unknown) {
          setEmployerPostedJobs([]);
          const message = jobErr instanceof Error ? jobErr.message : 'Failed to load employer jobs';
          toast.error(message);
        }
      } else {
        setEmployerPostedJobs([]);
      }
    } catch (err: unknown) {
      setUser(null);
      setEmployerPostedJobs([]);
      const message = err instanceof Error ? err.message : 'Failed to load user';
      toast.error(message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [parsedUserId, toast, validUserId]);

  useEffect(() => {
    if (!validUserId) {
      toast.error('Invalid user ID');
      navigate('/admin/dashboard?tab=users', { replace: true });
      return;
    }

    void loadUser();
  }, [loadUser, navigate, toast, validUserId]);

  const badgeClass = ROLE_COLOR[user?.role] ?? ROLE_COLOR.admin;

  const detailRows = useMemo(() => {
    if (!user) return [];

    const base = [
      { label: 'User ID', value: user.user_id ?? 'Unknown' },
      { label: 'Email', value: user.email ?? 'Not added' },
      { label: 'Role', value: labelForRole(user.role) },
      {
        label: 'Created',
        value: formatDateTime(user.created_at),
      },
    ];

    if (user.role === 'jobseeker') {
      return [
        ...base,
        { label: 'Full Name', value: user.full_name ?? 'Not added' },
        { label: 'Phone', value: user.phone_number ?? 'Not added' },
        { label: 'Education', value: user.education ?? 'Not added' },
        { label: 'Experience', value: `${Number(user.experience_years ?? 0)} years` },
      ];
    }

    if (user.role === 'employer') {
      return [
        ...base,
        { label: 'Company Name', value: user.company_name ?? 'Not added' },
        { label: 'Industry', value: user.industry ?? 'Not added' },
        { label: 'Company Size', value: user.company_size ?? 'Not added' },
        { label: 'Location', value: user.company_location ?? 'Not added' },
        { label: 'Phone', value: user.company_phone ?? 'Not added' },
        { label: 'Website', value: user.company_website ?? 'Not added' },
      ];
    }

    return base;
  }, [user]);

  const handleToggleUserStatus = async () => {
    if (!user) return;

    const nextActive = !Boolean(user.is_active);
    setActionKey('status');
    try {
      await updateAdminUserStatus(parsedUserId, nextActive);
      setUser((prev) => (prev ? { ...prev, is_active: nextActive ? 1 : 0 } : prev));
      toast.success(nextActive ? 'User activated' : 'User deactivated');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update user status';
      toast.error(message);
    } finally {
      setActionKey(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    if (!window.confirm(`Delete user #${user.user_id}? This cannot be undone.`)) return;

    setActionKey('delete');
    try {
      await deleteAdminUser(parsedUserId);
      toast.success('User deleted');
      navigate('/admin/dashboard?tab=users', { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete user';
      toast.error(message);
      setActionKey(null);
    }
  };

  return (
    <section className="pt-28 pb-16 px-6 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <button
              onClick={() => navigate('/admin/dashboard?tab=users')}
              className="mb-4 text-sm text-text-muted hover:text-white transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Users
            </button>
            <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
              <UserRound className="w-7 h-7 text-brand-accent" /> User Detail
            </h1>
            <p className="text-text-muted mt-1">Review complete account info and moderate status.</p>
          </div>

          {user && (
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => void handleToggleUserStatus()}
                disabled={actionKey !== null}
                className="inline-flex items-center justify-center min-w-36 px-4 py-2.5 rounded-xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 text-sm font-bold hover:bg-yellow-500/15 transition-all disabled:opacity-60"
              >
                <UserX className="w-4 h-4 mr-2" />
                {actionKey === 'status' ? 'Updating...' : user.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => void handleDeleteUser()}
                disabled={actionKey !== null}
                className="inline-flex items-center justify-center min-w-28 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-bold hover:bg-red-500/15 transition-all disabled:opacity-60"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {actionKey === 'delete' ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="glass-card p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-12 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : !user ? (
          <div className="glass-card p-8 text-center">
            <p className="text-text-muted">User not found or unavailable.</p>
          </div>
        ) : (
          <>
            <div className="glass-card p-6 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl font-display font-bold text-white">#{user.user_id} · {displayNameForUser(user)}</h2>
                <p className="text-text-muted mt-1 inline-flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {user.email}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${badgeClass}`}>
                  {labelForRole(user.role)}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${user.is_active ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {detailRows.map((item) => (
                <DetailFieldCard key={item.label} label={item.label} value={item.value} />
              ))}
            </div>

            <div className="glass-card p-6">
              <h3 className="text-sm uppercase tracking-widest text-text-muted font-bold mb-3">Quick Snapshot</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/5 bg-white/3 p-3 text-sm text-text-muted inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-accent" /> Moderation enabled
                </div>
                <div className="rounded-xl border border-white/5 bg-white/3 p-3 text-sm text-text-muted inline-flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-yellow-400" /> Created {formatDateShort(user.created_at)}
                </div>
                <div className="rounded-xl border border-white/5 bg-white/3 p-3 text-sm text-text-muted inline-flex items-center gap-2">
                  {user.role === 'jobseeker' ? (
                    <GraduationCap className="w-4 h-4 text-brand-accent" />
                  ) : user.role === 'employer' ? (
                    <Building2 className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <UserRound className="w-4 h-4 text-white" />
                  )}
                  {labelForRole(user.role)} account
                </div>
              </div>
            </div>

            {user.role === 'employer' && (
              <>
                <div className="glass-card p-6">
                  <h3 className="text-sm uppercase tracking-widest text-text-muted font-bold mb-3">Company Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-text-muted">
                    <div className="rounded-xl border border-white/5 bg-white/3 p-3 inline-flex items-center gap-2">
                      <Phone className="w-4 h-4 text-brand-accent" /> {user.company_phone ?? 'No phone'}
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/3 p-3 inline-flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-yellow-400" /> {user.company_location ?? 'No location'}
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/3 p-3 inline-flex items-center gap-2 break-all">
                      <Globe className="w-4 h-4 text-white" /> {user.company_website ?? 'No website'}
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-sm uppercase tracking-widest text-text-muted font-bold mb-4">
                    Jobs Posted By Employer
                  </h3>

                  {employerPostedJobs.length === 0 ? (
                    <p className="text-sm text-text-muted">No jobs posted by this employer yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-[38vh] overflow-y-auto pr-2">
                      {employerPostedJobs.map((job) => (
                        <button
                          key={job.job_id}
                          onClick={() => navigate(`/admin/jobs/${job.job_id}`)}
                          className="w-full text-left rounded-xl border border-white/5 bg-white/3 p-4 hover:border-brand-accent/30 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <p className="text-white font-semibold inline-flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-brand-accent" /> {job.title}
                              </p>
                              <p className="text-xs text-text-muted mt-1">
                                #{job.job_id} · {job.location ?? 'Remote'} · {formatSalaryRange(job.salary_min, job.salary_max)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] px-2 py-1 rounded-full border font-bold capitalize ${job.status === 'open' ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-text-muted bg-white/5 border-white/10'}`}>
                                {job.status ?? 'unknown'}
                              </span>
                              <span className={`text-[10px] px-2 py-1 rounded-full border font-bold ${job.is_verified ? 'text-brand-accent bg-brand-accent/10 border-brand-accent/20' : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'}`}>
                                {job.is_verified ? 'Verified' : 'Unverified'}
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-text-muted mt-2">
                            Posted {formatDateShort(job.posted_at)}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
};
