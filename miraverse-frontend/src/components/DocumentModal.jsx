import React, { useState } from 'react';
import { useOSStore } from '../store/useOSStore';

export default function DocumentModal({ file, onClose, onSubmitForm }) {
  const player = useOSStore((s) => s.gameplay.player);
  const verifyDGAIdentity = useOSStore((s) => s.verifyDGAIdentity);
  const addCredits = useOSStore((s) => s.addCredits);
  const toggleApp = useOSStore((s) => s.toggleApp);
  const setBrowserUrl = useOSStore((s) => s.setBrowserUrl);

  const [formData, setFormData] = useState({});
  const [decryptKey, setDecryptKey] = useState('');
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [decryptError, setDecryptError] = useState(false);

  // States for .map scan telemetry
  const [selectedNode, setSelectedNode] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  if (!file) return null;

  const handleInputChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  // Submit Handler for Forms
  const handleActionClick = (actionTrigger) => {
    if (onSubmitForm) {
      onSubmitForm(actionTrigger, formData);
      return;
    }

    // Default inline actions in case parent doesn't bind them
    if (actionTrigger === 'SUBMIT_CIVIC_REG') {
      if (verifyDGAIdentity) verifyDGAIdentity();
      if (addCredits) addCredits(100);
      alert("Citizen registered successfully! +100 Credits awarded.");
      onClose();
    } else if (actionTrigger === 'SYNC_FAITHMED') {
      setBrowserUrl('https://faithmed.aure/patient');
      toggleApp({ id: 'browser', title: 'Net Browser (Web/Faith)', contentKey: 'browser' });
      onClose();
    } else if (actionTrigger === 'LOAD_SPELLFORGE') {
      toggleApp({ id: 'spellforge', title: 'SpellForge Matrix', contentKey: 'spellforge' });
      onClose();
    } else if (actionTrigger === 'QUARANTINE_PRISM') {
      if (addCredits) addCredits(50);
      alert("PRISM malware quarantined. +50 Credits.");
      onClose();
    }
  };

  // Decrypt check
  const isPrism = file.extension === '.prism' || file.type === 'prism' || file.type === 'corrupt';
  const isEncrypted = file.security?.isEncrypted;
  const cryptoLevel = player?.skills?.Cryptography?.level || 1;
  const hasSkillBypass = cryptoLevel >= 3;
  const showEncrypted = isEncrypted && !isDecrypted && !hasSkillBypass;

  const handleDecryptAttempt = () => {
    const key = decryptKey.trim().toUpperCase();
    if (key === 'LIGHTBORN' || key === 'AETHERCORE') {
      setIsDecrypted(true);
      setDecryptError(false);
    } else {
      setDecryptError(true);
      setTimeout(() => setDecryptError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 select-none">
      {/* Flat Window Frame */}
      <div className={`w-full max-w-xl bg-[#0b0717] border ${isPrism ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse' : 'border-purple-600/50'} text-purple-200 font-mono text-xs shadow-none rounded-none overflow-hidden flex flex-col`}>
        
        {/* Window Header Bar */}
        <div className={`flex items-center justify-between px-3 py-1.5 ${isPrism ? 'bg-red-950/80' : 'bg-purple-950/80'} border-b border-purple-800/40`}>
          <div className="flex items-center gap-2">
            <span className={isPrism ? 'text-red-400' : 'text-purple-400'}>{isPrism ? '⚠️' : '📄'}</span>
            <span className="font-bold tracking-wider uppercase">{file.name || file.filename}</span>
          </div>
          <button 
            onClick={onClose}
            className="px-2 py-0.5 text-purple-400 hover:text-pink-400 hover:bg-purple-900/40 font-bold"
          >
            [X]
          </button>
        </div>

        {/* Metadata Header */}
        <div className="p-3 border-b border-purple-900/40 bg-purple-950/20 grid grid-cols-2 gap-2 text-[10px] text-purple-400/80">
          <div><span className="text-purple-500">CLASSIFICATION:</span> {file.meta?.classification || 'RESTRICTED'}</div>
          <div><span className="text-purple-500">AUTHOR:</span> {file.meta?.author || 'SYSTEM RECORD'}</div>
          <div><span className="text-purple-500">TIMESTAMP:</span> {file.meta?.timestamp || 'WINTER'}</div>
          <div><span className="text-purple-500">SIZE:</span> {file.meta?.fileSize || file.size || '4.0 KB'}</div>
        </div>

        {/* Body Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[400px]">
          <div>
            <h2 className="text-sm font-bold text-purple-100 tracking-wide uppercase">{file.content?.title || file.name}</h2>
            <p className="text-[10px] text-purple-400 tracking-wider uppercase mt-0.5">{file.content?.subtitle || file.desc}</p>
          </div>

          {/* 1. Encrypted File Lock Warning */}
          {showEncrypted ? (
            <div className="p-3 border border-yellow-600/50 bg-yellow-950/20 text-yellow-300 space-y-3">
              <p className="font-bold">[ 🔒 ARCHIVE LOCK ACTIVE ]</p>
              <p>This historical catalog is encrypted. Cryptography Level {file.security.requiredLevel} or Lineage bypass key required.</p>
              <p className="text-[10px] text-yellow-400/80">Your Cryptography Level: {cryptoLevel} / 3</p>
              
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Bypass Key..."
                  value={decryptKey}
                  onChange={(e) => setDecryptKey(e.target.value)}
                  className="bg-[#07040d] border border-yellow-600/50 p-1.5 text-yellow-100 focus:outline-none focus:border-yellow-400 text-xs uppercase tracking-widest max-w-[150px]"
                />
                <button
                  onClick={handleDecryptAttempt}
                  className="bg-yellow-800/40 hover:bg-yellow-800/60 border border-yellow-500/50 px-3 py-1 font-bold text-[10px] uppercase"
                >
                  Decrypt
                </button>
              </div>
              {decryptError && <p className="text-[10px] text-red-400 uppercase tracking-wide">Decryption Failed: Invalid Cipher Key</p>}
            </div>
          ) : (
            /* Main Content Rendering */
            <>
              {/* Plain text / log content */}
              {(file.type === 'txt' || file.type === 'log') ? (
                <div className="p-3 border border-purple-950/40 bg-black/40 text-[10.5px] leading-relaxed max-h-[200px] overflow-y-auto font-mono text-purple-300">
                  <pre className="whitespace-pre-wrap">{file.content || file.content?.bodyText}</pre>
                </div>
              ) : (
                <p className="text-purple-200/90 leading-relaxed text-[11px]">{file.content?.bodyText}</p>
              )}

              {/* 2. Interactive Map view (.map) */}
              {(file.type === 'map' || file.extension === '.map') && (
                <div className="space-y-3 border border-cyan-500/20 bg-[#06121a]/20 p-3 text-cyan-300">
                  <div className="relative h-28 border border-cyan-500/30 bg-[#06121a] flex items-center justify-center font-mono text-[9px] overflow-hidden">
                    <div className="absolute inset-0 holo-grid opacity-20" />
                    
                    {/* Simulated Radar Sweep */}
                    {isScanning && (
                      <motion.div
                        initial={{ scale: 0.1, opacity: 0.8 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className="absolute h-24 w-24 rounded-full border border-cyan-400/40 pointer-events-none"
                      />
                    )}

                    <svg className="absolute inset-0 h-full w-full pointer-events-none">
                      <line x1="50" y1="20" x2="160" y2="60" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="160" y1="60" x2="280" y2="90" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="1" />
                    </svg>
                    
                    {/* Interative Nodes */}
                    {[
                      { id: 1, label: 'Gate Node 01', x: 50, y: 20 },
                      { id: 2, label: 'Transit Terminal B', x: 160, y: 60 },
                      { id: 3, label: 'Veil bleed Alpha', x: 280, y: 90 }
                    ].map((node) => (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className="absolute group flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-cyan-950/80 border border-cyan-500 rounded-full hover:bg-cyan-400 transition"
                        style={{ left: node.x, top: node.y }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsScanning(true);
                        setTimeout(() => setIsScanning(false), 1200);
                      }}
                      disabled={isScanning}
                      className="bg-cyan-900/30 hover:bg-cyan-900/60 border border-cyan-500/50 px-3 py-1 font-bold text-[9px] uppercase text-cyan-200"
                    >
                      {isScanning ? 'Scanning...' : 'Ping Conduits'}
                    </button>
                    <div className="flex-1 bg-black/30 border border-cyan-500/20 px-2 py-1 text-[9px] flex items-center">
                      {selectedNode ? `Node: ${selectedNode.label} // STATUS: ACTIVE` : 'Select node marker for telemetries...'}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Diagnostic Scans view (.diag) */}
              {(file.type === 'diag' || file.extension === '.diag') && (
                <div className="space-y-3 border border-emerald-500/20 bg-[#03150d]/20 p-3 text-emerald-300">
                  <div className="flex gap-1.5 h-10 justify-center items-end bg-[#03150d] border border-emerald-500/30 p-2">
                    {[65, 90, 40, 80, 50, 70, 30].map((h, i) => (
                      <div key={i} className="flex-1 bg-emerald-950/40 rounded-t-sm h-full flex flex-col justify-end">
                        <div className="w-full bg-gradient-to-t from-cyan-500 via-emerald-400 to-yellow-500" style={{ height: `${h}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center justify-between font-mono">
                    <span>THERMAL AURA CHANNELS LEVEL</span>
                    <span>BIOMETRICS FLUX NORMAL</span>
                  </div>
                </div>
              )}

              {/* 4. Form inputs (.osform) */}
              {file.content?.formFields && (
                <div className="space-y-3 pt-2 border-t border-purple-900/40">
                  {file.content.formFields.map((field) => (
                    <div key={field.id} className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-purple-400 font-bold uppercase">{field.label}:</label>

                      {field.type === 'text' && (
                        <input
                          type="text"
                          placeholder={field.placeholder}
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="bg-[#07040d] border border-purple-700/60 p-2 text-purple-100 focus:outline-none focus:border-purple-400 text-xs rounded-none"
                          required={field.required}
                        />
                      )}

                      {field.type === 'select' && (
                        <select
                          value={formData[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className="bg-[#07040d] border border-purple-700/60 p-2 text-purple-100 focus:outline-none focus:border-purple-400 text-xs rounded-none"
                          required={field.required}
                        >
                          <option value="">-- Select Option --</option>
                          {field.options.map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}

                      {field.type === 'checkbox' && (
                        <label className="flex items-center gap-2 cursor-pointer mt-1">
                          <input
                            type="checkbox"
                            checked={formData[field.id] ?? field.default ?? false}
                            onChange={(e) => handleInputChange(field.id, e.target.checked)}
                            className="accent-purple-600 h-3.5 w-3.5"
                          />
                          <span className="text-[10px] text-purple-300 uppercase tracking-wide">Authorize Aura Diagnostics</span>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Action Button */}
          {file.content?.actionButton && !showEncrypted && (
            <button
              type="button"
              onClick={() => handleActionClick(file.content.actionButton.actionTrigger)}
              className={`w-full py-2.5 mt-4 font-bold tracking-wider uppercase transition-colors border rounded-none ${
                isPrism 
                  ? 'bg-red-950/40 hover:bg-red-800/60 border-red-500 text-red-100' 
                  : 'bg-purple-900/40 hover:bg-purple-800/60 border-purple-500/60 text-purple-100'
              }`}
            >
              {file.content.actionButton.label}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
