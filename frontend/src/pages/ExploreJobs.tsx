import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { useExploreJobs } from '../features/explore-jobs/useExploreJobs';
import { ExploreJobsHeader } from '../components/explore/ExploreJobsHeader';
import { ExploreJobsFilters } from '../components/explore/ExploreJobsFilters';
import { ExploreJobsResults } from '../components/explore/ExploreJobsResults';
import { ExploreJobSeekerActions } from '../components/explore/ExploreJobSeekerActions';
import type { Job } from '../types/job';

export const ExploreJobs: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const isSeeker = user?.role === 'jobseeker';

  const explore = useExploreJobs(isSeeker, toast);

  const footerForJob = (job: Job) => {
    if (!isSeeker) return undefined;
    const isApplied = explore.appliedJobIds.includes(job.id);
    const isClosed = String(job.status ?? '').toLowerCase() === 'closed';
    return (
      <ExploreJobSeekerActions
        isApplied={isApplied}
        isClosed={isClosed}
        isSaved={explore.savedJobIds.includes(job.id)}
        applying={explore.applyingJobId === job.id}
        saving={explore.savingJobId === job.id}
        onApply={() => {
          if (isClosed) {
            toast.error('Job is closed');
            return;
          }
          void explore.handleApply(job.id);
        }}
        onToggleSave={() => void explore.handleToggleSave(job.id)}
      />
    );
  };

  return (
    <PageContainer maxWidthClass="max-w-7xl" contentClassName="space-y-6">
      <ExploreJobsHeader loading={explore.loading} resultCount={explore.filteredJobs.length} />
      <ExploreJobsFilters
        searchQuery={explore.searchQuery}
        onSearchChange={explore.setSearchQuery}
        jobTypeFilter={explore.jobTypeFilter}
        onJobTypeChange={explore.setJobTypeFilter}
        skillFilter={explore.skillFilter}
        onSkillChange={explore.setSkillFilter}
        availableJobTypes={explore.availableJobTypes}
        availableSkills={explore.availableSkills}
      />
      <ExploreJobsResults loading={explore.loading} jobs={explore.filteredJobs} footerForJob={footerForJob} />
    </PageContainer>
  );
};
