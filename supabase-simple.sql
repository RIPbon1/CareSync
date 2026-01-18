-- SUPER SIMPLE VERSION - Run this if the main schema fails
-- Copy and paste each section separately

-- 1. Create families table
CREATE TABLE families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create members table  
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id),
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  assigned_to UUID REFERENCES members(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create documents table
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID REFERENCES families(id),
  filename TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Insert demo data
INSERT INTO families (id, name) VALUES ('demo-family-id', 'Demo Family');

INSERT INTO members (id, family_id, name, email) VALUES 
('member-1', 'demo-family-id', 'Sarah Johnson', 'sarah@example.com'),
('member-2', 'demo-family-id', 'Mike Johnson', 'mike@example.com'),
('member-3', 'demo-family-id', 'Emma Johnson', 'emma@example.com');

INSERT INTO tasks (family_id, title, description, priority, status, assigned_to) VALUES
('demo-family-id', 'Schedule follow-up appointment', 'Call Dr. Smith office', 'high', 'pending', NULL),
('demo-family-id', 'Pick up prescription', 'Collect medication from pharmacy', 'urgent', 'assigned', 'member-2'),
('demo-family-id', 'Monitor blood pressure', 'Take readings twice daily', 'medium', 'in_progress', 'member-1'),
('demo-family-id', 'Prepare discharge summary', 'Organize medical documents', 'low', 'completed', 'member-3');