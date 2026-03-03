
-- Store email template config (subject, message, resume filename)
CREATE TABLE public.email_template (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL DEFAULT 'Application for Internship',
  message text NOT NULL DEFAULT '',
  resume_filename text DEFAULT 'resume.pdf',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_template ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.email_template FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON public.email_template FOR UPDATE USING (true);
CREATE POLICY "Allow public insert" ON public.email_template FOR INSERT WITH CHECK (true);

-- Seed with default template
INSERT INTO public.email_template (subject, message) VALUES (
  'Application for Internship',
  'Dear HR,

I am writing to express my interest in pursuing an internship opportunity. I am eager to contribute to your team and gain practical experience in web development.

Please let me know if there are any available positions or what the application process entails. I have attached my resume for your review and would welcome the opportunity to discuss how I can contribute to your company.

Thank you for your time and consideration.

Best regards,

Jenish .S'
);
