'use client';
import { useState, useMemo, useEffect } from 'react';
import {
  HeartPulse,
  FileCheck,
  FolderKanban,
  Microscope,
  Scale,
  Thermometer,
  ShieldCheck,
  FlaskConical,
  CheckCircle2,
  Syringe,
  Plus,
  Download,
  User,
  Activity,
  RotateCcw,
  Edit3,
  X,
  Package,
  Barcode,
  ClipboardList,
  Check,
  Info,
} from 'lucide-react';
import InvestigationBreadcrumbs from '@/components/ui/investigation-breadcrumbs';
import {
  getActiveCaseData,
  exportCaseAsJson,
  addVaccineToSubject,
  addDiagnosticTestToSubject,
  updateIntakeRecord,
  resetToDefaultCase,
  getCaseCatalog,
  loadCaseById,
} from '@/lib/case-store';
import type {
  FullCaseData,
  SubjectMedicalProfile,
  DiagnosticTestRecord,
  MedicalIntakeRecord,
} from '@/lib/case-schema';

interface MorgueProps {
  navigate: (view: string) => void;
}

export default function Morgue({ navigate }: MorgueProps) {
  const [caseData, setCaseData] = useState<FullCaseData>(() => getActiveCaseData());
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('SUBJ-001');
  const [activeTab, setActiveTab] = useState<'intake' | 'vaccines' | 'tests' | 'trauma' | 'pmi' | 'certificate'>('intake');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [selectedTraumaId, setSelectedTraumaId] = useState<string>('TR-03');
  const [exportNotice, setExportNotice] = useState<string>('');

  // Modals for editing/adding data
  const [isAddVaccineOpen, setIsAddVaccineOpen] = useState(false);
  const [isAddTestOpen, setIsAddTestOpen] = useState(false);
  const [isEditIntakeOpen, setIsEditIntakeOpen] = useState(false);

  // New Vaccine Form State
  const [newVaccineForm, setNewVaccineForm] = useState({
    vaccineName: '',
    targetPathogen: '',
    dateAdministered: new Date().toISOString().split('T')[0],
    facility: 'University Occupational Health Service',
    administrator: 'RN M. Simmons, OCN',
    manufacturer: 'Merck & Co.',
    lotNumber: 'LOT-' + Math.floor(1000 + Math.random() * 9000),
    doseNumber: 1,
    route: 'Intramuscular (Deltoid)',
    status: 'Verified' as const,
    titerResult: 'Antibody Titer Protective',
    evidentiaryRelevance: 'Documented workplace immunization verification.',
  });

  // New Diagnostic Test Form State
  const [newTestForm, setNewTestForm] = useState({
    category: 'Toxicology' as DiagnosticTestRecord['category'],
    testName: '',
    specimen: 'Peripheral Blood' as DiagnosticTestRecord['specimen'],
    quantitativeResult: '',
    referenceRange: 'None Detected',
    methodology: 'High-Res Q-TOF LC-MS/MS',
    flag: 'NORMAL' as DiagnosticTestRecord['flag'],
    clinicalInterpretation: '',
    instrumentId: 'AGILENT-6545-QTOF',
    verifiedBy: 'Dr. Rebecca Lin, MD, FCAP',
  });

  // Edit Intake Form State
  const [editIntakeForm, setEditIntakeForm] = useState<Partial<MedicalIntakeRecord>>({});

  // Sync active subject
  const currentSubject: SubjectMedicalProfile = useMemo(() => {
    return (
      caseData.medical.subjects.find((s) => s.subjectId === selectedSubjectId) ||
      caseData.medical.subjects[0]
    );
  }, [caseData, selectedSubjectId]);

  // Populate edit intake form when subject changes
  useEffect(() => {
    if (currentSubject?.intake) {
      setEditIntakeForm(currentSubject.intake);
    }
  }, [currentSubject]);

  // Auto-select first test if none selected
  useEffect(() => {
    if (currentSubject?.diagnosticTests && currentSubject.diagnosticTests.length > 0) {
      setSelectedTestId(currentSubject.diagnosticTests[0].id);
    }
  }, [currentSubject]);

  // Filtered diagnostic tests
  const filteredTests = useMemo(() => {
    if (!currentSubject.diagnosticTests) return [];
    if (selectedCategoryFilter === 'All') return currentSubject.diagnosticTests;
    return currentSubject.diagnosticTests.filter((t) => t.category === selectedCategoryFilter);
  }, [currentSubject, selectedCategoryFilter]);

  const selectedTest = useMemo(() => {
    return currentSubject.diagnosticTests?.find((t) => t.id === selectedTestId) || filteredTests[0];
  }, [currentSubject, selectedTestId, filteredTests]);

  const selectedTrauma = useMemo(() => {
    if (!currentSubject.traumaPoints || currentSubject.traumaPoints.length === 0) return null;
    return currentSubject.traumaPoints.find((t) => t.id === selectedTraumaId) || currentSubject.traumaPoints[0];
  }, [currentSubject, selectedTraumaId]);

  // Handlers
  const handleExportJson = () => {
    exportCaseAsJson(caseData);
    setExportNotice(`Case JSON exported: ${caseData.meta.caseNumber}.json`);
    setTimeout(() => setExportNotice(''), 4000);
  };

  const handleResetCase = () => {
    if (window.confirm('Reset all case modifications to master default?')) {
      const def = resetToDefaultCase();
      setCaseData(def);
      setExportNotice('Case reset to default master record.');
      setTimeout(() => setExportNotice(''), 3000);
    }
  };

  const handleSaveNewVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaccineForm.vaccineName.trim()) return;
    const updated = addVaccineToSubject(currentSubject.subjectId, newVaccineForm, caseData);
    setCaseData(updated);
    setIsAddVaccineOpen(false);
    setExportNotice(`Immunization record added: ${newVaccineForm.vaccineName}`);
    setTimeout(() => setExportNotice(''), 3000);
  };

  const handleSaveNewTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestForm.testName.trim()) return;
    const updated = addDiagnosticTestToSubject(currentSubject.subjectId, newTestForm, caseData);
    setCaseData(updated);
    setIsAddTestOpen(false);
    setExportNotice(`Diagnostic test recorded: ${newTestForm.testName}`);
    setTimeout(() => setExportNotice(''), 3000);
  };

  const catalog = useMemo(() => getCaseCatalog(), []);

  const handleSwitchCase = (caseId: string) => {
    const loaded = loadCaseById(caseId);
    setCaseData(loaded);
    if (loaded.medical.subjects.length > 0) {
      setSelectedSubjectId(loaded.medical.subjects[0].subjectId);
    }
    setExportNotice(`Switched to Case: ${loaded.meta.title}`);
    setTimeout(() => setExportNotice(''), 3500);
  };

  const handleSaveIntake = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateIntakeRecord(currentSubject.subjectId, editIntakeForm, caseData);
    setCaseData(updated);
    setIsEditIntakeOpen(false);
    setExportNotice('Medical intake details updated.');
    setTimeout(() => setExportNotice(''), 3000);
  };

  return (
    <div className="forensic-morgue-page space-y-6">
      <InvestigationBreadcrumbs currentView="Forensic Morgue" navigate={navigate} />

      {/* Export / System Notification Banner */}
      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-950 font-medium shadow-xs">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-emerald-700" />
            <span>{exportNotice}</span>
          </div>
          <button type="button" onClick={() => setExportNotice('')} className="text-emerald-700 hover:text-emerald-950 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Master Forensic Medical Header */}
      <div className="p-5 bg-white border border-[#a89bc2] rounded-xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5 text-[#0f0d1a]">
        <div>
          <div className="flex items-center gap-3 text-xs font-bold text-[#4338ca] mb-1 tracking-wider uppercase flex-wrap">
            <div className="flex items-center gap-1.5">
              <HeartPulse size={15} />
              <span>OFFICE OF THE CHIEF MEDICAL EXAMINER · FORENSIC PATHOLOGY</span>
            </div>
            <span className="text-[#a89bc2]">|</span>
            {/* Case Dossier Bank Selector */}
            <div className="flex items-center gap-1.5 text-[#0f0d1a]">
              <span className="text-xs text-[#4b465c] uppercase font-bold">CASE DOSSIER:</span>
              <select
                value={caseData.meta.id}
                onChange={(e) => handleSwitchCase(e.target.value)}
                className="bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#0f0d1a] focus:outline-none focus:border-[#4338ca]"
              >
                {catalog.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} · {c.title} ({c.difficulty})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <h1 className="text-[18px] font-bold text-[#0f0d1a] tracking-tight flex items-center gap-3 flex-wrap mt-1">
            <span>{caseData.meta.title}</span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-rose-100 border border-rose-300 text-rose-800 uppercase tracking-wider">
              MANNER: {currentSubject.deathCertificate?.mannerOfDeath || 'HOMICIDE'}
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-[#c1b4d9] border border-[#a89bc2] text-[#0f0d1a]">
              {caseData.meta.caseNumber}
            </span>
          </h1>
          <p className="text-[11px] text-[#2c273d] mt-1">
            Pathologist: <span className="font-semibold text-[#0f0d1a]">{caseData.meta.medicalExaminer}</span> · Received: {currentSubject.intake.intakeTimestamp} · Facility: District Morgue Bay 1
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] font-semibold transition-colors cursor-pointer"
            title="Download full structured case JSON with all medical, evidence, and trial data"
          >
            <Download size={13} className="text-[#4338ca]" />
            <span>Export Case JSON</span>
          </button>
          <button
            type="button"
            onClick={handleResetCase}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#d4ceeb] rounded-lg text-[#4b465c] hover:text-[#0f0d1a] transition-colors cursor-pointer"
            title="Reset to default planned case"
          >
            <RotateCcw size={13} />
          </button>
          <button
            type="button"
            onClick={() => navigate('Laboratory')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] font-semibold transition-colors cursor-pointer"
          >
            <FlaskConical size={13} className="text-[#4338ca]" />
            <span>Send Scrapes to Lab</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('certificate')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#4338ca] hover:bg-[#3730a3] rounded-lg text-xs font-bold text-white transition-colors cursor-pointer shadow-sm"
          >
            <Scale size={13} />
            <span>Certificate of Death</span>
          </button>
        </div>
      </div>

      {/* Subject Switcher Bar */}
      <div className="flex items-center justify-between p-3.5 bg-white border border-[#a89bc2] rounded-xl flex-wrap gap-3 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <User size={15} className="text-[#4338ca]" />
          <span className="font-bold uppercase text-[#4b465c] tracking-wider">Examined Subject:</span>
          <div className="flex items-center gap-2">
            {caseData.medical.subjects.map((subj) => (
              <button
                key={subj.subjectId}
                type="button"
                onClick={() => {
                  setSelectedSubjectId(subj.subjectId);
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedSubjectId === subj.subjectId
                    ? 'bg-[#4338ca] text-white shadow-xs'
                    : 'bg-[#f8f6fc] text-[#0f0d1a] hover:bg-[#ece7f4] border border-[#d4ceeb]'
                }`}
              >
                {subj.intake.name} ({subj.intake.subjectType})
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-[#2c273d]">
          <span>Intake ID: <strong className="text-[#0f0d1a] font-mono">{currentSubject.intake.intakeId}</strong></span>
          <span>Blood: <strong className="text-[#4338ca]">{currentSubject.intake.bloodType}</strong></span>
          <span>Age: <strong className="text-[#0f0d1a]">{currentSubject.intake.age} YOA</strong></span>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-white border border-[#a89bc2] shadow-sm">
          <div className="text-[10px] uppercase text-[#4b465c] font-bold mb-1">Subject Profile</div>
          <div className="text-sm font-bold text-[#0f0d1a]">{currentSubject.intake.name}</div>
          <div className="text-xs text-[#4b465c] mt-0.5">
            {currentSubject.intake.subjectType} · Age {currentSubject.intake.age} ({currentSubject.intake.gender})
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#a89bc2] shadow-sm">
          <div className="text-[10px] uppercase text-amber-700 font-bold mb-1">Time of Death (PMI)</div>
          <div className="text-sm font-bold text-[#0f0d1a]">
            {currentSubject.pmiModel ? currentSubject.pmiModel.calculatedDeathWindow : 'Not Applicable (Living Subject)'}
          </div>
          <div className="text-xs text-[#4b465c] mt-0.5">
            {currentSubject.pmiModel ? 'Corroborated by Algor Mortis & K+' : 'Custodial Clinical Exam'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#a89bc2] shadow-sm">
          <div className="text-[10px] uppercase text-rose-700 font-bold mb-1">Primary Toxicology</div>
          <div className="text-sm font-bold text-[#0f0d1a]">
            {currentSubject.diagnosticTests.find((t) => t.category === 'Toxicology')?.quantitativeResult || 'Pending Toxicology'}
          </div>
          <div className="text-xs text-[#4b465c] mt-0.5">
            {currentSubject.diagnosticTests.find((t) => t.category === 'Toxicology')?.testName || 'Screen in progress'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#a89bc2] shadow-sm">
          <div className="text-[10px] uppercase text-[#4338ca] font-bold mb-1">Immunization Record</div>
          <div className="text-sm font-bold text-[#0f0d1a]">
            {currentSubject.vaccines.length} Vaccines Documented
          </div>
          <div className="text-xs text-[#4b465c] mt-0.5">Occupational &amp; Serology Cleared</div>
        </div>
      </div>

      {/* Master Module Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#f8f6fc] border border-[#d4ceeb] rounded-xl overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('intake')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'intake'
              ? 'bg-[#4338ca] text-white font-bold shadow-xs'
              : 'text-[#4b465c] hover:text-[#0f0d1a]'
          }`}
        >
          <ClipboardList size={13} />
          <span>Admission &amp; Custody Intake</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vaccines')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'vaccines'
              ? 'bg-[#4338ca] text-white font-bold shadow-xs'
              : 'text-[#4b465c] hover:text-[#0f0d1a]'
          }`}
        >
          <Syringe size={13} />
          <span>Vaccine &amp; Immunization History ({currentSubject.vaccines.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tests')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'tests'
              ? 'bg-[#4338ca] text-white font-bold shadow-xs'
              : 'text-[#4b465c] hover:text-[#0f0d1a]'
          }`}
        >
          <FlaskConical size={13} />
          <span>Diagnostic &amp; Laboratory Tests ({currentSubject.diagnosticTests.length})</span>
        </button>

        {currentSubject.traumaPoints && currentSubject.traumaPoints.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('trauma')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'trauma'
                ? 'bg-[#4338ca] text-white font-bold shadow-xs'
                : 'text-[#4b465c] hover:text-[#0f0d1a]'
            }`}
          >
            <Activity size={13} />
            <span>Anatomical Trauma Points ({currentSubject.traumaPoints.length})</span>
          </button>
        )}

        {currentSubject.pmiModel && (
          <button
            type="button"
            onClick={() => setActiveTab('pmi')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pmi'
                ? 'bg-[#4338ca] text-white font-bold shadow-xs'
                : 'text-[#4b465c] hover:text-[#0f0d1a]'
            }`}
          >
            <Thermometer size={13} />
            <span>PMI &amp; Cooling Model</span>
          </button>
        )}

        {currentSubject.deathCertificate && (
          <button
            type="button"
            onClick={() => setActiveTab('certificate')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'certificate'
                ? 'bg-[#4338ca] text-white font-bold shadow-xs'
                : 'text-[#4b465c] hover:text-[#0f0d1a]'
            }`}
          >
            <FileCheck size={13} />
            <span>Form ME-99 Certificate</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ADMISSION & CUSTODY INTAKE                                         */}
      {/* ========================================================================= */}
      {activeTab === 'intake' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#e5e0f0]">
            <div>
              <h2 className="text-sm font-bold text-[#0f0d1a] uppercase tracking-wide">
                Case Intake &amp; Custody Register
              </h2>
              <p className="text-xs text-[#2c273d]">
                Statutory registration under District Medical Examiner and Forensic Clinical Jurisdiction
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditIntakeOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8f6fc] hover:bg-[#ece7f4] border border-[#d4ceeb] rounded-lg text-xs font-semibold text-[#0f0d1a] transition-colors cursor-pointer"
            >
              <Edit3 size={13} className="text-[#4338ca]" />
              <span>Edit Intake Data</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 7 cols: Demographics, Transport, and Triage */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 bg-white border border-[#a89bc2] rounded-xl shadow-sm space-y-3">
                <div className="text-xs font-bold text-[#4338ca] uppercase tracking-wide flex items-center gap-2">
                  <User size={14} />
                  <span>Subject Identification &amp; Demographics</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-[#f8f6fc] border border-[#e5e0f0] rounded-lg">
                    <span className="text-[#4b465c] block text-[10px] uppercase font-bold">FULL NAME</span>
                    <strong className="text-[#0f0d1a]">{currentSubject.intake.name}</strong>
                  </div>
                  <div className="p-3 bg-[#f8f6fc] border border-[#e5e0f0] rounded-lg">
                    <span className="text-[#4b465c] block text-[10px] uppercase font-bold">SUBJECT STATUS</span>
                    <strong className="text-rose-700">{currentSubject.intake.subjectType}</strong>
                  </div>
                  <div className="p-3 bg-[#f8f6fc] border border-[#e5e0f0] rounded-lg">
                    <span className="text-[#4b465c] block text-[10px] uppercase font-bold">AGE / DOB</span>
                    <strong className="text-[#0f0d1a]">{currentSubject.intake.age} YOA ({currentSubject.intake.dob})</strong>
                  </div>
                  <div className="p-3 bg-[#f8f6fc] border border-[#e5e0f0] rounded-lg">
                    <span className="text-[#4b465c] block text-[10px] uppercase font-bold">BLOOD GROUP / RH</span>
                    <strong className="text-[#4338ca]">{currentSubject.intake.bloodType}</strong>
                  </div>
                  <div className="p-3 bg-[#f8f6fc] border border-[#e5e0f0] rounded-lg">
                    <span className="text-[#4b465c] block text-[10px] uppercase font-bold">HEIGHT / WEIGHT</span>
                    <strong className="text-[#0f0d1a]">{currentSubject.intake.heightCm} cm / {currentSubject.intake.weightKg} kg</strong>
                  </div>
                  <div className="p-3 bg-[#f8f6fc] border border-[#e5e0f0] rounded-lg">
                    <span className="text-[#4b465c] block text-[10px] uppercase font-bold">BARCODE ID</span>
                    <strong className="text-[#4338ca] font-mono flex items-center gap-1">
                      <Barcode size={13} /> {currentSubject.intake.wristbandBarcode}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Transport & Custody Continuity */}
              <div className="p-5 bg-white border border-[#a89bc2] rounded-xl shadow-sm space-y-3">
                <div className="text-xs font-bold text-[#4338ca] uppercase tracking-wide flex items-center gap-2">
                  <Package size={14} />
                  <span>Transport Continuity &amp; Evidence Seal Status</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#f8f6fc] border border-[#e5e0f0] rounded-lg">
                    <span className="text-[#4b465c] block text-[10px] uppercase font-bold">TRANSPORT AGENCY</span>
                    <strong className="text-[#0f0d1a]">{currentSubject.intake.transportAgency} ({currentSubject.intake.transportUnit})</strong>
                  </div>
                  <div className="p-3 bg-[#f8f6fc] border border-[#e5e0f0] rounded-lg">
                    <span className="text-[#4b465c] block text-[10px] uppercase font-bold">RECEIVING TECHNICIAN</span>
                    <strong className="text-[#0f0d1a]">{currentSubject.intake.receivingTechnician}</strong>
                  </div>
                  <div className="p-3 bg-[#f8f6fc] border border-[#e5e0f0] rounded-lg">
                    <span className="text-[#4b465c] block text-[10px] uppercase font-bold">BODY BAG / INTAKE SEAL</span>
                    <strong className="text-[#0f0d1a] font-mono">{currentSubject.intake.bodyBagSealNumber || 'N/A (Living subject)'}</strong>
                  </div>
                  <div className="p-3 bg-[#f8f6fc] border border-[#e5e0f0] rounded-lg">
                    <span className="text-[#4b465c] block text-[10px] uppercase font-bold">SEAL CONDITION</span>
                    <span className="text-emerald-700 font-bold uppercase">{currentSubject.intake.bodyBagSealCondition || 'Intact'}</span>
                  </div>
                </div>
              </div>

              {/* Initial Triage Vitals */}
              <div className="p-5 bg-white border border-[#a89bc2] rounded-xl shadow-sm space-y-3">
                <div className="text-xs font-bold text-[#4338ca] uppercase tracking-wide flex items-center gap-2">
                  <Activity size={14} />
                  <span>Initial Triage &amp; Clinical Presentation</span>
                </div>
                <div className="space-y-2.5 text-xs bg-[#f8f6fc] p-3.5 rounded-lg border border-[#e5e0f0]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#4b465c] font-semibold">Presentation Vital Status:</span>
                    <span className="font-bold text-rose-700">{currentSubject.intake.initialTriageVitals.vitalStatus}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#4b465c] font-semibold">Core Temp at Scene:</span>
                    <span className="font-bold text-[#0f0d1a]">{currentSubject.intake.initialTriageVitals.bodyTempC} °C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#4b465c] font-semibold">Pupillary Assessment:</span>
                    <span className="text-[#0f0d1a]">{currentSubject.intake.initialTriageVitals.pupils}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#4b465c] font-semibold">Post-Mortem Lividity:</span>
                    <span className="text-[#0f0d1a]">{currentSubject.intake.initialTriageVitals.lividity}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#4b465c] font-semibold">Muscular Rigidity (Rigor):</span>
                    <span className="text-[#0f0d1a]">{currentSubject.intake.initialTriageVitals.rigor}</span>
                  </div>
                  {currentSubject.intake.initialTriageVitals.pronouncementTime && (
                    <div className="flex items-center justify-between pt-1.5 border-t border-[#e5e0f0]">
                      <span className="text-[#4b465c] font-semibold">Field Pronouncement:</span>
                      <span className="text-[#4338ca] font-medium">{currentSubject.intake.initialTriageVitals.pronouncementTime} by {currentSubject.intake.initialTriageVitals.pronouncingPhysician}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right 5 cols: Personal Property Inventory & Clinical Notes */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 bg-white border border-[#a89bc2] rounded-xl shadow-sm space-y-3">
                <div className="text-xs font-bold text-[#0f0d1a] uppercase tracking-wide flex items-center justify-between">
                  <span>Personal Belongings Inventory</span>
                  <span className="text-xs text-[#4b465c]">{currentSubject.intake.belongingsInventory.length} Items Logged</span>
                </div>
                <div className="space-y-2">
                  {currentSubject.intake.belongingsInventory.map((item, idx) => (
                    <div key={idx} className="p-3 bg-[#f8f6fc] border border-[#e5e0f0] rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-[#0f0d1a]">{item.item}</strong>
                        {item.evidentiaryValue ? (
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-100 border border-amber-300 text-amber-900">
                            EVIDENTIARY
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 text-[#4b465c]">
                            PERSONAL
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#2c273d]">{item.description}</p>
                      <div className="text-[11px] text-[#4338ca] font-medium">Storage: {item.custodyLocker}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admission Notes */}
              <div className="p-5 bg-white border border-[#a89bc2] rounded-xl shadow-sm space-y-2">
                <div className="text-xs font-bold text-[#4338ca] uppercase tracking-wide">
                  Pathologist Clinical Intake Notes
                </div>
                <div className="p-3.5 bg-[#f8f6fc] border border-[#e5e0f0] rounded-lg text-xs text-[#2c273d] leading-relaxed">
                  {currentSubject.intake.clinicalNotes}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VACCINE & IMMUNIZATION HISTORY                                     */}
      {/* ========================================================================= */}
      {activeTab === 'vaccines' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#e5e0f0] flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#0f0d1a] uppercase tracking-wider flex items-center gap-2">
                <Syringe size={15} className="text-[#4338ca]" />
                <span>Immunization Schedule & Clinical Serology Dossier</span>
              </h2>
              <p className="text-xs text-[#4b465c]">
                Verified occupational vaccines, antibody serology, and evidentiary pathology cross-references
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddVaccineOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4338ca] hover:bg-[#3730a3] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus size={13} />
              <span>Record New Vaccine Dose</span>
            </button>
          </div>

          {/* Vaccine Data Table */}
          <div className="bg-white border border-[#a89bc2] rounded-xl p-4 overflow-x-auto shadow-sm">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[#4b465c] border-b border-[#e5e0f0]">
                  <th className="pb-2.5 font-bold">VACCINE / ANTIGEN</th>
                  <th className="pb-2.5 font-bold">TARGET PATHOGEN</th>
                  <th className="pb-2.5 font-bold">DATE / CLINIC</th>
                  <th className="pb-2.5 font-bold">MANUFACTURER & LOT</th>
                  <th className="pb-2.5 font-bold">SEROLOGY / TITER</th>
                  <th className="pb-2.5 font-bold">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e0f0]">
                {currentSubject.vaccines.map((v) => (
                  <tr key={v.id} className="hover:bg-[#f8f6fc] text-[#0f0d1a]">
                    <td className="py-3 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[#4338ca] text-[11px]">[{v.id}]</span>
                        <span>{v.vaccineName}</span>
                      </div>
                      <span className="text-[11px] text-[#4b465c] block font-normal mt-0.5">
                        Dose #{v.doseNumber} · {v.route}
                      </span>
                    </td>
                    <td className="py-3 text-[#2c273d]">{v.targetPathogen}</td>
                    <td className="py-3 text-[#2c273d]">
                      <div>{v.dateAdministered}</div>
                      <small className="text-[10px] text-[#6b6680] block">{v.facility}</small>
                    </td>
                    <td className="py-3 text-[#2c273d]">
                      <div>{v.manufacturer}</div>
                      <span className="text-[10px] text-[#4338ca] font-mono">Lot: {v.lotNumber}</span>
                    </td>
                    <td className="py-3 text-amber-800 font-medium">
                      {v.titerResult || 'Presumed Immune'}
                    </td>
                    <td className="py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-50 border border-emerald-300 text-emerald-800">
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Evidentiary Relevance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-[#a89bc2] rounded-xl shadow-sm space-y-2">
              <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
                <Info size={14} />
                <span>Forensic Significance of Vaccine History</span>
              </div>
              <div className="space-y-2">
                {currentSubject.vaccines.map((v) => (
                  <div key={v.id} className="p-2.5 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-xs">
                    <strong className="text-[#4338ca] block mb-0.5">{v.vaccineName} Relevance:</strong>
                    <p className="text-[#2c273d] leading-relaxed">{v.evidentiaryRelevance}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white border border-[#a89bc2] rounded-xl shadow-sm space-y-3">
              <div className="text-xs font-bold text-[#4338ca] uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={14} />
                <span>Serological Differential Exclusions</span>
              </div>
              <div className="p-3 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-xs text-[#2c273d] space-y-2 leading-relaxed">
                <p>
                  <strong>Tetanus Exclusion:</strong> Current serum Tetanus Antitoxin IgG at 1.45 IU/mL confirms full neutralization capacity against Clostridium tetani tetanospasmin, confirming decedent's neuromuscular paralysis was not of bacterial soil origin.
                </p>
                <p>
                  <strong>Biosafety Level 3 Access:</strong> Hepatitis B series and routine annual booster verification proves decedent maintained active institutional clearance to the secure Botanical Cryo-Vault.
                </p>
                <p>
                  <strong>Absence of Antidote Prophylaxis:</strong> Serology confirms absence of any antemortem administration of anticholinesterase agents or synthetic atropine derivatives.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DIAGNOSTIC & LABORATORY TESTS                                      */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* TAB 3: DIAGNOSTIC & LABORATORY TESTS                                      */}
      {/* ========================================================================= */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#e5e0f0] flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#0f0d1a] uppercase tracking-wider flex items-center gap-2">
                <FlaskConical size={15} className="text-[#4338ca]" />
                <span>Forensic Laboratory Diagnostics & Clinical Pathology</span>
              </h2>
              <p className="text-xs text-[#4b465c]">
                Toxicology (LC-MS/MS, GC-FID), Hematology, Vitreous Chemistry, Botanical PCR & DNA Electrophoresis
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddTestOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4338ca] hover:bg-[#3730a3] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus size={13} />
              <span>Order Diagnostic Assay</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['All', 'Toxicology', 'Hematology', 'Chemistry & Metabolic', 'Vitreous Humor', 'Microbiology & PCR', 'Forensic Serology & DNA', 'Questioned Documents', 'Materials & Trace Metallurgy'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategoryFilter === cat
                    ? 'bg-[#c1b4d9] text-[#0f0d1a] border border-[#a89bc2] font-bold shadow-xs'
                    : 'bg-white text-[#4b465c] hover:bg-[#f8f6fc] border border-[#d4ceeb]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Test Table & Inspector Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Table: 8 cols */}
            <div className="lg:col-span-8 bg-white border border-[#a89bc2] rounded-xl p-4 overflow-x-auto shadow-sm">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[#4b465c] border-b border-[#e5e0f0]">
                    <th className="pb-2.5 font-bold">ASSAY / TEST</th>
                    <th className="pb-2.5 font-bold">SPECIMEN</th>
                    <th className="pb-2.5 font-bold">QUANTITATIVE RESULT</th>
                    <th className="pb-2.5 font-bold">FLAG</th>
                    <th className="pb-2.5 font-bold">METHOD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e0f0]">
                  {filteredTests.map((test) => {
                    const isSelected = test.id === selectedTest?.id;
                    return (
                      <tr
                        key={test.id}
                        onClick={() => setSelectedTestId(test.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#c1b4d9]/40 text-[#0f0d1a] font-medium' : 'hover:bg-[#f8f6fc] text-[#0f0d1a]'
                        }`}
                      >
                        <td className="py-3 font-medium text-[#0f0d1a]">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#4338ca] font-mono text-[11px] font-bold">{test.id}</span>
                            <span>{test.testName}</span>
                          </div>
                          <span className="text-[10px] text-[#6b6680] block">{test.category}</span>
                        </td>
                        <td className="py-3 text-[#2c273d]">{test.specimen}</td>
                        <td className="py-3 font-bold text-[#0f0d1a]">{test.quantitativeResult}</td>
                        <td className="py-3">
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              test.flag === 'CRITICAL_LETHAL'
                                ? 'bg-rose-50 border border-rose-300 text-rose-800'
                                : test.flag === 'POSITIVE'
                                ? 'bg-amber-50 border border-amber-300 text-amber-900'
                                : test.flag === 'HIGH'
                                ? 'bg-amber-50/80 border border-amber-300 text-amber-800'
                                : 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                            }`}
                          >
                            {test.flag}
                          </span>
                        </td>
                        <td className="py-3 text-[#4b465c]">{test.methodology}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Inspector Panel: 4 cols */}
            <div className="lg:col-span-4 bg-white border border-[#a89bc2] rounded-xl p-4 shadow-sm space-y-3">
              {selectedTest ? (
                <>
                  <div className="flex items-center justify-between pb-2 border-b border-[#e5e0f0]">
                    <span className="text-xs font-bold text-[#0f0d1a] uppercase tracking-wider">
                      Diagnostic Finding Detail
                    </span>
                    <span className="text-[10px] font-mono text-[#4338ca] bg-[#f8f6fc] px-2 py-0.5 rounded border border-[#d4ceeb]">
                      {selectedTest.instrumentId}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#0f0d1a]">{selectedTest.testName}</h3>

                  <div className="p-3 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#4b465c]">Specimen Source:</span>
                      <strong className="text-[#0f0d1a]">{selectedTest.specimen}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#4b465c]">Quantitative Reading:</span>
                      <strong className="text-[#4338ca] font-mono">{selectedTest.quantitativeResult}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#4b465c]">Standard Ref Range:</span>
                      <span className="text-[#2c273d]">{selectedTest.referenceRange}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#4b465c]">Analytical Method:</span>
                      <span className="text-[#2c273d]">{selectedTest.methodology}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#4b465c]">Verified By:</span>
                      <span className="text-[#2c273d]">{selectedTest.verifiedBy}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-xs space-y-1">
                    <strong className="text-amber-800 uppercase text-[10px] block font-bold">CLINICAL & FORENSIC INTERPRETATION:</strong>
                    <p className="text-[#2c273d] leading-relaxed">{selectedTest.clinicalInterpretation}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('Laboratory')}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#4338ca] hover:bg-[#3730a3] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <Microscope size={13} />
                    <span>Mount in Laboratory Instruments</span>
                  </button>
                </>
              ) : (
                <div className="text-center py-10 text-xs text-[#6b6680]">
                  Select a diagnostic test to inspect findings.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ANATOMICAL TRAUMA MAPPING                                          */}
      {/* ========================================================================= */}
      {activeTab === 'trauma' && currentSubject.traumaPoints && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            {currentSubject.traumaPoints.map((trauma) => {
              const isSelected = trauma.id === selectedTraumaId;
              return (
                <button
                  key={trauma.id}
                  type="button"
                  onClick={() => setSelectedTraumaId(trauma.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-2 border-[#4338ca] shadow-md ring-2 ring-[#c1b4d9]/40'
                      : 'bg-white hover:bg-[#f8f6fc] border border-[#a89bc2] shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#4338ca] font-mono font-bold">{trauma.id} · {trauma.region}</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        trauma.status === 'Examined'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-50 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {trauma.status}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#0f0d1a] mb-1">{trauma.label}</div>
                  <div className="text-[11px] text-[#4b465c] line-clamp-2">{trauma.finding}</div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7 bg-white border border-[#a89bc2] rounded-xl p-5 shadow-sm flex flex-col justify-between">
            {selectedTrauma && (
              <div>
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e5e0f0]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4338ca]" />
                    <span className="text-xs font-bold text-[#0f0d1a] uppercase tracking-wider">
                      {selectedTrauma.region} Region Trauma Analysis
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#4338ca] bg-[#f8f6fc] px-2 py-0.5 rounded border border-[#d4ceeb]">
                    {selectedTrauma.id}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#0f0d1a] mb-2">{selectedTrauma.label}</h3>

                <div className="space-y-3 bg-[#f8f6fc] p-4 rounded-lg border border-[#d4ceeb] text-xs leading-relaxed">
                  <div>
                    <span className="text-[#4b465c] font-bold block mb-1 uppercase tracking-wider">
                      PATHOLOGICAL OBSERVATIONS:
                    </span>
                    <p className="text-[#2c273d]">{selectedTrauma.finding}</p>
                  </div>

                  <div className="pt-2 border-t border-[#e5e0f0]">
                    <span className="text-[#4338ca] font-bold block mb-1 uppercase tracking-wider">
                      FORENSIC SIGNIFICANCE:
                    </span>
                    <p className="text-[#0f0d1a] font-medium">{selectedTrauma.evidentiaryValue}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-[#e5e0f0] flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('Detective Desk')}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#f8f6fc] border border-[#a89bc2] rounded-lg text-xs font-medium text-[#0f0d1a] transition-colors cursor-pointer"
              >
                <FolderKanban size={13} />
                <span>Pin Finding to Detective Corkboard</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('Laboratory')}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#4338ca] hover:bg-[#3730a3] rounded-lg text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer"
              >
                <Microscope size={14} />
                <span>Examine Swabs in Physical Lab</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PMI & BODY COOLING CALIBRATION                                     */}
      {/* ========================================================================= */}
      {activeTab === 'pmi' && currentSubject.pmiModel && (
        <div className="bg-white border border-[#a89bc2] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e0f0]">
            <span className="text-xs font-bold text-[#0f0d1a] uppercase tracking-wider">
              Moritz-Henssge Nomogram & Algor Mortis Cooling Calibration
            </span>
            <Thermometer size={14} className="text-[#4338ca]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[#f8f6fc] rounded-lg border border-[#d4ceeb]">
              <div className="text-[10px] font-bold text-[#4b465c] uppercase mb-1">Body Core Temp at Scene</div>
              <div className="text-[14px] font-bold text-[#0f0d1a] font-mono">{currentSubject.pmiModel.bodyCoreTempC} °C</div>
              <div className="text-[10px] text-[#4338ca] mt-1 font-medium">Recorded by CSI at 03:05 UTC</div>
            </div>

            <div className="p-4 bg-[#f8f6fc] rounded-lg border border-[#d4ceeb]">
              <div className="text-[10px] font-bold text-[#4b465c] uppercase mb-1">Conservatory Ambient Temp</div>
              <div className="text-[14px] font-bold text-[#0f0d1a] font-mono">{currentSubject.pmiModel.ambientTempC} °C</div>
              <div className="text-[10px] text-[#4b465c] mt-1">HVAC Broken Glass Exposure</div>
            </div>

            <div className="p-4 bg-[#f8f6fc] rounded-lg border border-[#d4ceeb]">
              <div className="text-[10px] font-bold text-[#4b465c] uppercase mb-1">Vitreous Potassium (K+)</div>
              <div className="text-[14px] font-bold text-amber-800 font-mono">{currentSubject.pmiModel.vitreousPotassiumMeqL} mEq/L</div>
              <div className="text-[10px] text-amber-700 mt-1">Calculates 2.1 ± 0.4 hrs</div>
            </div>

            <div className="p-4 bg-[#f8f6fc] rounded-lg border border-[#d4ceeb]">
              <div className="text-[10px] font-bold text-[#4b465c] uppercase mb-1">Calculated Window of Death</div>
              <div className="text-[14px] font-bold text-rose-700 font-mono">{currentSubject.pmiModel.calculatedDeathWindow}</div>
              <div className="text-[10px] text-rose-800 mt-1">Directly matches 01:45 UTC SMS</div>
            </div>
          </div>

          <div className="p-4 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-xs text-[#2c273d] leading-relaxed space-y-1">
            <strong className="text-[#4338ca] uppercase text-[10px] block font-bold">FORENSIC TIMELINE CORROBORATION:</strong>
            <p>
              Rigor mortis present in masseter and cervical musculature ({currentSubject.pmiModel.rigorStage}). Lividity ({currentSubject.pmiModel.livorStage}).
              Corroborated by {currentSubject.pmiModel.corroboratingSource}. Confirms decedent passed within the East Wing Conservatory between 01:30 and 02:15 UTC, directly refuting suspect Julian Vance's claim of victim being alive at 03:00.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: STATUTORY FORM ME-99 CERTIFICATE                                   */}
      {/* ========================================================================= */}
      {activeTab === 'certificate' && currentSubject.deathCertificate && (
        <div className="bg-white border border-[#a89bc2] rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e0f0]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#4338ca]" />
              <div>
                <h3 className="text-sm font-bold text-[#0f0d1a] uppercase tracking-wider">
                  Official Medical Examiner Determination (Form ME-99)
                </h3>
                <span className="text-[10px] text-[#4b465c]">
                  Statutory Record under Chapter 44, Section 12 · District Forensic Medical Authority
                </span>
              </div>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-300 text-rose-800 font-bold uppercase">
              {currentSubject.deathCertificate.mannerOfDeath}
            </span>
          </div>

          <div className="p-4 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[#4b465c] block text-[10px] font-bold">DECEDENT:</span>
                <strong className="text-[#0f0d1a] text-sm">{currentSubject.deathCertificate.decedentName}</strong>
              </div>
              <div>
                <span className="text-[#4b465c] block text-[10px] font-bold">MANNER OF DEATH:</span>
                <strong className="text-rose-700 text-sm font-bold">{currentSubject.deathCertificate.mannerOfDeath}</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-[#e5e0f0]">
              <span className="text-[#4b465c] block text-[10px] font-bold">IMMEDIATE CAUSE OF DEATH (PART I):</span>
              <p className="text-[#0f0d1a] font-bold text-sm mt-0.5">{currentSubject.deathCertificate.immediateCausePart1}</p>
            </div>

            <div className="pt-2 border-t border-[#e5e0f0]">
              <span className="text-[#4b465c] block text-[10px] font-bold">DUE TO OR AS A CONSEQUENCE OF (PART II):</span>
              <p className="text-[#2c273d] mt-0.5">{currentSubject.deathCertificate.underlyingCausePart2}</p>
            </div>

            <div className="pt-2 border-t border-[#e5e0f0]">
              <span className="text-[#4b465c] block text-[10px] font-bold">OTHER SIGNIFICANT CONDITIONS:</span>
              <p className="text-[#2c273d] mt-0.5">{currentSubject.deathCertificate.otherSignificantConditions}</p>
            </div>

            <div className="pt-2 border-t border-[#e5e0f0] flex items-center justify-between text-[#4b465c] flex-wrap gap-2">
              <div>
                Certifying Pathologist: <strong className="text-[#0f0d1a]">{currentSubject.deathCertificate.certifyingPathologist}</strong> (Lic #{currentSubject.deathCertificate.licenseNumber})
              </div>
              <div>Date Certified: {currentSubject.deathCertificate.certifiedDate}</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#4338ca] bg-[#c1b4d9]/30 px-3 py-1.5 rounded-lg border border-[#a89bc2]">
              <CheckCircle2 size={14} className="text-[#4338ca]" />
              <span>CERTIFICATE NOTARIZED & TRANSMITTED TO U.S. DISTRICT COURT INDICTMENT DOCKET</span>
            </div>

            <button
              type="button"
              onClick={() => navigate('Courtroom Trial')}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#4338ca] hover:bg-[#3730a3] rounded-lg text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer"
            >
              <Scale size={14} />
              <span>Proceed to Courtroom Cross-Examination</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD VACCINE                                                        */}
      {/* ========================================================================= */}
      {isAddVaccineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border-2 border-[#a89bc2] rounded-xl w-full max-w-lg p-5 shadow-2xl space-y-4 text-[#0f0d1a]">
            <div className="flex items-center justify-between pb-2 border-b border-[#e5e0f0]">
              <div className="text-sm font-bold text-[#0f0d1a] uppercase tracking-wider flex items-center gap-2">
                <Syringe size={16} className="text-[#4338ca]" />
                <span>Record Immunization Dose</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddVaccineOpen(false)}
                className="text-[#6b6680] hover:text-[#0f0d1a] p-1 rounded-md hover:bg-[#f8f6fc]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveNewVaccine} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#4b465c] font-medium mb-1">Vaccine / Antigen Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hepatitis B Recombinant or Rabies PEP"
                  value={newVaccineForm.vaccineName}
                  onChange={(e) => setNewVaccineForm({ ...newVaccineForm, vaccineName: e.target.value })}
                  className="w-full p-2 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] focus:bg-white focus:border-[#4338ca] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4b465c] font-medium mb-1">Target Pathogen</label>
                  <input
                    type="text"
                    placeholder="e.g. Hepatitis B Virus"
                    value={newVaccineForm.targetPathogen}
                    onChange={(e) => setNewVaccineForm({ ...newVaccineForm, targetPathogen: e.target.value })}
                    className="w-full p-2 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] focus:bg-white focus:border-[#4338ca] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#4b465c] font-medium mb-1">Date Administered</label>
                  <input
                    type="date"
                    value={newVaccineForm.dateAdministered}
                    onChange={(e) => setNewVaccineForm({ ...newVaccineForm, dateAdministered: e.target.value })}
                    className="w-full p-2 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] focus:bg-white focus:border-[#4338ca] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4b465c] font-medium mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={newVaccineForm.manufacturer}
                    onChange={(e) => setNewVaccineForm({ ...newVaccineForm, manufacturer: e.target.value })}
                    className="w-full p-2 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] focus:bg-white focus:border-[#4338ca] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#4b465c] font-medium mb-1">Lot Number</label>
                  <input
                    type="text"
                    value={newVaccineForm.lotNumber}
                    onChange={(e) => setNewVaccineForm({ ...newVaccineForm, lotNumber: e.target.value })}
                    className="w-full p-2 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] focus:bg-white focus:border-[#4338ca] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4b465c] font-medium mb-1">Serological Titer Reading</label>
                <input
                  type="text"
                  placeholder="e.g. HBsAb > 100 mIU/mL (Protective)"
                  value={newVaccineForm.titerResult}
                  onChange={(e) => setNewVaccineForm({ ...newVaccineForm, titerResult: e.target.value })}
                  className="w-full p-2 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] focus:bg-white focus:border-[#4338ca] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#4b465c] font-medium mb-1">Forensic / Evidentiary Relevance</label>
                <textarea
                  rows={2}
                  value={newVaccineForm.evidentiaryRelevance}
                  onChange={(e) => setNewVaccineForm({ ...newVaccineForm, evidentiaryRelevance: e.target.value })}
                  className="w-full p-2 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] focus:bg-white focus:border-[#4338ca] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e0f0]">
                <button
                  type="button"
                  onClick={() => setIsAddVaccineOpen(false)}
                  className="px-3 py-1.5 bg-white border border-[#a89bc2] text-[#0f0d1a] rounded-lg hover:bg-[#f8f6fc] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#4338ca] hover:bg-[#3730a3] font-semibold text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Save Immunization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD DIAGNOSTIC TEST                                                */}
      {/* ========================================================================= */}
      {isAddTestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border-2 border-[#a89bc2] rounded-xl w-full max-w-lg p-5 shadow-2xl space-y-4 text-[#0f0d1a]">
            <div className="flex items-center justify-between pb-2 border-b border-[#e5e0f0]">
              <div className="text-sm font-bold text-[#0f0d1a] uppercase tracking-wider flex items-center gap-2">
                <FlaskConical size={16} className="text-[#4338ca]" />
                <span>Order Diagnostic Laboratory Assay</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddTestOpen(false)}
                className="text-[#6b6680] hover:text-[#0f0d1a] p-1 rounded-md hover:bg-[#f8f6fc]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveNewTest} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4b465c] font-medium mb-1">Category *</label>
                  <select
                    value={newTestForm.category}
                    onChange={(e) =>
                      setNewTestForm({
                        ...newTestForm,
                        category: e.target.value as DiagnosticTestRecord['category'],
                      })
                    }
                    className="w-full p-2 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] focus:bg-white focus:border-[#4338ca] focus:outline-none"
                  >
                    <option value="Toxicology">Toxicology</option>
                    <option value="Hematology">Hematology</option>
                    <option value="Chemistry & Metabolic">Chemistry & Metabolic</option>
                    <option value="Vitreous Humor">Vitreous Humor</option>
                    <option value="Microbiology & PCR">Microbiology & PCR</option>
                    <option value="Forensic Serology & DNA">Forensic Serology & DNA</option>
                    <option value="Questioned Documents">Questioned Documents</option>
                    <option value="Materials & Trace Metallurgy">Materials & Trace Metallurgy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#4b465c] font-medium mb-1">Specimen *</label>
                  <select
                    value={newTestForm.specimen}
                    onChange={(e) =>
                      setNewTestForm({
                        ...newTestForm,
                        specimen: e.target.value as DiagnosticTestRecord['specimen'],
                      })
                    }
                    className="w-full p-2 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] focus:bg-white focus:border-[#4338ca] focus:outline-none"
                  >
                    <option value="Peripheral Blood">Peripheral Blood</option>
                    <option value="Cardiac Blood">Cardiac Blood</option>
                    <option value="Vitreous Humor">Vitreous Humor</option>
                    <option value="Gastric Contents">Gastric Contents</option>
                    <option value="Subungual Swabs">Subungual Swabs</option>
                    <option value="Urine">Urine</option>
                    <option value="Bile">Bile</option>
                    <option value="Liver Tissue">Liver Tissue</option>
                    <option value="Physical Trace / Swab">Physical Trace / Swab</option>
                    <option value="Questioned Document / Material">Questioned Document / Material</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#4b465c] font-medium mb-1">Test / Analyte Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coniine or Vitreous Potassium"
                  value={newTestForm.testName}
                  onChange={(e) => setNewTestForm({ ...newTestForm, testName: e.target.value })}
                  className="w-full p-2 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] focus:bg-white focus:border-[#4338ca] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4b465c] font-medium mb-1">Quantitative Result *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3.2 µg/mL or POSITIVE"
                    value={newTestForm.quantitativeResult}
                    onChange={(e) => setNewTestForm({ ...newTestForm, quantitativeResult: e.target.value })}
                    className="w-full p-2 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] focus:bg-white focus:border-[#4338ca] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#4b465c] font-medium mb-1">Diagnostic Flag</label>
                  <select
                    value={newTestForm.flag}
                    onChange={(e) =>
                      setNewTestForm({
                        ...newTestForm,
                        flag: e.target.value as DiagnosticTestRecord['flag'],
                      })
                    }
                    className="w-full p-2 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] focus:bg-white focus:border-[#4338ca] focus:outline-none"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="LOW">LOW</option>
                    <option value="CRITICAL_LETHAL">CRITICAL_LETHAL</option>
                    <option value="POSITIVE">POSITIVE</option>
                    <option value="NEGATIVE">NEGATIVE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4b465c] font-medium mb-1">Methodology</label>
                  <input
                    type="text"
                    value={newTestForm.methodology}
                    onChange={(e) => setNewTestForm({ ...newTestForm, methodology: e.target.value })}
                    className="w-full p-2 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] focus:bg-white focus:border-[#4338ca] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#4b465c] font-medium mb-1">Instrument ID</label>
                  <input
                    type="text"
                    value={newTestForm.instrumentId}
                    onChange={(e) => setNewTestForm({ ...newTestForm, instrumentId: e.target.value })}
                    className="w-full p-2 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] focus:bg-white focus:border-[#4338ca] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4b465c] font-medium mb-1">Clinical Interpretation</label>
                <textarea
                  rows={2}
                  placeholder="Pathological and evidentiary impact of findings..."
                  value={newTestForm.clinicalInterpretation}
                  onChange={(e) => setNewTestForm({ ...newTestForm, clinicalInterpretation: e.target.value })}
                  className="w-full p-2 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] focus:bg-white focus:border-[#4338ca] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e0f0]">
                <button
                  type="button"
                  onClick={() => setIsAddTestOpen(false)}
                  className="px-3 py-1.5 bg-white border border-[#a89bc2] text-[#0f0d1a] rounded-lg hover:bg-[#f8f6fc] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#4338ca] hover:bg-[#3730a3] font-semibold text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Record Diagnostic Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT INTAKE RECORD                                                 */}
      {/* ========================================================================= */}
      {isEditIntakeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border-2 border-[#a89bc2] rounded-xl w-full max-w-lg p-5 shadow-2xl space-y-4 text-[#0f0d1a]">
            <div className="flex items-center justify-between pb-2 border-b border-[#e5e0f0]">
              <div className="text-sm font-bold text-[#0f0d1a] uppercase tracking-wider flex items-center gap-2">
                <Edit3 size={16} className="text-[#4338ca]" />
                <span>Edit Case Intake Details</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditIntakeOpen(false)}
                className="text-[#6b6680] hover:text-[#0f0d1a] p-1 rounded-md hover:bg-[#f8f6fc]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveIntake} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4b465c] font-medium mb-1">Receiving Technician</label>
                  <input
                    type="text"
                    value={editIntakeForm.receivingTechnician || ''}
                    onChange={(e) => setEditIntakeForm({ ...editIntakeForm, receivingTechnician: e.target.value })}
                    className="w-full p-2 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] focus:bg-white focus:border-[#4338ca] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#4b465c] font-medium mb-1">Body Bag Seal #</label>
                  <input
                    type="text"
                    value={editIntakeForm.bodyBagSealNumber || ''}
                    onChange={(e) => setEditIntakeForm({ ...editIntakeForm, bodyBagSealNumber: e.target.value })}
                    className="w-full p-2 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] focus:bg-white focus:border-[#4338ca] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4b465c] font-medium mb-1">Clinical Admission Notes</label>
                <textarea
                  rows={4}
                  value={editIntakeForm.clinicalNotes || ''}
                  onChange={(e) => setEditIntakeForm({ ...editIntakeForm, clinicalNotes: e.target.value })}
                  className="w-full p-2 bg-[#f8f6fc] border border-[#d4ceeb] rounded-lg text-[#0f0d1a] focus:bg-white focus:border-[#4338ca] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e5e0f0]">
                <button
                  type="button"
                  onClick={() => setIsEditIntakeOpen(false)}
                  className="px-3 py-1.5 bg-white border border-[#a89bc2] text-[#0f0d1a] rounded-lg hover:bg-[#f8f6fc] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#4338ca] hover:bg-[#3730a3] font-semibold text-white rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Update Intake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
