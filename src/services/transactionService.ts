/**
 * TransactionService — CRUD for formulir_transaksi (kwitansi transactions).
 *
 * SERVICE CONTRACT:
 *   getAll()                       → DataTransaksiView[]
 *   getById(id)                    → DataTransaksiView | undefined
 *   create(input, adminId)         → DataTransaksiView
 *   update(id, input, adminId)     → DataTransaksiView
 *   delete(id)                     → void
 *   search(query)                  → DataTransaksiView[]
 *
 * DATABASE MAPPING (final schema):
 *   formulir_transaksi: all transaction fields + id_admin (FK → admin)
 *   data_transaksi: REMOVED — admin FK is on formulir_transaksi directly.
 *
 * VIEW ALIAS:
 *   DataTransaksiView.id_data_transaksi = id_formulir_transaksi
 *   Both are set to the same value by the service layer.
 *   This preserves UI compatibility with zero page changes.
 *
 * MOCK PHASE:
 *   In-memory store seeded from mockData.ts.
 *   Replace with:
 *     - Supabase client queries (web)
 *     - Tauri invoke("transaction_*") commands (desktop)
 */
import type { DataTransaksiView, CreateFormulirTransaksiInput } from "../types";
import { MOCK_TRANSAKSI } from "./mockData";

// Duplicated intentionally in each service (not shared global) so that each
// service can be replaced independently when real backends are introduced.
const ADMIN_NAMES: Record<number, string> = { 1: "Bang Karir", 2: "Bang Tensi" };

// ─── Service interface ────────────────────────────────────────────────────────

export interface TransactionService {
  /** Return all transactions joined with admin. */
  getAll(): Promise<DataTransaksiView[]>;
  /** Return a single transaction by id_formulir_transaksi (= id_data_transaksi alias). */
  getById(id: number): Promise<DataTransaksiView | undefined>;
  /** Create a new formulir_transaksi record. */
  create(input: CreateFormulirTransaksiInput, adminId: number): Promise<DataTransaksiView>;
  /** Update an existing formulir_transaksi's editable fields. */
  update(id: number, input: CreateFormulirTransaksiInput, adminId: number): Promise<DataTransaksiView>;
  /** Delete a formulir_transaksi by id (= id_formulir_transaksi). */
  delete(id: number): Promise<void>;
  /** Search by terima_dari, admin username, or untuk_pembayaran. */
  search(query: string): Promise<DataTransaksiView[]>;
  /** Return all soft-deleted transactions. */
  getDeleted(): Promise<DataTransaksiView[]>;
  /** Restore a soft-deleted transaction. */
  restore(id: number): Promise<void>;
  /** Permanently delete a transaction. */
  hardDelete(id: number): Promise<void>;
}

// ─── Stub (in-memory mock store) ─────────────────────────────────────────────

const _store: DataTransaksiView[] = [...MOCK_TRANSAKSI];

/** Collision-safe next ID: max existing id + 1. */
function nextId(): number {
  if (_store.length === 0) return 1;
  return Math.max(..._store.map((r) => r.id_formulir_transaksi)) + 1;
}

export const transactionService: TransactionService = {
  async getAll() {
    return _store.filter((r) => !r.deleted_at);
  },

  async getById(id) {
    return _store.find((r) => r.id_formulir_transaksi === id && !r.deleted_at);
  },

  async create(input, adminId) {
    const id = nextId();
    const newRow: DataTransaksiView = {
      id_formulir_transaksi: id,
      id_data_transaksi:     id,   // UI alias — always equal to id_formulir_transaksi
      id_admin:              adminId,
      tanggal_transaksi:     input.tanggal_transaksi,
      tanggal_input:         new Date().toLocaleDateString("id-ID"),
      terima_dari:           input.terima_dari,
      jumlah_uang:           input.jumlah_uang,
      untuk_pembayaran:      input.untuk_pembayaran,
      penerima_uang:         input.penerima_uang,
      kota:                  input.kota,
      total_harga:           input.total_harga || input.jumlah_uang,
      admin_username:        ADMIN_NAMES[adminId] ?? String(adminId),
      deleted_at:            null,
    };
    _store.unshift(newRow);
    return newRow;
  },

  async update(id, input, adminId) {
    const idx = _store.findIndex((r) => r.id_formulir_transaksi === id);
    if (idx === -1) throw new Error(`Transaksi id=${id} tidak ditemukan.`);
    const updated: DataTransaksiView = {
      ..._store[idx],
      tanggal_transaksi: input.tanggal_transaksi,
      terima_dari:       input.terima_dari,
      jumlah_uang:       input.jumlah_uang,
      untuk_pembayaran:  input.untuk_pembayaran,
      penerima_uang:     input.penerima_uang,
      kota:              input.kota,
      total_harga:       input.total_harga || input.jumlah_uang,
      id_admin:          adminId,
      admin_username:    ADMIN_NAMES[adminId] ?? String(adminId),
    };
    _store[idx] = updated;
    return updated;
  },

  async delete(id) {
    const idx = _store.findIndex((r) => r.id_formulir_transaksi === id);
    if (idx !== -1) {
      _store[idx].deleted_at = new Date().toISOString();
    }
  },

  async search(query) {
    const q = query.toLowerCase();
    return _store.filter((t) => {
      if (t.deleted_at) return false;
      return [t.admin_username, t.terima_dari, t.untuk_pembayaran].some((v) =>
        v.toLowerCase().includes(q)
      );
    });
  },
  async getDeleted() {
    return _store.filter((r) => r.deleted_at !== null);
  },
  async restore(id) {
    const idx = _store.findIndex((r) => r.id_formulir_transaksi === id);
    if (idx !== -1) {
      _store[idx].deleted_at = null;
    }
  },
  async hardDelete(id) {
    const idx = _store.findIndex((r) => r.id_formulir_transaksi === id);
    if (idx !== -1) _store.splice(idx, 1);
  }
};
