// src/components/DocumentModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, X, CheckCircle2, Building, User, Shield } from 'lucide-react';
import { useOSStore } from '../store/useOSStore';
import Button from './ui/button';
import Input from './ui/input';

export default function DocumentModal({ onClose }) {
  const player = useOSStore((s) => s.gameplay.player);
  const verifyDGAIdentity = useOSStore((s) => s.verifyDGAIdentity);
  const addCredits = useOSStore((s) => s.addCredits);

  const [displayName, setDisplayName] = useState(player?.name || 'CY-9021-CITIZEN');
  const [districtChoice, setDistrictChoice] = useState('Glassline District');
  const [isSubmitted, setIsSubmitted] = useState(player?.dgaVerified || false);

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyDGAIdentity();
    addCredits(100);
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md select-none font-sans text-purple-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg rounded-2xl border border-purple-400/40 bg-[#0d0724]/95 p-6 shadow-[0_0_50px_rgba(168,85,247,0.3)] backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="font-mono text-xs font-bold tracking-wider text-purple-200 uppercase">
                📄 DGA_REGISTRATION_DIRECTIVE_14B.osform
              </h2>
              <p className="text-[10px] text-purple-400/80 font-mono">DIGITAL GOVERNANCE AGENCY • MUNICIPAL BUREAU</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-purple-400 hover:bg-purple-900/50 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="font-serif-y2k text-xl font-bold text-white">CIVIC DOSSIER REGISTERED</h3>
            <p className="text-xs text-purple-300/80 max-w-xs mx-auto leading-relaxed">
              Your biometric record has been transmitted to the Digital Governance Agency. +100 ◈ credited to your ledger.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-xl border border-purple-500/20 bg-purple-950/40 p-4 text-xs space-y-2">
              <div className="flex justify-between font-mono text-[10px] text-purple-400">
                <span>APPLICANT: Provisional Resident</span>
                <span className="text-amber-300 font-bold">STATUS: Pending Clearance</span>
              </div>
              <p className="text-[11px] text-purple-200/80 leading-relaxed">
                Under Aureline Municipal Code 14-B, all new assets must declare their citizen handle and preferred residential district placement.
              </p>
            </div>

            {/* Field 1 */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <User size={13} className="text-purple-400" /> [ Field 1: Display Name / Citizen Handle ]
              </label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your citizen handle..."
                className="bg-black/60 border-purple-500/40 text-purple-100 placeholder:text-purple-400/40 text-xs focus:border-purple-400"
                required
              />
            </div>

            {/* Field 2 */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Building size={13} className="text-purple-400" /> [ Field 2: District Choice ]
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Glassline District', desc: 'Coastal cybernetic hub & labs' },
                  { id: 'Old Factory District', desc: 'Subterranean industrial conduits' },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDistrictChoice(d.id)}
                    className={`rounded-xl border p-3 text-left transition ${
                      districtChoice === d.id
                        ? 'border-purple-400 bg-purple-900/60 shadow-[0_0_15px_rgba(168,85,247,0.3)] text-white font-bold'
                        : 'border-purple-500/20 bg-purple-950/30 text-purple-300 hover:bg-purple-900/30'
                    }`}
                  >
                    <div className="text-xs font-semibold">{d.id}</div>
                    <div className="text-[10px] text-purple-400/70 mt-0.5">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 font-bold text-xs text-white shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition border border-purple-400/40 rounded-xl"
            >
              [ SUBMIT REGISTRATION TO MUNICIPAL BUREAU ]
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
