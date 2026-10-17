import React, { useId } from 'react';

// Resolution-independent orbital artwork, shared by the desktop and telemetry view.
export default function CelestialScene({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={`celestial-scene ${className}`} viewBox="0 0 720 720" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}-halo`}><stop stopColor="#b6a4e4" stopOpacity=".25" /><stop offset="1" stopColor="#a7bbd9" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${id}-planet`} cx=".28" cy=".2" r=".88"><stop stopColor="#e1d7f2" /><stop offset=".28" stopColor="#a29cbd" /><stop offset=".62" stopColor="#4f6587" /><stop offset="1" stopColor="#192d4c" /></radialGradient>
        <linearGradient id={`${id}-orbit`} x1="100" y1="110" x2="620" y2="590" gradientUnits="userSpaceOnUse"><stop stopColor="#e9d8f4" stopOpacity=".65" /><stop offset=".45" stopColor="#ccbddb" stopOpacity=".12" /><stop offset="1" stopColor="#d9cfb8" stopOpacity=".65" /></linearGradient>
        <clipPath id={`${id}-clip`}><circle cx="360" cy="356" r="158" /></clipPath>
      </defs>
      <circle cx="360" cy="356" r="326" fill={`url(#${id}-halo)`} />
      <g stroke="#c3b6df" strokeWidth=".7">
        <circle cx="360" cy="356" r="257" opacity=".16" />
        <circle cx="360" cy="356" r="295" opacity=".08" strokeDasharray="2 10" />
        <path d="M360 46v28m0 564v28M48 356h28m568 0h28" opacity=".28" />
      </g>
      <ellipse cx="360" cy="356" rx="305" ry="108" transform="rotate(-32 360 356)" stroke={`url(#${id}-orbit)`} strokeWidth="1.1" />
      <ellipse cx="360" cy="356" rx="211" ry="285" transform="rotate(-32 360 356)" stroke="#c9b5e1" opacity=".17" strokeWidth=".7" />
      <circle cx="360" cy="356" r="158" fill={`url(#${id}-planet)`} stroke="#e8ddf4" strokeOpacity=".35" />
      <g clipPath={`url(#${id}-clip)`} stroke="#ecdfef" strokeWidth=".65" opacity=".22">
        <ellipse cx="360" cy="356" rx="69" ry="158" transform="rotate(-27 360 356)" />
        <ellipse cx="360" cy="356" rx="125" ry="158" transform="rotate(-27 360 356)" />
        <ellipse cx="360" cy="356" rx="158" ry="54" transform="rotate(-27 360 356)" />
        <ellipse cx="360" cy="356" rx="158" ry="112" transform="rotate(-27 360 356)" />
        <path d="M187 441l334-170M287 188l145 337" />
      </g>
      <path d="M101 482c45 18 163-15 281-88s205-155 208-197" stroke={`url(#${id}-orbit)`} strokeWidth="1.8" />
      <g fill="#ece2f2">
        <circle cx="119" cy="478" r="5" /><circle cx="548" cy="235" r="3.5" />
        <circle cx="196" cy="159" r="2" /><circle cx="615" cy="411" r="2" />
        <circle cx="298" cy="95" r="1.5" /><circle cx="213" cy="586" r="1.5" />
      </g>
      <circle cx="119" cy="478" r="12" stroke="#ddd0ec" strokeOpacity=".25" />
      <g stroke="#d9c8e9" strokeWidth="1" opacity=".65">
        <path d="M558 132v16m-8-8h16M155 314v10m-5-5h10M474 584v12m-6-6h12" />
        <path d="M548 235h50l26-26M259 528h-55l-27 27" strokeOpacity=".5" />
      </g>
      <text x="580" y="195" fill="#d5cce5" fontFamily="Segoe UI, sans-serif" fontSize="9" letterSpacing="3">AURELINE</text>
      <text x="126" y="579" fill="#c5bdd6" fontFamily="Segoe UI, sans-serif" fontSize="8" letterSpacing="2">MERIDION REALM</text>
    </svg>
  );
}
