export const formatSalaryRange = (
  salaryMin?: number | string | null,
  salaryMax?: number | string | null,
): string => {
  if (salaryMin != null && salaryMax != null) {
    return `$${Number(salaryMin).toLocaleString()} - $${Number(salaryMax).toLocaleString()}`;
  }
  return 'Not specified';
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
