// ==============================================================================
// MIOS Unlumen UI — MatrixBackground (@/components/ui/unlumen/matrix-background.tsx)
// Inspired by Unlumen UI Matrix / Cyber Grid, powered by canvas & requestAnimationFrame
// ==============================================================================

'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface MatrixBackgroundProps {
  className?: string;
  color?: string;
  speed?: number;
  density?: number;
  opacity?: number;
}

export function MatrixBackground({
  className,
  color = '#00dbe9',
  speed = 40,
  density = 22,
  opacity = 0.15,
}: MatrixBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const columns = Math.floor(width / density);
    const drops: number[] = Array(columns).fill(1);
    const characters = '01MIOSSYSINITCONFIDENCEROASCTR25010SQL';

    let lastTime = 0;
    const interval = 1000 / speed;

    const draw = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(draw);

      if (currentTime - lastTime < interval) return;
      lastTime = currentTime;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = color;
      ctx.font = '11px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        const x = i * density;
        const y = drops[i] * density;

        ctx.globalAlpha = opacity;
        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [color, speed, density, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'pointer-events-none absolute inset-0 z-0 h-full w-full opacity-60 mix-blend-screen',
        className
      )}
    />
  );
}
