import React, { useEffect, useMemo, useState } from 'react';
import { Briefcase, ClipboardList, Download, Search, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { downloadEmployerApplicantResume, fetchEmployerApplicants, fetchEmployerJobs } from '../api';
import { useToast } from '../components/Toast';
import { PageContainer } from '../components/layout/PageContainer';

type EmployerJob = {
  job_id?: number;
  title?: string;
  location?: string;
  status?: string;
  job_type?: string;
  applicant_count?: number;
};

type EmployerApplicant = {
  application_id?: number;
  application_status?: string;
  applied_at?: string;
  job_id?: number;
  job_title?: string;
  seeker?: {
    full_name?: string;
    education?: string;
    experience_years?: number;
    phone_number?: string;
    resume_url?: string | null;
    skills?: Array<{ name?: string; proficiency?: string }>;
  };
};

const JOB_STATUS_CLASS: Record<string, string> = {
  open: 'bg-green-500/10 text-green-400 border-green-500/20',
  closed: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const APPLICATION_STATUS_CLASS: Record<string, string> = {
  applied: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  shortlisted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  hired: 'bg-green-500/10 text-green-400 border-green-500/20',
};

const APPLICATION_STATUS_TABS = ['all', 'applied', 'shortlisted', 'rejected', 'hired'] as const;
type ApplicationStatusTab = (typeof APPLICATION_STATUS_TABS)[number];

export const EmployerApplications: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications'>('jobs');
  const [applicationStatusTab, setApplicationStatusTab] = useState<ApplicationStatusTab>('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [jobs, setJobs] = useState<EmployerJob[]>([]);
  const [applications, setApplications] = useState<EmployerApplicant[]>([]);

  const handleResumeDownload = async (applicationId?: number) => {
    if (!applicationId) {
      toast.error('Resume not available');
      return;
    }
    try {
      await downloadEmployerApplicantResume(applicationId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to download resume';
      toast.error(message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [jobRows, applicantRows] = await Promise.all([
          fetchEmployerJobs(),
          fetchEmployerApplicants(),
        ]);

        const rows = jobRows as EmployerJob[];
        const applicantsPayload = applicantRows as EmployerApplicant[];
        const countByJob = applicantsPayload.reduce<Record<number, number>>((acc, item) => {
          const id = Number(item.job_id);
          if (!Number.isInteger(id) || id <= 0) return acc;
          acc[id] = (acc[id] ?? 0) + 1;
          return acc;
        }, {});

        setJobs(
          rows.map((job) => ({
            ...job,
            applicant_count: countByJob[Number(job.job_id)] ?? Number(job.applicant_count ?? 0),
          })),
        );
        setApplications(applicantsPayload);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch applications data';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [toast]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return jobs.filter((item) => {
      const matchesSkill =
        skillFilter === 'all'
          || applications.some((application) => {
            if (Number(application.job_id) !== Number(item.job_id)) return false;
            const seekerSkills = Array.isArray(application.seeker?.skills) ? application.seeker.skills : [];
            return seekerSkills.some(
              (skill) => String(skill?.name ?? '').trim().toLowerCase() === skillFilter,
            );
          });

      if (!matchesSkill) return false;
      if (!query) return true;

      const text = [
        String(item.job_id ?? ''),
        item.title ?? '',
        item.location ?? '',
        item.job_type ?? '',
        item.status ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return text.includes(query);
    });
  }, [applications, jobs, search, skillFilter]);

  const availableSkills = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((item) => {
      const seekerSkills = Array.isArray(item.seeker?.skills) ? item.seeker.skills : [];
      seekerSkills.forEach((skill) => {
        const name = String(skill?.name ?? '').trim().toLowerCase();
        if (name) set.add(name);
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();
    return applications.filter((item) => {
      const status = String(item.application_status ?? 'applied').toLowerCase();
      if (applicationStatusTab !== 'all' && status !== applicationStatusTab) {
        return false;
      }

      if (skillFilter !== 'all') {
        const seekerSkills = Array.isArray(item.seeker?.skills) ? item.seeker.skills : [];
        const hasSkill = seekerSkills.some(
          (skill) => String(skill?.name ?? '').trim().toLowerCase() === skillFilter,
        );
        if (!hasSkill) return false;
      }

      if (!query) return true;

      const text = [
        String(item.application_id ?? ''),
        String(item.job_id ?? ''),
        item.job_title ?? '',
        item.seeker?.full_name ?? '',
        item.seeker?.education ?? '',
        item.seeker?.phone_number ?? '',
        status,
      ]
        .join(' ')
        .toLowerCase();

      return text.includes(query);
    });
  }, [applicationStatusTab, applications, search, skillFilter]);

  return (
    <PageContainer>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-brand-accent" /> Applications
          </h1>
          <p className="mt-2 text-sm text-text-muted max-w-2xl">
            Select a posted job to view its applicants.
          </p>
        </div>
      </div>

      <div className="glass-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`inline-flex items-center justify-center min-w-32 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
              activeTab === 'jobs'
                ? 'bg-brand-accent text-white border-brand-accent'
                : 'bg-white/3 text-text-muted border-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            Jobs
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`inline-flex items-center justify-center min-w-32 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
              activeTab === 'applications'
                ? 'bg-brand-accent text-white border-brand-accent'
                : 'bg-white/3 text-text-muted border-white/10 hover:text-white hover:border-white/20'
            }`}
          >
            All Applications
          </button>
        </div>

        <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Search</label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              activeTab === 'jobs'
                ? 'Search by job title, location, type, status, or ID'
                : 'Search by candidate, job, phone, status, or ID'
            }
            className="w-full rounded-xl border border-white/10 bg-white/3 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-text-muted/80 focus:outline-none focus:border-brand-accent/60"
          />
        </div>

        <div className="mt-4">
          <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Skill</label>
          <select
            value={skillFilter}
            onChange={(event) => setSkillFilter(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/3 px-3 py-2.5 text-sm text-white capitalize focus:outline-none focus:border-brand-accent/60"
          >
            <option value="all">All Skills</option>
            {availableSkills.map((skill) => (
              <option key={skill} value={skill} className="bg-brand-bg text-white">
                {skill}
              </option>
            ))}
          </select>
        </div>

        {activeTab === 'applications' && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {APPLICATION_STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setApplicationStatusTab(tab)}
                className={`px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest transition-all ${
                  applicationStatusTab === tab
                    ? 'bg-brand-accent text-white border-brand-accent'
                    : 'bg-white/3 text-text-muted border-white/10 hover:text-white hover:border-white/20'
                }`}
              >
                {tab === 'all' ? 'All' : tab}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card p-8">
        {activeTab === 'jobs' && (
          <>
            <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-brand-yellow" /> Jobs With Applications
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-14 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12 text-text-muted">No matching jobs found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs font-bold text-text-muted uppercase tracking-widest border-b border-white/5">
                      <th className="text-left pb-4">Job</th>
                      <th className="text-left pb-4">Location</th>
                      <th className="text-left pb-4">Type</th>
                      <th className="text-left pb-4">Status</th>
                      <th className="text-left pb-4">Applicants</th>
                      <th className="text-left pb-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredJobs.map((item, index) => {
                      const status = String(item.status ?? 'open').toLowerCase();
                      const statusClass = JOB_STATUS_CLASS[status] ?? 'bg-white/5 text-white border-white/10';

                      return (
                        <tr
                          key={item.job_id ?? index}
                          className="hover:bg-white/3 transition-colors cursor-pointer"
                          onClick={() => {
                            if (!item.job_id) return;
                            navigate(`/employer/applications/job/${item.job_id}`, {
                              state: { jobTitle: item.title ?? 'Untitled Job' },
                            });
                          }}
                        >
                          <td className="py-4">
                            <p className="font-medium text-white inline-flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-brand-yellow" />
                              {item.title ?? 'Untitled Job'}
                            </p>
                            <p className="text-xs mt-1">Job ID: {item.job_id ?? 'N/A'}</p>
                          </td>
                          <td className="py-4 text-text-muted">{item.location ?? 'N/A'}</td>
                          <td className="py-4 text-text-muted capitalize">{item.job_type ?? 'N/A'}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full border text-xs font-bold capitalize ${statusClass}`}>
                              {item.status ?? 'open'}
                            </span>
                          </td>
                          <td className="py-4 text-text-muted">{item.applicant_count ?? 0}</td>
                          <td className="py-4 text-text-muted text-xs font-semibold">View Applicants</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'applications' && (
          <>
            <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-brand-yellow" /> All Applications
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-14 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12 text-text-muted">No applications found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs font-bold text-text-muted uppercase tracking-widest border-b border-white/5">
                      <th className="text-left pb-4">Candidate</th>
                      <th className="text-left pb-4">Job</th>
                      <th className="text-left pb-4">Status</th>
                      <th className="text-left pb-4">Applied At</th>
                      <th className="text-left pb-4">Resume</th>
                      <th className="text-left pb-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredApplications.map((item, index) => {
                      const status = String(item.application_status ?? 'applied').toLowerCase();
                      const statusClass = APPLICATION_STATUS_CLASS[status] ?? 'bg-white/5 text-white border-white/10';

                      return (
                        <tr
                          key={item.application_id ?? index}
                          className="hover:bg-white/3 transition-colors cursor-pointer"
                          onClick={() => {
                            if (!item.application_id) return;
                            navigate(`/employer/applications/${item.application_id}`, { state: { application: item } });
                          }}
                        >
                          <td className="py-4">
                            <p className="font-medium text-white">{item.seeker?.full_name ?? 'Unknown candidate'}</p>
                            <p className="text-xs mt-1 text-text-muted">{item.seeker?.education ?? 'Education not available'}</p>
                          </td>
                          <td className="py-4 text-text-muted">
                            <p>{item.job_title ?? 'Untitled Job'}</p>
                            <p className="text-xs mt-1">Job ID: {item.job_id ?? 'N/A'}</p>
                          </td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full border text-xs font-bold capitalize ${statusClass}`}>
                              {item.application_status ?? 'applied'}
                            </span>
                          </td>
                          <td className="py-4 text-text-muted">
                            {item.applied_at ? new Date(item.applied_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-4">
                            {item.application_id && item.seeker?.resume_url ? (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void handleResumeDownload(item.application_id);
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-brand-accent/30 bg-brand-accent/10 text-xs font-bold text-brand-accent hover:bg-brand-accent/20 transition-all"
                              >
                                <Download className="w-3.5 h-3.5" /> Resume
                              </button>
                            ) : (
                              <span className="text-xs text-text-muted">N/A</span>
                            )}
                          </td>
                          <td className="py-4 text-text-muted text-xs font-semibold">View Detail</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
};
