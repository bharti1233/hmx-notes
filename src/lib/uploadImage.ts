import { supabase } from '@/integrations/supabase/client';
import { db, type PendingUpload } from './db';

const BUCKET = 'note-images';

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Convert a File to a data URL (base64) for local storage.
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Upload a file for a note. Works offline by storing as data URL in IndexedDB.
 * Returns a local data URL immediately; the sync service uploads to cloud later.
 */
export async function uploadNoteFile(file: File, noteId?: string): Promise<string> {
  const dataUrl = await fileToDataUrl(file);

  const pending: PendingUpload = {
    id: `upload-${Date.now()}-${uid()}`,
    noteId: noteId || '',
    dataUrl,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    uploaded: false,
  };

  await db.pendingUploads.put(pending);

  // If online, attempt immediate upload in background
  if (navigator.onLine) {
    uploadToCloud(pending).catch(() => {/* will retry in sync */});
  }

  return dataUrl;
}

/** Legacy alias */
export const uploadNoteImage = uploadNoteFile;

/**
 * Upload a single pending file to cloud storage.
 * Updates the pending record and swaps the data URL in the note's attachments.
 */
export async function uploadToCloud(pending: PendingUpload): Promise<string> {
  const blob = await (await fetch(pending.dataUrl)).blob();
  const ext = pending.fileName.split('.').pop()?.toLowerCase() || 'bin';
  const path = `${Date.now()}-${uid()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, {
      cacheControl: '3600',
      upsert: false,
      contentType: pending.mimeType,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const remoteUrl = data.publicUrl;

  // Update pending record
  await db.pendingUploads.update(pending.id, { uploaded: true, remoteUrl });

  // Swap data URL → remote URL in the note's attachments
  if (pending.noteId) {
    const note = await db.notes.get(pending.noteId);
    if (note) {
      const newAttachments = note.attachments.map(a =>
        a === pending.dataUrl ? remoteUrl : a
      );
      await db.notes.update(pending.noteId, {
        attachments: newAttachments,
        synced: false,
        updated_at: new Date().toISOString(),
      });
    }
  }

  return remoteUrl;
}

/**
 * Sync all pending uploads to cloud storage.
 */
export async function syncPendingUploads(): Promise<void> {
  if (!navigator.onLine) return;
  const pending = await db.pendingUploads.where('uploaded').equals(0).toArray();
  for (const p of pending) {
    try {
      await uploadToCloud(p);
    } catch (err) {
      console.warn('[upload-sync] failed for', p.fileName, err);
    }
  }
  // Clean up old completed uploads
  await db.pendingUploads.where('uploaded').equals(1).delete();
}

export async function deleteNoteImage(url: string): Promise<void> {
  try {
    // If it's a data URL, just remove from pending uploads
    if (url.startsWith('data:')) {
      const pending = await db.pendingUploads.where('uploaded').equals(0).toArray();
      const match = pending.find(p => p.dataUrl === url);
      if (match) await db.pendingUploads.delete(match.id);
      return;
    }
    const marker = `/object/public/${BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const path = url.substring(idx + marker.length);
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // ignore — best-effort cleanup
  }
}
