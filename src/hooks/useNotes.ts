import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  position: number;
  tag: string;
  priority: boolean;
  archived: boolean;
  attachments: string[];
  checklist: ChecklistItem[];
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export type NoteScope = 'active' | 'archived' | 'trash';
export type SortMode = 'updated' | 'created' | 'title' | 'color' | 'priority';

interface UseNotesOptions {
  scope?: NoteScope;
}

function normalize(row: any): Note {
  return {
    ...row,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    checklist: Array.isArray(row.checklist) ? row.checklist : [],
  } as Note;
}

export function useNotes(options: UseNotesOptions = {}) {
  const scope: NoteScope = options.scope ?? 'active';
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>('all');
  const [sortMode, setSortMode] = useState<SortMode>('updated');

  const fetchNotes = useCallback(async () => {
    let query = supabase.from('notes').select('*');

    if (scope === 'active') {
      query = query.is('deleted_at', null).eq('archived', false);
    } else if (scope === 'archived') {
      query = query.is('deleted_at', null).eq('archived', true);
    } else {
      query = query.not('deleted_at', 'is', null);
    }

    const { data, error } = await query
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false });

    if (!error && data) setNotes(data.map(normalize));
    setLoading(false);
  }, [scope]);

  useEffect(() => {
    fetchNotes();
    const channel = supabase
      .channel(`notes-realtime-${scope}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => fetchNotes())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchNotes, scope]);

  const createNote = async (note: Partial<Note>) => {
    const { error } = await supabase.from('notes').insert({
      title: note.title || '',
      content: note.content || '',
      color: note.color || 'default',
      pinned: note.pinned || false,
      tag: note.tag || 'none',
      priority: note.priority || false,
      attachments: (note.attachments ?? []) as any,
      checklist: (note.checklist ?? []) as any,
    });
    if (!error) fetchNotes();
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const payload: any = { ...updates };
    if (updates.attachments) payload.attachments = updates.attachments;
    if (updates.checklist) payload.checklist = updates.checklist;
    const { error } = await supabase.from('notes').update(payload).eq('id', id);
    if (!error) fetchNotes();
  };

  // Soft delete -> Trash
  const trashNote = async (id: string) => {
    const { error } = await supabase
      .from('notes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) fetchNotes();
  };

  const restoreNote = async (id: string) => {
    const { error } = await supabase
      .from('notes')
      .update({ deleted_at: null, archived: false })
      .eq('id', id);
    if (!error) fetchNotes();
  };

  const archiveNote = async (id: string, archived = true) => {
    const { error } = await supabase.from('notes').update({ archived }).eq('id', id);
    if (!error) fetchNotes();
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (!error) fetchNotes();
  };

  const togglePin = async (id: string, currentPinned: boolean) => {
    await updateNote(id, { pinned: !currentPinned });
  };

  const filteredNotes = notes.filter(note => {
    if (activeTag !== 'all' && note.tag !== activeTag) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (note.title.toLowerCase().includes(q)) return true;
    if (note.content.toLowerCase().includes(q)) return true;
    return note.checklist.some(c => c.text.toLowerCase().includes(q));
  });

  const sortFn = (a: Note, b: Note): number => {
    // Pinned always first within each group
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    switch (sortMode) {
      case 'created':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      case 'color':
        return (a.color || '').localeCompare(b.color || '');
      case 'priority':
        if (a.priority !== b.priority) return a.priority ? -1 : 1;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case 'updated':
      default:
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
  };

  const sorted = [...filteredNotes].sort(sortFn);
  const pinnedNotes = sorted.filter(n => n.pinned);
  const otherNotes = sorted.filter(n => !n.pinned);

  return {
    notes: sorted,
    allNotes: notes,
    pinnedNotes,
    otherNotes,
    loading,
    searchQuery,
    setSearchQuery,
    activeTag,
    setActiveTag,
    sortMode,
    setSortMode,
    createNote,
    updateNote,
    trashNote,
    restoreNote,
    archiveNote,
    deleteNote,
    togglePin,
  };
}
