import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { useNotes, type Note } from '@/hooks/useNotes';
import { NotesGrid } from '@/components/NotesGrid';
import { NoteActionSheet, type NoteAction } from '@/components/NoteActionSheet';
import { BottomNav } from '@/components/BottomNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';

const Trash = () => {
  const { notes, loading, restoreNote, deleteNote, togglePin } = useNotes({ scope: 'trash' });
  const [actionNote, setActionNote] = useState<Note | null>(null);

  const handleAction = async (action: NoteAction, note: Note) => {
    setActionNote(null);
    if (action === 'restore') {
      await restoreNote(note.id);
      toast.success('Note restored');
    } else if (action === 'delete') {
      await deleteNote(note.id);
      toast.success('Deleted forever');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-28">
      <header className="px-4 pt-6 pb-4 max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Trash2 className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-2xl text-foreground leading-tight">Trash</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{notes.length} item{notes.length === 1 ? '' : 's'}</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="px-4 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center mb-4">
              <Trash2 className="h-10 w-10 text-destructive" />
            </div>
            <p className="font-display font-bold text-lg text-foreground">Trash is empty</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">Deleted notes will appear here. Long-press to restore or delete forever.</p>
          </div>
        ) : (
          <NotesGrid
            notes={notes}
            onEdit={() => { /* no editing in trash */ }}
            onTogglePin={togglePin}
            onLongPress={setActionNote}
          />
        )}
      </main>

      <NoteActionSheet
        note={actionNote}
        scope="trash"
        onClose={() => setActionNote(null)}
        onAction={handleAction}
      />

      <BottomNav />
    </div>
  );
};

export default Trash;
