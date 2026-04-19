import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { TEMPLATES } from '@/lib/templates';
import { useNotes } from '@/hooks/useNotes';
import { BottomNav } from '@/components/BottomNav';
import { AuraLogo } from '@/components/AuraLogo';
import { toast } from 'sonner';

const Templates = () => {
  const navigate = useNavigate();
  const { createNote } = useNotes();

  const handleUse = async (templateId: string) => {
    const tpl = TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    await createNote({
      title: tpl.title,
      content: tpl.content,
      color: tpl.color,
      tag: tpl.tag,
    });
    toast.success(`${tpl.name} added to your notes`);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-24">
      <header className="px-4 pt-6 pb-2 max-w-2xl mx-auto flex items-center gap-3">
        <AuraLogo size={32} />
        <div>
          <p className="text-xs text-muted-foreground">Templates</p>
          <h1 className="font-display font-extrabold text-xl text-foreground">Quick Start</h1>
        </div>
      </header>

      <div className="px-4 max-w-2xl mx-auto pt-4">
        <h2 className="font-display font-extrabold text-3xl text-foreground leading-tight">
          Quick Start<br />Templates
        </h2>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          Choose a template to get started quickly
        </p>

        <div className="space-y-3">
          {TEMPLATES.map(tpl => {
            const Icon = (Icons as any)[tpl.icon] ?? Icons.FileText;
            return (
              <button
                key={tpl.id}
                onClick={() => handleUse(tpl.id)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/40 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all text-left"
              >
                <div className={`w-12 h-12 rounded-2xl ${tpl.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-6 w-6 ${tpl.iconColor}`} strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-foreground">{tpl.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{tpl.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Templates;
