import React, { useEffect, useRef } from 'react';

export default function SparklesCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#FFFFFF', '#F5EEF8', '#E8DAEF', '#FADBD8', '#EBDEF0', '#D5F5E3'];
    const numSparkles = 95;

    // Helper to draw a 4-point star sparkle ✨
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
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    };

    // Initialize particles (Snowy blur motes & stars)
    const particles = Array.from({ length: numSparkles }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 1.5,
      speedY: Math.random() * 0.9 + 0.4,
      swayAmp: Math.random() * 1.2 + 0.3,
      swayFreq: Math.random() * 0.025 + 0.01,
      phase: Math.random() * Math.PI * 2,
      baseOpacity: Math.random() * 0.6 + 0.3,
      twinkleSpeed: Math.random() * 0.03 + 0.01,
      type: Math.random() > 0.4 ? 'star' : 'snow',
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick += 0.02;

      particles.forEach((p) => {
        p.y += p.speedY;
        p.phase += p.swayFreq;
        const currentX = p.x + Math.sin(p.phase) * p.swayAmp * 15;
        const currentOpacity = Math.max(
          0.1,
          p.baseOpacity + Math.sin(tick * 2 + p.phase) * 0.35
        );

        // Reset if off bottom screen
        if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        }

        if (p.type === 'star') {
          drawStar(currentX, p.y, p.size * 2, p.size * 0.5, p.color, currentOpacity);
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.arc(currentX, p.y, p.size * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = currentOpacity;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[2]"
    />
  );
}
