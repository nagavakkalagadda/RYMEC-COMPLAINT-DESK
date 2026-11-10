import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  Clock, 
  Star, 
  Download
} from 'lucide-react';
import { api } from '../../services/api';
import { GlassCard } from '../3d/GlassCard';

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
        <span className="h-8 w-8 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-silver-400 font-semibold">Generating analytics telemetry...</span>
      </div>
    );
  }

  const { metrics, categories, departments, monthlyTrends, satisfaction } = data;

  const COLORS = ['#2563EB', '#0284C7', '#475569', '#10B981', '#E11D48'];

  const categoryChartData = (categories || []).map((c: any) => ({
    name: c.category.toUpperCase(),
    value: Number(c.count)
  }));

  const deptChartData = (departments || []).map((d: any) => ({
    name: d.department_name.replace('Department of ', '').replace('Engineering', 'Engg'),
    total: Number(d.total),
    resolved: Number(d.resolved),
    overdue: Number(d.overdue)
  }));

  const monthlyData = (monthlyTrends || []).map((m: any) => ({
    name: m.month,
    Total: Number(m.total),
    Resolved: Number(m.resolved)
  }));

  const slaCompliance = metrics?.total_complaints > 0 
    ? Math.round(((metrics.total_complaints - (metrics.overdue_count || 0)) / metrics.total_complaints) * 100) 
    : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Title */}
      <GlassCard className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs font-semibold text-silver-300 mb-1">
              <BarChart3 className="h-3.5 w-3.5 text-brand-accent" />
              RYMEC Central Grievance Telemetry
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Institutional Redressal Analytics
            </h1>
            <p className="text-xs sm:text-sm text-silver-400">
              Live monitoring of complaint volumes, turnaround velocities, and departmental SLA performance.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="pebble-pill inline-flex items-center gap-2 bg-white/5 px-4 py-2 text-xs font-semibold text-silver-300 hover:bg-white/10 hover:text-white"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </GlassCard>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <GlassCard className="p-5 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-silver-400 block mb-1">
            Total Complaints
          </span>
          <span className="font-mono text-3xl font-bold text-white">
            {metrics?.total_complaints || 0}
          </span>
          <span className="text-[10px] text-silver-500 block mt-1">Across all categories</span>
        </GlassCard>

        <GlassCard className="p-5 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-silver-400 block mb-1">
            SLA Compliance Rate
          </span>
          <span className="font-mono text-3xl font-bold text-emerald-400">
            {slaCompliance}%
          </span>
          <span className="text-[10px] text-silver-500 block mt-1">Closed within deadline</span>
        </GlassCard>

        <GlassCard className="p-5 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-silver-400 block mb-1">
            Avg Turnaround
          </span>
          <span className="font-mono text-3xl font-bold text-white">
            {metrics?.avg_resolution_days || 0} Days
          </span>
          <span className="text-[10px] text-silver-500 block mt-1">From submission to fix</span>
        </GlassCard>

        <GlassCard className="p-5 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-silver-400 block mb-1">
            Satisfaction Rating
          </span>
          <span className="font-mono text-3xl font-bold text-white flex items-center justify-center gap-1">
            <span>{satisfaction?.average_rating || 'N/A'}</span>
            {satisfaction?.average_rating && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
          </span>
          <span className="text-[10px] text-silver-500 block mt-1">Based on student feedback</span>
        </GlassCard>
      </div>

      {/* Charts Row 1: Monthly Trend & Category Share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Trend Bar Chart */}
        <GlassCard className="p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-silver-400" />
            <span>Monthly Intake & Resolution Flow</span>
          </h3>

          <div className="h-64 w-full">
            {monthlyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-silver-500">
                No monthly grievance activity recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#F8FAFC'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Total" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Resolved" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>

        {/* Category Breakdown Pie Chart */}
        <GlassCard className="p-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-silver-400" />
            <span>Category Distribution Share</span>
          </h3>

          <div className="h-64 w-full flex items-center justify-center">
            {categoryChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-silver-500">
                No category distribution data recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#F8FAFC'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>

      </div>

      {/* Department-wise Performance */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-silver-400" />
          <span>Department Performance Breakdown</span>
        </h3>

        <div className="h-72 w-full">
          {deptChartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-silver-500">
              No department performance records found.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F8FAFC'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                <Bar dataKey="total" name="Total Filed" fill="#475569" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="overdue" name="Overdue" fill="#E11D48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </GlassCard>

    </div>
  );
};
