/**
 * PrintService — records print_kwitansi and print_nota events,
 * then triggers the platform print dialog.
 *
 * Stub: logs the print event and delegates to window.print().
 * Desktop: replace window.print() with a Tauri print command.
 */
import type { DataTransaksiView, DataNotaView } from "../types";

export interface PrintService {
  printKwitansi(row: DataTransaksiView, adminId: string): Promise<void>;
  printNota(rows: DataNotaView[], adminId: string): Promise<void>;
}

export const printService: PrintService = {
  async printKwitansi(row, adminId) {
    // TODO: persist print_kwitansi record via service before printing.
    console.info("[PrintService] printKwitansi", { id_data_transaksi: row.id_data_transaksi, adminId });
    window.print();
  },
  async printNota(rows, adminId) {
    // TODO: persist print_nota records via service before printing.
    console.info("[PrintService] printNota", { count: rows.length, adminId });
    window.print();
  },
};
