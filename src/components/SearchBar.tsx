import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="flex items-center gap-3 rounded-lg bg-muted px-4 py-2.5 shadow-sm transition-shadow focus-within:shadow-md">
        <Search className="h-5 w-5 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Search notes..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        {value && (
          <button onClick={() => onChange('')} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
