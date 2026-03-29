import type { ChangeEvent } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface AuthFieldProps {
  label: string;
  icon: LucideIcon;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  min?: number;
}