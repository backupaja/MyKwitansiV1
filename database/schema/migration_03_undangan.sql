-- =============================================================================
-- Migration: 03 - Add Undangan Feature
-- Description: Creates formulir_undangan table with proper DATE/TIME constraints
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.formulir_undangan (
    id_formulir_undangan UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_admin INTEGER NOT NULL REFERENCES public.admin(id_admin) ON DELETE RESTRICT,
    acara TEXT NOT NULL,
    penyelenggara TEXT NOT NULL,
    
    tanggal_acara DATE NOT NULL,
    waktu_mulai TIME NOT NULL,
    waktu_selesai TIME NOT NULL,
    tempat_acara TEXT NOT NULL,
    
    agenda TEXT,
    peserta TEXT,
    dokumen_pendukung TEXT,
    hasil_pertemuan TEXT,
    tembusan TEXT,
    
    tempat_surat TEXT,
    tanggal_surat DATE,
    
    nama_ttd TEXT,
    jabatan_ttd TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    -- Constraint to prevent logic error in time ranges
    CONSTRAINT valid_waktu CHECK (waktu_selesai >= waktu_mulai)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_formulir_undangan_deleted_at ON public.formulir_undangan (deleted_at);
CREATE INDEX IF NOT EXISTS idx_formulir_undangan_id_admin ON public.formulir_undangan (id_admin);
CREATE INDEX IF NOT EXISTS idx_formulir_undangan_tanggal_acara ON public.formulir_undangan (tanggal_acara);

-- Create the view to match DataUndanganView schema for Frontend
CREATE OR REPLACE VIEW public.vw_undangan AS
SELECT 
    fu.id_formulir_undangan,
    fu.id_formulir_undangan AS id_data_undangan,
    fu.id_admin,
    a.username AS admin_username,
    fu.acara,
    fu.penyelenggara,
    fu.tanggal_acara,
    fu.waktu_mulai,
    fu.waktu_selesai,
    fu.tempat_acara,
    fu.agenda,
    fu.peserta,
    fu.dokumen_pendukung,
    fu.hasil_pertemuan,
    fu.tembusan,
    fu.tempat_surat,
    fu.tanggal_surat,
    fu.nama_ttd,
    fu.jabatan_ttd,
    fu.created_at AS tanggal_input,
    fu.updated_at,
    fu.deleted_at
FROM 
    public.formulir_undangan fu
JOIN 
    public.admin a ON fu.id_admin = a.id_admin;

-- Row Level Security (RLS) Configuration
ALTER TABLE public.formulir_undangan ENABLE ROW LEVEL SECURITY;

-- Idempotent Policy Creation (Drop then Create)
DROP POLICY IF EXISTS "Admins can select undangan" ON public.formulir_undangan;
CREATE POLICY "Admins can select undangan" ON public.formulir_undangan 
  FOR SELECT TO authenticated USING (public.get_current_admin_id() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can insert undangan" ON public.formulir_undangan;
CREATE POLICY "Admins can insert undangan" ON public.formulir_undangan 
  FOR INSERT TO authenticated WITH CHECK (id_admin = public.get_current_admin_id());

DROP POLICY IF EXISTS "Admins can update undangan" ON public.formulir_undangan;
CREATE POLICY "Admins can update undangan" ON public.formulir_undangan 
  FOR UPDATE TO authenticated 
  USING (id_admin = public.get_current_admin_id()) 
  WITH CHECK (id_admin = public.get_current_admin_id());

DROP POLICY IF EXISTS "Admins can delete undangan" ON public.formulir_undangan;
CREATE POLICY "Admins can delete undangan" ON public.formulir_undangan 
  FOR DELETE TO authenticated USING (id_admin = public.get_current_admin_id());
