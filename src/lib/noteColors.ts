export const NOTE_COLORS = [
  { id: 'default', label: 'Default', class: 'note-default' },
  { id: 'coral', label: 'Coral', class: 'note-coral' },
  { id: 'peach', label: 'Peach', class: 'note-peach' },
  { id: 'sand', label: 'Sand', class: 'note-sand' },
  { id: 'mint', label: 'Mint', class: 'note-mint' },
  { id: 'sage', label: 'Sage', class: 'note-sage' },
  { id: 'fog', label: 'Fog', class: 'note-fog' },
  { id: 'storm', label: 'Storm', class: 'note-storm' },
  { id: 'dusk', label: 'Dusk', class: 'note-dusk' },
  { id: 'blossom', label: 'Blossom', class: 'note-blossom' },
] as const;

export type NoteColor = typeof NOTE_COLORS[number]['id'];

export function getNoteColorClass(color: string): string {
  const found = NOTE_COLORS.find(c => c.id === color);
  return found ? found.class : 'note-default';
}
