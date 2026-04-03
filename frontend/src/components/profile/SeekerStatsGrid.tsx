import React from 'react';
import { motion } from 'motion/react';

interface StatItem {
  label: string;
  value: number;
}

interface SeekerStatsGridProps {
  loading: boolean;
  statItems: StatItem[];
}

export const SeekerStatsGrid: React.FC<SeekerStatsGridProps> = ({ loading, statItems }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06 }}
          className="glass-card p-6"
        >
          <p className="text-xs uppercase tracking-widest text-text-muted font-bold">{item.label}</p>
          <p className="text-3xl font-display font-bold text-white mt-2">{loading ? '–' : item.value}</p>
        </motion.div>
      ))}
    </div>
  );
};
