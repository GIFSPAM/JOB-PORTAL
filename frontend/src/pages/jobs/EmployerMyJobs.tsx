import React, { useEffect, useState } from 'react';
import { Briefcase, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchEmployerJobs } from '../../api';
import { useToast } from '../../components/Toast';
import { PageContainer } from '../../components/layout/PageContainer';

const JOB_STATUS: Record<string, string> = {
  open: 'bg-green-500/10 text-green-400 border-green-500/20',
  closed: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export const EmployerMyJobs: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployerJobs()
      .then((payload) => setJobs(payload))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to load jobs';
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <PageContainer>
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-brand-yellow" /> My Jobs
          </h1>
          <button
            type="button"
            onClick={() => navigate('/employer/my-jobs/new')}
            className="btn-yellow flex items-center gap-2 py-2 px-4 text-sm"
          >
            <PlusCircle className="w-4 h-4" /> Post New Job
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-14 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted mb-4">No jobs posted yet.</p>
            <button
              type="button"
              onClick={() => navigate('/employer/my-jobs/new')}
              className="btn-yellow text-sm flex items-center gap-2 mx-auto"
            >
              <PlusCircle className="w-4 h-4" /> Post Your First Job
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-bold text-text-muted uppercase tracking-widest border-b border-white/5">
                  <th className="text-left pb-4">Job Title</th>
                  <th className="text-left pb-4">Location</th>
                  <th className="text-left pb-4">Type</th>
                  <th className="text-left pb-4">Applicants</th>
                  <th className="text-left pb-4">Status</th>
                  <th className="text-left pb-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {jobs.map((job, index) => {
                  const cls = JOB_STATUS[job.status?.toLowerCase()] ?? JOB_STATUS.closed;
                  return (
                    <tr
                      key={job.job_id ?? index}
                      className="hover:bg-white/3 transition-colors cursor-pointer"
                      onClick={() => {
                        if (!job.job_id) return;
                        navigate(`/employer/my-jobs/${job.job_id}`, { state: { job } });
                      }}
                    >
                      <td className="py-4 font-medium text-white">{job.title}</td>
                      <td className="py-4 text-text-muted">{job.location ?? '–'}</td>
                      <td className="py-4 text-text-muted capitalize">{job.job_type ?? '–'}</td>
                      <td className="py-4 text-text-muted">{job.applicant_count ?? 0}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full border text-xs font-bold capitalize ${cls}`}>
                          {job.status ?? 'closed'}
                        </span>
                      </td>
                      <td className="py-4 text-text-muted text-xs font-semibold">View Details</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
