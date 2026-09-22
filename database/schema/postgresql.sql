-- =============================================================================
-- MyKwitansi — Final Database Schema (PostgreSQL)
-- =============================================================================
--
-- Target:    Supabase / PostgreSQL
-- Portability note: A separate schema/sqlite.sql file targets SQLite.
--                   Both files define an identical logical schema; only the
--                   syntax for PK auto-increment differs.
--
-- Locked design decisions:
--   • data_transaksi and data_nota are REMOVED.
--     Admin ownership is on the header tables directly.
--   • Integer auto-increment PKs (no UUID).
--   • TEXT for dates (ISO 8601) for cross-DB portability.
--   • TEXT + CHECK for jabatan (no native ENUM).
--   • Cached financial totals: sub_total_harga, total_harga.
--   • Print tables are append-only audit logs (one row per print event).
--   • CASCADE: formulir_nota → item_nota only.
--   • RESTRICT everywhere else to preserve financial / audit history.
-- =============================================================================


-- ── 1. admin ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin (
    id_admin  SERIAL        PRIMARY KEY,
    username  VARCHAR(50)   NOT NULL UNIQUE,
    password  VARCHAR(255)  NOT NULL,          -- bcrypt / Argon2 hash; NEVER plaintext
    jabatan   TEXT          NOT NULL
        CONSTRAINT chk_admin_jabatan
            CHECK (jabatan IN ('bang_karir', 'bang_tensi'))
);

COMMENT ON TABLE  admin             IS 'Application administrators.';
COMMENT ON COLUMN admin.password    IS 'Stores a bcrypt/Argon2 hash. Never store plaintext.';
COMMENT ON COLUMN admin.jabatan     IS 'Role: bang_karir or bang_tensi.';


-- ── 2. formulir_transaksi ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS formulir_transaksi (
    id_formulir_transaksi  SERIAL          PRIMARY KEY,
    terima_dari            VARCHAR(255)    NOT NULL,
    jumlah_uang            DECIMAL(11, 2)  NOT NULL,
    untuk_pembayaran       VARCHAR(255)    NOT NULL,
    penerima_uang          VARCHAR(255)    NOT NULL,
    tanggal_transaksi      TEXT            NOT NULL,   -- ISO 8601 e.g. "2025-01-16"
    tanggal_input          TEXT            NOT NULL,   -- ISO 8601, set at record creation
    kota                   VARCHAR(100)    NOT NULL,
    total_harga            DECIMAL(11, 2)  NOT NULL,   -- cached; currently mirrors jumlah_uang
    id_admin               INTEGER         NOT NULL
        CONSTRAINT fk_formulir_transaksi_admin
            REFERENCES admin (id_admin)
            ON DELETE RESTRICT
            ON UPDATE CASCADE
);

COMMENT ON TABLE  formulir_transaksi                IS 'Core transaction (kwitansi) header records.';
COMMENT ON COLUMN formulir_transaksi.total_harga    IS 'Cached total. Currently mirrors jumlah_uang; preserved for future itemised transaction support.';
COMMENT ON COLUMN formulir_transaksi.tanggal_input  IS 'Server-side creation timestamp. Set by the application layer, not editable by users.';


-- ── 3. formulir_nota ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS formulir_nota (
    id_formulir_nota   SERIAL          PRIMARY KEY,
    tanggal_transaksi  TEXT            NOT NULL,       -- ISO 8601
    tanggal_input      TEXT            NOT NULL,       -- ISO 8601
    total_harga        DECIMAL(11, 2)  NOT NULL,       -- cached SUM(item_nota.sub_total_harga)
    id_admin           INTEGER         NOT NULL
        CONSTRAINT fk_formulir_nota_admin
            REFERENCES admin (id_admin)
            ON DELETE RESTRICT
            ON UPDATE CASCADE
);

COMMENT ON TABLE  formulir_nota              IS 'Nota document header. One nota contains many items.';
COMMENT ON COLUMN formulir_nota.total_harga  IS 'Denormalized cache of SUM(item_nota.sub_total_harga). Must be kept consistent by the service layer inside a single transaction whenever items are added/updated/deleted.';


-- ── 4. item_nota ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS item_nota (
    id_item_nota      SERIAL          PRIMARY KEY,
    id_formulir_nota  INTEGER         NOT NULL
        CONSTRAINT fk_item_nota_formulir_nota
            REFERENCES formulir_nota (id_formulir_nota)
            ON DELETE CASCADE          -- items are owned by their nota document
            ON UPDATE CASCADE,
    nama_barang       VARCHAR(255)    NOT NULL,
    satuan            VARCHAR(50)     NOT NULL,
    jumlah_item       INTEGER         NOT NULL,
    harga             DECIMAL(11, 2)  NOT NULL,
    sub_total_harga   DECIMAL(11, 2)  NOT NULL   -- cached: harga × jumlah_item
);

COMMENT ON TABLE  item_nota                 IS 'Line items belonging to a formulir_nota. 1 nota → N items.';
COMMENT ON COLUMN item_nota.sub_total_harga IS 'Denormalized cache: harga × jumlah_item. Must be recomputed by the service layer on every save.';


-- ── 5. print_kwitansi ────────────────────────────────────────────────────────
--
-- AUDIT LOG: every print action appends a new row.
-- Do NOT use a print_count column.

CREATE TABLE IF NOT EXISTS print_kwitansi (
    id_print_kwitansi      SERIAL   PRIMARY KEY,
    id_formulir_transaksi  INTEGER  NOT NULL
        CONSTRAINT fk_print_kwitansi_formulir_transaksi
            REFERENCES formulir_transaksi (id_formulir_transaksi)
            ON DELETE RESTRICT   -- preserve audit history even if transaction is deleted
            ON UPDATE CASCADE,
    id_admin               INTEGER  NOT NULL
        CONSTRAINT fk_print_kwitansi_admin
            REFERENCES admin (id_admin)
            ON DELETE RESTRICT
            ON UPDATE CASCADE,
    print_timestamp        TEXT     NOT NULL    -- ISO 8601 datetime of the print event
);

COMMENT ON TABLE  print_kwitansi                 IS 'Append-only audit log: one row per kwitansi print event.';
COMMENT ON COLUMN print_kwitansi.print_timestamp IS 'ISO 8601 timestamp set by the application when the print action is triggered.';


-- ── 6. print_nota ────────────────────────────────────────────────────────────
--
-- AUDIT LOG: every print action appends a new row.

CREATE TABLE IF NOT EXISTS print_nota (
    id_print_nota      SERIAL   PRIMARY KEY,
    id_formulir_nota   INTEGER  NOT NULL
        CONSTRAINT fk_print_nota_formulir_nota
            REFERENCES formulir_nota (id_formulir_nota)
            ON DELETE RESTRICT   -- preserve audit history
            ON UPDATE CASCADE,
    id_admin           INTEGER  NOT NULL
        CONSTRAINT fk_print_nota_admin
            REFERENCES admin (id_admin)
            ON DELETE RESTRICT
            ON UPDATE CASCADE,
    print_timestamp    TEXT     NOT NULL    -- ISO 8601 datetime of the print event
);

COMMENT ON TABLE  print_nota                 IS 'Append-only audit log: one row per nota print event.';
COMMENT ON COLUMN print_nota.print_timestamp IS 'ISO 8601 timestamp set by the application when the print action is triggered.';


-- =============================================================================
-- INDEXES
-- =============================================================================

-- admin
CREATE UNIQUE INDEX IF NOT EXISTS uidx_admin_username
    ON admin (username);

-- formulir_transaksi
CREATE INDEX IF NOT EXISTS idx_formulir_transaksi_id_admin
    ON formulir_transaksi (id_admin);

-- formulir_nota
CREATE INDEX IF NOT EXISTS idx_formulir_nota_id_admin
    ON formulir_nota (id_admin);

-- item_nota
CREATE INDEX IF NOT EXISTS idx_item_nota_id_formulir_nota
    ON item_nota (id_formulir_nota);

-- print_kwitansi
CREATE INDEX IF NOT EXISTS idx_print_kwitansi_id_formulir_transaksi
    ON print_kwitansi (id_formulir_transaksi);

CREATE INDEX IF NOT EXISTS idx_print_kwitansi_id_admin
    ON print_kwitansi (id_admin);

-- print_nota
CREATE INDEX IF NOT EXISTS idx_print_nota_id_formulir_nota
    ON print_nota (id_formulir_nota);

CREATE INDEX IF NOT EXISTS idx_print_nota_id_admin
    ON print_nota (id_admin);


-- =============================================================================
-- END OF SCHEMA
-- =============================================================================
