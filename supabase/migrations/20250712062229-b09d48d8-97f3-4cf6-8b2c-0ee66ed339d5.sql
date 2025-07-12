
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  location TEXT,
  skills_offered TEXT[] DEFAULT '{}',
  skills_wanted TEXT[] DEFAULT '{}',
  availability TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create swap_requests table
CREATE TABLE public.swap_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES auth.users NOT NULL,
  from_user_name TEXT NOT NULL,
  to_user_id UUID REFERENCES auth.users NOT NULL,
  to_user_name TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view public profiles or their own" 
  ON public.profiles 
  FOR SELECT 
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" 
  ON public.profiles 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for swap_requests
CREATE POLICY "Users can view requests involving them" 
  ON public.swap_requests 
  FOR SELECT 
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create swap requests" 
  ON public.swap_requests 
  FOR INSERT 
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update requests they received" 
  ON public.swap_requests 
  FOR UPDATE 
  USING (auth.uid() = to_user_id);

CREATE POLICY "Users can delete their own requests" 
  ON public.swap_requests 
  FOR DELETE 
  USING (auth.uid() = from_user_id);

-- Admin policies (assuming admin role in user metadata)
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR ALL 
  USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "Admins can manage all requests" 
  ON public.swap_requests 
  FOR ALL 
  USING ((auth.jwt() ->> 'role') = 'admin');

-- Enable realtime
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.swap_requests REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.swap_requests;

-- Insert sample users (these will be created when users sign up)
-- But let's create some sample profiles assuming users exist
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'alice@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"name": "Alice Johnson"}'),
  ('550e8400-e29b-41d4-a716-446655440002', 'bob@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"name": "Bob Smith"}'),
  ('550e8400-e29b-41d4-a716-446655440003', 'carol@example.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"name": "Carol Davis"}'),
  ('550e8400-e29b-41d4-a716-446655440004', 'admin@skillswap.com', crypt('admin123', gen_salt('bf')), now(), now(), now(), '{"name": "Admin User", "role": "admin"}');

-- Insert sample profiles
INSERT INTO public.profiles (user_id, name, email, location, skills_offered, skills_wanted, availability, is_public)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Alice Johnson', 'alice@example.com', 'New York, NY', 
   ARRAY['JavaScript', 'React', 'Node.js'], ARRAY['Python', 'Machine Learning'], 
   ARRAY['Weekday Evenings', 'Weekend Afternoons'], true),
  ('550e8400-e29b-41d4-a716-446655440002', 'Bob Smith', 'bob@example.com', 'San Francisco, CA', 
   ARRAY['Python', 'Data Science', 'SQL'], ARRAY['React', 'UI/UX Design'], 
   ARRAY['Weekend Mornings', 'Weekend Evenings'], true),
  ('550e8400-e29b-41d4-a716-446655440003', 'Carol Davis', 'carol@example.com', 'Austin, TX', 
   ARRAY['UI/UX Design', 'Figma', 'Adobe Creative Suite'], ARRAY['Frontend Development', 'CSS'], 
   ARRAY['Weekday Afternoons', 'Weekend Afternoons'], true);

-- Insert sample swap requests
INSERT INTO public.swap_requests (from_user_id, from_user_name, to_user_id, to_user_name, message, status)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Alice Johnson', '550e8400-e29b-41d4-a716-446655440002', 'Bob Smith', 
   'Hi Bob! I would love to learn Python from you and can teach you React in exchange.', 'pending'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Bob Smith', '550e8400-e29b-41d4-a716-446655440003', 'Carol Davis', 
   'Hi Carol! Your UI/UX skills look amazing. I can help you with Python/Data Science if you can teach me design.', 'accepted');
