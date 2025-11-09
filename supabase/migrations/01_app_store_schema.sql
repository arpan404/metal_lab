-- Drop existing tables if they exist
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS badges;
DROP TABLE IF EXISTS lab_checkpoints;
DROP TABLE IF EXISTS labs;
DROP TABLE IF EXISTS user_stats;
DROP TYPE IF EXISTS lab_category;
DROP TYPE IF EXISTS lab_status;
DROP TYPE IF EXISTS lab_difficulty;
DROP TYPE IF EXISTS activity_type;

-- Create custom types
CREATE TYPE lab_category AS ENUM ('Quantum', 'Classical', 'Relativity', 'Thermodynamics');
CREATE TYPE lab_status AS ENUM ('locked', 'in-progress', 'completed');
CREATE TYPE lab_difficulty AS ENUM ('Beginner', 'Intermediate', 'Advanced');
CREATE TYPE activity_type AS ENUM ('completed', 'badge', 'started', 'milestone');

-- Create labs table
CREATE TABLE labs (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  category lab_category NOT NULL,
  status lab_status NOT NULL DEFAULT 'locked',
  progress integer NOT NULL DEFAULT 0,
  difficulty lab_difficulty NOT NULL,
  estimated_time integer NOT NULL, -- in minutes
  completed_at timestamptz,
  started_at timestamptz,
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- Create lab checkpoints table
CREATE TABLE lab_checkpoints (
  id text PRIMARY KEY,
  lab_id text NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  title text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- Create badges table
CREATE TABLE badges (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  earned_at timestamptz,
  is_earned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- Create activities table
CREATE TABLE activities (
  id text PRIMARY KEY,
  type activity_type NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT NOW(),
  points integer,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- Create user stats table
CREATE TABLE user_stats (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  total_labs integer NOT NULL DEFAULT 0,
  completed_labs integer NOT NULL DEFAULT 0,
  in_progress_labs integer NOT NULL DEFAULT 0,
  total_points integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  hours_learned integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  current_xp integer NOT NULL DEFAULT 0,
  xp_to_next_level integer NOT NULL DEFAULT 1000,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_labs_updated_at
  BEFORE UPDATE ON labs
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_lab_checkpoints_updated_at
  BEFORE UPDATE ON lab_checkpoints
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_badges_updated_at
  BEFORE UPDATE ON badges
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();