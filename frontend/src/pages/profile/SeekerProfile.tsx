import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchSeekerOverview,
  fetchSeekerProfile,
  downloadSeekerResume,
  removeSeekerSavedJob,
  uploadSeekerProfilePicture,
  updateSeekerResume,
  updateSeekerProfile,
  updateSeekerSkills,
} from '../../api';
import { useToast } from '../../components/Toast';
import { PageContainer } from '../../components/layout/PageContainer';
import {
  RecentApplicationsCard,
  SavedJobsSummaryCard,
  SeekerProfileDetailsCard,
  SeekerProfileHeader,
  SeekerStatsGrid,
} from '../../components/profile';
import type {
  SavedJob,
  SeekerApplication,
  SeekerProfile as SeekerProfileData,
  SeekerSkill,
  SeekerStats,
} from '../../types/seeker';

export const SeekerProfile: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [profile, setProfile] = useState<SeekerProfileData | null>(null);
  const [stats, setStats] = useState<SeekerStats | null>(null);
  const [applications, setApplications] = useState<SeekerApplication[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeDownloading, setResumeDownloading] = useState(false);
  const [removingSavedJobId, setRemovingSavedJobId] = useState<number | null>(null);
  const [isProfileEditMode, setIsProfileEditMode] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    education: '',
    phone_number: '',
    experience_years: '0',
  });
  const [isSkillsEditMode, setIsSkillsEditMode] = useState(false);
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const [skillsForm, setSkillsForm] = useState<SeekerSkill[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState('intermediate');
  const profileImageInputRef = useRef<HTMLInputElement | null>(null);
  const resumeFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchSeekerOverview()
      .then(({ profile: profilePayload, stats: statsPayload, applications: applicationsPayload, savedJobs: savedJobsPayload }) => {
        setProfile(profilePayload);
        setStats(statsPayload);
        setApplications(applicationsPayload);
        setSavedJobs(savedJobsPayload);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [toast]);

  const statItems = [
    { label: 'Applications', value: stats?.total_applications ?? applications.length },
    { label: 'Saved Jobs', value: stats?.saved_jobs ?? savedJobs.length },
    { label: 'Skills', value: stats?.skills_count ?? profile?.skills?.length ?? 0 },
  ];

  const triggerResumePicker = () => {
    resumeFileInputRef.current?.click();
  };

  const triggerProfileImagePicker = () => {
    profileImageInputRef.current?.click();
  };

  const handleProfileImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
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

    setProfileImageUploading(true);
    try {
      await uploadSeekerProfilePicture(selectedFile);
      const refreshedProfile = await fetchSeekerProfile();
      setProfile(refreshedProfile);
      toast.success('Profile photo updated successfully.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile photo';
      toast.error(message);
    } finally {
      setProfileImageUploading(false);
      event.target.value = '';
    }
  };

  const handleResumeUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      toast.error('Please upload a PDF resume file.');
      event.target.value = '';
      return;
    }

    setResumeUploading(true);
    try {
      await updateSeekerResume(selectedFile);
      const refreshedProfile = await fetchSeekerProfile();
      setProfile(refreshedProfile);
      toast.success('Resume updated successfully.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update resume';
      toast.error(message);
    } finally {
      setResumeUploading(false);
      event.target.value = '';
    }
  };

  const handleResumeDownload = async () => {
    setResumeDownloading(true);
    try {
      await downloadSeekerResume();
      toast.success('Resume download started.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to download resume';
      toast.error(message);
    } finally {
      setResumeDownloading(false);
    }
  };

  const openProfileEditor = () => {
    setProfileForm({
      full_name: profile?.full_name ?? '',
      education: profile?.education ?? '',
      phone_number: profile?.phone_number ?? '',
      experience_years: String(profile?.experience_years ?? 0),
    });
    setIsProfileEditMode(true);
  };

  const closeProfileEditor = () => {
    setIsProfileEditMode(false);
  };

  const handleProfileFormChange = (
    field: 'full_name' | 'education' | 'phone_number' | 'experience_years',
    value: string,
  ) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    const parsedExperience = Number(profileForm.experience_years);
    const safeExperience = Number.isFinite(parsedExperience) && parsedExperience >= 0
      ? Math.floor(parsedExperience)
      : 0;

    setIsSavingProfile(true);
    try {
      await updateSeekerProfile({
        full_name: profileForm.full_name.trim(),
        education: profileForm.education.trim(),
        phone_number: profileForm.phone_number.trim(),
        experience_years: safeExperience,
      });

      const refreshedProfile = await fetchSeekerProfile();
      setProfile(refreshedProfile);
      setIsProfileEditMode(false);
      toast.success('Profile updated successfully.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const openSkillsEditor = () => {
    setSkillsForm(profile?.skills?.length ? [...profile.skills] : []);
    setNewSkillName('');
    setNewSkillProficiency('intermediate');
    setIsSkillsEditMode(true);
  };

  const closeSkillsEditor = () => {
    setIsSkillsEditMode(false);
    setSkillsForm([]);
    setNewSkillName('');
  };

  const addSkill = () => {
    if (!newSkillName.trim()) {
      toast.error('Skill name cannot be empty');
      return;
    }

    if (skillsForm.some((skill) => skill.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      toast.error('Skill already added');
      return;
    }

    setSkillsForm([...skillsForm, { name: newSkillName.trim(), proficiency: newSkillProficiency }]);
    setNewSkillName('');
    setNewSkillProficiency('intermediate');
  };

  const removeSkill = (index: number) => {
    setSkillsForm((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSkillProficiency = (index: number, proficiency: string) => {
    setSkillsForm((prev) => prev.map((skill, i) => (i === index ? { ...skill, proficiency } : skill)));
  };

  const handleSaveSkills = async () => {
    const allowedProficiency = new Set(['beginner', 'intermediate', 'advanced']);
    const normalizedSkills = skillsForm.map((skill) => ({
      ...skill,
      proficiency: allowedProficiency.has(String(skill.proficiency).toLowerCase())
        ? String(skill.proficiency).toLowerCase()
        : 'intermediate',
    }));

    setIsSavingSkills(true);
    try {
      await updateSeekerSkills(normalizedSkills);
      const refreshedProfile = await fetchSeekerProfile();
      setProfile(refreshedProfile);
      setIsSkillsEditMode(false);
      toast.success('Skills updated successfully.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update skills';
      toast.error(message);
    } finally {
      setIsSavingSkills(false);
    }
  };

  const handleRemoveSavedJob = async (jobId: number) => {
    if (!Number.isInteger(jobId) || jobId <= 0) return;
    setRemovingSavedJobId(jobId);
    try {
      await removeSeekerSavedJob(jobId);
      setSavedJobs((prev) => prev.filter((job) => Number(job.job_id) !== Number(jobId)));
      toast.success('Removed from saved jobs.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to remove saved job';
      toast.error(message);
    } finally {
      setRemovingSavedJobId(null);
    }
  };

  return (
    <PageContainer>
      <SeekerProfileHeader
        fullName={profile?.full_name as string | undefined}
        avatarUrl={String(profile?.profile_picture_url ?? profile?.avatar_url ?? '')}
        onBack={() => navigate('/seeker/dashboard')}
      />

      <SeekerStatsGrid loading={loading} statItems={statItems} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <SeekerProfileDetailsCard
          loading={loading}
          profile={profile}
          profileForm={profileForm}
          isProfileEditMode={isProfileEditMode}
          isSavingProfile={isSavingProfile}
          onToggleProfileEditor={() => {
            if (isProfileEditMode) {
              closeProfileEditor();
              return;
            }
            openProfileEditor();
          }}
          onProfileFormChange={handleProfileFormChange}
          onSaveProfile={() => void handleSaveProfile()}
          profileImageInputRef={profileImageInputRef}
          onProfileImageUpload={handleProfileImageUpload}
          onTriggerProfileImagePicker={triggerProfileImagePicker}
          profileImageUploading={profileImageUploading}
          resumeFileInputRef={resumeFileInputRef}
          onResumeUpload={handleResumeUpload}
          onTriggerResumePicker={triggerResumePicker}
          resumeUploading={resumeUploading}
          resumeDownloading={resumeDownloading}
          onResumeDownload={() => void handleResumeDownload()}
          isSkillsEditMode={isSkillsEditMode}
          isSavingSkills={isSavingSkills}
          onOpenSkillsEditor={openSkillsEditor}
          onCloseSkillsEditor={closeSkillsEditor}
          newSkillName={newSkillName}
          onNewSkillNameChange={setNewSkillName}
          newSkillProficiency={newSkillProficiency}
          onNewSkillProficiencyChange={setNewSkillProficiency}
          onAddSkill={addSkill}
          skillsForm={skillsForm}
          onUpdateSkillProficiency={updateSkillProficiency}
          onRemoveSkill={removeSkill}
          onSaveSkills={() => void handleSaveSkills()}
        />

        <div className="space-y-6">
          <RecentApplicationsCard
            loading={loading}
            applications={applications}
            onViewJob={(jobId) => navigate(`/jobs/${jobId}`)}
          />

          <SavedJobsSummaryCard
            loading={loading}
            savedJobs={savedJobs}
            removingSavedJobId={removingSavedJobId}
            onViewJob={(jobId) => navigate(`/jobs/${jobId}`)}
            onRemoveSavedJob={(jobId) => void handleRemoveSavedJob(jobId)}
          />
        </div>
      </div>
    </PageContainer>
  );
};
