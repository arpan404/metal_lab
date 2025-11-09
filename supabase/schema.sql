-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Labs table
CREATE TABLE IF NOT EXISTS public.labs (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('Simulation', 'Interactive', 'Visualization', 'Experiment', 'Game', 'Model', 'Analysis')),
  status TEXT CHECK (status IN ('locked', 'in-progress', 'completed')) DEFAULT 'locked',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  estimated_time INTEGER, -- in minutes
  completed_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id, user_id)
);

-- Lab checkpoints table
CREATE TABLE IF NOT EXISTS public.lab_checkpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lab_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (lab_id, user_id) REFERENCES labs(id, user_id) ON DELETE CASCADE
);

-- User stats table
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  total_labs INTEGER DEFAULT 0,
  completed_labs INTEGER DEFAULT 0,
  in_progress_labs INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  hours_learned DECIMAL DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 1000,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  earned_at TIMESTAMP WITH TIME ZONE,
  is_earned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id, user_id)
);

-- Activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('completed', 'badge', 'started', 'milestone')),
  title TEXT NOT NULL,
  description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  points INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab sessions table (for tracking time spent)
CREATE TABLE IF NOT EXISTS public.lab_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_labs_user_id ON public.labs(user_id);
CREATE INDEX IF NOT EXISTS idx_labs_status ON public.labs(status);
CREATE INDEX IF NOT EXISTS idx_checkpoints_lab_id ON public.lab_checkpoints(lab_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON public.activities(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.lab_sessions(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Labs policies
CREATE POLICY "Users can view own labs" ON public.labs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own labs" ON public.labs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own labs" ON public.labs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own labs" ON public.labs
  FOR DELETE USING (auth.uid() = user_id);

-- Lab checkpoints policies
CREATE POLICY "Users can view own checkpoints" ON public.lab_checkpoints
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkpoints" ON public.lab_checkpoints
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkpoints" ON public.lab_checkpoints
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own checkpoints" ON public.lab_checkpoints
  FOR DELETE USING (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "Users can view own stats" ON public.user_stats
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own stats" ON public.user_stats
  FOR UPDATE USING (auth.uid() = id);

-- Badges policies
CREATE POLICY "Users can view own badges" ON public.badges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON public.badges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own badges" ON public.badges
  FOR UPDATE USING (auth.uid() = user_id);

-- Activities policies
CREATE POLICY "Users can view own activities" ON public.activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON public.activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Lab sessions policies
CREATE POLICY "Users can view own sessions" ON public.lab_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.lab_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.lab_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_labs_updated_at BEFORE UPDATE ON public.labs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON public.user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize user stats when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_stats (id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize user on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to initialize default labs for a user
CREATE OR REPLACE FUNCTION initialize_user_labs(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.labs (id, user_id, title, description, category, status, difficulty, estimated_time, points)
  VALUES
    ('electricFieldSimulation', p_user_id, 'Electric Field Simulation', 'Explore electric fields created by two point charges in 3D space.', 'Simulation', 'locked', 'Beginner', 30, 100),
    ('transformerSimulation', p_user_id, 'Transformer Simulation', 'Explore how transformer models process text step-by-step.', 'Model', 'locked', 'Advanced', 45, 150),
    ('foucaultPendulum', p_user_id, 'Foucault Pendulum', 'Experience Earth''s rotation through the mesmerizing Foucault Pendulum!', 'Visualization', 'locked', 'Intermediate', 25, 100),
    ('doubleSlitExperiment', p_user_id, 'Double-Slit Experiment', 'Witness the mind-bending quantum phenomenon that puzzled physicists for decades!', 'Experiment', 'locked', 'Intermediate', 35, 120),
    ('deflectionGame', p_user_id, 'Atomic Deflection Game', 'Challenge your reflexes and precision in this exciting physics-based shooting game!', 'Game', 'locked', 'Beginner', 20, 80),
    ('millikanExperiment', p_user_id, 'Millikan Oil Drop Experiment', 'Recreate the groundbreaking 1909 experiment that measured the elementary charge!', 'Experiment', 'locked', 'Intermediate', 30, 110),
    ('nascarBanking', p_user_id, 'NASCAR Banking', 'Experience the physics of high-speed racing on banked tracks!', 'Simulation', 'locked', 'Beginner', 25, 90),
    ('rutherfordScattering', p_user_id, 'Rutherford Scattering Experiment', 'Witness the groundbreaking 1909 experiment that revolutionized atomic theory!', 'Experiment', 'locked', 'Advanced', 40, 140)
  ON CONFLICT (id, user_id) DO NOTHING;
  
  -- Update total labs count
  UPDATE public.user_stats
  SET total_labs = 8
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;
