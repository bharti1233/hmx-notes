
-- Delete all existing notes (clean slate for per-user system)
DELETE FROM public.notes;

-- Add user_id column
ALTER TABLE public.notes ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for user_id lookups
CREATE INDEX idx_notes_user_id ON public.notes(user_id);

-- Drop old public RLS policies
DROP POLICY IF EXISTS "Anyone can create notes" ON public.notes;
DROP POLICY IF EXISTS "Anyone can delete notes" ON public.notes;
DROP POLICY IF EXISTS "Anyone can update notes" ON public.notes;
DROP POLICY IF EXISTS "Anyone can view notes" ON public.notes;

-- Create per-user RLS policies
CREATE POLICY "Users can view their own notes"
ON public.notes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes"
ON public.notes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
ON public.notes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
ON public.notes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
