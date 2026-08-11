// ==============================================================================
// MIOS Unlumen UI — TiltCard & HoverFeatureCard (@/components/ui/unlumen/tilt-card.tsx)
// Inspired by Unlumen UI Tilt Card / Hover Feature Cards, powered by anime.js v4
// ==============================================================================

'use client';

import React, { useRef, useState } from 'react';
import { animate } from 'animejs';
import { cn } from '@/lib/utils';

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  glowColor?: string;
  disabled?: boolean;
}

export function TiltCard({
  children,
  className,
  maxTilt = 6,
  scale = 1.01,
  glowColor = 'rgba(0, 219, 233, 0.18)',
  disabled = false,
  ...props
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    setCursorPos({ x: percentX, y: percentY });
    setHovered(true);

    animate(cardRef.current, {
      rotateX,
      rotateY,
      scale,
      duration: 350,
      ease: 'outQuad',
    });
  };

  const handleMouseLeave = () => {
    if (disabled || !cardRef.current) return;
    setHovered(false);

    animate(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 600,
      ease: 'outQuad',
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/60 bg-card/90 transition-colors',
        hovered && 'border-primary/50 shadow-[0_0_20px_rgba(0,219,233,0.12)]',
        className
      )}
      {...props}
    >
      {/* Interactive Cursor Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${cursorPos.x}% ${cursorPos.y}%, ${glowColor}, transparent 70%)`,
          zIndex: 0,
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
