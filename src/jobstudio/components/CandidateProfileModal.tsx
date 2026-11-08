// @ts-nocheck -- ported verbatim from the original project
import React, { useState } from 'react';
import { User, Save, X } from 'lucide-react';
import { CandidateInfo } from '../data/defaultData';

interface CandidateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterProfileText: string;
  setMasterProfileText: (val: string) => void;
  candidateInfo: CandidateInfo;
  setCandidateInfo: React.Dispatch<React.SetStateAction<CandidateInfo>>;
}

export const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
  isOpen,
  onClose,
  masterProfileText,
  setMasterProfileText,
  candidateInfo,
  setCandidateInfo,
}) => {
  if (!isOpen) return null;

  const [localText, setLocalText] = useState(masterProfileText);
  const [localInfo, setLocalInfo] = useState(candidateInfo);

  const handleSave = () => {
    setMasterProfileText(localText);
    setCandidateInfo(localInfo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-foreground/40 backdrop-blur-sm animate-fadeIn">
      <div
        className="mobile-dialog-panel bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.15)' }}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-surface flex items-center justify-center">
              <User className="w-4.5 h-4.5 text-subtle" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                Candidate Profile
              </h2>
              <p className="text-xs text-subtle">
                Contact details &amp; master resume
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-subtle hover:text-foreground p-2 rounded-full hover:bg-surface transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5" style={{ fontFamily: 'var(--font-body)' }}>
          {/* Contact Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground text-xs font-medium uppercase tracking-wider block mb-1.5">First Name</label>
              <input
                type="text"
                value={localInfo.first_name}
                onChange={(e) => setLocalInfo({ ...localInfo, first_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border-0 rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand transition-all duration-200 placeholder:text-subtle"
              />
            </div>
            <div>
              <label className="text-muted-foreground text-xs font-medium uppercase tracking-wider block mb-1.5">Last Name</label>
              <input
                type="text"
                value={localInfo.last_name}
                onChange={(e) => setLocalInfo({ ...localInfo, last_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border-0 rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand transition-all duration-200 placeholder:text-subtle"
              />
            </div>
            <div>
              <label className="text-muted-foreground text-xs font-medium uppercase tracking-wider block mb-1.5">Email</label>
              <input
                type="email"
                value={localInfo.email}
                onChange={(e) => setLocalInfo({ ...localInfo, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border-0 rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand transition-all duration-200 placeholder:text-subtle"
              />
            </div>
            <div>
              <label className="text-muted-foreground text-xs font-medium uppercase tracking-wider block mb-1.5">Phone</label>
              <input
                type="text"
                value={localInfo.phone}
                onChange={(e) => setLocalInfo({ ...localInfo, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border-0 rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand transition-all duration-200 placeholder:text-subtle"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="text-muted-foreground text-xs font-medium uppercase tracking-wider block mb-1.5">Location</label>
              <input
                type="text"
                value={localInfo.location}
                onChange={(e) => setLocalInfo({ ...localInfo, location: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border-0 rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand transition-all duration-200 placeholder:text-subtle"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="text-muted-foreground text-xs font-medium uppercase tracking-wider block mb-1.5">LinkedIn URL</label>
              <input
                type="text"
                value={localInfo.linkedin}
                onChange={(e) => setLocalInfo({ ...localInfo, linkedin: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-surface border-0 rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand transition-all duration-200 placeholder:text-subtle"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-muted-foreground text-xs font-medium uppercase tracking-wider block">
                Master Resume Experience &amp; Skills
              </label>
              <span className="text-[10px] text-subtle font-medium uppercase tracking-wider">Source of Truth</span>
            </div>
            <textarea
              value={localText}
              onChange={(e) => setLocalText(e.target.value)}
              rows={12}
              className="w-full p-3.5 bg-surface border-0 rounded-xl font-mono text-[12px] leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-brand transition-all duration-200 resize-none placeholder:text-subtle"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t border-border bg-surface/50 rounded-b-2xl flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-brand hover:text-brand hover:bg-brand/5 rounded-full transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all duration-200 flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
