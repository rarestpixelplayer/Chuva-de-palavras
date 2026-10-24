import React, { useEffect, useRef } from 'react';
import { SkyTheme } from '../types/game';

interface SkyParticlesProps {
  enabled: boolean;
  theme?: SkyTheme;
}

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  drift: number;
  opacity: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

export const SkyParticles: React.FC<SkyParticlesProps> = ({ enabled, theme = 'day' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Cria flocos de neve
    const snowflakeCount = Math.floor(Math.min(50, width / 25));
    const flakes: Snowflake[] = Array.from({ length: snowflakeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1 + Math.random() * 2.2,
      speed: 0.4 + Math.random() * 1.1,
      drift: (Math.random() - 0.5) * 0.6,
      opacity: 0.3 + Math.random() * 0.6,
    }));

    // Estrela cadente
    const stars: ShootingStar[] = [];
    const spawnShootingStar = () => {
      stars.push({
        x: Math.random() * (width * 0.8),
        y: Math.random() * (height * 0.4),
        length: 60 + Math.random() * 90,
        speed: 12 + Math.random() * 8,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2, // ~45 graus
        opacity: 1,
        active: true,
      });
    };

    let lastStarTime = performance.now();

    const loop = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Sorteia estrela cadente a cada 3 a 7 segundos
      if (time - lastStarTime > 4000 + Math.random() * 3000) {
        lastStarTime = time;
        spawnShootingStar();
      }

      // Desenha Neve
      flakes.forEach((f) => {
        f.y += f.speed;
        f.x += f.drift;

        if (f.y > height) {
          f.y = -5;
          f.x = Math.random() * width;
        }
        if (f.x > width) f.x = 0;
        if (f.x < 0) f.x = width;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Desenha e atualiza estrelas cadentes
      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        if (!s.active) {
          stars.splice(i, 1);
          continue;
        }

        const headX = s.x;
        const headY = s.y;
        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.8, `rgba(224, 242, 254, ${s.opacity * 0.7})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${s.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Cabeça brilhante da estrela
        ctx.beginPath();
        ctx.arc(headX, headY, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#38bdf8';
        ctx.fill();
        ctx.shadowBlur = 0;

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity -= 0.018;

        if (s.opacity <= 0 || s.x > width || s.y > height) {
          s.active = false;
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled, theme]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
};
