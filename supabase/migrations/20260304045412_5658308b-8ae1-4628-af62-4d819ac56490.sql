
-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add user_id to contacts
ALTER TABLE public.contacts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to sent_emails
ALTER TABLE public.sent_emails ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to email_template
ALTER TABLE public.email_template ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old permissive policies on contacts
DROP POLICY IF EXISTS "Allow public select" ON public.contacts;
DROP POLICY IF EXISTS "Allow public insert" ON public.contacts;
DROP POLICY IF EXISTS "Allow public update" ON public.contacts;
DROP POLICY IF EXISTS "Allow public delete" ON public.contacts;

-- New user-scoped policies on contacts
CREATE POLICY "Users can view own contacts" ON public.contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contacts" ON public.contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contacts" ON public.contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contacts" ON public.contacts FOR DELETE USING (auth.uid() = user_id);

-- Drop old permissive policies on sent_emails
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.sent_emails;
DROP POLICY IF EXISTS "Allow anonymous read" ON public.sent_emails;

-- New user-scoped policies on sent_emails
CREATE POLICY "Users can view own sent_emails" ON public.sent_emails FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sent_emails" ON public.sent_emails FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Drop old permissive policies on email_template
DROP POLICY IF EXISTS "Allow public read" ON public.email_template;
DROP POLICY IF EXISTS "Allow public insert" ON public.email_template;
DROP POLICY IF EXISTS "Allow public update" ON public.email_template;

-- New user-scoped policies on email_template
CREATE POLICY "Users can view own template" ON public.email_template FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own template" ON public.email_template FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own template" ON public.email_template FOR UPDATE USING (auth.uid() = user_id);
