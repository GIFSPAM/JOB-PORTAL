import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Briefcase, CalendarClock, Download, GraduationCap, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { downloadEmployerApplicantResume, fetchEmployerApplicants, fetchEmployerJobs, updateEmployerApplicationStatus } from '../api';
import { useToast } from '../components/Toast';
import { PageContainer } from '../components/layout/PageContainer';

type EmployerApplicant = {
  application_id?: number;
  application_status?: string;
  applied_at?: string;
  job_id?: number;
  job_title?: string;
  seeker?: {
    avatar_url?: string | null;
    full_name?: string;
    education?: string;
    experience_years?: number;
    phone_number?: string;
    resume_url?: string | null;
    skills?: Array<{ name?: string; proficiency?: string }>;
  };
};

type LocationState = {
  application?: EmployerApplicant;
};

const STATUS_OPTIONS = ['applied', 'shortlisted', 'rejected', 'hired'] as const;
type ApplicationStatus = (typeof STATUS_OPTIONS)[number];

const APPLICATION_STATUS_CLASS: Record<ApplicationStatus, string> = {
  applied: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  shortlisted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  hired: 'bg-green-500/10 text-green-400 border-green-500/20',
};

const normalizeStatus = (value?: string): ApplicationStatus => {
  const lowered = String(value ?? '').toLowerCase();
  return STATUS_OPTIONS.includes(lowered as ApplicationStatus) ? (lowered as ApplicationStatus) : 'applied';
};

export const EmployerApplicantDetail: React.FC = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const parsedId = Number(applicationId);
  const validId = Number.isInteger(parsedId) && parsedId > 0;

  const initialFromState = (location.state as LocationState | null)?.application ?? null;
  const [loading, setLoading] = useState(!initialFromState);
  const [application, setApplication] = useState<EmployerApplicant | null>(initialFromState);
  const [status, setStatus] = useState<ApplicationStatus>(normalizeStatus(initialFromState?.application_status));
  const [savingStatus, setSavingStatus] = useState(false);
  const [jobRequiredSkills, setJobRequiredSkills] = useState<string[]>([]);

  useEffect(() => {
    if (!validId) {
      toast.error('Invalid application ID');
      navigate('/employer/applications', { replace: true });
      return;
    }

    if (initialFromState?.application_id && Number(initialFromState.application_id) === parsedId) {
      return;
    }

    setLoading(true);
    fetchEmployerApplicants()
      .then((rows) => {
        const found = (rows as EmployerApplicant[]).find(
          (item) => Number(item.application_id) === parsedId,
        );
        setApplication(found ?? null);
        setStatus(normalizeStatus(found?.application_status));
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Failed to fetch applicant detail';
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, [initialFromState, navigate, parsedId, toast, validId]);

  useEffect(() => {
    const jobId = Number(application?.job_id);
    if (!Number.isInteger(jobId) || jobId <= 0) {
      setJobRequiredSkills([]);
      return;
    }

    fetchEmployerJobs()
      .then((rows) => {
        const job = (rows as Array<{ job_id?: number; skills?: unknown[] }>).find(
          (item) => Number(item.job_id) === jobId,
        );
        const required = Array.isArray(job?.skills)
          ? job.skills
              .map((item) => String(item ?? '').trim())
              .filter((item) => item.length > 0)
          : [];
        setJobRequiredSkills(required);
      })
      .catch(() => {
        setJobRequiredSkills([]);
      });
  }, [application?.job_id]);

  const skills = useMemo(() => application?.seeker?.skills ?? [], [application?.seeker?.skills]);
  const applicantSkillMap = useMemo(() => {
    return new Map(
      skills
        .map((skill) => ({
          key: String(skill.name ?? '').trim().toLowerCase(),
          name: String(skill.name ?? '').trim(),
          proficiency: String(skill.proficiency ?? '').trim(),
        }))
        .filter((skill) => skill.key.length > 0)
        .map((skill) => [skill.key, { name: skill.name, proficiency: skill.proficiency }] as const),
    );
  }, [skills]);
  const requiredSkillsComparison = useMemo(() => {
    const required = jobRequiredSkills.map((name) => {
      const normalized = name.trim().toLowerCase();
      const matched = applicantSkillMap.get(normalized);
      return {
        name,
        matched: Boolean(matched),
        proficiency: matched?.proficiency || null,
      };
    });

    const matched = required.filter((item) => item.matched);
    const missing = required.filter((item) => !item.matched);
    return { matched, missing };
  }, [applicantSkillMap, jobRequiredSkills]);
  const currentStatus = normalizeStatus(application?.application_status);
  const statusClass = APPLICATION_STATUS_CLASS[currentStatus];

  const handleSaveStatus = async () => {
    if (!application?.application_id || savingStatus) return;
    if (status === currentStatus) {
      toast.success('Status is already up to date');
      return;
    }

    setSavingStatus(true);
    try {
      await updateEmployerApplicationStatus(Number(application.application_id), status);
      setApplication((prev) => (prev ? { ...prev, application_status: status } : prev));
      toast.success('Application status updated');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update application status';
      toast.error(message);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleResumeDownload = async () => {
    if (!application?.application_id) {
      toast.error('Resume not available');
      return;
    }
    try {
      await downloadEmployerApplicantResume(Number(application.application_id));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to download resume';
      toast.error(message);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <button
            onClick={() => navigate('/employer/applications')}
            className="mb-4 text-sm text-text-muted hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Applications
          </button>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <UserRound className="w-7 h-7 text-brand-accent" /> Applicant Detail
          </h1>
          <p className="mt-2 text-sm text-text-muted">Detailed information for the selected application.</p>
        </div>

        {loading ? (
          <div className="rounded-3xl border-2 border-brand-accent/35 bg-brand-bg/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)] p-8 space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-12 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : !application ? (
          <div className="rounded-3xl border-2 border-brand-accent/35 bg-brand-bg/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)] p-8 text-center text-text-muted">Application not found.</div>
        ) : (
          <div className="rounded-3xl border-2 border-brand-accent/35 bg-brand-bg/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)] p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full border border-white/15 bg-brand-accent/15 text-brand-accent font-bold flex items-center justify-center overflow-hidden shrink-0">
                  {application.seeker?.avatar_url ? (
                    <img
                      src={application.seeker.avatar_url}
                      alt={application.seeker?.full_name ?? 'Applicant avatar'}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    String(application.seeker?.full_name ?? 'A').trim().charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                <h2 className="text-2xl font-display font-bold text-white">
                  {application.seeker?.full_name ?? 'Unknown Candidate'}
                </h2>
                <p className="text-text-muted mt-1 inline-flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> {application.job_title ?? 'Untitled Job'}
                </p>
              </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-bold capitalize ${statusClass}`}>
                {application.application_status ?? 'applied'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/20 bg-white/8 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Application ID</p>
                <p className="text-white font-medium">{application.application_id ?? 'N/A'}</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/8 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Applied At</p>
                <p className="text-white font-medium inline-flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-yellow-400" />
                  {application.applied_at ? new Date(application.applied_at).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/8 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Education</p>
                <p className="text-white font-medium inline-flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-brand-accent" />
                  {application.seeker?.education ?? 'Not provided'}
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/8 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Phone</p>
                <p className="text-white font-medium inline-flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-400" />
                  {application.seeker?.phone_number ?? 'Not provided'}
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/8 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Experience</p>
                <p className="text-white font-medium">{application.seeker?.experience_years ?? 0} years</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/8 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Job ID</p>
                <p className="text-white font-medium">{application.job_id ?? 'N/A'}</p>
              </div>
            </div>

            <div className="rounded-xl border border-white/20 bg-white/8 p-5">
              <h3 className="text-sm uppercase tracking-widest text-text-muted font-bold mb-4 inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-accent" /> Update Application Status
              </h3>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as ApplicationStatus)}
                  className={`rounded-xl border px-3 py-2.5 text-sm capitalize focus:outline-none focus:border-brand-accent/60 ${APPLICATION_STATUS_CLASS[status]}`}
                  disabled={savingStatus}
                >
                  {STATUS_OPTIONS.map((item) => (
                    <option key={item} value={item} className="bg-brand-bg text-white">
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => void handleSaveStatus()}
                  disabled={savingStatus}
                  className="btn-yellow px-4 py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingStatus ? 'Updating...' : 'Save Status'}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-white/20 bg-white/8 p-5">
              <h3 className="text-sm uppercase tracking-widest text-text-muted font-bold mb-4 inline-flex items-center gap-2">
                <Download className="w-4 h-4 text-brand-accent" /> Resume
              </h3>

              {application.application_id && application.seeker?.resume_url ? (
                <button
                  type="button"
                  onClick={() => void handleResumeDownload()}
                  className="inline-flex items-center gap-2 btn-yellow px-4 py-2.5 text-sm"
                >
                  <Download className="w-4 h-4" /> Download Resume
                </button>
              ) : (
                <p className="text-sm text-text-muted">Resume is not available for this applicant.</p>
              )}
            </div>

            <div className="rounded-xl border border-white/20 bg-white/8 p-5">
              <h3 className="text-sm uppercase tracking-widest text-text-muted font-bold mb-4 inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-accent" /> Skills
              </h3>

              {skills.length === 0 ? (
                <p className="text-sm text-text-muted">No skills listed.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={`${skill.name ?? 'skill'}-${index}`}
                      className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-white"
                    >
                      {skill.name ?? 'Skill'}
                      {skill.proficiency ? ` (${skill.proficiency})` : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-white/20 bg-white/8 p-5">
              <h3 className="text-sm uppercase tracking-widest text-text-muted font-bold mb-4 inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-accent" /> Required vs Applicant Skills
              </h3>

              {jobRequiredSkills.length === 0 ? (
                <p className="text-sm text-text-muted">Required job skills are not available for comparison.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-3">
                      Matched ({requiredSkillsComparison.matched.length})
                    </p>
                    {requiredSkillsComparison.matched.length === 0 ? (
                      <p className="text-sm text-text-muted">No matched required skills.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {requiredSkillsComparison.matched.map((item) => (
                          <span
                            key={item.name}
                            className="px-3 py-1 rounded-full border border-green-500/20 bg-green-500/10 text-xs text-green-300"
                          >
                            {item.name}
                            {item.proficiency ? ` (${item.proficiency})` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3">
                      Missing ({requiredSkillsComparison.missing.length})
                    </p>
                    {requiredSkillsComparison.missing.length === 0 ? (
                      <p className="text-sm text-text-muted">Applicant covers all required skills.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {requiredSkillsComparison.missing.map((item) => (
                          <span
                            key={item.name}
                            className="px-3 py-1 rounded-full border border-red-500/20 bg-red-500/10 text-xs text-red-300"
                          >
                            {item.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
