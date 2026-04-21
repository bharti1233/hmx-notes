import { supabase } from '@/integrations/supabase/client';
import { db, type LocalNote } from './db';
import { getUnsyncedNotes, markSynced, bulkPut } from './notesService';

let syncing = false;

export async function syncNotes(userId: string): Promise<void> {
  if (syncing || !navigator.onLine) return;
  syncing = true;

  try {
    // 1. Push unsynced local notes to Supabase
    const unsynced = await getUnsyncedNotes();
    if (unsynced.length > 0) {
      const rows = unsynced.map(n => ({
        id: n.id,
        user_id: n.user_id,
        title: n.title,
        content: n.content,
        color: n.color,
        pinned: n.pinned,
        position: n.position,
        tag: n.tag,
        priority: n.priority,
        archived: n.archived,
        attachments: n.attachments as any,
        checklist: n.checklist as any,
        deleted_at: n.deleted_at,
        created_at: n.created_at,
        updated_at: n.updated_at,
      }));

      const { error } = await supabase.from('notes').upsert(rows, { onConflict: 'id' });
      if (!error) {
        await markSynced(unsynced.map(n => n.id));
      }
    }

    // 2. Pull all remote notes for this user
    const { data: remote, error: pullError } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId);

    if (!pullError && remote) {
      for (const r of remote) {
        const local = await db.notes.get(r.id);
        if (!local) {
          // New note from server
          await db.notes.put({
            ...r,
            attachments: Array.isArray(r.attachments) ? r.attachments as string[] : [],
            checklist: Array.isArray(r.checklist) ? r.checklist as any[] : [],
            synced: true,
          });
        } else if (!local.synced) {
          // Local has unsynced changes — local wins (last-write-wins already pushed)
          continue;
        } else {
          // Both synced — remote wins if newer
          if (new Date(r.updated_at) > new Date(local.updated_at)) {
            await db.notes.put({
              ...r,
              attachments: Array.isArray(r.attachments) ? r.attachments as string[] : [],
              checklist: Array.isArray(r.checklist) ? r.checklist as any[] : [],
              synced: true,
            });
          }
        }
      }

      // 3. Remove locally-deleted notes that were permanently deleted on server
      // (notes that exist locally with deleted_at, synced, and no longer on server)
    }
  } catch (err) {
    console.error('[sync] error:', err);
  } finally {
    syncing = false;
  }
}

// Initial pull: fetch all notes from Supabase into Dexie (first-time load)
export async function initialPull(userId: string): Promise<void> {
  const localCount = await db.notes.where('user_id').equals(userId).count();
  if (localCount > 0) return; // Already has local data

  if (!navigator.onLine) return;

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId);

  if (!error && data && data.length > 0) {
    const notes: LocalNote[] = data.map(r => ({
      ...r,
      attachments: Array.isArray(r.attachments) ? r.attachments as string[] : [],
      checklist: Array.isArray(r.checklist) ? r.checklist as any[] : [],
      synced: true,
    }));
    await bulkPut(notes);
  }
}

// Setup online/offline listeners for background sync
let intervalId: ReturnType<typeof setInterval> | null = null;

export function startBackgroundSync(userId: string): () => void {
  const doSync = () => syncNotes(userId);

  // Sync immediately
  doSync();

  // Sync on coming online
  window.addEventListener('online', doSync);

  // Periodic sync every 30s
  intervalId = setInterval(doSync, 30_000);

  return () => {
    window.removeEventListener('online', doSync);
    if (intervalId) clearInterval(intervalId);
  };
}
