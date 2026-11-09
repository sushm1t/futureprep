// @ts-nocheck -- ported verbatim from the original project
import jsPDF from 'jspdf';
import { TailoredResumeData, CoverLetterData } from '../data/defaultData';

export interface PdfExportOptions {
  fileName?: string;
  forceSinglePage?: boolean;
  density?: 'comfortable' | 'balanced' | 'compact';
}

/**
 * Sanitizes Unicode characters (like ₹, smart quotes, em-dashes) into clean Latin-1/ASCII
 * equivalents. This prevents jsPDF from falling back to multi-byte UTF-16 encoding
 * which inserts null bytes (rendered as literal spaces) between every character.
 */
function cleanPdfText(str: string): string {
  if (!str) return '';
  return str
    .replace(/₹/g, 'INR ')
    .replace(/€/g, 'EUR ')
    .replace(/£/g, 'GBP ')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u00A0\u202F]/g, ' ')
    .replace(/[^\x00-\xFF]/g, ' ');
}

/**
 * Creates an interactive clickable hyperlink annotation in jsPDF
 * with strictly normalized bounding box coordinates according to ISO 32000-1 (lly < ury)
 * so links are active and functional across all PDF viewers (Acrobat, Preview, Chrome, Edge).
 */
function addClickablePdfLink(
  pdf: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  url: string
): void {
  try {
    pdf.link(x, y, w, h, { url });

    const internal = pdf.internal as any;
    const page = typeof internal.getCurrentPageInfo === 'function' ? internal.getCurrentPageInfo() : null;
    const annots = page?.pageContext?.annotations;
    if (annots && annots.length > 0) {
      const lastAnnot = annots[annots.length - 1];
      if (lastAnnot && lastAnnot.finalBounds) {
        const b = lastAnnot.finalBounds;
        const y1 = parseFloat(b.y);
        const y2 = parseFloat(b.h);
        if (y1 > y2) {
          const temp = b.y;
          b.y = b.h;
          b.h = temp;
        }
      }
    }
  } catch (err) {
    console.warn('Error attaching clickable PDF link:', err);
  }
}

/**
 * Generates a 100% vector-based, ATS-compliant PDF with real selectable, copyable,
 * and searchable text (zero raster image compression).
 *
 * When uploaded to job application portals (Greenhouse, Lever, Workday, SmartRecruiters,
 * Taleo, Ashby, iCIMS, etc.), the parser can immediately read the native text stream
 * and auto-populate all candidate profile fields.
 */
export function generateVectorResumePdf(
  resume: TailoredResumeData,
  options: PdfExportOptions = {}
): jsPDF {
  const forceSinglePage = options.forceSinglePage !== false;

  // Standard US Letter dimensions in points (pt): 8.5 x 11 inches = 612 x 792 pt
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 612 pt
  const pageHeight = doc.internal.pageSize.getHeight(); // 792 pt

  interface DensityMetrics {
    nameSize: number;
    nameGap: number;
    contactSize: number;
    headerRuleGap: number;
    headerAfterGap: number;
    sectionHeaderSize: number;
    sectionHeaderUnderlineGap: number;
    sectionHeadingAfterGap: number;
    sectionBottomGap: number;
    summarySize: number;
    summaryLineHeight: number;
    skillsSize: number;
    skillsLineHeight: number;
    expTitleSize: number;
    expMetaSize: number;
    expCompanySize: number;
    expTitleGap: number;
    expCompanyGap: number;
    bulletSize: number;
    bulletLineHeight: number;
    bulletGap: number;
    expBottomGap: number;
    eduDegreeSize: number;
    eduInstSize: number;
    eduYearSize: number;
    eduGap: number;
    eduInstGap: number;
    eduItemBottom: number;
    certSize: number;
    certGap: number;
    marginX: number;
    marginTop: number;
    marginBottom: number;
  }

  const comfortableMetrics: DensityMetrics = {
    nameSize: 21,
    nameGap: 16,
    contactSize: 9,
    headerRuleGap: 11,
    headerAfterGap: 14,
    sectionHeaderSize: 10.5,
    sectionHeaderUnderlineGap: 4,
    sectionHeadingAfterGap: 11,
    sectionBottomGap: 13,
    summarySize: 9.5,
    summaryLineHeight: 1.4,
    skillsSize: 9,
    skillsLineHeight: 1.36,
    expTitleSize: 10.5,
    expMetaSize: 9,
    expCompanySize: 9.5,
    expTitleGap: 12,
    expCompanyGap: 11,
    bulletSize: 9.2,
    bulletLineHeight: 1.36,
    bulletGap: 4.5,
    expBottomGap: 10,
    eduDegreeSize: 9.5,
    eduInstSize: 9,
    eduYearSize: 9,
    eduGap: 12,
    eduInstGap: 11,
    eduItemBottom: 6,
    certSize: 9,
    certGap: 12,
    marginX: 36,
    marginTop: 40,
    marginBottom: 40,
  };

  const balancedMetrics: DensityMetrics = {
    nameSize: 19.5,
    nameGap: 15,
    contactSize: 8.5,
    headerRuleGap: 10,
    headerAfterGap: 12,
    sectionHeaderSize: 9.8,
    sectionHeaderUnderlineGap: 3.5,
    sectionHeadingAfterGap: 9,
    sectionBottomGap: 9.5,
    summarySize: 8.8,
    summaryLineHeight: 1.34,
    skillsSize: 8.6,
    skillsLineHeight: 1.32,
    expTitleSize: 9.8,
    expMetaSize: 8.5,
    expCompanySize: 9,
    expTitleGap: 11,
    expCompanyGap: 10,
    bulletSize: 8.5,
    bulletLineHeight: 1.32,
    bulletGap: 3,
    expBottomGap: 6,
    eduDegreeSize: 8.8,
    eduInstSize: 8.5,
    eduYearSize: 8.5,
    eduGap: 10.5,
    eduInstGap: 10.5,
    eduItemBottom: 4.5,
    certSize: 8.5,
    certGap: 10.5,
    marginX: 36,
    marginTop: 36,
    marginBottom: 36,
  };

  const compactMetrics: DensityMetrics = {
    nameSize: 18,
    nameGap: 14,
    contactSize: 8,
    headerRuleGap: 9,
    headerAfterGap: 10,
    sectionHeaderSize: 9.2,
    sectionHeaderUnderlineGap: 3,
    sectionHeadingAfterGap: 7.5,
    sectionBottomGap: 7,
    summarySize: 8.2,
    summaryLineHeight: 1.28,
    skillsSize: 8.2,
    skillsLineHeight: 1.28,
    expTitleSize: 9.2,
    expMetaSize: 8,
    expCompanySize: 8.5,
    expTitleGap: 10,
    expCompanyGap: 9,
    bulletSize: 8,
    bulletLineHeight: 1.26,
    bulletGap: 2,
    expBottomGap: 4,
    eduDegreeSize: 8.2,
    eduInstSize: 8,
    eduYearSize: 8,
    eduGap: 9.5,
    eduInstGap: 9.5,
    eduItemBottom: 3,
    certSize: 8,
    certGap: 9.5,
    marginX: 36,
    marginTop: 32,
    marginBottom: 32,
  };

  const ultraCompactMetrics: DensityMetrics = {
    nameSize: 17,
    nameGap: 12,
    contactSize: 7.8,
    headerRuleGap: 8,
    headerAfterGap: 9,
    sectionHeaderSize: 8.8,
    sectionHeaderUnderlineGap: 2.5,
    sectionHeadingAfterGap: 6.5,
    sectionBottomGap: 5.5,
    summarySize: 7.8,
    summaryLineHeight: 1.24,
    skillsSize: 7.8,
    skillsLineHeight: 1.24,
    expTitleSize: 8.8,
    expMetaSize: 7.8,
    expCompanySize: 8.2,
    expTitleGap: 9,
    expCompanyGap: 8,
    bulletSize: 7.6,
    bulletLineHeight: 1.22,
    bulletGap: 1.5,
    expBottomGap: 3,
    eduDegreeSize: 8,
    eduInstSize: 7.6,
    eduYearSize: 7.6,
    eduGap: 8.5,
    eduInstGap: 8.5,
    eduItemBottom: 2.5,
    certSize: 7.8,
    certGap: 8.5,
    marginX: 34,
    marginTop: 28,
    marginBottom: 28,
  };

  // Helper to pre-calculate total document height and select the optimal 1-page density
  function estimatePdfResumeHeight(
    pdfDoc: jsPDF,
    r: TailoredResumeData,
    metrics: DensityMetrics,
    cWidth: number
  ): number {
    let h = metrics.marginTop;
    h += metrics.nameGap + metrics.headerRuleGap + metrics.headerAfterGap;

    if (r.tailored_summary) {
      const summaryLines = pdfDoc.splitTextToSize(cleanPdfText(r.tailored_summary), cWidth);
      h += (metrics.sectionHeaderUnderlineGap + metrics.sectionHeadingAfterGap + 12) +
        summaryLines.length * (metrics.summarySize * metrics.summaryLineHeight) +
        metrics.sectionBottomGap;
    }

    if (r.skills && r.skills.length > 0) {
      const skillsText = r.skills.map(cleanPdfText).join('  •  ');
      const skillLines = pdfDoc.splitTextToSize(skillsText, cWidth);
      h += (metrics.sectionHeaderUnderlineGap + metrics.sectionHeadingAfterGap + 12) +
        skillLines.length * (metrics.skillsSize * metrics.skillsLineHeight) +
        metrics.sectionBottomGap;
    }

    if (r.experiences && r.experiences.length > 0) {
      h += (metrics.sectionHeaderUnderlineGap + metrics.sectionHeadingAfterGap + 12);
      const bW = cWidth - 14;
      r.experiences.forEach((exp) => {
        h += metrics.expTitleGap + metrics.expCompanyGap;
        (exp.bullets || []).forEach((b) => {
          const bLines = pdfDoc.splitTextToSize(cleanPdfText(b), bW);
          h += bLines.length * (metrics.bulletSize * metrics.bulletLineHeight) + metrics.bulletGap;
        });
        h += metrics.expBottomGap;
      });
    }

    if (r.projects && r.projects.length > 0) {
      h += (metrics.sectionHeaderUnderlineGap + metrics.sectionHeadingAfterGap + 12);
      const bW = cWidth - 14;
      r.projects.forEach((proj) => {
        h += metrics.expTitleGap;
        if (proj.description) {
          const dLines = pdfDoc.splitTextToSize(cleanPdfText(proj.description), cWidth);
          h += dLines.length * (metrics.bulletSize * metrics.bulletLineHeight) + metrics.bulletGap;
        }
        (proj.bullets || []).forEach((b) => {
          const bLines = pdfDoc.splitTextToSize(cleanPdfText(b), bW);
          h += bLines.length * (metrics.bulletSize * metrics.bulletLineHeight) + metrics.bulletGap;
        });
        h += metrics.expBottomGap;
      });
    }

    if (r.education && r.education.length > 0) {
      h += (metrics.sectionHeaderUnderlineGap + metrics.sectionHeadingAfterGap + 12);
      r.education.forEach(() => {
        h += metrics.eduGap + metrics.eduInstGap;
      });
      h += metrics.eduItemBottom;
    }

    if (r.certifications && r.certifications.length > 0) {
      h += (metrics.sectionHeaderUnderlineGap + metrics.sectionHeadingAfterGap + 12);
      const certsToShow = r.certifications.slice(0, 4);
      certsToShow.forEach(() => {
        h += metrics.certGap;
      });
    }

    return h;
  }

  let m: DensityMetrics;

  if (options.density === 'comfortable') {
    // Full Page Executive (Harvard/Stanford standard):
    // Preserves spacious, prestigious typography (10.5pt titles, 9.2pt bullets, 1.36 line height, 4.5pt bullet gaps).
    // If the candidate has extensive history (4+ roles, 14+ bullets), it flows naturally onto
    // Page 2 rather than cramming text or creating cognitive overload for recruiters.
    m = comfortableMetrics;
  } else if (options.density === 'compact') {
    // Compact: high-density packing to fit 100% of roles and education onto 1 single page
    if (forceSinglePage) {
      const cWidth = pageWidth - compactMetrics.marginX * 2;
      const estimatedH = estimatePdfResumeHeight(doc, resume, compactMetrics, cWidth);
      if (estimatedH <= pageHeight - compactMetrics.marginBottom) {
        m = compactMetrics;
      } else {
        m = ultraCompactMetrics;
      }
    } else {
      m = compactMetrics;
    }
  } else if (options.density === 'balanced') {
    if (forceSinglePage) {
      const cWidth = pageWidth - balancedMetrics.marginX * 2;
      const estimatedH = estimatePdfResumeHeight(doc, resume, balancedMetrics, cWidth);
      if (estimatedH <= pageHeight - balancedMetrics.marginBottom) {
        m = balancedMetrics;
      } else if (estimatePdfResumeHeight(doc, resume, compactMetrics, pageWidth - compactMetrics.marginX * 2) <= pageHeight - compactMetrics.marginBottom) {
        m = compactMetrics;
      } else {
        m = ultraCompactMetrics;
      }
    } else {
      m = balancedMetrics;
    }
  } else {
    // Auto mode: evaluate from comfortable down to compact for single-page fit
    const cWidth = pageWidth - comfortableMetrics.marginX * 2;
    if (estimatePdfResumeHeight(doc, resume, comfortableMetrics, cWidth) <= pageHeight - comfortableMetrics.marginBottom) {
      m = comfortableMetrics;
    } else if (estimatePdfResumeHeight(doc, resume, balancedMetrics, pageWidth - balancedMetrics.marginX * 2) <= pageHeight - balancedMetrics.marginBottom) {
      m = balancedMetrics;
    } else if (estimatePdfResumeHeight(doc, resume, compactMetrics, pageWidth - compactMetrics.marginX * 2) <= pageHeight - compactMetrics.marginBottom) {
      m = compactMetrics;
    } else {
      m = ultraCompactMetrics;
    }
  }

  const marginX = m.marginX;
  const marginTop = m.marginTop;
  const marginBottom = m.marginBottom;
  const contentWidth = pageWidth - marginX * 2; // 540 pt
  const maxY = pageHeight - marginBottom;

  let y = marginTop;

  // Page break helper for documents: ensures text NEVER renders past maxY into invisible void
  function checkPageBreak(neededHeight: number): boolean {
    if (y + neededHeight > maxY) {
      doc.addPage();
      y = marginTop;
      return true;
    }
    return false;
  }

  // 1. Candidate Full Name (Header)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(m.nameSize);
  doc.setTextColor(29, 29, 31);
  doc.text(cleanPdfText((resume.full_name || 'CANDIDATE NAME').toUpperCase()), marginX, y);
  y += m.nameGap;

  // 2. Contact Information Line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(m.contactSize);
  doc.setTextColor(70, 70, 75);

  const contactItems: Array<{ text: string; url?: string }> = [];
  if (resume.email) {
    contactItems.push({ text: cleanPdfText(resume.email), url: `mailto:${resume.email}` });
  }
  if (resume.phone) {
    contactItems.push({ text: cleanPdfText(resume.phone), url: `tel:${resume.phone.replace(/[^0-9+]/g, '')}` });
  }
  if (
    resume.location &&
    resume.location.trim().length > 0 &&
    !resume.location.toLowerCase().includes('kochi') &&
    !resume.location.toLowerCase().includes('hyderabad')
  ) {
    contactItems.push({ text: cleanPdfText(resume.location) });
  } else if (resume.location) {
    contactItems.push({ text: cleanPdfText(resume.location) });
  }
  if (resume.linkedin) {
    const rawUrl = resume.linkedin.startsWith('http')
      ? resume.linkedin
      : `https://${resume.linkedin}`;
    const displayUrl = resume.linkedin
      .replace(/^https?:\/\/(www\.)?/, '')
      .replace(/\/$/, '');
    contactItems.push({ text: cleanPdfText(displayUrl), url: rawUrl });
  }

  let curX = marginX;
  contactItems.forEach((item, i) => {
    if (i > 0) {
      doc.setTextColor(190, 190, 195);
      doc.text('|', curX, y);
      curX += doc.getTextWidth('|') + 6;
    }
    if (item.url) {
      doc.setTextColor(0, 113, 227); // Apple Blue clickable link
      doc.textWithLink(item.text, curX, y, { url: item.url });
      const itemW = doc.getTextWidth(item.text);
      addClickablePdfLink(doc, curX, y - 8, itemW, 10, item.url);
      curX += itemW + 6;
    } else {
      doc.setTextColor(70, 70, 75);
      doc.text(item.text, curX, y);
      curX += doc.getTextWidth(item.text) + 6;
    }
  });
  y += m.headerRuleGap;

  // Top header rule
  doc.setDrawColor(29, 29, 31);
  doc.setLineWidth(1.25);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += m.headerAfterGap;

  // Reusable Section Header Function
  function renderSectionHeader(title: string): void {
    checkPageBreak(28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(m.sectionHeaderSize);
    doc.setTextColor(29, 29, 31);
    doc.text(title.toUpperCase(), marginX, y);
    y += m.sectionHeaderUnderlineGap;
    doc.setDrawColor(210, 210, 215);
    doc.setLineWidth(0.5);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += m.sectionHeadingAfterGap;
  }

  // 3. Professional Summary
  if (resume.tailored_summary) {
    renderSectionHeader('Professional Summary');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(m.summarySize);
    doc.setTextColor(35, 35, 38);
    const sanitizedSummary = cleanPdfText(resume.tailored_summary);
    const summaryLines = doc.splitTextToSize(sanitizedSummary, contentWidth);
    doc.text(summaryLines, marginX, y, { lineHeightFactor: m.summaryLineHeight });
    y += summaryLines.length * (m.summarySize * m.summaryLineHeight) + m.sectionBottomGap;
  }

  // 4. Core Competencies & Skills
  if (resume.skills && resume.skills.length > 0) {
    renderSectionHeader('Core Competencies & Key Technical Stack');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(m.skillsSize);
    doc.setTextColor(35, 35, 38);
    const skillsText = resume.skills.map(cleanPdfText).join('  •  ');
    const skillLines = doc.splitTextToSize(skillsText, contentWidth);
    doc.text(skillLines, marginX, y, { lineHeightFactor: m.skillsLineHeight });
    y += skillLines.length * (m.skillsSize * m.skillsLineHeight) + m.sectionBottomGap;
  }

  // 5. Professional Experience
  if (resume.experiences && resume.experiences.length > 0) {
    renderSectionHeader('Professional Experience');
    resume.experiences.forEach((exp) => {
      checkPageBreak(35);
      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(m.expTitleSize);
      doc.setTextColor(29, 29, 31);
      doc.text(cleanPdfText(exp.title), marginX, y);

      // Date Range (right-aligned)
      const rawDate = exp.date_range || '';
      const cleanDate = cleanPdfText(
        rawDate
          .replace(/\s*[·•|/,-]\s*(remote|global operations|regulated fintech|kochi|hyderabad|india|onsite|hybrid).*$/gi, '')
          .replace(/\s*\((remote|global operations|regulated fintech|kochi|hyderabad|india|onsite|hybrid).*\)$/gi, '')
          .trim()
      );
      if (cleanDate) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(m.expMetaSize);
        doc.setTextColor(90, 90, 95);
        const dW = doc.getTextWidth(cleanDate);
        doc.text(cleanDate, pageWidth - marginX - dW, y);
      }
      y += m.expTitleGap;

      // Company line
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(m.expCompanySize);
      doc.setTextColor(0, 113, 227);
      doc.text(cleanPdfText(exp.company), marginX, y);
      if (exp.location) {
        const cW = doc.getTextWidth(cleanPdfText(exp.company));
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(110, 110, 115);
        doc.text(' — ' + cleanPdfText(exp.location), marginX + cW, y);
      }
      y += m.expCompanyGap;

      // Bullets
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(m.bulletSize);
      doc.setTextColor(35, 35, 38);
      const bW = contentWidth - 14;
      exp.bullets.forEach((bullet) => {
        const sanitizedBullet = cleanPdfText(bullet);
        const bLines = doc.splitTextToSize(sanitizedBullet, bW);
        checkPageBreak(bLines.length * (m.bulletSize * m.bulletLineHeight + 2));
        doc.text('•', marginX + 3, y);
        doc.text(bLines, marginX + 12, y, { lineHeightFactor: m.bulletLineHeight });
        y += bLines.length * (m.bulletSize * m.bulletLineHeight) + m.bulletGap;
      });
      y += m.expBottomGap;
    });
  }

  // 6. Selected Projects (if any)
  if (resume.projects && resume.projects.length > 0) {
    renderSectionHeader('Selected Proof of Work & Technical Projects');
    resume.projects.forEach((proj) => {
      checkPageBreak(32);

      // Project Name on left
      const sanitizedName = cleanPdfText(proj.name);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(m.expTitleSize);
      doc.setTextColor(29, 29, 31);
      doc.text(sanitizedName, marginX, y);
      const nameW = doc.getTextWidth(sanitizedName);

      // Role next to project name
      if (proj.role) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(m.expMetaSize);
        doc.setTextColor(70, 70, 75);
        const maxRoleW = contentWidth - nameW - 12;
        const roleText = ` | ${cleanPdfText(proj.role)}`;
        const rLines = doc.splitTextToSize(roleText, Math.max(maxRoleW, 100));
        doc.text(rLines[0] || roleText, marginX + nameW, y);
      }
      y += m.expTitleGap;

      // Project Italic Summary Description (flush with marginX, matching UI)
      if (proj.description) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(m.bulletSize);
        doc.setTextColor(110, 110, 115);
        const dLines = doc.splitTextToSize(cleanPdfText(proj.description), contentWidth);
        doc.text(dLines, marginX, y, { lineHeightFactor: m.bulletLineHeight });
        y += dLines.length * (m.bulletSize * m.bulletLineHeight) + m.bulletGap;
      }

      // Bullets (identical font, indentation, and spacing to Professional Experience)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(m.bulletSize);
      doc.setTextColor(35, 35, 38);
      const bW = contentWidth - 14;
      proj.bullets.forEach((b) => {
        const sanitizedB = cleanPdfText(b);
        const bLines = doc.splitTextToSize(sanitizedB, bW);
        checkPageBreak(bLines.length * (m.bulletSize * m.bulletLineHeight + 2));
        doc.text('•', marginX + 3, y);
        doc.text(bLines, marginX + 12, y, { lineHeightFactor: m.bulletLineHeight });
        y += bLines.length * (m.bulletSize * m.bulletLineHeight) + m.bulletGap;
      });
      y += m.expBottomGap;
    });
  }

  // 7. Education Section
  if (resume.education && resume.education.length > 0) {
    renderSectionHeader('Education');
    resume.education.forEach((edu) => {
      checkPageBreak(22);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(m.eduDegreeSize);
      doc.setTextColor(29, 29, 31);
      doc.text(cleanPdfText(edu.degree), marginX, y);
      if (edu.year) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(m.eduYearSize);
        doc.setTextColor(90, 90, 95);
        const yW = doc.getTextWidth(cleanPdfText(edu.year));
        doc.text(cleanPdfText(edu.year), pageWidth - marginX - yW, y);
      }
      y += m.eduGap;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(m.eduInstSize);
      doc.setTextColor(70, 70, 75);
      doc.text(cleanPdfText(edu.institution), marginX, y);
      y += m.eduInstGap;
    });
    y += m.eduItemBottom;
  }

  // 8. Certifications & Credentials Section (Cleanly separated from Education)
  if (resume.certifications && resume.certifications.length > 0) {
    renderSectionHeader('Certifications & Credentials');
    const certsToShow = resume.certifications.slice(0, 4);
    certsToShow.forEach((c) => {
      checkPageBreak(12);
      const parts = cleanPdfText(c).split(/\s*[|–—]\s*/);
      const title = parts[0]?.trim() || c;
      const issuer = parts.length > 1 ? parts.slice(1).join(' · ').trim() : '';

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(m.certSize);
      doc.setTextColor(35, 35, 38);
      doc.text('•', marginX + 3, y);

      doc.setFont('helvetica', 'bold');
      doc.text(title, marginX + 12, y);

      if (issuer) {
        const titleW = doc.getTextWidth(title);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 105);
        doc.text(` — ${issuer}`, marginX + 12 + titleW, y);
      }
      y += m.certGap;
    });
  }

  return doc;
}

/**
 * Downloads the resume as an ATS-compliant PDF with 100% selectable vector text.
 * Accepts resume data directly or falls back to DOM extraction / active window cache.
 */
export async function downloadResumeAsPdf(
  elementId: string = 'printable-resume-container',
  fileName: string = 'Tailored_ATS_Resume.pdf',
  forceSinglePage: boolean = true,
  resumeData?: TailoredResumeData,
  density?: 'comfortable' | 'balanced' | 'compact'
): Promise<boolean> {
  try {
    // 1. Check if structured resumeData is supplied directly
    let targetResume: TailoredResumeData | undefined = resumeData;

    // 2. Fallback to active window cache
    if (!targetResume && typeof window !== 'undefined' && (window as any).__JOBSTUDIO_ACTIVE_RESUME__) {
      targetResume = (window as any).__JOBSTUDIO_ACTIVE_RESUME__;
    }

    // 3. Fallback: Parse structured data from DOM container if available
    if (!targetResume && typeof document !== 'undefined') {
      const container = document.getElementById(elementId);
      if (container) {
        const fullName = container.querySelector('.resume-header h1')?.textContent?.trim() || 'Candidate Name';
        const emailLink = container.querySelector('a[href^="mailto:"]')?.textContent?.trim() || '';
        const phoneLink = container.querySelector('a[href^="tel:"]')?.textContent?.trim() || '';
        const linkedinLink = container.querySelector('#resume-linkedin-link, a[href*="linkedin"]')?.textContent?.trim() || '';
        const summary = container.querySelector('.resume-section p')?.textContent?.trim() || '';

        targetResume = {
          full_name: fullName,
          email: emailLink,
          phone: phoneLink,
          location: '',
          linkedin: linkedinLink,
          tailored_summary: summary,
          skills: [],
          experiences: [],
          education: [],
          certifications: [],
        };
      }
    }

    // 4. Generate native vector PDF with 100% selectable, parseable text
    if (targetResume) {
      const doc = generateVectorResumePdf(targetResume, {
        fileName,
        forceSinglePage,
        density,
      });
      doc.save(fileName);
      return true;
    }

    // 5. If all else fails, use window.print vector output
    console.warn('Could not locate structured resume data. Opening print dialog for native PDF vector print.');
    window.print();
    return true;
  } catch (error) {
    console.error('Vector PDF generation error:', error);
    window.print();
    return false;
  }
}

export function printResumeVector(): void {
  window.print();
}

export function generatePlainTextResume(resume: TailoredResumeData): string {
  const divider = '--------------------------------------------------';
  const experienceText = resume.experiences
    .map((exp) => {
      const cleanDate = (exp.date_range || '')
        .replace(/\s*[·•|/,-]\s*(remote|global operations|regulated fintech|kochi|hyderabad|india|onsite|hybrid).*$/gi, '')
        .replace(/\s*\((remote|global operations|regulated fintech|kochi|hyderabad|india|onsite|hybrid).*\)$/gi, '')
        .replace(/\s*[·•]\s*.*$/gi, '')
        .trim();

      return `${exp.title.toUpperCase()} | ${exp.company}
${cleanDate}
${exp.bullets.map((b) => `• ${b}`).join('\n')}`;
    })
    .join('\n\n');

  const projectsText =
    resume.projects && resume.projects.length > 0
      ? `\n\n${divider}\nSELECTED PROOF OF WORK & AI/PRODUCT PROJECTS\n${divider}\n` +
        resume.projects
          .map(
            (p) =>
              `${p.name.toUpperCase()}${p.role ? ` | ${p.role}` : ''}
${p.description ? p.description + '\n' : ''}${p.bullets.map((b) => `• ${b}`).join('\n')}`
          )
          .join('\n\n')
      : '';

  const educationText = resume.education
    .map((edu) => `${edu.degree} - ${edu.institution} (${edu.year})`)
    .join('\n');

  const contactParts = [resume.email, resume.phone];
  if (
    resume.location &&
    resume.location.trim().length > 0 &&
    !resume.location.toLowerCase().includes('kochi') &&
    !resume.location.toLowerCase().includes('hyderabad')
  ) {
    contactParts.push(resume.location);
  }
  contactParts.push(`LinkedIn: ${resume.linkedin}`);

  return `${resume.full_name.toUpperCase()}
${contactParts.join(' | ')}

${divider}
PROFESSIONAL SUMMARY
${divider}
${resume.tailored_summary}

${divider}
CORE COMPETENCIES & SKILLS
${divider}
${resume.skills.join(' • ')}

${divider}
PROFESSIONAL EXPERIENCE
${divider}
${experienceText}${projectsText}

${divider}
EDUCATION
${divider}
${educationText}${resume.certifications.length > 0 ? `\n\n${divider}\nCERTIFICATIONS & CREDENTIALS\n${divider}\n` + resume.certifications.slice(0, 4).map((c) => `• ${c}`).join('\n') : ''}`;
}

export function generatePlainTextCoverLetter(coverLetter: CoverLetterData, senderName: string): string {
  return `${coverLetter.recipient}

${coverLetter.subject}

${coverLetter.body_paragraphs.join('\n\n')}

${coverLetter.signoff}`;
}

/**
 * Generates an ATS-compliant, 100% vector-based PDF for tailored cover letters.
 * Standard 8.5" x 11" US Letter format with clean typography, margins, header, and signature.
 */
export function generateVectorCoverLetterPdf(
  coverLetter: CoverLetterData,
  candidateName: string = 'Candidate Name',
  options: PdfExportOptions = {}
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 612 pt
  const pageHeight = doc.internal.pageSize.getHeight(); // 792 pt

  // Standard 0.75 in (54 pt) margins for business correspondence
  const marginX = 54;
  const marginTop = 54;
  const marginBottom = 54;
  const contentWidth = pageWidth - marginX * 2; // 504 pt
  const maxY = pageHeight - marginBottom;

  let y = marginTop;

  function checkPageBreak(neededHeight: number): void {
    if (y + neededHeight > maxY) {
      doc.addPage();
      y = marginTop;
    }
  }

  // 1. Candidate Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(cleanPdfText(candidateName.toUpperCase()), marginX, y);
  y += 22;

  // Header Divider
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(1);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 24;

  // 2. Date
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(today, marginX, y);
  y += 20;

  // 3. Recipient
  if (coverLetter.recipient) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(51, 65, 85); // slate-700
    const recipientLines = coverLetter.recipient.split('\n');
    for (const rLine of recipientLines) {
      const cleanLine = cleanPdfText(rLine.trim());
      if (cleanLine) {
        checkPageBreak(15);
        doc.text(cleanLine, marginX, y);
        y += 15;
      }
    }
    y += 10;
  }

  // 4. Subject Line
  if (coverLetter.subject) {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(15, 23, 42); // slate-900
    const subjectLines = doc.splitTextToSize(cleanPdfText(coverLetter.subject), contentWidth);
    doc.text(subjectLines, marginX, y);
    y += subjectLines.length * 16 + 12;
  }

  // 5. Body Paragraphs
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59); // slate-800
  for (const para of coverLetter.body_paragraphs || []) {
    const cleanPara = cleanPdfText(para.trim());
    if (!cleanPara) continue;

    const paraLines = doc.splitTextToSize(cleanPara, contentWidth);
    const paraHeight = paraLines.length * 15 + 14;
    checkPageBreak(Math.min(paraHeight, 60)); // avoid orphan lines
    doc.text(paraLines, marginX, y, { lineHeightFactor: 1.4 });
    y += paraLines.length * 15 + 12;
  }

  // 6. Sign-off
  if (coverLetter.signoff) {
    checkPageBreak(50);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    const signoffLines = coverLetter.signoff.split('\n');
    for (const sLine of signoffLines) {
      const cleanLine = cleanPdfText(sLine.trim());
      if (cleanLine) {
        doc.text(cleanLine, marginX, y);
        y += 15;
      }
    }
  }

  return doc;
}

/**
 * Downloads the cover letter as an ATS-compliant, vector-based PDF file.
 */
export async function downloadCoverLetterAsPdf(
  coverLetter: CoverLetterData,
  candidateName: string = 'Candidate',
  fileName: string = 'Cover_Letter.pdf'
): Promise<boolean> {
  try {
    const doc = generateVectorCoverLetterPdf(coverLetter, candidateName);
    doc.save(fileName);
    return true;
  } catch (error) {
    console.error('Cover letter vector PDF generation error:', error);
    if (typeof window !== 'undefined') {
      window.print();
    }
    return false;
  }
}
