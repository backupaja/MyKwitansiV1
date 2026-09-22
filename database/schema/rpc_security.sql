-- =============================================================================
-- MyKwitansi — Security & RPC Enhancements (Hardened Ownership & Idempotent)
-- =============================================================================

-- ── 1. Admin Table Migration ─────────────────────────────────────────────────
ALTER TABLE public.admin ADD COLUMN IF NOT EXISTS auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
-- Note: 'password' column is kept for legacy mock compatibility, but ignored in production.

-- ── 2. Row Level Security (RLS) ──────────────────────────────────────────────
ALTER TABLE public.admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formulir_transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formulir_nota ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_nota ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_kwitansi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.print_nota ENABLE ROW LEVEL SECURITY;

-- Helper function to identify valid admins and bypass infinite recursion
CREATE OR REPLACE FUNCTION public.get_current_admin_id() RETURNS INTEGER AS $$
    SELECT id_admin FROM public.admin WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

REVOKE EXECUTE ON FUNCTION public.get_current_admin_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_current_admin_id() TO authenticated;

-- Helper function for login to resolve email from username safely (accessible to anon)
CREATE OR REPLACE FUNCTION public.resolve_login_email(p_username TEXT) RETURNS TEXT AS $$
DECLARE
    v_auth_id UUID;
    v_email TEXT;
BEGIN
    SELECT auth_id INTO v_auth_id FROM public.admin WHERE username = p_username;
    IF v_auth_id IS NULL THEN
        RETURN NULL;
    END IF;
    SELECT email INTO v_email FROM auth.users WHERE id = v_auth_id;
    RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Note: We grant this to anon so the login form can resolve the email before authentication.
REVOKE EXECUTE ON FUNCTION public.resolve_login_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_login_email(TEXT) TO anon, authenticated;

-- ── Admin Table Policies ──
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.admin;
CREATE POLICY "Admins can view all profiles" ON public.admin 
  FOR SELECT TO authenticated USING (public.get_current_admin_id() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can update own profile only" ON public.admin;
CREATE POLICY "Admins can update own profile only" ON public.admin 
  FOR UPDATE TO authenticated USING (auth_id = auth.uid()) WITH CHECK (auth_id = auth.uid());

DROP POLICY IF EXISTS "Disallow client admin inserts" ON public.admin;
CREATE POLICY "Disallow client admin inserts" ON public.admin 
  FOR INSERT TO authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "Disallow client admin deletes" ON public.admin;
CREATE POLICY "Disallow client admin deletes" ON public.admin 
  FOR DELETE TO authenticated USING (false);

-- ── Formulir Transaksi Policies ──
DROP POLICY IF EXISTS "Admins can select transactions" ON public.formulir_transaksi;
CREATE POLICY "Admins can select transactions" ON public.formulir_transaksi 
  FOR SELECT TO authenticated USING (public.get_current_admin_id() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can insert transactions" ON public.formulir_transaksi;
CREATE POLICY "Admins can insert transactions" ON public.formulir_transaksi 
  FOR INSERT TO authenticated WITH CHECK (id_admin = public.get_current_admin_id());

DROP POLICY IF EXISTS "Admins can update transactions" ON public.formulir_transaksi;
CREATE POLICY "Admins can update transactions" ON public.formulir_transaksi 
  FOR UPDATE TO authenticated 
  USING (id_admin = public.get_current_admin_id()) 
  WITH CHECK (id_admin = public.get_current_admin_id());

DROP POLICY IF EXISTS "Admins can delete transactions" ON public.formulir_transaksi;
CREATE POLICY "Admins can delete transactions" ON public.formulir_transaksi 
  FOR DELETE TO authenticated USING (id_admin = public.get_current_admin_id());

-- ── Formulir Nota Policies ──
DROP POLICY IF EXISTS "Admins can select nota" ON public.formulir_nota;
CREATE POLICY "Admins can select nota" ON public.formulir_nota 
  FOR SELECT TO authenticated USING (public.get_current_admin_id() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can insert nota" ON public.formulir_nota;
CREATE POLICY "Admins can insert nota" ON public.formulir_nota 
  FOR INSERT TO authenticated WITH CHECK (id_admin = public.get_current_admin_id());

DROP POLICY IF EXISTS "Admins can update nota" ON public.formulir_nota;
CREATE POLICY "Admins can update nota" ON public.formulir_nota 
  FOR UPDATE TO authenticated 
  USING (id_admin = public.get_current_admin_id()) 
  WITH CHECK (id_admin = public.get_current_admin_id());

DROP POLICY IF EXISTS "Admins can delete nota" ON public.formulir_nota;
CREATE POLICY "Admins can delete nota" ON public.formulir_nota 
  FOR DELETE TO authenticated USING (id_admin = public.get_current_admin_id());

-- ── Item Nota Policies ──
DROP POLICY IF EXISTS "Admins can select item nota" ON public.item_nota;
CREATE POLICY "Admins can select item nota" ON public.item_nota 
  FOR SELECT TO authenticated USING (public.get_current_admin_id() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can insert item nota" ON public.item_nota;
CREATE POLICY "Admins can insert item nota" ON public.item_nota 
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.formulir_nota fn 
      WHERE fn.id_formulir_nota = item_nota.id_formulir_nota 
      AND fn.id_admin = public.get_current_admin_id()
    )
  );

DROP POLICY IF EXISTS "Admins can update item nota" ON public.item_nota;
CREATE POLICY "Admins can update item nota" ON public.item_nota 
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.formulir_nota fn 
      WHERE fn.id_formulir_nota = item_nota.id_formulir_nota 
      AND fn.id_admin = public.get_current_admin_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.formulir_nota fn 
      WHERE fn.id_formulir_nota = item_nota.id_formulir_nota 
      AND fn.id_admin = public.get_current_admin_id()
    )
  );

DROP POLICY IF EXISTS "Admins can delete item nota" ON public.item_nota;
CREATE POLICY "Admins can delete item nota" ON public.item_nota 
  FOR DELETE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.formulir_nota fn 
      WHERE fn.id_formulir_nota = item_nota.id_formulir_nota 
      AND fn.id_admin = public.get_current_admin_id()
    )
  );

-- ── Print Audit Policies ──
DROP POLICY IF EXISTS "Admins can select print kwitansi" ON public.print_kwitansi;
CREATE POLICY "Admins can select print kwitansi" ON public.print_kwitansi 
  FOR SELECT TO authenticated USING (public.get_current_admin_id() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can insert print kwitansi" ON public.print_kwitansi;
CREATE POLICY "Admins can insert print kwitansi" ON public.print_kwitansi 
  FOR INSERT TO authenticated WITH CHECK (id_admin = public.get_current_admin_id());

DROP POLICY IF EXISTS "Disallow update print kwitansi" ON public.print_kwitansi;
CREATE POLICY "Disallow update print kwitansi" ON public.print_kwitansi 
  FOR UPDATE TO authenticated USING (false);

DROP POLICY IF EXISTS "Disallow delete print kwitansi" ON public.print_kwitansi;
CREATE POLICY "Disallow delete print kwitansi" ON public.print_kwitansi 
  FOR DELETE TO authenticated USING (false);


DROP POLICY IF EXISTS "Admins can select print nota" ON public.print_nota;
CREATE POLICY "Admins can select print nota" ON public.print_nota 
  FOR SELECT TO authenticated USING (public.get_current_admin_id() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can insert print nota" ON public.print_nota;
CREATE POLICY "Admins can insert print nota" ON public.print_nota 
  FOR INSERT TO authenticated WITH CHECK (id_admin = public.get_current_admin_id());

DROP POLICY IF EXISTS "Disallow update print nota" ON public.print_nota;
CREATE POLICY "Disallow update print nota" ON public.print_nota 
  FOR UPDATE TO authenticated USING (false);

DROP POLICY IF EXISTS "Disallow delete print nota" ON public.print_nota;
CREATE POLICY "Disallow delete print nota" ON public.print_nota 
  FOR DELETE TO authenticated USING (false);

-- ── 3. Nota Atomicity RPCs ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.create_nota(
    p_tanggal_transaksi TEXT,
    p_items JSONB
) RETURNS SETOF public.formulir_nota AS $$
DECLARE
    v_id_formulir_nota INTEGER;
    v_total_harga DECIMAL(11,2) := 0;
    v_item JSONB;
    v_sub_total DECIMAL(11,2);
    v_id_admin INTEGER;
BEGIN
    -- 1. Authorize & Resolve Admin Identity
    v_id_admin := public.get_current_admin_id();
    IF v_id_admin IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Invalid admin profile.';
    END IF;

    -- 2. Insert header with temporary total and strictly generated tanggal_input
    INSERT INTO public.formulir_nota (tanggal_transaksi, total_harga, id_admin, tanggal_input)
    VALUES (p_tanggal_transaksi, 0, v_id_admin, to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))
    RETURNING id_formulir_nota INTO v_id_formulir_nota;

    -- 3. Iterate items, calculate subtotal precisely, and accumulate total
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_sub_total := (v_item->>'harga')::DECIMAL * (v_item->>'jumlah_item')::INTEGER;
        v_total_harga := v_total_harga + v_sub_total;

        INSERT INTO public.item_nota (id_formulir_nota, nama_barang, satuan, jumlah_item, harga, sub_total_harga)
        VALUES (
            v_id_formulir_nota,
            v_item->>'nama_barang',
            v_item->>'satuan',
            (v_item->>'jumlah_item')::INTEGER,
            (v_item->>'harga')::DECIMAL,
            v_sub_total
        );
    END LOOP;

    -- 4. Apply final calculated total_harga
    UPDATE public.formulir_nota
    SET total_harga = v_total_harga
    WHERE id_formulir_nota = v_id_formulir_nota;

    RETURN QUERY SELECT * FROM public.formulir_nota WHERE id_formulir_nota = v_id_formulir_nota;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

REVOKE EXECUTE ON FUNCTION public.create_nota(TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_nota(TEXT, JSONB) TO authenticated;


CREATE OR REPLACE FUNCTION public.update_nota(
    p_id_formulir_nota INTEGER,
    p_tanggal_transaksi TEXT,
    p_items JSONB
) RETURNS SETOF public.formulir_nota AS $$
DECLARE
    v_total_harga DECIMAL(11,2) := 0;
    v_item JSONB;
    v_sub_total DECIMAL(11,2);
    v_id_admin INTEGER;
    v_owner_id INTEGER;
BEGIN
    -- 1. Authorize & Resolve Admin Identity
    v_id_admin := public.get_current_admin_id();
    IF v_id_admin IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Invalid admin profile.';
    END IF;

    -- 2. Verify Ownership
    SELECT id_admin INTO v_owner_id FROM public.formulir_nota WHERE id_formulir_nota = p_id_formulir_nota;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Not Found: Nota does not exist.';
    END IF;
    
    IF v_owner_id != v_id_admin THEN
        RAISE EXCEPTION 'Forbidden: You do not have permission to modify this Nota.';
    END IF;

    -- 3. Purge old items
    DELETE FROM public.item_nota WHERE id_formulir_nota = p_id_formulir_nota;

    -- 4. Iterate new items, calculate subtotals, and accumulate total
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_sub_total := (v_item->>'harga')::DECIMAL * (v_item->>'jumlah_item')::INTEGER;
        v_total_harga := v_total_harga + v_sub_total;

        INSERT INTO public.item_nota (id_formulir_nota, nama_barang, satuan, jumlah_item, harga, sub_total_harga)
        VALUES (
            p_id_formulir_nota,
            v_item->>'nama_barang',
            v_item->>'satuan',
            (v_item->>'jumlah_item')::INTEGER,
            (v_item->>'harga')::DECIMAL,
            v_sub_total
        );
    END LOOP;

    -- 5. Update header properties and final calculated total
    UPDATE public.formulir_nota
    SET 
        tanggal_transaksi = p_tanggal_transaksi,
        total_harga = v_total_harga
        -- id_admin remains unchanged as it is owned by the creator
    WHERE id_formulir_nota = p_id_formulir_nota;

    RETURN QUERY SELECT * FROM public.formulir_nota WHERE id_formulir_nota = p_id_formulir_nota;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

REVOKE EXECUTE ON FUNCTION public.update_nota(INTEGER, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_nota(INTEGER, TEXT, JSONB) TO authenticated;
