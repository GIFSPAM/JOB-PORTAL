import React from 'react';
import { motion } from 'motion/react';
import { Users, Briefcase, TrendingUp, BadgeCheck } from 'lucide-react';

interface EmployerStatsGridProps {
  loading: boolean;
  jobsCount: number;
  openJobsCount: number;
  verifiedJobsCount: number;
  totalApplicants: number;
}

export const EmployerStatsGrid: React.FC<EmployerStatsGridProps> = ({
  loading,
  jobsCount,
  openJobsCount,
  verifiedJobsCount,
  totalApplicants,
}) => {
  const statItems = [
    { label: 'Jobs Posted', value: jobsCount, Icon: Briefcase, color: 'text-yellow-400 bg-yellow-500/10' },
    { label: 'Open Listings', value: openJobsCount, Icon: TrendingUp, color: 'text-green-400 bg-green-500/10' },
    { label: 'Verified Jobs', value: verifiedJobsCount, Icon: BadgeCheck, color: 'text-white bg-white/5' },
    { label: 'Applicants', value: totalApplicants, Icon: Users, color: 'text-brand-accent bg-brand-accent/10' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {statItems.map(({ label, value, Icon, color }, index) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06 }}
          className="glass-card p-6 flex items-center gap-5"
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-white">{loading ? '–' : value}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">{label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
