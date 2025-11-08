-- Seed labs
INSERT INTO labs (id, title, description, category, status, progress, difficulty, estimated_time, points) VALUES
(
  '1f2a0972-7891-4f51-a648-11c48c12d99d',
  'Double Slit Experiment',
  'Explore the wave-particle duality of light through the famous double-slit experiment.',
  'Quantum',
  'locked',
  0,
  'Beginner',
  45,
  250
),
(
  '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
  'Quantum Tunneling',
  'Discover how particles can pass through energy barriers in quantum mechanics.',
  'Quantum',
  'locked',
  0,
  'Intermediate',
  60,
  300
),
(
  '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
  'Wave-Particle Duality',
  'Understand the dual nature of matter and light in quantum physics.',
  'Quantum',
  'locked',
  0,
  'Beginner',
  50,
  200
),
(
  '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s',
  'Photoelectric Effect',
  'Investigate how light interacts with matter through the photoelectric effect.',
  'Quantum',
  'locked',
  0,
  'Beginner',
  40,
  180
);

-- Seed checkpoints for Double Slit Experiment
INSERT INTO lab_checkpoints (lab_id, title, order_index) VALUES
('1f2a0972-7891-4f51-a648-11c48c12d99d', 'Setup apparatus', 1),
('1f2a0972-7891-4f51-a648-11c48c12d99d', 'Run simulation', 2),
('1f2a0972-7891-4f51-a648-11c48c12d99d', 'Analyze patterns', 3),
('1f2a0972-7891-4f51-a648-11c48c12d99d', 'Complete quiz', 4);

-- Seed checkpoints for Quantum Tunneling
INSERT INTO lab_checkpoints (lab_id, title, order_index) VALUES
('2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', 'Understand concept', 1),
('2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', 'Setup simulation', 2),
('2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', 'Observe tunneling', 3),
('2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', 'Calculate probabilities', 4),
('2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', 'Complete assessment', 5);