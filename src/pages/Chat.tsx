import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BookOpen, HelpCircle, FileQuestion, Eraser, Plus, Image, Video, File, X, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { useAISettings } from '@/hooks/useAISettings';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { BottomNav } from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';

type Msg = { role: 'user' | 'assistant'; content: string; media?: { type: string; url: string; name: string } };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const quickActions = [
  { label: 'Study help', icon: BookOpen, prompt: 'Help me study and understand my notes better.' },
  { label: 'Ask question', icon: HelpCircle, prompt: 'I have a question: ' },
  { label: 'Generate quiz', icon: FileQuestion, prompt: 'Generate practice questions about: ' },
];

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<{ type: string; url: string; name: string; file: File } | null>(null);
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
  }, [messages]);

  const handleMediaUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('video') ? 'video' : file.type.startsWith('image') ? 'image' : 'file';
    setMediaPreview({ type, url, name: file.name, file });
    setShowAttach(false);
  };

  const triggerFileInput = (accept: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept;
      fileInputRef.current.click();
    }
  };

  const sendMessage = async (text: string) => {
    if ((!text.trim() && !mediaPreview) || isLoading) return;
    const userMsg: Msg = { 
      role: 'user', 
      content: text.trim(),
      media: mediaPreview ? { type: mediaPreview.type, url: mediaPreview.url, name: mediaPreview.name } : undefined
    };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput('');
    setMediaPreview(null);
    setIsLoading(true);

    let assistantSoFar = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
          systemPrompt: settings.systemPrompt || undefined,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'AI service error' }));
        toast.error(err.error || 'Failed to get response');
        setIsLoading(false);
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
          if (jsonStr === '[DONE]') { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const snapshot = assistantSoFar;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: snapshot } : m);
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
    } catch (e) {
      console.error(e);
      toast.error('Failed to connect to AI');
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const userInitial = user?.email?.[0]?.toUpperCase() || 'U';

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
            <p className="text-[11px] text-muted-foreground">Study helper & chat</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setMessages([])}>
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
                Ask questions, generate quizzes, or get help with your study materials.
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
              <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm transition-all duration-200 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md shadow-soft'
                    : 'bg-card border border-border/40 text-foreground rounded-bl-md shadow-soft'
                }`}>
                  {msg.media && (
                    <div className="mb-2 rounded-xl overflow-hidden">
                      {msg.media.type === 'image' && (
                        <img src={msg.media.url} alt={msg.media.name} className="max-h-48 rounded-xl object-cover" />
                      )}
                      {msg.media.type === 'video' && (
                        <video src={msg.media.url} className="max-h-48 rounded-xl" controls />
                      )}
                      {msg.media.type === 'file' && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-xl">
                          <File className="h-4 w-4" />
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
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-1 text-primary-foreground text-xs font-bold">
                    {userInitial}
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-2.5 justify-start">
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
                    <span className="text-xs text-muted-foreground ml-1">AI is thinking…</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media Preview */}
      {mediaPreview && (
        <div className="px-4 pb-2">
          <div className="max-w-2xl mx-auto flex items-center gap-2 p-2 rounded-xl bg-card border border-border/40">
            {mediaPreview.type === 'image' && (
              <img src={mediaPreview.url} alt="" className="h-16 w-16 rounded-lg object-cover" />
            )}
            {mediaPreview.type === 'video' && (
              <video src={mediaPreview.url} className="h-16 w-16 rounded-lg object-cover" />
            )}
            {mediaPreview.type === 'file' && (
              <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                <File className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <span className="text-xs text-muted-foreground flex-1 truncate">{mediaPreview.name}</span>
            <button onClick={() => setMediaPreview(null)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Attach menu */}
      {showAttach && (
        <div className="px-4 pb-2">
          <div className="max-w-2xl mx-auto flex gap-2 p-2 rounded-xl bg-card border border-border/40 shadow-card">
            <button onClick={() => triggerFileInput('image/*')} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-accent/50 transition-colors text-sm">
              <Image className="h-4 w-4 text-primary" /> Image
            </button>
            <button onClick={() => triggerFileInput('video/*')} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-accent/50 transition-colors text-sm">
              <Video className="h-4 w-4 text-primary" /> Video
            </button>
            <button onClick={() => triggerFileInput('*/*')} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-accent/50 transition-colors text-sm">
              <File className="h-4 w-4 text-primary" /> File
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-20 pt-2 border-t border-border/40 bg-card/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <button
            onClick={() => setShowAttach(!showAttach)}
            className="h-11 w-11 rounded-xl bg-muted/50 border border-border/40 flex items-center justify-center shrink-0 hover:bg-accent/50 active:scale-95 transition-all duration-200"
          >
            <Plus className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${showAttach ? 'rotate-45' : ''}`} />
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="flex-1 min-h-[44px] max-h-[120px] resize-none text-sm rounded-xl px-4 py-3 bg-muted/50 border border-border/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
            rows={1}
          />
          <Button
            size="icon"
            className="h-11 w-11 rounded-xl shrink-0 shadow-soft active:scale-95 transition-all duration-200"
            disabled={(!input.trim() && !mediaPreview) || isLoading}
            onClick={() => sendMessage(input)}
          >
            <Send className="h-4 w-4" />
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
