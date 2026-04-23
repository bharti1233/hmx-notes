import { useState } from 'react';
import { Archive as ArchiveIcon, Loader2 } from 'lucide-react';
import { useNotes, type Note } from '@/hooks/useNotes';
import { NotesGrid } from '@/components/NotesGrid';
import { NoteEditor } from '@/components/NoteEditor';
import { NoteActionSheet, type NoteAction } from '@/components/NoteActionSheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';

const Archive = () => {
  const { notes, loading, updateNote, trashNote, archiveNote, togglePin } = useNotes({ scope: 'archived' });
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [actionNote, setActionNote] = useState<Note | null>(null);

  const handleAction = async (action: NoteAction, note: Note) => {
    setActionNote(null);
    if (action === 'unarchive') {
      await archiveNote(note.id, false);
      toast.success('Restored to Notes');
    } else if (action === 'trash') {
      await trashNote(note.id);
      toast.success('Moved to Trash');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-8">
      <header className="px-4 pt-6 pb-4 max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
            <ArchiveIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-2xl text-foreground leading-tight">Archive</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{notes.length} archived</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="px-4 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-3xl bg-primary-soft flex items-center justify-center mb-4">
              <ArchiveIcon className="h-10 w-10 text-primary" />
            </div>
            <p className="font-display font-bold text-lg text-foreground">Nothing archived</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">Long-press a note and choose Archive to keep it out of the way.</p>
          </div>
        ) : (
          <NotesGrid
            notes={notes}
            onEdit={(n) => { setEditingNote(n); setEditorOpen(true); }}
            onTogglePin={togglePin}
            onLongPress={setActionNote}
          />
        )}
      </main>

      <NoteEditor
        note={editingNote}
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setEditingNote(null); }}
        onSave={(data) => data.id && updateNote(data.id, data)}
        onDelete={trashNote}
        onArchive={(id) => archiveNote(id, false)}
      />

      <NoteActionSheet
        note={actionNote}
        scope="archived"
        onClose={() => setActionNote(null)}
        onAction={handleAction}
      />
    </div>
  );
};

export default Archive;
