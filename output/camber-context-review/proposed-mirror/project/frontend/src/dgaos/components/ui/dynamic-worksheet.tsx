'use client';
import { useMemo, useState } from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { templates as defaultTemplates } from '@/lib/records';
import { FileSpreadsheet, Sparkles, Plus, Check } from 'lucide-react';

interface DynamicWorksheetProps {
  templateId?: string;
  module: string;
  method: string;
  values: Record<string, string>;
  onChange: (newValues: Record<string, string>, compiledText?: string) => void;
  onObservationsChange?: (text: string) => void;
  observations: string;
}

export function DynamicWorksheet({
  templateId,
  module,
  method,
  values,
  onChange,
  onObservationsChange,
  observations,
}: DynamicWorksheetProps) {
  const [insertedNotice, setInsertedNotice] = useState(false);

  const activeTemplate = useMemo(() => {
    let found = defaultTemplates.find((t) => t.id === templateId);
    if (!found) {
      found = defaultTemplates.find((t) => t.module === module && t.method.toLowerCase().includes(method.toLowerCase()));
    }
    if (!found && defaultTemplates.length > 0) {
      found = defaultTemplates.find((t) => t.module === module);
    }
    return found || null;
  }, [templateId, module, method]);

  // Compile scientific prose from current structured fields
  const compiledProse = useMemo(() => {
    if (!activeTemplate) return '';
    const sentences: string[] = [];
    sentences.push(`Laboratory examination performed according to ${activeTemplate.name} standard protocol.`);
    let hasValues = false;
    for (const f of activeTemplate.fields) {
      const v = values[f.name];
      if (v && v.trim()) {
        sentences.push(`${f.label}: ${v.trim()}.`);
        hasValues = true;
      }
    }
    return hasValues ? sentences.join(' ') : '';
  }, [activeTemplate, values]);

  const handleFieldChange = (fieldName: string, val: string) => {
    const updated = { ...values, [fieldName]: val };
    // Pass updated structured values to parent
    onChange(updated, compiledProse);

    // If observations are completely blank, pre-fill with compiled prose for convenience
    if (!observations.trim() && onObservationsChange) {
      const initialSentences: string[] = [
        `Laboratory examination performed according to ${activeTemplate?.name || 'standard'} protocol.`
      ];
      for (const f of activeTemplate?.fields || []) {
        const v = updated[f.name];
        if (v && v.trim()) initialSentences.push(`${f.label}: ${v.trim()}.`);
      }
      onObservationsChange(initialSentences.join(' '));
    }
  };

  const handleInsertOrAppendProse = () => {
    if (!compiledProse || !onObservationsChange) return;
    const current = observations.trim();
    if (!current) {
      onObservationsChange(compiledProse);
    } else if (!current.includes(compiledProse)) {
      onObservationsChange(`${current}\n\n${compiledProse}`);
    }
    setInsertedNotice(true);
    setTimeout(() => setInsertedNotice(false), 2000);
  };

  if (!activeTemplate || !activeTemplate.fields || activeTemplate.fields.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border rounded-md text-xs text-gray-500 flex items-center gap-2">
        <FileSpreadsheet size={15} className="text-gray-400" />
        <span>No custom template fields for this method. Use the observation text area below for documentation.</span>
      </div>
    );
  }

  return (
    <div className="dynamic-worksheet-card">
      <div className="worksheet-header flex items-center justify-between border-b pb-2 mb-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={16} className="text-purple-600" />
          <span className="font-bold text-xs text-gray-800 tracking-wide uppercase">
            STRUCTURED WORKSHEET: {activeTemplate.name}
          </span>
        </div>
        <span className="text-[10px] text-gray-500 font-medium">
          Saves parameters & enables repeatable observations
        </span>
      </div>

      {/* Structured Fields Grid */}
      <div className="worksheet-fields-grid">
        {activeTemplate.fields.map((f) => (
          <div key={f.name} className={f.type === 'textarea' ? 'col-span-2' : ''}>
            <label className="field text-xs">
              <span className="font-semibold text-gray-700">{f.label}</span>

              {f.type === 'select' && f.options ? (
                <Select
                  value={values[f.name] || ''}
                  onValueChange={(v) => handleFieldChange(f.name, String(v))}
                >
                  <SelectTrigger aria-label={f.label} className="bg-white text-xs h-9">
                    <SelectValue placeholder="Choose option…" />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : f.type === 'textarea' ? (
                <textarea
                  value={values[f.name] || ''}
                  onChange={(e) => handleFieldChange(f.name, e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2 border rounded border-gray-300 bg-white focus:outline-purple-500"
                  placeholder={`Document ${f.label.toLowerCase()}…`}
                />
              ) : (
                <input
                  type="text"
                  value={values[f.name] || ''}
                  onChange={(e) => handleFieldChange(f.name, e.target.value)}
                  className="w-full text-xs p-2 border rounded border-gray-300 bg-white focus:outline-purple-500 h-9"
                  placeholder={`Enter ${f.label.toLowerCase()}…`}
                />
              )}
            </label>
          </div>
        ))}
      </div>

      {/* Compiled Protocol Prose Preview & Safe Append Action */}
      {compiledProse && (
        <div className="mt-3 p-2.5 bg-purple-50/70 border border-purple-200 rounded-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1">
              <Sparkles size={12} className="text-purple-600 sparkle-hint-icon" />
              Compiled Protocol Summary
            </span>
            <button
              type="button"
              onClick={handleInsertOrAppendProse}
              className="text-xs px-2.5 py-1 bg-purple-600 text-white font-medium rounded hover:bg-purple-700 transition-colors flex items-center gap-1 shadow-sm"
              title="Append compiled protocol summary to observations without overwriting existing manual notes"
            >
              {insertedNotice ? <Check size={12} /> : <Plus size={12} />}
              {insertedNotice ? 'Appended to Observations!' : 'Append to Observations'}
            </button>
          </div>
          <p className="text-[11px] text-purple-950 font-mono leading-relaxed bg-white/80 p-2 rounded border border-purple-100">
            {compiledProse}
          </p>
        </div>
      )}

      {/* Official Observations Text Area (Manual Notes + Logs Protected) */}
      <div className="mt-4 pt-3 border-t">
        <div className="field text-xs">
          <label htmlFor="compiled-obs-narrative" className="flex items-center justify-between cursor-pointer mb-1">
            <span className="font-bold text-gray-800">CONTEMPORANEOUS OBSERVATIONS NARRATIVE</span>
            <span className="text-[10px] text-gray-500">
              Manual notes and instrument logs are preserved here
            </span>
          </label>
          <textarea
            id="compiled-obs-narrative"
            value={observations}
            onChange={(e) => onObservationsChange && onObservationsChange(e.target.value)}
            rows={4}
            className="w-full text-xs p-2.5 border rounded border-gray-300 bg-white focus:outline-purple-500 leading-relaxed font-mono"
            placeholder="Document physical observations, microscopic characteristics, reaction timestamps, and analytical findings..."
          />
        </div>
      </div>
    </div>
  );
}
