-- Insert initial user stats
INSERT INTO user_stats DEFAULT VALUES;

-- Insert sample labs
INSERT INTO labs (
  id,
  title,
  description,
  category,
  status,
  progress,
  difficulty,
  estimated_time,
  completed_at,
  started_at,
  points
) VALUES
(
  'double-slit',
  'Double Slit Experiment',
  'Explore the wave-particle duality of light through the famous double-slit experiment.',
  'Quantum',
  'completed',
  100,
  'Beginner',
  45,
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '5 hours',
  250
);

-- Insert checkpoints for double-slit lab
INSERT INTO lab_checkpoints (
  id,
  lab_id,
  title,
  completed
) VALUES
('1', 'double-slit', 'Setup apparatus', true),
('2', 'double-slit', 'Run simulation', true),
('3', 'double-slit', 'Analyze patterns', true),
('4', 'double-slit', 'Complete quiz', true);

-- Insert sample badges
INSERT INTO badges (
  id,
  name,
  description,
  icon,
  color,
  is_earned
) VALUES
(
  'quantum-pioneer',
  'Quantum Pioneer',
  'Complete your first quantum mechanics lab',
  'atom',
  'bg-purple-500',
  true
),
(
  'streak-master',
  'Streak Master',
  'Maintain a 7-day learning streak',
  'flame',
  'bg-orange-500',
  false
);

-- Insert sample activities
INSERT INTO activities (
  id,
  type,
  title,
  description,
  timestamp,
  points
) VALUES
(
  '1',
  'completed',
  'Completed Double Slit Experiment',
  'Successfully demonstrated wave-particle duality',
  NOW() - INTERVAL '2 hours',
  250
),
(
  '2',
  'badge',
  'Earned Quantum Pioneer Badge',
  'Completed first quantum mechanics lab',
  NOW() - INTERVAL '2 hours',
  100
);

-- Update user stats
UPDATE user_stats 
SET 
  total_labs = 5,
  completed_labs = 2,
  in_progress_labs = 1,
  total_points = 750,
  current_streak = 3,
  longest_streak = 7,
  hours_learned = 12,
  level = 3,
  current_xp = 750,
  xp_to_next_level = 1000
WHERE id = 1;