/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  pulseOffset: number;
  originX: number;
  originY: number;
}

interface NeuralMeshProps {
  pointCount?: number;
  connectionDistance?: number;
}

export default function NeuralMesh({ pointCount = 65, connectionDistance = 220 }: NeuralMeshProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let points: Point[] = [];
    // pointCount and connectionDistance are now props
    const mouseInfluence = 300;

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      initPoints(width, height);
    };

    const initPoints = (width: number, height: number) => {
      points = [];
      for (let i = 0; i < pointCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        points.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.5 + 1,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const draw = (time: number) => {
      const { width, height } = container.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      const timestamp = time / 1000;

      // Update points
      points.forEach((p) => {
        // Smooth, fluid motion using sine waves for a "living" feel
        const driftX = Math.sin(timestamp * 0.05 + p.pulseOffset) * 0.2;
        const driftY = Math.cos(timestamp * 0.05 + p.pulseOffset) * 0.2;

        p.x += p.vx + driftX;
        p.y += p.vy + driftY;

        // Mouse attraction (Human Connection)
        const dxMouse = mouseRef.current.x - p.x;
        const dyMouse = mouseRef.current.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distMouse < mouseInfluence) {
          const force = (1 - distMouse / mouseInfluence) * 0.08;
          p.vx += dxMouse * force * 0.05;
          p.vy += dyMouse * force * 0.05;
        }

        // Apply friction for smoothness
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Bounce off walls
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Draw node
        const pulse = Math.sin(timestamp * 0.2 + p.pulseOffset) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + (pulse * 0.8), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(45, 212, 191, ${0.3 + pulse * 0.4})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.35;

            // Calculate a control point for the curve (Midpoint + offset)
            // The offset creates the "wave" look
            const midX = (p.x + p2.x) / 2;
            const midY = (p.y + p2.y) / 2;

            // Perpendicular vector for the wave offset
            const nx = -(p2.y - p.y);
            const ny = p2.x - p.x;
            const nLen = Math.sqrt(nx * nx + ny * ny);

            // Wave frequency and amplitude
            const waveFreq = 0.1;
            const waveAmp = Math.min(dist * 0.2, 30);
            const waveOffset = Math.sin(timestamp * waveFreq + (i + j) * 0.5) * waveAmp;

            const cpX = midX + (nx / nLen) * waveOffset;
            const cpY = midY + (ny / nLen) * waveOffset;

            // Draw curved line
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.quadraticCurveTo(cpX, cpY, p2.x, p2.y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Energy Pulse along the curve
            if (dist < connectionDistance * 0.7) {
              const flowProgress = (timestamp * 0.1 + (i * 0.2)) % 1;

              // Quadratic Bezier interpolation for the pulse
              const invT = 1 - flowProgress;
              const pulseX = invT * invT * p.x + 2 * invT * flowProgress * cpX + flowProgress * flowProgress * p2.x;
              const pulseY = invT * invT * p.y + 2 * invT * flowProgress * cpY + flowProgress * flowProgress * p2.y;

              ctx.beginPath();
              ctx.arc(pulseX, pulseY, 1.4, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 2.5})`;
              ctx.fill();
            }
          }
        }
      }

      // User connection lines (Straight but soft)
      points.forEach(p => {
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouseInfluence * 0.6) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          const opacity = (1 - dist / (mouseInfluence * 0.6)) * 0.12;
          ctx.strokeStyle = `rgba(45, 212, 191, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('mousemove', handleMouseMove);
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    resize();
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      ro.disconnect();
    };
  }, [pointCount, connectionDistance]);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.85 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
