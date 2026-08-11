// ==============================================================================
// MIOS Unlumen UI — MotionAccordion (@/components/ui/unlumen/motion-accordion.tsx)
// Inspired by Unlumen UI Motion FAQs Accordion, powered by anime.js v4
// ==============================================================================

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { animate } from 'animejs';
import { cn } from '@/lib/utils';
import { CaretDown } from "@phosphor-icons/react";

export interface MotionAccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  badgeText?: string;
}

export function MotionAccordion({
  title,
  children,
  defaultOpen = false,
  className,
  headerClassName,
  contentClassName,
  badgeText,
}: MotionAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current || !iconRef.current) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      contentRef.current.style.display = isOpen ? 'block' : 'none';
      contentRef.current.style.height = 'auto';
      contentRef.current.style.opacity = isOpen ? '1' : '0';
      return;
    }

    if (isOpen) {
      contentRef.current.style.display = 'block';
      const fullHeight = contentRef.current.scrollHeight;

      animate(contentRef.current, {
        height: [0, fullHeight],
        opacity: [0, 1],
        duration: 350,
        ease: 'outCubic',
        onComplete: () => {
          if (contentRef.current) contentRef.current.style.height = 'auto';
        },
      });

      animate(iconRef.current, {
        rotate: 180,
        duration: 300,
        ease: 'outQuad',
      });
    } else {
      const currentHeight = contentRef.current.scrollHeight;

      animate(contentRef.current, {
        height: [currentHeight, 0],
        opacity: [1, 0],
        duration: 300,
        ease: 'inCubic',
        onComplete: () => {
          if (contentRef.current) contentRef.current.style.display = 'none';
        },
      });

      animate(iconRef.current, {
        rotate: 0,
        duration: 300,
        ease: 'outQuad',
      });
    }
  }, [isOpen]);

  return (
    <div className={cn('border border-border/60 bg-card/90 transition-colors', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between px-5 py-4 text-left font-sans text-sm font-bold uppercase tracking-wider text-foreground transition-colors hover:text-[#00dbe9]',
          headerClassName
        )}
      >
        <div className="flex items-center gap-3">
          <span>{title}</span>
          {badgeText && (
            <span className="rounded-xl border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-sans font-bold text-primary">
              {badgeText}
            </span>
          )}
        </div>
        <div ref={iconRef} className="text-muted-foreground">
          <CaretDown weight="duotone" className="size-4" />
        </div>
      </button>
      <div
        ref={contentRef}
        style={{ display: defaultOpen ? 'block' : 'none', overflow: 'hidden' }}
        className={cn('border-t border-border/40 px-5 py-4', contentClassName)}
      >
        {children}
      </div>
    </div>
  );
}
