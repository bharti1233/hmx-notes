import { NOTE_TAGS } from '@/lib/noteColors';

interface TagChipsProps {
  active: string;
  onChange: (tag: string) => void;
  counts?: Record<string, number>;
}

const ALL_OPTIONS = [{ id: 'all', label: 'All' }, ...NOTE_TAGS.filter(t => t.id !== 'none')];

export function TagChips({ active, onChange, counts }: TagChipsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
      {ALL_OPTIONS.map(opt => {
        const isActive = active === opt.id;
        const count = counts?.[opt.id];
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`shrink-0 px-4 h-9 rounded-full text-sm font-medium transition-all ${
              isActive
                ? 'bg-gradient-primary text-primary-foreground shadow-soft'
                : 'bg-card text-foreground/70 border border-border/60 hover:border-primary/30'
            }`}
          >
            {opt.id === 'all' ? opt.label : `#${opt.label}`}
            {count !== undefined && count > 0 && (
              <span className={`ml-1.5 text-xs ${isActive ? 'opacity-80' : 'opacity-60'}`}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
