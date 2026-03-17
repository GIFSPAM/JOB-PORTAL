import React from 'react';
import { motion } from 'motion/react';
import { Building2, MapPin, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { JobCardProps } from '../types/job';
import { COMPANY_LOGOS } from '../assets/logos';
import { formatJobType } from '../utils/formatters';
export const JobCard: React.FC<JobCardProps> = ({
  job,
  clickable = true,
  onClick,
  metaBadge,
  footerActions,
}) => {
  const navigate = useNavigate();
  const handleCardClick = onClick ?? (() => navigate(`/jobs/${job.id}`));

  return (
    <motion.div
      whileHover={clickable ? { y: -8, borderColor: 'rgba(59, 130, 246, 0.4)', backgroundColor: 'rgba(255, 255, 255, 0.04)' } : undefined}
      className={`glass-card p-8 flex flex-col justify-between group transition-all border-white/5 ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={clickable ? handleCardClick : undefined}
    >
      <div className="flex items-start justify-between mb-8">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 shadow-sm flex items-center justify-center overflow-hidden">
          {<img src={ job.logo || COMPANY_LOGOS.co_opert} className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
        </div>
        {metaBadge ?? (
          <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/10">
            {formatJobType(job.type)}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-accent transition-colors">{job.title}</h3>
        {job.employerId ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              navigate(`/employers/${job.employerId}?jobId=${job.id}`);
            }}
            className="text-text-muted font-medium mb-8 inline-flex items-center gap-1.5 hover:text-brand-accent transition-colors"
          >
            <Building2 className="w-4 h-4" /> {job.company}
          </button>
        ) : (
          <p className="text-text-muted font-medium mb-8">{job.company}</p>
        )}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-white/5 text-sm text-text-muted">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-text-muted" /> {job.location}
        </div>
        <div className="flex items-center gap-2 font-bold text-white">
          <DollarSign className="w-4 h-4 text-brand-accent" /> {job.salary}
        </div>
      </div>

      {footerActions && (
        <div className="pt-4 mt-4 border-t border-white/5">
          {footerActions}
        </div>
      )}
    </motion.div>
  );
};
