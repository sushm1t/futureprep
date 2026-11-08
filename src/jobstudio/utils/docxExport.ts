// @ts-nocheck -- ported verbatim from the original project
import { TailoredResumeData, CoverLetterData } from '../data/defaultData';

/**
 * Escapes XML / HTML entities for clean WordprocessingML rendering
 */
function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Exports tailored resume as a clean, ATS-compliant Microsoft Word (.docx / .doc) document.
 * Built with native Word XML styling that opens identically across Microsoft Word, Google Docs,
 * Apple Pages, and enterprise ATS resume parsers (Greenhouse, Lever, Workday, Taleo, Ashby).
 */
export function downloadResumeAsDocx(
  resume: TailoredResumeData,
  fileName: string = 'Resume.docx'
): void {
  const safeFileName = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;

  const contactLine = [
    resume.phone,
    resume.email,
    resume.location,
    resume.linkedin ? 'LinkedIn: ' + resume.linkedin : '',
  ]
    .filter(Boolean)
    .join('  |  ');

  // Build experience sections
  const experiencesHtml = (resume.experiences || [])
    .map((exp) => {
      const bulletsHtml = (exp.bullets || [])
        .map(
          (b) =>
            `<li style="margin-bottom: 4pt; line-height: 1.35; font-size: 10pt; color: #222222;">${escapeXml(
              b
            )}</li>`
        )
        .join('');

      return `
        <div style="margin-bottom: 12pt;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 2pt;">
            <tr>
              <td style="font-weight: bold; font-size: 11pt; color: #111111; text-align: left;">
                ${escapeXml(exp.title)}
              </td>
              <td style="font-size: 10pt; color: #555555; text-align: right; white-space: nowrap;">
                ${escapeXml(exp.date_range)}
              </td>
            </tr>
            <tr>
              <td style="font-size: 10pt; color: #333333; font-style: italic; text-align: left;">
                ${escapeXml(exp.company)}
              </td>
              <td style="font-size: 9.5pt; color: #777777; text-align: right;">
                ${exp.location ? escapeXml(exp.location) : ''}
              </td>
            </tr>
          </table>
          <ul style="margin: 2pt 0 0 16pt; padding: 0; list-style-type: disc;">
            ${bulletsHtml}
          </ul>
        </div>
      `;
    })
    .join('');

  // Build skills
  const skillsList = (resume.skills || []).join('  •  ');

  // Build certifications
  const certsList = (resume.certifications || []).map((c) => `<li>${escapeXml(c)}</li>`).join('');

  // Build education
  const educationHtml = (resume.education || [])
    .map(
      (edu) => `
      <p style="font-size: 10pt; margin-bottom: 4pt;">
        <strong>${escapeXml(edu.institution || '')}</strong>${edu.degree ? ` — ${escapeXml(edu.degree)}` : ''}
        ${edu.year ? ` <span style="color: #64748b;">(${escapeXml(edu.year)})</span>` : ''}
      </p>
    `
    )
    .join('');

  // Assemble Complete Word-Compatible HTML document
  const wordDocumentHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${escapeXml(resume.full_name)} - Resume</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: 8.5in 11.0in;
      margin: 0.5in 0.5in 0.5in 0.5in;
      mso-header-margin: 0.2in;
      mso-footer-margin: 0.2in;
    }
    body {
      font-family: Calibri, 'Segoe UI', Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.35;
      color: #222222;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }
    h1 {
      font-size: 18pt;
      font-weight: bold;
      color: #111111;
      margin: 0 0 2pt 0;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
    }
    h2 {
      font-size: 11pt;
      font-weight: bold;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
      border-bottom: 1pt solid #cbd5e1;
      padding-bottom: 2pt;
      margin-top: 14pt;
      margin-bottom: 6pt;
    }
    p {
      margin: 0 0 6pt 0;
    }
    ul {
      margin: 2pt 0 6pt 16pt;
      padding: 0;
    }
    li {
      margin-bottom: 3pt;
    }
    .header-bar {
      text-align: center;
      margin-bottom: 12pt;
      border-bottom: 1.5pt solid #0f172a;
      padding-bottom: 8pt;
    }
    .contact-info {
      font-size: 9.5pt;
      color: #475569;
      margin-top: 3pt;
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <h1>${escapeXml(resume.full_name)}</h1>
    <div class="contact-info">
      ${escapeXml(contactLine)}
    </div>
  </div>

  <h2>PROFESSIONAL SUMMARY</h2>
  <p style="text-align: justify; font-size: 10pt; line-height: 1.4; color: #1e293b;">
    ${escapeXml(resume.tailored_summary)}
  </p>

  <h2>CORE COMPETENCIES &amp; DOMAIN EXPERTISE</h2>
  <p style="font-size: 9.5pt; line-height: 1.5; color: #1e293b; margin-bottom: 10pt;">
    ${escapeXml(skillsList)}
  </p>

  <h2>PROFESSIONAL EXPERIENCE</h2>
  ${experiencesHtml}

  ${
    resume.certifications && resume.certifications.length > 0
      ? `
  <h2>VERIFIED CERTIFICATIONS &amp; CREDENTIALS</h2>
  <ul style="margin: 2pt 0 8pt 16pt; font-size: 9.5pt; color: #1e293b;">
    ${certsList}
  </ul>
  `
      : ''
  }

  ${
    resume.education && resume.education.length > 0
      ? `
  <h2>EDUCATION</h2>
  ${educationHtml}
  `
      : ''
  }
</body>
</html>
  `.trim();

  // Create Blob with official Word MIME type
  const blob = new Blob(['\ufeff', wordDocumentHtml], {
    type: 'application/vnd.ms-word;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = safeFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a clean ATS-friendly plain text (.txt) file formatted for direct copy-pasting
 */
export function downloadResumeAsPlainText(
  resume: TailoredResumeData,
  fileName: string = 'Resume.txt'
): void {
  const safeFileName = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;

  const contactLine = [
    resume.phone,
    resume.email,
    resume.location,
    resume.linkedin,
  ]
    .filter(Boolean)
    .join(' | ');

  const experiencesText = (resume.experiences || [])
    .map((exp) => {
      const bullets = (exp.bullets || []).map((b) => `  * ${b}`).join('\n');
      return `${exp.title.toUpperCase()} | ${exp.company} (${exp.date_range})\nLocation: ${exp.location || 'Remote'}\n${bullets}`;
    })
    .join('\n\n');

  const skillsText = (resume.skills || []).join(' | ');
  const certsText = (resume.certifications || []).map((c) => `  * ${c}`).join('\n');
  const eduText = (resume.education || [])
    .map((e) => `  * ${e.institution} - ${e.degree} (${e.year || ''})`)
    .join('\n');

  const textContent = `
${resume.full_name.toUpperCase()}
${contactLine}
================================================================================
PROFESSIONAL SUMMARY
--------------------------------------------------------------------------------
${resume.tailored_summary}

================================================================================
CORE COMPETENCIES & TECHNICAL SKILLS
--------------------------------------------------------------------------------
${skillsText}

================================================================================
PROFESSIONAL EXPERIENCE
--------------------------------------------------------------------------------
${experiencesText}

================================================================================
CERTIFICATIONS & CREDENTIALS
--------------------------------------------------------------------------------
${certsText}

================================================================================
EDUCATION
--------------------------------------------------------------------------------
${eduText}
  `.trim();

  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = safeFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports tailored cover letter as a clean, professionally formatted Microsoft Word (.docx) document.
 * Adheres to standard business letter typography with 1.0-inch margins, clear recipient and subject
 * blocks, justified paragraphs, and sign-off.
 */
export function downloadCoverLetterAsDocx(
  coverLetter: CoverLetterData,
  candidateName: string = 'Candidate Name',
  fileName: string = 'Cover_Letter.docx'
): void {
  const safeFileName = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`;
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const recipientHtml = escapeXml(coverLetter.recipient || '')
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((line) => `<div style="margin-bottom: 2pt;">${line}</div>`)
    .join('');

  const paragraphsHtml = (coverLetter.body_paragraphs || [])
    .map(
      (p) =>
        `<p style="font-size: 11pt; line-height: 1.5; color: #1e293b; margin-bottom: 12pt; text-align: justify;">${escapeXml(
          p
        )}</p>`
    )
    .join('');

  const signoffHtml = escapeXml(coverLetter.signoff || '')
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .map((line) => `<div style="margin-bottom: 2pt;">${line}</div>`)
    .join('');

  const wordDocumentHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${escapeXml(candidateName)} - Cover Letter</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 8.5in 11.0in;
      margin: 1.0in 1.0in 1.0in 1.0in;
      mso-header-margin: 0.5in;
      mso-footer-margin: 0.5in;
      mso-paper-source: 0;
    }
    div.Section1 {
      page: Section1;
    }
    body {
      font-family: 'Calibri', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.45;
      color: #1e293b;
    }
    h1 {
      font-size: 20pt;
      font-weight: bold;
      color: #0f172a;
      margin: 0 0 4pt 0;
      letter-spacing: -0.5pt;
    }
    .date {
      font-size: 10.5pt;
      color: #64748b;
      margin: 14pt 0;
    }
    .recipient {
      font-size: 11pt;
      line-height: 1.4;
      color: #334155;
      margin-bottom: 16pt;
    }
    .subject {
      font-size: 12pt;
      font-weight: bold;
      color: #0f172a;
      margin: 16pt 0 14pt 0;
    }
    .signoff {
      font-size: 11pt;
      line-height: 1.4;
      color: #0f172a;
      margin-top: 20pt;
    }
    hr {
      border: 0;
      border-top: 1px solid #cbd5e1;
      margin: 8pt 0 14pt 0;
    }
  </style>
</head>
<body>
  <div class="Section1">
    <h1>${escapeXml(candidateName.toUpperCase())}</h1>
    <hr />
    <div class="date">${escapeXml(today)}</div>
    <div class="recipient">${recipientHtml}</div>
    ${coverLetter.subject ? `<div class="subject">${escapeXml(coverLetter.subject)}</div>` : ''}
    ${paragraphsHtml}
    <div class="signoff">${signoffHtml}</div>
  </div>
</body>
</html>
  `.trim();

  const blob = new Blob(['\ufeff', wordDocumentHtml], {
    type: 'application/vnd.ms-word;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = safeFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
