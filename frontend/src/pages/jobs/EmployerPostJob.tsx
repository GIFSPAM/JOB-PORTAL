import React, { useMemo, useState } from 'react';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createEmployerJob } from '../../api';
import { PageContainer } from '../../components/layout/PageContainer';
import { useToast } from '../../components/Toast';

const JOB_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'contract', label: 'Contract' },
] as const;

export const EmployerPostJob: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState<(typeof JOB_TYPES)[number]['value']>('full_time');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [skillsInput, setSkillsInput] = useState('');

  const parsedSkills = useMemo(
    () =>
      skillsInput
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    [skillsInput],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !description.trim() || !location.trim()) {
      toast.error('Title, description and location are required.');
      return;
    }

    setSubmitting(true);
    try {
      await createEmployerJob({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        job_type: jobType,
        salary_min: salaryMin ? Number(salaryMin) : null,
        salary_max: salaryMax ? Number(salaryMax) : null,
        skills: parsedSkills,
      });
      toast.success('Job posted successfully.');
      navigate('/employer/my-jobs');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to post job';
      toast.error(message);
    } finally {
      setSubmitting(false);
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
            <PlusCircle className="w-7 h-7 text-brand-yellow" /> Post New Job
          </h1>
          <p className="mt-2 text-sm text-text-muted">Create a new opening for candidates.</p>
        </div>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="rounded-3xl border-2 border-brand-accent/35 bg-brand-bg/95 shadow-[0_24px_80px_rgba(0,0,0,0.55)] p-6 space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/3 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-accent/60"
                placeholder="Senior Frontend Engineer"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Location</span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/3 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-accent/60"
                placeholder="Remote"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Job Type</span>
              <select
                value={jobType}
                onChange={(event) => setJobType(event.target.value as (typeof JOB_TYPES)[number]['value'])}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/3 px-3 py-2.5 text-sm text-white capitalize focus:outline-none focus:border-brand-accent/60"
              >
                {JOB_TYPES.map((type) => (
                  <option key={type.value} value={type.value} className="bg-brand-bg text-white">
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Skills (comma separated)</span>
              <input
                value={skillsInput}
                onChange={(event) => setSkillsInput(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/3 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-accent/60"
                placeholder="react, typescript, node"
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Salary Min</span>
              <input
                value={salaryMin}
                onChange={(event) => setSalaryMin(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/3 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-accent/60"
                placeholder="30000"
                type="number"
                min={0}
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Salary Max</span>
              <input
                value={salaryMax}
                onChange={(event) => setSalaryMax(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/3 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-accent/60"
                placeholder="50000"
                type="number"
                min={0}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 w-full min-h-36 rounded-xl border border-white/10 bg-white/3 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-accent/60"
              placeholder="Describe role responsibilities, expectations, and requirements..."
              required
            />
          </label>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/employer/my-jobs')}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-sm font-bold text-text-muted hover:text-white hover:border-white/20 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-yellow px-4 py-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
};
