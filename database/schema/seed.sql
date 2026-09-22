-- =============================================================================
-- MyKwitansi — Seed Data
-- =============================================================================
--
-- Purpose: Populate both PostgreSQL and SQLite databases with the same
--          initial admin accounts and sample data that match the current
--          mock frontend data (src/services/mockData.ts).
--
-- IMPORTANT:
--   • Passwords below are bcrypt hashes of the mock test passwords.
--     Replace these with real Argon2 / bcrypt hashes before any deployment.
--   • This seed file is for development only.
--   • Run AFTER the schema (postgresql.sql or sqlite.sql).
-- =============================================================================


-- ── admin ─────────────────────────────────────────────────────────────────────
-- Mock passwords hash of 'password123' using bcrypt cost=12 (illustrative).
-- REPLACE with real hashes before deployment.

INSERT INTO admin (username, password, jabatan) VALUES
    ('Bang Karir', '$2b$12$PLACEHOLDER_HASH_BANG_KARIR_REPLACE_ME', 'bang_karir'),
    ('Bang Tensi', '$2b$12$PLACEHOLDER_HASH_BANG_TENSI_REPLACE_ME', 'bang_tensi');


-- ── formulir_transaksi ────────────────────────────────────────────────────────

INSERT INTO formulir_transaksi
    (terima_dari, jumlah_uang, untuk_pembayaran, penerima_uang, tanggal_transaksi, tanggal_input, kota, total_harga, id_admin)
VALUES
    ('Universitas Telkom', 5750000,     'Extra Fooding', 'Bang Karir', '2025-01-16', '2025-01-19', 'Jakarta', 5750000,     1),
    ('Universitas Telkom', 978750000,   'Extra Fooding', 'Bang Karir', '2025-01-05', '2025-01-07', 'Jakarta', 978750000,   1),
    ('Universitas Telkom', 90000000,    'Extra Fooding', 'Bang Tensi', '2025-01-05', '2025-01-07', 'Jakarta', 90000000,    2),
    ('Universitas Telkom', 809200000,   'Extra Fooding', 'Bang Karir', '2025-01-05', '2025-01-07', 'Jakarta', 809200000,   1),
    ('Universitas Telkom', 23000000,    'Extra Fooding', 'Bang Karir', '2025-01-05', '2025-01-07', 'Jakarta', 23000000,    1),
    ('Universitas Telkom', 978750000,   'Extra Fooding', 'Bang Tensi', '2024-12-15', '2024-12-20', 'Jakarta', 978750000,   2),
    ('Universitas Telkom', 90000000,    'Extra Fooding', 'Bang Tensi', '2024-12-15', '2024-12-20', 'Jakarta', 90000000,    2);


-- ── formulir_nota ─────────────────────────────────────────────────────────────

INSERT INTO formulir_nota (tanggal_transaksi, total_harga, id_admin) VALUES
    ('2025-01-05', 725000,  2),   -- id_formulir_nota = 1  (Bang Tensi)
    ('2025-01-05', 542500,  1),   -- id_formulir_nota = 2  (Bang Karir)
    ('2024-12-15', 386000,  2);   -- id_formulir_nota = 3  (Bang Tensi)


-- ── item_nota ─────────────────────────────────────────────────────────────────

-- Nota 1 items
INSERT INTO item_nota (id_formulir_nota, nama_barang, satuan, jumlah_item, harga, sub_total_harga) VALUES
    (1, 'Tinta Printer', 'pcs', 4,  105000, 420000),
    (1, 'HVS',           'rim', 3,  85000,  255000),
    (1, 'Tel-U Fresh',   'pcs', 2,  25000,  50000);

-- Nota 2 items
INSERT INTO item_nota (id_formulir_nota, nama_barang, satuan, jumlah_item, harga, sub_total_harga) VALUES
    (2, 'Beng-Beng',   'pcs', 35, 3500,   122500),
    (2, 'Kopi Mandja', 'pcs', 12, 35000,  420000);

-- Nota 3 items
INSERT INTO item_nota (id_formulir_nota, nama_barang, satuan, jumlah_item, harga, sub_total_harga) VALUES
    (3, 'Roti Bakar Boss', 'pcs', 12, 28000, 336000),
    (3, 'Tel-U Fresh',     'pcs', 2,  25000, 50000);


-- =============================================================================
-- END OF SEED DATA
-- =============================================================================
