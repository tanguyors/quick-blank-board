SELECT cron.schedule(
  'process-reminders-every-15min',
  '*/15 * * * *',
  $$
  SELECT
    net.http_post(
        url:='https://glefjdbehtumybpabkzj.supabase.co/functions/v1/process-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZWZqZGJlaHR1bXlicGFia3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NDc0NTEsImV4cCI6MjA4NjAyMzQ1MX0.2GQ_ufVzpUJF941Ipq53UOfmdDRx_F4Nh_2wK4ucLxU"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);