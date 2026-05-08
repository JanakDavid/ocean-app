-- OCEAN Instrument — Auto-delete results older than 3 years
--
-- HOW TO RUN:
--   1. Go to Supabase Dashboard > Database > Extensions
--   2. Enable the "pg_cron" extension
--   3. Open Supabase Dashboard > SQL Editor
--   4. Paste and run this entire file
--
-- This schedules a daily job at 03:00 UTC that deletes any rows in the
-- "results" table whose created_at is older than 3 years. This satisfies
-- the data retention commitment stated in the Privacy Policy (max 3 years).

-- Enable pg_cron extension (idempotent — safe to run more than once)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup at 03:00 UTC
-- If a job with this name already exists, unschedule it first to avoid duplicates
SELECT cron.unschedule('delete-old-results');

SELECT cron.schedule(
  'delete-old-results',
  '0 3 * * *',
  $$DELETE FROM results WHERE created_at < NOW() - INTERVAL '3 years'$$
);

-- Verify the job was created
SELECT jobid, jobname, schedule, command FROM cron.job WHERE jobname = 'delete-old-results';
