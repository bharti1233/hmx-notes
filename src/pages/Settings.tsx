import { Moon, Sun, FileText, Database, Sparkles, Github, Mail, Heart } from 'lucide-react';
import { useNotes } from '@/hooks/useNotes';
import { useTheme } from '@/hooks/useTheme';
import { BottomNav } from '@/components/BottomNav';
import { HmxLogo } from '@/components/HmxLogo';

const Settings = () => {
  const { allNotes } = useNotes();
  const { isDark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-hero pb-24">
      <header className="px-4 pt-6 pb-2 max-w-2xl mx-auto">
        <p className="text-xs text-muted-foreground">Settings</p>
      </header>

      <div className="px-4 max-w-2xl mx-auto">
        <h1 className="font-display font-extrabold text-3xl text-foreground mb-6">Settings</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-3xl bg-primary-soft mb-8">
          <Stat icon={FileText} label="Total Notes" value={String(allNotes.length)} />
          <Stat icon={Sparkles} label="Version" value="2.0" />
          <Stat icon={Database} label="Storage" value="Free" />
        </div>

        {/* Appearance */}
        <Section title="Appearance">
          <Row
            iconBg="bg-primary-soft"
            icon={isDark ? Moon : Sun}
            iconColor="text-primary"
            title="Dark Mode"
            description="Switch between light and dark theme"
            trailing={
              <button
                onClick={toggle}
                role="switch"
                aria-checked={isDark}
                className={`relative w-12 h-7 rounded-full transition-colors ${isDark ? 'bg-primary' : 'bg-muted'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-card shadow-soft transition-transform ${
                    isDark ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            }
          />
        </Section>

        {/* About */}
        <Section title="About">
          <div className="rounded-2xl bg-card border border-border/40 p-6 flex flex-col items-center text-center shadow-soft">
            <HmxLogo size={64} className="mb-4" />
            <p className="font-display font-extrabold text-xl text-foreground">HMX Notes</p>
            <p className="text-xs text-muted-foreground mt-1">Version 2.0.0 (Ad-Free)</p>
            <p className="text-sm text-muted-foreground mt-4 max-w-xs flex items-center gap-1.5 justify-center">
              Made by <span className="font-semibold text-primary">HMXPanel</span> with <Heart className="h-3.5 w-3.5 text-destructive" fill="currentColor" />
            </p>
          </div>
        </Section>
      </div>

      <BottomNav />
    </div>
  );
};

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

function Row({
  iconBg, icon: Icon, iconColor, title, description, trailing,
}: {
  iconBg: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  title: string;
  description: string;
  trailing: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/40 shadow-soft">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      {trailing}
    </div>
  );
}

export default Settings;
