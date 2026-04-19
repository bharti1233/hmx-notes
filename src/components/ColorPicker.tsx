import { NOTE_COLORS, type NoteColor } from '@/lib/noteColors';
import { Check } from 'lucide-react';

interface ColorPickerProps {
  selected: string;
  onSelect: (color: NoteColor) => void;
}

export function ColorPicker({ selected, onSelect }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {NOTE_COLORS.map(color => (
        <button
          key={color.id}
          type="button"
          onClick={() => onSelect(color.id)}
          className={`w-9 h-9 rounded-full ${color.swatch} flex items-center justify-center transition-all hover:scale-110 ${
            selected === color.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
          }`}
          aria-label={color.label}
          title={color.label}
        >
          {selected === color.id && <Check className="h-4 w-4 text-foreground/70" />}
        </button>
      ))}
    </div>
  );
}
