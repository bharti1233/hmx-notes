import { useState } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { useCustomTags } from '@/hooks/useCustomTags';

interface TagChipsProps {
  active: string;
  onChange: (tag: string) => void;
  counts?: Record<string, number>;
}

export function TagChips({ active, onChange, counts }: TagChipsProps) {
  const { allTags, addTag, removeTag } = useCustomTags();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const options = [{ id: 'all', label: 'All', custom: false }, ...allTags];

  const handleAdd = () => {
    const created = addTag(draft);
    if (created) onChange(created.id);
    setDraft('');
    setAdding(false);
  };

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeTag(id);
    if (active === id) onChange('all');
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
      {options.map(opt => {
        const isActive = active === opt.id;
        const count = counts?.[opt.id];
        const isCustom = 'custom' in opt && opt.custom;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`group shrink-0 inline-flex items-center px-4 h-9 rounded-full text-sm font-medium transition-all ${
              isActive
                ? 'bg-gradient-primary text-primary-foreground shadow-soft'
                : 'bg-card text-foreground/70 border border-border/60 hover:border-primary/30'
            }`}
          >
            <span>{opt.id === 'all' ? opt.label : `#${opt.label}`}</span>
            {count !== undefined && count > 0 && (
              <span className={`ml-1.5 text-xs ${isActive ? 'opacity-80' : 'opacity-60'}`}>{count}</span>
            )}
            {isCustom && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => handleRemove(e, opt.id)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRemove(e as unknown as React.MouseEvent, opt.id); }}
                aria-label={`Remove ${opt.label}`}
                className={`ml-1.5 -mr-1 inline-flex items-center justify-center h-5 w-5 rounded-full transition-opacity ${
                  isActive ? 'hover:bg-primary-foreground/20' : 'opacity-0 group-hover:opacity-100 hover:bg-foreground/10'
                }`}
              >
                <X className="h-3 w-3" />
              </span>
            )}
          </button>
        );
      })}

      {adding ? (
        <div className="shrink-0 inline-flex items-center h-9 rounded-full bg-card border border-primary/40 pl-3 pr-1 shadow-soft">
          <span className="text-sm text-muted-foreground mr-1">#</span>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') { setAdding(false); setDraft(''); }
            }}
            placeholder="new tag"
            maxLength={20}
            className="bg-transparent outline-none text-sm w-24 text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={handleAdd}
            aria-label="Add tag"
            className="ml-1 inline-flex items-center justify-center h-7 w-7 rounded-full bg-gradient-primary text-primary-foreground"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          aria-label="Add custom tag"
          className="shrink-0 inline-flex items-center gap-1 px-3 h-9 rounded-full text-sm font-medium bg-primary-soft text-primary border border-primary/20 hover:bg-primary/15 transition-all"
        >
          <Plus className="h-4 w-4" />
          New
        </button>
      )}
    </div>
  );
}
