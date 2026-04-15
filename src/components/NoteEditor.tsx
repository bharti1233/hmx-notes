import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { getNoteColorClass } from '@/lib/noteColors';
import { ColorPicker } from './ColorPicker';
import type { Note } from '@/hooks/useNotes';
import type { NoteColor } from '@/lib/noteColors';

interface NoteEditorProps {
  note: Note | null;
  open: boolean;
  onClose: () => void;
  onSave: (note: Partial<Note> & { id?: string }) => void;
}

export function NoteEditor({ note, open, onClose, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<string>('default');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(note?.title || '');
      setContent(note?.content || '');
      setColor(note?.color || 'default');
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [open, note]);

  if (!open) return null;

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      onClose();
      return;
    }
    onSave({ id: note?.id, title, content, color });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4" onClick={handleSave}>
      <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm" />
      <div
        className={`relative w-full max-w-xl rounded-xl shadow-2xl border border-border/50 ${getNoteColorClass(color)} z-10`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleSave}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-foreground/10 transition-colors text-muted-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-5 space-y-3">
          <input
            ref={titleRef}
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-lg font-medium text-foreground placeholder:text-muted-foreground outline-none"
          />
          <textarea
            placeholder="Take a note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full bg-transparent text-sm text-foreground/80 placeholder:text-muted-foreground outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between pt-2">
            <ColorPicker selected={color} onSelect={(c: NoteColor) => setColor(c)} />
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-sm font-medium text-foreground hover:bg-foreground/10 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
