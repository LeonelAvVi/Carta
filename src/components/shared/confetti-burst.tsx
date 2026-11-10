"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  color: string;
  shape: "rect" | "circle";
};

const BRAND_COLORS = ["#5D44FF", "#7B61FF", "#6D44FF", "#C4B5FD", "#111827", "#FBBF24"];
const PARTICLE_COUNT = 160;
const DURATION_MS = 4200;
const GRAVITY = 0.12;
const DRAG = 0.992;

function createParticle(width: number, height: number, fromLeft: boolean): Particle {
  const angle = fromLeft
    ? (-Math.PI / 3) + (Math.random() - 0.5) * 0.6
    : (-2 * Math.PI) / 3 + (Math.random() - 0.5) * 0.6;
  const speed = 9 + Math.random() * 9;

  return {
    x: fromLeft ? 0 : width,
    y: height * 0.75,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: 6 + Math.random() * 6,
    rotation: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.3,
    color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
    shape: Math.random() > 0.3 ? "rect" : "circle",
  };
}

/** Lluvia de confeti con colores de marca; se dibuja una vez y se limpia sola. */
export function ConfettiBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) =>
      createParticle(width, height, i % 2 === 0)
    );

    const start = performance.now();
    let frame = 0;

    const draw = (now: number) => {
      const elapsed = now - start;
      const fade = Math.max(0, 1 - Math.max(0, elapsed - DURATION_MS * 0.6) / (DURATION_MS * 0.4));

      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = fade;

      for (const p of particles) {
        p.vx *= DRAG;
        p.vy = p.vy * DRAG + GRAVITY;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.spin;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (elapsed < DURATION_MS) {
        frame = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      aria-hidden
    />
  );
}
