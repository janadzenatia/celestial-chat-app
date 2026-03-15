ALTER TABLE public.children ADD COLUMN relationship_type TEXT NOT NULL DEFAULT 'child';

-- Migrate existing rows
UPDATE public.children SET relationship_type = 'child' WHERE relationship_type IS NULL OR relationship_type = 'child';