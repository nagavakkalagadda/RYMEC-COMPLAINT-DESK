import React, { useState, useEffect } from 'react';
import { Building2, Plus, Mail, CheckCircle2, Inbox } from 'lucide-react';
import { api } from '../../services/api';
import { Department } from '../../types';
import { GlassCard } from '../3d/GlassCard';

export const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [categoryMapping, setCategoryMapping] = useState('academic');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await api.getDepartments();
      setDepartments(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('rymec_auth_token');
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          code,
          category_mapping: categoryMapping,
          contact_email: email,
          description
        })
      });
      if (!res.ok) throw new Error('Failed to create department');
      setShowAddModal(false);
      setName('');
      setCode('');
      setEmail('');
      setDescription('');
      loadDepartments();
    } catch (err: any) {
      alert(err.message || 'Error creating department');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <GlassCard className="p-6 sm:p-8" glow>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-0.5 text-xs font-bold text-cyan-300 mb-1">
              <Building2 className="h-3 w-3" />
              Institutional Administrative Hierarchy
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Department & Redressal Cell Management
            </h1>
            <p className="text-xs sm:text-sm text-silver-400">
              Overview of all engineering branches, residential offices, and statutory committees handling grievances.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="pebble-pill inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-glass-glow hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            <span>Add Department</span>
          </button>
        </div>
      </GlassCard>

      {/* Grid of departments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((d) => (
          <GlassCard key={d.id} className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-black text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                  {d.code}
                </span>
                <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-silver-400">
                  {d.category_mapping}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{d.name}</h3>
              <p className="text-xs text-silver-400 line-clamp-2 mb-3">
                {d.description || 'Institutional department node.'}
              </p>
            </div>

            <div className="border-t border-white/10 pt-3 text-xs space-y-1">
              {d.contact_email && (
                <p className="text-silver-400 flex items-center gap-1.5 text-[11px] truncate">
                  <Mail className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{d.contact_email}</span>
                </p>
              )}
              <div className="flex items-center justify-between text-[11px] text-silver-400 pt-1">
                <span>Total Grievances: <b className="text-white">{d.total_complaints || 0}</b></span>
                <span>Resolved: <b className="text-emerald-400">{d.resolved_complaints || 0}</b></span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-md" onClick={() => setShowAddModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/20 bg-navy-900 p-6 shadow-2xl backdrop-blur-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add Department / Statutory Cell</h3>
            <form onSubmit={handleAddDepartment} className="space-y-3 text-xs">
              <div>
                <label className="text-silver-300 font-semibold block mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Civil Engineering"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-silver-300 font-semibold block mb-1">Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CIVIL"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white focus:outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="text-silver-300 font-semibold block mb-1">Category Mapping</label>
                  <select
                    value={categoryMapping}
                    onChange={(e) => setCategoryMapping(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-navy-800 p-2.5 text-white focus:outline-none"
                  >
                    <option value="academic">Academic</option>
                    <option value="hostel">Hostel</option>
                    <option value="harassment">Harassment</option>
                    <option value="admin">Administration</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-silver-300 font-semibold block mb-1">Contact Email</label>
                <input
                  type="email"
                  placeholder="hod.civil@rymec.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-silver-300 font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Mandate and jurisdiction..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-silver-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pebble-pill rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-5 py-2 font-bold text-white shadow-md"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
