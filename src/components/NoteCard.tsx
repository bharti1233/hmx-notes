import { useState } from 'react';
import { Pin, Trash2, Palette } from 'lucide-react';
import { getNoteColorClass } from '@/lib/noteColors';
import { ColorPicker } from './ColorPicker';
import type { Note } from '@/hooks/useNotes';
import type { NoteColor } from '@/lib/noteColors';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, pinned: boolean) => void;
  onUpdateColor: (id: string, color: string) => void;
}

export function NoteCard({ note, onEdit, onDelete, onTogglePin, onUpdateColor }: NoteCardProps) {
  const [showColors, setShowColors] = useState(false);

  return (
    <div
      className={`group relative rounded-lg border border-border/50 p-4 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${getNoteColorClass(note.color)}`}
      onClick={() => onEdit(note)}
    >
      {note.title && (
        <h3 className="font-medium text-foreground mb-1.5 text-sm leading-snug line-clamp-2">
          {note.title}
        </h3>
      )}
      {note.content && (
        <p className="text-foreground/70 text-sm leading-relaxed line-clamp-6 whitespace-pre-wrap">
          {note.content}
        </p>
      )}

      {/* Action buttons */}
      <div
        className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onTogglePin(note.id, note.pinned)}
          className={`p-1.5 rounded-full hover:bg-foreground/10 transition-colors ${note.pinned ? 'text-primary' : 'text-muted-foreground'}`}
          title={note.pinned ? 'Unpin' : 'Pin'}
        >
          <Pin className="h-4 w-4" style={note.pinned ? { fill: 'currentColor' } : {}} />
        </button>
        <button
          onClick={() => setShowColors(!showColors)}
          className="p-1.5 rounded-full hover:bg-foreground/10 transition-colors text-muted-foreground"
          title="Change color"
        >
          <Palette className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(note.id)}
          className="p-1.5 rounded-full hover:bg-foreground/10 transition-colors text-muted-foreground hover:text-destructive"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {showColors && (
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          <ColorPicker
            selected={note.color}
            onSelect={(color: NoteColor) => {
              onUpdateColor(note.id, color);
              setShowColors(false);
            }}
          />
        </div>
      )}

      {note.pinned && (
        <Pin className="absolute top-3 right-3 h-3.5 w-3.5 text-foreground/40" style={{ fill: 'currentColor' }} />
      )}
    </div>
  );
}
