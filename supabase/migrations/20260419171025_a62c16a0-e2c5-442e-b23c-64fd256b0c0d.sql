ALTER TABLE public.notes 
  ADD COLUMN IF NOT EXISTS tag TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS priority BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT false;

DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();