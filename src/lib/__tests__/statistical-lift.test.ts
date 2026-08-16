import { describe, it, expect } from 'vitest'
import { calculateLift } from '@/lib/utils/statistical-lift'

describe('calculateLift', () => {
  describe('higher_is_better (default)', () => {
    it('calculates positive lift correctly', () => {
      // Control CVR = 1.80%, Variant CVR = 2.40% -> Lift = +33.3%
      const result = calculateLift(1.80, 2.40)
      expect(result.liftPercent).toBeCloseTo(33.333, 1)
      expect(result.absoluteDifference).toBeCloseTo(0.6, 2)
      expect(result.isImprovement).toBe(true)
      expect(result.displayLabel).toBe('+33.3%')
    })

    it('calculates large positive lift correctly', () => {
      // Control CVR = 1.80%, Variant CVR = 2.70% -> Lift = +50.0%
      const result = calculateLift(1.80, 2.70)
      expect(result.liftPercent).toBeCloseTo(50.0, 1)
      expect(result.isImprovement).toBe(true)
      expect(result.displayLabel).toBe('+50.0%')
    })

    it('calculates negative lift correctly', () => {
      // Control CVR = 2.00%, Variant CVR = 1.50% -> Lift = -25.0%
      const result = calculateLift(2.00, 1.50)
      expect(result.liftPercent).toBeCloseTo(-25.0, 1)
      expect(result.absoluteDifference).toBeCloseTo(-0.5, 2)
      expect(result.isImprovement).toBe(false)
      expect(result.displayLabel).toBe('-25.0%')
    })

    it('returns zero lift when values are equal', () => {
      const result = calculateLift(5.0, 5.0)
      expect(result.liftPercent).toBeCloseTo(0, 1)
      expect(result.isImprovement).toBe(false)
      expect(result.displayLabel).toBe('0.0%')
    })
  })

  describe('lower_is_better', () => {
    it('treats negative lift as improvement for cost metrics', () => {
      // CPC dropped from 50 to 40 -> -20% lift, but that is an improvement
      const result = calculateLift(50, 40, 'lower_is_better')
      expect(result.liftPercent).toBeCloseTo(-20.0, 1)
      expect(result.isImprovement).toBe(true)
      expect(result.displayLabel).toBe('-20.0%')
    })

    it('treats positive lift as regression for cost metrics', () => {
      // CAC increased from 100 to 130 -> +30% lift, but that is bad
      const result = calculateLift(100, 130, 'lower_is_better')
      expect(result.liftPercent).toBeCloseTo(30.0, 1)
      expect(result.isImprovement).toBe(false)
    })
  })

  describe('zero control (division guard)', () => {
    it('returns null lift and "n/a" label when control is 0', () => {
      const result = calculateLift(0, 2.5)
      expect(result.liftPercent).toBeNull()
      expect(result.absoluteDifference).toBe(2.5)
      expect(result.isImprovement).toBeNull()
      expect(result.displayLabel).toBe('n/a')
    })
  })

  describe('null/undefined inputs', () => {
    it('handles null control', () => {
      const result = calculateLift(null, 2.5)
      expect(result.liftPercent).toBeNull()
      expect(result.absoluteDifference).toBeNull()
      expect(result.isImprovement).toBeNull()
      expect(result.displayLabel).toBe('n/a')
    })

    it('handles null variant', () => {
      const result = calculateLift(1.8, null)
      expect(result.liftPercent).toBeNull()
      expect(result.absoluteDifference).toBeNull()
      expect(result.displayLabel).toBe('n/a')
    })

    it('handles undefined inputs', () => {
      const result = calculateLift(undefined, undefined)
      expect(result.liftPercent).toBeNull()
      expect(result.displayLabel).toBe('n/a')
    })

    it('handles both null', () => {
      const result = calculateLift(null, null)
      expect(result.liftPercent).toBeNull()
      expect(result.displayLabel).toBe('n/a')
    })
  })
})
