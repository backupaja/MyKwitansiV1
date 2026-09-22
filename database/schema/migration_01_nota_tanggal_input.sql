-- =============================================================================
-- MyKwitansi — Schema Migration: Add tanggal_input to formulir_nota
-- =============================================================================

-- Add tanggal_input column with a default of current timestamp if omitted.
-- Using TEXT to mirror formulir_transaksi (ISO 8601 strings).
ALTER TABLE public.formulir_nota 
ADD COLUMN IF NOT EXISTS tanggal_input TEXT DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');

-- Backfill any existing records where tanggal_input might be strictly NULL.
UPDATE public.formulir_nota 
SET tanggal_input = to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') 
WHERE tanggal_input IS NULL;

-- Make the column NOT NULL ensuring future consistency.
ALTER TABLE public.formulir_nota ALTER COLUMN tanggal_input SET NOT NULL;
