'use client';
import { useState, useRef, useEffect } from 'react';
import { Microscope, Eye, Sparkles, Sliders, CheckCircle2, RotateCcw } from 'lucide-react';

interface ComparisonMicroscopeProps {
  evidenceType?: string; // 'glass', 'fiber', 'paint', 'toolmark', or general
  evidenceTitle?: string;
  onLogFindings?: (findings: {
    magnification: string;
    lighting: string;
    focusStatus: string;
    reticleReading: string;
    observationText: string;
  }) => void;
}

export function ComparisonMicroscope({
  evidenceType = 'glass',
  evidenceTitle = 'Questioned Evidence',
  onLogFindings,
}: ComparisonMicroscopeProps) {
  const [splitPos, setSplitPos] = useState(50); // percentage (0 to 100)
  const [mag, setMag] = useState<'40x' | '100x' | '200x' | '400x'>('100x');
  const [focus, setFocus] = useState(50); // 50 is sharp focus
  const [polarized, setPolarized] = useState(false);
  const [showReticle, setShowReticle] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [logged, setLogged] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);

  // Focus blur level in pixels
  const blurAmount = Math.abs(focus - 50) * 0.12;

  // Zoom scale factor based on magnification
  const zoomScale = mag === '40x' ? 0.75 : mag === '100x' ? 1.0 : mag === '200x' ? 1.6 : 2.5;

  // Render left and right specimen patterns on Canvas
  useEffect(() => {
    const drawSpecimen = (canvas: HTMLCanvasElement | null, isReference: boolean) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background illumination
      if (polarized) {
        ctx.fillStyle = '#0f172a'; // Deep crossed-polarizer dark field
        ctx.fillRect(0, 0, w, h);
      } else {
        const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w / 1.5);
        bgGrad.addColorStop(0, '#f8fafc');
        bgGrad.addColorStop(1, '#cbd5e1');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(zoomScale, zoomScale);

      const type = evidenceType.toLowerCase();

      if (type.includes('fiber') || type.includes('textile')) {
        // Render fiber specimen (cylindrical striations with birefringence)
        ctx.lineWidth = 24;
        ctx.lineCap = 'round';

        if (polarized) {
          // Birefringence colors under cross-polarizers (second-order magenta & cyan)
          const fibGrad = ctx.createLinearGradient(-15, -100, 15, 100);
          fibGrad.addColorStop(0, '#ec4899');
          fibGrad.addColorStop(0.3, '#38bdf8');
          fibGrad.addColorStop(0.6, '#a855f7');
          fibGrad.addColorStop(1, '#eab308');
          ctx.strokeStyle = fibGrad;
        } else {
          ctx.strokeStyle = isReference ? '#2563eb' : '#3b82f6';
        }

        // Fiber main stem
        ctx.beginPath();
        ctx.moveTo(-10, -120);
        ctx.bezierCurveTo(-15, -40, isReference ? -8 : -12, 40, isReference ? -12 : -8, 120);
        ctx.stroke();

        // Longitudinal striations
        ctx.lineWidth = 2;
        ctx.strokeStyle = polarized ? '#ffffff88' : '#1e3a8a66';
        for (let s = -8; s <= 8; s += 4) {
          ctx.beginPath();
          ctx.moveTo(s - 10, -120);
          ctx.bezierCurveTo(s - 15, -40, s - 10, 40, s - 10, 120);
          ctx.stroke();
        }

        // Secondary small fiber fragment
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(50, -80);
        ctx.bezierCurveTo(45, -20, 60, 40, 55, 90);
        ctx.stroke();
      } else if (type.includes('paint')) {
        // Multi-layer automotive paint chip cross-section (4 strata)
        const layers = [
          { name: 'Clearcoat', height: 26, color: polarized ? '#e0f2fe' : 'rgba(241, 245, 249, 0.85)', stroke: '#94a3b8' },
          { name: 'Metallic Basecoat', height: 32, color: polarized ? '#3b82f6' : '#1e40af', stroke: '#1e3a8a' },
          { name: 'Primer Surfacer', height: 28, color: polarized ? '#a855f7' : '#6b21a8', stroke: '#581c87' },
          { name: 'Electrocoat (E-coat)', height: 22, color: polarized ? '#334155' : '#0f172a', stroke: '#020617' },
        ];

        let curY = -54;
        const chipWidth = isReference ? 150 : 145;
        const startX = -chipWidth / 2;

        layers.forEach((l) => {
          ctx.fillStyle = l.color;
          ctx.strokeStyle = l.stroke;
          ctx.lineWidth = 1.5;
          ctx.fillRect(startX, curY, chipWidth, l.height);
          ctx.strokeRect(startX, curY, chipWidth, l.height);

          // Render micro-flake inclusions in metallic basecoat
          if (l.name.includes('Metallic')) {
            ctx.fillStyle = '#ffffff';
            for (let fx = startX + 10; fx < startX + chipWidth - 10; fx += 14) {
              ctx.beginPath();
              ctx.arc(fx + (Math.sin(fx) * 4), curY + 16 + (Math.cos(fx) * 8), 1.5, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
          curY += l.height;
        });
      } else if (type.includes('gsr') || type.includes('gunshot')) {
        // Microscopic spherical vaporized primer lead/barium/antimony particles
        const particles = [
          { x: -20, y: -30, r: 18, color: '#475569' },
          { x: 35, y: 15, r: 14, color: '#334155' },
          { x: -50, y: 40, r: 11, color: '#1e293b' },
          { x: 10, y: 60, r: 8, color: '#64748b' },
          { x: 50, y: -45, r: 10, color: '#475569' },
          { x: -15, y: 10, r: 24, color: '#0f172a' },
        ];

        particles.forEach((p) => {
          const grad = ctx.createRadialGradient(p.x - 3, p.y - 3, 2, p.x, p.y, p.r);
          grad.addColorStop(0, polarized ? '#fbbf24' : '#e2e8f0');
          grad.addColorStop(0.7, p.color);
          grad.addColorStop(1, '#020617');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = polarized ? '#f59e0b' : '#334155';
          ctx.stroke();
        });
      } else if (type.includes('document') || type.includes('ink')) {
        // Cellulose paper fibers with ballpoint ink stroke & furrow
        ctx.strokeStyle = polarized ? '#64748b' : '#cbd5e1';
        ctx.lineWidth = 4;
        for (let fy = -80; fy <= 80; fy += 20) {
          ctx.beginPath();
          ctx.moveTo(-100, fy);
          ctx.bezierCurveTo(-30, fy - 15, 40, fy + 20, 100, fy - 10);
          ctx.stroke();
        }

        // Ink furrow line
        ctx.lineWidth = 20;
        ctx.lineCap = 'round';
        ctx.strokeStyle = isReference ? '#1e1b4b' : '#09090b';
        ctx.beginPath();
        ctx.moveTo(-75, -60);
        ctx.bezierCurveTo(-20, 10, 20, -30, 75, 50);
        ctx.stroke();

        // Striated striation track
        ctx.lineWidth = 2;
        ctx.strokeStyle = polarized ? '#a855f7' : '#60a5fa';
        ctx.beginPath();
        ctx.moveTo(-75, -55);
        ctx.bezierCurveTo(-20, 15, 20, -25, 75, 55);
        ctx.stroke();
      } else {
        // Render glass / mineral fragment with conchoidal fracture lines
        ctx.lineWidth = 2;
        ctx.strokeStyle = polarized ? '#f43f5e' : '#475569';

        // Glass boundary polygon
        ctx.beginPath();
        const pts = isReference
          ? [
              [-70, -60],
              [40, -85],
              [85, 20],
              [30, 80],
              [-60, 50],
            ]
          : [
              [-65, -55],
              [45, -80],
              [80, 25],
              [35, 75],
              [-55, 55],
            ];

        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i][0], pts[i][1]);
        }
        ctx.closePath();

        if (polarized) {
          // Strain birefringence interference pattern
          const pGrad = ctx.createLinearGradient(-60, -60, 60, 60);
          pGrad.addColorStop(0, '#6366f1aa');
          pGrad.addColorStop(0.5, '#ec4899aa');
          pGrad.addColorStop(1, '#eab308aa');
          ctx.fillStyle = pGrad;
        } else {
          ctx.fillStyle = isReference ? 'rgba(203, 213, 225, 0.4)' : 'rgba(226, 232, 240, 0.45)';
        }
        ctx.fill();
        ctx.stroke();

        // Conchoidal fracture ripples
        ctx.strokeStyle = polarized ? '#ffffffaa' : '#94a3b8';
        ctx.lineWidth = 1.5;
        for (let r = 20; r <= 70; r += 16) {
          ctx.beginPath();
          ctx.arc(-20, -10, r, -0.4 * Math.PI, 0.5 * Math.PI);
          ctx.stroke();
        }

        // Surface micro-inclusions / bubbles
        ctx.fillStyle = polarized ? '#facc15' : '#334155';
        ctx.beginPath();
        ctx.arc(10, -30, 2, 0, 2 * Math.PI);
        ctx.arc(-35, 20, 1.5, 0, 2 * Math.PI);
        ctx.arc(45, 10, 2.5, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.restore();
    };

    drawSpecimen(leftCanvasRef.current, false);
    drawSpecimen(rightCanvasRef.current, true);
  }, [evidenceType, polarized, zoomScale]);

  // Dragging handler for the split divider line (supports mouse and touch)
  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(10, Math.min(90, (x / rect.width) * 100));
      setSplitPos(pct);
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging]);

  const handleLogToWorksheet = () => {
    const isSharp = Math.abs(focus - 50) < 10;
    const reticleMicrons = mag === '40x' ? '120 µm' : mag === '100x' ? '48 µm' : mag === '200x' ? '24 µm' : '12 µm';

    const text = `Comparative examination conducted at ${mag} magnification using ${
      polarized ? 'cross-polarized illumination' : 'standard transmitted light'
    }. Split-field comparison between questioned evidence (${evidenceTitle}) and reference control demonstrated consistent morphological contours and boundary fracture patterns. Calibrated graticule measurement: fragment feature width approx. ${reticleMicrons}. Optical focus: ${
      isSharp ? 'optimal resolution achieved' : 'focal plane adjusted for surface topography'
    }.`;

    if (onLogFindings) {
      onLogFindings({
        magnification: mag,
        lighting: polarized ? 'Polarized light' : 'Brightfield / Transmitted',
        focusStatus: isSharp ? 'Sharp' : 'Variable',
        reticleReading: reticleMicrons,
        observationText: text,
      });
    }
    setLogged(true);
    setTimeout(() => setLogged(false), 2500);
  };

  return (
    <div className="comparison-microscope-box">
      {/* Top Controls Toolbar */}
      <div className="microscope-toolbar">
        <div className="flex items-center gap-2">
          <Microscope size={17} className="text-purple-600" />
          <span className="font-semibold text-xs text-gray-800 tracking-wide">
            OPTICAL COMPARISON BRIDGE
          </span>
        </div>

        {/* Magnification Turret */}
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded border text-xs">
          {(['40x', '100x', '200x', '400x'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMag(m)}
              className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                mag === m ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Optical Filter Toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPolarized(!polarized)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded border font-medium transition-colors ${
              polarized
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Sparkles size={12} />
            {polarized ? 'Polarizers: Crossed' : 'Polarizers: Off'}
          </button>

          <button
            type="button"
            onClick={() => setShowReticle(!showReticle)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded border font-medium transition-colors ${
              showReticle
                ? 'bg-purple-50 text-purple-800 border-purple-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Eye size={12} /> Reticle
          </button>
        </div>
      </div>

      {/* Main Ocular Eyepiece Field */}
      <div
        ref={containerRef}
        className="ocular-viewer-container"
      >
        {/* Left Field: Questioned Evidence */}
        <div
          className="specimen-half left-half"
          style={{
            clipPath: `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)`,
            filter: `blur(${blurAmount}px)`,
          }}
        >
          <canvas ref={leftCanvasRef} width={460} height={320} className="specimen-canvas" />
          <div className="field-watermark left-watermark">
            <span className="font-bold">LEFT STAGE:</span> Questioned ({evidenceTitle})
          </div>
        </div>

        {/* Right Field: Reference Standard */}
        <div
          className="specimen-half right-half"
          style={{
            clipPath: `polygon(${splitPos}% 0, 100% 0, 100% 100%, ${splitPos}% 100%)`,
            filter: `blur(${blurAmount}px)`,
          }}
        >
          <canvas ref={rightCanvasRef} width={460} height={320} className="specimen-canvas" />
          <div className="field-watermark right-watermark">
            <span className="font-bold">RIGHT STAGE:</span> Reference Standard
          </div>
        </div>

        {/* Calibrated Reticle Scale Overlay */}
        {showReticle && (
          <svg className="ocular-reticle-overlay" viewBox="0 0 460 320">
            {/* Center crosshairs */}
            <line x1="230" y1="20" x2="230" y2="300" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.75" />
            <line x1="40" y1="160" x2="420" y2="160" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.75" />

            {/* Micron graticule ticks */}
            {[-80, -60, -40, -20, 20, 40, 60, 80].map((offset) => (
              <g key={offset}>
                <line x1={230 + offset} y1={155} x2={230 + offset} y2={165} stroke="#ef4444" strokeWidth="1" opacity="0.8" />
                <line x1={225} y1={160 + offset} x2={235} y2={160 + offset} stroke="#ef4444" strokeWidth="1" opacity="0.8" />
              </g>
            ))}
            <text x="235" y="150" fill="#ef4444" fontSize="9" fontFamily="monospace" opacity="0.85">
              {mag === '40x' ? '100 µm / div' : mag === '100x' ? '25 µm / div' : '10 µm / div'}
            </text>
          </svg>
        )}

        {/* Draggable Split Divider Line */}
        <button
          type="button"
          aria-label="Split-screen optical divider"
          className="split-divider-line"
          style={{ left: `${splitPos}%` }}
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setSplitPos((p) => Math.max(10, p - 5));
            if (e.key === 'ArrowRight') setSplitPos((p) => Math.min(90, p + 5));
          }}
          title="Drag or use arrow keys to adjust split field"
        >
          <span className="divider-handle">
            <Sliders size={11} className="rotate-90 text-white" />
          </span>
        </button>
      </div>

      {/* Bottom Focus & Action Controls */}
      <div className="microscope-bottom-controls">
        <div className="focus-control-group">
          <label className="text-xs text-gray-600 font-medium flex items-center gap-1.5">
            <span>Fine Optical Focus:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={focus}
              onChange={(e) => setFocus(Number(e.target.value))}
              className="focus-slider"
            />
          </label>
          <button
            type="button"
            onClick={() => setFocus(50)}
            title="Reset to sharp focus"
            className="text-gray-400 hover:text-gray-700 p-1"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogToWorksheet}
            className="log-findings-btn flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-sm"
          >
            {logged ? <CheckCircle2 size={13} className="text-green-300" /> : <Microscope size={13} />}
            {logged ? 'Logged to Worksheet!' : 'Log Microscope Findings'}
          </button>
        </div>
      </div>
    </div>
  );
}
