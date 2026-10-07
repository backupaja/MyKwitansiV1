-- =============================================================================
-- Migration: 03 - Add Undangan Feature
-- Description: Creates the formulir_undangan table for the new feature.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.formulir_undangan (
    id_formulir_undangan SERIAL PRIMARY KEY,
    id_admin INTEGER NOT NULL REFERENCES public.admin(id_admin) ON DELETE RESTRICT,
    acara TEXT NOT NULL,
    penyelenggara TEXT,
    tanggal_acara TEXT NOT NULL,
    waktu TEXT,
    tempat TEXT,
    agenda TEXT,
    peserta TEXT,
    dokumen_pendukung TEXT,
    hasil_pertemuan TEXT,
    tembusan TEXT,
    tempat_tanggal_surat TEXT,
    nama_ttd TEXT,
    jabatan_ttd TEXT,
    tanggal_input TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_formulir_undangan_deleted_at ON public.formulir_undangan (deleted_at);
CREATE INDEX IF NOT EXISTS idx_formulir_undangan_id_admin ON public.formulir_undangan (id_admin);
CREATE INDEX IF NOT EXISTS idx_formulir_undangan_tanggal_acara ON public.formulir_undangan (tanggal_acara);

-- Row Level Security
ALTER TABLE public.formulir_undangan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" 
ON public.formulir_undangan FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON public.formulir_undangan FOR INSERT 
TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" 
ON public.formulir_undangan FOR UPDATE 
TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" 
ON public.formulir_undangan FOR DELETE 
TO authenticated USING (true);

-- Create the view to match DataUndanganView schema
CREATE OR REPLACE VIEW public.vw_undangan AS
SELECT 
    fu.id_formulir_undangan,
    fu.id_formulir_undangan AS id_data_undangan, -- Alias for UI compatibility
    fu.id_admin,
    a.username AS admin_username,
    fu.acara,
    fu.penyelenggara,
    fu.tanggal_acara,
    fu.waktu,
    fu.tempat,
    fu.agenda,
    fu.peserta,
    fu.dokumen_pendukung,
    fu.hasil_pertemuan,
    fu.tembusan,
    fu.tempat_tanggal_surat,
    fu.nama_ttd,
    fu.jabatan_ttd,
    fu.tanggal_input,
    fu.deleted_at
FROM 
    public.formulir_undangan fu
JOIN 
    public.admin a ON fu.id_admin = a.id_admin;
