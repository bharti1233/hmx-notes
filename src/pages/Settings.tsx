import { useState, useEffect } from 'react';
import {
  Moon, Sun, FileText, Sparkles, LogOut, Heart, Wifi, WifiOff,
  Bell, BellOff, Shield, Cloud, Bot, StickyNote, Share2, Info,
  ChevronRight, Eye, EyeOff, RotateCcw, Key, Globe, MessageSquare
} from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useAISettings, type AIProvider } from '@/hooks/useAISettings';
import { BottomNav } from '@/components/BottomNav';
import { HmxLogo } from '@/components/HmxLogo';
import { toast } from 'sonner';

type SettingsTab = 'main' | 'appearance' | 'notifications' | 'privacy' | 'backup' | 'ai' | 'behavior' | 'export' | 'about';

const Settings = () => {
  const [tab, setTab] = useState<SettingsTab>('main');

  return (
    <div className="min-h-screen bg-gradient-hero pb-24">
      <header className="px-4 pt-6 pb-2 max-w-2xl mx-auto flex items-center gap-2">
        {tab !== 'main' && (
          <button onClick={() => setTab('main')} className="text-primary font-semibold text-sm hover:underline">
            ← Back
          </button>
        )}
        <p className="text-xs text-muted-foreground">{tab === 'main' ? 'Settings' : ''}</p>
      </header>

      <div className="px-4 max-w-2xl mx-auto">
        {tab === 'main' && <MainSettings onNavigate={setTab} />}
        {tab === 'appearance' && <AppearanceSettings />}
        {tab === 'notifications' && <NotificationsSettings />}
        {tab === 'privacy' && <PrivacySettings />}
        {tab === 'backup' && <BackupSyncSettings />}
        {tab === 'ai' && <AIFeaturesSettings />}
        {tab === 'behavior' && <NoteBehaviorSettings />}
        {tab === 'export' && <ExportSharingSettings />}
        {tab === 'about' && <AboutSettings />}
      </div>

      <BottomNav />
    </div>
  );
};

/* ─── Main Menu ─── */
function MainSettings({ onNavigate }: { onNavigate: (t: SettingsTab) => void }) {
  const { allNotes } = useNotes();
  const { user, signOut } = useAuth();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const menuItems: { icon: typeof Moon; label: string; desc: string; tab: SettingsTab }[] = [
    { icon: Sun, label: 'Appearance', desc: 'Theme, colors & display', tab: 'appearance' },
    { icon: Bell, label: 'Notifications', desc: 'Alerts & reminders', tab: 'notifications' },
    { icon: Shield, label: 'Privacy & Security', desc: 'Lock, data & permissions', tab: 'privacy' },
    { icon: Cloud, label: 'Backup & Sync', desc: 'Cloud sync & backups', tab: 'backup' },
    { icon: Bot, label: 'AI Features', desc: 'AI providers & prompts', tab: 'ai' },
    { icon: StickyNote, label: 'Note Behavior', desc: 'Defaults & editing', tab: 'behavior' },
    { icon: Share2, label: 'Export & Sharing', desc: 'Export notes & share', tab: 'export' },
    { icon: Info, label: 'About', desc: 'Version & credits', tab: 'about' },
  ];

  return (
    <>
      <h1 className="font-display font-extrabold text-3xl text-foreground mb-6">Settings</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 p-4 rounded-3xl bg-primary-soft mb-6">
        <Stat icon={FileText} label="Notes" value={String(allNotes.length)} />
        <Stat icon={Sparkles} label="Version" value="3.0" />
        <Stat icon={online ? Wifi : WifiOff} label="Status" value={online ? 'Online' : 'Offline'} />
      </div>

      {/* Account */}
      <Section title="Account">
        <div className="rounded-2xl bg-card border border-border/40 p-4 shadow-soft space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center text-primary font-bold text-lg">
              {user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-foreground truncate">{user?.email || 'Unknown'}</p>
              <p className="text-xs text-muted-foreground">Signed in</p>
            </div>
          </div>
          <button
            onClick={async () => { await signOut(); toast.success('Signed out'); }}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-destructive/10 text-destructive font-semibold text-sm hover:bg-destructive/15 active:scale-[0.98] transition-all"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </Section>

      {/* Menu */}
      <Section title="Settings">
        <div className="rounded-2xl bg-card border border-border/40 shadow-soft divide-y divide-border/30 overflow-hidden">
          {menuItems.map(item => (
            <button
              key={item.tab}
              onClick={() => onNavigate(item.tab)}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 active:bg-muted/70 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </Section>
    </>
  );
}

/* ─── Appearance ─── */
function AppearanceSettings() {
  const { isDark, toggle } = useTheme();
  return (
    <>
      <h2 className="font-display font-extrabold text-2xl text-foreground mb-4">Appearance</h2>
      <Section title="Theme">
        <Row icon={isDark ? Moon : Sun} title="Dark Mode" description="Switch between light and dark"
          trailing={<Toggle checked={isDark} onChange={toggle} />} />
      </Section>
    </>
  );
}

/* ─── Notifications ─── */
function NotificationsSettings() {
  const [enabled, setEnabled] = useLocalBool('hmx-notif-enabled', true);
  const [sound, setSound] = useLocalBool('hmx-notif-sound', true);
  return (
    <>
      <h2 className="font-display font-extrabold text-2xl text-foreground mb-4">Notifications</h2>
      <Section title="Preferences">
        <div className="space-y-2">
          <Row icon={Bell} title="Push Notifications" description="Receive alerts for reminders"
            trailing={<Toggle checked={enabled} onChange={() => setEnabled(!enabled)} />} />
          <Row icon={enabled ? Bell : BellOff} title="Sound" description="Play sound on notifications"
            trailing={<Toggle checked={sound} onChange={() => setSound(!sound)} />} />
        </div>
      </Section>
    </>
  );
}

/* ─── Privacy ─── */
function PrivacySettings() {
  const [lockEnabled, setLockEnabled] = useLocalBool('hmx-lock', false);
  return (
    <>
      <h2 className="font-display font-extrabold text-2xl text-foreground mb-4">Privacy & Security</h2>
      <Section title="Security">
        <Row icon={Shield} title="App Lock" description="Require authentication to open"
          trailing={<Toggle checked={lockEnabled} onChange={() => setLockEnabled(!lockEnabled)} />} />
      </Section>
    </>
  );
}

/* ─── Backup & Sync ─── */
function BackupSyncSettings() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  return (
    <>
      <h2 className="font-display font-extrabold text-2xl text-foreground mb-4">Backup & Sync</h2>
      <Section title="Sync Status">
        <div className="rounded-2xl bg-card border border-border/40 p-4 shadow-soft flex items-center gap-3">
          {online ? <Wifi className="h-5 w-5 text-primary" /> : <WifiOff className="h-5 w-5 text-destructive" />}
          <div>
            <p className="font-semibold text-sm text-foreground">{online ? 'Connected' : 'Offline Mode'}</p>
            <p className="text-xs text-muted-foreground">{online ? 'Notes sync automatically' : 'Will sync when online'}</p>
          </div>
        </div>
      </Section>
    </>
  );
}

/* ─── AI Features ─── */
const AI_PROVIDERS: { id: AIProvider; label: string; icon: typeof Bot; color: string }[] = [
  { id: 'gemini', label: 'Google Gemini', icon: Sparkles, color: 'text-blue-500' },
  { id: 'groq', label: 'Groq', icon: Bot, color: 'text-orange-500' },
  { id: 'claude', label: 'Claude AI', icon: MessageSquare, color: 'text-purple-500' },
  { id: 'custom', label: 'Custom URL', icon: Globe, color: 'text-green-500' },
];

function AIFeaturesSettings() {
  const { settings, update, reset } = useAISettings();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggleShow = (key: string) => setShowKeys(p => ({ ...p, [key]: !p[key] }));

  return (
    <>
      <h2 className="font-display font-extrabold text-2xl text-foreground mb-4">AI Features</h2>

      {/* Provider Selection */}
      <Section title="AI Provider">
        <div className="grid grid-cols-2 gap-2">
          {AI_PROVIDERS.map(p => (
            <button
              key={p.id}
              onClick={() => update('provider', p.id)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left ${
                settings.provider === p.id
                  ? 'border-primary bg-primary/10 shadow-soft'
                  : 'border-border/40 bg-card hover:bg-muted/50'
              }`}
            >
              <p.icon className={`h-4 w-4 ${settings.provider === p.id ? 'text-primary' : p.color}`} />
              <span className="text-xs font-semibold text-foreground">{p.label}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* API Keys */}
      <Section title="API Keys">
        <div className="rounded-2xl bg-card border border-border/40 shadow-soft divide-y divide-border/30 overflow-hidden">
          <ApiKeyField
            label="Gemini API Key"
            value={settings.geminiApiKey}
            onChange={v => update('geminiApiKey', v)}
            show={!!showKeys.gemini}
            onToggleShow={() => toggleShow('gemini')}
            active={settings.provider === 'gemini'}
          />
          <ApiKeyField
            label="Groq API Key"
            value={settings.groqApiKey}
            onChange={v => update('groqApiKey', v)}
            show={!!showKeys.groq}
            onToggleShow={() => toggleShow('groq')}
            active={settings.provider === 'groq'}
          />
          <ApiKeyField
            label="Claude API Key"
            value={settings.claudeApiKey}
            onChange={v => update('claudeApiKey', v)}
            show={!!showKeys.claude}
            onToggleShow={() => toggleShow('claude')}
            active={settings.provider === 'claude'}
          />
        </div>
      </Section>

      {/* Custom URL */}
      {settings.provider === 'custom' && (
        <Section title="Custom AI Endpoint">
          <div className="rounded-2xl bg-card border border-border/40 p-4 shadow-soft space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Base URL</label>
              <input
                type="url"
                placeholder="https://api.your-provider.com/v1/chat/completions"
                value={settings.customUrl}
                onChange={e => update('customUrl', e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-muted/50 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">API Key (optional)</label>
              <div className="relative">
                <input
                  type={showKeys.custom ? 'text' : 'password'}
                  placeholder="sk-..."
                  value={settings.customApiKey}
                  onChange={e => update('customApiKey', e.target.value)}
                  className="w-full h-10 px-3 pr-10 rounded-xl bg-muted/50 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button onClick={() => toggleShow('custom')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                  {showKeys.custom ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* System Prompt */}
      <Section title="System Prompt">
        <div className="rounded-2xl bg-card border border-border/40 p-4 shadow-soft space-y-3">
          <p className="text-xs text-muted-foreground">Customize how the AI behaves, responds, and supports you.</p>
          <textarea
            value={settings.systemPrompt}
            onChange={e => update('systemPrompt', e.target.value)}
            rows={5}
            className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            placeholder="You are a helpful AI assistant..."
          />
          <button
            onClick={() => { reset(); toast.success('AI settings reset to defaults'); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Reset to defaults
          </button>
        </div>
      </Section>
    </>
  );
}

/* ─── Note Behavior ─── */
function NoteBehaviorSettings() {
  const [autoSave, setAutoSave] = useLocalBool('hmx-autosave', true);
  const [confirmDelete, setConfirmDelete] = useLocalBool('hmx-confirm-delete', true);
  return (
    <>
      <h2 className="font-display font-extrabold text-2xl text-foreground mb-4">Note Behavior</h2>
      <Section title="Editing">
        <div className="space-y-2">
          <Row icon={FileText} title="Auto-Save" description="Save notes automatically while editing"
            trailing={<Toggle checked={autoSave} onChange={() => setAutoSave(!autoSave)} />} />
          <Row icon={Shield} title="Confirm Delete" description="Ask before permanently deleting"
            trailing={<Toggle checked={confirmDelete} onChange={() => setConfirmDelete(!confirmDelete)} />} />
        </div>
      </Section>
    </>
  );
}

/* ─── Export & Sharing ─── */
function ExportSharingSettings() {
  const { allNotes } = useNotes();

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(allNotes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `hmx-notes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('Notes exported!');
  };

  return (
    <>
      <h2 className="font-display font-extrabold text-2xl text-foreground mb-4">Export & Sharing</h2>
      <Section title="Export">
        <div className="rounded-2xl bg-card border border-border/40 p-4 shadow-soft space-y-3">
          <p className="text-xs text-muted-foreground">Export all your notes as a JSON file.</p>
          <button
            onClick={exportJSON}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            <Share2 className="h-4 w-4" /> Export All Notes
          </button>
        </div>
      </Section>
    </>
  );
}

/* ─── About ─── */
function AboutSettings() {
  return (
    <>
      <h2 className="font-display font-extrabold text-2xl text-foreground mb-4">About</h2>
      <div className="rounded-2xl bg-card border border-border/40 p-6 flex flex-col items-center text-center shadow-soft">
        <HmxLogo size={64} className="mb-4" />
        <p className="font-display font-extrabold text-xl text-foreground">HMX Notes</p>
        <p className="text-xs text-muted-foreground mt-1">Version 3.0.0 · Local-First</p>
        <p className="text-sm text-muted-foreground mt-4 max-w-xs flex items-center gap-1.5 justify-center">
          Made by <span className="font-semibold text-primary">HMXPanel</span> with <Heart className="h-3.5 w-3.5 text-destructive" fill="currentColor" />
        </p>
      </div>
    </>
  );
}

/* ─── Shared Components ─── */
function ApiKeyField({ label, value, onChange, show, onToggleShow, active }: {
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggleShow: () => void; active: boolean;
}) {
  return (
    <div className={`p-4 space-y-1.5 ${active ? 'bg-primary/5' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="h-3.5 w-3.5 text-muted-foreground" />
          <label className="text-xs font-semibold text-foreground">{label}</label>
        </div>
        {active && <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Active</span>}
      </div>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          placeholder="Enter API key..."
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full h-9 px-3 pr-10 rounded-lg bg-muted/50 border border-border/40 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button onClick={onToggleShow} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
          {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} role="switch" aria-checked={checked}
      className={`relative w-12 h-7 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}>
      <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-card shadow-soft transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-2">
      <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-soft">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <p className="font-display font-extrabold text-foreground text-lg leading-none mt-1">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3 px-1">{title}</p>
      {children}
    </div>
  );
}

function Row({ icon: Icon, title, description, trailing }: {
  icon: React.ComponentType<{ className?: string }>; title: string; description: string; trailing: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/40 shadow-soft">
      <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      {trailing}
    </div>
  );
}

function useLocalBool(key: string, initial: boolean): [boolean, (v: boolean) => void] {
  const [val, setVal] = useState(() => {
    const s = localStorage.getItem(key);
    return s !== null ? s === 'true' : initial;
  });
  useEffect(() => { localStorage.setItem(key, String(val)); }, [key, val]);
  return [val, setVal];
}

export default Settings;
