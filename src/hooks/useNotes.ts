import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type LocalNote } from '@/lib/db';
import * as svc from '@/lib/notesService';
import { startBackgroundSync, initialPull } from '@/lib/syncService';
import { useAuth } from '@/hooks/useAuth';

export type ChecklistItem = { id: string; text: string; done: boolean };

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

export function useNotes(options: UseNotesOptions = {}) {
  const scope: NoteScope = options.scope ?? 'active';
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>('all');
  const [sortMode, setSortMode] = useState<SortMode>('updated');
  const [loading, setLoading] = useState(true);

  // Initial pull + background sync
  useEffect(() => {
    if (!userId) return;
    let cleanup: (() => void) | undefined;
    (async () => {
      await initialPull(userId);
      cleanup = startBackgroundSync(userId);
      setLoading(false);
    })();
    return () => cleanup?.();
  }, [userId]);

  // Live query from Dexie — UI always reads from local DB
  const allNotes = useLiveQuery(
    () => userId ? db.notes.where('user_id').equals(userId).toArray() : Promise.resolve([]),
    [userId],
    [] as LocalNote[],
  );

  // Filter by scope
  const scopedNotes = allNotes.filter(n => {
    if (scope === 'active') return !n.deleted_at && !n.archived;
    if (scope === 'archived') return !n.deleted_at && n.archived;
    return !!n.deleted_at; // trash
  });

  // Search + tag filter
  const filteredNotes = scopedNotes.filter(note => {
    if (activeTag !== 'all' && note.tag !== activeTag) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (note.title.toLowerCase().includes(q)) return true;
    if (note.content.toLowerCase().includes(q)) return true;
    return note.checklist.some(c => c.text.toLowerCase().includes(q));
  });

  // Sort
  const sortFn = (a: LocalNote, b: LocalNote): number => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    switch (sortMode) {
      case 'created': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'title': return (a.title || '').localeCompare(b.title || '');
      case 'color': return (a.color || '').localeCompare(b.color || '');
      case 'priority':
        if (a.priority !== b.priority) return a.priority ? -1 : 1;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      default: return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
  };

  const sorted = [...filteredNotes].sort(sortFn);
  const pinnedNotes = sorted.filter(n => n.pinned);
  const otherNotes = sorted.filter(n => !n.pinned);

  // CRUD — all write to Dexie first (optimistic)
  const createNote = useCallback(async (data: Partial<Note>) => {
    if (!userId) return;
    await svc.createNote(userId, data as any);
  }, [userId]);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    await svc.updateNote(id, updates as any);
  }, []);

  const trashNote = useCallback(async (id: string) => {
    await svc.trashNote(id);
  }, []);

  const restoreNote = useCallback(async (id: string) => {
    await svc.restoreNote(id);
  }, []);

  const archiveNote = useCallback(async (id: string, archived = true) => {
    await svc.archiveNote(id, archived);
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    await svc.deleteNotePermanently(id);
  }, []);

  const togglePin = useCallback(async (id: string, currentPinned: boolean) => {
    await svc.togglePin(id, currentPinned);
  }, []);

  return {
    notes: sorted as Note[],
    allNotes: scopedNotes as Note[],
    pinnedNotes: pinnedNotes as Note[],
    otherNotes: otherNotes as Note[],
    loading,
    searchQuery, setSearchQuery,
    activeTag, setActiveTag,
    sortMode, setSortMode,
    createNote, updateNote, trashNote, restoreNote, archiveNote, deleteNote, togglePin,
  };
}
