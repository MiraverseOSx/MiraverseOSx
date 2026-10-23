import content from '../data/broad-street-case.json' with { type: 'json' };
import { authoredReportText } from './reportText';
export const BROAD_STREET = content;
export const CASE_MISSION = 'ms-case-002';
export const CASE_ID = 'CASE-2026-002';
export const CASE_MAIL = 'CASE-002:MATEO:STATEMENT';
export interface CaseFinding { choice: string; citations: string[] }
export interface CaseReportDraft { text: string; html: string; findings: Record<string, CaseFinding> }
export interface CaseReview { id: string; submittedAt: string; version: string; acquired: string[]; draft: CaseReportDraft; accepted: boolean; feedback: string[] }
export interface CaseProgress { version: string; acquired: string[]; witnessRequested: boolean; draft: CaseReportDraft; reviews: CaseReview[] }
export const CASE_FINDINGS = [
  { id: 'entry', title: 'How was access obtained and the vault breached?', options: [
    { id: 'digital-only', label: 'A badge event alone opened the reinforced vault.' },
    { id: 'combined', label: 'The records support credential replay followed by an exothermic physical breach.' },
    { id: 'routine', label: 'The records establish an ordinary scheduled maintenance visit.' }], expected: 'combined', required: ['access-audit', 'thermal-log', 'metallurgy'], feedback: 'Review the relationship between the access event, localized heating, and material findings. Cite the original sources for each part of your reconstruction.' },
  { id: 'identity', title: 'What does the evidence establish about Silas Drake?', options: [
    { id: 'association', label: 'The profile and material comparisons support an association; timing and individual roles still require corroboration.' },
    { id: 'verdict', label: 'The DNA statistic is a numerical probability of guilt and proves the full sequence.' },
    { id: 'none', label: 'No source connects Drake with any recovered material.' }], expected: 'association', required: ['dna', 'metallurgy'], feedback: 'Separate a laboratory association from a complete incident reconstruction. Support the conclusion with both laboratory records and acknowledge their limits.' },
  { id: 'guard', title: 'What can be concluded about the guard’s badge and account?', options: [
    { id: 'badge-guilt', label: 'The badge identifier proves Cruz personally used the reader.' },
    { id: 'policy-proof', label: 'A public maintenance policy proves who was present that night.' },
    { id: 'credential-limit', label: 'A credential transaction does not identify its user; compare the statement and policy without treating either as proof of attendance.' }], expected: 'credential-limit', required: ['access-audit', 'guard-statement', 'maintenance'], feedback: 'Compare what the transaction log, requested statement, and public notice can each establish. Cite all three and distinguish a credential from a person.' },
] as const;
export const caseSource = (id: string) => BROAD_STREET.sources.find(source => source.id === id);
export function restoreCaseProgress(value: unknown): CaseProgress {
  const saved = value as Partial<CaseProgress> | null;
  const raw = saved?.draft;
  const findings: Record<string, CaseFinding> = {};
  for (const finding of CASE_FINDINGS) {
    const entry = raw?.findings?.[finding.id];
    findings[finding.id] = { choice: typeof entry?.choice === 'string' ? entry.choice.slice(0, 100) : '', citations: Array.isArray(entry?.citations) ? [...new Set(entry.citations.filter(id => typeof id === 'string'))].slice(0, 20) : [] };
  }
  return { version: typeof saved?.version === 'string' ? saved.version : BROAD_STREET.version,
    acquired: Array.isArray(saved?.acquired) ? [...new Set(saved.acquired.filter(id => typeof id === 'string' && caseSource(id)))] : [],
    witnessRequested: saved?.witnessRequested === true,
    draft: { text: typeof raw?.text === 'string' ? raw.text.slice(0, 12000) : '', html: typeof raw?.html === 'string' ? raw.html.slice(0, 100000) : '', findings },
    reviews: Array.isArray(saved?.reviews) ? saved.reviews.filter(item => item && typeof item.id === 'string' && typeof item.version === 'string' && Array.isArray(item.acquired) && item.acquired.every(id => typeof id === 'string') && Array.isArray(item.feedback) && item.feedback.every(text => typeof text === 'string') && item.draft && typeof item.draft.text === 'string' && item.draft.findings && CASE_FINDINGS.every(finding => typeof item.draft.findings[finding.id]?.choice === 'string' && Array.isArray(item.draft.findings[finding.id]?.citations))) : [] };
}
export function reviewBroadStreet(progress: CaseProgress): string[] {
  const feedback: string[] = [];
  if (progress.version !== BROAD_STREET.version) feedback.push('This work order uses a different content version. Its saved work is preserved; this version cannot be reviewed automatically.');
  if (BROAD_STREET.sources.some(source => !progress.acquired.includes(source.id))) feedback.push('Acquire all six source records before submitting the report.');
  if (authoredReportText(progress.draft.text).length < 80) feedback.push('Write at least 80 characters of your own explanation, covering your findings and what remains uncertain. Outline headings and placeholders do not count.');
  for (const finding of CASE_FINDINGS) {
    const submitted = progress.draft.findings[finding.id];
    if (!submitted || submitted.choice !== finding.expected) { feedback.push(finding.feedback); continue; }
    const relevant = finding.required as readonly string[];
    if (submitted.citations.some(id => !caseSource(id) || !progress.acquired.includes(id) || !relevant.includes(id))) feedback.push(`${finding.title} Remove unknown, unacquired, or unrelated citations.`);
    if (!relevant.every(id => submitted.citations.includes(id))) feedback.push(`${finding.title} Supply the supporting sources for every part of this finding.`);
  }
  return feedback;
}
export function caseCompletionText(value: unknown): string {
  const progress = restoreCaseProgress(value);
  const report = [...progress.reviews].reverse().find(review => review.accepted)?.draft || progress.draft;
  return `WRITTEN EXPLANATION\n${report.text}\n\nSUPPORTED FINDINGS\n${CASE_FINDINGS.map(finding => {
    const result = report.findings[finding.id];
    return `${finding.title}\n${finding.options.find(option => option.id === result?.choice)?.label || 'Not recorded'}\nSources: ${(result?.citations || []).map(id => caseSource(id)?.title || 'Unknown source').join('; ')}`;
  }).join('\n\n')}\n\nFull submitted versions remain in the case report history.`;
}
export function legacyCaseComplete(player: any, dgaState?: any, traceState?: any): boolean {
  const aliases = [CASE_ID, BROAD_STREET.caseNumber, CASE_MISSION];
  const containsAlias = (value: unknown) => Array.isArray(value) && value.some(id => typeof id === 'string' && aliases.includes(id));
  if (containsAlias(player?.solvedInvestigationCaseIds) || containsAlias(player?.completedWorknetMissionIds)) return true;
  if (Array.isArray(player?.rewardedWorkOrderIds) && player.rewardedWorkOrderIds.includes(`WORK:${CASE_MISSION}:once`)) return true;
  const closed = (value: unknown) => typeof value === 'string' && ['CLOSED', 'FINALIZED', 'COMPLETED', 'ACCEPTED'].includes(value.toUpperCase());
  const cases = Array.isArray(dgaState?.cases) ? dgaState.cases : [];
  return Boolean(cases.some((item: any) => item && typeof item === 'object' && (aliases.includes(item.id) || aliases.includes(item.linkedTraceCaseId) || aliases.includes(item.caseNumber)) && closed(item.status))
    || traceState?.meta && aliases.includes(traceState.meta.id) && closed(traceState.meta.status));
}
