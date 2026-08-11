// ==============================================================================
// MIOS Unlumen UI — TextReveal (@/components/ui/unlumen/text-reveal.tsx)
// Inspired by Unlumen UI Dia Text Reveal / Smart Animate Text, powered by anime.js v4
// ==============================================================================

'use client';

import React, { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { cn } from '@/lib/utils';

export interface TextRevealProps {
  text: string;
  className?: string;
  mode?: 'word' | 'char';
  staggerDelay?: number;
  duration?: number;
  as?: React.ElementType;
  onComplete?: () => void;
}

export function TextReveal({
  text,
  className,
  mode = 'word',
  staggerDelay = 35,
  duration = 500,
  as: Component = 'span',
  onComplete,
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const elements = containerRef.current.querySelectorAll('.text-reveal-token');
    if (elements.length === 0) return;

    if (prefersReducedMotion) {
      elements.forEach((el) => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'none';
        (el as HTMLElement).style.filter = 'blur(0px)';
      });
      return;
    }

    const anim = animate(elements, {
      opacity: [0, 1],
      translateY: [8, 0],
      filter: ['blur(4px)', 'blur(0px)'],
      delay: stagger(staggerDelay),
      duration,
      ease: 'outCubic',
      onComplete: () => {
        onComplete?.();
      },
    });

    return () => {
      anim.revert();
    };
  }, [text, mode, staggerDelay, duration, onComplete]);

  const tokens = mode === 'word' ? text.split(' ') : text.split('');

  return (
    <Component ref={containerRef} className={cn('inline-flex flex-wrap gap-x-1.5', className)}>
      {tokens.map((token, index) => (
        <span
          key={index}
          className="text-reveal-token inline-block opacity-0"
          style={{ willChange: 'opacity, transform, filter' }}
        >
          {token === ' ' ? '\u00A0' : token}
        </span>
      ))}
    </Component>
  );
}
