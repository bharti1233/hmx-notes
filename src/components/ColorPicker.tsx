import { NOTE_COLORS, type NoteColor } from '@/lib/noteColors';
import { Check } from 'lucide-react';

interface ColorPickerProps {
  selected: string;
  onSelect: (color: NoteColor) => void;
}

export function ColorPicker({ selected, onSelect }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {NOTE_COLORS.map(color => (
        <button
          key={color.id}
          onClick={() => onSelect(color.id)}
          className={`w-7 h-7 rounded-full ${color.class} border-2 transition-all flex items-center justify-center hover:scale-110 ${
            selected === color.id ? 'border-foreground/50' : 'border-transparent'
          }`}
          title={color.label}
        >
          {selected === color.id && <Check className="h-3.5 w-3.5 text-foreground/70" />}
        </button>
      ))}
    </div>
  );
}
