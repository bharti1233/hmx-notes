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

class NotesDB extends Dexie {
  notes!: Table<LocalNote, string>;

  constructor() {
    super('NotesDB');
    this.version(1).stores({
      notes: 'id, user_id, pinned, archived, deleted_at, updated_at, synced, tag, color, priority',
    });
  }
}

export const db = new NotesDB();
