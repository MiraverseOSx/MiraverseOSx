export interface TopicPack {
  id: string;
  label: string;
  aliases: string[];
  publisher: string;
  headline: string;
  introduction: string;
  paragraphs: string[];
  guide: string;
  steps: string[];
  places: string[];
  related: string;
}

export const TOPIC_PACKS: TopicPack[] = [
  {
    id: 'aureline',
    label: 'Aureline — Capital Realm',
    aliases: ['aureline', 'capital', 'citadel', 'crown', 'sovereign', 'concord', 'royal'],
    publisher: 'Aureline Civic & Heraldic Archive',
    headline: 'The Seat of the Crown and Municipal Core',
    introduction: 'Aureline stands as the administrative heart of Meridion, anchored by the Grand Citadel and the Sovereign Concord.',
    paragraphs: [
      'The Capital Citadel rises above the transit terraces of Aureline, serving as the central forum of civic government, high-clearance council chambers, and the Royal Heraldry Archives. Public courtyards connect the administrative wards with Glassline Botanical Garden.',
      'Under the Sovereign Concord, civic stability is maintained through the Directorate of Global Affairs (DGA) and municipal relays. Citizens carry standardized MAID credentials granting tiered access to public services and institutional terminals.',
      'Scholars and investigators frequently consult the Grand Archive for pre-Collapse historical treaties, land grants, and municipal charters. The capital network enforces strict telemetry logging across all municipal conduits.'
    ],
    guide: 'Capital Municipal Orientation Protocol',
    steps: [
      'Present MAID credential at civic gateway kiosks for sector clearance check.',
      'Consult the heraldic ledger for active council edicts and administrative notices.',
      'Verify civic tax filings and municipal balances at First Federal Bank or Bank of Aureline.',
      'Report unresolved conduit telemetry anomalies directly to the DGA Citadel desk.'
    ],
    places: ['Capital Citadel', 'Glassline Botanical Garden', 'Aureline Grand Archive'],
    related: 'dga'
  },
  {
    id: 'lyria',
    label: 'Lyria — Verdant Sanctuary Realm',
    aliases: ['lyria', 'forest', 'groves', 'sanctuary', 'renewal', 'nature', 'botanical'],
    publisher: 'Faith Medical & Botanical Registry',
    headline: 'Verdant Sanctuaries and Bio-Aura Healing',
    introduction: 'Lyria encompasses ancient crystalline groves, bio-aura sanatoriums, and harmonic healing pools nurtured by the Order of Faith.',
    paragraphs: [
      'The towering canopy of Lyria filters ambient solar energy through crystalline flora, creating a natural dampening field against synthetic resonance interference. Faith Medical maintains its central research retreats and sanitariums among the outer groves.',
      'Patients suffering from acute Veilwilt disorder, timeline drift, or mana dissonance are conveyed to the Lyrian Spring Sanctuaries. Immersion therapy in natural bio-aura wells realigns fractured cellular telemetry.',
      'The Order of Faith stewards the ancient Tree of Renewal, whose roots intertwine with natural aether springs. Pilgrims and scholars observe strict environmental stillness within designated conservation wards.'
    ],
    guide: 'Sanctuary Pilgrimage and Bio-Aura Calibration',
    steps: [
      'Schedule a baseline aura telemetry intake at Faith Medical prior to deep grove entry.',
      'Adhere to silent meditation protocols near natural crystal growth clusters.',
      'Avoid synthetic spell-matrix discharges within 500 meters of the Tree of Renewal.',
      'Collect fallen resonant leaves for safe botanical analysis at academic laboratories.'
    ],
    places: ['Lyrian Spring Sanctuaries', 'Tree of Renewal Grove', 'Glassline Botanical Garden'],
    related: 'faithmed'
  },
  {
    id: 'kaelis',
    label: 'Kaelis — Industrial Spire Realm',
    aliases: ['kaelis', 'industrial', 'forge', 'spire', 'cargo', 'factory', 'foundry', 'warehouse'],
    publisher: 'Kaelis Guild of Foundries & Logistics',
    headline: 'The Machine Core and Freight Crossroad',
    introduction: 'Kaelis is the industrial powerhouse of Meridion, dominated by thermal foundries, freight yards, and automated manufacturing towers.',
    paragraphs: [
      'Smoke spires and steam plumes rise perpetually over Kaelis, where raw mana crystals and mineral ores are smelted into industrial alloys, runic relays, and locomotive frameworks. The Central Freight Spire handles cross-realm cargo transit.',
      'Recent investigative reports have highlighted security breaches within the Old Factory Ward and Sector 3 Freight Warehouse, including the unauthorized diversion of unrefined Mana Crystal manifest CG-8821.',
      'Engineers and artisans operate under strict guild standards. Subterranean freight spurs connect Kaelis deep foundries directly to the subterranean conduit network underlying the outer wards.'
    ],
    guide: 'Industrial Safety and Freight Inspection Protocol',
    steps: [
      'Equip thermal shielding gear before entering foundry blast zones.',
      'Verify shipping manifests against the official shipping.aure logistics database.',
      'Inspect freight crates for suspect timeline drift or radiation leaks using AureScanner.',
      'Submit discrepancies to the Sector 3 Logistics Dispatch office.'
    ],
    places: ['Central Freight Spire', 'Old Factory Ward', 'Sector 3 Freight Warehouse'],
    related: 'shipping'
  },
  {
    id: 'valen',
    label: 'Valen — Iron Bastion Realm',
    aliases: ['valen', 'bastion', 'fortress', 'iron', 'garrison', 'defense', 'military', 'security'],
    publisher: 'Valen Territorial Defense Command',
    headline: 'The Iron Bastion and Tactical Defense Grid',
    introduction: 'Valen forms the unyielding defensive bulwark of Meridion, home to armored citadels, tactical garrisons, and orbital shield arrays.',
    paragraphs: [
      'Carved into jagged granite cliffs, Valen features imposing ramparts and fortified watchtowers that oversee the border sectors. The DGA Tactical Division coordinates border patrols and municipal defense exercises from High Bastion Command.',
      'The realm maintains extensive telemetry interception stations designed to detect rogue cybernetic signals, unauthorized conduit drillings, and foreign espionage operatives.',
      'Citizens passing through Valen checkpoint corridors must submit to biometric security scans and verify their active civic clearance tier. Access to military ordnance vaults requires Tier 3 authorization.'
    ],
    guide: 'Border Bastion Clearance and Transit Rules',
    steps: [
      'Present valid transit visa and biometric MAID identification at the Border Gateway.',
      'Declare all high-yield offensive spell matrices and cryptographic decoding hardware.',
      'Observe regional curfew restrictions when tactical alert beacons are illuminated.',
      'Report unauthorized signal transmitters to the Valen Defense Desk.'
    ],
    places: ['High Bastion Command', 'Granite Ramparts', 'Valen Checkpoint Delta'],
    related: 'dga'
  },
  {
    id: 'solaria',
    label: 'Solaria — Sunspire Realm',
    aliases: ['solaria', 'sunspire', 'solar', 'desert', 'radiance', 'sun', 'energy'],
    publisher: 'Solarian Energy & Array Directorate',
    headline: 'High Desert Radiance and Solar Aether Harvesting',
    introduction: 'Solaria spans sun-drenched canyons and shimmering salt flats, harnessing intense solar harmonics through colossal crystalline mirrors.',
    paragraphs: [
      'The great Sunspire reaches into the upper stratosphere, focusing daylight energy into high-density storage capacitors that power the municipal grids of neighboring realms. Solarian solar artisans excel in light-based runecraft.',
      'Temperatures across the dune expanses fluctuate dramatically, creating extreme thermal gradients that challenge unshielded machinery and vulnerable biological auras.',
      'Scholars of the high desert study the ancient Solar Runestones, which predate the modern realms and hint at the catastrophic celestial realignment known as the Great Convergence.'
    ],
    guide: 'High Desert Survival and Energy Calibration',
    steps: [
      'Apply thermal refractive aura balms prior to daylight travel across open dunes.',
      'Calibrate battery capacitors to absorb high-frequency solar surges.',
      'Refrain from approaching active crystalline mirror focal arrays without polarized eyewear.',
      'Consult the Solarian Weather Desk for thermal storm warnings.'
    ],
    places: ['The Sunspire Tower', 'Mirrored Basin Array', 'Solarian Solar Foundry'],
    related: 'technology'
  },
  {
    id: 'umbra',
    label: 'Umbra — Subterranean Depths',
    aliases: ['umbra', 'underground', 'subterranean', 'conduit', 'shadow', 'crypt', 'catacombs', 'depths'],
    publisher: 'Subterranean Survey & Conduit Division',
    headline: 'The Sunless Catacombs and Ancient Power Relays',
    introduction: 'Lies deep beneath the surface cities, a labyrinth of abandoned pre-Collapse conduits, shadow crypts, and lost technological relays.',
    paragraphs: [
      'Umbra was once the industrial underbelly of the pre-Convergence civilization. Today, its echoing caverns host forgotten conduits—most notably Subterranean Conduit Sector 7—where dormant machine intelligences and unshielded aether bleed persist.',
      'Smugglers, unauthorized researchers, and outlaws utilize the labyrinthine catacombs to bypass municipal checkpoints, trading encrypted memory drives and forbidden arcane artifacts beyond the reach of the DGA.',
      'Exploration of the deep subterranean sectors requires specialized hazard gear and encrypted access keys (such as Cipher #0x8891). Unprepared travelers risk severe aura dissonance and irreversible shadow distortion.'
    ],
    guide: 'Subterranean Conduit Descent Protocols',
    steps: [
      'Carry redundant quantum compasses and emergency mana flare cartridges.',
      'Obtain certified clearance or cryptographic bypass keys before approaching Conduit 7 airlocks.',
      'Monitor ambient shadow corruption levels using portable AureScanner devices.',
      'Mark return routes with fluorescent resonance chalk.'
    ],
    places: ['Subterranean Conduit Sector 7', 'Old Factory Catacombs', 'Shadow Vault Terminal'],
    related: 'prism'
  },
  {
    id: 'nexus',
    label: 'Nexus — Central Singularity',
    aliases: ['nexus', 'core', 'singularity', 'aethercore', 'zeropoint', 'timewarp', 'center'],
    publisher: 'Meridion High Science Coalition',
    headline: 'The Aethercore and the Spatial Singularity',
    introduction: 'The geographic and metaphysical pivot of Meridion, where all seven realms converge around the enigmatic Aethercore.',
    paragraphs: [
      'At the epicenter of the continent floats the Nexus Singularity: a rotating lattice of crystalline structures and pre-Collapse energy conduits suspended above a boundless spatial rift.',
      'Theoretical physicists from Cyacademy and high-ranking DGA researchers monitor the Aethercore round-the-clock. Time and space dilate near the core perimeter, creating localized temporal echoes and harmonic frequency shifts.',
      'Access to the inner Nexus is strictly restricted to Level 3 clearance holders and licensed spatial researchers. The secrets of how the realms stay aligned are believed to reside within the Core Singularity matrix.'
    ],
    guide: 'Nexus Perimeter Observation Standards',
    steps: [
      'Synchronize chronological chronometers with the central Nexus beacon.',
      'Remain within the tethered electromagnetic observation platform.',
      'Do not attempt remote sensor probes into the central event threshold without clearance.',
      'Document all observed spatial anomalies in the institutional research log.'
    ],
    places: ['The Nexus Core Platform', 'Singularity Research Lab', 'Temporal Anchor Array'],
    related: 'cyacademy'
  },
  {
    id: 'dga',
    label: 'Directorate of Global Affairs (DGA)',
    aliases: ['dga', 'directorate', 'vane', 'thorne', 'clearance', 'warrant', 'curfew', 'security', 'police'],
    publisher: 'Directorate Public Information Bureau',
    headline: 'Civic Governance, Law Enforcement, and National Security',
    introduction: 'The primary executive authority in Meridion, responsible for citizen clearance verification, intelligence oversight, and civil defense.',
    paragraphs: [
      'Headed by Director Vane and overseen by senior operatives including Agent Mara Thorne, the DGA monitors civic compliance, protects vital infrastructure, and investigates criminal syndicates and rogue cyberneticists.',
      'The DGA operates the official dga.gov.aure network portal, providing public access to the Citizen Clearance Registry, civil emergency advisories, and active warrant lists. Operational directives are dispatched via encrypted AureMail wiretaps.',
      'Field investigators from the TRACE and Special Operations divisions coordinate closely with academic and financial auditors to uncover subterranean conspiracies and prevent unauthorized aether extraction.'
    ],
    guide: 'Citizen Interaction with DGA Field Officers',
    steps: [
      'Carry valid digital MAID credentials at all times.',
      'Cooperate fully during routine perimeter scans and security interrogations.',
      'Access the DGA portal to check active warrant notifications and clearance standings.',
      'Submit verified leads concerning public hazards to the anonymous informant wire.'
    ],
    places: ['DGA Citadel Headquarters', 'Sector 1 Security Post', 'High Bastion Annex'],
    related: 'aureline'
  },
  {
    id: 'faithmed',
    label: 'Faith Medical Group',
    aliases: ['faithmed', 'medical', 'hospital', 'clinic', 'aura', 'veilwilt', 'doctor', 'patient', 'health', 'telemetry'],
    publisher: 'Faith Medical Chief Clinical Registry',
    headline: 'Bio-Aura Healthcare, Clinical Inpatient Care, and Epidemiology',
    introduction: 'The premier medical and humanitarian institution in Meridion, specializing in aura medicine, neurological stabilization, and citizen wellness.',
    paragraphs: [
      'Faith Medical operates municipal clinics and mobile medical vans across all primary districts. Their clinicians combine traditional diagnostic science with bio-aura resonance scanning to detect cellular fatigue and mana poisoning.',
      'The clinical registry manages treatment programs for widespread regional afflictions, including Frostlung Syndrome, Sunspire Burn Fever, and the insidious Veilwilt disorder.',
      'Through the faithmed.aure portal, citizens can review their baseline aura integrity, download clinical lab results, and receive care stipends. Inpatient care assignments provide practical training for aspiring physicians.'
    ],
    guide: 'Faith Medical Patient Intake and Treatment',
    steps: [
      'Perform regular aura diagnostic scans via the Faith Medical web terminal.',
      'Review clinical telemetry readings to verify cellular harmony and thermal balance.',
      'Apply prescribed therapeutic protocols (such as warm-essence thaw or aura rest seals).',
      'Report acute symptoms of Veilwilt or memory fog immediately.'
    ],
    places: ['Faith Medical Central Hospital', 'Sanctuary Ward Clinic', 'Glassline Dispensary'],
    related: 'lyria'
  },
  {
    id: 'cyacademy',
    label: 'Cybernetic Academy of Meridion (Cycademy)',
    aliases: ['cyacademy', 'cycademy', 'school', 'academy', 'spellforge', 'belpois', 'schaeffer', 'jeremie', 'aelita', 'hopper'],
    publisher: 'Cycademy Academic & Research Senate',
    headline: 'Excellence in Spell Engineering, Cybernetics, and Virtual Systems',
    introduction: 'The leading academic institution dedicated to algorithmic spellcraft, cognitive cybernetics, and advanced machine architecture.',
    paragraphs: [
      'Situated within the scenic Academic Quad, Cyacademy trains scholars, spellwrights, and system engineers. Renowned facilities include the high-performance Compiler Lab 4, overseen by prodigy Jeremie Belpois and research associate Aelita Schaeffer.',
      'The academy developed SpellForge—the proprietary development environment for compiling modular arcane algorithms such as Firewall.mod and Routing.mod.',
      'Historical archives at Cycademy document the foundational research of Dr. Franz Hopper on multi-dimensional virtual spaces and quantum telecommunication conduits.'
    ],
    guide: 'Academic Enrollment and Lab Access Guidelines',
    steps: [
      'Submit academic transcripts and entrance aptitude assessments to the registrar.',
      'Complete safety orientation before operating high-voltage spell compiling equipment.',
      'Test custom arcane code in simulation mode prior to live network deployment.',
      'Collaborate with peer researchers in open discussion forums and coding symposiums.'
    ],
    places: ['Academic Quadrangle', 'Compiler Lab 4', 'Cycademy Library of Computation'],
    related: 'technology'
  },
  {
    id: 'prism',
    label: 'The PRISM Anomaly & Harmonic Resonators',
    aliases: ['prism', 'anomaly', 'frequency', '88.2', 'harmonic', 'waveform', 'voss', 'signal', 'radio'],
    publisher: 'Deep Telemetry Research Institute',
    headline: 'Unexplained Radio Waves, Sub-Conduit Harmonics, and Spectral Bleed',
    introduction: 'A mysterious electromagnetic phenomenon propagating along the 88.2 MHz carrier frequency beneath the urban landscape.',
    paragraphs: [
      'First identified by Dr. Sharon Voss during deep telemetry sounding sweeps, the PRISM anomaly manifests as a rhythmic, self-correcting harmonic waveform that matches no known commercial transmitter.',
      'Field agents using AureScanner have tracked the signal epicenter to Subterranean Conduit Sector 7, beneath the abandoned factory district. The waveform displays erratic phase modulation whenever mana crystals are moved nearby.',
      'Ongoing research aims to determine whether PRISM represents a relic pre-Collapse automated distress beacon or an active intelligence attempting communication through the municipal power grid.'
    ],
    guide: 'Investigating Electromagnetic Anomalies',
    steps: [
      'Tune AureScanner or radio receivers to the 88.2–88.4 MHz spectrum.',
      'Record signal amplitude, phase shifts, and ambient background interference.',
      'Cross-reference timestamps with local mana crystal transportation manifests.',
      'Avoid direct physical contact with unshielded resonance relays during surge events.'
    ],
    places: ['Subterranean Relay 88', 'Deep Telemetry Tower', 'Old Factory Antenna'],
    related: 'umbra'
  },
  {
    id: 'broadstreet',
    label: 'Broad Street Vault Incident & First Federal',
    aliases: ['broadstreet', 'bank', 'heist', 'vault', 'firstfederal', 'robbery', 'wire', '0994', 'finance'],
    publisher: 'TRACE Forensic Financial Bureau',
    headline: 'The Unsolved Vault Breach and Subterranean Aether Tunneling',
    introduction: 'The high-profile cybernetic and structural breach of First Federal Bank on Broad Street, shaking financial confidence across Aureline.',
    paragraphs: [
      'In the early hours of cycle 42, automated alarms at First Federal Bank on Broad Street were disabled by a sophisticated software bypass. Deep seismic sensors registered localized sonic drilling directly beneath Vault 4.',
      'Over 50,000 ₡ in untraceable credits and sealed bearer bonds were routed through encrypted vector account #0994-AURA before municipal firewalls could react. Traces point to conduit access lines linked to Sector 3 Cargo Warehouse.',
      'TRACE forensic investigators have gathered critical exhibits, including severed fiber optic cables, unauthorized keycard logs, and witness statements regarding a suspicious logistics van bearing forged CG-8821 placards.'
    ],
    guide: 'Financial Crime Analysis and Evidence Collection',
    steps: [
      'Examine financial ledgers on bank.aure for unauthorized overseas wire dispatches.',
      'Correlate security badge logs with municipal personnel records on dga.gov.aure.',
      'Analyze physical vault debris for harmonic resonance signatures matching Kaelis mining lasers.',
      'Submit corroborated case hypotheses to the formal investigation reasoning board.'
    ],
    places: ['First Federal Broad Street Branch', 'Vault 4 Sub-Basement', 'TRACE Investigation Bureau'],
    related: 'bank'
  },
  {
    id: 'shipping',
    label: 'Aureline Cargo & Logistics Operations',
    aliases: ['shipping', 'cargo', 'dispatch', 'manifest', 'freight', 'cg-8821', 'logistics', 'warehouse', 'courier'],
    publisher: 'Aureline Freight Logistics Authority',
    headline: 'Municipal Freight Transit, Waybills, and Cargo Verification',
    introduction: 'The centralized logistics network responsible for transporting raw materials, medical supplies, and consumer goods across Meridion.',
    paragraphs: [
      'The logistics network operates heavy rail lines, pneumatic freight tubes, and fleet couriers. The official shipping.aure portal allows shippers to track consignments in real time using standardized waybill codes.',
      'Recent audit discrepancies have centered on Manifest CG-8821, an unregistered crate of unrefined mana crystals originating in Kaelis that vanished en route to Sector 3 Warehouse.',
      'Port inspectors employ automated cargo scanners to ensure shipments comply with DGA hazardous material regulations and prevent the proliferation of illicit military-grade capacitors.'
    ],
    guide: 'Consignment Tracking and Discrepancy Auditing',
    steps: [
      'Enter valid consignment tracking codes (e.g. CG-8821, MED-4402) into the shipping lookup tool.',
      'Compare recorded package weights and transit waypoints against official dispatch manifests.',
      'Flag unauthorized route divergences or missing transit hub timestamps.',
      'Report suspicious cargo tampering to municipal logistics security.'
    ],
    places: ['Sector 3 Central Freight Terminal', 'Aureline Air Cargo Depot', 'Kaelis Freight Transfer'],
    related: 'kaelis'
  },
  {
    id: 'bank',
    label: 'First Federal Bank of Aureline',
    aliases: ['bank', 'finance', 'credits', 'bits', 'account', 'transfer', 'ledger', 'currency'],
    publisher: 'Municipal Banking Authority of Aureline',
    headline: 'Civic Accounts, High-Yield Staking, and Wire Settlements',
    introduction: 'The primary financial repository for citizens, commercial guilds, and municipal departments of Aureline.',
    paragraphs: [
      'First Federal Bank maintains secure credit reserves and facilitates intra-realm commerce. Citizen accounts are linked directly to personal MAID numbers, providing streamlined access through the bank.aure web portal.',
      'In addition to standard municipal Credits (₡), the bank interfaces with decentralized digital currencies including Bits (◈), offering anonymous cryptographic escrow services for licensed merchants.',
      'Recent security upgrades following the Broad Street incident include multi-factor biometric cipher verification and real-time wire fraud auditing to prevent illegal capital flight into underground syndicates.'
    ],
    guide: 'Managing Civic Financial Accounts',
    steps: [
      'Verify account credentials and current Credit / Bit balance on bank.aure.',
      'Initiate secure wire transfers by specifying recipient MAID and transaction memo.',
      'Review transaction ledgers regularly for unexpected audit holds or fee debits.',
      'Utilize encrypted escrow services when transacting with unverified merchants.'
    ],
    places: ['First Federal Broad Street Tower', 'Citadel Financial Annex', 'Municipal Treasury Office'],
    related: 'broadstreet'
  }
];
