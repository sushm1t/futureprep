// @ts-nocheck -- Job Studio Bug & Feedback Reporting Modal
import React, { useState, useRef, useEffect } from 'react';
import {
  Bug,
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Laptop,
  Send,
  Loader2,
} from 'lucide-react';

export interface BugReportPayload {
  subject: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'critical';
  screenshot?: string; // base64 data URL
  screenshotName?: string;
  contactEmail?: string;
  diagnostics?: {
    activeTab?: string;
    activeRole?: string;
    url?: string;
    userAgent?: string;
    screenResolution?: string;
    timestamp?: string;
    userEmail?: string;
  };
}

interface ReportBugModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  activeTab?: string;
  activeRole?: string;
}

const CATEGORIES = [
  'Resume Tailoring & Bullet Points',
  'Job Evaluator & Match Scoring',
  'Master Profile & Resume Upload',
  'Interview Prep & Company Focus',
  'Pricing, Plans & Quotas',
  'UI, Visuals & Performance',
  'Other Issue / General Feedback',
];

export const ReportBugModal: React.FC<ReportBugModalProps> = ({
  isOpen,
  onClose,
  userEmail = '',
  activeTab = 'evaluator',
  activeRole = '',
}) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [severity, setSeverity] = useState<'low' | 'medium' | 'critical'>('medium');
  const [contactEmail, setContactEmail] = useState(userEmail);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [screenshotSize, setScreenshotSize] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync contact email if userEmail changes
  useEffect(() => {
    if (userEmail && !contactEmail) {
      setContactEmail(userEmail);
    }
  }, [userEmail]);

  // Support paste from clipboard (e.g. Cmd+V a screenshot directly)
  useEffect(() => {
    if (!isOpen) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setSubmitError('Please attach an image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setSubmitError('Screenshot must be smaller than 8MB.');
      return;
    }

    setSubmitError(null);
    setScreenshotName(file.name || 'pasted-screenshot.png');
    setScreenshotSize(file.size);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      // Optional client-side optimization: scale down if huge
      const img = new Image();
      img.onload = () => {
        const maxWidth = 1600;
        const maxHeight = 1600;
        if (img.width > maxWidth || img.height > maxHeight) {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setScreenshot(canvas.toDataURL('image/jpeg', 0.85));
            return;
          }
        }
        setScreenshot(dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveScreenshot = () => {
    setScreenshot(null);
    setScreenshotName(null);
    setScreenshotSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setSubmitError('Please enter a brief subject for the bug.');
      return;
    }
    if (!description.trim()) {
      setSubmitError('Please describe the issue in detail.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const diagnostics = {
      activeTab,
      activeRole: activeRole || 'None',
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      screenResolution: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
      timestamp: new Date().toISOString(),
      userEmail: userEmail || contactEmail || 'anonymous',
    };

    const payload: BugReportPayload = {
      subject: subject.trim(),
      description: description.trim(),
      category,
      severity,
      screenshot: screenshot || undefined,
      screenshotName: screenshotName || undefined,
      contactEmail: contactEmail.trim() || undefined,
      diagnostics,
    };

    try {
      const res = await fetch('/api/report-bug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Failed to submit bug report. Please try again.');
      }

      setSubmittedReportId(data.id || `BUG-${Date.now().toString(36).toUpperCase()}`);
    } catch (err: any) {
      console.error('Failed to report bug:', err);
      setSubmitError(err.message || 'Network error submitting bug report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubject('');
    setDescription('');
    setCategory(CATEGORIES[0]);
    setSeverity('medium');
    setScreenshot(null);
    setScreenshotName(null);
    setScreenshotSize(null);
    setSubmittedReportId(null);
    setSubmitError(null);
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
      <div className="mobile-dialog-panel bg-card border border-border rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="mobile-dialog-heading px-6 py-5 border-b border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/25 flex items-center justify-center text-brand shrink-0">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base sm:text-lg font-semibold text-foreground">
                  Report a Bug or Issue
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-brand/10 text-brand border border-brand/25 uppercase tracking-wider font-mono">
                  FEEDBACK
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Encountered unexpected behavior? Send us the details and screenshots so we can fix it.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-subtle hover:text-foreground rounded-lg hover:bg-surface transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mobile-dialog-content p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {submittedReportId ? (
            /* Success confirmation */
            <div className="py-8 text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-success/10 border border-success/30 flex items-center justify-center mx-auto text-success">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="font-display text-lg font-bold text-foreground">
                  Bug Report Submitted Successfully!
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Thank you for helping us polish Job Studio. Our engineering team has logged this issue with full system diagnostics and will investigate immediately.
                </p>
                <div className="inline-block px-3 py-1 bg-surface border border-border rounded-lg text-xs font-mono text-foreground font-semibold mt-2">
                  Reference: <span className="text-brand font-semibold">{submittedReportId}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 rounded-xl bg-surface hover:bg-surface/80 border border-border text-foreground font-medium text-xs transition-colors cursor-pointer"
                >
                  Report Another Bug
                </button>
              </div>
            </div>
          ) : (
            /* Bug Report Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {submitError && (
                <div className="p-3 rounded-xl bg-danger/10 border border-danger/25 flex items-start gap-2.5 text-xs text-danger">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{submitError}</p>
                </div>
              )}

              {/* Area / Category */}
              <div className="space-y-1.5">
                <label htmlFor="bug-category" className="text-xs font-semibold text-foreground">
                  Area / Category
                </label>
                <select
                  id="bug-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-brand"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label htmlFor="bug-subject" className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Subject / Brief Summary <span className="text-danger">*</span></span>
                  <span className="text-[11px] text-muted-foreground font-normal">
                    {subject.length}/100
                  </span>
                </label>
                <input
                  id="bug-subject"
                  type="text"
                  maxLength={100}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Work experience timeline appeared out of order on tailored resume"
                  className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-subtle focus:outline-none focus:border-brand"
                  required
                />
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <label htmlFor="bug-description" className="text-xs font-semibold text-foreground">
                  Description of Issue <span className="text-danger">*</span>
                </label>
                <textarea
                  id="bug-description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened, what you were trying to do, and what you expected to see..."
                  className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-subtle focus:outline-none focus:border-brand resize-y leading-relaxed"
                  required
                />
              </div>

              {/* Screenshot Upload / Drag & Drop */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">
                  Screenshot Attachment (Optional)
                </label>

                {screenshot ? (
                  <div className="p-3 bg-surface border border-border rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={screenshot}
                        alt="Screenshot Preview"
                        className="w-12 h-12 object-cover rounded-lg border border-border bg-black/40 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-foreground truncate max-w-[240px]">
                          {screenshotName}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {formatFileSize(screenshotSize)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveScreenshot}
                      className="p-1.5 text-subtle hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Remove screenshot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? 'border-brand bg-brand/5'
                        : 'border-border hover:border-brand/40 bg-surface/40 hover:bg-surface/80'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center gap-1.5 text-xs text-muted-foreground">
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-subtle border border-border">
                        <ImageIcon className="w-4 h-4 text-brand" />
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">Click to upload</span> or drag and drop
                      </div>
                      <span className="text-[10px] text-subtle">PNG, JPG, or WebP up to 8MB</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Reporter Contact Email */}
              <div className="space-y-1.5">
                <label htmlFor="bug-email" className="text-xs font-semibold text-foreground">
                  Your Email (Optional, for follow-up)
                </label>
                <input
                  id="bug-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-surface border border-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-subtle focus:outline-none focus:border-brand"
                />
              </div>

              {/* Diagnostics Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowDiagnostics(!showDiagnostics)}
                  className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <Laptop className="w-3.5 h-3.5 text-brand" />
                  <span>Auto-included environment & diagnostics</span>
                  {showDiagnostics ? (
                    <ChevronUp className="w-3 h-3 ml-0.5" />
                  ) : (
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  )}
                </button>

                {showDiagnostics && (
                  <div className="mt-2 p-3 rounded-xl bg-surface/80 border border-border text-[11px] text-muted-foreground font-mono space-y-1 animate-in fade-in duration-150">
                    <div><strong>Page Tab:</strong> {activeTab}</div>
                    {activeRole && <div><strong>Selected Role:</strong> {activeRole}</div>}
                    <div><strong>Resolution:</strong> {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}</div>
                    <div className="truncate"><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}</div>
                    <div><strong>Timestamp:</strong> {new Date().toLocaleString()}</div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !subject.trim() || !description.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-glow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Bug Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
