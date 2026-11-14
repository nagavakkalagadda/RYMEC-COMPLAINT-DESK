import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User as UserIcon,
  Mail,
  ShieldCheck,
  LogOut,
  Settings,
  Save,
  GraduationCap,
  Building,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Calendar,
  Layers,
  Sparkles,
  KeyRound,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../3d/GlassCard';

type SettingsTab = 'academic' | 'security' | 'account';

export const UserProfileView: React.FC = () => {
  const { user, logout, updateProfile, changePassword, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('academic');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile Form state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    branch: '',
    section: '',
    academic_year: '',
    hostel_block: '',
    department: '',
    designation: ''
  });

  // Password Form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || '',
        branch: user.branch || user.department || 'Computer Science & Engineering',
        section: user.section || 'A',
        academic_year: user.academic_year || '3rd Year',
        hostel_block: user.hostel_block || '',
        department: user.department || 'Computer Science & Engineering',
        designation: user.designation || 'Assistant Professor'
      });
    }
  }, [user]);

  // Auto clear message after 4s
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 text-center text-silver-400">
        Please sign in with your institutional account to configure profile settings.
      </div>
    );
  }

  const isStudent = user.role === 'student';

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await updateProfile(profileForm);
      await refreshUser();
      setStatusMessage({ type: 'success', text: 'Academic profile settings updated successfully!' });
      setIsEditing(false);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update profile settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setStatusMessage({ type: 'error', text: 'New passwords do not match. Please verify.' });
      return;
    }
    if (passwordForm.new_password.length < 6) {
      setStatusMessage({ type: 'error', text: 'New password must contain at least 6 characters.' });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);
    try {
      await changePassword(passwordForm.current_password, passwordForm.new_password);
      setStatusMessage({ type: 'success', text: 'Your account password has been updated securely.' });
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Toast Alert Notification */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`fixed top-20 right-4 z-50 flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur-xl ${
              statusMessage.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-200'
                : 'border-rose-500/40 bg-rose-500/20 text-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Profile Header Card */}
      <GlassCard className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Glow */}
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-royal via-blue-600 to-cyan-400 text-white font-extrabold text-3xl shadow-xl shadow-blue-500/20">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 border-2 border-navy-950 text-white shadow">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight">{user.full_name}</h1>
              <span className="rounded-full bg-cyan-400/10 border border-cyan-400/20 px-3 py-0.5 text-xs font-bold uppercase text-cyan-300">
                {user.role}
              </span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verified Student
              </span>
            </div>

            <p className="text-xs text-silver-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="h-3.5 w-3.5 text-cyan-400" />
              <span>{user.email}</span>
            </p>

            {/* Quick Badge Chips */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
              {user.usn_roll && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs">
                  <span className="text-[10px] uppercase text-silver-400 block font-semibold">USN</span>
                  <span className="font-mono font-bold text-white">{user.usn_roll}</span>
                </div>
              )}

              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs">
                <span className="text-[10px] uppercase text-silver-400 block font-semibold">Branch</span>
                <span className="font-semibold text-white">{user.branch || user.department || 'CSE'}</span>
              </div>

              {user.section && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs">
                  <span className="text-[10px] uppercase text-silver-400 block font-semibold">Section</span>
                  <span className="font-semibold text-white">Section {user.section}</span>
                </div>
              )}

              {user.academic_year && (
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs">
                  <span className="text-[10px] uppercase text-silver-400 block font-semibold">Year</span>
                  <span className="font-semibold text-white">{user.academic_year}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={logout}
            className="pebble-pill flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all shrink-0"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </GlassCard>

      {/* Changeable Settings Card */}
      <GlassCard className="overflow-hidden">
        {/* Settings Sub-Header with Tabs */}
        <div className="border-b border-white/10 bg-white/2 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-300">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Dashboard Settings</h2>
              <p className="text-xs text-silver-400">Manage your branch, section, academic data & security credentials</p>
            </div>
          </div>

          {/* Navigation Pills */}
          <div className="flex rounded-xl border border-white/10 bg-navy-950/60 p-1">
            <button
              onClick={() => setActiveTab('academic')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'academic'
                  ? 'bg-cyan-400 text-navy-950 font-bold shadow'
                  : 'text-silver-400 hover:text-white'
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>{isStudent ? 'Academic & Branch' : 'Department'}</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'security'
                  ? 'bg-cyan-400 text-navy-950 font-bold shadow'
                  : 'text-silver-400 hover:text-white'
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Security</span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'account'
                  ? 'bg-cyan-400 text-navy-950 font-bold shadow'
                  : 'text-silver-400 hover:text-white'
              }`}
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span>Account Info</span>
            </button>
          </div>
        </div>

        {/* Tab Content Panes */}
        <div className="p-6 sm:p-8">
          {/* TAB 1: ACADEMIC & BRANCH SETTINGS */}
          {activeTab === 'academic' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    {isStudent ? 'Current Studying & Class Allocation' : 'Faculty Designation'}
                  </span>
                </div>

                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="pebble-pill inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-400/20"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit Settings</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                    Editing Mode Active
                  </span>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-silver-300 mb-1.5">Full Student Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  className={`w-full rounded-xl border py-2.5 px-3.5 text-sm transition-all ${
                    isEditing
                      ? 'border-cyan-400/40 bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-400'
                      : 'border-white/10 bg-white/2 text-silver-400 cursor-not-allowed'
                  }`}
                />
              </div>

              {/* Student Branch & Section */}
              {isStudent ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-silver-300 mb-1.5">Engineering Branch</label>
                      <select
                        disabled={!isEditing}
                        value={profileForm.branch}
                        onChange={(e) => setProfileForm({ ...profileForm, branch: e.target.value, department: e.target.value })}
                        className={`w-full rounded-xl border py-2.5 px-3 text-sm transition-all ${
                          isEditing
                            ? 'border-cyan-400/40 bg-navy-800 text-white focus:outline-none focus:ring-1 focus:ring-cyan-400'
                            : 'border-white/10 bg-white/2 text-silver-400 cursor-not-allowed'
                        }`}
                      >
                        <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                        <option value="Information Science & Engineering">Information Science & Engineering (ISE)</option>
                        <option value="Artificial Intelligence & ML">Artificial Intelligence & ML (AIML)</option>
                        <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                        <option value="Electrical & Electronics">Electrical & Electronics (EEE)</option>
                        <option value="Mechanical Engineering">Mechanical Engineering (MECH)</option>
                        <option value="Civil Engineering">Civil Engineering (CIVIL)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-silver-300 mb-1.5">Class Section</label>
                      <select
                        disabled={!isEditing}
                        value={profileForm.section}
                        onChange={(e) => setProfileForm({ ...profileForm, section: e.target.value })}
                        className={`w-full rounded-xl border py-2.5 px-3 text-sm transition-all ${
                          isEditing
                            ? 'border-cyan-400/40 bg-navy-800 text-white focus:outline-none focus:ring-1 focus:ring-cyan-400'
                            : 'border-white/10 bg-white/2 text-silver-400 cursor-not-allowed'
                        }`}
                      >
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-silver-300 mb-1.5">Current Academic Year</label>
                      <select
                        disabled={!isEditing}
                        value={profileForm.academic_year}
                        onChange={(e) => setProfileForm({ ...profileForm, academic_year: e.target.value })}
                        className={`w-full rounded-xl border py-2.5 px-3 text-sm transition-all ${
                          isEditing
                            ? 'border-cyan-400/40 bg-navy-800 text-white focus:outline-none focus:ring-1 focus:ring-cyan-400'
                            : 'border-white/10 bg-white/2 text-silver-400 cursor-not-allowed'
                        }`}
                      >
                        <option value="1st Year">1st Year (Freshman)</option>
                        <option value="2nd Year">2nd Year (Sophomore)</option>
                        <option value="3rd Year">3rd Year (Junior)</option>
                        <option value="4th Year">4th Year (Final Year)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-silver-300 mb-1.5">Hostel Accommodation</label>
                      <select
                        disabled={!isEditing}
                        value={profileForm.hostel_block}
                        onChange={(e) => setProfileForm({ ...profileForm, hostel_block: e.target.value })}
                        className={`w-full rounded-xl border py-2.5 px-3 text-sm transition-all ${
                          isEditing
                            ? 'border-cyan-400/40 bg-navy-800 text-white focus:outline-none focus:ring-1 focus:ring-cyan-400'
                            : 'border-white/10 bg-white/2 text-silver-400 cursor-not-allowed'
                        }`}
                      >
                        <option value="">Day Scholar (Not in Hostel)</option>
                        <option value="Aryabhata Block-A">Aryabhata Block-A (Boys)</option>
                        <option value="Aryabhata Block-B">Aryabhata Block-B (Boys)</option>
                        <option value="Bhaskaracharya Block">Bhaskaracharya Block (Boys)</option>
                        <option value="Chanakya Block">Chanakya Block (Boys)</option>
                        <option value="Kittur Rani Chennamma Block">Kittur Rani Chennamma (Girls Hostel)</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                /* STAFF FIELDS */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-silver-300 mb-1.5">Department</label>
                    <select
                      disabled={!isEditing}
                      value={profileForm.department}
                      onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                      className={`w-full rounded-xl border py-2.5 px-3 text-sm transition-all ${
                        isEditing
                          ? 'border-cyan-400/40 bg-navy-800 text-white focus:outline-none focus:ring-1 focus:ring-cyan-400'
                          : 'border-white/10 bg-white/2 text-silver-400 cursor-not-allowed'
                      }`}
                    >
                      <option value="Computer Science & Engineering">CSE</option>
                      <option value="Information Science & Engineering">ISE</option>
                      <option value="Artificial Intelligence & ML">AIML</option>
                      <option value="Electronics & Communication">ECE</option>
                      <option value="Electrical & Electronics">EEE</option>
                      <option value="Mechanical Engineering">MECH</option>
                      <option value="Civil Engineering">CIVIL</option>
                      <option value="Administration">Administration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-silver-300 mb-1.5">Designation</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={profileForm.designation}
                      onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                      className={`w-full rounded-xl border py-2.5 px-3 text-sm transition-all ${
                        isEditing
                          ? 'border-cyan-400/40 bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-400'
                          : 'border-white/10 bg-white/2 text-silver-400 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Save / Cancel buttons in Editing Mode */}
              {isEditing && (
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      if (user) {
                        setProfileForm({
                          full_name: user.full_name || '',
                          branch: user.branch || user.department || 'Computer Science & Engineering',
                          section: user.section || 'A',
                          academic_year: user.academic_year || '3rd Year',
                          hostel_block: user.hostel_block || '',
                          department: user.department || 'Computer Science & Engineering',
                          designation: user.designation || 'Assistant Professor'
                        });
                      }
                    }}
                    className="pebble-pill rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-silver-300 hover:bg-white/10"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="pebble-pill flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-brand-royal px-5 py-2 text-xs font-semibold text-white shadow-lg hover:from-blue-500 hover:to-blue-600 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </form>
          )}

          {/* TAB 2: SECURITY & PASSWORD SETTINGS */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <KeyRound className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Account Password Management
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-silver-300 mb-1.5">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    placeholder="Enter current password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 pr-10 text-sm text-white placeholder-silver-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3.5 top-3 text-silver-400 hover:text-white"
                  >
                    {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-silver-300 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    placeholder="Minimum 6 characters"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 pr-10 text-sm text-white placeholder-silver-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-3 text-silver-400 hover:text-white"
                  >
                    {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-silver-300 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder-silver-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="pebble-pill flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-brand-royal px-5 py-2.5 text-xs font-semibold text-white shadow-lg hover:from-blue-500 hover:to-blue-600 active:scale-98 disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                <span>Update Password</span>
              </button>
            </form>
          )}

          {/* TAB 3: ACCOUNT & INSTITUTION INFO */}
          {activeTab === 'account' && (
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Building className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Institutional Profile Records
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/5">
                  <span className="text-silver-400 block text-[11px] mb-1">Affiliated Institution</span>
                  <span className="font-semibold text-white">RYMEC, Ballari (V.V. Sangha)</span>
                </div>

                <div className="p-3.5 rounded-xl border border-white/10 bg-white/5">
                  <span className="text-silver-400 block text-[11px] mb-1">Accreditation</span>
                  <span className="font-semibold text-white">NAAC A+ Accredited / VTU</span>
                </div>

                <div className="p-3.5 rounded-xl border border-white/10 bg-white/5">
                  <span className="text-silver-400 block text-[11px] mb-1">Account Role</span>
                  <span className="font-semibold text-cyan-300 uppercase">{user.role}</span>
                </div>

                <div className="p-3.5 rounded-xl border border-white/10 bg-white/5">
                  <span className="text-silver-400 block text-[11px] mb-1">Verification Status</span>
                  <span className="font-semibold text-emerald-400">Two-Factor OTP Verified</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5 text-xs text-silver-300">
                <span className="font-bold text-cyan-300 block mb-1">Privacy & Discretion Notice</span>
                All student grievances filed under this account comply with official VTU UGC guidelines. Anonymous submissions completely mask your identity from department view while retaining internal audit integrity.
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
