import Dexie, { type Table } from 'dexie';

export interface LocalNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  position: number;
  tag: string;
  priority: boolean;
  archived: boolean;
  attachments: string[];
  checklist: { id: string; text: string; done: boolean }[];
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  synced: boolean;
}

export interface PendingUpload {
  id: string;          // unique id
  noteId: string;      // associated note
  dataUrl: string;     // base64 data URL stored locally
  fileName: string;
  mimeType: string;
  size: number;
  uploaded: boolean;   // true once synced to storage
  remoteUrl?: string;  // filled after upload
}

class NotesDB extends Dexie {
  notes!: Table<LocalNote, string>;
  pendingUploads!: Table<PendingUpload, string>;

  constructor() {
    super('NotesDB');
    this.version(1).stores({
      notes: 'id, user_id, pinned, archived, deleted_at, updated_at, synced, tag, color, priority',
    });
    this.version(2).stores({
      notes: 'id, user_id, pinned, archived, deleted_at, updated_at, synced, tag, color, priority',
      pendingUploads: 'id, noteId, uploaded',
    });
  }
}

export const db = new NotesDB();
