import type { DataUndanganView, CreateFormulirUndanganInput } from "../types";
import type { UndanganService } from "./undanganService";
import { supabase } from "../lib/supabase";

export const supabaseUndanganService: UndanganService = {
  async getAll() {
    const { data, error } = await supabase
      .from("vw_undangan")
      .select("*")
      .is("deleted_at", null)
      .order("tanggal_input", { ascending: false });

    if (error) {
      console.error("[Supabase UndanganService] getAll error:", error);
      throw new Error("Gagal mengambil data undangan.");
    }

    return data as DataUndanganView[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("vw_undangan")
      .select("*")
      .eq("id_formulir_undangan", id)
      .is("deleted_at", null)
      .single();

    if (error || !data) {
      console.error(`[Supabase UndanganService] getById error for id=${id}:`, error);
      return undefined;
    }

    return data as DataUndanganView;
  },

  async create(input: CreateFormulirUndanganInput, adminId: number) {
    const payload = {
      id_admin: adminId,
      acara: input.acara,
      penyelenggara: input.penyelenggara,
      tanggal_acara: input.tanggal_acara || null,
      waktu_mulai: input.waktu_mulai || null,
      waktu_selesai: input.waktu_selesai || null,
      tempat_acara: input.tempat_acara,
      agenda: input.agenda || null,
      peserta: input.peserta || null,
      dokumen_pendukung: input.dokumen_pendukung || null,
      hasil_pertemuan: input.hasil_pertemuan || null,
      tembusan: input.tembusan || null,
      tempat_surat: input.tempat_surat || null,
      tanggal_surat: input.tanggal_surat || null,
      nama_ttd: input.nama_ttd || null,
      jabatan_ttd: input.jabatan_ttd || null,
    };

    const { data, error } = await supabase
      .from("formulir_undangan")
      .insert(payload)
      .select(`
        *,
        admin:id_admin (username)
      `)
      .single();

    if (error) {
      console.error("[Supabase UndanganService] create error:", error);
      throw new Error("Gagal menambahkan undangan: " + error.message);
    }

    return {
      ...data,
      id_data_undangan: data.id_formulir_undangan,
      admin_username: data.admin?.username || "Unknown",
    };
  },

  async update(id: string, input: CreateFormulirUndanganInput, adminId: number) {
    const payload = {
      id_admin: adminId,
      acara: input.acara,
      penyelenggara: input.penyelenggara,
      tanggal_acara: input.tanggal_acara || null,
      waktu_mulai: input.waktu_mulai || null,
      waktu_selesai: input.waktu_selesai || null,
      tempat_acara: input.tempat_acara,
      agenda: input.agenda || null,
      peserta: input.peserta || null,
      dokumen_pendukung: input.dokumen_pendukung || null,
      hasil_pertemuan: input.hasil_pertemuan || null,
      tembusan: input.tembusan || null,
      tempat_surat: input.tempat_surat || null,
      tanggal_surat: input.tanggal_surat || null,
      nama_ttd: input.nama_ttd || null,
      jabatan_ttd: input.jabatan_ttd || null,
    };

    const { data, error } = await supabase
      .from("formulir_undangan")
      .update(payload)
      .eq("id_formulir_undangan", id)
      .select(`
        *,
        admin:id_admin (username)
      `)
      .single();

    if (error) {
      console.error(`[Supabase UndanganService] update error for id=${id}:`, error);
      throw new Error("Gagal mengupdate undangan.");
    }

    return {
      ...data,
      id_data_undangan: data.id_formulir_undangan,
      admin_username: data.admin?.username || "Unknown",
    };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("formulir_undangan")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id_formulir_undangan", id);

    if (error) {
      console.error(`[Supabase UndanganService] delete error for id=${id}:`, error);
      throw new Error("Gagal menghapus (soft delete) undangan.");
    }
  },

  async search(query: string) {
    const { data, error } = await supabase
      .from("vw_undangan")
      .select("*")
      .is("deleted_at", null)
      .or(`acara.ilike.%${query}%,tempat_acara.ilike.%${query}%,admin_username.ilike.%${query}%`)
      .order("id_formulir_undangan", { ascending: false });

    if (error) {
      console.error("[Supabase UndanganService] search error:", error);
      throw new Error("Gagal mencari data undangan.");
    }

    return data as DataUndanganView[];
  },

  async getDeleted() {
    const { data, error } = await supabase
      .from("vw_undangan")
      .select("*")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });

    if (error) {
      console.error("[Supabase UndanganService] getDeleted error:", error);
      throw new Error("Gagal mengambil data undangan yang terhapus.");
    }

    return data as DataUndanganView[];
  },

  async restore(id: string) {
    const { error } = await supabase
      .from("formulir_undangan")
      .update({ deleted_at: null })
      .eq("id_formulir_undangan", id);

    if (error) {
      console.error(`[Supabase UndanganService] restore error for id=${id}:`, error);
      throw new Error("Gagal me-restore undangan.");
    }
  },

  async hardDelete(id: string) {
    const { error } = await supabase
      .from("formulir_undangan")
      .delete()
      .eq("id_formulir_undangan", id);

    if (error) {
      console.error(`[Supabase UndanganService] hardDelete error for id=${id}:`, error);
      throw new Error("Gagal menghapus permanen undangan.");
    }
  },
};
