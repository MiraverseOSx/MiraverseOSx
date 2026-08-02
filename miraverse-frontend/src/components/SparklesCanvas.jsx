import React, { useEffect, useRef } from 'react';

export default function SparklesCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    let animationFrameId;
    let isVisible = true;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        render();
      } else if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const colors = ['#FFFFFF', '#EDE9FE', '#DDD6FE', '#C7D2FE', '#FCE7F3', '#E0E7FF', '#F5F3FF'];
    // Optimally tuned particle count for smooth 60fps desktop experience
    const numSparkles = width < 768 ? 60 : 110;

    const drawStar = (cx, cy, outerRadius, innerRadius, color, alpha) => {
      let rot = (Math.PI / 2) * 3;
      let step = Math.PI / 4;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < 4; i++) {
        let x = cx + Math.cos(rot) * outerRadius;
        let y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.restore();
    };

    const particles = Array.from({ length: numSparkles }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3.5 + 1.2,
      speedY: Math.random() * 0.7 + 0.3,
      swayAmp: Math.random() * 1.1 + 0.2,
      swayFreq: Math.random() * 0.02 + 0.01,
      phase: Math.random() * Math.PI * 2,
      baseOpacity: Math.random() * 0.5 + 0.3,
      type: Math.random() > 0.45 ? 'star' : 'snow',
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let tick = 0;

    const render = () => {
      if (!isVisible) return;
      ctx.clearRect(0, 0, width, height);
      tick += 0.02;

      particles.forEach((p) => {
        p.y += p.speedY;
        p.phase += p.swayFreq;
        const currentX = p.x + Math.sin(p.phase) * p.swayAmp * 12;
        const currentOpacity = Math.max(
          0.1,
          p.baseOpacity + Math.sin(tick * 1.8 + p.phase) * 0.3
        );

        if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        }

        if (p.type === 'star') {
          drawStar(currentX, p.y, p.size * 1.8, p.size * 0.45, p.color, currentOpacity);
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.arc(currentX, p.y, p.size * 0.55, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = currentOpacity;
          ctx.fill();
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[2]"
    />
  );
}
