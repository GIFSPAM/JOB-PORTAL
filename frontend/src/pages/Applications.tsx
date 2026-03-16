import React, { useEffect, useState } from 'react';
import { Calendar, FileText, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchSeekerApplications, fetchSeekerStats, revokeSeekerApplication } from '../api';
import { SeekerApplicationsSection, type SeekerApplicationItem } from '../components/dashboard/SeekerApplicationsSection';
import { StatCard } from '../components/dashboard/StatCard';
import { useToast } from '../components/Toast';
import { PageContainer } from '../components/layout/PageContainer';

export const Applications: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [applications, setApplications] = useState<SeekerApplicationItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revokingApplicationId, setRevokingApplicationId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([fetchSeekerApplications(), fetchSeekerStats()])
      .then(([applicationsPayload, statsPayload]) => {
        setApplications(applicationsPayload);
        setStats(statsPayload);
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Failed to fetch applications';
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const handleRevokeApplication = async (applicationId: number) => {
    setRevokingApplicationId(applicationId);
    try {
      const target = applications.find((item) => Number(item.application_id) === Number(applicationId));
      await revokeSeekerApplication(applicationId);
      setApplications((prev) => prev.filter((item) => Number(item.application_id) !== Number(applicationId)));
      setStats((prev: any) => {
        if (!prev) return prev;
        const statusKey = String(target?.status || '').toLowerCase();
        const currentBucket = Number(prev?.applications_by_status?.[statusKey] ?? 0);
        return {
          ...prev,
          total_applications: Math.max(0, Number(prev.total_applications ?? 0) - 1),
          applications_by_status: {
            ...prev.applications_by_status,
            ...(statusKey
              ? { [statusKey]: Math.max(0, currentBucket - 1) }
              : {}),
          },
        };
      });
      toast.success('Application revoked.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to revoke application';
      toast.error(message);
    } finally {
      setRevokingApplicationId(null);
    }
  };

  const statCards = [
    {
      label: 'Applications',
      value: stats?.total_applications ?? applications.length,
      Icon: FileText,
      colorClass: 'text-brand-accent bg-brand-accent/10',
    },
    {
      label: 'Shortlisted',
      value: stats?.applications_by_status?.shortlisted ?? applications.filter((item) => item.status === 'shortlisted').length,
      Icon: Calendar,
      colorClass: 'text-green-400 bg-green-500/10',
    },
    {
      label: 'Applied',
      value: stats?.applications_by_status?.applied ?? applications.filter((item) => item.status === 'applied').length,
      Icon: Search,
      colorClass: 'text-blue-400 bg-blue-500/10',
    },
  ];

  return (
    <PageContainer>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Applications</h1>
          <p className="mt-2 text-sm text-text-muted max-w-2xl">
            Review every job you have applied for, track its current status, and revoke an application when needed.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {statCards.map(({ label, value, Icon, colorClass }, index) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            Icon={Icon}
            colorClass={colorClass}
            loading={loading}
            index={index}
          />
        ))}
      </div>

      <div className="glass-card p-8">
        <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-400" /> Status Breakdown
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Applied', value: stats?.applications_by_status?.applied ?? 0, cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
            { label: 'Shortlisted', value: stats?.applications_by_status?.shortlisted ?? 0, cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
            { label: 'Rejected', value: stats?.applications_by_status?.rejected ?? 0, cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
            { label: 'Hired', value: stats?.applications_by_status?.hired ?? 0, cls: 'text-green-400 bg-green-500/10 border-green-500/20' },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/5 bg-white/3 p-4 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-white">{item.label}</span>
              <span className={`px-3 py-1 rounded-full border text-xs font-bold ${item.cls}`}>
                {loading ? '–' : item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <SeekerApplicationsSection
        applications={applications}
        loading={loading}
        revokingApplicationId={revokingApplicationId}
        onRevoke={handleRevokeApplication}
        onBrowseJobs={() => navigate('/explore-jobs')}
      />
    </PageContainer>
  );
};