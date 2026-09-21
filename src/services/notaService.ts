/**
 * NotaService — CRUD for formulir_nota / data_nota.
 *
 * Stub implementation; replace with Supabase (web) or Tauri+SQLite (desktop).
 * All IDs are int(11) per ERD → number.
 */
import type { DataNotaView, CreateFormulirNotaInput } from "../types";
import { MOCK_NOTA } from "./mockData";

const ADMIN_NAMES: Record<number, string> = { 1: "Bang Karir", 2: "Bang Tensi" };

export interface NotaService {
  getAll(): Promise<DataNotaView[]>;
  create(input: CreateFormulirNotaInput, adminId: number): Promise<DataNotaView>;
  search(query: string): Promise<DataNotaView[]>;
}

const _store: DataNotaView[] = [...MOCK_NOTA];

export const notaService: NotaService = {
  async getAll() {
    return [..._store];
  },
  async create(input, adminId) {
    const id  = _store.length + 1;
    const sub = input.harga * input.jumlah_item;
    const newRow: DataNotaView = {
      id_data_nota:      id,
      id_formulir_nota:  id,
      id_admin:          adminId,
      tanggal_transaksi: input.tanggal_transaksi,
      nama_barang:       input.nama_barang,
      satuan:            input.satuan,
      harga:             input.harga,
      jumlah_item:       input.jumlah_item,
      sub_total_harga:   sub,
      total_harga:       sub,
      admin_username:    ADMIN_NAMES[adminId] ?? String(adminId),
    };
    _store.unshift(newRow);
    return newRow;
  },
  async search(query) {
    const q = query.toLowerCase();
    return _store.filter((n) =>
      [n.admin_username, n.nama_barang].some((v) => v.toLowerCase().includes(q))
    );
  },
};
