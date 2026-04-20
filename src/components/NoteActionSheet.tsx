import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Pin, Archive, Trash2, Flag, ArchiveRestore, RotateCcw, X } from 'lucide-react';
import type { Note } from '@/hooks/useNotes';

export type NoteAction = 'pin' | 'priority' | 'archive' | 'unarchive' | 'restore' | 'trash' | 'delete';

interface NoteActionSheetProps {
  note: Note | null;
  scope: 'active' | 'archived' | 'trash';
  onClose: () => void;
  onAction: (action: NoteAction, note: Note) => void;
}

export function NoteActionSheet({ note, scope, onClose, onAction }: NoteActionSheetProps) {
  const open = !!note;

  const items: { id: NoteAction; label: string; icon: React.ComponentType<{ className?: string }>; danger?: boolean }[] = [];

  if (scope === 'active') {
    items.push({ id: 'pin', label: note?.pinned ? 'Unpin' : 'Pin to top', icon: Pin });
    items.push({ id: 'priority', label: note?.priority ? 'Remove priority' : 'Mark as priority', icon: Flag });
    items.push({ id: 'archive', label: 'Archive', icon: Archive });
    items.push({ id: 'trash', label: 'Move to Trash', icon: Trash2, danger: true });
  } else if (scope === 'archived') {
    items.push({ id: 'unarchive', label: 'Unarchive', icon: ArchiveRestore });
    items.push({ id: 'trash', label: 'Move to Trash', icon: Trash2, danger: true });
  } else {
    items.push({ id: 'restore', label: 'Restore note', icon: RotateCcw });
    items.push({ id: 'delete', label: 'Delete forever', icon: X, danger: true });
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-[max(env(safe-area-inset-bottom),16px)]">
        <SheetHeader className="text-left">
          <SheetTitle className="line-clamp-1">
            {note?.title || 'Untitled note'}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-1">
          {items.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => note && onAction(item.id, note)}
                className={`w-full flex items-center gap-3 h-12 px-3 rounded-xl active:scale-[0.99] transition-all ${
                  item.danger
                    ? 'text-destructive hover:bg-destructive/10'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
