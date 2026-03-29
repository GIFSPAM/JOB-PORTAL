import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ClipboardList, Download, Search, Users } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { downloadEmployerApplicantResume, fetchEmployerApplicantsByJob } from '../api';
import { useToast } from '../components/Toast';
import { PageContainer } from '../components/layout/PageContainer';

type EmployerApplicant = {
  application_id?: number;
  application_status?: string;
  applied_at?: string;
  seeker?: {
    full_name?: string;
    education?: string;
    experience_years?: number;
    phone_number?: string;
    resume_url?: string | null;
    skills?: Array<{ name?: string; proficiency?: string }>;
  };
};

type LocationState = {
  jobTitle?: string;
};

const APPLICATION_STATUS_CLASS: Record<string, string> = {
  applied: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  shortlisted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  hired: 'bg-green-500/10 text-green-400 border-green-500/20',
};

export const EmployerJobApplicants: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const parsedJobId = Number(jobId);
  const validJobId = Number.isInteger(parsedJobId) && parsedJobId > 0;

  const jobTitle = (location.state as LocationState | null)?.jobTitle ?? `Job #${jobId ?? ''}`;

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [applicants, setApplicants] = useState<EmployerApplicant[]>([]);

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
    if (!validJobId) {
      toast.error('Invalid job ID');
      navigate('/employer/applications', { replace: true });
      return;
    }

    fetchEmployerApplicantsByJob(parsedJobId)
      .then((rows) => setApplicants(rows as EmployerApplicant[]))
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Failed to fetch applicants';
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, [navigate, parsedJobId, toast, validJobId]);

  const filteredApplicants = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return applicants;

    return applicants.filter((item) => {
      const text = [
        String(item.application_id ?? ''),
        item.application_status ?? '',
        item.seeker?.full_name ?? '',
        item.seeker?.education ?? '',
        item.seeker?.phone_number ?? '',
      ]
        .join(' ')
        .toLowerCase();

      return text.includes(query);
    });
  }, [applicants, search]);

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <button
            onClick={() => navigate('/employer/applications')}
            className="mb-4 text-sm text-text-muted hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </button>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <Users className="w-7 h-7 text-brand-accent" /> Applicants
          </h1>
          <p className="mt-2 text-sm text-text-muted max-w-2xl">
            {jobTitle} - review all applicants for this specific job.
          </p>
        </div>

        <div className="glass-card p-5 sm:p-6">
          <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Search</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by candidate, status, phone, or application ID"
              className="w-full rounded-xl border border-white/10 bg-white/3 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-text-muted/80 focus:outline-none focus:border-brand-accent/60"
            />
          </div>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-brand-yellow" /> Applicant List
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-14 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="text-center py-12 text-text-muted">No applicants found for this job.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-bold text-text-muted uppercase tracking-widest border-b border-white/5">
                    <th className="text-left pb-4">Candidate</th>
                    <th className="text-left pb-4">Status</th>
                    <th className="text-left pb-4">Experience</th>
                    <th className="text-left pb-4">Applied At</th>
                    <th className="text-left pb-4">Resume</th>
                    <th className="text-left pb-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredApplicants.map((item, index) => {
                    const status = String(item.application_status ?? 'applied').toLowerCase();
                    const statusClass = APPLICATION_STATUS_CLASS[status] ?? 'bg-white/5 text-white border-white/10';

                    return (
                      <tr
                        key={item.application_id ?? index}
                        className="hover:bg-white/3 transition-colors cursor-pointer"
                        onClick={() => {
                          if (!item.application_id) return;
                          navigate(`/employer/applications/${item.application_id}`, {
                            state: {
                              application: {
                                ...item,
                                job_id: parsedJobId,
                                job_title: jobTitle,
                              },
                            },
                          });
                        }}
                      >
                        <td className="py-4">
                          <p className="font-medium text-white">{item.seeker?.full_name ?? 'Unknown candidate'}</p>
                          <p className="text-xs text-text-muted mt-1">{item.seeker?.education ?? 'Education not available'}</p>
                        </td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full border text-xs font-bold capitalize ${statusClass}`}>
                            {item.application_status ?? 'applied'}
                          </span>
                        </td>
                        <td className="py-4 text-text-muted">{item.seeker?.experience_years ?? 0} yrs</td>
                        <td className="py-4 text-text-muted">{item.applied_at ? new Date(item.applied_at).toLocaleDateString() : 'N/A'}</td>
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
        </div>
      </div>
    </PageContainer>
  );
};
