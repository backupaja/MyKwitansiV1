/**
 * NotaService — CRUD for formulir_nota / item_nota.
 *
 * SERVICE CONTRACT:
 *   getAll()                       → DataNotaView[]
 *   getById(id)                    → DataNotaView | undefined
 *   create(input, adminId)         → DataNotaView
 *   update(id, input, adminId)     → DataNotaView
 *   delete(id)                     → void
 *   search(query)                  → DataNotaView[]
 *
 * DATABASE MAPPING (final schema):
 *   formulir_nota: id_formulir_nota, tanggal_transaksi, total_harga, id_admin
 *   item_nota:     id_item_nota, id_formulir_nota, nama_barang, satuan,
 *                  jumlah_item, harga, sub_total_harga
 *   data_nota: REMOVED — admin FK is on formulir_nota directly.
 *
 * VIEW ALIAS:
 *   DataNotaView.id_data_nota = id_formulir_nota
 *   Both are set to the same value by the service layer.
 *   This preserves UI compatibility with zero page changes.
 *
 * NOTA TRANSACTION BOUNDARY (required for real DB implementations):
 *   create / update must execute atomically:
 *     BEGIN
 *       INSERT formulir_nota
 *       INSERT item_nota × N  (sub_total_harga = harga × jumlah_item per row)
 *       UPDATE formulir_nota SET total_harga = SUM(sub_total_harga)
 *     COMMIT
 *
 *   delete must also execute atomically:
 *     BEGIN
 *       DELETE item_nota WHERE id_formulir_nota = id  (or rely on CASCADE)
 *       DELETE formulir_nota WHERE id_formulir_nota = id
 *     COMMIT
 *     (RESTRICT on print_nota prevents delete if print history exists)
 *
 * MOCK PHASE:
 *   In-memory store seeded from mockData.ts.
 *   Replace with:
 *     - Supabase client queries (web)
 *     - Tauri invoke("nota_*") commands (desktop)
 */
import type { DataNotaView, CreateFormulirNotaInput, ItemNota } from "../types";
import { MOCK_NOTA } from "./mockData";

const ADMIN_NAMES: Record<number, string> = { 1: "Bang Karir", 2: "Bang Tensi" };

export interface NotaService {
  getAll(): Promise<DataNotaView[]>;
  getById(id: number): Promise<DataNotaView | undefined>;
  create(input: CreateFormulirNotaInput, adminId: number): Promise<DataNotaView>;
  update(id: number, input: CreateFormulirNotaInput, adminId: number): Promise<DataNotaView>;
  delete(id: number): Promise<void>;
  search(query: string): Promise<DataNotaView[]>;
  getDeleted(): Promise<DataNotaView[]>;
  restore(id: number): Promise<void>;
  hardDelete(id: number): Promise<void>;
}

const _store: DataNotaView[] = [...MOCK_NOTA];

function nextHeaderId(): number {
  if (_store.length === 0) return 1;
  return Math.max(..._store.map((r) => r.id_formulir_nota)) + 1;
}

function nextItemId(): number {
  let max = 0;
  for (const row of _store) {
    for (const item of row.items) {
      if (item.id_item_nota > max) max = item.id_item_nota;
    }
  }
  return max + 1;
}

export const notaService: NotaService = {
  async getAll() {
    return _store.filter(r => !r.deleted_at);
  },

  async getById(id: number) {
    return _store.find((r) => r.id_formulir_nota === id && !r.deleted_at);
  },

  async create(input, adminId) {
    const headerId = nextHeaderId();
    let itemIdSeq = nextItemId();

    let totalHarga = 0;
    const items: ItemNota[] = input.items.map((it) => {
      const sub = it.harga * it.jumlah_item;
      totalHarga += sub;
      return {
        id_item_nota: itemIdSeq++,
        id_formulir_nota: headerId,
        nama_barang: it.nama_barang,
        satuan: it.satuan,
        harga: it.harga,
        jumlah_item: it.jumlah_item,
        sub_total_harga: sub,
      };
    });

    const newRow: DataNotaView = {
      id_formulir_nota:  headerId,
      id_data_nota:      headerId,   // UI alias — always equal to id_formulir_nota
      id_admin:          adminId,
      tanggal_transaksi: input.tanggal_transaksi,
      tanggal_input:     new Date().toISOString(),
      total_harga:       totalHarga,
      deleted_at:        null,
      admin_username:    ADMIN_NAMES[adminId] ?? String(adminId),
      items,
    };
    
    _store.unshift(newRow);
    return newRow;
  },

  async update(id, input, adminId) {
    const idx = _store.findIndex((n) => n.id_formulir_nota === id);  // use canonical PK
    if (idx === -1) throw new Error(`Nota id=${id} tidak ditemukan.`);
    
    let itemIdSeq = nextItemId();
    let totalHarga = 0;
    
    const items: ItemNota[] = input.items.map((it) => {
      const sub = it.harga * it.jumlah_item;
      totalHarga += sub;
      return {
        id_item_nota: itemIdSeq++, // generating new IDs for all items on update for simplicity in mock
        id_formulir_nota: id,
        nama_barang: it.nama_barang,
        satuan: it.satuan,
        harga: it.harga,
        jumlah_item: it.jumlah_item,
        sub_total_harga: sub,
      };
    });

    const updatedRow: DataNotaView = {
      ..._store[idx],
      tanggal_transaksi: input.tanggal_transaksi,
      total_harga: totalHarga,
      id_admin: adminId,
      admin_username: ADMIN_NAMES[adminId] ?? String(adminId),
      items,
    };

    _store[idx] = updatedRow;
    return updatedRow;
  },

  async delete(id) {
    const idx = _store.findIndex((r) => r.id_formulir_nota === id);
    if (idx !== -1) {
      _store[idx].deleted_at = new Date().toISOString();
    }
  },

  async search(query) {
    const q = query.toLowerCase();
    return _store.filter((n) => {
      if (n.deleted_at) return false;
      const matchHeader = [n.admin_username, String(n.id_formulir_nota)].some((v) =>
        v.toLowerCase().includes(q)
      );
      if (matchHeader) return true;
      const matchItem = n.items.some((it) => it.nama_barang.toLowerCase().includes(q));
      return matchItem;
    });
  },

  async getDeleted() {
    return _store.filter(r => r.deleted_at !== null);
  },

  async restore(id) {
    const idx = _store.findIndex((r) => r.id_formulir_nota === id);
    if (idx !== -1) {
      _store[idx].deleted_at = null;
    }
  },

  async hardDelete(id) {
    const idx = _store.findIndex((r) => r.id_formulir_nota === id);
    if (idx !== -1) _store.splice(idx, 1);
  },
};
