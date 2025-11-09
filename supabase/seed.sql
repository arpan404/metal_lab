-- Seed data for the new lab system
-- This will be run after the schema.sql is applied

-- Note: Most data will be initialized automatically via the initialize_user_labs() function
-- when users sign up. This seed file can be used for additional default data.

-- Example: Initialize some default badges that all users can earn
INSERT INTO public.badges (id, user_id, name, description, icon, color, is_earned)
SELECT
  'first_lab',
  auth.uid(),
  'First Steps',
  'Completed your first lab simulation',
  '🎯',
  'bg-blue-500',
  false
WHERE auth.uid() IS NOT NULL
ON CONFLICT (id, user_id) DO NOTHING;

INSERT INTO public.badges (id, user_id, name, description, icon, color, is_earned)
SELECT
  'physics_master',
  auth.uid(),
  'Physics Master',
  'Completed all physics simulations',
  '⚛️',
  'bg-purple-500',
  false
WHERE auth.uid() IS NOT NULL
ON CONFLICT (id, user_id) DO NOTHING;

INSERT INTO public.badges (id, user_id, name, description, icon, color, is_earned)
SELECT
  'streak_7',
  auth.uid(),
  'Week Warrior',
  'Maintained a 7-day learning streak',
  '🔥',
  'bg-orange-500',
  false
WHERE auth.uid() IS NOT NULL
ON CONFLICT (id, user_id) DO NOTHING;

INSERT INTO public.badges (id, user_id, name, description, icon, color, is_earned)
SELECT
  'level_5',
  auth.uid(),
  'Rising Star',
  'Reached level 5',
  '⭐',
  'bg-yellow-500',
  false
WHERE auth.uid() IS NOT NULL
ON CONFLICT (id, user_id) DO NOTHING;