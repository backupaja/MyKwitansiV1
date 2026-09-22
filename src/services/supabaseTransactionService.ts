import type { DataTransaksiView, CreateFormulirTransaksiInput } from "../types";
import type { TransactionService } from "./transactionService";
import { supabase } from "../lib/supabase";

export const supabaseTransactionService: TransactionService = {
  async getAll() {
    const { data, error } = await supabase
      .from("formulir_transaksi")
      .select(`
        *,
        admin:id_admin (username)
      `)
      .is("deleted_at", null)
      .order("id_formulir_transaksi", { ascending: false });

    if (error) {
      console.error("[Supabase TransactionService] getAll error:", error);
      throw new Error("Gagal mengambil data transaksi.");
    }

    return (data || []).map((row: any) => ({
      ...row,
      id_data_transaksi: row.id_formulir_transaksi, // UI Alias
      admin_username: row.admin?.username || "Unknown",
    }));
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from("formulir_transaksi")
      .select(`
        *,
        admin:id_admin (username)
      `)
      .eq("id_formulir_transaksi", id)
      .is("deleted_at", null)
      .single();

    if (error || !data) {
      console.error(`[Supabase TransactionService] getById error for id=${id}:`, error);
      return undefined;
    }

    return {
      ...data,
      id_data_transaksi: data.id_formulir_transaksi, // UI Alias
      admin_username: data.admin?.username || "Unknown",
    };
  },

  async create(input: CreateFormulirTransaksiInput, adminId: number) {
    // Generate ISO 8601 date for tanggal_input
    const tanggal_input = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const total_harga = input.total_harga || input.jumlah_uang;

    const { data, error } = await supabase
      .from("formulir_transaksi")
      .insert({
        terima_dari: input.terima_dari,
        jumlah_uang: input.jumlah_uang,
        untuk_pembayaran: input.untuk_pembayaran,
        penerima_uang: input.penerima_uang,
        kota: input.kota,
        tanggal_transaksi: input.tanggal_transaksi,
        tanggal_input: tanggal_input,
        total_harga: total_harga,
        id_admin: adminId,
      })
      .select(`
        *,
        admin:id_admin (username)
      `)
      .single();

    if (error || !data) {
      console.error("[Supabase TransactionService] create error:", error);
      throw new Error("Gagal membuat transaksi baru.");
    }

    return {
      ...data,
      id_data_transaksi: data.id_formulir_transaksi, // UI Alias
      admin_username: data.admin?.username || "Unknown",
    };
  },

  async update(id: number, input: CreateFormulirTransaksiInput, adminId: number) {
    const total_harga = input.total_harga || input.jumlah_uang;

    const { data, error } = await supabase
      .from("formulir_transaksi")
      .update({
        terima_dari: input.terima_dari,
        jumlah_uang: input.jumlah_uang,
        untuk_pembayaran: input.untuk_pembayaran,
        penerima_uang: input.penerima_uang,
        kota: input.kota,
        tanggal_transaksi: input.tanggal_transaksi,
        total_harga: total_harga,
        id_admin: adminId,
      })
      .eq("id_formulir_transaksi", id)
      .select(`
        *,
        admin:id_admin (username)
      `)
      .single();

    if (error || !data) {
      console.error(`[Supabase TransactionService] update error for id=${id}:`, error);
      throw new Error("Gagal mengupdate transaksi.");
    }

    return {
      ...data,
      id_data_transaksi: data.id_formulir_transaksi, // UI Alias
      admin_username: data.admin?.username || "Unknown",
    };
  },

  async delete(id: number) {
    const { error } = await supabase
      .from("formulir_transaksi")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id_formulir_transaksi", id);

    if (error) {
      console.error(`[Supabase TransactionService] delete error for id=${id}:`, error);
      throw new Error("Gagal menghapus transaksi.");
    }
  },

  async search(query: string) {
    // Basic ilike search on multiple fields.
    // Supabase supports `or` syntax.
    const { data, error } = await supabase
      .from("formulir_transaksi")
      .select(`
        *,
        admin:id_admin (username)
      `)
      .or(`terima_dari.ilike.%${query}%,untuk_pembayaran.ilike.%${query}%`)
      .order("id_formulir_transaksi", { ascending: false });

    // Note: searching by admin.username isn't directly supported in a single top-level `or` string in JS client 
    // without using inner joins explicitly formatted. 
    // For this implementation, we will fetch and manually filter if needed, 
    // or rely on PostgREST foreign table filtering syntax if needed.
    // Given the UI, we'll return what matches the main table fields. 

    if (error) {
      console.error("[Supabase TransactionService] search error:", error);
      throw new Error("Gagal mencari transaksi.");
    }

    return (data || []).map((row) => ({
      ...row,
      id_data_transaksi: row.id_formulir_transaksi,
      admin_username: row.admin?.username || "Unknown",
    }));
  },

  async getDeleted() {
    const { data, error } = await supabase
      .from("formulir_transaksi")
      .select(`
        *,
        admin:id_admin (username)
      `)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });

    if (error) {
      console.error("[Supabase TransactionService] getDeleted error:", error);
      throw new Error("Gagal mengambil riwayat transaksi terhapus.");
    }

    return (data || []).map((row) => ({
      ...row,
      id_data_transaksi: row.id_formulir_transaksi,
      admin_username: row.admin?.username || "Unknown",
    }));
  },

  async restore(id: number) {
    const { error } = await supabase
      .from("formulir_transaksi")
      .update({ deleted_at: null })
      .eq("id_formulir_transaksi", id);

    if (error) {
      console.error(`[Supabase TransactionService] restore error for id=${id}:`, error);
      throw new Error("Gagal mengembalikan transaksi.");
    }
  },

  async hardDelete(id: number) {
    const { error } = await supabase
      .from("formulir_transaksi")
      .delete()
      .eq("id_formulir_transaksi", id);

    if (error) {
      console.error(`[Supabase TransactionService] hardDelete error for id=${id}:`, error);
      if (error.code === '23503') {
         throw new Error("Gagal menghapus permanen karena terdapat histori cetak. Hapus histori cetak (jika ada fitur) atau biarkan di Trash.");
      }
      throw new Error("Gagal menghapus permanen transaksi.");
    }
  }
};
