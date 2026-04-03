import { useEffect, useState } from 'react';
import { fetchJobs } from '../api';
import { HomeHero, HomeLatestJobsSection, HomeFeaturesSection } from '../components';
import type { Job } from '../types';

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
