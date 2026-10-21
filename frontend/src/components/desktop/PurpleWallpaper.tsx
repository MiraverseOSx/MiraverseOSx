import React from 'react';

// Fixed positions avoid moving stars whenever the desktop renders or the clock updates.
const STARS = Array.from({ length: 72 }, (_, i) => ({ x: (i * 37.71 + 11) % 100, y: (i * 19.43 + 7) % 100, size: i % 8 === 0 ? 4 : i % 3 === 0 ? 2 : 1, delay: (i % 11) * -.7 }));
export default function PurpleWallpaper({ animated }: { animated: boolean }) {
  return <div className={`purple-wallpaper ${animated ? 'is-animated' : ''}`} aria-hidden="true">
    <div className="purple-ribbon purple-ribbon-one"/><div className="purple-ribbon purple-ribbon-two"/><div className="purple-ribbon purple-ribbon-three"/>
    <div className="purple-glitter"/>
    {STARS.map((star, i) => <i key={i} className={`purple-star ${star.size === 4 ? 'is-cross' : ''}`} style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size, animationDelay: `${star.delay}s` }}/ >)}
  </div>;
}
