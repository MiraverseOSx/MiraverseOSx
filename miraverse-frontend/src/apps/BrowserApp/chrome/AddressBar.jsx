import React from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Lock, Star, MoreHorizontal } from 'lucide-react';

export default function AddressBar({ value, onChange, onSubmit, onBack, onForward, onRefresh, canBack, canForward }) {
    return (
        <div className="flex items-center p-2 bg-[#130b2e] border-b border-purple-500/20 space-x-3 max-w-full shrink-0">
            <div className="flex items-center space-x-1 text-purple-400">
                <button onClick={onBack} disabled={!canBack} className="p-1.5 rounded hover:bg-purple-900/50 hover:text-purple-200 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft size={18} /></button>
                <button onClick={onForward} disabled={!canForward} className="p-1.5 rounded hover:bg-purple-900/50 hover:text-purple-200 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight size={18} /></button>
                <button onClick={onRefresh} className="p-1.5 rounded hover:bg-purple-900/50 hover:text-purple-200"><RotateCw size={16} /></button>
            </div>

            <form onSubmit={onSubmit} className="flex-1 flex items-center bg-[#0d0724] border border-purple-500/30 rounded-full px-4 py-1.5 focus-within:border-purple-400/60 transition-colors shadow-inner">
                <Lock size={14} className="text-purple-500/60 mr-2" />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 bg-transparent text-purple-100 placeholder-purple-700/50 outline-none text-sm font-medium"
                    placeholder="Search or enter web address"
                    spellCheck={false}
                />
            </form>

            <div className="flex items-center space-x-1 text-purple-400">
                <button className="p-1.5 rounded hover:bg-purple-900/50 hover:text-purple-200"><Star size={18} /></button>
                <button className="p-1.5 rounded hover:bg-purple-900/50 hover:text-purple-200"><MoreHorizontal size={18} /></button>
            </div>
        </div>
    );
}
