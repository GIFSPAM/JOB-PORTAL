import React from 'react';
import { Briefcase } from 'lucide-react';

type Props = {
  loading: boolean;
  resultCount: number;
};

export const ExploreJobsHeader: React.FC<Props> = ({ loading, resultCount }) => (
  <div className="flex items-start justify-between gap-4 flex-wrap">
    <div>
      <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
        <Briefcase className="w-7 h-7 text-brand-accent" /> Explore Jobs
      </h1>
      <p className="text-text-muted mt-1">Browse verified openings published on the platform.</p>
    </div>
    <span className="inline-flex items-center px-3 py-1 rounded-full border border-brand-accent/20 bg-brand-accent/10 text-brand-accent text-xs font-bold uppercase tracking-widest">
      {loading ? 'Loading...' : `${resultCount} verified jobs`}
    </span>
  </div>
);
