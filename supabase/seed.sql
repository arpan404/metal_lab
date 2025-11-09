-- Seed data for initial testing
-- First, update user_state
UPDATE user_state
SET 
  time_today = 120, -- 2 hours today
  time_this_week = 720, -- 12 hours this week
  level = 3,
  experiments_completed = 5,
  labs_in_progress = 2
WHERE id = 1;

-- Update learning_state
UPDATE learning_state
SET 
  current_module = 'Quantum Mechanics: Wave Functions',
  progress = 65
WHERE id = 1;

-- Update stats with complex data
UPDATE stats
SET 
  total_hours = 48,
  average_score = 85.5,
  day_streak = 14,
  items = ARRAY[
    ROW(
      'flask',
      'Experiments Completed',
      '5',
      'bg-emerald-500',
      ROW('+3 this week', true),
      NULL
    )::stat_item,
    ROW(
      'atom',
      'Labs In Progress',
      '2',
      'bg-sky-500',
      ROW('+1 today', true),
      NULL
    )::stat_item,
    ROW(
      'flame',
      'Current Streak',
      '14 days',
      'bg-orange-500',
      NULL,
      'Keep up the momentum!'
    )::stat_item,
    ROW(
      'trophy',
      'Current Level',
      '3',
      'bg-purple-500',
      ROW('85.5% avg score', true),
      NULL
    )::stat_item
  ],
  recent_activity = ARRAY[
    ROW(
      '1',
      'Wave Function Basics',
      'Quantum Mechanics',
      100,
      '2h ago'
    )::activity,
    ROW(
      '2',
      'Particle in a Box',
      'Quantum Mechanics',
      75,
      '5h ago'
    )::activity,
    ROW(
      '3',
      'Harmonic Oscillator',
      'Quantum Mechanics',
      25,
      '1d ago'
    )::activity
  ]
WHERE id = 1;