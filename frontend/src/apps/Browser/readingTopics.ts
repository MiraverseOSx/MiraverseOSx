import type { TopicPack } from './searchTopics';

// Keep the established public reading collections alongside the newer world
// topics. Their IDs are persisted in bookmarks, downloaded files and catalogs.
const readings = [
  { id: 'dog', label: 'Dogs', aliases: ['dog', 'dogs', 'puppy', 'puppies', 'canine'], headline: 'Dogs in the neighborhood', intro: 'An observation notebook about familiar canine companions.', detail: 'Compare observable behavior and surroundings, and keep a source record for the descriptions you collect.' },
  { id: 'cat', label: 'Cats', aliases: ['cat', 'cats', 'kitten', 'kittens', 'feline'], headline: 'A closer look at cats', intro: 'A public collection for observing cats and their everyday surroundings.', detail: 'Record what you observe without assuming that a single encounter explains every animal.' },
  { id: 'animals', label: 'Animals', aliases: ['animal', 'animals', 'wildlife'], headline: 'Animal life around Aureline', intro: 'Notes and public references for learning about animal life.', detail: 'Record the location and context of each observation and compare descriptions across sources.' },
  { id: 'plants', label: 'Plants', aliases: ['plant', 'plants', 'flower', 'flowers', 'sunflower'], headline: 'The botanical observation notebook', intro: 'A collection of plant studies and garden observations.', detail: 'Compare leaf shapes, growth patterns and the context of the reference image before naming a specimen.' },
  { id: 'food', label: 'Food', aliases: ['food', 'cooking', 'recipe', 'recipes'], headline: 'The everyday kitchen', intro: 'A place for meal-planning notes and household food traditions.', detail: 'Keep the source and context of a recipe with your own preparation notes.' },
  { id: 'housing', label: 'Housing', aliases: ['housing', 'home', 'homes', 'apartment'], headline: 'Making a place of your own', intro: 'Public reading about residence and everyday home life.', detail: 'Compare public residence information with your own HOMECRAFT record; reading a listing does not assign a room.' },
  { id: 'travel', label: 'Travel', aliases: ['travel', 'transit', 'journey'], headline: 'Finding your way through the city', intro: 'An orientation notebook for public places and transit connections.', detail: 'The map is schematic. Check the relevant location’s access guidance before planning an in-world visit.' },
  { id: 'technology', label: 'Technology', aliases: ['technology', 'tech', 'computing'], headline: 'Tools, systems and useful questions', intro: 'A working notebook for comparing technical explanations.', detail: 'Keep system descriptions separate from tested findings, and record which source supports each claim.' },
  { id: 'education', label: 'Education', aliases: ['education', 'learning', 'study'], headline: 'A place to keep learning', intro: 'Public study methods and reading-room resources.', detail: 'Organize a question, compare sources and keep notes. Browsing this collection does not issue an academic qualification.' },
  { id: 'health', label: 'Health', aliases: ['health', 'wellness', 'recovery'], headline: 'Understanding your personal wellness record', intro: 'A guide to reading personal bio-aura information in Meridion.', detail: 'World conditions and personal VITALS readings describe different things. Use the relevant civic service to inspect your own record.' },
  { id: 'work', label: 'Work', aliases: ['work', 'jobs', 'employment'], headline: 'Preparing for your next assignment', intro: 'Public reading about work and institutional responsibilities.', detail: 'Review opportunities and existing requirements in WORKNET. A public search does not accept a contract or award pay.' },
  { id: 'history', label: 'History', aliases: ['history', 'historical', 'heritage'], headline: 'Following a historical source trail', intro: 'A notebook for comparing public accounts of the past.', detail: 'Keep the source date, author and publication context. An archival reference is not a release of sealed records.' },
];
export const READING_TOPICS: TopicPack[] = readings.map(item => ({
  ...item, publisher: 'Aureline Open Reading Room', introduction: item.intro,
  paragraphs: [item.intro, item.detail, 'The public reading room offers a notebook, a source-comparison sheet and a schematic map. These resources are separate from assignments, private records and formal progression.'],
  guide: `${item.label} — observation and source guide`,
  steps: ['Write a focused question.', 'Record an observation and its source.', 'Compare a second public account.', 'Keep unresolved questions with your notes.'],
  places: ['Aureline City Library', 'CIVINET public desk', 'Glassline Botanical Garden'], related: 'education',
}));
