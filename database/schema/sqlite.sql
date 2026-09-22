-- =============================================================================
-- MyKwitansi — Final Database Schema (SQLite)
-- =============================================================================
--
-- Target:    Tauri / SQLite (desktop application)
-- Portability note: A separate schema/postgresql.sql file targets Supabase.
--                   Both files define an identical logical schema.
--
-- SQLite differences handled here:
--   • SERIAL → INTEGER PRIMARY KEY AUTOINCREMENT
--   • DECIMAL(11,2) → REAL (SQLite stores all real numbers as 8-byte IEEE 754)
--   • No native ENUM → TEXT + CHECK constraint (identical to PostgreSQL version)
--   • UNIQUE INDEX syntax is SQLite-compatible (CREATE UNIQUE INDEX)
--   • IF NOT EXISTS on every statement for idempotent initialization
--   • PRAGMA foreign_keys = ON must be called per-connection in Tauri/Rust
--
-- Locked design decisions: identical to postgresql.sql
--   • data_transaksi and data_nota do NOT exist.
--   • Integer auto-increment PKs.
--   • TEXT for dates (ISO 8601).
--   • TEXT + CHECK for jabatan.
--   • Cached sub_total_harga and total_harga.
--   • Append-only print audit logs.
--   • CASCADE: formulir_nota → item_nota only.
--   • RESTRICT everywhere else.
-- =============================================================================

-- Enable FK enforcement (must also be called per-connection in application code)
PRAGMA foreign_keys = ON;


-- ── 1. admin ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin (
    id_admin  INTEGER       PRIMARY KEY AUTOINCREMENT,
    username  VARCHAR(50)   NOT NULL UNIQUE,
    password  VARCHAR(255)  NOT NULL,           -- bcrypt / Argon2 hash; NEVER plaintext
    jabatan   TEXT          NOT NULL
        CHECK (jabatan IN ('bang_karir', 'bang_tensi'))
);


-- ── 2. formulir_transaksi ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS formulir_transaksi (
    id_formulir_transaksi  INTEGER       PRIMARY KEY AUTOINCREMENT,
    terima_dari            VARCHAR(255)  NOT NULL,
    jumlah_uang            REAL          NOT NULL,   -- DECIMAL(11,2) equivalent in SQLite
    untuk_pembayaran       VARCHAR(255)  NOT NULL,
    penerima_uang          VARCHAR(255)  NOT NULL,
    tanggal_transaksi      TEXT          NOT NULL,   -- ISO 8601
    tanggal_input          TEXT          NOT NULL,   -- ISO 8601, set at creation
    kota                   VARCHAR(100)  NOT NULL,
    total_harga            REAL          NOT NULL,   -- cached; currently mirrors jumlah_uang
    id_admin               INTEGER       NOT NULL
        REFERENCES admin (id_admin)
        DEFERRABLE INITIALLY DEFERRED
);


-- ── 3. formulir_nota ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS formulir_nota (
    id_formulir_nota   INTEGER   PRIMARY KEY AUTOINCREMENT,
    tanggal_transaksi  TEXT            NOT NULL,
    tanggal_input      TEXT            NOT NULL,
    total_harga        DECIMAL(11, 2)  NOT NULL,   -- cached SUM(item_nota.sub_total_harga)
    id_admin           INTEGER   NOT NULL
        REFERENCES admin (id_admin)
        DEFERRABLE INITIALLY DEFERRED
);


-- ── 4. item_nota ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS item_nota (
    id_item_nota      INTEGER       PRIMARY KEY AUTOINCREMENT,
    id_formulir_nota  INTEGER       NOT NULL
        REFERENCES formulir_nota (id_formulir_nota)
        ON DELETE CASCADE        -- items owned by their nota document
        ON UPDATE CASCADE,
    nama_barang       VARCHAR(255)  NOT NULL,
    satuan            VARCHAR(50)   NOT NULL,
    jumlah_item       INTEGER       NOT NULL,
    harga             REAL          NOT NULL,
    sub_total_harga   REAL          NOT NULL   -- cached: harga × jumlah_item
);


-- ── 5. print_kwitansi ────────────────────────────────────────────────────────
-- AUDIT LOG: every print action appends a new row.

CREATE TABLE IF NOT EXISTS print_kwitansi (
    id_print_kwitansi      INTEGER  PRIMARY KEY AUTOINCREMENT,
    id_formulir_transaksi  INTEGER  NOT NULL
        REFERENCES formulir_transaksi (id_formulir_transaksi)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    id_admin               INTEGER  NOT NULL
        REFERENCES admin (id_admin)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    print_timestamp        TEXT     NOT NULL    -- ISO 8601 datetime
);


-- ── 6. print_nota ────────────────────────────────────────────────────────────
-- AUDIT LOG: every print action appends a new row.

CREATE TABLE IF NOT EXISTS print_nota (
    id_print_nota     INTEGER  PRIMARY KEY AUTOINCREMENT,
    id_formulir_nota  INTEGER  NOT NULL
        REFERENCES formulir_nota (id_formulir_nota)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    id_admin          INTEGER  NOT NULL
        REFERENCES admin (id_admin)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    print_timestamp   TEXT     NOT NULL    -- ISO 8601 datetime
);


-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS uidx_admin_username
    ON admin (username);

CREATE INDEX IF NOT EXISTS idx_formulir_transaksi_id_admin
    ON formulir_transaksi (id_admin);

CREATE INDEX IF NOT EXISTS idx_formulir_nota_id_admin
    ON formulir_nota (id_admin);

CREATE INDEX IF NOT EXISTS idx_item_nota_id_formulir_nota
    ON item_nota (id_formulir_nota);

CREATE INDEX IF NOT EXISTS idx_print_kwitansi_id_formulir_transaksi
    ON print_kwitansi (id_formulir_transaksi);

CREATE INDEX IF NOT EXISTS idx_print_kwitansi_id_admin
    ON print_kwitansi (id_admin);

CREATE INDEX IF NOT EXISTS idx_print_nota_id_formulir_nota
    ON print_nota (id_formulir_nota);

CREATE INDEX IF NOT EXISTS idx_print_nota_id_admin
    ON print_nota (id_admin);


-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
