-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS stats;
DROP TABLE IF EXISTS learning_state;
DROP TABLE IF EXISTS user_state;
DROP TYPE IF EXISTS activity;
DROP TYPE IF EXISTS stat_item;
DROP TYPE IF EXISTS stat_trend;

-- Create tables for global state
CREATE TABLE user_state (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  time_today bigint NOT NULL DEFAULT 0,
  time_this_week bigint NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  experiments_completed integer NOT NULL DEFAULT 0,
  labs_in_progress integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE learning_state (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  current_module text NOT NULL DEFAULT '',
  progress integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TYPE stat_trend AS (
  value text,
  positive boolean
);

CREATE TYPE stat_item AS (
  icon text,
  label text,
  value text,
  icon_bg text,
  trend stat_trend,
  description text
);

CREATE TYPE activity AS (
  id text,
  title text,
  category text,
  progress integer,
  time text
);

CREATE TABLE stats (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  last_updated timestamptz NOT NULL DEFAULT NOW(),
  total_hours bigint NOT NULL DEFAULT 0,
  average_score numeric(5,2) NOT NULL DEFAULT 0,
  day_streak integer NOT NULL DEFAULT 0,
  items stat_item[] DEFAULT ARRAY[]::stat_item[],
  recent_activity activity[] DEFAULT ARRAY[]::activity[],
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_state_updated_at
  BEFORE UPDATE ON user_state
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_learning_state_updated_at
  BEFORE UPDATE ON learning_state
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_stats_updated_at
  BEFORE UPDATE ON stats
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Insert initial rows
INSERT INTO user_state DEFAULT VALUES;
INSERT INTO learning_state DEFAULT VALUES;
INSERT INTO stats DEFAULT VALUES;