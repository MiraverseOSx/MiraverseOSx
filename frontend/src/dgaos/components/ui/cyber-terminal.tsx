'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Terminal as TerminalIcon,
  Cpu,
  Globe,
  HardDrive,
  Lock,
  Unlock,
  MapPin
} from 'lucide-react';
import type { LabRecord } from '@/lib/records';
import InvestigationBreadcrumbs from '@/components/ui/investigation-breadcrumbs';

interface CyberTerminalProps {
  records: LabRecord[];
  cases: LabRecord[];
  evidence: LabRecord[];
  onOpenRecord: (record: LabRecord) => void;
  onLogFindingToBench?: (note: string) => void;
  navigate?: (view: string) => void;
}

type CyberSubView = 'terminal' | 'extractor' | 'osint';

interface CommandOutput {
  id: string;
  type: 'cmd' | 'info' | 'success' | 'warn' | 'error' | 'data';
  text: string;
}

interface DigitalArtifact {
  id: string;
  title: string;
  type: 'sim_dump' | 'encrypted_container' | 'exif_image' | 'packet_capture';
  sourceItem: string;
  hash: string;
  status: 'locked' | 'analyzed' | 'extracted';
  preview: Record<string, unknown>;
}

const PRESET_ARTIFACTS: DigitalArtifact[] = [
  {
    id: 'ART-001',
    title: 'Burner Phone SIM Card Image (Recovered from Case FS-2026-00421)',
    type: 'sim_dump',
    sourceItem: 'EV-0005',
    hash: 'e9b1c0398f4d92a188f219c8360d2b7c',
    status: 'extracted',
    preview: {
      owner: 'Unknown Caller ("Ghost_404")',
      imsi: '310410192847192',
      recentCalls: [
        { time: '2026-09-08 02:14 UTC', number: '+1 (555) 019-2831', dur: '42s', type: 'Incoming' },
        { time: '2026-09-08 01:58 UTC', number: '+1 (555) 018-9944', dur: '1m 12s', type: 'Outgoing' },
      ],
      deletedSMS: [
        { time: '2026-09-08 01:45 UTC', text: 'Perimeter breach point ready at east wing. Ingress to vault corridor now.' },
        { time: '2026-09-08 02:20 UTC', text: 'Package is secured. Wipe the terminal logs.' },
      ],
    },
  },
  {
    id: 'ART-002',
    title: 'SanDisk 64GB Encrypted USB Key (VeraCrypt Container)',
    type: 'encrypted_container',
    sourceItem: 'EV-0006',
    hash: '7a2f1c84918e903f19385bdae019f842',
    status: 'locked',
    preview: {
      encryption: 'AES-256-XTS',
      hashAlgorithm: 'SHA-512 (500,000 iterations)',
      volumeSize: '4.2 GB',
      hint: 'Password is 4 words: color-metal-chemical-number',
      solution: 'blue-cobalt-sulfate-2026',
      decryptedFiles: [
        'offshore_ledger_transfer_sep26.pdf',
        'keycard_clone_hex_dump.bin',
        'security_patrol_schedules.xlsx',
      ],
    },
  },
  {
    id: 'ART-003',
    title: 'Suspect Surveillance Photo EXIF Extraction (scene_photo_04.jpg)',
    type: 'exif_image',
    sourceItem: 'EV-0007',
    hash: '5d893a9018e4720938f189c488b8e011',
    status: 'analyzed',
    preview: {
      camera: 'Sony Alpha ILCE-7M4',
      lens: 'FE 24-70mm F2.8 GM II',
      timestamp: '2026-09-08 02:28:14 UTC',
      gpsCoords: '38°53\'21.4"N 77°02\'11.8"W',
      locationName: 'Conservatory Grounds (East Perimeter Fence)',
      altitude: '18.4m',
      shutter: '1/60s · f/2.8 · ISO 6400',
    },
  },
  {
    id: 'ART-004',
    title: 'Wireshark Rogue Access Point PCAP (evil_twin_rogue.pcapng)',
    type: 'packet_capture',
    sourceItem: 'EV-0008',
    hash: 'b14e99c1840291e0a8471190284f1890',
    status: 'analyzed',
    preview: {
      packetsCount: '14,892 packets',
      protocols: ['802.11', 'TCP', 'TLSv1.3', 'DNS', 'HTTP/2'],
      suspiciousBeacons: [
        'SSID: "Lab_Guest_Secure" (MAC: 00:14:22:98:A1:FE) · Rogue BSSID',
      ],
      interceptedCredentials: [
        { host: 'auth.internal-trace.net', user: 'admin_relay', method: 'POST' },
      ],
    },
  },
];

export function CyberTerminal({
  records: _records,
  cases,
  evidence,
  onOpenRecord,
  onLogFindingToBench,
  navigate,
}: CyberTerminalProps) {
  const [subView, setSubView] = useState<CyberSubView>('terminal');
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<CommandOutput[]>([
    { id: '1', type: 'info', text: 'TRACE CYBER FORENSICS & TACTICAL OSINT ENGINE v3.4.1' },
    { id: '2', type: 'info', text: 'Standard NIST SP 800-86 Forensic Acquisition Framework Loaded.' },
    { id: '3', type: 'info', text: 'Type "help" for a list of tactical forensic & hacking commands.' },
  ]);
  const [artifacts, setArtifacts] = useState<DigitalArtifact[]>(PRESET_ARTIFACTS);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>('ART-001');
  const [decryptInput, setDecryptInput] = useState('');
  const [decryptNotice, setDecryptNotice] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const activeArtifact = useMemo(
    () => artifacts.find((a) => a.id === selectedArtifactId) || artifacts[0],
    [artifacts, selectedArtifactId]
  );

  const appendOutput = (outputs: Omit<CommandOutput, 'id'>[]) => {
    const newItems = outputs.map((o) => ({
      ...o,
      id: Math.random().toString(36).substring(2, 9),
    }));
    setHistory((prev) => [...prev, ...newItems]);
  };

  const handleCommand = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const raw = inputVal.trim();
    if (!raw) return;

    // Add to history
    appendOutput([{ type: 'cmd', text: `$ ${raw}` }]);
    setInputVal('');

    const [cmd, ...args] = raw.split(' ');
    const lowerCmd = cmd.toLowerCase();

    switch (lowerCmd) {
      case 'help':
        appendOutput([
          { type: 'info', text: 'AVAILABLE CYBER & HACKING COMMANDS:' },
          { type: 'data', text: '  nmap <ip>           - Scan network ports & services' },
          { type: 'data', text: '  whois <domain/ip>   - Query registrar and ASN routing info' },
          { type: 'data', text: '  exif <filename>     - Extract EXIF metadata & GPS coordinates' },
          { type: 'data', text: '  dump_sim <item_id>  - Extract deleted SMS & call records' },
          { type: 'data', text: '  decrypt <hash>      - Run dictionary crack on encrypted container' },
          { type: 'data', text: '  ip_trace <ip>       - Trace hop route & geographic ISP origin' },
          { type: 'data', text: '  packet_sniff <pcap> - Analyze Wireshark PCAP rogue credentials' },
          { type: 'data', text: '  artifacts           - List seized digital evidence items' },
          { type: 'data', text: '  log <note>          - Save finding directly to contemporaneous bench notes' },
          { type: 'data', text: '  clear               - Clear terminal output' },
        ]);
        break;

      case 'clear':
        setHistory([]);
        break;

      case 'artifacts':
        appendOutput([
          { type: 'info', text: 'SEIZED DIGITAL ARTIFACTS IN EVIDENCE VAULT:' },
          ...artifacts.map((a) => ({
            type: 'data' as const,
            text: `  [${a.id}] ${a.title} (${a.type.toUpperCase()}) - Status: ${a.status.toUpperCase()}`,
          })),
        ]);
        break;

      case 'nmap':
        const targetIp = args[0] || '192.168.1.45';
        appendOutput([
          { type: 'info', text: `Starting Nmap 7.94 ( https://nmap.org ) at 2026-09-08 02:40 UTC` },
          { type: 'info', text: `Nmap scan report for target (${targetIp})` },
          { type: 'data', text: 'PORT     STATE SERVICE       VERSION' },
          { type: 'data', text: '22/tcp   open  ssh           OpenSSH 9.2p1 (Debian 5+deb12u3)' },
          { type: 'data', text: '80/tcp   open  http          nginx 1.22.1 (Reverse Proxy)' },
          { type: 'data', text: '443/tcp  open  ssl/https     TLSv1.3 Encrypted Gateway' },
          { type: 'warn', text: '4444/tcp open  metasploit    Metasploit Reverse TCP Handler DETECTED!' },
          { type: 'success', text: `Host is up (0.0024s latency). 1 malicious backdoor port identified.` },
        ]);
        break;

      case 'whois':
        const domain = args[0] || 'shadow-drop.net';
        appendOutput([
          { type: 'info', text: `Querying WHOIS database for: ${domain}` },
          { type: 'data', text: `Domain Name: ${domain.toUpperCase()}` },
          { type: 'data', text: 'Registrar: Njalla Privacy Services Ltd. (Seychelles)' },
          { type: 'data', text: 'Registrant Contact: REDACTED FOR PRIVACY' },
          { type: 'data', text: 'Name Server: NS1.CRYPTO-RELAY.CH' },
          { type: 'data', text: 'Name Server: NS2.CRYPTO-RELAY.CH' },
          { type: 'warn', text: 'Hosting IP: 185.220.101.5 (Known Tor Exit Node & Bulletproof Host)' },
        ]);
        break;

      case 'exif':
        appendOutput([
          { type: 'info', text: 'Extracting EXIF metadata from scene_photo_04.jpg…' },
          { type: 'data', text: 'Camera Model: Sony Alpha ILCE-7M4' },
          { type: 'data', text: 'Capture Timestamp: 2026-09-08 02:28:14 UTC' },
          { type: 'success', text: 'GPS Coordinates: 38°53\'21.4"N 77°02\'11.8"W (Altitude: 18.4m)' },
          { type: 'data', text: 'Geolocation: East Perimeter Fence, Conservatory Grounds' },
          { type: 'warn', text: 'EXIF timestamp precedes 911 dispatch by exactly 18 minutes.' },
        ]);
        break;

      case 'dump_sim':
        appendOutput([
          { type: 'info', text: 'Reading flash partitions from SIM / burner phone storage…' },
          { type: 'success', text: 'Decoded 2 Deleted SMS records from SQLite unallocated space:' },
          { type: 'data', text: '  [01:45 UTC] "Perimeter breach point ready at east wing. Ingress to vault corridor now."' },
          { type: 'data', text: '  [02:20 UTC] "Package is secured. Wipe the terminal logs."' },
          { type: 'warn', text: 'Associated phone number resolved: +1 (555) 019-2831' },
        ]);
        break;

      case 'decrypt':
        const attempt = args.join(' ');
        if (attempt.includes('blue-cobalt') || attempt.includes('cobalt')) {
          setArtifacts((prev) =>
            prev.map((a) => (a.id === 'ART-002' ? { ...a, status: 'extracted' } : a))
          );
          appendOutput([
            { type: 'info', text: `Attempting keyphrase candidate: "${attempt}"…` },
            { type: 'success', text: `PASSPHRASE VERIFIED! Master key derived in 4,120 iterations.` },
            { type: 'success', text: `Volume mounted: /mnt/veracrypt_seized/` },
            { type: 'data', text: `  -> offshore_ledger_transfer_sep26.pdf ($480,000 escrow)` },
            { type: 'data', text: `  -> keycard_clone_hex_dump.bin (Mifare Classic 1K)` },
            { type: 'data', text: `  -> security_patrol_schedules.xlsx (Guard shift hours)` },
          ]);
        } else {
          appendOutput([
            { type: 'info', text: `Initiating hashcat / dictionary attack against VeraCrypt header…` },
            { type: 'error', text: `FAILED: Checksum mismatch for passphrase candidate. (Hint: color-metal-chemical-number)` },
          ]);
        }
        break;

      case 'ip_trace':
        const ip = args[0] || '185.220.101.5';
        appendOutput([
          { type: 'info', text: `Tracing IP route for ${ip}…` },
          { type: 'data', text: 'Hop 1: 10.0.0.1 (Local Gateway)' },
          { type: 'data', text: 'Hop 2: 172.16.4.1 (ISP Border Router)' },
          { type: 'data', text: 'Hop 3: 84.116.130.9 (Equinix Zurich Exchange)' },
          { type: 'data', text: `Hop 4: ${ip} (Destination: Bulletproof VPN / Tor Relay, Zurich, Switzerland)` },
          { type: 'warn', text: 'Target traffic routed through multi-layered onion routing.' },
        ]);
        break;

      case 'packet_sniff':
        appendOutput([
          { type: 'info', text: 'Inspecting intercepted PCAP frames (evil_twin_rogue.pcapng)…' },
          { type: 'data', text: 'Analyzed 14,892 frames. Filter: http.request.method == "POST"' },
          { type: 'warn', text: 'Frame #4829: Rogue captive portal captured cleartext credentials!' },
          { type: 'data', text: '  URL: http://auth.internal-trace.net/login' },
          { type: 'data', text: '  Username: "admin_relay"' },
          { type: 'data', text: '  Auth Token: "dHJhY2Vfc2VjdXJlXzIwMjY="' },
        ]);
        break;

      case 'log':
        const note = args.join(' ');
        if (note && onLogFindingToBench) {
          onLogFindingToBench(`[Cyber Forensics finding] ${note}`);
          appendOutput([
            { type: 'success', text: `Successfully logged finding to contemporaneous bench sheet: "${note}"` },
          ]);
        } else {
          appendOutput([
            { type: 'warn', text: 'Please specify note text: log <finding observation>' },
          ]);
        }
        break;

      default:
        appendOutput([
          { type: 'error', text: `Command not recognized: "${cmd}". Type "help" for available commands.` },
        ]);
        break;
    }
  };

  const handleDecryptModal = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (decryptInput.trim() === 'blue-cobalt-sulfate-2026') {
        setArtifacts((prev) =>
          prev.map((a) => (a.id === 'ART-002' ? { ...a, status: 'extracted' } : a))
        );
        setDecryptNotice('Container successfully unlocked! All encrypted files recovered.');
      } else {
        setDecryptNotice('Incorrect passphrase. Check the forensic word-pattern hint.');
      }
    }, 800);
  };

  return (
    <div className="cyber-terminal-root flex flex-col gap-5">
      {navigate && <InvestigationBreadcrumbs currentView="Cyber Lab" navigate={navigate} />}

      {/* Top Cyber Command Bar */}
      <div className="cyber-header-bar flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-[#a89bc2] rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#f8f6fc] border border-[#d4ceeb] text-[#4338ca]">
            <TerminalIcon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#0f0d1a] tracking-tight">
                DIGITAL FORENSICS &amp; CYBER EXAMINATION
              </h3>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#c1b4d9] border border-[#a89bc2] text-[#0f0d1a]">
                ACTIVE WORKSPACE
              </span>
            </div>
            <p className="text-xs text-[#2c273d] mt-0.5">
              NIST SP 800-86 Forensic Extraction across {evidence.length} physical items &amp; {cases.length} cases
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubView('terminal')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              subView === 'terminal'
                ? 'bg-[#4338ca] text-white shadow-sm'
                : 'bg-[#f8f6fc] text-[#0f0d1a] hover:bg-[#ece7f4] border border-[#d4ceeb]'
            }`}
          >
            <Cpu size={14} />
            <span>CLI Console</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('extractor')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              subView === 'extractor'
                ? 'bg-[#4338ca] text-white shadow-sm'
                : 'bg-[#f8f6fc] text-[#0f0d1a] hover:bg-[#ece7f4] border border-[#d4ceeb]'
            }`}
          >
            <HardDrive size={14} />
            <span>Device Extractor ({artifacts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('osint')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              subView === 'osint'
                ? 'bg-[#4338ca] text-white shadow-sm'
                : 'bg-[#f8f6fc] text-[#0f0d1a] hover:bg-[#ece7f4] border border-[#d4ceeb]'
            }`}
          >
            <Globe size={14} />
            <span>OSINT Dossier</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Interactive Terminal Console */}
      {subView === 'terminal' && (
        <div className="cyber-terminal-card bg-white border border-[#a89bc2] rounded-xl p-5 flex flex-col text-xs shadow-sm overflow-hidden min-h-[480px]">
          {/* Terminal Titlebar */}
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e0f0] mb-3 text-[#4b465c]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="ml-2 text-[#0f0d1a] font-bold font-mono">forensics@trace-workstation: ~</span>
            </div>
            <div className="text-xs font-mono text-[#4b465c] flex items-center gap-2">
              <span>BASH 5.2</span>
              <span>·</span>
              <span className="text-emerald-700 font-bold">SECURE CHANNEL</span>
            </div>
          </div>

          {/* Terminal History Log */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 max-h-[420px] font-mono bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg p-3">
            {history.map((h) => (
              <div
                key={h.id}
                className={`leading-relaxed whitespace-pre-wrap ${
                  h.type === 'cmd'
                    ? 'text-[#4338ca] font-bold'
                    : h.type === 'info'
                    ? 'text-[#0f0d1a]'
                    : h.type === 'success'
                    ? 'text-emerald-900 bg-emerald-100/70 p-1 rounded border-l-2 border-emerald-600 font-semibold'
                    : h.type === 'warn'
                    ? 'text-amber-950 bg-amber-100/70 p-1 rounded border-l-2 border-amber-500 font-semibold'
                    : h.type === 'error'
                    ? 'text-rose-950 bg-rose-100/70 p-1 rounded border-l-2 border-rose-500 font-semibold'
                    : 'text-[#2c273d] pl-2'
                }`}
              >
                {h.text}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Quick Command Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-[#e5e0f0] my-2">
            <span className="text-xs text-[#4b465c] font-semibold">Quick Actions:</span>
            {['help', 'nmap 192.168.1.45', 'whois shadow-drop.net', 'exif scene_photo_04.jpg', 'dump_sim EV-0005', 'ip_trace 185.220.101.5', 'packet_sniff evil_twin.pcap'].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setInputVal(q)}
                className="px-2.5 py-1 text-xs bg-[#f8f6fc] text-[#0f0d1a] hover:bg-[#ece7f4] rounded-md border border-[#d4ceeb] transition-colors font-mono cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Command Input Prompt */}
          <form onSubmit={handleCommand} className="flex items-center gap-2 pt-2 border-t border-[#e5e0f0]">
            <span className="text-[#4338ca] font-mono font-bold">$</span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter forensic command (e.g. nmap, exif, dump_sim, decrypt, ip_trace)…"
              className="flex-1 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg px-3 py-2 outline-none focus:border-[#4338ca] text-[#0f0d1a] placeholder-[#64748b] font-mono text-xs"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#4338ca] hover:bg-[#3730a3] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
            >
              Run Command
            </button>
          </form>
        </div>
      )}

      {/* VIEW 2: Device Extractor & Artifact Inspector */}
      {subView === 'extractor' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Artifact List */}
          <div className="col-span-1 bg-white border border-[#a89bc2] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
            <h4 className="text-xs font-bold text-[#0f0d1a] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[#e5e0f0]">
              <HardDrive size={14} className="text-[#4338ca]" />
              Seized Digital Media ({artifacts.length})
            </h4>

            <div className="flex flex-col gap-2">
              {artifacts.map((art) => (
                <button
                  key={art.id}
                  type="button"
                  onClick={() => setSelectedArtifactId(art.id)}
                  className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                    selectedArtifactId === art.id
                      ? 'border-2 border-[#4338ca] bg-[#fcfaff] shadow-sm ring-1 ring-[#4338ca]/20'
                      : 'border-[#d4ceeb] bg-white hover:bg-[#fbf9fe]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#4338ca]">{art.id}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        art.status === 'extracted'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : art.status === 'analyzed'
                          ? 'bg-[#c1b4d9] text-[#0f0d1a] border border-[#a89bc2]'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {art.status}
                    </span>
                  </div>
                  <strong className="text-xs text-[#0f0d1a] line-clamp-1">{art.title}</strong>
                  <span className="text-[11px] text-[#4b465c] font-mono">Source: {art.sourceItem}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Artifact Details & Preview */}
          <div className="col-span-2 bg-white border border-[#a89bc2] rounded-xl p-5 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e5e0f0] pb-3">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    const match = evidence.find((e) => e.id === activeArtifact.sourceItem);
                    if (match && onOpenRecord) onOpenRecord(match);
                  }}
                  className="text-xs font-mono text-[#4338ca] font-bold hover:underline cursor-pointer flex items-center gap-1.5 text-left"
                >
                  <span>{activeArtifact.id}</span>
                  <span>·</span>
                  <span>Source: {activeArtifact.sourceItem}</span>
                  <span className="text-[10px] font-sans font-medium bg-[#f1edf7] border border-[#d4ceeb] px-1.5 py-0.5 rounded text-[#0f0d1a]">
                    Open Chain-of-Custody ↗
                  </span>
                </button>
                <h3 className="text-base font-bold text-[#0f0d1a] mt-1">{activeArtifact.title}</h3>
              </div>
              <span className="text-xs font-mono text-[#4b465c]">MD5: {activeArtifact.hash}</span>
            </div>

            {/* If SIM Dump */}
            {activeArtifact.type === 'sim_dump' && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3 p-3 bg-[#f8f6fc] border border-[#e5e0f0] rounded-lg text-xs">
                  <div>
                    <span className="text-[#4b465c] block font-semibold">Identified User:</span>
                    <strong className="text-[#0f0d1a]">{activeArtifact.preview.owner as string}</strong>
                  </div>
                  <div>
                    <span className="text-[#4b465c] block font-semibold">IMSI Identifier:</span>
                    <strong className="font-mono text-[#0f0d1a]">{activeArtifact.preview.imsi as string}</strong>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-[#0f0d1a] mb-2">Deleted SMS Messages Recovered from Flash:</h5>
                  <div className="space-y-2">
                    {(activeArtifact.preview.deletedSMS as { time: string; text: string }[]).map((sms, i) => (
                      <div key={i} className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                        <span className="text-xs font-mono text-emerald-800 block mb-1 font-semibold">{sms.time}</span>
                        <p className="font-medium text-emerald-950">{sms.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* If Encrypted Container */}
            {activeArtifact.type === 'encrypted_container' && (
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-[#f8f6fc] border border-[#d4ceeb] rounded-xl text-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#4b465c] font-semibold">Container Cipher:</span>
                    <span className="text-[#4338ca] font-mono font-bold">{activeArtifact.preview.encryption as string}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#4b465c] font-semibold">Key Derivation:</span>
                    <span className="font-mono text-[#0f0d1a]">{activeArtifact.preview.hashAlgorithm as string}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#e5e0f0] pt-2">
                    <span className="text-[#4b465c] font-semibold">Passphrase Hint:</span>
                    <span className="text-amber-800 font-bold">{activeArtifact.preview.hint as string}</span>
                  </div>
                </div>

                {activeArtifact.status === 'locked' ? (
                  <div className="p-4 border border-amber-300 bg-amber-50/70 rounded-xl flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                      <Lock size={16} />
                      <span>Volume Locked with Passphrase</span>
                    </div>
                    <p className="text-xs text-amber-900">
                      Enter dictionary candidate or crack using the 4-token word format:
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. blue-cobalt-sulfate-2026"
                        value={decryptInput}
                        onChange={(e) => setDecryptInput(e.target.value)}
                        className="flex-1 text-xs p-2.5 bg-white border border-amber-300 rounded-lg font-mono text-[#0f0d1a] outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleDecryptModal}
                        disabled={isProcessing}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-[#0f0d1a] font-bold rounded-lg text-xs transition-colors cursor-pointer border border-amber-600"
                      >
                        {isProcessing ? 'Decrypting…' : 'Unlock Container'}
                      </button>
                    </div>
                    {decryptNotice && (
                      <span className="text-xs font-semibold text-[#4338ca]">{decryptNotice}</span>
                    )}
                  </div>
                ) : (
                  <div className="p-4 border border-emerald-300 bg-emerald-50 rounded-xl flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                      <Unlock size={16} />
                      <span>Volume Decrypted: Recovered Evidence Files</span>
                    </div>
                    <ul className="list-disc pl-5 text-xs text-emerald-950 space-y-1">
                      {(activeArtifact.preview.decryptedFiles as string[]).map((f) => (
                        <li key={f} className="font-mono font-bold">{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* If EXIF Data */}
            {activeArtifact.type === 'exif_image' && (
              <div className="flex flex-col gap-3">
                <div className="p-3.5 bg-[#f8f6fc] border border-[#e5e0f0] rounded-lg grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#4b465c] block font-semibold">Camera Equipment:</span>
                    <strong className="text-[#0f0d1a]">{activeArtifact.preview.camera as string}</strong>
                  </div>
                  <div>
                    <span className="text-[#4b465c] block font-semibold">Timestamp:</span>
                    <strong className="text-[#0f0d1a]">{activeArtifact.preview.timestamp as string}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#4b465c] block font-semibold">GPS Coordinates:</span>
                    <strong className="text-[#4338ca] font-mono text-sm">{activeArtifact.preview.gpsCoords as string}</strong>
                    <span className="text-[#2c273d] text-xs block mt-0.5">{activeArtifact.preview.locationName as string}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-950 flex items-center gap-2">
                  <MapPin size={16} className="text-emerald-700" />
                  <span>Geotag coordinates correspond to the point of entry at the conservatory fence line.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: OSINT & Social Profiling */}
      {subView === 'osint' && (
        <div className="bg-white border border-[#a89bc2] rounded-xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#e5e0f0] pb-3">
            <div>
              <h4 className="text-sm font-bold text-[#0f0d1a] flex items-center gap-2">
                <Globe size={16} className="text-[#4338ca]" />
                Open Source Intelligence (OSINT) &amp; Suspect Profile
              </h4>
              <p className="text-xs text-[#2c273d]">
                Correlated intelligence gathered from public registries and network activity.
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#c1b4d9] text-[#0f0d1a]">
              Subject: Julian Paul Vance
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#f8f6fc] border border-[#d4ceeb] rounded-xl flex flex-col gap-2">
              <span className="text-xs font-bold text-[#4338ca] uppercase">Known Aliases</span>
              <ul className="text-xs text-[#0f0d1a] space-y-1">
                <li>• Julian P. Vance</li>
                <li>• &quot;Ghost_404&quot;</li>
                <li>• Orchid_Doc</li>
              </ul>
            </div>

            <div className="p-4 bg-[#f8f6fc] border border-[#d4ceeb] rounded-xl flex flex-col gap-2">
              <span className="text-xs font-bold text-[#4338ca] uppercase">Contact Nodes</span>
              <ul className="text-xs text-[#0f0d1a] space-y-1">
                <li>• Phone: +1 (202) 555-0184</li>
                <li>• Carrier: Verizon Wireless</li>
                <li>• SIM IMSI: 310410192847192</li>
              </ul>
            </div>

            <div className="p-4 bg-[#f8f6fc] border border-[#d4ceeb] rounded-xl flex flex-col gap-2">
              <span className="text-xs font-bold text-[#4338ca] uppercase">Vehicle &amp; Geolocation</span>
              <ul className="text-xs text-[#0f0d1a] space-y-1">
                <li>• Black Audi A4 (Lic #7XYZ99)</li>
                <li>• Cell tower ping: Sector 4B at 02:18 UTC</li>
                <li>• Registered Address: 4410 Willow Creek Rd</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
