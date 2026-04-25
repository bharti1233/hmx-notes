import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BookOpen, HelpCircle, FileQuestion, Eraser, Plus, Image as ImageIcon, Video, File as FileIcon, X, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { useAISettings } from '@/hooks/useAISettings';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { BottomNav } from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import {
  compressImage,
  extractVideoFrames,
  extractPdfText,
  readTextFile,
  MAX_FILE_SIZE,
} from '@/lib/mediaProcessing';

type MediaKind = 'image' | 'video' | 'file';

type Media = {
  type: MediaKind;
  url: string; // object URL for preview
  name: string;
};

type Msg = {
  role: 'user' | 'assistant';
  content: string;
  media?: Media;
};

// Payload sent to AI gateway (OpenAI-compatible multimodal format)
type AIContent =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

type AIMessage = { role: 'user' | 'assistant'; content: string | AIContent[] };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const quickActions = [
  { label: 'Study help', icon: BookOpen, prompt: 'Help me study and understand my notes better.' },
  { label: 'Ask question', icon: HelpCircle, prompt: 'I have a question: ' },
  { label: 'Generate quiz', icon: FileQuestion, prompt: 'Generate practice questions about: ' },
];

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  // Parallel array of API-formatted messages so we keep multimodal payload across turns
  const aiHistoryRef = useRef<AIMessage[]>([]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<{
    media: Media;
    file: File;
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { settings } = useAISettings();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleMediaUpload = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large. Max ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB.`);
      return;
    }
    const url = URL.createObjectURL(file);
    const type: MediaKind = file.type.startsWith('video')
      ? 'video'
      : file.type.startsWith('image')
        ? 'image'
        : 'file';
    setPendingMedia({ media: { type, url, name: file.name }, file });
    setShowAttach(false);
  };

  const triggerFileInput = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  /** Build multimodal AI content for the user turn based on media + text. */
  const buildAIContent = async (
    text: string,
    pending: { media: Media; file: File } | null,
  ): Promise<{ aiContent: string | AIContent[]; defaultPrompt?: string }> => {
    if (!pending) {
      return { aiContent: text };
    }

    const { media, file } = pending;

    if (media.type === 'image') {
      const dataUrl = await compressImage(file);
      const prompt = text.trim() || 'Explain what is happening in this image in simple terms.';
      return {
        aiContent: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
        defaultPrompt: text.trim() ? undefined : prompt,
      };
    }

    if (media.type === 'video') {
      const frames = await extractVideoFrames(file, 3);
      const prompt = text.trim() ||
        'These images are frames extracted from a video. Explain what is happening in this video.';
      return {
        aiContent: [
          { type: 'text', text: prompt },
          ...frames.map((f) => ({ type: 'image_url' as const, image_url: { url: f } })),
        ],
        defaultPrompt: text.trim() ? undefined : prompt,
      };
    }

    // file: try PDF, otherwise text
    let extracted = '';
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    try {
      extracted = isPdf ? await extractPdfText(file) : await readTextFile(file);
    } catch (e) {
      console.error('file extract error', e);
      throw new Error('Could not read this file. Try a PDF or text file.');
    }

    const userPrompt = text.trim() || 'Summarize and explain this document in simple language.';
    const combined = `${userPrompt}\n\n--- Document: ${file.name} ---\n${extracted}`;
    return { aiContent: combined, defaultPrompt: text.trim() ? undefined : userPrompt };
  };

  const sendMessage = async (text: string) => {
    if ((!text.trim() && !pendingMedia) || isLoading || isProcessing) return;

    const pending = pendingMedia;
    const displayMedia = pending?.media;

    setIsProcessing(true);
    let aiContent: string | AIContent[];
    let displayText = text.trim();
    try {
      const built = await buildAIContent(text, pending);
      aiContent = built.aiContent;
      if (built.defaultPrompt && !displayText) displayText = built.defaultPrompt;
    } catch (e: any) {
      toast.error(e?.message || 'Failed to process attachment');
      setIsProcessing(false);
      return;
    }
    setIsProcessing(false);

    const userMsg: Msg = {
      role: 'user',
      content: displayText,
      media: displayMedia,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setPendingMedia(null);
    setIsLoading(true);

    const apiUserMsg: AIMessage = { role: 'user', content: aiContent };
    aiHistoryRef.current = [...aiHistoryRef.current, apiUserMsg];

    let assistantSoFar = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: aiHistoryRef.current,
          systemPrompt: settings.systemPrompt || undefined,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'AI service error' }));
        toast.error(err.error || 'Failed to get response');
        setIsLoading(false);
        // roll back the user message from API history so retry works
        aiHistoryRef.current = aiHistoryRef.current.slice(0, -1);
        return;
      }

      if (!resp.body) throw new Error('No stream body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const snapshot = assistantSoFar;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: snapshot } : m,
                  );
                }
                return [...prev, { role: 'assistant', content: snapshot }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      if (assistantSoFar) {
        aiHistoryRef.current = [
          ...aiHistoryRef.current,
          { role: 'assistant', content: assistantSoFar },
        ];
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to connect to AI');
      aiHistoryRef.current = aiHistoryRef.current.slice(0, -1);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    aiHistoryRef.current = [];
  };

  const userInitial = user?.email?.[0]?.toUpperCase() || 'U';
  const busy = isLoading || isProcessing;

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col pb-20">
      {/* Header */}
      <header className="px-4 pt-6 pb-3 flex items-center justify-between border-b border-border/40 bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-lg text-foreground">AI Assistant</h1>
            <p className="text-[11px] text-muted-foreground">Images · Videos · PDFs · Chat</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={clearChat}>
            <Eraser className="h-4 w-4" />
          </Button>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary-soft flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-lg text-foreground">Study Assistant</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-[260px]">
                Ask questions or upload an image, video, or PDF and I'll explain it.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-[260px]">
              {quickActions.map(({ label, icon: Icon, prompt }) => (
                <button
                  key={label}
                  onClick={() => setInput(prompt)}
                  className="flex items-center gap-3 text-left text-sm px-4 py-3 rounded-2xl border border-border/40 bg-card hover:bg-accent/50 shadow-soft transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm transition-all duration-200 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md shadow-soft'
                      : 'bg-card border border-border/40 text-foreground rounded-bl-md shadow-soft'
                  }`}
                >
                  {msg.media && (
                    <div className="mb-2 rounded-xl overflow-hidden">
                      {msg.media.type === 'image' && (
                        <img
                          src={msg.media.url}
                          alt={msg.media.name}
                          className="max-h-48 rounded-xl object-cover"
                        />
                      )}
                      {msg.media.type === 'video' && (
                        <video src={msg.media.url} className="max-h-48 rounded-xl" controls />
                      )}
                      {msg.media.type === 'file' && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-background/20 rounded-xl">
                          <FileIcon className="h-4 w-4" />
                          <span className="text-xs truncate">{msg.media.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:m-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1 text-primary-foreground text-xs font-bold">
                    {userInitial}
                  </div>
                )}
              </div>
            ))}
            {busy && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-2.5 justify-start animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-card border border-border/40 rounded-2xl rounded-bl-md px-4 py-3 shadow-soft">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                    <span className="text-xs text-muted-foreground ml-1">
                      {isProcessing ? 'AI is analyzing…' : 'AI is thinking…'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media Preview */}
      {pendingMedia && (
        <div className="px-4 pb-2">
          <div className="max-w-2xl mx-auto flex items-center gap-2 p-2 rounded-xl bg-card border border-border/40">
            {pendingMedia.media.type === 'image' && (
              <img src={pendingMedia.media.url} alt="" className="h-16 w-16 rounded-lg object-cover" />
            )}
            {pendingMedia.media.type === 'video' && (
              <video src={pendingMedia.media.url} className="h-16 w-16 rounded-lg object-cover" />
            )}
            {pendingMedia.media.type === 'file' && (
              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                <FileIcon className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground truncate font-medium">{pendingMedia.media.name}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{pendingMedia.media.type} · ready to send</p>
            </div>
            <button
              onClick={() => setPendingMedia(null)}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Attach menu */}
      {showAttach && (
        <div className="px-4 pb-2">
          <div className="max-w-2xl mx-auto flex gap-2 p-2 rounded-xl bg-card border border-border/40 shadow-card">
            <button
              onClick={() => triggerFileInput('image/*')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-accent/50 transition-colors text-sm"
            >
              <ImageIcon className="h-4 w-4 text-primary" /> Image
            </button>
            <button
              onClick={() => triggerFileInput('video/*')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-accent/50 transition-colors text-sm"
            >
              <Video className="h-4 w-4 text-primary" /> Video
            </button>
            <button
              onClick={() => triggerFileInput('.pdf,.txt,.md,.csv,.json,application/pdf,text/*')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-accent/50 transition-colors text-sm"
            >
              <FileIcon className="h-4 w-4 text-primary" /> File
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-20 pt-2 border-t border-border/40 bg-card/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <button
            onClick={() => setShowAttach(!showAttach)}
            disabled={busy}
            className="h-11 w-11 rounded-xl bg-muted/50 border border-border/40 flex items-center justify-center shrink-0 hover:bg-accent/50 active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            <Plus
              className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${
                showAttach ? 'rotate-45' : ''
              }`}
            />
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={pendingMedia ? 'Add a question (optional)…' : 'Ask anything…'}
            className="flex-1 min-h-[44px] max-h-[120px] resize-none text-sm rounded-xl px-4 py-3 bg-muted/50 border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
            rows={1}
          />
          <Button
            size="icon"
            className="h-11 w-11 rounded-xl shrink-0 shadow-soft active:scale-95 transition-all duration-200"
            disabled={(!input.trim() && !pendingMedia) || busy}
            onClick={() => sendMessage(input)}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleMediaUpload(file);
          e.target.value = '';
        }}
      />

      <BottomNav onNewNote={() => navigate('/')} />
    </div>
  );
}
