'use client';
import { useState, useMemo } from 'react';
import {
  Package,
  ShieldCheck,
  ShieldAlert,
  Search,
  Tag,
  Microscope,
  RotateCcw,
  Plus,
  Grid,
  List,
  FolderOpen,
  Archive,
  Lock,
  ExternalLink,
  FlaskConical,
  ThermometerSnowflake,
} from 'lucide-react';
import type { LabRecord } from '@/lib/records';

interface EvidenceRoomProps {
  evidence: LabRecord[];
  cases: LabRecord[];
  exams: LabRecord[];
  onOpenRecord: (record: LabRecord) => void;
  onMountOnBench: (evidenceRecord: LabRecord) => void;
  onPrintLabel: (evidenceRecord: LabRecord) => void;
  onTransferCustody: (evidenceRecord: LabRecord) => void;
  onPlanExamination: (evidenceRecord: LabRecord) => void;
  onReceiveEvidence: () => void;
}

type StorageZone = 'all' | 'vault' | 'toxicology' | 'refrigerated' | 'documents' | 'bench';

// Helper to categorize storage location into zones
function getZone(location = ''): StorageZone {
  const loc = location.toLowerCase();
  if (loc.includes('toxicology') || loc.includes('narcotic') || loc.includes('safe') || loc.includes('t-0')) {
    return 'toxicology';
  }
  if (loc.includes('refrigerat') || loc.includes('cold') || loc.includes('freezer') || loc.includes('bio')) {
    return 'refrigerated';
  }
  if (loc.includes('document') || loc.includes('vault · d') || loc.includes('archive') || loc.includes('d-0')) {
    return 'documents';
  }
  if (loc.includes('bench') || loc.includes('checkout') || loc.includes('workstation')) {
    return 'bench';
  }
  return 'vault';
}

export function EvidenceRoom({
  evidence,
  cases,
  exams,
  onOpenRecord,
  onMountOnBench,
  onPrintLabel,
  onTransferCustody,
  onPlanExamination,
  onReceiveEvidence,
}: EvidenceRoomProps) {
  const [activeZone, setActiveZone] = useState<StorageZone>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [materialFilter, setMaterialFilter] = useState('All');
  const [sealFilter, setSealFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Compute storage statistics
  const stats = useMemo(() => {
    let vaultCount = 0;
    let toxCount = 0;
    let coldCount = 0;
    let docCount = 0;
    let benchCount = 0;
    let intactSeals = 0;

    evidence.forEach((e) => {
      const z = getZone(e.data.location);
      if (z === 'toxicology') toxCount++;
      else if (z === 'refrigerated') coldCount++;
      else if (z === 'documents') docCount++;
      else if (z === 'bench') benchCount++;
      else vaultCount++;

      if (e.data.seal === 'Intact') intactSeals++;
    });

    return {
      total: evidence.length,
      vaultCount,
      toxCount,
      coldCount,
      docCount,
      benchCount,
      intactSeals,
    };
  }, [evidence]);

  // Distinct materials for filtering
  const materialOptions = useMemo(() => {
    const set = new Set<string>();
    evidence.forEach((e) => {
      if (e.data.type) set.add(e.data.type);
    });
    return ['All', ...Array.from(set)];
  }, [evidence]);

  // Filtered evidence items
  const filteredEvidence = useMemo(() => {
    return evidence.filter((e) => {
      // Storage zone filter
      if (activeZone !== 'all') {
        const itemZone = getZone(e.data.location);
        if (itemZone !== activeZone) return false;
      }

      // Material filter
      if (materialFilter !== 'All' && e.data.type !== materialFilter) {
        return false;
      }

      // Seal filter
      if (sealFilter !== 'All' && e.data.seal !== sealFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const str = [
          e.id,
          e.caseId || '',
          e.data.title || '',
          e.data.type || '',
          e.data.location || '',
          e.data.custodian || '',
          e.data.description || '',
          ...(e.data.tags || []),
        ]
          .join(' ')
          .toLowerCase();
        if (!str.includes(q)) return false;
      }

      return true;
    });
  }, [evidence, activeZone, materialFilter, sealFilter, searchQuery]);

  return (
    <div className="evidence-room-root">
      {/* Evidence Facility Header Banner */}
      <div className="evidence-vault-hero">
        <div className="vault-hero-content">
          <div className="vault-hero-badge">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>SECURE EVIDENCE CONTROL &amp; PROPERTY CUSTODY VAULT</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-400 font-mono text-[11px] font-bold">
              ISO/IEC 17025 §7.4 ACCREDITED
            </span>
          </div>
          <h2>Physical Evidence Repository & Custody Tracking</h2>
          <p>
            Continuous chain of custody, tamper-evident security packaging, and controlled storage bay assignments across all active casefiles.
          </p>
        </div>

        <div className="vault-hero-actions">
          <button
            type="button"
            onClick={onReceiveEvidence}
            className="primary"
          >
            <Plus size={16} /> Receive new evidence
          </button>
        </div>
      </div>

      {/* Storage Bay Metric Cards */}
      <div className="storage-bay-grid">
        <button
          type="button"
          onClick={() => setActiveZone('all')}
          className={`bay-card ${activeZone === 'all' ? 'active' : ''}`}
        >
          <div className="bay-icon">
            <Package size={20} />
          </div>
          <div className="bay-info">
            <span className="bay-count">{stats.total}</span>
            <span className="bay-name">Total Evidence Items</span>
            <span className="bay-subtext">{stats.intactSeals} with intact seal</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveZone('vault')}
          className={`bay-card ${activeZone === 'vault' ? 'active' : ''}`}
        >
          <div className="bay-icon purple">
            <Lock size={20} />
          </div>
          <div className="bay-info">
            <span className="bay-count">{stats.vaultCount}</span>
            <span className="bay-name">Main Secure Vault (Bay A)</span>
            <span className="bay-subtext">Physical trace, glass & fibers</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveZone('toxicology')}
          className={`bay-card ${activeZone === 'toxicology' ? 'active' : ''}`}
        >
          <div className="bay-icon amber">
            <FlaskConical size={20} />
          </div>
          <div className="bay-info">
            <span className="bay-count">{stats.toxCount}</span>
            <span className="bay-name">Toxicology Safe (Bay B)</span>
            <span className="bay-subtext">Controlled chemical substances</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveZone('refrigerated')}
          className={`bay-card ${activeZone === 'refrigerated' ? 'active' : ''}`}
        >
          <div className="bay-icon blue">
            <ThermometerSnowflake size={20} />
          </div>
          <div className="bay-info">
            <span className="bay-count">{stats.coldCount}</span>
            <span className="bay-name">Refrigerated Storage (-20°C)</span>
            <span className="bay-subtext">Biological swabs & stains</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveZone('documents')}
          className={`bay-card ${activeZone === 'documents' ? 'active' : ''}`}
        >
          <div className="bay-icon green">
            <Archive size={20} />
          </div>
          <div className="bay-info">
            <span className="bay-count">{stats.docCount}</span>
            <span className="bay-name">Document Archive (Vault D)</span>
            <span className="bay-subtext">Questioned notes & media</span>
          </div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="evidence-inventory-toolbar">
        <div className="toolbar-search-box">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID (EV-0001), case number, description, custodian, or location…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="inventory-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="clear-search-btn"
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="toolbar-filters">
          <label className="toolbar-filter-select">
            <span className="sr-only">Filter by Material</span>
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="filter-select-input"
            >
              <option value="All">All Materials</option>
              {materialOptions.filter((m) => m !== 'All').map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label className="toolbar-filter-select">
            <span className="sr-only">Filter by Seal</span>
            <select
              value={sealFilter}
              onChange={(e) => setSealFilter(e.target.value)}
              className="filter-select-input"
            >
              <option value="All">All Seals</option>
              <option value="Intact">Intact Seal</option>
              <option value="Resealed">Resealed</option>
              <option value="Opened for examination">Opened for Examination</option>
            </select>
          </label>

          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid card view"
            >
              <Grid size={15} />
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Ledger table view"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Evidence Items Container */}
      {filteredEvidence.length === 0 ? (
        <div className="empty-vault-state">
          <Package size={42} className="text-purple-300 mx-auto mb-3" />
          <h3>No evidence items found</h3>
          <p>
            {searchQuery || activeZone !== 'all' || materialFilter !== 'All' || sealFilter !== 'All'
              ? 'No items match your active search or storage bay filters.'
              : 'The evidence repository is empty. Receive evidence to establish custody.'}
          </p>
          {(searchQuery || activeZone !== 'all' || materialFilter !== 'All' || sealFilter !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setActiveZone('all');
                setSearchQuery('');
                setMaterialFilter('All');
                setSealFilter('All');
              }}
              className="secondary text-xs mt-3"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="evidence-card-grid">
          {filteredEvidence.map((item) => {
            const parentCase = cases.find((c) => c.id === item.caseId);
            const linkedExams = exams.filter((ex) => ex.data.evidenceId === item.id);
            const isIntact = item.data.seal === 'Intact';
            const custodyEntries = item.data.custody || [];

            return (
              <div key={item.id} className="evidence-vault-card">
                <div className="card-top-header">
                  <div className="flex items-center gap-2">
                    <span className="evidence-id-pill font-mono font-bold text-xs text-purple-900">
                      {item.id}
                    </span>
                    <span className={`seal-badge ${isIntact ? 'intact' : 'resealed'}`}>
                      {isIntact ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                      <span>{item.data.seal || 'Intact'}</span>
                    </span>
                  </div>

                  {item.caseId && (
                    <button
                      type="button"
                      onClick={() => parentCase && onOpenRecord(parentCase)}
                      className="case-link-tag text-xs text-gray-500 hover:text-purple-700 flex items-center gap-1 font-mono"
                      title={parentCase ? `Open case ${parentCase.id} (${parentCase.data.title})` : `Case ${item.caseId}`}
                    >
                      <FolderOpen size={13} />
                      <span>{item.caseId}</span>
                    </button>
                  )}
                </div>

                <div className="card-body">
                  <h3 className="evidence-title">
                    <button
                      type="button"
                      onClick={() => onOpenRecord(item)}
                      className="text-left font-semibold text-gray-900 hover:text-purple-700 transition-colors w-full"
                    >
                      {item.data.title}
                    </button>
                  </h3>
                  <p className="evidence-description">{item.data.description || 'No physical description recorded.'}</p>

                  <div className="evidence-meta-rows">
                    <div className="meta-row">
                      <span className="meta-label">Material Type:</span>
                      <span className="meta-val font-semibold text-gray-800">{item.data.type || 'General Evidence'}</span>
                    </div>

                    <div className="meta-row">
                      <span className="meta-label">Storage Location:</span>
                      <span className="meta-val locker-tag">
                        <Lock size={11} className="text-purple-600" />
                        <span>{item.data.location || 'Secure Storage Vault'}</span>
                      </span>
                    </div>

                    <div className="meta-row">
                      <span className="meta-label">Current Custodian:</span>
                      <span className="meta-val text-gray-700">{item.data.custodian || 'Lab Analyst'}</span>
                    </div>

                    <div className="meta-row">
                      <span className="meta-label">Custody Chain:</span>
                      <span className="meta-val text-xs text-gray-500">
                        {custodyEntries.length} transfer{custodyEntries.length === 1 ? '' : 's'} recorded
                      </span>
                    </div>

                    <div className="meta-row">
                      <span className="meta-label">Analysis Status:</span>
                      <span className="meta-val">
                        {linkedExams.length > 0 ? (
                          <span className="text-xs text-purple-700 font-medium flex items-center gap-1">
                            <Microscope size={12} />
                            {linkedExams[0].data.status === 'Completed'
                              ? 'Examination completed'
                              : 'Under active examination'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Ready for examination</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Evidence Card Action Footer */}
                <div className="card-actions-footer">
                  <button
                    type="button"
                    onClick={() => onMountOnBench(item)}
                    className="card-action-btn primary-action"
                    title="Mount this evidence specimen directly onto the Laboratory Bench"
                  >
                    <Microscope size={14} />
                    <span>Mount on Lab Bench</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onPrintLabel(item)}
                      className="card-icon-btn"
                      title="Generate Code-128 Procedural Evidence Barcode Label"
                    >
                      <Tag size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onTransferCustody(item)}
                      className="card-icon-btn"
                      title="Log chain of custody transfer or change storage locker"
                    >
                      <RotateCcw size={14} />
                    </button>

                    {linkedExams.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => onPlanExamination(item)}
                        className="card-icon-btn"
                        title="Plan new laboratory examination for this item"
                      >
                        <Plus size={14} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenRecord(linkedExams[0])}
                        className="card-icon-btn"
                        title={`Open linked examination ${linkedExams[0].id}`}
                      >
                        <ExternalLink size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Property Ledger Table */
        <div className="evidence-ledger-table-panel">
          <table className="evidence-ledger-table">
            <thead>
              <tr>
                <th>Item Reference</th>
                <th>Case Number</th>
                <th>Material & Description</th>
                <th>Storage Bay / Locker</th>
                <th>Seal Integrity</th>
                <th>Custodian</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvidence.map((item) => {
                const parentCase = cases.find((c) => c.id === item.caseId);
                const isIntact = item.data.seal === 'Intact';

                return (
                  <tr key={item.id}>
                    <td>
                      <button
                        type="button"
                        onClick={() => onOpenRecord(item)}
                        className="text-left font-mono font-bold text-xs text-purple-900 hover:underline"
                      >
                        {item.id}
                      </button>
                    </td>
                    <td>
                      {item.caseId ? (
                        <button
                          type="button"
                          onClick={() => parentCase && onOpenRecord(parentCase)}
                          className="font-mono text-xs text-gray-600 hover:text-purple-700 hover:underline"
                        >
                          {item.caseId}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td>
                      <div className="font-semibold text-xs text-gray-900">{item.data.title}</div>
                      <div className="text-[11px] text-gray-500 truncate max-w-xs">{item.data.description}</div>
                    </td>
                    <td>
                      <span className="locker-tag">
                        <Lock size={11} className="text-purple-600" />
                        <span>{item.data.location || 'Vault Bay A'}</span>
                      </span>
                    </td>
                    <td>
                      <span className={`seal-badge ${isIntact ? 'intact' : 'resealed'}`}>
                        {isIntact ? <ShieldCheck size={11} /> : <ShieldAlert size={11} />}
                        <span>{item.data.seal || 'Intact'}</span>
                      </span>
                    </td>
                    <td className="text-xs text-gray-700">{item.data.custodian || 'Lab Analyst'}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onMountOnBench(item)}
                          className="px-2 py-1 bg-purple-50 text-purple-800 rounded border border-purple-200 text-xs font-semibold hover:bg-purple-100 flex items-center gap-1"
                          title="Mount on Bench"
                        >
                          <Microscope size={12} /> Mount
                        </button>
                        <button
                          type="button"
                          onClick={() => onPrintLabel(item)}
                          className="p-1 text-gray-500 hover:text-gray-900"
                          title="Print Label"
                          aria-label={`Print label for ${item.id}`}
                        >
                          <Tag size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onTransferCustody(item)}
                          className="p-1 text-gray-500 hover:text-gray-900"
                          title="Transfer Custody"
                          aria-label={`Transfer custody for ${item.id}`}
                        >
                          <RotateCcw size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
