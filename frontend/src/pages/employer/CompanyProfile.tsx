/**
 * ==========================================
 * COMPANY PROFILE PAGE
 * ==========================================
 * 
 * Employer company profile management:
 * - View and update company information
 * - Display company details
 */

import React, { useState } from 'react';
import { Building2, Globe, MapPin, Users, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';

/**
 * Company Profile Component
 */
const CompanyProfile: React.FC = () => {
  // State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state (would normally come from API)
  const [formData, setFormData] = useState({
    company_name: 'Tech Solutions Inc.',
    industry: 'Information Technology',
    company_size: '51-200',
    company_location: 'San Francisco, CA',
    company_website: 'https://techsolutions.com',
    description: 'We are a leading technology company specializing in innovative software solutions. Our team of experts delivers cutting-edge products that transform businesses worldwide.',
  });

  /**
   * Handle form input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handle save
   */
  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Sidebar */}
      <Sidebar role="employer" />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Company Profile</h1>
          <p className="text-gray-400">Manage your company information and public profile.</p>
        </div>

        {/* Profile Card */}
        <div className="glass rounded-xl p-8">
          {/* Company Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="form-input text-xl font-bold mb-2"
                />
              ) : (
                <h2 className="text-2xl font-bold text-white mb-2">{formData.company_name}</h2>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {isEditing ? (
                    <input
                      type="text"
                      name="company_location"
                      value={formData.company_location}
                      onChange={handleChange}
                      className="form-input w-48"
                    />
                  ) : (
                    formData.company_location
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  {isEditing ? (
                    <input
                      type="url"
                      name="company_website"
                      value={formData.company_website}
                      onChange={handleChange}
                      className="form-input w-48"
                    />
                  ) : (
                    <a 
                      href={formData.company_website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300"
                    >
                      {formData.company_website}
                    </a>
                  )}
                </span>
              </div>
            </div>
            
            {/* Edit/Save Button */}
            <button
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={isSaving}
              className="btn-primary flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              ) : (
                'Edit Profile'
              )}
            </button>
          </div>

          {/* Company Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Industry
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="form-input"
                />
              ) : (
                <p className="text-white">{formData.industry}</p>
              )}
            </div>

            {/* Company Size */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Company Size
              </label>
              {isEditing ? (
                <select
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="500+">500+ employees</option>
                </select>
              ) : (
                <p className="text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  {formData.company_size} employees
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Company Description
            </label>
            {isEditing ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="form-input resize-none"
              />
            ) : (
              <p className="text-gray-300 leading-relaxed">{formData.description}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyProfile;
