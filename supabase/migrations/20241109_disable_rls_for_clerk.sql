-- Temporarily disable RLS to allow Clerk-based authentication
-- This allows the application to manage security at the app level

-- Disable RLS on tables
ALTER TABLE public.labs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_checkpoints DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Note: With RLS disabled, the application must ensure it only queries
-- data belonging to the authenticated Clerk user. All queries should
-- include WHERE user_id = <clerk_user_id> filters.
