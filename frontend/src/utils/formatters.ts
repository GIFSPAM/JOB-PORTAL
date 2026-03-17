export const formatSalaryRange = (
  salaryMin?: number | string | null,
  salaryMax?: number | string | null,
): string => {
  if (salaryMin != null && salaryMax != null) {
    return `$${Number(salaryMin).toLocaleString()} - $${Number(salaryMax).toLocaleString()}`;
  }
  return 'Not specified';
};

export const formatJobType = (jobType?: string | null): string => {
  if (!jobType) return 'Not specified';
  return jobType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('-');
};

export const formatApplicationStatus = (status?: string | null): string => {
  if (!status) return 'Applied';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export const formatDateShort = (dateValue?: string | null): string => {
  if (!dateValue) return 'Unknown';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';
  return parsed.toLocaleDateString();
};

export const formatDateTime = (dateValue?: string | null): string => {
  if (!dateValue) return 'Unknown';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';
  return parsed.toLocaleString();
};

export const normalizeWebsiteUrl = (website?: string | null): string | null => {
  const trimmed = website?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};
