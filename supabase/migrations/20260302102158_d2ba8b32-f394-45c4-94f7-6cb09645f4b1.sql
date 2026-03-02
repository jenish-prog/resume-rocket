
CREATE TABLE public.sent_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  company TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read" ON public.sent_emails FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON public.sent_emails FOR INSERT WITH CHECK (true);
