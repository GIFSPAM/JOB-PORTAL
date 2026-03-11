/**
 * ==========================================
 * SEEKER PROFILE PAGE
 * ==========================================
 * 
 * Job seeker profile management:
 * - View and update profile information
 * - Upload/update resume (PDF)
 * - Manage skills with proficiency levels
 */

import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Plus, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import { updateResume, updateSkills } from '@/services/api';
import type { SeekerSkill, ProficiencyLevel } from '@/types';

/**
 * Seeker Profile Component
 */
const SeekerProfile: React.FC = () => {
  // Resume state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedResume, setUploadedResume] = useState<{ filename: string; path: string } | null>(null);
  
  // Skills state
  const [skills, setSkills] = useState<SeekerSkill[]>([
    { name: 'JavaScript', proficiency: 'advanced' },
    { name: 'React', proficiency: 'intermediate' },
  ]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState<ProficiencyLevel>('beginner');
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed');
        return;
      }
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      setResumeFile(file);
    }
  };

  /**
   * Handle resume upload
   */
  const handleUpload = async () => {
    if (!resumeFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);

    try {
      const response = await updateResume(resumeFile);
      
      if (response.success && response.data) {
        setUploadedResume(response.data);
        setResumeFile(null);
        toast.success('Resume uploaded successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Add new skill
   */
  const handleAddSkill = () => {
    if (!newSkillName.trim()) {
      toast.error('Please enter a skill name');
      return;
    }

    // Check if skill already exists
    if (skills.some(s => s.name.toLowerCase() === newSkillName.toLowerCase())) {
      toast.error('Skill already exists');
      return;
    }

    setSkills(prev => [...prev, { name: newSkillName.trim(), proficiency: newSkillProficiency }]);
    setNewSkillName('');
    setNewSkillProficiency('beginner');
  };

  /**
   * Remove skill
   */
  const handleRemoveSkill = (index: number) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Update skill proficiency
   */
  const handleProficiencyChange = (index: number, proficiency: ProficiencyLevel) => {
    setSkills(prev => prev.map((skill, i) => 
      i === index ? { ...skill, proficiency } : skill
    ));
  };

  /**
   * Save skills to backend
   */
  const handleSaveSkills = async () => {
    setIsSavingSkills(true);

    try {
      const response = await updateSkills(skills);
      
      if (response.success) {
        toast.success('Skills updated successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update skills');
    } finally {
      setIsSavingSkills(false);
    }
  };

  /**
   * Get proficiency color
   */
  const getProficiencyColor = (proficiency: ProficiencyLevel) => {
    switch (proficiency) {
      case 'beginner':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'intermediate':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'advanced':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Sidebar */}
      <Sidebar role="jobseeker" />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
          <p className="text-gray-400">Manage your profile, resume, and skills.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resume Upload Section */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Resume Upload</h2>
            
            {/* Upload Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500/50 transition-colors bg-purple-500/5"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <p className="text-white font-medium mb-2">
                {resumeFile ? resumeFile.name : 'Click or drag to upload resume'}
              </p>
              <p className="text-gray-400 text-sm">PDF only, max 2MB</p>
            </div>

            {/* Upload Button */}
            {resumeFile && (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full btn-primary mt-4 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload Resume
                  </>
                )}
              </button>
            )}

            {/* Uploaded Resume */}
            {(uploadedResume || resumeFile) && (
              <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-purple-400" />
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {uploadedResume?.filename || resumeFile?.name}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {uploadedResume ? 'Uploaded successfully' : 'Ready to upload'}
                    </p>
                  </div>
                  {uploadedResume && (
                    <a
                      href={`http://localhost:5000${uploadedResume.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-sm"
                    >
                      View
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Skills Section */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Skills</h2>
              <button
                onClick={handleSaveSkills}
                disabled={isSavingSkills}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                {isSavingSkills ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            </div>

            {/* Add New Skill */}
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Enter skill name"
                className="form-input flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              />
              <select
                value={newSkillProficiency}
                onChange={(e) => setNewSkillProficiency(e.target.value as ProficiencyLevel)}
                className="form-input w-32"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <button
                onClick={handleAddSkill}
                className="btn-primary px-4"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Skills List */}
            <div className="space-y-3">
              {skills.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No skills added yet</p>
              ) : (
                skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-[#1a1a25] rounded-lg"
                  >
                    <span className="text-white font-medium">{skill.name}</span>
                    <div className="flex items-center gap-3">
                      <select
                        value={skill.proficiency}
                        onChange={(e) => handleProficiencyChange(index, e.target.value as ProficiencyLevel)}
                        className={`text-sm px-3 py-1 rounded-full border ${getProficiencyColor(skill.proficiency)}`}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                      <button
                        onClick={() => handleRemoveSkill(index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SeekerProfile;
