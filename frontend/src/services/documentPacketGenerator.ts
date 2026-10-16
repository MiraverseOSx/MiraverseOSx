/**
 * MIRAVERSE OS x — Nine-Document Packet Generator (§7 & §15.4)
 * Produces individual standalone print-ready HTML documents and complete combined multi-page
 * PDF/print dossier packets for the 9 accepted canonical civil/forensic/institutional documents.
 */

export interface CitizenRecord {
  name: string;
  dob: string;
  place: string;
  record: string;
  passport: string;
  alias?: string;
  address: string;
  phone: string;
  email: string;
  district: string;
  height: string;
  eyes: string;
  hair: string;
  build: string;
  blood: string;
  mark: string;
  species: string;
  ancestry: string;
  abilities: string;
  powerSource: string;
  affinity: string;
  faction?: string;
  home: string;
  lore?: string;
  category: string;
  affiliation: string;
  occupation: string;
  clearance: string;
  aura?: string;
  medical: string;
  residency: string;
  history: string;
  status: string;
  links: string;
  relationships?: string;
  household?: string;
  timeline?: string;
  portraitData?: string;
  biometricSeed?: string;
}

export interface IssuedDocumentSnapshot {
  id: string;
  documentType: string;
  citizenRecordId: string;
  citizenName: string;
  issuedAt: string;
  issuingAuthority: string;
  version: string;
  hash: string;
}

export function escapeHtml(str: unknown): string {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Deterministic procedural SVG fingerprint matching Registry and TRACE specifications.
 */
export function getFingerprintSvg(code: string, index: number): string {
  const hash = String(code).split('').reduce((a, c) => ((a * 31 + c.charCodeAt(0)) >>> 0), 2166136261) + (index + 1) * 92821;
  const rot = (hash % 37) - 18;
  const cx = 45 + (hash % 7) - 3;
  const cy = 44 + ((hash >>> 4) % 7) - 3;
  let lines = '';
  for (let k = 0; k < 15; k++) {
    const rx = 6 + k * 2.13;
    const ry = 10 + k * 2.5;
    lines += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#2C2849" stroke-width="0.8" opacity="${(0.9 - k * 0.026).toFixed(2)}" transform="rotate(${rot} ${cx} ${cy})" stroke-dasharray="${(hash + k) % 5 === 0 ? '34 3 48 2' : '210'}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 100" class="w-full h-full"><rect width="90" height="100" fill="#FFFFFF"/>${lines}<text x="5" y="95" font-family="sans-serif" font-size="5" fill="#888899">SIMULATED</text></svg>`;
}

const COMMON_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  
  :root {
    --navy: #2C2849;
    --lavender: #9883C8;
    --pearl: #E6E0F2;
    --gold: #C5AB78;
    --ivory: #F8F5EE;
    --slate: #4A5568;
    --border: #D1D5DB;
  }
  
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0;
    background: #EAE6F0;
    color: var(--navy);
    font-family: 'Inter', -apple-system, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .doc-page {
    width: 8.5in;
    min-height: 11in;
    margin: 20px auto;
    background: #FFFFFF;
    padding: 0.6in;
    box-shadow: 0 10px 30px rgba(0,0,0,0.12);
    position: relative;
    overflow: hidden;
  }
  
  .doc-landscape {
    width: 11in;
    min-height: 8.5in;
  }
  
  .watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-35deg);
    font-family: 'Cinzel', serif;
    font-size: 80px;
    font-weight: 700;
    color: rgba(152, 131, 200, 0.04);
    letter-spacing: 12px;
    pointer-events: none;
    z-index: 0;
    white-space: nowrap;
  }

  .gold-seal {
    width: 75px;
    height: 75px;
    border-radius: 50%;
    border: 3px double #C5AB78;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle, #FAF6EE 0%, #EFE8D8 100%);
    color: #8C7541;
    font-family: 'Cinzel', serif;
    font-size: 8px;
    font-weight: 700;
    text-align: center;
    box-shadow: 0 2px 8px rgba(197, 171, 120, 0.3);
  }

  .print-actions {
    max-width: 8.5in;
    margin: 15px auto;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .print-btn {
    background: var(--navy);
    color: white;
    border: none;
    padding: 10px 18px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    font-size: 13px;
  }

  @media print {
    body { background: white !important; }
    .print-actions { display: none !important; }
    .doc-page {
      margin: 0 !important;
      padding: 0.45in !important;
      box-shadow: none !important;
      width: 100% !important;
      height: 100% !important;
      page-break-after: always;
      break-after: page;
    }
    @page { size: portrait; margin: 0.35in; }
    @page landscape { size: landscape; margin: 0.35in; }
  }
`;

/**
 * 1. Aura Citizen ID (Card Layout)
 */
export function renderAuraIdHtml(citizen: CitizenRecord): string {
  const photo = citizen.portraitData
    ? `<img src="${citizen.portraitData}" style="width:100%;height:100%;object-fit:cover;" alt="Portrait">`
    : `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#DCE0E8;color:#718096;font-size:11px;font-weight:600;">PORTRAIT ON FILE</div>`;

  return `
    <div style="display:flex;flex-direction:column;align-items:center;gap:30px;padding:30px 0;">
      <!-- FRONT SIDE -->
      <div style="width:520px;height:328px;border-radius:18px;background:linear-gradient(135deg, #FAF9FD 0%, #EAE5F5 60%, #DDE6EF 100%);border:1px solid #C4BDD8;box-shadow:0 12px 35px rgba(44,40,73,0.18);position:relative;overflow:hidden;padding:22px;display:flex;flex-direction:column;justify-content:space-between;">
        
        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1.5px solid #9883C8;padding-bottom:10px;">
          <div>
            <div style="font-family:'Cinzel',serif;font-size:13px;font-weight:700;letter-spacing:1px;color:#2C2849;">✦ SOVEREIGN REALM OF MERIDION</div>
            <div style="font-size:9px;font-weight:700;letter-spacing:1.8px;color:#6C5FAC;text-transform:uppercase;">Aura Citizen Identification · Civil Specimen</div>
          </div>
          <div class="gold-seal" style="width:48px;height:48px;font-size:6px;">
            <span>✦</span>
            <span>AURA</span>
          </div>
        </div>

        <!-- Body -->
        <div style="display:flex;gap:18px;align-items:center;margin:12px 0;">
          <div style="width:105px;height:135px;border-radius:10px;border:2px solid #C5AB78;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.15);flex-shrink:0;">
            ${photo}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;font-size:11px;flex:1;">
            <div style="grid-column:1/-1;">
              <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#68758A;letter-spacing:0.8px;">Legal Name</div>
              <div style="font-size:15px;font-weight:700;color:#1E1738;font-family:'Cinzel',serif;">${escapeHtml(citizen.name)}</div>
            </div>
            <div>
              <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#68758A;">Civic Record No.</div>
              <div style="font-weight:700;font-family:'JetBrains Mono',monospace;color:#2C2849;">${escapeHtml(citizen.record)}</div>
            </div>
            <div>
              <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#68758A;">Date of Birth</div>
              <div style="font-weight:600;color:#2C2849;">${escapeHtml(citizen.dob)}</div>
            </div>
            <div>
              <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#68758A;">Home Realm</div>
              <div style="font-weight:600;color:#2C2849;">${escapeHtml(citizen.home)}</div>
            </div>
            <div>
              <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#68758A;">Species / Kind</div>
              <div style="font-weight:600;color:#2C2849;">${escapeHtml(citizen.species)}</div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #C4BDD8;padding-top:8px;font-size:8px;color:#68758A;font-weight:600;letter-spacing:0.5px;">
          <span>STATUS: <strong style="color:#2E7D32;">${escapeHtml(citizen.status || 'VERIFIED')}</strong></span>
          <span>AURA SECURITY CODE: <strong style="font-family:monospace;">${escapeHtml(citizen.passport || 'AUR-901842')}</strong></span>
        </div>
      </div>

      <!-- BACK SIDE -->
      <div style="width:520px;height:328px;border-radius:18px;background:linear-gradient(135deg, #1F1B36 0%, #2A2447 100%);border:1px solid #4D4370;box-shadow:0 12px 35px rgba(44,40,73,0.25);position:relative;overflow:hidden;padding:22px;color:#E6E2F2;display:flex;flex-direction:column;justify-content:space-between;">
        
        <!-- Magnetic Stripe -->
        <div style="height:44px;background:#0F0C1C;margin:-22px -22px 14px -22px;border-bottom:1px solid #3A3258;"></div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:10px;">
          <div>
            <div style="font-size:8px;color:#A59DC2;text-transform:uppercase;">Emergency Contact</div>
            <div style="font-weight:600;color:#FFF;">${escapeHtml(citizen.phone)}</div>
          </div>
          <div>
            <div style="font-size:8px;color:#A59DC2;text-transform:uppercase;">Biometric Telemetry</div>
            <div style="font-weight:600;color:#FFF;">${escapeHtml(citizen.blood)} · ${escapeHtml(citizen.height)}</div>
          </div>
          <div style="grid-column:1/-1;">
            <div style="font-size:8px;color:#A59DC2;text-transform:uppercase;">Residential Jurisdiction</div>
            <div style="font-weight:600;color:#FFF;">${escapeHtml(citizen.address)}</div>
          </div>
        </div>

        <!-- MRZ Zone -->
        <div style="background:#131024;border:1px solid #3C335C;border-radius:8px;padding:8px 12px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:3px;color:#C5AB78;line-height:1.5;">
          I&lt;MRD${(citizen.record || 'MRD0000').replace(/[^A-Z0-9]/gi, '')}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br>
          ${(citizen.dob || '000000').replace(/-/g, '')}4M3409121MRD&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;4
        </div>
      </div>
    </div>
  `;
}

/**
 * 2. Aura Passport (Booklet Spread Layout)
 */
export function renderAuraPassportHtml(citizen: CitizenRecord): string {
  const photo = citizen.portraitData
    ? `<img src="${citizen.portraitData}" style="width:100%;height:100%;object-fit:cover;" alt="Passport Photo">`
    : `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#DCE0E8;font-size:11px;">PHOTO</div>`;

  return `
    <div class="doc-page" style="background:#FAF8F5;">
      <div class="watermark">MERIDION PASSPORT</div>
      
      <!-- Top Sovereignty Title -->
      <div style="text-align:center;border-bottom:2px solid #C5AB78;padding-bottom:18px;margin-bottom:24px;">
        <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;color:#6C5FAC;font-weight:700;">SOVEREIGN REALM OF MERIDION</div>
        <div style="font-family:'Cinzel',serif;font-size:26px;font-weight:800;letter-spacing:2px;color:#2C2849;margin:6px 0;">AURA PASSPORT</div>
        <div style="font-size:10px;letter-spacing:2px;color:#8C7541;text-transform:uppercase;font-weight:600;">PASSEPORT CÉLESTE · DIPLOMATIC &amp; CIVIL TRAVEL BOOKLET</div>
      </div>

      <!-- Royal Request Preamble -->
      <div style="border:1px solid #D8D2C2;background:#FFF;padding:16px 20px;border-radius:8px;margin-bottom:24px;font-style:italic;font-size:12px;line-height:1.6;color:#4A4458;border-left:4px solid #C5AB78;">
        &ldquo;Her Celestial Majesty Maeryn Seraphima and the High Council of Meridion request and require in the Name of the Sovereign Realm all those whom it may concern to allow the bearer to pass freely without let or hindrance and to afford the bearer every assistance and protection of which the bearer may stand in need.&rdquo;
      </div>

      <!-- Biographical Data Grid -->
      <div style="border:2px solid #C5AB78;border-radius:10px;padding:24px;background:#FFFFFF;position:relative;box-shadow:0 4px 18px rgba(0,0,0,0.06);">
        <div style="display:flex;gap:24px;">
          <!-- Photo -->
          <div style="width:130px;height:170px;border:2px solid #C5AB78;border-radius:6px;overflow:hidden;flex-shrink:0;">
            ${photo}
          </div>

          <!-- Fields -->
          <div style="flex:1;display:grid;grid-template-columns:repeat(3, 1fr);gap:12px 18px;font-size:12px;">
            <div style="grid-column:1/-1;">
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Surname &amp; Given Names</div>
              <div style="font-family:'Cinzel',serif;font-size:18px;font-weight:700;color:#2C2849;">${escapeHtml(citizen.name)}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Passport No.</div>
              <div style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#9883C8;">${escapeHtml(citizen.passport || 'AUR-918204')}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Citizen ID</div>
              <div style="font-family:'JetBrains Mono',monospace;font-weight:600;">${escapeHtml(citizen.record)}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Nationality</div>
              <div style="font-weight:600;">MERIDION</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Date of Birth</div>
              <div style="font-weight:600;">${escapeHtml(citizen.dob)}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Place of Birth</div>
              <div style="font-weight:600;">${escapeHtml(citizen.place)}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Species / Choir</div>
              <div style="font-weight:600;">${escapeHtml(citizen.species)}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Issuing Authority</div>
              <div style="font-weight:600;">AURA PASSPORT ADM.</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">PRISM Resonance</div>
              <div style="font-weight:600;">${escapeHtml(citizen.affinity)}</div>
            </div>
          </div>
        </div>

        <!-- ICAO MRZ Strip -->
        <div style="margin-top:24px;border-top:1.5px dashed #C5AB78;padding-top:14px;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:4px;color:#2C2849;line-height:1.6;background:#FAF8F5;padding:10px;border-radius:4px;">
          P&lt;MRD${(citizen.name || 'CITIZEN').toUpperCase().replace(/[^A-Z]/g, '&lt;')}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br>
          ${(citizen.passport || 'AUR000000').replace(/[^A-Z0-9]/g, '')}7MRD${(citizen.dob || '000000').replace(/-/g, '')}9M3409124&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;06
        </div>
      </div>

      <!-- Regional Endorsements & Visas Section -->
      <div style="margin-top:28px;">
        <div style="font-family:'Cinzel',serif;font-size:12px;font-weight:700;color:#6C5FAC;border-bottom:1px solid #D8D2C2;padding-bottom:6px;margin-bottom:14px;">
          REGIONAL TRANSIT ENDORSEMENTS &amp; SEALS
        </div>
        <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:14px;">
          <div style="border:1.5px dashed #4A90E2;border-radius:8px;padding:12px;text-align:center;font-size:10px;color:#2C5282;">
            <div style="font-weight:700;">ORYNVELL</div>
            <div style="font-size:8px;margin:4px 0;">CELESTIAL CROSSING</div>
            <div style="font-family:monospace;font-size:9px;">ENTRY VERIFIED</div>
          </div>
          <div style="border:1.5px dashed #319795;border-radius:8px;padding:12px;text-align:center;font-size:10px;color:#234E52;">
            <div style="font-weight:700;">MARLOWE</div>
            <div style="font-size:8px;margin:4px 0;">WATER VEIL PERMIT</div>
            <div style="font-family:monospace;font-size:9px;">HARBOR CLEAR</div>
          </div>
          <div style="border:1.5px dashed #718096;border-radius:8px;padding:12px;text-align:center;font-size:10px;color:#2D3748;">
            <div style="font-weight:700;">FROSS</div>
            <div style="font-size:8px;margin:4px 0;">NORTHWAKE GLACIAL</div>
            <div style="font-family:monospace;font-size:9px;">TRANSIT PASS</div>
          </div>
          <div style="border:1.5px dashed #DD6B20;border-radius:8px;padding:12px;text-align:center;font-size:10px;color:#7B341E;">
            <div style="font-weight:700;">KAJI</div>
            <div style="font-size:8px;margin:4px 0;">VOLCANO PYRE GATE</div>
            <div style="font-family:monospace;font-size:9px;">AUTHORIZED</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 3. Certificate of Live Birth (Archival Civil Form)
 */
export function renderBirthCertificateHtml(citizen: CitizenRecord): string {
  return `
    <div class="doc-page" style="background:#FCFAF6;border:8px double #C5AB78;">
      <div class="watermark">ARCHIVAL NATIVITY</div>
      
      <!-- Crown Heraldic Header -->
      <div style="text-align:center;margin-bottom:28px;">
        <div style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:4px;color:#8C7541;font-weight:700;">CELESTIAL REALM OF MERIDION</div>
        <div style="font-family:'Cinzel',serif;font-size:26px;font-weight:800;color:#2C2849;margin:8px 0;">CERTIFICATE OF LIVE BIRTH</div>
        <div style="font-size:10px;font-weight:700;letter-spacing:2px;color:#6C5FAC;text-transform:uppercase;">CENTRAL ARCHIVAL REGISTRY OF ORYNVELL · SANCTUARY RECORD</div>
      </div>

      <!-- Registration Number Box -->
      <div style="display:flex;justify-content:space-between;border-bottom:2px solid #2C2849;padding-bottom:10px;margin-bottom:24px;font-size:11px;">
        <div>REGISTRY NUMBER: <strong style="font-family:'JetBrains Mono',monospace;">BIR-${escapeHtml(citizen.record)}</strong></div>
        <div>SOLAR CYCLE: <strong>FOUNDING ERA</strong></div>
        <div>PAGE: <strong>1 OF 1</strong></div>
      </div>

      <!-- Main Nativity Details -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;font-size:13px;line-height:1.6;margin-bottom:30px;">
        <div style="grid-column:1/-1;border-bottom:1px solid #E2D9C8;padding-bottom:12px;">
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Full Legal Name of Child</div>
          <div style="font-family:'Cinzel',serif;font-size:22px;font-weight:700;color:#1E1738;">${escapeHtml(citizen.name)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Date of Birth</div>
          <div style="font-weight:600;">${escapeHtml(citizen.dob)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Place of Nativity / Facility</div>
          <div style="font-weight:600;">${escapeHtml(citizen.place)} (Sanctuary Records)</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Ancestral Lineage / Heritage</div>
          <div style="font-weight:600;">${escapeHtml(citizen.ancestry)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Species Classification</div>
          <div style="font-weight:600;">${escapeHtml(citizen.species)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Elemental Affinity / Resonance</div>
          <div style="font-weight:600;">${escapeHtml(citizen.affinity)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Power Source</div>
          <div style="font-weight:600;">${escapeHtml(citizen.powerSource)}</div>
        </div>
      </div>

      <!-- Attestation & Seal -->
      <div style="margin-top:60px;display:flex;justify-content:space-between;align-items:flex-end;">
        <div style="font-size:11px;color:#555;line-height:1.6;max-width:320px;">
          I hereby certify that the child named above was born alive at the place and date stated, registered in accordance with the Celestial Code of Meridion.
          <div style="margin-top:20px;border-top:1px solid #443869;padding-top:6px;font-weight:700;color:#2C2849;">
            REGISTRAR GENERAL OF CIVIC ARCHIVES
          </div>
        </div>

        <div class="gold-seal" style="width:90px;height:90px;font-size:8px;">
          <span>✦</span>
          <span>SEAL OF</span>
          <span>ORYNVELL</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * 4. Ten-Print Fingerprint Form (Biometric Sheet)
 */
export function renderFingerprintFormHtml(citizen: CitizenRecord): string {
  const seed = citizen.biometricSeed || citizen.record;
  const fingerNames = ['Thumb', 'Index', 'Middle', 'Ring', 'Little'];

  return `
    <div class="doc-page doc-landscape" style="background:#FFFFFF;">
      <div class="watermark">FORENSIC SPECIMEN</div>
      
      <!-- Forensic Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #2C2849;padding-bottom:14px;margin-bottom:18px;">
        <div>
          <div style="font-family:'Cinzel',serif;font-size:18px;font-weight:800;letter-spacing:1px;color:#2C2849;">DGAOS // TACTICAL FORENSIC BIOMETRIC ARCHIVE</div>
          <div style="font-size:10px;font-weight:700;color:#6C5FAC;letter-spacing:1.5px;text-transform:uppercase;">FORM TRACE-10-PRINT · DERMAL IMPRESSION REGISTRATION</div>
        </div>
        <div style="text-align:right;font-size:10px;font-family:'JetBrains Mono',monospace;">
          <div>SPECIMEN ID: <strong>BIO-${escapeHtml(citizen.record)}</strong></div>
          <div>CUSTODY: <strong>DGAOS EYES RECORD</strong></div>
        </div>
      </div>

      <!-- Subject Summary Strip -->
      <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:12px;background:#F8F6FC;border:1px solid #D5CEE4;border-radius:6px;padding:10px 14px;margin-bottom:20px;font-size:11px;">
        <div><span style="color:#718096;font-size:9px;display:block;">SUBJECT NAME</span><strong>${escapeHtml(citizen.name)}</strong></div>
        <div><span style="color:#718096;font-size:9px;display:block;">CIVIC NUMBER</span><strong>${escapeHtml(citizen.record)}</strong></div>
        <div><span style="color:#718096;font-size:9px;display:block;">SPECIES</span><strong>${escapeHtml(citizen.species)}</strong></div>
        <div><span style="color:#718096;font-size:9px;display:block;">CLEARANCE</span><strong>${escapeHtml(citizen.clearance)}</strong></div>
        <div><span style="color:#718096;font-size:9px;display:block;">COLLECTION STATUS</span><strong style="color:#2E7D32;">VERIFIED</strong></div>
      </div>

      <!-- 10-Print Grid -->
      <div style="margin-bottom:18px;">
        <!-- Right Hand -->
        <div style="font-size:11px;font-weight:700;color:#2C2849;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.8px;">1. RIGHT HAND (DIGITS 1 TO 5)</div>
        <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:10px;margin-bottom:16px;">
          ${[0, 1, 2, 3, 4].map(i => `
            <div style="border:1.5px solid #2C2849;border-radius:4px;background:#FFF;padding:6px;text-align:center;">
              <div style="height:105px;display:flex;align-items:center;justify-content:center;">
                ${getFingerprintSvg(seed, i)}
              </div>
              <div style="border-top:1px solid #D5CEE4;margin-top:4px;padding-top:4px;font-size:9px;font-weight:700;color:#4A5568;">
                R. ${fingerNames[i]}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Left Hand -->
        <div style="font-size:11px;font-weight:700;color:#2C2849;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.8px;">2. LEFT HAND (DIGITS 6 TO 10)</div>
        <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:10px;">
          ${[5, 6, 7, 8, 9].map(i => `
            <div style="border:1.5px solid #2C2849;border-radius:4px;background:#FFF;padding:6px;text-align:center;">
              <div style="height:105px;display:flex;align-items:center;justify-content:center;">
                ${getFingerprintSvg(seed, i)}
              </div>
              <div style="border-top:1px solid #D5CEE4;margin-top:4px;padding-top:4px;font-size:9px;font-weight:700;color:#4A5568;">
                L. ${fingerNames[i - 5]}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Forensic Footer Attestation -->
      <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #2C2849;padding-top:10px;font-size:10px;color:#666;">
        <div>METHOD: PROCEDURAL DERMAL RECONSTRUCTION · VERIFIED DETERMINISTIC</div>
        <div>RECORDING EXAMINER: <strong>DGAOS FORENSIC UNIT 07</strong></div>
      </div>
    </div>
  `;
}

/**
 * 5. Investigative Subject Profile (DGAOS Tactical Dossier)
 */
export function renderInvestigativeProfileHtml(citizen: CitizenRecord): string {
  const photo = citizen.portraitData
    ? `<img src="${citizen.portraitData}" style="width:100%;height:100%;object-fit:cover;" alt="Dossier Photo">`
    : `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#1E1838;color:#A59DC2;font-size:11px;">NO PHOTO</div>`;

  return `
    <div class="doc-page" style="background:#FFFFFF;">
      <div class="watermark">DGAOS CLASSIFIED</div>
      
      <!-- Top Classification Banner -->
      <div style="background:#1C1635;color:#E6E2F2;padding:12px 18px;border-radius:6px;display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
        <div>
          <div style="font-size:9px;letter-spacing:2px;font-weight:700;color:#C5AB78;">DEPARTMENT OF GLOBAL AFFAIRS // EYES DIVISION</div>
          <div style="font-family:'Cinzel',serif;font-size:18px;font-weight:800;letter-spacing:1px;color:#FFFFFF;">INVESTIGATIVE SUBJECT PROFILE</div>
        </div>
        <div style="text-align:right;">
          <span style="background:#C53030;color:white;font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;letter-spacing:1px;">RESTRICTED</span>
        </div>
      </div>

      <!-- Dossier Metadata -->
      <div style="display:flex;gap:24px;border-bottom:1.5px solid #2C2849;padding-bottom:20px;margin-bottom:20px;">
        <div style="width:130px;height:165px;border:2px solid #2C2849;border-radius:6px;overflow:hidden;flex-shrink:0;">
          ${photo}
        </div>
        <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:10px 16px;font-size:12px;">
          <div style="grid-column:1/-1;">
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Primary Subject Name</div>
            <div style="font-size:20px;font-weight:700;color:#2C2849;font-family:'Cinzel',serif;">${escapeHtml(citizen.name)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Master Civic ID</div>
            <div style="font-weight:700;font-family:'JetBrains Mono',monospace;">${escapeHtml(citizen.record)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Aliases / Monikers</div>
            <div style="font-weight:600;">${escapeHtml(citizen.alias || 'None verified')}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Clearance Level</div>
            <div style="font-weight:700;color:#C53030;">${escapeHtml(citizen.clearance)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Resonance Threat Matrix</div>
            <div style="font-weight:600;">${escapeHtml(citizen.affinity)}</div>
          </div>
        </div>
      </div>

      <!-- Case Links & Investigative Notes -->
      <div style="display:flex;flex-direction:column;gap:16px;font-size:12px;">
        <div style="border:1px solid #E2E8F0;border-radius:6px;padding:14px;background:#F8FAFC;">
          <div style="font-size:10px;font-weight:700;color:#2C2849;text-transform:uppercase;margin-bottom:6px;">Known Case Activity &amp; Inquiries</div>
          <div style="line-height:1.6;color:#334155;">${escapeHtml(citizen.links || 'No ongoing warrants active.')}</div>
        </div>

        <div style="border:1px solid #E2E8F0;border-radius:6px;padding:14px;background:#F8FAFC;">
          <div style="font-size:10px;font-weight:700;color:#2C2849;text-transform:uppercase;margin-bottom:6px;">Registration &amp; Surveillance History</div>
          <div style="line-height:1.6;color:#334155;">${escapeHtml(citizen.history || 'Standard civic onboarding completed.')}</div>
        </div>

        <div style="border:1px solid #E2E8F0;border-radius:6px;padding:14px;background:#F8FAFC;">
          <div style="font-size:10px;font-weight:700;color:#2C2849;text-transform:uppercase;margin-bottom:6px;">Known Associates &amp; Household Network</div>
          <div style="line-height:1.6;color:#334155;">${escapeHtml(citizen.relationships || 'No suspicious associates cataloged.')}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 6. Residency Record (Municipal Housing & Domicile)
 */
export function renderResidencyRecordHtml(citizen: CitizenRecord): string {
  return `
    <div class="doc-page" style="background:#FFFFFF;">
      <div class="watermark">MUNICIPAL HOUSING</div>
      
      <!-- Municipal Header -->
      <div style="border-bottom:3px double #2C2849;padding-bottom:16px;margin-bottom:24px;">
        <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;color:#6C5FAC;font-weight:700;">MUNICIPALITY OF AURELINE · HOMECRAFT HOUSING AUTHORITY</div>
        <div style="font-family:'Cinzel',serif;font-size:24px;font-weight:800;color:#2C2849;margin:6px 0;">OFFICIAL DOMICILE &amp; RESIDENCY CERTIFICATE</div>
        <div style="font-size:10px;color:#718096;text-transform:uppercase;font-weight:600;">HOUSING REGISTRATION NO: RES-${escapeHtml(citizen.record)}</div>
      </div>

      <!-- Domicile Details Grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px 24px;font-size:13px;line-height:1.6;margin-bottom:32px;">
        <div style="grid-column:1/-1;background:#F8F6FC;padding:14px;border-radius:6px;border:1px solid #D5CEE4;">
          <div style="font-size:10px;font-weight:700;color:#6C5FAC;text-transform:uppercase;">Registered Occupant</div>
          <div style="font-family:'Cinzel',serif;font-size:18px;font-weight:700;color:#2C2849;">${escapeHtml(citizen.name)}</div>
          <div style="font-size:11px;color:#666;">CIVIC ID: ${escapeHtml(citizen.record)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#718096;text-transform:uppercase;">Primary Residence Address</div>
          <div style="font-weight:600;color:#2C2849;">${escapeHtml(citizen.address)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#718096;text-transform:uppercase;">Municipal Service District</div>
          <div style="font-weight:600;color:#2C2849;">${escapeHtml(citizen.district)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#718096;text-transform:uppercase;">Housing Category</div>
          <div style="font-weight:600;color:#2C2849;">${escapeHtml(citizen.residency)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#718096;text-transform:uppercase;">Regional Jurisdiction</div>
          <div style="font-weight:600;color:#2C2849;">${escapeHtml(citizen.home)}</div>
        </div>
      </div>

      <!-- Domicile Verification Stamp -->
      <div style="border:1px solid #C4BDD8;padding:18px;border-radius:8px;background:#FAF9FD;font-size:12px;color:#4A4458;line-height:1.6;">
        <div style="font-weight:700;color:#2C2849;margin-bottom:6px;">ENERGY &amp; AETHER GRID COMPLIANCE</div>
        This premise is connected to the Aureline Core Grid. Occupancy rights are registered in full standing with no outstanding structural or noise violations reported.
      </div>
    </div>
  `;
}

/**
 * 7. Physical Identification Sheet
 */
export function renderPhysicalSheetHtml(citizen: CitizenRecord): string {
  const photo = citizen.portraitData
    ? `<img src="${citizen.portraitData}" style="width:100%;height:100%;object-fit:cover;" alt="Identification Photo">`
    : `<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#DCE0E8;font-size:11px;">PHOTO</div>`;

  return `
    <div class="doc-page" style="background:#FFFFFF;">
      <div class="watermark">PHYSICAL AUDIT</div>
      
      <!-- Header -->
      <div style="border-bottom:2px solid #2C2849;padding-bottom:14px;margin-bottom:24px;">
        <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;color:#6C5FAC;font-weight:700;">MERIDION CLINICAL &amp; CIVIL IDENTIFICATION BUREAU</div>
        <div style="font-family:'Cinzel',serif;font-size:22px;font-weight:800;color:#2C2849;margin:6px 0;">PHYSICAL IDENTIFICATION SHEET</div>
        <div style="font-size:10px;color:#718096;text-transform:uppercase;font-weight:600;">BIOMETRIC PROFILE &amp; DISTINCTIVE MARKS REGISTER</div>
      </div>

      <!-- Photo & Physical Stats -->
      <div style="display:flex;gap:24px;margin-bottom:28px;">
        <div style="width:130px;height:165px;border:2px solid #2C2849;border-radius:6px;overflow:hidden;flex-shrink:0;">
          ${photo}
        </div>
        <div style="flex:1;display:grid;grid-template-columns:repeat(3, 1fr);gap:12px 18px;font-size:12px;">
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Height</div>
            <div style="font-weight:600;">${escapeHtml(citizen.height)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Build</div>
            <div style="font-weight:600;">${escapeHtml(citizen.build)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Eye Color</div>
            <div style="font-weight:600;">${escapeHtml(citizen.eyes)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Hair Color &amp; Style</div>
            <div style="font-weight:600;">${escapeHtml(citizen.hair)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Blood Classification</div>
            <div style="font-weight:600;">${escapeHtml(citizen.blood)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Species / Physiology</div>
            <div style="font-weight:600;">${escapeHtml(citizen.species)}</div>
          </div>
        </div>
      </div>

      <!-- Scars and Markings Table -->
      <div style="border:1px solid #CBD5E1;border-radius:6px;overflow:hidden;margin-bottom:24px;">
        <div style="background:#F1F5F9;padding:10px 14px;font-size:11px;font-weight:700;color:#1E293B;border-bottom:1px solid #CBD5E1;">
          DISTINCTIVE IDENTIFIERS, SCARS &amp; PHYSIOLOGICAL ANOMALIES
        </div>
        <div style="padding:14px;font-size:12px;line-height:1.6;color:#334155;">
          ${escapeHtml(citizen.mark || 'No unusual physical marks, tattoos, or dermal anomalies recorded at enrollment.')}
        </div>
      </div>
    </div>
  `;
}

/**
 * 8. Medical Identity Summary (Faith Medical Group)
 */
export function renderMedicalSummaryHtml(citizen: CitizenRecord): string {
  return `
    <div class="doc-page" style="background:#FFFFFF;">
      <div class="watermark">FAITH MEDICAL</div>
      
      <!-- Clinical Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0D9488;padding-bottom:14px;margin-bottom:24px;">
        <div>
          <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;color:#0D9488;font-weight:700;">FAITH MEDICAL GROUP · HEALING COURT OF AURELINE</div>
          <div style="font-family:'Cinzel',serif;font-size:22px;font-weight:800;color:#2C2849;margin:6px 0;">MEDICAL IDENTITY SUMMARY</div>
          <div style="font-size:10px;color:#64748B;text-transform:uppercase;font-weight:600;">EMERGENCY &amp; BIOLOGICAL PROFILE (NOT FULL CLINICAL CHART)</div>
        </div>
        <div style="text-align:right;font-size:10px;font-family:'JetBrains Mono',monospace;">
          <div>RECORD NO: <strong>MED-${escapeHtml(citizen.record)}</strong></div>
          <div style="color:#0D9488;">FACILITY: FAITH AURELINE</div>
        </div>
      </div>

      <!-- Patient Vitals Strip -->
      <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:14px;background:#F0FDFA;border:1px solid #99F6E4;border-radius:8px;padding:14px;margin-bottom:24px;font-size:12px;">
        <div><span style="color:#64748B;font-size:9px;display:block;">PATIENT</span><strong>${escapeHtml(citizen.name)}</strong></div>
        <div><span style="color:#64748B;font-size:9px;display:block;">DATE OF BIRTH</span><strong>${escapeHtml(citizen.dob)}</strong></div>
        <div><span style="color:#64748B;font-size:9px;display:block;">BLOOD GROUP</span><strong>${escapeHtml(citizen.blood)}</strong></div>
        <div><span style="color:#64748B;font-size:9px;display:block;">INTAKE STATUS</span><strong style="color:#0F766E;">${escapeHtml(citizen.medical)}</strong></div>
      </div>

      <!-- Elemental Resilience & Clinical Notes -->
      <div style="display:flex;flex-direction:column;gap:18px;font-size:12px;line-height:1.6;">
        <div style="border:1px solid #E2E8F0;border-radius:6px;padding:14px;">
          <div style="font-size:10px;font-weight:700;color:#0D9488;text-transform:uppercase;margin-bottom:6px;">Elemental Resilience &amp; Physiology</div>
          <div>Species alignment: <strong>${escapeHtml(citizen.species)}</strong>. Power source resonance: <strong>${escapeHtml(citizen.powerSource)}</strong>. Cellular healing response normal.</div>
        </div>

        <div style="border:1px solid #E2E8F0;border-radius:6px;padding:14px;">
          <div style="font-size:10px;font-weight:700;color:#0D9488;text-transform:uppercase;margin-bottom:6px;">Emergency Notification Directives</div>
          <div>Primary communication line: <strong>${escapeHtml(citizen.phone)}</strong>. Registered residence: <strong>${escapeHtml(citizen.address)}</strong>.</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 9. Education & Employment Record (Cyacademy & WORKNET)
 */
export function renderEducationEmploymentHtml(citizen: CitizenRecord): string {
  return `
    <div class="doc-page" style="background:#FFFFFF;">
      <div class="watermark">CYACADEMY / WORKNET</div>
      
      <!-- Header -->
      <div style="border-bottom:2px solid #2C2849;padding-bottom:14px;margin-bottom:24px;">
        <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;color:#C5AB78;font-weight:700;">CYACADEMY REGISTRAR · WORKNET CAREER SERVICES</div>
        <div style="font-family:'Cinzel',serif;font-size:22px;font-weight:800;color:#2C2849;margin:6px 0;">ACADEMIC &amp; EMPLOYMENT SERVICE RECORD</div>
        <div style="font-size:10px;color:#718096;text-transform:uppercase;font-weight:600;">INSTITUTIONAL ACCREDITATION &amp; CAREER PROFILE</div>
      </div>

      <!-- Subject Summary -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;background:#FAF8F5;border:1px solid #E5DFD3;border-radius:6px;padding:14px;margin-bottom:24px;font-size:12px;">
        <div><span style="color:#718096;font-size:9px;display:block;">INDIVIDUAL NAME</span><strong style="font-size:15px;">${escapeHtml(citizen.name)}</strong></div>
        <div><span style="color:#718096;font-size:9px;display:block;">CIVIC ID NUMBER</span><strong style="font-family:monospace;">${escapeHtml(citizen.record)}</strong></div>
      </div>

      <!-- Academic Record Section -->
      <div style="border:1px solid #E2E8F0;border-radius:6px;padding:16px;margin-bottom:20px;font-size:12px;">
        <div style="font-family:'Cinzel',serif;font-weight:700;color:#2C2849;font-size:13px;border-bottom:1px solid #E2E8F0;padding-bottom:6px;margin-bottom:10px;">
          1. ACADEMIC ENROLLMENT &amp; QUALIFICATIONS
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;line-height:1.6;">
          <div>Institution: <strong>Cyacademy Central Campus, Aureline</strong></div>
          <div>Academic House: <strong>${escapeHtml(citizen.category.includes('student') ? 'Active Trainee' : 'Completed Curriculum')}</strong></div>
          <div>Specialization / Talents: <strong>${escapeHtml(citizen.abilities)}</strong></div>
          <div>Aura Calibration: <strong>Certified Standard</strong></div>
        </div>
      </div>

      <!-- Professional Service Section -->
      <div style="border:1px solid #E2E8F0;border-radius:6px;padding:16px;font-size:12px;">
        <div style="font-family:'Cinzel',serif;font-weight:700;color:#2C2849;font-size:13px;border-bottom:1px solid #E2E8F0;padding-bottom:6px;margin-bottom:10px;">
          2. WORKNET VERIFIED EMPLOYMENT HISTORY
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;line-height:1.6;">
          <div>Verified Occupation: <strong>${escapeHtml(citizen.occupation)}</strong></div>
          <div>Affiliated Entity: <strong>${escapeHtml(citizen.affiliation)}</strong></div>
          <div>Clearance Status: <strong>${escapeHtml(citizen.clearance)}</strong></div>
          <div>Institutional Standing: <strong style="color:#2E7D32;">ACTIVE / IN GOOD STANDING</strong></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Compiles a single complete standalone HTML document for any of the 9 types.
 */
export function buildSingleDocumentHtml(docType: number, citizen: CitizenRecord): string {
  let content = '';
  let title = '';

  switch (docType) {
    case 1:
      content = renderAuraIdHtml(citizen);
      title = `Aura Citizen ID - ${citizen.name}`;
      break;
    case 2:
      content = renderAuraPassportHtml(citizen);
      title = `Aura Passport - ${citizen.name}`;
      break;
    case 3:
      content = renderBirthCertificateHtml(citizen);
      title = `Birth Certificate - ${citizen.name}`;
      break;
    case 4:
      content = renderFingerprintFormHtml(citizen);
      title = `Ten-Print Biometric Record - ${citizen.name}`;
      break;
    case 5:
      content = renderInvestigativeProfileHtml(citizen);
      title = `Investigative Subject Profile - ${citizen.name}`;
      break;
    case 6:
      content = renderResidencyRecordHtml(citizen);
      title = `Residency Record - ${citizen.name}`;
      break;
    case 7:
      content = renderPhysicalSheetHtml(citizen);
      title = `Physical Identification Sheet - ${citizen.name}`;
      break;
    case 8:
      content = renderMedicalSummaryHtml(citizen);
      title = `Medical Identity Summary - ${citizen.name}`;
      break;
    case 9:
      content = renderEducationEmploymentHtml(citizen);
      title = `Education & Employment Record - ${citizen.name}`;
      break;
    default:
      content = renderAuraIdHtml(citizen);
      title = `Aura Citizen ID - ${citizen.name}`;
  }

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>${COMMON_STYLES}</style>
</head>
<body>
  <div class="print-actions">
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
  ${content}
</body>
</html>`;
}

/**
 * Compiles the entire Nine-Document Packet into a single combined multi-page document
 * with standardized print page-breaks ready for individual or booklet PDF creation!
 */
export function buildFullPacketHtml(citizen: CitizenRecord): string {
  const title = `Meridion Nine-Document Packet - ${citizen.name} (${citizen.record})`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>${COMMON_STYLES}</style>
</head>
<body>
  <div class="print-actions">
    <button class="print-btn" onclick="window.print()">Print Complete 9-Document Packet (PDF)</button>
  </div>

  <!-- Document 1: Aura Citizen ID -->
  <div class="doc-page">
    <div style="font-family:'Cinzel',serif;font-size:12px;font-weight:700;color:#6C5FAC;margin-bottom:10px;">DOCUMENT 1 OF 9 · AURA CITIZEN IDENTIFICATION CARD</div>
    ${renderAuraIdHtml(citizen)}
  </div>

  <!-- Document 2: Aura Passport -->
  ${renderAuraPassportHtml(citizen)}

  <!-- Document 3: Birth Certificate -->
  ${renderBirthCertificateHtml(citizen)}

  <!-- Document 4: Ten-Print Biometric Form -->
  ${renderFingerprintFormHtml(citizen)}

  <!-- Document 5: Investigative Subject Profile -->
  ${renderInvestigativeProfileHtml(citizen)}

  <!-- Document 6: Residency Record -->
  ${renderResidencyRecordHtml(citizen)}

  <!-- Document 7: Physical Identification Sheet -->
  ${renderPhysicalSheetHtml(citizen)}

  <!-- Document 8: Medical Identity Summary -->
  ${renderMedicalSummaryHtml(citizen)}

  <!-- Document 9: Education & Employment Record -->
  ${renderEducationEmploymentHtml(citizen)}
</body>
</html>`;
}

/**
 * Helper to trigger an immediate browser file download of an HTML document.
 */
export function triggerHtmlDownload(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Saves an immutable snapshot of an issued document into localStorage.
 */
export function recordIssuedSnapshot(snapshot: Omit<IssuedDocumentSnapshot, 'id' | 'hash'>): IssuedDocumentSnapshot {
  const STORE = 'miraverse-issued-documents';
  const id = `ISSUE-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
  const hash = Math.random().toString(36).substring(2, 12).toUpperCase();
  const record: IssuedDocumentSnapshot = { ...snapshot, id, hash };

  try {
    const list: IssuedDocumentSnapshot[] = JSON.parse(localStorage.getItem(STORE) || '[]');
    list.unshift(record);
    localStorage.setItem(STORE, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to log document issuance snapshot:', err);
  }

  return record;
}
