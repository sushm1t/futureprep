import React from 'react';
import { User, Sparkles, ArrowRight, X, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProfile: () => void;
  onApplySampleProfile: () => void;
}

export const ProfileActivationModal: React.FC<ProfileActivationModalProps> = ({
  isOpen,
  onClose,
  onNavigateToProfile,
  onApplySampleProfile,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="activation-modal-title"
    >
      <div className="mobile-dialog-panel bg-card w-full max-w-lg rounded-3xl border border-border shadow-elevated p-5 sm:p-8 space-y-6 relative overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 text-subtle hover:text-foreground p-1 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
          <User className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-wider font-mono">
            <ShieldCheck className="w-3 h-3" />
            Authentic Profile Grounding
          </div>
          <h2 id="activation-modal-title" className="text-xl sm:text-2xl font-display font-bold text-foreground">
            Ground your workspace in your real experience
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Job Studio tailors documents using your genuine career accomplishments. Upload your resume or paste your LinkedIn summary to get instant, accurate match scores.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Button
            onClick={() => {
              onClose();
              onNavigateToProfile();
            }}
            className="w-full py-3.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <span>Add Master Profile (60 sec)</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <button
            type="button"
            onClick={() => {
              onApplySampleProfile();
              onClose();
            }}
            className="w-full py-3 rounded-full bg-surface hover:bg-surface-2 border border-border text-foreground font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>Explore with Sample Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

