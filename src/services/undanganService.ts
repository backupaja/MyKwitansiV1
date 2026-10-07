import type { DataUndanganView, CreateFormulirUndanganInput } from "../types";
import { MOCK_UNDANGAN } from "./mockData";

const ADMIN_NAMES: Record<number, string> = { 1: "Bang Karir", 2: "Bang Tensi" };

export interface UndanganService {
  getAll(): Promise<DataUndanganView[]>;
  getById(id: string): Promise<DataUndanganView | undefined>;
  create(input: CreateFormulirUndanganInput, adminId: number): Promise<DataUndanganView>;
  update(id: string, input: CreateFormulirUndanganInput, adminId: number): Promise<DataUndanganView>;
  delete(id: string): Promise<void>;
  search(query: string): Promise<DataUndanganView[]>;
  getDeleted(): Promise<DataUndanganView[]>;
  restore(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
}

const _store: DataUndanganView[] = [...MOCK_UNDANGAN];

function nextId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
}

export const undanganService: UndanganService = {
  async getAll() {
    return _store.filter((r) => !r.deleted_at);
  },

  async getById(id) {
    return _store.find((r) => r.id_formulir_undangan === id && !r.deleted_at);
  },

  async create(input, adminId) {
    const id = nextId();
    const newRow: DataUndanganView = {
      id_formulir_undangan: id,
      id_data_undangan:     id,
      id_admin:              adminId,
      acara:                 input.acara,
      penyelenggara:         input.penyelenggara,
      tanggal_acara:         input.tanggal_acara,
      waktu_mulai:           input.waktu_mulai,
      waktu_selesai:         input.waktu_selesai,
      tempat_acara:          input.tempat_acara,
      agenda:                input.agenda,
      peserta:               input.peserta,
      dokumen_pendukung:     input.dokumen_pendukung,
      hasil_pertemuan:       input.hasil_pertemuan,
      tembusan:              input.tembusan,
      tempat_surat:          input.tempat_surat,
      tanggal_surat:         input.tanggal_surat,
      nama_ttd:              input.nama_ttd,
      jabatan_ttd:           input.jabatan_ttd,
      tanggal_input:         new Date().toISOString(),
      admin_username:        ADMIN_NAMES[adminId] ?? String(adminId),
      deleted_at:            null,
    };
    _store.unshift(newRow);
    return newRow;
  },

  async update(id, input, adminId) {
    const idx = _store.findIndex((r) => r.id_formulir_undangan === id);
    if (idx === -1) throw new Error(`Undangan id=${id} tidak ditemukan.`);
    const updated: DataUndanganView = {
      ..._store[idx],
      ...input,
      id_admin: adminId,
      admin_username: ADMIN_NAMES[adminId] ?? String(adminId),
    };
    _store[idx] = updated;
    return updated;
  },

  async delete(id) {
    const idx = _store.findIndex((r) => r.id_formulir_undangan === id);
    if (idx !== -1) {
      _store[idx].deleted_at = new Date().toISOString();
    }
  },

  async search(query) {
    const q = query.toLowerCase();
    return _store.filter((t) => {
      if (t.deleted_at) return false;
      return [t.admin_username, t.acara, t.tempat_acara].some((v) =>
        v.toLowerCase().includes(q)
      );
    });
  },

  async getDeleted() {
    return _store.filter((r) => r.deleted_at !== null);
  },

  async restore(id) {
    const idx = _store.findIndex((r) => r.id_formulir_undangan === id);
    if (idx !== -1) {
      _store[idx].deleted_at = null;
    }
  },

  async hardDelete(id) {
    const idx = _store.findIndex((r) => r.id_formulir_undangan === id);
    if (idx !== -1) _store.splice(idx, 1);
  }
};
