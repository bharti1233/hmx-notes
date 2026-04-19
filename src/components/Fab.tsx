import { Plus } from 'lucide-react';

interface FabProps {
  onClick: () => void;
  label?: string;
}

export function Fab({ onClick, label = 'New Note' }: FabProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-5 z-30 h-14 pl-5 pr-6 rounded-full bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-fab flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
      aria-label={label}
    >
      <Plus className="h-5 w-5" strokeWidth={2.5} />
      {label}
    </button>
  );
}
