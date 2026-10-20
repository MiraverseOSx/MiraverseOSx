/** Confirmed scope rules; scenario text and interaction timing remain prototype tuning. */
export const ACTIVITY_HIERARCHY = ['journey', 'adventure', 'mission', 'quest', 'task'] as const;
export type DiscoveryPresentation = 'quest' | 'journal' | 'clue' | 'adventure' | 'location';
export interface DiscoveryEntry { id: string; title: string; text: string; presentation: DiscoveryPresentation; discoveredAt: string; opportunityId?: string; reward?: string; }
export interface WorldJournal {
  openRequest: number;
  currentPlace: string;
  visitedPlaces: string[];
  entries: Record<string, DiscoveryEntry>;
  revealedOpportunities: string[];
  notifications: Record<string, { title: string; message: string; presentation: DiscoveryPresentation; opportunityId?: string; read: boolean }>;
  branches: Record<string, { choice: string; selectedAt: string; consequence: string }>;
  flags: string[];
  explorationRewards: string[];
  scenesSeen: string[];
  life: { familiarity: Record<string, number>; minutesSpent: number; arrangement: string; history: { activity: string; detail: string; cycle: number; minutes: number }[] };
}
export const emptyWorldJournal = (): WorldJournal => ({ openRequest: 0, currentPlace: '', visitedPlaces: [], entries: {}, revealedOpportunities: [], notifications: {}, branches: {}, flags: [], explorationRewards: [], scenesSeen: [], life: { familiarity: {}, minutesSpent: 0, arrangement: '', history: [] } });
export const EXPLORATION_PLACES = [
  { id: 'garden', name: 'Glassline Botanical Garden', description: 'Walk the promenade, stop at the fountain, or see who is around.' },
  { id: 'platform', name: 'Glassline transit platform', description: 'Listen to the city between arrivals. There is no assigned objective here.' },
  { id: 'junction', name: 'Terminal Junction 12', description: 'Look around the public side of the relay station. Institutional equipment still requires an assignment.' },
];
const hasEntry = (player: any, id: string) => Boolean(player.worldJournal?.entries?.[id]);
export const hasRelayKnowledge = (player: any) => Object.values(player.taskResults || {}).some((result: any) => result.definitionId === 'ms-shift-04' && ['inspect', 'diagnose'].includes(result.stageId) && result.subject === 'GL-12A') || player.inspectedFiles?.includes('net-relay');
interface DiscoveryPoint {
  id: string; place: string; action: string; title: string; text: string; presentation: DiscoveryPresentation;
  opportunityId?: string; reward?: string; visible: (player: any) => boolean;
}
export const DISCOVERY_POINTS: DiscoveryPoint[] = [
  { id: 'garden-request', place: 'garden', action: 'Speak with the resident by the fountain', title: 'A resident asks for help', text: 'An elder describes a lost engraved silver chronometer. You can review the request and decide whether to help.', presentation: 'quest', opportunityId: 'qn-02', visible: () => true },
  { id: 'platform-hum', place: 'platform', action: 'Listen between train arrivals', title: 'A rhythm beneath the platform', text: 'A low repeating note continues after the train has gone. It seems to rise from beneath the relay housing. For now, it is only something you noticed.', presentation: 'clue', visible: () => true },
  { id: 'etched-token', place: 'platform', action: 'Examine the loose panel beside the relay', title: 'An unrecognized etched token', text: 'A small token is caught beneath the panel. Its pattern resembles a circuit junction, but you do not yet know what it signifies. The observation is kept in your Discovery Journal.', presentation: 'journal', visible: player => hasEntry(player, 'platform-hum') },
  { id: 'glassline-inquiry', place: 'junction', action: 'Compare the token with the relay records', title: 'A connection worth investigating', text: 'The token and the platform rhythm connect to the relay fault. An optional Glassline inquiry is now available; reviewing it does not commit you to it.', presentation: 'quest', opportunityId: 'quest-glassline', visible: player => hasEntry(player, 'etched-token') && hasRelayKnowledge(player) },
  { id: 'old-factory-lead', place: 'junction', action: 'Follow the repeated carrier in the records', title: 'The investigation opens out', text: 'Your relay findings and the platform rhythm point beyond a single fault, toward the buried infrastructure of Old Factory Ward. A field invitation is ready if you want to follow it.', presentation: 'adventure', opportunityId: 'adventure-old-factory', visible: player => hasEntry(player, 'platform-hum') && hasRelayKnowledge(player) },
  { id: 'quiet-overlook', place: 'platform', action: 'Follow the maintenance footpath on the old diagram', title: 'A quiet overlook', text: 'The diagram leads to a sheltered view across the transit lines. You keep a sketch of the skyline. This place can matter on its own, without becoming an assignment.', presentation: 'location', reward: 'Glassline overlook sketch', visible: player => hasRelayKnowledge(player) },
  { id: 'neighbor-directions', place: 'garden', action: 'Ask a familiar neighbor about quiet places', title: 'Directions from a familiar face', text: 'Someone from your established social circle describes a sheltered transit overlook. You keep the directions for another day.', presentation: 'journal', visible: player => Boolean(player.maiSpaceProfile?.acceptedFriends?.length) },
  { id: 'neighbor-overlook', place: 'platform', action: 'Try the footpath your neighbor described', title: 'The overlook your neighbor mentioned', text: 'The directions lead to a sheltered view across the transit lines. You keep a sketch of the skyline, without opening a Quest.', presentation: 'location', reward: 'Glassline overlook sketch', visible: player => hasEntry(player, 'neighbor-directions') },
  { id: 'dispatch-review', place: 'junction', action: 'Request the coordinated procedure review', title: 'Dispatch reviews your preparation', text: 'Your coordinated approach gives you access to a remote review: isolate the supply, compare the component ratings, and preserve the before-and-after readings. Guidance does not replace performing your assigned Tasks.', presentation: 'journal', visible: player => Boolean(player.worldJournal?.flags?.includes('dispatch-support')) },
  { id: 'independent-sketch', place: 'junction', action: 'Annotate the site in your independent notebook', title: 'An independent field sketch', text: 'You preserve your own map of the relay site. No dispatch review is attached to this route; your accepted findings must stand on their own evidence.', presentation: 'journal', visible: player => Boolean(player.worldJournal?.flags?.includes('independent-notebook')) },
];
export const HIDDEN_OPPORTUNITIES: Record<string, string> = { 'quest-glassline': 'glassline-inquiry', 'adventure-old-factory': 'old-factory-lead', 'adventure-relay-response': 'relay-response' };
export function isOpportunityRevealed(id: string, player: any): boolean {
  return !Object.hasOwn(HIDDEN_OPPORTUNITIES, id) || Boolean(player.worldJournal?.revealedOpportunities?.includes(id) || player.assignmentJournal?.started?.[id] || player.assignmentJournal?.claimed?.[id] || player.assignmentJournal?.dispatches?.[id]);
}
export function availableDiscoveryPoints(player: any) {
  return DISCOVERY_POINTS.filter(point => point.place === player.worldJournal?.currentPlace && point.visible(player));
}
export const DAILY_ACTIVITIES = [
  { id: 'cook', title: 'Make a meal', choices: ['Vegetable soup', 'Warm rice bowl', 'Tea and toast'], steps: ['Choose something to make', 'Prepare the ingredients', 'Cook and serve'], minutes: 25 },
  { id: 'clean', title: 'Tidy the room', choices: ['Desk and shelves', 'Kitchen counter', 'Living space'], steps: ['Choose an area', 'Put things away', 'Wipe and finish'], minutes: 15 },
  { id: 'decorate', title: 'Rearrange your space', choices: ['Plant by the window', 'Photos above the desk', 'Reading lamp by the chair'], steps: ['Choose an arrangement', 'Clear a space', 'Place and adjust'], minutes: 15 },
  { id: 'socialize', title: 'Spend time with a neighbor', choices: ['Share the day', 'Talk about the city', 'Sit together quietly'], steps: ['Choose a conversation', 'Make time to listen', 'Say goodbye'], minutes: 20 },
] as const;
export function dailyActivityPlan(id: string, player: any) {
  const definition = DAILY_ACTIVITIES.find(activity => activity.id === id);
  if (!definition) return undefined;
  const count = player.worldJournal?.life?.familiarity?.[id] || 0;
  return { ...definition, familiar: count >= 3, steps: count >= 3 ? [definition.steps[0], definition.steps[2]] : [...definition.steps], minutes: count >= 3 ? Math.ceil(definition.minutes * .75) : definition.minutes };
}
export const ADVENTURE_CHOICES = [
  { id: 'coordinate', label: 'Coordinate with field dispatch', consequence: 'Dispatch is informed. A remote procedure review is available during your assigned repair.', flag: 'dispatch-support' },
  { id: 'independent', label: 'Keep an independent field notebook', consequence: 'You keep an independent evidence trail. The investigation remains open; remote dispatch guidance is unavailable for this route.', flag: 'independent-notebook' },
] as const;
export const ADVENTURE_SCENES = [{ id: 'old-factory-arrival', adventureId: 'adventure-old-factory', title: 'Beneath the transit lights', beats: ['The platform lights fade as a train passes overhead. Beneath the ordinary noise of the city, the relay’s repeating note returns.', 'On the old maintenance diagram, Junction 12 and Tunnel 09 meet at a line that disappears below the page.', 'You fold the diagram and choose how to follow the lead. Your next steps will need evidence, preparation, and a record of what you find.'] }];

export const STARTER_CONCEPTS = ['A Life of Your Own', 'The Missing Delivery', 'The Unfinished Apartment', 'The Community Garden', 'The Student Research Project', 'The Festival Committee', 'An Unusual Signal', 'The Forgotten Greenhouse', 'The Underground Network', 'The Lost Expedition', 'Under Aureline', 'The Path of Discovery'] as const;
