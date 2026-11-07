import { describe, it, expect } from 'vitest';
import { quickFitTier } from '@/jobstudio/utils/profileMatch';
describe('quickFitTier', () => {
  it('Strong at 65+', () => expect(quickFitTier(65).label).toBe('Strong fit'));
  it('Good at 52-64', () => { expect(quickFitTier(52).label).toBe('Good fit'); expect(quickFitTier(64).label).toBe('Good fit'); });
  it('Possible at 40-51', () => { expect(quickFitTier(40).label).toBe('Possible fit'); expect(quickFitTier(51).label).toBe('Possible fit'); });
  it('Low below 40', () => expect(quickFitTier(39).label).toBe('Low fit'));
});
