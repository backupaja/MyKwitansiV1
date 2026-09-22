-- =============================================================================
-- Migration: 02 - Add Soft Delete Support
-- Description: Adds deleted_at column to support Trash / Recycle Bin feature.
-- =============================================================================

-- 1. Add deleted_at to formulir_transaksi
ALTER TABLE public.formulir_transaksi
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. Add deleted_at to formulir_nota
ALTER TABLE public.formulir_nota
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 3. Create indexes to speed up filtering of active/deleted records
CREATE INDEX IF NOT EXISTS idx_formulir_transaksi_deleted_at 
ON public.formulir_transaksi (deleted_at);

CREATE INDEX IF NOT EXISTS idx_formulir_nota_deleted_at 
ON public.formulir_nota (deleted_at);

-- =============================================================================
-- Maintenance Job (Optional)
-- To automatically delete records older than 30 days, if your Supabase 
-- has pg_cron enabled, you could run:
--
-- SELECT cron.schedule(
--   'cleanup-soft-deletes', 
--   '0 0 * * *', 
--   $$ 
--     DELETE FROM public.formulir_transaksi WHERE deleted_at < NOW() - INTERVAL '30 days';
--     DELETE FROM public.formulir_nota WHERE deleted_at < NOW() - INTERVAL '30 days';
--   $$
-- );
-- =============================================================================
