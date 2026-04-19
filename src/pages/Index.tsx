import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StickyNote, Loader2, SlidersHorizontal } from 'lucide-react';
import { useNotes, type Note } from '@/hooks/useNotes';
import { SearchBar } from '@/components/SearchBar';
import { TagChips } from '@/components/TagChips';
import { NotesGrid } from '@/components/NotesGrid';
import { NoteEditor } from '@/components/NoteEditor';
import { Fab } from '@/components/Fab';
import { BottomNav } from '@/components/BottomNav';
import { HmxLogo } from '@/components/HmxLogo';

const Index = () => {
  const {
    pinnedNotes,
    otherNotes,
    allNotes,
    loading,
    searchQuery,
    setSearchQuery,
    activeTag,
    setActiveTag,
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

  const handleNew = () => {
    setEditingNote(null);
    setEditorOpen(true);
  };

  const handleSave = (data: Partial<Note> & { id?: string }) => {
    if (data.id) {
      updateNote(data.id, data);
    } else {
      createNote(data);
    }
  };

  const totalCount = allNotes.length;
  const counts = allNotes.reduce<Record<string, number>>((acc, n) => {
    acc.all = (acc.all || 0) + 1;
    if (n.tag && n.tag !== 'none') acc[n.tag] = (acc[n.tag] || 0) + 1;
    return acc;
  }, { all: 0 });

  const isEmpty = pinnedNotes.length === 0 && otherNotes.length === 0;

  return (
    <div className="min-h-screen bg-gradient-hero pb-24">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <HmxLogo size={40} />
            <div>
              <h1 className="font-display font-extrabold text-2xl text-foreground leading-tight">HMX Notes</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalCount} {totalCount === 1 ? 'note' : 'notes'}
              </p>
            </div>
          </div>
          <button
            className="p-2.5 rounded-full bg-card border border-border/60 text-muted-foreground hover:text-foreground transition-colors shadow-soft"
            aria-label="Filter"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="px-4 max-w-2xl mx-auto mb-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Tag chips */}
      <div className="max-w-2xl mx-auto mb-5">
        <TagChips active={activeTag} onChange={setActiveTag} counts={counts} />
      </div>

      {/* Main content */}
      <main className="px-4 max-w-2xl mx-auto space-y-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-3xl bg-primary-soft flex items-center justify-center mb-4">
              <StickyNote className="h-10 w-10 text-primary" />
            </div>
            <p className="font-display font-bold text-lg text-foreground">No notes yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Tap the <span className="font-semibold text-primary">New Note</span> button to capture your first idea.
            </p>
          </div>
        ) : (
          <>
            <NotesGrid
              notes={pinnedNotes}
              label={pinnedNotes.length > 0 && otherNotes.length > 0 ? 'Pinned' : undefined}
              onEdit={handleEdit}
              onTogglePin={togglePin}
            />
            <NotesGrid
              notes={otherNotes}
              label={pinnedNotes.length > 0 && otherNotes.length > 0 ? 'Others' : undefined}
              onEdit={handleEdit}
              onTogglePin={togglePin}
            />
          </>
        )}
      </main>

      <Fab onClick={handleNew} />

      <NoteEditor
        note={editingNote}
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setEditingNote(null); }}
        onSave={handleSave}
        onDelete={deleteNote}
      />

      <BottomNav />
    </div>
  );
};

export default Index;
