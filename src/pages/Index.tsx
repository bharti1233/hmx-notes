import { useState } from 'react';
import { StickyNote, Loader2 } from 'lucide-react';
import { useNotes, type Note } from '@/hooks/useNotes';
import { SearchBar } from '@/components/SearchBar';
import { AddNoteInput } from '@/components/AddNoteInput';
import { NotesGrid } from '@/components/NotesGrid';
import { NoteEditor } from '@/components/NoteEditor';

const Index = () => {
  const {
    pinnedNotes,
    otherNotes,
    loading,
    searchQuery,
    setSearchQuery,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
  } = useNotes();

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setEditorOpen(true);
  };

  const handleSave = (data: Partial<Note> & { id?: string }) => {
    if (data.id) {
      updateNote(data.id, { title: data.title, content: data.content, color: data.color });
    } else {
      createNote(data);
    }
  };

  const handleUpdateColor = (id: string, color: string) => {
    updateNote(id, { color });
  };

  const isEmpty = pinnedNotes.length === 0 && otherNotes.length === 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <StickyNote className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-semibold text-foreground hidden sm:block">KeepNotes</h1>
          </div>
          <div className="flex-1">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Add note input */}
        <AddNoteInput onAdd={createNote} />

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <StickyNote className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">No notes yet</p>
            <p className="text-sm mt-1">Click above to create your first note</p>
          </div>
        ) : (
          <div className="space-y-6">
            <NotesGrid
              notes={pinnedNotes}
              label={pinnedNotes.length > 0 && otherNotes.length > 0 ? 'Pinned' : undefined}
              onEdit={handleEdit}
              onDelete={deleteNote}
              onTogglePin={togglePin}
              onUpdateColor={handleUpdateColor}
            />
            <NotesGrid
              notes={otherNotes}
              label={pinnedNotes.length > 0 && otherNotes.length > 0 ? 'Others' : undefined}
              onEdit={handleEdit}
              onDelete={deleteNote}
              onTogglePin={togglePin}
              onUpdateColor={handleUpdateColor}
            />
          </div>
        )}
      </main>

      {/* Note editor modal */}
      <NoteEditor
        note={editingNote}
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setEditingNote(null); }}
        onSave={handleSave}
      />
    </div>
  );
};

export default Index;
