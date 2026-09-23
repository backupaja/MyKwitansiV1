/**
 * PDF Service — handles generation and downloading of PDF documents.
 * Keeps React-PDF generation logic out of the UI components.
 * 
 * Uses dynamic imports (lazy loading) to ensure the 1MB+ PDF engine
 * is not included in the main application bundle until requested.
 */
import React from "react";
import type { DataTransaksiView, DataNotaView } from "../types";

export interface PdfService {
  downloadKwitansiPdf(data: DataTransaksiView): Promise<void>;
  downloadNotaPdf(data: DataNotaView): Promise<void>;
  printKwitansiPdf(data: DataTransaksiView): Promise<void>;
  printMultipleKwitansiPdf(items: DataTransaksiView[]): Promise<void>;
  printNotaPdf(data: DataNotaView): Promise<void>;
  printMultipleNotaPdf(items: DataNotaView[]): Promise<void>;
}

/** Sanitize string for use in Windows/Linux filenames */
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_\.]/g, "_");
}

/** Helper to trigger browser download of a Blob */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup - on mobile browsers (Android/iOS), revoking too quickly cancels the download silently.
  setTimeout(() => {
    if (document.body.contains(a)) {
      document.body.removeChild(a);
    }
    URL.revokeObjectURL(url);
  }, 5000);
}

/** Helper to trigger browser print of a Blob via hidden iframe */
function triggerPrint(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url;
  
  iframe.onload = () => {
    setTimeout(() => {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }
    }, 200);
  };
  
  document.body.appendChild(iframe);
}

export const pdfService: PdfService = {
  async downloadKwitansiPdf(data: DataTransaksiView) {
    try {
      // Lazy load the PDF engine and document component
      const { pdf } = await import("@react-pdf/renderer");
      const { KwitansiDocument } = await import("../documents/KwitansiDocument");

      // Generate Blob from the KwitansiDocument component
      // @ts-ignore
      const blob = await pdf(<KwitansiDocument data={data} />).toBlob();
      
      // Kwitansi_[id_data_transaksi]_[terima_dari].pdf
      const cleanId = String(data.id_data_transaksi).padStart(4, "0");
      const cleanName = sanitizeFilename(data.terima_dari);
      const filename = `Kwitansi_${cleanId}_${cleanName}.pdf`;
      
      triggerDownload(blob, filename);
    } catch (error) {
      console.error("[PdfService] Error generating Kwitansi PDF:", error);
      throw new Error("Gagal membuat PDF Kwitansi.");
    }
  },

  async downloadNotaPdf(data: DataNotaView) {
    try {
      // Lazy load the PDF engine and document component
      const { pdf } = await import("@react-pdf/renderer");
      const { NotaDocument } = await import("../documents/NotaDocument");

      // Generate Blob from the NotaDocument component
      // @ts-ignore
      const blob = await pdf(<NotaDocument data={data} />).toBlob();
      
      // Nota_[id_data_nota]_[admin_username].pdf
      const cleanId = String(data.id_data_nota).padStart(4, "0");
      const cleanName = sanitizeFilename(data.admin_username);
      const filename = `Nota_${cleanId}_${cleanName}.pdf`;
      
      triggerDownload(blob, filename);
    } catch (error) {
      console.error("[PdfService] Error generating Nota PDF:", error);
      throw new Error("Gagal membuat PDF Nota.");
    }
  },
  async printKwitansiPdf(data: DataTransaksiView) {
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { KwitansiDocument } = await import("../documents/KwitansiDocument");
      // @ts-ignore
      const blob = await pdf(<KwitansiDocument data={data} />).toBlob();
      triggerPrint(blob);
    } catch (error) {
      console.error("[PdfService] Error printing Kwitansi PDF:", error);
      throw new Error("Gagal print PDF Kwitansi.");
    }
  },

  async printMultipleKwitansiPdf(items: DataTransaksiView[]) {
    if (items.length === 0) return;
    if (items.length === 1) {
      return this.printKwitansiPdf(items[0]);
    }
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { MultiKwitansiDocument } = await import("../documents/KwitansiDocument");
      // @ts-ignore
      const blob = await pdf(<MultiKwitansiDocument items={items} />).toBlob();
      triggerPrint(blob);
    } catch (error) {
      console.error("[PdfService] Error printing multiple Kwitansi PDFs:", error);
      throw new Error("Gagal print PDF Kwitansi.");
    }
  },

  async printNotaPdf(data: DataNotaView) {
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { NotaDocument } = await import("../documents/NotaDocument");
      // @ts-ignore
      const blob = await pdf(<NotaDocument data={data} />).toBlob();
      triggerPrint(blob);
    } catch (error) {
      console.error("[PdfService] Error printing Nota PDF:", error);
      throw new Error("Gagal print PDF Nota.");
    }
  },

  async printMultipleNotaPdf(items: DataNotaView[]) {
    if (items.length === 0) return;
    if (items.length === 1) {
      return this.printNotaPdf(items[0]);
    }
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { MultiNotaDocument } = await import("../documents/NotaDocument");
      // @ts-ignore
      const blob = await pdf(<MultiNotaDocument items={items} />).toBlob();
      triggerPrint(blob);
    } catch (error) {
      console.error("[PdfService] Error printing multiple Nota PDFs:", error);
      throw new Error("Gagal print PDF Nota.");
    }
  },
};
