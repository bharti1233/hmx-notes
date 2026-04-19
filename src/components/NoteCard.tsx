import { Pin, Flag, Lock } from 'lucide-react';
import { getNoteColorClass } from '@/lib/noteColors';
import type { Note } from '@/hooks/useNotes';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onTogglePin: (id: string, pinned: boolean) => void;
}

function tagBadgeClass(tag: string) {
  switch (tag) {
    case 'work': return 'bg-tag-work/15 text-tag-work';
    case 'personal': return 'bg-tag-personal/15 text-tag-personal';
    case 'ideas': return 'bg-tag-ideas/15 text-tag-ideas';
    default: return 'bg-muted text-muted-foreground';
  }
}

function formatDate(d: string) {
  const date = new Date(d);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function NoteCard({ note, onEdit, onTogglePin }: NoteCardProps) {
  return (
    <button
      onClick={() => onEdit(note)}
      className={`group relative w-full text-left rounded-2xl p-4 shadow-card border border-border/40 transition-all hover:-translate-y-0.5 hover:shadow-fab/30 active:scale-[0.99] ${getNoteColorClass(note.color)}`}
    >
      {/* Top row: priority + pin */}
      <div className="flex items-start justify-between gap-2 mb-2 min-h-[24px]">
        {note.priority ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-priority text-white text-[10px] font-semibold">
            <Flag className="h-3 w-3" fill="currentColor" />
            Priority
          </span>
        ) : <span />}
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onTogglePin(note.id, note.pinned); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onTogglePin(note.id, note.pinned); } }}
          className={`p-1.5 rounded-full transition-colors ${note.pinned ? 'text-primary' : 'text-muted-foreground opacity-0 group-hover:opacity-100'} hover:bg-foreground/5 cursor-pointer`}
          aria-label={note.pinned ? 'Unpin' : 'Pin'}
        >
          <Pin className="h-3.5 w-3.5" style={note.pinned ? { fill: 'currentColor' } : {}} />
        </span>
      </div>

      {note.title && (
        <h3 className="font-display font-bold text-foreground text-base leading-tight mb-2 line-clamp-2">
          {note.title}
        </h3>
      )}
      {note.content && (
        <p className="text-foreground/70 text-sm leading-relaxed line-clamp-4 whitespace-pre-wrap mb-3">
          {note.content}
        </p>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-1">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {note.tag && note.tag !== 'none' && (
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium truncate ${tagBadgeClass(note.tag)}`}>
              #{note.tag}
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground shrink-0">{formatDate(note.updated_at)}</span>
      </div>
    </button>
  );
}
