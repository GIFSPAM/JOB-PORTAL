import React from 'react';
import { Clock3, Filter, History, Search } from 'lucide-react';
import type { AdminLog } from '../../types/admin';
import { formatDateTime } from '../../utils/formatters';

interface AdminLogsTabProps {
    loading: boolean;
    logs: AdminLog[];
    filteredLogs: AdminLog[];
    logSearchQuery: string;
    onLogSearchQueryChange: (value: string) => void;
    logTableFilter: string;
    onLogTableFilterChange: (value: string) => void;
    availableLogTypes: string[];
}

const tableLabel = (table?: string) => {
    if (!table) return 'Unknown';
    return table.charAt(0).toUpperCase() + table.slice(1);
};

const actionToneClass = (action?: string) => {
    const normalized = String(action ?? '').toLowerCase();
    if (normalized.includes('delete') || normalized.includes('reject')) {
        return 'text-red-400 bg-red-500/10 border-red-500/20';
    }
    if (normalized.includes('activate') || normalized.includes('verify') || normalized.includes('hired')) {
        return 'text-green-400 bg-green-500/10 border-green-500/20';
    }
    if (normalized.includes('unverify') || normalized.includes('deactivate')) {
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }
    return 'text-brand-accent bg-brand-accent/10 border-brand-accent/20';
};

export const AdminLogsTab: React.FC<AdminLogsTabProps> = ({
    loading,
    logs,
    filteredLogs,
    logSearchQuery,
    onLogSearchQueryChange,
    logTableFilter,
    onLogTableFilterChange,
    availableLogTypes,
}) => {
    return (
        <div className="glass-card p-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between mb-6">
                <div>
                    <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-brand-accent" /> Admin Logs
                    </h2>
                    <p className="text-sm text-text-muted mt-1">
                        {filteredLogs.length} shown of {logs.length} entries
                    </p>
                </div>

                <div className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.35fr)_minmax(12rem,0.8fr)]">
                    <div className="space-y-1 min-w-0">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Search</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                value={logSearchQuery}
                                onChange={(event) => onLogSearchQueryChange(event.target.value)}
                                placeholder="Action, table, admin email, or target ID"
                                className="input-field input-field-with-icon h-12 w-full min-w-0"
                            />
                        </div>
                    </div>

                    <div className="space-y-1 min-w-0">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Target Table</label>
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <select
                                value={logTableFilter}
                                onChange={(event) => onLogTableFilterChange(event.target.value)}
                                className="input-field input-field-with-icon h-12 w-full min-w-0"
                            >
                                <option value="all">All Targets</option>
                                {availableLogTypes.map((table) => (
                                    <option key={table} value={table}>{tableLabel(table)}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
            ) : logs.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-10">No admin logs yet.</p>
            ) : filteredLogs.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-10">No log entries match current filters.</p>
            ) : (
                <div className="max-h-[68vh] overflow-auto rounded-xl border border-white/10 bg-white/2">
                    <table className="w-full min-w-220 text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-brand-bg/90 backdrop-blur-sm border-b border-white/10">
                            <tr>
                                <th className="px-4 py-3 text-xs uppercase tracking-widest text-text-muted font-bold">Log ID</th>
                                <th className="px-4 py-3 text-xs uppercase tracking-widest text-text-muted font-bold">Admin</th>
                                <th className="px-4 py-3 text-xs uppercase tracking-widest text-text-muted font-bold">Action</th>
                                <th className="px-4 py-3 text-xs uppercase tracking-widest text-text-muted font-bold">Target</th>
                                <th className="px-4 py-3 text-xs uppercase tracking-widest text-text-muted font-bold">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log) => (
                                <tr key={log.log_id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                                    <td className="px-4 py-3 text-sm text-white whitespace-nowrap">#{log.log_id}</td>
                                    <td className="px-4 py-3 text-sm text-white whitespace-nowrap">{log.admin_email ?? `Admin #${log.admin_id}`}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`text-xs px-2.5 py-1 rounded-full border font-bold whitespace-nowrap ${actionToneClass(log.action_type)}`}>
                                            {log.action_type ?? 'Unknown action'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-text-muted whitespace-nowrap">
                                        {tableLabel(log.target_table)} #{log.target_id ?? 'Unknown'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-text-muted whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1.5">
                                            <Clock3 className="w-4 h-4 text-yellow-400" />
                                            {formatDateTime(log.action_time)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

