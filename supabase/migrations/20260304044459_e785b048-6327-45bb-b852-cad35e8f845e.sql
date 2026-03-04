
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  hr_email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select" ON public.contacts FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.contacts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.contacts FOR DELETE USING (true);
