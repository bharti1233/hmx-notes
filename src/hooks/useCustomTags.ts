import { useState, useEffect, useCallback } from 'react';
import { NOTE_TAGS } from '@/lib/noteColors';

const STORAGE_KEY = 'hmx-custom-tags';
const EVENT = 'hmx-custom-tags-change';

export interface TagOption {
  id: string;
  label: string;
  custom?: boolean;
}

const BUILTIN: TagOption[] = NOTE_TAGS.filter(t => t.id !== 'none').map(t => ({ id: t.id, label: t.label }));

function readStorage(): TagOption[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(tags: TagOption[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
  window.dispatchEvent(new CustomEvent(EVENT));
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24);
}

export function useCustomTags() {
  const [customTags, setCustomTags] = useState<TagOption[]>(() => readStorage());

  useEffect(() => {
    const sync = () => setCustomTags(readStorage());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const addTag = useCallback((label: string): TagOption | null => {
    const trimmed = label.trim();
    if (!trimmed) return null;
    const id = slugify(trimmed);
    if (!id) return null;
    const all = [...BUILTIN, ...readStorage()];
    if (all.some(t => t.id === id)) return null;
    const next: TagOption = { id, label: trimmed, custom: true };
    const updated = [...readStorage(), next];
    writeStorage(updated);
    return next;
  }, []);

  const removeTag = useCallback((id: string) => {
    const updated = readStorage().filter(t => t.id !== id);
    writeStorage(updated);
  }, []);

  const allTags: TagOption[] = [...BUILTIN, ...customTags];

  return { customTags, allTags, addTag, removeTag };
}
