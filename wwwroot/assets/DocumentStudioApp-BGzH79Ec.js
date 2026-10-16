import{r as u,j as e}from"./framer-motion-CI5Hau7M.js";import{b as L,X as le,S as P,r as de,ba as Z,bb as ce,C as pe,ac as K,bc as xe,bd as fe,a9 as te,F as ie,D as q,U as me,ad as ge,Y as ve,aO as he,z as ue,be as ye,aa as be,a5 as Ce,bf as we}from"./lucide-icons-BPom74Tb.js";function i(t){return String(t??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function W(t,r){const s=String(t).split("").reduce((p,x)=>p*31+x.charCodeAt(0)>>>0,2166136261)+(r+1)*92821,o=s%37-18,n=45+s%7-3,d=44+(s>>>4)%7-3;let c="";for(let p=0;p<15;p++){const x=6+p*2.13,m=10+p*2.5;c+=`<ellipse cx="${n}" cy="${d}" rx="${x}" ry="${m}" fill="none" stroke="#2C2849" stroke-width="0.8" opacity="${(.9-p*.026).toFixed(2)}" transform="rotate(${o} ${n} ${d})" stroke-dasharray="${(s+p)%5===0?"34 3 48 2":"210"}"/>`}return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 100" class="w-full h-full"><rect width="90" height="100" fill="#FFFFFF"/>${c}<text x="5" y="95" font-family="sans-serif" font-size="5" fill="#888899">SIMULATED</text></svg>`}const se=`
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
`;function k(t){return`
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
            ${t.portraitData?`<img src="${t.portraitData}" style="width:100%;height:100%;object-fit:cover;" alt="Portrait">`:'<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#DCE0E8;color:#718096;font-size:11px;font-weight:600;">PORTRAIT ON FILE</div>'}
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;font-size:11px;flex:1;">
            <div style="grid-column:1/-1;">
              <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#68758A;letter-spacing:0.8px;">Legal Name</div>
              <div style="font-size:15px;font-weight:700;color:#1E1738;font-family:'Cinzel',serif;">${i(t.name)}</div>
            </div>
            <div>
              <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#68758A;">Civic Record No.</div>
              <div style="font-weight:700;font-family:'JetBrains Mono',monospace;color:#2C2849;">${i(t.record)}</div>
            </div>
            <div>
              <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#68758A;">Date of Birth</div>
              <div style="font-weight:600;color:#2C2849;">${i(t.dob)}</div>
            </div>
            <div>
              <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#68758A;">Home Realm</div>
              <div style="font-weight:600;color:#2C2849;">${i(t.home)}</div>
            </div>
            <div>
              <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#68758A;">Species / Kind</div>
              <div style="font-weight:600;color:#2C2849;">${i(t.species)}</div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #C4BDD8;padding-top:8px;font-size:8px;color:#68758A;font-weight:600;letter-spacing:0.5px;">
          <span>STATUS: <strong style="color:#2E7D32;">${i(t.status||"VERIFIED")}</strong></span>
          <span>AURA SECURITY CODE: <strong style="font-family:monospace;">${i(t.passport||"AUR-901842")}</strong></span>
        </div>
      </div>

      <!-- BACK SIDE -->
      <div style="width:520px;height:328px;border-radius:18px;background:linear-gradient(135deg, #1F1B36 0%, #2A2447 100%);border:1px solid #4D4370;box-shadow:0 12px 35px rgba(44,40,73,0.25);position:relative;overflow:hidden;padding:22px;color:#E6E2F2;display:flex;flex-direction:column;justify-content:space-between;">
        
        <!-- Magnetic Stripe -->
        <div style="height:44px;background:#0F0C1C;margin:-22px -22px 14px -22px;border-bottom:1px solid #3A3258;"></div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:10px;">
          <div>
            <div style="font-size:8px;color:#A59DC2;text-transform:uppercase;">Emergency Contact</div>
            <div style="font-weight:600;color:#FFF;">${i(t.phone)}</div>
          </div>
          <div>
            <div style="font-size:8px;color:#A59DC2;text-transform:uppercase;">Biometric Telemetry</div>
            <div style="font-weight:600;color:#FFF;">${i(t.blood)} · ${i(t.height)}</div>
          </div>
          <div style="grid-column:1/-1;">
            <div style="font-size:8px;color:#A59DC2;text-transform:uppercase;">Residential Jurisdiction</div>
            <div style="font-weight:600;color:#FFF;">${i(t.address)}</div>
          </div>
        </div>

        <!-- MRZ Zone -->
        <div style="background:#131024;border:1px solid #3C335C;border-radius:8px;padding:8px 12px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:3px;color:#C5AB78;line-height:1.5;">
          I&lt;MRD${(t.record||"MRD0000").replace(/[^A-Z0-9]/gi,"")}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br>
          ${(t.dob||"000000").replace(/-/g,"")}4M3409121MRD&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;4
        </div>
      </div>
    </div>
  `}function B(t){return`
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
            ${t.portraitData?`<img src="${t.portraitData}" style="width:100%;height:100%;object-fit:cover;" alt="Passport Photo">`:'<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#DCE0E8;font-size:11px;">PHOTO</div>'}
          </div>

          <!-- Fields -->
          <div style="flex:1;display:grid;grid-template-columns:repeat(3, 1fr);gap:12px 18px;font-size:12px;">
            <div style="grid-column:1/-1;">
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Surname &amp; Given Names</div>
              <div style="font-family:'Cinzel',serif;font-size:18px;font-weight:700;color:#2C2849;">${i(t.name)}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Passport No.</div>
              <div style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#9883C8;">${i(t.passport||"AUR-918204")}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Citizen ID</div>
              <div style="font-family:'JetBrains Mono',monospace;font-weight:600;">${i(t.record)}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Nationality</div>
              <div style="font-weight:600;">MERIDION</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Date of Birth</div>
              <div style="font-weight:600;">${i(t.dob)}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Place of Birth</div>
              <div style="font-weight:600;">${i(t.place)}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Species / Choir</div>
              <div style="font-weight:600;">${i(t.species)}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Issuing Authority</div>
              <div style="font-weight:600;">AURA PASSPORT ADM.</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">PRISM Resonance</div>
              <div style="font-weight:600;">${i(t.affinity)}</div>
            </div>
          </div>
        </div>

        <!-- ICAO MRZ Strip -->
        <div style="margin-top:24px;border-top:1.5px dashed #C5AB78;padding-top:14px;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:4px;color:#2C2849;line-height:1.6;background:#FAF8F5;padding:10px;border-radius:4px;">
          P&lt;MRD${(t.name||"CITIZEN").toUpperCase().replace(/[^A-Z]/g,"&lt;")}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br>
          ${(t.passport||"AUR000000").replace(/[^A-Z0-9]/g,"")}7MRD${(t.dob||"000000").replace(/-/g,"")}9M3409124&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;06
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
  `}function z(t){return`
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
        <div>REGISTRY NUMBER: <strong style="font-family:'JetBrains Mono',monospace;">BIR-${i(t.record)}</strong></div>
        <div>SOLAR CYCLE: <strong>FOUNDING ERA</strong></div>
        <div>PAGE: <strong>1 OF 1</strong></div>
      </div>

      <!-- Main Nativity Details -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;font-size:13px;line-height:1.6;margin-bottom:30px;">
        <div style="grid-column:1/-1;border-bottom:1px solid #E2D9C8;padding-bottom:12px;">
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Full Legal Name of Child</div>
          <div style="font-family:'Cinzel',serif;font-size:22px;font-weight:700;color:#1E1738;">${i(t.name)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Date of Birth</div>
          <div style="font-weight:600;">${i(t.dob)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Place of Nativity / Facility</div>
          <div style="font-weight:600;">${i(t.place)} (Sanctuary Records)</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Ancestral Lineage / Heritage</div>
          <div style="font-weight:600;">${i(t.ancestry)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Species Classification</div>
          <div style="font-weight:600;">${i(t.species)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Elemental Affinity / Resonance</div>
          <div style="font-weight:600;">${i(t.affinity)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Power Source</div>
          <div style="font-weight:600;">${i(t.powerSource)}</div>
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
  `}function H(t){const r=t.biometricSeed||t.record,s=["Thumb","Index","Middle","Ring","Little"];return`
    <div class="doc-page doc-landscape" style="background:#FFFFFF;">
      <div class="watermark">FORENSIC SPECIMEN</div>
      
      <!-- Forensic Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #2C2849;padding-bottom:14px;margin-bottom:18px;">
        <div>
          <div style="font-family:'Cinzel',serif;font-size:18px;font-weight:800;letter-spacing:1px;color:#2C2849;">DGAOS // TACTICAL FORENSIC BIOMETRIC ARCHIVE</div>
          <div style="font-size:10px;font-weight:700;color:#6C5FAC;letter-spacing:1.5px;text-transform:uppercase;">FORM TRACE-10-PRINT · DERMAL IMPRESSION REGISTRATION</div>
        </div>
        <div style="text-align:right;font-size:10px;font-family:'JetBrains Mono',monospace;">
          <div>SPECIMEN ID: <strong>BIO-${i(t.record)}</strong></div>
          <div>CUSTODY: <strong>DGAOS EYES RECORD</strong></div>
        </div>
      </div>

      <!-- Subject Summary Strip -->
      <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:12px;background:#F8F6FC;border:1px solid #D5CEE4;border-radius:6px;padding:10px 14px;margin-bottom:20px;font-size:11px;">
        <div><span style="color:#718096;font-size:9px;display:block;">SUBJECT NAME</span><strong>${i(t.name)}</strong></div>
        <div><span style="color:#718096;font-size:9px;display:block;">CIVIC NUMBER</span><strong>${i(t.record)}</strong></div>
        <div><span style="color:#718096;font-size:9px;display:block;">SPECIES</span><strong>${i(t.species)}</strong></div>
        <div><span style="color:#718096;font-size:9px;display:block;">CLEARANCE</span><strong>${i(t.clearance)}</strong></div>
        <div><span style="color:#718096;font-size:9px;display:block;">COLLECTION STATUS</span><strong style="color:#2E7D32;">VERIFIED</strong></div>
      </div>

      <!-- 10-Print Grid -->
      <div style="margin-bottom:18px;">
        <!-- Right Hand -->
        <div style="font-size:11px;font-weight:700;color:#2C2849;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.8px;">1. RIGHT HAND (DIGITS 1 TO 5)</div>
        <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:10px;margin-bottom:16px;">
          ${[0,1,2,3,4].map(o=>`
            <div style="border:1.5px solid #2C2849;border-radius:4px;background:#FFF;padding:6px;text-align:center;">
              <div style="height:105px;display:flex;align-items:center;justify-content:center;">
                ${W(r,o)}
              </div>
              <div style="border-top:1px solid #D5CEE4;margin-top:4px;padding-top:4px;font-size:9px;font-weight:700;color:#4A5568;">
                R. ${s[o]}
              </div>
            </div>
          `).join("")}
        </div>

        <!-- Left Hand -->
        <div style="font-size:11px;font-weight:700;color:#2C2849;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.8px;">2. LEFT HAND (DIGITS 6 TO 10)</div>
        <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:10px;">
          ${[5,6,7,8,9].map(o=>`
            <div style="border:1.5px solid #2C2849;border-radius:4px;background:#FFF;padding:6px;text-align:center;">
              <div style="height:105px;display:flex;align-items:center;justify-content:center;">
                ${W(r,o)}
              </div>
              <div style="border-top:1px solid #D5CEE4;margin-top:4px;padding-top:4px;font-size:9px;font-weight:700;color:#4A5568;">
                L. ${s[o-5]}
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
  `}function U(t){return`
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
          ${t.portraitData?`<img src="${t.portraitData}" style="width:100%;height:100%;object-fit:cover;" alt="Dossier Photo">`:'<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#1E1838;color:#A59DC2;font-size:11px;">NO PHOTO</div>'}
        </div>
        <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:10px 16px;font-size:12px;">
          <div style="grid-column:1/-1;">
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Primary Subject Name</div>
            <div style="font-size:20px;font-weight:700;color:#2C2849;font-family:'Cinzel',serif;">${i(t.name)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Master Civic ID</div>
            <div style="font-weight:700;font-family:'JetBrains Mono',monospace;">${i(t.record)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Aliases / Monikers</div>
            <div style="font-weight:600;">${i(t.alias||"None verified")}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Clearance Level</div>
            <div style="font-weight:700;color:#C53030;">${i(t.clearance)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Resonance Threat Matrix</div>
            <div style="font-weight:600;">${i(t.affinity)}</div>
          </div>
        </div>
      </div>

      <!-- Case Links & Investigative Notes -->
      <div style="display:flex;flex-direction:column;gap:16px;font-size:12px;">
        <div style="border:1px solid #E2E8F0;border-radius:6px;padding:14px;background:#F8FAFC;">
          <div style="font-size:10px;font-weight:700;color:#2C2849;text-transform:uppercase;margin-bottom:6px;">Known Case Activity &amp; Inquiries</div>
          <div style="line-height:1.6;color:#334155;">${i(t.links||"No ongoing warrants active.")}</div>
        </div>

        <div style="border:1px solid #E2E8F0;border-radius:6px;padding:14px;background:#F8FAFC;">
          <div style="font-size:10px;font-weight:700;color:#2C2849;text-transform:uppercase;margin-bottom:6px;">Registration &amp; Surveillance History</div>
          <div style="line-height:1.6;color:#334155;">${i(t.history||"Standard civic onboarding completed.")}</div>
        </div>

        <div style="border:1px solid #E2E8F0;border-radius:6px;padding:14px;background:#F8FAFC;">
          <div style="font-size:10px;font-weight:700;color:#2C2849;text-transform:uppercase;margin-bottom:6px;">Known Associates &amp; Household Network</div>
          <div style="line-height:1.6;color:#334155;">${i(t.relationships||"No suspicious associates cataloged.")}</div>
        </div>
      </div>
    </div>
  `}function G(t){return`
    <div class="doc-page" style="background:#FFFFFF;">
      <div class="watermark">MUNICIPAL HOUSING</div>
      
      <!-- Municipal Header -->
      <div style="border-bottom:3px double #2C2849;padding-bottom:16px;margin-bottom:24px;">
        <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;color:#6C5FAC;font-weight:700;">MUNICIPALITY OF AURELINE · HOMECRAFT HOUSING AUTHORITY</div>
        <div style="font-family:'Cinzel',serif;font-size:24px;font-weight:800;color:#2C2849;margin:6px 0;">OFFICIAL DOMICILE &amp; RESIDENCY CERTIFICATE</div>
        <div style="font-size:10px;color:#718096;text-transform:uppercase;font-weight:600;">HOUSING REGISTRATION NO: RES-${i(t.record)}</div>
      </div>

      <!-- Domicile Details Grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px 24px;font-size:13px;line-height:1.6;margin-bottom:32px;">
        <div style="grid-column:1/-1;background:#F8F6FC;padding:14px;border-radius:6px;border:1px solid #D5CEE4;">
          <div style="font-size:10px;font-weight:700;color:#6C5FAC;text-transform:uppercase;">Registered Occupant</div>
          <div style="font-family:'Cinzel',serif;font-size:18px;font-weight:700;color:#2C2849;">${i(t.name)}</div>
          <div style="font-size:11px;color:#666;">CIVIC ID: ${i(t.record)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#718096;text-transform:uppercase;">Primary Residence Address</div>
          <div style="font-weight:600;color:#2C2849;">${i(t.address)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#718096;text-transform:uppercase;">Municipal Service District</div>
          <div style="font-weight:600;color:#2C2849;">${i(t.district)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#718096;text-transform:uppercase;">Housing Category</div>
          <div style="font-weight:600;color:#2C2849;">${i(t.residency)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#718096;text-transform:uppercase;">Regional Jurisdiction</div>
          <div style="font-weight:600;color:#2C2849;">${i(t.home)}</div>
        </div>
      </div>

      <!-- Domicile Verification Stamp -->
      <div style="border:1px solid #C4BDD8;padding:18px;border-radius:8px;background:#FAF9FD;font-size:12px;color:#4A4458;line-height:1.6;">
        <div style="font-weight:700;color:#2C2849;margin-bottom:6px;">ENERGY &amp; AETHER GRID COMPLIANCE</div>
        This premise is connected to the Aureline Core Grid. Occupancy rights are registered in full standing with no outstanding structural or noise violations reported.
      </div>
    </div>
  `}function V(t){return`
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
          ${t.portraitData?`<img src="${t.portraitData}" style="width:100%;height:100%;object-fit:cover;" alt="Identification Photo">`:'<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#DCE0E8;font-size:11px;">PHOTO</div>'}
        </div>
        <div style="flex:1;display:grid;grid-template-columns:repeat(3, 1fr);gap:12px 18px;font-size:12px;">
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Height</div>
            <div style="font-weight:600;">${i(t.height)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Build</div>
            <div style="font-weight:600;">${i(t.build)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Eye Color</div>
            <div style="font-weight:600;">${i(t.eyes)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Hair Color &amp; Style</div>
            <div style="font-weight:600;">${i(t.hair)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Blood Classification</div>
            <div style="font-weight:600;">${i(t.blood)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Species / Physiology</div>
            <div style="font-weight:600;">${i(t.species)}</div>
          </div>
        </div>
      </div>

      <!-- Scars and Markings Table -->
      <div style="border:1px solid #CBD5E1;border-radius:6px;overflow:hidden;margin-bottom:24px;">
        <div style="background:#F1F5F9;padding:10px 14px;font-size:11px;font-weight:700;color:#1E293B;border-bottom:1px solid #CBD5E1;">
          DISTINCTIVE IDENTIFIERS, SCARS &amp; PHYSIOLOGICAL ANOMALIES
        </div>
        <div style="padding:14px;font-size:12px;line-height:1.6;color:#334155;">
          ${i(t.mark||"No unusual physical marks, tattoos, or dermal anomalies recorded at enrollment.")}
        </div>
      </div>
    </div>
  `}function Y(t){return`
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
          <div>RECORD NO: <strong>MED-${i(t.record)}</strong></div>
          <div style="color:#0D9488;">FACILITY: FAITH AURELINE</div>
        </div>
      </div>

      <!-- Patient Vitals Strip -->
      <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:14px;background:#F0FDFA;border:1px solid #99F6E4;border-radius:8px;padding:14px;margin-bottom:24px;font-size:12px;">
        <div><span style="color:#64748B;font-size:9px;display:block;">PATIENT</span><strong>${i(t.name)}</strong></div>
        <div><span style="color:#64748B;font-size:9px;display:block;">DATE OF BIRTH</span><strong>${i(t.dob)}</strong></div>
        <div><span style="color:#64748B;font-size:9px;display:block;">BLOOD GROUP</span><strong>${i(t.blood)}</strong></div>
        <div><span style="color:#64748B;font-size:9px;display:block;">INTAKE STATUS</span><strong style="color:#0F766E;">${i(t.medical)}</strong></div>
      </div>

      <!-- Elemental Resilience & Clinical Notes -->
      <div style="display:flex;flex-direction:column;gap:18px;font-size:12px;line-height:1.6;">
        <div style="border:1px solid #E2E8F0;border-radius:6px;padding:14px;">
          <div style="font-size:10px;font-weight:700;color:#0D9488;text-transform:uppercase;margin-bottom:6px;">Elemental Resilience &amp; Physiology</div>
          <div>Species alignment: <strong>${i(t.species)}</strong>. Power source resonance: <strong>${i(t.powerSource)}</strong>. Cellular healing response normal.</div>
        </div>

        <div style="border:1px solid #E2E8F0;border-radius:6px;padding:14px;">
          <div style="font-size:10px;font-weight:700;color:#0D9488;text-transform:uppercase;margin-bottom:6px;">Emergency Notification Directives</div>
          <div>Primary communication line: <strong>${i(t.phone)}</strong>. Registered residence: <strong>${i(t.address)}</strong>.</div>
        </div>
      </div>
    </div>
  `}function _(t){return`
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
        <div><span style="color:#718096;font-size:9px;display:block;">INDIVIDUAL NAME</span><strong style="font-size:15px;">${i(t.name)}</strong></div>
        <div><span style="color:#718096;font-size:9px;display:block;">CIVIC ID NUMBER</span><strong style="font-family:monospace;">${i(t.record)}</strong></div>
      </div>

      <!-- Academic Record Section -->
      <div style="border:1px solid #E2E8F0;border-radius:6px;padding:16px;margin-bottom:20px;font-size:12px;">
        <div style="font-family:'Cinzel',serif;font-weight:700;color:#2C2849;font-size:13px;border-bottom:1px solid #E2E8F0;padding-bottom:6px;margin-bottom:10px;">
          1. ACADEMIC ENROLLMENT &amp; QUALIFICATIONS
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;line-height:1.6;">
          <div>Institution: <strong>Cyacademy Central Campus, Aureline</strong></div>
          <div>Academic House: <strong>${i(t.category.includes("student")?"Active Trainee":"Completed Curriculum")}</strong></div>
          <div>Specialization / Talents: <strong>${i(t.abilities)}</strong></div>
          <div>Aura Calibration: <strong>Certified Standard</strong></div>
        </div>
      </div>

      <!-- Professional Service Section -->
      <div style="border:1px solid #E2E8F0;border-radius:6px;padding:16px;font-size:12px;">
        <div style="font-family:'Cinzel',serif;font-weight:700;color:#2C2849;font-size:13px;border-bottom:1px solid #E2E8F0;padding-bottom:6px;margin-bottom:10px;">
          2. WORKNET VERIFIED EMPLOYMENT HISTORY
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;line-height:1.6;">
          <div>Verified Occupation: <strong>${i(t.occupation)}</strong></div>
          <div>Affiliated Entity: <strong>${i(t.affiliation)}</strong></div>
          <div>Clearance Status: <strong>${i(t.clearance)}</strong></div>
          <div>Institutional Standing: <strong style="color:#2E7D32;">ACTIVE / IN GOOD STANDING</strong></div>
        </div>
      </div>
    </div>
  `}function Ee(t,r){let s="",o="";switch(t){case 1:s=k(r),o=`Aura Citizen ID - ${r.name}`;break;case 2:s=B(r),o=`Aura Passport - ${r.name}`;break;case 3:s=z(r),o=`Birth Certificate - ${r.name}`;break;case 4:s=H(r),o=`Ten-Print Biometric Record - ${r.name}`;break;case 5:s=U(r),o=`Investigative Subject Profile - ${r.name}`;break;case 6:s=G(r),o=`Residency Record - ${r.name}`;break;case 7:s=V(r),o=`Physical Identification Sheet - ${r.name}`;break;case 8:s=Y(r),o=`Medical Identity Summary - ${r.name}`;break;case 9:s=_(r),o=`Education & Employment Record - ${r.name}`;break;default:s=k(r),o=`Aura Citizen ID - ${r.name}`}return`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${i(o)}</title>
  <style>${se}</style>
</head>
<body>
  <div class="print-actions">
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
  ${s}
</body>
</html>`}function Ae(t){const r=`Meridion Nine-Document Packet - ${t.name} (${t.record})`;return`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${i(r)}</title>
  <style>${se}</style>
</head>
<body>
  <div class="print-actions">
    <button class="print-btn" onclick="window.print()">Print Complete 9-Document Packet (PDF)</button>
  </div>

  <!-- Document 1: Aura Citizen ID -->
  <div class="doc-page">
    <div style="font-family:'Cinzel',serif;font-size:12px;font-weight:700;color:#6C5FAC;margin-bottom:10px;">DOCUMENT 1 OF 9 · AURA CITIZEN IDENTIFICATION CARD</div>
    ${k(t)}
  </div>

  <!-- Document 2: Aura Passport -->
  ${B(t)}

  <!-- Document 3: Birth Certificate -->
  ${z(t)}

  <!-- Document 4: Ten-Print Biometric Form -->
  ${H(t)}

  <!-- Document 5: Investigative Subject Profile -->
  ${U(t)}

  <!-- Document 6: Residency Record -->
  ${G(t)}

  <!-- Document 7: Physical Identification Sheet -->
  ${V(t)}

  <!-- Document 8: Medical Identity Summary -->
  ${Y(t)}

  <!-- Document 9: Education & Employment Record -->
  ${_(t)}
</body>
</html>`}function X(t,r){const s=new Blob([t],{type:"text/html;charset=utf-8"}),o=URL.createObjectURL(s),n=document.createElement("a");n.href=o,n.download=r,n.click(),setTimeout(()=>URL.revokeObjectURL(o),1500)}function ee(t){const r="miraverse-issued-documents",s=`ISSUE-${Date.now()}-${Math.floor(Math.random()*9999)}`,o=Math.random().toString(36).substring(2,12).toUpperCase(),n={...t,id:s,hash:o};try{const d=JSON.parse(localStorage.getItem(r)||"[]");d.unshift(n),localStorage.setItem(r,JSON.stringify(d))}catch(d){console.error("Failed to log document issuance snapshot:",d)}return n}function Fe(t,r="id"){const s=t.species||"Humanoid",o=t.eyes||"Luminous eyes",n=t.hair||"Silver-black hair",d=t.build||"Medium",c=t.mark&&t.mark!=="None recorded"?t.mark:"",p=t.home||"Orynvell",x=t.ancestry||"";let m="";const l=s.toLowerCase();return l.includes("mer")||l.includes("siren")||l.includes("naiad")||l.includes("undine")?m="delicate aquatic gills on neck, subtle iridescent pearlescent ear fins, soft sea-glass highlights":l.includes("frost")||l.includes("glacial")||l.includes("snow")?m="pale crystalline cryo skin with subtle glacial frost patterns, cool undertones, resilient northern bone structure":l.includes("lumin")||l.includes("solar")?m="radiant solar-shimmer skin, pupil-less luminous glowing eyes, warm golden undertones, starlight reflections":l.includes("angel")||l.includes("aether")||l.includes("lightborn")||x.toLowerCase().includes("lightborn")?m="celestial symmetry, faint pearlescent aetheric skin luster, refined aristocratic features, noble celestial presence":l.includes("shadow")||l.includes("nether")?m="umbral porcelain skin, deep void-violet eye intensity, subtle smoke shadow contours, enigmatic expression":(l.includes("ember")||l.includes("phoenix")||l.includes("salamandri"))&&(m="bronze sun-warmed skin, faint glowing ember eye warmth, fiery hair highlights, robust resilient features"),r==="id"?{prompt:[`Official identification portrait headshot of a celestial ${s}`,`character named ${t.name||"Citizen"} from ${p}, Meridion`,`facial features: ${o} eyes, ${n}, ${d} build`,m,c?`distinctive trait: ${c}`:"","framing: neutral front-facing passport headshot, centered, shoulders square to camera, neutral calm expression, sharp clear focus on face","lighting: clean high-key studio identification lighting, soft even illumination, no harsh shadows","background: clean solid neutral slate lavender identification backdrop with subtle holographic security watermark","clothing: formal high-collar civic official tunic in dark navy and lavender with silver trim","style: stylized fantasy realism, highly detailed digital painting, crisp clean linework, refined facial anatomy, 8k resolution, cinematic character art"].filter(Boolean).join(", "),negativePrompt:"distorted face, deformed eyes, extra limbs, asymmetrical face, side view, extreme angle, dramatic shadows, cartoonish, messy background, text, borders, watermark, blurs, low resolution"}:{prompt:[`Cinematic expressive character portrait of a celestial ${s}`,`character named ${t.name||"Citizen"} from ${p}, Meridion`,`appearance: ${o} eyes with inner glow, flowing ${n}, ${d} physique`,m,c?`marked with ${c}`:"",`affinity: aligned with ${t.affinity||"Aether"} resonance, subtle atmospheric wisps of magic`,"framing: medium close-up, three-quarter angle, dynamic engaging eye contact, expressive confident demeanor","lighting: dramatic celestial rim lighting, ethereal glow, volumetric starlight beams, cinematic color grading",`environment: atmospheric backdrop of ${p} architecture with distant nebula skies`,"style: masterpiece fantasy character concept art, high-fidelity digital illustration, unreal engine 5 render look, luminous details, 8k"].filter(Boolean).join(", "),negativePrompt:"blurry, amateur, bad anatomy, deformed eyes, extra fingers, low contrast, washed out, plastic skin, flat lighting, cropped face"}}async function Ie(t="http://127.0.0.1:8188",r="http://127.0.0.1:7860"){var s,o;try{const n=new AbortController,d=setTimeout(()=>n.abort(),1200),c=await fetch(`${t}/system_stats`,{signal:n.signal});if(clearTimeout(d),c.ok){const p=await c.json().catch(()=>({})),x=(o=(s=p==null?void 0:p.devices)==null?void 0:s[0])!=null&&o.vram_total?`${Math.round(p.devices[0].vram_total/1e9)}GB VRAM`:"GPU Ready";return{type:"comfyui",online:!0,endpoint:t,details:`ComfyUI Server Active (${x})`}}}catch{}try{const n=new AbortController,d=setTimeout(()=>n.abort(),1200),c=await fetch(`${r}/sdapi/v1/sd-models`,{signal:n.signal});if(clearTimeout(d),c.ok)return{type:"webui",online:!0,endpoint:r,details:"Stable Diffusion WebUI / Forge Ready"}}catch{}return{type:"none",online:!1,endpoint:"",details:"No local GPU backend detected. Procedural generator active."}}function M(t,r=42){let s=r+Math.abs(t.name.split("").reduce((S,A)=>S*31+A.charCodeAt(0)|0,0));const o=(t.species||"").toLowerCase(),n=(t.hair||"").toLowerCase(),d=(t.eyes||"").toLowerCase(),c=(t.home||"").toLowerCase();let p="#F4EDE4",x="#E5D6C7",m="rgba(152, 131, 200, 0.25)";o.includes("frost")||c.includes("fross")?(p="#EBF4FA",x="#D4E6F1",m="rgba(174, 214, 241, 0.35)"):o.includes("lumin")||c.includes("lumia")?(p="#FFF9E6",x="#F9E79F",m="rgba(244, 208, 63, 0.35)"):o.includes("mer")||o.includes("siren")||c.includes("marlowe")?(p="#E8F8F5",x="#D1F2EB",m="rgba(115, 198, 182, 0.35)"):o.includes("shadow")||o.includes("nether")||c.includes("nephele")?(p="#E8E5EE",x="#D2CDDE",m="rgba(125, 102, 168, 0.35)"):o.includes("ember")||c.includes("kaji")?(p="#FBEEE6",x="#EDBB99",m="rgba(230, 126, 34, 0.35)"):(o.includes("angel")||o.includes("lightborn")||c.includes("orynvell"))&&(p="#FDFEFE",x="#EAECEE",m="rgba(215, 189, 226, 0.4)");let l="#2C2849",h="#483D8B";n.includes("silver")||n.includes("white")||n.includes("stardust")?(l="#E5E7EB",h="#FFFFFF"):n.includes("blonde")||n.includes("gold")?(l="#F5D77F",h="#FCF3CF"):n.includes("copper")||n.includes("red")?(l="#BA4A00",h="#E59866"):n.includes("blue")||n.includes("icy")?(l="#5DADE2",h="#A9CCE3"):n.includes("black")&&(l="#17202A",h="#2C3E50");let y="#5B2C6F";d.includes("amber")||d.includes("gold")?y="#D4AC0D":d.includes("blue")||d.includes("violet")?y="#5499C7":d.includes("green")?y="#27AE60":d.includes("gray")||d.includes("silver")?y="#7F8C8D":(d.includes("dark brown")||d.includes("brown"))&&(y="#6E2C00");const I=`bg-grad-${s}`,C=`aura-grad-${s}`,w=`skin-grad-${s}`,E=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="100%" height="100%">
  <defs>
    <linearGradient id="${I}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1938" />
      <stop offset="50%" stop-color="#2D2652" />
      <stop offset="100%" stop-color="#3C3268" />
    </linearGradient>
    <radialGradient id="${C}" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="${m}" />
      <stop offset="100%" stop-color="rgba(0,0,0,0)" />
    </radialGradient>
    <linearGradient id="${w}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p}" />
      <stop offset="100%" stop-color="${x}" />
    </linearGradient>
    <filter id="glow-${s}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="400" height="480" fill="url(#${I})" />
  <rect width="400" height="480" fill="url(#${C})" />

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
  <rect x="178" y="270" width="44" height="90" rx="6" fill="${x}" />
  <path d="M178 320 Q200 345 222 320" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="2" />

  <!-- Aquatic / Gills Feature -->
  ${o.includes("mer")||o.includes("siren")?`
    <path d="M172 290 Q176 295 174 305 M170 300 Q174 305 172 315" stroke="#73C6B6" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
    <path d="M228 290 Q224 295 226 305 M230 300 Q226 305 228 315" stroke="#73C6B6" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
  `:""}

  <!-- Head Base / Jawline -->
  <path d="M140 180 Q140 290 200 305 Q260 290 260 180 Q260 110 200 110 Q140 110 140 180 Z" fill="url(#${w})" />

  <!-- Ears & Piercings / Fins -->
  ${o.includes("mer")||o.includes("siren")?`
    <!-- Fin-like ears -->
    <path d="M138 180 Q115 160 120 205 Q135 200 140 195 Z" fill="${x}" opacity="0.9" />
    <path d="M262 180 Q285 160 280 205 Q265 200 260 195 Z" fill="${x}" opacity="0.9" />
  `:`
    <!-- Standard / Celestial tapered ears -->
    <ellipse cx="136" cy="195" rx="8" ry="18" fill="${x}" />
    <ellipse cx="264" cy="195" rx="8" ry="18" fill="${x}" />
  `}

  <!-- Hair Back / Volume -->
  <path d="M130 150 Q120 230 110 320 Q150 290 150 240 M270 150 Q280 230 290 320 Q250 290 250 240" fill="${l}" opacity="0.5" />

  <!-- Facial Shading (Cheekbones & Nose Bridge) -->
  <path d="M196 175 L196 235 L208 238 L192 238" fill="none" stroke="rgba(100,80,120,0.22)" stroke-width="2.5" stroke-linecap="round" />
  <ellipse cx="168" cy="210" rx="14" ry="7" fill="rgba(200,140,160,0.12)" />
  <ellipse cx="232" cy="210" rx="14" ry="7" fill="rgba(200,140,160,0.12)" />

  <!-- Eyes -->
  <!-- Left Eye -->
  <ellipse cx="172" cy="188" rx="14" ry="7" fill="#FFFFFF" />
  <ellipse cx="172" cy="188" rx="6.5" ry="6.5" fill="${y}" />
  <circle cx="172" cy="188" r="2.5" fill="#111" />
  <circle cx="174" cy="186" r="1.5" fill="#FFFFFF" />
  <path d="M156 186 Q172 178 188 186" fill="none" stroke="#2C2849" stroke-width="2.2" stroke-linecap="round" />

  <!-- Right Eye -->
  <ellipse cx="228" cy="188" rx="14" ry="7" fill="#FFFFFF" />
  <ellipse cx="228" cy="188" rx="6.5" ry="6.5" fill="${y}" />
  <circle cx="228" cy="188" r="2.5" fill="#111" />
  <circle cx="230" cy="186" r="1.5" fill="#FFFFFF" />
  <path d="M212 186 Q228 178 244 186" fill="none" stroke="#2C2849" stroke-width="2.2" stroke-linecap="round" />

  <!-- Eyebrows -->
  <path d="M156 176 Q172 170 188 174" fill="none" stroke="${l}" stroke-width="3" stroke-linecap="round" />
  <path d="M212 174 Q228 170 244 176" fill="none" stroke="${l}" stroke-width="3" stroke-linecap="round" />

  <!-- Mouth -->
  <path d="M185 264 Q200 270 215 264" fill="none" stroke="#A93226" stroke-width="2.2" stroke-linecap="round" opacity="0.8" />
  <path d="M188 263 Q200 266 212 263" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="1.2" />

  <!-- Front Hair Style -->
  <path d="M136 175 Q150 115 200 115 Q250 115 264 175 Q240 135 200 140 Q160 135 136 175 Z" fill="${l}" />
  <path d="M145 160 Q180 125 215 145" fill="none" stroke="${h}" stroke-width="2.5" opacity="0.4" />
  <path d="M170 120 Q200 105 230 120" fill="none" stroke="${h}" stroke-width="2" opacity="0.4" />

  <!-- Species Markings (Celestial Forehead Crest, Frost Crystals, or Dermal Spark) -->
  ${o.includes("angel")||o.includes("lightborn")||o.includes("aether")?`
    <!-- Celestial Forehead Star -->
    <path d="M200 138 L202 144 L208 146 L202 148 L200 154 L198 148 L192 146 L198 144 Z" fill="#C5AB78" opacity="0.85" filter="url(#glow-${s})" />
  `:o.includes("frost")?`
    <!-- Glacial Crystal Marks on cheek -->
    <circle cx="158" cy="205" r="1.5" fill="#FFFFFF" opacity="0.8" />
    <circle cx="162" cy="208" r="1.2" fill="#FFFFFF" opacity="0.8" />
    <circle cx="155" cy="210" r="1.2" fill="#FFFFFF" opacity="0.8" />
  `:""}

  <!-- Official Identification Stamp in lower right -->
  <g transform="translate(290, 410) scale(0.65)" opacity="0.75">
    <circle cx="40" cy="40" r="36" fill="none" stroke="#C5AB78" stroke-width="2" />
    <circle cx="40" cy="40" r="30" fill="none" stroke="#C5AB78" stroke-width="1" stroke-dasharray="3,3" />
    <text x="40" y="36" font-family="system-ui, sans-serif" font-size="8" font-weight="bold" fill="#C5AB78" text-anchor="middle">AURA</text>
    <text x="40" y="47" font-family="system-ui, sans-serif" font-size="7" fill="#C5AB78" text-anchor="middle">OFFICIAL</text>
  </g>
</svg>`;return`data:image/svg+xml;utf8,${encodeURIComponent(E)}`}function Ne(t,r){try{const s="miraverse-identity-registry-v3",o=localStorage.getItem(s);if(!o)return!1;const n=JSON.parse(o);if(!Array.isArray(n))return!1;const d=n.findIndex(c=>c.record===t);return d<0?!1:(n[d].portraitData=r,localStorage.setItem(s,JSON.stringify(n)),typeof window<"u"&&(window.postMessage({source:"meridion-registry",type:"citizens-changed"},window.location.origin),window.dispatchEvent(new Event("storage"))),!0)}catch(s){return console.error("Failed to persist citizen portrait:",s),!1}}function Se({citizen:t,isOpen:r,onClose:s,onPortraitSaved:o}){const[n,d]=u.useState("id"),[c,p]=u.useState({type:"none",online:!1,endpoint:"",details:"Scanning local environment..."}),[x,m]=u.useState(!1),[l,h]=u.useState(t.portraitData||""),[y,I]=u.useState(101),[C,w]=u.useState(!1),[E,S]=u.useState(100),[A,D]=u.useState(100),[a,g]=u.useState(100),[v,b]=u.useState(!1),R=u.useRef(null);u.useEffect(()=>{if(r&&(Q(),!l)){const f=M(t,y);h(f)}},[r,t]);const Q=async()=>{m(!0);const f=await Ie();p(f),m(!1)},T=Fe(t,n),oe=()=>{navigator.clipboard.writeText(T.prompt),w(!0),setTimeout(()=>w(!1),2e3)},re=(f=y+1)=>{I(f);const F=M(t,f);h(F)},ne=f=>{var J;const F=(J=f.target.files)==null?void 0:J[0];if(!F)return;if(!["image/jpeg","image/png","image/webp"].includes(F.type)){alert("Please upload a JPG, PNG, or WebP image.");return}const N=new FileReader;N.onload=()=>{typeof N.result=="string"&&h(N.result)},N.readAsDataURL(F)},j=f=>{const F={...t,species:f,hair:f.includes("Frost")?"Icy blue":f.includes("Solar")?"Platinum gold":f.includes("Siren")?"Sea green":"Silver-black",eyes:f.includes("Solar")?"Luminous gold":f.includes("Frost")?"Pale blue":"Amber"},N=M(F,Math.floor(Math.random()*9999));h(N)},ae=()=>{if(!l)return;Ne(t.record,l)?(b(!0),o&&o(l),setTimeout(()=>{b(!1),s()},900)):alert("Could not write to local registry. Ensure browser storage is enabled.")};return r?e.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none font-sans",children:e.jsxs("div",{className:"relative flex flex-col h-[90vh] max-h-[850px] w-full max-w-5xl rounded-2xl border border-[#443869] bg-[#161326] text-slate-100 shadow-2xl overflow-hidden",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-[#2C2648] bg-[#1C1833] px-6 py-4",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#9883C8] to-[#3C3268] text-white shadow-md",children:e.jsx(L,{size:20})}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("h2",{className:"text-base font-bold tracking-wide text-white",children:"PORTRAIT STUDIO"}),e.jsx("span",{className:"rounded-full bg-[#9883C8]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#C4B5FD] border border-[#9883C8]/30",children:"Phase 5 Integrated Engine"})]}),e.jsxs("p",{className:"text-xs text-slate-400",children:["Stylized fantasy realism portraits for ",e.jsx("strong",{className:"text-slate-200",children:t.name})," (",t.record,")"]})]})]}),e.jsx("div",{className:"flex items-center gap-3",children:e.jsx("button",{onClick:s,className:"flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition",title:"Close modal",children:e.jsx(le,{size:18})})})]}),e.jsxs("div",{className:"flex flex-1 min-h-0 divide-x divide-[#2C2648] overflow-hidden",children:[e.jsxs("div",{className:"flex flex-col flex-1 items-center justify-center bg-[#100D1C] p-6 overflow-y-auto",children:[e.jsxs("div",{className:"mb-4 flex rounded-lg border border-[#3C3268] bg-[#1C1833] p-1 text-xs font-semibold",children:[e.jsxs("button",{onClick:()=>d("id"),className:`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 transition ${n==="id"?"bg-[#9883C8] text-white shadow":"text-slate-400 hover:text-white"}`,children:[e.jsx(P,{size:13}),"ID Identification Headshot"]}),e.jsxs("button",{onClick:()=>d("expressive"),className:`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 transition ${n==="expressive"?"bg-[#9883C8] text-white shadow":"text-slate-400 hover:text-white"}`,children:[e.jsx(L,{size:13}),"Expressive Character Art"]})]}),e.jsxs("div",{className:"relative h-[380px] w-[310px] rounded-xl border-2 border-[#9883C8]/40 bg-[#1A162B] shadow-2xl overflow-hidden flex items-center justify-center",children:[l?e.jsx("div",{className:"h-full w-full flex items-center justify-center overflow-hidden",style:{filter:`brightness(${A}%) contrast(${a}%)`},children:e.jsx("img",{src:l,alt:"Citizen portrait",className:"h-full w-full object-cover transition-transform duration-200",style:{transform:`scale(${E/100})`}})}):e.jsxs("div",{className:"text-center p-6 text-slate-500 text-xs",children:[e.jsx(de,{size:36,className:"mx-auto mb-2 opacity-40"}),"Generating portrait..."]}),e.jsxs("div",{className:"pointer-events-none absolute inset-0 border border-white/10 m-2 rounded-lg",children:[e.jsx("div",{className:"absolute top-2 left-2 text-[9px] font-mono tracking-widest text-white/40 uppercase",children:"AURA · 35×45mm ISO SPEC"}),e.jsx("div",{className:"absolute bottom-2 right-2 flex items-center gap-1 text-[9px] font-mono text-[#C5AB78]",children:e.jsx("span",{children:"✦ MERIDION"})})]})]}),e.jsxs("div",{className:"mt-4 flex flex-wrap items-center justify-center gap-2.5",children:[e.jsxs("button",{onClick:()=>re(),className:"flex items-center gap-2 rounded-lg bg-[#3C3268] hover:bg-[#4E4185] border border-[#6B5A9E] px-4 py-2 text-xs font-semibold text-white shadow transition",children:[e.jsx(Z,{size:14}),"Generate New Celestial Variant"]}),e.jsxs("button",{onClick:()=>{var f;return(f=R.current)==null?void 0:f.click()},className:"flex items-center gap-2 rounded-lg bg-[#251F3D] hover:bg-[#342B55] border border-[#483B70] px-4 py-2 text-xs font-medium text-slate-200 transition",children:[e.jsx(ce,{size:14}),"Upload Photo File"]}),e.jsx("input",{ref:R,type:"file",accept:"image/png,image/jpeg,image/webp",onChange:ne,className:"hidden"})]}),e.jsxs("div",{className:"mt-4 flex items-center gap-1 text-[11px] text-slate-400",children:[e.jsx("span",{className:"font-semibold text-slate-300 mr-1",children:"Archetype Presets:"}),e.jsx("button",{onClick:()=>j("Frostborn"),className:"rounded px-2 py-0.5 bg-white/5 hover:bg-white/15 text-sky-300",children:"Frostborn"}),e.jsx("button",{onClick:()=>j("Luminari"),className:"rounded px-2 py-0.5 bg-white/5 hover:bg-white/15 text-amber-300",children:"Luminari"}),e.jsx("button",{onClick:()=>j("Merfolk Siren"),className:"rounded px-2 py-0.5 bg-white/5 hover:bg-white/15 text-emerald-300",children:"Merfolk"}),e.jsx("button",{onClick:()=>j("Lightborn Angel"),className:"rounded px-2 py-0.5 bg-white/5 hover:bg-white/15 text-purple-300",children:"Lightborn"})]})]}),e.jsxs("div",{className:"flex flex-col w-[380px] bg-[#18142A] p-5 overflow-y-auto space-y-4",children:[e.jsxs("div",{className:"rounded-xl border border-[#3C3268] bg-[#1F1A38] p-3.5 shadow-sm",children:[e.jsxs("div",{className:"flex items-center justify-between mb-1.5",children:[e.jsxs("span",{className:"text-[11px] font-bold tracking-wider text-[#C4B5FD] uppercase flex items-center gap-1.5",children:[e.jsx(pe,{size:14}),"Local AI Backend"]}),e.jsxs("button",{onClick:Q,disabled:x,className:"text-[11px] text-slate-400 hover:text-white transition flex items-center gap-1",children:[e.jsx(Z,{size:11,className:x?"animate-spin":""}),"Scan"]})]}),e.jsxs("div",{className:"flex items-center gap-2 mt-2",children:[e.jsx("div",{className:`h-2.5 w-2.5 rounded-full ${c.online?"bg-emerald-400 animate-pulse":"bg-amber-400"}`}),e.jsx("span",{className:"text-xs font-semibold text-slate-200",children:c.online?c.details:"Zero-Config Procedural Mode"})]}),e.jsx("p",{className:"text-[11px] text-slate-400 mt-1 leading-relaxed",children:c.online?`Connected to local pipeline at ${c.endpoint}. You can pass the synthesized prompt directly into your local queue.`:"Procedural Celestial Engine active. Generates accurate fantasy portraits instantly offline without external servers."})]}),e.jsxs("div",{className:"rounded-xl border border-[#3C3268] bg-[#1F1A38] p-3.5 space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-[11px] font-bold tracking-wider text-slate-300 uppercase",children:"Synthesized Prompt"}),e.jsxs("button",{onClick:oe,className:"flex items-center gap-1 text-[11px] font-medium text-[#C4B5FD] hover:text-white transition",children:[C?e.jsx(K,{size:12,className:"text-emerald-400"}):e.jsx(xe,{size:12}),C?"Copied":"Copy for ComfyUI"]})]}),e.jsx("div",{className:"max-h-28 overflow-y-auto rounded-lg border border-[#342B55] bg-[#141124] p-2.5 text-[11px] text-slate-300 leading-relaxed font-mono",children:T.prompt}),e.jsxs("details",{className:"text-[11px] text-slate-400 cursor-pointer pt-1",children:[e.jsx("summary",{className:"hover:text-slate-200",children:"View Negative Prompt"}),e.jsx("div",{className:"mt-1.5 rounded-md bg-[#141124] p-2 text-[10px] text-slate-400 font-mono",children:T.negativePrompt})]})]}),e.jsxs("div",{className:"rounded-xl border border-[#3C3268] bg-[#1F1A38] p-3.5 space-y-3",children:[e.jsxs("span",{className:"text-[11px] font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5",children:[e.jsx(fe,{size:13}),"Image Adjustments"]}),e.jsxs("div",{className:"space-y-1",children:[e.jsxs("div",{className:"flex justify-between text-[11px] text-slate-400",children:[e.jsx("span",{children:"Zoom / Crop Scale"}),e.jsxs("span",{className:"font-mono text-slate-200",children:[E,"%"]})]}),e.jsx("input",{type:"range",min:"90",max:"160",value:E,onChange:f=>S(Number(f.target.value)),className:"w-full accent-[#9883C8] h-1.5 bg-[#2D264E] rounded cursor-pointer"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsxs("div",{className:"flex justify-between text-[11px] text-slate-400",children:[e.jsx("span",{children:"Brightness"}),e.jsxs("span",{className:"font-mono text-slate-200",children:[A,"%"]})]}),e.jsx("input",{type:"range",min:"60",max:"140",value:A,onChange:f=>D(Number(f.target.value)),className:"w-full accent-[#9883C8] h-1.5 bg-[#2D264E] rounded cursor-pointer"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsxs("div",{className:"flex justify-between text-[11px] text-slate-400",children:[e.jsx("span",{children:"Contrast"}),e.jsxs("span",{className:"font-mono text-slate-200",children:[a,"%"]})]}),e.jsx("input",{type:"range",min:"60",max:"140",value:a,onChange:f=>g(Number(f.target.value)),className:"w-full accent-[#9883C8] h-1.5 bg-[#2D264E] rounded cursor-pointer"})]})]}),e.jsxs("div",{className:"pt-2",children:[e.jsxs("button",{onClick:ae,className:`w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold transition shadow-lg ${v?"bg-emerald-600 text-white":"bg-gradient-to-r from-[#9883C8] to-[#6C5FAC] hover:from-[#A896D8] hover:to-[#7D6FBF] text-white"}`,children:[v?e.jsx(te,{size:16}):e.jsx(K,{size:16}),v?"Applied to Citizen Profile!":"Apply to Master Citizen Profile"]}),e.jsx("p",{className:"text-[10px] text-slate-400 text-center mt-2 leading-tight",children:"Updates Aura ID, Passport, Registry, and TRACE records across all open OS workspaces."})]})]})]})]})}):null}const O={name:"Elara Vale",dob:"2001-04-18",place:"Northwake, Fross",record:"MRD-8492-319",passport:"AUR-782194",alias:"Frostweaver / Silverglass",address:"142 Moonwell Way, Glassline District, Aureline Central (fictional)",phone:"+1 (202) 555-0142",email:"elara.vale@example.com",district:"Glassline District, Aureline Central",height:"174 cm",eyes:"Luminous Violet-Gray",hair:"Silver-Black / Stardust Shimmer",build:"Slender / Resilient Cryo-Adaptation",blood:"A+ (Aura Calibrated)",mark:"Faint crystalline frost markings along left wrist",species:"Frostborn",ancestry:"Lightborn · Ellawen Lineage",abilities:"Cryo-constructs, frost veil stabilization, starlight resonance",powerSource:"PRISM resonance & Aether",affinity:"Violet · knowledge / illusion / memory",faction:"Aureline Civic & Academic Network",home:"Aureline, Orynvell",lore:"Descendant of ancient Northwake cryo-weavers; enrolled in Cyacademy advanced resonance curriculum.",category:"Student / academy",affiliation:"Cyacademy Central Campus",occupation:"Research Apprentice / Resonance Analyst",clearance:"General Civic Access · Academic Clearance II",aura:"Calibrated Harmonic Tier III",medical:"Faith Medical Group · intake verified",residency:"Cyacademy Dormitory 4B · Verified Residence",history:"Routine civil registration completed at intake; transferred from Northwake regional enclave.",status:"ACTIVE / VERIFIED",links:"Coordinates academic study group at Aureline Library; holds valid regional transit pass.",relationships:"Known associate of Cyacademy faculty",household:"Cyacademy Campus Dormitory 4B",timeline:"Origin: Northwake, Fross; residing in Aureline since Year 24",biometricSeed:"MRD-8492-319"},$=[{id:1,title:"Aura Citizen ID",subtitle:"Biometric Wallet Card",icon:me,color:"text-indigo-400"},{id:2,title:"Aura Passport",subtitle:"Official Travel Booklet",icon:ge,color:"text-amber-400"},{id:3,title:"Birth Certificate",subtitle:"Crown Archival Record",icon:ie,color:"text-purple-400"},{id:4,title:"10-Print Biometrics",subtitle:"Forensic Dermal Sheet",icon:P,color:"text-blue-400"},{id:5,title:"Investigative Profile",subtitle:"DGAOS EYES Dossier",icon:P,color:"text-rose-400"},{id:6,title:"Residency Record",subtitle:"Municipal Domicile Form",icon:ve,color:"text-emerald-400"},{id:7,title:"Physical ID Sheet",subtitle:"Forensic Biometrics & Marks",icon:he,color:"text-cyan-400"},{id:8,title:"Medical Summary",subtitle:"Faith Medical Group Summary",icon:ue,color:"text-teal-400"},{id:9,title:"Education / Service",subtitle:"Cyacademy & WORKNET",icon:ye,color:"text-yellow-400"}];function Re(){var D;const[t,r]=u.useState([]),[s,o]=u.useState(O),[n,d]=u.useState(1),[c,p]=u.useState(100),[x,m]=u.useState(!1),[l,h]=u.useState(null),y=()=>{try{const a=localStorage.getItem("miraverse-identity-registry-v3");if(a){const g=JSON.parse(a);if(Array.isArray(g)&&g.length>0){r(g);const v=g.find(b=>b.record===s.record);o(v||g[0]);return}}}catch{}r([O]),o(O)};u.useEffect(()=>{y();const a=g=>{var v,b;((v=g.data)==null?void 0:v.source)==="meridion-registry"&&((b=g.data)==null?void 0:b.type)==="citizens-changed"&&y()};return window.addEventListener("message",a),window.addEventListener("storage",y),()=>{window.removeEventListener("message",a),window.removeEventListener("storage",y)}},[]);const I=a=>{const g=t.find(v=>v.record===a);g&&o(g)},C=()=>{window.print()},w=()=>{const a=$.find(R=>R.id===n),g=(s.name||"citizen").toLowerCase().replace(/[^a-z0-9]+/g,"-"),v=`${a==null?void 0:a.title.toLowerCase().replace(/[^a-z0-9]+/g,"-")}_${g}_${s.record}.html`,b=Ee(n,s);X(b,v)},E=()=>{const g=`miraverse_nine_document_packet_${(s.name||"citizen").toLowerCase().replace(/[^a-z0-9]+/g,"-")}_${s.record}.html`,v=Ae(s);X(v,g);const b=ee({documentType:"FULL_NINE_DOCUMENT_PACKET",citizenRecordId:s.record,citizenName:s.name,issuedAt:new Date().toISOString(),issuingAuthority:"Aureline Civic Identity Administration & Crown Archives",version:"1.0"});h(`Exported complete 9-document packet! Snapshot logged: [${b.id}]`),setTimeout(()=>h(null),4e3)},S=()=>{const a=$.find(v=>v.id===n),g=ee({documentType:(a==null?void 0:a.title)||"CIVIL_DOCUMENT",citizenRecordId:s.record,citizenName:s.name,issuedAt:new Date().toISOString(),issuingAuthority:"Aureline Civic Identity Bureau",version:"1.0"});h(`Formal issuance snapshot created: [${g.id}] (Hash: ${g.hash})`),setTimeout(()=>h(null),4e3)},A=()=>{switch(n){case 1:return e.jsx("div",{dangerouslySetInnerHTML:{__html:k(s)}});case 2:return e.jsx("div",{dangerouslySetInnerHTML:{__html:B(s)}});case 3:return e.jsx("div",{dangerouslySetInnerHTML:{__html:z(s)}});case 4:return e.jsx("div",{dangerouslySetInnerHTML:{__html:H(s)}});case 5:return e.jsx("div",{dangerouslySetInnerHTML:{__html:U(s)}});case 6:return e.jsx("div",{dangerouslySetInnerHTML:{__html:G(s)}});case 7:return e.jsx("div",{dangerouslySetInnerHTML:{__html:V(s)}});case 8:return e.jsx("div",{dangerouslySetInnerHTML:{__html:Y(s)}});case 9:return e.jsx("div",{dangerouslySetInnerHTML:{__html:_(s)}});default:return e.jsx("div",{dangerouslySetInnerHTML:{__html:k(s)}})}};return e.jsxs("div",{className:"flex h-full w-full flex-col bg-[#0F0C1B] text-slate-100 select-none font-sans overflow-hidden",children:[e.jsxs("header",{className:"flex flex-wrap items-center justify-between border-b border-[#2C2448] bg-[#161226] px-5 py-3 shadow-md",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#C5AB78] to-[#6C5FAC] text-white shadow",children:e.jsx(ie,{size:18})}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("h1",{className:"text-sm font-bold tracking-wide text-white font-serif",children:"DOCUMENT STUDIO"}),e.jsx("span",{className:"rounded bg-[#C5AB78]/20 px-2 py-0.5 text-[10px] font-semibold text-[#E5D7B5] border border-[#C5AB78]/30",children:"Nine-Document Packet"})]}),e.jsx("p",{className:"text-[11px] text-slate-400",children:"Formal civil, forensic, and institutional paperwork for the Sovereign Realm of Meridion"})]})]}),e.jsxs("div",{className:"flex items-center gap-3 mt-2 sm:mt-0",children:[e.jsxs("div",{className:"flex items-center gap-2 bg-[#201A36] border border-[#3C3264] rounded-lg px-3 py-1.5 text-xs",children:[e.jsx("span",{className:"text-slate-400 font-medium",children:"Citizen Record:"}),e.jsx("select",{value:s.record,onChange:a=>I(a.target.value),className:"bg-transparent text-white font-semibold focus:outline-none cursor-pointer max-w-[200px] truncate",children:t.map(a=>e.jsxs("option",{value:a.record,className:"bg-[#1C1833] text-white",children:[a.name," (",a.record,")"]},a.record))})]}),e.jsxs("button",{onClick:()=>m(!0),className:"flex items-center gap-1.5 rounded-lg bg-[#3C3268] hover:bg-[#52448C] border border-[#6C5FAC] px-3 py-1.5 text-xs font-semibold text-white shadow transition",title:"Open integrated Portrait Studio",children:[e.jsx(L,{size:14,className:"text-[#C5AB78]"}),"Portrait Studio"]}),e.jsxs("button",{onClick:E,className:"flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#C5AB78] to-[#9883C8] hover:from-[#D4BC8B] hover:to-[#A896D8] text-[#1E1738] px-3.5 py-1.5 text-xs font-bold shadow transition",title:"Download all 9 documents as a combined PDF-ready packet",children:[e.jsx(q,{size:14}),"Export 9-Doc Packet"]})]})]}),l&&e.jsxs("div",{className:"bg-emerald-950/80 border-b border-emerald-600/40 text-emerald-200 px-5 py-2 text-xs flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(te,{size:14,className:"text-emerald-400"}),e.jsx("span",{children:l})]}),e.jsx("button",{onClick:()=>h(null),className:"text-emerald-400 hover:text-white",children:"✕"})]}),e.jsxs("div",{className:"flex flex-1 min-h-0 overflow-hidden",children:[e.jsxs("aside",{className:"w-64 border-r border-[#272040] bg-[#130F22] flex flex-col justify-between overflow-y-auto",children:[e.jsxs("div",{className:"p-3 space-y-1",children:[e.jsx("div",{className:"px-3 py-2 text-[10px] font-bold tracking-widest text-[#9883C8] uppercase",children:"Document Inventory (§7.1)"}),$.map(a=>{const g=a.icon,v=n===a.id;return e.jsxs("button",{onClick:()=>d(a.id),className:`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${v?"bg-[#292244] text-white border border-[#524484] shadow-sm":"text-slate-400 hover:bg-white/5 hover:text-slate-200"}`,children:[e.jsx("div",{className:`flex h-7 w-7 items-center justify-center rounded-md ${v?"bg-[#3C3268] text-white":"bg-[#1C1730] text-slate-400"}`,children:e.jsx(g,{size:14})}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("div",{className:"text-xs font-bold truncate leading-tight",children:a.title}),e.jsx("div",{className:"text-[10px] text-slate-400 truncate",children:a.subtitle})]}),v&&e.jsx(be,{size:14,className:"text-[#C5AB78]"})]},a.id)})]}),e.jsxs("div",{className:"p-3 border-t border-[#272040] bg-[#0E0B1A] text-[11px] text-slate-400 space-y-2",children:[e.jsxs("div",{className:"flex justify-between items-center text-[10px]",children:[e.jsx("span",{children:"ACTIVE CITIZEN:"}),e.jsx("strong",{className:"text-white truncate max-w-[120px]",children:s.name})]}),e.jsxs("div",{className:"flex justify-between items-center text-[10px]",children:[e.jsx("span",{children:"CIVIC STATUS:"}),e.jsx("span",{className:"text-emerald-400 font-semibold",children:s.status||"VERIFIED"})]}),e.jsxs("button",{onClick:S,className:"w-full flex items-center justify-center gap-1.5 rounded-md bg-[#251E3D] hover:bg-[#322A50] border border-[#44386A] py-1.5 text-[11px] font-medium text-slate-200 transition",children:[e.jsx(Ce,{size:12}),"Log Snapshot Issuance"]})]})]}),e.jsxs("main",{className:"flex-1 flex flex-col bg-[#1A162B] overflow-hidden",children:[e.jsxs("div",{className:"flex items-center justify-between border-b border-[#2C2448] bg-[#161226] px-6 py-2.5 text-xs",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("span",{className:"font-bold text-white tracking-wide",children:(D=$.find(a=>a.id===n))==null?void 0:D.title}),e.jsx("span",{className:"text-slate-400 text-[11px]",children:"Official Sovereign Document · Specimen View"})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("div",{className:"flex items-center gap-1 text-[11px] text-slate-400 bg-[#201A36] border border-[#3C3264] rounded-md px-2 py-1",children:[e.jsx("span",{children:"Scale:"}),e.jsx("button",{onClick:()=>p(Math.max(60,c-10)),className:"px-1 hover:text-white",children:"-"}),e.jsxs("span",{className:"text-white font-mono",children:[c,"%"]}),e.jsx("button",{onClick:()=>p(Math.min(140,c+10)),className:"px-1 hover:text-white",children:"+"})]}),e.jsxs("button",{onClick:C,className:"flex items-center gap-1.5 rounded-md bg-[#251E3D] hover:bg-[#342A54] border border-[#44386A] px-3 py-1.5 text-xs text-white transition",children:[e.jsx(we,{size:13}),"Print Document"]}),e.jsxs("button",{onClick:w,className:"flex items-center gap-1.5 rounded-md bg-[#3C3268] hover:bg-[#4E4185] border border-[#6C5FAC] px-3 py-1.5 text-xs font-semibold text-white shadow transition",children:[e.jsx(q,{size:13}),"Download HTML"]})]})]}),e.jsx("div",{className:"flex-1 overflow-auto p-8 flex justify-center bg-[#1F1A33]",children:e.jsx("div",{className:"transition-transform duration-150 origin-top",style:{transform:`scale(${c/100})`},children:A()})})]})]}),e.jsx(Se,{citizen:s,isOpen:x,onClose:()=>m(!1),onPortraitSaved:a=>{o(g=>({...g,portraitData:a})),y()}})]})}export{Re as default};
