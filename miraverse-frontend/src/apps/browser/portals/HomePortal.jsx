import React, { useEffect, useMemo, useState } from 'react';
import { Globe } from 'lucide-react';
import '../../../styles/apps/MSNPortal.css';

export default function HomePortal() {
    const [activeApp, setActiveApp] = useState('faithmed');
    const [status, setStatus] = useState('Ready.');
    const [prism, setPrism] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => {
            setPrism((p) => !p);
            setStatus((s) => (prism ? 'PRISM anomaly cleared' : '⚠ PRISM anomaly detected'));
        }, 5000);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeApp]);

    const address = useMemo(() => `https://${activeApp}.aure`, [activeApp]);

    const switchApp = (app) => {
        setActiveApp(app);
        setStatus(`Loaded ${app}.aure`);
    };

    return (
        <div className="lav-portal">
            <div className={`lav-browser ${prism ? 'prism-active' : ''}`}>
                {/* TITLEBAR */}
                <div className="titlebar">
                    {[
                        { key: 'faithmed', label: 'FaithMed' },
                        { key: 'pulse', label: 'Pulse' },
                        { key: 'citizen', label: 'Citizen Record' },
                        { key: 'console', label: 'Console' },
                        { key: 'spellforge', label: 'SpellForge' },
                    ].map((t) => (
                        <div
                            key={t.key}
                            className={`tab ${activeApp === t.key ? 'active' : ''}`}
                            onClick={() => switchApp(t.key)}
                        >
                            {t.label}
                        </div>
                    ))}
                    <div className="tab new" title="New Tab">+</div>
                </div>

                {/* TOOLBAR */}
                <div className="toolbar">
                    <button className="nav-btn" title="Back" disabled>←</button>
                    <button className="nav-btn" title="Forward" disabled>→</button>
                    <button className="nav-btn" title="Refresh" onClick={() => setStatus(`Refreshed ${activeApp}.aure`)}>⟳</button>
                    <input className="address-bar" value={address} readOnly />
                    <span className="security-indicator" title="Secure">🔒 Secure</span>
                </div>

                {/* CONTENT */}
                <div className="content">
                    <div className={`app-page faithmed ${activeApp === 'faithmed' ? 'active' : ''}`}>
                        <h2>Faith Medical Portal</h2>
                        <p>Patient Diagnostics • Aura Scan • Veil Exposure Index</p>
                    </div>
                    <div className={`app-page pulse ${activeApp === 'pulse' ? 'active' : ''}`}>
                        <h2>Pulse Social Network</h2>
                        <p>Trending Signals • Reputation Meter • Event Timing Alerts</p>
                    </div>
                    <div className={`app-page citizen ${activeApp === 'citizen' ? 'active' : ''}`}>
                        <h2>Citizen Record</h2>
                        <p>Identity File • Lineage Keys • Regional Delegation Status</p>
                    </div>
                    <div className={`app-page console ${activeApp === 'console' ? 'active' : ''}`}>
                        <h2>System Console</h2>
                        <p>Commands • PRISM Alerts • Process Monitor Hooks</p>
                    </div>
                    <div className={`app-page spellforge ${activeApp === 'spellforge' ? 'active' : ''}`}>
                        <h2>SpellForge</h2>
                        <p>Modules • Crafting Slots • Elemental Recipes</p>
                    </div>
                </div>

                {/* STATUS BAR */}
                <div className="statusbar">
                    <span className="status-text">{status}</span>
                    <button className="prism-toggle" onClick={() => setPrism((p) => !p)}>
                        {prism ? 'Disable PRISM' : 'Enable PRISM'}
                    </button>
                </div>

                {/* PRISM OVERLAY */}
                <div className="prism-overlay" />
            </div>

            {/* Brand watermark (subtle) */}
            <div className="lav-brand"><Globe size={16} /> Aureline</div>
        </div>
    );
}
