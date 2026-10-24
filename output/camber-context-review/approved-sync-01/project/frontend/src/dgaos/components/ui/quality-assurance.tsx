'use client';
import { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Wrench,
  FlaskConical,
  Award,
  FileCheck,
  Plus,
  Microscope,
  RotateCcw
} from 'lucide-react';
import type { LabRecord } from '@/lib/records';

interface QualityAssuranceProps {
  records: LabRecord[];
  cases: LabRecord[];
  evidence: LabRecord[];
  exams: LabRecord[];
  reports: LabRecord[];
  onOpenRecord: (record: LabRecord) => void;
  onPlanExamination?: (evidenceRecord: LabRecord) => void;
  navigate: (view: string) => void;
}

type QualityTab = 'audit' | 'equipment' | 'proficiency' | 'car';

interface EquipmentItem {
  id: string;
  name: string;
  model: string;
  serial: string;
  standard: string;
  lastCalibrated: string;
  nextDue: string;
  status: 'calibrated' | 'due' | 'maintenance';
}

interface ReagentLot {
  id: string;
  name: string;
  lotNumber: string;
  prepDate: string;
  expiryDate: string;
  qcBlankVerified: boolean;
  analyst: string;
}

interface CarRecord {
  id: string;
  title: string;
  discipline: string;
  severity: 'Critical' | 'Major' | 'Minor';
  status: 'Open' | 'In remediation' | 'Resolved & Verified';
  dateOpened: string;
  rootCause: string;
  correctiveAction: string;
  assignedQualityManager: string;
}

const INITIAL_EQUIPMENT: EquipmentItem[] = [
  {
    id: 'EQ-MIC-01',
    name: 'Dual-Stage Comparison Microscope',
    model: 'Leica FS CB Dual-Bridge System',
    serial: 'SN-482019-DE',
    standard: 'NIST Traceable Stage Micrometer 0.01mm (Cal #821/28091)',
    lastCalibrated: '2026-08-28',
    nextDue: '2027-02-28',
    status: 'calibrated',
  },
  {
    id: 'EQ-ALS-01',
    name: 'Forensic Alternate Light Source (ALS)',
    model: 'Foster + Freeman Crime-Lite 82S Multi-Band',
    serial: 'SN-772104-UK',
    standard: 'Radiometric Flux & Wavelength Peak Standard (365nm / 450nm)',
    lastCalibrated: '2026-08-15',
    nextDue: '2026-11-15',
    status: 'calibrated',
  },
  {
    id: 'EQ-BAL-01',
    name: 'Analytical Semi-Micro Balance',
    model: 'Mettler Toledo XPE-205 (0.01mg)',
    serial: 'SN-910482-CH',
    standard: 'Class E2 Calibration Weight Set (10mg - 100g NIST cert)',
    lastCalibrated: '2026-09-01',
    nextDue: '2026-10-01',
    status: 'calibrated',
  },
  {
    id: 'EQ-UV-01',
    name: 'Ultraviolet-Visible Spectrophotometer',
    model: 'Shimadzu UV-2600i Double-Beam',
    serial: 'SN-630112-JP',
    standard: 'Holmium Oxide Glass & Potassium Dichromate Solution',
    lastCalibrated: '2026-07-10',
    nextDue: '2026-10-10',
    status: 'calibrated',
  },
];

const INITIAL_REAGENT_LOTS: ReagentLot[] = [
  {
    id: 'LOT-MRQ-01',
    name: 'Marquis Reagent (Formaldehyde / H₂SO₄)',
    lotNumber: 'LOT-2026-04A',
    prepDate: '2026-08-01',
    expiryDate: '2026-11-01',
    qcBlankVerified: true,
    analyst: 'Dr. Evelyn Cross, QC Chemist',
  },
  {
    id: 'LOT-KM-01',
    name: 'Kastle-Meyer Phenolphthalein Working Solution',
    lotNumber: 'LOT-2026-08B',
    prepDate: '2026-08-20',
    expiryDate: '2026-10-20',
    qcBlankVerified: true,
    analyst: 'M. Vance, Serology Lead',
  },
  {
    id: 'LOT-SCOTT-01',
    name: 'Cobalt Thiocyanate (Scott Test Reagent)',
    lotNumber: 'LOT-2026-02C',
    prepDate: '2026-07-15',
    expiryDate: '2026-10-15',
    qcBlankVerified: true,
    analyst: 'Dr. Evelyn Cross, QC Chemist',
  },
  {
    id: 'LOT-GRIESS-01',
    name: 'Modified Griess Reagent (Nitrite Test)',
    lotNumber: 'LOT-2026-05A',
    prepDate: '2026-08-10',
    expiryDate: '2026-11-10',
    qcBlankVerified: true,
    analyst: 'H. Tanaka, Firearms Specialist',
  },
  {
    id: 'LOT-AP-01',
    name: 'Acid Phosphatase / Fast Blue B Solution',
    lotNumber: 'LOT-2026-09A',
    prepDate: '2026-09-02',
    expiryDate: '2026-09-16',
    qcBlankVerified: true,
    analyst: 'M. Vance, Serology Lead',
  },
];

const INITIAL_CARS: CarRecord[] = [
  {
    id: 'CAR-2026-001',
    title: 'Secondary Evidence Container Seal Integrity Discrepancy',
    discipline: 'Evidence Control & Intake',
    severity: 'Major',
    status: 'Resolved & Verified',
    dateOpened: '2026-08-12',
    rootCause: 'Submitting agency used standard cellophane tape instead of tamper-evident forensic security tape.',
    correctiveAction: 'Item was resealed with red tamper-evident tape, initialed across boundary, and documented in custody audit log.',
    assignedQualityManager: 'Sarah Jenkins, QA Director',
  },
  {
    id: 'CAR-2026-002',
    title: 'Reagent Dropper Cross-Contamination Prevention Protocol',
    discipline: 'Chemical Spot Tests',
    severity: 'Minor',
    status: 'Resolved & Verified',
    dateOpened: '2026-08-24',
    rootCause: 'Potential risk of dropper tip contact with sample aliquot in depression well.',
    correctiveAction: 'Updated Standard Operating Procedure (SOP-CH-04): Dropper tip must maintain minimum 15mm vertical clearance above spot well.',
    assignedQualityManager: 'Sarah Jenkins, QA Director',
  },
];

export function QualityAssurance({
  records,
  cases,
  evidence,
  exams,
  reports,
  onOpenRecord,
  navigate,
}: QualityAssuranceProps) {
  const [activeTab, setActiveTab] = useState<QualityTab>('audit');
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(INITIAL_EQUIPMENT);
  const [reagentList, setReagentList] = useState<ReagentLot[]>(INITIAL_REAGENT_LOTS);
  const [carList, setCarList] = useState<CarRecord[]>(INITIAL_CARS);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [newCarTitle, setNewCarTitle] = useState('');
  const [newCarDiscipline, setNewCarDiscipline] = useState('Comparative Trace');
  const [newCarSeverity, setNewCarSeverity] = useState<'Critical' | 'Major' | 'Minor'>('Minor');
  const [newCarRootCause, setNewCarRootCause] = useState('');
  const [newCarAction, setNewCarAction] = useState('');
  const [showCarModal, setShowCarModal] = useState(false);

  // Live ISO 17025 Compliance Computations
  const auditAnalysis = useMemo(() => {
    // Check 1: Intake seal integrity
    const intactCount = evidence.filter((e) => e.data.seal === 'Intact').length;
    const sealRate = evidence.length > 0 ? (intactCount / evidence.length) * 100 : 100;

    // Check 2: Custody continuity logs
    const custodyLoggedCount = evidence.filter((e) => (e.data.custody || []).length > 0).length;
    const custodyRate = evidence.length > 0 ? (custodyLoggedCount / evidence.length) * 100 : 100;

    // Check 3: Observations segregated from conclusions
    const completeExams = exams.filter((ex) => ex.data.status === 'Completed');
    const segregatedCount = completeExams.filter((ex) => {
      const obs = (ex.data.observations || '').trim();
      const conc = (ex.data.conclusion || '').trim();
      return obs.length > 0 && conc.length > 0 && obs !== conc;
    }).length;
    const segregationRate = completeExams.length > 0 ? (segregatedCount / completeExams.length) * 100 : 100;

    // Check 4: Explicit method limitations recorded
    const limitedCount = completeExams.filter((ex) => (ex.data.limitations || '').trim().length > 10).length;
    const limitationRate = completeExams.length > 0 ? (limitedCount / completeExams.length) * 100 : 100;

    // Check 5: Independent technical review for approved/issued reports
    const finalizedReports = reports.filter((r) => ['Approved', 'Issued'].includes(r.data.status));
    const reviewedCount = finalizedReports.filter((r) => {
      const reviewer = (r.data.reviewer || '').trim();
      const author = (r.data.author || '').trim();
      return reviewer.length > 0 && reviewer.toLowerCase() !== author.toLowerCase();
    }).length;
    const reviewRate = finalizedReports.length > 0 ? (reviewedCount / finalizedReports.length) * 100 : 100;

    // Overall composite audit score
    const totalScore = Math.round(
      (sealRate * 0.2) +
      (custodyRate * 0.2) +
      (segregationRate * 0.2) +
      (limitationRate * 0.2) +
      (reviewRate * 0.2)
    );

    return {
      totalScore,
      sealRate: Math.round(sealRate),
      custodyRate: Math.round(custodyRate),
      segregationRate: Math.round(segregationRate),
      limitationRate: Math.round(limitationRate),
      reviewRate: Math.round(reviewRate),
      compromisedSeals: evidence.filter((e) => e.data.seal !== 'Intact'),
      missingCustody: evidence.filter((e) => (e.data.custody || []).length === 0),
      unreviewedReports: reports.filter((r) => r.data.status === 'In review'),
      unlimitedExams: completeExams.filter((ex) => !(ex.data.limitations || '').trim()),
    };
  }, [evidence, exams, reports]);

  const handleRunAudit = () => {
    setIsScanning(true);
    setScanMessage('Scanning database records against ISO/IEC 17025:2017 accreditation checklist…');
    setTimeout(() => {
      setIsScanning(false);
      setScanMessage('Audit completed. All live workspace records synchronized.');
      setTimeout(() => setScanMessage(''), 4000);
    }, 900);
  };

  const handleCalibrateEquipment = (id: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setEquipmentList((prev) =>
      prev.map((eq) =>
        eq.id === id
          ? {
              ...eq,
              lastCalibrated: today,
              nextDue: '2027-03-01',
              status: 'calibrated',
            }
          : eq
      )
    );
  };

  const handleVerifyReagent = (id: string) => {
    setReagentList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, qcBlankVerified: true } : r))
    );
  };

  const handleCreateCar = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newCarTitle.trim()) return;

    const newEntry: CarRecord = {
      id: `CAR-2026-00${carList.length + 1}`,
      title: newCarTitle.trim(),
      discipline: newCarDiscipline,
      severity: newCarSeverity,
      status: 'In remediation',
      dateOpened: new Date().toISOString().slice(0, 10),
      rootCause: newCarRootCause.trim() || 'Identified during contemporaneous audit.',
      correctiveAction: newCarAction.trim() || 'Remediation protocol initiated.',
      assignedQualityManager: 'Sarah Jenkins, QA Director',
    };

    setCarList([newEntry, ...carList]);
    setNewCarTitle('');
    setNewCarRootCause('');
    setNewCarAction('');
    setShowCarModal(false);
  };

  return (
    <div className="quality-root">
      {/* Hero Banner */}
      <div className="quality-hero-card">
        <div className="quality-hero-left">
          <div className="quality-emblem">
            <ShieldCheck size={28} />
          </div>
          <div className="quality-title-block">
            <h2>Quality Assurance &amp; ISO/IEC 17025 Accreditation</h2>
            <p>
              Forensic Quality Management System (QMS) compliant with ISO/IEC 17025:2017 and FBI Quality Assurance Standards across {cases.length} active case{cases.length === 1 ? '' : 's'} and {records.length} total laboratory records.
            </p>
          </div>
        </div>

        <div className="quality-hero-metrics">
          <div className="hero-score-ring">
            <div className="hero-score-number">{auditAnalysis.totalScore}%</div>
            <div className="hero-score-label">ISO 17025 Audit Score</div>
          </div>
          <button
            type="button"
            onClick={handleRunAudit}
            disabled={isScanning}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#4338ca] hover:bg-[#3730a3] text-white flex items-center gap-1.5 transition-all cursor-pointer flex-shrink-0 shadow-sm"
          >
            <RefreshCw size={13} className={isScanning ? 'animate-spin' : ''} />
            <span>{isScanning ? 'Auditing…' : 'Run Workspace Audit'}</span>
          </button>
        </div>
      </div>

      {scanMessage && (
        <div className="info-strip flex items-center gap-2 bg-[#f8f6fc] border border-[#d4ceeb] text-[#4338ca] text-xs py-2 px-3 rounded-lg font-medium">
          <Sparkles size={14} className="text-[#4338ca]" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="quality-tabs-nav">
        <button
          type="button"
          className={`quality-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <ShieldCheck size={16} />
          <span>ISO 17025 Compliance Audit</span>
        </button>

        <button
          type="button"
          className={`quality-tab-btn ${activeTab === 'equipment' ? 'active' : ''}`}
          onClick={() => setActiveTab('equipment')}
        >
          <Wrench size={16} />
          <span>Equipment &amp; Reagent QC Registry</span>
        </button>

        <button
          type="button"
          className={`quality-tab-btn ${activeTab === 'proficiency' ? 'active' : ''}`}
          onClick={() => setActiveTab('proficiency')}
        >
          <Award size={16} />
          <span>Proficiency Testing (CTS) &amp; Competency</span>
        </button>

        <button
          type="button"
          className={`quality-tab-btn ${activeTab === 'car' ? 'active' : ''}`}
          onClick={() => setActiveTab('car')}
        >
          <AlertCircle size={16} />
          <span>Corrective Actions ({carList.length})</span>
        </button>
      </div>

      {/* TAB 1: Live ISO 17025 Audit Scanner */}
      {activeTab === 'audit' && (
        <div className="qa-audit-grid">
          {/* Main Checklist */}
          <div className="qa-card">
            <div className="qa-card-header">
              <h3>
                <FileCheck size={16} className="text-[#4338ca]" />
                <span>Forensic Quality Checkpoints (5-Point Audit)</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Scope: ANAB #FT-0491</span>
            </div>

            <div className="qa-checklist">
              {/* Checkpoint 1 */}
              <div className={`qa-check-row ${auditAnalysis.sealRate === 100 ? 'passed' : 'warning'}`}>
                <div className="qa-check-left">
                  <div className="qa-check-icon">
                    {auditAnalysis.sealRate === 100 ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                      <ShieldAlert size={16} className="text-amber-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="qa-check-title">1. Intake Packaging &amp; Tamper Seal Integrity</h4>
                    <p className="qa-check-desc">
                      All evidence items must arrive with unbroken manufacturer or investigator tamper tape initialed across boundaries.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`qa-check-badge ${auditAnalysis.sealRate === 100 ? 'passed' : 'warning'}`}>
                    {auditAnalysis.sealRate}% Compliant
                  </span>
                </div>
              </div>

              {/* Checkpoint 2 */}
              <div className={`qa-check-row ${auditAnalysis.custodyRate === 100 ? 'passed' : 'warning'}`}>
                <div className="qa-check-left">
                  <div className="qa-check-icon">
                    {auditAnalysis.custodyRate === 100 ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                      <ShieldAlert size={16} className="text-amber-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="qa-check-title">2. Chain of Custody Continuous Ledger</h4>
                    <p className="qa-check-desc">
                      Every specimen must record the submitting party, intake technician, current custodian, and secure vault locker.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`qa-check-badge ${auditAnalysis.custodyRate === 100 ? 'passed' : 'warning'}`}>
                    {auditAnalysis.custodyRate}% Compliant
                  </span>
                </div>
              </div>

              {/* Checkpoint 3 */}
              <div className={`qa-check-row ${auditAnalysis.segregationRate === 100 ? 'passed' : 'warning'}`}>
                <div className="qa-check-left">
                  <div className="qa-check-icon">
                    {auditAnalysis.segregationRate === 100 ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                      <ShieldAlert size={16} className="text-amber-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="qa-check-title">3. Observation-to-Interpretation Segregation</h4>
                    <p className="qa-check-desc">
                      Contemporaneous physical observations must be documented distinct from interpretive source attributions.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`qa-check-badge ${auditAnalysis.segregationRate === 100 ? 'passed' : 'warning'}`}>
                    {auditAnalysis.segregationRate}% Compliant
                  </span>
                </div>
              </div>

              {/* Checkpoint 4 */}
              <div className={`qa-check-row ${auditAnalysis.limitationRate === 100 ? 'passed' : 'warning'}`}>
                <div className="qa-check-left">
                  <div className="qa-check-icon">
                    {auditAnalysis.limitationRate === 100 ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                      <ShieldAlert size={16} className="text-amber-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="qa-check-title">4. Analytical Constraints &amp; Method Boundaries</h4>
                    <p className="qa-check-desc">
                      Examinations must explicitly state sample limitations, destructive boundaries, and alternative scientific hypotheses.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`qa-check-badge ${auditAnalysis.limitationRate === 100 ? 'passed' : 'warning'}`}>
                    {auditAnalysis.limitationRate}% Compliant
                  </span>
                </div>
              </div>

              {/* Checkpoint 5 */}
              <div className={`qa-check-row ${auditAnalysis.reviewRate === 100 ? 'passed' : 'warning'}`}>
                <div className="qa-check-left">
                  <div className="qa-check-icon">
                    {auditAnalysis.reviewRate === 100 ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                      <ShieldAlert size={16} className="text-amber-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="qa-check-title">5. Independent Technical &amp; Administrative Review</h4>
                    <p className="qa-check-desc">
                      Certificates of Analysis must be reviewed and approved by a qualified examiner other than the primary author.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`qa-check-badge ${auditAnalysis.reviewRate === 100 ? 'passed' : 'warning'}`}>
                    {auditAnalysis.reviewRate}% Compliant
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Items & Discrepancies Panel */}
          <div className="qa-card flex flex-col justify-between">
            <div>
              <div className="qa-card-header">
                <h3>
                  <AlertCircle size={16} className="text-amber-400" />
                  <span>Action Items &amp; Audit Flags</span>
                </h3>
                <span className="text-xs text-gray-500 font-mono">
                  {auditAnalysis.compromisedSeals.length + auditAnalysis.unreviewedReports.length} Flagged
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {auditAnalysis.compromisedSeals.length === 0 &&
                auditAnalysis.unreviewedReports.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <CheckCircle2 size={32} className="text-emerald-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-900">No active non-conformances</p>
                    <p className="text-xs text-gray-600 mt-1">All records meet standard ISO 17025 criteria.</p>
                  </div>
                ) : (
                  <>
                    {auditAnalysis.compromisedSeals.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg border border-amber-300 bg-amber-50 flex items-start justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                            <ShieldAlert size={14} />
                            <span>Seal Concern: {item.id}</span>
                          </div>
                          <p className="text-xs text-gray-800 mt-1">{item.data.title}</p>
                          <p className="text-[11px] text-amber-800 font-mono mt-0.5">Status: {item.data.seal}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenRecord(item)}
                          className="px-2.5 py-1 text-xs font-bold rounded bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 cursor-pointer"
                        >
                          Inspect
                        </button>
                      </div>
                    ))}

                    {auditAnalysis.unreviewedReports.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg border border-purple-200 bg-purple-50 flex items-start justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
                            <Clock size={14} />
                            <span>Awaiting Review: {item.id}</span>
                          </div>
                          <p className="text-xs text-gray-800 mt-1">{item.data.title}</p>
                          <p className="text-[11px] text-gray-600 mt-0.5">Author: {item.data.author || 'Analyst'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenRecord(item)}
                          className="px-2.5 py-1 text-xs font-bold rounded bg-purple-100 text-purple-900 border border-purple-300 hover:bg-purple-200 cursor-pointer"
                        >
                          Review
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-4 text-xs">
              <button
                type="button"
                onClick={() => navigate('Evidence')}
                className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 text-xs cursor-pointer transition-colors"
              >
                Inspect Evidence Room →
              </button>
              <button
                type="button"
                onClick={() => navigate('Reports')}
                className="text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 text-xs cursor-pointer transition-colors"
              >
                Technical Reviews →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Equipment & Reagent QC Registry */}
      {activeTab === 'equipment' && (
        <div className="flex flex-col gap-5">
          {/* Equipment Registry */}
          <div className="qa-card">
            <div className="qa-card-header">
              <h3>
                <Microscope size={16} className="text-purple-700" />
                <span>Forensic Analytical Instrumentation &amp; Calibration Registry</span>
              </h3>
              <span className="text-xs text-gray-500">NIST Traceable Standards</span>
            </div>

            <div className="overflow-x-auto">
              <table className="equipment-table">
                <thead>
                  <tr>
                    <th>Equipment ID</th>
                    <th>Instrument &amp; Model</th>
                    <th>Calibration Standard</th>
                    <th>Last Calibrated</th>
                    <th>Next Due</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentList.map((eq) => (
                    <tr key={eq.id}>
                      <td className="font-mono font-bold text-xs text-purple-900">{eq.id}</td>
                      <td>
                        <div className="font-semibold text-xs text-gray-900">{eq.name}</div>
                        <div className="text-[11px] text-gray-500">{eq.model} · {eq.serial}</div>
                      </td>
                      <td className="text-xs text-gray-600">{eq.standard}</td>
                      <td className="text-xs font-mono">{eq.lastCalibrated}</td>
                      <td className="text-xs font-mono">{eq.nextDue}</td>
                      <td>
                        <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          In Calibration
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleCalibrateEquipment(eq.id)}
                          className="px-2 py-1 text-xs font-semibold rounded bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 flex items-center gap-1"
                        >
                          <CheckCircle2 size={12} /> Log Cal
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reagent QC Working Solutions */}
          <div className="qa-card">
            <div className="qa-card-header">
              <h3>
                <FlaskConical size={16} className="text-purple-700" />
                <span>Chemical Reagents &amp; Working Solution Quality Control Lots</span>
              </h3>
              <span className="text-xs text-gray-500">ISO 17025 §6.4 Reagent Controls</span>
            </div>

            <div className="overflow-x-auto">
              <table className="equipment-table">
                <thead>
                  <tr>
                    <th>Lot Number</th>
                    <th>Reagent Description</th>
                    <th>Preparation Date</th>
                    <th>Expiration</th>
                    <th>Negative QC Blank</th>
                    <th>QC Analyst</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reagentList.map((r) => (
                    <tr key={r.id}>
                      <td className="font-mono font-bold text-xs text-purple-900">{r.lotNumber}</td>
                      <td className="font-semibold text-xs text-gray-900">{r.name}</td>
                      <td className="text-xs font-mono">{r.prepDate}</td>
                      <td className="text-xs font-mono">{r.expiryDate}</td>
                      <td>
                        {r.qcBlankVerified ? (
                          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                            <CheckCircle2 size={11} /> Verified Clear
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                            <AlertCircle size={11} /> Blank Pending
                          </span>
                        )}
                      </td>
                      <td className="text-xs text-gray-600">{r.analyst}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleVerifyReagent(r.id)}
                          className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200"
                        >
                          Verify Blank
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CTS Proficiency Trials & Competency */}
      {activeTab === 'proficiency' && (
        <div className="flex flex-col gap-5">
          <div className="qa-card">
            <div className="qa-card-header">
              <h3>
                <Award size={16} className="text-purple-700" />
                <span>Collaborative Testing Services (CTS) Forensic Proficiency Rounds</span>
              </h3>
              <span className="text-xs text-gray-500">External Blind &amp; Open Testing</span>
            </div>

            <div className="cts-trial-grid">
              <div className="cts-trial-card">
                <div className="cts-trial-top">
                  <span className="cts-round-pill">CTS-26-541</span>
                  <span className="px-2 py-0.5 text-[10.5px] font-bold rounded bg-emerald-100 text-emerald-800">
                    Consensus Match
                  </span>
                </div>
                <h4>Forensic Glass Refractive Index &amp; Annealing</h4>
                <div className="cts-trial-meta">
                  <span>Discipline: Trace Evidence (Materials)</span>
                  <span>Method: Oil Immersion GRIM / Becke Line Analysis</span>
                  <span>Analyst: Lab Analyst (Verified by Peer Review)</span>
                </div>
              </div>

              <div className="cts-trial-card">
                <div className="cts-trial-top">
                  <span className="cts-round-pill">CTS-26-582</span>
                  <span className="px-2 py-0.5 text-[10.5px] font-bold rounded bg-emerald-100 text-emerald-800">
                    Verified
                  </span>
                </div>
                <h4>Controlled Substances Chemical Spot Screening</h4>
                <div className="cts-trial-meta">
                  <span>Discipline: Forensic Chemistry</span>
                  <span>Method: Marquis, Scott, &amp; Duquenois-Levine</span>
                  <span>Analyst: Dr. Evelyn Cross</span>
                </div>
              </div>

              <div className="cts-trial-card">
                <div className="cts-trial-top">
                  <span className="cts-round-pill">CTS-26-590</span>
                  <span className="px-2 py-0.5 text-[10.5px] font-bold rounded bg-purple-100 text-purple-800">
                    In Testing
                  </span>
                </div>
                <h4>Automotive Paint Stratigraphy &amp; Flake Morphology</h4>
                <div className="cts-trial-meta">
                  <span>Discipline: Trace Evidence (Paint)</span>
                  <span>Method: Comparative Cross-Section Microscopy</span>
                  <span>Analyst: Active Bench Workstation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Random Re-analysis Audit Sampling */}
          <div className="qa-card">
            <div className="qa-card-header">
              <h3>
                <RotateCcw size={16} className="text-purple-700" />
                <span>Internal Blind Re-Analysis Audit Program (5% Random Sampling)</span>
              </h3>
              <span className="text-xs text-gray-500">ISO 17025 §7.7.1 Monitoring Quality</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-3">
              To ensure reproducibility and eliminate cognitive confirmation bias, 5% of all closed cases and completed examinations are randomly selected for duplicate independent re-analysis by an alternate qualified examiner.
            </p>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200 text-xs text-purple-900">
              <Sparkles size={16} className="text-purple-600" />
              <span>
                Current Sampling Queue: <strong>1 blind sample selected</strong> from active cases. Current reproducibility concordance rate: <strong>100%</strong>.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Corrective Action Requests (CAR/NCR) */}
      {activeTab === 'car' && (
        <div className="qa-card">
          <div className="qa-card-header">
            <h3>
              <AlertCircle size={16} className="text-purple-700" />
              <span>Corrective Action Requests (CAR) &amp; Non-Conformance Reports</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowCarModal(true)}
              className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-1 shadow-sm"
            >
              <Plus size={13} />
              <span>File Corrective Action Request</span>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {carList.map((car) => (
              <div
                key={car.id}
                className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/70 hover:bg-white transition-all flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-purple-900">{car.id}</span>
                    <span className="font-semibold text-sm text-gray-900">{car.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10.5px] font-bold rounded ${
                        car.severity === 'Critical'
                          ? 'bg-red-100 text-red-800'
                          : car.severity === 'Major'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {car.severity}
                    </span>
                    <span className="px-2 py-0.5 text-[10.5px] font-bold rounded bg-emerald-100 text-emerald-800">
                      {car.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-gray-700 mt-1">
                  <div>
                    <strong className="text-gray-900">Root Cause:</strong> {car.rootCause}
                  </div>
                  <div>
                    <strong className="text-gray-900">Corrective Action Taken:</strong> {car.correctiveAction}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-200 pt-2 mt-1">
                  <span>Discipline: {car.discipline} · Opened: {car.dateOpened}</span>
                  <span>QA Oversight: {car.assignedQualityManager}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Filing New CAR */}
      {showCarModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 border border-gray-200 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle size={18} className="text-purple-600" />
                File Corrective Action Request (CAR)
              </h3>
              <button
                type="button"
                onClick={() => setShowCarModal(false)}
                className="text-gray-400 hover:text-gray-700 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCar} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  <span>Non-Conformance Title / Finding</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Working solution expiration labeling discrepancy"
                    value={newCarTitle}
                    onChange={(e) => setNewCarTitle(e.target.value)}
                    className="w-full text-xs p-2 border rounded border-gray-300 focus:outline-purple-600 mt-1 font-normal"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    <span>Discipline</span>
                    <select
                      value={newCarDiscipline}
                      onChange={(e) => setNewCarDiscipline(e.target.value)}
                      className="w-full text-xs p-2 border rounded border-gray-300 mt-1 font-normal"
                    >
                      <option value="Comparative Trace">Comparative Trace</option>
                      <option value="Controlled Substances">Controlled Substances</option>
                      <option value="Questioned Documents">Questioned Documents</option>
                      <option value="Biological Screening">Biological Screening</option>
                      <option value="Evidence Control">Evidence Control</option>
                    </select>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    <span>Severity</span>
                    <select
                      value={newCarSeverity}
                      onChange={(e) => setNewCarSeverity(e.target.value as 'Critical' | 'Major' | 'Minor')}
                      className="w-full text-xs p-2 border rounded border-gray-300 mt-1 font-normal"
                    >
                      <option value="Minor">Minor Documentation Gap</option>
                      <option value="Major">Major Procedural Variance</option>
                      <option value="Critical">Critical Quality Compromise</option>
                    </select>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  <span>Root Cause Investigation</span>
                  <textarea
                    rows={2}
                    placeholder="Describe direct failure mechanisms and underlying contributing factors…"
                    value={newCarRootCause}
                    onChange={(e) => setNewCarRootCause(e.target.value)}
                    className="w-full text-xs p-2 border rounded border-gray-300 focus:outline-purple-600 mt-1 font-normal"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  <span>Corrective &amp; Preventive Action (CAPA)</span>
                  <textarea
                    rows={2}
                    placeholder="Immediate remedial action and updated SOP controls to prevent recurrence…"
                    value={newCarAction}
                    onChange={(e) => setNewCarAction(e.target.value)}
                    className="w-full text-xs p-2 border rounded border-gray-300 focus:outline-purple-600 mt-1 font-normal"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t mt-1">
                <button
                  type="button"
                  onClick={() => setShowCarModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-bold bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  File CAR Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
