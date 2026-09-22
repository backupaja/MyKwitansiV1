import type { DataNotaView, CreateFormulirNotaInput, ItemNota } from "../types";
import type { NotaService } from "./notaService";
import { supabase } from "../lib/supabase";

export const supabaseNotaService: NotaService = {
  async getAll() {
    const { data, error } = await supabase
      .from("formulir_nota")
      .select(`
        *,
        admin:id_admin (username),
        items:item_nota (*)
      `)
      .is("deleted_at", null)
      .order("id_formulir_nota", { ascending: false });

    if (error) {
      console.error("[Supabase NotaService] getAll error:", error);
      throw new Error("Gagal mengambil data nota.");
    }

    return (data || []).map((row: any) => ({
      ...row,
      id_data_nota: row.id_formulir_nota, // UI Alias
      admin_username: row.admin?.username || "Unknown",
    }));
  },

  async getDeleted() {
    const { data, error } = await supabase
      .from("formulir_nota")
      .select(`
        *,
        admin:id_admin (username),
        items:item_nota (*)
      `)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false });

    if (error) {
      console.error("[Supabase NotaService] getDeleted error:", error);
      throw new Error("Gagal mengambil riwayat nota terhapus.");
    }

    return (data || []).map((row: any) => ({
      ...row,
      id_data_nota: row.id_formulir_nota,
      admin_username: row.admin?.username || "Unknown",
    }));
  },

  async restore(id: number) {
    const { error } = await supabase
      .from("formulir_nota")
      .update({ deleted_at: null })
      .eq("id_formulir_nota", id);

    if (error) {
      console.error(`[Supabase NotaService] restore error for id=${id}:`, error);
      throw new Error("Gagal mengembalikan nota.");
    }
  },

  async hardDelete(id: number) {
    const { error } = await supabase
      .from("formulir_nota")
      .delete()
      .eq("id_formulir_nota", id);

    if (error) {
      console.error(`[Supabase NotaService] hardDelete error for id=${id}:`, error);
      if (error.code === '23503') {
         throw new Error("Gagal menghapus permanen karena terdapat histori cetak.");
      }
      throw new Error("Gagal menghapus permanen nota.");
    }
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from("formulir_nota")
      .select(`
        *,
        admin:id_admin (username),
        items:item_nota (*)
      `)
      .eq("id_formulir_nota", id)
      .is("deleted_at", null)
      .single();

    if (error || !data) {
      console.error(`[Supabase NotaService] getById error for id=${id}:`, error);
      return undefined;
    }

    return {
      ...data,
      id_data_nota: data.id_formulir_nota, // UI Alias
      admin_username: data.admin?.username || "Unknown",
    };
  },

  async create(input: CreateFormulirNotaInput, adminId: number) {
    const { data, error } = await supabase.rpc('create_nota', {
      p_tanggal_transaksi: input.tanggal_transaksi,
      p_items: input.items
    });

    if (error || !data) {
      console.error("[Supabase NotaService] create RPC error:", error);
      throw new Error("Gagal membuat nota baru.");
    }
    
    // We get back the header row from RPC. We need to fetch it properly with joins.
    const headerId = (data as any)[0]?.id_formulir_nota || (data as any)?.id_formulir_nota;
    return await this.getById(headerId) as DataNotaView;
  },

  async update(id: number, input: CreateFormulirNotaInput, adminId: number) {
    const { data, error } = await supabase.rpc('update_nota', {
      p_id_formulir_nota: id,
      p_tanggal_transaksi: input.tanggal_transaksi,
      p_items: input.items
    });

    if (error || !data) {
      console.error(`[Supabase NotaService] update RPC error for id=${id}:`, error);
      throw new Error("Gagal mengupdate nota.");
    }

    const headerId = (data as any)[0]?.id_formulir_nota || (data as any)?.id_formulir_nota;
    return await this.getById(headerId) as DataNotaView;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from("formulir_nota")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id_formulir_nota", id);

    if (error) {
      console.error(`[Supabase NotaService] delete error for id=${id}:`, error);
      throw new Error("Gagal menghapus nota.");
    }
  },

  async search(query: string) {
    // Note: To match mock behavior where we search admin_username and items, 
    // we fetch everything and filter locally for simplicity, 
    // since PostgREST nested querying with OR on child tables can be complex to type.
    const all = await this.getAll();
    const q = query.toLowerCase();
    
    return all.filter((n) => {
      const matchHeader = [n.admin_username, String(n.id_formulir_nota)].some((v) =>
        v.toLowerCase().includes(q)
      );
      if (matchHeader) return true;
      const matchItem = n.items.some((it) => it.nama_barang.toLowerCase().includes(q));
      return matchItem;
    });
  },
};
