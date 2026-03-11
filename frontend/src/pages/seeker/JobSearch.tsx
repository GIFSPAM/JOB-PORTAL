/**
 * ==========================================
 * JOB SEARCH PAGE
 * ==========================================
 * 
 * Job search interface for job seekers:
 * - Search and filter jobs
 * - View job listings in card/grid format
 * - Apply to jobs directly
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Briefcase, DollarSign, Filter, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import { getPublicJobs, getSkillsList } from '@/services/api';
import type { Job, Skill, JobFilters } from '@/types';

/**
 * Job Search Component
 */
const JobSearch: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    location: '',
    job_type: undefined,
    skills: [],
    sort_by: 'date',
  });

  /**
   * Fetch jobs and skills on mount
   */
  useEffect(() => {
    fetchJobs();
    fetchSkills();
  }, []);

  /**
   * Fetch jobs from API
   */
  const fetchJobs = async (searchFilters?: JobFilters) => {
    setIsLoading(true);
    try {
      const response = await getPublicJobs(searchFilters || filters);
      
      if (response.success && response.data) {
        setJobs(response.data);
      }
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch available skills
   */
  const fetchSkills = async () => {
    try {
      const response = await getSkillsList();
      if (response.success && response.data) {
        setSkills(response.data);
      }
    } catch (error) {
      console.error('Failed to load skills');
    }
  };

  /**
   * Handle search submission
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(filters);
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  /**
   * Handle skill selection
   */
  const handleSkillToggle = (skillName: string) => {
    setFilters(prev => {
      const currentSkills = prev.skills || [];
      const newSkills = currentSkills.includes(skillName)
        ? currentSkills.filter(s => s !== skillName)
        : [...currentSkills, skillName];
      return { ...prev, skills: newSkills };
    });
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      job_type: undefined,
      skills: [],
      sort_by: 'date',
    });
    fetchJobs({});
  };

  /**
   * Format salary
   */
  const formatSalary = (min: number, max: number) => {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Sidebar */}
      <Sidebar role="jobseeker" />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Featured Jobs</h1>
          <p className="text-gray-400">Find your dream job from our curated listings.</p>
        </div>

        {/* Search & Filters */}
        <div className="glass rounded-xl p-6 mb-8">
          <form onSubmit={handleSearch}>
            {/* Search Bar */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by job title..."
                  className="form-input pl-10"
                />
              </div>
              <button
                type="submit"
                className="btn-primary flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-4">
              {/* Location Filter */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="Location"
                  className="form-input w-40"
                />
              </div>

              {/* Job Type Filter */}
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <select
                  value={filters.job_type || ''}
                  onChange={(e) => handleFilterChange('job_type', e.target.value || undefined)}
                  className="form-input w-40"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filters.sort_by}
                  onChange={(e) => handleFilterChange('sort_by', e.target.value as 'date' | 'salary')}
                  className="form-input w-40"
                >
                  <option value="date">Newest First</option>
                  <option value="salary">Highest Salary</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                type="button"
                onClick={clearFilters}
                className="text-gray-400 hover:text-white text-sm"
              >
                Clear filters
              </button>
            </div>

            {/* Skills Filter */}
            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2">Filter by skills:</p>
              <div className="flex flex-wrap gap-2">
                {skills.slice(0, 10).map((skill) => (
                  <button
                    key={skill.skill_id}
                    type="button"
                    onClick={() => handleSkillToggle(skill.skill_name)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.skills?.includes(skill.skill_name)
                        ? 'bg-purple-500 text-white'
                        : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                    }`}
                  >
                    {skill.skill_name}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-400">
            {isLoading ? 'Loading jobs...' : `${jobs.length} jobs found`}
          </p>
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton h-64 rounded-xl" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No jobs found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your search filters.</p>
            <button onClick={clearFilters} className="btn-secondary">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.job_id}
                className="job-card hover-lift cursor-pointer"
                onClick={() => navigate(`/seeker/jobs/${job.job_id}`)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="badge badge-info">{job.job_type}</span>
                </div>

                {/* Job Info */}
                <h3 className="text-lg font-semibold text-white mb-1">{job.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{job.company_name || 'Company Name'}</p>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <DollarSign className="w-4 h-4" />
                    {formatSalary(job.salary_min, job.salary_max)}
                  </div>
                </div>

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full">
                        +{job.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-purple-500/20">
                  <span className="text-sm text-gray-500">
                    Posted {formatDate(job.posted_at)}
                  </span>
                  <button className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm">
                    View Details
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default JobSearch;
