// Real-world style websites and outside research intranet portal
// Simulates corporate websites, public municipal registries, chemical databases, news wires, and marine trackers

export interface ExtranetWebsite {
  id: string;
  domain: string;
  siteName: string;
  category: 'Corporate' | 'Municipal Public Records' | 'Chemical Database' | 'News Wire' | 'Maritime Logistics';
  securityLevel: 'Public Web' | 'SSL Secure' | 'Gov Restricted Portal';
  pages: Array<{
    path: string;
    title: string;
    content: string;
    meta?: Record<string, string>;
    interactiveTool?: 'alpr_lookup' | 'toxin_search' | 'manifest_search';
  }>;
}

export const EXTRANET_SITES: ExtranetWebsite[] = [
  {
    id: 'SITE-PHOENIX',
    domain: 'phoenix-biotech.ch',
    siteName: 'Phoenix Biotech S.A. - Global Bio-Solutions',
    category: 'Corporate',
    securityLevel: 'Public Web',
    pages: [
      {
        path: '/',
        title: 'Home - Pioneering Precision Chemical Synthesis',
        content: `
# Phoenix Biotech S.A.
**Headquarters: Dufourstrasse 14, 8008 Zürich, Switzerland**
*Innovating Agricultural Protection & Advanced Peptide Synthesis*

Phoenix Biotech S.A. is a licensed European bio-solutions enterprise specializing in specialty organophosphate ester derivatives, custom synthetic enzymes, and agricultural crop fortification technologies.

### Corporate Leadership & Board
- **Managing Director**: Dr. Julian Paul Vance, PhD (Chief Chemist, 2021-2025; Senior Advisory Fellow)
- **Director of Global Operations**: Viktor Krell (Industrial Logistics Specialist)
- **Chief Financial Officer**: Marcel De Vos (Zurich Fiduciary Trust)

### Global Logistical Hubs
- **European Synthesis Complex**: Basel Chemical Park, Switzerland
- **North American Marine Depot**: Pier 42 Terminal, Warehouse 18, Harbor District
- **Cold Storage Hub**: Refrig-Container Staging Bay 4-Alpha

> **Notice**: All specialized synthetic batches undergo strict dual-use regulatory export reviews under European Chemical Agency (ECHA) standards.
        `,
        meta: {
          ECHA_Registration: 'CH-ORGANO-2024-88',
          DUNS: '88-412-9014',
          ContactEmail: 'logistics@phoenix-biotech.ch',
        },
      },
      {
        path: '/pipeline',
        title: 'Synthesis Pipeline & Research Catalogs',
        content: `
# R&D Synthesis Portfolio

### Product Group N-26: Lipophilic Phosphonate Derivatives
- **Compound Code**: N26-RECRYSTALLIZED (Fluorophosphonate Ester)
- **Molecular Weight**: 182.14 g/mol
- **Mechanism**: High-affinity acetylcholinesterase bonding with catalytic aging kinetics (<12 minutes).
- **Industrial Application**: Experimental pesticide targeting invasive coleoptera vectors.
- **Handling Protocol**: Class 6.1 Toxic Substance. Must be transported in double-walled cryogenic cylinders at -20°C.

*Warning: Unauthorized extraction, synthesis, or resale without sovereign regulatory clearance is strictly prohibited.*
        `,
      },
    ],
  },
  {
    id: 'SITE-CITY-RECORDS',
    domain: 'city-records.gov',
    siteName: 'Metropolitan Public Records & Automated License Registry (ALPR)',
    category: 'Municipal Public Records',
    securityLevel: 'Gov Restricted Portal',
    pages: [
      {
        path: '/',
        title: 'Department of Transportation & Municipal Asset Search',
        content: `
# Metropolitan Municipal Records Portal
*Authorized Government & Law Enforcement Ingress Portal*

Use the integrated search tool below to verify commercial property deeds, warehouse leasing permits, and Automated License Plate Recognition (ALPR) camera hits across municipal corridors.
        `,
        interactiveTool: 'alpr_lookup',
        meta: {
          Jurisdiction: 'Metropolitan Port & Transit Authority',
          ActiveALPRSensors: '142 Highway & Port Gantries',
        },
      },
      {
        path: '/deeds/pier42',
        title: 'Commercial Lease Deed: Pier 42 Marine Terminal Bay 18',
        content: `
# Property Deed Record: Pier 42 Warehouse 18
- **Parcel ID**: 04-HARBOR-88210
- **Zoning**: Industrial Marine Heavy Storage (M-3)
- **Primary Lessee**: Apex Marine Freight Services LLC (Beneficial Owner: Phoenix Biotech S.A.)
- **Lease Start**: March 1, 2024
- **Active HazMat Storage Permit**: Permit #HZ-2026-904 (Toxic Chemical Class 6 / Compressed Gases)
- **Emergency Contact**: Viktor Krell, Facility Custodian (Phone: 555-0194)
- **Last Inspection**: Flagged for unpermitted ventilation scrubbing modifications on rooftop exhaust stack.
        `,
      },
    ],
  },
  {
    id: 'SITE-TOX-ARCHIVE',
    domain: 'tox-archive.org',
    siteName: 'National Chemical & Poison Reference Archive (TOXNET)',
    category: 'Chemical Database',
    securityLevel: 'Public Web',
    pages: [
      {
        path: '/',
        title: 'Search Chemical Agents & Toxicological Profiles',
        content: `
# TOXNET Global Chemical Index
*Authoritative clinical and forensic monographs for toxic substances, biological poisons, and synthetic neurotoxins.*
        `,
        interactiveTool: 'toxin_search',
      },
      {
        path: '/compound/organophosphates',
        title: 'Monograph: Synthetic Fluorophosphonate Esters',
        content: `
# Compound Profile: Methylphosphonofluoridates
- **Class**: Organophosphorus Neurotoxin
- **Formula**: C4H10FO2P
- **Physical State**: Colorless, odorless oily liquid with low vapor pressure.
- **Toxicity**: Human LD50 estimated at 0.5 - 1.0 mg transdermal absorption.
- **Pathophysiology**: Irreversibly phosphorylates the serine hydroxyl residue at the catalytic triad of acetylcholinesterase. Results in immediate systemic acetylcholine accumulation.
- **Clinical Signs**: Profuse diaphoresis, extreme pinpoint miosis (1mm), bronchorrhea, bronchospasm, flaccid neuromuscular paralysis, respiratory failure.
- **Antidotal Protocol**: High-dose Atropine Sulfate (titrated to dry pulmonary secretions) + Pralidoxime Chloride (2-PAM). If compound exhibits "rapid catalytic aging" (dealkylation half-life <15 minutes), oximes become completely ineffective.
        `,
      },
    ],
  },
  {
    id: 'SITE-NEWS',
    domain: 'daily-chronicle.com',
    siteName: 'The Daily Chronicle - Metro Breaking News',
    category: 'News Wire',
    securityLevel: 'Public Web',
    pages: [
      {
        path: '/',
        title: 'Breaking: Diplomatic Incident at Embassy Row; Ambassador Rushed to Metro ICU',
        content: `
# EMBASSY ROW SHUTDOWN AS AMBASSADOR VANCE COLLAPSES DURING TRADE SUMMIT
*By Sarah Lin, Chief Investigative Correspondent*
*Updated 15 minutes ago*

Emergency HazMat teams and federal tactical vehicles swarmed Embassy Row early this morning following the sudden collapse of Ambassador Christian Vance inside a closed-door bilateral trade summit.

Paramedics transported Vance under armed police escort to St. Jude Metropolitan Hospital, where sources confirm he remains in critical condition in the Trauma Intensive Care Unit.

Witnesses reported seeing tactical officers in heavy chemical respirators sealing the fourth floor of the diplomatic mission. Representatives from the Eurasian consular mission declined to comment, citing diplomatic confidentiality.

Federal authorities have issued no public statement regarding chemical exposure, but heavy police checkpoints have been established along the harbor highway corridor.
        `,
      },
    ],
  },
  {
    id: 'SITE-MARITIME',
    domain: 'maritime-vessels.org',
    siteName: 'Global AIS Marine Port Logistics & Vessel Tracker',
    category: 'Maritime Logistics',
    securityLevel: 'Public Web',
    pages: [
      {
        path: '/',
        title: 'Port Schedule & Vessel Roster: Pier 42 Terminal',
        content: `
# Pier 42 Marine Terminal - Live Port Schedule

| Vessel Name | IMO Number | Flag | Berth | Cargo Category | Scheduled Cast-Off |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **M/V Phoenix Dawn** | 9482104 | Panama | **Berth 3** | Refrig-Containers (HazMat) | **22:00 UTC Tonight** |
| Atlantic Pioneer | 8910452 | Liberia | Berth 1 | Bulk Grain | 06:00 UTC Tomorrow |
| Nordic Trader | 9112440 | Norway | Berth 5 | Crude Oil | 14:00 UTC Tomorrow |

### Port Security Advisory
Harbor police have deployed marine patrol vessels around Berth 3 following customs intelligence alerts. All refrigerated cargo containers bound for the M/V Phoenix Dawn are subject to federal seal inspection.
        `,
        interactiveTool: 'manifest_search',
      },
    ],
  },
];
