import { NoteCard } from './NoteCard';
import type { Note } from '@/hooks/useNotes';

interface NotesGridProps {
  notes: Note[];
  label?: string;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, pinned: boolean) => void;
  onUpdateColor: (id: string, color: string) => void;
}

export function NotesGrid({ notes, label, onEdit, onDelete, onTogglePin, onUpdateColor }: NotesGridProps) {
  if (notes.length === 0) return null;

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-1">
          {label}
        </p>
      )}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">
        {notes.map(note => (
          <div key={note.id} className="break-inside-avoid">
            <NoteCard
              note={note}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePin={onTogglePin}
              onUpdateColor={onUpdateColor}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
