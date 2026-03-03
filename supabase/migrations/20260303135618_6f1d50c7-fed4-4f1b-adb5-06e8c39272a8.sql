
-- Create storage bucket for resume files
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to resumes
CREATE POLICY "Public read access for resumes"
ON storage.objects
FOR SELECT
USING (bucket_id = 'resumes');

-- Allow public insert access for resumes (for uploading)
CREATE POLICY "Public insert access for resumes"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'resumes');
