import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { JobCard } from '../JobCard';
import type { Job } from '../../types/job';

type Props = {
  jobs: Job[];
  loading: boolean;
};

export const HomeLatestJobsSection: React.FC<Props> = ({ jobs, loading }) => (
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
    className="py-24 px-6 border-t border-white/5 bg-black/40"
  >
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
        <div>
          <h2 className="text-4xl font-display font-bold text-white mb-3">Latest Openings</h2>
          <p className="text-text-muted">Explore the most recent opportunities added to our platform.</p>
        </div>
        <Link to="/explore-jobs" className="text-brand-accent font-bold text-sm flex items-center gap-2 group">
          Browse All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading
          ? [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 glass-card animate-pulse border-white/5" />
            ))
          : jobs.map((job) => <JobCard key={job.id} job={job} />)}
      </div>
    </div>
  </motion.section>
);
