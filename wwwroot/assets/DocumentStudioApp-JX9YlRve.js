import{r as v,j as i}from"./framer-motion-CI5Hau7M.js";import{P as J,M as K}from"./maidIdentityService-D4rOJZnI.js";import{F as P,b as Z,D as $,a9 as W,U as q,ad as Q,S as L,Y as X,aO as ee,z as te,bb as ie,aa as oe,a5 as re,bc as se}from"./lucide-icons-DcAvXqU2.js";import"./index-DDav50d_.js";function t(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function M(e,s){const o=String(e).split("").reduce((p,m)=>p*31+m.charCodeAt(0)>>>0,2166136261)+(s+1)*92821,d=o%37-18,l=45+o%7-3,c=44+(o>>>4)%7-3;let x="";for(let p=0;p<15;p++){const m=6+p*2.13,u=10+p*2.5;x+=`<ellipse cx="${l}" cy="${c}" rx="${m}" ry="${u}" fill="none" stroke="#2C2849" stroke-width="0.8" opacity="${(.9-p*.026).toFixed(2)}" transform="rotate(${d} ${l} ${c})" stroke-dasharray="${(o+p)%5===0?"34 3 48 2":"210"}"/>`}return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 100" class="w-full h-full"><rect width="90" height="100" fill="#FFFFFF"/>${x}<text x="5" y="95" font-family="sans-serif" font-size="5" fill="#888899">SIMULATED</text></svg>`}const B=`
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
`;function h(e){return`
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
            ${e.portraitData?`<img src="${e.portraitData}" style="width:100%;height:100%;object-fit:cover;" alt="Portrait">`:'<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#DCE0E8;color:#718096;font-size:11px;font-weight:600;">PORTRAIT ON FILE</div>'}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;font-size:11px;flex:1;">
            <div style="grid-column:1/-1;">
              <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#68758A;letter-spacing:0.8px;">Legal Name</div>
              <div style="font-size:15px;font-weight:700;color:#1E1738;font-family:'Cinzel',serif;">${t(e.name)}</div>
            </div>
            <div>
              <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#68758A;">Official MAID</div>
              <div style="font-weight:700;font-family:'JetBrains Mono',monospace;color:#2C2849;">${t(e.maid||e.record)}</div>
              ${e.maid&&e.record!==e.maid?`<div style="font-size:7px;color:#8A95A5;">Legacy: ${t(e.record)}</div>`:""}
            </div>
            <div>
              <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#68758A;">Date of Birth</div>
              <div style="font-weight:600;color:#2C2849;">${t(e.dob)}</div>
            </div>
            <div>
              <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#68758A;">Home Realm</div>
              <div style="font-weight:600;color:#2C2849;">${t(e.home)}</div>
            </div>
            <div>
              <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#68758A;">Species / Kind</div>
              <div style="font-weight:600;color:#2C2849;">${t(e.species)}</div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #C4BDD8;padding-top:8px;font-size:8px;color:#68758A;font-weight:600;letter-spacing:0.5px;">
          <span>STATUS: <strong style="color:#2E7D32;">${t(e.status||"VERIFIED")}</strong></span>
          <span>AURA SECURITY CODE: <strong style="font-family:monospace;">${t(e.passport||"AUR-901842")}</strong></span>
        </div>
      </div>

      <!-- BACK SIDE -->
      <div style="width:520px;height:328px;border-radius:18px;background:linear-gradient(135deg, #1F1B36 0%, #2A2447 100%);border:1px solid #4D4370;box-shadow:0 12px 35px rgba(44,40,73,0.25);position:relative;overflow:hidden;padding:22px;color:#E6E2F2;display:flex;flex-direction:column;justify-content:space-between;">
        
        <!-- Magnetic Stripe -->
        <div style="height:44px;background:#0F0C1C;margin:-22px -22px 14px -22px;border-bottom:1px solid #3A3258;"></div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:10px;">
          <div>
            <div style="font-size:8px;color:#A59DC2;text-transform:uppercase;">Emergency Contact</div>
            <div style="font-weight:600;color:#FFF;">${t(e.phone)}</div>
          </div>
          <div>
            <div style="font-size:8px;color:#A59DC2;text-transform:uppercase;">Biometric Telemetry</div>
            <div style="font-weight:600;color:#FFF;">${t(e.blood)} · ${t(e.height)}</div>
          </div>
          <div style="grid-column:1/-1;">
            <div style="font-size:8px;color:#A59DC2;text-transform:uppercase;">Residential Jurisdiction</div>
            <div style="font-weight:600;color:#FFF;">${t(e.address)}</div>
          </div>
        </div>

        <!-- MRZ Zone -->
        <div style="background:#131024;border:1px solid #3C335C;border-radius:8px;padding:8px 12px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:3px;color:#C5AB78;line-height:1.5;">
          I&lt;MRD${(e.maid||e.record||"MRD0000").replace(/[^A-Z0-9]/gi,"")}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br>
          ${(e.dob||"000000").replace(/-/g,"")}4M3409121MRD&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;4
        </div>
      </div>
    </div>
  `}function E(e){return`
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
            ${e.portraitData?`<img src="${e.portraitData}" style="width:100%;height:100%;object-fit:cover;" alt="Passport Photo">`:'<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#DCE0E8;font-size:11px;">PHOTO</div>'}
          </div>

          <!-- Fields -->
          <div style="flex:1;display:grid;grid-template-columns:repeat(3, 1fr);gap:12px 18px;font-size:12px;">
            <div style="grid-column:1/-1;">
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Surname &amp; Given Names</div>
              <div style="font-family:'Cinzel',serif;font-size:18px;font-weight:700;color:#2C2849;">${t(e.name)}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Passport No.</div>
              <div style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#9883C8;">${t(e.passport||"AUR-918204")}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Official MAID</div>
              <div style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#2C2849;">${t(e.maid||e.record)}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Nationality</div>
              <div style="font-weight:600;">MERIDION</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Date of Birth</div>
              <div style="font-weight:600;">${t(e.dob)}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Place of Birth</div>
              <div style="font-weight:600;">${t(e.place)}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Species / Choir</div>
              <div style="font-weight:600;">${t(e.species)}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Issuing Authority</div>
              <div style="font-weight:600;">AURA PASSPORT ADM.</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">PRISM Resonance</div>
              <div style="font-weight:600;">${t(e.affinity)}</div>
            </div>
          </div>
        </div>

        <!-- ICAO MRZ Strip -->
        <div style="margin-top:24px;border-top:1.5px dashed #C5AB78;padding-top:14px;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:4px;color:#2C2849;line-height:1.6;background:#FAF8F5;padding:10px;border-radius:4px;">
          P&lt;MRD${(e.name||"CITIZEN").toUpperCase().replace(/[^A-Z]/g,"&lt;")}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br>
          ${(e.passport||"AUR000000").replace(/[^A-Z0-9]/g,"")}7MRD${(e.dob||"000000").replace(/-/g,"")}9M3409124&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;06
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
  `}function A(e){return`
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
        <div>OFFICIAL MAID: <strong style="font-family:'JetBrains Mono',monospace;">${t(e.maid||`BIR-${e.record}`)}</strong>${e.maid&&e.record!==e.maid?`<span style="font-size:9px;color:#718096;margin-left:8px;">(Legacy: ${t(e.record)})</span>`:""}</div>
        <div>SOLAR CYCLE: <strong>FOUNDING ERA</strong></div>
        <div>PAGE: <strong>1 OF 1</strong></div>
      </div>

      <!-- Main Nativity Details -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;font-size:13px;line-height:1.6;margin-bottom:30px;">
        <div style="grid-column:1/-1;border-bottom:1px solid #E2D9C8;padding-bottom:12px;">
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Full Legal Name of Child</div>
          <div style="font-family:'Cinzel',serif;font-size:22px;font-weight:700;color:#1E1738;">${t(e.name)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Date of Birth</div>
          <div style="font-weight:600;">${t(e.dob)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Place of Nativity / Facility</div>
          <div style="font-weight:600;">${t(e.place)} (Sanctuary Records)</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Ancestral Lineage / Heritage</div>
          <div style="font-weight:600;">${t(e.ancestry)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Species Classification</div>
          <div style="font-weight:600;">${t(e.species)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Elemental Affinity / Resonance</div>
          <div style="font-weight:600;">${t(e.affinity)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Power Source</div>
          <div style="font-weight:600;">${t(e.powerSource)}</div>
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
  `}function I(e){const s=e.biometricSeed||e.record,o=["Thumb","Index","Middle","Ring","Little"];return`
    <div class="doc-page doc-landscape" style="background:#FFFFFF;">
      <div class="watermark">FORENSIC SPECIMEN</div>
      
      <!-- Forensic Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #2C2849;padding-bottom:14px;margin-bottom:18px;">
        <div>
          <div style="font-family:'Cinzel',serif;font-size:18px;font-weight:800;letter-spacing:1px;color:#2C2849;">DGAOS // TACTICAL FORENSIC BIOMETRIC ARCHIVE</div>
          <div style="font-size:10px;font-weight:700;color:#6C5FAC;letter-spacing:1.5px;text-transform:uppercase;">FORM TRACE-10-PRINT · DERMAL IMPRESSION REGISTRATION</div>
        </div>
        <div style="text-align:right;font-size:10px;font-family:'JetBrains Mono',monospace;">
          <div>SPECIMEN ID: <strong>BIO-${t(e.maid||e.record)}</strong></div>
          <div>CUSTODY: <strong>DGAOS EYES RECORD</strong></div>
        </div>
      </div>

      <!-- Subject Summary Strip -->
      <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:12px;background:#F8F6FC;border:1px solid #D5CEE4;border-radius:6px;padding:10px 14px;margin-bottom:20px;font-size:11px;">
        <div><span style="color:#718096;font-size:9px;display:block;">SUBJECT NAME</span><strong>${t(e.name)}</strong></div>
        <div><span style="color:#718096;font-size:9px;display:block;">OFFICIAL MAID</span><strong>${t(e.maid||e.record)}</strong>${e.maid&&e.record!==e.maid?`<span style="font-size:8px;color:#718096;display:block;">Legacy: ${t(e.record)}</span>`:""}</div>
        <div><span style="color:#718096;font-size:9px;display:block;">SPECIES</span><strong>${t(e.species)}</strong></div>
        <div><span style="color:#718096;font-size:9px;display:block;">CLEARANCE</span><strong>${t(e.clearance)}</strong></div>
        <div><span style="color:#718096;font-size:9px;display:block;">COLLECTION STATUS</span><strong style="color:#2E7D32;">VERIFIED</strong></div>
      </div>

      <!-- 10-Print Grid -->
      <div style="margin-bottom:18px;">
        <!-- Right Hand -->
        <div style="font-size:11px;font-weight:700;color:#2C2849;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.8px;">1. RIGHT HAND (DIGITS 1 TO 5)</div>
        <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:10px;margin-bottom:16px;">
          ${[0,1,2,3,4].map(d=>`
            <div style="border:1.5px solid #2C2849;border-radius:4px;background:#FFF;padding:6px;text-align:center;">
              <div style="height:105px;display:flex;align-items:center;justify-content:center;">
                ${M(s,d)}
              </div>
              <div style="border-top:1px solid #D5CEE4;margin-top:4px;padding-top:4px;font-size:9px;font-weight:700;color:#4A5568;">
                R. ${o[d]}
              </div>
            </div>
          `).join("")}
        </div>

        <!-- Left Hand -->
        <div style="font-size:11px;font-weight:700;color:#2C2849;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.8px;">2. LEFT HAND (DIGITS 6 TO 10)</div>
        <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:10px;">
          ${[5,6,7,8,9].map(d=>`
            <div style="border:1.5px solid #2C2849;border-radius:4px;background:#FFF;padding:6px;text-align:center;">
              <div style="height:105px;display:flex;align-items:center;justify-content:center;">
                ${M(s,d)}
              </div>
              <div style="border-top:1px solid #D5CEE4;margin-top:4px;padding-top:4px;font-size:9px;font-weight:700;color:#4A5568;">
                L. ${o[d-5]}
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Forensic Footer Attestation -->
      <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #2C2849;padding-top:10px;font-size:10px;color:#666;">
        <div>METHOD: PROCEDURAL DERMAL RECONSTRUCTION · VERIFIED DETERMINISTIC</div>
        <div>RECORDING EXAMINER: <strong>DGAOS FORENSIC UNIT 07</strong></div>
      </div>
    </div>
  `}function F(e){return`
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
          ${e.portraitData?`<img src="${e.portraitData}" style="width:100%;height:100%;object-fit:cover;" alt="Dossier Photo">`:'<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#1E1838;color:#A59DC2;font-size:11px;">NO PHOTO</div>'}
        </div>
        <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:10px 16px;font-size:12px;">
          <div style="grid-column:1/-1;">
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Primary Subject Name</div>
            <div style="font-size:20px;font-weight:700;color:#2C2849;font-family:'Cinzel',serif;">${t(e.name)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Master Civic ID / Official MAID</div>
            <div style="font-weight:700;font-family:'JetBrains Mono',monospace;">${t(e.maid||e.record)}</div>
            ${e.maid&&e.record!==e.maid?`<div style="font-size:8px;color:#718096;">Legacy: ${t(e.record)}</div>`:""}
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Aliases / Monikers</div>
            <div style="font-weight:600;">${t(e.alias||"None verified")}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Clearance Level</div>
            <div style="font-weight:700;color:#C53030;">${t(e.clearance)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Resonance Threat Matrix</div>
            <div style="font-weight:600;">${t(e.affinity)}</div>
          </div>
        </div>
      </div>

      <!-- Case Links & Investigative Notes -->
      <div style="display:flex;flex-direction:column;gap:16px;font-size:12px;">
        <div style="border:1px solid #E2E8F0;border-radius:6px;padding:14px;background:#F8FAFC;">
          <div style="font-size:10px;font-weight:700;color:#2C2849;text-transform:uppercase;margin-bottom:6px;">Known Case Activity &amp; Inquiries</div>
          <div style="line-height:1.6;color:#334155;">${t(e.links||"No ongoing warrants active.")}</div>
        </div>

        <div style="border:1px solid #E2E8F0;border-radius:6px;padding:14px;background:#F8FAFC;">
          <div style="font-size:10px;font-weight:700;color:#2C2849;text-transform:uppercase;margin-bottom:6px;">Registration &amp; Surveillance History</div>
          <div style="line-height:1.6;color:#334155;">${t(e.history||"Standard civic onboarding completed.")}</div>
        </div>

        <div style="border:1px solid #E2E8F0;border-radius:6px;padding:14px;background:#F8FAFC;">
          <div style="font-size:10px;font-weight:700;color:#2C2849;text-transform:uppercase;margin-bottom:6px;">Known Associates &amp; Household Network</div>
          <div style="line-height:1.6;color:#334155;">${t(e.relationships||"No suspicious associates cataloged.")}</div>
        </div>
      </div>
    </div>
  `}function S(e){return`
    <div class="doc-page" style="background:#FFFFFF;">
      <div class="watermark">MUNICIPAL HOUSING</div>
      
      <!-- Municipal Header -->
      <div style="border-bottom:3px double #2C2849;padding-bottom:16px;margin-bottom:24px;">
        <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;color:#6C5FAC;font-weight:700;">MUNICIPALITY OF AURELINE · HOMECRAFT HOUSING AUTHORITY</div>
        <div style="font-family:'Cinzel',serif;font-size:24px;font-weight:800;color:#2C2849;margin:6px 0;">OFFICIAL DOMICILE &amp; RESIDENCY CERTIFICATE</div>
        <div style="font-size:10px;color:#718096;text-transform:uppercase;font-weight:600;">HOUSING REGISTRATION NO: RES-${t(e.maid||e.record)}</div>
      </div>

      <!-- Domicile Details Grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px 24px;font-size:13px;line-height:1.6;margin-bottom:32px;">
        <div style="grid-column:1/-1;background:#F8F6FC;padding:14px;border-radius:6px;border:1px solid #D5CEE4;">
          <div style="font-size:10px;font-weight:700;color:#6C5FAC;text-transform:uppercase;">Registered Occupant</div>
          <div style="font-family:'Cinzel',serif;font-size:18px;font-weight:700;color:#2C2849;">${t(e.name)}</div>
          <div style="font-size:11px;color:#666;">OFFICIAL MAID: <strong style="font-family:monospace;color:#2C2849;">${t(e.maid||e.record)}</strong>${e.maid&&e.record!==e.maid?` · Legacy: ${t(e.record)}`:""}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#718096;text-transform:uppercase;">Primary Residence Address</div>
          <div style="font-weight:600;color:#2C2849;">${t(e.address)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#718096;text-transform:uppercase;">Municipal Service District</div>
          <div style="font-weight:600;color:#2C2849;">${t(e.district)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#718096;text-transform:uppercase;">Housing Category</div>
          <div style="font-weight:600;color:#2C2849;">${t(e.residency)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#718096;text-transform:uppercase;">Regional Jurisdiction</div>
          <div style="font-weight:600;color:#2C2849;">${t(e.home)}</div>
        </div>
      </div>

      <!-- Domicile Verification Stamp -->
      <div style="border:1px solid #C4BDD8;padding:18px;border-radius:8px;background:#FAF9FD;font-size:12px;color:#4A4458;line-height:1.6;">
        <div style="font-weight:700;color:#2C2849;margin-bottom:6px;">ENERGY &amp; AETHER GRID COMPLIANCE</div>
        This premise is connected to the Aureline Core Grid. Occupancy rights are registered in full standing with no outstanding structural or noise violations reported.
      </div>
    </div>
  `}function D(e){return`
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
          ${e.portraitData?`<img src="${e.portraitData}" style="width:100%;height:100%;object-fit:cover;" alt="Identification Photo">`:'<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#DCE0E8;font-size:11px;">PHOTO</div>'}
        </div>
        <div style="flex:1;display:grid;grid-template-columns:repeat(3, 1fr);gap:12px 18px;font-size:12px;">
          <div style="grid-column:1/-1;border-bottom:1px solid #CBD5E1;padding-bottom:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:flex-end;">
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Subject Legal Name</div>
              <div style="font-size:16px;font-weight:700;color:#2C2849;font-family:'Cinzel',serif;">${t(e.name)}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:8px;font-weight:700;color:#718096;text-transform:uppercase;">Official MAID</div>
              <div style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#2C2849;font-size:12px;">${t(e.maid||e.record)}</div>
              ${e.maid&&e.record!==e.maid?`<div style="font-size:8px;color:#718096;">Legacy: ${t(e.record)}</div>`:""}
            </div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Height</div>
            <div style="font-weight:600;">${t(e.height)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Build</div>
            <div style="font-weight:600;">${t(e.build)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Eye Color</div>
            <div style="font-weight:600;">${t(e.eyes)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Hair Color &amp; Style</div>
            <div style="font-weight:600;">${t(e.hair)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Blood Classification</div>
            <div style="font-weight:600;">${t(e.blood)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Species / Physiology</div>
            <div style="font-weight:600;">${t(e.species)}</div>
          </div>
        </div>
      </div>

      <!-- Scars and Markings Table -->
      <div style="border:1px solid #CBD5E1;border-radius:6px;overflow:hidden;margin-bottom:24px;">
        <div style="background:#F1F5F9;padding:10px 14px;font-size:11px;font-weight:700;color:#1E293B;border-bottom:1px solid #CBD5E1;">
          DISTINCTIVE IDENTIFIERS, SCARS &amp; PHYSIOLOGICAL ANOMALIES
        </div>
        <div style="padding:14px;font-size:12px;line-height:1.6;color:#334155;">
          ${t(e.mark||"No unusual physical marks, tattoos, or dermal anomalies recorded at enrollment.")}
        </div>
      </div>
    </div>
  `}function R(e){return`
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
          <div>RECORD NO: <strong>MED-${t(e.maid||e.record)}</strong></div>
          ${e.maid&&e.record!==e.maid?`<div style="font-size:8px;color:#64748B;">Legacy: ${t(e.record)}</div>`:""}
          <div style="color:#0D9488;">FACILITY: FAITH AURELINE</div>
        </div>
      </div>

      <!-- Patient Vitals Strip -->
      <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:14px;background:#F0FDFA;border:1px solid #99F6E4;border-radius:8px;padding:14px;margin-bottom:24px;font-size:12px;">
        <div><span style="color:#64748B;font-size:9px;display:block;">PATIENT</span><strong>${t(e.name)}</strong></div>
        <div><span style="color:#64748B;font-size:9px;display:block;">DATE OF BIRTH</span><strong>${t(e.dob)}</strong></div>
        <div><span style="color:#64748B;font-size:9px;display:block;">BLOOD GROUP</span><strong>${t(e.blood)}</strong></div>
        <div><span style="color:#64748B;font-size:9px;display:block;">INTAKE STATUS</span><strong style="color:#0F766E;">${t(e.medical)}</strong></div>
      </div>

      <!-- Elemental Resilience & Clinical Notes -->
      <div style="display:flex;flex-direction:column;gap:18px;font-size:12px;line-height:1.6;">
        <div style="border:1px solid #E2E8F0;border-radius:6px;padding:14px;">
          <div style="font-size:10px;font-weight:700;color:#0D9488;text-transform:uppercase;margin-bottom:6px;">Elemental Resilience &amp; Physiology</div>
          <div>Species alignment: <strong>${t(e.species)}</strong>. Power source resonance: <strong>${t(e.powerSource)}</strong>. Cellular healing response normal.</div>
        </div>

        <div style="border:1px solid #E2E8F0;border-radius:6px;padding:14px;">
          <div style="font-size:10px;font-weight:700;color:#0D9488;text-transform:uppercase;margin-bottom:6px;">Emergency Notification Directives</div>
          <div>Primary communication line: <strong>${t(e.phone)}</strong>. Registered residence: <strong>${t(e.address)}</strong>.</div>
        </div>
      </div>
    </div>
  `}function N(e){return`
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
        <div><span style="color:#718096;font-size:9px;display:block;">INDIVIDUAL NAME</span><strong style="font-size:15px;">${t(e.name)}</strong></div>
        <div><span style="color:#718096;font-size:9px;display:block;">OFFICIAL MAID / CIVIC ID</span><strong style="font-family:monospace;">${t(e.maid||e.record)}</strong>${e.maid&&e.record!==e.maid?`<span style="font-size:9px;color:#718096;margin-left:6px;">(Legacy: ${t(e.record)})</span>`:""}</div>
      </div>

      <!-- Academic Record Section -->
      <div style="border:1px solid #E2E8F0;border-radius:6px;padding:16px;margin-bottom:20px;font-size:12px;">
        <div style="font-family:'Cinzel',serif;font-weight:700;color:#2C2849;font-size:13px;border-bottom:1px solid #E2E8F0;padding-bottom:6px;margin-bottom:10px;">
          1. ACADEMIC ENROLLMENT &amp; QUALIFICATIONS
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;line-height:1.6;">
          <div>Institution: <strong>Cyacademy Central Campus, Aureline</strong></div>
          <div>Academic House: <strong>${t(e.category.includes("student")?"Active Trainee":"Completed Curriculum")}</strong></div>
          <div>Specialization / Talents: <strong>${t(e.abilities)}</strong></div>
          <div>Aura Calibration: <strong>Certified Standard</strong></div>
        </div>
      </div>

      <!-- Professional Service Section -->
      <div style="border:1px solid #E2E8F0;border-radius:6px;padding:16px;font-size:12px;">
        <div style="font-family:'Cinzel',serif;font-weight:700;color:#2C2849;font-size:13px;border-bottom:1px solid #E2E8F0;padding-bottom:6px;margin-bottom:10px;">
          2. WORKNET VERIFIED EMPLOYMENT HISTORY
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;line-height:1.6;">
          <div>Verified Occupation: <strong>${t(e.occupation)}</strong></div>
          <div>Affiliated Entity: <strong>${t(e.affiliation)}</strong></div>
          <div>Clearance Status: <strong>${t(e.clearance)}</strong></div>
          <div>Institutional Standing: <strong style="color:#2E7D32;">ACTIVE / IN GOOD STANDING</strong></div>
        </div>
      </div>
    </div>
  `}function de(e,s){let o="",d="";switch(e){case 1:o=h(s),d=`Aura Citizen ID - ${s.name}`;break;case 2:o=E(s),d=`Aura Passport - ${s.name}`;break;case 3:o=A(s),d=`Birth Certificate - ${s.name}`;break;case 4:o=I(s),d=`Ten-Print Biometric Record - ${s.name}`;break;case 5:o=F(s),d=`Investigative Subject Profile - ${s.name}`;break;case 6:o=S(s),d=`Residency Record - ${s.name}`;break;case 7:o=D(s),d=`Physical Identification Sheet - ${s.name}`;break;case 8:o=R(s),d=`Medical Identity Summary - ${s.name}`;break;case 9:o=N(s),d=`Education & Employment Record - ${s.name}`;break;default:o=h(s),d=`Aura Citizen ID - ${s.name}`}return`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${t(d)}</title>
  <style>${B}</style>
</head>
<body>
  <div class="print-actions">
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
  ${o}
</body>
</html>`}function ne(e){const s=`Meridion Nine-Document Packet - ${e.name} (${e.maid||e.record})`;return`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${t(s)}</title>
  <style>${B}</style>
</head>
<body>
  <div class="print-actions">
    <button class="print-btn" onclick="window.print()">Print Complete 9-Document Packet (PDF)</button>
  </div>

  <!-- Document 1: Aura Citizen ID -->
  <div class="doc-page">
    <div style="font-family:'Cinzel',serif;font-size:12px;font-weight:700;color:#6C5FAC;margin-bottom:10px;">DOCUMENT 1 OF 9 · AURA CITIZEN IDENTIFICATION CARD</div>
    ${h(e)}
  </div>

  <!-- Document 2: Aura Passport -->
  ${E(e)}

  <!-- Document 3: Birth Certificate -->
  ${A(e)}

  <!-- Document 4: Ten-Print Biometric Form -->
  ${I(e)}

  <!-- Document 5: Investigative Subject Profile -->
  ${F(e)}

  <!-- Document 6: Residency Record -->
  ${S(e)}

  <!-- Document 7: Physical Identification Sheet -->
  ${D(e)}

  <!-- Document 8: Medical Identity Summary -->
  ${R(e)}

  <!-- Document 9: Education & Employment Record -->
  ${N(e)}
</body>
</html>`}function k(e,s){const o=new Blob([e],{type:"text/html;charset=utf-8"}),d=URL.createObjectURL(o),l=document.createElement("a");l.href=d,l.download=s,l.click(),setTimeout(()=>URL.revokeObjectURL(d),1500)}function j(e){const s="miraverse-issued-documents",o=`ISSUE-${Date.now()}-${Math.floor(Math.random()*9999)}`,d=Math.random().toString(36).substring(2,12).toUpperCase(),l={...e,id:o,hash:d};try{const c=JSON.parse(localStorage.getItem(s)||"[]");c.unshift(l),localStorage.setItem(s,JSON.stringify(c))}catch(c){console.error("Failed to log document issuance snapshot:",c)}return l}const w={name:"Elara Vale",dob:"2001-04-18",place:"Northwake, Fross",record:"MRD-8492-319",passport:"AUR-782194",alias:"Frostweaver / Silverglass",address:"142 Moonwell Way, Glassline District, Aureline Central (fictional)",phone:"+1 (202) 555-0142",email:"elara.vale@example.com",district:"Glassline District, Aureline Central",height:"174 cm",eyes:"Luminous Violet-Gray",hair:"Silver-Black / Stardust Shimmer",build:"Slender / Resilient Cryo-Adaptation",blood:"A+ (Aura Calibrated)",mark:"Faint crystalline frost markings along left wrist",species:"Frostborn",ancestry:"Lightborn · Ellawen Lineage",abilities:"Cryo-constructs, frost veil stabilization, starlight resonance",powerSource:"PRISM resonance & Aether",affinity:"Violet · knowledge / illusion / memory",faction:"Aureline Civic & Academic Network",home:"Aureline, Orynvell",lore:"Descendant of ancient Northwake cryo-weavers; enrolled in Cyacademy advanced resonance curriculum.",category:"Student / academy",affiliation:"Cyacademy Central Campus",occupation:"Research Apprentice / Resonance Analyst",clearance:"General Civic Access · Academic Clearance II",aura:"Calibrated Harmonic Tier III",medical:"Faith Medical Group · intake verified",residency:"Cyacademy Dormitory 4B · Verified Residence",history:"Routine civil registration completed at intake; transferred from Northwake regional enclave.",status:"ACTIVE / VERIFIED",links:"Coordinates academic study group at Aureline Library; holds valid regional transit pass.",relationships:"Known associate of Cyacademy faculty",household:"Cyacademy Campus Dormitory 4B",timeline:"Origin: Northwake, Fross; residing in Aureline since Year 24",biometricSeed:"MRD-8492-319"},b=[{id:1,title:"Aura Citizen ID",subtitle:"Biometric Wallet Card",icon:q,color:"text-indigo-400"},{id:2,title:"Aura Passport",subtitle:"Official Travel Booklet",icon:Q,color:"text-amber-400"},{id:3,title:"Birth Certificate",subtitle:"Crown Archival Record",icon:P,color:"text-purple-400"},{id:4,title:"10-Print Biometrics",subtitle:"Forensic Dermal Sheet",icon:L,color:"text-blue-400"},{id:5,title:"Investigative Profile",subtitle:"DGAOS EYES Dossier",icon:L,color:"text-rose-400"},{id:6,title:"Residency Record",subtitle:"Municipal Domicile Form",icon:X,color:"text-emerald-400"},{id:7,title:"Physical ID Sheet",subtitle:"Forensic Biometrics & Marks",icon:ee,color:"text-cyan-400"},{id:8,title:"Medical Summary",subtitle:"Faith Medical Group Summary",icon:te,color:"text-teal-400"},{id:9,title:"Education / Service",subtitle:"Cyacademy & WORKNET",icon:ie,color:"text-yellow-400"}];function xe(){var O;const[e,s]=v.useState([]),[o,d]=v.useState(w),[l,c]=v.useState(1),[x,p]=v.useState(100),[m,u]=v.useState(!1),[T,g]=v.useState(null),y=async()=>{try{const r=await K.getAllPersons();if(Array.isArray(r)&&r.length>0){s(r);const a=r.find(n=>n.maid&&n.maid===o.maid||n.record===o.record);d(a||r[0]);return}}catch{}s([w]),d(w)};v.useEffect(()=>{y();const r=a=>{var n,f;((n=a.data)==null?void 0:n.source)==="meridion-registry"&&((f=a.data)==null?void 0:f.type)==="citizens-changed"&&y()};return window.addEventListener("message",r),window.addEventListener("storage",y),()=>{window.removeEventListener("message",r),window.removeEventListener("storage",y)}},[]);const H=r=>{const a=e.find(n=>n.maid&&n.maid===r||n.record===r||n.id===r||n.legacyRecord===r);a&&d(a)},z=()=>{window.print()},U=()=>{const r=b.find(_=>_.id===l),a=(o.name||"citizen").toLowerCase().replace(/[^a-z0-9]+/g,"-"),n=o.maid||o.record,f=`${r==null?void 0:r.title.toLowerCase().replace(/[^a-z0-9]+/g,"-")}_${a}_${n}.html`,C=de(l,o);k(C,f)},G=()=>{const r=(o.name||"citizen").toLowerCase().replace(/[^a-z0-9]+/g,"-"),a=o.maid||o.record,n=`miraverse_nine_document_packet_${r}_${a}.html`,f=ne(o);k(f,n);const C=j({documentType:"FULL_NINE_DOCUMENT_PACKET",citizenRecordId:a,citizenName:o.name,issuedAt:new Date().toISOString(),issuingAuthority:"Aureline Civic Identity Administration & Crown Archives",version:"1.0"});g(`Exported complete 9-document packet! Snapshot logged: [${C.id}]`),setTimeout(()=>g(null),4e3)},V=()=>{const r=b.find(n=>n.id===l),a=j({documentType:(r==null?void 0:r.title)||"CIVIL_DOCUMENT",citizenRecordId:o.record,citizenName:o.name,issuedAt:new Date().toISOString(),issuingAuthority:"Aureline Civic Identity Bureau",version:"1.0"});g(`Formal issuance snapshot created: [${a.id}] (Hash: ${a.hash})`),setTimeout(()=>g(null),4e3)},Y=()=>{switch(l){case 1:return i.jsx("div",{dangerouslySetInnerHTML:{__html:h(o)}});case 2:return i.jsx("div",{dangerouslySetInnerHTML:{__html:E(o)}});case 3:return i.jsx("div",{dangerouslySetInnerHTML:{__html:A(o)}});case 4:return i.jsx("div",{dangerouslySetInnerHTML:{__html:I(o)}});case 5:return i.jsx("div",{dangerouslySetInnerHTML:{__html:F(o)}});case 6:return i.jsx("div",{dangerouslySetInnerHTML:{__html:S(o)}});case 7:return i.jsx("div",{dangerouslySetInnerHTML:{__html:D(o)}});case 8:return i.jsx("div",{dangerouslySetInnerHTML:{__html:R(o)}});case 9:return i.jsx("div",{dangerouslySetInnerHTML:{__html:N(o)}});default:return i.jsx("div",{dangerouslySetInnerHTML:{__html:h(o)}})}};return i.jsxs("div",{className:"flex h-full w-full flex-col bg-[#0F0C1B] text-slate-100 select-none font-sans overflow-hidden",children:[i.jsxs("header",{className:"flex flex-wrap items-center justify-between border-b border-[#2C2448] bg-[#161226] px-5 py-3 shadow-md",children:[i.jsxs("div",{className:"flex items-center gap-3",children:[i.jsx("div",{className:"flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#C5AB78] to-[#6C5FAC] text-white shadow",children:i.jsx(P,{size:18})}),i.jsxs("div",{children:[i.jsxs("div",{className:"flex items-center gap-2",children:[i.jsx("h1",{className:"text-sm font-bold tracking-wide text-white font-serif",children:"DOCUMENT STUDIO"}),i.jsx("span",{className:"rounded bg-[#C5AB78]/20 px-2 py-0.5 text-[10px] font-semibold text-[#E5D7B5] border border-[#C5AB78]/30",children:"Nine-Document Packet"})]}),i.jsx("p",{className:"text-[11px] text-slate-400",children:"Formal civil, forensic, and institutional paperwork for the Sovereign Realm of Meridion"})]})]}),i.jsxs("div",{className:"flex items-center gap-3 mt-2 sm:mt-0",children:[i.jsxs("div",{className:"flex items-center gap-2 bg-[#201A36] border border-[#3C3264] rounded-lg px-3 py-1.5 text-xs",children:[i.jsx("span",{className:"text-slate-400 font-medium",children:"Citizen Record:"}),i.jsx("select",{value:o.maid||o.record,onChange:r=>H(r.target.value),className:"bg-transparent text-white font-semibold focus:outline-none cursor-pointer max-w-[200px] truncate",children:e.map(r=>i.jsxs("option",{value:r.maid||r.record,className:"bg-[#1C1833] text-white",children:[r.name," (",r.maid||r.record,")"]},r.maid||r.record))})]}),i.jsxs("button",{onClick:()=>u(!0),className:"flex items-center gap-1.5 rounded-lg bg-[#3C3268] hover:bg-[#52448C] border border-[#6C5FAC] px-3 py-1.5 text-xs font-semibold text-white shadow transition",title:"Open integrated Portrait Studio",children:[i.jsx(Z,{size:14,className:"text-[#C5AB78]"}),"Portrait Studio"]}),i.jsxs("button",{onClick:G,className:"flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#C5AB78] to-[#9883C8] hover:from-[#D4BC8B] hover:to-[#A896D8] text-[#1E1738] px-3.5 py-1.5 text-xs font-bold shadow transition",title:"Download all 9 documents as a combined PDF-ready packet",children:[i.jsx($,{size:14}),"Export 9-Doc Packet"]})]})]}),T&&i.jsxs("div",{className:"bg-emerald-950/80 border-b border-emerald-600/40 text-emerald-200 px-5 py-2 text-xs flex items-center justify-between",children:[i.jsxs("div",{className:"flex items-center gap-2",children:[i.jsx(W,{size:14,className:"text-emerald-400"}),i.jsx("span",{children:T})]}),i.jsx("button",{onClick:()=>g(null),className:"text-emerald-400 hover:text-white",children:"✕"})]}),i.jsxs("div",{className:"flex flex-1 min-h-0 overflow-hidden",children:[i.jsxs("aside",{className:"w-64 border-r border-[#272040] bg-[#130F22] flex flex-col justify-between overflow-y-auto",children:[i.jsxs("div",{className:"p-3 space-y-1",children:[i.jsx("div",{className:"px-3 py-2 text-[10px] font-bold tracking-widest text-[#9883C8] uppercase",children:"Document Inventory (§7.1)"}),b.map(r=>{const a=r.icon,n=l===r.id;return i.jsxs("button",{onClick:()=>c(r.id),className:`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${n?"bg-[#292244] text-white border border-[#524484] shadow-sm":"text-slate-400 hover:bg-white/5 hover:text-slate-200"}`,children:[i.jsx("div",{className:`flex h-7 w-7 items-center justify-center rounded-md ${n?"bg-[#3C3268] text-white":"bg-[#1C1730] text-slate-400"}`,children:i.jsx(a,{size:14})}),i.jsxs("div",{className:"flex-1 min-w-0",children:[i.jsx("div",{className:"text-xs font-bold truncate leading-tight",children:r.title}),i.jsx("div",{className:"text-[10px] text-slate-400 truncate",children:r.subtitle})]}),n&&i.jsx(oe,{size:14,className:"text-[#C5AB78]"})]},r.id)})]}),i.jsxs("div",{className:"p-3 border-t border-[#272040] bg-[#0E0B1A] text-[11px] text-slate-400 space-y-2",children:[i.jsxs("div",{className:"flex justify-between items-center text-[10px]",children:[i.jsx("span",{children:"ACTIVE CITIZEN:"}),i.jsx("strong",{className:"text-white truncate max-w-[120px]",children:o.name})]}),i.jsxs("div",{className:"flex justify-between items-center text-[10px]",children:[i.jsx("span",{children:"CIVIC STATUS:"}),i.jsx("span",{className:"text-emerald-400 font-semibold",children:o.status||"VERIFIED"})]}),i.jsxs("button",{onClick:V,className:"w-full flex items-center justify-center gap-1.5 rounded-md bg-[#251E3D] hover:bg-[#322A50] border border-[#44386A] py-1.5 text-[11px] font-medium text-slate-200 transition",children:[i.jsx(re,{size:12}),"Log Snapshot Issuance"]})]})]}),i.jsxs("main",{className:"flex-1 flex flex-col bg-[#1A162B] overflow-hidden",children:[i.jsxs("div",{className:"flex items-center justify-between border-b border-[#2C2448] bg-[#161226] px-6 py-2.5 text-xs",children:[i.jsxs("div",{className:"flex items-center gap-3",children:[i.jsx("span",{className:"font-bold text-white tracking-wide",children:(O=b.find(r=>r.id===l))==null?void 0:O.title}),i.jsx("span",{className:"text-slate-400 text-[11px]",children:"Official Sovereign Document · Specimen View"})]}),i.jsxs("div",{className:"flex items-center gap-3",children:[i.jsxs("div",{className:"flex items-center gap-1 text-[11px] text-slate-400 bg-[#201A36] border border-[#3C3264] rounded-md px-2 py-1",children:[i.jsx("span",{children:"Scale:"}),i.jsx("button",{onClick:()=>p(Math.max(60,x-10)),className:"px-1 hover:text-white",children:"-"}),i.jsxs("span",{className:"text-white font-mono",children:[x,"%"]}),i.jsx("button",{onClick:()=>p(Math.min(140,x+10)),className:"px-1 hover:text-white",children:"+"})]}),i.jsxs("button",{onClick:z,className:"flex items-center gap-1.5 rounded-md bg-[#251E3D] hover:bg-[#342A54] border border-[#44386A] px-3 py-1.5 text-xs text-white transition",children:[i.jsx(se,{size:13}),"Print Document"]}),i.jsxs("button",{onClick:U,className:"flex items-center gap-1.5 rounded-md bg-[#3C3268] hover:bg-[#4E4185] border border-[#6C5FAC] px-3 py-1.5 text-xs font-semibold text-white shadow transition",children:[i.jsx($,{size:13}),"Download HTML"]})]})]}),i.jsx("div",{className:"flex-1 overflow-auto p-8 flex justify-center bg-[#1F1A33]",children:i.jsx("div",{className:"transition-transform duration-150 origin-top",style:{transform:`scale(${x/100})`},children:Y()})})]})]}),i.jsx(J,{citizen:o,isOpen:m,onClose:()=>u(!1),onPortraitSaved:r=>{d(a=>({...a,portraitData:r})),y()}})]})}export{xe as default};
