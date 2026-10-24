import React from 'react';
import { type CustomWidgetData, BADGE_IDS } from './socialModel';

export const BADGE_SVGS: Record<string, { label: string; svg: React.ReactNode }> = {
  'versenet-800x600': {
    label: 'VERSENET NOW · Best Viewed 800x600',
    svg: (
      <svg width="88" height="31" viewBox="0 0 88 31" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Versenet 800x600 Badge">
        <rect width="88" height="31" fill="#0c1829" stroke="#4880c8" strokeWidth="1"/>
        <rect x="2" y="2" width="84" height="27" fill="#142844"/>
        <path d="M4 4L16 4L16 12L4 12Z" fill="#38bdf8"/>
        <circle cx="10" cy="8" r="3" fill="#ffffff"/>
        <text x="20" y="11" fill="#38bdf8" fontFamily="Verdana, sans-serif" fontSize="7" fontWeight="bold">VERSENET</text>
        <text x="5" y="22" fill="#93c5fd" fontFamily="Verdana, sans-serif" fontSize="6.5">BEST VIEWED</text>
        <rect x="52" y="14" width="32" height="11" fill="#0369a1" rx="1"/>
        <text x="54" y="22" fill="#ffffff" fontFamily="monospace" fontSize="6.5" fontWeight="bold">800x600</text>
      </svg>
    )
  },
  'miraverse-valid': {
    label: 'MIRAVERSE OS · Certified Authentic',
    svg: (
      <svg width="88" height="31" viewBox="0 0 88 31" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Miraverse Certified Badge">
        <rect width="88" height="31" fill="#064e3b" stroke="#10b981" strokeWidth="1"/>
        <rect x="2" y="2" width="40" height="27" fill="#047857"/>
        <text x="5" y="12" fill="#d1fae5" fontFamily="sans-serif" fontSize="6" fontWeight="bold">MIRA</text>
        <text x="5" y="23" fill="#a7f3d0" fontFamily="sans-serif" fontSize="6" fontWeight="bold">VERSE</text>
        <rect x="42" y="2" width="44" height="27" fill="#022c22"/>
        <text x="46" y="13" fill="#34d399" fontFamily="Verdana, sans-serif" fontSize="6.5" fontWeight="bold">VALID</text>
        <text x="46" y="23" fill="#6ee7b7" fontFamily="sans-serif" fontSize="5.5">SYSTEM 1.0</text>
      </svg>
    )
  },
  'powered-by-tea': {
    label: 'Powered by Green Tea & Starlight',
    svg: (
      <svg width="88" height="31" viewBox="0 0 88 31" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Powered by Tea Badge">
        <rect width="88" height="31" fill="#3f2e21" stroke="#a27b5c" strokeWidth="1"/>
        <rect x="2" y="2" width="84" height="27" fill="#2c1e14"/>
        <text x="6" y="11" fill="#fde68a" fontFamily="Georgia, serif" fontSize="6" fontStyle="italic">Powered by</text>
        <text x="6" y="23" fill="#fef3c7" fontFamily="Verdana, sans-serif" fontSize="8" fontWeight="bold">MATCHA ☕</text>
      </svg>
    )
  },
  'notepad-coder': {
    label: 'Handcrafted in Document Studio',
    svg: (
      <svg width="88" height="31" viewBox="0 0 88 31" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Notepad Coder Badge">
        <rect width="88" height="31" fill="#18181b" stroke="#f97316" strokeWidth="1"/>
        <rect x="2" y="2" width="44" height="27" fill="#ea580c"/>
        <text x="6" y="13" fill="#ffffff" fontFamily="monospace" fontSize="6.5" fontWeight="bold">&lt;HTML&gt;</text>
        <text x="6" y="23" fill="#ffedd5" fontFamily="sans-serif" fontSize="5.5">HAND-MADE</text>
        <rect x="46" y="2" width="40" height="27" fill="#27272a"/>
        <text x="49" y="14" fill="#fb923c" fontFamily="sans-serif" fontSize="6.5" fontWeight="bold">STUDIO</text>
        <text x="49" y="23" fill="#fdba74" fontFamily="monospace" fontSize="5.5">100% RAW</text>
      </svg>
    )
  },
  'aureline-sound': {
    label: 'Aureline Audio On · Sound Matters',
    svg: (
      <svg width="88" height="31" viewBox="0 0 88 31" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Aureline Audio Badge">
        <rect width="88" height="31" fill="#2e1065" stroke="#a855f7" strokeWidth="1"/>
        <rect x="2" y="2" width="84" height="27" fill="#3b0764"/>
        <text x="6" y="11" fill="#e9d5ff" fontFamily="sans-serif" fontSize="6.5" fontWeight="bold">AURELINE</text>
        <text x="6" y="23" fill="#c084fc" fontFamily="Verdana, sans-serif" fontSize="7">AUDIO ON ♫</text>
        <rect x="64" y="6" width="3" height="18" fill="#d8b4fe"/>
        <rect x="70" y="10" width="3" height="14" fill="#c084fc"/>
        <rect x="76" y="4" width="3" height="20" fill="#a855f7"/>
        <rect x="82" y="12" width="3" height="12" fill="#9333ea"/>
      </svg>
    )
  },
  'dga-clearance': {
    label: 'Restricted Net · Clearance Valid',
    svg: (
      <svg width="88" height="31" viewBox="0 0 88 31" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="DGA Clearance Badge">
        <rect width="88" height="31" fill="#1e293b" stroke="#eab308" strokeWidth="1"/>
        <rect x="2" y="2" width="84" height="27" fill="#0f172a"/>
        <circle cx="14" cy="15" r="9" fill="#ca8a04"/>
        <text x="10" y="19" fill="#ffffff" fontFamily="sans-serif" fontSize="10" fontWeight="bold">★</text>
        <text x="28" y="12" fill="#fde047" fontFamily="sans-serif" fontSize="6.5" fontWeight="bold">DGA SECURE</text>
        <text x="28" y="23" fill="#facc15" fontFamily="monospace" fontSize="6">CLEARANCE</text>
      </svg>
    )
  }
};

export function BadgeButton({ id, onClick }: { id: string; onClick?: () => void }) {
  const item = BADGE_SVGS[id] || BADGE_SVGS['versenet-800x600'];
  return (
    <span
      className="ms-badge-button"
      title={item.label}
      onClick={onClick}
      style={{ display: 'inline-block', width: 88, height: 31, verticalAlign: 'middle', margin: '2px 4px', cursor: onClick ? 'pointer' : 'default' }}
    >
      {item.svg}
    </span>
  );
}

export function HitCounterWidget({
  viewCount = 42,
  style = 'odometer'
}: {
  viewCount?: number;
  style?: 'odometer' | 'led' | 'retro-lcd';
}) {
  const digits = String(Math.max(0, viewCount)).padStart(6, '0').split('');
  return (
    <div className={`ms-counter-widget ms-counter-${style}`} aria-label={`Visitor count: ${viewCount}`}>
      <span className="ms-counter-label">VISITOR NO.</span>
      <div className="ms-counter-display">
        {digits.map((digit, idx) => (
          <span key={idx} className="ms-counter-digit">
            {digit}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MarqueeWidget({ text }: { text?: string }) {
  const display = text || 'Welcome to my corner of MAI.SPACE! ✦ Thanks for stopping by! ♡';
  return (
    <div className="ms-marquee-container" role="marquee">
      <div className="ms-marquee-content">
        <span>{display}</span>
        <span aria-hidden="true"> ··· {display}</span>
      </div>
    </div>
  );
}

export function StatusWidget({
  mood = 'Dreaming & Building',
  icon = '✦',
  quote
}: {
  mood?: string;
  icon?: string;
  quote?: string;
}) {
  return (
    <div className="ms-status-widget">
      <div className="ms-status-header">
        <span className="ms-status-icon">{icon}</span>
        <strong>{mood}</strong>
      </div>
      {quote && <p className="ms-status-quote">"{quote}"</p>}
    </div>
  );
}

export function QuizWidget({
  title = "Who I'd Like to Meet",
  items = []
}: {
  title?: string;
  items?: { question: string; answer: string }[];
}) {
  const list = items.length ? items : [
    { question: 'Favorite hour to create?', answer: 'Late night when the city is quiet' },
    { question: 'Current obsession?', answer: 'Ambient synth loops and margin doodles' }
  ];
  return (
    <div className="ms-quiz-widget">
      <h4>✦ {title} ✦</h4>
      <dl>
        {list.map((item, idx) => (
          <React.Fragment key={idx}>
            <dt>{item.question}</dt>
            <dd>{item.answer}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  );
}

export function RetroWidgetModule({
  widget,
  viewCount = 42
}: {
  widget?: CustomWidgetData;
  viewCount?: number;
}) {
  const wk = widget?.widgetKind || 'badges';
  switch (wk) {
    case 'marquee':
      return <MarqueeWidget text={widget?.marqueeText} />;
    case 'counter':
      return <HitCounterWidget viewCount={viewCount} style={widget?.counterStyle} />;
    case 'status':
      return <StatusWidget mood={widget?.statusMood} icon={widget?.statusIcon} quote={widget?.marqueeText} />;
    case 'quiz':
      return <QuizWidget title={widget?.quizTitle} items={widget?.quizItems} />;
    case 'badges':
    default: {
      const badges = widget?.badges?.length ? widget.badges : ['versenet-800x600', 'miraverse-valid', 'powered-by-tea'];
      return (
        <div className="ms-badge-rack">
          <div className="ms-badge-header">STAMPS & AFFILIATIONS</div>
          <div className="ms-badge-grid">
            {badges.map(b => (
              <BadgeButton key={b} id={b} />
            ))}
          </div>
        </div>
      );
    }
  }
}

/**
 * Safely parses retro shortcodes like [marquee]...[/marquee], [glitter]...[/glitter],
 * [blink]...[/blink], [rainbow]...[/rainbow], and [badge:id] into safe React nodes.
 */
export function RetroHtml({ text, className = '' }: { text: string; className?: string }) {
  if (!text) return null;

  // Tokenize text into shortcodes and plain segments
  const regex = /(\[(?:marquee|glitter|rainbow|blink)\][\s\S]*?\[\/(?:marquee|glitter|rainbow|blink)\]|<(?:marquee|blink)>[\s\S]*?<\/(?:marquee|blink)>|\[badge:[a-z0-9-]+\])/gi;
  const parts = text.split(regex);

  return (
    <div className={`ms-retro-content ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        // [marquee]...[/marquee] or <marquee>...</marquee>
        const marqueeMatch = part.match(/^\[marquee\]([\s\S]*?)\[\/marquee\]$/i) || part.match(/^<marquee>([\s\S]*?)<\/marquee>$/i);
        if (marqueeMatch) {
          return <MarqueeWidget key={index} text={marqueeMatch[1]} />;
        }

        // [glitter]...[/glitter]
        const glitterMatch = part.match(/^\[glitter\]([\s\S]*?)\[\/glitter\]$/i);
        if (glitterMatch) {
          return <span key={index} className="ms-glitter-text">{glitterMatch[1]}</span>;
        }

        // [rainbow]...[/rainbow]
        const rainbowMatch = part.match(/^\[rainbow\]([\s\S]*?)\[\/rainbow\]$/i);
        if (rainbowMatch) {
          return <span key={index} className="ms-rainbow-text">{rainbowMatch[1]}</span>;
        }

        // [blink]...[/blink] or <blink>...</blink>
        const blinkMatch = part.match(/^\[blink\]([\s\S]*?)\[\/blink\]$/i) || part.match(/^<blink>([\s\S]*?)<\/blink>$/i);
        if (blinkMatch) {
          return <span key={index} className="ms-blink-text">{blinkMatch[1]}</span>;
        }

        // [badge:badgeId]
        const badgeMatch = part.match(/^\[badge:([a-z0-9-]+)\]$/i);
        if (badgeMatch) {
          return <BadgeButton key={index} id={badgeMatch[1]} />;
        }

        // Normal plain text preserving newlines
        return <span key={index} className="ms-prewrap">{part}</span>;
      })}
    </div>
  );
}
