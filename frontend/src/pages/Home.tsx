import React, { useEffect, useState } from 'react';
import { Job } from '../types/job';
import { fetchJobs } from '../api';
import { HomeHero } from '../components/home/HomeHero';
import { HomeLatestJobsSection } from '../components/home/HomeLatestJobsSection';
import { HomeFeaturesSection } from '../components/home/HomeFeaturesSection';

export const Home = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs()
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch jobs:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-grid min-h-screen">
      <HomeHero />
      <HomeLatestJobsSection jobs={jobs} loading={loading} />
      <HomeFeaturesSection />
    </div>
  );
};
