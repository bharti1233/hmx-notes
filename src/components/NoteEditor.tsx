import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Flag, Lock, Archive, Trash2, Pin } from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { getNoteColorClass, type NoteColor } from '@/lib/noteColors';
import { useCustomTags } from '@/hooks/useCustomTags';
import type { Note } from '@/hooks/useNotes';

interface NoteEditorProps {
  note: Note | null;
  open: boolean;
  onClose: () => void;
  onSave: (note: Partial<Note> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}

export function NoteEditor({ note, open, onClose, onSave, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<string>('default');
  const [tag, setTag] = useState<string>('none');
  const [priority, setPriority] = useState(false);
  const [pinned, setPinned] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const { allTags } = useCustomTags();
  const tagOptions = [{ id: 'none', label: 'None' }, ...allTags];

  useEffect(() => {
    if (open) {
      setTitle(note?.title || '');
      setContent(note?.content || '');
      setColor(note?.color || 'default');
      setTag(note?.tag || 'none');
      setPriority(note?.priority || false);
      setPinned(note?.pinned || false);
      setTimeout(() => titleRef.current?.focus(), 80);
    }
  }, [open, note]);

  if (!open) return null;

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      onClose();
      return;
    }
    onSave({ id: note?.id, title, content, color, tag, priority, pinned });
    onClose();
  };

  const handleDelete = () => {
    if (note && onDelete) {
      onDelete(note.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-150">
      {/* Header */}
      <header className={`sticky top-0 z-10 ${getNoteColorClass(color)} border-b border-border/40`}>
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="p-2 -ml-2 rounded-full hover:bg-foreground/5 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <h2 className="font-display font-semibold text-base text-foreground">
              {note ? 'Edit Note' : 'New Note'}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPinned(p => !p)}
              className={`p-2 rounded-full hover:bg-foreground/5 transition-colors ${pinned ? 'text-primary' : 'text-muted-foreground'}`}
              aria-label={pinned ? 'Unpin' : 'Pin'}
            >
              <Pin className="h-5 w-5" style={pinned ? { fill: 'currentColor' } : {}} />
            </button>
            <button
              onClick={handleSave}
              className="p-2 rounded-full hover:bg-foreground/5 transition-colors"
              aria-label="Save"
            >
              <Check className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className={`flex-1 overflow-y-auto ${getNoteColorClass(color)}`}>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          {/* Color picker row */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Color</p>
            <ColorPicker selected={color} onSelect={(c: NoteColor) => setColor(c)} />
          </div>

          {/* Title card */}
          <div className="bg-card rounded-2xl shadow-soft p-4 border border-border/40">
            <input
              ref={titleRef}
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent font-display font-bold text-lg text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>

          {/* Content card */}
          <div className="bg-card rounded-2xl shadow-soft p-4 border border-border/40">
            <textarea
              placeholder="Start writing..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full bg-transparent text-sm text-foreground/85 placeholder:text-muted-foreground outline-none resize-none leading-relaxed min-h-[180px]"
            />
          </div>

          {/* Action chips */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setPriority(p => !p)}
              className={`flex flex-col items-center justify-center gap-1.5 h-20 rounded-2xl border transition-all ${
                priority
                  ? 'bg-gradient-priority text-white border-transparent shadow-soft'
                  : 'bg-card border-border/60 text-muted-foreground hover:border-primary/30'
              }`}
            >
              <Flag className="h-5 w-5" fill={priority ? 'currentColor' : 'none'} />
              <span className="text-xs font-semibold">Priority</span>
            </button>
            <button
              type="button"
              disabled
              className="flex flex-col items-center justify-center gap-1.5 h-20 rounded-2xl bg-card border border-border/60 text-muted-foreground/50 cursor-not-allowed"
              title="Coming soon"
            >
              <Lock className="h-5 w-5" />
              <span className="text-xs font-semibold">Lock</span>
            </button>
            <button
              type="button"
              disabled
              className="flex flex-col items-center justify-center gap-1.5 h-20 rounded-2xl bg-card border border-border/60 text-muted-foreground/50 cursor-not-allowed"
              title="Coming soon"
            >
              <Archive className="h-5 w-5" />
              <span className="text-xs font-semibold">Archive</span>
            </button>
          </div>

          {/* Tag selector */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Tag</p>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTag(t.id)}
                  className={`px-3 h-9 rounded-full text-sm font-medium transition-all ${
                    tag === t.id
                      ? 'bg-gradient-primary text-primary-foreground shadow-soft'
                      : 'bg-card text-foreground/70 border border-border/60'
                  }`}
                >
                  {t.id === 'none' ? 'None' : `#${t.label}`}
                </button>
              ))}
            </div>
          </div>

          {/* Delete */}
          {note && onDelete && (
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-destructive/10 text-destructive font-semibold text-sm hover:bg-destructive/15 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Note
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
