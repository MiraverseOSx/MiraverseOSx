import{r as c,j as t}from"./framer-motion-DSXSN-3g.js";import{a as I,d as te,b as ie,p as oe}from"./maidIdentityService-BymElB3S.js";import{i as j,X as se,d as re,N as ae,R as k,bh as de,f as ne,c as L,s as le,bi as pe,C as ce}from"./lucide-icons-DHpcVkYH.js";function i(e){return String(e??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function M(e,o){const r=String(e).split("").reduce((p,x)=>p*31+x.charCodeAt(0)>>>0,2166136261)+(o+1)*92821,s=r%37-18,n=45+r%7-3,a=44+(r>>>4)%7-3;let l="";for(let p=0;p<15;p++){const x=6+p*2.13,m=10+p*2.5;l+=`<ellipse cx="${n}" cy="${a}" rx="${x}" ry="${m}" fill="none" stroke="#2C2849" stroke-width="0.8" opacity="${(.9-p*.026).toFixed(2)}" transform="rotate(${s} ${n} ${a})" stroke-dasharray="${(r+p)%5===0?"34 3 48 2":"210"}"/>`}return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 100" class="w-full h-full"><rect width="90" height="100" fill="#FFFFFF"/>${l}<text x="5" y="95" font-family="sans-serif" font-size="5" fill="#888899">SIMULATED</text></svg>`}const P=`
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
`;function F(e){return`
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
              <div style="font-size:15px;font-weight:700;color:#1E1738;font-family:'Cinzel',serif;">${i(e.name)}</div>
            </div>
            <div>
              <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#68758A;">Official MAID</div>
              <div style="font-weight:700;font-family:'JetBrains Mono',monospace;color:#2C2849;">${i(e.maid||e.record)}</div>
              ${e.maid&&e.record!==e.maid?`<div style="font-size:7px;color:#8A95A5;">Legacy: ${i(e.record)}</div>`:""}
            </div>
            <div>
              <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#68758A;">Date of Birth</div>
              <div style="font-weight:600;color:#2C2849;">${i(e.dob)}</div>
            </div>
            <div>
              <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#68758A;">Home Realm</div>
              <div style="font-weight:600;color:#2C2849;">${i(e.home)}</div>
            </div>
            <div>
              <div style="font-size:8px;font-weight:700;text-transform:uppercase;color:#68758A;">Species / Kind</div>
              <div style="font-weight:600;color:#2C2849;">${i(e.species)}</div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #C4BDD8;padding-top:8px;font-size:8px;color:#68758A;font-weight:600;letter-spacing:0.5px;">
          <span>STATUS: <strong style="color:#2E7D32;">${i(e.status||"VERIFIED")}</strong></span>
          <span>AURA SECURITY CODE: <strong style="font-family:monospace;">${i(e.passport||"AUR-901842")}</strong></span>
        </div>
      </div>

      <!-- BACK SIDE -->
      <div style="width:520px;height:328px;border-radius:18px;background:linear-gradient(135deg, #1F1B36 0%, #2A2447 100%);border:1px solid #4D4370;box-shadow:0 12px 35px rgba(44,40,73,0.25);position:relative;overflow:hidden;padding:22px;color:#E6E2F2;display:flex;flex-direction:column;justify-content:space-between;">
        
        <!-- Magnetic Stripe -->
        <div style="height:44px;background:#0F0C1C;margin:-22px -22px 14px -22px;border-bottom:1px solid #3A3258;"></div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:10px;">
          <div>
            <div style="font-size:8px;color:#A59DC2;text-transform:uppercase;">Emergency Contact</div>
            <div style="font-weight:600;color:#FFF;">${i(e.phone)}</div>
          </div>
          <div>
            <div style="font-size:8px;color:#A59DC2;text-transform:uppercase;">Biometric Telemetry</div>
            <div style="font-weight:600;color:#FFF;">${i(e.blood)} · ${i(e.height)}</div>
          </div>
          <div style="grid-column:1/-1;">
            <div style="font-size:8px;color:#A59DC2;text-transform:uppercase;">Residential Jurisdiction</div>
            <div style="font-weight:600;color:#FFF;">${i(e.address)}</div>
          </div>
        </div>

        <!-- MRZ Zone -->
        <div style="background:#131024;border:1px solid #3C335C;border-radius:8px;padding:8px 12px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:3px;color:#C5AB78;line-height:1.5;">
          I&lt;MRD${(e.maid||e.record||"MRD0000").replace(/[^A-Z0-9]/gi,"")}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;<br>
          ${(e.dob||"000000").replace(/-/g,"")}4M3409121MRD&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;4
        </div>
      </div>
    </div>
  `}function B(e){return`
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
              <div style="font-family:'Cinzel',serif;font-size:18px;font-weight:700;color:#2C2849;">${i(e.name)}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Passport No.</div>
              <div style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#9883C8;">${i(e.passport||"AUR-918204")}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Official MAID</div>
              <div style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#2C2849;">${i(e.maid||e.record)}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Nationality</div>
              <div style="font-weight:600;">MERIDION</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Date of Birth</div>
              <div style="font-weight:600;">${i(e.dob)}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Place of Birth</div>
              <div style="font-weight:600;">${i(e.place)}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Species / Choir</div>
              <div style="font-weight:600;">${i(e.species)}</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Issuing Authority</div>
              <div style="font-weight:600;">AURA PASSPORT ADM.</div>
            </div>
            <div>
              <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">PRISM Resonance</div>
              <div style="font-weight:600;">${i(e.affinity)}</div>
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
  `}function z(e){return`
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
        <div>OFFICIAL MAID: <strong style="font-family:'JetBrains Mono',monospace;">${i(e.maid||`BIR-${e.record}`)}</strong>${e.maid&&e.record!==e.maid?`<span style="font-size:9px;color:#718096;margin-left:8px;">(Legacy: ${i(e.record)})</span>`:""}</div>
        <div>SOLAR CYCLE: <strong>FOUNDING ERA</strong></div>
        <div>PAGE: <strong>1 OF 1</strong></div>
      </div>

      <!-- Main Nativity Details -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;font-size:13px;line-height:1.6;margin-bottom:30px;">
        <div style="grid-column:1/-1;border-bottom:1px solid #E2D9C8;padding-bottom:12px;">
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Full Legal Name of Child</div>
          <div style="font-family:'Cinzel',serif;font-size:22px;font-weight:700;color:#1E1738;">${i(e.name)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Date of Birth</div>
          <div style="font-weight:600;">${i(e.dob)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Place of Nativity / Facility</div>
          <div style="font-weight:600;">${i(e.place)} (Sanctuary Records)</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Ancestral Lineage / Heritage</div>
          <div style="font-weight:600;">${i(e.ancestry)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Species Classification</div>
          <div style="font-weight:600;">${i(e.species)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Elemental Affinity / Resonance</div>
          <div style="font-weight:600;">${i(e.affinity)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#8C7541;text-transform:uppercase;">Power Source</div>
          <div style="font-weight:600;">${i(e.powerSource)}</div>
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
  `}function H(e){const o=e.biometricSeed||e.record,r=["Thumb","Index","Middle","Ring","Little"];return`
    <div class="doc-page doc-landscape" style="background:#FFFFFF;">
      <div class="watermark">FORENSIC SPECIMEN</div>
      
      <!-- Forensic Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #2C2849;padding-bottom:14px;margin-bottom:18px;">
        <div>
          <div style="font-family:'Cinzel',serif;font-size:18px;font-weight:800;letter-spacing:1px;color:#2C2849;">DGAOS // TACTICAL FORENSIC BIOMETRIC ARCHIVE</div>
          <div style="font-size:10px;font-weight:700;color:#6C5FAC;letter-spacing:1.5px;text-transform:uppercase;">FORM TRACE-10-PRINT · DERMAL IMPRESSION REGISTRATION</div>
        </div>
        <div style="text-align:right;font-size:10px;font-family:'JetBrains Mono',monospace;">
          <div>SPECIMEN ID: <strong>BIO-${i(e.maid||e.record)}</strong></div>
          <div>CUSTODY: <strong>DGAOS EYES RECORD</strong></div>
        </div>
      </div>

      <!-- Subject Summary Strip -->
      <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:12px;background:#F8F6FC;border:1px solid #D5CEE4;border-radius:6px;padding:10px 14px;margin-bottom:20px;font-size:11px;">
        <div><span style="color:#718096;font-size:9px;display:block;">SUBJECT NAME</span><strong>${i(e.name)}</strong></div>
        <div><span style="color:#718096;font-size:9px;display:block;">OFFICIAL MAID</span><strong>${i(e.maid||e.record)}</strong>${e.maid&&e.record!==e.maid?`<span style="font-size:8px;color:#718096;display:block;">Legacy: ${i(e.record)}</span>`:""}</div>
        <div><span style="color:#718096;font-size:9px;display:block;">SPECIES</span><strong>${i(e.species)}</strong></div>
        <div><span style="color:#718096;font-size:9px;display:block;">CLEARANCE</span><strong>${i(e.clearance)}</strong></div>
        <div><span style="color:#718096;font-size:9px;display:block;">COLLECTION STATUS</span><strong style="color:#2E7D32;">VERIFIED</strong></div>
      </div>

      <!-- 10-Print Grid -->
      <div style="margin-bottom:18px;">
        <!-- Right Hand -->
        <div style="font-size:11px;font-weight:700;color:#2C2849;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.8px;">1. RIGHT HAND (DIGITS 1 TO 5)</div>
        <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:10px;margin-bottom:16px;">
          ${[0,1,2,3,4].map(s=>`
            <div style="border:1.5px solid #2C2849;border-radius:4px;background:#FFF;padding:6px;text-align:center;">
              <div style="height:105px;display:flex;align-items:center;justify-content:center;">
                ${M(o,s)}
              </div>
              <div style="border-top:1px solid #D5CEE4;margin-top:4px;padding-top:4px;font-size:9px;font-weight:700;color:#4A5568;">
                R. ${r[s]}
              </div>
            </div>
          `).join("")}
        </div>

        <!-- Left Hand -->
        <div style="font-size:11px;font-weight:700;color:#2C2849;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.8px;">2. LEFT HAND (DIGITS 6 TO 10)</div>
        <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:10px;">
          ${[5,6,7,8,9].map(s=>`
            <div style="border:1.5px solid #2C2849;border-radius:4px;background:#FFF;padding:6px;text-align:center;">
              <div style="height:105px;display:flex;align-items:center;justify-content:center;">
                ${M(o,s)}
              </div>
              <div style="border-top:1px solid #D5CEE4;margin-top:4px;padding-top:4px;font-size:9px;font-weight:700;color:#4A5568;">
                L. ${r[s-5]}
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
  `}function U(e){return`
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
            <div style="font-size:20px;font-weight:700;color:#2C2849;font-family:'Cinzel',serif;">${i(e.name)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Master Civic ID / Official MAID</div>
            <div style="font-weight:700;font-family:'JetBrains Mono',monospace;">${i(e.maid||e.record)}</div>
            ${e.maid&&e.record!==e.maid?`<div style="font-size:8px;color:#718096;">Legacy: ${i(e.record)}</div>`:""}
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Aliases / Monikers</div>
            <div style="font-weight:600;">${i(e.alias||"None verified")}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Clearance Level</div>
            <div style="font-weight:700;color:#C53030;">${i(e.clearance)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Resonance Threat Matrix</div>
            <div style="font-weight:600;">${i(e.affinity)}</div>
          </div>
        </div>
      </div>

      <!-- Case Links & Investigative Notes -->
      <div style="display:flex;flex-direction:column;gap:16px;font-size:12px;">
        <div style="border:1px solid #E2E8F0;border-radius:6px;padding:14px;background:#F8FAFC;">
          <div style="font-size:10px;font-weight:700;color:#2C2849;text-transform:uppercase;margin-bottom:6px;">Known Case Activity &amp; Inquiries</div>
          <div style="line-height:1.6;color:#334155;">${i(e.links||"No ongoing warrants active.")}</div>
        </div>

        <div style="border:1px solid #E2E8F0;border-radius:6px;padding:14px;background:#F8FAFC;">
          <div style="font-size:10px;font-weight:700;color:#2C2849;text-transform:uppercase;margin-bottom:6px;">Registration &amp; Surveillance History</div>
          <div style="line-height:1.6;color:#334155;">${i(e.history||"Standard civic onboarding completed.")}</div>
        </div>

        <div style="border:1px solid #E2E8F0;border-radius:6px;padding:14px;background:#F8FAFC;">
          <div style="font-size:10px;font-weight:700;color:#2C2849;text-transform:uppercase;margin-bottom:6px;">Known Associates &amp; Household Network</div>
          <div style="line-height:1.6;color:#334155;">${i(e.relationships||"No suspicious associates cataloged.")}</div>
        </div>
      </div>
    </div>
  `}function G(e){return`
    <div class="doc-page" style="background:#FFFFFF;">
      <div class="watermark">MUNICIPAL HOUSING</div>
      
      <!-- Municipal Header -->
      <div style="border-bottom:3px double #2C2849;padding-bottom:16px;margin-bottom:24px;">
        <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;color:#6C5FAC;font-weight:700;">MUNICIPALITY OF AURELINE · HOMECRAFT HOUSING AUTHORITY</div>
        <div style="font-family:'Cinzel',serif;font-size:24px;font-weight:800;color:#2C2849;margin:6px 0;">OFFICIAL DOMICILE &amp; RESIDENCY CERTIFICATE</div>
        <div style="font-size:10px;color:#718096;text-transform:uppercase;font-weight:600;">HOUSING REGISTRATION NO: RES-${i(e.maid||e.record)}</div>
      </div>

      <!-- Domicile Details Grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px 24px;font-size:13px;line-height:1.6;margin-bottom:32px;">
        <div style="grid-column:1/-1;background:#F8F6FC;padding:14px;border-radius:6px;border:1px solid #D5CEE4;">
          <div style="font-size:10px;font-weight:700;color:#6C5FAC;text-transform:uppercase;">Registered Occupant</div>
          <div style="font-family:'Cinzel',serif;font-size:18px;font-weight:700;color:#2C2849;">${i(e.name)}</div>
          <div style="font-size:11px;color:#666;">OFFICIAL MAID: <strong style="font-family:monospace;color:#2C2849;">${i(e.maid||e.record)}</strong>${e.maid&&e.record!==e.maid?` · Legacy: ${i(e.record)}`:""}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#718096;text-transform:uppercase;">Primary Residence Address</div>
          <div style="font-weight:600;color:#2C2849;">${i(e.address)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#718096;text-transform:uppercase;">Municipal Service District</div>
          <div style="font-weight:600;color:#2C2849;">${i(e.district)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#718096;text-transform:uppercase;">Housing Category</div>
          <div style="font-weight:600;color:#2C2849;">${i(e.residency)}</div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#718096;text-transform:uppercase;">Regional Jurisdiction</div>
          <div style="font-weight:600;color:#2C2849;">${i(e.home)}</div>
        </div>
      </div>

      <!-- Domicile Verification Stamp -->
      <div style="border:1px solid #C4BDD8;padding:18px;border-radius:8px;background:#FAF9FD;font-size:12px;color:#4A4458;line-height:1.6;">
        <div style="font-weight:700;color:#2C2849;margin-bottom:6px;">ENERGY &amp; AETHER GRID COMPLIANCE</div>
        This premise is connected to the Aureline Core Grid. Occupancy rights are registered in full standing with no outstanding structural or noise violations reported.
      </div>
    </div>
  `}function V(e){return`
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
              <div style="font-size:16px;font-weight:700;color:#2C2849;font-family:'Cinzel',serif;">${i(e.name)}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:8px;font-weight:700;color:#718096;text-transform:uppercase;">Official MAID</div>
              <div style="font-family:'JetBrains Mono',monospace;font-weight:700;color:#2C2849;font-size:12px;">${i(e.maid||e.record)}</div>
              ${e.maid&&e.record!==e.maid?`<div style="font-size:8px;color:#718096;">Legacy: ${i(e.record)}</div>`:""}
            </div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Height</div>
            <div style="font-weight:600;">${i(e.height)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Build</div>
            <div style="font-weight:600;">${i(e.build)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Eye Color</div>
            <div style="font-weight:600;">${i(e.eyes)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Hair Color &amp; Style</div>
            <div style="font-weight:600;">${i(e.hair)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Blood Classification</div>
            <div style="font-weight:600;">${i(e.blood)}</div>
          </div>
          <div>
            <div style="font-size:9px;font-weight:700;color:#718096;text-transform:uppercase;">Species / Physiology</div>
            <div style="font-weight:600;">${i(e.species)}</div>
          </div>
        </div>
      </div>

      <!-- Scars and Markings Table -->
      <div style="border:1px solid #CBD5E1;border-radius:6px;overflow:hidden;margin-bottom:24px;">
        <div style="background:#F1F5F9;padding:10px 14px;font-size:11px;font-weight:700;color:#1E293B;border-bottom:1px solid #CBD5E1;">
          DISTINCTIVE IDENTIFIERS, SCARS &amp; PHYSIOLOGICAL ANOMALIES
        </div>
        <div style="padding:14px;font-size:12px;line-height:1.6;color:#334155;">
          ${i(e.mark||"No unusual physical marks, tattoos, or dermal anomalies recorded at enrollment.")}
        </div>
      </div>
    </div>
  `}function Y(e){return`
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
          <div>RECORD NO: <strong>MED-${i(e.maid||e.record)}</strong></div>
          ${e.maid&&e.record!==e.maid?`<div style="font-size:8px;color:#64748B;">Legacy: ${i(e.record)}</div>`:""}
          <div style="color:#0D9488;">FACILITY: FAITH AURELINE</div>
        </div>
      </div>

      <!-- Patient Vitals Strip -->
      <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:14px;background:#F0FDFA;border:1px solid #99F6E4;border-radius:8px;padding:14px;margin-bottom:24px;font-size:12px;">
        <div><span style="color:#64748B;font-size:9px;display:block;">PATIENT</span><strong>${i(e.name)}</strong></div>
        <div><span style="color:#64748B;font-size:9px;display:block;">DATE OF BIRTH</span><strong>${i(e.dob)}</strong></div>
        <div><span style="color:#64748B;font-size:9px;display:block;">BLOOD GROUP</span><strong>${i(e.blood)}</strong></div>
        <div><span style="color:#64748B;font-size:9px;display:block;">INTAKE STATUS</span><strong style="color:#0F766E;">${i(e.medical)}</strong></div>
      </div>

      <!-- Elemental Resilience & Clinical Notes -->
      <div style="display:flex;flex-direction:column;gap:18px;font-size:12px;line-height:1.6;">
        <div style="border:1px solid #E2E8F0;border-radius:6px;padding:14px;">
          <div style="font-size:10px;font-weight:700;color:#0D9488;text-transform:uppercase;margin-bottom:6px;">Elemental Resilience &amp; Physiology</div>
          <div>Species alignment: <strong>${i(e.species)}</strong>. Power source resonance: <strong>${i(e.powerSource)}</strong>. Cellular healing response normal.</div>
        </div>

        <div style="border:1px solid #E2E8F0;border-radius:6px;padding:14px;">
          <div style="font-size:10px;font-weight:700;color:#0D9488;text-transform:uppercase;margin-bottom:6px;">Emergency Notification Directives</div>
          <div>Primary communication line: <strong>${i(e.phone)}</strong>. Registered residence: <strong>${i(e.address)}</strong>.</div>
        </div>
      </div>
    </div>
  `}function J(e){return`
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
        <div><span style="color:#718096;font-size:9px;display:block;">INDIVIDUAL NAME</span><strong style="font-size:15px;">${i(e.name)}</strong></div>
        <div><span style="color:#718096;font-size:9px;display:block;">OFFICIAL MAID / CIVIC ID</span><strong style="font-family:monospace;">${i(e.maid||e.record)}</strong>${e.maid&&e.record!==e.maid?`<span style="font-size:9px;color:#718096;margin-left:6px;">(Legacy: ${i(e.record)})</span>`:""}</div>
      </div>

      <!-- Academic Record Section -->
      <div style="border:1px solid #E2E8F0;border-radius:6px;padding:16px;margin-bottom:20px;font-size:12px;">
        <div style="font-family:'Cinzel',serif;font-weight:700;color:#2C2849;font-size:13px;border-bottom:1px solid #E2E8F0;padding-bottom:6px;margin-bottom:10px;">
          1. ACADEMIC ENROLLMENT &amp; QUALIFICATIONS
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;line-height:1.6;">
          <div>Institution: <strong>Cyacademy Central Campus, Aureline</strong></div>
          <div>Academic House: <strong>${i(e.category.includes("student")?"Active Trainee":"Completed Curriculum")}</strong></div>
          <div>Specialization / Talents: <strong>${i(e.abilities)}</strong></div>
          <div>Aura Calibration: <strong>Certified Standard</strong></div>
        </div>
      </div>

      <!-- Professional Service Section -->
      <div style="border:1px solid #E2E8F0;border-radius:6px;padding:16px;font-size:12px;">
        <div style="font-family:'Cinzel',serif;font-weight:700;color:#2C2849;font-size:13px;border-bottom:1px solid #E2E8F0;padding-bottom:6px;margin-bottom:10px;">
          2. WORKNET VERIFIED EMPLOYMENT HISTORY
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;line-height:1.6;">
          <div>Verified Occupation: <strong>${i(e.occupation)}</strong></div>
          <div>Affiliated Entity: <strong>${i(e.affiliation)}</strong></div>
          <div>Clearance Status: <strong>${i(e.clearance)}</strong></div>
          <div>Institutional Standing: <strong style="color:#2E7D32;">ACTIVE / IN GOOD STANDING</strong></div>
        </div>
      </div>
    </div>
  `}function ye(e,o){let r="",s="";switch(e){case 1:r=F(o),s=`Aura Citizen ID - ${o.name}`;break;case 2:r=B(o),s=`Aura Passport - ${o.name}`;break;case 3:r=z(o),s=`Birth Certificate - ${o.name}`;break;case 4:r=H(o),s=`Ten-Print Biometric Record - ${o.name}`;break;case 5:r=U(o),s=`Investigative Subject Profile - ${o.name}`;break;case 6:r=G(o),s=`Residency Record - ${o.name}`;break;case 7:r=V(o),s=`Physical Identification Sheet - ${o.name}`;break;case 8:r=Y(o),s=`Medical Identity Summary - ${o.name}`;break;case 9:r=J(o),s=`Education & Employment Record - ${o.name}`;break;default:r=F(o),s=`Aura Citizen ID - ${o.name}`}return`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${i(s)}</title>
  <style>${P}</style>
</head>
<body>
  <div class="print-actions">
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
  ${r}
</body>
</html>`}function he(e){const o=`Meridion Nine-Document Packet - ${e.name} (${e.maid||e.record})`;return`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${i(o)}</title>
  <style>${P}</style>
</head>
<body>
  <div class="print-actions">
    <button class="print-btn" onclick="window.print()">Print Complete 9-Document Packet (PDF)</button>
  </div>

  <!-- Document 1: Aura Citizen ID -->
  <div class="doc-page">
    <div style="font-family:'Cinzel',serif;font-size:12px;font-weight:700;color:#6C5FAC;margin-bottom:10px;">DOCUMENT 1 OF 9 · AURA CITIZEN IDENTIFICATION CARD</div>
    ${F(e)}
  </div>

  <!-- Document 2: Aura Passport -->
  ${B(e)}

  <!-- Document 3: Birth Certificate -->
  ${z(e)}

  <!-- Document 4: Ten-Print Biometric Form -->
  ${H(e)}

  <!-- Document 5: Investigative Subject Profile -->
  ${U(e)}

  <!-- Document 6: Residency Record -->
  ${G(e)}

  <!-- Document 7: Physical Identification Sheet -->
  ${V(e)}

  <!-- Document 8: Medical Identity Summary -->
  ${Y(e)}

  <!-- Document 9: Education & Employment Record -->
  ${J(e)}
</body>
</html>`}function ue(e,o){const r=new Blob([e],{type:"text/html;charset=utf-8"}),s=URL.createObjectURL(r),n=document.createElement("a");n.href=s,n.download=o,n.click(),setTimeout(()=>URL.revokeObjectURL(s),1500)}function be(e){const o="miraverse-issued-documents",r=`ISSUE-${Date.now()}-${Math.floor(Math.random()*9999)}`,s=Math.random().toString(36).substring(2,12).toUpperCase(),n={...e,id:r,hash:s};try{const a=JSON.parse(localStorage.getItem(o)||"[]");a.unshift(n),localStorage.setItem(o,JSON.stringify(a))}catch(a){console.error("Failed to log document issuance snapshot:",a)}return n}function Ce(e,o){const r="miraverse-issued-documents";try{const s=JSON.parse(localStorage.getItem(r)||"[]");return Array.isArray(s)?!e&&!o?s:s.filter(n=>e&&n.citizenId===e||o&&n.citizenId===o):[]}catch{return[]}}function we({citizen:e,isOpen:o,onClose:r,onPortraitSaved:s}){const[n,a]=c.useState("id"),[l,p]=c.useState({type:"none",online:!1,endpoint:"",details:"Scanning local environment..."}),[x,m]=c.useState(!1),[v,y]=c.useState(e.portraitData||""),[R,K]=c.useState(101),[S,N]=c.useState(!1),[u,Z]=c.useState(100),[b,q]=c.useState(100),[C,W]=c.useState(100),[w,D]=c.useState(!1),T=c.useRef(null);c.useEffect(()=>{if(o&&($(),!v)){const d=I(e,R);y(d)}},[o,e]);const $=async()=>{m(!0);const d=await te();p(d),m(!1)},E=ie(e,n),X=()=>{navigator.clipboard.writeText(E.prompt),N(!0),setTimeout(()=>N(!1),2e3)},Q=(d=R+1)=>{K(d);const f=I(e,d);y(f)},_=d=>{var O;const f=(O=d.target.files)==null?void 0:O[0];if(!f)return;if(!["image/jpeg","image/png","image/webp"].includes(f.type)){alert("Please upload a JPG, PNG, or WebP image.");return}const g=new FileReader;g.onload=()=>{typeof g.result=="string"&&y(g.result)},g.readAsDataURL(f)},h=d=>{const f={...e,species:d,hair:d.includes("Frost")?"Icy blue":d.includes("Solar")?"Platinum gold":d.includes("Siren")?"Sea green":"Silver-black",eyes:d.includes("Solar")?"Luminous gold":d.includes("Frost")?"Pale blue":"Amber"},g=I(f,Math.floor(Math.random()*9999));y(g)},ee=()=>{if(!v)return;oe(e.record,v)?(D(!0),s&&s(v),setTimeout(()=>{D(!1),r()},900)):alert("Could not write to local registry. Ensure browser storage is enabled.")};return o?t.jsx("div",{className:"fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none font-sans",children:t.jsxs("div",{className:"relative flex flex-col h-[90vh] max-h-[850px] w-full max-w-5xl rounded-2xl border border-[#443869] bg-[#161326] text-slate-100 shadow-2xl overflow-hidden",children:[t.jsxs("div",{className:"flex items-center justify-between border-b border-[#2C2648] bg-[#1C1833] px-6 py-4",children:[t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#9883C8] to-[#3C3268] text-white shadow-md",children:t.jsx(j,{size:20})}),t.jsxs("div",{children:[t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx("h2",{className:"text-base font-bold tracking-wide text-white",children:"PORTRAIT STUDIO"}),t.jsx("span",{className:"rounded-full bg-[#9883C8]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#C4B5FD] border border-[#9883C8]/30",children:"Phase 5 Integrated Engine"})]}),t.jsxs("p",{className:"text-xs text-slate-400",children:["Stylized fantasy realism portraits for ",t.jsx("strong",{className:"text-slate-200",children:e.name})," (",e.record,")"]})]})]}),t.jsx("div",{className:"flex items-center gap-3",children:t.jsx("button",{onClick:r,className:"flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition",title:"Close modal",children:t.jsx(se,{size:18})})})]}),t.jsxs("div",{className:"flex flex-1 min-h-0 divide-x divide-[#2C2648] overflow-hidden",children:[t.jsxs("div",{className:"flex flex-col flex-1 items-center justify-center bg-[#100D1C] p-6 overflow-y-auto",children:[t.jsxs("div",{className:"mb-4 flex rounded-lg border border-[#3C3268] bg-[#1C1833] p-1 text-xs font-semibold",children:[t.jsxs("button",{onClick:()=>a("id"),className:`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 transition ${n==="id"?"bg-[#9883C8] text-white shadow":"text-slate-400 hover:text-white"}`,children:[t.jsx(re,{size:13}),"ID Identification Headshot"]}),t.jsxs("button",{onClick:()=>a("expressive"),className:`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 transition ${n==="expressive"?"bg-[#9883C8] text-white shadow":"text-slate-400 hover:text-white"}`,children:[t.jsx(j,{size:13}),"Expressive Character Art"]})]}),t.jsxs("div",{className:"relative h-[380px] w-[310px] rounded-xl border-2 border-[#9883C8]/40 bg-[#1A162B] shadow-2xl overflow-hidden flex items-center justify-center",children:[v?t.jsx("div",{className:"h-full w-full flex items-center justify-center overflow-hidden",style:{filter:`brightness(${b}%) contrast(${C}%)`},children:t.jsx("img",{src:v,alt:"Citizen portrait",className:"h-full w-full object-cover transition-transform duration-200",style:{transform:`scale(${u/100})`}})}):t.jsxs("div",{className:"text-center p-6 text-slate-500 text-xs",children:[t.jsx(ae,{size:36,className:"mx-auto mb-2 opacity-40"}),"Generating portrait..."]}),t.jsxs("div",{className:"pointer-events-none absolute inset-0 border border-white/10 m-2 rounded-lg",children:[t.jsx("div",{className:"absolute top-2 left-2 text-[9px] font-mono tracking-widest text-white/40 uppercase",children:"AURA · 35×45mm ISO SPEC"}),t.jsx("div",{className:"absolute bottom-2 right-2 flex items-center gap-1 text-[9px] font-mono text-[#C5AB78]",children:t.jsx("span",{children:"✦ MERIDION"})})]})]}),t.jsxs("div",{className:"mt-4 flex flex-wrap items-center justify-center gap-2.5",children:[t.jsxs("button",{onClick:()=>Q(),className:"flex items-center gap-2 rounded-lg bg-[#3C3268] hover:bg-[#4E4185] border border-[#6B5A9E] px-4 py-2 text-xs font-semibold text-white shadow transition",children:[t.jsx(k,{size:14}),"Generate New Celestial Variant"]}),t.jsxs("button",{onClick:()=>{var d;return(d=T.current)==null?void 0:d.click()},className:"flex items-center gap-2 rounded-lg bg-[#251F3D] hover:bg-[#342B55] border border-[#483B70] px-4 py-2 text-xs font-medium text-slate-200 transition",children:[t.jsx(de,{size:14}),"Upload Photo File"]}),t.jsx("input",{ref:T,type:"file",accept:"image/png,image/jpeg,image/webp",onChange:_,className:"hidden"})]}),t.jsxs("div",{className:"mt-4 flex items-center gap-1 text-[11px] text-slate-400",children:[t.jsx("span",{className:"font-semibold text-slate-300 mr-1",children:"Archetype Presets:"}),t.jsx("button",{onClick:()=>h("Frostborn"),className:"rounded px-2 py-0.5 bg-white/5 hover:bg-white/15 text-sky-300",children:"Frostborn"}),t.jsx("button",{onClick:()=>h("Luminari"),className:"rounded px-2 py-0.5 bg-white/5 hover:bg-white/15 text-amber-300",children:"Luminari"}),t.jsx("button",{onClick:()=>h("Merfolk Siren"),className:"rounded px-2 py-0.5 bg-white/5 hover:bg-white/15 text-emerald-300",children:"Merfolk"}),t.jsx("button",{onClick:()=>h("Lightborn Angel"),className:"rounded px-2 py-0.5 bg-white/5 hover:bg-white/15 text-purple-300",children:"Lightborn"})]})]}),t.jsxs("div",{className:"flex flex-col w-[380px] bg-[#18142A] p-5 overflow-y-auto space-y-4",children:[t.jsxs("div",{className:"rounded-xl border border-[#3C3268] bg-[#1F1A38] p-3.5 shadow-sm",children:[t.jsxs("div",{className:"flex items-center justify-between mb-1.5",children:[t.jsxs("span",{className:"text-[11px] font-bold tracking-wider text-[#C4B5FD] uppercase flex items-center gap-1.5",children:[t.jsx(ne,{size:14}),"Local AI Backend"]}),t.jsxs("button",{onClick:$,disabled:x,className:"text-[11px] text-slate-400 hover:text-white transition flex items-center gap-1",children:[t.jsx(k,{size:11,className:x?"animate-spin":""}),"Scan"]})]}),t.jsxs("div",{className:"flex items-center gap-2 mt-2",children:[t.jsx("div",{className:`h-2.5 w-2.5 rounded-full ${l.online?"bg-emerald-400 animate-pulse":"bg-amber-400"}`}),t.jsx("span",{className:"text-xs font-semibold text-slate-200",children:l.online?l.details:"Zero-Config Procedural Mode"})]}),t.jsx("p",{className:"text-[11px] text-slate-400 mt-1 leading-relaxed",children:l.online?`Connected to local pipeline at ${l.endpoint}. You can pass the synthesized prompt directly into your local queue.`:"Procedural Celestial Engine active. Generates accurate fantasy portraits instantly offline without external servers."})]}),t.jsxs("div",{className:"rounded-xl border border-[#3C3268] bg-[#1F1A38] p-3.5 space-y-2",children:[t.jsxs("div",{className:"flex items-center justify-between",children:[t.jsx("span",{className:"text-[11px] font-bold tracking-wider text-slate-300 uppercase",children:"Synthesized Prompt"}),t.jsxs("button",{onClick:X,className:"flex items-center gap-1 text-[11px] font-medium text-[#C4B5FD] hover:text-white transition",children:[S?t.jsx(L,{size:12,className:"text-emerald-400"}):t.jsx(le,{size:12}),S?"Copied":"Copy for ComfyUI"]})]}),t.jsx("div",{className:"max-h-28 overflow-y-auto rounded-lg border border-[#342B55] bg-[#141124] p-2.5 text-[11px] text-slate-300 leading-relaxed font-mono",children:E.prompt}),t.jsxs("details",{className:"text-[11px] text-slate-400 cursor-pointer pt-1",children:[t.jsx("summary",{className:"hover:text-slate-200",children:"View Negative Prompt"}),t.jsx("div",{className:"mt-1.5 rounded-md bg-[#141124] p-2 text-[10px] text-slate-400 font-mono",children:E.negativePrompt})]})]}),t.jsxs("div",{className:"rounded-xl border border-[#3C3268] bg-[#1F1A38] p-3.5 space-y-3",children:[t.jsxs("span",{className:"text-[11px] font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5",children:[t.jsx(pe,{size:13}),"Image Adjustments"]}),t.jsxs("div",{className:"space-y-1",children:[t.jsxs("div",{className:"flex justify-between text-[11px] text-slate-400",children:[t.jsx("span",{children:"Zoom / Crop Scale"}),t.jsxs("span",{className:"font-mono text-slate-200",children:[u,"%"]})]}),t.jsx("input",{type:"range",min:"90",max:"160",value:u,onChange:d=>Z(Number(d.target.value)),className:"w-full accent-[#9883C8] h-1.5 bg-[#2D264E] rounded cursor-pointer"})]}),t.jsxs("div",{className:"space-y-1",children:[t.jsxs("div",{className:"flex justify-between text-[11px] text-slate-400",children:[t.jsx("span",{children:"Brightness"}),t.jsxs("span",{className:"font-mono text-slate-200",children:[b,"%"]})]}),t.jsx("input",{type:"range",min:"60",max:"140",value:b,onChange:d=>q(Number(d.target.value)),className:"w-full accent-[#9883C8] h-1.5 bg-[#2D264E] rounded cursor-pointer"})]}),t.jsxs("div",{className:"space-y-1",children:[t.jsxs("div",{className:"flex justify-between text-[11px] text-slate-400",children:[t.jsx("span",{children:"Contrast"}),t.jsxs("span",{className:"font-mono text-slate-200",children:[C,"%"]})]}),t.jsx("input",{type:"range",min:"60",max:"140",value:C,onChange:d=>W(Number(d.target.value)),className:"w-full accent-[#9883C8] h-1.5 bg-[#2D264E] rounded cursor-pointer"})]})]}),t.jsxs("div",{className:"pt-2",children:[t.jsxs("button",{onClick:ee,className:`w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold transition shadow-lg ${w?"bg-emerald-600 text-white":"bg-gradient-to-r from-[#9883C8] to-[#6C5FAC] hover:from-[#A896D8] hover:to-[#7D6FBF] text-white"}`,children:[w?t.jsx(ce,{size:16}):t.jsx(L,{size:16}),w?"Applied to Citizen Profile!":"Apply to Master Citizen Profile"]}),t.jsx("p",{className:"text-[10px] text-slate-400 text-center mt-2 leading-tight",children:"Updates Aura ID, Passport, Registry, and TRACE records across all open OS workspaces."})]})]})]})]})}):null}const xe=new Set(["miraverse-canonical-identities-v1","miraverse-identity-registry-v3"]),fe="miraverse-active-citizen-context-v1";function A(e){if(!e||typeof e!="object")return;const o=e;if(!(typeof o.citizenId!="string"||!o.citizenId.trim()))return{citizenId:o.citizenId,targetDocId:typeof o.targetDocId=="number"&&Number.isInteger(o.targetDocId)&&o.targetDocId>=1&&o.targetDocId<=9?o.targetDocId:void 0}}function Ee(e,o=window){const r=a=>{const l=A(a.detail);l&&e(l)},s=a=>{var l,p;if(!(a.source!==o||a.origin!==o.location.origin)&&(((l=a.data)==null?void 0:l.source)==="meridion-registry"&&a.data.type==="citizens-changed"&&e({}),((p=a.data)==null?void 0:p.source)==="citizen-bridge"&&a.data.type==="active-citizen-changed")){const x=A(a.data.payload);x&&e(x)}},n=a=>{if(a.key===null||xe.has(a.key))e({});else if(a.key===fe&&a.newValue)try{const l=A(JSON.parse(a.newValue));l&&e(l)}catch{}};return o.addEventListener("miraverse-citizen-context",r),o.addEventListener("message",s),o.addEventListener("storage",n),()=>{o.removeEventListener("miraverse-citizen-context",r),o.removeEventListener("message",s),o.removeEventListener("storage",n)}}export{we as P,he as a,ye as b,A as c,F as d,J as e,Y as f,V as g,G as h,U as i,H as j,z as k,B as l,Ce as m,be as r,Ee as s,ue as t};
