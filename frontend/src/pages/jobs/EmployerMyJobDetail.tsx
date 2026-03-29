import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Briefcase, CalendarClock, MapPin, ShieldCheck, Users } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchEmployerJobs, updateEmployerJob, updateEmployerJobStatus } from '../../api';
import { PageContainer } from '../../components/layout/PageContainer';
import { useToast } from '../../components/Toast';

type EmployerJob = {
  job_id?: number;
  title?: string;
  description?: string;
  location?: string;
  job_type?: string;
  status?: string;
  applicant_count?: number;
  salary_min?: number;
  salary_max?: number;
  posted_at?: string;
  is_verified?: number | boolean;
  skills?: string[];
};

type LocationState = {
  job?: EmployerJob;
};

const JOB_STATUS_CLASS: Record<string, string> = {
  open: 'bg-green-500/10 text-green-400 border-green-500/20',
  closed: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export const EmployerMyJobDetail: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const parsedJobId = Number(jobId);
  const validJobId = Number.isInteger(parsedJobId) && parsedJobId > 0;

  const initialFromState = (location.state as LocationState | null)?.job ?? null;
  const [job, setJob] = useState<EmployerJob | null>(initialFromState);
  const [loading, setLoading] = useState(!initialFromState);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [jobType, setJobType] = useState('full_time');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [statusDraft, setStatusDraft] = useState<'open' | 'closed'>('closed');
  const [editMode, setEditMode] = useState(false);

  const loadDraftFromJob = (value: EmployerJob) => {
    setTitle(String(value.title ?? ''));
    setDescription(String(value.description ?? ''));
    setLocationText(String(value.location ?? ''));
    setJobType(String(value.job_type ?? 'full_time').toLowerCase());
    setSalaryMin(value.salary_min !== null && value.salary_min !== undefined ? String(value.salary_min) : '');
    setSalaryMax(value.salary_max !== null && value.salary_max !== undefined ? String(value.salary_max) : '');
    setSkillsInput(Array.isArray(value.skills) ? value.skills.join(', ') : '');
    setStatusDraft(String(value.status ?? 'closed').toLowerCase() === 'open' ? 'open' : 'closed');
  };

  useEffect(() => {
    if (!validJobId) {
      toast.error('Invalid job ID');
      navigate('/employer/my-jobs', { replace: true });
      return;
    }

    if (initialFromState?.job_id && Number(initialFromState.job_id) === parsedJobId) {
      return;
    }

    setLoading(true);
    fetchEmployerJobs()
      .then((rows) => {
        const found = (rows as EmployerJob[]).find((item) => Number(item.job_id) === parsedJobId);
        setJob(found ?? null);
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Failed to fetch job detail';
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, [initialFromState, navigate, parsedJobId, toast, validJobId]);

  useEffect(() => {
    if (!job) return;
    loadDraftFromJob(job);
  }, [job]);

  const status = String(job?.status ?? 'closed').toLowerCase();
  const statusClass = JOB_STATUS_CLASS[status] ?? 'bg-white/5 text-white border-white/10';
  const salaryRange = useMemo(() => {
    const min = Number(job?.salary_min ?? 0);
    const max = Number(job?.salary_max ?? 0);
    if (min > 0 && max > 0) return `${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min > 0) return `${min.toLocaleString()}+`;
    if (max > 0) return `Up to ${max.toLocaleString()}`;
    return 'Not specified';
  }, [job?.salary_max, job?.salary_min]);

  const handleUpdate = async () => {
    if (!job?.job_id) {
      toast.error('Invalid job data');
      return;
    }

    if (!title.trim() || !description.trim() || !locationText.trim()) {
      toast.error('Title, description and location are required.');
      return;
    }

    setSaving(true);
    try {
      const skills = skillsInput
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);

      await updateEmployerJob(Number(job.job_id), {
        title: title.trim(),
        description: description.trim(),
        location: locationText.trim(),
        job_type: jobType.trim().toLowerCase() || 'full_time',
        salary_min: salaryMin ? Number(salaryMin) : null,
        salary_max: salaryMax ? Number(salaryMax) : null,
        skills,
      });

      if (statusDraft !== (status === 'open' ? 'open' : 'closed')) {
        await updateEmployerJobStatus(Number(job.job_id), statusDraft);
      }

      const refreshed = await fetchEmployerJobs();
      const next = (refreshed as EmployerJob[]).find((item) => Number(item.job_id) === Number(job.job_id));
      setJob(next ?? {
        ...job,
        title: title.trim(),
        description: description.trim(),
        location: locationText.trim(),
        job_type: jobType.trim().toLowerCase() || 'full_time',
        salary_min: salaryMin ? Number(salaryMin) : null,
        salary_max: salaryMax ? Number(salaryMax) : null,
        skills,
        status: statusDraft,
      });

      toast.success('Job updated successfully.');
      setEditMode(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update job';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <button
            onClick={() => navigate('/employer/my-jobs')}
            className="mb-4 text-sm text-text-muted hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Jobs
          </button>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-brand-yellow" /> Job Details
          </h1>
          <p className="mt-2 text-sm text-text-muted">View complete details for your posted job.</p>
        </div>

        {loading ? (
          <div className="rounded-3xl border-2 border-brand-accent/35 bg-brand-bg/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)] p-8 space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-12 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : !job ? (
          <div className="rounded-3xl border-2 border-brand-accent/35 bg-brand-bg/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)] p-8 text-center text-text-muted">
            Job not found.
          </div>
        ) : (
          <div className="rounded-3xl border-2 border-brand-accent/35 bg-brand-bg/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)] p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                {editMode ? (
                  <div className="space-y-2">
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Job title"
                      className="w-full md:w-md rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-base font-semibold text-white focus:outline-none focus:border-brand-accent/60"
                    />
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        value={locationText}
                        onChange={(event) => setLocationText(event.target.value)}
                        placeholder="Location"
                        className="w-full md:w-md rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/60"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-display font-bold text-white">{job.title ?? 'Untitled Job'}</h2>
                    <p className="text-text-muted mt-1 inline-flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {job.location ?? 'Location not specified'}
                    </p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {editMode ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setStatusDraft((prev) => (prev === 'open' ? 'closed' : 'open'))}
                      className={`relative w-14 h-8 rounded-full border transition-all ${
                        statusDraft === 'open'
                          ? 'bg-green-500/20 border-green-500/40'
                          : 'bg-red-500/20 border-red-500/40'
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${
                          statusDraft === 'open' ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                    <span className="text-xs px-2.5 py-1 rounded-full border font-bold capitalize bg-white/5 text-white border-white/10">
                      {statusDraft}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (job) loadDraftFromJob(job);
                        setEditMode(false);
                      }}
                      className="px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-text-muted hover:text-white hover:border-white/20 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleUpdate()}
                      disabled={saving}
                      className="btn-yellow px-4 py-2 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-bold capitalize ${statusClass}`}>
                      {job.status ?? 'closed'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditMode(true)}
                      className="relative w-14 h-8 rounded-full border transition-all bg-white/10 border-white/20"
                      title="Enable editing"
                    >
                      <span className="absolute top-1 left-1 h-6 w-6 rounded-full bg-white transition-all" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/20 bg-white/8 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Job ID</p>
                <p className="text-white font-medium">{job.job_id ?? 'N/A'}</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/8 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Job Type</p>
                <select
                  value={jobType}
                  onChange={(event) => setJobType(event.target.value)}
                  disabled={!editMode}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white capitalize focus:outline-none focus:border-brand-accent/60"
                >
                  <option value="full_time" className="bg-brand-bg text-white">Full-time</option>
                  <option value="part_time" className="bg-brand-bg text-white">Part-time</option>
                  <option value="internship" className="bg-brand-bg text-white">Internship</option>
                  <option value="contract" className="bg-brand-bg text-white">Contract</option>
                </select>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/8 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Salary Range</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={0}
                    value={salaryMin}
                    onChange={(event) => setSalaryMin(event.target.value)}
                    disabled={!editMode}
                    placeholder="Min"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/60"
                  />
                  <input
                    type="number"
                    min={0}
                    value={salaryMax}
                    onChange={(event) => setSalaryMax(event.target.value)}
                    disabled={!editMode}
                    placeholder="Max"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/60"
                  />
                </div>
                <p className="text-xs text-text-muted mt-2">Current: {salaryRange}</p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/8 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Applicants</p>
                <p className="text-white font-medium inline-flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-accent" /> {Number(job.applicant_count ?? 0)}
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/8 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Posted At</p>
                <p className="text-white font-medium inline-flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-yellow-400" />
                  {job.posted_at ? new Date(job.posted_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/8 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Verification</p>
                <p className="text-white font-medium inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  {job.is_verified ? 'Verified' : 'Pending'}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/20 bg-white/8 p-5">
              <h3 className="text-sm uppercase tracking-widest text-text-muted font-bold mb-3">Description</h3>
              {editMode ? (
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Job description"
                  className="w-full min-h-32 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-accent/60"
                />
              ) : (
                <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                  {description || 'No description provided.'}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-white/20 bg-white/8 p-5">
              <h3 className="text-sm uppercase tracking-widest text-text-muted font-bold mb-3">Required Skills</h3>
              {editMode ? (
                <input
                  value={skillsInput}
                  onChange={(event) => setSkillsInput(event.target.value)}
                  placeholder="Skills (comma separated)"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-accent/60"
                />
              ) : (
                <>
                  {skillsInput.trim() ? (
                    <div className="flex flex-wrap gap-2">
                      {skillsInput
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean)
                        .map((skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-white"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted">No skills specified.</p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
