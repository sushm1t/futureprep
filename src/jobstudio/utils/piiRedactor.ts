// PII Redactor & Privacy Shield Utility
// Inspired by Freehire's internal/candidate/pii deterministic redactor
// Ensures candidates can safely share resumes, request warm referrals, or post portfolio samples
// without leaking sensitive contact information (phone, physical address, or personal email).

import { TailoredResumeData } from '../data/defaultData';

export interface PiiMaskOptions {
  maskPhone?: boolean;
  maskEmail?: boolean;
  maskLocation?: boolean;
  maskName?: boolean;
}

const DEFAULT_OPTIONS: PiiMaskOptions = {
  maskPhone: true,
  maskEmail: true,
  maskLocation: true,
  maskName: false,
};

/**
 * Mask an email address into privacy-safe format (e.g., alex.rivera@gmail.com -> a***a@***.com)
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}***@***.${domain.split('.').pop() || 'com'}`;
  }
  return `${local[0]}***${local[local.length - 1]}@***.${domain.split('.').pop() || 'com'}`;
}

/**
 * Mask a phone number into privacy-safe format (e.g., +1 (555) 234-5678 -> +1 (***) ***-5678)
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return phone;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***-***-****';
  const lastFour = digits.slice(-4);
  const countryCode = phone.startsWith('+') ? phone.split(' ')[0] + ' ' : '';
  return `${countryCode}(***) ***-${lastFour}`;
}

/**
 * Mask full street addresses while preserving city and state/country for recruiter context
 * e.g., "1424 Market St, Apt 4B, San Francisco, CA 94103" -> "San Francisco, CA (Exact address masked)"
 */
export function maskAddress(address: string): string {
  if (!address) return address;
  const parts = address.split(',').map((p) => p.trim());
  if (parts.length >= 2) {
    // Keep city and state/country only
    const cityState = parts.slice(-2).join(', ');
    return `${cityState} (Exact address masked for privacy)`;
  }
  return `${address} (Address masked for privacy)`;
}

/**
 * Returns a cloned TailoredResumeData with PII masked according to options
 */
export function maskResumePii(
  resume: TailoredResumeData,
  options: PiiMaskOptions = DEFAULT_OPTIONS
): TailoredResumeData {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  return {
    ...resume,
    name: opts.maskName ? `Candidate [${resume.role || 'Specialist'}]` : resume.name,
    email: opts.maskEmail ? maskEmail(resume.email) : resume.email,
    phone: opts.maskPhone ? maskPhoneNumber(resume.phone) : resume.phone,
    location: opts.maskLocation ? maskAddress(resume.location) : resume.location,
  };
}

/**
 * Mask PII inside arbitrary plain text or referral messages
 */
export function maskPlainTextPii(text: string, options: PiiMaskOptions = DEFAULT_OPTIONS): string {
  if (!text) return text;
  let result = text;

  // Mask emails
  if (options.maskEmail) {
    result = result.replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      (match) => maskEmail(match)
    );
  }

  // Mask phone numbers
  if (options.maskPhone) {
    result = result.replace(
      /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      (match) => maskPhoneNumber(match)
    );
  }

  return result;
}
