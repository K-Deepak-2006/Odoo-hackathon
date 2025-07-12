
-- Insert additional sample profiles (complementing existing ones)
INSERT INTO public.profiles (user_id, name, email, location, skills_offered, skills_wanted, availability, is_public)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440005', 'David Wilson', 'david@example.com', 'Seattle, WA', 
   ARRAY['Java', 'Spring Boot', 'Microservices'], ARRAY['Docker', 'Kubernetes'], 
   ARRAY['Weekday Evenings', 'Weekend Mornings'], true),
  ('550e8400-e29b-41d4-a716-446655440006', 'Emma Thompson', 'emma@example.com', 'Boston, MA', 
   ARRAY['Product Management', 'Agile', 'Scrum'], ARRAY['Data Analytics', 'SQL'], 
   ARRAY['Weekday Afternoons', 'Weekend Afternoons'], true),
  ('550e8400-e29b-41d4-a716-446655440007', 'Michael Chen', 'michael@example.com', 'Los Angeles, CA', 
   ARRAY['Machine Learning', 'TensorFlow', 'Python'], ARRAY['Cloud Architecture', 'AWS'], 
   ARRAY['Weekend Evenings', 'Weekday Mornings'], true),
  ('550e8400-e29b-41d4-a716-446655440008', 'Sarah Johnson', 'sarah@example.com', 'Chicago, IL', 
   ARRAY['Digital Marketing', 'SEO', 'Content Strategy'], ARRAY['Web Development', 'JavaScript'], 
   ARRAY['Weekday Evenings', 'Weekend Afternoons'], true),
  ('550e8400-e29b-41d4-a716-446655440009', 'Alex Rodriguez', 'alex@example.com', 'Miami, FL', 
   ARRAY['iOS Development', 'Swift', 'Mobile UI'], ARRAY['Backend Development', 'Node.js'], 
   ARRAY['Weekend Mornings', 'Weekday Afternoons'], true);

-- Insert additional sample swap requests
INSERT INTO public.swap_requests (from_user_id, from_user_name, to_user_id, to_user_name, message, status)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440003', 'Carol Davis', '550e8400-e29b-41d4-a716-446655440001', 'Alice Johnson', 
   'Hi Alice! I would love to learn React from you. I can teach you UI/UX design and Figma in return.', 'pending'),
  ('550e8400-e29b-41d4-a716-446655440005', 'David Wilson', '550e8400-e29b-41d4-a716-446655440007', 'Michael Chen', 
   'Hi Michael! Your ML skills are impressive. I can help you with Java/Spring Boot if you can teach me TensorFlow.', 'accepted'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Emma Thompson', '550e8400-e29b-41d4-a716-446655440002', 'Bob Smith', 
   'Hi Bob! I need help with data science and SQL. I can teach you product management and Agile methodologies.', 'pending'),
  ('550e8400-e29b-41d4-a716-446655440008', 'Sarah Johnson', '550e8400-e29b-41d4-a716-446655440009', 'Alex Rodriguez', 
   'Hi Alex! I want to learn mobile development. I can help you with digital marketing and SEO strategies.', 'rejected'),
  ('550e8400-e29b-41d4-a716-446655440009', 'Alex Rodriguez', '550e8400-e29b-41d4-a716-446655440001', 'Alice Johnson', 
   'Hi Alice! I would love to learn React and Node.js from you. I can teach you iOS development with Swift.', 'pending');
