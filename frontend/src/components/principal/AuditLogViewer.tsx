import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, User, FileText, Search, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { GlassCard } from '../3d/GlassCard';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <GlassCard className="p-6 sm:p-8" glow>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-0.5 text-xs font-bold text-purple-300 mb-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Executive Oversight Security Audit
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Institutional Action Audit Log
            </h1>
            <p className="text-xs sm:text-sm text-silver-400">
              Immutable forensic log tracking administrative transitions, status updates, auto-escalations, and user authorizations.
            </p>
          </div>

          <button
            onClick={loadLogs}
            className="pebble-pill inline-flex items-center gap-2 bg-white/10 px-4 py-2 text-xs font-bold text-silver-300 hover:bg-white/20 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Audit Logs</span>
          </button>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        {loading ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-2">
            <span className="h-6 w-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-silver-400">Retrieving audit events...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-silver-500">
            No audit records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-silver-400 uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action Event</th>
                  <th className="py-2.5 px-3">Entity Type</th>
                  <th className="py-2.5 px-3">Actor / User</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-mono text-[11px] text-silver-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-white uppercase text-[10px]">
                      {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                    </td>
                    <td className="py-3 px-3 text-silver-300">
                      {log.user_name || 'System Auto-Engine'} 
                      {log.user_role && <span className="opacity-70 text-[10px] block uppercase">({log.user_role})</span>}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-silver-400 max-w-xs truncate">
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '-')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
};
