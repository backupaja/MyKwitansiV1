/**
 * TransactionService — CRUD for formulir_transaksi / data_transaksi.
 *
 * Stub implementation; replace with Supabase (web) or Tauri+SQLite (desktop).
 * All IDs are int(11) per ERD → number.
 */
import type { DataTransaksiView, CreateFormulirTransaksiInput } from "../types";
import { MOCK_TRANSAKSI } from "./mockData";

const ADMIN_NAMES: Record<number, string> = { 1: "Bang Karir", 2: "Bang Tensi" };

export interface TransactionService {
  /** Return all data_transaksi rows joined with formulir_transaksi and admin. */
  getAll(): Promise<DataTransaksiView[]>;
  /** Create a new formulir_transaksi and link it via data_transaksi. */
  create(input: CreateFormulirTransaksiInput, adminId: number): Promise<DataTransaksiView>;
  /** Search by terima_dari, admin username, or untuk_pembayaran. */
  search(query: string): Promise<DataTransaksiView[]>;
}

const _store: DataTransaksiView[] = [...MOCK_TRANSAKSI];

export const transactionService: TransactionService = {
  async getAll() {
    return [..._store];
  },
  async create(input, adminId) {
    const id = _store.length + 1;
    const newRow: DataTransaksiView = {
      id_data_transaksi:     id,
      id_formulir_transaksi: id,
      id_admin:              adminId,
      tanggal_transaksi:     input.tanggal_transaksi,
      tanggal_input:         new Date().toLocaleDateString("id-ID"),
      terima_dari:           input.terima_dari,
      jumlah_uang:           input.jumlah_uang,
      untuk_pembayaran:      input.untuk_pembayaran,
      penerima_uang:         input.penerima_uang,
      kota:                  input.kota,
      total_harga:           input.total_harga,
      admin_username:        ADMIN_NAMES[adminId] ?? String(adminId),
    };
    _store.unshift(newRow);
    return newRow;
  },
  async search(query) {
    const q = query.toLowerCase();
    return _store.filter((t) =>
      [t.admin_username, t.terima_dari, t.untuk_pembayaran].some((v) =>
        v.toLowerCase().includes(q)
      )
    );
  },
};
