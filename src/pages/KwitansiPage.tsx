/**
 * KwitansiPage — protected route (/kwitansi).
 *
 * adminId: read from AuthContext — removes the old adminId prop.
 * Visual design and business logic unchanged.
 */
import { useState, useEffect } from "react";
import { tokens } from "../styles/tokens";
import { formatRp, terbilang, CURRENT_YEAR, formatDocumentNumber, formatAdminName, formatCurrencyInput, formatDateInput } from "../utils/formatters";
import { Ico } from "../utils/icons";
import {
  PageHeader, Card, PrimaryBtn, OutlineBtn, Modal,
  CardToolbar, TableControls, DataTable, Td,
} from "../components/ui";
import { transactionService, printService, pdfService } from "../services";
import { useAuth } from "../contexts/AuthContext";
import type { DataTransaksiView } from "../types";

const { color } = tokens;

const HEADERS = [
  "No. Transaksi",
  "Tgl Transaksi",
  "Tgl Input",
  "Admin",
  "Terima Dari",
  "Jumlah Uang",
  "Untuk Pembayaran",
];

export function KwitansiPage() {
  const { currentAdmin } = useAuth();
  const adminId          = currentAdmin?.id_admin ?? 0;

  const [rows,     setRows]     = useState<DataTransaksiView[]>([]);
  const [search,      setSearch]      = useState("");
  const [pageSize,    setPageSize]    = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<DataTransaksiView[]>([]);
  const [preview, setPreview] = useState<DataTransaksiView | null>(null);

  useEffect(() => {
    transactionService.getAll().then(setRows);
  }, []);

  function handleSearch(v: string) { setSearch(v); setCurrentPage(1); }
  function handlePageSize(v: number) { setPageSize(v); setCurrentPage(1); }

  const filtered = rows.filter((t) =>
    [t.admin_username, t.terima_dari].some((v) =>
      v.toLowerCase().includes(search.toLowerCase())
    )
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paged      = filtered.slice(startIndex, startIndex + pageSize);

  function toggleSelect(t: DataTransaksiView) {
    setSelected((prev) =>
      prev.some((s) => s.id_data_transaksi === t.id_data_transaksi)
        ? prev.filter((s) => s.id_data_transaksi !== t.id_data_transaksi)
        : [...prev, t]
    );
  }

  function toggleSelectAll() {
    if (selected.length === paged.length) {
      setSelected([]);
    } else {
      setSelected(paged);
    }
  }

  async function handlePrint() {
    if (selected.length === 0) return;
    await printService.printMultipleKwitansi(selected, adminId);
  }

  async function handleDownloadPdf() {
    if (!preview) return;
    await pdfService.downloadKwitansiPdf(preview);
  }

  async function handleDownloadMultiplePdf() {
    if (selected.length === 0) return;
    await pdfService.downloadMultipleKwitansiPdf(selected);
  }

  return (
    <div>
      <PageHeader title="Print Kwitansi" subtitle="Pilih transaksi untuk mencetak kwitansi" />

      <Card className="p-5">
        <CardToolbar
          left={
            <div className="flex gap-2 w-full overflow-x-auto pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {/* Desktop Print Button */}
              <div className="hidden md:block flex-shrink-0">
                <PrimaryBtn onClick={handlePrint} disabled={selected.length === 0} className="flex-shrink-0">
                  {Ico.print()} Print Kwitansi{selected.length > 0 ? ` (${selected.length})` : ""}
                </PrimaryBtn>
              </div>
              {/* Mobile Print Button Disabled */}
              <div className="block md:hidden flex-shrink-0">
                <PrimaryBtn disabled={true} className="opacity-50 cursor-not-allowed flex-shrink-0">
                  {Ico.print()} Print{selected.length > 0 ? ` (${selected.length})` : ""}
                </PrimaryBtn>
              </div>

              {/* Save PDF Button */}
              <PrimaryBtn 
                onClick={handleDownloadMultiplePdf} 
                disabled={selected.length === 0}
                className="!bg-blue-600 hover:!bg-blue-700 !border-blue-600 flex-shrink-0"
              >
                {Ico.download()} Save PDF{selected.length > 0 ? ` (${selected.length})` : ""}
              </PrimaryBtn>
            </div>
          }
          right={
            <TableControls
              search={search}
              onSearch={handleSearch}
              pageSize={pageSize}
              onPageSize={handlePageSize}
            />
          }
        />

        <DataTable
          headers={HEADERS}
          shownEntries={paged.length}
          totalEntries={filtered.length}
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showLeadingColumn
          leadingHeader={
            <input
              type="checkbox"
              title="Pilih semua"
              checked={paged.length > 0 && paged.every((t) => selected.some((s) => s.id_data_transaksi === t.id_data_transaksi))}
              onChange={toggleSelectAll}
            />
          }
        >
          {paged.map((t) => (
            <tr
              key={t.id_data_transaksi}
              className="tr-hover cursor-pointer"
              onClick={() => setPreview(t)}
            >
              <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selected.some((s) => s.id_data_transaksi === t.id_data_transaksi)}
                  onChange={() => toggleSelect(t)}
                />
              </td>
              <Td>{formatDocumentNumber(t.id_data_transaksi)}</Td>
              <Td>{t.tanggal_transaksi}</Td>
              <Td>{formatDateInput(t.tanggal_input)}</Td>
              <Td accent>{formatAdminName(t.admin_username)}</Td>
              <Td>{t.terima_dari}</Td>
              <Td mono>{formatCurrencyInput(String(t.jumlah_uang))}</Td>
              <Td>{t.untuk_pembayaran}</Td>
            </tr>
          ))}
        </DataTable>
      </Card>

      {preview && (
        <Modal title="Detail Kwitansi" onClose={() => setPreview(null)} wide>
          <div className="w-full overflow-hidden flex justify-center">
            <style>{`
              .kwitansi-zoom { width: 550px; max-width: none; }
              @media (max-width: 600px) { .kwitansi-zoom { zoom: 0.8; } }
              @media (max-width: 480px) { .kwitansi-zoom { zoom: 0.65; } }
              @media (max-width: 380px) { .kwitansi-zoom { zoom: 0.55; } }
            `}</style>
            <div className="kwitansi-zoom p-2 relative text-sm">
              <h2 className="text-center text-lg font-bold tracking-wide text-black mb-6">KWITANSI PEMBAYARAN</h2>
            
            <div className="space-y-4">
              {[
                { label: "No Kwitansi",      value: formatDocumentNumber(preview.id_data_transaksi) },
                { label: "Diterima Dari",    value: preview.terima_dari },
                { label: "Terbilang",        value: terbilang(preview.jumlah_uang) + " Rupiah" },
                { label: "Untuk Pembayaran", value: preview.untuk_pembayaran },
              ].map((row) => (
                <div key={row.label} className="flex gap-4 items-end">
                  <span className="text-sm font-bold text-black text-right flex-shrink-0 pb-1" style={{ width: 140 }}>
                    {row.label}
                  </span>
                  <span className="flex-1 text-sm font-bold text-black border-b border-black pb-1">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-end justify-between mt-8">
              <div className="flex items-center w-48 border-y border-black py-2">
                <span className="text-sm font-bold text-black mr-2">Rp</span>
                <span className="text-base font-bold text-black">
                  {formatRp(preview.jumlah_uang).replace("Rp ", "")}
                </span>
              </div>
              
              <div className="flex flex-col items-center w-48">
                <span className="text-xs font-bold text-black mb-1">
                  {preview.kota} , {preview.tanggal_transaksi}
                </span>
                <div className="w-full border-b border-black mb-6" />
              </div>
            </div>
            </div>
          </div>
            
          <div className="mt-8 flex justify-end gap-3 pt-4">
            <OutlineBtn onClick={() => setPreview(null)}>
              Tutup
            </OutlineBtn>
            
            <div className="hidden md:block">
              <OutlineBtn onClick={handleDownloadPdf}>
                {Ico.download()} Download PDF
              </OutlineBtn>
            </div>
            
            {/* Print Button: Active on Desktop, Disabled on Mobile */}
            <div className="hidden md:block">
              <PrimaryBtn
                onClick={async () => {
                  await printService.printKwitansi(preview, adminId);
                  setPreview(null);
                }}
              >
                {Ico.print()} Print
              </PrimaryBtn>
            </div>
            
            {/* Mobile Only: Save PDF */}
            <div className="block md:hidden">
              <PrimaryBtn
                className="!bg-blue-600 hover:!bg-blue-700 !border-blue-600"
                onClick={handleDownloadPdf}
              >
                {Ico.download()} Save PDF
              </PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
