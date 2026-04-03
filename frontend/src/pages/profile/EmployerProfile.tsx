import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchEmployerProfile,
  fetchEmployerJobs,
  fetchEmployerStats,
  updateEmployerProfile,
  uploadEmployerProfilePicture,
} from '../../api';
import { useToast } from '../../components/Toast';
import {
  EmployerCompanyDetailsCard,
  EmployerJobsPostedCard,
  EmployerProfileHeader,
  EmployerStatsGrid,
} from '../../components/profile';

export const EmployerProfile: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    Promise.all([fetchEmployerProfile(), fetchEmployerJobs(), fetchEmployerStats()])
      .then(([profilePayload, jobsPayload, statsPayload]) => {
        setProfile(profilePayload);
        setJobs(jobsPayload);
        setStats(statsPayload);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    if (!profile) return;
    setCompanyName(String(profile.company_name ?? ''));
    setIndustry(String(profile.industry ?? ''));
    setCompanyLocation(String(profile.company_location ?? ''));
    setCompanySize(String(profile.company_size ?? ''));
    setCompanyPhone(String(profile.company_phone ?? ''));
    setCompanyWebsite(String(profile.company_website ?? ''));
  }, [profile]);

  const resetProfileDraft = () => {
    setCompanyName(String(profile?.company_name ?? ''));
    setIndustry(String(profile?.industry ?? ''));
    setCompanyLocation(String(profile?.company_location ?? ''));
    setCompanySize(String(profile?.company_size ?? ''));
    setCompanyPhone(String(profile?.company_phone ?? ''));
    setCompanyWebsite(String(profile?.company_website ?? ''));
  };

  const triggerLogoPicker = () => {
    logoInputRef.current?.click();
  };

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const allowedTypes = new Set(['image/jpeg', 'image/jpg', 'image/png']);
    const fileName = selectedFile.name.toLowerCase();
    const hasAllowedExtension = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png');
    if (!(allowedTypes.has(selectedFile.type.toLowerCase()) || hasAllowedExtension)) {
      toast.error('Only JPG, JPEG, and PNG images are supported.');
      event.target.value = '';
      return;
    }

    setLogoUploading(true);
    try {
      await uploadEmployerProfilePicture(selectedFile);
      const refreshedProfile = await fetchEmployerProfile();
      setProfile(refreshedProfile);
      toast.success('Company logo updated successfully.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update company logo';
      toast.error(message);
    } finally {
      setLogoUploading(false);
      event.target.value = '';
    }
  };

  const handleSaveProfile = async () => {
    const payload = {
      company_name: companyName.trim(),
      industry: industry.trim(),
      company_location: companyLocation.trim(),
      company_size: companySize.trim(),
      company_phone: companyPhone.trim(),
      company_website: companyWebsite.trim(),
    };

    setSaving(true);
    try {
      await updateEmployerProfile(payload);
      setProfile((prev: any) => ({ ...prev, ...payload }));
      toast.success('Profile updated successfully.');
      setEditMode(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const totalApplicants = useMemo(
    () => Number(stats?.total_applications ?? 0),
    [stats],
  );

  return (
    <section className="pt-28 pb-16 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        <EmployerProfileHeader
          companyName={String(profile?.company_name ?? '')}
          logoUrl={String(profile?.profile_picture_url ?? profile?.logo_url ?? '')}
          onBack={() => navigate('/employer/dashboard')}
        />

        <EmployerStatsGrid
          loading={loading}
          jobsCount={stats?.total_jobs ?? jobs.length}
          openJobsCount={stats?.open_jobs ?? jobs.filter((job) => job.status === 'open').length}
          verifiedJobsCount={stats?.verified_jobs ?? jobs.filter((job) => job.is_verified).length}
          totalApplicants={totalApplicants}
        />

        <EmployerCompanyDetailsCard
          loading={loading}
          profile={profile}
          editMode={editMode}
          saving={saving}
          logoUploading={logoUploading}
          companyName={companyName}
          industry={industry}
          companyLocation={companyLocation}
          companySize={companySize}
          companyPhone={companyPhone}
          companyWebsite={companyWebsite}
          onCompanyNameChange={setCompanyName}
          onIndustryChange={setIndustry}
          onCompanyLocationChange={setCompanyLocation}
          onCompanySizeChange={setCompanySize}
          onCompanyPhoneChange={setCompanyPhone}
          onCompanyWebsiteChange={setCompanyWebsite}
          onEnableEdit={() => setEditMode(true)}
          onCancelEdit={() => {
            resetProfileDraft();
            setEditMode(false);
          }}
          onSaveProfile={() => void handleSaveProfile()}
          logoInputRef={logoInputRef}
          onLogoUpload={handleLogoUpload}
          onTriggerLogoPicker={triggerLogoPicker}
        />

        <EmployerJobsPostedCard
          loading={loading}
          jobs={jobs}
          profileLogoUrl={String(profile?.profile_picture_url ?? profile?.logo_url ?? '')}
        />
      </div>
    </section>
  );
};
