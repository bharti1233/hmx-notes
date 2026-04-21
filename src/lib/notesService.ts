import { db, type LocalNote } from './db';

function uuid(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function now(): string {
  return new Date().toISOString();
}

export async function getAllNotes(userId: string): Promise<LocalNote[]> {
  return db.notes.where('user_id').equals(userId).toArray();
}

export async function getActiveNotes(userId: string): Promise<LocalNote[]> {
  return (await getAllNotes(userId)).filter(n => !n.deleted_at && !n.archived);
}

export async function getArchivedNotes(userId: string): Promise<LocalNote[]> {
  return (await getAllNotes(userId)).filter(n => !n.deleted_at && n.archived);
}

export async function getTrashedNotes(userId: string): Promise<LocalNote[]> {
  return (await getAllNotes(userId)).filter(n => !!n.deleted_at);
}

export async function createNote(userId: string, data: Partial<LocalNote>): Promise<LocalNote> {
  const note: LocalNote = {
    id: uuid(),
    user_id: userId,
    title: data.title || '',
    content: data.content || '',
    color: data.color || 'default',
    pinned: data.pinned || false,
    position: data.position || 0,
    tag: data.tag || 'none',
    priority: data.priority || false,
    archived: data.archived || false,
    attachments: data.attachments || [],
    checklist: data.checklist || [],
    deleted_at: null,
    created_at: now(),
    updated_at: now(),
    synced: false,
  };
  await db.notes.put(note);
  return note;
}

export async function updateNote(id: string, updates: Partial<LocalNote>): Promise<void> {
  await db.notes.update(id, { ...updates, updated_at: now(), synced: false });
}

export async function trashNote(id: string): Promise<void> {
  await db.notes.update(id, { deleted_at: now(), updated_at: now(), synced: false });
}

export async function restoreNote(id: string): Promise<void> {
  await db.notes.update(id, { deleted_at: null, archived: false, updated_at: now(), synced: false });
}

export async function archiveNote(id: string, archived: boolean): Promise<void> {
  await db.notes.update(id, { archived, updated_at: now(), synced: false });
}

export async function deleteNotePermanently(id: string): Promise<void> {
  await db.notes.delete(id);
}

export async function togglePin(id: string, currentPinned: boolean): Promise<void> {
  await updateNote(id, { pinned: !currentPinned });
}

export async function getUnsyncedNotes(): Promise<LocalNote[]> {
  return db.notes.where('synced').equals(0).toArray();
}

export async function markSynced(ids: string[]): Promise<void> {
  await db.notes.where('id').anyOf(ids).modify({ synced: true });
}

export async function bulkPut(notes: LocalNote[]): Promise<void> {
  await db.notes.bulkPut(notes);
}
