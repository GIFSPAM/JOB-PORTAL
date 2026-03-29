import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, BriefcaseBusiness, Globe, MapPin, Phone, Sparkles, Users } from 'lucide-react';
import { fetchPublicEmployerJobs, fetchSeekerEmployerDetailsByJob, type EmployerDetails } from '../../api';
import type { Job } from '../../types/job';
import { JobCard } from '../../components/JobCard';
import { useToast } from '../../components/Toast';
import { PageContainer } from '../../components/layout/PageContainer';
import { normalizeWebsiteUrl } from '../../utils/formatters';

export const EmployerDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { employerId } = useParams();
  const toast = useToast();

  const parsedEmployerId = Number(employerId);
  const validEmployerId = Number.isInteger(parsedEmployerId) && parsedEmployerId > 0;
  const parsedJobRefId = Number(new URLSearchParams(location.search).get('jobId'));
  const hasJobRefId = Number.isInteger(parsedJobRefId) && parsedJobRefId > 0;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [employerDetails, setEmployerDetails] = useState<EmployerDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!validEmployerId) {
      toast.error('Invalid employer ID');
      navigate('/explore-jobs', { replace: true });
      return;
    }

    const loadEmployerPage = async () => {
      setLoading(true);
      let resolvedEmployerId = parsedEmployerId;

      if (hasJobRefId) {
        try {
          const details = await fetchSeekerEmployerDetailsByJob(parsedJobRefId);
          setEmployerDetails(details);

          const detailEmployerId = Number(details?.employer_id);
          if (Number.isInteger(detailEmployerId) && detailEmployerId > 0) {
            resolvedEmployerId = detailEmployerId;
          }
        } catch {
          setEmployerDetails(null);
        }
      } else {
        setEmployerDetails(null);
      }

      try {
        const jobsPayload = await fetchPublicEmployerJobs(resolvedEmployerId);
        setJobs(jobsPayload);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load employer jobs';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void loadEmployerPage();
  }, [hasJobRefId, navigate, parsedEmployerId, parsedJobRefId, toast, validEmployerId]);

  const companyName = useMemo(
    () => employerDetails?.company_name || jobs[0]?.company || 'Employer',
    [employerDetails?.company_name, jobs],
  );
  const companyWebsite = useMemo(
    () => normalizeWebsiteUrl(employerDetails?.company_website),
    [employerDetails?.company_website],
  );

  return (
    <PageContainer maxWidthClass="max-w-7xl" contentClassName="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <button
            onClick={() => navigate('/explore-jobs')}
            className="mb-4 text-sm text-text-muted hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Explore Jobs
          </button>
          <h1 className="text-3xl font-display font-bold text-white inline-flex items-center gap-2">
            <Building2 className="w-7 h-7 text-brand-accent" /> {companyName}
          </h1>
          <p className="text-text-muted mt-1">
            {employerDetails?.industry
              ? `${employerDetails.industry} employer with open verified jobs.`
              : 'Open verified jobs published by this employer.'}
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full border border-brand-accent/20 bg-brand-accent/10 text-brand-accent text-xs font-bold uppercase tracking-widest">
          {loading ? 'Loading...' : `${jobs.length} active jobs`}
        </span>
      </div>

      <div className="glass-card p-8">
        <h2 className="text-lg font-display font-bold text-white mb-6">Employer Details</h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : employerDetails ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
            <div className="rounded-2xl border border-white/5 bg-white/3 p-5">
              <p className="text-xs uppercase tracking-widest text-text-muted font-bold mb-2">Industry</p>
              <p className="text-white font-medium inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-accent" /> {employerDetails.industry || 'Not specified'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/3 p-5">
              <p className="text-xs uppercase tracking-widest text-text-muted font-bold mb-2">Team Size</p>
              <p className="text-white font-medium inline-flex items-center gap-2">
                <Users className="w-4 h-4 text-green-400" /> {employerDetails.company_size || 'Not specified'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/3 p-5">
              <p className="text-xs uppercase tracking-widest text-text-muted font-bold mb-2">Location</p>
              <p className="text-white font-medium inline-flex items-center gap-2">
                <MapPin className="w-4 h-4 text-yellow-400" /> {employerDetails.company_location || 'Not specified'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/3 p-5">
              <p className="text-xs uppercase tracking-widest text-text-muted font-bold mb-2">Contact</p>
              <p className="text-white font-medium inline-flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-accent" /> {employerDetails.company_phone || 'Not available'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/3 p-5">
              <p className="text-xs uppercase tracking-widest text-text-muted font-bold mb-2">Website</p>
              {companyWebsite ? (
                <a
                  href={companyWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-accent hover:text-blue-300 transition-colors text-sm inline-flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" /> Visit Website
                </a>
              ) : (
                <p className="text-text-muted text-sm inline-flex items-center gap-2">
                  <Globe className="w-4 h-4" /> No website listed
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-muted">Employer profile details are unavailable for this job.</p>
        )}
      </div>

      <div className="glass-card p-8">
        <h2 className="text-lg font-display font-bold text-white mb-6">Jobs Posted By This Employer</h2>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-56 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/3 p-10 text-center">
            <BriefcaseBusiness className="w-10 h-10 text-text-muted mx-auto mb-3" />
            <p className="text-text-muted">No active verified jobs are available for this employer right now.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} onClick={() => navigate(`/jobs/${job.id}`)} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};
