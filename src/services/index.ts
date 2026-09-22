// Import Mock Implementations
import { adminService as mockAdminService } from "./adminService";
import { transactionService as mockTransactionService } from "./transactionService";
import { notaService as mockNotaService } from "./notaService";
import { printService as mockPrintService } from "./printService";

// Import Supabase Implementations
import { supabaseAdminService } from "./supabaseAdminService";
import { supabaseTransactionService } from "./supabaseTransactionService";
import { supabaseNotaService } from "./supabaseNotaService";
import { supabasePrintService } from "./supabasePrintService";

// Config Flag
// Set VITE_USE_MOCK=true in .env.local to force the mock implementation
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const adminService = USE_MOCK ? mockAdminService : supabaseAdminService;
export const transactionService = USE_MOCK ? mockTransactionService : supabaseTransactionService;
export const notaService = USE_MOCK ? mockNotaService : supabaseNotaService;
export const printService = USE_MOCK ? mockPrintService : supabasePrintService;

// PDF Service remains the same (it doesn't have a DB backend, it just generates files)
export { pdfService } from "./pdfService";
