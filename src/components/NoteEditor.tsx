import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, Check, Flag, Archive, Trash2, Pin,
  Type, CheckSquare, Mic, Pencil, ImagePlus, Smile, X, Plus, Loader2, Palette,
} from 'lucide-react';
import EmojiPicker, { EmojiStyle, Theme as EmojiTheme } from 'emoji-picker-react';
import { ColorPicker } from './ColorPicker';
import { DrawCanvas } from './DrawCanvas';
import { getNoteColorClass, type NoteColor } from '@/lib/noteColors';
import { useCustomTags } from '@/hooks/useCustomTags';
import { useTheme } from '@/hooks/useTheme';
import { uploadNoteFile } from '@/lib/uploadImage';
import { toast } from 'sonner';
import type { Note, ChecklistItem } from '@/hooks/useNotes';

interface NoteEditorProps {
  note: Note | null;
  open: boolean;
  onClose: () => void;
  onSave: (note: Partial<Note> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
}

type FontSize = 'sm' | 'base' | 'lg';
type ToolPanel = 'none' | 'font' | 'emoji' | 'draw' | 'color';

// Speech recognition typings (browser API)
type SR = any;
const SpeechRecognition: SR | undefined =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : undefined;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function NoteEditor({ note, open, onClose, onSave, onDelete, onArchive }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<string>('default');
  const [tag, setTag] = useState<string>('none');
  const [priority, setPriority] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [showChecklist, setShowChecklist] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [panel, setPanel] = useState<ToolPanel>('none');
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const { allTags } = useCustomTags();
  const { isDark } = useTheme();
  const tagOptions = [{ id: 'none', label: 'None' }, ...allTags];

  useEffect(() => {
    if (open) {
      setTitle(note?.title || '');
      setContent(note?.content || '');
      setColor(note?.color || 'default');
      setTag(note?.tag || 'none');
      setPriority(note?.priority || false);
      setPinned(note?.pinned || false);
      setAttachments(note?.attachments || []);
      setChecklist(note?.checklist || []);
      setShowChecklist((note?.checklist?.length || 0) > 0);
      setFontSize('base');
      setPanel('none');
      setTimeout(() => titleRef.current?.focus(), 80);
    } else {
      // Stop any ongoing voice recording
      try { recognitionRef.current?.stop(); } catch { /* noop */ }
      setRecording(false);
    }
  }, [open, note]);

  if (!open) return null;

  const handleSave = () => {
    const isEmpty = !title.trim() && !content.trim() && attachments.length === 0 && checklist.length === 0;
    if (isEmpty) {
      onClose();
      return;
    }
    onSave({
      id: note?.id, title, content, color, tag, priority, pinned,
      attachments, checklist,
    });
    onClose();
  };

  const handleDelete = () => {
    if (note && onDelete) {
      onDelete(note.id);
      onClose();
    }
  };

  const handleArchive = () => {
    if (note && onArchive) {
      onArchive(note.id);
      toast.success('Note archived');
      onClose();
    }
  };

  // Image upload
  const handleImagePick = () => fileInputRef.current?.click();
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        if (file.size > 20 * 1024 * 1024) {
          toast.error(`${file.name} is larger than 20MB`);
          continue;
        }
        const url = await uploadNoteFile(file, note?.id);
        urls.push(url);
      }
      if (urls.length) setAttachments(prev => [...prev, ...urls]);
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (url: string) => setAttachments(prev => prev.filter(u => u !== url));

  // Checklist
  const addChecklistItem = () => {
    setShowChecklist(true);
    setChecklist(prev => [...prev, { id: uid(), text: '', done: false }]);
  };
  const updateChecklistItem = (id: string, patch: Partial<ChecklistItem>) =>
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
  const removeChecklistItem = (id: string) =>
    setChecklist(prev => prev.filter(c => c.id !== id));

  // Voice
  const toggleVoice = () => {
    if (!SpeechRecognition) {
      toast.error('Voice typing is not supported on this device');
      return;
    }
    if (recording) {
      try { recognitionRef.current?.stop(); } catch { /* noop */ }
      setRecording(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = navigator.language || 'en-US';
    rec.onresult = (e: any) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setContent(prev => (prev ? prev + ' ' : '') + transcript.trim());
    };
    rec.onerror = () => { setRecording(false); toast.error('Voice input error'); };
    rec.onend = () => setRecording(false);
    recognitionRef.current = rec;
    rec.start();
    setRecording(true);
    toast.success('Listening… tap mic again to stop');
  };

  // Drawing -> attach as image
  const handleDrawingSave = async (dataUrl: string) => {
    setPanel('none');
    setUploading(true);
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `drawing-${Date.now()}.png`, { type: 'image/png' });
      const url = await uploadNoteFile(file, note?.id);
      setAttachments(prev => [...prev, url]);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save drawing');
    } finally {
      setUploading(false);
    }
  };

  // Emoji insert
  const insertAtCursor = (text: string) => {
    const el = contentRef.current;
    if (!el) { setContent(c => c + text); return; }
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const next = content.slice(0, start) + text + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + text.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const fontSizeClass =
    fontSize === 'sm' ? 'text-sm' : fontSize === 'lg' ? 'text-lg' : 'text-base';

  const dateLabel = (() => {
    const d = note ? new Date(note.updated_at) : new Date();
    return `Today, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  })();

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col animate-in fade-in duration-150 ${getNoteColorClass(color)}`}
      style={{ touchAction: 'manipulation' }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-3 h-14">
          <button
            onClick={handleSave}
            className="p-2.5 -ml-1 rounded-full hover:bg-foreground/5 active:bg-foreground/10 transition-colors"
            aria-label="Save & close"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPinned(p => !p)}
              className={`p-2.5 rounded-full hover:bg-foreground/5 active:bg-foreground/10 transition-colors ${pinned ? 'text-primary' : 'text-foreground/70'}`}
              aria-label={pinned ? 'Unpin' : 'Pin'}
            >
              <Pin className="h-5 w-5" style={pinned ? { fill: 'currentColor' } : {}} />
            </button>
            {note && onArchive && (
              <button
                onClick={handleArchive}
                className="p-2.5 rounded-full text-foreground/70 hover:bg-foreground/5 active:bg-foreground/10 transition-colors"
                aria-label="Archive"
              >
                <Archive className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={handleSave}
              className="p-2.5 rounded-full hover:bg-foreground/5 active:bg-foreground/10 transition-colors"
              aria-label="Save"
            >
              <Check className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </div>
        {/* Meta row */}
        <div className="max-w-2xl mx-auto px-4 pb-2 flex items-center justify-between text-xs text-foreground/60">
          <span>{dateLabel}</span>
          <span className="flex items-center gap-1">
            {tag !== 'none' ? `#${tag}` : 'Uncategorized'}
          </span>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain pb-40">
        <div className="max-w-2xl mx-auto px-4 pt-2 space-y-4">
          {/* Title */}
          <input
            ref={titleRef}
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent font-display font-extrabold text-2xl text-foreground placeholder:text-foreground/30 outline-none"
          />

          {/* Attachments grid */}
          {(attachments.length > 0 || uploading) && (
            <div className="grid grid-cols-2 gap-2">
              {attachments.map(url => (
                <div key={url} className="relative group rounded-xl overflow-hidden bg-card/50 border border-border/40">
                  <img src={url} alt="attachment" className="w-full h-40 object-cover" loading="lazy" />
                  <button
                    onClick={() => removeAttachment(url)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-background transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {uploading && (
                <div className="h-40 rounded-xl border border-dashed border-border flex items-center justify-center bg-card/40">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </div>
          )}

          {/* Checklist */}
          {showChecklist && (
            <div className="space-y-1.5">
              {checklist.map(item => (
                <div key={item.id} className="flex items-center gap-2 group">
                  <button
                    onClick={() => updateChecklistItem(item.id, { done: !item.done })}
                    className={`shrink-0 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      item.done ? 'bg-primary border-primary text-primary-foreground' : 'border-foreground/30'
                    }`}
                    aria-label={item.done ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {item.done && <Check className="h-3 w-3" strokeWidth={3} />}
                  </button>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateChecklistItem(item.id, { text: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); addChecklistItem(); }
                      if (e.key === 'Backspace' && item.text === '') removeChecklistItem(item.id);
                    }}
                    placeholder="List item"
                    className={`flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-foreground/30 ${
                      item.done ? 'line-through text-foreground/50' : ''
                    }`}
                  />
                  <button
                    onClick={() => removeChecklistItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-foreground/40 hover:text-foreground"
                    aria-label="Remove item"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={addChecklistItem}
                className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors py-1"
              >
                <Plus className="h-4 w-4" /> Add item
              </button>
            </div>
          )}

          {/* Content */}
          <textarea
            ref={contentRef}
            placeholder="Note here"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className={`w-full bg-transparent ${fontSizeClass} text-foreground placeholder:text-foreground/30 outline-none resize-none leading-relaxed min-h-[200px]`}
          />


          {/* Priority + Tag */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setPriority(p => !p)}
              className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-semibold transition-all ${
                priority
                  ? 'bg-gradient-priority text-white shadow-soft'
                  : 'bg-card/70 border border-border/50 text-foreground/70'
              }`}
            >
              <Flag className="h-3.5 w-3.5" fill={priority ? 'currentColor' : 'none'} />
              Priority
            </button>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/50 mb-2">Tag</p>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTag(t.id)}
                  className={`px-3 h-8 rounded-full text-xs font-medium transition-all ${
                    tag === t.id
                      ? 'bg-gradient-primary text-primary-foreground shadow-soft'
                      : 'bg-card/70 text-foreground/70 border border-border/50'
                  }`}
                >
                  {t.id === 'none' ? 'None' : `#${t.label}`}
                </button>
              ))}
            </div>
          </div>

          {/* Delete */}
          {note && onDelete && (
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-destructive/10 text-destructive font-semibold text-sm hover:bg-destructive/15 active:scale-[0.99] transition-all"
            >
              <Trash2 className="h-4 w-4" />
              Move to Trash
            </button>
          )}
        </div>
      </div>

      {/* Floating panels */}
      {panel === 'font' && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20 bg-foreground text-background rounded-2xl shadow-fab px-2 py-2 flex items-center gap-1 animate-in slide-in-from-bottom-2 duration-150">
          {(['sm', 'base', 'lg'] as FontSize[]).map(s => (
            <button
              key={s}
              onClick={() => { setFontSize(s); setPanel('none'); }}
              className={`px-3 h-9 rounded-xl text-sm font-semibold transition-colors ${
                fontSize === s ? 'bg-background/20' : 'hover:bg-background/10'
              }`}
            >
              {s === 'sm' ? 'A−' : s === 'lg' ? 'A+' : 'A'}
            </button>
          ))}
        </div>
      )}

      {panel === 'color' && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20 bg-card border border-border rounded-2xl shadow-fab px-4 py-3 animate-in slide-in-from-bottom-2 duration-150">
          <ColorPicker selected={color} onSelect={(c: NoteColor) => { setColor(c); setPanel('none'); }} />
        </div>
      )}

      {panel === 'emoji' && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-20 animate-in slide-in-from-bottom-2 duration-150">
          <EmojiPicker
            onEmojiClick={(d) => { insertAtCursor(d.emoji); setPanel('none'); }}
            theme={isDark ? EmojiTheme.DARK : EmojiTheme.LIGHT}
            emojiStyle={EmojiStyle.NATIVE}
            width={320}
            height={360}
            lazyLoadEmojis
            previewConfig={{ showPreview: false }}
            searchDisabled={false}
          />
        </div>
      )}

      {panel === 'draw' && (
        <DrawCanvas
          onCancel={() => setPanel('none')}
          onSave={handleDrawingSave}
        />
      )}

      {/* Bottom toolbar */}
      <div className="fixed bottom-0 left-0 right-0 z-10 px-3 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <div className="flex items-center justify-between gap-1 px-2 py-2 rounded-2xl bg-foreground text-background shadow-fab">
            <ToolBtn label="Font size" active={panel === 'font'} onClick={() => setPanel(p => p === 'font' ? 'none' : 'font')}>
              <Type className="h-5 w-5" />
            </ToolBtn>
            <ToolBtn label="Checklist" active={showChecklist} onClick={() => {
              if (!showChecklist) addChecklistItem();
              else setShowChecklist(false);
            }}>
              <CheckSquare className="h-5 w-5" />
            </ToolBtn>
            <ToolBtn label="Voice typing" active={recording} onClick={toggleVoice}>
              <Mic className={`h-5 w-5 ${recording ? 'text-destructive' : ''}`} />
            </ToolBtn>
            <ToolBtn label="Draw" active={panel === 'draw'} onClick={() => setPanel(p => p === 'draw' ? 'none' : 'draw')}>
              <Pencil className="h-5 w-5" />
            </ToolBtn>
            <ToolBtn label="Add image" onClick={handleImagePick}>
              <ImagePlus className="h-5 w-5" />
            </ToolBtn>
            <ToolBtn label="Emoji" active={panel === 'emoji'} onClick={() => setPanel(p => p === 'emoji' ? 'none' : 'emoji')}>
              <Smile className="h-5 w-5" />
            </ToolBtn>
            <ToolBtn label="Color" active={panel === 'color'} onClick={() => setPanel(p => p === 'color' ? 'none' : 'color')}>
              <Palette className="h-5 w-5" />
            </ToolBtn>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

function ToolBtn({
  children, label, onClick, active,
}: { children: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex-1 inline-flex items-center justify-center h-11 rounded-xl transition-all active:scale-95 ${
        active ? 'bg-background/20' : 'hover:bg-background/10'
      }`}
    >
      {children}
    </button>
  );
}
