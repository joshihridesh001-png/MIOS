import { describe, it, expect } from 'vitest'
import { checkSampleSizeSufficiency, getPlanningSuggestion } from '../utils/sample-size-calculator'

describe('checkSampleSizeSufficiency', () => {
  const control = { impressions: 1000, conversions: 50, customers: 10 };
  const variants = [{ impressions: 1200, conversions: 60, customers: 12 }];

  it('checks CTR correctly based on lowest impressions', () => {
    const result = checkSampleSizeSufficiency('ctr', control, variants);
    // lowest impressions is 1000
    expect(result.isSufficient).toBe(false);
    expect(result.warningLevel).toBe('low');
    expect(result.current).toBe(1000);
    expect(result.recommended).toBe(1500);
  });

  it('checks CTR correctly for high warning', () => {
    const lowTrafficControl = { ...control, impressions: 400 };
    const result = checkSampleSizeSufficiency('ctr', lowTrafficControl, variants);
    expect(result.warningLevel).toBe('high');
  });

  it('checks CTR correctly for sufficient', () => {
    const highControl = { ...control, impressions: 1500 };
    const highVariant = { ...variants[0], impressions: 2000 };
    const result = checkSampleSizeSufficiency('ctr', highControl, [highVariant]);
    expect(result.isSufficient).toBe(true);
    expect(result.warningLevel).toBe('none');
  });

  it('checks CVR correctly based on lowest conversions', () => {
    // control conversions = 50, recommended = 60
    const result = checkSampleSizeSufficiency('cvr', control, variants);
    expect(result.isSufficient).toBe(false);
    expect(result.warningLevel).toBe('low');
    expect(result.current).toBe(50);
    expect(result.recommended).toBe(60);
  });

  it('checks CAC correctly based on lowest customers', () => {
    const highCustomersControl = { ...control, customers: 80 };
    const highCustomersVariant = { ...variants[0], customers: 75 };
    const result = checkSampleSizeSufficiency('cac', highCustomersControl, [highCustomersVariant]);
    expect(result.isSufficient).toBe(true);
    expect(result.warningLevel).toBe('none');
    expect(result.current).toBe(75);
    expect(result.recommended).toBe(75);
  });
});

describe('getPlanningSuggestion', () => {
  it('returns suggestion for ctr', () => {
    expect(getPlanningSuggestion('ctr')).toContain('1,000–2,000 impressions');
  });

  it('returns suggestion for cac', () => {
    expect(getPlanningSuggestion('cac')).toContain('50–100 customers');
  });
});
