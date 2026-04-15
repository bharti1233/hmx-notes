import { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { getNoteColorClass } from '@/lib/noteColors';
import { ColorPicker } from './ColorPicker';
import type { NoteColor } from '@/lib/noteColors';

interface AddNoteInputProps {
  onAdd: (note: { title: string; content: string; color: string }) => void;
}

export function AddNoteInput({ onAdd }: AddNoteInputProps) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<string>('default');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    if (title.trim() || content.trim()) {
      onAdd({ title, content, color });
    }
    setTitle('');
    setContent('');
    setColor('default');
    setExpanded(false);
  };

  if (!expanded) {
    return (
      <div
        className="max-w-xl mx-auto rounded-lg border border-border shadow-md cursor-text bg-card px-4 py-3 transition-shadow hover:shadow-lg"
        onClick={() => setExpanded(true)}
      >
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm flex-1">Take a note...</span>
          <Plus className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`max-w-xl mx-auto rounded-lg border border-border shadow-lg ${getNoteColorClass(color)}`}
    >
      <div className="p-4 space-y-2">
        <input
          autoFocus
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent font-medium text-foreground placeholder:text-muted-foreground outline-none"
        />
        <textarea
          placeholder="Take a note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full bg-transparent text-sm text-foreground/80 placeholder:text-muted-foreground outline-none resize-none leading-relaxed"
        />
        <div className="flex items-center justify-between pt-1">
          <ColorPicker selected={color} onSelect={(c: NoteColor) => setColor(c)} />
          <button
            onClick={handleClose}
            className="px-4 py-1.5 text-sm font-medium text-foreground hover:bg-foreground/10 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
