import React from 'react';
import { JobCard } from '../JobCard';
import type { Job } from '../../types/job';

type Props = {
  loading: boolean;
  jobs: Job[];
  footerForJob: (job: Job) => React.ReactNode | undefined;
};

export const ExploreJobsResults: React.FC<Props> = ({ loading, jobs, footerForJob }) => {
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="h-56 glass-card animate-pulse border-white/5" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="glass-card p-10 text-center">
        <p className="text-text-muted">No verified jobs match your filters right now.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} footerActions={footerForJob(job)} />
      ))}
    </div>
  );
};
