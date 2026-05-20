import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { AuthFieldProps } from '../../types/form';

const ICON_CLASS = 'absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none';

export const AuthField: React.FC<AuthFieldProps> = ({
  label,
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  min,
}) => {
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (showPass ? 'text' : 'password') : type;

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-text-muted">{label}</label>
      <div className="relative">
        {Icon ? <Icon className={ICON_CLASS} /> : null}
        <input
          type={resolvedType}
          placeholder={placeholder}
          className={`input-field input-field-with-icon${isPassword ? ' pr-12' : ''}`}
          value={value}
          onChange={onChange}
          required={required}
          min={min}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(s => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
            aria-label={showPass ? 'Hide password' : 'Show password'}
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
};
