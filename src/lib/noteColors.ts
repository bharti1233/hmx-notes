export const NOTE_COLORS = [
  { id: 'default', label: 'Default', class: 'note-default', swatch: 'bg-white border border-border' },
  { id: 'yellow', label: 'Yellow', class: 'note-yellow', swatch: 'note-yellow' },
  { id: 'coral', label: 'Coral', class: 'note-coral', swatch: 'note-coral' },
  { id: 'lavender', label: 'Lavender', class: 'note-lavender', swatch: 'note-lavender' },
  { id: 'mint', label: 'Mint', class: 'note-mint', swatch: 'note-mint' },
  { id: 'sky', label: 'Sky', class: 'note-sky', swatch: 'note-sky' },
  { id: 'peach', label: 'Peach', class: 'note-peach', swatch: 'note-peach' },
  { id: 'rose', label: 'Rose', class: 'note-rose', swatch: 'note-rose' },
] as const;

export type NoteColor = typeof NOTE_COLORS[number]['id'];

export function getNoteColorClass(color: string): string {
  const found = NOTE_COLORS.find(c => c.id === color);
  return found ? found.class : 'note-default';
}

export const NOTE_TAGS = [
  { id: 'none', label: 'None' },
  { id: 'work', label: 'Work' },
  { id: 'personal', label: 'Personal' },
  { id: 'ideas', label: 'Ideas' },
] as const;

export type NoteTag = typeof NOTE_TAGS[number]['id'];
