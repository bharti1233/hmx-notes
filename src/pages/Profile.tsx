import { useAuth } from '@/hooks/useAuth';
import { useNotes } from '@/hooks/useNotes';
import { BottomNav } from '@/components/BottomNav';
import { LogOut, FileText, Archive, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, signOut } = useAuth();
  const { allNotes } = useNotes();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
  };

  const initial = user?.email?.[0]?.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-gradient-hero pb-24">
      <div className="px-4 pt-10 pb-6 max-w-md mx-auto flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-primary-soft flex items-center justify-center text-primary font-display font-extrabold text-3xl mb-4 shadow-soft">
          {initial}
        </div>
        <p className="font-display font-bold text-lg text-foreground">{user?.email || 'Unknown'}</p>
        <p className="text-xs text-muted-foreground mt-1">Member</p>
      </div>

      <div className="px-4 max-w-md mx-auto space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={FileText} label="Notes" value={String(allNotes.length)} />
          <StatCard icon={Archive} label="Archived" value="—" />
          <StatCard icon={Trash2} label="Trashed" value="—" />
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-destructive/10 text-destructive font-semibold text-sm hover:bg-destructive/15 active:scale-[0.98] transition-all duration-200 shadow-soft"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>

      <BottomNav onNewNote={() => navigate('/')} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-card border border-border/40 shadow-soft">
      <Icon className="h-5 w-5 text-primary" />
      <span className="font-display font-bold text-lg text-foreground">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}
