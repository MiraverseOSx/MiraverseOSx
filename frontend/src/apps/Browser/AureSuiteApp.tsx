import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mail, HardDrive, MessageSquare, MapPin, ShieldCheck, 
    Search, FileText, Download, Lock, CheckCircle2, AlertTriangle, Play, RefreshCw, Key,
    Sparkles, Radio, Send, Eye, Shield, Check, Info, ArrowUpRight, Cpu, Star, ExternalLink,
    Compass, Wifi, Activity, Terminal
} from 'lucide-react';
import { useOSStore } from '../../store/useOSStore';
import { useCommsStore } from '../../store/useCommsStore';
import { SoundFX } from '../../utils/audio';

export interface DriveItem {
    id: string;
    title: string;
    size: string;
    type: string;
    category: string;
    checksum: string;
    origin: string;
    content: string;
}

export interface RealmPin {
    id: string;
    realm: string;
    name: string;
    sector: string;
    x: number; // percentage
    y: number; // percentage
    threat: 'Low' | 'Moderate' | 'High' | 'Critical' | 'Extreme';
    desc: string;
    lore: string;
}

interface ChatEntry {
    id: string;
    sender: string;
    time: string;
    text: string;
    tag: string;
    isUser?: boolean;
}

export default function AureSuiteApp() {
    const [activeTool, setActiveTool] = useState<'mail' | 'drive' | 'chat' | 'maps' | 'scanner'>('mail');
    
    // Store integrations
    const player = useOSStore((s) => s.gameplay?.player);
    const claimedComms = useOSStore((s) => s.gameplay?.claimedComms || []);
    const claimCommsAttachment = useOSStore((s) => s.claimCommsAttachment);
    const addCredits = useOSStore((s) => s.addCredits);
    const addXP = useOSStore((s) => s.addXP);

    // Shared Comms Store integration
    const commsEmails = useCommsStore((s) => s.emails);
    const readEmailIds = useCommsStore((s) => s.readEmailIds);
    const starredEmailIds = useCommsStore((s) => s.starredEmailIds);
    const markEmailRead = useCommsStore((s) => s.markEmailRead);
    const toggleStarEmail = useCommsStore((s) => s.toggleStarEmail);

    // ──────────────────────────────────────────────
    // 1. AUREMAIL STATE (Synced with Shared Store)
    // ──────────────────────────────────────────────
    // Combine store emails with canonical AureSuite intelligence dispatches
    const canonicalDispatches = [
        {
            id: 'AURE-SUITE-01',
            sender: 'Director Vane (DGA)',
            senderAddress: 'director.vane@dga.gov.aure',
            role: 'Government Security Bureau',
            subject: 'CLASSIFIED: Conduit Sector 7 Key #0x8891',
            time: '10:14 AM',
            body: 'Confidential clearance alert: Access Cipher Key 0x8891 has been confirmed for Subterranean Conduit Sector 7 beneath the Old Factory Ward. Use the AureScanner Decryptor tool to unlock classified deeds and conduit schematics before unauthorized syndicates extract the core telemetry.',
            priority: 'classified',
            rewardCredits: 150,
            rewardXP: 60,
            cipherKey: '0x8891'
        },
        {
            id: 'AURE-SUITE-02',
            sender: 'Aureline Cargo Dispatch',
            senderAddress: 'dispatch@shipping.aure',
            role: 'Freight Logistics Operations',
            subject: 'Manifest Alert: CG-8821 Unregistered Crystal Crate',
            time: '09:30 AM',
            body: 'Unregistered shipment of unrefined Mana Crystals logged under manifest #CG-8821 at Sector 3 Warehouse. Suspect timeline alignment discrepancy detected in courier route. Cross-reference shipping.aure to track the diverted destination.',
            priority: 'high',
            rewardCredits: 100,
            rewardXP: 45,
            cipherKey: 'CG-8821'
        },
        {
            id: 'AURE-SUITE-03',
            sender: 'Faith Medical Records',
            senderAddress: 'records@faithmed.aure',
            role: 'Chief Medical Registry',
            subject: 'Patient Telemetry Baseline Verified #FM-88392',
            time: '08:00 AM',
            body: 'Aura Heat stabilized at 37.2°C. Veilwilt antibodies have been synthesized. Remember to check Faith Medical intranet (faithmed.aure) for weekly wellness stipend and inpatient clinical care assignments.',
            priority: 'normal',
            rewardCredits: 75,
            rewardXP: 30,
            cipherKey: 'FM-88392'
        }
    ];

    // Build unified email items list
    const unifiedEmails = [
        ...canonicalDispatches.map(d => ({
            id: d.id,
            sender: d.sender,
            senderAddress: d.senderAddress,
            role: d.role,
            subject: d.subject,
            time: d.time,
            body: d.body,
            priority: d.priority,
            rewardCredits: d.rewardCredits,
            rewardXP: d.rewardXP,
            cipherKey: d.cipherKey,
            isRead: readEmailIds.includes(d.id),
            isStarred: starredEmailIds.includes(d.id),
            isClaimed: claimedComms.includes(d.id)
        })),
        ...commsEmails.map(e => ({
            id: e.id,
            sender: e.sender,
            senderAddress: e.senderAddress,
            role: e.faction || 'AureMail Network',
            subject: e.subject,
            time: e.time,
            body: e.body,
            priority: e.labels?.includes('Official') ? 'high' : 'normal',
            rewardCredits: e.attachments?.find(a => a.isReward)?.amount || 50,
            rewardXP: e.attachments?.find(a => a.isReward)?.xp || 25,
            cipherKey: null,
            isRead: readEmailIds.includes(e.id) || Boolean(e.read),
            isStarred: starredEmailIds.includes(e.id),
            isClaimed: e.attachments?.some(a => claimedComms.includes(`${e.id}_${a.id}`))
        }))
    ];

    const [selectedEmailId, setSelectedEmailId] = useState<string>(unifiedEmails[0]?.id || 'AURE-SUITE-01');
    const [emailSearch, setEmailSearch] = useState('');
    const selectedEmail = unifiedEmails.find((e) => e.id === selectedEmailId) || unifiedEmails[0];

    const handleSelectEmail = (id: string) => {
        setSelectedEmailId(id);
        markEmailRead(id, true);
    };

    const handleClaimEmailIntel = (email: typeof unifiedEmails[0]) => {
        if (!email || email.isClaimed) return;
        if (claimCommsAttachment) {
            claimCommsAttachment(email.id, email.rewardCredits, email.rewardXP);
        } else {
            if (addCredits) addCredits(email.rewardCredits);
            if (addXP) addXP(email.rewardXP);
        }
        SoundFX.playCoin();
    };

    // ──────────────────────────────────────────────
    // 2. AUREDRIVE STATE (Canonical Cloud Documents)
    // ──────────────────────────────────────────────
    const driveFiles: DriveItem[] = [
        { 
            id: 'doc-1', 
            title: 'Aethercore_Conduit_7.pdf', 
            size: '4.2 MB', 
            type: 'PDF Document', 
            category: 'Civil Architecture', 
            checksum: 'SHA-88219-OK', 
            origin: 'Sector 7 Grid',
            content: `AURELINE INFRASTRUCTURE DOSSIER: SUBTERRANEAN CONDUIT SECTOR 7\nClassification: RESTRICTED // CLEARANCE TIER 2\n\n1. OVERVIEW: Pre-Convergence conduit line running 140 meters beneath the Old Factory Ward. Originally configured to route raw Aethercore resonance from the Nexus to municipal capacitors.\n\n2. CURRENT STATUS: Automated dampening seals have degraded by 38%. Harmonic frequency 88.2 MHz detected bleeding into civil communication relays.\n\n3. ACCESS CODES: Secondary maintenance airlock requires Cipher #0x8891. Direct unauthorized drilling registered from Broad Street bank sub-basement.`
        },
        { 
            id: 'doc-2', 
            title: 'PRISM_Frequency_Audio.wav', 
            size: '12.8 MB', 
            type: 'Audio Waveform', 
            category: 'Signal Intercept', 
            checksum: 'SHA-19022-WARN', 
            origin: 'Sector 4 Node',
            content: `AUDIO INTERCEPT LOG: SPECTRUM ANALYSIS [88.2 MHz - 88.4 MHz]\nTimestamp: Cycle 42 // 03:14:22\nRecording Node: Sector 4 Deep Telemetry Array\n\n[TRANSCRIPTION]:\n"...resonance phase alignment confirmed at 99.4%... do not allow the DGA patrol to trace the courier van... manifest CG-8821 contains the raw crystals needed for the resonance stabilizer... Belpois is monitoring the frequency from Lab 4..."\n\nSPECTRAL ANALYSIS: Harmonic waveform exhibits non-random repeating pulses matching Lyoko-derived compiler telemetry.`
        },
        { 
            id: 'doc-3', 
            title: 'DGA_Directives_2026.docx', 
            size: '1.1 MB', 
            type: 'Word Protocol', 
            category: 'Civic Governance', 
            checksum: 'SHA-99401-OK', 
            origin: 'Capital Ward',
            content: `DIRECTORATE OF GLOBAL AFFAIRS // EXECUTIVE DIRECTIVE #2026-A\nIssued by: Director Vane\nSubject: CURFEW AND CITIZEN IDENTITY VERIFICATION\n\n1. All citizens must maintain active MAID registration on dga.gov.aure.\n2. Curfew in Sector 3 (Warehouse District) remains active from 22:00 to 05:00 cycles.\n3. TRACE investigators are authorized to seize uncertified cryptographic decoding matrices.\n4. Any sightings of unregistered courier vehicles bearing plate CG-8821 must be detained immediately.`
        },
        { 
            id: 'doc-4', 
            title: 'FaithMed_Veilwilt_Study.pdf', 
            size: '3.6 MB', 
            type: 'Medical Report', 
            category: 'Clinical Bio-Aura', 
            checksum: 'SHA-33821-OK', 
            origin: 'Clinic Ward 2',
            content: `FAITH MEDICAL RESEARCH BULLETIN: VEILWILT PATHOLOGY & RECOVERY\nAuthors: Dr. Sharon Voss & Senior Clinicians\n\nVeilwilt disorder is characterized by cellular mana desynchronization, aura temperature drop, and memory distortion. Immersion in Lyrian spring water combined with thermal aura stabilization restores baseline integrity by 85% within 48 hours.\n\nRecommended stipend: 75 ₡ per treated citizen upon completion of formal intake scan on faithmed.aure.`
        },
        { 
            id: 'doc-5', 
            title: 'Bank_Wire_Audit_0994.csv', 
            size: '840 KB', 
            type: 'Financial Ledger', 
            category: 'Treasury Audit', 
            checksum: 'SHA-77210-CRIT', 
            origin: 'Oryn Bank',
            content: `TRANSACTION AUDIT LEDGER: FIRST FEDERAL BROAD STREET // ACCOUNT #0994-AURA\n\nTxID, Timestamp, Sender MAID, Recipient Account, Amount, Status\nTX-88102, 02:18, MAID-9041-AURE, #0994-AURA, 50000 CR, FLAGGED FRAUD\nTX-88103, 02:22, #0994-AURA, Offshore VectorNet-3, 48500 CR, TRANSFERRED\nTX-88104, 02:25, #0994-AURA, Sector 3 Cargo Dispatch, 1500 CR, CLEARED\n\nAudit Note: Rapid automated liquidation following vault perimeter breach. Correlates with seismic disturbance beneath Vault 4.`
        },
    ];
    const [selectedDriveFile, setSelectedDriveFile] = useState<DriveItem | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

    const handleDownloadFile = (file: DriveItem) => {
        setDownloadingId(file.id);
        SoundFX.playSnap();
        setTimeout(() => {
            setDownloadingId(null);
            setDownloadSuccess(`Downloaded "${file.title}" to local records.`);
            SoundFX.playCoin();
            if (addXP) addXP(20);
            setTimeout(() => setDownloadSuccess(null), 3000);
        }, 1000);
    };

    // ──────────────────────────────────────────────
    // 3. AURECHAT STATE (Live AI Backend Integration)
    // ──────────────────────────────────────────────
    const [selectedPersona, setSelectedPersona] = useState<'mai' | 'jeremie' | 'thorne' | 'voss'>('mai');
    const [chatMessages, setChatMessages] = useState<ChatEntry[]>([
        { id: 'msg-1', sender: 'MAI Core Node', time: '10:02 AM', text: 'Versenet terminal initialized. All seven realm relays are operational. How can I assist your investigation?', tag: 'CORE_AI' },
        { id: 'msg-2', sender: 'Jeremie Belpois', time: '10:04 AM', text: 'Compiler Lab 4 is online. If you need packet traces on Conduit 7 or spell diagnostics, transmit here.', tag: 'LAB_4' },
        { id: 'msg-3', sender: 'Agent Mara Thorne', time: '10:12 AM', text: 'Curfew enforcement active in Sector 3. Keep your MAID credentials synchronized.', tag: 'DGA_TACTICAL' },
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isAiStreaming, setIsAiStreaming] = useState(false);
    const chatFeedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatFeedRef.current?.scrollTo({ top: chatFeedRef.current.scrollHeight, behavior: 'smooth' });
    }, [chatMessages, isAiStreaming]);

    const handleSendChat = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = chatInput.trim();
        if (!trimmed || isAiStreaming) return;

        SoundFX.playSnap();
        const userMsg: ChatEntry = {
            id: `usr-${Date.now()}`,
            sender: player?.name || 'Citizen Investigator',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: trimmed,
            tag: 'TRANSMISSION',
            isUser: true
        };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsAiStreaming(true);

        try {
            // Live call to C# backend /api/ai/chat
            const npcTarget = selectedPersona === 'mai' ? 'Mai' :
                              selectedPersona === 'jeremie' ? 'Jeremie' :
                              selectedPersona === 'thorne' ? 'Thorne' : 'Sharon Voss';

            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    npc: npcTarget,
                    prompt: trimmed,
                    activeApp: 'auresuite_chat',
                    context: `AureSuite secure wiretap channel. The user is exploring Meridion, the Broad Street vault incident, and subterranean conduits.`
                })
            });

            if (res.ok) {
                const data = await res.json();
                const aiReply: ChatEntry = {
                    id: `ai-${Date.now()}`,
                    sender: data.npc || (selectedPersona === 'mai' ? 'MAI Core Node' : selectedPersona === 'jeremie' ? 'Jeremie Belpois' : selectedPersona === 'thorne' ? 'Agent Thorne' : 'Dr. Sharon Voss'),
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    text: data.text || 'Telemetry acknowledged. Connection verified.',
                    tag: data.provider ? `${data.provider.toUpperCase()}_NODE` : 'RELAY_NODE'
                };
                setChatMessages(prev => [...prev, aiReply]);
                SoundFX.playCoin();
                if (addXP) addXP(15);
            } else {
                throw new Error('Endpoint returned status ' + res.status);
            }
        } catch {
            // In-world graceful fallback
            const fallbackMap: Record<string, string> = {
                mai: `Telemetry received: "${trimmed}". Subterranean harmonics in Sector 7 show a 99.4% resonance alignment with the central Aethercore.`,
                jeremie: `Got your packet trace: "${trimmed}". I ran the parameters through Compiler Lab 4—the cipher 0x8891 decrypts the Conduit 7 relay.`,
                thorne: `DGA monitoring acknowledges transmission. Curfew in the Old Factory Ward remains in effect. Report suspicious activity to dga.gov.aure.`,
                voss: `Bio-aura reading on your transmission shows steady frequencies. Remember to maintain telemetry discipline near crystal caches.`
            };
            const fallbackReply: ChatEntry = {
                id: `ai-fallback-${Date.now()}`,
                sender: selectedPersona === 'mai' ? 'MAI Core Node' : selectedPersona === 'jeremie' ? 'Jeremie Belpois' : selectedPersona === 'thorne' ? 'Agent Thorne' : 'Dr. Sharon Voss',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: fallbackMap[selectedPersona],
                tag: 'LOCAL_RELAY'
            };
            setChatMessages(prev => [...prev, fallbackReply]);
            if (addXP) addXP(10);
        } finally {
            setIsAiStreaming(false);
        }
    };

    // ──────────────────────────────────────────────
    // 4. AUREMAPS STATE (The 7 Realms of Meridion)
    // ──────────────────────────────────────────────
    const realmPins: RealmPin[] = [
        { 
            id: 'r-1', 
            realm: 'Aureline', 
            name: 'Capital Citadel', 
            sector: 'Capital Administrative', 
            x: 28, 
            y: 32, 
            threat: 'Low', 
            desc: 'The political and civic heart of the realm. Houses the Sovereign Concord, Grand Heraldry Archive, and DGA Headquarters.',
            lore: 'The Citadel towers over the Grand Promenade. Strict telemetry checkpoints regulate all entrance corridors.'
        },
        { 
            id: 'r-2', 
            realm: 'Lyria', 
            name: 'Verdant Sanctuaries', 
            sector: 'Natural Bio-Aura Groves', 
            x: 42, 
            y: 68, 
            threat: 'Low', 
            desc: 'Crystalline forests and thermal healing springs maintained by the Order of Faith. Primary site for Veilwilt rehabilitation.',
            lore: 'Flora in Lyria naturally dampens synthetic electromagnetic frequencies, providing natural solace against energy fatigue.'
        },
        { 
            id: 'r-3', 
            realm: 'Kaelis', 
            name: 'Industrial Spire & Warehouse 3', 
            sector: 'Manufacturing & Freight Hub', 
            x: 72, 
            y: 44, 
            threat: 'Moderate', 
            desc: 'Smelting foundries, locomotive yards, and freight depots. Where mana crystal manifest CG-8821 was intercepted.',
            lore: 'Thermal spires operate day and night. Freight lines connect deep subterranean shafts directly to surface transit.'
        },
        { 
            id: 'r-4', 
            realm: 'Valen', 
            name: 'High Bastion Garrison', 
            sector: 'Territorial Defense Ramparts', 
            x: 20, 
            y: 75, 
            threat: 'Moderate', 
            desc: 'Heavily fortified border fortress with biometric barrier gates and automated anti-aerial defense batteries.',
            lore: 'Guards the western mountain passes against rogue syndicate incursions and unregistered flight crafts.'
        },
        { 
            id: 'r-5', 
            realm: 'Solaria', 
            name: 'Sunspire Mirrored Array', 
            sector: 'High Desert Solar Basin', 
            x: 82, 
            y: 26, 
            threat: 'High', 
            desc: 'Crystalline mirrors and towering solar capacitors generating daytime power for eastern municipal grids.',
            lore: 'Intense thermal conditions make unshielded travel hazardous. Pre-Collapse runestones dot the surrounding dunes.'
        },
        { 
            id: 'r-6', 
            realm: 'Umbra', 
            name: 'Subterranean Conduit Sector 7', 
            sector: 'Old Factory Catacombs', 
            x: 55, 
            y: 22, 
            threat: 'Critical', 
            desc: 'Abandoned pre-Convergence conduit tunnels beneath the Old Factory Ward. Site of the PRISM 88.2 MHz signal emission.',
            lore: 'Protected by encrypted pneumatic airlocks requiring Cipher Key #0x8891. Deep aether bleed recorded.'
        },
        { 
            id: 'r-7', 
            realm: 'Nexus', 
            name: 'Central Aethercore Singularity', 
            sector: 'Convergence Zero Point', 
            x: 50, 
            y: 50, 
            threat: 'Extreme', 
            desc: 'The gravitational and metaphysical core of Meridion. High-density crystal lattice holding the realms in planar alignment.',
            lore: 'Access restricted to Tier 3 researchers. Localized timeline dilation and spatial rifts reported near perimeter.'
        },
    ];
    const [selectedRealm, setSelectedRealm] = useState<RealmPin>(realmPins[0]);
    const [radarPings, setRadarPings] = useState<number[]>([]);
    const [activeGpsTarget, setActiveGpsTarget] = useState<string | null>(null);

    const handleTriggerPing = () => {
        SoundFX.playSnap();
        const pingId = Date.now();
        setRadarPings((prev) => [...prev, pingId]);
        setTimeout(() => {
            setRadarPings((prev) => prev.filter((id) => id !== pingId));
        }, 2000);
        if (addXP) addXP(15);
    };

    const handleSetGps = (realm: RealmPin) => {
        SoundFX.playCoin();
        setActiveGpsTarget(realm.name);
        if (addXP) addXP(10);
    };

    // ──────────────────────────────────────────────
    // 5. AURESCANNER STATE (Diagnostics & Decryptor)
    // ──────────────────────────────────────────────
    const [scannedFiles, setScannedFiles] = useState([
        { id: 'scan-1', name: 'CONFIDENTIAL_LEAK_09.pdf', size: '2.4 MB', status: 'CLEAN', threatLevel: 'Low', progress: 100 },
        { id: 'scan-2', name: 'SUSPECT_MANIFEST_CG8821.exe', size: '14.1 MB', status: 'INFECTED', threatLevel: 'High', progress: 100 },
        { id: 'scan-3', name: 'AETHERCORE_CONDUIT_KEY.enc', size: '512 KB', status: 'ENCRYPTED', threatLevel: 'Classified', progress: 100 },
    ]);
    const [scanningId, setScanningId] = useState<string | null>(null);
    const [tunerFrequency, setTunerFrequency] = useState<string>('88.2 MHz');
    const [decryptInput, setDecryptInput] = useState('');
    const [decryptedDossier, setDecryptedDossier] = useState<{ title: string; body: string; xp: number; credits: number } | null>(null);
    const [decryptError, setDecryptError] = useState<string | null>(null);

    const handleRunScan = (fileId: string) => {
        setScanningId(fileId);
        SoundFX.playSnap();
        setTimeout(() => {
            setScannedFiles((prev) =>
                prev.map((f) => (f.id === fileId ? { ...f, status: 'SCANNED & VERIFIED', threatLevel: 'Secured' } : f))
            );
            setScanningId(null);
            SoundFX.playCoin();
            if (addXP) addXP(35);
            if (addCredits) addCredits(50);
        }, 1500);
    };

    const handleDecrypt = (e: React.FormEvent) => {
        e.preventDefault();
        const normalized = decryptInput.trim().toLowerCase();

        if (normalized === '0x8891' || normalized === '8891') {
            SoundFX.playCoin();
            setDecryptedDossier({
                title: 'CONDUIT 7 AIRLOCK ACCESS DEED UNLOCKED',
                body: 'Access Key: 0x8891 · Facility: Subterranean Conduit Sector 7 · Frequency: 88.2 MHz · Primary Airlock unlocked. Aetheric pressure equalized.',
                xp: 100,
                credits: 200
            });
            setDecryptError(null);
            if (addCredits) addCredits(200);
            if (addXP) addXP(100);
        } else if (normalized === 'cg-8821' || normalized === 'cg8821') {
            SoundFX.playCoin();
            setDecryptedDossier({
                title: 'MANIFEST CG-8821 CONTRABAND AUDIT UNLOCKED',
                body: 'Cargo: 120 Units Unrefined Mana Crystals · Departure: Kaelis Foundries · Diverted Route: Sector 3 Warehouse to Subterranean Conduit 7 · Courier: Missing in Action.',
                xp: 80,
                credits: 150
            });
            setDecryptError(null);
            if (addCredits) addCredits(150);
            if (addXP) addXP(80);
        } else if (normalized === '0994-aura' || normalized === '0994') {
            SoundFX.playCoin();
            setDecryptedDossier({
                title: 'WIRE DISPATCH #0994-AURA OFFSHORE TRAIL UNLOCKED',
                body: 'Amount: 50,000 ₡ · Source: First Federal Broad Street Vault 4 · Routed Through: Subterranean aether tap in Old Factory Ward · Settlement Destination: Anonymous Escrow.',
                xp: 90,
                credits: 175
            });
            setDecryptError(null);
            if (addCredits) addCredits(175);
            if (addXP) addXP(90);
        } else if (normalized === 'lightborn') {
            SoundFX.playCoin();
            setDecryptedDossier({
                title: 'SOVEREIGN CONCORD ROYAL ARCHIVE SEAL UNLOCKED',
                body: 'Dynastic lineage record confirmed. Pre-Convergence charters show the Sovereign Concord established dual stewardship over the Nexus Singularity.',
                xp: 75,
                credits: 120
            });
            setDecryptError(null);
            if (addCredits) addCredits(120);
            if (addXP) addXP(75);
        } else {
            SoundFX.playSnap();
            setDecryptError('Decryption Cipher Rejected. Try keys from AureMail dispatches: "0x8891", "CG-8821", "0994-AURA", or "lightborn".');
        }
    };

    return (
        <div className="flex h-full w-full bg-[#FAFBFD] text-slate-800 font-sans select-none overflow-hidden text-xs">
            
            {/* ── 1. SOLID LIGHT SIDEBAR ── */}
            <aside className="w-64 bg-[#F1F5F9] border-r border-slate-200 flex flex-col justify-between p-3.5 shrink-0 select-none">
                <div className="space-y-5">
                    
                    {/* Header Branding */}
                    <div className="flex items-center gap-3 px-2 py-1">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center font-bold text-white shadow-xs">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <div className="font-display font-bold text-sm text-slate-900 leading-none">AureSuite</div>
                            <div className="text-[10px] text-rose-600 font-mono font-bold tracking-wider mt-1">CLOUD PRODUCTIVITY v4.2</div>
                        </div>
                    </div>

                    {/* Sub-App Navigation List */}
                    <nav className="space-y-1">
                        {[
                            { id: 'mail', label: 'AureMail', icon: Mail, desc: 'Dispatches & Wire Sync', badge: unifiedEmails.filter(e => !e.isRead).length },
                            { id: 'drive', label: 'AureDrive', icon: HardDrive, desc: 'Cloud Vault & Dossiers' },
                            { id: 'chat', label: 'AureChat', icon: MessageSquare, desc: 'Encrypted AI Wiretap', pulse: true },
                            { id: 'maps', label: 'AureMaps', icon: MapPin, desc: '7 Realms & Radar GPS' },
                            { id: 'scanner', label: 'AureScanner', icon: ShieldCheck, desc: 'Threats & Cipher Matrix' },
                        ].map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTool === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        SoundFX.playSnap();
                                        setActiveTool(item.id as any);
                                    }}
                                    className={`relative flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                                            : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 border border-transparent'
                                    }`}
                                >
                                    <Icon size={16} className={isActive ? 'text-rose-600' : 'text-slate-400'} />
                                    <div className="min-w-0 flex-1 text-left">
                                        <div className="truncate">{item.label}</div>
                                        <div className="text-[9px] text-slate-400 font-normal truncate">{item.desc}</div>
                                    </div>
                                    {item.badge ? (
                                        <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                                            {item.badge}
                                        </span>
                                    ) : item.pulse ? (
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                                    ) : null}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Citizen Status Card */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-[10px] text-slate-500 space-y-1 font-mono shadow-xs">
                    <div className="flex items-center justify-between text-slate-700 font-bold">
                        <span className="truncate">{player?.name || 'Provisional Citizen'}</span>
                        <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">SSO SYNCED</span>
                    </div>
                    <div className="text-slate-400">MAID: {player?.identity?.citizenId || 'MAID-9041-AURE'}</div>
                    <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
                        <span>Credits: <strong className="text-amber-700">{player?.credits ?? 0} ₡</strong></span>
                        <span>Bits: <strong className="text-indigo-700">{player?.bits ?? 0} ◈</strong></span>
                    </div>
                </div>
            </aside>

            {/* ── 2. MAIN TOOL CANVAS ── */}
            <main className="flex-1 bg-[#FAFBFD] flex flex-col overflow-hidden">
                <AnimatePresence mode="wait">
                    
                    {/* ── A. AUREMAIL SUB-APP ── */}
                    {activeTool === 'mail' && (
                        <motion.div
                            key="mail"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="flex h-full w-full overflow-hidden"
                        >
                            {/* Email List Column */}
                            <div className="w-84 border-r border-slate-200 bg-white flex flex-col shrink-0">
                                <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="font-bold text-slate-800 flex items-center gap-2">
                                            <Mail size={15} className="text-rose-600" />
                                            <span>Unified Inbox</span>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                                            {unifiedEmails.length} Dispatches
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={emailSearch}
                                            onChange={(e) => setEmailSearch(e.target.value)}
                                            placeholder="Search dispatches or senders..."
                                            className="w-full h-8 pl-8 pr-3 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-rose-500 transition"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                                    {unifiedEmails
                                        .filter(e => !emailSearch || e.subject.toLowerCase().includes(emailSearch.toLowerCase()) || e.sender.toLowerCase().includes(emailSearch.toLowerCase()))
                                        .map((email) => {
                                            const isSelected = email.id === selectedEmailId;
                                            return (
                                                <div
                                                    key={email.id}
                                                    onClick={() => handleSelectEmail(email.id)}
                                                    className={`p-3.5 transition cursor-pointer text-left ${
                                                        isSelected ? 'bg-rose-50/70 border-l-4 border-rose-500' : 'hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between text-slate-500 text-[10px] mb-1">
                                                        <span className={`truncate max-w-[140px] ${!email.isRead ? 'font-extrabold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                            {email.sender}
                                                        </span>
                                                        <div className="flex items-center gap-1.5">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); toggleStarEmail(email.id); }}
                                                                className="text-slate-300 hover:text-amber-500"
                                                            >
                                                                <Star size={12} fill={email.isStarred ? 'currentColor' : 'none'} className={email.isStarred ? 'text-amber-500' : ''} />
                                                            </button>
                                                            <span>{email.time}</span>
                                                        </div>
                                                    </div>
                                                    <div className={`text-xs truncate mb-1 ${!email.isRead ? 'font-bold text-slate-900' : 'text-slate-800'}`}>
                                                        {email.subject}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 line-clamp-1">{email.body}</div>
                                                    <div className="mt-2 flex items-center justify-between">
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                                            email.priority === 'classified' ? 'bg-purple-100 text-purple-800' :
                                                            email.priority === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                                                        }`}>
                                                            {email.priority}
                                                        </span>
                                                        {email.isClaimed && (
                                                            <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                                                                <Check size={12} /> Stored
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>

                            {/* Email Details View */}
                            <div className="flex-1 bg-[#FAFBFD] p-6 flex flex-col justify-between overflow-y-auto">
                                <div className="space-y-5 max-w-2xl">
                                    <div className="border-b border-slate-200 pb-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-mono text-slate-500">{selectedEmail.role} • {selectedEmail.time}</span>
                                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                                                {selectedEmail.priority} Priority
                                            </span>
                                        </div>
                                        <h2 className="text-lg font-bold text-slate-900 font-display">{selectedEmail.subject}</h2>
                                        <div className="text-xs text-slate-600 font-medium">
                                            From: <strong className="text-slate-800">{selectedEmail.sender}</strong> <span className="font-mono text-slate-400">({selectedEmail.senderAddress})</span>
                                        </div>
                                    </div>

                                    {/* Email Body Card */}
                                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 leading-relaxed text-slate-700 text-xs">
                                        <p className="whitespace-pre-line">{selectedEmail.body}</p>
                                        {selectedEmail.cipherKey && (
                                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-mono text-[11px] space-y-1">
                                                <div className="font-bold flex items-center gap-1.5"><Key size={13} /> Extracted Intelligence Payload:</div>
                                                <div>Access Cipher: <strong>#{selectedEmail.cipherKey}</strong> • Trust Index: 100% · Decryptable in AureScanner</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Reward Bar */}
                                <div className="pt-4 border-t border-slate-200 flex items-center justify-between max-w-2xl">
                                    <div className="text-xs text-slate-500 font-mono">
                                        Intel Bounty: <strong className="text-amber-700">+{selectedEmail.rewardCredits} ₡</strong> • <strong className="text-indigo-700">+{selectedEmail.rewardXP} XP</strong>
                                    </div>
                                    <button
                                        onClick={() => handleClaimEmailIntel(selectedEmail)}
                                        disabled={selectedEmail.isClaimed}
                                        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold text-xs transition shadow-xs flex items-center gap-2 cursor-pointer"
                                    >
                                        {selectedEmail.isClaimed ? <CheckCircle2 size={16} /> : <ArrowUpRight size={16} />}
                                        <span>{selectedEmail.isClaimed ? 'Intelligence Stored' : 'Extract Intelligence & Claim Bounty'}</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── B. AUREDRIVE SUB-APP ── */}
                    {activeTool === 'drive' && (
                        <motion.div
                            key="drive"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="p-6 space-y-5 h-full overflow-y-auto"
                        >
                            {/* Storage Status Banner */}
                            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                        <HardDrive size={18} className="text-blue-600" />
                                        <span>AureDrive Cloud Storage Quota</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Encrypted institutional file storage connected to Aureline grid.</p>
                                </div>
                                <div className="w-56 space-y-1.5">
                                    <div className="flex justify-between text-[11px] font-mono text-slate-600">
                                        <span>2.8 GB Used</span>
                                        <span>5.0 GB Max</span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                        <div className="h-full bg-blue-600 rounded-full w-[56%]" />
                                    </div>
                                </div>
                            </div>

                            {downloadSuccess && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-mono font-bold flex items-center gap-2">
                                    <CheckCircle2 size={14} /> {downloadSuccess}
                                </div>
                            )}

                            {/* Files Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                                {driveFiles.map((file) => {
                                    return (
                                        <motion.div
                                            key={file.id}
                                            whileHover={{ y: -3, scale: 1.01 }}
                                            onClick={() => setSelectedDriveFile(file)}
                                            className="p-4 bg-white border border-slate-200 hover:border-blue-300 rounded-2xl shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-3"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                                    <FileText size={20} />
                                                </div>
                                                <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                                                    {file.size}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-xs text-slate-900 truncate">{file.title}</div>
                                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{file.category} • {file.origin}</div>
                                            </div>
                                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                                                <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                                    {file.checksum}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDownloadFile(file);
                                                    }}
                                                    disabled={downloadingId === file.id}
                                                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                                    title="Download Evidence"
                                                >
                                                    {downloadingId === file.id ? <RefreshCw size={14} className="animate-spin text-blue-600" /> : <Download size={14} />}
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Inspection Drawer */}
                            {selectedDriveFile && (
                                <div className="p-5 bg-white border-2 border-blue-200 rounded-2xl space-y-3 shadow-md">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                                <FileText size={16} className="text-blue-600" />
                                                <span>{selectedDriveFile.title}</span>
                                            </div>
                                            <div className="text-[11px] text-slate-500 font-mono">
                                                Format: {selectedDriveFile.type} · Origin: {selectedDriveFile.origin} · Checksum: {selectedDriveFile.checksum}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDownloadFile(selectedDriveFile)}
                                                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <Download size={13} /> Download Copy
                                            </button>
                                            <button
                                                onClick={() => setSelectedDriveFile(null)}
                                                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl font-mono text-xs text-slate-700 whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto border border-slate-200">
                                        {selectedDriveFile.content}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ── C. AURECHAT SUB-APP (Live AI Backend) ── */}
                    {activeTool === 'chat' && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="flex flex-col h-full overflow-hidden p-6 space-y-4"
                        >
                            {/* Live Signal Equalizer & Persona Switcher */}
                            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                                        <Radio size={18} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-xs">AureChat Encrypted Wiretap Matrix</div>
                                        <div className="text-[10px] text-slate-500 font-mono">Live multi-turn neural node channel via /api/ai/chat</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-slate-600 font-mono">Node Persona:</span>
                                    <select
                                        value={selectedPersona}
                                        onChange={(e) => setSelectedPersona(e.target.value as any)}
                                        className="h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono outline-none focus:border-purple-500"
                                    >
                                        <option value="mai">MAI Core Node (AI Companion)</option>
                                        <option value="jeremie">Jeremie Belpois (Compiler Lab 4)</option>
                                        <option value="thorne">Agent Mara Thorne (DGA Tactical)</option>
                                        <option value="voss">Dr. Sharon Voss (Faith Medical / PRISM)</option>
                                    </select>
                                </div>

                                {/* Animated Audio Spectrum Bars */}
                                <div className="flex items-end gap-1 h-5 px-3">
                                    {[12, 18, 8, 20, 14, 16, 10, 22, 12, 15].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: isAiStreaming ? [4, h, 6, h + 4, 4] : [6, 8, 6] }}
                                            transition={{ repeat: Infinity, duration: 1.0 + (i * 0.1), ease: "easeInOut" }}
                                            className={`w-1 rounded-full ${isAiStreaming ? 'bg-rose-500' : 'bg-purple-500'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Message Feed Canvas */}
                            <div ref={chatFeedRef} className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 overflow-y-auto space-y-3 shadow-xs">
                                {chatMessages.map((msg) => (
                                    <div 
                                        key={msg.id} 
                                        className={`p-3 rounded-xl border space-y-1 ${
                                            msg.isUser 
                                                ? 'bg-purple-50/70 border-purple-200 ml-8' 
                                                : 'bg-slate-50 border-slate-200 mr-8'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                            <span className={`font-bold ${msg.isUser ? 'text-purple-900' : 'text-slate-800'}`}>
                                                {msg.sender}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 text-[9px] font-bold">{msg.tag}</span>
                                                <span>{msg.time}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-line">{msg.text}</div>
                                    </div>
                                ))}
                                {isAiStreaming && (
                                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 mr-8 flex items-center gap-2 text-xs font-mono text-purple-800">
                                        <RefreshCw size={13} className="animate-spin text-purple-600" />
                                        <span>Decoding neural carrier stream...</span>
                                    </div>
                                )}
                            </div>

                            {/* Chat Injection Form */}
                            <form onSubmit={handleSendChat} className="flex gap-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Inject message or query into encrypted wiretap..."
                                    className="flex-1 h-10 px-4 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition font-mono"
                                />
                                <button
                                    type="submit"
                                    disabled={isAiStreaming || !chatInput.trim()}
                                    className="h-10 px-5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Send size={14} />
                                    <span>Transmit</span>
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* ── D. AUREMAPS SUB-APP (7 Realms of Meridion) ── */}
                    {activeTool === 'maps' && (
                        <motion.div
                            key="maps"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="p-6 space-y-4 h-full flex flex-col overflow-hidden"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-display">
                                        <MapPin size={18} className="text-emerald-600" /> Seven Realms Geospatial Radar Matrix
                                    </h2>
                                    <p className="text-[11px] text-slate-500 font-mono">Real-time sector telemetry covering Aureline, Lyria, Kaelis, Valen, Solaria, Umbra, and the Nexus.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {activeGpsTarget && (
                                        <span className="px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1">
                                            <Compass size={12} /> Target: {activeGpsTarget}
                                        </span>
                                    )}
                                    <button
                                        onClick={handleTriggerPing}
                                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Radio size={14} />
                                        <span>Scan Sector Ping</span>
                                    </button>
                                </div>
                            </div>

                            {/* Light Technical Radar Canvas with 360 Sweep */}
                            <div className="flex-1 bg-white border-2 border-emerald-200/90 rounded-2xl relative overflow-hidden shadow-xs flex items-center justify-center">
                                {/* Blueprint Background Grid */}
                                <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
                                
                                {/* Concentric Radar Rings */}
                                <div className="absolute h-84 w-84 rounded-full border border-emerald-300/40" />
                                <div className="absolute h-56 w-56 rounded-full border border-emerald-300/60" />
                                <div className="absolute h-28 w-28 rounded-full border border-emerald-400/80" />
                                <div className="absolute h-full w-[1px] bg-emerald-200/60" />
                                <div className="absolute w-full h-[1px] bg-emerald-200/60" />

                                {/* 360° Rotating Radar Sweep Beam */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
                                    className="absolute h-84 w-84 rounded-full origin-center pointer-events-none"
                                    style={{
                                        background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(16, 185, 129, 0.25) 360deg)'
                                    }}
                                />

                                {/* Concentric Ripple Pings */}
                                {radarPings.map((pid) => (
                                    <motion.div
                                        key={pid}
                                        initial={{ scale: 0.1, opacity: 0.9 }}
                                        animate={{ scale: 2.2, opacity: 0 }}
                                        transition={{ duration: 1.8, ease: "easeOut" }}
                                        className="absolute h-48 w-48 rounded-full border-2 border-emerald-500 pointer-events-none"
                                    />
                                ))}

                                {/* Interactive Waypoint Pins for 7 Realms */}
                                {realmPins.map((pin) => {
                                    const isSelected = pin.id === selectedRealm.id;
                                    return (
                                        <button
                                            key={pin.id}
                                            onClick={() => {
                                                SoundFX.playSnap();
                                                setSelectedRealm(pin);
                                            }}
                                            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                                            className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 p-1.5 rounded-full transition-all group z-10 cursor-pointer ${
                                                isSelected 
                                                    ? 'scale-125 ring-4 ring-emerald-300 bg-emerald-600 text-white shadow-md' 
                                                    : 'bg-white border border-emerald-400 text-emerald-800 hover:scale-110 shadow-xs'
                                            }`}
                                        >
                                            <MapPin size={13} className={isSelected ? 'text-white' : 'text-emerald-700'} />
                                            <span className="text-[10px] font-bold font-mono px-1 truncate max-w-[85px]">{pin.realm}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Realm Intelligence Card */}
                            <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
                                <div className="space-y-1 max-w-xl">
                                    <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                                        <span>Realm: {selectedRealm.realm} — {selectedRealm.name}</span>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                                            selectedRealm.threat === 'Extreme' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                                            selectedRealm.threat === 'Critical' ? 'bg-rose-100 text-rose-800' :
                                            selectedRealm.threat === 'High' ? 'bg-amber-100 text-amber-800' :
                                            selectedRealm.threat === 'Moderate' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                            Threat: {selectedRealm.threat}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 leading-relaxed">{selectedRealm.desc}</p>
                                    <p className="text-[10px] text-slate-400 italic font-mono">{selectedRealm.lore}</p>
                                </div>
                                <div className="space-y-2 text-right">
                                    <div className="font-mono text-[10px] text-slate-400">
                                        <div>Sector: {selectedRealm.sector}</div>
                                        <div>Coords: {selectedRealm.x}.04°N, {selectedRealm.y}.18°W</div>
                                    </div>
                                    <button
                                        onClick={() => handleSetGps(selectedRealm)}
                                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto cursor-pointer"
                                    >
                                        <Compass size={13} /> Set Waypoint GPS
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── E. AURESCANNER SUB-APP (Frequency Tuner & Decryptor) ── */}
                    {activeTool === 'scanner' && (
                        <motion.div
                            key="scanner"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="p-6 space-y-5 h-full overflow-y-auto"
                        >
                            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
                                        <ShieldCheck size={20} className="text-rose-600" /> AureScanner File Diagnostics & Cipher Matrix
                                    </h2>
                                    <p className="text-xs text-slate-500 font-mono">Harmonic frequency scanner, suspect binary diagnostic sweeps, and cryptographic deciphering.</p>
                                </div>
                                
                                {/* Frequency Tuner Select */}
                                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs font-mono">
                                    <Radio size={14} className="text-rose-600" />
                                    <span className="text-[11px] text-slate-500 font-bold">Carrier Tuner:</span>
                                    {['88.2 MHz', '88.4 MHz', '99.1 MHz', '104.5 MHz'].map((freq) => (
                                        <button
                                            key={freq}
                                            onClick={() => {
                                                SoundFX.playSnap();
                                                setTunerFrequency(freq);
                                            }}
                                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                                                tunerFrequency === freq 
                                                    ? 'bg-rose-600 text-white' 
                                                    : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            {freq}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tuner Status Banner */}
                            <div className="p-3.5 bg-slate-900 text-slate-100 rounded-2xl flex items-center justify-between font-mono text-xs">
                                <div className="flex items-center gap-3">
                                    <Activity size={16} className="text-rose-400 animate-pulse" />
                                    <div>
                                        <span className="font-bold text-rose-400">Carrier: {tunerFrequency}</span>
                                        <span className="text-slate-400 ml-2">
                                            {tunerFrequency === '88.2 MHz' ? 'PRISM Anomaly Harmonic Waveform — Subterranean Relay 88 Active' :
                                             tunerFrequency === '88.4 MHz' ? 'Encrypted Intercept Wiretap — Capital Grid Signal' :
                                             tunerFrequency === '99.1 MHz' ? 'DGA Bastion Tactical Telemetry Channel' :
                                             'Sector 7 Catacomb Low-Frequency Carrier'}
                                        </span>
                                    </div>
                                </div>
                                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px]">
                                    CARRIER LOCKED
                                </span>
                            </div>

                            {/* Diagnostic Scan Table */}
                            <div className="space-y-2.5">
                                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Threat Diagnostics on Downloaded Exhibits</div>
                                <div className="space-y-2">
                                    {scannedFiles.map((file) => (
                                        <div key={file.id} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
                                            <div className="space-y-0.5">
                                                <div className="font-bold text-xs text-slate-900">{file.name}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">
                                                    Size: {file.size} • Threat Rating: <strong className={file.threatLevel === 'High' || file.threatLevel === 'Classified' ? 'text-rose-600' : 'text-slate-600'}>{file.threatLevel}</strong>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleRunScan(file.id)}
                                                disabled={scanningId === file.id}
                                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
                                            >
                                                {scanningId === file.id ? <RefreshCw className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                                                <span>{scanningId === file.id ? 'Running Deep Scan...' : file.status}</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Cipher Decryption Workbench */}
                            <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                                        <Key size={16} className="text-amber-600" /> Decrypt Case Exhibit Cipher Matrix
                                    </h3>
                                    <span className="text-[10px] font-mono text-slate-400">Supported keys: #0x8891, #CG-8821, #0994-AURA, #lightborn</span>
                                </div>

                                <form onSubmit={handleDecrypt} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={decryptInput}
                                        onChange={(e) => setDecryptInput(e.target.value)}
                                        placeholder="Input cipher key (e.g. 0x8891, CG-8821, 0994-AURA)..."
                                        className="flex-1 h-10 px-4 border border-slate-300 rounded-xl text-xs font-mono outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition"
                                    />
                                    <button
                                        type="submit"
                                        className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
                                    >
                                        Decrypt Payload
                                    </button>
                                </form>

                                {decryptError && (
                                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-mono">
                                        {decryptError}
                                    </div>
                                )}

                                {decryptedDossier && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-mono space-y-2"
                                    >
                                        <div className="flex items-center justify-between text-emerald-800 font-bold border-b border-emerald-200 pb-1.5">
                                            <span className="flex items-center gap-1.5">
                                                <CheckCircle2 size={16} /> {decryptedDossier.title}
                                            </span>
                                            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                                +{decryptedDossier.credits} ₡ / +{decryptedDossier.xp} XP AWARDED
                                            </span>
                                        </div>
                                        <div className="text-emerald-950 leading-relaxed font-normal">{decryptedDossier.body}</div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
