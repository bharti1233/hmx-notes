import { ArrowDownUp, Calendar, Clock, Type as TypeIcon, Palette, Flag, Check } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { SortMode } from '@/hooks/useNotes';

interface SortMenuProps {
  value: SortMode;
  onChange: (v: SortMode) => void;
}

const OPTIONS: { id: SortMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'updated', label: 'Last edited', icon: Clock },
  { id: 'created', label: 'Date created', icon: Calendar },
  { id: 'title', label: 'Title (A–Z)', icon: TypeIcon },
  { id: 'color', label: 'Color', icon: Palette },
  { id: 'priority', label: 'Priority first', icon: Flag },
];

export function SortMenu({ value, onChange }: SortMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2.5 rounded-full bg-card border border-border/60 text-muted-foreground hover:text-foreground transition-colors shadow-soft active:scale-95"
          aria-label="Sort notes"
        >
          <ArrowDownUp className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPTIONS.map(opt => {
          const Icon = opt.icon;
          const active = value === opt.id;
          return (
            <DropdownMenuItem key={opt.id} onClick={() => onChange(opt.id)} className="gap-2">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{opt.label}</span>
              {active && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
