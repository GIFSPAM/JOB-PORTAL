import React from 'react';
import { Search, Trash2, UserX, Users } from 'lucide-react';
import type { AdminUser } from '../../types/admin';
import { formatDateShort } from '../../utils/formatters';

const ROLE_COLOR: Record<string, string> = {
  jobseeker: 'bg-brand-accent/10 text-brand-accent border-brand-accent/20',
  employer: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  admin: 'bg-white/5 text-white border-white/10',
};

interface AdminUsersTabProps {
  loading: boolean;
  filteredUsers: AdminUser[];
  userSearchQuery: string;
  onUserSearchChange: (value: string) => void;
  roleFilter: 'all' | 'jobseeker' | 'employer' | 'admin';
  onRoleFilterChange: (value: 'all' | 'jobseeker' | 'employer' | 'admin') => void;
  actionKey: string | null;
  onOpenUserDetail: (userId: number) => void;
  onToggleUserStatus: (user: AdminUser) => Promise<void>;
  onDeleteUser: (user: AdminUser) => Promise<void>;
}

const formatUserLabel = (user: AdminUser) => {
  if (user.role === 'jobseeker') return user.full_name || 'Unnamed seeker';
  if (user.role === 'employer') return user.company_name || 'Unnamed employer';
  return user.email;
};

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  loading,
  filteredUsers,
  userSearchQuery,
  onUserSearchChange,
  roleFilter,
  onRoleFilterChange,
  actionKey,
  onOpenUserDetail,
  onToggleUserStatus,
  onDeleteUser,
}) => {
  return (
    <div className="glass-card p-8">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-brand-accent" /> User Management
        </h2>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Search</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                value={userSearchQuery}
                onChange={(event) => onUserSearchChange(event.target.value)}
                placeholder="ID, email, company, website, or name"
                className="input-field input-field-with-icon w-72"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Role</label>
            <select
              value={roleFilter}
              onChange={(event) => onRoleFilterChange(event.target.value as 'all' | 'jobseeker' | 'employer' | 'admin')}
              className="input-field h-12 w-44"
            >
              <option value="all">All Roles</option>
              <option value="jobseeker">Seekers</option>
              <option value="employer">Employers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((index) => <div key={index} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : filteredUsers.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-10">No users found.</p>
      ) : (
        <div className="space-y-4 max-h-[62vh] overflow-y-auto pr-2">
          {filteredUsers.map((user) => {
            const badgeClass = ROLE_COLOR[user.role] ?? ROLE_COLOR.admin;
            const isBusyStatus = actionKey === `user-status-${user.user_id}`;
            const isBusyDelete = actionKey === `user-delete-${user.user_id}`;
            return (
              <div
                key={user.user_id}
                onClick={() => onOpenUserDetail(Number(user.user_id))}
                className="rounded-2xl border border-white/5 bg-white/3 p-5 cursor-pointer hover:border-brand-accent/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-white font-semibold">#{user.user_id} · {formatUserLabel(user)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full border font-bold capitalize ${badgeClass}`}>
                        {user.role === 'jobseeker' ? 'Seeker' : user.role}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full border font-bold ${user.is_active ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted">{user.email}</p>
                    {user.role === 'employer' && user.company_website && (
                      <p className="text-xs text-brand-accent break-all">{user.company_website}</p>
                    )}
                    <p className="text-xs text-text-muted">Created {formatDateShort(user.created_at)}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        void onToggleUserStatus(user);
                      }}
                      disabled={isBusyStatus || isBusyDelete}
                      className="inline-flex items-center justify-center min-w-36 px-4 py-2.5 rounded-xl border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 text-sm font-bold hover:bg-yellow-500/15 transition-all disabled:opacity-60"
                    >
                      <UserX className="w-4 h-4 inline-block mr-2" />
                      {isBusyStatus ? 'Updating...' : user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        void onDeleteUser(user);
                      }}
                      disabled={isBusyStatus || isBusyDelete}
                      className="inline-flex items-center justify-center min-w-28 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-bold hover:bg-red-500/15 transition-all disabled:opacity-60"
                    >
                      <Trash2 className="w-4 h-4 inline-block mr-2" />
                      {isBusyDelete ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
