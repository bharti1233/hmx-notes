-- 1. Add new columns to notes
ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_notes_deleted_at ON public.notes (deleted_at);
CREATE INDEX IF NOT EXISTS idx_notes_archived ON public.notes (archived);

-- 2. Trigger to keep updated_at fresh
DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Public storage bucket for note images
INSERT INTO storage.buckets (id, name, public)
VALUES ('note-images', 'note-images', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage policies (open access matching current notes RLS)
DROP POLICY IF EXISTS "Public can view note images" ON storage.objects;
CREATE POLICY "Public can view note images"
ON storage.objects FOR SELECT
USING (bucket_id = 'note-images');

DROP POLICY IF EXISTS "Public can upload note images" ON storage.objects;
CREATE POLICY "Public can upload note images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'note-images');

DROP POLICY IF EXISTS "Public can update note images" ON storage.objects;
CREATE POLICY "Public can update note images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'note-images');

DROP POLICY IF EXISTS "Public can delete note images" ON storage.objects;
CREATE POLICY "Public can delete note images"
ON storage.objects FOR DELETE
USING (bucket_id = 'note-images');