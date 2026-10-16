/**
 * MIRAVERSE OS x — Integrated Local Fantasy Portrait Pipeline (§8 & §15.5)
 * Handles prompt synthesis from citizen lore, local AI engine detection (ComfyUI / WebUI),
 * procedural celestial avatar generation, image adjustments, and master profile persistence.
 */

export interface CitizenAppearance {
  name: string;
  species: string;
  ancestry: string;
  eyes: string;
  hair: string;
  build: string;
  height?: string;
  mark?: string;
  home: string;
  origin?: string;
  affinity: string;
  powerSource: string;
  category: string;
  dob?: string;
}

export type PortraitMode = 'id' | 'expressive';

export interface LocalEngineStatus {
  type: 'none' | 'comfyui' | 'webui';
  online: boolean;
  endpoint: string;
  details?: string;
}

/**
 * Synthesizes an optimized stylized fantasy realism prompt from citizen attributes.
 */
export function buildPortraitPrompt(
  citizen: CitizenAppearance,
  mode: PortraitMode = 'id'
): { prompt: string; negativePrompt: string } {
  const species = citizen.species || 'Humanoid';
  const eyes = citizen.eyes || 'Luminous eyes';
  const hair = citizen.hair || 'Silver-black hair';
  const build = citizen.build || 'Medium';
  const mark = citizen.mark && citizen.mark !== 'None recorded' ? citizen.mark : '';
  const home = citizen.home || 'Orynvell';
  const ancestry = citizen.ancestry || '';

  // Determine species-specific facial features
  let speciesNotes = '';
  const lowerSpecies = species.toLowerCase();
  if (lowerSpecies.includes('mer') || lowerSpecies.includes('siren') || lowerSpecies.includes('naiad') || lowerSpecies.includes('undine')) {
    speciesNotes = 'delicate aquatic gills on neck, subtle iridescent pearlescent ear fins, soft sea-glass highlights';
  } else if (lowerSpecies.includes('frost') || lowerSpecies.includes('glacial') || lowerSpecies.includes('snow')) {
    speciesNotes = 'pale crystalline cryo skin with subtle glacial frost patterns, cool undertones, resilient northern bone structure';
  } else if (lowerSpecies.includes('lumin') || lowerSpecies.includes('solar')) {
    speciesNotes = 'radiant solar-shimmer skin, pupil-less luminous glowing eyes, warm golden undertones, starlight reflections';
  } else if (lowerSpecies.includes('angel') || lowerSpecies.includes('aether') || lowerSpecies.includes('lightborn') || ancestry.toLowerCase().includes('lightborn')) {
    speciesNotes = 'celestial symmetry, faint pearlescent aetheric skin luster, refined aristocratic features, noble celestial presence';
  } else if (lowerSpecies.includes('shadow') || lowerSpecies.includes('nether')) {
    speciesNotes = 'umbral porcelain skin, deep void-violet eye intensity, subtle smoke shadow contours, enigmatic expression';
  } else if (lowerSpecies.includes('ember') || lowerSpecies.includes('phoenix') || lowerSpecies.includes('salamandri')) {
    speciesNotes = 'bronze sun-warmed skin, faint glowing ember eye warmth, fiery hair highlights, robust resilient features';
  }

  // Determine mode-specific framing
  if (mode === 'id') {
    const prompt = [
      `Official identification portrait headshot of a celestial ${species}`,
      `character named ${citizen.name || 'Citizen'} from ${home}, Meridion`,
      `facial features: ${eyes} eyes, ${hair}, ${build} build`,
      speciesNotes,
      mark ? `distinctive trait: ${mark}` : '',
      'framing: neutral front-facing passport headshot, centered, shoulders square to camera, neutral calm expression, sharp clear focus on face',
      'lighting: clean high-key studio identification lighting, soft even illumination, no harsh shadows',
      'background: clean solid neutral slate lavender identification backdrop with subtle holographic security watermark',
      'clothing: formal high-collar civic official tunic in dark navy and lavender with silver trim',
      'style: stylized fantasy realism, highly detailed digital painting, crisp clean linework, refined facial anatomy, 8k resolution, cinematic character art'
    ].filter(Boolean).join(', ');

    const negativePrompt = 'distorted face, deformed eyes, extra limbs, asymmetrical face, side view, extreme angle, dramatic shadows, cartoonish, messy background, text, borders, watermark, blurs, low resolution';

    return { prompt, negativePrompt };
  } else {
    const prompt = [
      `Cinematic expressive character portrait of a celestial ${species}`,
      `character named ${citizen.name || 'Citizen'} from ${home}, Meridion`,
      `appearance: ${eyes} eyes with inner glow, flowing ${hair}, ${build} physique`,
      speciesNotes,
      mark ? `marked with ${mark}` : '',
      `affinity: aligned with ${citizen.affinity || 'Aether'} resonance, subtle atmospheric wisps of magic`,
      'framing: medium close-up, three-quarter angle, dynamic engaging eye contact, expressive confident demeanor',
      'lighting: dramatic celestial rim lighting, ethereal glow, volumetric starlight beams, cinematic color grading',
      `environment: atmospheric backdrop of ${home} architecture with distant nebula skies`,
      'style: masterpiece fantasy character concept art, high-fidelity digital illustration, unreal engine 5 render look, luminous details, 8k'
    ].filter(Boolean).join(', ');

    const negativePrompt = 'blurry, amateur, bad anatomy, deformed eyes, extra fingers, low contrast, washed out, plastic skin, flat lighting, cropped face';

    return { prompt, negativePrompt };
  }
}

/**
 * Checks connectivity to local AI backends (ComfyUI or Stable Diffusion WebUI / Forge).
 */
export async function detectLocalEngine(
  comfyUrl = 'http://127.0.0.1:8188',
  webuiUrl = 'http://127.0.0.1:7860'
): Promise<LocalEngineStatus> {
  // Test ComfyUI
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 1200);
    const res = await fetch(`${comfyUrl}/system_stats`, { signal: ctrl.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const vram = data?.devices?.[0]?.vram_total ? `${Math.round(data.devices[0].vram_total / 1e9)}GB VRAM` : 'GPU Ready';
      return { type: 'comfyui', online: true, endpoint: comfyUrl, details: `ComfyUI Server Active (${vram})` };
    }
  } catch {
    // ComfyUI offline
  }

  // Test WebUI / Forge
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 1200);
    const res = await fetch(`${webuiUrl}/sdapi/v1/sd-models`, { signal: ctrl.signal });
    clearTimeout(timeout);
    if (res.ok) {
      return { type: 'webui', online: true, endpoint: webuiUrl, details: 'Stable Diffusion WebUI / Forge Ready' };
    }
  } catch {
    // WebUI offline
  }

  return { type: 'none', online: false, endpoint: '', details: 'No local GPU backend detected. Procedural generator active.' };
}

/**
 * Generates an SVG/Canvas procedural stylized fantasy portrait based on citizen traits.
 * Zero external dependencies; instant generation offline.
 */
export function generateProceduralPortrait(citizen: CitizenAppearance, seed = 42): string {
  // Deterministic random from seed
  let s = seed + Math.abs(citizen.name.split('').reduce((a, c) => ((a * 31 + c.charCodeAt(0)) | 0), 0));
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const species = (citizen.species || '').toLowerCase();
  const hairDesc = (citizen.hair || '').toLowerCase();
  const eyesDesc = (citizen.eyes || '').toLowerCase();
  const home = (citizen.home || '').toLowerCase();

  // Color selection based on species and attributes
  let skinBase = '#F4EDE4';
  let skinShade = '#E5D6C7';
  let auraGlow = 'rgba(152, 131, 200, 0.25)';

  if (species.includes('frost') || home.includes('fross')) {
    skinBase = '#EBF4FA';
    skinShade = '#D4E6F1';
    auraGlow = 'rgba(174, 214, 241, 0.35)';
  } else if (species.includes('lumin') || home.includes('lumia')) {
    skinBase = '#FFF9E6';
    skinShade = '#F9E79F';
    auraGlow = 'rgba(244, 208, 63, 0.35)';
  } else if (species.includes('mer') || species.includes('siren') || home.includes('marlowe')) {
    skinBase = '#E8F8F5';
    skinShade = '#D1F2EB';
    auraGlow = 'rgba(115, 198, 182, 0.35)';
  } else if (species.includes('shadow') || species.includes('nether') || home.includes('nephele')) {
    skinBase = '#E8E5EE';
    skinShade = '#D2CDDE';
    auraGlow = 'rgba(125, 102, 168, 0.35)';
  } else if (species.includes('ember') || home.includes('kaji')) {
    skinBase = '#FBEEE6';
    skinShade = '#EDBB99';
    auraGlow = 'rgba(230, 126, 34, 0.35)';
  } else if (species.includes('angel') || species.includes('lightborn') || home.includes('orynvell')) {
    skinBase = '#FDFEFE';
    skinShade = '#EAECEE';
    auraGlow = 'rgba(215, 189, 226, 0.4)';
  }

  // Hair color
  let hairColor = '#2C2849';
  let hairHighlight = '#483D8B';
  if (hairDesc.includes('silver') || hairDesc.includes('white') || hairDesc.includes('stardust')) {
    hairColor = '#E5E7EB';
    hairHighlight = '#FFFFFF';
  } else if (hairDesc.includes('blonde') || hairDesc.includes('gold')) {
    hairColor = '#F5D77F';
    hairHighlight = '#FCF3CF';
  } else if (hairDesc.includes('copper') || hairDesc.includes('red')) {
    hairColor = '#BA4A00';
    hairHighlight = '#E59866';
  } else if (hairDesc.includes('blue') || hairDesc.includes('icy')) {
    hairColor = '#5DADE2';
    hairHighlight = '#A9CCE3';
  } else if (hairDesc.includes('black')) {
    hairColor = '#17202A';
    hairHighlight = '#2C3E50';
  }

  // Eye color
  let eyeColor = '#5B2C6F';
  if (eyesDesc.includes('amber') || eyesDesc.includes('gold')) {
    eyeColor = '#D4AC0D';
  } else if (eyesDesc.includes('blue') || eyesDesc.includes('violet')) {
    eyeColor = '#5499C7';
  } else if (eyesDesc.includes('green')) {
    eyeColor = '#27AE60';
  } else if (eyesDesc.includes('gray') || eyesDesc.includes('silver')) {
    eyeColor = '#7F8C8D';
  } else if (eyesDesc.includes('dark brown') || eyesDesc.includes('brown')) {
    eyeColor = '#6E2C00';
  }

  // Background gradient: celestial navy to lavender
  const bgGradId = `bg-grad-${s}`;
  const auraGradId = `aura-grad-${s}`;
  const skinGradId = `skin-grad-${s}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="100%" height="100%">
  <defs>
    <linearGradient id="${bgGradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1938" />
      <stop offset="50%" stop-color="#2D2652" />
      <stop offset="100%" stop-color="#3C3268" />
    </linearGradient>
    <radialGradient id="${auraGradId}" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="${auraGlow}" />
      <stop offset="100%" stop-color="rgba(0,0,0,0)" />
    </radialGradient>
    <linearGradient id="${skinGradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${skinBase}" />
      <stop offset="100%" stop-color="${skinShade}" />
    </linearGradient>
    <filter id="glow-${s}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="400" height="480" fill="url(#${bgGradId})" />
  <rect width="400" height="480" fill="url(#${auraGradId})" />

  <!-- Subtle Celestial Grid / Security Hologram -->
  <circle cx="200" cy="210" r="160" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="4,6" />
  <circle cx="200" cy="210" r="120" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.8" />
  <path d="M40 210 L360 210 M200 50 L200 370" stroke="rgba(255,255,255,0.05)" stroke-width="0.8" />

  <!-- Shoulders & Torso: Formal Civic / Tactical High-Collar Uniform -->
  <path d="M80 480 Q130 350 200 350 Q270 350 320 480 Z" fill="#18152B" />
  <path d="M120 480 Q160 365 200 365 Q240 365 280 480 Z" fill="#241E3D" />
  <!-- Lapel / Trim -->
  <path d="M175 350 L200 395 L225 350" fill="none" stroke="#C5AB78" stroke-width="2.5" />
  <circle cx="200" cy="405" r="4" fill="#C5AB78" />

  <!-- Neck -->
  <rect x="178" y="270" width="44" height="90" rx="6" fill="${skinShade}" />
  <path d="M178 320 Q200 345 222 320" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="2" />

  <!-- Aquatic / Gills Feature -->
  ${species.includes('mer') || species.includes('siren') ? `
    <path d="M172 290 Q176 295 174 305 M170 300 Q174 305 172 315" stroke="#73C6B6" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
    <path d="M228 290 Q224 295 226 305 M230 300 Q226 305 228 315" stroke="#73C6B6" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
  ` : ''}

  <!-- Head Base / Jawline -->
  <path d="M140 180 Q140 290 200 305 Q260 290 260 180 Q260 110 200 110 Q140 110 140 180 Z" fill="url(#${skinGradId})" />

  <!-- Ears & Piercings / Fins -->
  ${species.includes('mer') || species.includes('siren') ? `
    <!-- Fin-like ears -->
    <path d="M138 180 Q115 160 120 205 Q135 200 140 195 Z" fill="${skinShade}" opacity="0.9" />
    <path d="M262 180 Q285 160 280 205 Q265 200 260 195 Z" fill="${skinShade}" opacity="0.9" />
  ` : `
    <!-- Standard / Celestial tapered ears -->
    <ellipse cx="136" cy="195" rx="8" ry="18" fill="${skinShade}" />
    <ellipse cx="264" cy="195" rx="8" ry="18" fill="${skinShade}" />
  `}

  <!-- Hair Back / Volume -->
  <path d="M130 150 Q120 230 110 320 Q150 290 150 240 M270 150 Q280 230 290 320 Q250 290 250 240" fill="${hairColor}" opacity="0.5" />

  <!-- Facial Shading (Cheekbones & Nose Bridge) -->
  <path d="M196 175 L196 235 L208 238 L192 238" fill="none" stroke="rgba(100,80,120,0.22)" stroke-width="2.5" stroke-linecap="round" />
  <ellipse cx="168" cy="210" rx="14" ry="7" fill="rgba(200,140,160,0.12)" />
  <ellipse cx="232" cy="210" rx="14" ry="7" fill="rgba(200,140,160,0.12)" />

  <!-- Eyes -->
  <!-- Left Eye -->
  <ellipse cx="172" cy="188" rx="14" ry="7" fill="#FFFFFF" />
  <ellipse cx="172" cy="188" rx="6.5" ry="6.5" fill="${eyeColor}" />
  <circle cx="172" cy="188" r="2.5" fill="#111" />
  <circle cx="174" cy="186" r="1.5" fill="#FFFFFF" />
  <path d="M156 186 Q172 178 188 186" fill="none" stroke="#2C2849" stroke-width="2.2" stroke-linecap="round" />

  <!-- Right Eye -->
  <ellipse cx="228" cy="188" rx="14" ry="7" fill="#FFFFFF" />
  <ellipse cx="228" cy="188" rx="6.5" ry="6.5" fill="${eyeColor}" />
  <circle cx="228" cy="188" r="2.5" fill="#111" />
  <circle cx="230" cy="186" r="1.5" fill="#FFFFFF" />
  <path d="M212 186 Q228 178 244 186" fill="none" stroke="#2C2849" stroke-width="2.2" stroke-linecap="round" />

  <!-- Eyebrows -->
  <path d="M156 176 Q172 170 188 174" fill="none" stroke="${hairColor}" stroke-width="3" stroke-linecap="round" />
  <path d="M212 174 Q228 170 244 176" fill="none" stroke="${hairColor}" stroke-width="3" stroke-linecap="round" />

  <!-- Mouth -->
  <path d="M185 264 Q200 270 215 264" fill="none" stroke="#A93226" stroke-width="2.2" stroke-linecap="round" opacity="0.8" />
  <path d="M188 263 Q200 266 212 263" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="1.2" />

  <!-- Front Hair Style -->
  <path d="M136 175 Q150 115 200 115 Q250 115 264 175 Q240 135 200 140 Q160 135 136 175 Z" fill="${hairColor}" />
  <path d="M145 160 Q180 125 215 145" fill="none" stroke="${hairHighlight}" stroke-width="2.5" opacity="0.4" />
  <path d="M170 120 Q200 105 230 120" fill="none" stroke="${hairHighlight}" stroke-width="2" opacity="0.4" />

  <!-- Species Markings (Celestial Forehead Crest, Frost Crystals, or Dermal Spark) -->
  ${species.includes('angel') || species.includes('lightborn') || species.includes('aether') ? `
    <!-- Celestial Forehead Star -->
    <path d="M200 138 L202 144 L208 146 L202 148 L200 154 L198 148 L192 146 L198 144 Z" fill="#C5AB78" opacity="0.85" filter="url(#glow-${s})" />
  ` : species.includes('frost') ? `
    <!-- Glacial Crystal Marks on cheek -->
    <circle cx="158" cy="205" r="1.5" fill="#FFFFFF" opacity="0.8" />
    <circle cx="162" cy="208" r="1.2" fill="#FFFFFF" opacity="0.8" />
    <circle cx="155" cy="210" r="1.2" fill="#FFFFFF" opacity="0.8" />
  ` : ''}

  <!-- Official Identification Stamp in lower right -->
  <g transform="translate(290, 410) scale(0.65)" opacity="0.75">
    <circle cx="40" cy="40" r="36" fill="none" stroke="#C5AB78" stroke-width="2" />
    <circle cx="40" cy="40" r="30" fill="none" stroke="#C5AB78" stroke-width="1" stroke-dasharray="3,3" />
    <text x="40" y="36" font-family="system-ui, sans-serif" font-size="8" font-weight="bold" fill="#C5AB78" text-anchor="middle">AURA</text>
    <text x="40" y="47" font-family="system-ui, sans-serif" font-size="7" fill="#C5AB78" text-anchor="middle">OFFICIAL</text>
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Saves the approved portrait data URI to the master citizen record in localStorage.
 * Notifies all open apps across the OS.
 */
export function persistCitizenPortrait(citizenId: string, portraitDataUri: string): boolean {
  try {
    const STORE = 'miraverse-identity-registry-v3';
    const raw = localStorage.getItem(STORE);
    if (!raw) return false;
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return false;

    const idx = list.findIndex((c: any) => c.record === citizenId);
    if (idx < 0) return false;

    list[idx].portraitData = portraitDataUri;
    localStorage.setItem(STORE, JSON.stringify(list));

    // Broadcast update to all windows/tabs/iframes
    if (typeof window !== 'undefined') {
      window.postMessage({ source: 'meridion-registry', type: 'citizens-changed' }, window.location.origin);
      window.dispatchEvent(new Event('storage'));
    }
    return true;
  } catch (err) {
    console.error('Failed to persist citizen portrait:', err);
    return false;
  }
}
