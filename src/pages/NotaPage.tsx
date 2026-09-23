/**
 * NotaPage — protected route (/nota).
 *
 * Full CRUD for the new One-to-Many model (Nota Header -> Multiple Items).
 * Main table lists Nota documents (headers).
 * Detail modal displays the nested item lines.
 * Create/Edit modal supports dynamic addition/removal of item rows.
 */
import { useState, useEffect } from "react";
import { tokens } from "../styles/tokens";

import { Ico } from "../utils/icons";
import { formatRp, formatAdminName, formatDocumentNumber, formatCurrencyInput, parseCurrencyInput, formatDateInput } from "../utils/formatters";
import {
  PageHeader, Card, PrimaryBtn, OutlineBtn, Modal, FormField,
  CardToolbar, TableControls, DataTable, Td,
} from "../components/ui";
import { notaService, printService, pdfService } from "../services";
import { useAuth } from "../contexts/AuthContext";
import type { DataNotaView, CreateFormulirNotaInput, ItemNota } from "../types";

const { color } = tokens;

const MAIN_HEADERS = [
  "No Nota",
  "Tanggal Transaksi",
  "Tanggal Input",
  "Admin",
  "Total Harga",
  "Aksi",
];

const ITEM_HEADERS = [
  "Nama Barang",
  "Satuan",
  "Jumlah Item",
  "Harga",
  "Sub Total Harga",
];

// ─── Types & Defaults ─────────────────────────────────────────────────────────

type FormItemInput = CreateFormulirNotaInput["items"][number];

const EMPTY_ITEM: FormItemInput = {
  nama_barang: "",
  satuan: "",
  jumlah_item: 1,
  harga: 0,
};

// ─── Component ───────────────────────────────────────────────────────────────

interface NotaPageProps {
  onToast: (message: string) => void;
}

export function NotaPage({ onToast }: NotaPageProps) {
  const { currentAdmin } = useAuth();
  const adminId          = currentAdmin?.id_admin ?? 0;

  // ── Data state ─────────────────────────────────────────────────────────────
  const [rows, setRows] = useState<DataNotaView[]>([]);
  const [selected, setSelected] = useState<DataNotaView[]>([]);

  // ── Search & pagination ────────────────────────────────────────────────────
  const [search,      setSearch]      = useState("");
  const [pageSize,    setPageSize]    = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Modals state ───────────────────────────────────────────────────────────
  const [viewTarget,   setViewTarget]   = useState<DataNotaView | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DataNotaView | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  const [formMode,   setFormMode]   = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<DataNotaView | null>(null);
  
  // ── Form state ─────────────────────────────────────────────────────────────
  const [formDate,  setFormDate]  = useState("");
  const [formItems, setFormItems] = useState<FormItemInput[]>([{ ...EMPTY_ITEM }]);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving,    setSaving]    = useState(false);

  // ── Load on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    notaService.getAll().then(setRows);
  }, []);

  // ── Pagination helpers ────────────────────────────────────────────────    function handleSearch(v: string) { setSearch(v); setCurrentPage(1); }
  function handleSearch(v: string) { setSearch(v); setCurrentPage(1); }
  function handlePageSize(v: number) { setPageSize(v); setCurrentPage(1); }

  // ── Derived: search → paginate ────────────────────────────────────────────
  const filtered = rows.filter((n) => {
    const q = search.toLowerCase();
    return (
      n.admin_username.toLowerCase().includes(q) ||
      String(n.id_data_nota).includes(q) ||
      n.items.some((it) => it.nama_barang.toLowerCase().includes(q))
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paged      = filtered.slice(startIndex, startIndex + pageSize);

  function toggleSelect(n: DataNotaView) {
    setSelected((prev) =>
      prev.some((s) => s.id_data_nota === n.id_data_nota)
        ? prev.filter((s) => s.id_data_nota !== n.id_data_nota)
        : [...prev, n]
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
    await printService.printMultipleNota(selected, adminId);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function openCreate() {
    setFormDate("");
    setFormItems([{ ...EMPTY_ITEM }]);
    setFormError(null);
    setEditTarget(null);
    setFormMode("create");
  }

  function openEdit(row: DataNotaView) {
    setFormDate(row.tanggal_transaksi);
    setFormItems(row.items.map(it => ({
      nama_barang: it.nama_barang,
      satuan: it.satuan,
      jumlah_item: it.jumlah_item,
      harga: it.harga,
    })));
    setFormError(null);
    setEditTarget(row);
    setFormMode("edit");
  }

  function closeForm() {
    setFormMode(null);
    setEditTarget(null);
    setFormError(null);
  }

  // ── Form Item Handlers ──
  function addFormItem() {
    setFormItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeFormItem(index: number) {
    if (formItems.length <= 1) return;
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateFormItem(index: number, field: keyof FormItemInput, value: string | number) {
    setFormError(null);
    setFormItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  // ─── Validation ─────────────────────────────────────────────────────────────

  function validateForm(): boolean {
    if (!formDate.trim()) {
      setFormError("Tanggal transaksi wajib diisi.");
      return false;
    }
    for (let i = 0; i < formItems.length; i++) {
      const it = formItems[i];
      if (!it.nama_barang.trim()) {
        setFormError(`Item #${i + 1}: Nama barang wajib diisi.`);
        return false;
      }
      if (!it.satuan.trim()) {
        setFormError(`Item #${i + 1}: Satuan wajib diisi.`);
        return false;
      }
      if (it.jumlah_item <= 0 || isNaN(it.jumlah_item)) {
        setFormError(`Item #${i + 1}: Jumlah item harus lebih dari 0.`);
        return false;
      }
      if (it.harga <= 0 || isNaN(it.harga)) {
        setFormError(`Item #${i + 1}: Harga harus lebih dari 0.`);
        return false;
      }
    }
    setFormError(null);
    return true;
  }

  // ─── CRUD handlers ──────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (saving || !validateForm()) return;
    setSaving(true);
    
    const input: CreateFormulirNotaInput = {
      tanggal_transaksi: formDate,
      items: formItems,
    };

    try {
      if (formMode === "create") {
        await notaService.create(input, adminId);
        onToast("Data nota berhasil ditambahkan.");
      } else if (formMode === "edit" && editTarget) {
        await notaService.update(editTarget.id_data_nota, input, adminId);
        onToast("Data nota berhasil diperbarui.");
      }
      const updated = await notaService.getAll();
      setRows(updated);
      closeForm();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await notaService.delete(deleteTarget.id_data_nota);
      const updated = await notaService.getAll();
      setRows(updated);
      // Clamp page if deletion emptied the current page
      const newFiltered = updated.filter((n) => {
        const q = search.toLowerCase();
        return (
          n.admin_username.toLowerCase().includes(q) ||
          String(n.id_data_nota).includes(q) ||
          n.items.some((it) => it.nama_barang.toLowerCase().includes(q))
        );
      });
      const newTotalPages = Math.max(1, Math.ceil(newFiltered.length / pageSize));
      setCurrentPage((p) => Math.min(p, newTotalPages));
      onToast("Data nota berhasil dihapus.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  async function handlePrintNota() {
    if (!viewTarget) return;
    await printService.printNota([viewTarget], adminId);
  }

  async function handleDownloadPdf() {
    if (!viewTarget) return;
    await pdfService.downloadNotaPdf(viewTarget);
  }

  // ─── Render Helpers ──────────────────────────────────────────────────────────

  const formTotalHarga = formItems.reduce((sum, it) => sum + (it.harga * it.jumlah_item), 0);

  return (
    <div>
      <PageHeader title="Data Nota" subtitle="Kelola data nota pembelian barang" />

      <Card className="p-5">
        <CardToolbar
          left={
            <div className="flex items-center gap-2">
              <PrimaryBtn onClick={openCreate}>
                {Ico.plus()} Buat Nota
              </PrimaryBtn>
              <PrimaryBtn onClick={handlePrint} disabled={selected.length === 0}>
                {Ico.print()} Print Nota{selected.length > 0 ? ` (${selected.length})` : ""}
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
          headers={MAIN_HEADERS}
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
              checked={paged.length > 0 && paged.every((n) => selected.some((s) => s.id_data_nota === n.id_data_nota))}
              onChange={toggleSelectAll}
            />
          }
        >
          {paged.map((n) => (
            <tr
              key={n.id_data_nota}
              className="tr-hover cursor-pointer"
              onClick={() => setViewTarget(n)}
            >
              <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selected.some((s) => s.id_data_nota === n.id_data_nota)}
                  onChange={() => toggleSelect(n)}
                />
              </td>
              <Td>{formatDocumentNumber(n.id_data_nota)}</Td>
              <Td>{n.tanggal_transaksi}</Td>
              <Td>{formatDateInput(n.tanggal_input)}</Td>
              <Td accent>{formatAdminName(n.admin_username)}</Td>
              <Td mono>{formatRp(n.total_harga)}</Td>
              <td className="px-4 py-3.5 text-center whitespace-nowrap">
                <div className="flex items-center gap-1.5 justify-center">
                  <button
                    onClick={() => setViewTarget(n)}
                    title="Lihat Nota"
                    className="inline-flex items-center justify-center p-1.5 rounded-md text-xs font-semibold
                      border transition-colors duration-100"
                    style={{ color: "#374151", borderColor: "#e5e7eb", background: "transparent" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f3f4f6"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    {Ico.receipt()}
                  </button>
                  <button
                    onClick={() => openEdit(n)}
                    title="Edit Nota"
                    className="inline-flex items-center justify-center p-1.5 rounded-md text-xs font-semibold
                      border transition-colors duration-100"
                    style={{ color: color.brand, borderColor: color.brand, background: "transparent" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = color.brandSoft; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    {Ico.edit()}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(n)}
                    title="Hapus Nota"
                    className="inline-flex items-center justify-center p-1.5 rounded-md text-xs font-semibold
                      border border-red-200 text-red-600 bg-transparent transition-colors duration-100
                      hover:bg-red-50"
                  >
                    {Ico.trash()}
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {paged.length === 0 && (
            <tr>
              <td colSpan={MAIN_HEADERS.length + 1} className="px-4 py-10 text-center text-sm text-gray-400">
                {search ? `Tidak ada hasil untuk "${search}".` : "Belum ada data nota."}
              </td>
            </tr>
          )}
        </DataTable>
      </Card>

      {/* ── View Detail Modal (Figma design reproduction) ────────────────── */}
      {viewTarget && (
        <Modal title="Data Nota" onClose={() => setViewTarget(null)} wide>
          <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
             <div className="flex items-center gap-2 md:gap-4">
               <span className="text-xs md:text-sm font-semibold text-gray-700 w-16 md:w-auto">No Nota</span>
               <span className="text-sm md:text-lg font-bold border-b border-gray-900 pb-0.5 min-w-[3rem] text-center">
                 {formatDocumentNumber(viewTarget.id_data_nota)}
               </span>
             </div>
             <div className="flex items-center gap-2 md:gap-4">
               <span className="text-xs md:text-sm font-semibold text-gray-700 w-16 md:w-auto">Tanggal</span>
               <span className="text-xs md:text-sm font-bold border-b border-gray-900 pb-0.5">
                 {viewTarget.tanggal_transaksi}
               </span>
             </div>
          </div>

          <div className="w-full">
            <table className="w-full text-[10px] sm:text-xs md:text-sm">
              <thead>
                <tr className="border-y border-gray-900">
                  <th className="px-1 md:px-4 py-1 md:py-2 text-center font-bold text-gray-900 leading-tight">Jumlah</th>
                  <th className="px-1 md:px-4 py-1 md:py-2 text-center font-bold text-gray-900 leading-tight">Satuan</th>
                  <th className="px-1 md:px-4 py-1 md:py-2 text-center font-bold text-gray-900 leading-tight">Nama Barang</th>
                  <th className="px-1 md:px-4 py-1 md:py-2 text-center font-bold text-gray-900 leading-tight">Harga</th>
                  <th className="px-1 md:px-4 py-1 md:py-2 text-center font-bold text-gray-900 leading-tight">Sub Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {viewTarget.items.map((it) => (
                  <tr key={it.id_item_nota}>
                    <td className="px-1 md:px-4 py-1.5 md:py-2.5 text-center font-semibold">{it.jumlah_item}</td>
                    <td className="px-1 md:px-4 py-1.5 md:py-2.5 text-center font-semibold">{it.satuan}</td>
                    <td className="px-1 md:px-4 py-1.5 md:py-2.5 text-center font-semibold max-w-[80px] md:max-w-none truncate">{it.nama_barang}</td>
                    <td className="px-1 md:px-4 py-1.5 md:py-2.5 text-center font-semibold tabular-nums">{formatRp(it.harga).replace('Rp', '')}</td>
                    <td className="px-1 md:px-4 py-1.5 md:py-2.5 text-center font-semibold tabular-nums">{formatRp(it.sub_total_harga).replace('Rp', '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex justify-end items-center gap-4 border-t border-gray-900 pt-4">
            <span className="text-sm font-bold text-gray-900">Total</span>
            <span className="text-sm font-bold border-b border-gray-900 pb-0.5 whitespace-nowrap">
              {formatRp(viewTarget.total_harga)}
            </span>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <OutlineBtn onClick={() => setViewTarget(null)}>Tutup</OutlineBtn>
            <div className="hidden md:block">
              <OutlineBtn onClick={handleDownloadPdf}>
                {Ico.download()} Download PDF
              </OutlineBtn>
            </div>
            
            {/* Print Button: Active on Desktop, Disabled on Mobile */}
            <div className="hidden md:block">
              <PrimaryBtn onClick={handlePrintNota} className="px-6">
                {Ico.print()} Print Nota
              </PrimaryBtn>
            </div>
            <div className="block md:hidden">
              <PrimaryBtn
                className="px-6 opacity-50 cursor-not-allowed"
                disabled={true}
                title="Gunakan Save PDF di HP"
              >
                {Ico.print()} Print Nota
              </PrimaryBtn>
            </div>
            
            {/* Mobile Only: Save PDF */}
            <div className="block md:hidden">
              <PrimaryBtn
                onClick={handleDownloadPdf}
                className="!bg-blue-600 hover:!bg-blue-700 !border-blue-600"
              >
                {Ico.download()} Save PDF
              </PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Create / Edit form modal ─────────────────────────────────────── */}
      {formMode !== null && (
        <Modal
          title={formMode === "create" ? "Tambah Nota" : "Edit Nota"}
          onClose={closeForm}
          wide
        >
          <div className="mb-6 max-w-sm">
            <FormField
              label="Tanggal Transaksi"
              type="date"
              value={formDate}
              onChange={setFormDate}
            />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Daftar Barang</h3>
            <OutlineBtn onClick={addFormItem} className="text-xs py-1.5 px-3">
              {Ico.plus()} Tambah Baris
            </OutlineBtn>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-x-auto bg-white mb-4">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 text-xs uppercase w-10">#</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 text-xs uppercase">Nama Barang</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 text-xs uppercase w-24">Satuan</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 text-xs uppercase w-24">Jumlah</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-600 text-xs uppercase w-40">Harga (Rp)</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gray-600 text-xs uppercase w-40">Subtotal</th>
                  <th className="px-3 py-2.5 text-center font-semibold text-gray-600 text-xs uppercase w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {formItems.map((it, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-3 py-2 text-gray-400 font-medium text-center">{idx + 1}</td>
                    <td className="px-2 py-2">
                      <input
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:border-red-400 focus:ring-1 focus:ring-red-400 outline-none"
                        value={it.nama_barang}
                        onChange={(e) => updateFormItem(idx, "nama_barang", e.target.value)}
                        placeholder="Contoh: Kertas HVS"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md outline-none"
                        value={it.satuan}
                        onChange={(e) => updateFormItem(idx, "satuan", e.target.value)}
                        placeholder="Rim, Pcs"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md outline-none"
                        value={it.jumlah_item || ""}
                        onChange={(e) => updateFormItem(idx, "jumlah_item", e.target.value === "" ? 0 : Number(e.target.value))}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md outline-none"
                        value={it.harga === 0 ? "" : formatCurrencyInput(String(it.harga))}
                        onChange={(e) => updateFormItem(idx, "harga", parseCurrencyInput(e.target.value))}
                        placeholder="Rp 0"
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-medium tabular-nums text-gray-700">
                      {formatRp(it.harga * it.jumlah_item)}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => removeFormItem(idx)}
                        disabled={formItems.length === 1}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-30"
                        title="Hapus baris"
                      >
                        {Ico.trash()}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Grand Total:</td>
                  <td className="px-3 py-3 text-right text-sm font-bold tabular-nums" style={{ color: color.brand }}>
                    {formatRp(formTotalHarga)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {formError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm font-medium text-red-600 flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
              {formError}
            </div>
          )}

          <div className="flex gap-2 mt-5 justify-end">
            <OutlineBtn onClick={closeForm} className="px-6">Batal</OutlineBtn>
            <PrimaryBtn
              onClick={handleSubmit}
              disabled={saving}
              className="px-8"
            >
              {saving ? "Menyimpan…" : "Simpan Nota"}
            </PrimaryBtn>
          </div>
        </Modal>
      )}

      {/* ── Delete confirmation modal ────────────────────────────────────── */}
      {deleteTarget && (
        <Modal title="Hapus Nota" onClose={() => !deleting && setDeleteTarget(null)}>
          <div className="text-center py-2">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#fef2f2" }}
            >
              <svg viewBox="0 0 24 24" fill="#dc2626" className="w-6 h-6">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>

            <p className="text-sm font-semibold text-gray-900 mb-1">
              Hapus dokumen nota ini?
            </p>
            <p className="text-xs text-gray-400 mb-1">
              No. Nota: {deleteTarget.id_data_nota} — Total: {formatRp(deleteTarget.total_harga)}
            </p>
            <p className="text-xs text-red-500 mb-6 mt-3 font-medium">
              Tindakan ini akan menghapus dokumen nota beserta {deleteTarget.items.length} item di dalamnya secara permanen.
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white
                  transition-colors disabled:opacity-40"
                style={{ background: "#dc2626" }}
                onMouseEnter={(e) => { if (!deleting) e.currentTarget.style.background = "#b91c1c"; }}
                onMouseLeave={(e) => { if (!deleting) e.currentTarget.style.background = "#dc2626"; }}
              >
                {deleting ? "Menghapus…" : "Ya, Hapus"}
              </button>
              <OutlineBtn
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 justify-center"
              >
                Batal
              </OutlineBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
