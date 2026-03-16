export type Role = 'seeker' | 'employer' | 'admin';

export type BackendRole = 'jobseeker' | 'employer' | 'admin';

export interface AuthCallbackProps {
  onBack: () => void;
  onSuccess?: () => void;
  onToggleMode?: () => void;
}

export interface LoginAuthProps {
  onSuccess?: () => void;
  onToggleMode?: () => void;
}

export interface RegisterFormProps {
  role: Role;
  onBack: () => void;
  onSuccess?: () => void;
  onToggleMode?: () => void;
}

export interface RoleSelectorProps {
  isLogin: boolean;
  onSelect: (role: Role) => void;
  onToggleMode: () => void;
}
