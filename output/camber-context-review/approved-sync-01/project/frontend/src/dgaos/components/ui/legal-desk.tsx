'use client';
import { useState, useMemo } from 'react';
import {
  Scale,
  FileCheck,
  AlertCircle,
  Scroll,
  Gavel,
  CheckCircle2
} from 'lucide-react';
import type { LabRecord } from '@/lib/records';
import InvestigationBreadcrumbs from '@/components/ui/investigation-breadcrumbs';

interface LegalDeskProps {
  cases: LabRecord[];
  evidence: LabRecord[];
  exams: LabRecord[];
  reports: LabRecord[];
  onOpenRecord: (record: LabRecord) => void;
  navigate: (view: string) => void;
}

interface JudicialWarrant {
  id: string;
  type: 'search_warrant' | 'subpoena_2703d' | 'pen_register';
  target: string;
  magistrate: string;
  statute: string;
  status: 'Signed & Active' | 'Executed' | 'Drafting';
  issuedDate: string;
  justification: string;
  scopeOfSearch: string[];
}

const INITIAL_WARRANTS: JudicialWarrant[] = [
  {
    id: 'WAR-2026-0881',
    type: 'search_warrant',
    target: 'Residence & Personal Vehicle of Julian Vance (Black Audi A4, Lic #7XYZ99)',
    magistrate: 'Hon. Miriam Vance, U.S. Magistrate Judge',
    statute: 'Fed. R. Crim. P. 41 & 4th Amendment',
    status: 'Signed & Active',
    issuedDate: '2026-09-08 08:30 UTC',
    justification:
      'Probable cause established via recovered SMS timestamp (01:45 UTC), surveillance CCTV vehicle sighting (02:14 UTC), and physical fiber transfer on broken conservatory frame.',
    scopeOfSearch: [
      'Navy blue acrylic fleece outerwear and associated textiles',
      'Electronic computing devices, USB storage drives, and burner phones',
      'Glass cutting tools, pry instruments, and suction lifting equipment',
    ],
  },
  {
    id: 'SUB-2026-0142',
    type: 'subpoena_2703d',
    target: 'Cellular Carrier Telecommunications Relay (Sector 4B Tower)',
    magistrate: 'Assistant United States Attorney',
    statute: '18 U.S.C. § 2703(d) Stored Communications Act',
    status: 'Executed',
    issuedDate: '2026-09-08 04:15 UTC',
    justification:
      'Specific and articulable facts demonstrating reasonable grounds that tower handoff logs are relevant and material to an ongoing felony burglary investigation.',
    scopeOfSearch: [
      'Call detail records (CDR) for device IMSI #310410192847192',
      'Azimuth cell tower handoffs between 01:00 UTC and 03:30 UTC',
    ],
  },
];

export function LegalDesk({
  cases,
  evidence,
  exams,
  reports,
  onOpenRecord,
  navigate,
}: LegalDeskProps) {
  const [selectedWarrantId, setSelectedWarrantId] = useState<string>('WAR-2026-0881');
  const [indictmentSubmitted, setIndictmentSubmitted] = useState(false);

  const activeCase = cases[0] || null;

  // Compute Prosecution Legal Sufficiency Score
  const legalSufficiency = useMemo(() => {
    let score = 0;
    const criteria: { name: string; met: boolean; points: number; note: string }[] = [];

    // Criterion 1: Intact physical evidence chain of custody
    const intactCount = evidence.filter((e) => e.data.seal === 'Intact').length;
    const custodyIntact = evidence.length > 0 && intactCount === evidence.length;
    criteria.push({
      name: 'Chain of Custody Continuity & Integrity',
      met: custodyIntact,
      points: 25,
      note: custodyIntact
        ? 'All physical evidence maintains unbroken intake seals and documented lockers.'
        : 'Some items exhibit packaging concerns requiring supervisor review.',
    });
    if (custodyIntact) score += 25;

    // Criterion 2: Physical Lab association (Completed examination)
    const completedExam = exams.some((ex) => ex.data.status === 'Completed');
    criteria.push({
      name: 'Forensic Laboratory Analytical Support',
      met: completedExam,
      points: 25,
      note: completedExam
        ? 'Examinations confirm physical consistency (Fiber trilobal match & glass morphology).'
        : 'Examinations are still in progress; pending formal conclusions.',
    });
    if (completedExam) score += 25;

    // Criterion 3: Signed Certificate of Analysis (Independent Technical Review)
    const approvedReport = reports.some((r) => ['Approved', 'Issued'].includes(r.data.status));
    criteria.push({
      name: 'Independent Technical Peer Review Sign-Off',
      met: approvedReport,
      points: 25,
      note: approvedReport
        ? 'Report RP-2026-0001 verified and signed by independent technical reviewer.'
        : 'Report remains in draft or awaiting reviewer sign-off.',
    });
    if (approvedReport) score += 25;

    // Criterion 4: Debunked Alibi & Digital Evidence
    const hasDigitalCorroboration = true; // Burner SMS + EXIF timestamp
    criteria.push({
      name: 'Alibi Rebuttal & Digital Corroboration',
      met: hasDigitalCorroboration,
      points: 25,
      note: 'Burner phone SMS and EXIF timestamp contradict suspect claimed sleeping alibi.',
    });
    if (hasDigitalCorroboration) score += 25;

    return {
      score,
      criteria,
      isGrandJuryReady: score >= 75,
    };
  }, [evidence, exams, reports]);

  const activeWarrant = useMemo(
    () => INITIAL_WARRANTS.find((w) => w.id === selectedWarrantId) || INITIAL_WARRANTS[0],
    [selectedWarrantId]
  );

  return (
    <div className="legal-desk-root flex flex-col gap-5">
      <InvestigationBreadcrumbs currentView="Legal & Warrants" navigate={navigate} />

      {/* Legal Hero Banner */}
      <div className="legal-hero-bar p-5 bg-white rounded-xl border border-[#a89bc2] text-[#0f0d1a] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#f8f6fc] border border-[#d4ceeb] text-[#4338ca]">
            <Scale size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight text-[#0f0d1a]">
                JUDICIAL WARRANTS &amp; PROSECUTION DESK
              </h3>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#c1b4d9] border border-[#a89bc2] text-[#0f0d1a]">
                BURDEN OF PROOF EVALUATION
              </span>
            </div>
            <p className="text-xs text-[#2c273d] mt-0.5">
              Constitutional Fourth Amendment Warrants, 2703(d) Orders, and Grand Jury Indictment Sufficiency
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[16px] font-black text-[#4338ca] font-mono">
              {legalSufficiency.score}%
            </div>
            <span className="text-[10px] uppercase font-bold text-[#4b465c] tracking-wider">
              Legal Sufficiency
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIndictmentSubmitted(true)}
            disabled={!legalSufficiency.isGrandJuryReady || indictmentSubmitted}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
              indictmentSubmitted
                ? 'bg-emerald-700 text-white cursor-default'
                : legalSufficiency.isGrandJuryReady
                ? 'bg-[#4338ca] hover:bg-[#3730a3] text-white'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            <Gavel size={14} />
            <span>{indictmentSubmitted ? 'Indictment Filed' : 'File Indictment Package'}</span>
          </button>
        </div>
      </div>

      {indictmentSubmitted && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>
              <strong>Case Formally Referred to District Attorney &amp; Grand Jury.</strong> Probable cause threshold met with verified physical, chemical, and digital forensics corroboration.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIndictmentSubmitted(false)}
            className="text-[11px] text-emerald-800 underline font-semibold"
          >
            Dismiss notice
          </button>
        </div>
      )}

      {/* Main Legal Columns */}
      <div className="grid grid-cols-3 gap-5">
        {/* Left 2 Columns: Warrants & Judicial Orders */}
        <div className="col-span-2 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Scroll size={18} className="text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Judicial Warrants &amp; Court Authorizations ({INITIAL_WARRANTS.length})
                </h4>
              </div>
              <div className="flex items-center gap-1.5">
                {INITIAL_WARRANTS.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setSelectedWarrantId(w.id)}
                    className={`px-2.5 py-1 text-xs font-mono font-bold rounded ${
                      selectedWarrantId === w.id
                        ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {w.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Warrant Parchment Card */}
            <div className="p-6 rounded-xl border-2 border-slate-300 bg-amber-50/40 flex flex-col gap-4 relative overflow-hidden font-serif">
              {/* Judicial Seal Watermark */}
              <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
                <Scale size={120} />
              </div>

              <div className="flex items-center justify-between border-b border-amber-900/20 pb-3">
                <div>
                  <span className="text-[11px] font-sans font-bold uppercase tracking-widest text-slate-500">
                    UNITED STATES DISTRICT COURT · SPECIAL PROCEEDINGS
                  </span>
                  <h3 className="text-[13.5px] font-bold text-slate-900 tracking-tight">
                    {activeWarrant.type === 'search_warrant'
                      ? 'WARRANT FOR SEARCH AND SEIZURE'
                      : 'ORDER FOR STORED COMMUNICATIONS RECORD'}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-sans font-bold border border-emerald-300">
                  {activeWarrant.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-sans text-slate-800">
                <div>
                  <span className="text-slate-500 font-bold block">TARGET PREMISES / PERSON:</span>
                  <span className="font-semibold text-slate-900">{activeWarrant.target}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">PRESIDING MAGISTRATE:</span>
                  <span className="font-semibold text-slate-900">{activeWarrant.magistrate}</span>
                </div>
              </div>

              <div className="text-xs font-sans">
                <span className="text-slate-500 font-bold block mb-1">FACTUAL BASIS &amp; PROBABLE CAUSE:</span>
                <p className="p-3 bg-white/80 rounded border border-amber-900/15 text-slate-800 leading-relaxed italic">
                  &ldquo;{activeWarrant.justification}&rdquo;
                </p>
              </div>

              <div className="text-xs font-sans">
                <span className="text-slate-500 font-bold block mb-1">AUTHORIZED SCOPE OF SEIZURE:</span>
                <ul className="list-disc pl-5 space-y-1 text-slate-800">
                  {activeWarrant.scopeOfSearch.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-amber-900/20 text-xs font-sans text-slate-600">
                <span>Statute: {activeWarrant.statute}</span>
                <span className="font-mono">Issued: {activeWarrant.issuedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Burden of Proof & Legal Sufficiency Checklist */}
        <div className="col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
          <div className="border-b pb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <FileCheck size={16} className="text-indigo-600" />
              <span>Prosecution Sufficiency Matrix</span>
            </h4>
            <p className="text-xs text-slate-500">
              Evaluates evidentiary weight before filing criminal indictment.
            </p>
          </div>

          <div className="space-y-3">
            {legalSufficiency.criteria.map((c, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border text-xs flex flex-col gap-1 ${
                  c.met
                    ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950'
                    : 'border-amber-200 bg-amber-50/50 text-amber-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold">
                    {c.met ? (
                      <CheckCircle2 size={14} className="text-emerald-600" />
                    ) : (
                      <AlertCircle size={14} className="text-amber-600" />
                    )}
                    <span>{c.name}</span>
                  </div>
                  <span className="font-bold font-mono">+{c.points}%</span>
                </div>
                <p className="text-[11px] text-slate-600 pl-5">{c.note}</p>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 border rounded-lg text-xs flex flex-col gap-2 mt-auto">
            <div className="flex items-center justify-between font-bold">
              <span>Grand Jury Standard:</span>
              <span className={legalSufficiency.isGrandJuryReady ? 'text-emerald-700' : 'text-amber-700'}>
                {legalSufficiency.isGrandJuryReady ? 'PASSED (75%+)' : 'INSUFFICIENT'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Requires continuous chain of custody, independent scientific peer review, and alibi rebuttal.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 mt-1">
              <button
                type="button"
                onClick={() => navigate('Examinations')}
                className="text-[11px] text-indigo-700 hover:underline font-semibold"
              >
                Lab Examinations →
              </button>
              {activeCase && (
                <button
                  type="button"
                  onClick={() => onOpenRecord(activeCase)}
                  className="text-[11px] text-indigo-700 hover:underline font-semibold"
                >
                  Case {activeCase.id} →
                </button>
              )}
            </div>

            {legalSufficiency.isGrandJuryReady && (
              <button
                type="button"
                onClick={() => navigate('Courtroom Trial')}
                className="w-full mt-2 py-2.5 bg-[#4338ca] hover:bg-[#3730a3] rounded-lg text-xs font-bold text-white shadow-sm transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <Gavel size={13} />
                <span>Commence Courtroom Trial & Cross-Examination ➔</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
