import type { DataTransaksiView, DataNotaView, PrintKwitansi, PrintNota } from "../types";
import type { PrintService } from "./printService";
import { supabase } from "../lib/supabase";
import { pdfService } from "./pdfService";

function nowIso(): string {
  return new Date().toISOString();
}

export const supabasePrintService: PrintService = {
  async printKwitansi(row: DataTransaksiView, adminId: number) {
    const { error } = await supabase
      .from("print_kwitansi")
      .insert({
        id_formulir_transaksi: row.id_formulir_transaksi,
        id_admin: adminId,
        print_timestamp: nowIso(),
      });

    if (error) {
      console.error("[Supabase PrintService] Error inserting print_kwitansi audit:", error);
      // We log but don't strictly block the UI print dialog, 
      // though typically you'd want to handle this.
    }
    
    await pdfService.printKwitansiPdf(row);
  },

  async printMultipleKwitansi(rows: DataTransaksiView[], adminId: number) {
    if (rows.length === 0) return;

    const inserts = rows.map((row) => ({
      id_formulir_transaksi: row.id_formulir_transaksi,
      id_admin: adminId,
      print_timestamp: nowIso(),
    }));

    const { error } = await supabase
      .from("print_kwitansi")
      .insert(inserts);

    if (error) {
      console.error("[Supabase PrintService] Error inserting bulk print_kwitansi audit:", error);
    }
    
    await pdfService.printMultipleKwitansiPdf(rows);
  },

  async printNota(rows: DataNotaView[], adminId: number) {
    if (rows.length === 0) return;
    const row = rows[0];

    const { error } = await supabase
      .from("print_nota")
      .insert({
        id_formulir_nota: row.id_formulir_nota,
        id_admin: adminId,
        print_timestamp: nowIso(),
      });

    if (error) {
      console.error("[Supabase PrintService] Error inserting print_nota audit:", error);
    }
    
    await pdfService.printNotaPdf(row);
  },

  async printMultipleNota(rows: DataNotaView[], adminId: number) {
    if (rows.length === 0) return;

    const inserts = rows.map((row) => ({
      id_formulir_nota: row.id_formulir_nota,
      id_admin: adminId,
      print_timestamp: nowIso(),
    }));

    const { error } = await supabase
      .from("print_nota")
      .insert(inserts);

    if (error) {
      console.error("[Supabase PrintService] Error inserting bulk print_nota audit:", error);
    }
    
    await pdfService.printMultipleNotaPdf(rows);
  },

  async getKwitansiPrintHistory(formulirTransaksiId: number) {
    const { data, error } = await supabase
      .from("print_kwitansi")
      .select("*")
      .eq("id_formulir_transaksi", formulirTransaksiId)
      .order("print_timestamp", { ascending: false });

    if (error) {
      console.error("[Supabase PrintService] getKwitansiPrintHistory error:", error);
      return [];
    }
    return data as PrintKwitansi[];
  },

  async getNotaPrintHistory(formulirNotaId: number) {
    const { data, error } = await supabase
      .from("print_nota")
      .select("*")
      .eq("id_formulir_nota", formulirNotaId)
      .order("print_timestamp", { ascending: false });

    if (error) {
      console.error("[Supabase PrintService] getNotaPrintHistory error:", error);
      return [];
    }
    return data as PrintNota[];
  },
};
