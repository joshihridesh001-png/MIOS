// ==============================================================================
// MIOS Unlumen UI — AnimatedList (@/components/ui/unlumen/animated-list.tsx)
// Inspired by Unlumen UI Animated List, powered by anime.js v4 stagger
// ==============================================================================

'use client';

import React, { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import type { AnimationParams } from 'animejs';
import { cn } from '@/lib/utils';

export interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  as?: React.ElementType;
}

export function AnimatedList({
  children,
  className,
  staggerDelay = 50,
  duration = 600,
  direction = 'up',
  distance = 18,
  as: Component = 'div',
}: AnimatedListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const elements = Array.from(containerRef.current.children);
    if (elements.length === 0) return;

    if (prefersReducedMotion) {
      elements.forEach((el) => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'none';
      });
      return;
    }

    const animOpts: AnimationParams = {
      opacity: [0, 1],
      delay: stagger(staggerDelay),
      duration,
      ease: 'outQuart',
      ...(direction === 'up' && { translateY: [distance, 0] }),
      ...(direction === 'down' && { translateY: [-distance, 0] }),
      ...(direction === 'left' && { translateX: [distance, 0] }),
      ...(direction === 'right' && { translateX: [-distance, 0] }),
    };

    const anim = animate(elements, animOpts);

    return () => {
      anim.revert();
    };
  }, [children, staggerDelay, duration, direction, distance]);

  return (
    <Component ref={containerRef} className={cn(className)}>
      {children}
    </Component>
  );
}
