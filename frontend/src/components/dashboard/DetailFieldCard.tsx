import React from 'react';

interface DetailFieldCardProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export const DetailFieldCard: React.FC<DetailFieldCardProps> = ({
  label,
  value,
  className = '',
}) => {
  return (
    <div className={`rounded-2xl border border-white/5 bg-white/3 p-4 ${className}`}>
      <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1">{label}</p>
      <div className="text-white font-medium wrap-break-word">{value}</div>
    </div>
  );
};
