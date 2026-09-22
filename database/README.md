# MyKwitansi — Database Schema

This directory contains the final locked database schema for the MyKwitansi application.

## Files

| File | Purpose |
|---|---|
| `schema/postgresql.sql` | Schema for Supabase / PostgreSQL (web deployment) |
| `schema/sqlite.sql` | Schema for Tauri / SQLite (desktop deployment) |
| `schema/seed.sql` | Development seed data (matches current mock frontend data) |

---

## Architecture

```
ADMIN
 ├──< FORMULIR_TRANSAKSI
 │       └──< PRINT_KWITANSI  (audit log)
 │
 └──< FORMULIR_NOTA
         ├──< ITEM_NOTA       (1:N, CASCADE on delete)
         └──< PRINT_NOTA      (audit log)
```

---

## Tables

### 1. `admin`
Stores application administrators.

| Field | Type | Constraints |
|---|---|---|
| `id_admin` | INTEGER | PK, AUTO INCREMENT |
| `username` | VARCHAR(50) | NOT NULL, UNIQUE |
| `password` | VARCHAR(255) | NOT NULL — bcrypt/Argon2 hash only |
| `jabatan` | TEXT | NOT NULL, CHECK IN ('bang_karir', 'bang_tensi') |

### 2. `formulir_transaksi`
Core transaction (kwitansi) header records.

| Field | Type | Constraints |
|---|---|---|
| `id_formulir_transaksi` | INTEGER | PK, AUTO INCREMENT |
| `terima_dari` | VARCHAR(255) | NOT NULL |
| `jumlah_uang` | DECIMAL(11,2) | NOT NULL |
| `untuk_pembayaran` | VARCHAR(255) | NOT NULL |
| `penerima_uang` | VARCHAR(255) | NOT NULL |
| `tanggal_transaksi` | TEXT | NOT NULL — ISO 8601 |
| `tanggal_input` | TEXT | NOT NULL — ISO 8601, set at creation |
| `kota` | VARCHAR(100) | NOT NULL |
| `total_harga` | DECIMAL(11,2) | NOT NULL — cached |
| `id_admin` | INTEGER | NOT NULL, FK → admin, ON DELETE RESTRICT |

### 3. `formulir_nota`
Nota document header. One nota contains many items.

| Field | Type | Constraints |
|---|---|---|
| `id_formulir_nota` | INTEGER | PK, AUTO INCREMENT |
| `tanggal_transaksi` | TEXT | NOT NULL — ISO 8601 |
| `total_harga` | DECIMAL(11,2) | NOT NULL — cached SUM of items |
| `id_admin` | INTEGER | NOT NULL, FK → admin, ON DELETE RESTRICT |

### 4. `item_nota`
Line items belonging to a `formulir_nota`. Enforces the 1:N relationship.

| Field | Type | Constraints |
|---|---|---|
| `id_item_nota` | INTEGER | PK, AUTO INCREMENT |
| `id_formulir_nota` | INTEGER | NOT NULL, FK → formulir_nota, **ON DELETE CASCADE** |
| `nama_barang` | VARCHAR(255) | NOT NULL |
| `satuan` | VARCHAR(50) | NOT NULL |
| `jumlah_item` | INTEGER | NOT NULL |
| `harga` | DECIMAL(11,2) | NOT NULL |
| `sub_total_harga` | DECIMAL(11,2) | NOT NULL — cached: harga × jumlah_item |

### 5. `print_kwitansi`
Append-only audit log — one row per kwitansi print event.

| Field | Type | Constraints |
|---|---|---|
| `id_print_kwitansi` | INTEGER | PK, AUTO INCREMENT |
| `id_formulir_transaksi` | INTEGER | NOT NULL, FK → formulir_transaksi, ON DELETE RESTRICT |
| `id_admin` | INTEGER | NOT NULL, FK → admin, ON DELETE RESTRICT |
| `print_timestamp` | TEXT | NOT NULL — ISO 8601 |

### 6. `print_nota`
Append-only audit log — one row per nota print event.

| Field | Type | Constraints |
|---|---|---|
| `id_print_nota` | INTEGER | PK, AUTO INCREMENT |
| `id_formulir_nota` | INTEGER | NOT NULL, FK → formulir_nota, ON DELETE RESTRICT |
| `id_admin` | INTEGER | NOT NULL, FK → admin, ON DELETE RESTRICT |
| `print_timestamp` | TEXT | NOT NULL — ISO 8601 |

---

## Delete Behavior

| Parent | Child | Behavior | Reason |
|---|---|---|---|
| admin | formulir_transaksi | RESTRICT | Financial records must not be silently lost |
| admin | formulir_nota | RESTRICT | Financial records must not be silently lost |
| formulir_transaksi | print_kwitansi | RESTRICT | Audit history must be preserved |
| formulir_nota | item_nota | **CASCADE** | Items are owned by their nota; deleting nota removes items |
| formulir_nota | print_nota | RESTRICT | Audit history must be preserved |

---

## Indexes

| Index | Table | Column(s) | Type |
|---|---|---|---|
| `uidx_admin_username` | admin | username | UNIQUE |
| `idx_formulir_transaksi_id_admin` | formulir_transaksi | id_admin | Standard |
| `idx_formulir_nota_id_admin` | formulir_nota | id_admin | Standard |
| `idx_item_nota_id_formulir_nota` | item_nota | id_formulir_nota | Standard |
| `idx_print_kwitansi_id_formulir_transaksi` | print_kwitansi | id_formulir_transaksi | Standard |
| `idx_print_kwitansi_id_admin` | print_kwitansi | id_admin | Standard |
| `idx_print_nota_id_formulir_nota` | print_nota | id_formulir_nota | Standard |
| `idx_print_nota_id_admin` | print_nota | id_admin | Standard |

---

## Locked Design Decisions

1. `data_transaksi` and `data_nota` tables are **removed**. Admin ownership is stored directly on the header tables.
2. **INTEGER auto-increment PKs** only. No UUID. Web ↔ Desktop sync is not a current requirement.
3. **TEXT (ISO 8601)** for all date/timestamp fields — portable across PostgreSQL and SQLite.
4. **TEXT + CHECK constraint** for `jabatan` — avoids PostgreSQL-native `ENUM` which SQLite cannot replicate.
5. `sub_total_harga` and `total_harga` are **cached/denormalized** values. The Service layer is responsible for updating them transactionally.
6. Print tables are **append-only audit logs**. Each print event creates a new row. No `print_count` column.

---

## PostgreSQL vs SQLite Differences

| Feature | PostgreSQL | SQLite |
|---|---|---|
| PK auto-increment | `SERIAL` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| Decimal precision | `DECIMAL(11,2)` | `REAL` (IEEE 754 double) |
| FK enforcement | On by default | Must `PRAGMA foreign_keys = ON` per connection |
| Named constraints | Supported | Supported (inline syntax) |
| ENUM | Available (not used) | Not available (TEXT+CHECK used) |
| Inline table comments | `COMMENT ON` | Not supported (omitted in sqlite.sql) |

---

## Usage

### PostgreSQL (Supabase)
```sql
-- Run in the Supabase SQL editor or via psql
\i database/schema/postgresql.sql
\i database/schema/seed.sql   -- dev only
```

### SQLite (Tauri Desktop)
```rust
// In Tauri Rust layer — execute once at app startup:
connection.execute_batch(include_str!("../../database/schema/sqlite.sql"))?;
// IMPORTANT: enable FK enforcement on every connection:
connection.execute_batch("PRAGMA foreign_keys = ON;")?;
```

---

## Service Layer Contract

Before implementing the Service Layer adapter, the following rules MUST be enforced in code:

1. **Creating a Nota**: Insert `formulir_nota`, then insert all `item_nota` rows, then update `formulir_nota.total_harga = SUM(sub_total_harga)` — all inside a single database transaction (`BEGIN ... COMMIT`).
2. **Updating a Nota**: Delete old `item_nota` rows (CASCADE handles cleanup), insert new rows, recalculate and update `formulir_nota.total_harga` — inside a single transaction.
3. **Deleting a Nota**: The database handles `item_nota` deletion via `ON DELETE CASCADE`. `print_nota` rows are RESTRICTED — deletion will fail if print history exists.
4. **Printing**: Always append a new row to `print_kwitansi` or `print_nota`. Never update or delete print records.
