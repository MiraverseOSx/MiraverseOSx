import React from 'react';
import { X, Plus } from 'lucide-react';

export default function TabBar({ tabs, activeTabId, onSwitch, onClose, onNew }) {
    return (
        <div className="flex items-center px-2 pt-2 bg-[#0d0724] border-b border-purple-500/20">
            <div className="flex space-x-1 overflow-x-auto flex-1 hide-scrollbar">
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        onClick={() => onSwitch(tab.id)}
                        className={`flex items-center group min-w-[120px] max-w-[200px] px-3 py-1.5 rounded-t-lg text-sm cursor-pointer transition-colors ${activeTabId === tab.id
                                ? 'bg-[#130b2e] text-purple-200 border-t border-x border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                                : 'bg-transparent text-purple-400/60 hover:bg-purple-900/30'
                            }`}
                    >
                        <span className="truncate flex-1">
                            {tab.url.replace(/^https?:\/\//, '').split('/')[0] || 'New Tab'}
                        </span>
                        <button
                            onClick={(e) => { e.stopPropagation(); onClose(tab.id); }}
                            className="ml-2 p-0.5 rounded-full hover:bg-purple-500/20 text-purple-400/60 hover:text-purple-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
            <button
                onClick={onNew}
                className="p-1.5 ml-2 rounded-full text-purple-400 hover:bg-purple-900/50 hover:text-purple-200 transition-colors"
                disabled={tabs.length >= 6}
            >
                <Plus size={18} />
            </button>
        </div>
    );
}
