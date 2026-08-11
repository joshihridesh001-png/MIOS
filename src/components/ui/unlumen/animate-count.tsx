// ==============================================================================
// MIOS Unlumen UI — AnimateCount (@/components/ui/unlumen/animate-count.tsx)
// Inspired by Unlumen UI Animate Digits / Animate Count, powered by anime.js v4
// Governed by ADR-001 (PestControl OS Executive Suite aesthetic)
// ==============================================================================

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import { cn } from '@/lib/utils';

export interface AnimateCountProps {
  value: number;
  format?: 'currency' | 'percent' | 'number' | 'raw';
  decimals?: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimateCount({
  value,
  format = 'number',
  decimals = 0,
  duration = 1200,
  className,
  prefix = '',
  suffix = '',
}: AnimateCountProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [displayValue, setDisplayValue] = useState<string>('');
  const prevValueRef = useRef<number>(0);

  const formatValue = (num: number): string => {
    if (format === 'currency') {
      return (
        prefix +
        '₹' +
        num.toLocaleString('en-IN', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }) +
        suffix
      );
    }
    if (format === 'percent') {
      return (
        prefix +
        num.toLocaleString('en-IN', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }) +
        '%' +
        suffix
      );
    }
    if (format === 'number') {
      return (
        prefix +
        num.toLocaleString('en-IN', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }) +
        suffix
      );
    }
    return prefix + num.toFixed(decimals) + suffix;
  };

  useEffect(() => {
    const startVal = prevValueRef.current;
    const endVal = value || 0;
    prevValueRef.current = endVal;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(formatValue(endVal));
      return;
    }

    const counterObj = { val: startVal };

    const anim = animate(counterObj, {
      val: endVal,
      duration,
      ease: 'outExpo',
      onUpdate: () => {
        setDisplayValue(formatValue(counterObj.val));
      },
    });

    return () => {
      anim.pause();
    };
  }, [value, format, decimals, duration, prefix, suffix]);

  return (
    <span
      ref={spanRef}
      className={cn(
        'tabular-nums font-sans font-bold transition-colors duration-200',
        className
      )}
    >
      {displayValue || formatValue(value || 0)}
    </span>
  );
}
