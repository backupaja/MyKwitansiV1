/**
 * PrintService — records print audit events and triggers the print dialog.
 *
 * SERVICE CONTRACT:
 *   recordKwitansiPrint(formulirTransaksiId, adminId) → void
 *   recordNotaPrint(formulirNotaId, adminId)          → void
 *   printKwitansi(row, adminId)                       → void  (convenience: record + window.print)
 *   printNota(row, adminId)                           → void  (convenience: record + window.print)
 *
 * DATABASE MAPPING (final schema):
 *   print_kwitansi: id_print_kwitansi, id_formulir_transaksi, id_admin, print_timestamp
 *   print_nota:     id_print_nota,     id_formulir_nota,      id_admin, print_timestamp
 *
 * REMOVED: data_transaksi, data_nota — audit logs now link formulir tables directly.
 *
 * PRINT AUDIT RULE:
 *   Every print action creates a NEW row (append-only).
 *   Do NOT use print_count. Do NOT update existing rows.
 *
 * MOCK PHASE:
 *   In-memory arrays simulate the audit log stores.
 *   Replace this implementation with:
 *     - Supabase INSERT for web
 *     - Tauri invoke("record_print") for desktop
 */
import type { DataTransaksiView, DataNotaView, PrintKwitansi, PrintNota } from "../types";
import { pdfService } from "./pdfService";

// ─────────────────────────────────────────────────────────────────────────────
// Service Contract
// ─────────────────────────────────────────────────────────────────────────────

export interface PrintService {
  /**
   * Record a kwitansi print event in the audit log, then trigger the
   * platform print dialog (window.print on web; Tauri command on desktop).
   */
  printKwitansi(row: DataTransaksiView, adminId: number): Promise<void>;

  /**
   * Record multiple kwitansi print events in the audit log, then trigger the
   * platform print dialog for a multi-page PDF.
   */
  printMultipleKwitansi(rows: DataTransaksiView[], adminId: number): Promise<void>;

  /**
   * Record a nota print event in the audit log, then trigger the
   * platform print dialog.
   * Accepts an array for compatibility with existing call site: printNota([row], adminId).
   */
  printNota(rows: DataNotaView[], adminId: number): Promise<void>;

  /**
   * Record multiple nota print events in the audit log, then trigger the
   * platform print dialog for a multi-page PDF.
   */
  printMultipleNota(rows: DataNotaView[], adminId: number): Promise<void>;

  /**
   * Return all kwitansi print history for a given transaction.
   * Optional — not currently used by UI but provided for future admin views.
   */
  getKwitansiPrintHistory(formulirTransaksiId: number): Promise<PrintKwitansi[]>;

  /**
   * Return all nota print history for a given nota.
   * Optional — not currently used by UI but provided for future admin views.
   */
  getNotaPrintHistory(formulirNotaId: number): Promise<PrintNota[]>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Implementation (in-memory audit log)
// ─────────────────────────────────────────────────────────────────────────────

const _printKwitansiStore: PrintKwitansi[] = [];
const _printNotaStore: PrintNota[] = [];

function nextKwitansiId(): number {
  return _printKwitansiStore.length + 1;
}

function nextNotaId(): number {
  return _printNotaStore.length + 1;
}

function nowIso(): string {
  return new Date().toISOString();
}

export const printService: PrintService = {
  async printKwitansi(row, adminId) {
    // Audit log: append a new row every time — never update existing rows.
    const auditRecord: PrintKwitansi = {
      id_print_kwitansi:     nextKwitansiId(),
      id_formulir_transaksi: row.id_formulir_transaksi,  // final schema FK
      id_admin:              adminId,
      print_timestamp:       nowIso(),
    };
    _printKwitansiStore.push(auditRecord);
    console.info("[PrintService] print_kwitansi record created:", auditRecord);
    
    // Instead of window.print(), we print the PDF blob
    await pdfService.printKwitansiPdf(row);
  },

  async printMultipleKwitansi(rows, adminId) {
    if (rows.length === 0) return;
    
    // Audit log for each row
    for (const row of rows) {
      const auditRecord: PrintKwitansi = {
        id_print_kwitansi:     nextKwitansiId(),
        id_formulir_transaksi: row.id_formulir_transaksi,
        id_admin:              adminId,
        print_timestamp:       nowIso(),
      };
      _printKwitansiStore.push(auditRecord);
      console.info("[PrintService] print_kwitansi record created:", auditRecord);
    }
    
    await pdfService.printMultipleKwitansiPdf(rows);
  },

  async printNota(rows, adminId) {
    if (rows.length === 0) return;
    const row = rows[0]; // all items belong to the same nota document
    // Audit log: append a new row every time — never update existing rows.
    const auditRecord: PrintNota = {
      id_print_nota:    nextNotaId(),
      id_formulir_nota: row.id_formulir_nota,   // final schema FK
      id_admin:         adminId,
      print_timestamp:  nowIso(),
    };
    _printNotaStore.push(auditRecord);
    console.info("[PrintService] print_nota record created:", auditRecord);
    
    // Instead of window.print(), we print the PDF blob
    await pdfService.printNotaPdf(row);
  },

  async printMultipleNota(rows, adminId) {
    if (rows.length === 0) return;
    
    // Audit log for each row
    for (const row of rows) {
      const auditRecord: PrintNota = {
        id_print_nota:    nextNotaId(),
        id_formulir_nota: row.id_formulir_nota,
        id_admin:         adminId,
        print_timestamp:  nowIso(),
      };
      _printNotaStore.push(auditRecord);
      console.info("[PrintService] print_nota record created:", auditRecord);
    }
    
    await pdfService.printMultipleNotaPdf(rows);
  },

  async getKwitansiPrintHistory(formulirTransaksiId) {
    return _printKwitansiStore.filter(
      (r) => r.id_formulir_transaksi === formulirTransaksiId
    );
  },

  async getNotaPrintHistory(formulirNotaId) {
    return _printNotaStore.filter(
      (r) => r.id_formulir_nota === formulirNotaId
    );
  },
};
