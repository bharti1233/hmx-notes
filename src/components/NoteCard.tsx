import { Pin, Flag, CheckSquare, Image as ImageIcon } from 'lucide-react';
import { getNoteColorClass } from '@/lib/noteColors';
import type { Note } from '@/hooks/useNotes';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onTogglePin: (id: string, pinned: boolean) => void;
  onLongPress?: (note: Note) => void;
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
  if (date.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const LONG_PRESS_MS = 450;

export function NoteCard({ note, onEdit, onTogglePin, onLongPress }: NoteCardProps) {
  const cover = note.attachments?.[0];
  const checklistTotal = note.checklist?.length ?? 0;
  const checklistDone = note.checklist?.filter(c => c.done).length ?? 0;

  let pressTimer: ReturnType<typeof setTimeout> | null = null;
  let longPressed = false;

  const startPress = () => {
    longPressed = false;
    pressTimer = setTimeout(() => {
      longPressed = true;
      if (onLongPress) {
        if (navigator.vibrate) try { navigator.vibrate(30); } catch { /* noop */ }
        onLongPress(note);
      }
    }, LONG_PRESS_MS);
  };
  const cancelPress = () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } };

  return (
    <button
      onClick={() => { if (!longPressed) onEdit(note); }}
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      onContextMenu={(e) => { e.preventDefault(); onLongPress?.(note); }}
      className={`group relative w-full text-left rounded-2xl shadow-card border border-border/40 transition-all hover:-translate-y-0.5 hover:shadow-fab/30 active:scale-[0.98] overflow-hidden ${getNoteColorClass(note.color)}`}
      style={{ touchAction: 'manipulation' }}
    >
      {cover && (
        <div className="relative w-full h-28 bg-foreground/5">
          <img src={cover} alt="" className="w-full h-full object-cover" loading="lazy" />
          {note.attachments.length > 1 && (
            <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-background/80 backdrop-blur-sm text-[10px] font-semibold text-foreground">
              <ImageIcon className="h-3 w-3" /> {note.attachments.length}
            </span>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2 min-h-[20px]">
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
          <p className="text-foreground/70 text-sm leading-relaxed line-clamp-3 whitespace-pre-wrap mb-2">
            {note.content}
          </p>
        )}

        {checklistTotal > 0 && (
          <div className="mb-2">
            <div className="flex items-center gap-1.5 text-[11px] text-foreground/60 mb-1">
              <CheckSquare className="h-3 w-3" />
              <span className="font-medium">{checklistDone}/{checklistTotal}</span>
              <div className="flex-1 h-1 rounded-full bg-foreground/10 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(checklistDone / checklistTotal) * 100}%` }}
                />
              </div>
            </div>
            <ul className="space-y-0.5">
              {note.checklist.slice(0, 3).map(item => (
                <li key={item.id} className="flex items-center gap-1.5 text-xs text-foreground/70">
                  <span className={`inline-block h-3 w-3 rounded-sm border ${item.done ? 'bg-primary border-primary' : 'border-foreground/30'}`} />
                  <span className={item.done ? 'line-through opacity-60' : ''}>{item.text || '—'}</span>
                </li>
              ))}
              {checklistTotal > 3 && (
                <li className="text-[10px] text-foreground/50">+{checklistTotal - 3} more</li>
              )}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mt-1 pt-1">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {note.tag && note.tag !== 'none' && (
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium truncate ${tagBadgeClass(note.tag)}`}>
                #{note.tag}
              </span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0">{formatDate(note.updated_at)}</span>
        </div>
      </div>
    </button>
  );
}
