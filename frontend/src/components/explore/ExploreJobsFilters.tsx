import React from 'react';
import { Filter, Search } from 'lucide-react';

type Props = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  jobTypeFilter: string;
  onJobTypeChange: (value: string) => void;
  skillFilter: string;
  onSkillChange: (value: string) => void;
  availableJobTypes: string[];
  availableSkills: string[];
};

export const ExploreJobsFilters: React.FC<Props> = ({
  searchQuery,
  onSearchChange,
  jobTypeFilter,
  onJobTypeChange,
  skillFilter,
  onSkillChange,
  availableJobTypes,
  availableSkills,
}) => (
  <div className="glass-card p-5">
    <div className="flex items-end gap-3 flex-wrap">
      <div className="space-y-1 flex-1 min-w-65">
        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Search Jobs</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Title, company, location, type"
            className="input-field input-field-with-icon"
          />
        </div>
      </div>
      <div className="space-y-1 min-w-55">
        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted inline-flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Type
        </label>
        <select value={jobTypeFilter} onChange={(event) => onJobTypeChange(event.target.value)} className="input-field h-12">
          {availableJobTypes.map((typeValue) => (
            <option key={typeValue} value={typeValue}>
              {typeValue === 'all' ? 'All Types' : typeValue}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1 min-w-55">
        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted inline-flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Skill
        </label>
        <select value={skillFilter} onChange={(event) => onSkillChange(event.target.value)} className="input-field h-12">
          {availableSkills.map((skillValue) => (
            <option key={skillValue} value={skillValue}>
              {skillValue === 'all' ? 'All Skills' : skillValue}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
);
