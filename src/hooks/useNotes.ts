import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  created_at: string;
  updated_at: string;
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>('all');

  const fetchNotes = useCallback(async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('archived', false)
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false });

    if (!error && data) setNotes(data as Note[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotes();
    const channel = supabase
      .channel('notes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => fetchNotes())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchNotes]);

  const createNote = async (note: Partial<Note>) => {
    const { error } = await supabase.from('notes').insert({
      title: note.title || '',
      content: note.content || '',
      color: note.color || 'default',
      pinned: note.pinned || false,
      tag: note.tag || 'none',
      priority: note.priority || false,
    });
    if (!error) fetchNotes();
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const { error } = await supabase.from('notes').update(updates).eq('id', id);
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
    return note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q);
  });

  const pinnedNotes = filteredNotes.filter(n => n.pinned);
  const otherNotes = filteredNotes.filter(n => !n.pinned);

  return {
    notes: filteredNotes,
    allNotes: notes,
    pinnedNotes,
    otherNotes,
    loading,
    searchQuery,
    setSearchQuery,
    activeTag,
    setActiveTag,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
  };
}
