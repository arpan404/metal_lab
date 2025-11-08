-- Create labs table
CREATE TABLE labs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Quantum', 'Classical', 'Relativity', 'Thermodynamics')),
  status TEXT NOT NULL CHECK (status IN ('locked', 'in-progress', 'completed')) DEFAULT 'locked',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  estimated_time INTEGER NOT NULL, -- in minutes
  points INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create lab checkpoints table
CREATE TABLE lab_checkpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lab_id UUID NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX labs_category_idx ON labs(category);
CREATE INDEX labs_status_idx ON labs(status);
CREATE INDEX lab_checkpoints_lab_id_idx ON lab_checkpoints(lab_id);