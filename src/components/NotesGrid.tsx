import { NoteCard } from './NoteCard';
import type { Note } from '@/hooks/useNotes';

interface NotesGridProps {
  notes: Note[];
  label?: string;
  onEdit: (note: Note) => void;
  onTogglePin: (id: string, pinned: boolean) => void;
  onLongPress?: (note: Note) => void;
}

export function NotesGrid({ notes, label, onEdit, onTogglePin, onLongPress }: NotesGridProps) {
  if (notes.length === 0) return null;

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
          {label}
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {notes.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={onEdit}
            onTogglePin={onTogglePin}
            onLongPress={onLongPress}
          />
        ))}
      </div>
    </div>
  );
}
