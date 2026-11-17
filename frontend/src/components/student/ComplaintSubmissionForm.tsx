import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink,
  Film,
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileText,
  X,
  Info
} from 'lucide-react';
import { api } from '../../services/api';
import { ComplaintCategory, Department } from '../../types';
import { GlassCard } from '../3d/GlassCard';

interface ComplaintSubmissionFormProps {
  onSuccess?: (complaintNumber: string) => void;
  onGoToTrack?: (id: string) => void;
}

interface PhotoItem {
  file: File;
  id: string;
  preview: string;
  size: number;
}

interface VideoItem {
  file: File;
  preview: string;
  size: number;
}

const MAX_PHOTO_SIZE = 200 * 1024; // 200 KB in bytes (204,800 bytes)
const MAX_VIDEO_SIZE = 2 * 1024 * 1024; // 2 MB in bytes (2,097,152 bytes)
const MIN_PHOTOS_REQUIRED = 5;

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const ComplaintSubmissionForm: React.FC<ComplaintSubmissionFormProps> = ({
  onSuccess,
  onGoToTrack
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('hostel');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Evidence state
  const [evidenceType, setEvidenceType] = useState<'photos' | 'video'>('photos');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [videoFile, setVideoFile] = useState<VideoItem | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // AI & Feedback states
  const [detectedCategory, setDetectedCategory] = useState<string | null>(null);
  const [detectedPriority, setDetectedPriority] = useState<string>('normal');
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getDepartments().then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => {
    const text = (title + ' ' + description).toLowerCase();
    if (text.includes('ragging') || text.includes('harass') || text.includes('unsafe') || text.includes('emergency')) {
      setDetectedPriority('urgent');
      setDetectedCategory('harassment');
    } else if (text.includes('exam') || text.includes('marks') || text.includes('syllabus') || text.includes('professor')) {
      setDetectedCategory('academic');
      setDetectedPriority(text.includes('tomorrow') ? 'high' : 'normal');
    } else if (text.includes('hostel') || text.includes('room') || text.includes('water') || text.includes('mess') || text.includes('food')) {
      setDetectedCategory('hostel');
      setDetectedPriority(text.includes('poison') || text.includes('shock') ? 'urgent' : 'normal');
    } else if (text.includes('fee') || text.includes('scholarship') || text.includes('certificate')) {
      setDetectedCategory('admin');
      setDetectedPriority(text.includes('deadline') ? 'high' : 'normal');
    }
  }, [title, description]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      photos.forEach(p => URL.revokeObjectURL(p.preview));
      if (videoFile) URL.revokeObjectURL(videoFile.preview);
    };
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadError(null);
    setError(null);

    const incoming = Array.from(e.target.files);
    const rejected: string[] = [];
    const accepted: PhotoItem[] = [];

    incoming.forEach((file) => {
      if (file.size > MAX_PHOTO_SIZE) {
        rejected.push(`"${file.name}" (${formatFileSize(file.size)})`);
      } else {
        accepted.push({
          file,
          id: `${file.name}-${file.lastModified}-${Math.random()}`,
          preview: URL.createObjectURL(file),
          size: file.size
        });
      }
    });

    if (rejected.length > 0) {
      setUploadError(
        `Max size limit is 200 KB per photo. Excluded ${rejected.length} file(s): ${rejected.join(', ')}. Please compress them to under 200 KB.`
      );
    }

    if (accepted.length > 0) {
      setPhotos((prev) => [...prev, ...accepted]);
    }

    e.target.value = '';
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const item = prev.find(p => p.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(p => p.id !== id);
    });
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadError(null);
    setError(null);

    const file = e.target.files[0];
    if (file.size > MAX_VIDEO_SIZE) {
      setUploadError(
        `Video "${file.name}" is ${formatFileSize(file.size)}. Maximum allowed video size is 2 MB. Please select or compress a smaller video clip.`
      );
      e.target.value = '';
      return;
    }

    if (videoFile) {
      URL.revokeObjectURL(videoFile.preview);
    }

    setVideoFile({
      file,
      preview: URL.createObjectURL(file),
      size: file.size
    });

    e.target.value = '';
  };

  const handleRemoveVideo = () => {
    if (videoFile) {
      URL.revokeObjectURL(videoFile.preview);
      setVideoFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Please provide both a title and detailed description.');
      return;
    }

    // Strict validation for evidence
    if (evidenceType === 'photos') {
      if (photos.length < MIN_PHOTOS_REQUIRED) {
        setError(
          `Evidence Requirement: Please upload at least ${MIN_PHOTOS_REQUIRED} photos (currently ${photos.length}/${MIN_PHOTOS_REQUIRED} uploaded). You need ${MIN_PHOTOS_REQUIRED - photos.length} more photo(s), or switch to video evidence.`
        );
        return;
      }
      for (const p of photos) {
        if (p.size > MAX_PHOTO_SIZE) {
          setError(`Photo "${p.file.name}" exceeds the 200 KB limit (${formatFileSize(p.size)}). Please remove or replace it.`);
          return;
        }
      }
    } else {
      if (!videoFile) {
        setError('Evidence Requirement: Please upload a supporting video clip (maximum 2 MB), or switch to photo evidence.');
        return;
      }
      if (videoFile.size > MAX_VIDEO_SIZE) {
        setError(
          `Video size (${formatFileSize(videoFile.size)}) exceeds the 2 MB limit. Please compress or choose a shorter video.`
        );
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category', category);
    if (departmentId) formData.append('department_id', departmentId);
    formData.append('is_anonymous', String(isAnonymous));

    // Append attachments
    if (evidenceType === 'photos') {
      photos.forEach((p) => {
        formData.append('attachments', p.file);
      });
      if (photos.length > 0) {
        formData.append('attachment', photos[0].file);
      }
    } else if (evidenceType === 'video' && videoFile) {
      formData.append('attachments', videoFile.file);
      formData.append('attachment', videoFile.file);
    }

    try {
      const res = await api.submitComplaint(formData);
      setSubmittedData(res);
      if (onSuccess) onSuccess(res.complaint.complaint_number);
    } catch (err: any) {
      setError(err.message || 'Failed to submit grievance');
    } finally {
      setSubmitting(false);
    }
  };

  const copyId = () => {
    if (submittedData?.complaint?.complaint_number) {
      navigator.clipboard.writeText(submittedData.complaint.complaint_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetForm = () => {
    photos.forEach(p => URL.revokeObjectURL(p.preview));
    if (videoFile) URL.revokeObjectURL(videoFile.preview);
    setPhotos([]);
    setVideoFile(null);
    setSubmittedData(null);
    setTitle('');
    setDescription('');
    setUploadError(null);
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {submittedData ? (
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="rounded-3xl border border-white/10 bg-navy-900/95 p-8 shadow-2xl backdrop-blur-2xl text-center"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
              <Check className="h-7 w-7" />
            </div>

            <h2 className="text-2xl font-bold text-white">Grievance Registered Successfully</h2>
            <p className="mt-1 text-xs text-silver-400">
              Your complaint has been recorded with attached evidence and assigned to the relevant department for official action.
            </p>

            {/* Tracking ID Badge */}
            <div className="my-6 inline-flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-silver-400">Tracking Reference ID</span>
                <p className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-white">
                  {submittedData.complaint.complaint_number}
                </p>
              </div>
              <button
                onClick={copyId}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-silver-300 hover:bg-white/10 hover:text-white"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied' : 'Copy ID'}</span>
              </button>
            </div>

            {/* QR Code and Prediction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left mb-6">
              {submittedData.qrCode && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <img
                    src={submittedData.qrCode}
                    alt="Tracking QR Code"
                    className="h-28 w-28 rounded-xl border border-white/10"
                  />
                  <span className="mt-2 text-[11px] font-semibold text-silver-400 flex items-center gap-1">
                    <QrCode className="h-3.5 w-3.5 text-cyan-400" /> Scan to Track
                  </span>
                </div>
              )}

              <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-white/5 p-4 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-silver-400">
                  Resolution Target
                </span>
                <p className="mt-1 text-sm font-semibold text-white">
                  {submittedData.prediction?.displayText || '~3-4 business days'}
                </p>
                <div className="mt-2 text-silver-400 space-y-1">
                  <p>Priority: <b className="text-white uppercase">{submittedData.complaint.priority}</b></p>
                  <p>Category: <b className="text-white uppercase">{submittedData.complaint.category}</b></p>
                  <p>Evidence: <b className="text-white">{evidenceType === 'photos' ? `${photos.length} Photos` : '1 Video Clip'}</b></p>
                  <p>Anonymous: <b className="text-white">{submittedData.complaint.is_anonymous ? 'Yes' : 'No'}</b></p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onGoToTrack && onGoToTrack(submittedData.complaint.complaint_number)}
                className="ios-glass-btn-primary inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:brightness-110 active:scale-95 cursor-pointer"
              >
                <span>Track Status</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={resetForm}
                className="ios-glass-btn-secondary inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-xs font-semibold text-silver-300 hover:text-white cursor-pointer"
              >
                <span>Submit Another</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <GlassCard className="p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Register a Grievance
                </h1>
                <p className="mt-0.5 text-xs text-silver-400">
                  Submissions require photographic or video evidence with formal institutional timestamping.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-semibold text-silver-300">
                <Clock className="h-3.5 w-3.5 text-silver-400" />
                <span>Target SLA: 3 to 7 Days</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Anonymous Checkbox */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="anonCheck"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded-md border-white/20 bg-navy-800 text-brand-royal focus:ring-cyan-400 cursor-pointer"
                />
                <label htmlFor="anonCheck" className="text-xs text-silver-300 cursor-pointer">
                  <span className="font-semibold text-white block">File as Anonymous Grievance</span>
                  Your identity is shielded from department staff and reviewers.
                </label>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-silver-200 mb-1.5">
                  Complaint Subject <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Summarize the issue clearly"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder-silver-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Category & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-silver-200">Grievance Category</label>
                    {detectedCategory && (
                      <span className="text-[10px] text-silver-400 font-semibold">
                        Auto: {detectedCategory}
                      </span>
                    )}
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                    className="w-full rounded-xl border border-white/10 bg-navy-900 py-2.5 px-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="hostel">Hostel & Facilities</option>
                    <option value="academic">Academic & Curriculum</option>
                    <option value="harassment">Harassment & Safety</option>
                    <option value="admin">Administration & Transport</option>
                    <option value="other">Other / General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-silver-200 mb-1.5">
                    Routing Department (Optional)
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-navy-900 py-2.5 px-3 text-sm text-white focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="">Auto-Route by Category</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-silver-200 mb-1.5">
                  Detailed Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide detailed facts: date, location, specific problem, and affected individuals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-sm text-white placeholder-silver-500 focus:border-cyan-400 focus:outline-none resize-y"
                />
              </div>

              {/* Supporting Evidence Section (Min 5 photos <= 200KB OR video <= 2MB) */}
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Supporting Evidence</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <p className="text-[11px] text-silver-400 mt-0.5">
                      Upload minimum <b>5 photos</b> (max 200 KB each) <i>or</i> <b>1 video clip</b> (max 2 MB).
                    </p>
                  </div>

                  {/* Mode Toggle Switcher */}
                  <div className="flex items-center rounded-xl bg-white/5 p-1 border border-white/10 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEvidenceType('photos');
                        setUploadError(null);
                      }}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        evidenceType === 'photos'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                          : 'text-silver-400 hover:text-white'
                      }`}
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>Photos (Min 5)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEvidenceType('video');
                        setUploadError(null);
                      }}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        evidenceType === 'video'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                          : 'text-silver-400 hover:text-white'
                      }`}
                    >
                      <Film className="h-3.5 w-3.5" />
                      <span>Video (Max 2 MB)</span>
                    </button>
                  </div>
                </div>

                {uploadError && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Evidence Type: PHOTOS */}
                {evidenceType === 'photos' ? (
                  <div className="space-y-3">
                    {/* Requirement Status Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 p-2.5 border border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        {photos.length >= MIN_PHOTOS_REQUIRED ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Requirement Met ({photos.length} photos ready)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                            <AlertCircle className="h-4 w-4 text-amber-400" />
                            <span>
                              {photos.length} / {MIN_PHOTOS_REQUIRED} Photos Uploaded 
                              <span className="text-silver-400 font-normal"> (Need {MIN_PHOTOS_REQUIRED - photos.length} more)</span>
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-silver-400 font-mono">
                        Limit: ≤ 200 KB per photo
                      </span>
                    </div>

                    {/* Upload Drop Zone / Button */}
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-white/5 hover:bg-white/[0.07] p-5 text-center transition-all">
                      <UploadCloud className="h-8 w-8 text-cyan-400 mb-2 opacity-80" />
                      <p className="text-xs font-semibold text-white">
                        {photos.length === 0 ? 'Click to select 5 or more photos' : 'Add more photos'}
                      </p>
                      <p className="text-[11px] text-silver-400 mt-0.5">
                        JPEG, PNG, or WebP • Strictly under 200 KB each
                      </p>
                      <label className="mt-3 inline-flex items-center gap-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 cursor-pointer transition-all">
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span>Select Photos</span>
                        <input
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoSelect}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Photo Thumbnails Grid */}
                    {photos.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs text-silver-400 px-1">
                          <span>Attached Photos ({photos.length})</span>
                          <button
                            type="button"
                            onClick={() => {
                              photos.forEach(p => URL.revokeObjectURL(p.preview));
                              setPhotos([]);
                            }}
                            className="text-[11px] text-rose-400 hover:underline"
                          >
                            Remove All
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                          {photos.map((item, index) => (
                            <div
                              key={item.id}
                              className="group relative rounded-xl border border-white/10 bg-black/40 overflow-hidden flex flex-col"
                            >
                              <div className="aspect-square w-full overflow-hidden bg-black/60 relative">
                                <img
                                  src={item.preview}
                                  alt={`Evidence ${index + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <span className="absolute top-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-mono text-white">
                                  #{index + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(item.id)}
                                  className="absolute top-1 right-1 rounded-md bg-rose-500/80 p-1 text-white hover:bg-rose-600 transition-colors shadow-sm"
                                  title="Remove photo"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                              <div className="p-1.5 flex items-center justify-between text-[10px] text-silver-300 bg-white/5">
                                <span className="truncate max-w-[70px]" title={item.file.name}>
                                  {item.file.name}
                                </span>
                                <span className="font-mono text-emerald-400">
                                  {formatFileSize(item.size)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Evidence Type: VIDEO */
                  <div className="space-y-3">
                    {/* Requirement Status Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 p-2.5 border border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        {videoFile ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Video Attached ({formatFileSize(videoFile.size)})</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                            <AlertCircle className="h-4 w-4 text-amber-400" />
                            <span>1 Video Clip Required (Max 2 MB)</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-silver-400 font-mono">
                        Limit: ≤ 2.0 MB
                      </span>
                    </div>

                    {!videoFile ? (
                      /* Upload Video Zone */
                      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-white/5 hover:bg-white/[0.07] p-6 text-center transition-all">
                        <Film className="h-8 w-8 text-cyan-400 mb-2 opacity-80" />
                        <p className="text-xs font-semibold text-white">
                          Select 1 Video Clip
                        </p>
                        <p className="text-[11px] text-silver-400 mt-0.5">
                          MP4, WebM, MOV, or 3GP • Maximum file size 2 MB
                        </p>
                        <label className="mt-3 inline-flex items-center gap-2 rounded-xl bg-cyan-500/20 border border-cyan-500/30 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 cursor-pointer transition-all">
                          <Film className="h-3.5 w-3.5" />
                          <span>Select Video Clip</span>
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime,video/3gpp"
                            onChange={handleVideoSelect}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      /* Video Preview */
                      <div className="rounded-2xl border border-white/10 bg-black/40 p-3 space-y-2">
                        <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/80 flex items-center justify-center">
                          <video
                            src={videoFile.preview}
                            controls
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs px-1">
                          <div className="flex items-center gap-2">
                            <Film className="h-4 w-4 text-cyan-400" />
                            <span className="text-white font-medium truncate max-w-[200px]" title={videoFile.file.name}>
                              {videoFile.file.name}
                            </span>
                            <span className="text-[11px] font-mono text-emerald-400">
                              ({formatFileSize(videoFile.size)})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveVideo}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs text-rose-300 hover:bg-rose-500/20 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full pebble-pill flex items-center justify-center gap-2 rounded-xl bg-brand-royal py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 active:scale-[0.99] disabled:opacity-50 cursor-pointer transition-all"
              >
                {submitting ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Grievance</span>
                  </>
                )}
              </button>
            </form>
          </GlassCard>
        )}
      </AnimatePresence>
    </div>
  );
};
