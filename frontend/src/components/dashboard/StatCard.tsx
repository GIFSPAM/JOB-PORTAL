import React from 'react';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  Icon: LucideIcon;
  colorClass: string;
  loading?: boolean;
  index?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  Icon,
  colorClass,
  loading = false,
  index = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="glass-card p-6 flex items-center gap-5"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-white">{loading ? '–' : value}</p>
        <p className="text-xs text-text-muted font-bold uppercase tracking-widest">{label}</p>
      </div>
    </motion.div>
  );
};
