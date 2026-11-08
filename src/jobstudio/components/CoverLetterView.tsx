// @ts-nocheck -- ported verbatim from the original project
import React, { useState } from 'react';
import { Copy, CheckCircle2, Download, FileText, Loader2 } from 'lucide-react';
import { CoverLetterData } from '../data/defaultData';
import { generatePlainTextCoverLetter, downloadCoverLetterAsPdf } from '../utils/pdfExport';
import { downloadCoverLetterAsDocx } from '../utils/docxExport';

interface CoverLetterViewProps {
  coverLetter: CoverLetterData;
  candidateName: string;
  companyName: string;
  jobTitle: string;
}

export const CoverLetterView: React.FC<CoverLetterViewProps> = ({
  coverLetter,
  candidateName,
  companyName,
  jobTitle,
}) => {
  const [copied, setCopied] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);
  const [docxSuccess, setDocxSuccess] = useState(false);

  const handleCopy = () => {
    const text = generatePlainTextCoverLetter(coverLetter, candidateName);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = async () => {
    if (exportingPdf) return;
    setExportingPdf(true);
    try {
      const fileName = `Cover_Letter_${(companyName || 'Company').replace(/\s+/g, '_')}_${(candidateName || 'Candidate').replace(/\s+/g, '_')}.pdf`;
      await downloadCoverLetterAsPdf(coverLetter, candidateName, fileName);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export cover letter PDF:', err);
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportDocx = () => {
    if (exportingDocx) return;
    setExportingDocx(true);
    try {
      const fileName = `Cover_Letter_${(companyName || 'Company').replace(/\s+/g, '_')}_${(candidateName || 'Candidate').replace(/\s+/g, '_')}.docx`;
      downloadCoverLetterAsDocx(coverLetter, candidateName, fileName);
      setDocxSuccess(true);
      setTimeout(() => setDocxSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export cover letter DOCX:', err);
    } finally {
      setExportingDocx(false);
    }
  };

  if (!coverLetter || !coverLetter.body_paragraphs || coverLetter.body_paragraphs.length === 0) {
    return (
      <div className="workspace-empty space-y-4 max-w-xl">
        <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6 text-subtle" />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-display text-xl font-semibold text-foreground">Cover Letter</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
            Select an opportunity in Job Evaluator or evaluate a job description to automatically generate a tailored cover letter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-letter space-y-6 max-w-4xl mx-auto">
      {/* Landing-Inspired Action Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-b from-card via-card/95 to-surface/90 rounded-3xl border border-border/80 p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-elevated">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="bg-brand/10 text-brand text-[11px] font-bold rounded-full px-3 py-0.5 uppercase tracking-widest font-mono border border-brand/20 shadow-2xs">
              TAILORED DOCUMENTS
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Tailored Cover Letter
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Addressed to <span className="font-semibold text-foreground">{companyName}</span> · {jobTitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto text-xs">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 font-medium text-foreground bg-surface hover:bg-surface-2 border border-border rounded-full transition-all duration-200 cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-subtle" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-all duration-200 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : pdfSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                <span>PDF Downloaded</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportDocx}
            disabled={exportingDocx}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 font-medium text-foreground bg-surface hover:bg-surface-2 border border-border rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportingDocx ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-subtle" />
                <span>Generating DOCX...</span>
              </>
            ) : docxSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                <span>DOCX Downloaded</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-subtle" />
                <span>Export DOCX</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Styled Printable Letter Paper */}
      <div className="workspace-letter-paper paper p-8 sm:p-14 leading-relaxed">
        {/* Candidate Header */}
        <div className="mb-6 pb-4 border-b border-border/60">
          <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            {candidateName}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Recipient */}
        <div className="text-xs sm:text-sm text-muted-foreground whitespace-pre-line mb-6 pb-4 border-b border-border/60">
          {coverLetter.recipient}
        </div>

        {/* Subject */}
        <div className="font-display text-base sm:text-lg font-semibold text-foreground mb-6">
          {coverLetter.subject}
        </div>

        {/* Paragraphs */}
        <div className="space-y-4 text-xs sm:text-sm text-foreground/80 leading-relaxed text-justify">
          {coverLetter.body_paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* Signoff */}
        <div className="mt-8 pt-4 border-t border-border/60 text-xs sm:text-sm text-foreground whitespace-pre-line font-medium font-display">
          {coverLetter.signoff}
        </div>
      </div>
    </div>
  );
};
